<?php
declare(strict_types=1);
define('ABSPATH', __DIR__);
$GLOBALS['hpz_setting']=['enabled'=>true,'token'=>'github_pat_EXAMPLE_READ_ONLY_TEST_TOKEN_12345678'];
$GLOBALS['wp_version']='6.6';
$GLOBALS['http_mode']='valid';
$GLOBALS['bytes']=str_repeat('x',1500);
$GLOBALS['log']=[];$GLOBALS['hooks']=[];$GLOBALS['checks']=0;
$GLOBALS['status_options']=[];$GLOBALS['refresh_calls']=0;$GLOBALS['deleted_transients']=[];
$GLOBALS['installed_version']='1.0.3.11';$GLOBALS['simulated_update_check']=false;
$GLOBALS['update_transient']=null;$GLOBALS['cron_events']=[];
$GLOBALS['auto_disabled']=false;$GLOBALS['auto_result']=true;
$GLOBALS['update_calls']=[];$GLOBALS['updater_lock']=false;$GLOBALS['lock_forced']=false;$GLOBALS['locks_released']=0;$GLOBALS['fake_doing_cron']=true;
class WP_Error {public $code;function __construct($code,$message){$this->code=$code;}}
function is_wp_error($value){return $value instanceof WP_Error;}
function get_option($name,$fallback=null){return $name==='hpz_apl_github_updater'?$GLOBALS['hpz_setting']:($GLOBALS['status_options'][$name]??$fallback);}
function update_option($name,$value,$autoload=null){$GLOBALS['status_options'][$name]=$value;return true;}
function get_file_data($path,$keys,$context=''){return ['Version'=>$GLOBALS['installed_version']];}
function current_user_can($cap){return $cap==='manage_options';}
function admin_url($path=''){return 'https://example.test/wp-admin/'.$path;}
function esc_url($v){return htmlspecialchars($v,ENT_QUOTES,'UTF-8');}
function esc_html($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function esc_attr($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function checked($actual,$expected=true,$echo=true){$str=$actual==$expected?'checked="checked"':'';if($echo)echo $str;return $str;}
function wp_nonce_field($action){echo '<input type="hidden" name="_wpnonce" value="TEST">';}
function submit_button($label='Save'){echo '<button>'.esc_html($label).'</button>';}
function wp_date($format,$timestamp){return gmdate($format,$timestamp);}
function delete_site_transient($name){$GLOBALS['deleted_transients'][]=$name;if($name==='update_plugins'&&$GLOBALS['simulated_update_check'])$GLOBALS['update_transient']=null;}
function wp_update_plugins(){
 $GLOBALS['refresh_calls']++;
 if(!$GLOBALS['simulated_update_check'])return;
 $offer=HPZ_APL_GitHub_Updater::offer(false,['Version'=>$GLOBALS['installed_version']],HPZ_APL_GitHub_Updater::PLUGIN,[]);
 $item=$offer?(object)array_merge($offer,['plugin'=>HPZ_APL_GitHub_Updater::PLUGIN,'new_version'=>$offer['version']]):null;
 $GLOBALS['update_transient']=(object)['response'=>$item?[
  'other/example.php'=>(object)['plugin'=>'other/example.php','new_version'=>'9.0.0'],
  HPZ_APL_GitHub_Updater::PLUGIN=>$item]:[]];
}
function get_site_transient($key){return $key==='update_plugins'?$GLOBALS['update_transient']:null;}
function wp_doing_cron(){return $GLOBALS['fake_doing_cron'];}
function wp_next_scheduled($hook){return $GLOBALS['cron_events'][$hook]['timestamp']??false;}
function wp_schedule_event($timestamp,$recurrence,$hook){$GLOBALS['cron_events'][$hook]=['timestamp'=>$timestamp,'recurrence'=>$recurrence];return true;}
function wp_clear_scheduled_hook($hook){unset($GLOBALS['cron_events'][$hook]);return 1;}
class WP_Upgrader{
 public static function create_lock($name){if($GLOBALS['lock_forced'])return false;$GLOBALS['updater_lock']=true;return true;}
 public static function release_lock($name){$GLOBALS['updater_lock']=false;$GLOBALS['locks_released']++;return true;}
}
class WP_Automatic_Updater{
 public function is_disabled(){return $GLOBALS['auto_disabled'];}
 public function update($type,$item){
  $GLOBALS['update_calls'][]=[$type,$item->plugin??'', $item->new_version??''];
  if($GLOBALS['auto_result']===true)$GLOBALS['installed_version']=$item->new_version;
  return $GLOBALS['auto_result'];
 }
}
function wp_safe_redirect($url){$GLOBALS['redirect_to']=$url;}
function get_bloginfo($name){return $GLOBALS['wp_version'];}
function add_filter($name,$callback,$priority=10,$args=1){$GLOBALS['hooks'][$name]=$callback;}
function add_action($name,$callback){$GLOBALS['hooks'][$name]=$callback;}
function wp_remote_retrieve_response_code($value){return $value['status'];}
function wp_remote_retrieve_body($value){return $value['body']??'';}
function wp_remote_retrieve_header($value,$header){return $value['headers'][$header]??'';}
function wp_tempnam($name){return tempnam(sys_get_temp_dir(),'hpztest');}
function download_url($url,$timeout){
 $GLOBALS['log'][]=['type'=>'redirect','url'=>$url];
 $tmp=tempnam(sys_get_temp_dir(),'hpzcdn');
 file_put_contents($tmp,$GLOBALS['http_mode']==='bad-hash'?'invalid':$GLOBALS['bytes']);
 return $tmp;
}
function wp_remote_get($url,$args){
 $GLOBALS['log'][]=['type'=>'get','url'=>$url,'args'=>$args];
 if(strpos($url,'/releases/latest')!==false){
  if($GLOBALS['http_mode']==='network')return new WP_Error('network','down');
  $release=['tag_name'=>'hpz-apl-v1.0.3.87','draft'=>false,'prerelease'=>false,
   'assets'=>[['id'=>123456,'name'=>'hpz-apl-admin-preview-1.0.3.87.zip',
    'state'=>'uploaded','size'=>1500,'digest'=>'sha256:'.hash('sha256',$GLOBALS['bytes'])]]];
  if($GLOBALS['http_mode']==='wrong-tag')$release['tag_name']='v2.0';
  if($GLOBALS['http_mode']==='missing-hash')unset($release['assets'][0]['digest']);
  if($GLOBALS['http_mode']==='wrong-asset')$release['assets'][0]['name']='source.zip';
  return ['status'=>200,'body'=>json_encode($release)];
 }
 if(strpos($url,'/releases/assets/123456')!==false){
  if($GLOBALS['http_mode']==='missing-redirect')return ['status'=>500];
  if($GLOBALS['http_mode']==='evil-redirect')return ['status'=>302,'headers'=>['location'=>'http://127.0.0.1/admin']];
  if($GLOBALS['http_mode']==='direct'){
   file_put_contents($args['filename'],$GLOBALS['bytes']);
   return ['status'=>200];
  }
  return ['status'=>302,'headers'=>['location'=>'https://release-assets.githubusercontent.com/asset/signed?key=abc']];
 }
 return ['status'=>404];
}
function checkit($pass,$name){++$GLOBALS['checks'];if(!$pass)throw new RuntimeException($name);}
function packageUrl(){return 'https://api.github.com/repos/DaniS2212/hpz-arbeitsplatten-konfigurator/releases/assets/123456';}
require __DIR__.'/hpz-apl-admin-preview/includes/github-updater.php';
HPZ_APL_GitHub_Updater::init();
foreach(['update_plugins_github.com','upgrader_pre_download','auto_update_plugin','plugins_api','admin_post_hpz_apl_updater_check'] as $hook)
 checkit(isset($GLOBALS['hooks'][$hook]),'missing hook '.$hook);
checkit(HPZ_APL_GitHub_Updater::offer(false,['Version'=>'1.0.3'],'other/plugin.php',[])===false,'other plugin');
$info=HPZ_APL_GitHub_Updater::offer(false,['Version'=>'1.0.3'],HPZ_APL_GitHub_Updater::PLUGIN,[]);
checkit($info['version']==='1.0.3.87'&&$info['package']===packageUrl(),'trusted release');
checkit(strpos(json_encode($info),'EXAMPLE_READ_ONLY')===false,'token leaked');
checkit(HPZ_APL_GitHub_Updater::offer(false,['Version'=>'1.0.3.99'],HPZ_APL_GitHub_Updater::PLUGIN,[])===false,'downgrade');
foreach(['wrong-tag','missing-hash','wrong-asset','network'] as $mode){
 $GLOBALS['http_mode']=$mode;
 checkit(HPZ_APL_GitHub_Updater::offer(false,['Version'=>'1.0.3'],HPZ_APL_GitHub_Updater::PLUGIN,[])===false,'bad release '.$mode);
}
$GLOBALS['http_mode']='valid';
checkit(HPZ_APL_GitHub_Updater::auto(false,(object)['plugin'=>HPZ_APL_GitHub_Updater::PLUGIN])===true,'auto target');
checkit(HPZ_APL_GitHub_Updater::auto(false,(object)['plugin'=>'other/other.php'])===false,'auto other');
$GLOBALS['wp_version']='6.5';
checkit(HPZ_APL_GitHub_Updater::auto(false,(object)['plugin'=>HPZ_APL_GitHub_Updater::PLUGIN])===false,'rollback WP floor');
$GLOBALS['wp_version']='6.6';
$GLOBALS['hpz_setting']['enabled']=false;
checkit(HPZ_APL_GitHub_Updater::offer(false,['Version'=>'1.0.3'],HPZ_APL_GitHub_Updater::PLUGIN,[])===false,'disabled');
$GLOBALS['hpz_setting']['enabled']=true;
checkit(HPZ_APL_GitHub_Updater::download(false,'https://example.com/plugin.zip',null,['plugin'=>'other/plugin.php'])===false,'foreign package');
foreach(['direct','valid'] as $mode){
 $GLOBALS['http_mode']=$mode;
 $file=HPZ_APL_GitHub_Updater::download(false,packageUrl(),null,['plugin'=>HPZ_APL_GitHub_Updater::PLUGIN]);
 checkit(is_string($file)&&file_exists($file),'download '.$mode);
 checkit(hash_file('sha256',$file)===hash('sha256',$GLOBALS['bytes']),'digest '.$mode);
 unlink($file);
}
$api=array_values(array_filter($GLOBALS['log'],function($v){return $v['type']==='get'&&strpos($v['url'],'/releases/assets/')!==false;}));
checkit(count($api)>=2 && isset($api[0]['args']['headers']['Authorization']),'private API bearer');
$cdn=array_values(array_filter($GLOBALS['log'],function($v){return $v['type']==='redirect';}));
checkit(count($cdn)>=1,'signed CDN without token headers');
foreach(['evil-redirect','bad-hash','missing-redirect'] as $mode){
 $GLOBALS['http_mode']=$mode;
 $res=HPZ_APL_GitHub_Updater::download(false,packageUrl(),null,['plugin'=>HPZ_APL_GitHub_Updater::PLUGIN]);
 checkit(is_wp_error($res),'reject '.$mode);
}
checkit(HPZ_APL_GitHub_Updater::download(false,packageUrl(),null,['plugin'=>'other/other.php'])===false,'no foreign install hook');

// Regression: clicking "Details der Version..." must not hit WordPress.org's
// missing-plugin response. The callback returns a trusted object only for ours.
$details=HPZ_APL_GitHub_Updater::information(false,'plugin_information',(object)['slug'=>'hpz-apl-admin-preview']);
checkit(is_object($details)&&($details->version??null)==='1.0.3.87','private plugin information version');
checkit(($details->name??'')==='Holz-Liebling Arbeitsplatten – Admin-Vorschau','plugin info name');
checkit(isset($details->sections['description'],$details->sections['changelog']),'plugin information sections');
checkit(!isset($details->download_link),'info modal must not expose unauthenticated download');
checkit(strpos(json_encode($details),'EXAMPLE_READ_ONLY')===false,'info modal must not contain private token');
checkit(HPZ_APL_GitHub_Updater::information(false,'plugin_information',(object)['slug'=>'other-plugin'])===false,'other plugin information unaffected');
checkit(HPZ_APL_GitHub_Updater::information(false,'query_plugins',(object)['slug'=>'hpz-apl-admin-preview'])===false,'other actions unaffected');
$foreign=(object)['name'=>'Foreign'];
checkit(HPZ_APL_GitHub_Updater::information($foreign,'plugin_information',(object)['slug'=>'other-plugin'])===$foreign,'existing foreign result intact');

// A failed private request should retain a useful local information window.
$GLOBALS['http_mode']='network';
$details=HPZ_APL_GitHub_Updater::information(false,'plugin_information',(object)['slug'=>'hpz-apl-admin-preview']);
checkit(is_object($details)&&($details->version??null)==='1.0.3.11','plugin information fallback without network');
$diag=get_option('hpz_apl_updater_status');
checkit(($diag['state']??'')==='error','last update-check error recorded');
checkit(!empty($diag['checked_at'])&&($diag['checked_at']<=time()),'last check timestamp recorded');
checkit(strpos(json_encode($diag),'EXAMPLE_READ_ONLY')===false,'diagnostics never reveal token');

// A successful update check records release version without installing any ZIP.
$GLOBALS['http_mode']='valid';
HPZ_APL_GitHub_Updater::offer(false,['Version'=>'1.0.3.11'],HPZ_APL_GitHub_Updater::PLUGIN,[]);
$diag=get_option('hpz_apl_updater_status');
checkit(($diag['state']??'')==='ok'&&($diag['version']??'')==='1.0.3.87','last checked release recorded');
HPZ_APL_GitHub_Updater::refreshUpdateCheck();
checkit(in_array('update_plugins',$GLOBALS['deleted_transients'],true),'manual refresh clears update transient');
checkit($GLOBALS['refresh_calls']===1,'manual refresh invokes WP native check once');

// The settings page must show status, an admin-nonced manual-check form,
// and never display the token or an install action.
ob_start();HPZ_APL_GitHub_Updater::page();$html=ob_get_clean();
checkit(strpos($html,'1.0.3.11')!==false,'installed version shown');
checkit(strpos($html,'1.0.3.87')!==false,'latest release shown');
checkit(strpos($html,'hpz_apl_updater_check')!==false,'manual check action present');
checkit(strpos($html,'_wpnonce')!==false,'manual check form includes nonce');
checkit(strpos($html,'EXAMPLE_READ_ONLY')===false,'token never displayed in settings');


// Regression: a successful private GitHub release must be automatically
// installed on our own short, native WP-Cron schedule (not 12h after merge).
checkit(isset($GLOBALS['hooks']['cron_schedules']),'native cron interval registered');
checkit(isset($GLOBALS['hooks']['hpz_apl_update_poll']),'dedicated plugin-only job registered');
$schedules=HPZ_APL_GitHub_Updater::cronSchedules([]);
checkit(($schedules['hpz_apl_15_minutes']['interval']??0)===900,'15-minute WP-Cron interval');
HPZ_APL_GitHub_Updater::scheduleCron();
$at=wp_next_scheduled('hpz_apl_update_poll');
checkit(is_int($at)&&$at>time(),'schedule an upcoming automatic update check');
HPZ_APL_GitHub_Updater::scheduleCron();
checkit(wp_next_scheduled('hpz_apl_update_poll')===$at,'never duplicate cron events');

$GLOBALS['simulated_update_check']=true;
$GLOBALS['installed_version']='1.0.3.11';
$GLOBALS['http_mode']='valid';
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit($GLOBALS['installed_version']==='1.0.3.87','new trusted private release installed automatically');
checkit(count($GLOBALS['update_calls'])===1,'only one automatic plugin updater invoked');
checkit($GLOBALS['update_calls'][0]===['plugin',HPZ_APL_GitHub_Updater::PLUGIN,'1.0.3.87'],'auto updater receives exact plugin and version');
checkit($GLOBALS['updater_lock']===false&&$GLOBALS['locks_released']===1,'WordPress automatic-updater lock released');
$install=get_option('hpz_apl_updater_install_status',[]);
checkit(($install['state']??'')==='installed'&&($install['version']??'')==='1.0.3.87','successful installation recorded');
checkit(strpos(json_encode($install),'EXAMPLE_READ_ONLY')===false,'installation status does not expose credentials');

HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit(count($GLOBALS['update_calls'])===1,'already current: no second install');
$GLOBALS['installed_version']='1.0.3.11';
$GLOBALS['lock_forced']=true;
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit(count($GLOBALS['update_calls'])===1&&$GLOBALS['locks_released']===1,'concurrent updater lock prevents collision');
checkit((get_option('hpz_apl_updater_install_status',[])['state']??'')==='deferred','lock collision visible to admin');
$GLOBALS['lock_forced']=false;
$GLOBALS['auto_disabled']=true;
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit(count($GLOBALS['update_calls'])===1,'WordPress global update-disable respected');
checkit((get_option('hpz_apl_updater_install_status',[])['state']??'')==='blocked','automatic-update block visible to admin');
$GLOBALS['auto_disabled']=false;
$GLOBALS['auto_result']=new WP_Error('update_failed','fake error must never reach UI');
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit((get_option('hpz_apl_updater_install_status',[])['state']??'')==='error','failed automatic installation recorded');
checkit(strpos(json_encode(get_option('hpz_apl_updater_install_status',[])),'fake error')===false,'no raw upstream errors in diagnostics');
$GLOBALS['auto_result']=false;
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit((get_option('hpz_apl_updater_install_status',[])['state']??'')==='blocked','filesystem skip reported without false success');
$GLOBALS['auto_result']=true;
$GLOBALS['http_mode']='missing-hash';
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit(count($GLOBALS['update_calls'])===3,'unsigned release never starts another install');
$GLOBALS['http_mode']='valid';
$GLOBALS['fake_doing_cron']=false;
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit(count($GLOBALS['update_calls'])===3,'direct front-end requests must never install');
$GLOBALS['fake_doing_cron']=true;

$GLOBALS['hpz_setting']['enabled']=false;
HPZ_APL_GitHub_Updater::scheduleCron();
checkit(wp_next_scheduled('hpz_apl_update_poll')===false,'disable immediately removes plugin cron');
HPZ_APL_GitHub_Updater::runScheduledUpdate();
checkit(count($GLOBALS['update_calls'])===3,'disabled plugin never installs');
$GLOBALS['hpz_setting']['enabled']=true;
$GLOBALS['installed_version']='1.0.3.11';
HPZ_APL_GitHub_Updater::scheduleCron();
ob_start();HPZ_APL_GitHub_Updater::page();$html=ob_get_clean();
checkit(strpos($html,'Naechster automatischer Lauf')!==false,'admin page shows next automatic poll');
checkit(strpos($html,'Letzter Installationsversuch')!==false,'admin page shows installation status separate from release detection');
checkit(strpos($html,'EXAMPLE_READ_ONLY')===false,'scheduled diagnostics must never leak token');

echo "PASS {$GLOBALS['checks']} private GitHub updater assertions\n";
