<?php
/**
 * L1–L4 / U1–U4 WooCommerce cart and manual Speedmaster order contract.
 *
 * Reuses existing PHP V3 commercial policy and Woo 0.8 signed-cart pattern.
 * NO WP hooks, public AJAX, product writes, automatic supplier orders or sale
 * activation. The product can only be sold by a separately audited runtime.
 */
declare(strict_types=1);

final class HPZ_APL_WC_LU_Cart_Bridge
{
    public const VERSION = 'lu-cart-order-v1';
    public const ITEM_KEY = 'hpz_apl_lu_v1';
    public const SKUS = [
        1000080 => 'HPZ-APL-L-FORM-2026',
        1000081 => 'HPZ-APL-U-FORM-2026',
    ];
    private const U_SEAMS = [
        'U1' => ['quer','quer'],
        'U2' => ['längs','längs'],
        'U3' => ['längs','quer'],
        'U4' => ['quer','längs'],
    ];

    public static function targets(int $productId): bool
    {
        return isset(self::SKUS[$productId]);
    }

    private static function requireSecret(string $secret): void
    {
        if (strlen($secret) < 32) throw new InvalidArgumentException('Server-Signaturschlüssel fehlt.');
    }

    private static function sign(array $record, string $secret): string
    {
        unset($record['signature']);
        return hash_hmac('sha256', json_encode(
            $record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        ), $secret);
    }

    private static function verified(array $raw, callable $serverProofLookup, ?int $now): array
    {
        $c = HPZ_APL_LU_Price_Readiness::normalize($raw);
        $productId = $c['productId'];
        if (!self::targets($productId) || ($raw['sku'] ?? null) !== self::SKUS[$productId]) {
            throw new InvalidArgumentException('WooCommerce-Produkt oder Artikelnummer passt nicht zur Form.');
        }
        $key = HPZ_APL_LU_Price_Readiness::configurationKey($c);
        $proof = call_user_func($serverProofLookup, $key);
        if (!is_array($proof)) throw new InvalidArgumentException('Speedmaster-Netto-EK und Fertigungsdaten fehlen.');
        // The existing server-side readiness checks exact supplier reference,
        // valid cut list, packaged shipping parts and real cost sources.
        $review = HPZ_APL_LU_Price_Readiness::review($raw, [$key=>$proof], [], $now);
        if (!is_int($review['unitGrossReferenceCents'] ?? null)
            || $review['unitGrossReferenceCents'] < 1
            || !is_int($proof['maxQuantity'] ?? null)
            || $c['quantity'] > $proof['maxQuantity']) {
            throw new InvalidArgumentException('Preis, Lieferbarkeit oder Menge nicht bestätigt.');
        }
        return [$c, $key, $review, $proof];
    }

    /** Server-issued snapshot stored in a Woo cart line; no supplier EK inside. */
    public static function issue(array $raw, callable $serverProofLookup, string $secret, ?int $now=null): array
    {
        self::requireSecret($secret);
        [$c, $key, $quote] = self::verified($raw, $serverProofLookup, $now);
        $c['quantity'] = 1; // Woo's actual line quantity is authoritative.
        $snapshot = [
            'version'=>self::VERSION,
            'config'=>$c,
            'configurationKey'=>$key,
            'priceVersion'=>$quote['ruleVersion'],
            'unitGrossReferenceCents'=>$quote['unitGrossReferenceCents'],
        ];
        $snapshot['signature'] = self::sign($snapshot, $secret);
        return [self::ITEM_KEY=>$snapshot];
    }

    public static function toRaw(array $c): array
    {
        if (($c['schemaVersion'] ?? null) !== 2 || ($c['unit'] ?? null) !== 'mm'
            || !self::targets($c['productId'] ?? 0)
            || !is_array($c['dimensions'] ?? null)) {
            throw new InvalidArgumentException('Gespeicherte L-/U-Arbeitsplatte ungültig.');
        }
        $dims = [];
        foreach ($c['dimensions'] as $k=>$v) {
            if (!is_string($k) || !is_int($v)) throw new InvalidArgumentException('Maße verändert.');
            $dims[$k] = (string)$v;
        }
        $productId = $c['productId'];
        $raw = [
            'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$productId,
            'sku'=>self::SKUS[$productId],
            'product'=>$c['product'],'geometry'=>$c['geometry'],'corner'=>'square',
            'dimensions'=>$dims,'material'=>$c['material'],'decor'=>$c['decor'],
            'edge'=>'matching-1.5','quantity'=>$c['quantity'],
        ];
        if ($c['product']==='l') $raw['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
        return $raw;
    }

    /**
     * Re-check the HMAC and CURRENT trusted supplier proof on cart reload,
     * quantity change, shipping recalculation and checkout. Never trust the
     * old displayed/cached price after an EK changes.
     */
    public static function inspect(array $cartItem, int $quantity, callable $serverProofLookup, string $secret, ?int $now=null): array
    {
        self::requireSecret($secret);
        if ($quantity < 1 || $quantity > 1000) throw new InvalidArgumentException('Ungültige Stückzahl.');
        $snap = $cartItem[self::ITEM_KEY] ?? null;
        if (!is_array($snap) || count($snap) !== 6
            || !is_string($snap['signature'] ?? null) || strlen($snap['signature']) !== 64
            || !hash_equals(self::sign($snap, $secret), $snap['signature'])
            || ($snap['version'] ?? null) !== self::VERSION
            || !is_array($snap['config'] ?? null)
            || ($snap['config']['quantity'] ?? null) !== 1) {
            throw new InvalidArgumentException('L-/U-Konfiguration nicht verifiziert.');
        }
        $c = $snap['config'];
        $c['quantity'] = $quantity;
        $raw = self::toRaw($c);
        [$fresh, $key, $review, $proof] = self::verified($raw, $serverProofLookup, $now);
        if (!is_string($snap['configurationKey'] ?? null)
            || !hash_equals($snap['configurationKey'], $key)
            || ($snap['priceVersion'] ?? null) !== $review['ruleVersion']
            || ($snap['unitGrossReferenceCents'] ?? null) !== $review['unitGrossReferenceCents']) {
            throw new InvalidArgumentException('Preis, Form oder Lieferantenbeleg hat sich geändert.');
        }
        return [
            'key'=>$key,'normalized'=>$fresh,'raw'=>$raw,
            'quote'=>$review,'proof'=>$proof,'production'=>$review['production'],
        ];
    }

    /** Woo's actual totals and tax/ship context are passed in server-side. */
    public static function checkout(
        array $cartItem, int $quantity, callable $serverProofLookup,
        array $trustedWooContext, string $secret, ?int $now=null
    ): array {
        $checked = self::inspect($cartItem, $quantity, $serverProofLookup, $secret, $now);
        $review = HPZ_APL_LU_Price_Readiness::review(
            $checked['raw'], [$checked['key']=>$checked['proof']], $trustedWooContext, $now
        );
        // Never expose the cost-bearing proof to customers or Woo metadata.
        return [
            'validForReleaseReview'=>$review['preflightComplete'],
            'purchasable'=>false,
            'blockers'=>$review['blockers'],
            'configurationKey'=>$checked['key'],
            'priceRule'=>$review['ruleVersion'],
            'unitGrossReferenceCents'=>$review['unitGrossReferenceCents'],
            'totalGrossReferenceCents'=>$review['totalGrossReferenceCents'],
            'production'=>$review['production'],
            'supplierReference'=>$checked['proof']['supplierReference'],
            'supplierPriceBasis'=>$checked['proof']['priceEvidenceType'] ?? 'individual-supplier-reference',
            'verifiedCutParts'=>$checked['proof']['verifiedCutParts'],
            'verifiedPackages'=>$checked['proof']['verifiedPackages'],
        ];
    }

    public static function priceForWoo(int $grossCents, bool $pricesIncludeVat, string $country): string
    {
        // Same actual 19%-DE Woo tax conversion as the existing straight cart.
        return HPZ_APL_WC_Cart_Bridge_08::priceForWoo($grossCents,$pricesIncludeVat,$country);
    }

    public static function displayFields(array $production): array
    {
        $id = $production['productId'] ?? null;
        if (!is_int($id) || !self::targets($id)
            || !is_array($production['dimensionsMm'] ?? null)) {
            throw new InvalidArgumentException('L-/U-Fertigungsdaten fehlen.');
        }
        $shape = $production['form'] ?? '';
        if (!is_string($shape) || !preg_match('/^[LU][1-4]$/D',$shape)
            || $shape[0] !== ($id===1000080?'L':'U')) {
            throw new InvalidArgumentException('Falsche Form.');
        }
        $out = [
            'Arbeitsplattenform'=>$shape,
            'Plattenstärke'=>str_replace('.',',',(string)$production['thicknessMm']).' mm',
            'Dekor'=>$production['decorName'].' ('.$production['supplierDecorCode'].')',
            'Kanten'=>$production['edge'],
            'Eckbearbeitung'=>'Keine',
        ];
        // Preserve all form-specific dimensions. L4's B5 is a BASE dimension
        // (not a corner B5). No fabrication geometry or join counts are guessed.
        foreach (['L1','L2','L3','B1','B2','B3','B4','B5'] as $k) {
            if (isset($production['dimensionsMm'][$k])) {
                $out[$k] = $production['dimensionsMm'][$k].' mm';
            }
        }
        if ($id===1000081) {
            $v=self::U_SEAMS[$shape];
            $out['Stoßvariante (Schema)']='Links '.$v[0].' · Rechts '.$v[1];
        } else {
            $out['Stoßvariante (Schema)']=$shape.' · Speedmaster-Aufteilung';
        }
        return $out;
    }

    /** HPOS-compatible Woo order item meta; writes no supplier net prices. */
    public static function writeOrderLine($item, array $passed): void
    {
        if (($passed['validForReleaseReview'] ?? null)!==true
            || !is_object($item) || !method_exists($item,'add_meta_data')) {
            throw new InvalidArgumentException('Freigabeprüfung für L-/U-Bestellposition fehlt.');
        }
        $production = $passed['production'];
        $item->add_meta_data('_hpz_apl_manufacturing_v2',$production,true);
        $item->add_meta_data('_hpz_apl_config_key',$passed['configurationKey'],true);
        $item->add_meta_data('_hpz_apl_supplier_reference',$passed['supplierReference'],true);
        $item->add_meta_data('_hpz_apl_supplier_price_basis',$passed['supplierPriceBasis'] ?? 'individual-supplier-reference',true);
        $item->add_meta_data('_hpz_apl_supplier_parts',$passed['verifiedCutParts'],true);
        $item->add_meta_data('_hpz_apl_supplier_packages',$passed['verifiedPackages'],true);
        $item->add_meta_data('_hpz_apl_manual_supplier_status','manuell bei Speedmaster bestellen',true);
        foreach (self::displayFields($production) as $name=>$value) {
            $item->add_meta_data($name,$value,true);
        }
    }

    /** Human handoff for Ida/production – NEVER creates a supplier order. */
    public static function manualSpeedmasterText(array $passed): string
    {
        if (($passed['validForReleaseReview'] ?? null)!==true) {
            throw new InvalidArgumentException('Bestelldaten nicht überprüft.');
        }
        $production = $passed['production'];
        $out = [
            'SPEEDMASTER – MANUELLE BESTELLUNG (kein automatischer Auftrag)',
            'Lieferantenreferenz: '.$passed['supplierReference'],
        ];
        if (($passed['supplierPriceBasis'] ?? '') !== 'individual-supplier-reference') {
            $out[]='ACHTUNG: interne Verkaufspreis-Modellrechnung, kein verbindlicher Speedmaster-Netto-EK.';
            $out[]='Vor dem tatsächlichen Speedmaster-Einkauf aktuellen Herstellerpreis gegen die Kalkulation prüfen.';
        }
        foreach (self::displayFields($production) as $name=>$value) $out[]=$name.': '.$value;
        $out[]='Menge: '.$production['quantity'];
        // Supplier-cut and join evidence remains a separate referenced source.
        $out[]='Fertigungszuschnitte und Verbindungen: bei manueller Speedmaster-Bestellung prüfen.';
        return implode("\n",$out);
    }
}
