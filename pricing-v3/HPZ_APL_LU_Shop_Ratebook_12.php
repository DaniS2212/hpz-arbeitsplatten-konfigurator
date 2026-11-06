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
    public const VERSION = 'lu-ratebook-eight-shapes-16-decors-extended-20261106-v3';

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

    /** Conservative gross material *reference* area, not CNC geometry. */
    private static function decorCostReferenceAreaMm2(string $shape,array $d): int
    {
        $area = $d['L1']*$d['B1'] + $d['L2']*$d['B2'];
        if ($shape[0]==='U') $area += $d['L3']*$d['B3'];
        if ($shape==='L3'||$shape==='L4') $area += $d['B3']*$d['B4'];
        return $area;
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
            ||($c['corner']??null)!=='square'||($c['edge']??null)!=='matching-1.5')
            return null;
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
            $netPremium=intdiv($decorDelta*$grossArea+1199999,1200000);
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
     * The current measured envelope still has the highest confidence.
     * Outside that envelope, conservatively extend stock length and
     * absolute width deltas with a 7% extra model-risk buffer. Dimension
     * limits are shop business rules, not Speedmaster machining limits.
     */
    public static function extendedCandidate(array $c): ?array
    {
        $shape=$c['geometry'] ?? null;
        $material=$c['material'] ?? null;
        $decor=$c['decor'] ?? null;
        $d=$c['dimensions'] ?? null;
        if(!is_string($shape)||!isset(self::W980[$shape])
            ||!is_string($material)||!isset(self::W980[$shape][$material])
            ||!is_string($decor)||!is_array($d)
            ||($c['corner']??null)!=='square'||($c['edge']??null)!=='matching-1.5')
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
                // Extrapolated lengths: 1.25x observed W980 per-axis slope.
                $adjust+=intdiv($per500*$change*5+1999,2000);
            }elseif($change<0){
                // Shorter parts reduce modeled costs by no more than half
                // the observed slope, a deliberate conservative floor.
                $adjust-=intdiv($per500*(-$change)+999,1000);
            }
        }
        $widthCentsPerMm=$material==='APL38'?30:15;
        foreach(['B1','B2','B3','B4','B5'] as $axis){
            if(!isset($d[$axis]))continue;
            $adjust+=$widthCentsPerMm*abs($d[$axis]-$fixed[$axis]);
        }
        // For other decors only, do not subtract the material surcharge if
        // the shop geometry is smaller; add the extra stock if it is larger.
        $materialArea=max(0,self::decorCostReferenceAreaMm2($shape,$d)
            -self::decorCostReferenceAreaMm2($shape,$reference['dimensions']));
        $adjust+=intdiv($delta*$materialArea+1199999,1200000);
        $cost=max(intdiv($base['supplierNetCents']*7+9,10),$cost+$adjust);
        $cost+=intdiv($cost*7+99,100); // extra 7% model uncertainty
        return [
            'supplierNetCents'=>$cost,
            'source'=>'V3 decor references + measured W980/H1145 shapes + explicit conservative dimensions model',
            'priceBasis'=>'operator-review-extended-cost-estimate',
            'priceWindow'=>'L axes 1000..4000; B axes 300..1200; no corners; conservative estimate only',
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
        $candidate=self::candidate($c);
        if ($candidate===null && ($policy['extended_model_approved']??null)===true)
            $candidate=self::extendedCandidate($c);
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
