<?php
declare(strict_types=1);
define('ABSPATH',__DIR__);
define('HPZ_APL_080_SANDBOX_HOOK_TEST',true);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/price-preview.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Straight_Sale_Readiness.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Cart_Bridge.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Dormant_Hooks.php';
$filters=[];$actions=[];$notices=[];
function add_filter($n,$cb,$p=10,$a=1){global $filters;$filters[$n]=$cb;}
function add_action($n,$cb,$p=10,$a=1){global $actions;$actions[$n]=$cb;}
function wp_verify_nonce($n,$a){return $n==='simple-test' && $a==='hpz_apl_cart_1000083';}
function wc_add_notice($m,$type){global $notices;$notices[]=[$m,$type];}
function wc_prices_include_tax(){return false;}
class ItemProduct {
 public $price='111.00';
 public function get_id(){return 1000083;}
 public function get_sku(){return 'HPZ-APL-GERADE-2026';}
 public function is_taxable(){return true;}
 public function set_price($p){$this->price=$p;}
}
class DemoCart {
 public $cart_contents=[];
 public function get_cart(){return $this->cart_contents;}
}
class DemoWoo {public $cart;function __construct($cart){$this->cart=$cart;}}
class DemoOrderItem {public $meta=[];function add_meta_data($key,$value,$unique=false){$this->meta[$key]=$value;}}
class DemoErrors {public $errors=[];function add($code,$message){$this->errors[$code]=$message;}}
$demo=null;function WC(){global $demo;return $demo;}
$count=0;function ok($v,$m){global $count;$count++;if(!$v)throw new RuntimeException($m);}
function input():array{return [
 'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
 'product'=>'straight','geometry'=>'straight','corner'=>'square',
 'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
 'dimensions'=>['L1'=>'2000','B1'=>'600'],'material'=>'APL38','decor'=>'W980','quantity'=>1,
];}
$ctx=['country'=>'DE','pricesConfigured'=>true,'taxVerified'=>true,'baseTaxRateBasisPoints'=>1900];
HPZ_APL_WC_Dormant_Hooks_08::configure(
 function($key){return null;},
 function($item,$cart)use($ctx){return $ctx;},
 str_repeat('x',64)
);
ok(HPZ_APL_WC_Dormant_Hooks_08::registerForSandboxTests(),'sandbox hooks registered');
$_POST=[];
ok(HPZ_APL_WC_Dormant_Hooks_08::classicValidate(true,1000083,1)===false,'naked add-to-cart is rejected');
$_POST=['hpz_apl_nonce'=>'simple-test','hpz_apl_config'=>json_encode(input())];
ok(HPZ_APL_WC_Dormant_Hooks_08::classicValidate(true,1000083,1)===true,'valid raw config can be purchased without exact supplier approval');
$signed=HPZ_APL_WC_Dormant_Hooks_08::classicCartData([],1000083,0,1);
ok(isset($signed['hpz_apl_v08']['signature']),'signed item generated');
$product=new ItemProduct();$cart=new DemoCart();$cart->cart_contents=['row'=>array_merge($signed,[
 'product_id'=>1000083,'quantity'=>1,'data'=>$product,
 'line_subtotal'=>'563.03','line_subtotal_tax'=>'106.97','line_total'=>'563.03'
])];
$demo=new DemoWoo($cart);
HPZ_APL_WC_Dormant_Hooks_08::beforeTotals($cart);
ok($product->price==='111.00','original product remains unchanged');
ok($cart->cart_contents['row']['data']->price==='563.025210','V3 price only applied to cart item');
ok(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart)===[],'valid Woo cart passes with ordinary shipping, no supplier proof');
$metadata=HPZ_APL_WC_Dormant_Hooks_08::cartDisplayData([],$cart->cart_contents['row']);
ok(count($metadata)>=5,'all relevant configuration data visible in cart');
$order=new DemoOrderItem();
HPZ_APL_WC_Dormant_Hooks_08::writeOrderItem($order,'row',$cart->cart_contents['row'],null);
ok(($order->meta['Plattenmaße']??'')==='2000 × 600 mm','Woo order keeps exact measures');
ok(($order->meta['Dekor']??'')==='Platinweiß','Woo order keeps decor');
ok(isset($order->meta['_hpz_apl_manufacturing_v2']),'manual Speedmaster order data preserved');
$issues=new DemoErrors();
HPZ_APL_WC_Dormant_Hooks_08::storeCartErrors($issues,$cart);
ok(count($issues->errors)===0,'Store API cart has no false approval error');
$cart->cart_contents['row']['line_subtotal_tax']='0.00';
ok(count(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart))>0,'incorrect VAT calculation blocked');
$cart->cart_contents['row']['line_subtotal_tax']='106.97';
$cart->cart_contents['row']['hpz_apl_v08']['signature']=str_repeat('0',64);
ok(count(HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart))>0,'corrupt signed config blocked at checkout');
echo "PASS $count simple Woo sandbox integration tests\n";
