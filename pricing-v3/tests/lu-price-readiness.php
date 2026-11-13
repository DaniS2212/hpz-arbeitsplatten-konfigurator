<?php
/** Strictly SYNTHETIC test records. No supplier or sales approval. */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';

$n=0;
function must(bool $ok, string $why): void {
    global $n; $n++; if (!$ok) throw new RuntimeException($why);
}
function rawU(string $shape='U1', array $change=[]): array {
    return array_replace_recursive([
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000081,
        'product'=>'u','geometry'=>$shape,'corner'=>'square','edge'=>'matching-1.5',
        'dimensions'=>['L1'=>'2000','L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'],
        'material'=>'APL38','decor'=>'W980','quantity'=>1,
    ],$change);
}
function rawL(string $shape='L1', array $change=[]): array {
    $dim=in_array($shape,['L1','L2'],true)
        ? ['L1'=>'2000','L2'=>'1200','B1'=>'600','B2'=>'600']
        : ($shape==='L3'
          ? ['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900']
          : ['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900','B5'=>'600']);
    return array_replace_recursive([
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000080,
        'product'=>'l','geometry'=>$shape,'corner'=>'square','edge'=>'matching-1.5',
        'lCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
        'dimensions'=>$dim,'material'=>'APL38','decor'=>'W980','quantity'=>1,
    ],$change);
}
function proof(array $raw, array $extra=[]): array {
    $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
    return array_replace([
        'configurationKey'=>HPZ_APL_LU_Price_Readiness::configurationKey($c),
        'supplier'=>'speedmaster','verifiedNetPrice'=>true,'manufacturable'=>true,
        'decorAndThicknessAvailable'=>true,'cutListVerified'=>true,
        'connectorPlanVerified'=>true,'packagingAndCostsVerified'=>true,
        'supplierReference'=>'SYNTHETIC-NOT-REAL-EK','supplierNetCents'=>69149,
        'maxQuantity'=>3,'checkedOn'=>'2026-11-05',
        // Separate physical proof keys are hypothetical and CANNOT be
        // generated from the UI's 3 drawn regions.
        'verifiedCutParts'=>[['partId'=>'test-piece','lengthMm'=>2000,'widthMm'=>600]],
        'verifiedShippingPartLengthsMm'=>[2000],
        'verifiedPackages'=>[['lengthMm'=>2070,'widthMm'=>670,'heightMm'=>110,'weightGrams'=>30000]],
        'packagingNetCents'=>0,'outboundNetCostCents'=>0,'paymentAndHandlingNetCents'=>0,
        'packagingCostSource'=>'SYNTHETIC-TEST-NO-COST','shippingCostSource'=>'SYNTHETIC-TEST-NO-COST',
        'approvedShippingRateIds'=>['test_rate:1'],
    ],$extra);
}
function checkout(array $extra=[]): array {
    return array_replace([
        'country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,
        'pricesConfigured'=>true,'shippingCalculated'=>true,
        'selectedShippingRateId'=>'test_rate:1','shippingAmountCents'=>1999,
        'preDiscountGrossCents'=>184000,'actualNetLineRevenueCents'=>154622,
        'checkoutIntegrationVerified'=>true,'manualSupplierHandoffVerified'=>true,
        'operatorSaleApproval'=>true
    ],$extra);
}
$now=strtotime('2026-11-05 12:00:00 UTC');
$raw=rawU();
$key=HPZ_APL_LU_Price_Readiness::configurationKey(HPZ_APL_LU_Price_Readiness::normalize($raw));
$missing=HPZ_APL_LU_Price_Readiness::review($raw,[],[],$now);
must($missing['preflightComplete']===false&&!$missing['purchasable'],'No proof always blocked');
must(in_array('exact-supplier-cut-list-or-price-proof-missing',$missing['blockers'],true),'missing supplier');
must($missing['unitGrossReferenceCents']===null,'no fake prices before supplier proof');
must($missing['pricingPolicyId']===null,'unverified supplier cannot inherit operator policy');
must(!array_key_exists('supplierNetCents',$missing['production']),'no EK in production record');
$good=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>proof($raw)],checkout(),$now);
must($good['preflightComplete']===true,'complete synthetic preflight');
must($good['status']==='manual-release-review-ready','not salable status');
must($good['purchasable']===false,'even all-synthetic green cannot buy');
must($good['unitGrossReferenceCents']===184000,'U1 691.49 net, 150 inbound per worktop, 40 pct, 10 pct reserve');
must(
    $good['unitGrossReferenceCents']===HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69149,15000,0),
    'L/U preflight must call V3 shared commercial cost calculation'
);
must($good['pricingPolicyId']==='margin40-reserve10-floor35','auditable selected operator policy');
must($good['blockers']===[],'all synthetic proofs accounted for');
foreach ([100000,10000,0] as $couponNet) {
    $discounted=HPZ_APL_LU_Price_Readiness::review(
        $raw,[$key=>proof($raw)],
        checkout(['actualNetLineRevenueCents'=>$couponNet]),$now);
    must($discounted['preflightComplete']===true,
        'genuine Woo coupon net revenue '.$couponNet.' allowed below 35% margin');
}
$fakeRegularPrice=HPZ_APL_LU_Price_Readiness::review(
    $raw,[$key=>proof($raw)],
    checkout(['preDiscountGrossCents'=>160000,'actualNetLineRevenueCents'=>100000]),$now);
must(!$fakeRegularPrice['preflightComplete']
    &&in_array('woocommerce-line-price-unverified',$fakeRegularPrice['blockers'],true),
    'coupon cannot forge the original regular gross price');
must($good['production']['form']==='U1'&&$good['production']['dimensionsMm']['L3']===1800,'manual order exact data');
must($good['production']['supplierDecorCode']==='W980 ST7','real decor code');
must(strpos(json_encode($good),'supplierNetCents')===false,'no supplier costs in review output');
foreach ([
    ['verifiedNetPrice'=>false],['manufacturable'=>false],['cutListVerified'=>false],
    ['connectorPlanVerified'=>false],['packagingAndCostsVerified'=>false],
    ['supplierReference'=>''],['supplierNetCents'=>0],['maxQuantity'=>0],
    ['checkedOn'=>'2026-09-01'],['checkedOn'=>'2026-02-30'],
    ['verifiedCutParts'=>[]],['verifiedShippingPartLengthsMm'=>[]],
    ['verifiedShippingPartLengthsMm'=>[2000,1000]],
    ['verifiedPackages'=>[['lengthMm'=>1999,'widthMm'=>670,'heightMm'=>110,'weightGrams'=>30000]]],
    ['verifiedPackages'=>[['lengthMm'=>2070,'widthMm'=>670,'heightMm'=>110,'weightGrams'=>0]]],
    ['packagingNetCents'=>null],['outboundNetCostCents'=>null],
    ['paymentAndHandlingNetCents'=>null],['packagingCostSource'=>''],
    ['approvedShippingRateIds'=>[]]
] as $idx=>$bad) {
    $check=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>proof($raw,$bad)],checkout(),$now);
    must(!$check['preflightComplete']&&$check['unitGrossReferenceCents']===null,'reject proof '.$idx);
}
foreach ([
    ['country'=>'AT'],['country'=>'CH'],['taxVerified'=>false],
    ['baseTaxRateBasisPoints'=>2000],['pricesConfigured'=>false],
    ['shippingCalculated'=>false],['selectedShippingRateId'=>'wrong'],
    ['shippingAmountCents'=>-1],['preDiscountGrossCents'=>1],
    ['actualNetLineRevenueCents'=>-1],['actualNetLineRevenueCents'=>185000],
    ['checkoutIntegrationVerified'=>false],['manualSupplierHandoffVerified'=>false],
    ['operatorSaleApproval'=>false]
] as $idx=>$bad) {
    $check=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>proof($raw)],checkout($bad),$now);
    must(!$check['preflightComplete']&&!$check['purchasable'],'reject Woo context '.$idx);
}
$changed=rawU('U2');
must(HPZ_APL_LU_Price_Readiness::configurationKey(HPZ_APL_LU_Price_Readiness::normalize($changed))!==$key,'U2/U1 different key');
$invalidReused=HPZ_APL_LU_Price_Readiness::review($changed,[$key=>proof($raw)],checkout(),$now);
must(!$invalidReused['preflightComplete'],'U2 cannot reuse U1 proof');
$changed=rawU('U1',['dimensions'=>['L1'=>'2010']]);
$noMatch=HPZ_APL_LU_Price_Readiness::review($changed,[$key=>proof($raw)],checkout(),$now);
must(!$noMatch['preflightComplete'],'changed mm invalidates supplier reference');
$qty=rawU('U1',['quantity'=>2]);
must(HPZ_APL_LU_Price_Readiness::configurationKey(HPZ_APL_LU_Price_Readiness::normalize($qty))===$key,'identity quantity independent');
$two=HPZ_APL_LU_Price_Readiness::review($qty,[$key=>proof($raw)],checkout(['preDiscountGrossCents'=>368000,'actualNetLineRevenueCents'=>309244]),$now);
must($two['preflightComplete']===true&&$two['quantity']===2,'quantity costs and price multiplier');
$three=HPZ_APL_LU_Price_Readiness::review(rawU('U1',['quantity'=>4]),[$key=>proof($raw)],checkout(['preDiscountGrossCents'=>736000,'actualNetLineRevenueCents'=>618487]),$now);
must(in_array('supplier-quantity-unverified',$three['blockers'],true),'quantity ceiling');
// A malicious/mistaken 1800-mm "shipping length" must not suppress
// the 1900-mm freight surcharge when the *real package* is 2070 mm.
$understated=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>proof($raw,[
  'verifiedShippingPartLengthsMm'=>[1800]
])],checkout(),$now);
must($understated['unitGrossReferenceCents']===184000,'even alternative verified package lengths still cost 150 net inbound');
$notFitting=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>proof($raw,[
  'verifiedCutParts'=>[['partId'=>'test-piece','lengthMm'=>3000,'widthMm'=>600]]
])],checkout(),$now);
must(!$notFitting['preflightComplete'],'verified 3000-mm cut cannot fit 2070-mm package');
$shortPackage=proof($raw,[
  'verifiedCutParts'=>[['partId'=>'test-piece','lengthMm'=>1500,'widthMm'=>600]],
  'verifiedShippingPartLengthsMm'=>[1500],
  'verifiedPackages'=>[['lengthMm'=>1899,'widthMm'=>670,'heightMm'=>110,'weightGrams'=>30000]]
]);
$shortCase=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$shortPackage],checkout(),$now);
must($shortCase['unitGrossReferenceCents']===184000,'1899-mm package also costs 150 net inbound');
$thresholdPackage=proof($raw,[
  'verifiedCutParts'=>[['partId'=>'test-piece','lengthMm'=>1500,'widthMm'=>600]],
  'verifiedShippingPartLengthsMm'=>[1500],
  'verifiedPackages'=>[['lengthMm'=>1900,'widthMm'=>670,'heightMm'=>110,'weightGrams'=>30000]]
]);
$thresholdCase=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>$thresholdPackage],checkout(),$now);
must($thresholdCase['unitGrossReferenceCents']===184000,'1900-mm package uses same 150 net inbound');
$old30=HPZ_APL_LU_Price_Readiness::review($raw,[$key=>proof($raw,[
    'operatorPricingPolicy'=>'legacy30','operatorPolicyReviewed'=>false
])],checkout(),$now);
must($old30['preflightComplete']===true
    && $old30['pricingPolicyId']==='margin40-reserve10-floor35'
    && $old30['unitGrossReferenceCents']===$good['unitGrossReferenceCents'],
    'stale per-SKU 30 pct flags cannot override centrally approved 40 pct policy');
$fromClient=rawU('U1',['supplierNetCents'=>1,'approved'=>true,
    'operatorPricingPolicy'=>'legacy30','customerPrice'=>1,'proof'=>proof($raw)]);
$stillBlocked=HPZ_APL_LU_Price_Readiness::review($fromClient,[],checkout(),$now);
must(!$stillBlocked['preflightComplete'],'malicious browser supplier fields ignored');
foreach (['L1','L2','L3','L4'] as $shape) {
    $c=HPZ_APL_LU_Price_Readiness::normalize(rawL($shape));
    must($c['geometry']===$shape,'L shape recognized: '.$shape);
    $k=HPZ_APL_LU_Price_Readiness::configurationKey($c);
    must(is_string($k)&&strlen($k)===64,'L proof fingerprint '.$shape);
}
foreach (['U1','U2','U3','U4'] as $shape) {
    $c=HPZ_APL_LU_Price_Readiness::normalize(rawU($shape));
    must($c['geometry']===$shape,'U shape recognized: '.$shape);
}
foreach ([
    rawU('U1',['productId'=>1000080]),rawU('U1',['corner'=>'round']),
    rawU('U1',['edge'=>'raw']),rawU('U1',['decor'=>'NOTREAL']),
    rawU('U1',['dimensions'=>['B2'=>'1700']]),
    rawL('L3',['dimensions'=>['B2'=>'700']]),
    rawL('L4',['lCorner'=>['side'=>'left','treatment'=>'round','parameters'=>['R2'=>'100']]]),
    rawL('L1',['special'=>['size'=>'100']])
] as $idx=>$bad) {
    try {HPZ_APL_LU_Price_Readiness::normalize($bad); must(false,'reject invalid '.$idx);}
    catch (InvalidArgumentException $e) {must(true,'invalid rejected '.$idx);}
}
echo "PASS $n L/U price preflight checks; no WordPress hook or sales activation\n";
