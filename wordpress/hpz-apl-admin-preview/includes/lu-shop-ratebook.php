<?php
/**
 * L/U commercial price model: reuse EXISTING V3 straight decor EK references,
 * V3 gross/margin calculator and measured L/U shape-specific W980/H1145
 * length anchors. All 8 shapes / 16 decors / two thicknesses supported ONLY
 * for the measured 2000..2500mm L1 interval at fixed reference other sizes.
 *
 * Values away from exact supplier records are internal COST ESTIMATES, not
 * confirmed Speedmaster purchase prices or supplier manufacturability.
 * Purchasability remains behind independent Woo/operator release gates.
 */
declare(strict_types=1);

final class HPZ_APL_LU_Shop_Ratebook_12
{
    public const VERSION = 'lu-ratebook-10point-commercial-final-20261109-v5';

    private const W980 = [
        'L1'=>['APL17.5'=>[2000=>30767,2500=>34241],'APL38'=>[2000=>46445,2500=>51156]],
        'L2'=>['APL17.5'=>[2000=>30767,2500=>34241],'APL38'=>[2000=>46445,2500=>51156]],
        'L3'=>['APL17.5'=>[2000=>48855,2500=>52329],'APL38'=>[2000=>79852,2500=>84562]],
        'L4'=>['APL17.5'=>[2000=>43094,2500=>46568],'APL38'=>[2000=>65861,2500=>70571]],
        'U1'=>['APL17.5'=>[2000=>45929,2500=>49403],'APL38'=>[2000=>69149,2500=>73859]],
        'U2'=>['APL17.5'=>[2000=>45929,2500=>49403],'APL38'=>[2000=>68736,2500=>73446]],
        'U3'=>['APL17.5'=>[2000=>45929,2500=>49403],'APL38'=>[2000=>69149,2500=>73859]],
        'U4'=>['APL17.5'=>[2000=>45929,2500=>49403],'APL38'=>[2000=>69149,2500=>73859]],
    ];

    // Direct H1145 operator-confirmed figures for L1,U1 at 2000/2500 and
    // L2,U2 at 2500; the 2000 values of L2/U2 are MIRROR/DELTA estimates.
    private const H1145 = [
        'L1'=>['APL17.5'=>[2000=>31153,2500=>34693],'APL38'=>[2000=>46872,2500=>51649]],
        'L2'=>['APL17.5'=>[2000=>31153,2500=>34693],'APL38'=>[2000=>46872,2500=>51649]],
        'U1'=>['APL17.5'=>[2000=>46434,2500=>49974],'APL38'=>[2000=>69655,2500=>74432]],
        'U2'=>['APL17.5'=>[2000=>46434,2500=>49974],'APL38'=>[2000=>69242,2500=>74019]],
    ];

    private const REFERENCE_SIZES = [
        'L1'=>['L2'=>1200,'B1'=>600,'B2'=>600],
        'L2'=>['L2'=>1200,'B1'=>600,'B2'=>600],
        'L3'=>['L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900],
        'L4'=>['L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,'B5'=>600],
        'U1'=>['L2'=>1200,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600],
        'U2'=>['L2'=>1200,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600],
        'U3'=>['L2'=>1200,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600],
        'U4'=>['L2'=>1200,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600],
    ];

    /**
     * Ten independent operator-supplied Speedmaster NET prices (9 Nov 2026).
     * Exact configuration matches ONLY. Complete provenance in
     * docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json.
     * These net amounts are not public end-customer sale prices.
     */
    private const NOV09_NET_CASES = [
        ['L1','W980','APL17.5',['L1'=>1890,'L2'=>1200,'B1'=>600,'B2'=>600],null,30003],
        ['L1','W980','APL17.5',['L1'=>1900,'L2'=>1200,'B1'=>600,'B2'=>600],null,30073],
        ['L1','W980','APL38',['L1'=>2250,'L2'=>1200,'B1'=>600,'B2'=>600],
            ['side'=>'left','treatment'=>'chamfer_square','parameters'=>['L3'=>150,'B3'=>150]],51006],
        ['L2','H1145','APL17.5',['L1'=>2250,'L2'=>1200,'B1'=>600,'B2'=>600],
            ['side'=>'right','treatment'=>'round','parameters'=>['R2'=>150]],35133],
        ['L3','W980','APL17.5',['L1'=>2500,'L2'=>2000,
            'B1'=>600,'B2'=>600,'B3'=>950,'B4'=>950],null,52889],
        ['L4','W980','APL38',['L1'=>2700,'L2'=>2000,
            'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,'B5'=>700],null,72466],
        ['U1','W980','APL38',['L1'=>2500,'L2'=>1700,'L3'=>1800,
            'B1'=>675,'B2'=>600,'B3'=>600],null,76763],
        ['U2','H1145','APL17.5',['L1'=>2300,'L2'=>1600,'L3'=>2100,
            'B1'=>650,'B2'=>600,'B3'=>650],null,54740],
        ['U3','F128','APL38',['L1'=>2500,'L2'=>1200,'L3'=>1800,
            'B1'=>600,'B2'=>600,'B3'=>600],null,83782],
        ['U4','F128','APL17.5',['L1'=>2600,'L2'=>1600,'L3'=>2000,
            'B1'=>700,'B2'=>600,'B3'=>650],null,82824],
    ];

    private static function nov09ConfirmedPrice(array $c): ?int
    {
        foreach (self::NOV09_NET_CASES as $entry) {
            if (($c['geometry']??null)===$entry[0] && ($c['decor']??null)===$entry[1]
                && ($c['material']??null)===$entry[2]
                && ($c['dimensions']??null)===$entry[3]
                && ($c['lCorner']??null)===$entry[4]) return $entry[5];
        }
        return null;
    }

    private static function nov09ExactCandidate(int $supplier): array
    {
        return [
            'supplierNetCents'=>$supplier,
            'source'=>'docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json',
            'priceBasis'=>'confirmed-net-reference',
            'priceWindow'=>'Exact form / decor / thickness / dimensions and corner from operator 2026-11-09',
            'ratebookVersion'=>self::VERSION,
        ];
    }

    /** Internal inbound freight rule; user override of 06.11.2026. */
    public static function configuredInboundCents(array $c): int
    {
        $d=$c['dimensions'] ?? null;
        if (!is_array($d)) throw new InvalidArgumentException('Konfigurierte Längen fehlen.');
        $lengths=[];
        foreach (['L1','L2','L3'] as $axis) {
            if (!array_key_exists($axis,$d)) continue;
            if (!is_int($d[$axis]) || $d[$axis]<1) throw new InvalidArgumentException('Ungültige Länge: '.$axis);
            $lengths[]=$d[$axis];
        }
        return HPZ_APL_Price_V3::inboundCostForVerifiedParts($lengths);
    }

    private static function lerpCents(array $pair,int $length): int
    {
        if (!isset($pair[2000],$pair[2500]) || $length<2000 || $length>2500) {
            throw new InvalidArgumentException('Netto-Preisbereich überschritten.');
        }
        $difference=$pair[2500]-$pair[2000];
        return $pair[2000]+intdiv($difference*($length-2000)+499,500);
    }

    /**
     * Controlled U-shape decor scale from U3/F128 independent check:
     * old unadjusted material-area premium overestimated supplier F128
     * by approximately 37 EUR. Use 75% for this one decor family.
     * Other decor references retain their established V3 relationship.
     */
    private static function decorUpliftNetCents(
        string $shape,string $decor,int $delta,int $areaMm2
    ): int {
        $num=$delta*$areaMm2;
        if ($shape[0]==='U' && $decor==='F128')
            return intdiv(3*$num+4*1200000-1,4*1200000);
        return intdiv($num+1200000-1,1200000);
    }

    /** Conservative gross material *reference* area, not CNC geometry. */
    private static function decorCostReferenceAreaMm2(string $shape,array $d): int
    {
        $area = $d['L1']*$d['B1'] + $d['L2']*$d['B2'];
        if ($shape[0]==='U') $area += $d['L3']*$d['B3'];
        if ($shape==='L3'||$shape==='L4') $area += $d['B3']*$d['B4'];
        return $area;
    }

    /** ceil(a / positive denominator) preserving negative price slopes. */
    private static function ceilRatio(int $numerator,int $denominator): int
    {
        if ($denominator <= 0) throw new InvalidArgumentException('Invalid interpolation span.');
        return $numerator >= 0
            ? intdiv($numerator+$denominator-1,$denominator)
            : -intdiv(-$numerator,$denominator);
    }

    /**
     * Operator-confirmed independent Speedmaster NET prices for individual
     * cross-axis cases, plus interpolation ONLY between their exact same-form,
     * same-decor, same-thickness, same-other-dimension measurements.
     *
     * In particular U1 / 38mm B1=600..700 has a NEGATIVE supplier slope;
     * the general conservative absolute-width surcharge previously marked
     * those real cases significantly too high. Never extrapolate this slope.
     */
    private static function focusedMeasuredWidth(array $c): ?array
    {
        $shape=$c['geometry'] ?? null;
        $decor=$c['decor'] ?? null;
        $material=$c['material'] ?? null;
        $d=$c['dimensions'] ?? null;
        if ($decor!=='W980' || !is_array($d)) return null;
        $supplier=null;
        $basis='bounded-single-axis-net-interpolation';
        $label='';
        if ($shape==='U1' && count($d)===6
            && ($d['L1']??null)===2500 && ($d['L2']??null)===1700
            && ($d['L3']??null)===1800 && ($d['B2']??null)===600
            && ($d['B3']??null)===600 && is_int($d['B1']??null)
            && $d['B1']>=600 && $d['B1']<=700) {
            $measurements=[
                'APL17.5'=>[600=>52876,650=>53433,700=>53990],
                'APL38'=>[600=>78569,650=>77640,675=>76763,700=>76712],
            ];
            if (!isset($measurements[$material])) return null;
            $prices=$measurements[$material];
            $width=$d['B1'];
            if (isset($prices[$width])) {
                $supplier=$prices[$width];
                $basis='confirmed-net-reference';
            } else {
                $keys=array_keys($prices);
                sort($keys,SORT_NUMERIC);
                foreach ($keys as $index=>$lower) {
                    $higher=$keys[$index+1]??null;
                    if ($higher!==null && $lower<$width && $width<$higher) {
                        $supplier=$prices[$lower]+self::ceilRatio(
                            ($prices[$higher]-$prices[$lower])*($width-$lower),
                            $higher-$lower
                        );
                        break;
                    }
                }
            }
            $label='U1 B1 600..700mm; L1=2500 L2=1700 L3=1800 B2/B3=600mm';
        } elseif ($shape==='L3' && $material==='APL17.5' && count($d)===6
            && ($d['L1']??null)===2500 && ($d['L2']??null)===2000
            && ($d['B1']??null)===600 && ($d['B2']??null)===600
            && is_int($d['B3']??null) && ($d['B4']??null)===$d['B3']
            && $d['B3']>=900 && $d['B3']<=1000) {
            $anchors=[900=>52329,950=>52889,1000=>53498];
            $w=$d['B3'];
            if(isset($anchors[$w])) {
                $supplier=$anchors[$w];
                $basis='confirmed-net-reference';
            }elseif($w<950) {
                $supplier=$anchors[900]+self::ceilRatio(
                    ($anchors[950]-$anchors[900])*($w-900),50
                );
            }else {
                $supplier=$anchors[950]+self::ceilRatio(
                    ($anchors[1000]-$anchors[950])*($w-950),50
                );
            }
            $label='L3 B3/B4 coupled 900..1000mm; L1=2500 L2=2000 B1/B2=600mm';
        } elseif ($shape==='L4' && $material==='APL17.5' && count($d)===7
            && ($d['L1']??null)===2500 && ($d['L2']??null)===2000
            && ($d['B1']??null)===600 && ($d['B2']??null)===600
            && ($d['B3']??null)===900 && ($d['B4']??null)===900
            && is_int($d['B5']??null) && $d['B5']>=600 && $d['B5']<=700) {
            $supplier=46568+self::ceilRatio(1251*($d['B5']-600),100);
            if ($d['B5']===600||$d['B5']===700) $basis='confirmed-net-reference';
            $label='L4 base B5 600..700mm; L1=2500 L2=2000 B1/B2=600 B3/B4=900mm';
        }
        if ($supplier===null) return null;
        return [
            'supplierNetCents'=>$supplier,
            'source'=>'docs/price-reference-cases.csv + docs/references/speedmaster-lu/LU_FOUR_WIDTH_NET_PRICES_20261106.json',
            'priceBasis'=>$basis,
            'priceWindow'=>$label,
            'ratebookVersion'=>self::VERSION,
        ];
    }

    /**
     * Model coverage: 8 L/U geometries, 16 V3 decors and both thicknesses,
     * but only 200..250 cm L1 and exact form-specific reference dimensions.
     * Other dimensions, corner work, non-matching edges => no commercial quote.
     */
    public static function candidate(array $c): ?array
    {
        $shape=$c['geometry'] ?? null;
        $decor=$c['decor'] ?? null;
        $material=$c['material'] ?? null;
        $d=$c['dimensions'] ?? null;
        if (!is_string($shape)||!isset(self::W980[$shape])
            || !is_string($decor)||!is_string($material)
            || !isset(self::W980[$shape][$material])||!is_array($d)
            ||($c['corner']??null)!=='square'||($c['edge']??null)!=='matching-1.5'
            ||isset($c['lCorner']))
            return null;
        $confirmed=self::nov09ConfirmedPrice($c);
        if($confirmed!==null) return self::nov09ExactCandidate($confirmed);
        // The owner confirmed 1890/1900mm W980/17.5 L1 supplier prices.
        // Interpolate only on this one fully fixed geometry; do not extrapolate.
        if ($shape==='L1' && $decor==='W980' && $material==='APL17.5'
            && ($d['L2']??null)===1200 && ($d['B1']??null)===600
            && ($d['B2']??null)===600 && count($d)===4
            && is_int($d['L1']??null) && $d['L1']>1890 && $d['L1']<1900) {
            return [
                'supplierNetCents'=>30003+self::ceilRatio(70*($d['L1']-1890),10),
                'source'=>'docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json',
                'priceBasis'=>'bounded-single-axis-net-interpolation',
                'priceWindow'=>'L1 1890..1900; all other L1 measures fixed',
                'ratebookVersion'=>self::VERSION,
            ];
        }
        $focused=self::focusedMeasuredWidth($c);
        if ($focused!==null) return $focused;
        $fixed=self::REFERENCE_SIZES[$shape];
        if(count($d)!==count($fixed)+1||!is_int($d['L1']??null))return null;
        foreach($fixed as $key=>$value){if(($d[$key]??null)!==$value)return null;}
        $length=$d['L1'];
        if($length<2000||$length>2500)return null;
        try {
            // Also validates that the decor is one of the existing 16 from V3.
            $decorDelta=HPZ_APL_Price_V3::referenceDecorNetDifferenceCents($decor,$material);
        } catch (InvalidArgumentException $e) {return null;}
        if($decorDelta<0)return null;

        $explicit=self::H1145[$shape][$material]??null;
        $baseline=self::lerpCents(self::W980[$shape][$material],$length);
        if($decor==='W980'){
            $cost=$baseline;
        }elseif($decor==='H1145' && is_array($explicit)){
            $cost=self::lerpCents($explicit,$length);
        }else{
            // One reference material difference multiplied by the sum of
            // L/U rectangular stock spans. This tends to OVERcount the
            // overlapping corner stock. It is an APPROXIMATION, not a
            // Speedmaster material-specific EK.
            $grossArea=self::decorCostReferenceAreaMm2($shape,$d);
            $netPremium=self::decorUpliftNetCents($shape,$decor,$decorDelta,$grossArea);
            $cost=$baseline+$netPremium;
        }

        $twoPointMeasured=in_array($shape,['L1','U1'],true);
        $confirmed = ($length===2000||$length===2500)
            &&(($decor==='W980'&&$twoPointMeasured)
                ||($decor==='H1145'&&$twoPointMeasured)
                ||($decor==='H1145'&&$length===2500&&in_array($shape,['L2','U2'],true)));
        return [
            'supplierNetCents'=>$cost,
            'source'=>'docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv + pricing-v3/HPZ_APL_Price_V3.php',
            'priceBasis'=>$confirmed?'confirmed-net-reference':'owner-review-commercial-cost-estimate',
            'priceWindow'=>'L1 2000..2500 mm; other dimensions fixed to shape-specific reference',
            'ratebookVersion'=>self::VERSION,
        ];
    }

    /**
     * Commercial *estimate* for variable dimensions. Separate, explicit
     * extended_model_approved option required before Woo will even consider
     * this path. No hidden supplier tariff is being invented.
     *
     * The measured supplier configurations still have the highest confidence.
     * Outside those exact cases, use the measured length slope, conservative
     * width estimates and the original V3 10% cost reserve. The redundant
     * additional 7% overlay was removed after ten November supplier checks.
     * Dimension limits are business rules, not machining guarantees.
     */
    public static function extendedCandidate(array $c): ?array
    {
        // Known exact supplier prices and narrow real-data interpolations
        // always supersede the generic 7% uncertainty surcharge.
        $grounded=self::candidate($c);
        if ($grounded!==null) return $grounded;
        $shape=$c['geometry'] ?? null;
        $material=$c['material'] ?? null;
        $decor=$c['decor'] ?? null;
        $d=$c['dimensions'] ?? null;
        if(!is_string($shape)||!isset(self::W980[$shape])
            ||!is_string($material)||!isset(self::W980[$shape][$material])
            ||!is_string($decor)||!is_array($d)
            ||($c['corner']??null)!=='square'||($c['edge']??null)!=='matching-1.5'
            ||isset($c['lCorner']))
            return null;
        $fixed=self::REFERENCE_SIZES[$shape];
        if(count($d)!==count($fixed)+1)return null;
        foreach($d as $axis=>$v){
            if(!is_string($axis)||!is_int($v))return null;
            if($axis==='L1'||$axis==='L2'||$axis==='L3'){
                if($v<1000||$v>4000)return null;
            }elseif(in_array($axis,['B1','B2','B3','B4','B5'],true)){
                if($v<300||$v>1200)return null;
            }else return null;
        }
        foreach($fixed as $axis=>$v){if(!array_key_exists($axis,$d))return null;}
        try{
            $delta=HPZ_APL_Price_V3::referenceDecorNetDifferenceCents($decor,$material);
            if($delta<0)return null;
        }catch(InvalidArgumentException $e){return null;}

        $clampedL1=max(2000,min(2500,$d['L1']));
        $reference=$c;
        $reference['dimensions']=array_merge(['L1'=>$clampedL1],$fixed);
        $base=self::candidate($reference);
        if($base===null)return null;
        $cost=$base['supplierNetCents'];
        $pair=self::W980[$shape][$material];
        $per500=$pair[2500]-$pair[2000];
        $adjust=0;
        foreach(['L1','L2','L3'] as $axis){
            if(!isset($d[$axis]))continue;
            $refLength=$axis==='L1'?$clampedL1:$fixed[$axis];
            $change=$d[$axis]-$refLength;
            if($change>0){
                // Full observed W980 500mm slope. Earlier 25%-extra
                // multiplied by a second 7% buffer and over-priced sales.
                $adjust+=self::ceilRatio($per500*$change,500);
            }elseif($change<0){
                $adjust-=intdiv($per500*(-$change),500);
            }
        }
        // Commercial dimension factors aligned to actual November checks.
        // L4 B5 is a diagonal geometry measure, not another full-width strip.
        $widthCentsPerMm=$material==='APL38'?20:10;
        foreach(['B1','B2','B3','B4','B5'] as $axis){
            if(!isset($d[$axis]))continue;
            if($shape==='L4' && $axis==='B5' && $material==='APL38')continue;
            $adjust+=$widthCentsPerMm*abs($d[$axis]-$fixed[$axis]);
        }
        $materialArea=max(0,self::decorCostReferenceAreaMm2($shape,$d)
            -self::decorCostReferenceAreaMm2($shape,$reference['dimensions']));
        $adjust+=self::decorUpliftNetCents($shape,$decor,$delta,$materialArea);
        // V3 already retains a 10% cost reserve and the 40% target margin.
        // An ADDITIONAL arbitrary 7% on all variable sizes is unnecessary.
        $cost=max(intdiv($base['supplierNetCents']*7+9,10),$cost+$adjust);
        return [
            'supplierNetCents'=>$cost,
            'source'=>'V3 decor references + measured W980/H1145 shapes + explicit conservative dimensions model',
            'priceBasis'=>'operator-review-extended-cost-estimate',
            'priceWindow'=>'L axes 1000..4000; B axes 300..1200; no corners; conservative estimate only',
            'ratebookVersion'=>self::VERSION,
        ];
    }

    /**
     * L corner commercial-cost model only, independent of the straight
     * countertop's fully separate price rules.
     *
     * ONE direct Speedmaster net example exists: L1, W980, 38mm,
     * L1=2250/L2=1200/B1=B2=600, left chamfer_continuous 150x150:
     * EUR 510.02 versus base EUR 488.01 => +EUR 22.01.
     *
     * The other corner forms and parameters are estimates with conservative
     * operator-defined minimum cost assumptions. They are NOT claimed as
     * supplier quotations; caller must separately approve corner_model_approved.
     */
    public static function cornerCandidate(array $c,bool $allowExtended=false): ?array
    {
        $corner=$c['lCorner']??null;
        if (($c['product']??null)!=='l'||!is_array($corner)
            ||!in_array($corner['side']??null,['left','right','both'],true)
            ||!in_array($corner['treatment']??null,
                ['round','chamfer_square','chamfer_continuous'],true)
            ||!is_array($corner['parameters']??null))return null;
        $base=$c;
        unset($base['lCorner']);
        $prior=self::candidate($base);
        if($prior===null&&$allowExtended)$prior=self::extendedCandidate($base);
        if($prior===null)return null;

        $exact=($c['geometry']??null)==='L1'
            &&($c['decor']??null)==='W980'
            &&($c['material']??null)==='APL38'
            &&$c['dimensions']===['L1'=>2250,'L2'=>1200,'B1'=>600,'B2'=>600]
            &&$corner['side']==='left'
            &&$corner['treatment']==='chamfer_continuous'
            &&$corner['parameters']===['L3'=>150,'B3'=>150];
        $ownerExact=self::nov09ConfirmedPrice($c);
        if ($ownerExact!==null) {
            $netCorner=$ownerExact-$prior['supplierNetCents'];
            $basis='operator-confirmed-single-corner-reference';
        } elseif ($exact) {
            $netCorner=2201;
            $basis='operator-confirmed-single-corner-reference';
        } else {
            // Conservative commercial assumptions, NOT supplier offers.
            // By design the 22.01 EUR supplier witness cannot simply be
            // copied to arbitrary shapes, left/right, or radii.
            $netCorner=0;
            foreach ($corner['side']==='both'?['left','right']:[$corner['side']] as $side) {
                $values=$corner['parameters'];
                $suffix=in_array($c['geometry'],['L1','L2'],true)
                    ?($side==='left'?['L3','B3']:['L4','B4'])
                    :($side==='left'?['L5','B5']:['L6','B6']);
                if ($corner['treatment']==='round') {
                    $radius=$values[$side==='left'?'R1':'R2']??null;
                    if(!is_int($radius)||$radius<10||$radius>1000)return null;
                    $netCorner+=2500+max(0,$radius-150)*10;
                } else {
                    $l=$values[$suffix[0]]??null;
                    $b=$values[$suffix[1]]??null;
                    if(!is_int($l)||!is_int($b)||$l<60||$b<60||$l>2000||$b>2000)
                        return null;
                    $netCorner+=2500+max(0,$l+$b-300)*7;
                }
                if(in_array($c['geometry'],['L3','L4'],true))$netCorner+=1200;
            }
            if($corner['side']==='both')$netCorner+=1200;
            $basis='owner-review-l-corner-cost-estimate';
        }
        return [
            'supplierNetCents'=>$prior['supplierNetCents']+$netCorner,
            'source'=>$ownerExact!==null
                ?'docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json'
                :($exact ?'docs/references/speedmaster-lu/LU_THREE_PRICE_CONTROLS_20261106.json'
                    :'V3 L/U baseline + explicitly unverified commercial L-corner cost policy'),
            'priceBasis'=>$basis,
            'cornerNetModelCents'=>$netCorner,
            'priceWindow'=>'L corner: '.$corner['side'].' / '.$corner['treatment']
                .'; base: '.$prior['priceWindow'],
            'ratebookVersion'=>self::VERSION,
        ];
    }

    /**
     * Only privileged WP operator policy can allow estimated supplier costs
     * to be used as COMMERCIAL price assumptions in a Woo offer.
     * None of the below keys are accepted from customer/Store API JSON.
     */
    public static function operatorProof(array $c,array $policy): ?array
    {
        if (isset($c['lCorner'])) {
            if (($policy['corner_model_approved']??null)!==true) return null;
            $candidate=self::cornerCandidate(
                $c,($policy['extended_model_approved']??null)===true
            );
        } else {
            $candidate=self::candidate($c);
            if ($candidate===null && ($policy['extended_model_approved']??null)===true)
                $candidate=self::extendedCandidate($c);
        }
        if ($candidate===null||($policy['model_price_approved']??null)!==true
            ||!is_int($policy['other_cost_net_cents']??null)
            ||$policy['other_cost_net_cents']<0||$policy['other_cost_net_cents']>10000000
            ||!is_int($policy['max_quantity']??null)
            ||$policy['max_quantity']<1||$policy['max_quantity']>1000
            ||!is_string($policy['price_approved_on']??null)
            ||!preg_match('/^\d{4}-\d{2}-\d{2}$/D',$policy['price_approved_on'])
            ||!is_array($policy['approved_shipping_rate_ids']??null))return null;
        $rates=$policy['approved_shipping_rate_ids'];
        if(count($rates)<1||count($rates)>12)return null;
        foreach($rates as $rate){
            if(!is_string($rate)||!preg_match('/^[A-Za-z0-9_:-]{3,64}$/D',$rate))return null;
        }
        return [
            'configurationKey'=>HPZ_APL_LU_Price_Readiness::configurationKey($c),
            'supplier'=>'speedmaster',
            'pricingBasis'=>'operator-priced-lu-ratebook-v1',
            'operatorPriceApproved'=>true,
            'priceEvidenceType'=>$candidate['priceBasis'],
            'priceModelVersion'=>self::VERSION,
            'supplierReference'=>'HPZ-INTERNES-PREISREGISTER-20261106',
            'supplierNetCents'=>$candidate['supplierNetCents'],
            'maxQuantity'=>$policy['max_quantity'],
            'checkedOn'=>$policy['price_approved_on'],
            'packagingNetCents'=>0,
            'outboundNetCostCents'=>$policy['other_cost_net_cents'],
            'paymentAndHandlingNetCents'=>0,
            'approvedShippingRateIds'=>array_values(array_unique($rates)),
            // Intentionally NOT pretending supplier cut/pack records exist.
            'verifiedCutParts'=>[],
            'verifiedPackages'=>[],
        ];
    }
}
