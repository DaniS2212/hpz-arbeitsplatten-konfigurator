<?php
/**
 * Read-only commercial coverage matrix for intended release configurations.
 * Equivalent-size partitions, NOT an exhaustive proof of every integer mm.
 * Runs offline: no WordPress site, cart, supplier API or real orders.
 */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../HPZ_APL_LU_Admin_Price_Preview_13.php';

$checks=0;
$counts=['straight'=>0,'lu-base'=>0,'lu-corner'=>0,'border'=>0];
$unpriced=[];
function coverageAssert(bool $ok,string $label):void {
    global $checks;
    ++$checks;
    if(!$ok) throw new RuntimeException('FAIL coverage: '.$label);
}
function dimensionsFor(string $shape,string $scenario):array {
    if(in_array($shape,['L1','L2'],true)){
        $d=['L1'=>2000,'L2'=>1200,'B1'=>600,'B2'=>600];
    }elseif(in_array($shape,['L3','L4'],true)){
        $d=['L1'=>2000,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900];
        if($shape==='L4')$d['B5']=600;
    }else{
        $d=['L1'=>2000,'L2'=>1200,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600];
    }
    if(is_numeric($scenario)){
        $d['L1']=(int)$scenario;
        // With U at 1000 the stock reference B2+B3=1200 creates an INVALID opening;
        // use a valid 1300mm U case instead of pretending the 1000mm variant works.
        if($shape[0]==='U'&&$d['L1']<=1200)$d['L1']=1300;
    }elseif($scenario==='mixed'){
        if(in_array($shape,['L1','L2'],true)){
            $d=['L1'=>2700,'L2'=>1700,'B1'=>700,'B2'=>650];
        }elseif(in_array($shape,['L3','L4'],true)){
            $d=['L1'=>2700,'L2'=>2300,'B1'=>650,'B2'=>650,'B3'=>950,'B4'=>950];
            if($shape==='L4')$d['B5']=700;
        }else{
            $d=['L1'=>2800,'L2'=>1500,'L3'=>2050,'B1'=>650,'B2'=>650,'B3'=>650];
        }
    }elseif($scenario==='wide'){
        if(in_array($shape,['L1','L2'],true)){
            $d=['L1'=>2500,'L2'=>1400,'B1'=>1100,'B2'=>1100];
        }elseif(in_array($shape,['L3','L4'],true)){
            $d=['L1'=>2500,'L2'=>2000,'B1'=>950,'B2'=>950,'B3'=>1150,'B4'=>1150];
            if($shape==='L4')$d['B5']=1000;
        }else{
            $d=['L1'=>2500,'L2'=>1800,'L3'=>1950,'B1'=>1100,'B2'=>600,'B3'=>600];
        }
    }else throw new RuntimeException('Unknown dimension scenario '.$scenario);
    return $d;
}
function rawLUFor(string $shape,string $decor,string $material,array $dimensions):array {
    $l=$shape[0]==='L';
    $r=[
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$l?1000080:1000081,
        'sku'=>$l?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
        'product'=>$l?'l':'u','geometry'=>$shape,'corner'=>'square',
        'dimensions'=>array_map('strval',$dimensions),'material'=>$material,
        'decor'=>$decor,'edge'=>'matching-1.5','quantity'=>1,
    ];
    if($l)$r['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
    return $r;
}
function cornerFor(string $shape,string $side,string $treatment):array {
    $l=$shape[0]==='L';
    $small=in_array($shape,['L1','L2'],true);
    $left=$treatment==='round'?['R1']:
       ($l?($small?['L3','B3']:['L5','B5']):['L4','B4']);
    $right=$treatment==='round'?['R2']:
       ($l?($small?['L4','B4']:['L6','B6']):['L5','B5']);
    $names=array_merge($side==='right'?[]:$left,$side==='left'?[]:$right);
    return ['side'=>$side,'treatment'=>$treatment,
        'parameters'=>array_fill_keys($names,$treatment==='round'?'100':'150')];
}
$decors=array_map('strval',array_keys(HPZ_APL_Decor_Catalog::all()));
coverageAssert(count($decors)===16,'16 published catalog decors');
$shapes=['L1','L2','L3','L4','U1','U2','U3','U4'];
$materials=['APL17.5','APL38'];
$scenarios=['1000','1899','1900','1901','2000','2250','2500','4000','mixed','wide'];
$policy=[
    'model_price_approved'=>true,'extended_model_approved'=>true,
    'corner_model_approved'=>true,'other_cost_net_cents'=>2000,
    'max_quantity'=>2,'price_approved_on'=>'2026-11-09',
    'approved_shipping_rate_ids'=>['test_rate:1'],
];
foreach($shapes as $shape){
    foreach($materials as $material){
        foreach($decors as $decor){
            foreach($scenarios as $scenario){
                $raw=rawLUFor($shape,$decor,$material,dimensionsFor($shape,$scenario));
                $name="$shape/$material/$decor/$scenario";
                try {
                    $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
                    $estimate=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($c);
                    if(!$estimate){
                        $unpriced[]=$name;
                        continue;
                    }
                    coverageAssert(is_int($estimate['supplierNetCents'])&&$estimate['supplierNetCents']>0,
                        $name.' positive cost estimate');
                    $inbound=HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c);
                    coverageAssert($inbound===15000,$name.' inbound tier');
                    $gross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(
                        $estimate['supplierNetCents'],$inbound,2000);
                    $preview=HPZ_APL_LU_Admin_Price_Preview_13::quote(
                        $raw,'DE',['other_cost_net_cents'=>2000]);
                    coverageAssert($preview['unitGrossReferenceCents']===$gross
                        &&$preview['totalGrossReferenceCents']===$gross
                        &&$gross>0&&$gross%1000===0,$name.' live-model price in 10-euro increments');
                    coverageAssert($preview['purchasable']===false,$name.' no public cart release');
                    $proof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$policy);
                    coverageAssert(is_array($proof)
                        &&$proof['supplierNetCents']===$estimate['supplierNetCents'],
                        $name.' explicit operator policy can price this model');
                    coverageAssert(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,[])===null,
                        $name.' no implicit sale approval');
                    $counts['lu-base']++;
                } catch(Throwable $e) {
                    $unpriced[]=$name.' ('.$e->getMessage().')';
                }
            }
            // Every visible corner class × side × 16 decors × both thicknesses.
            $rawBase=rawLUFor($shape,$decor,$material,dimensionsFor($shape,'2250'));
            $base=HPZ_APL_LU_Price_Readiness::normalize($rawBase);
            $prior=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($base);
            foreach(['left','right','both'] as $side){
                foreach(['round','chamfer_square','chamfer_continuous'] as $type){
                    $r=$rawBase;
                    $r[$shape[0]==='L'?'lCorner':'uCorner']=cornerFor($shape,$side,$type);
                    $name="$shape/$material/$decor/$side/$type";
                    try {
                        $c=HPZ_APL_LU_Price_Readiness::normalize($r);
                        $price=isset($c['lCorner'])
                            ?HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($c,true)
                            :HPZ_APL_LU_Shop_Ratebook_12::uCornerCandidate($c,true);
                        coverageAssert($price!==null
                            &&$price['supplierNetCents']>$prior['supplierNetCents'],
                            $name.' corner charge > base estimate');
                        $quote=HPZ_APL_LU_Admin_Price_Preview_13::quote($r,'DE',
                            ['other_cost_net_cents'=>2000]);
                        coverageAssert($quote['unitGrossReferenceCents']>0
                            &&$quote['unitGrossReferenceCents']%1000===0,
                            $name.' gross price');
                        $key=HPZ_APL_LU_Price_Readiness::configurationKey($c);
                        coverageAssert($key!==HPZ_APL_LU_Price_Readiness::configurationKey($base),
                            $name.' unique signed price identity');
                        $proof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$policy);
                        coverageAssert(is_array($proof),$name.' corner operator approval');
                        $without=$policy;$without['corner_model_approved']=false;
                        coverageAssert(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$without)===null,
                            $name.' cannot reuse base approval for machining');
                        $counts['lu-corner']++;
                    }catch(Throwable $e){
                        $unpriced[]=$name.' ('.$e->getMessage().')';
                    }
                }
            }
        }
    }
}
// Straight V3 quote uses a separate, established price curve.
$straightSizes=[[1000,300],[1899,600],[1900,600],[1901,600],[2000,600],
    [2250,650],[2500,800],[2780,880],[2781,880],[3000,881],[4000,900]];
foreach($materials as $material)foreach($decors as $decor){
    foreach($straightSizes as [$l,$b]){
        if($material==='APL38'&&$b>900)continue;
        foreach(['none','left','right','both'] as $side){
            foreach($side==='none'?[null]:['round','chamfer_square','chamfer_continuous'] as $kind){
                $name="straight/$material/$decor/{$l}x{$b}/$side/$kind";
                $parameters=[];
                if($side!=='none'){
                    $keys=$kind==='round'
                        ?($side==='left'?['R1']:($side==='right'?['R2']:['R1','R2']))
                        :($side==='left'?['L2','B2']:($side==='right'?['L3','B3']:['L2','B2','L3','B3']));
                    $parameters=array_fill_keys($keys,150);
                }
                $c=[
                    'schemaVersion'=>2,'unit'=>'mm','product'=>'straight','geometry'=>'straight',
                    'dimensions'=>['L1'=>$l,'B1'=>$b],'material'=>$material,
                    'decor'=>$decor,'edge'=>'matching-1.5','quantity'=>1,
                    'corner'=>$side==='none'?'square':($kind==='round'?'round':
                        ($kind==='chamfer_square'?'chamfer':'continuous')),
                    'straightCorner'=>['side'=>$side,'treatment'=>$kind,'parameters'=>$parameters],
                ];
                try {
                    $q=HPZ_APL_Price_V3::quote($c);
                    coverageAssert($q['unitGrossReferenceCents']>0
                        &&$q['unitGrossReferenceCents']%1000===0
                        &&$q['purchasable']===false,$name.' gross price; gated sale');
                    $counts['straight']++;
                } catch(Throwable $e){
                    $unpriced[]=$name.' ('.$e->getMessage().')';
                }
            }
        }
    }
}
foreach([1899=>15000,1900=>15000,1901=>15000] as $length=>$expected) {
    foreach([['L1'=>$length,'L2'=>1200],['L1'=>1200,'L2'=>$length],
        ['L1'=>1000,'L2'=>1200,'L3'=>$length]] as $d) {
        coverageAssert(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents(
            ['dimensions'=>$d])===$expected,
            '150 net configured L/U price per plate '.$length.' '.json_encode($d));
        $counts['border']++;
    }
}
coverageAssert(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents(
    ['dimensions'=>['L1'=>2000,'L2'=>2200,'L3'=>3000]])===15000,
    'three long arms charge only once');
coverageAssert(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1899])===15000,
    '1899 internal procurement');
coverageAssert(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1900])===15000,
    '1900 internal procurement');
if($unpriced) {
    echo "UNPRICED (" .count($unpriced)."):\n".implode("\n",array_slice($unpriced,0,80))."\n";
    throw new RuntimeException('Coverage matrix found '.count($unpriced).' valid/commercial cases without price.');
}
echo 'PASS '.json_encode($counts,JSON_UNESCAPED_SLASHES).
  " matrix cases; $checks assertions; 16 decors, 2 materials, 9 families, 10 L/U size scenarios, 9 corner treatments; synthetic only.\n";
