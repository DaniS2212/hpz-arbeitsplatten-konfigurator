<?php
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/hpz-apl-admin-preview/includes/admin-supplier-decor.php';
$GLOBALS['isAdmin']=true; $GLOBALS['allow']=true; $GLOBALS['hooks']=[];
function is_admin(){return $GLOBALS['isAdmin'];}
function current_user_can($cap){return $cap==='manage_woocommerce' && $GLOBALS['allow'];}
function esc_html($x){return htmlspecialchars($x,ENT_QUOTES,'UTF-8');}
function add_action($name,$cb,$priority=10,$count=1){$GLOBALS['hooks'][$name]=[$cb,$count];}
class DemoItem {
 private $id; private $value;
 function __construct($id,$value){$this->id=$id;$this->value=$value;}
 function get_product_id(){return $this->id;}
 function get_meta($key,$single=true){return $key==='_hpz_apl_manufacturing_v2'?$this->value:null;}
}
function check($ok,$label){if(!$ok)throw new RuntimeException($label);}
function rendered($item){ob_start();HPZ_APL_WP_Admin_Supplier_Decor::render(1,$item,null);return ob_get_clean();}
$record=['productId'=>1000083,'decorName'=>'Platinweiß','supplierDecorCode'=>'W980 ST7'];
HPZ_APL_WP_Admin_Supplier_Decor::register();
check(isset($GLOBALS['hooks']['woocommerce_after_order_itemmeta']),'hook not registered');
check(strpos(rendered(new DemoItem(1000083,$record)),'W980 ST7')!==false,'supplier code missing');
check(rendered(new DemoItem(1000080,$record))==='','L form affected');
check(rendered(new DemoItem(1000083,[]))==='','unverified record');
$GLOBALS['isAdmin']=false;
check(rendered(new DemoItem(1000083,$record))==='','public leak');
$GLOBALS['isAdmin']=true;$GLOBALS['allow']=false;
check(rendered(new DemoItem(1000083,$record))==='','permission leak');
$GLOBALS['allow']=true;
$record['supplierDecorCode']='<img onerror=alert(1)>';
check(strpos(rendered(new DemoItem(1000083,$record)),'<img')===false,'unsafe output');
echo "PASS WooCommerce admin supplier decor only\n";
