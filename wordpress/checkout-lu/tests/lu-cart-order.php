<?php
/** Synthetic sandbox tests – never authorize a real Speedmaster order. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Cart_Bridge.php';
require_once __DIR__.'/../HPZ_APL_WC_LU_Cart_Bridge.php';

$n=0;function luCheck($ok,string $label):void{global $n;++$n;if(!$ok)throw new RuntimeException('FAIL '.$label);}
function luFails(callable $fn,string $label):void{
 try{$fn();}catch(InvalidArgumentException $error){luCheck(true,$label);return;}
 luCheck(false,$label);
}
function rawLU(string $shape='U1',int $quantity=1):array{
 $isL=$shape[0]==='L';
 $dims=$isL ? (in_array($shape,['L1','L2'],true)
  ? ['L1'=>'2000','L2'=>'1200','B1'=>'600','B2'=>'600']
  : ($shape==='L3'
   ? ['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900']
   : ['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900','B5'=>'600']))
  : ['L1'=>'2000','L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'];
 $id=$isL?1000080:1000081;
 $raw=[
  'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$id,
  'sku'=>$isL?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
  'product'=>$isL?'l':'u','geometry'=>$shape,'corner'=>'square',
  'dimensions'=>$dims,'material'=>'APL38','decor'=>'W980',
  'edge'=>'matching-1.5','quantity'=>$quantity
 ];
 if($isL)$raw['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
 return $raw;
}
function syntheticProof(array $raw,array $overrides=[]):array{
 $config=HPZ_APL_LU_Price_Readiness::normalize($raw);
 $key=HPZ_APL_LU_Price_Readiness::configurationKey($config);
 return array_replace([
  'configurationKey'=>$key,'supplier'=>'speedmaster',
  'verifiedNetPrice'=>true,'manufacturable'=>true,
  'decorAndThicknessAvailable'=>true,'cutListVerified'=>true,
  'connectorPlanVerified'=>true,'packagingAndCostsVerified'=>true,
  'supplierReference'=>'TEST-SYNTHETIC-NEVER-ORDER','supplierNetCents'=>69149,
  'maxQuantity'=>4,'checkedOn'=>'2026-11-05',
  'verifiedCutParts'=>[['partId'=>'test-1','lengthMm'=>2000,'widthMm'=>600]],
  'verifiedShippingPartLengthsMm'=>[2000],
  'verifiedPackages'=>[['lengthMm'=>2070,'widthMm'=>660,'heightMm'=>100,'weightGrams'=>32000]],
  'packagingNetCents'=>0,'outboundNetCostCents'=>0,'paymentAndHandlingNetCents'=>0,
  'packagingCostSource'=>'synthetic-test-only',
  'shippingCostSource'=>'synthetic-test-only',
  'approvedShippingRateIds'=>['test_rate:1']
 ],$overrides);
}
function testCheckout(int $qty=1,array $overrides=[]):array{
 return array_replace([
  'country'=>'DE','pricesConfigured'=>true,'taxVerified'=>true,
  'baseTaxRateBasisPoints'=>1900,'shippingCalculated'=>true,
  'selectedShippingRateId'=>'test_rate:1','shippingAmountCents'=>2000,
  'preDiscountGrossCents'=>164000*$qty,'actualNetLineRevenueCents'=>137815*$qty,
  'checkoutIntegrationVerified'=>true,'manualSupplierHandoffVerified'=>true,
  'operatorSaleApproval'=>true
 ],$overrides);
}
class DemoLUOrderItem{
 public $meta=[];
 public function add_meta_data($key,$value,$unique=false){$this->meta[$key]=$value;}
}
$secret=str_repeat('x',64);
$now=strtotime('2026-11-05 12:00:00 UTC');
luCheck(!HPZ_APL_WC_LU_Cart_Bridge::targets(1000083),'never touch straight');
luCheck(HPZ_APL_WC_LU_Cart_Bridge::targets(1000080),'L product ID');
luCheck(HPZ_APL_WC_LU_Cart_Bridge::targets(1000081),'U product ID');

foreach(['L1','L2','L3','L4','U1','U2','U3','U4'] as $shape){
 $raw=rawLU($shape);
 $proof=syntheticProof($raw);
 $key=$proof['configurationKey'];
 $lookup=function($k)use($key,$proof){return $k===$key?$proof:null;};
 $cart=HPZ_APL_WC_LU_Cart_Bridge::issue($raw,$lookup,$secret,$now);
 luCheck(array_keys($cart)===[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY],$shape.' separate cart key');
 luCheck(strpos(json_encode($cart),'supplierNetCents')===false,$shape.' no EK in signed cart');
 $checked=HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,1,$lookup,$secret,$now);
 luCheck($checked['quote']['unitGrossReferenceCents']===164000,$shape.' V3 target gross');
 $result=HPZ_APL_WC_LU_Cart_Bridge::checkout($cart,1,$lookup,testCheckout(),$secret,$now);
 luCheck($result['validForReleaseReview']===true,$shape.' synthetic checkout gate');
 luCheck($result['purchasable']===false,$shape.' preflight never authorizes checkout');
 luCheck($result['production']['form']===$shape,$shape.' exact production form');
 $display=HPZ_APL_WC_LU_Cart_Bridge::displayFields($result['production']);
 luCheck($display['Arbeitsplattenform']===$shape,$shape.' visible form');
 luCheck($display['L1']==='2000 mm',$shape.' dimensions in mm');
 luCheck($display['Dekor']==='Platinweiß (W980 ST7)',$shape.' supplier decor');
 if($shape==='L4'){
  luCheck($display['B5']==='600 mm','L4 B5 BASE size preserved');
  luCheck(!isset($display['corner-B5']),'corner-B5 not invented');
 }
 if($shape==='U2')luCheck($display['Stoßvariante (Schema)']==='Links längs · Rechts längs','U2 seam orientation');
 $order=new DemoLUOrderItem();
 HPZ_APL_WC_LU_Cart_Bridge::writeOrderLine($order,$result);
 luCheck(isset($order->meta['_hpz_apl_manufacturing_v2'])
    && $order->meta['_hpz_apl_manufacturing_v2']['form']===$shape,$shape.' HPOS order record');
 luCheck(isset($order->meta['_hpz_apl_supplier_parts']),$shape.' verified cut list preserved privately');
 luCheck($order->meta['_hpz_apl_supplier_reference']==='TEST-SYNTHETIC-NEVER-ORDER',$shape.' supplier reference');
 luCheck(strpos(json_encode($order->meta),'supplierNetCents')===false,$shape.' no supplier EK on Woo order');
 $manual=HPZ_APL_WC_LU_Cart_Bridge::manualSpeedmasterText($result);
 luCheck(strpos($manual,'Menge: 1')!==false&&strpos($manual,'SPEEDMASTER – MANUELLE')!==false,$shape.' manual handoff');
}

$raw=rawLU('U1');
$proof=syntheticProof($raw);$key=$proof['configurationKey'];
$lookup=function($k)use($key,$proof){return $k===$key?$proof:null;};
$cart=HPZ_APL_WC_LU_Cart_Bridge::issue($raw,$lookup,$secret,$now);
$two=HPZ_APL_WC_LU_Cart_Bridge::checkout($cart,2,$lookup,testCheckout(2),$secret,$now);
luCheck($two['validForReleaseReview']&&$two['production']['quantity']===2,'Woo qty 2 revalidated');
luFails(function()use($cart,$lookup,$secret,$now){
 HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,5,$lookup,$secret,$now);
},'qty above supplier maximum rejected');
luFails(function()use($cart,$lookup,$secret,$now){
 $cart[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['config']['dimensions']['L1']=1;
 HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,1,$lookup,$secret,$now);
},'changed dimensions invalidate HMAC');
luFails(function()use($cart,$lookup,$secret,$now){
 $cart[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['unitGrossReferenceCents']=100;
 HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,1,$lookup,$secret,$now);
},'changed price invalidate HMAC');
luFails(function()use($cart,$lookup,$secret,$now){
 HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,1,$lookup,str_repeat('z',64),$now);
},'other WP session secret invalidates snapshot');
luFails(function()use($raw,$secret,$now){
 HPZ_APL_WC_LU_Cart_Bridge::issue($raw,function(){return null;},$secret,$now);
},'no supplier price => no signed cart item');
luFails(function()use($raw,$proof,$key,$secret,$now){
 $r=$proof;$r['supplierNetCents']+=1000;
 $lookup=function($k)use($r,$key){return $k===$key?$r:null;};
 $cart=HPZ_APL_WC_LU_Cart_Bridge::issue($raw,function($k)use($proof,$key){return $k===$key?$proof:null;},$secret,$now);
 HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,1,$lookup,$secret,$now);
},'supplier EK change makes old quote invalid');
$denied=HPZ_APL_WC_LU_Cart_Bridge::checkout($cart,1,$lookup,testCheckout(1,['actualNetLineRevenueCents'=>100000]),$secret,$now);
luCheck(!$denied['validForReleaseReview'],'coupon below 35% floor blocks');
$denied=HPZ_APL_WC_LU_Cart_Bridge::checkout($cart,1,$lookup,testCheckout(1,['selectedShippingRateId'=>'unknown']),$secret,$now);
luCheck(!$denied['validForReleaseReview'],'unapproved shipping method blocks');
$denied=HPZ_APL_WC_LU_Cart_Bridge::checkout($cart,1,$lookup,testCheckout(1,['country'=>'CH']),$secret,$now);
luCheck(!$denied['validForReleaseReview'],'unverified foreign VAT blocks');
luFails(function()use($raw,$lookup,$secret,$now){
 $bad=$raw;$bad['sku']='HPZ-APL-GERADE-2026';
 HPZ_APL_WC_LU_Cart_Bridge::issue($bad,$lookup,$secret,$now);
},'SKU mismatch never cross-family');
$mix=rawLU('U2');luFails(function()use($mix,$lookup,$secret,$now){
 HPZ_APL_WC_LU_Cart_Bridge::issue($mix,$lookup,$secret,$now);
},'U1 supplier proof cannot be reused for U2');
luCheck(HPZ_APL_WC_LU_Cart_Bridge::priceForWoo(164000,false,'DE')==='1378.151261','use existing straight Woo VAT adapter');
luCheck(HPZ_APL_WC_LU_Cart_Bridge::priceForWoo(164000,true,'DE')==='1640.00','Woo tax-included store reference');
luFails(function(){HPZ_APL_WC_LU_Cart_Bridge::priceForWoo(164000,false,'AT');},'foreign checkout blocked');
// L corner parameters survive signed cart, Woo checkout and manual supplier
// handoff; editing one corner mm or using an unverified clone MUST fail.
$cornerRaw=rawLU('L1');
$cornerRaw['lCorner']=[
  'side'=>'left','treatment'=>'chamfer_continuous',
  'parameters'=>['L3'=>'150','B3'=>'150'],
];
$cornerProof=syntheticProof($cornerRaw);
$cornerKey=$cornerProof['configurationKey'];
$cornerLookup=fn($key)=>$key===$cornerKey?$cornerProof:null;
$cornerCart=HPZ_APL_WC_LU_Cart_Bridge::issue($cornerRaw,$cornerLookup,$secret,$now);
$cornerChecked=HPZ_APL_WC_LU_Cart_Bridge::inspect($cornerCart,1,$cornerLookup,$secret,$now);
luCheck(($cornerChecked['production']['lCorner']['parameters']['L3']??null)===150,
    'signed L corner machining preserved in production');
$cornerResult=HPZ_APL_WC_LU_Cart_Bridge::checkout(
    $cornerCart,1,$cornerLookup,testCheckout(),$secret,$now
);
luCheck($cornerResult['validForReleaseReview']===true,'synthetic corner checkout preflight');
$cornerFields=HPZ_APL_WC_LU_Cart_Bridge::displayFields($cornerResult['production']);
luCheck($cornerFields['Eckbearbeitung']==='Links · Durchlaufende Abschrägung',
    'manual order corner treatment explicit');
luCheck($cornerFields['Eckmaß L3']==='150 mm'&&$cornerFields['Eckmaß B3']==='150 mm',
    'manual order preserves both chamfer dimensions');
$order=new DemoLUOrderItem();
HPZ_APL_WC_LU_Cart_Bridge::writeOrderLine($order,$cornerResult);
luCheck($order->meta['_hpz_apl_manufacturing_v2']['lCorner']['parameters']['B3']===150,
    'Woo manufacturing metadata keeps L corner exact');
$manual=HPZ_APL_WC_LU_Cart_Bridge::manualSpeedmasterText($cornerResult);
luCheck(strpos($manual,'Eckmaß B3: 150 mm')!==false,'supplier manual text includes corner offset');
luFails(function() use($cornerCart,$cornerLookup,$secret,$now) {
    $tampered=$cornerCart;
    $tampered[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['config']['lCorner']['parameters']['L3']=160;
    HPZ_APL_WC_LU_Cart_Bridge::inspect($tampered,1,$cornerLookup,$secret,$now);
},'corner edit invalidates HMAC signature');
luFails(function() use($cornerCart,$lookup,$secret,$now) {
    HPZ_APL_WC_LU_Cart_Bridge::inspect($cornerCart,1,$lookup,$secret,$now);
},'unmachined existing supplier proof must not price machined corner');
$cornerRaw=rawLU('L4');
$cornerRaw['lCorner']=[
    'side'=>'left','treatment'=>'chamfer_square',
    'parameters'=>['L5'=>'150','B5'=>'150'],
];
$cornerProof=syntheticProof($cornerRaw);
$cornerKey=$cornerProof['configurationKey'];
$cornerLookup=fn($key)=>$key===$cornerKey?$cornerProof:null;
$cornerCart=HPZ_APL_WC_LU_Cart_Bridge::issue($cornerRaw,$cornerLookup,$secret,$now);
$checked=HPZ_APL_WC_LU_Cart_Bridge::inspect($cornerCart,1,$cornerLookup,$secret,$now);
$fields=HPZ_APL_WC_LU_Cart_Bridge::displayFields($checked['production']);
luCheck($fields['B5']==='600 mm','L4 base B5 remains unchanged');
luCheck($fields['Eckmaß B5']==='150 mm','L4 independent corner B5 in Woo order');


// U inner-foot corners also require an EXACT signed configuration key. The
// manufacturing text carries R1/R2 or L4/B4/L5/B5 independently of U seams.
// Test proof is synthetic ONLY: does not authorize these U offers in Woo.
$uEdited=rawLU('U3');
$uEdited['uCorner']=['side'=>'both','treatment'=>'chamfer_square',
    'parameters'=>['L4'=>'150','B4'=>'150','L5'=>'150','B5'=>'150']];
$uProof=syntheticProof($uEdited);
$uKey=$uProof['configurationKey'];$uLookup=fn($key)=>$key===$uKey?$uProof:null;
$uCart=HPZ_APL_WC_LU_Cart_Bridge::issue($uEdited,$uLookup,$secret,$now);
$uChecked=HPZ_APL_WC_LU_Cart_Bridge::inspect($uCart,1,$uLookup,$secret,$now);
luCheck(($uChecked['production']['uCorner']['side']??null)==='both',
    'signed U corner side preserved in production');
$uFields=HPZ_APL_WC_LU_Cart_Bridge::displayFields($uChecked['production']);
luCheck($uFields['Eckbearbeitung']==='Beidseitig · Eckige Abschrägung',
    'U manual manufacturing text includes both inner feet');
luCheck($uFields['Eckmaß L4']==='150 mm'&&$uFields['Eckmaß B4']==='150 mm'
    &&$uFields['Eckmaß L5']==='150 mm'&&$uFields['Eckmaß B5']==='150 mm',
    'all four U machining dimensions preserved');
luCheck($uFields['Stoßvariante (Schema)']==='Links längs · Rechts quer',
    'U3 seam variant remains independent from its corners');
$uOrder=new DemoLUOrderItem();$uCheckout=HPZ_APL_WC_LU_Cart_Bridge::checkout(
    $uCart,1,$uLookup,testCheckout(),$secret,$now);
HPZ_APL_WC_LU_Cart_Bridge::writeOrderLine($uOrder,$uCheckout);
luCheck(($uOrder->meta['_hpz_apl_manufacturing_v2']['uCorner']['parameters']['B5']??null)===150,
    'U inner corner mm survive the HPOS item record');
luFails(function()use($uCart,$uLookup,$secret,$now){
    $wrong=$uCart;
    $wrong[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['config']['uCorner']['parameters']['B4']=160;
    HPZ_APL_WC_LU_Cart_Bridge::inspect($wrong,1,$uLookup,$secret,$now);
},'tampering with U corner dimension invalidates HMAC');
$uBase=rawLU('U3');$uBaseProof=syntheticProof($uBase);
$uBaseKey=$uBaseProof['configurationKey'];
$uBaseLookup=fn($k)=>$k===$uBaseKey?$uBaseProof:null;
luFails(function()use($uCart,$uBaseLookup,$secret,$now){
    HPZ_APL_WC_LU_Cart_Bridge::inspect($uCart,1,$uBaseLookup,$secret,$now);
},'U basic supplier proof never reused for special inner-corner machining');

echo "PASS $n synthetic L/U cart/order bridge tests (no live sale)\n";
