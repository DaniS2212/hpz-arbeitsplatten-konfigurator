<?php
/**
 * Isolated V3 pricing domain engine for straight HPZ worktops.
 * No WordPress hooks, endpoints, checkout activation or product writes.
 * PHP 7.4+. All offered prices are German 19%-VAT reference GROSS cents.
 * WooCommerce must own actual tax, coupons, shipping, availability and sale gates.
 */
declare(strict_types=1);

final class HPZ_APL_Price_V3
{
    public const VERSION = 'v3.0.0-approved-formula';
    public const CORNER_GROSS_CENTS = 12000;
    public const MIN_MARGIN = 0.35;
    public const TARGET_MARGIN = 0.40;

    // Historic net EK in cents, 2000x600, all edges matching 1.5mm.
    // Only used to derive DECOR SURCHARGES. Never returned to the browser.
    private const EK_REFERENCE_CENTS = [
        'W980' => [14499, 24311],
        'U999' => [14843, 25005],
        'H1145' => [14843, 25005],
        'H3303' => [14570, 24454],
        'F021' => [14843, 25005],
        'F095' => [15003, 25324],
        'F121' => [14843, 25005],
        'F128' => [24238, 29255],
        'F186' => [14843, 25005],
        'F235' => [14570, 24454],
        'F302' => [14843, 25005],
        'F629' => [14683, 24689],
        'F661' => [14843, 25005],
        'F812' => [14843, 25005],
        '44375' => [18392, 24454],
        '44405' => [18392, 24454],
    ];

    /**
     * Accepts a *normalized* V2 millimetre record (integer dimensions).
     * Returns calculation data only. Does NOT grant manufacturability or sale.
     * Client-supplied price, EK, supplier approval and flags are ignored.
     */
    public static function quote(array $c): array
    {
        self::validate($c);
        $length = $c['dimensions']['L1'];
        $depth = $c['dimensions']['B1'];
        $thick = $c['material'] === 'APL38';
        $index = $thick ? 1 : 0;
        $area = $length * $depth / 1000000.0;

        if ($thick) {
            $base = 670.0 + 0.206 * ($length - 2000)
                + 15.0 * $length * ($depth - 600) / 1000000.0
                + ($length >= 2781 ? 50.0 : 0.0)
                + ($depth >= 881 ? 0.28 * $length : 0.0);
        } else {
            $base = 450.0 + 0.035 * ($length - 2000)
                + 229.0 * ($area - 1.2)
                + ($length >= 2501 ? 40.0 : 0.0);
        }

        $decor = $c['decor'];
        $delta = (self::EK_REFERENCE_CENTS[$decor][$index] - self::EK_REFERENCE_CENTS['W980'][$index]) / 100.0;
        $areaScaled = !$thick && in_array($decor, ['F128', '44375', '44405'], true);
        $surcharge = 2.20 * $delta * ($areaScaled ? $area / 1.2 : $length / 2000.0);
        // Up to the next EUR 10; tiny tolerance only avoids binary-float false bumps.
        $baseGrossCents = (int) (1000 * ceil(($base + $surcharge - 0.000000001) / 10.0));
        $cornerGrossCents = $c['straightCorner']['side'] === 'none' ? 0 : self::CORNER_GROSS_CENTS;
        $unitGrossCents = $baseGrossCents + $cornerGrossCents;
        $quantity = $c['quantity'];
        // German gross reference only. Tax is NOT hardcoded into a Woo line price.
        return [
            'ruleVersion' => self::VERSION,
            'status' => 'calculated-not-sale-approved',
            'currency' => 'EUR',
            'referenceTaxRate' => '0.19',
            'unitGrossReferenceCents' => $unitGrossCents,
            'totalGrossReferenceCents' => $unitGrossCents * $quantity,
            'unitCornerSurchargeCents' => $cornerGrossCents,
            'quantity' => $quantity,
            'purchasable' => false,
            'blockers' => ['woocommerce-checkout-not-activated'],
        ];
    }

    private static function validate(array $c): void
    {
        if (($c['schemaVersion'] ?? null) !== 2 || ($c['unit'] ?? null) !== 'mm'
            || ($c['product'] ?? null) !== 'straight' || ($c['geometry'] ?? null) !== 'straight') {
            throw new InvalidArgumentException('Only normalized mm/V2 straight configurations are priced.');
        }
        if (($c['edge'] ?? null) !== 'matching-1.5') {
            throw new InvalidArgumentException('Only matching 1.5mm edge finish is priced.');
        }
        $thick = $c['material'] ?? null;
        if ($thick !== 'APL17.5' && $thick !== 'APL38') {
            throw new InvalidArgumentException('Unsupported material.');
        }
        if (!is_string($c['decor'] ?? null) || !array_key_exists($c['decor'], self::EK_REFERENCE_CENTS)) {
            throw new InvalidArgumentException('Unsupported decor code.');
        }
        $dim = $c['dimensions'] ?? null;
        if (!is_array($dim) || count($dim) !== 2 || !array_key_exists('L1', $dim) || !array_key_exists('B1', $dim)
            || !is_int($dim['L1']) || !is_int($dim['B1'])) {
            throw new InvalidArgumentException('Dimensions must be integer millimetres L1 and B1.');
        }
        $l = $dim['L1']; $b = $dim['B1'];
        // Shop caps below the visible supplier maximum. Outside the historic
        // 2000–3000 mm V3 sample, pricing is extrapolated and requires a
        // Speedmaster spot-check before the public product goes live.
        $through = ($c['straightCorner']['treatment'] ?? null) === 'chamfer_continuous';
        $maxDepth = ($through || $thick === 'APL38') ? 900 : 1200;
        if ($l < 1000 || $l > 4000 || $b < 300 || $b > $maxDepth) {
            throw new InvalidArgumentException('Dimensions outside price V3 reference envelope.');
        }
        if (!is_int($c['quantity'] ?? null) || $c['quantity'] < 1 || $c['quantity'] > 1000) {
            throw new InvalidArgumentException('Quantity must be an integer from 1 to 1000.');
        }
        self::validateCorner($c['straightCorner'] ?? null, $l, $b, $c['corner'] ?? null);
    }

    private static function validateCorner($v, int $l, int $b, $legacyCorner): void
    {
        if (!is_array($v) || !array_key_exists('side', $v)
            || !array_key_exists('treatment', $v) || !is_array($v['parameters'] ?? null)) {
            throw new InvalidArgumentException('A valid V2 straightCorner record is required.');
        }
        $side = $v['side']; $treatment = $v['treatment']; $p = $v['parameters'];
        if (!in_array($side, ['none', 'left', 'right', 'both'], true)) {
            throw new InvalidArgumentException('Unknown corner side.');
        }
        if ($side === 'none') {
            if ($treatment !== null || count($p) !== 0 || $legacyCorner !== 'square') {
                throw new InvalidArgumentException('No-treatment corner must have no parameters.');
            }
            return;
        }
        $expectedCorner = ['round' => 'round', 'chamfer_square' => 'chamfer', 'chamfer_continuous' => 'continuous'];
        if (!is_string($treatment) || !array_key_exists($treatment, $expectedCorner)
            || $legacyCorner !== $expectedCorner[$treatment]) {
            throw new InvalidArgumentException('Corner treatment and normalized corner type do not match.');
        }
        $round = $treatment === 'round';
        $keys = $round ? ($side === 'left' ? ['R1'] : ($side === 'right' ? ['R2'] : ['R1','R2']))
            : ($side === 'left' ? ['L2','B2'] : ($side === 'right' ? ['L3','B3'] : ['L2','B2','L3','B3']));
        if (count($p) !== count($keys) || array_diff($keys, array_keys($p))) {
            throw new InvalidArgumentException('Corner parameters do not match chosen treatment.');
        }
        foreach ($keys as $key) {
            if (!is_int($p[$key]) || $p[$key] <= 0 || ($p[$key] % 10) !== 0) {
                throw new InvalidArgumentException('Corner dimensions must be positive 10-mm integers.');
            }
        }
        if ($round) {
            $r1 = $p['R1'] ?? 0; $r2 = $p['R2'] ?? 0;
            $min = $side === 'left' && $l === 2000 && $b === 600 ? 50 : 10;
            if (($r1 && $r1 < $min) || $r1 >= $b || $r2 >= $b || $r1 + $r2 > $l - 100) {
                throw new InvalidArgumentException('Round corner dimensions outside preview limits.');
            }
            return;
        }
        $l2 = $p['L2'] ?? 0; $l3 = $p['L3'] ?? 0;
        if ($l2 + $l3 > $l - 100) {
            throw new InvalidArgumentException('Chamfers must leave 100mm of straight front.');
        }
        foreach ([['L2','B2'], ['L3','B3']] as $pair) {
            if (!isset($p[$pair[0]])) { continue; }
            $cutLength = $p[$pair[0]]; $cutDepth = $p[$pair[1]];
            $limitLength = $treatment === 'chamfer_continuous'
                ? 1800 : min(1800, (int)(floor(1.40 * $cutDepth / 10) * 10));
            $limitDepth = min(500, $b - 100);
            if ($cutLength < 60 || $cutDepth < 60 || $cutDepth > $limitDepth || $cutLength > $limitLength) {
                throw new InvalidArgumentException('Chamfer dimensions outside conservative Speedmaster shop limits.');
            }
        }
    }

    /**
     * One internal procurement per configured worktop unit, based on verified
     * shipping parts (NOT the client-defined outside dimensions).
     * 10 EUR regular procurement plus 50 EUR if any part is >=1900 mm.
     */
    public static function inboundCostForVerifiedParts(array $partLengthsMm): int
    {
        if (count($partLengthsMm) === 0) {
            throw new InvalidArgumentException('Verified shipping parts are required.');
        }
        $hasLongPart = false;
        foreach ($partLengthsMm as $part) {
            if (!is_int($part) || $part < 1 || $part > 100000) {
                throw new InvalidArgumentException('Invalid verified shipping-part length.');
            }
            if ($part >= 1900) { $hasLongPart = true; }
        }
        return 1000 + ($hasLongPart ? 5000 : 0);
    }

    /**
     * Shared commercial price POLICY for a supplier-priced worktop.
     *
     * Straight continues to use its existing V3 dimension/decor price curve.
     * L/U may call this ONLY after their exact supplier and shipping evidence
     * is verified on the server. Same company rules as Straight: 10% cost
     * reserve, 40% target margin and German 19%-VAT reference gross.
     * Discounts are guarded separately by checkNetMargin() below.
     *
     * All inputs in net EUR cents per configured unit; returns gross DE
     * reference cents rounded UP to EUR 10. No Woo tax/sale approval implied.
     */
    public static function targetGrossForVerifiedCosts(int $supplierNetCents, int $inboundNetCents, int $otherNetCents): int
    {
        if ($supplierNetCents < 1 || $supplierNetCents > 10000000
            || $inboundNetCents < 0 || $inboundNetCents > 10000000
            || $otherNetCents < 0 || $otherNetCents > 10000000) {
            throw new InvalidArgumentException('Verifizierte Stückkosten in EUR-Cent erforderlich.');
        }
        $totalNetCosts = $supplierNetCents + $inboundNetCents + $otherNetCents;
        // Exact integer ceil: cost * (1+10%) * (1+19% VAT) / (1-40% margin)
        // = cost*1309/600; rounding UP to the next 1000 cents.
        return intdiv($totalNetCosts * 1309 + 600000 - 1, 600000) * 1000;
    }

    /**
     * Preferred sale-margin guard. Exact supplier EK, verified shipping-part
     * lengths, and post-discount NET revenue must ALL come from the server.
     * Work per configured unit or use consistent totals for every input.
     */
    public static function checkNetMarginForParts(int $supplierNetCents, array $verifiedPartLengthsMm, int $actualNetRevenueCents): array
    {
        return self::checkNetMargin($supplierNetCents, self::inboundCostForVerifiedParts($verifiedPartLengthsMm), $actualNetRevenueCents);
    }

    /**
     * Low-level margin gate, SERVER-TRUSTED values only. All EUR cents.
     * Never accept EK, inbound, or net revenue fields from browser requests.
     */
    public static function checkNetMargin(int $supplierNetCents, int $inboundNetCents, int $actualNetRevenueCents): array
    {
        if ($supplierNetCents <= 0 || $inboundNetCents < 0 || $actualNetRevenueCents <= 0) {
            throw new InvalidArgumentException('Verified supplier costs and positive net revenue are required.');
        }
        $bufferedCostTenThousandths = 11 * ($supplierNetCents + $inboundNetCents);
        // 11/10 is reserve and revenue is in cents: margin=1-cost*1.10/revenue.
        $marginPct = round(100.0 * (1.0 - $bufferedCostTenThousandths / (10.0 * $actualNetRevenueCents)), 4);
        // Strict integer comparison; do not round the margin to decide.
        $passes35 = $bufferedCostTenThousandths * 20 <= 13 * 10 * $actualNetRevenueCents;
        $meets40 = $bufferedCostTenThousandths * 5 <= 3 * 10 * $actualNetRevenueCents;
        return [
            'marginPct' => $marginPct,
            'passesMinimum35' => $passes35,
            'meetsTarget40' => $meets40,
            'reason' => $passes35 ? null : 'margin-below-35-after-reserve-and-discounts',
        ];
    }
}