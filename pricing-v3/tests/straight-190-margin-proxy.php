<?php
/**
 * Straight 190cm margin PROXY using historical 2000x600 net supplier
 * reference for nearby 1899/1900/1901 configurations; NOT live supplier EK.
 * The existing V3 price curve must not be silently changed.
 */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
$checks=0;
$minByLength=[];
$belowTarget=0;
function marginCheck(bool $condition,string $label):void {
    global $checks;
    $checks++;
    if (!$condition) throw new RuntimeException('FAIL straight 190 proxy: '.$label);
}
$decors=array_keys(HPZ_APL_Decor_Catalog::all());
marginCheck(count($decors)===16,'exact 16 active catalog decors');
foreach (['APL17.5'=>14499,'APL38'=>24311] as $material=>$baseSupplierNet) {
    foreach ($decors as $decor) {
        $decor=(string)$decor;
        $supplierReference=$baseSupplierNet+
            HPZ_APL_Price_V3::referenceDecorNetDifferenceCents($decor,$material);
        $grossByLength=[];
        foreach ([1899,1900,1901] as $length) {
            $configuration=[
                'schemaVersion'=>2,'unit'=>'mm','product'=>'straight',
                'geometry'=>'straight','dimensions'=>['L1'=>$length,'B1'=>600],
                'material'=>$material,'decor'=>$decor,'edge'=>'matching-1.5',
                'quantity'=>1,'corner'=>'square',
                'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]],
            ];
            $price=HPZ_APL_Price_V3::quote($configuration);
            $gross=$price['unitGrossReferenceCents'];
            $grossByLength[$length]=$gross;
            marginCheck(is_int($gross)&&$gross>0&&$gross%1000===0,
                "$material/$decor/$length valid V3 gross quote");
            $inbound=HPZ_APL_Price_V3::inboundCostForVerifiedParts([$length]);
            marginCheck($inbound===($length>=1900?6000:1000),
                "$material/$decor/$length internal 10/60 EUR boundary");
            $netRevenue=(int)round($gross/1.19,0,PHP_ROUND_HALF_UP);
            $margin=HPZ_APL_Price_V3::checkNetMargin(
                $supplierReference,$inbound,$netRevenue);
            marginCheck($margin['passesMinimum35']===true,
                "$material/$decor/$length 35% margin with 200cm reference EK proxy");
            if (!$margin['meetsTarget40']) $belowTarget++;
            $minByLength[$length]=min($minByLength[$length]??100.0,$margin['marginPct']);
        }
        marginCheck($grossByLength[1899]<=$grossByLength[1900] &&
            $grossByLength[1900]<=$grossByLength[1901],
            "$material/$decor no negative threshold price movement");
    }
}
echo 'PASS '.$checks.' straight 190cm proxy assertions (96 price points; 16 decors x 2 materials x 3 lengths).'
    .' Minimum buffered margin by length: '.json_encode($minByLength)
    .'; below 40% target proxy cases: '.$belowTarget
    .'. NO verified supplier quote and NO real Woo test.\n';
