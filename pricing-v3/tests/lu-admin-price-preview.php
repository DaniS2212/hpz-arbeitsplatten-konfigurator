<?php
/** Admin preview only: no Woo purchases, supplier EK or public nonce. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../HPZ_APL_LU_Admin_Price_Preview_13.php';

$n=0;
function pCheck(bool $ok,string $why):void{global $n;++$n;if(!$ok)throw new RuntimeException($why);}
function priceLURaw(string $shape,string $decor='W980',string $material='APL38',
                    int $l1=2500):array {
    $isL=$shape[0]==='L';
    if($shape==='L1'||$shape==='L2')
        $d=['L1'=>(string)$l1,'L2'=>'1200','B1'=>'600','B2'=>'600'];
    elseif($shape==='L3'||$shape==='L4'){
        $d=['L1'=>(string)$l1,'L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900'];
        if($shape==='L4')$d['B5']='600';
    }else
        $d=['L1'=>(string)$l1,'L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'];
    $r=[
      'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$isL?1000080:1000081,
      'sku'=>$isL?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
      'product'=>$isL?'l':'u','geometry'=>$shape,'corner'=>'square',
      'dimensions'=>$d,'material'=>$material,'decor'=>$decor,
      'edge'=>'matching-1.5','quantity'=>1,
    ];
    if($isL)$r['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
    return $r;
}
$all=array_map('strval',array_keys(HPZ_APL_Decor_Catalog::all()));
pCheck(count($all)===16,'16 valid decors');
foreach(['L1','L2','L3','L4','U1','U2','U3','U4'] as $shape){
    foreach($all as $decor){
        foreach(['APL17.5','APL38'] as $mat){
            $raw=priceLURaw($shape,$decor,$mat);
            $q=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
            pCheck($q['status']==='calculated-not-sale-approved'
                &&$q['purchasable']===false,'all forms remain admin-only '.$shape.'/'.$decor.'/'.$mat);
            pCheck($q['unitGrossReferenceCents']>0
                &&$q['totalGrossReferenceCents']===$q['unitGrossReferenceCents'],
                'German gross priced '.$shape.'/'.$decor.'/'.$mat);
            pCheck(!isset($q['supplierNetCents'],$q['supplierNet'],$q['costBasis']),
                'never give client EK or cost basis');
        }
    }
}
$raw=priceLURaw('L1','W980','APL38',2250);
$base=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
pCheck(strpos($base['availabilityNote'],'Zusatzkosten vorläufig 0')!==false,'unknown extra cost honestly marked');
$extra=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE',['other_cost_net_cents'=>8000]);
pCheck($extra['unitGrossReferenceCents']>$base['unitGrossReferenceCents'],'private real business costs in quote');
pCheck(strpos($extra['availabilityNote'],'Zusatzkosten laut hinterlegtem')!==false,
    'known additional costs are labeled');
$raw['quantity']=3;
$p=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
pCheck($p['totalGrossReferenceCents']===$p['unitGrossReferenceCents']*3,
    'multi-quantity does not reapply tier');
$raw['quantity']=1;
$raw['lCorner']=['side'=>'left','treatment'=>'chamfer_continuous',
    'parameters'=>['L3'=>'150','B3'=>'150']];
$p=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
$expected=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(51002,6000,0);
pCheck($p['unitGrossReferenceCents']===$expected,'real single chamfer example preview');
pCheck($p['purchasable']===false,'even real corner supplier quote not automatically sold');
$raw['lCorner']=['side'=>'both','treatment'=>'round','parameters'=>['R1'=>'100','R2'=>'100']];
$p=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
pCheck($p['unitGrossReferenceCents']>$base['unitGrossReferenceCents'],'both corners priced');
pCheck(strpos($p['availabilityNote'],'Modellpreis')!==false,'unknown round supplier EK not hidden');
$raw=priceLURaw('U1','F128','APL17.5',1899);
$raw['dimensions']['L2']='1700';
$raw['dimensions']['B1']='700';
$p=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'');
pCheck($p['unitGrossReferenceCents']>0,'combined variable U1 dimensions modeled');
pCheck(strpos($p['taxNote'],'inkl. 19')===false,'other countries not implied to have DE tax');
$bad=priceLURaw('L1');$bad['sku']='not-the-L-sku';
try{HPZ_APL_LU_Admin_Price_Preview_13::quote($bad,'DE');pCheck(false,'foreign sku accepted');}
catch(InvalidArgumentException $e){pCheck(true,'foreign sku cannot request pricing');}
$bad=priceLURaw('L1');$bad['dimensions']['B1']='1201';
try{HPZ_APL_LU_Admin_Price_Preview_13::quote($bad,'DE');pCheck(false,'wide unsupported plate accepted');}
catch(InvalidArgumentException $e){pCheck(true,'unsupported dimension denied');}
echo "PASS $n administrator-only L/U price scenario assertions; no live sale\n";
