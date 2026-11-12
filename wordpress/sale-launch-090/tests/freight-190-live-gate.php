<?php
/** Read-only 190cm customer freight / actual Woo selected method regressions. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../HPZ_APL_WP_Freight_190.php';
require_once __DIR__.'/../HPZ_APL_WP_Woo_Context.php';
$n=0;
function ok190($yes,$what){global $n;$n++;if(!$yes)throw new RuntimeException('FAIL '.$what);}
$opts=[];
function get_option($key,$default=[]){global $opts;return $opts[$key]??$default;}
function current_user_can($cap){return true;}
function shortLine($id=1000080,$length=1899,$extra=[]){
 $item=$id===1000083?'hpz_apl_v08':'hpz_apl_lu_v1';
 return [
   'product_id'=>$id,
   $item=>['config'=>['productId'=>$id,
     'dimensions'=>array_merge(['L1'=>$length,'B1'=>600],$extra)]]
 ];
}
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine())===false,'1899mm no freight');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine(1000080,1900))===true,'1900mm freight');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine(1000080,1901))===true,'1901mm freight');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine(1000083,1900))===true,'straight also freight');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine(1000081,1200,['L2'=>1200,'L3'=>1900]))===true,'U right arm freight');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine(1000080,1200,['L2'=>1900]))===true,'L left arm freight');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(shortLine(1234,3500))===false,'unrelated products untouched');
ok190(HPZ_APL_WP_Freight_190::requiresFreight(['product_id'=>1000081])===null,'unsigned worktop has no size proof');
ok190(HPZ_APL_WP_Freight_190::approved(shortLine(1000080,1899),'flat_rate:1',0),'short unchanged');
ok190(!HPZ_APL_WP_Freight_190::approved(shortLine(1000081,1900),'flat_rate:1',10000),'no release policy rejects long');
$invalid=HPZ_APL_WP_Freight_190::sanitize(['rate_ids'=>'flexible_shipping:12,flat_rate:9','minimum_eur'=>'49,50','confirmed'=>'1']);
ok190($invalid['minimum_cents']===4950 && $invalid['confirmed']===true &&
  $invalid['rate_ids']===['flexible_shipping:12','flat_rate:9'],'locale-safe trusted admin setting');
$opts[HPZ_APL_WP_Freight_190::OPTION]=$invalid;
ok190(HPZ_APL_WP_Freight_190::approved(shortLine(1000080,1900),'flexible_shipping:12',4950),'freight valid at threshold');
ok190(!HPZ_APL_WP_Freight_190::approved(shortLine(1000080,1900),'flexible_shipping:12',4949),'freight cost too low');
ok190(!HPZ_APL_WP_Freight_190::approved(shortLine(1000080,1900),'flat_rate:1',4950),'ordinary parcel rejected');
ok190(!HPZ_APL_WP_Freight_190::approved(['product_id'=>1000080],'flexible_shipping:12',4950),'unsigned rejected');
ok190(HPZ_APL_WP_Freight_190::sanitize(['rate_ids'=>'flat_rate:1','minimum_eur'=>'0','confirmed'=>'1'])===[],
  'zero cost policy forbidden');
ok190(HPZ_APL_WP_Freight_190::sanitize(['rate_ids'=>'flat_rate:1,../','minimum_eur'=>'50','confirmed'=>'1'])===[],
  'unsafe rate IDs rejected');
class FakeRate190 {
 private $cost;function __construct($cost){$this->cost=$cost;}
 function get_cost(){return $this->cost;}
}
$rates=[
 'flat_rate:1'=>new FakeRate190('9.99'),
 'flexible_shipping:12'=>new FakeRate190('49.50'),
 'flat_rate:9'=>new FakeRate190('48.00')
];
$package=['contents'=>[shortLine(1000081,1900)]];
$filtered=HPZ_APL_WP_Freight_190::rates($rates,$package);
ok190(array_keys($filtered)===['flexible_shipping:12'],'long only verified freight and minimum charge');
ok190(count(HPZ_APL_WP_Freight_190::rates($rates,['contents'=>[shortLine(1000081,1899)]]))===3,
  'short preserves all existing shipping methods');
ok190(count(HPZ_APL_WP_Freight_190::rates($rates,['contents'=>[shortLine(1000081,1900),shortLine(1234,500)]]))===1,
  'mixed cart keeps freight only');
ok190(count(HPZ_APL_WP_Freight_190::rates($rates,['contents'=>[['product_id'=>1000081]]]))===0,
  'unknown signed state does not fall back to a parcel method');
// One-shipping-package Woo server context integration; no cart or order writes.
class FakeProduct190 {
 function __construct(private int $id){}
 function get_id(){return $this->id;}
 function get_sku(){return [1000080=>'HPZ-APL-L-FORM-2026',1000081=>'HPZ-APL-U-FORM-2026',1000083=>'HPZ-APL-GERADE-2026'][$this->id];}
 function is_taxable(){return true;} function get_tax_class(){return '';}
}
class FakeCustomer190 {
 function get_shipping_country(){return 'DE';}
 function get_billing_country(){return 'DE';}
 function get_is_vat_exempt(){return false;}
}
class FakeSession190 {
 public $chosen='flexible_shipping:12';
 function get($key,$default=[]){return $key==='chosen_shipping_methods'?[$this->chosen]:$default;}
}
class FakeShipping190 {
 function get_packages(){return [['rates'=>['flexible_shipping:12'=>new FakeRate190(49.50),'flat_rate:1'=>new FakeRate190(9.99)]]];}
}
class FakeCart190 {function get_shipping_total(){return 49.50;}}
class FakeWC190 {
 public $customer;public $session;
 function __construct(){$this->customer=new FakeCustomer190();$this->session=new FakeSession190();}
 function shipping(){return new FakeShipping190();}
}
$woo=new FakeWC190();
function WC(){global $woo;return $woo;}
function wc_tax_enabled(){return true;}
function get_woocommerce_currency(){return 'EUR';}
class WC_Tax {static function get_rates($class=''){return [['rate'=>'19.0000','compound'=>'no']];}}
$opts['woocommerce_prices_include_tax']='no';
$opts['woocommerce_price_num_decimals']=2;
$line=shortLine(1000080,1900);$line['data']=new FakeProduct190(1000080);
$ctx=HPZ_APL_WP_Woo_Context_09::context($line,new FakeCart190());
ok190($ctx['shippingCalculated']===true && $ctx['shippingAmountCents']===4950,
  'live Woo-context accepted verified 190cm freight method');
$woo->session->chosen='flat_rate:1';
$context=HPZ_APL_WP_Woo_Context_09::context($line,new FakeCart190());
ok190($context['shippingCalculated']===false,
  'live Woo-context rejects parcel even if artificially selected at checkout');
$opts[HPZ_APL_WP_Freight_190::OPTION]['confirmed']=false;
$woo->session->chosen='flexible_shipping:12';
$context=HPZ_APL_WP_Woo_Context_09::context($line,new FakeCart190());
ok190($context['shippingCalculated']===false,
  'operator removal of freight approval revokes checkout permission immediately');
echo "PASS $n real-Woo-context equivalent tests, 1899/1900/1901 and rate price checks; no orders.\n";
