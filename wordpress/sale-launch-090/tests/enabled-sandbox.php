<?php
declare(strict_types=1);
define('ABSPATH',__DIR__);
define('HPZ_APL_09_RELEASE_AUDITED',true);
$actions=[];$filters=[];$options=['hpz_apl_straight_sale_090'=>'enabled',
 'woocommerce_prices_include_tax'=>'no','woocommerce_price_num_decimals'=>2];
$loggedAdmin=false;
function add_action($name,$callback,$priority=10,$args=1){global $actions;$actions[$name]=[$callback,$priority,$args];}
function add_filter($name,$callback,$priority=10,$args=1){global $filters;$filters[$name]=[$callback,$priority,$args];}
function add_shortcode($name,$callback){}
function get_option($name,$default=null){global $options;return array_key_exists($name,$options)?$options[$name]:$default;}
function update_option($name,$value,$autoload=null){global $options;$options[$name]=$value;return true;}
function wp_parse_args($value,$defaults){return array_merge($defaults,$value);}
function current_user_can($cap,$id=null){global $loggedAdmin;return $loggedAdmin;}
function wp_verify_nonce($nonce,$action){return $nonce==='TEST_NONCE'&&$action==='hpz_apl_supplier_proof_090';}
function get_post_status($id){return 'publish';}
function wp_get_post_parent_id($id){return 0;}
function get_queried_object_id(){return 1000083;}
function is_product(){return true;}
function wc_tax_enabled(){return true;}
function get_woocommerce_currency(){return 'EUR';}
function wp_salt($action){return str_repeat('T',64);}
class WC_Tax {static function get_rates($class=''){return [['rate'=>'19.0000','compound'=>'no']];}}
class Product {
 public $sku='HPZ-APL-GERADE-2026',$status='publish',$taxable=true;
 function get_id(){return 1000083;}
 function get_sku(){return $this->sku;}
 function get_status(){return $this->status;}
 function is_type($what){return $what==='simple';}
 function is_taxable(){return $this->taxable;}
 function get_tax_class(){return '';}
}
function wc_get_product($id){global $product;return $id===1000083?$product:null;}
class Customer {
 public $country='DE'; function get_shipping_country(){return $this->country;}
 function get_billing_country(){return 'DE';} function get_is_vat_exempt(){return false;}
}
class Session {public $rates=['test-rate:1'];function get($name,$fallback=[]){return $name==='chosen_shipping_methods'?$this->rates:$fallback;}}
class Shipping {public $offered=true;function get_packages(){return [['rates'=>$this->offered?['test-rate:1'=>new stdClass()]:[]]];}}
class Cart {function get_shipping_total(){return 50.0;}}
class WCMock {
 public $customer,$session,$cart,$ship;
 function __construct(){$this->customer=new Customer();$this->session=new Session();$this->cart=new Cart();$this->ship=new Shipping();}
 function shipping(){return $this->ship;}
}
$product=new Product();$instance=new WCMock();
function WC(){global $instance;return $instance;}
require_once __DIR__.'/../../hpz-apl-admin-preview/hpz-apl-admin-preview.php';
$checks=0;function ck($yes,$msg){global $checks;$checks++;if(!$yes)throw new RuntimeException($msg);}
ck(HPZ_APL_WP_Straight_Runtime_09::canSell(),'both audited release factors present in sandbox');
ck(HPZ_APL_WP_Straight_Runtime_09::canRenderPublic(1000083),'published correct SKU public in synthetic sandbox');
$loggedAdmin=true;
$raw=['schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
 'product'=>'straight','geometry'=>'straight','corner'=>'square',
 'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
 'dimensions'=>['L1'=>'2000','B1'=>'600'],'material'=>'APL38','decor'=>'W980','quantity'=>1];
$fields=['supplierNetCents'=>'24311','packedWeightGrams'=>'30000','packageLengthMm'=>'2070',
 'packageWidthMm'=>'670','packageHeightMm'=>'110','supplierReference'=>'SM-TEST-2000',
 'maxQuantity'=>'3','shippingRateIds'=>'test-rate:1'];
$saved=HPZ_APL_WP_Supplier_Proofs_09::saveFromAdmin($raw,$fields,'TEST_NONCE');
ck(is_string($saved['configurationKey'])&&strlen($saved['configurationKey'])===64,'manual proof keyed exactly');
$proof=HPZ_APL_WP_Supplier_Proofs_09::find($saved['configurationKey']);
ck(is_array($proof)&&$proof['supplierNetCents']===24311,'admin server-only proof stored');
ck($proof['shippingPartLengthsMm']===[2000]&&$proof['packedWeightGrams']===30000,'verified freight data stored');
$ctx=HPZ_APL_WP_Woo_Context_09::context(['product_id'=>1000083,'data'=>$product],WC()->cart);
ck($ctx['country']==='DE'&&$ctx['taxVerified']&&$ctx['baseTaxRateBasisPoints']===1900,'DE VAT from real Woo-like context');
ck($ctx['pricesConfigured']&&$ctx['shippingCalculated']&&$ctx['selectedShippingRateId']==='test-rate:1','shipping from WC session package');
ck($ctx['checkoutIntegrationVerified']===false && $ctx['fulfilmentWorkflowVerified']===false,'audit flags cannot come from browser');
$product->taxable=false;
ck(HPZ_APL_WP_Woo_Context_09::context(['data'=>$product],WC()->cart)['taxVerified']===false,'non-taxable product blocked');
$product->taxable=true;
WC()->ship->offered=false;
ck(HPZ_APL_WP_Woo_Context_09::context(['data'=>$product],WC()->cart)['shippingCalculated']===false,'unoffered shipping rate blocked');
WC()->ship->offered=true;
WC()->customer->country='CH';
ck(HPZ_APL_WP_Woo_Context_09::context(['data'=>$product],WC()->cart)['country']==='CH','non-DE country recognized and blocked');
WC()->customer->country='DE';
HPZ_APL_WP_Straight_Runtime_09::register();
ck(isset($actions['wp_ajax_nopriv_hpz_apl_public_quote'])&&isset($actions['wp_ajax_nopriv_hpz_apl_add_configured']),'sandbox explicitly released AJAX hooks');
ck(isset($filters['woocommerce_store_api_add_to_cart_data']),'Store API signature enabled only after audit');
ck(isset($filters['woocommerce_store_api_cart_item_quantity_validation']),'Woo 11.2 cart quantity gate');
$secret=HPZ_APL_WP_Straight_Runtime_09::secret();
$snapshot=HPZ_APL_WC_Cart_Bridge_08::issue($raw,function($key){return HPZ_APL_WP_Supplier_Proofs_09::find($key);},$secret);
$item=array_merge($snapshot,['product_id'=>1000083,'quantity'=>1,'data'=>$product]);
ck(HPZ_APL_WP_Straight_Runtime_09::storeQuantity(true,1,$product,$item)===true,'checked Store API quantity');
ck(HPZ_APL_WP_Straight_Runtime_09::storeQuantity(true,4,$product,$item)===false,'unverified higher quantity blocked');
ck(HPZ_APL_WP_Straight_Runtime_09::classicQuantity(true,'key',$item,4)===false,'classic quantity bypass blocked');
$spoof=$item;$spoof['hpz_apl_v08']['signature']=str_repeat('0',64);
ck(HPZ_APL_WP_Straight_Runtime_09::storeQuantity(true,1,$product,$spoof)===false,'tampered HMAC blocked');
$fields['packedWeightGrams']='0';
try{HPZ_APL_WP_Supplier_Proofs_09::saveFromAdmin($raw,$fields,'TEST_NONCE');ck(false,'cannot approve absent package weight');}
catch(InvalidArgumentException $e){ck(true,'missing real freight refused');}
$fields['packedWeightGrams']='30000';$fields['supplierNetCents']='100000';
try{HPZ_APL_WP_Supplier_Proofs_09::saveFromAdmin($raw,$fields,'TEST_NONCE');ck(false,'bad margin proof');}
catch(InvalidArgumentException $e){ck(true,'high supplier cost rejected');}
ck(HPZ_APL_WP_Supplier_Proofs_09::revokeFromAdmin($saved['configurationKey'],'TEST_NONCE'),'manual supplier revocation');
ck(HPZ_APL_WP_Supplier_Proofs_09::find($saved['configurationKey'])===null,'previously signed snapshot has no current proof');
ck(HPZ_APL_WP_Straight_Runtime_09::storeQuantity(true,1,$product,$item)===false,'revoked supplier proof blocks future checkout');
$loggedAdmin=false;
try{HPZ_APL_WP_Supplier_Proofs_09::saveFromAdmin($raw,$fields,'TEST_NONCE');ck(false,'guest approval');}
catch(InvalidArgumentException $e){ck(true,'guest cannot add supplier approval');}
global $options;
$options['hpz_apl_straight_sale_090']='disabled';
ck(!HPZ_APL_WP_Straight_Runtime_09::canSell(),'operator flag off halts checkout even with audited constant');
echo "PASS $checks 0.9 double-guarded Woo release, proof and checkout-context checks (sandbox only)\n";
