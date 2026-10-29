<?php
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/price-preview.php';
require_once __DIR__.'/../HPZ_APL_Straight_Sale_Readiness.php';

$count=0;
function ck($ok,string $name):void{global $count;++$count;if(!$ok)throw new RuntimeException($name);}
function raw(array $overrides=[]):array{
  return array_replace_recursive([
    'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
    'product'=>'straight','geometry'=>'straight','corner'=>'square',
    'dimensions'=>['L1'=>'2000','B1'=>'600'],'material'=>'APL38','decor'=>'W980','quantity'=>1,
    'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]]
  ],$overrides);
}
function checkContext(array $extra=[]):array{
  return array_replace([
    'country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,'pricesConfigured'=>true,
    'shippingCalculated'=>true,'selectedShippingRateId'=>'test_rate:1','shippingAmountCents'=>1999,
    'preDiscountGrossCents'=>67000,'actualNetLineRevenueCents'=>56303,
    'checkoutIntegrationVerified'=>true,'fulfilmentWorkflowVerified'=>true,
  ],$extra);
}
function verifiedProof(array $config,array $override=[]):array{
  $c=HPZ_APL_Price_Preview::normalize($config);
  return array_replace([
    'configurationKey'=>HPZ_APL_Straight_Sale_Readiness::configurationKey($c),
    'supplier'=>'speedmaster','manufacturable'=>true,'materialAndDecorAvailable'=>true,
    'supplierReference'=>'SYNTHETIC-TEST-ONLY',
    'supplierNetCents'=>24311,'maxQuantity'=>3,'checkedOn'=>'2026-10-29',
    'shippingPartLengthsMm'=>[2000],
    'packedWeightGrams'=>30000, // Synthetic input; NOT a verified customer shipping weight.
    'packageDimensionsMm'=>['length'=>2070,'width'=>670,'height'=>110],
    'approvedShippingRateIds'=>['test_rate:1'],
  ],$override);
}
$raw=raw();
$key=HPZ_APL_Straight_Sale_Readiness::configurationKey(HPZ_APL_Price_Preview::normalize($raw));
$absent=HPZ_APL_Straight_Sale_Readiness::review($raw,[],[],strtotime('2026-10-29 12:00:00 UTC'));
ck(!$absent['purchasable']&&!$absent['preflightComplete'],'no proof never releases');
ck(in_array('supplier-proof-missing-or-expired',$absent['blockers'],true),'missing supplier evidence');
ck(in_array('weight-and-customer-shipping-unverified',$absent['blockers'],true),'missing shipping proof');
ck(in_array('woocommerce-tax-context-unverified',$absent['blockers'],true),'missing real tax');
ck(in_array('woocommerce-checkout-integration-not-verified',$absent['blockers'],true),'missing checkout verification');
ck($absent['unitGrossReferenceCents']===67000,'V3 quote reused unchanged');
ck(strpos(json_encode($absent),'supplierNetCents')===false,'no private cost in public result');
$proof=verifiedProof($raw);
$contexts=checkContext();
$now=strtotime('2026-10-29 12:00:00 UTC');
$all=HPZ_APL_Straight_Sale_Readiness::review($raw,[$key=>$proof],$contexts,$now);
ck($all['preflightComplete']===true,'complete synthetic review fixture');
ck($all['status']==='manual-release-review-ready','not a checkout-ready state');
ck($all['purchasable']===false,'even synthetic complete evidence cannot open cart');
ck($all['blockers']===[],'synthetic fulfilled blockers empty');
ck($all['production']['lengthMm']===2000&&$all['production']['depthMm']===600,'exact mm order data');
ck($all['production']['supplierDecorCode']==='W980 ST7','trusted supplier code');
ck($all['production']['decorName']==='Platinweiß','customer label');
ck(!isset($all['production']['supplierNetCents'],$all['production']['packedWeightGrams']),'production data omit costs and freight');
$two=raw(['quantity'=>2]);
ck(HPZ_APL_Straight_Sale_Readiness::configurationKey(HPZ_APL_Price_Preview::normalize($two))===$key,'quantity independent config key');
$twoGood=HPZ_APL_Straight_Sale_Readiness::review($two,[$key=>$proof],checkContext([
 'preDiscountGrossCents'=>134000,'actualNetLineRevenueCents'=>112606
]),$now);
ck($twoGood['preflightComplete']===true,'quantities multiply supplier and inbound properly');
$cheap=HPZ_APL_Straight_Sale_Readiness::review($two,[$key=>$proof],checkContext([
 'preDiscountGrossCents'=>134000,'actualNetLineRevenueCents'=>85000
]),$now);
ck(in_array('margin-below-35-after-reserve-and-discounts',$cheap['blockers'],true),'discount destroys margin');
$fraud=raw(['supplierNetCents'=>1,'supplierApproved'=>true,'price'=>1,'purchasable'=>true]);
$fraudCase=HPZ_APL_Straight_Sale_Readiness::review($fraud,[],checkContext(),$now);
ck(in_array('supplier-proof-missing-or-expired',$fraudCase['blockers'],true),'cannot approve via browser JSON');
$other=raw(['dimensions'=>['L1'=>'2500','B1'=>'600']]);
$otherReview=HPZ_APL_Straight_Sale_Readiness::review($other,[$key=>$proof],checkContext(),$now);
ck(in_array('supplier-proof-missing-or-expired',$otherReview['blockers'],true),'proof specific to exact geometry');
foreach ([
 ['supplier'=>'other'],['manufacturable'=>false],['materialAndDecorAvailable'=>false],
 ['supplierReference'=>''],['supplierNetCents'=>0],['checkedOn'=>'2026-09-01'],
 ['checkedOn'=>'2999-01-01'],['checkedOn'=>'2026-02-30'],['maxQuantity'=>0],
 ['shippingPartLengthsMm'=>[]],['shippingPartLengthsMm'=>[1800]],
 ['shippingPartLengthsMm'=>[2000,2000]],['packedWeightGrams'=>0],
 ['packageDimensionsMm'=>['length'=>1999,'width'=>670,'height'=>110]],
 ['packageDimensionsMm'=>['length'=>2070,'width'=>599,'height'=>110]],
 ['approvedShippingRateIds'=>[]]
] as $idx=>$patch) {
  $bad=HPZ_APL_Straight_Sale_Readiness::review($raw,[$key=>verifiedProof($raw,$patch)],$contexts,$now);
  ck(!$bad['preflightComplete']&&in_array('supplier-proof-missing-or-expired',$bad['blockers'],true),'bad evidence '.$idx);
}
foreach ([
 ['country'=>'CH'],['country'=>'AT'],['taxVerified'=>false],
 ['baseTaxRateBasisPoints'=>2000],['pricesConfigured'=>false],
 ['shippingCalculated'=>false],['selectedShippingRateId'=>'other_rate:99'],
 ['shippingAmountCents'=>-1],['preDiscountGrossCents'=>1],
 ['actualNetLineRevenueCents'=>0],['actualNetLineRevenueCents'=>90000],
 ['checkoutIntegrationVerified'=>false],['fulfilmentWorkflowVerified'=>false],
] as $idx=>$patch) {
  $blocked=HPZ_APL_Straight_Sale_Readiness::review($raw,[$key=>$proof],checkContext($patch),$now);
  ck(!$blocked['preflightComplete']&&!$blocked['purchasable'],'no WC bypass '.$idx);
}
$badQty=HPZ_APL_Straight_Sale_Readiness::review(raw(['quantity'=>4]),[$key=>$proof],checkContext([
  'preDiscountGrossCents'=>268000,'actualNetLineRevenueCents'=>225212
]),$now);
ck(in_array('supplier-quantity-not-confirmed',$badQty['blockers'],true),'supplier stock not guessed');
$round=raw(['straightCorner'=>['side'=>'left','treatment'=>'round','parameters'=>['R1'=>'150']]]);
$roundKey=HPZ_APL_Straight_Sale_Readiness::configurationKey(HPZ_APL_Price_Preview::normalize($round));
ck($roundKey!==$key,'different corner needs separate evidence');
$chamfer=raw(['straightCorner'=>['side'=>'left','treatment'=>'chamfer_square','parameters'=>['L2'=>'150','B2'=>'150']]]);
$chamferKey=HPZ_APL_Straight_Sale_Readiness::configurationKey(HPZ_APL_Price_Preview::normalize($chamfer));
ck($chamferKey!==$roundKey,'round and chamfer are not interchangeable');
$allDecors=HPZ_APL_Decor_Catalog::all();
foreach($allDecors as $id=>$item){
  $sample=raw(['decor'=>(string)$id]);
  $out=HPZ_APL_Straight_Sale_Readiness::review($sample,[],[], $now);
  ck(count($out['blockers'])>0 && !$out['purchasable'], '16 decors not auto approved '.$id);
}
$ref=[];
foreach(['APL17.5','APL38'] as $mat) {
  $sample=raw(['material'=>$mat]);
  $out=HPZ_APL_Straight_Sale_Readiness::review($sample,[],[],$now);
  ck($out['unitGrossReferenceCents']===($mat==='APL38'?67000:45000),'two unchanged V3 baselines');
}
foreach ([
 ['productId'=>1000080],['sku'=>'wrong'],['product'=>'l'],['geometry'=>'L1'],
 ['decor'=>'INVALID'],['material'=>'APL99'],['dimensions'=>['L1'=>'999','B1'=>'600']]
] as $patch) {
  try{HPZ_APL_Straight_Sale_Readiness::review(raw($patch));ck(false,'reject invalid input');}
  catch(InvalidArgumentException $e){ck(true,'invalid input rejected');}
}
echo "PASS $count sale-readiness checks (all synthetic proofs clearly test-only; live shop remains blocked)\n";
