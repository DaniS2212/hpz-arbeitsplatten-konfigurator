<?php
/**
 * Customer checkout shipping is the existing Woo rate, NOT a second
 * configuration-dependent 190cm carrier selector. Synthetic PHP test.
 */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../HPZ_APL_WP_Woo_Context.php';
$checks=0;
function assertStandard($yes, $name) {
    global $checks;
    ++$checks;
    if (!$yes) throw new RuntimeException('FAIL standard shipping: '.$name);
}
$options=['woocommerce_prices_include_tax'=>'no','woocommerce_price_num_decimals'=>2];
function get_option($key,$default=''){global $options;return $options[$key]??$default;}
function wc_tax_enabled(){return true;}
function get_woocommerce_currency(){return 'EUR';}
class WC_Tax {
    public static function get_rates($class=''){return [['rate'=>'19.0000','compound'=>'no']];}
}
class StandardProduct {
    private $id;
    public function __construct($id){$this->id=$id;}
    public function get_id(){return $this->id;}
    public function get_sku(){return [
        1000083=>'HPZ-APL-GERADE-2026',
        1000080=>'HPZ-APL-L-FORM-2026',
        1000081=>'HPZ-APL-U-FORM-2026',
    ][$this->id];}
    public function is_taxable(){return true;}
    public function get_tax_class(){return '';}
}
class StandardCustomer {
    function get_shipping_country(){return 'DE';}
    function get_billing_country(){return 'DE';}
    function get_is_vat_exempt(){return false;}
}
class StandardSession {
    public $selected='flat_rate:1';
    function get($key,$default=[]){
        return $key==='chosen_shipping_methods'?[$this->selected]:$default;
    }
}
class StandardShipping {
    function get_packages(){return [['rates'=>['flat_rate:1'=>new stdClass()]]];}
}
class StandardCart {
    function get_shipping_total(){return 5.90;}
}
class StandardWoo {
    public $customer;
    public $session;
    function __construct(){
        $this->customer=new StandardCustomer();
        $this->session=new StandardSession();
    }
    function shipping(){return new StandardShipping();}
}
$standardWoo=new StandardWoo();
function WC(){global $standardWoo;return $standardWoo;}
foreach([1000083,1000080,1000081] as $id){
    foreach([1899,1900,1901] as $length){
        $line=[
            'product_id'=>$id,
            'data'=>new StandardProduct($id),
            // Woo validation still separately checks signed cart item metadata.
            'hpz_apl_test_length_mm'=>$length
        ];
        $ctx=HPZ_APL_WP_Woo_Context_09::context($line,new StandardCart());
        assertStandard($ctx['country']==='DE' && $ctx['taxVerified']===true &&
            $ctx['pricesConfigured']===true,'DE tax verification '.$id.'/'.$length);
        assertStandard($ctx['shippingCalculated']===true &&
            $ctx['selectedShippingRateId']==='flat_rate:1' &&
            $ctx['shippingAmountCents']===590,
            'same existing Woo rate below/at/above 190cm '.$id.'/'.$length);
    }
}
$standardWoo->session->selected='not-offered:99';
$line=['product_id'=>1000080,'data'=>new StandardProduct(1000080)];
$bad=HPZ_APL_WP_Woo_Context_09::context($line,new StandardCart());
assertStandard($bad['shippingCalculated']===false,'nonexistent Woo rate still rejected');
assertStandard(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1899])===15000,
    'internal procurement under 1900: flat 150 EUR net');
assertStandard(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1900])===15000,
    'internal procurement at 1900: flat 150 EUR net');
assertStandard(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1900,3000])===15000,
    'several long legs: 150 EUR net only once per worktop');
foreach([1899=>15000,1900=>15000,1901=>15000] as $length=>$expected){
    foreach([
        ['L1'=>$length,'L2'=>1200],
        ['L1'=>1200,'L2'=>$length],
        ['L1'=>1200,'L2'=>1400,'L3'=>$length],
    ] as $dimensions){
        assertStandard(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents(
            ['dimensions'=>$dimensions])===$expected,
            'L/U single fixed 150 EUR net per plate '.$length);
    }
}
$cost=30000;
$shortGross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts($cost,15000,0);
$longGross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts($cost,15000,0);
assertStandard($shortGross===$longGross,'identical internal inbound at any length');
echo "PASS $checks flat 150 EUR NET inbound per board and ordinary Woo shipping separation checks (synthetic; not live checkout)\n";
