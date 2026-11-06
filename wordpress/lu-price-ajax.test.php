<?php
/** L/U price-preview AJAX permission regression, no WP or Woo instance. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
$hooks=[];$filters=[];$state=[
    'id'=>1000080,'enabled'=>true,'test_mode'=>true,'login'=>true,
    'admin'=>true,'edit'=>true,'draft'=>true,'type'=>'product',
    'sku'=>'HPZ-APL-L-FORM-2026',
];
function add_action($name,$fn,$priority=10,$args=1){global $hooks;$hooks[$name][]=$fn;}
function add_filter($name,$fn,$priority=10,$args=1){global $filters;$filters[$name][]=$fn;}
function add_shortcode($name,$fn){}
function wp_parse_args($a,$b){return array_merge($b,$a);}
function get_option($name,$default=null){
    global $state;
    if($name==='hpz_apl_admin_preview')return ['enabled'=>$state['enabled'],'test_mode'=>$state['test_mode']];
    return $default;
}
function is_user_logged_in(){global $state;return $state['login'];}
function current_user_can($cap,$id=null){global $state;return $cap==='manage_options'?$state['admin']:$state['edit'];}
function get_post_status($id){global $state;return $state['draft']?'draft':'publish';}
function get_post_type($id){global $state;return $state['type'];}
function wc_get_product($id){global $state;return new class($state['sku']) {
    private $sku;function __construct($s){$this->sku=$s;}function get_sku(){return $this->sku;}
};}
function wp_verify_nonce($nonce,$action){global $state;return $nonce==='test-nonce'
    &&$action==='hpz_apl_lu_price_'.$state['id'];}
function wp_create_nonce($action){global $state;return $action==='hpz_apl_lu_price_'.$state['id']
    ?'test-nonce':'';}
function get_queried_object_id(){global $state;return $state['id'];}
function is_product(){return true;}
function plugin_dir_url($file){return 'https://example.test/plugin/';}
function wp_register_style($a,$b,$c,$d){}
function wp_print_styles($a){}
function wp_enqueue_script($a,$b,$c,$d,$e){}
function esc_attr($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function admin_url($v){return 'https://example.test/wp-admin/'.$v;}
require_once __DIR__.'/hpz-apl-admin-preview/hpz-apl-admin-preview.php';
$n=0;
function ok($b,$name){global $n;++$n;if(!$b)throw new RuntimeException('FAIL '.$name);}
ok(isset($hooks['wp_ajax_hpz_apl_lu_price_preview']),'logged-in L/U admin-only quote hook');
ok(!isset($hooks['wp_ajax_nopriv_hpz_apl_lu_price_preview']),'no anonymous quote endpoint');
ok(!isset($hooks['wp_ajax_nopriv_hpz_apl_lu_add']),'no anonymous Woo checkout on draft');
ok(HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000080,'test-nonce'),'L draft with role and nonce');
ok(!HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000083,'test-nonce'),'Gerade cannot use L quote');
ok(!HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000080,'bad'),'expired nonce denied');
foreach(['enabled','test_mode','login','admin','edit','draft'] as $key){
    $old=$state[$key];$state[$key]=false;
    ok(!HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000080,'test-nonce'),$key.' required');
    $state[$key]=$old;
}
$state['type']='post';
ok(!HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000080,'test-nonce'),'product type required');
$state['type']='product';$state['sku']='WRONG';
ok(!HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000080,'test-nonce'),'SKU exact');
$state['sku']='HPZ-APL-L-FORM-2026';
$html=HPZ_APL_Admin_Preview::render();
ok(strpos($html,'action=hpz_apl_lu_price_preview')!==false,'L draft shows private price endpoint');
ok(strpos($html,'data-price-nonce="test-nonce"')!==false,'L draft embeds nonce');
ok(strpos($html,'data-cart-endpoint=')===false,'admin price preview never adds checkout button');
ok(strpos($html,'supplierNetCents')===false,'supplier costs never exposed by render');
ok(HPZ_APL_Admin_Preview::purchasable(true,new class{
    function get_id(){return 1000080;}
})===false,'draft never purchasable');
$state['id']=1000081;$state['sku']='HPZ-APL-U-FORM-2026';
ok(HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000081,'test-nonce'),'U product independently allowed');
ok(!HPZ_APL_Admin_Preview::lu_price_preview_allowed(1000080,'test-nonce'),
   'cross-SKU and nonce not shared');
echo "PASS $n L/U admin-only Ajax permissions; no Woo release\n";
