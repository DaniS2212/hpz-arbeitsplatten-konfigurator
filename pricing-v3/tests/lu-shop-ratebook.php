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
            testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===6000,'190cm applies on configured arms');
            foreach($decors as $decor){
                $copy=$c;$copy['decor']=$decor;
                $q=HPZ_APL_LU_Shop_Ratebook_12::candidate($copy);
                testRate(is_array($q)&&$q['supplierNetCents']>0,"all 16 decors / $shape / $material / $length / $decor");
                testRate($q['supplierNetCents']>=$expect,'decor cannot undercut W980');
                $price=HPZ_APL_Price_V3::targetGrossForVerifiedCosts($q['supplierNetCents'],6000,0);
                testRate($price%1000===0 && $price>0,'common V3 margin and rounding');
                if($decor!=='W980'&&$decor!=='H1145'){
                    testRate($q['priceBasis']==='owner-review-commercial-cost-estimate','decor estimate not mislabeled as verified');
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
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===1000,'1899mm no heavy surcharge');
$c['dimensions']['L1']=1900;
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===6000,'1900mm threshold exact');
$c['dimensions']=['L1'=>1600,'L2'=>2000,'L3'=>2100];
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===6000,'multiple arms surcharge only once');

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
$gross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69655,6000,0);
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
testRate(!HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$discount,$now)['preflightComplete'],'35 percent floor');
$bad=$ctx;$bad['selectedShippingRateId']='wrong';
testRate(!HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$bad,$now)['preflightComplete'],'Woo shipping rate check');
echo "PASS $n L/U shape/decor/price/margin/190cm regression tests (no live sale)\n";
