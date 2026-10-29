<?php
declare(strict_types=1);
define('ABSPATH',__DIR__);
define('HPZ_APL_080_SANDBOX_HOOK_TEST',true);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/price-preview.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Straight_Sale_Readiness.php';
require_once __DIR__.'/../HPZ_APL_WC_Cart_Bridge.php';
require_once __DIR__.'/../HPZ_APL_WC_Dormant_Hooks.php';
$filters=[];$actions=[];$notices=[];
function add_filter($h,$f,$p=10,$a=1){global $filters;$filters[$h]=[$f,$p,$a];}
function add_action($h,$f,$p=10,$a=1){global $actions;$actions[$h]=[$f,$p,$a];}
function wc_add_notice($text,$level){global $notices;$notices[]=[$text,$level];}
function wp_verify_nonce($nonce,$action){return $nonce==='synthetic-nonce'&&$action==='hpz_apl_cart_1000083';}
function wp_unslash($v){return $v;}
function wc_prices_include_tax(){return false;}
function get_option($key,$fallback=null){return $key==='woocommerce_weight_unit'?'kg':($key==='woocommerce_dimension_unit'?'cm':$fallback);}
function wc_get_weight($value,$to,$from='kg'){return $value;}
function wc_get_dimension($value,$to,$from='mm'){return $to==='cm'?$value/10:$value;}
class DummyProduct {
 public $price='100.00',$weight='0',$length='0',$width='0',$height='0';
 function get_id(){return 1000083;}
 function get_sku(){return 'HPZ-APL-GERADE-2026';}
 function is_taxable(){return true;}
 function set_price($v){$this->price=$v;}
 function set_weight($v){$this->weight=$v;}
 function set_length($v){$this->length=$v;}
 function set_width($v){$this->width=$v;}
 function set_height($v){$this->height=$v;}
}
class DummyCart {
 public $cart_contents=[];
 function get_cart(){return $this->cart_contents;}
}
class DummyWoo {
 public $cart;
 function __construct($c){$this->cart=$c;}
}
class DummyErrors {
 public $errors=[];
 function add($key,$text){$this->errors[]=[$key,$text];}
}
class DummyOrderItem {
 public $meta=[];
 function add_meta_data($k,$v,$once=true){$this->meta[$k]=$v;}
}
$wc=null;
function WC(){global $wc;return $wc;}
$checks=0;
function yes($ok,$msg){global $checks;++$checks;if(!$ok)throw new RuntimeException($msg);}
$raw=['schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
 'product'=>'straight','geometry'=>'straight','corner'=>'square',
 'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
 'dimensions'=>['L1'=>'2000','B1'=>'600'],'material'=>'APL38','decor'=>'W980','quantity'=>1];
$now=strtotime('2026-10-29 12:00:00 UTC');
$key=HPZ_APL_Straight_Sale_Readiness::configurationKey(HPZ_APL_Price_Preview::normalize($raw));
$proof=['configurationKey'=>$key,'supplier'=>'speedmaster','manufacturable'=>true,
 'materialAndDecorAvailable'=>true,'supplierReference'=>'SYNTHETIC-TEST-ONLY',
 'supplierNetCents'=>24311,'maxQuantity'=>3,'checkedOn'=>'2026-10-29',
 'shippingPartLengthsMm'=>[2000],'packedWeightGrams'=>30000,
 'packageDimensionsMm'=>['length'=>2070,'width'=>670,'height'=>110],
 'approvedShippingRateIds'=>['test-rate:1']];
$lookup=function($k)use($key,$proof){return $k===$key?$proof:null;};
$context=function($row,$cart){return ['country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,
 'pricesConfigured'=>true,'shippingCalculated'=>true,'selectedShippingRateId'=>'test-rate:1',
 'shippingAmountCents'=>5000,'checkoutIntegrationVerified'=>true,'fulfilmentWorkflowVerified'=>true];};
HPZ_APL_WC_Dormant_Hooks_08::configure($lookup,$context,str_repeat('a',64),$now);
yes(HPZ_APL_WC_Dormant_Hooks_08::registerForSandboxTests(),'mock hook registration');
foreach(['woocommerce_add_to_cart_validation','woocommerce_add_cart_item_data','woocommerce_store_api_add_to_cart_data','woocommerce_get_cart_item_from_session','woocommerce_get_item_data'] as $name)yes(isset($filters[$name]),'filter '.$name);
foreach(['woocommerce_store_api_validate_add_to_cart','woocommerce_before_calculate_totals','woocommerce_check_cart_items','woocommerce_checkout_process','woocommerce_store_api_cart_errors','woocommerce_store_api_checkout_order_processed','woocommerce_checkout_create_order_line_item'] as $name)yes(isset($actions[$name]),'action '.$name);
yes(HPZ_APL_WC_Dormant_Hooks_08::classicValidate(true,999985,1)===true,'unrelated SKU untouched');
yes(HPZ_APL_WC_Dormant_Hooks_08::classicCartData(['unrelated'=>'x'],999985,0,1)===['unrelated'=>'x'],'unrelated item data untouched');
$_POST=[];
yes(HPZ_APL_WC_Dormant_Hooks_08::classicValidate(true,1000083,1)===false,'naked classic add-to-cart refused');
$_POST=['hpz_apl_nonce'=>'synthetic-nonce','hpz_apl_config'=>json_encode($raw)];
yes(HPZ_APL_WC_Dormant_Hooks_08::classicValidate(true,1000083,1)===true,'signed classic form');
$signed=HPZ_APL_WC_Dormant_Hooks_08::classicCartData([],1000083,0,1);
yes(isset($signed['hpz_apl_v08']['signature']),'classic cart snapshot HMAC');
yes(HPZ_APL_WC_Dormant_Hooks_08::classicValidate(true,1000083,1,0,[],$signed),'signed API data accepted by classic validator');
$p=new DummyProduct();
$storeRequest=['id'=>1000083,'quantity'=>1,'hpz_apl_config'=>$raw];
HPZ_APL_WC_Dormant_Hooks_08::storeValidate($p,$storeRequest);
$store=HPZ_APL_WC_Dormant_Hooks_08::storeCartData(['id'=>1000083,'quantity'=>1],$storeRequest);
yes($store['cart_item_data']===$signed,'Store API and classic produce same server snapshot');
yes(HPZ_APL_WC_Dormant_Hooks_08::storeCartData(['id'=>999985,'quantity'=>1],[])===['id'=>999985,'quantity'=>1],'Store API other products untouched');
try{HPZ_APL_WC_Dormant_Hooks_08::storeValidate($p,['id'=>1000083,'quantity'=>1]);yes(false,'naked Store API');}
catch(InvalidArgumentException $e){yes(true,'naked Store API denied');}
$cart=new DummyCart();
$cart->cart_contents['test']=array_merge($signed,['product_id'=>1000083,'quantity'=>1,'data'=>$p,'line_subtotal'=>'563.03','line_subtotal_tax'=>'106.97','line_total'=>'563.03']);
$wc=new DummyWoo($cart);
HPZ_APL_WC_Dormant_Hooks_08::beforeTotals($cart);
$cloned=$cart->cart_contents['test']['data'];
yes($cloned!==$p&&$p->price==='100.00','do not mutate shared product price');
yes($cloned->price==='563.025210','V3 unit net price');
yes($cloned->weight==='30'&&$cloned->length==='207','actual approved packed shipping size');
yes(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart)===[],'final server context passes synthetic review');
$customer=HPZ_APL_WC_Dormant_Hooks_08::cartDisplayData([],$cart->cart_contents['test']);
yes(count($customer)>=5&&$customer[0]['value']==='2000 × 600 mm','cart displays complete dimensions');
$order=new DummyOrderItem();
HPZ_APL_WC_Dormant_Hooks_08::writeOrderItem($order,'test',$cart->cart_contents['test'],null);
yes($order->meta['Dekor']==='Platinweiß','customer order includes decor');
yes(isset($order->meta['_hpz_apl_manufacturing_v2']),'HPOS-safe manual production data saved');
$errors=new DummyErrors();
HPZ_APL_WC_Dormant_Hooks_08::storeCartErrors($errors,$cart);
yes($errors->errors===[],'clean Store API cart');
HPZ_APL_WC_Dormant_Hooks_08::storeCheckoutCheck(null);
yes(true,'Store API gate before payment passes synthetically');
$cart->cart_contents['test']['line_total']='400.00';
yes(count(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart))>0,'coupon below minimum margin denied');
$errors=new DummyErrors();
HPZ_APL_WC_Dormant_Hooks_08::storeCartErrors($errors,$cart);
yes(count($errors->errors)>0,'Store API exposes rejection');
try{HPZ_APL_WC_Dormant_Hooks_08::storeCheckoutCheck(null);yes(false,'payment with 35%-margin violation');}
catch(RuntimeException $e){yes(true,'payment blocked');}
$cart->cart_contents['test']['line_total']='563.03';
$cart->cart_contents['test']['line_subtotal_tax']='100.00';
yes(count(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart))>0,'wrong Woo tax result denied');
$cart->cart_contents['test']['line_subtotal_tax']='106.97';
$cart->cart_contents['test']['hpz_apl_v08']['signature']=str_repeat('0',64);
yes(count(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart))>0,'tampered session denied');
HPZ_APL_WC_Dormant_Hooks_08::fromSession($cart->cart_contents['test'],[],'test');
yes(count(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart))>0,'session restore cannot bypass purchase gate');
echo "PASS $checks 0.8 Woo sandbox hook tests; no real WordPress registration\n";
