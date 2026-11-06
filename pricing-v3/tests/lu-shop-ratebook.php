<?php
/** Offline operator-price-window regression. No WordPress release or purchase. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';

$n=0;
function testRate(bool $okay,string $case):void {
    global $n; ++$n;
    if (!$okay) throw new RuntimeException('FAILED '.$case);
}
function testRaw(string $shape,string $decor,string $material,int $l1):array {
    $isL=$shape[0]==='L';
    $dims=$isL
        ? ['L1'=>(string)$l1,'L2'=>'1200','B1'=>'600','B2'=>'600']
        : ['L1'=>(string)$l1,'L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'];
    $c=[
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$isL?1000080:1000081,
        'product'=>$isL?'l':'u','geometry'=>$shape,'corner'=>'square',
        'dimensions'=>$dims,'material'=>$material,'decor'=>$decor,
        'edge'=>'matching-1.5','quantity'=>1,
    ];
    if($isL)$c['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
    return $c;
}
$anchors=[
    ['L1','W980','APL17.5',30767,34241],
    ['L1','W980','APL38',46445,51156],
    ['L1','H1145','APL17.5',31153,34693],
    ['L1','H1145','APL38',46872,51649],
    ['U1','W980','APL17.5',45929,49403],
    ['U1','W980','APL38',69149,73859],
    ['U1','H1145','APL17.5',46434,49974],
    ['U1','H1145','APL38',69655,74432],
];
foreach ($anchors as [$shape,$decor,$material,$min,$max]) {
    foreach ([[2000,$min],[2500,$max]] as [$length,$expected]) {
        $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw($shape,$decor,$material,$length));
        $p=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
        testRate($p!==null && $p['supplierNetCents']===$expected,"anchor $shape/$decor/$material/$length");
        testRate($p['priceBasis']==='owner-confirmed-net-anchor','endpoint source');
    }
    $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw($shape,$decor,$material,2250));
    $p=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
    testRate($p!==null && $p['supplierNetCents']===$min+intdiv(($max-$min)*250+499,500),'midpoint interpolated');
    testRate($p['priceBasis']==='bounded-interpolated-net-candidate','interpolation source');
}
foreach ([1999,2501] as $length) {
    $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw('L1','W980','APL38',$length));
    testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($c)===null,'no extrapolation');
}
foreach ([
    ['L2','W980','APL38'],['U2','H1145','APL17.5'],
    ['L1','W980','APL38']
] as [$shape,$decor,$material]) {
    $c=HPZ_APL_LU_Price_Readiness::normalize(testRaw($shape,$decor,$material,2500));
    if($shape==='L1')$c['dimensions']['B1']=601;
    testRate(HPZ_APL_LU_Shop_Ratebook_12::candidate($c)===null,'unreleased shape or changed width');
}
$c=['dimensions'=>['L1'=>1899,'L2'=>1200]];
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===1000,'1899mm no heavy tier');
$c['dimensions']['L1']=1900;
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===6000,'1900mm surcharge once');
$c['dimensions']=['L1'=>1600,'L2'=>2000,'L3'=>2100];
testRate(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c)===6000,'two long L arms only once');
$raw=testRaw('U1','H1145','APL38',2000);
$c=HPZ_APL_LU_Price_Readiness::normalize($raw);
$policy=[
    'model_price_approved'=>true,'other_cost_net_cents'=>0,
    'max_quantity'=>2,'price_approved_on'=>'2026-11-06',
    'approved_shipping_rate_ids'=>['test_rate:1'],
];
testRate(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,[])===null,'no implicit approval');
$proof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$policy);
testRate(is_array($proof)&&$proof['supplierNetCents']===69655,'owner-approved H1145 proof');
testRate($proof['verifiedPackages']===[] && $proof['verifiedCutParts']===[],'no fabricated pack or cut list');
$key=HPZ_APL_LU_Price_Readiness::configurationKey($c);
$ctx=[
    'country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,
    'pricesConfigured'=>true,'shippingCalculated'=>true,
    'selectedShippingRateId'=>'test_rate:1','shippingAmountCents'=>1000,
    'checkoutIntegrationVerified'=>true,'manualSupplierHandoffVerified'=>true,
    'operatorSaleApproval'=>true,
];
$gross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69655,6000,0);
$ctx['preDiscountGrossCents']=$gross;
$ctx['actualNetLineRevenueCents']=(int)round($gross/1.19);
$good=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$ctx,strtotime('2026-11-06 12:00:00 UTC'));
testRate($good['preflightComplete']===true,'no required cut list after owner approval');
testRate($good['unitGrossReferenceCents']===$gross,'same V3 margin reserve and VAT');
testRate($good['purchasable']===false,'offline review cannot publish');
$bad=$ctx;$bad['actualNetLineRevenueCents']=100000;
testRate(!HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$bad,strtotime('2026-11-06 12:00:00 UTC'))['preflightComplete'],'35 percent coupon floor enforced');
$bad=$ctx;$bad['selectedShippingRateId']='wrong:1';
testRate(!HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$proof],$bad,strtotime('2026-11-06 12:00:00 UTC'))['preflightComplete'],'Woo shipping rate still checked');
echo "PASS $n bounded L/U operator-pricing and 190cm shipping tests (no live release)\n";
