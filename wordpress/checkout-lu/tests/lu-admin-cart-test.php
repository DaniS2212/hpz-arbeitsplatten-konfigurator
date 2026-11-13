<?php
/** Isolated access/denial regression; no WordPress, Woo DB or order writes. */
declare(strict_types=1);
define('ABSPATH', __DIR__);
$GLOBALS['adminUser']=1;
$GLOBALS['adminSession']='admin-session-a';
$GLOBALS['adminCaps']=true;
$GLOBALS['adminLoggedIn']=true;
$GLOBALS['preview']=['enabled'=>true,'test_mode'=>true];
$GLOBALS['statuses']=[1000080=>'draft',1000081=>'draft'];
$GLOBALS['skus']=[1000080=>'HPZ-APL-L-FORM-2026',1000081=>'HPZ-APL-U-FORM-2026'];
$GLOBALS['transients']=[];
$GLOBALS['cartLines']=[];
$GLOBALS['notice']=[];
$GLOBALS['testChecks']=0;

function okay($condition,string $message):void {
  ++$GLOBALS['testChecks'];
  if(!$condition)throw new RuntimeException('Admin cart test FAIL: '.$message);
}
function get_current_user_id():int{return (int)$GLOBALS['adminUser'];}
function wp_get_session_token():string{return (string)$GLOBALS['adminSession'];}
function is_user_logged_in():bool{return (bool)$GLOBALS['adminLoggedIn'];}
function current_user_can($cap,$id=null):bool{
  return (bool)$GLOBALS['adminCaps'] && in_array($cap,['manage_options','edit_post'],true);
}
function get_transient($key){return $GLOBALS['transients'][$key]??false;}
function get_post_status($id):string{return $GLOBALS['statuses'][$id]??'none';}
function get_post_type($id):string{return in_array($id,[1000080,1000081],true)?'product':'post';}
class TestWooProduct {
  private int $id;
  public function __construct(int $id){$this->id=$id;}
  public function get_id():int{return $this->id;}
  public function get_sku():string{return $GLOBALS['skus'][$this->id]??'';}
  public function get_status():string{return get_post_status($this->id);}
  public function is_type($type):bool{return $type==='simple';}
  public function is_taxable():bool{return true;}
}
function wc_get_product($id){return new TestWooProduct((int)$id);}
class HPZ_APL_Admin_Preview {
  public static function options():array{return $GLOBALS['preview'];}
}
function add_action($hook,$method,$priority=10,$accepted=1):void {
  $GLOBALS['hooks'][$hook][]=['callback'=>$method,'priority'=>$priority];
}
function add_filter($hook,$method,$priority=10,$accepted=1):void {
  $GLOBALS['hooks'][$hook][]=['callback'=>$method,'priority'=>$priority];
}
class TestCart {
  public function get_cart():array{return $GLOBALS['cartLines'];}
}
class TestSession {
  public function get($key,$default=[]){return $GLOBALS['session'][$key]??$default;}
}
function WC(){return $GLOBALS['wc'];}
function wc_add_notice($message,$type='success'):void {$GLOBALS['notice'][]=[$message,$type];}
class WP_Error {
  public string $code;
  public function __construct($code,$message,$data=[]){$this->code=$code;}
  public function get_error_code():string{return $this->code;}
}
class TestRest {
  private string $route;
  public function __construct(string $route){$this->route=$route;}
  public function get_route():string{return $this->route;}
}
$GLOBALS['wc']=(object)['cart'=>new TestCart(),'session'=>new TestSession()];
require_once __DIR__.'/../HPZ_APL_WP_LU_Admin_Test.php';

$cls=HPZ_APL_LU_Admin_Test_98::class;
$cls::register();
okay(isset($GLOBALS['hooks']['woocommerce_checkout_process']),
  'native classic checkout is blocked at process stage');
okay(isset($GLOBALS['hooks']['woocommerce_checkout_create_order']),
  'pre-save classic WC order guard registered');
okay(isset($GLOBALS['hooks']['rest_pre_dispatch']),
  'Store API REST checkout guard registered');
okay(!$cls::canUse(1000080),'test is disabled before per-login grant');
okay(!$cls::canUse(1000081),'U disabled before per-login grant');
$key='hpz_lu_admin_cart_'.substr(hash('sha256','1|admin-session-a'),0,32);
$GLOBALS['transients'][$key]='active';
okay($cls::canUse(1000080),'admin session can test L draft');
okay($cls::canUse(1000081),'admin session can test U draft');
okay($cls::validTestProduct(wc_get_product(1000080),1000080),'exact SKU accepted');
okay(!$cls::canUse(1000083),'straight product never enters draft test');
$GLOBALS['adminLoggedIn']=false;
okay(!$cls::canUse(1000080),'guest cannot use privileged session');
$GLOBALS['adminLoggedIn']=true;$GLOBALS['adminCaps']=false;
okay(!$cls::canUse(1000080),'non-admin rejected with stolen session token');
$GLOBALS['adminCaps']=true;
$GLOBALS['adminSession']='admin-session-b';
okay(!$cls::canUse(1000080),'different browser login session rejected');
$GLOBALS['adminSession']='admin-session-a';
$GLOBALS['skus'][1000080]='untrusted-sku';
okay(!$cls::canUse(1000080),'changed product SKU cannot be sold via test');
$GLOBALS['skus'][1000080]='HPZ-APL-L-FORM-2026';
$GLOBALS['statuses'][1000080]='publish';
okay(!$cls::canUse(1000080),'test does not authorize published L product');
$GLOBALS['statuses'][1000080]='draft';
$GLOBALS['preview']['test_mode']=false;
okay(!$cls::canUse(1000080),'disabling site preview invalidates test token');
$GLOBALS['preview']['test_mode']=true;
unset($GLOBALS['transients'][$key]);
okay(!$cls::canUse(1000080),'expired transient invalidates test immediately');

// Critical invariant: a previously issued draft cart MUST NOT lead to an
// actual order even when the admin token has expired or user logged out.
$GLOBALS['cartLines']=['line-1'=>['product_id'=>1000080,'quantity'=>1]];
$cls::blockClassicCheckout();
okay(count($GLOBALS['notice'])===1
   &&$GLOBALS['notice'][0][1]==='error',
   'classic checkout creates failure notice BEFORE order');
$blocked=false;
try{$cls::blockOrderCreate(null,[]);}catch(RuntimeException $e){$blocked=true;}
okay($blocked,'Woo order object blocked before WC saves');
foreach(['/wc/store/v1/checkout','/wc/store/v1/checkout/123','/wc/store/v1/batch'] as $route) {
  $result=$cls::blockStoreCheckout(null,null,new TestRest($route));
  okay($result instanceof WP_Error
      &&$result->get_error_code()==='hpz_apl_lu_admin_no_order',
      'REST checkout path denied for draft in cart '.$route);
}
okay($cls::blockStoreCheckout(null,null,new TestRest('/wc/store/v1/cart'))===null,
    'cart read allowed for safe admin UI');
$GLOBALS['cartLines']=[];$GLOBALS['session']['cart']=[
   'draft-row'=>['product_id'=>1000081]
];
$blocked=false;
try{$cls::blockOrderCreate(null,[]);}catch(RuntimeException $e){$blocked=true;}
okay($blocked,'session-only cart is also blocked before order');
$GLOBALS['session']['cart']=[];
okay($cls::blockStoreCheckout(null,null,new TestRest('/wc/store/v1/checkout'))===null,
   'normal empty cart requests not globally broken');
echo 'PASS '.$GLOBALS['testChecks'].
  " admin-cart assertions; roles, session boundary, SKU/status, classic and Store API fail-closed. NO ORDER CREATED.\n";
