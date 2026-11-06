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
 * No extrapolation, decor or shape transfer, generalized width interpolation
 * or manufacturing assumptions. H1145 has four exact L1/U1 net anchors only;
 * never infer a universal H1145 price premium. Narrow width brackets for
 * U1 B1, L3 coupled B3/B4 and L4 B5; all edges decor matched 1.5 mm.
 */
declare(strict_types=1);

final class HPZ_APL_LU_Calibration_11
{
    public const VERSION = 'lu-calibration-v6-h1145-exact-decor-20261106';
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
        // Only already observed decor IDs may anchor the offline model.
        // H1145 has four EXACT L1/U1 prices, no transferable decor premium.
        if (!in_array($c['decor'], ['W980','H1145'], true)) return [];
        $thickness = $c['material'] === 'APL38' ? '38' : '17.5';
        $refs = [];
        foreach ($rows as $r) {
            if (($r['variant'] ?? '') !== $c['geometry']
                || ($r['thickness_mm'] ?? '') !== $thickness
                || ($r['decor'] ?? '') !== $c['decor']
                || ($r['edge'] ?? '') !== 'matching_1_5mm'
                || ($r['amount_type'] ?? '') !== 'operator_confirmed_net_EK'
                || ($r['status'] ?? '') !== 'net_basis_owner_confirmed_not_sale_approved'
                || !in_array($r['source'] ?? '', [
                    'docs/references/speedmaster-lu/LU_175_NET_PRICES_20261106.json',
                    'docs/references/speedmaster-lu/LU_175_2000_NET_PRICES_20261106.json',
                    'docs/references/speedmaster-lu/LU_FOUR_WIDTH_NET_PRICES_20261106.json',
                    'docs/references/speedmaster-lu/LU_H1145_FOUR_DECOR_NET_PRICES_20261106.json',
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
                'id'=>'operator-net-20261106-'.$c['geometry'].'-'.$thickness.'-'.implode('-',array_values($dims)).'-'.$c['decor'],
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
     * Controlled WIDTH curves are only permitted at their exact test context:
     * U1 B1 with 600/650/700 mm at both 17.5 and 38 mm; note that
     * 38-mm supplier costs FALL when B1 increases (non-monotone behavior).
     * L3 B3/B4 MUST move as a coupled identical pair. L4 B5 is the
     * independent BASE width, not an edge/chamfer. Never combine an L1/L2
     * length estimate with width changes or transfer between decors.
     *
     * A supplier-net model from independently observed endpoints is still
     * not an exact supplier offer, cut-list or public WooCommerce price.
     */
    private static function widthCandidate(array $c, array $confirmed): ?array
    {
        $shape=$c['geometry'];
        if ($shape === 'U1') {
            $axis='B1';
            $paired=null;
            $fixed=['L1'=>2500,'L2'=>1700,'L3'=>1800,'B2'=>600,'B3'=>600];
        } elseif ($shape === 'L3' && $c['material'] === 'APL17.5') {
            $axis='B3';
            $paired='B4';
            $fixed=['L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600];
        } elseif ($shape === 'L4' && $c['material'] === 'APL17.5') {
            $axis='B5';
            $paired=null;
            $fixed=['L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900];
        } else {
            return null;
        }
        foreach ($fixed as $field=>$mm) {
            if (($c['dimensions'][$field] ?? null) !== $mm) return null;
        }
        $target=$c['dimensions'][$axis] ?? null;
        if (!is_int($target)) return null;
        if ($paired !== null && ($c['dimensions'][$paired] ?? null) !== $target) return null;

        $byPosition=[];
        foreach ($confirmed as $row) {
            $dims=$row['dimensions'];
            $value=$dims[$axis] ?? null;
            if (!is_int($value)) continue;
            if ($paired !== null && ($dims[$paired] ?? null) !== $value) continue;
            foreach ($c['dimensions'] as $field=>$mm) {
                if ($field === $axis || $field === $paired) continue;
                if (($dims[$field] ?? null) !== $mm) continue 2;
            }
            if (isset($byPosition[$value])
                && $byPosition[$value]['supplierNetCents'] !== $row['supplierNetCents']) {
                // Conflicting exact source anchors: never model either one.
                return null;
            }
            $byPosition[$value]=$row;
        }
        $lower=null;
        $upper=null;
        foreach ($byPosition as $mm=>$row) {
            if ($mm < $target && ($lower === null || $mm > $lower['dimensions'][$axis])) {
                $lower=$row;
            } elseif ($mm > $target && ($upper === null || $mm < $upper['dimensions'][$axis])) {
                $upper=$row;
            }
        }
        if ($lower === null || $upper === null) return null;
        $start=$lower['dimensions'][$axis];
        $end=$upper['dimensions'][$axis];
        $span=$end-$start;
        if ($span < 1 || $span > 100) return null;
        $delta=$upper['supplierNetCents']-$lower['supplierNetCents'];
        // CEIL on cents for a conservative internal EK estimate.
        // PHP intdiv() truncates toward zero: for negative differences
        // (e.g. U1 38mm) that already equals mathematical ceil.
        $numerator=$delta*($target-$start);
        $increment=intdiv($numerator,$span);
        if ($numerator > 0 && $numerator % $span !== 0) ++$increment;
        $cents=$lower['supplierNetCents']+$increment;
        if ($cents < 1) return null;

        return [
            'priceStatus'=>$paired === null
                ? 'bounded-one-axis-width-net-estimate-not-verified'
                : 'bounded-coupled-width-net-estimate-not-verified',
            'estimatedSupplierNetCents'=>$cents,
            'referenceCaseIds'=>[$lower['id'],$upper['id']],
            'axisInterpolated'=>$paired === null ? $axis : $axis.'='.$paired,
            'boundedByMm'=>[$start,$end],
            'grossDEWith10or60EURInboundScenario'=>self::scenarios($cents),
        ];
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

        // A single LENGTH axis can interpolate only when ALL other dimensions
        // match both endpoints exactly. Width uses a SEPARATE, heavily
        // constrained source bracket; U1 38mm prices can decrease with width.
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

        $width=self::widthCandidate($c,$confirmed);
        if ($width !== null) {
            // Exactly the same fail-closed, offline-only checkout flags.
            return array_replace($base,$width);
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
