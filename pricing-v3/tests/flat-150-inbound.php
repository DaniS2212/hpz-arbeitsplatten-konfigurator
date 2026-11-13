<?php
/**
 * Owner decision 13 Nov 2026. 150 EUR NET inbound for EACH ordered worktop.
 * Isolated pricing only: no Woo options, order, payment or supplier API.
 */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../HPZ_APL_LU_Admin_Price_Preview_13.php';
$count=0;
function flatCheck(bool $ok,string $message):void{
    global $count;
    ++$count;
    if(!$ok)throw new RuntimeException('Flat 150 EUR inbound FAIL: '.$message);
}
flatCheck(HPZ_APL_Price_V3::INBOUND_PER_WORKTOP_NET_CENTS===15000,
    'trusted 150 EUR net freight constant');
flatCheck(HPZ_APL_Price_V3::inboundGrossContributionCents()===33000,
    '150 EUR NET +10 pct reserve /40 pct target /19 pct DE VAT rounds to 330 EUR gross');
foreach([1000,1899,1900,1901,2500,4000] as $length){
    flatCheck(HPZ_APL_Price_V3::inboundCostForVerifiedParts([$length])===15000,
        'flat inbound for actual verified part length '.$length);
    flatCheck(HPZ_APL_Price_V3::inboundCostForVerifiedParts([$length,3000,4000])===15000,
        'multiple legs never compound inbound cost '.$length);
    foreach([
        ['L1'=>$length,'L2'=>1200],
        ['L1'=>1200,'L2'=>$length],
        ['L1'=>1200,'L2'=>1600,'L3'=>$length]
    ] as $dimensions){
        flatCheck(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents(
            ['dimensions'=>$dimensions])===15000,
            'flat 150 EUR per configured L/U unit '.json_encode($dimensions));
    }
}
foreach([['L1',46445,135000],['U1',69149,184000],['U2',68736,183000]] as $row){
    [$shape,$supplier,$gross]=$row;
    flatCheck(HPZ_APL_Price_V3::targetGrossForVerifiedCosts($supplier,15000,0)===$gross,
        'exact target gross includes full net inbound '.$shape);
}
foreach([1899,1900,1901] as $length){
    foreach(['APL17.5','APL38'] as $material){
        $raw=[
            'schemaVersion'=>2,'unit'=>'mm','product'=>'straight','geometry'=>'straight',
            'dimensions'=>['L1'=>$length,'B1'=>600],
            'edge'=>'matching-1.5','straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
            'corner'=>'square','material'=>$material,'decor'=>'W980','quantity'=>1,
        ];
        $one=HPZ_APL_Price_V3::quote($raw);
        $three=HPZ_APL_Price_V3::quote(array_replace($raw,['quantity'=>3]));
        flatCheck($three['unitGrossReferenceCents']===$one['unitGrossReferenceCents']
            &&$three['totalGrossReferenceCents']===$one['unitGrossReferenceCents']*3,
            'flat internal 150 EUR cost is priced per worktop, never per cart '.$length.'/'.$material);
    }
}
$straight=[
 'schemaVersion'=>2,'unit'=>'mm','product'=>'straight','geometry'=>'straight',
 'dimensions'=>['L1'=>2000,'B1'=>600], 'edge'=>'matching-1.5',
 'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
 'corner'=>'square','material'=>'APL38','decor'=>'W980','quantity'=>1,
];
flatCheck(HPZ_APL_Price_V3::quote($straight)['unitGrossReferenceCents']===100000,
    'straight 38 mm reference 670 historic +330 gross freight =1000');
$straight['material']='APL17.5';
flatCheck(HPZ_APL_Price_V3::quote($straight)['unitGrossReferenceCents']===78000,
    'straight 17.5 mm reference 450 historic +330 gross freight =780');
$unit=HPZ_APL_Price_V3::quote($straight);
flatCheck(!array_key_exists('inboundNetCents',$unit)
   &&!array_key_exists('supplierNetCents',$unit)
   &&$unit['purchasable']===false,
   'customer quote discloses no internal cost and grants no new purchase approval');
echo "PASS $count per-worktop flat 150 EUR net inbound tests; no customer shipping or order changed.\n";
