<?php
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/price-preview.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Straight_Sale_Readiness.php';
require_once __DIR__.'/../HPZ_APL_WC_Cart_Bridge.php';

$count=0;
function ok($yes,string $what):void{global $count;$count++;if(!$yes)throw new RuntimeException($what);}
function rejected(callable $f,string $why):void{
  try{$f();}catch(InvalidArgumentException $e){ok(true,$why);return;}
  ok(false,$why);
}
function sample(array $overrides=[]):array{
 return array_replace_recursive([
   'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
   'product'=>'straight','geometry'=>'straight','corner'=>'square',
   'dimensions'=>['L1'=>'2000','B1'=>'600'],'material'=>'APL38','decor'=>'W980','quantity'=>1,
   'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]]
 ],$overrides);
}
$now=strtotime('2026-10-29 12:00:00 UTC');
$secret=str_repeat('x',64);
$known=[];
function proofFor(array $raw,array $override=[]):array{
 $c=HPZ_APL_Price_Preview::normalize($raw);
 return array_replace([
  'configurationKey'=>HPZ_APL_Straight_Sale_Readiness::configurationKey($c),
  'supplier'=>'speedmaster','manufacturable'=>true,'materialAndDecorAvailable'=>true,
  'supplierReference'=>'SYNTHETIC-CHECKOUT-ONLY',
  'supplierNetCents'=>24311,'maxQuantity'=>3,'checkedOn'=>'2026-10-29',
  'shippingPartLengthsMm'=>[$c['dimensions']['L1']],
  'packedWeightGrams'=>30000,
  'packageDimensionsMm'=>['length'=>$c['dimensions']['L1']+70,'width'=>$c['dimensions']['B1']+70,'height'=>110],
  'approvedShippingRateIds'=>['test-rate:1']
 ],$override);
}
function storeProof(array $raw,array $override=[]):void{
 global $known;
 $p=proofFor($raw,$override);
 $known[$p['configurationKey']]=$p;
}
function lookup($key){global $known;return $known[$key]??null;}
function checkoutContext(array $patch=[]):array{
 return array_replace([
  'country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,
  'pricesConfigured'=>true,'shippingCalculated'=>true,
  'selectedShippingRateId'=>'test-rate:1','shippingAmountCents'=>8500,
  'preDiscountGrossCents'=>100000,'actualNetLineRevenueCents'=>84034,
  'checkoutIntegrationVerified'=>true,'fulfilmentWorkflowVerified'=>true
 ],$patch);
}
$raw=sample();$key=HPZ_APL_Straight_Sale_Readiness::configurationKey(HPZ_APL_Price_Preview::normalize($raw));
rejected(function()use($raw,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::issue($raw,'lookup',$secret,$now);},'no proof cannot enter cart');
storeProof($raw);
$cart=HPZ_APL_WC_Cart_Bridge_08::issue($raw,'lookup',$secret,$now);
ok(array_keys($cart)===[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY],'one namespace only');
ok(count($cart[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY])===6,'complete signed snapshot');
ok(!isset($cart[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY]['supplierNetCents']),'no trusted costs stored in Woo session');
ok(!strstr(json_encode($cart),'24311'),'supplier price not in cart');
ok($cart[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY]['config']['quantity']===1,'saved quantity is normalized 1');
ok(!HPZ_APL_WC_Cart_Bridge_08::targets(1000080)&&!HPZ_APL_WC_Cart_Bridge_08::targets(999985),'L/U and other products unaffected');
$checked=HPZ_APL_WC_Cart_Bridge_08::inspect($cart,1,'lookup',$secret,$now);
ok($checked['quote']['unitGrossReferenceCents']===100000,'price independently recalculated from V3');
ok($checked['production']['lengthMm']===2000&&$checked['production']['depthMm']===600,'exact normalized millimetres');
ok($checked['production']['decorName']==='Platinweiß','customer decor name');
ok($checked['production']['supplierDecorCode']==='W980 ST7','manual supplier decor code');
ok($checked['proof']['packedWeightGrams']===30000,'trusted packaged weight');
ok(HPZ_APL_WC_Cart_Bridge_08::packageForWoo($checked)['packedWeightKg']==='30.000','real package converted, not product surface weight');
ok(HPZ_APL_WC_Cart_Bridge_08::priceForWoo(67000,true,'DE')==='670.00','Woo gross-price shop');
ok(HPZ_APL_WC_Cart_Bridge_08::priceForWoo(67000,false,'DE')==='563.025210','Woo net-price shop no second tax multiplication');
rejected(function(){HPZ_APL_WC_Cart_Bridge_08::priceForWoo(67000,false,'FR');},'unknown country never priced');
$good=HPZ_APL_WC_Cart_Bridge_08::checkout($cart,1,'lookup',checkoutContext(),$secret,$now);
ok($good['validForReleaseReview']===true,'all synthetic checks would pass review');
ok($good['purchasable']===false,'0.8 never opens purchase gate');
ok($good['blockers']===[],'complete synthetic evidence yields no open preflight blockers');
ok($good['totalGrossReferenceCents']===100000,'gross total passed');
$meta=new class {public $fields=[];public function add_meta_data($k,$v,$unique=false){$this->fields[$k]=$v;}};
HPZ_APL_WC_Cart_Bridge_08::writeOrderLine($meta,$good);
ok(isset($meta->fields['_hpz_apl_manufacturing_v2']),'HPOS-safe private production metadata');
ok($meta->fields['Plattenmaße']==='2000 × 600 mm','customer order dimensions');
ok($meta->fields['Dekor']==='Platinweiß','customer order display short label');
ok($meta->fields['Ecken']==='Keine · Keine','customer corner type');
ok(!isset($meta->fields['supplierNetCents'],$meta->fields['packedWeightGrams']),'order has no EK/pack private values');
$manual=HPZ_APL_WC_Cart_Bridge_08::manualSpeedmasterText($good['production']);
ok(strpos($manual,'W980 ST7')!==false&&strpos($manual,'2000 × 600 mm')!==false,'manual Speedmaster order has precise supplier code and measures');
rejected(function()use($meta,$good){$good['validForReleaseReview']=false;HPZ_APL_WC_Cart_Bridge_08::writeOrderLine($meta,$good);},'cannot create finalized item metadata without full checkout review');
$changes=[
 ['config'=>['dimensions'=>['L1'=>2500,'B1'=>600]]],
 ['unitGrossReferenceCents'=>1],
 ['configurationKey'=>str_repeat('0',64)],
 ['signature'=>str_repeat('0',64)],
 ['priceVersion'=>'old-price'],
 ['config'=>['decor'=>'F128']],
 ['config'=>['quantity'=>2]],
];
foreach($changes as $i=>$patch){
 $fake=$cart;
 $fake[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY]=array_replace_recursive($fake[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY],$patch);
 rejected(function()use($fake,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($fake,1,'lookup',$secret,$now);},'tampering '.$i);
}
rejected(function()use($cart,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($cart,1,'lookup','weak',$now);},'cannot run without server HMAC secret');
rejected(function()use($cart,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($cart,0,'lookup',$secret,$now);},'zero quantity refused');
rejected(function()use($cart,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($cart,1001,'lookup',$secret,$now);},'1001 quantity refused');
rejected(function()use($cart,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($cart,4,'lookup',$secret,$now);},'supplier quantity rechecked');
$qty2=HPZ_APL_WC_Cart_Bridge_08::checkout($cart,2,'lookup',checkoutContext([
 'preDiscountGrossCents'=>200000,'actualNetLineRevenueCents'=>168067
]),$secret,$now);
ok($qty2['validForReleaseReview']===true&&$qty2['totalGrossReferenceCents']===200000,'quantity2 proper price, 2x costs');
$discount=HPZ_APL_WC_Cart_Bridge_08::checkout($cart,2,'lookup',checkoutContext([
 'preDiscountGrossCents'=>200000,'actualNetLineRevenueCents'=>85000
]),$secret,$now);
ok(in_array('margin-below-35-after-reserve-and-discounts',$discount['blockers'],true),'coupon cannot bypass margin');
foreach([
 ['country'=>'AT'],['taxVerified'=>false],['baseTaxRateBasisPoints'=>2000],
 ['selectedShippingRateId'=>'unknown'],['shippingCalculated'=>false],
 ['preDiscountGrossCents'=>99900],['actualNetLineRevenueCents'=>0],
 ['checkoutIntegrationVerified'=>false],['fulfilmentWorkflowVerified'=>false]
] as $i=>$v) {
 $r=HPZ_APL_WC_Cart_Bridge_08::checkout($cart,1,'lookup',checkoutContext($v),$secret,$now);
 ok(!$r['validForReleaseReview']&&$r['purchasable']===false,'checkout blocker '.$i);
}
$spoof=sample(['price'=>1,'supplierNetCents'=>1,'purchasable'=>true,'approvedShippingRateIds'=>['bad']]);
$clean=HPZ_APL_WC_Cart_Bridge_08::issue($spoof,'lookup',$secret,$now);
ok($clean===$cart,'client price, EK or approval flags ignored');
$known[$key]=proofFor($raw,['checkedOn'=>'2026-09-01']);
rejected(function()use($cart,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($cart,1,'lookup',$secret,$now);},'signed snapshot invalid when supplier proof expired');
storeProof($raw);
$known[$key]=proofFor($raw,['materialAndDecorAvailable'=>false]);
rejected(function()use($cart,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($cart,1,'lookup',$secret,$now);},'signed snapshot invalid if supplier withdraws availability');
storeProof($raw);

foreach(HPZ_APL_Decor_Catalog::all() as $decorId=>$item){
 foreach(['APL17.5','APL38'] as $material){
  $s=sample(['decor'=>(string)$decorId,'material'=>$material]);
  storeProof($s);
  $one=HPZ_APL_WC_Cart_Bridge_08::issue($s,'lookup',$secret,$now);
  $c=HPZ_APL_WC_Cart_Bridge_08::inspect($one,1,'lookup',$secret,$now);
  ok($c['production']['decorId']===(string)$decorId&&$c['production']['materialCode']===$material,'16 decors x 2 thicknesses '.$decorId.'/'.$material);
  ok($c['quote']['unitGrossReferenceCents']>0,'V3 gross for all 32');
 }
}
foreach([
 ['left','round',['R1'=>'150']],
 ['right','round',['R2'=>'150']],
 ['both','round',['R1'=>'150','R2'=>'150']],
 ['left','chamfer_square',['L2'=>'150','B2'=>'150']],
 ['right','chamfer_square',['L3'=>'150','B3'=>'150']],
 ['both','chamfer_square',['L2'=>'150','B2'=>'150','L3'=>'150','B3'=>'150']],
 ['left','chamfer_continuous',['L2'=>'150','B2'=>'150']],
 ['right','chamfer_continuous',['L3'=>'150','B3'=>'150']],
 ['both','chamfer_continuous',['L2'=>'150','B2'=>'150','L3'=>'150','B3'=>'150']]
] as $i=>$variant) {
 $p=sample(['straightCorner'=>['side'=>$variant[0],'treatment'=>$variant[1],'parameters'=>$variant[2]]]);
 storeProof($p);
 $line=HPZ_APL_WC_Cart_Bridge_08::issue($p,'lookup',$secret,$now);
 $check=HPZ_APL_WC_Cart_Bridge_08::inspect($line,1,'lookup',$secret,$now);
 ok($check['quote']['unitGrossReferenceCents']===79000,'one surcharge for variant '.$i);
 ok($check['production']['cornerSide']===$variant[0],'correct side variant '.$i);
 ok(count($check['production']['cornerMeasuresMm'])===count($variant[2]),'independent corner params '.$i);
}
$split=HPZ_APL_WC_Cart_Bridge_08::issue($raw,'lookup',$secret,$now);
$known[$key]=proofFor($raw,['shippingPartLengthsMm'=>[1500,500]]);
rejected(function()use($split,$secret,$now){HPZ_APL_WC_Cart_Bridge_08::inspect($split,1,'lookup',$secret,$now);},'no phantom shorter shipping split');
echo "PASS $count PHP 0.8 cart/order contract checks (entirely dormant; checkout remains disabled)\n";
