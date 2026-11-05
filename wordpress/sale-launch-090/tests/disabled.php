<?php
declare(strict_types=1);
define('ABSPATH',__DIR__);
$actions=[];$filters=[];$notices=[];$settings=[];
function add_action($name,$callback,$priority=10,$args=1){global $actions;$actions[$name]=[$callback,$priority,$args];}
function add_filter($name,$callback,$priority=10,$args=1){global $filters;$filters[$name]=[$callback,$priority,$args];}
function add_shortcode($name,$callback){global $actions;$actions['shortcode_'.$name]=$callback;}
function get_option($name,$default=[]){return $name==='hpz_apl_admin_preview'?['enabled'=>true,'test_mode'=>true,'placement'=>'automatic']:$default;}
function wp_parse_args($actual,$defaults){return array_merge($defaults,$actual);}
function current_user_can($cap,$id=null){return false;}
function is_user_logged_in(){return false;}
function is_product(){return true;}
function get_queried_object_id(){return 1000083;}
function wp_get_post_parent_id($id){return 0;}
function get_post_status($id){return 'draft';}
function wc_add_notice($message,$type){global $notices;$notices[]=[$message,$type];}
function wc_has_notice($text,$type){return false;}
function WC(){return null;}
require_once __DIR__.'/../../hpz-apl-admin-preview/hpz-apl-admin-preview.php';
$checks=0;function ck($yes,$msg){global $checks;$checks++;if(!$yes)throw new RuntimeException($msg);}
ck(!HPZ_APL_WP_Straight_Runtime_09::canSell(),'public sale option disabled by default');
HPZ_APL_WP_Straight_Runtime_09::register();
ck(!isset($actions['wp_ajax_nopriv_hpz_apl_public_quote']),'no guest quote endpoint');
ck(!isset($actions['wp_ajax_nopriv_hpz_apl_add_configured']),'no guest cart endpoint');
HPZ_APL_WP_LU_Runtime_11::register();
ck(!HPZ_APL_WP_LU_Runtime_11::canSell(1000080),'L-form remains unavailable by default');
ck(!HPZ_APL_WP_LU_Runtime_11::canSell(1000081),'U-form remains unavailable by default');
ck(!isset($actions['wp_ajax_nopriv_hpz_apl_lu_quote']),'no unaudited L/U quote route');
ck(!isset($actions['wp_ajax_nopriv_hpz_apl_lu_add']),'no unaudited L/U cart route');
ck(!isset($filters['woocommerce_store_api_cart_item_quantity_validation']),'no new purchase filters');
ck(isset($actions['init']),'runtime planned only at WordPress init');
ck(isset($filters['woocommerce_is_purchasable']),'old purchase gate retained');
ck(HPZ_APL_Admin_Preview::target(1000083),'target straight still recognized');
ck(HPZ_APL_Admin_Preview::target(1000080)&&HPZ_APL_Admin_Preview::target(1000081),'L/U recognized');
foreach([1000083,1000080,1000081] as $id){
 $product=new class($id){private $id;function __construct($id){$this->id=$id;}function get_id(){return $this->id;}};
 ck(HPZ_APL_Admin_Preview::purchasable(true,$product)===false,'purchasability denied for '.$id);
 ck(HPZ_APL_Admin_Preview::add_to_cart(true,$id,1)===false,'cart denied for '.$id);
}
ck(HPZ_APL_Admin_Preview::add_to_cart(true,999985,1)===true,'other products never changed');
ck(!HPZ_APL_Admin_Preview::allowed(),'guests cannot see admin draft config');
ck(!HPZ_APL_WP_Straight_Runtime_09::canRenderPublic(1000083),'guests cannot see public config without release');
ck(HPZ_APL_Admin_Preview::render()==='','no guest render');
ck(HPZ_APL_WP_Supplier_Proofs_09::find(str_repeat('0',64))===null,'proof store empty');
try{HPZ_APL_WP_Supplier_Proofs_09::saveFromAdmin([],[],null);ck(false,'guest proof save');}
catch(InvalidArgumentException $e){ck(true,'guest cannot approve supplier');}
echo "PASS $checks 0.9 default-off WordPress plugin checks\n";
