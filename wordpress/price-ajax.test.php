<?php
declare(strict_types=1);
define('ABSPATH', __DIR__);
$hooks=[];$filters=[];$state=['enabled'=>true,'test_mode'=>true,'login'=>true,'admin'=>true,'edit'=>true,'draft'=>true,'type'=>'product','sku'=>'HPZ-APL-GERADE-2026'];
function add_action($hook,$fn,$priority=10,$args=1){global $hooks;$hooks[$hook][]=$fn;}
function add_filter($hook,$fn,$priority=10,$args=1){global $filters;$filters[$hook][]=$fn;}
function add_shortcode($name,$fn){}
function wp_parse_args($a,$defaults){return array_merge($defaults,$a);}
function get_option($name,$default){global $state;return ['enabled'=>$state['enabled'],'test_mode'=>$state['test_mode']];}
function is_user_logged_in(){global $state;return $state['login'];}
function current_user_can($cap,$id=null){global $state;return $cap==='manage_options'?$state['admin']:$state['edit'];}
function get_post_status($id){global $state;return $state['draft']?'draft':'publish';}
function get_post_type($id){global $state;return $state['type'];}
function wc_get_product($id){global $state;return new class($state['sku']) {private $sku;function __construct($s){$this->sku=$s;}function get_sku(){return $this->sku;}};}
function wp_verify_nonce($nonce,$action){return $nonce==='good-nonce' && $action==='hpz_apl_price_1000083';}
function get_queried_object_id(){return 1000083;}
function is_product(){return true;}
function plugin_dir_url($file){return 'https://example.test/plugin/';}
function wp_register_style($h,$url,$deps,$version){}
function wp_print_styles($h){echo '';}
function wp_enqueue_script($h,$url,$deps,$version,$footer){}
function esc_attr($text){return htmlspecialchars((string)$text,ENT_QUOTES,'UTF-8');}
function admin_url($part){return 'https://example.test/wp-admin/'.$part;}
function wp_create_nonce($action){return $action==='hpz_apl_price_1000083'?'good-nonce':'';}
require_once __DIR__.'/hpz-apl-admin-preview/hpz-apl-admin-preview.php';
$checks=0;
function ensure($ok,$label){global $checks;++$checks;if(!$ok)throw new RuntimeException($label);}
ensure(isset($hooks['wp_ajax_hpz_apl_price_preview']),'logged-in Ajax route registered');
ensure(!isset($hooks['wp_ajax_nopriv_hpz_apl_price_preview']),'no public Ajax route');
ensure(HPZ_APL_Admin_Preview::price_preview_allowed(1000083,'good-nonce'),'admin draft and nonce allowed');
ensure(!HPZ_APL_Admin_Preview::price_preview_allowed(1000080,'good-nonce'),'L draft not V3 priced');
ensure(!HPZ_APL_Admin_Preview::price_preview_allowed(999985,'good-nonce'),'sockel not priced');
ensure(!HPZ_APL_Admin_Preview::price_preview_allowed(1000083,'bad'),'nonce denied');
foreach (['enabled','test_mode','login','admin','edit','draft'] as $key){$old=$state[$key];$state[$key]=false;ensure(!HPZ_APL_Admin_Preview::price_preview_allowed(1000083,'good-nonce'),$key.' denied');$state[$key]=$old;}
$state['type']='post';ensure(!HPZ_APL_Admin_Preview::price_preview_allowed(1000083,'good-nonce'),'not a product');$state['type']='product';
$state['sku']='wrong';ensure(!HPZ_APL_Admin_Preview::price_preview_allowed(1000083,'good-nonce'),'sku mismatch');$state['sku']='HPZ-APL-GERADE-2026';
$html=HPZ_APL_Admin_Preview::render();
ensure(strpos($html,'data-price-endpoint="https://example.test/wp-admin/admin-ajax.php?action=hpz_apl_price_preview"')!==false,'price endpoint attached');
ensure(strpos($html,'data-price-nonce="good-nonce"')!==false,'product nonce attached');
ensure(strpos($html,'supplierNet')===false && strpos($html,'unitGrossReferenceCents')===false,'no costs or browser-set price in HTML');
ensure(HPZ_APL_Admin_Preview::purchasable(true, new class{function get_id(){return 1000083;}})===false,'purchase gate still closed');
printf("PASS %d PHP test-mode assertions\n",$checks);
