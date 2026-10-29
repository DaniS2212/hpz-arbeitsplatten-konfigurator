<?php
/**
 * 0.8 WooCommerce cart/order contract for the one-piece straight worktop.
 *
 * Dormant by design: this file registers no hooks, REST routes, AJAX handlers,
 * options or product writes. The 0.6.5 admin-preview plugin NEVER includes it.
 * Actual checkout integration must be explicitly released in 0.9/1.0.
 *
 * No Speedmaster API: all measurements and options remain in Woo order data,
 * for the workshop to order manually in Speedmaster.
 */
declare(strict_types=1);

final class HPZ_APL_WC_Cart_Bridge_08
{
    public const VERSION = 'draft-woocommerce-cart-0.8.0';
    public const ITEM_KEY = 'hpz_apl_v08';
    public const PRODUCT_ID = 1000083;
    public const SKU = 'HPZ-APL-GERADE-2026';

    public static function targets(int $productId): bool
    {
        return $productId === self::PRODUCT_ID;
    }

    /**
     * The payload comes from the existing V2/mm configurator; supplier proof
     * comes ONLY from a privileged server lookup keyed by exact configuration.
     * No browser supplier price, approval, display price or pack weight is read.
     */
    public static function issue(array $raw, callable $trustedProofLookup, string $secret, ?int $now = null): array
    {
        self::requireSecret($secret);
        $normalized = HPZ_APL_Price_Preview::normalize($raw);
        $key = HPZ_APL_Straight_Sale_Readiness::configurationKey($normalized);
        $proof = $trustedProofLookup($key);
        self::requireSupplierProof($raw, $key, $proof, $now);
        $quote = HPZ_APL_Price_V3::quote($normalized);
        // Line-item quantity is a Woo source of truth; never trust the saved
        // snapshot's original quantity after a customer changes the cart.
        $normalized['quantity'] = 1;
        $snapshot = [
            'version' => self::VERSION,
            'config' => $normalized,
            'configurationKey' => $key,
            'priceVersion' => $quote['ruleVersion'],
            'unitGrossReferenceCents' => $quote['unitGrossReferenceCents'],
        ];
        $snapshot['signature'] = self::sign($snapshot, $secret);
        return [self::ITEM_KEY => $snapshot];
    }

    /**
     * Recheck on cart reload, qty change, totals calculation and checkout.
     * The signature covers every configuration field and the quoted unit
     * price; the separate supplier proof is ALWAYS re-fetched from the server.
     */
    public static function inspect(array $cartItem, int $quantity, callable $trustedProofLookup, string $secret, ?int $now = null): array
    {
        self::requireSecret($secret);
        if ($quantity < 1 || $quantity > 1000) {
            throw new InvalidArgumentException('Ungültige Bestellmenge.');
        }
        $snapshot = $cartItem[self::ITEM_KEY] ?? null;
        if (!is_array($snapshot) || count($snapshot) !== 6
            || !is_string($snapshot['signature'] ?? null)
            || strlen($snapshot['signature']) !== 64
            || !hash_equals(self::sign($snapshot, $secret), $snapshot['signature'])) {
            throw new InvalidArgumentException('Die Arbeitsplatten-Konfiguration ist nicht verifiziert.');
        }
        if (($snapshot['version'] ?? null) !== self::VERSION
            || !is_array($snapshot['config'] ?? null)
            || ($snapshot['config']['quantity'] ?? null) !== 1) {
            throw new InvalidArgumentException('Die Arbeitsplatten-Konfiguration ist veraltet.');
        }
        $config = $snapshot['config'];
        $config['quantity'] = $quantity;
        $raw = self::toRaw($config);
        $normalized = HPZ_APL_Price_Preview::normalize($raw);
        $key = HPZ_APL_Straight_Sale_Readiness::configurationKey($normalized);
        $quote = HPZ_APL_Price_V3::quote($normalized);
        if (!hash_equals($key, (string)($snapshot['configurationKey'] ?? ''))
            || ($snapshot['priceVersion'] ?? null) !== $quote['ruleVersion']
            || ($snapshot['unitGrossReferenceCents'] ?? null) !== $quote['unitGrossReferenceCents']) {
            throw new InvalidArgumentException('Preis oder Material wurden verändert.');
        }
        // A signed snapshot does not permanently approve a supplier quote.
        $proof = $trustedProofLookup($key);
        self::requireSupplierProof($raw, $key, $proof, $now);
        return [
            'key' => $key,
            'normalized' => $normalized,
            'raw' => $raw,
            'quote' => $quote,
            'proof' => $proof,
            'production' => HPZ_APL_Straight_Sale_Readiness::productionRecord($normalized),
        ];
    }

    /**
     * The reference price is DE gross incl. 19%. This is merely the interim
     * Woo raw price; the final gate compares Woo's real computed line totals,
     * tax, coupons and shipping to the server-side V3 quote.
     */
    public static function priceForWoo(int $unitGrossReferenceCents, bool $shopPricesIncludeTax, string $country): string
    {
        if ($country !== 'DE' || $unitGrossReferenceCents < 1) {
            throw new InvalidArgumentException('Die Steuerumrechnung ist für dieses Lieferland nicht freigegeben.');
        }
        return $shopPricesIncludeTax
            ? number_format($unitGrossReferenceCents / 100, 2, '.', '')
            : number_format($unitGrossReferenceCents / 119, 6, '.', '');
    }

    /** Only actual, independently approved packed weights and sizes. */
    public static function packageForWoo(array $checked): array
    {
        $proof = $checked['proof'] ?? null;
        if (!is_array($proof) || !is_int($proof['packedWeightGrams'] ?? null)
            || !is_array($proof['packageDimensionsMm'] ?? null)) {
            throw new InvalidArgumentException('Verpackungsdaten nicht bestätigt.');
        }
        $dims = $proof['packageDimensionsMm'];
        return [
            'packedWeightKg' => number_format($proof['packedWeightGrams'] / 1000, 3, '.', ''),
            'lengthMm' => $dims['length'],
            'widthMm' => $dims['width'],
            'heightMm' => $dims['height'],
            'shippingPartsMm' => $proof['shippingPartLengthsMm'],
        ];
    }

    /**
     * The trusted Woo checkout context must come from server-side WC totals,
     * customer address, applied coupons and the selected shipping rate,
     * NEVER from checkout JS or the cart item snapshot.
     *
     * 'allowed' is for the subsequent release gate to consider; this method
     * NEVER edits Woo's existing purchase/checkout blocks or changes the
     * 0.7 review's explicit purchasable=false.
     */
    public static function checkout(
        array $cartItem, int $quantity, callable $trustedProofLookup,
        array $trustedWooContext, string $secret, ?int $now = null
    ): array {
        $item = self::inspect($cartItem, $quantity, $trustedProofLookup, $secret, $now);
        $review = HPZ_APL_Straight_Sale_Readiness::review(
            $item['raw'], [$item['key'] => $item['proof']], $trustedWooContext, $now
        );
        return [
            'validForReleaseReview' => $review['preflightComplete'] === true,
            'purchasable' => false,
            'blockers' => $review['blockers'],
            'configurationKey' => $item['key'],
            'priceRule' => $review['ruleVersion'],
            'unitGrossReferenceCents' => $review['unitGrossReferenceCents'],
            'totalGrossReferenceCents' => $review['totalGrossReferenceCents'],
            'production' => $item['production'],
        ];
    }

    /** Safe, human-readable fields for the WooCommerce cart and order. */
    public static function displayFields(array $production): array
    {
        if (($production['productId'] ?? null) !== self::PRODUCT_ID) {
            throw new InvalidArgumentException('Falsches Produkt.');
        }
        $side = ['none'=>'Keine', 'left'=>'Links', 'right'=>'Rechts', 'both'=>'Beidseitig'];
        $shape = [
            null => 'Keine',
            'round' => 'Abgerundet',
            'chamfer_square' => 'Eckig abgeschrägt',
            'chamfer_continuous' => 'Vorderkante durchlaufend',
        ];
        $sideName = $side[$production['cornerSide']] ?? 'Unbekannt';
        $kindName = $shape[$production['cornerTreatment'] ?? null] ?? 'Unbekannt';
        $fields = [
            'Plattenmaße' => $production['lengthMm'].' × '.$production['depthMm'].' mm',
            'Plattenstärke' => str_replace('.', ',', (string)$production['thicknessMm']).' mm',
            'Dekor' => $production['decorName'],
            'Außenkante' => $production['edge'],
            'Ecken' => $sideName.' · '.$kindName,
        ];
        $values = $production['cornerMeasuresMm'] ?? [];
        foreach (['R1','R2','L2','B2','L3','B3'] as $key) {
            if (array_key_exists($key, $values)) $fields[$key] = $values[$key].' mm';
        }
        return $fields;
    }

    /**
     * HPOS-friendly order LINE metadata. Only call after the full checkout
     * gate passed and Woo's cart item is revalidated. No direct DB writes.
     * The private meta is a complete manual Speedmaster production record.
     */
    public static function writeOrderLine($item, array $passedCheckout): void
    {
        if (($passedCheckout['validForReleaseReview'] ?? null) !== true) {
            throw new InvalidArgumentException('Bestellung nicht freigegeben.');
        }
        if (!is_object($item) || !method_exists($item,'add_meta_data')) {
            throw new InvalidArgumentException('WooCommerce-Position erforderlich.');
        }
        $production = $passedCheckout['production'];
        $item->add_meta_data('_hpz_apl_manufacturing_v2', $production, true);
        $item->add_meta_data('_hpz_apl_config_key', $passedCheckout['configurationKey'], true);
        foreach (self::displayFields($production) as $label => $value) {
            $item->add_meta_data($label, $value, true);
        }
    }

    /** Workshop-readable manual ordering note; NOT sent to Speedmaster. */
    public static function manualSpeedmasterText(array $production): string
    {
        if (($production['productId'] ?? null) !== self::PRODUCT_ID) {
            throw new InvalidArgumentException('Falsches Produkt.');
        }
        $fields = self::displayFields($production);
        $text = [
            'Speedmaster – manuelle Bestellung',
            'Produkt: Küchenarbeitsplatte Gerade',
            'Herstellercode Dekor: '.$production['supplierDecorCode'],
        ];
        foreach ($fields as $name => $value) $text[] = $name.': '.$value;
        $text[] = 'Menge: '.$production['quantity'];
        return implode("\n", $text);
    }

    /** Reconstitute the strict V2/mm raw schema from signed session data. */
    public static function toRaw(array $c): array
    {
        if (($c['schemaVersion'] ?? null) !== 2 || ($c['unit'] ?? null) !== 'mm') {
            throw new InvalidArgumentException('Gespeicherte Maße nicht in Millimetern.');
        }
        if (!is_array($c['dimensions'] ?? null) || !is_array($c['straightCorner']['parameters'] ?? null)) {
            throw new InvalidArgumentException('Gespeicherte Geometrie ungültig.');
        }
        $dims = [];
        foreach ($c['dimensions'] as $k => $v) {
            if (!is_int($v)) throw new InvalidArgumentException('Maße dürfen nicht verändert werden.');
            $dims[$k] = (string)$v;
        }
        $parameters = [];
        foreach ($c['straightCorner']['parameters'] as $k => $v) {
            if (!is_int($v)) throw new InvalidArgumentException('Eckmaße dürfen nicht verändert werden.');
            $parameters[$k] = (string)$v;
        }
        return [
            'schemaVersion'=>2, 'inputUnit'=>'mm',
            'productId'=>self::PRODUCT_ID, 'sku'=>self::SKU,
            'product'=>'straight', 'geometry'=>'straight', 'corner'=>'square',
            'straightCorner'=>[
                'side'=>$c['straightCorner']['side'] ?? null,
                'treatment'=>$c['straightCorner']['treatment'] ?? null,
                'parameters'=>$parameters
            ],
            'dimensions'=>$dims, 'material'=>$c['material'] ?? null,
            'decor'=>$c['decor'] ?? null, 'quantity'=>$c['quantity'] ?? null,
            'edge'=>'matching-1.5',
        ];
    }

    private static function requireSupplierProof(array $raw, string $key, $proof, ?int $now): void
    {
        if (!is_array($proof)) throw new InvalidArgumentException('Lieferbarkeit nicht bestätigt.');
        // The 0.7 gateway checks expiry, EXACT config, supplier cost, packaging
        // and available quantity. Tax/checkout are intentionally checked later.
        $review = HPZ_APL_Straight_Sale_Readiness::review($raw, [$key=>$proof], [], $now);
        foreach (['supplier-proof-missing-or-expired','supplier-quantity-not-confirmed'] as $blocker) {
            if (in_array($blocker,$review['blockers'],true)) {
                throw new InvalidArgumentException('Lieferbarkeit oder Menge nicht bestätigt.');
            }
        }
    }

    private static function requireSecret(string $secret): void
    {
        if (strlen($secret) < 32) throw new InvalidArgumentException('Server-Signaturschlüssel fehlt.');
    }

    private static function sign(array $snapshot, string $secret): string
    {
        unset($snapshot['signature']);
        return hash_hmac('sha256', json_encode($snapshot, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $secret);
    }
}
