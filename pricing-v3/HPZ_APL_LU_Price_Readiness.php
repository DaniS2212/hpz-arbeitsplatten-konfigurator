<?php
/**
 * L1–L4 / U1–U4 server-side preflight: exact manufacturer proof -> cost/margin
 * review only. No WP hooks, public API, purchasability or automatic supplier
 * order. Historic 30%-markup rules are NOT silently adopted as shop policy.
 * All evidence and Woo context MUST come from independent trusted server data.
 */
declare(strict_types=1);

final class HPZ_APL_LU_Price_Readiness
{
    public const VERSION = 'lu-manual-evidence-preflight-v1';
    public const MAX_EVIDENCE_AGE_DAYS = 30;
    private const L_IDS = ['L1','L2','L3','L4'];
    private const U_IDS = ['U1','U2','U3','U4'];
    private const PRICE_POLICY = 'margin40-reserve10-floor35';

    private static function mm($v, string $field): int
    {
        if (!is_string($v) || !preg_match('/^[0-9]{1,6}$/D', trim($v))) {
            throw new InvalidArgumentException('Unzulässiges Maß '.$field.'.');
        }
        $n = (int) trim($v);
        if ($n < 1 || $n > 100000) {
            throw new InvalidArgumentException('Maß außerhalb des Prüfbereichs: '.$field.'.');
        }
        return $n;
    }

    private static function exactKeys(array $object, array $expected): bool
    {
        $found = array_keys($object);
        sort($found);
        sort($expected);
        return $found === $expected;
    }

    /**
     * Shape-bound L corner measurements, independently checked on the PHP
     * pricing path. The top-level contour still uses corner=square: the
     * additional operation lives exclusively inside lCorner.
     *
     * One field name may also be a base L4 dimension (B5): keep the two
     * namespaces separate in fingerprints and manufacturing records.
     */
    private static function lCorner(array $raw, string $shape, array $d): array
    {
        $none=['side'=>'none','treatment'=>null,'parameters'=>[]];
        $v=$raw['lCorner'] ?? $none;
        if (!is_array($v)||!self::exactKeys($v,['side','treatment','parameters'])
            ||!is_array($v['parameters'])) {
            throw new InvalidArgumentException('Ungültige L-Eckfelder.');
        }
        $side=$v['side'];
        $treatment=$v['treatment'];
        if ($side==='none') {
            if ($treatment!==null || count($v['parameters'])!==0)
                throw new InvalidArgumentException('Bearbeitung ohne Eckauswahl.');
            return $none;
        }
        if (!in_array($side,['left','right','both'],true)
            ||!in_array($treatment,['round','chamfer_square','chamfer_continuous'],true))
            throw new InvalidArgumentException('Unbekannte L-Eckausführung.');
        $first=in_array($shape,['L1','L2'],true);
        $left=$treatment==='round'?['R1']:($first?['L3','B3']:['L5','B5']);
        $right=$treatment==='round'?['R2']:($first?['L4','B4']:['L6','B6']);
        $wanted=array_merge($side==='right'?[]:$left,$side==='left'?[]:$right);
        if (!self::exactKeys($v['parameters'],$wanted))
            throw new InvalidArgumentException('Eckmaße unvollständig oder fremd.');
        $limits=match ($shape) {
            'L1'=>['left'=>[$d['L2']-$d['B2'],$d['B1']],
                   'right'=>[$d['L1']-$d['B1'],$d['B2']]],
            'L2'=>['left'=>[$d['L1']-$d['B1'],$d['B2']],
                   'right'=>[$d['L2']-$d['B2'],$d['B1']]],
            'L3','L4'=>['left'=>[$d['L2']-$d['B4'],$d['B1']],
                         'right'=>[$d['L1']-$d['B3'],$d['B2']]],
            default=>throw new InvalidArgumentException('Eckvariante unbekannt.'),
        };
        $parameters=[];
        foreach ($wanted as $key) {
            $mm=self::mm($v['parameters'][$key], 'Ecke '.$key);
            $rounded=$treatment==='round';
            if ($mm%10!==0||$mm<($rounded?10:60)||$mm>($rounded?1000:2000)) {
                throw new InvalidArgumentException('Eckmaß außerhalb der erlaubten Abstufung.');
            }
            $pair=str_starts_with($key,'R')
                ? $limits[$key==='R1'?'left':'right']
                : $limits[in_array($key,$left,true)?'left':'right'];
            if (!$rounded) {
                $vertical=in_array($key,['L3','L4','L5','L6'],true);
                // L3/L5 may represent a different physical segment from L4/L6.
                // The PHP formula mirrors the two axes of local l-geometry.
                $available=$pair[$vertical?0:1];
            } else {
                $available=min($pair);
            }
            $previewMax=max(0,min($rounded?1000:2000,
                ((int)ceil(($available-10)/10)-1)*10));
            if ($mm>$previewMax)
                throw new InvalidArgumentException('Eckmaß passt nicht zu den Schenkeln.');
            $parameters[$key]=$mm;
        }
        return ['side'=>$side,'treatment'=>$treatment,'parameters'=>$parameters];
    }

    /** Validate the limited SQUARE L/U launch candidate independently of JS. */
    public static function normalize(array $raw): array
    {
        $product = $raw['product'] ?? null;
        $shape = $raw['geometry'] ?? null;
        $isL = $product === 'l';
        $shapes = $isL ? self::L_IDS : self::U_IDS;
        $expectedId = $isL ? 1000080 : 1000081;
        if (!in_array($product, ['l','u'], true)
            || !in_array($shape, $shapes, true)
            || ($raw['schemaVersion'] ?? null) !== 2
            || ($raw['inputUnit'] ?? null) !== 'mm'
            || ($raw['productId'] ?? null) !== $expectedId
            || ($raw['corner'] ?? null) !== 'square'
            || !in_array($raw['material'] ?? null, ['APL17.5','APL38'], true)
            || ($raw['edge'] ?? 'matching-1.5') !== 'matching-1.5'
            || !empty($raw['special'] ?? null) || isset($raw['straightCorner'])) {
            throw new InvalidArgumentException('Nur die unbearbeitete L-/U-Grundform ist für die Preisprüfung vorgesehen.');
        }
        $decor = HPZ_APL_Decor_Catalog::resolve($raw['decor'] ?? null);
        if (!$decor) {
            throw new InvalidArgumentException('Dekor nicht vorgesehen.');
        }
        $keys = $product === 'u'
            ? ['L1','L2','L3','B1','B2','B3']
            : (in_array($shape, ['L1','L2'], true) ? ['L1','L2','B1','B2']
                : ($shape === 'L3' ? ['L1','L2','B1','B2','B3','B4']
                    : ['L1','L2','B1','B2','B3','B4','B5']));
        if (!is_array($raw['dimensions'] ?? null)
            || !self::exactKeys($raw['dimensions'], $keys)) {
            throw new InvalidArgumentException('Falsche Maßfelder für '.$shape.'.');
        }
        $dimensions = [];
        foreach ($keys as $key) {
            $dimensions[$key] = self::mm($raw['dimensions'][$key], $key);
        }
        if ($isL) {
            if ($dimensions['L1'] <= $dimensions['B1']
                || $dimensions['L2'] <= $dimensions['B2']) {
                throw new InvalidArgumentException('Die L-Innenöffnung muss positiv sein.');
            }
            if (in_array($shape, ['L3','L4'], true)) {
                if ($dimensions['B1'] !== $dimensions['B2']
                    || $dimensions['B3'] !== $dimensions['B4']
                    || $dimensions['B3'] <= $dimensions['B1']
                    || $dimensions['L1'] <= $dimensions['B3']
                    || $dimensions['L2'] <= $dimensions['B4']) {
                    throw new InvalidArgumentException('L3/L4: Maßkopplung und innere Fläche prüfen.');
                }
            }
        } elseif (isset($raw['lCorner']) || $dimensions['L2'] <= $dimensions['B1']
            || $dimensions['L3'] <= $dimensions['B1']
            || $dimensions['B2'] + $dimensions['B3'] >= $dimensions['L1']) {
            throw new InvalidArgumentException('U-Maßkopplung und Innenöffnung prüfen.');
        }
        $lc=$isL?self::lCorner($raw,$shape,$dimensions):null;
        $quantity = $raw['quantity'] ?? null;
        if (!is_int($quantity) || $quantity < 1 || $quantity > 1000) {
            throw new InvalidArgumentException('Ungültige Stückzahl.');
        }
        $normalized=[
            'schemaVersion'=>2,'unit'=>'mm','product'=>$product,'productId'=>$expectedId,
            'geometry'=>$shape,'corner'=>'square','dimensions'=>$dimensions,
            'material'=>$raw['material'],'decor'=>$decor['id'],
            'supplierDecorCode'=>$decor['supplierCode'],
            'decorName'=>$decor['displayName'],'edge'=>'matching-1.5','quantity'=>$quantity,
        ];
        // Preserve the *existing* fingerprint for all unmachined L/U plates.
        if ($isL && $lc['side']!=='none') $normalized['lCorner']=$lc;
        return $normalized;
    }

    /** Quantity-independent exact configuration fingerprint (not a signed token). */
    public static function configurationKey(array $c): string
    {
        if (($c['schemaVersion'] ?? null) !== 2 || ($c['unit'] ?? null) !== 'mm'
            || !in_array($c['product'] ?? null, ['l','u'], true)) {
            throw new InvalidArgumentException('Only normalized L/U V2 configurations.');
        }
        $identity=[
            self::VERSION,$c['productId'],$c['product'],$c['geometry'],
            $c['dimensions'],$c['material'],$c['decor'],$c['edge'],$c['corner'],
        ];
        if (isset($c['lCorner'])) $identity[]=$c['lCorner'];
        return hash('sha256',json_encode($identity,JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    /** Only an actual supplier/packaging record may enable a pricing review. */
    private static function verifiedEvidence(array $r, string $key, int $now): bool
    {
        if (($r['pricingBasis'] ?? null) === 'operator-priced-lu-ratebook-v1') {
            // Explicitly approved, narrowly bounded owner pricing. Physical
            // Speedmaster cut lists/packages are NOT asserted or required.
            // Only internally managed records with an exact configuration key
            // can enter this branch; customer JSON is never used as proof.
            if (($r['configurationKey'] ?? null) !== $key
                || ($r['supplier'] ?? null) !== 'speedmaster'
                || ($r['operatorPriceApproved'] ?? null) !== true
                || ($r['priceModelVersion'] ?? null) !== HPZ_APL_LU_Shop_Ratebook_12::VERSION
                || !is_int($r['supplierNetCents'] ?? null) || $r['supplierNetCents'] < 1
                || !is_int($r['maxQuantity'] ?? null) || $r['maxQuantity'] < 1
                || !is_string($r['checkedOn'] ?? null)
                || !preg_match('/^\\d{4}-\\d{2}-\\d{2}$/D',$r['checkedOn'])) return false;
            $date=DateTimeImmutable::createFromFormat('!Y-m-d',$r['checkedOn'],new DateTimeZone('UTC'));
            if (!$date || $date->format('Y-m-d') !== $r['checkedOn']
                || $date->getTimestamp() > $now) return false;
            foreach (['packagingNetCents','outboundNetCostCents','paymentAndHandlingNetCents'] as $k) {
                if (!is_int($r[$k] ?? null) || $r[$k]<0) return false;
            }
            $rates=$r['approvedShippingRateIds'] ?? null;
            if (!is_array($rates) || count($rates)<1 || count($rates)>12) return false;
            foreach ($rates as $rate) {
                if (!is_string($rate) || !preg_match('/^[A-Za-z0-9_:-]{3,64}$/D',$rate)) return false;
            }
            return true;
        }
        if (($r['configurationKey'] ?? null) !== $key
            || ($r['supplier'] ?? null) !== 'speedmaster'
            || ($r['verifiedNetPrice'] ?? null) !== true
            || ($r['manufacturable'] ?? null) !== true
            || ($r['decorAndThicknessAvailable'] ?? null) !== true
            || ($r['cutListVerified'] ?? null) !== true
            || ($r['connectorPlanVerified'] ?? null) !== true
            || ($r['packagingAndCostsVerified'] ?? null) !== true
            || !is_string($r['supplierReference'] ?? null)
            || strlen(trim($r['supplierReference'])) < 4
            || strlen($r['supplierReference']) > 128
            || !is_int($r['supplierNetCents'] ?? null) || $r['supplierNetCents'] < 1 || $r['supplierNetCents'] > 10000000
            || !is_int($r['maxQuantity'] ?? null) || $r['maxQuantity'] < 1
            || !is_string($r['checkedOn'] ?? null)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $r['checkedOn'])) {
            return false;
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $r['checkedOn'], new DateTimeZone('UTC'));
        if (!$date || $date->format('Y-m-d') !== $r['checkedOn']) return false;
        $timestamp = $date->getTimestamp();
        if ($timestamp > $now || ($now - $timestamp) > self::MAX_EVIDENCE_AGE_DAYS * 86400) return false;

        // Real cutting list, physically packed shipping units, and source.
        $cuts = $r['verifiedCutParts'] ?? null;
        $lengths = $r['verifiedShippingPartLengthsMm'] ?? null;
        $packages = $r['verifiedPackages'] ?? null;
        if (!is_array($cuts) || count($cuts) < 1 || count($cuts) > 24
            || !is_array($lengths) || count($lengths) < 1 || count($lengths) > 12
            || !is_array($packages) || count($packages) !== count($lengths)) return false;
        $ids = [];
        foreach ($cuts as $cut) {
            if (!is_array($cut)
                || !is_string($cut['partId'] ?? null)
                || !preg_match('/^[a-zA-Z0-9_-]{1,32}$/D', $cut['partId'])
                || in_array($cut['partId'], $ids, true)
                || !is_int($cut['lengthMm'] ?? null)
                || !is_int($cut['widthMm'] ?? null)
                || $cut['lengthMm'] < 1 || $cut['widthMm'] < 1
                || $cut['lengthMm'] > 100000 || $cut['widthMm'] > 100000) return false;
            $ids[] = $cut['partId'];
        }
        foreach ($lengths as $i=>$length) {
            if (!is_int($length) || $length < 1 || $length > 100000) return false;
            $p = $packages[$i];
            if (!is_array($p)
                || !self::exactKeys($p, ['lengthMm','widthMm','heightMm','weightGrams'])
                || !is_int($p['lengthMm']) || $p['lengthMm'] < $length || $p['lengthMm'] > 100000
                || !is_int($p['widthMm']) || $p['widthMm'] < 1 || $p['widthMm'] > 100000
                || !is_int($p['heightMm']) || $p['heightMm'] < 1 || $p['heightMm'] > 100000
                || !is_int($p['weightGrams']) || $p['weightGrams'] < 100 || $p['weightGrams'] > 250000) return false;
        }
        // Every supplier-verified cut rectangle must fit at least one real
        // packed unit. Graphic preview regions are never substituted here.
        foreach ($cuts as $cut) {
            $fits = false;
            foreach ($packages as $pack) {
                $fits = $fits || (
                    ($cut['lengthMm'] <= $pack['lengthMm'] && $cut['widthMm'] <= $pack['widthMm'])
                    || ($cut['widthMm'] <= $pack['lengthMm'] && $cut['lengthMm'] <= $pack['widthMm'])
                );
            }
            if (!$fits) return false;
        }
        foreach (['packagingNetCents','outboundNetCostCents','paymentAndHandlingNetCents'] as $cost) {
            if (!is_int($r[$cost] ?? null) || $r[$cost] < 0 || $r[$cost] > 10000000) return false;
        }
        if (!is_string($r['packagingCostSource'] ?? null)
            || strlen(trim($r['packagingCostSource'])) < 4
            || !is_string($r['shippingCostSource'] ?? null)
            || strlen(trim($r['shippingCostSource'])) < 4) return false;
        $rates = $r['approvedShippingRateIds'] ?? null;
        if (!is_array($rates) || count($rates) < 1 || count($rates) > 12) return false;
        foreach ($rates as $rate) {
            if (!is_string($rate) || !preg_match('/^[A-Za-z0-9_:-]{3,64}$/D', $rate)) return false;
        }
        return true;
    }

    /**
     * No preflight report can purchase: true. This is deliberately not a
     * WordPress price adapter. $checkout must contain WooSERVER values only.
     */
    public static function review(array $raw, array $trustedEvidence=[], array $checkout=[], ?int $now=null): array
    {
        $c = self::normalize($raw);
        $key = self::configurationKey($c);
        $r = $trustedEvidence[$key] ?? null;
        $blocked = [];
        $unitGross = null;
        $marginPasses = false;
        $evidenceOkay = is_array($r) && self::verifiedEvidence($r, $key, $now ?? time());
        if (!$evidenceOkay) {
            $blocked[] = 'exact-supplier-cut-list-or-price-proof-missing';
        } else {
            // Use the physical longest PACKAGED side, not a potentially
            // shorter declared cutting length: freight tier is 1900 mm.
            if (($r['pricingBasis'] ?? null) === 'operator-priced-lu-ratebook-v1') {
                // Owner decision 06.11.2026: the shop rule is based on the
                // configured lengths, independent of actual supplier parts.
                // >=1900 mm on ANY L-axis triggers the one-time EUR 50 tier.
                $inboundCents = HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c);
            } else {
                $verifiedPackageLengths = array_map(
                    static function (array $package): int {
                        return max($package['lengthMm'], $package['widthMm']);
                    },
                    $r['verifiedPackages']
                );
                $inboundCents = HPZ_APL_Price_V3::inboundCostForVerifiedParts($verifiedPackageLengths);
            }
            $additionalNetCents = $r['packagingNetCents'] + $r['outboundNetCostCents']
                + $r['paymentAndHandlingNetCents'];
            // Reuse the exact same verified-cost commercial policy as V3:
            // reserve 10%, target margin 40%, 19% DE gross reference.
            $unitGross = HPZ_APL_Price_V3::targetGrossForVerifiedCosts(
                $r['supplierNetCents'], $inboundCents, $additionalNetCents
            );
        }

        if (($checkout['country'] ?? null) !== 'DE') $blocked[] = 'destination-not-released';
        if (($checkout['taxVerified'] ?? null) !== true
            || ($checkout['baseTaxRateBasisPoints'] ?? null) !== 1900
            || ($checkout['pricesConfigured'] ?? null) !== true) {
            $blocked[] = 'woocommerce-tax-unverified';
        }
        if (!$evidenceOkay
            || ($checkout['shippingCalculated'] ?? null) !== true
            || !is_string($checkout['selectedShippingRateId'] ?? null)
            || !in_array($checkout['selectedShippingRateId'], $r['approvedShippingRateIds'], true)
            || !is_int($checkout['shippingAmountCents'] ?? null)
            || $checkout['shippingAmountCents'] < 0) {
            $blocked[] = 'customer-shipping-unverified';
        }
        if ($evidenceOkay && $c['quantity'] > $r['maxQuantity']) {
            $blocked[] = 'supplier-quantity-unverified';
        }

        $grossExpected = $unitGross === null ? null : $unitGross * $c['quantity'];
        $gross = $checkout['preDiscountGrossCents'] ?? null;
        $net = $checkout['actualNetLineRevenueCents'] ?? null;
        if ($grossExpected === null || !is_int($gross)
            || abs($gross-$grossExpected) > max(1,$c['quantity'])
            || !is_int($net) || $net <= 0 || $net > $grossExpected) {
            $blocked[] = 'woocommerce-line-price-unverified';
        } else {
            // Minimum 35% AFTER 10% reserve, quantity, discounts, freight
            // and processing; 40% remains the initial target, not the floor.
            // Same strict post-discount 35%-minimum as Straight V3. Add
            // verified packing/outbound/payment expenses to the cost base.
            $marginReview = HPZ_APL_Price_V3::checkNetMargin(
                $r['supplierNetCents'] * $c['quantity'],
                ($inboundCents + $additionalNetCents) * $c['quantity'],
                $net
            );
            $marginPasses = $marginReview['passesMinimum35'];
            if (!$marginPasses) $blocked[] = 'margin-below-35-after-discounts';
        }
        if (($checkout['checkoutIntegrationVerified'] ?? null) !== true)
            $blocked[] = 'woocommerce-checkout-integration-unverified';
        if (($checkout['manualSupplierHandoffVerified'] ?? null) !== true)
            $blocked[] = 'manual-speedmaster-handoff-unverified';
        if (($checkout['operatorSaleApproval'] ?? null) !== true)
            $blocked[] = 'operator-sale-approval-missing';

        return [
            'ruleVersion'=>self::VERSION,'configurationKey'=>$key,
            'pricingPolicyId'=>$evidenceOkay ? self::PRICE_POLICY : null,
            'status'=>count($blocked) === 0 ? 'manual-release-review-ready' : 'blocked',
            'preflightComplete'=>count($blocked) === 0,'purchasable'=>false,
            'unitGrossReferenceCents'=>$unitGross,'totalGrossReferenceCents'=>$grossExpected,
            'quantity'=>$c['quantity'],'blockers'=>array_values(array_unique($blocked)),
            'production'=>array_merge([
                'schemaVersion'=>2,'productId'=>$c['productId'],'form'=>$c['geometry'],
                'dimensionsMm'=>$c['dimensions'],'thicknessMm'=>$c['material']==='APL38'?38:17.5,
                'decorId'=>$c['decor'],'decorName'=>$c['decorName'],
                'supplierDecorCode'=>$c['supplierDecorCode'],'edge'=>'1,5 mm dekorgleich',
                'corner'=>'square','quantity'=>$c['quantity'],
            ],isset($c['lCorner'])?['lCorner'=>$c['lCorner']]:[]),
        ];
    }
}
