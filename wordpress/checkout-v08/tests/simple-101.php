<?php
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/price-preview.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Straight_Sale_Readiness.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Cart_Bridge.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Dormant_Hooks.php';
$n=0;
function check($yes,$message){global $n;$n++;if(!$yes)throw new RuntimeException($message);}
function throws(callable $callback,$message){try{$callback();}catch(InvalidArgumentException $e){check(true,$message);return;}check(false,$message);}
function raw(array $override=[]):array {
 return array_replace_recursive([
  'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
  'product'=>'straight','geometry'=>'straight','corner'=>'square',
  'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
  'dimensions'=>['L1'=>'2000','B1'=>'600'],'material'=>'APL38','decor'=>'W980','quantity'=>1,
 ],$override);
}
$secret=str_repeat('s',64);
$noProof=function($key){return null;};
$c=HPZ_APL_WC_Cart_Bridge_08::issue(raw(),$noProof,$secret);
check(is_array($c['hpz_apl_v08']),'cart can issue without any Speedmaster-specific approval');
check(!array_key_exists('supplierNetCents',$c['hpz_apl_v08']),'no EK data');
$info=HPZ_APL_WC_Cart_Bridge_08::inspect($c,1,$noProof,$secret);
check($info['quote']['unitGrossReferenceCents']===67000,'V3 baseline 670 gross');
$small=HPZ_APL_WC_Cart_Bridge_08::issue(raw(['dimensions'=>['L1'=>'1200','B1'=>'600']]),$noProof,$secret);
check(HPZ_APL_WC_Cart_Bridge_08::inspect($small,1,$noProof,$secret)['quote']['unitGrossReferenceCents']===51000,'small 120x60 can be signed and priced for cart');
check($info['proof']===null,'no supplier proof');
check($info['production']['supplierDecorCode']==='W980 ST7','Speedmaster decor code preserved for manual order');
check(HPZ_APL_WC_Cart_Bridge_08::priceForWoo(67000,true,'DE')==='670.00','Woo gross');
check(HPZ_APL_WC_Cart_Bridge_08::priceForWoo(67000,false,'DE')==='563.025210','Woo net');
$ctx=[
 'country'=>'DE','pricesConfigured'=>true,'taxVerified'=>true,
 'shippingCalculated'=>true,'selectedShippingRateId'=>'shop_rate:1',
 'shippingAmountCents'=>580,
 'preDiscountGrossCents'=>67000,'actualNetLineRevenueCents'=>56303
];
$r=HPZ_APL_WC_Cart_Bridge_08::checkout($c,1,$noProof,$ctx,$secret);
check($r['validForReleaseReview']===true,'valid DE cart with existing Woo method and no supplier approval');
check($r['purchasable']===false,'review never opens public sale automatically');
check($r['blockers']===[],'no additional 190cm freight gate');
$freeWithCoupon=HPZ_APL_WC_Cart_Bridge_08::checkout(
    $c,1,$noProof,array_replace($ctx,['actualNetLineRevenueCents'=>0]),$secret);
check($freeWithCoupon['validForReleaseReview']===true,
    'legitimate 100% Woo coupon permitted with original signed gross');
$negative=HPZ_APL_WC_Cart_Bridge_08::checkout(
    $c,1,$noProof,array_replace($ctx,['actualNetLineRevenueCents'=>-1]),$secret);
check(!$negative['validForReleaseReview'],'negative line amount blocked');
$missingShipping=HPZ_APL_WC_Cart_Bridge_08::checkout(
 $c,1,$noProof,array_replace($ctx,['shippingCalculated'=>false]),$secret);
check(!$missingShipping['validForReleaseReview']
 &&in_array('woo-customer-shipping-unverified',$missingShipping['blockers'],true),
 'missing real Woo shipping calculation rejects checkout');
$unselectedShipping=HPZ_APL_WC_Cart_Bridge_08::checkout(
 $c,1,$noProof,array_replace($ctx,['selectedShippingRateId'=>'']),$secret);
check(in_array('woo-customer-shipping-unverified',$unselectedShipping['blockers'],true),
 'empty selected Woo rate rejected');
$missingAmount=HPZ_APL_WC_Cart_Bridge_08::checkout(
 $c,1,$noProof,array_replace($ctx,['shippingAmountCents'=>-1]),$secret);
check(in_array('woo-customer-shipping-unverified',$missingAmount['blockers'],true),
 'unknown shipping amount rejected');
$normalFree=HPZ_APL_WC_Cart_Bridge_08::checkout(
 $c,1,$noProof,array_replace($ctx,['shippingAmountCents'=>0]),$secret);
check($normalFree['validForReleaseReview']===true,
 'genuine Woo free-shipping rate remains allowed');
foreach([1899,1900,1901] as $length){
 $testLine=HPZ_APL_WC_Cart_Bridge_08::issue(
    raw(['dimensions'=>['L1'=>(string)$length,'B1'=>'600']]),$noProof,$secret);
 $snapshot=HPZ_APL_WC_Cart_Bridge_08::inspect($testLine,1,$noProof,$secret);
 $gross=$snapshot['quote']['unitGrossReferenceCents'];
 $contexts=array_replace($ctx,[
    'preDiscountGrossCents'=>$gross,
    'actualNetLineRevenueCents'=>(int)round($gross/1.19),
 ]);
 $testCheckout=HPZ_APL_WC_Cart_Bridge_08::checkout(
    $testLine,1,$noProof,$contexts,$secret);
 check($testCheckout['validForReleaseReview']===true,
    'ordinary shop shipping works for straight '.$length.'mm');
}

$other=HPZ_APL_WC_Cart_Bridge_08::checkout($c,1,$noProof,array_replace($ctx,['country'=>'AT']),$secret);
check(in_array('country-not-tested',$other['blockers'],true),'international tax needs explicit test');
$wrong=HPZ_APL_WC_Cart_Bridge_08::checkout($c,1,$noProof,array_replace($ctx,['preDiscountGrossCents'=>66900]),$secret);
check(in_array('price-mismatch',$wrong['blockers'],true),'tampered price blocked');
$second=HPZ_APL_WC_Cart_Bridge_08::checkout($c,2,$noProof,array_replace($ctx,['preDiscountGrossCents'=>134000,'actualNetLineRevenueCents'=>112606]),$secret);
check($second['validForReleaseReview']===true,'quantity update recalculates gross and stays valid');
$fake=$c;$fake['hpz_apl_v08']['unitGrossReferenceCents']=1;
throws(function()use($fake,$noProof,$secret){HPZ_APL_WC_Cart_Bridge_08::inspect($fake,1,$noProof,$secret);},'forged price cannot overwrite V3');
throws(function()use($c,$noProof,$secret){HPZ_APL_WC_Cart_Bridge_08::inspect($c,0,$noProof,$secret);},'zero qty rejected');
$line=new class {public $meta=[];function add_meta_data($key,$value,$unique=false){$this->meta[$key]=$value;}};
HPZ_APL_WC_Cart_Bridge_08::writeOrderLine($line,$r);
check($line->meta['Plattenmaße']==='2000 × 600 mm','complete dimensions in Woo order');
check($line->meta['Dekor']==='Platinweiß','customer decor name in Woo order');
check(strpos(HPZ_APL_WC_Cart_Bridge_08::manualSpeedmasterText($r['production']),'W980 ST7')!==false,'manual supplier handoff');
foreach(HPZ_APL_Decor_Catalog::all() as $decor) {
 $item=HPZ_APL_WC_Cart_Bridge_08::issue(raw(['decor'=>$decor['id']]),$noProof,$secret);
 $info=HPZ_APL_WC_Cart_Bridge_08::inspect($item,1,$noProof,$secret);
 check($info['quote']['unitGrossReferenceCents']>0,'V3 supports standard decor');
}
echo "PASS $n simplified Woo checkout contract tests (no supplier approval and no extra customer shipping)\n";
