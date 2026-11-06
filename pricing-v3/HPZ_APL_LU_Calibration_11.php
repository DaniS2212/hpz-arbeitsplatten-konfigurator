<?php
/**
 * Internal Speedmaster L/U PRICE CALIBRATION only (November 2026).
 *
 * Reads the original reference-price CSV from the repo. It never runs in the
 * public WordPress plugin, never issues Woo quotes and never approves a sale.
 * Price V3 remains the one commercial margin calculator.
 *
 * Only one-dimensional, bounded interpolation between TWO confirmed
 * same-variant reference prices is permitted. This is a provisional supplier
 * EK MODEL, not a confirmed supplier offer. No extrapolation, decor transfer,
 * shape transfer, width interpolation or manufacturing assumptions.
 */
declare(strict_types=1);

final class HPZ_APL_LU_Calibration_11
{
    public const VERSION = 'lu-calibration-bounded-length-v1';
    private const REFERENCE_FILE = __DIR__.'/../docs/price-reference-cases.csv';
    private const OBSERVED_FILE = __DIR__.'/../docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv';
    private const AXES = ['L1','L2'];
    private const MAX_BRACKET_MM = 500;

    private static function rows(string $path): array
    {
        $handle = @fopen($path, 'rb');
        if (!$handle) throw new RuntimeException('Speedmaster-Preisreferenz fehlt: '.$path);
        try {
            $fields = fgetcsv($handle);
            if (!is_array($fields) || count($fields) < 2) {
                throw new RuntimeException('Preisreferenz-CSV ist leer.');
            }
            $data = [];
            while (($values = fgetcsv($handle)) !== false) {
                if ($values === [null]) continue;
                if (count($values) !== count($fields)) {
                    throw new RuntimeException('Preisreferenz-CSV hat falsche Spaltenzahl.');
                }
                $row = array_combine($fields, $values);
                if (!is_array($row)) throw new RuntimeException('Preisreferenz-CSV ungültig.');
                $data[] = array_map('trim', $row);
            }
            return $data;
        } finally {
            fclose($handle);
        }
    }

    private static function cents(string $decimal): int
    {
        if (!preg_match('/^([0-9]{1,7})\.([0-9]{2})$/D', $decimal, $m)) {
            throw new RuntimeException('Preisbeleg ist kein EUR-Betrag mit zwei Nachkommastellen.');
        }
        $amount = ((int)$m[1])*100+(int)$m[2];
        if ($amount < 1) throw new RuntimeException('Preisbeleg ist nicht positiv.');
        return $amount;
    }

    private static function matchingNetReferences(array $c, array $rows): array
    {
        if ($c['decor'] !== 'W980') return [];
        $required = array_keys($c['dimensions']);
        $matching = [];
        foreach ($rows as $r) {
            if (($r['geometry'] ?? '') !== $c['geometry']
                || ($r['material'] ?? '') !== $c['material']
                || ($r['edge_mm'] ?? '') !== '1.5'
                || strpos($r['decor'] ?? '', 'W980 ') !== 0
                || ($r['engine_test_status'] ?? '') !== 'local_reference_test_passed_not_sale_approved'
                || !in_array($r['source'] ?? '', [
                    'user_reference','user_confirmed','user_reconfirmed',
                    'user_confirmed_explicit_thick_edge',
                ], true)) continue;
            // The archived case source is the authority for this one exact
            // measurement – not for any other decor, shape or edge condition.
            $dims = [];
            foreach ($required as $k) {
                $v = $r[$k.'_mm'] ?? '';
                if (!preg_match('/^[0-9]{1,6}$/D', $v)) continue 2;
                $dims[$k] = (int)$v;
            }
            $matching[] = [
                'id'=>$r['case_id'],'dimensions'=>$dims,
                'supplierNetCents'=>self::cents($r['supplier_net_eur']),
                'source'=>$r['source'],
            ];
        }
        return $matching;
    }

    private static function sameOtherAxes(array $left, array $right, string $axis): bool
    {
        foreach ($left as $k=>$v) {
            if ($k !== $axis && ($right[$k] ?? null) !== $v) return false;
        }
        return true;
    }

    private static function displayOnly(array $c, array $rows): ?array
    {
        if ($c['decor'] !== 'W980') return null;
        $thickness = $c['material'] === 'APL38' ? '38' : '17.5';
        foreach ($rows as $r) {
            if (($r['variant'] ?? '') !== $c['geometry']
                || ($r['thickness_mm'] ?? '') !== $thickness
                || ($r['decor'] ?? '') !== $c['decor']
                || ($r['edge'] ?? '') !== 'matching_1_5mm'
                || !in_array($r['amount_type'] ?? '', [
                    'supplier_screen_display_only','prior_chat_transcribed_display_only',
                ], true)) continue;
            foreach ($c['dimensions'] as $k=>$v) {
                // L4 B5 is the supplier's BASE dimension (not corner B5).
                $column=$k==='B5'?'B5_base_mm':$k.'_mm';
                if (($r[$column] ?? '') !== (string)$v) continue 2;
            }
            return ['amountCents'=>self::cents($r['amount_eur']),
                'source'=>$r['source'], 'evidenceType'=>$r['amount_type']];
        }
        return null;
    }

    /** Returns internal audit facts only. NEVER feed estimates to a Woo price. */
    public static function review(array $raw): array
    {
        $c = HPZ_APL_LU_Price_Readiness::normalize($raw);
        $base = [
            'calibrationVersion'=>self::VERSION,
            'variant'=>$c['geometry'],
            'material'=>$c['material'],
            'decor'=>$c['decor'],
            'dimensionsMm'=>$c['dimensions'],
            'priceStatus'=>'missing-evidence',
            'netSupplierReferenceCents'=>null,
            'estimatedSupplierNetCents'=>null,
            'supplierDisplayOnlyCents'=>null,
            'referenceCaseIds'=>[],
            'axisInterpolated'=>null,
            'boundedByMm'=>null,
            'grossDEWith10or60EURInboundScenario'=>null,
            'costsBeyondInboundAssumedNetCents'=>0,
            'additionalCostsVerified'=>false,
            'realPackedDimensionsVerified'=>false,
            'supplierNetQuoteVerifiedForExactTarget'=>false,
            'checkoutPriceApproved'=>false,
            'purchasable'=>false,
        ];
        $confirmed = self::matchingNetReferences($c, self::rows(self::REFERENCE_FILE));
        foreach ($confirmed as $row) {
            if ($row['dimensions'] !== $c['dimensions']) continue;
            $base['priceStatus']='exact-historical-net-reference';
            $base['netSupplierReferenceCents']=$row['supplierNetCents'];
            $base['referenceCaseIds']=[$row['id']];
            $base['grossDEWith10or60EURInboundScenario']=self::scenarios($row['supplierNetCents']);
            // Still requires fresh supplier validity, real packing & Woo review.
            return $base;
        }

        // A single length axis can interpolate only when ALL other dimensions
        // match both endpoints exactly. Width interpolation is prohibited even
        // where source values exist: U1 38-mm B1 600->700 falls in price.
        $candidate = null;
        foreach (self::AXES as $axis) {
            $lo = null;
            $hi = null;
            $target = $c['dimensions'][$axis] ?? null;
            if (!is_int($target)) continue;
            foreach ($confirmed as $row) {
                if (!self::sameOtherAxes($c['dimensions'], $row['dimensions'], $axis)) continue;
                $value=$row['dimensions'][$axis];
                if ($value < $target && ($lo === null || $value > $lo['dimensions'][$axis])) $lo=$row;
                if ($value > $target && ($hi === null || $value < $hi['dimensions'][$axis])) $hi=$row;
            }
            if ($lo === null || $hi === null) continue;
            $start=$lo['dimensions'][$axis];
            $end=$hi['dimensions'][$axis];
            $span=$end-$start;
            if ($span < 1 || $span > self::MAX_BRACKET_MM
                || $hi['supplierNetCents'] <= $lo['supplierNetCents']) continue;
            $delta=$hi['supplierNetCents']-$lo['supplierNetCents'];
            $cents=$lo['supplierNetCents']+intdiv($delta*($target-$start)+$span-1,$span);
            $next = [
                'priceStatus'=>'bounded-one-axis-estimate-not-verified',
                'estimatedSupplierNetCents'=>$cents,
                'referenceCaseIds'=>[$lo['id'],$hi['id']],
                'axisInterpolated'=>$axis,
                'boundedByMm'=>[$start,$end],
                'grossDEWith10or60EURInboundScenario'=>self::scenarios($cents),
            ];
            // More than one distinct interpolation would be ambiguous.
            if ($candidate !== null) return $base;
            $candidate=$next;
        }
        if ($candidate !== null) return array_replace($base,$candidate);

        $display = self::displayOnly($c, self::rows(self::OBSERVED_FILE));
        if ($display) {
            $base['priceStatus']='unverified-speedmaster-screen-amount';
            $base['supplierDisplayOnlyCents']=$display['amountCents'];
            $base['referenceCaseIds']=[$display['source']];
        }
        return $base;
    }

    private static function scenarios(int $netCents): array
    {
        // Reuse the SAME PHP V3 margin policy as Straight. The freight tiers
        // and 0 EUR other costs here are hypotheticals, never real deliveries.
        return [
            'inbound10EUR'=>HPZ_APL_Price_V3::targetGrossForVerifiedCosts($netCents,1000,0),
            'inbound60EUR'=>HPZ_APL_Price_V3::targetGrossForVerifiedCosts($netCents,6000,0),
        ];
    }
}
