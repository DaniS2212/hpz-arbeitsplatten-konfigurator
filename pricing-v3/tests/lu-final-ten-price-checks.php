<?php
/**
 * End-of-price-work calibration, 9 Nov 2026. Test exactly ten independent
 * operator-confirmed Speedmaster NET purchase prices against the SAME model
 * used by Woo and WordPress. No public sale release and no supplier order.
 */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../HPZ_APL_LU_Admin_Price_Preview_13.php';
$path=__DIR__.'/../../docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json';
$doc=json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);
if(($doc['caseCount']??null)!==10 || count($doc['cases']??[])!==10)
    throw new RuntimeException('Exactly ten independent data records required.');
$n=0;
function assertLU(bool $condition,string $why):void {
    global $n;++$n;if(!$condition) throw new RuntimeException('FAILED '.$why);
}
function rawCase(array $entry):array {
    $shape=$entry['geometry'];$isL=$shape[0]==='L';
    $raw=[
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$isL?1000080:1000081,
        'sku'=>$isL?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
        'product'=>$isL?'l':'u','geometry'=>$shape,'corner'=>'square',
        'dimensions'=>array_map('strval',$entry['dimensions']),
        'material'=>$entry['material'],'decor'=>$entry['decor'],
        'edge'=>'matching-1.5','quantity'=>1,
    ];
    if($isL) {
        $raw['lCorner']=$entry['lCorner']??['side'=>'none','treatment'=>null,'parameters'=>[]];
        if(isset($entry['lCorner']))
            $raw['lCorner']['parameters']=array_map('strval',$entry['lCorner']['parameters']);
    }
    return $raw;
}
$sumOriginal=0;
foreach($doc['cases'] as $entry){
    $raw=rawCase($entry);
    $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
    $q=isset($c['lCorner'])
        ?HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($c,true)
        :HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
    $expected=(int)str_replace('.','',$entry['confirmedNetEUR']);
    $old=(int)str_replace('.','',$entry['previousModelNetEUR']);
    assertLU(is_array($q),'case '.$entry['id'].' has a price');
    assertLU($q['supplierNetCents']===$expected,
        'case '.$entry['id'].' matches operator Speedmaster net price');
    assertLU(in_array($q['priceBasis'],['confirmed-net-reference',
        'operator-confirmed-single-corner-reference'],true),
        'case '.$entry['id'].' labeled as confirmed supplier case');
    $sumOriginal+=($old-$expected);
    $quote=HPZ_APL_LU_Admin_Price_Preview_13::quote($raw,'DE');
    $inbound=HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c);
    $gross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts($expected,$inbound,0);
    assertLU($quote['unitGrossReferenceCents']===$gross
        && $quote['purchasable']===false,
        'case '.$entry['id'].' V3 gross / never public sale');
}
assertLU($sumOriginal>0,'original model was uniformly higher');
// Test fit NEXT TO data points, rather than making only the exact 10 cases
// look right while breaking nearby buyer dimensions.
$case=$doc['cases'][0];
$case['dimensions']['L1']=1895;
$c=HPZ_APL_LU_Price_Readiness::normalize(rawCase($case));
$p=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
assertLU($p!==null && $p['supplierNetCents']===30038,
    'L1 short 1895mm smoothly interpolated between actual 1890/1900');
assertLU($p['priceBasis']==='bounded-single-axis-net-interpolation',
    'nearby lengths not misrepresented as exact supplier prices');
$case=$doc['cases'][6];
$case['dimensions']['B1']=676;
$c=HPZ_APL_LU_Price_Readiness::normalize(rawCase($case));
$p=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
assertLU($p!==null && $p['supplierNetCents']<76800,
    'U1 38mm B1=676 not jump back to the old 771.76 EUR estimate');
$case=$doc['cases'][4];
$case['dimensions']['B3']=960;$case['dimensions']['B4']=960;
$c=HPZ_APL_LU_Price_Readiness::normalize(rawCase($case));
$p=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
assertLU($p!==null && $p['supplierNetCents']>52889 && $p['supplierNetCents']<53498,
    'L3 B3/B4 slope continues between 950 and 1000mm');
$case=$doc['cases'][7];$case['dimensions']['L2']+=10;
$c=HPZ_APL_LU_Price_Readiness::normalize(rawCase($case));
$p=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($c);
assertLU($p!==null && $p['priceBasis']==='operator-review-extended-cost-estimate',
    'U2 variant nearby is a model, not an exact supplier cost');
assertLU($p['supplierNetCents']>=50000 && $p['supplierNetCents']<=61000,
    'U2 H1145 nearby variant remains in usable commercial range');
$case=$doc['cases'][9];$case['dimensions']['L1']+=10;
$c=HPZ_APL_LU_Price_Readiness::normalize(rawCase($case));
$p=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($c);
assertLU($p!==null && $p['priceBasis']==='operator-review-extended-cost-estimate',
    'U4 rare decor variation stays estimated, not falsely supplier verified');
assertLU($p['supplierNetCents']>=75000 && $p['supplierNetCents']<=90000,
    'U4 F128 17.5 nearby variant no unreasonably exaggerated cost');
$short=HPZ_APL_LU_Price_Readiness::normalize(rawCase($doc['cases'][0]));
$threshold=HPZ_APL_LU_Price_Readiness::normalize(rawCase($doc['cases'][1]));
assertLU(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($short)===15000,
    '1890mm inbound EUR 150 net');
assertLU(HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($threshold)===15000,
    '1900mm inbound EUR 150 net independent of length');
$raw=rawCase($doc['cases'][2]);
$raw['lCorner']['parameters']['L3']='160';
$c=HPZ_APL_LU_Price_Readiness::normalize($raw);
$p=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($c);
assertLU($p['priceBasis']==='owner-review-l-corner-cost-estimate',
    'other chamfer sizes not falsely called exact');
$raw=rawCase($doc['cases'][3]);$raw['decor']='W980';
$c=HPZ_APL_LU_Price_Readiness::normalize($raw);
$p=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($c);
assertLU($p['priceBasis']==='owner-review-l-corner-cost-estimate',
    'one L2 H1145 radius check never automatically transferred to other decor');
echo "PASS $n independent supplier cases and adjacent L/U price-model checks\n";
