<?php
declare(strict_types=1);
define('ABSPATH',__DIR__);
$actions=[];$removed=[];$q=1000083;$sale=true;$publish=true;
function add_action($name,$callback,$priority=10,$args=1){global $actions;$actions[]=['hook'=>$name,'callback'=>$callback,'priority'=>$priority];}
function remove_action($name,$callback,$priority=10){global $removed;$removed[]=['hook'=>$name,'callback'=>$callback,'priority'=>$priority];return true;}
function add_filter($name,$callback,$priority=10,$args=1){}
function add_shortcode($name,$callback){}
function wp_parse_args($options,$defaults){return array_merge($defaults,(array)$options);}
function get_option($name,$default=null){global $sale;
 if($name==='hpz_apl_admin_preview')return ['enabled'=>false,'test_mode'=>false,'sale_enabled'=>$sale,'placement'=>'automatic'];
 return $default;
}
function WC(){return new stdClass();}
function wc_get_product($id){global $publish;return $id===1000083?new class($publish){
 private $publish;function __construct($publish){$this->publish=$publish;}
 function get_id(){return 1000083;}function get_sku(){return 'HPZ-APL-GERADE-2026';}
 function get_status(){return $this->publish?'publish':'draft';}
 function is_type($type){return $type==='simple';}function is_taxable(){return true;}
}:null;}
function get_queried_object_id(){global $q;return $q;}
function is_product(){return true;}
function get_post_status($id){global $publish;return $publish?'publish':'draft';}
function plugin_dir_url($file){return 'https://example.test/wp-content/plugins/hpz-apl-admin-preview/';}
function wp_register_style($name,$url,$deps,$v){}
function wp_print_styles($name){}
function wp_enqueue_script($name,$url,$deps,$v,$footer){}
function esc_attr($s){return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8');}
function wp_create_nonce($action){return 'test-nonce';}
function admin_url($path){return 'https://example.test/wp-admin/'.$path;}
function get_the_title($id){return 'Küchenarbeitsplatte nach Maß';}
function esc_html($s){return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8');}
require_once __DIR__.'/hpz-apl-admin-preview/hpz-apl-admin-preview.php';
$n=0;function check($yes,$why){global $n;$n++;if(!$yes)throw new RuntimeException($why);}
HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
$removedCallbacks=array_column($removed,'callback');
check(in_array('woocommerce_template_single_add_to_cart',$removedCallbacks,true),
    'native Woo button suppressed on the matching published product');
check(in_array('woocommerce_show_product_images',$removedCallbacks,true),
    'standard Woo gallery suppressed');
check(in_array('woocommerce_template_single_excerpt',$removedCallbacks,true),
    'redundant Woo description suppressed');
check(in_array('woocommerce_template_single_price',$removedCallbacks,true),
    'standard Woo prices suppressed, configurator price remains');
// The configurator removes ONLY the upper gallery/summary. The customer's
// long product description, technical data, reviews and recommendations must
// remain below it, just like on a normal WooCommerce product page.
foreach (['woocommerce_output_product_data_tabs','woocommerce_upsell_display',
    'woocommerce_output_related_products'] as $callback) {
    check(!in_array($callback,$removedCallbacks,true),
        'lower Woo product section retained: '.$callback);
}
$placed=false;
foreach ($actions as $action) {
    if ($action['hook']==='woocommerce_after_single_product_summary'
        &&$action['callback']===[HPZ_APL_Admin_Preview::class,'automatic']
        &&$action['priority']===5) $placed=true;
}
check($placed,'configurator appears before Woo product tabs at priority 10');
$found=false;
foreach($actions as $action){
 if($action['hook']==='woocommerce_single_product_summary'
     &&$action['callback']===[HPZ_APL_Admin_Preview::class,'compact_product_title'])$found=true;
}
check($found,'one H1 header replaces default product content');
ob_start();HPZ_APL_Admin_Preview::compact_product_title();$heading=ob_get_clean();
check(strpos($heading,'class="hpz-apl-minimal-h1"')!==false
    &&strpos($heading,'Küchenarbeitsplatte nach Maß')!==false,'only compact H1 is printed');
ob_start();HPZ_APL_Admin_Preview::top_configurator_style();$css=ob_get_clean();
check(strpos($css,'body.hpz-apl-compact-product')!==false
    &&strpos($css,'.product-gallery')!==false
    &&strpos($css,'form.cart{display:none')!==false
    &&strpos($css,'.product-main > .row')!==false,
    'compact CSS hides only this configurator product content');
$classes=HPZ_APL_Admin_Preview::compact_body_class(['single-product']);
check(in_array('hpz-apl-compact-product',$classes,true),'body scoping for three products');
$html=HPZ_APL_Admin_Preview::render();
check(strpos($html,'id="hpz-apl-konfigurator"')!==false
    &&strpos($html,'data-public-sale="true"')!==false,
    'configured Woo order adapter remains present and signed');
$old=count($removed);
$q=1000080;HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
check(count($removed)===$old,'L not enabled: original Woo actions untouched');
$q=1000083;$sale=false;HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
check(count($removed)===$old,'no sale: do not hide a different product');
$sale=true;$publish=false;HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
check(count($removed)===$old,'draft without approved admin test not publicly exposed');
echo "PASS $n scoped compact Woo product header and configurator checks\n";
