<?php
/**
 * Regression: preserve historical freight option as source only.
 * NEVER install, register, or enable the 190cm Woo rate filter.
 */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../optional-freight-190/HPZ_APL_WP_Freight_190.php';
$checks=0;
function archivedAssert(bool $condition,string $label):void {
    global $checks;
    $checks++;
    if (!$condition) throw new RuntimeException('FAIL dormant freight: '.$label);
}
$options=[];
function get_option($key,$default=[]) {global $options; return $options[$key]??$default;}
function configuredLine(int $id,int $length,array $extra=[]):array {
    $key=$id===1000083?'hpz_apl_v08':'hpz_apl_lu_v1';
    return ['product_id'=>$id,$key=>['config'=>[
        'productId'=>$id,'dimensions'=>array_merge(['L1'=>$length,'B1'=>600],$extra)
    ]]];
}
$plugin=file_get_contents(__DIR__.'/../../hpz-apl-admin-preview/hpz-apl-admin-preview.php');
$bundle=file_get_contents(__DIR__.'/../../../build-plugin.mjs');
$woo=file_get_contents(__DIR__.'/../HPZ_APL_WP_Woo_Context.php');
archivedAssert(is_string($plugin)&&strpos($plugin,'HPZ_APL_WP_Freight_190')===false
    &&strpos($plugin,"freight-190.php")===false,'active plugin contains no freight class/hook');
archivedAssert(is_string($bundle)&&strpos($bundle,'HPZ_APL_WP_Freight_190')===false
    &&strpos($bundle,"freight-190.php")===false,'release zip excludes archived freight code');
archivedAssert(is_string($woo)&&strpos($woo,'HPZ_APL_WP_Freight_190')===false,
    'active Woo adapter remains independent of optional freight');
foreach ([1000083,1000080,1000081] as $id) {
    archivedAssert(HPZ_APL_WP_Freight_190::requiresFreight(configuredLine($id,1899))===false,
        $id.' below threshold');
    archivedAssert(HPZ_APL_WP_Freight_190::requiresFreight(configuredLine($id,1900))===true,
        $id.' at threshold');
    archivedAssert(HPZ_APL_WP_Freight_190::requiresFreight(configuredLine($id,1901))===true,
        $id.' above threshold');
}
archivedAssert(HPZ_APL_WP_Freight_190::requiresFreight(
    configuredLine(1000081,1200,['L2'=>1200,'L3'=>1900]))===true,
    'U third leg still supported in stored code');
archivedAssert(HPZ_APL_WP_Freight_190::requiresFreight(['product_id'=>1000080])===null,
    'no silent fallback for missing configuration');
archivedAssert(HPZ_APL_WP_Freight_190::shippingPolicy()===null,
    'no default operator-approved customer freight rate');
archivedAssert(!HPZ_APL_WP_Freight_190::approved(configuredLine(1000080,1900),
    'flat_rate:1',590),'stored future logic requires explicit approval');
$options[HPZ_APL_WP_Freight_190::OPTION]=[
    'confirmed'=>true,'rate_ids'=>['freight:2'],'minimum_cents'=>5000
];
archivedAssert(HPZ_APL_WP_Freight_190::approved(configuredLine(1000081,1900),
    'freight:2',5000),'archived approval path recoverable');
archivedAssert(!HPZ_APL_WP_Freight_190::approved(configuredLine(1000081,1900),
    'flat_rate:1',590),'archived proof still rejects different rate');
echo "PASS $checks archived-but-unwired freight checks (no WordPress checkout changes)\n";
