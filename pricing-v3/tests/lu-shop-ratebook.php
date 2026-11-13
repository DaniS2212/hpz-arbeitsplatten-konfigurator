<?php
/** Eight-form, sixteen-decor operator shop-price regression. No live sale. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';

$n=0;
function testRate(bool $pass,string $case):void {
    global $n; ++$n;if(!$pass) throw new RuntimeException("FAILED ".$case);
}
function testRaw(string $shape,string $decor,string $material,int $l1):array {
    $isL=$shape[0]==='L';
    $dims=in_array($shape,['L1','L2'],true)
        ?['L1'=>(string)$l1,'L2'=>'1200','B1'=>'600','B2'=>'600']
        :(in_array($shape,['L3','L4'],true)
          ?['L1'=>(string)$l1,'L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900']
          :['L1'=>(string)$l1,'L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600']);
    if($shape==='L4')$dims['B5']='600';
    $raw=[
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$isL?1000080:1000081,
        'product'=>$isL?'l':'u','geometry'=>$shape,'corner'=>'square',
        'dimensions'=>$dims,'material'=>$material,'decor'=>$decor,
        'edge'=>'matching-1.5','quantity'=>1,
    ];
    if($isL)$raw['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
    return $raw;
}
$w980=[
    'L1'=>['APL17.5'=>[30767,34241],'APL38'=>[46445,51156]],
    'L2'=>['APL17.5'=>[30767,34241],'APL38'=>[46445,51156]],
    'L3'=>['APL17.5'=>[48855,52329],'APL38'=>[79852,84562]],
    'L4'=>['APL17.5'=>[43094,46568],'APL38'=>[65861,70571]],
    'U1'=>['APL17.5'=>[45929,49403],'APL38'=>[69149,73859]],
    'U2'=>['APL17.5'=>[45929,49403],'APL38'=>[68736,73446]],
    'U3'=>['APL17.5'=>[45929,49403],'APL38'=>[69149,73859]],
    'U4'=>['APL17.5'=>[45929,49403],'APL38'=>[69149,73859]],
];
$h1145=[
    'L1'=>['APL17.5'=>[31153,34693],'APL38'=>[46872,51649]],
    'L2'=>['APL17.5'=>[31153,34693],'APL38'=>[46872,51649]],
    'U1'=>['APL17.5'=>[46434,49974],'APL38'=>[69655,74432]],
    'U2'=>['APL17.5'=>[46434,49974],'APL38'=>[69242,74019]],
];
$decors=array_map('strval',array_keys(HPZ_APL_Decor_Catalog::all()));
testRate(count($decors)===16,'source catalog still 16');
foreach($w980 as $shape=>$thicks){
    foreach($thicks as $material=>$pair){
        foreach([2000,2250,2500] as $length){
            $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw($shape,'W980',$material,$length));
            $got=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
            $expect=$pair[0]+intdiv(($pair[1]-$pair[0])*($length-2000)+499,500);
            testRate(is_array($got)&&$got['supplierNetCents']===$expect,"W980/$shape/$material/$length");
            testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===15000,'150 net per configured L/U unit');
            foreach($decors as $decor){
                $copy=$c;$copy['decor']=$decor;
                $q=HPZ_APL_LU_Shop_Ratebook_12::candidate($copy);
                testRate(is_array($q)&&$q['supplierNetCents']>0,"all 16 decors / $shape / $material / $length / $decor");
                testRate($q['supplierNetCents']>=$expect,'decor cannot undercut W980');
                $price=HPZ_APL_Price_V3::targetGrossForVerifiedCosts($q['supplierNetCents'],15000,0);
                testRate($price%1000===0 && $price>0,'common V3 margin and rounding');
                if($decor!=='W980'&&$decor!=='H1145'){
                    // New independently confirmed 9 Nov U3/F128/38mm
                    // 2500-mm reference is no longer an inferred decor EK.
                    $measuredF128=$shape==='U3'&&$material==='APL38'
                        &&$length===2500&&$decor==='F128';
                    testRate($q['priceBasis']===($measuredF128
                        ?'confirmed-net-reference':'owner-review-commercial-cost-estimate'),
                        'only measured F128 U3 classified as confirmed');
                }
            }
        }
    }
}
foreach($h1145 as $shape=>$thicks){
    foreach($thicks as $material=>$pair){
        foreach([[2000,$pair[0]],[2500,$pair[1]]] as [$length,$expected]){
            $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw($shape,'H1145',$material,$length));
            $q=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
            testRate($q['supplierNetCents']===$expected,"H1145 $shape $material $length");
            if(in_array($shape,['L1','U1'],true)||$length===2500){
                testRate($q['priceBasis']==='confirmed-net-reference','exact H1145 marked confirmed');
            }else{
                testRate($q['priceBasis']==='owner-review-commercial-cost-estimate','inferred H1145 not exact');
            }
        }
    }
}
foreach([1999,2501] as $length){
    $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw('L1','W980','APL38',$length));
    testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($c)===null,'no uncontrolled L1 extrapolation');
}
foreach(['L1','L3','L4','U1'] as $shape){
    $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw($shape,'W980','APL38',2500));
    $field=$shape==='L4'?'B5':($shape==='L3'?'B3':'B1');
    $c['dimensions'][$field]+=1;
    testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($c)===null,'changed non-L1 measures must be blocked');
}
$c=['dimensions'=>['L1'=>1899,'L2'=>1200]];
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===15000,'1899mm fixed inbound');
$c['dimensions']['L1']=1900;
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===15000,'1900mm no special tier');
$c['dimensions']=['L1'=>1600,'L2'=>2000,'L3'=>2100];
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===15000,'multiple arms still one inbound per board');

$raw=testRaw('U1','H1145','APL38',2000);
$normalized=HPZ_APL_LU_Price_Readiness::normalize($raw);
$policy=[
    'model_price_approved'=>true,'other_cost_net_cents'=>0,
    'max_quantity'=>2,'price_approved_on'=>'2026-11-06',
    'approved_shipping_rate_ids'=>['test_rate:1'],
];
testRate(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($normalized,[])===null,'no implicit model approval');
$proof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($normalized,$policy);
testRate(is_array($proof)&&$proof['supplierNetCents']===69655,'operator price assumption');
testRate($proof['verifiedPackages']===[]&&$proof['verifiedCutParts']===[],'no fictitious packaging/CNC proofs');
$key=HPZ_APL_LU_Price_Readiness::configurationKey($normalized);
$gross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69655,15000,0);
$ctx=[
    'country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,
    'pricesConfigured'=>true,'shippingCalculated'=>true,
    'selectedShippingRateId'=>'test_rate:1','shippingAmountCents'=>1000,
    'checkoutIntegrationVerified'=>true,'manualSupplierHandoffVerified'=>true,
    'operatorSaleApproval'=>true,
    'preDiscountGrossCents'=>$gross,'actualNetLineRevenueCents'=>(int)round($gross/1.19)
];
$now=strtotime('2026-11-06 12:00:00 UTC');
$review=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$ctx,$now);
testRate($review['preflightComplete']===true,'owner-priced Woo review can pass without CNC');
testRate($review['purchasable']===false,'price preflight cannot publish');
$discount=$ctx;$discount['actualNetLineRevenueCents']=100000;
testRate(HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$discount,$now)['preflightComplete'],'valid Woo discount may reduce effective margin below 35 percent');
$fullDiscount=$ctx;$fullDiscount['actualNetLineRevenueCents']=0;
testRate(HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$fullDiscount,$now)['preflightComplete'],'full Woo coupon may reduce net to zero');
$forgedGross=$discount;$forgedGross['preDiscountGrossCents']=$gross-1000;
testRate(!HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$forgedGross,$now)['preflightComplete'],'unchanged base gross still mandatory');
$bad=$ctx;$bad['selectedShippingRateId']='wrong';
testRate(!HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$bad,$now)['preflightComplete'],'Woo shipping rate check');
// Separate extended model for variable dimensions, no public sale approval.
$short=HPZ_APL_LU_Price_Readiness::normalize(testRaw('L1','W980','APL38',1899));
testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($short)===null,'outside pilot needs extended approval');
$extendedShort=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($short);
testRate(is_array($extendedShort)&&$extendedShort['supplierNetCents']>0,'short L1 commercially estimated');
testRate($extendedShort['priceBasis']==='operator-review-extended-cost-estimate','no confirmed EK label for extension');
testRate(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($short,$policy)===null,'no price extension unless explicitly approved');
$extendedPolicy=$policy;$extendedPolicy['extended_model_approved']=true;
$extendedProof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($short,$extendedPolicy);
testRate(is_array($extendedProof)&&$extendedProof['supplierNetCents']===$extendedShort['supplierNetCents'],'extended price uses only operator option');
$long=HPZ_APL_LU_Price_Readiness::normalize(testRaw('L1','W980','APL38',1900));
$extendedLong=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($long);
$grossShort=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(
    $extendedShort['supplierNetCents'],HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($short),0
);
$grossLong=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(
    $extendedLong['supplierNetCents'],HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($long),0
);
testRate($grossLong>$grossShort+9000,'1900mm adds one-time freight to extended gross');
$changed=HPZ_APL_LU_Price_Readiness::normalize(testRaw('U1','F128','APL17.5',2250));
$changed['dimensions']['L2']=1700;
$changed['dimensions']['B1']=700;
testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($changed)===null,'combined dimension requires extended mode');
$wide=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($changed);
testRate($wide!==null && $wide['supplierNetCents']>1000,'longer arm and width repriced');
$badDimensions=$changed;
$badDimensions['dimensions']['B1']=1201;
testRate(HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($badDimensions)===null,'very wide custom geometry blocked');
$badDimensions=$short;
$badDimensions['dimensions']['L1']=4001;
testRate(HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($badDimensions)===null,'beyond four meters blocked');

// Cross-axis manufacturer NET cases already documented in the repository.
// These were previously overestimated by the arbitrary extended 7% model.
$measuredAdditional=[
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600],52876],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'L3'=>1800,'B1'=>650,'B2'=>600,'B3'=>600],53433],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'L3'=>1800,'B1'=>700,'B2'=>600,'B3'=>600],53990],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600],78569],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'L3'=>1800,'B1'=>650,'B2'=>600,'B3'=>600],77640],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'L3'=>1800,'B1'=>700,'B2'=>600,'B3'=>600],76712],
    ['L3','APL17.5',['L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>1000,'B4'=>1000],53498],
    ['L4','APL17.5',['L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,'B5'=>700],47819],
];
foreach($measuredAdditional as [$form,$material,$dimensions,$expected]){
    $raw=testRaw($form,'W980',$material,2500);
    $raw['dimensions']=array_map('strval',$dimensions);
    $norm=HPZ_APL_LU_Price_Readiness::normalize($raw);
    $quote=HPZ_APL_LU_Shop_Ratebook_12::candidate($norm);
    testRate(is_array($quote)&&$quote['supplierNetCents']===$expected,'additional exact supplier net '.$form.'/'.$material.'/'.json_encode($dimensions));
    testRate($quote['priceBasis']==='confirmed-net-reference','actual net case not mislabeled as estimated');
    testRate(HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($norm)['supplierNetCents']===$expected,
        'extended formula must not override exact supplier quote');
}
foreach([
    ['APL17.5',625,53155],['APL17.5',675,53712],
    ['APL38',625,78105],['APL38',675,76763]
] as [$material,$width,$expected]){
    $raw=testRaw('U1','W980',$material,2500);
    $raw['dimensions']=['L1'=>'2500','L2'=>'1700','L3'=>'1800',
        'B1'=>(string)$width,'B2'=>'600','B3'=>'600'];
    $norm=HPZ_APL_LU_Price_Readiness::normalize($raw);
    $quote=HPZ_APL_LU_Shop_Ratebook_12::candidate($norm);
    testRate(is_array($quote)&&$quote['supplierNetCents']===$expected,'bounded U1 B1 interpolation '.$material.'/'.$width);
    testRate($quote['priceBasis']===($material==='APL38'&&$width===675
            ?'confirmed-net-reference':'bounded-single-axis-net-interpolation'),
        'only actual measured U1 width labeled confirmed');
}
foreach([
    ['L3','B3',950,'B4',950,52889],
    ['L4','B5',650,null,null,47194],
] as [$shape,$a,$v,$b,$other,$expected]){
    $raw=testRaw($shape,'W980','APL17.5',2500);
    $raw['dimensions'][$a]=(string)$v;
    if($b!==null)$raw['dimensions'][$b]=(string)$other;
    $norm=HPZ_APL_LU_Price_Readiness::normalize($raw);
    $quote=HPZ_APL_LU_Shop_Ratebook_12::candidate($norm);
    testRate(is_array($quote)&&$quote['supplierNetCents']===$expected,
        'bounded L widths '.$shape.'/'.$a);
    testRate($quote['priceBasis']===($shape==='L3'
    ?'confirmed-net-reference':'bounded-single-axis-net-interpolation'),
    'November L3 950mm exact, L4 650mm estimated');
}
// Same measurement in another decor/form/length is NOT an exact supplier quote.
$offSlice=testRaw('U2','W980','APL38',2500);
$offSlice['dimensions']=['L1'=>'2500','L2'=>'1700','L3'=>'1800','B1'=>'700','B2'=>'600','B3'=>'600'];
testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate(HPZ_APL_LU_Price_Readiness::normalize($offSlice))===null,
    'U1 width anchors never silently transferred to U2');
$offDecor=testRaw('U1','H1145','APL38',2500);
$offDecor['dimensions']=['L1'=>'2500','L2'=>'1700','L3'=>'1800','B1'=>'700','B2'=>'600','B3'=>'600'];
testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate(HPZ_APL_LU_Price_Readiness::normalize($offDecor))===null,
    'W980 widths never called confirmed H1145 prices');
$notCoupled=testRaw('L3','W980','APL17.5',2500);
$notCoupled['dimensions']['B3']='950';
try {
    HPZ_APL_LU_Price_Readiness::normalize($notCoupled);
    testRate(false,'L3 B3/B4 pair must be rejected by normalization');
} catch (InvalidArgumentException $expected) {
    testRate(true,'L3 B3/B4 pair must be rejected by normalization');
}

// L-corner price coverage: one supplier-screen witness, all other values
// commercial ASSUMPTIONS behind an independent operator approval switch.
$lReference=testRaw('L1','W980','APL38',2250);
$lReference['lCorner']=[
    'side'=>'left','treatment'=>'chamfer_continuous',
    'parameters'=>['L3'=>'150','B3'=>'150'],
];
$lNormalized=HPZ_APL_LU_Price_Readiness::normalize($lReference);
$lBase=HPZ_APL_LU_Price_Readiness::normalize(testRaw('L1','W980','APL38',2250));
testRate(HPZ_APL_LU_Price_Readiness::configurationKey($lNormalized)
    !==HPZ_APL_LU_Price_Readiness::configurationKey($lBase),'machining cannot share square proof fingerprint');
testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($lNormalized)===null,'corners must not inherit base supplier quote');
testRate(HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($lNormalized)===null,'corner bypass of extended quote denied');
$corner=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($lNormalized);
testRate($corner['supplierNetCents']===51002,'Speedmaster L1 left continuous 150x150 witnessed EK EUR 510.02');
testRate($corner['cornerNetModelCents']===2201,'exact observed +22.01 EUR only under exact dimensions');
testRate($corner['priceBasis']==='operator-confirmed-single-corner-reference','single evidence not mislabeled');
testRate(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($lNormalized,$policy)===null,'no corner offer from general price approval');
$cornerPolicy=$policy;$cornerPolicy['corner_model_approved']=true;
$cornerProof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($lNormalized,$cornerPolicy);
testRate($cornerProof!==null&&$cornerProof['supplierNetCents']===51002,'separate operator corner switch');
testRate($cornerProof['verifiedCutParts']===[],'no fabricated Speedmaster CNC parts for corner');

$baseRound=testRaw('L1','W980','APL38',2250);
$baseRound['lCorner']=['side'=>'left','treatment'=>'round','parameters'=>['R1'=>'100']];
$round=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate(
    HPZ_APL_LU_Price_Readiness::normalize($baseRound)
);
testRate($round!==null&&$round['supplierNetCents']===51301,'radius commercial minimum cost model');
testRate($round['priceBasis']==='owner-review-l-corner-cost-estimate','radius is NOT a supplier EK');
$baseRound['lCorner']=['side'=>'both','treatment'=>'round','parameters'=>['R1'=>'100','R2'=>'100']];
$both=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate(
    HPZ_APL_LU_Price_Readiness::normalize($baseRound)
);
testRate($both['cornerNetModelCents']===6200,'both rounds with second-setup allowance');
$baseRound['lCorner']=[
    'side'=>'both','treatment'=>'chamfer_square',
    'parameters'=>['L3'=>'150','B3'=>'150','L4'=>'150','B4'=>'150']
];
$both=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate(
    HPZ_APL_LU_Price_Readiness::normalize($baseRound)
);
testRate($both['cornerNetModelCents']===6200,'both straight chamfers separately modeled');
$l4=testRaw('L4','W980','APL17.5',2500);
$l4['lCorner']=[
    'side'=>'left','treatment'=>'chamfer_continuous',
    'parameters'=>['L5'=>'150','B5'=>'150']
];
$c4=HPZ_APL_LU_Price_Readiness::normalize($l4);
testRate($c4['dimensions']['B5']===600 && $c4['lCorner']['parameters']['B5']===150,
    'L4 base B5 and corner B5 remain separate');
testRate(HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($c4)['priceBasis']
    ==='owner-review-l-corner-cost-estimate','L4 corner not falsely supplier approved');

$changedCorner=$lReference;
$changedCorner['lCorner']['parameters']['B3']='160';
$cChanged=HPZ_APL_LU_Price_Readiness::normalize($changedCorner);
testRate(HPZ_APL_LU_Price_Readiness::configurationKey($cChanged)
    !==HPZ_APL_LU_Price_Readiness::configurationKey($lNormalized),
    'corner millimeter change invalidates quote');
$changedCorner=$lReference;
$changedCorner['lCorner']['parameters']['B3']='990';
try {
    HPZ_APL_LU_Price_Readiness::normalize($changedCorner);
    testRate(false,'oversized chamfer should fail');
} catch (InvalidArgumentException $e) {
    testRate(true,'oversized chamfer rejected by shape-bound PHP limits');
}
$changedCorner=$lReference;
$changedCorner['lCorner']['parameters']['unknown']='100';
try {
    HPZ_APL_LU_Price_Readiness::normalize($changedCorner);
    testRate(false,'foreign Eckmaß accepted');
} catch (InvalidArgumentException $e) {
    testRate(true,'injected Eckmaß rejected');
}
$changedCorner=$lReference;
$changedCorner['lCorner']['parameters']=['B3'=>'150'];
try {
    HPZ_APL_LU_Price_Readiness::normalize($changedCorner);
    testRate(false,'incomplete Eckmaß accepted');
} catch (InvalidArgumentException $e) {
    testRate(true,'incomplete Eckmaß rejected');
}

echo "PASS $n L/U shape/decor/price/margin/190cm regression tests (no live sale)\n";
