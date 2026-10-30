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
require_once __DIR__.'/hpz-apl-admin-preview/hpz-apl-admin-preview.php';
$n=0;function check($yes,$why){global $n;$n++;if(!$yes)throw new RuntimeException($why);}
HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
check(count($removed)===1,'exactly one native Woo add-to-cart hook removed');
check($removed[0]['hook']==='woocommerce_single_product_summary'&&$removed[0]['callback']==='woocommerce_template_single_add_to_cart'&&$removed[0]['priority']===30,'only default Woo button suppressed');
$found=false;foreach($actions as $action){if($action['hook']==='woocommerce_single_product_summary'&&$action['callback']===[HPZ_APL_Admin_Preview::class,'top_configurator_cta'])$found=true;}
check($found,'one accessible CTA takes default Woo form place');
ob_start();HPZ_APL_Admin_Preview::top_configurator_cta();$cta=ob_get_clean();
check(strpos($cta,'href="#hpz-apl-konfigurator"')!==false&&strpos($cta,'Jetzt konfigurieren')!==false,'CTA links to embedded configurator');
ob_start();HPZ_APL_Admin_Preview::top_configurator_style();$css=ob_get_clean();
check(strpos($css,'body.single-product form.cart')!==false&&strpos($css,'scroll-margin-top:110px')!==false,'only this page hides template overrides and scrolls to configurator');
$html=HPZ_APL_Admin_Preview::render();
check(strpos($html,'id="hpz-apl-konfigurator"')!==false&&strpos($html,'data-public-sale="true"')!==false,'target exists with real checkout and secure price endpoints');
$old=count($removed);$q=1000080;HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
ob_start();HPZ_APL_Admin_Preview::top_configurator_cta();$off=ob_get_clean();
check(count($removed)===$old&&$off==='','L-Form and U-Form unaffected');
$q=1000083;$sale=false;HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
check(count($removed)===$old,'disabled sale leaves default Woo actions untouched');
$sale=true;$publish=false;HPZ_APL_Admin_Preview::prepare_top_configurator_cta();
check(count($removed)===$old,'draft product does not gain public CTA');
echo "PASS $n product-only Woo CTA and configurator anchor checks\n";
