<?php
/** LOCAL TEST FIXTURE ONLY. Models WordPress hooks/roles; never bundled in ZIP. */
declare(strict_types=1);
define('ABSPATH', __DIR__);
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if (strpos($path,'/assets/')===0) return false;
function add_action($name,$fn,$priority=10,$args=1){}
function add_filter($name,$fn,$priority=10,$args=1){}
function add_shortcode($name,$fn){}
function wp_parse_args($value,$defaults){return array_merge($defaults,$value);}
function get_option($name,$default){return ['enabled'=>($_GET['mode']??'')!=='disabled','test_mode'=>($_GET['mode']??'')!=='no-test'];}
function is_user_logged_in(){return ($_GET['mode']??'')!=='visitor';}
function current_user_can($cap,$id=null){return ($_GET['mode']??'')!=='visitor';}
function get_post_status($id){return ($_GET['mode']??'')==='published'?'publish':'draft';}
function get_post_type($id){return 'product';}
function wc_get_product($id){return new class{function get_sku(){return ($_GET['mode']??'')==='wrong-sku'?'wrong':'HPZ-APL-GERADE-2026';}};}
function wp_verify_nonce($nonce,$action){return $nonce==='testnonce' && $action==='hpz_apl_price_1000083';}
function wp_create_nonce($action){return $action==='hpz_apl_price_1000083'?'testnonce':'';}
function get_queried_object_id(){return (int)($_GET['productId']??1000083);}
function is_product(){return true;}
function wp_get_post_parent_id($id){return 0;}
function plugin_dir_url($file){return 'http://'.$_SERVER['HTTP_HOST'].'/';}
function admin_url($path){return 'http://'.$_SERVER['HTTP_HOST'].'/'.$path;}
function wp_register_style($name,$url,$deps,$version){}
function wp_print_styles($name){echo '<link rel="stylesheet" href="/assets/host.css">';}
function wp_enqueue_script($name,$url,$deps,$version,$footer){}
function esc_attr($text){return htmlspecialchars((string)$text,ENT_QUOTES,'UTF-8');}
function WC(){return new class {public $customer;function __construct(){$this->customer=new class{function get_shipping_country(){return in_array($_GET['mode']??'',['DE','CH'],true)?$_GET['mode']:'';}};}};}
function wp_send_json_error($data,$status=200){http_response_code($status);header('Content-Type: application/json');echo json_encode(['success'=>false,'data'=>$data]);exit;}
function wp_send_json_success($data,$status=200){http_response_code($status);header('Content-Type: application/json');echo json_encode(['success'=>true,'data'=>$data]);exit;}
require_once __DIR__.'/hpz-apl-admin-preview/hpz-apl-admin-preview.php';
if ($path==='/admin-ajax.php' && ($_GET['action']??'')==='hpz_apl_price_preview') {
    HPZ_APL_Admin_Preview::price_preview();
    exit;
}
if ($path==='/') {
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="de"><meta name="viewport" content="width=device-width,initial-scale=1"><title>0.6.0 – WordPress-Testmodus</title><style>body{margin:20px;font-family:system-ui;background:#f7f8f6}main{max-width:1350px;margin:auto}.fixture{margin-bottom:18px;color:#153f48;font-weight:600}</style><main><p class="fixture">Lokaler WordPress-Testmodus · bestehender Produktkopf</p>';
    echo HPZ_APL_Admin_Preview::render();
    echo '<p class="fixture">Bestehende ausführliche Produktbeschreibung</p></main><script src="/assets/bootstrap.js"></script></html>';
    exit;
}
http_response_code(404);
