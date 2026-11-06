<?php
/**
 * Internal Speedmaster L/U PRICE CALIBRATION only (November 2026).
 *
 * Reads the original reference-price CSV from the repo. It never runs in the
 * public WordPress plugin, never issues Woo quotes and never approves a sale.
 * Price V3 remains the one commercial margin calculator.
 *
 * Bounded length interpolation separates (a) historical supplier NET-EK and
 * NEW exact operator-confirmed NET references from (b) earlier display-only
 * observations. On 06.11 the operator confirmed Speedmaster amounts EXCLUDE
 * VAT; this tax-basis fact is distinct from exact current manufacturing or
 * Woo sale approval. Display-only observations never bypass proof gates.
 * No extrapolation, decor transfer, shape transfer, width interpolation
 * or manufacturing assumptions. Only matching 1.5-mm decor edges are offered.
 */
declare(strict_types=1);

final class HPZ_APL_LU_Calibration_11
{
    public const VERSION = 'lu-calibration-bounded-length-v4-175-two-length-net';
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

    /**
     * New, strictly scoped owner-confirmed net-price records. The supplier's
     * prices EXCLUDE VAT, explicitly verified by the operator 2026-11-06.
     * This confirms only the tax basis and exact photographed/typed price,
     * NOT a current supplier offer, cut list, packing or Woo sale approval.
     */
    private static function matchingOperatorNetReferences(array $c, array $rows): array
    {
        if ($c['decor'] !== 'W980') return [];
        $thickness = $c['material'] === 'APL38' ? '38' : '17.5';
        $refs = [];
        foreach ($rows as $r) {
            if (($r['variant'] ?? '') !== $c['geometry']
                || ($r['thickness_mm'] ?? '') !== $thickness
                || ($r['decor'] ?? '') !== 'W980'
                || ($r['edge'] ?? '') !== 'matching_1_5mm'
                || ($r['amount_type'] ?? '') !== 'operator_confirmed_net_EK'
                || ($r['status'] ?? '') !== 'net_basis_owner_confirmed_not_sale_approved'
                || !in_array($r['source'] ?? '', [
                    'docs/references/speedmaster-lu/LU_175_NET_PRICES_20261106.json',
                    'docs/references/speedmaster-lu/LU_175_2000_NET_PRICES_20261106.json',
                ], true)) continue;
            $dims=[];
            foreach ($c['dimensions'] as $key=>$value) {
                $field = $key === 'B5' ? 'B5_base_mm' : $key.'_mm';
                $n=$r[$field] ?? '';
                if (!is_string($n) || !preg_match('/^[0-9]{1,6}$/D', $n)) continue 2;
                $dims[$key]=(int)$n;
            }
            // Reject rows carrying additional dimension axes not relevant for
            // the current shape; an accidental leftover B5 must not qualify.
            foreach (['L1','L2','L3','B1','B2','B3','B4','B5'] as $field) {
                if (array_key_exists($field, $c['dimensions'])) continue;
                $column=$field === 'B5' ? 'B5_base_mm' : $field.'_mm';
                if (($r[$column] ?? '') !== '') continue 2;
            }
            $refs[]=[
                'id'=>'operator-net-20261106-'.$c['geometry'].'-'.($dims['L1'] ?? 0),
                'dimensions'=>$dims,
                'supplierNetCents'=>self::cents($r['amount_eur']),
                'source'=>$r['source'],
                'operatorConfirmedNetBasis'=>true,
            ];
        }
        return $refs;
    }

    private static function sameOtherAxes(array $left, array $right, string $axis): bool
    {
        foreach ($left as $k=>$v) {
            if ($k !== $axis && ($right[$k] ?? null) !== $v) return false;
        }
        return true;
    }


    /**
     * Supplier DISPLAY observations are NOT verified supplier net prices.
     * Same variant, same decor, thickness, all standard matched edges only.
     * L4's base B5 is a separate physical supplier parameter, not a corner.
     * The complete set also allows us to detect conflicting source values.
     */
    private static function displayReferences(array $c, array $rows): array
    {
        if ($c['decor'] !== 'W980') return [];
        $thickness = $c['material'] === 'APL38' ? '38' : '17.5';
        $refs = [];
        foreach ($rows as $r) {
            if (($r['variant'] ?? '') !== $c['geometry']
                || ($r['thickness_mm'] ?? '') !== $thickness
                || ($r['decor'] ?? '') !== $c['decor']
                || ($r['edge'] ?? '') !== 'matching_1_5mm'
                || !in_array($r['amount_type'] ?? '', [
                    'supplier_screen_display_only',
                    'prior_chat_transcribed_display_only',
                    'user_supplied_text_display_only',
                ], true)) continue;
            $dimensions = [];
            foreach (array_keys($c['dimensions']) as $key) {
                $column = $key === 'B5' ? 'B5_base_mm' : $key.'_mm';
                $value = $r[$column] ?? '';
                if (!is_string($value) || !preg_match('/^[0-9]{1,6}$/D', $value)) continue 2;
                $dimensions[$key] = (int)$value;
            }
            $refs[] = [
                'dimensions'=>$dimensions,
                'amountCents'=>self::cents($r['amount_eur']),
                'source'=>$r['source'],
                'id'=>$c['geometry'].'/'.implode('-', array_values($dimensions))
                    .'/'.($r['source'] ?? 'unknown'),
            ];
        }
        return $refs;
    }

    /**
     * Merge identical observations without silently choosing the first price.
     * A conflicting value at the SAME complete dimensions invalidates this
     * particular display anchor until the supplier discrepancy is resolved.
     */
    private static function mergedDisplayReferences(array $refs): array
    {
        $grouped = [];
        foreach ($refs as $r) {
            $key = json_encode($r['dimensions']);
            if (!isset($grouped[$key])) {
                $grouped[$key] = $r;
                $grouped[$key]['sources'] = [$r['source']];
                $grouped[$key]['ids'] = [$r['id']];
                $grouped[$key]['conflict'] = false;
            } else {
                if ($grouped[$key]['amountCents'] !== $r['amountCents']) {
                    $grouped[$key]['conflict'] = true;
                }
                $grouped[$key]['sources'][] = $r['source'];
                $grouped[$key]['ids'][] = $r['id'];
            }
        }
        foreach ($grouped as &$entry) {
            $entry['sources'] = array_values(array_unique($entry['sources']));
            $entry['ids'] = array_values(array_unique($entry['ids']));
        }
        unset($entry);
        return array_values($grouped);
    }

    private static function displayBracket(array $c, array $observed): ?array
    {
        $candidate = null;
        foreach (self::AXES as $axis) {
            $lo = null;
            $hi = null;
            $target = $c['dimensions'][$axis] ?? null;
            if (!is_int($target)) continue;
            foreach ($observed as $row) {
                if ($row['conflict']
                    || !self::sameOtherAxes($c['dimensions'], $row['dimensions'], $axis)) continue;
                $value = $row['dimensions'][$axis];
                if ($value < $target && ($lo === null || $value > $lo['dimensions'][$axis])) $lo = $row;
                if ($value > $target && ($hi === null || $value < $hi['dimensions'][$axis])) $hi = $row;
            }
            if ($lo === null || $hi === null) continue;
            $from = $lo['dimensions'][$axis];
            $to = $hi['dimensions'][$axis];
            $span = $to - $from;
            if ($span < 1 || $span > self::MAX_BRACKET_MM
                || $hi['amountCents'] <= $lo['amountCents']) continue;
            $delta = $hi['amountCents']-$lo['amountCents'];
            $estimate = $lo['amountCents']
                + intdiv($delta * ($target-$from) + $span-1, $span);
            $next = [
                'priceStatus'=>'bounded-one-axis-display-estimate-not-net-verified',
                'estimatedSupplierDisplayCents'=>$estimate,
                'displayAxisInterpolated'=>$axis,
                'displayBoundedByMm'=>[$from,$to],
                'displayReferenceSources'=>array_values(array_unique(array_merge(
                    $lo['sources'], $hi['sources']
                ))),
                'displayReferenceIds'=>array_values(array_unique(array_merge(
                    $lo['ids'], $hi['ids']
                ))),
            ];
            // Two simultaneously possible axes cannot be resolved from this
            // sparse source grid. Never pretend that diagonal interpolation
            // has been established by a one-axis demonstration.
            if ($candidate !== null) return null;
            $candidate = $next;
        }
        return $candidate;
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
            'supplierPriceTaxBasis'=>'net-eur-operator-confirmed-2026-11-06',
            'germanGrossReferenceTaxRate'=>'0.19',
            'netSupplierReferenceCents'=>null,
            'estimatedSupplierNetCents'=>null,
            'supplierDisplayOnlyCents'=>null,
            'displayEvidenceSource'=>null,
            'displayEvidenceSources'=>[],
            'estimatedSupplierDisplayCents'=>null,
            'displayAxisInterpolated'=>null,
            'displayBoundedByMm'=>null,
            'displayReferenceSources'=>[],
            'displayReferenceIds'=>[],
            'modelVsSupplierDisplayDifferenceCents'=>null,
            'modelVsSupplierDisplayStatus'=>null,
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
        // Keep a new screenshot as independent display evidence. In particular
        // it must NOT become a verified net EK or change the interpolation
        // endpoints merely because it matches a model by coincidence.
        $observed = self::mergedDisplayReferences(self::displayReferences(
            $c, self::rows(self::OBSERVED_FILE)
        ));
        $display = null;
        foreach ($observed as $row) {
            if ($row['dimensions'] !== $c['dimensions']) continue;
            if ($row['conflict']) {
                $base['priceStatus'] = 'conflicting-supplier-display-observations';
                $base['displayEvidenceSources'] = $row['sources'];
                $base['referenceCaseIds'] = $row['ids'];
                return $base; // No source price or purchase approval.
            }
            $display = $row;
            $base['supplierDisplayOnlyCents'] = $row['amountCents'];
            $base['displayEvidenceSource'] = $row['source'];
            $base['displayEvidenceSources'] = $row['sources'];
            break;
        }
        $confirmed = array_merge(
            self::matchingNetReferences($c, self::rows(self::REFERENCE_FILE)),
            self::matchingOperatorNetReferences($c, self::rows(self::OBSERVED_FILE))
        );
        $exact = array_values(array_filter($confirmed, static function (array $row) use ($c): bool {
            return $row['dimensions'] === $c['dimensions'];
        }));
        if ($exact) {
            // Never silently choose a contradictory net quote for the same
            // dimensions. No shop price is generated on source conflict.
            $prices = array_values(array_unique(array_column($exact, 'supplierNetCents')));
            if (count($prices) !== 1) {
                $base['priceStatus']='conflicting-operator-net-reference';
                $base['referenceCaseIds']=array_values(array_unique(array_column($exact, 'id')));
                return $base;
            }
            $first=$exact[0];
            $base['priceStatus']=!empty($first['operatorConfirmedNetBasis'])
                ? 'exact-operator-confirmed-net-reference'
                : 'exact-historical-net-reference';
            $base['netSupplierReferenceCents']=$first['supplierNetCents'];
            $base['referenceCaseIds']=array_values(array_unique(array_column($exact, 'id')));
            $base['grossDEWith10or60EURInboundScenario']=self::scenarios($first['supplierNetCents']);
            // Still requires current supplier validity, real packing & Woo review.
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
        if ($candidate !== null) {
            $result = array_replace($base,$candidate);
            if ($display) {
                $difference = $candidate['estimatedSupplierNetCents']-$display['amountCents'];
                $result['modelVsSupplierDisplayDifferenceCents']=$difference;
                $result['modelVsSupplierDisplayStatus']=$difference===0
                    ? 'display-matches-estimate-net-unverified'
                    : 'display-differs-from-estimate-net-unverified';
            }
            return $result;
        }

        if ($display) {
            $base['priceStatus']='unverified-speedmaster-screen-amount';
            $base['referenceCaseIds']=$display['ids'];
            return $base;
        }
        // Independent model of display values, NOT a model of verified EKs.
        // This must never populate gross scenario, supplier net price,
        // checkoutPriceApproved or purchasable.
        $displayCandidate = self::displayBracket($c, $observed);
        if ($displayCandidate !== null) {
            return array_replace($base, $displayCandidate);
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
