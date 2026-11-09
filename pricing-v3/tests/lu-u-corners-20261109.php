<?php
/** U inner-foot Speedmaster options, price estimates and signed proof isolation.
 * No live product hooks or customer orders.
 */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../HPZ_APL_LU_Admin_Price_Preview_13.php';
$n=0;
function checkU($pass,$reason):void {global $n;++$n;if(!$pass)throw new RuntimeException('FAIL '.$reason);}
function rawU($shape='U1'):array {return [
 'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000081,'sku'=>'HPZ-APL-U-FORM-2026',
 'product'=>'u','geometry'=>$shape,'corner'=>'square',
 'dimensions'=>['L1'=>'2000','L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'],
 'material'=>'APL38','decor'=>'W980','edge'=>'matching-1.5','quantity'=>1,
];}
$none=['side'=>'none','treatment'=>null,'parameters'=>[]];
foreach(['U1','U2','U3','U4'] as $shape){
 $base=rawU($shape);
 $basic=HPZ_APL_LU_Price_Readiness::normalize($base);
 $withNone=$base;$withNone['uCorner']=$none;
 $same=HPZ_APL_LU_Price_Readiness::normalize($withNone);
 checkU($same===$basic,$shape.' no-machining key compatible with existing proofs');
 $key=HPZ_APL_LU_Price_Readiness::configurationKey($basic);
 checkU($key===HPZ_APL_LU_Price_Readiness::configurationKey($same),'unmodified fingerprint');
 $baseCost=HPZ_APL_LU_Shop_Ratebook_12::candidate($basic);
 checkU($baseCost['supplierNetCents']>0,'unmodified U cost');
 foreach(['left','right','both'] as $side){
  foreach(['round','chamfer_square','chamfer_continuous'] as $treatment){
   $raw=$base;
   $fields=$treatment==='round' ? ($side==='both'?['R1','R2']:[$side==='left'?'R1':'R2'])
     :($side==='left'?['L4','B4']:($side==='right'?['L5','B5']:['L4','B4','L5','B5']));
   $params=array_fill_keys($fields,$treatment==='round'?'100':'150');
   $raw['uCorner']=['side'=>$side,'treatment'=>$treatment,'parameters'=>$params];
   $cfg=HPZ_APL_LU_Price_Readiness::normalize($raw);
   checkU(isset($cfg['uCorner'])&&$cfg['uCorner']['parameters']===array_map('intval',$params),
     $shape.' proper supplier fields '.$side.'/'.$treatment);
   $cornerKey=HPZ_APL_LU_Price_Readiness::configurationKey($cfg);
   checkU($key!==$cornerKey,'corner cannot inherit base price proof');
   $candidate=HPZ_APL_LU_Shop_Ratebook_12::uCornerCandidate($cfg,true);
   checkU($candidate['priceBasis']==='owner-review-u-inner-corner-cost-estimate'
     &&$candidate['supplierNetCents']>$baseCost['supplierNetCents'],
     'separate U inner-corner commercial EK scenario');
   $quote=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
   checkU($quote['status']==='calculated-not-sale-approved'
     &&$quote['purchasable']===false
     &&$quote['unitGrossReferenceCents']>=1000,
     'admin-only gross price, no enabled sale');
   checkU(strpos($quote['availabilityNote'],'Modellpreis')!==false,
     'unverified U net uplift is labeled as estimate');
   $proofOff=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($cfg,[
     'model_price_approved'=>true,'extended_model_approved'=>true,'corner_model_approved'=>false,
     'other_cost_net_cents'=>0,'max_quantity'=>2,'price_approved_on'=>'2026-11-09',
     'approved_shipping_rate_ids'=>['test_rate:1']
   ]);
   checkU($proofOff===null,'U machining requires dedicated corner-model approval');
   $proofOn=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($cfg,[
     'model_price_approved'=>true,'extended_model_approved'=>true,'corner_model_approved'=>true,
     'other_cost_net_cents'=>1000,'max_quantity'=>2,'price_approved_on'=>'2026-11-09',
     'approved_shipping_rate_ids'=>['test_rate:1']
   ]);
   checkU($proofOn['configurationKey']===$cornerKey&&$proofOn['operatorPriceApproved']===true,
     'only explicit operator policy creates a matching cost proof');
  }
 }
}
$invalid=rawU();
$invalid['uCorner']=['side'=>'left','treatment'=>'round','parameters'=>['R1'=>'600']];
try{HPZ_APL_LU_Price_Readiness::normalize($invalid);checkU(false,'oversize radius accepted');}
catch(InvalidArgumentException $e){checkU(strpos($e->getMessage(),'corner-R1')!==false,'specific R1 error');}
$invalid['uCorner']=['side'=>'left','treatment'=>'chamfer_square','parameters'=>['L4'=>'150','B4'=>'150','R2'=>'100']];
try{HPZ_APL_LU_Price_Readiness::normalize($invalid);checkU(false,'foreign R2 silently accepted');}
catch(InvalidArgumentException $e){checkU(true,'unexpected fields rejected');}
$invalid=rawU();$invalid['uCorner']=$none;$invalid['uCorner']['treatment']='round';
try{HPZ_APL_LU_Price_Readiness::normalize($invalid);checkU(false,'none+round accepted');}
catch(InvalidArgumentException $e){checkU(true,'no unsupported corner without side');}
$invalid=rawU();$invalid['product']='l';$invalid['productId']=1000080;
$invalid['geometry']='L1';$invalid['dimensions']=['L1'=>'2000','L2'=>'1200','B1'=>'600','B2'=>'600'];
$invalid['uCorner']=$none;
try{HPZ_APL_LU_Price_Readiness::normalize($invalid);checkU(false,'U corner accepted on L');}
catch(InvalidArgumentException $e){checkU(true,'corner namespace scoped to U only');}
echo "PASS $n U inner-foot server-side price and anti-bypass assertions\n";
