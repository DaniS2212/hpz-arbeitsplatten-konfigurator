<?php
/** Synthetic Woo classic/Store API integration; sale flags ONLY in this test. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
define('HPZ_APL_LU_11_AUDITED_RELEASE',true);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Cart_Bridge.php';
require_once __DIR__.'/../../sale-launch-090/HPZ_APL_WP_Woo_Context.php';
require_once __DIR__.'/../HPZ_APL_WC_LU_Cart_Bridge.php';
require_once __DIR__.'/../HPZ_APL_WP_LU_Runtime.php';

$count=0;
function luOk($yes,string $label){global $count;$count++;if(!$yes)throw new RuntimeException('FAIL '.$label);}
$actions=[];$filters=[];$notices=[];$options=[
 'hpz_apl_lu_sale_v1'=>['enabled'=>true,'manual_supplier_handoff_verified'=>true,'woocommerce_checkout_verified'=>true],
 'hpz_apl_lu_verified_proofs'=>[],
 'woocommerce_prices_include_tax'=>'no','woocommerce_price_num_decimals'=>2
];
function add_action($name,$fn,$priority=10,$args=1){global $actions;$actions[$name][]=$fn;}
function add_filter($name,$fn,$priority=10,$args=1){global $filters;$filters[$name][]=$fn;}
function get_option($key,$default=[]){global $options;return array_key_exists($key,$options)?$options[$key]:$default;}
function get_woocommerce_currency(){return 'EUR';}
function wc_tax_enabled(){return true;}
function wc_prices_include_tax(){return false;}
function wp_salt($scheme){return str_repeat($scheme,16);}
function wc_add_notice($notice,$type){global $notices;$notices[]=[$notice,$type];}
class WC_Tax {public static function get_rates($class=''){return [['rate'=>'19.0000','compound'=>'no']];}}
class FakeLUProduct {
 public $price='10.00';
 private $id;
 public function __construct($id){$this->id=$id;}
 public function get_id(){return $this->id;}
 public function get_sku(){return $this->id===1000080?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026';}
 public function get_status(){return 'publish';}
 public function is_type($type){return $type==='simple';}
 public function is_taxable(){return true;}
 public function get_tax_class(){return '';}
 public function set_price($price){$this->price=$price;}
}
class FakeLUCustomer {
 public $country='DE';
 public function get_shipping_country(){return $this->country;}
 public function get_billing_country(){return 'DE';}
 public function get_is_vat_exempt(){return false;}
}
class FakeLUSession {
 public $rate='test_rate:1';
 public function get($key,$default=[]){return $key==='chosen_shipping_methods'?[$this->rate]:$default;}
}
class FakeLUShipping {
 public function get_packages(){return [['rates'=>['test_rate:1'=>new stdClass()]]];}
}
class FakeLUCart {
 public $cart_contents=[];
 public function get_cart(){return $this->cart_contents;}
 public function get_shipping_total(){return '19.99';}
}
class FakeLUWoo {
 public $cart; public $customer; public $session;private $shipping;
 public function __construct(){
  $this->cart=new FakeLUCart();$this->customer=new FakeLUCustomer();
  $this->session=new FakeLUSession();$this->shipping=new FakeLUShipping();
 }
 public function shipping(){return $this->shipping;}
}
class FakeLUOrderLine {
 public $meta=[];
 public function add_meta_data($key,$value,$unique=false){$this->meta[$key]=$value;}
}
$woo=new FakeLUWoo();
function WC(){global $woo;return $woo;}
function wc_get_product($id){return in_array($id,[1000080,1000081],true)?new FakeLUProduct($id):false;}
function makeLUConfig(string $shape):array{
 $l=$shape[0]==='L';$id=$l?1000080:1000081;
 $dims=$l?($shape==='L4'
  ?['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900','B5'=>'600']
  :['L1'=>'2000','L2'=>'1200','B1'=>'600','B2'=>'600'])
  :['L1'=>'2000','L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'];
 $raw=['schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$id,
  'sku'=>$l?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
  'product'=>$l?'l':'u','geometry'=>$shape,'corner'=>'square','dimensions'=>$dims,
  'material'=>'APL38','decor'=>'W980','quantity'=>1,'edge'=>'matching-1.5'];
 if($l)$raw['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
 return $raw;
}
function fakeProof(array $raw):array{
 $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
 return [
 'configurationKey'=>HPZ_APL_LU_Price_Readiness::configurationKey($c),
 'supplier'=>'speedmaster','verifiedNetPrice'=>true,'manufacturable'=>true,
 'decorAndThicknessAvailable'=>true,'cutListVerified'=>true,
 'connectorPlanVerified'=>true,'packagingAndCostsVerified'=>true,
 'supplierReference'=>'MOCK-SPEEDMASTER-NOT-A-REAL-ORDER',
 'supplierNetCents'=>69149,'maxQuantity'=>3,'checkedOn'=>gmdate('Y-m-d'),
 'verifiedCutParts'=>[['partId'=>'test-part','lengthMm'=>2000,'widthMm'=>600]],
 'verifiedShippingPartLengthsMm'=>[2000],
 'verifiedPackages'=>[['lengthMm'=>2070,'widthMm'=>660,'heightMm'=>100,'weightGrams'=>32000]],
 'packagingNetCents'=>0,'outboundNetCostCents'=>0,'paymentAndHandlingNetCents'=>0,
 'packagingCostSource'=>'synthetic-php-test','shippingCostSource'=>'synthetic-php-test',
 'approvedShippingRateIds'=>['test_rate:1'],
 ];
}
$raw=makeLUConfig('U2');
$proof=fakeProof($raw);
$options['hpz_apl_lu_verified_proofs'][$proof['configurationKey']]=$proof;
luOk(HPZ_APL_WP_LU_Runtime_11::canSell(1000081),'synthetic U release requires explicit gates');
luOk(!HPZ_APL_WP_LU_Runtime_11::canSell(1000083),'never enable straight via LU');
HPZ_APL_WP_LU_Runtime_11::register();
luOk(isset($actions['wp_ajax_hpz_apl_lu_quote']),'synthetic gated quote registered');
luOk(isset($actions['woocommerce_checkout_create_order_line_item']),'synthetic order meta hook registered');
luOk(isset($filters['woocommerce_store_api_add_to_cart_data']),'Store API adapter registered');
luOk(isset($filters['woocommerce_add_to_cart_validation']),'classic cart adapter registered');
$secret=wp_salt('auth').wp_salt('secure_auth');
$lookup=function($key)use(&$options){return $options['hpz_apl_lu_verified_proofs'][$key]??null;};
$signed=HPZ_APL_WC_LU_Cart_Bridge::issue($raw,$lookup,$secret);
luOk(HPZ_APL_WP_LU_Runtime_11::validateClassic(true,1000081,1,0,[],$signed)===true,'signed classic cart accepted');
$_POST=[];
luOk(HPZ_APL_WP_LU_Runtime_11::validateClassic(true,1000081,1,0,[],[])===false,'naked add-to-cart blocked');
$store=['hpz_apl_config'=>$raw,'quantity'=>1];
HPZ_APL_WP_LU_Runtime_11::storeValidate(new FakeLUProduct(1000081),$store);
$storeData=HPZ_APL_WP_LU_Runtime_11::storeData(['id'=>1000081,'quantity'=>1],$store);
luOk(isset($storeData['cart_item_data'][HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]),'Store API signed cart data');
$originalProduct=new FakeLUProduct(1000081);
$woo->cart->cart_contents['row']=array_merge($signed,[
 'product_id'=>1000081,'quantity'=>1,'data'=>$originalProduct,
 'line_subtotal'=>'1378.15','line_subtotal_tax'=>'261.85','line_total'=>'1378.15'
]);
HPZ_APL_WP_LU_Runtime_11::beforeTotals($woo->cart);
luOk($originalProduct->price==='10.00','persistent Woo product price never edited');
luOk($woo->cart->cart_contents['row']['data']->price==='1378.151261','V3 price set on cloned cart line only');
luOk(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart)===[],'synthetic Woo taxes/ship/coupons pass');
luOk(isset($actions['woocommerce_checkout_process'])
 &&in_array([HPZ_APL_WP_LU_Runtime_11::class,'checkClassicCheckout'],
            $actions['woocommerce_checkout_process'],true),
 'L/U checkout submission keeps strict final gate');
$woo->session->rate='not-yet-chosen';
luOk(HPZ_APL_WP_LU_Runtime_11::cartEntryChecks($woo->cart)===[],
 'L/U classic cart can proceed before shipping selection');
luOk(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart)!==[],
 'L/U final checkout rejects shipping not chosen by Woo');
luOk(strpos(implode(' ',HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart)),'Versandart')!==false,
 'L/U shipping error names the missing Woo choice');
$notices=[];HPZ_APL_WP_LU_Runtime_11::checkClassicCart();
luOk($notices===[],'L/U cart navigation not blocked on future shipping');
HPZ_APL_WP_LU_Runtime_11::checkClassicCheckout();
luOk(count($notices)>0,'L/U checkout submission still blocks without shipping');
$woo->session->rate='test_rate:1';$notices=[];
HPZ_APL_WP_LU_Runtime_11::checkClassicCheckout();
luOk($notices===[],'L/U with standard Woo rate passes final gate');
$display=HPZ_APL_WP_LU_Runtime_11::cartDisplayData([],$woo->cart->cart_contents['row']);
luOk(count($display)>=11,'all U2 measurement and seam fields visible in cart');
$order=new FakeLUOrderLine();
HPZ_APL_WP_LU_Runtime_11::writeOrderItem($order,'row',$woo->cart->cart_contents['row'],null);
luOk(($order->meta['Arbeitsplattenform']??'')==='U2','order retains U2');
luOk(($order->meta['L3']??'')==='1800 mm','order retains third length');
luOk(($order->meta['Stoßvariante (Schema)']??'')==='Links längs · Rechts längs','order retains U2 left/right join');
luOk(isset($order->meta['_hpz_apl_manufacturing_v2']),'HPOS-safe structured worktop data');
luOk(HPZ_APL_WP_LU_Runtime_11::storeQuantity(true,2,new FakeLUProduct(1000081),$woo->cart->cart_contents['row'])===true,'qty 2 revalidated');
luOk(HPZ_APL_WP_LU_Runtime_11::classicQuantity(true,'row',$woo->cart->cart_contents['row'],4)===false,'qty 4 supplier limit');
$woo->cart->cart_contents['row']['line_total']='800.00';
luOk(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart)===[],
  'Woo coupon below 35% margin permitted');
$woo->cart->cart_contents['row']['line_total']='0.00';
luOk(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart)===[],
  '100% Woo coupon permitted');
$woo->cart->cart_contents['row']['line_total']='-1.00';
luOk(count(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart))>0,
  'negative Woo item amount rejected');
$woo->cart->cart_contents['row']['line_total']='1378.15';
$woo->session->rate='other_rate:1';
luOk(count(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart))>0,'unexpected customer shipping rate rejected');
$woo->session->rate='test_rate:1';
$woo->customer->country='CH';
luOk(count(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart))>0,'CH tax and shipping not silently approved');
$woo->customer->country='DE';
$options['hpz_apl_lu_sale_v1']['enabled']=false;
luOk(!HPZ_APL_WP_LU_Runtime_11::canSell(1000081),'operator can disable sale');
luOk(count(HPZ_APL_WP_LU_Runtime_11::finalChecks($woo->cart))>0,'old cart blocked immediately when disabled');
luOk(HPZ_APL_WP_LU_Runtime_11::cartEntryChecks($woo->cart)!==[],
 'L/U cart still blocks when operator disables product');
echo "PASS $count synthetic L/U Woo hook tests (no real sale)\n";
