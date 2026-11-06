<?php
/** Offline source-provenance regression. No real supplier quote is created. */
declare(strict_types=1);
define('ABSPATH',__DIR__);
require_once __DIR__.'/../../wordpress/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../HPZ_APL_Price_V3.php';
require_once __DIR__.'/../HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../HPZ_APL_LU_Calibration_11.php';

$tests=0;
function expectCal($ok,string $message): void {
    global $tests;
    $tests++;
    if (!$ok) throw new RuntimeException('FAIL: '.$message);
}
function fixtureLU(string $shape='L1',string $thick='APL38',array $d=[],string $decor='W980'): array {
    $isL=$shape[0]==='L';
    $dims=$isL
        ? (in_array($shape,['L1','L2'],true)
            ? ['L1'=>'2000','L2'=>'1200','B1'=>'600','B2'=>'600']
            : ($shape==='L3'
                ? ['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900']
                : ['L1'=>'2000','L2'=>'2000','B1'=>'600','B2'=>'600','B3'=>'900','B4'=>'900','B5'=>'600']))
        : ['L1'=>'2000','L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'];
    $raw=[
        'schemaVersion'=>2,'inputUnit'=>'mm',
        'productId'=>$isL?1000080:1000081,'product'=>$isL?'l':'u',
        'geometry'=>$shape,'corner'=>'square','edge'=>'matching-1.5',
        'dimensions'=>array_replace($dims,array_map('strval',$d)),
        'material'=>$thick,'decor'=>$decor,'quantity'=>1
    ];
    if ($isL) $raw['lCorner']=['side'=>'none','treatment'=>null,'parameters'=>[]];
    return $raw;
}
function reviewLU(string $shape='L1',string $thick='APL38',array $d=[],string $decor='W980'): array {
    return HPZ_APL_LU_Calibration_11::review(fixtureLU($shape,$thick,$d,$decor));
}

foreach ([
    ['L1','APL17.5',['L1'=>2000],30767],
    ['L1','APL17.5',['L1'=>2500],34241],
    ['L1','APL38',['L1'=>2000],46445],
    ['L1','APL38',['L1'=>2500],51156],
    ['U1','APL17.5',['L1'=>2000],45929],
    ['U1','APL38',['L1'=>2000],69149],
    ['U1','APL17.5',['L1'=>2500],49403],
    ['U1','APL38',['L1'=>2500],73859],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700],52876],
    ['U1','APL38',['L1'=>2500,'L2'=>1700],78569],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>700],53990],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>700],76712],
] as $case) {
    [$shape,$thick,$d,$price]=$case;
    $result=reviewLU($shape,$thick,$d);
    expectCal($result['priceStatus']==='exact-historical-net-reference',
        'exact archived witness '.$shape.$thick.json_encode($d));
    expectCal($result['netSupplierReferenceCents']===$price,'exact price matches CSV');
    expectCal(count($result['referenceCaseIds'])===1,'exact case ID retained');
    expectCal($result['checkoutPriceApproved']===false && $result['purchasable']===false,
        'old source price is not manufacturing approval');
    expectCal($result['grossDEWith10or60EURInboundScenario']['inbound60EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($price,6000,0),
        'same company V3 commercial policy, no duplicate formula');
}

// 06.11.2026: four EXACT H1145 ST10 Bardolino Eiche supplier NET
// price points compared with identical W980 ST7 Platinweiß dimensions.
// IMPORTANT: These are NOT a fixed decor surcharge or ratio and are
// never transferred to unseen L2-L4/U2-U4, width or extrapolated sizes.
foreach ([
  ['L1','APL17.5',['L1'=>2500],34693,34241,452],
  ['L1','APL38',['L1'=>2500],51649,51156,493],
  ['U1','APL17.5',['L1'=>2500],49974,49403,571],
  ['U1','APL38',['L1'=>2500],74432,73859,573],
] as [$shape,$thickness,$dimensions,$h1145Net,$w980Net,$delta]) {
    $result=reviewLU($shape,$thickness,$dimensions,'H1145');
    $w980=reviewLU($shape,$thickness,$dimensions,'W980');
    expectCal($result['priceStatus']==='exact-operator-confirmed-net-reference',
        $shape.$thickness.' H1145 is an exact operator-confirmed supplier NET quote');
    expectCal($result['netSupplierReferenceCents']===$h1145Net
        && $result['estimatedSupplierNetCents']===null,
        $shape.$thickness.' H1145 exact price is not an interpolation');
    expectCal($w980['netSupplierReferenceCents']===$w980Net
        && $h1145Net-$w980Net===$delta,
        $shape.$thickness.' independent decor difference at exact same dimensions');
    expectCal($result['decor']==='H1145'
        && $result['supplierPriceTaxBasis']==='net-eur-operator-confirmed-2026-11-06'
        && $result['germanGrossReferenceTaxRate']==='0.19',
        'H1145 is resolved using exact supplier catalog ID with 19pct DE VAT only once');
    expectCal(count($result['referenceCaseIds'])===1
        && str_ends_with($result['referenceCaseIds'][0],'-H1145'),
        'the exact reference ID preserves source decor for future chats');
    expectCal($result['grossDEWith10or60EURInboundScenario']['inbound60EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($h1145Net,6000,0),
        'H1145 hypothetical DE gross uses same V3 cost and VAT formula');
    expectCal(!$result['supplierNetQuoteVerifiedForExactTarget']
        && !$result['checkoutPriceApproved']
        && !$result['purchasable']
        && !$result['realPackedDimensionsVerified']
        && !$result['additionalCostsVerified'],
        'H1145 net price evidence is NOT a cutlist/packing/Woo release');
}
expectCal(count(array_unique([452,493,571,573]))===4,
    'no globally uniform H1145 vs W980 surcharge across shape and thickness');

// Newly owner-confirmed exact H1145 prices at L1=2000mm; use the
// previously paired W980 L1/U1 baseline at the SAME dimensions and edges.
// Second length endpoints now permit 1D interpolation for H1145 only.
foreach ([
  ['L1','APL17.5',31153,30767,34693,34241,386,3540,66],
  ['L1','APL38',46872,46445,51649,51156,427,4777,66],
  ['U1','APL17.5',46434,45929,49974,49403,505,3540,66],
  ['U1','APL38',69655,69149,74432,73859,506,4777,67],
] as [$shape,$material,$net2000,$w980Net2000,$net2500,$w980Net2500,$decorDelta2000,$h1145LengthDelta,$extraDecorDelta]) {
    $at2000=reviewLU($shape,$material,['L1'=>2000],'H1145');
    $at2500=reviewLU($shape,$material,['L1'=>2500],'H1145');
    $w2000=reviewLU($shape,$material,['L1'=>2000],'W980');
    $w2500=reviewLU($shape,$material,['L1'=>2500],'W980');
    expectCal($at2000['priceStatus']==='exact-operator-confirmed-net-reference',
        $shape.$material.' H1145 2000 is exact typed net quote');
    expectCal($at2000['netSupplierReferenceCents']===$net2000
        && $at2500['netSupplierReferenceCents']===$net2500,
        $shape.$material.' exact independent H1145 net endpoints');
    expectCal(count($at2000['referenceCaseIds'])===1
        && str_ends_with($at2000['referenceCaseIds'][0],'-H1145'),
        $shape.$material.' exact 2000 source includes H1145 decor ID');
    expectCal($w2000['netSupplierReferenceCents']===$w980Net2000
        && $w2500['netSupplierReferenceCents']===$w980Net2500,
        $shape.$material.' W980 comparators are same thickness/geometry');
    expectCal($net2000-$w980Net2000===$decorDelta2000,
        $shape.$material.' exact net decor premium at 2000mm');
    expectCal($net2500-$net2000===$h1145LengthDelta,
        $shape.$material.' exact H1145 length increase over 500mm');
    expectCal(($net2500-$w980Net2500)-($net2000-$w980Net2000)
        ===$extraDecorDelta,
        $shape.$material.' decor premium change across length is 66 or 67 cents');
    expectCal($at2000['grossDEWith10or60EURInboundScenario']['inbound60EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($net2000,6000,0),
        'H1145 gross reference uses V3 and German VAT exactly once');
    expectCal(!$at2000['supplierNetQuoteVerifiedForExactTarget']
        && !$at2000['checkoutPriceApproved']
        && !$at2000['purchasable']
        && !$at2000['realPackedDimensionsVerified'],
        'net source never authorizes unverified manufacturing/checkout');
}
// Internal net midpoint in H1145 only: historical W980 interpolation must
// remain separate, no fixed decor multiplier and no H1145 width/shape transfer.
foreach ([
  ['L1','APL17.5',32923,32504,419],
  ['L1','APL38',49261,48801,460],
  ['U1','APL17.5',48204,47666,538],
  ['U1','APL38',72044,71504,540],
] as [$shape,$material,$h1145Mid,$w980Mid,$difference]) {
    $h=reviewLU($shape,$material,['L1'=>2250],'H1145');
    $w=reviewLU($shape,$material,['L1'=>2250],'W980');
    expectCal($h['priceStatus']==='bounded-one-axis-estimate-not-verified'
        && $h['estimatedSupplierNetCents']===$h1145Mid
        && $h['netSupplierReferenceCents']===null,
        $shape.$material.' bounded H1145 2250 internal net estimate only');
    expectCal($h['axisInterpolated']==='L1'
        && $h['boundedByMm']===[2000,2500]
        && count($h['referenceCaseIds'])===2
        && count(array_filter($h['referenceCaseIds'],static function($id){return str_ends_with($id,'-H1145');}))===2,
        $shape.$material.' both endpoints originate in same H1145 decor');
    expectCal(($w['estimatedSupplierNetCents']??null)===$w980Mid
        && $h1145Mid-$w980Mid===$difference,
        $shape.$material.' no mixing H1145/W980 models');
    expectCal(!$h['checkoutPriceApproved'] && !$h['purchasable']
        && !$h['realPackedDimensionsVerified']
        && !$h['supplierNetQuoteVerifiedForExactTarget'],
        'bounded H1145 model cannot be used for Woo price or supplier order');
}
// Fail closed: the eight observed H1145 anchors cannot license an unseen
// H1145 shape, out-of-bracket length or width, or another decor ID.
foreach ([
  ['L1','APL17.5',['L1'=>1900],'H1145'],
  ['L1','APL38',['L1'=>2600],'H1145'],
  ['U1','APL17.5',['L1'=>1900],'H1145'],
  ['U1','APL38',['L1'=>2500,'B1'=>650],'H1145'],
  ['L2','APL17.5',['L1'=>2500],'H1145'],
  ['L3','APL38',['L1'=>2500],'H1145'],
  ['L4','APL17.5',['L1'=>2500],'H1145'],
  ['U2','APL17.5',['L1'=>2500],'H1145'],
  ['U3','APL38',['L1'=>2500],'H1145'],
  ['U4','APL17.5',['L1'=>2500],'H1145'],
  ['U1','APL38',['L1'=>2500],'H1146'],
] as [$shape,$thickness,$dimensions,$decor]) {
    if ($decor==='H1146') {
        $rejected=false;
        try {reviewLU($shape,$thickness,$dimensions,$decor);}
        catch (InvalidArgumentException $e) {$rejected=true;}
        expectCal($rejected,'unknown decor ID rejected server-side');
        continue;
    }
    $r=reviewLU($shape,$thickness,$dimensions,$decor);
    expectCal($r['priceStatus']==='missing-evidence'
        && $r['netSupplierReferenceCents']===null
        && $r['estimatedSupplierNetCents']===null
        && $r['estimatedSupplierDisplayCents']===null,
        $shape.$thickness.' cannot infer H1145 cost via W980 interpolation or shape');
    expectCal(!$r['purchasable'] && !$r['checkoutPriceApproved'],
        'unknown H1145 combinations must never be released');
}

// Six NEW operator-confirmed 17.5mm NET Speedmaster amounts. The operator
// explicitly stated that all Speedmaster amounts EXCLUDE VAT; 19% German VAT
// belongs to the same V3 gross calculation, never the supplier's EK.
foreach ([
    ['L2',['L1'=>2500],34241],
    ['L3',['L1'=>2500],52329],
    ['L4',['L1'=>2500],46568],
    ['U2',['L1'=>2500],49403],
    ['U3',['L1'=>2500],49403],
    ['U4',['L1'=>2500],49403],
] as [$shape,$dimensions,$net]) {
    $price=reviewLU($shape,'APL17.5',$dimensions);
    expectCal($price['priceStatus']==='exact-operator-confirmed-net-reference',
        $shape.' is operator-confirmed NET basis, not display-only');
    expectCal($price['netSupplierReferenceCents']===$net,
        $shape.' net EK cents unchanged');
    expectCal($price['supplierPriceTaxBasis']==='net-eur-operator-confirmed-2026-11-06'
        && $price['germanGrossReferenceTaxRate']==='0.19',
        $shape.' supplier price excludes VAT, DE VAT reference is 19 pct');
    expectCal($price['grossDEWith10or60EURInboundScenario']['inbound10EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($net,1000,0),
        $shape.' same V3 margin + 19% German reference VAT with 10 EUR inbound');
    expectCal($price['grossDEWith10or60EURInboundScenario']['inbound60EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($net,6000,0),
        $shape.' same V3 margin + VAT with 60 EUR inbound');
    expectCal(count($price['referenceCaseIds'])===1
        && strpos($price['referenceCaseIds'][0], 'operator-net-20261106-')===0,
        $shape.' typed source record survives new chat');
    expectCal(!$price['supplierNetQuoteVerifiedForExactTarget']
        && !$price['checkoutPriceApproved'] && !$price['purchasable']
        && !$price['realPackedDimensionsVerified'] && !$price['additionalCostsVerified'],
        $shape.' price net basis is not a manufacturing/checkout release');
}
// Form parity at only the exact known 17.5mm W980 2500mm case.
$baseL1=reviewLU('L1','APL17.5',['L1'=>2500]);
$baseU1=reviewLU('U1','APL17.5',['L1'=>2500]);
expectCal(reviewLU('L2','APL17.5',['L1'=>2500])['netSupplierReferenceCents']===
    $baseL1['netSupplierReferenceCents'],'17.5mm L1/L2 same at 2500');
foreach (['U2','U3','U4'] as $shape) {
    expectCal(reviewLU($shape,'APL17.5',['L1'=>2500])['netSupplierReferenceCents']===
        $baseU1['netSupplierReferenceCents'],$shape.' 17.5mm matches U1 only at 2500');
}
expectCal(52329-46568===5761,'L3 minus L4 is EUR 57.61 at 17.5mm, not a universal shape surcharge');

// Four new exact 2000mm owner-confirmed NET supplier quotes, all W980,
// 17.5mm and matching 1.5mm decor edges. These establish ONLY bounded
// interpolation along L1=2000..2500 for the four shapes with two endpoints.
foreach ([
    ['L2',['L1'=>2000],30767],
    ['L3',['L1'=>2000],48855],
    ['L4',['L1'=>2000],43094],
    ['U2',['L1'=>2000],45929],
] as [$shape,$dimensions,$net]) {
    $result=reviewLU($shape,'APL17.5',$dimensions);
    expectCal($result['priceStatus']==='exact-operator-confirmed-net-reference',
        $shape.' 2000mm exact net anchor');
    expectCal($result['netSupplierReferenceCents']===$net,
        $shape.' 2000mm net amount preserved as cents');
    expectCal($result['supplierPriceTaxBasis']==='net-eur-operator-confirmed-2026-11-06'
        && $result['germanGrossReferenceTaxRate']==='0.19',
        'no second 19pct VAT layer');
    expectCal($result['grossDEWith10or60EURInboundScenario']['inbound60EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($net,6000,0),
        $shape.' same V3 gross policy, hypothetical shipping only');
    expectCal(!$result['supplierNetQuoteVerifiedForExactTarget']
        && !$result['checkoutPriceApproved'] && !$result['purchasable']
        && !$result['realPackedDimensionsVerified'],
        $shape.' supplier net price is never WooCommerce sale approval');
}
// Exactly identical +34.74 EUR supplier net difference over the verified
// 500mm L1 interval for L1/U1 historic and L2/L3/L4/U2 new owner quotes.
foreach ([
    ['L1',30767,34241],['L2',30767,34241],
    ['L3',48855,52329],['L4',43094,46568],
    ['U1',45929,49403],['U2',45929,49403],
] as [$shape,$at2000,$at2500]) {
    $from=reviewLU($shape,'APL17.5',['L1'=>2000]);
    $to=reviewLU($shape,'APL17.5',['L1'=>2500]);
    expectCal($from['netSupplierReferenceCents']===$at2000
        && $to['netSupplierReferenceCents']===$at2500,
        $shape.' exact 2000/2500mm anchors');
    expectCal($at2500-$at2000===3474,
        $shape.' exactly 34.74 EUR per tested 500mm interval');
}
foreach ([
    ['L2',32504],['L3',50592],['L4',44831],['U2',47666],
] as [$shape,$expected]) {
    $r=reviewLU($shape,'APL17.5',['L1'=>2250]);
    expectCal($r['priceStatus']==='bounded-one-axis-estimate-not-verified',
        $shape.' internal 17.5mm modeled net quote is NOT verified');
    expectCal($r['estimatedSupplierNetCents']===$expected,
        $shape.' bounded 2250mm interpolation from two exact net anchors');
    expectCal($r['axisInterpolated']==='L1'
        && $r['boundedByMm']===[2000,2500]
        && count($r['referenceCaseIds'])===2,
        $shape.' 2000/2500mm reference provenance and axis');
    expectCal($r['netSupplierReferenceCents']===null
        && !$r['checkoutPriceApproved'] && !$r['purchasable']
        && !$r['realPackedDimensionsVerified'],
        $shape.' modeled internal price remains not manufacturer-verified');
}
foreach ([2000,2500] as $length) {
    $l3=reviewLU('L3','APL17.5',['L1'=>$length]);
    $l4=reviewLU('L4','APL17.5',['L1'=>$length]);
    expectCal($l3['netSupplierReferenceCents']-$l4['netSupplierReferenceCents']===5761,
        'L3 is 57.61 EUR net higher than L4 at both observed lengths');
    expectCal(reviewLU('L2','APL17.5',['L1'=>$length])['netSupplierReferenceCents']===
        reviewLU('L1','APL17.5',['L1'=>$length])['netSupplierReferenceCents'],
        'L1/L2 equal only at recorded W980 17.5mm sizes');
    expectCal(reviewLU('U2','APL17.5',['L1'=>$length])['netSupplierReferenceCents']===
        reviewLU('U1','APL17.5',['L1'=>$length])['netSupplierReferenceCents'],
        'U1/U2 equal only at recorded W980 17.5mm sizes');
}
// U3/U4 have only their 2500mm net endpoint and no 2000mm source.
// Unlike U2, no 17.5mm U3/U4 interpolation should be inferred.
foreach (['U3','U4'] as $shape) {
    $r=reviewLU($shape,'APL17.5',['L1'=>2250]);
    expectCal($r['priceStatus']==='missing-evidence'
        && $r['estimatedSupplierNetCents']===null,
        $shape.' one exact net endpoint insufficient for interpolation');
}
foreach ([
    ['L2',1950],['L3',1900],['L4',2600],['U2',2550],
] as [$shape,$target]) {
    $r=reviewLU($shape,'APL17.5',['L1'=>$target]);
    expectCal($r['priceStatus']==='missing-evidence'
        && $r['estimatedSupplierNetCents']===null,
        $shape.' no extrapolation outside 2000..2500mm');
}
expectCal(reviewLU('L4','APL17.5',['L1'=>2500,'B5'=>750])['priceStatus']
    ==='missing-evidence','L4 B5 outside observed 600..700 bracket cannot be modeled');
expectCal(reviewLU('L3','APL38',['L1'=>2500,'B1'=>700,'B2'=>700])['priceStatus']
    ==='missing-evidence','17.5mm L3 price cannot be transferred to unrelated 38mm widths');
expectCal(reviewLU('L3','APL17.5',['L1'=>2500],'H1145')['priceStatus']
    ==='missing-evidence','17.5mm W980 price never substitutes another decor');

// Earlier L1/U1 variable-length models within proven same-thickness brackets.
foreach ([
    ['L1','APL17.5',['L1'=>2250],32504,'L1',[2000,2500]],
    ['L1','APL38',['L1'=>2250],48801,'L1',[2000,2500]],
    ['U1','APL17.5',['L1'=>2250],47666,'L1',[2000,2500]],
    ['U1','APL38',['L1'=>2250],71504,'L1',[2000,2500]],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1450],51140,'L2',[1200,1700]],
    ['U1','APL38',['L1'=>2500,'L2'=>1450],76214,'L2',[1200,1700]],
] as $case) {
    [$shape,$thick,$d,$price,$axis,$bounds]=$case;
    $result=reviewLU($shape,$thick,$d);
    expectCal($result['priceStatus']==='bounded-one-axis-estimate-not-verified',
        'interpolation must be visibly provisional');
    expectCal($result['estimatedSupplierNetCents']===$price,'bounded interpolation in EUR cents');
    expectCal($result['axisInterpolated']===$axis,'correct dimension is interpolated');
    expectCal($result['boundedByMm']===$bounds,'exact reference bracket retained');
    expectCal(count($result['referenceCaseIds'])===2,'both original sources retained');
    expectCal($result['netSupplierReferenceCents']===null
        && !$result['supplierNetQuoteVerifiedForExactTarget'],'interpolation is NOT supplier EK proof');
    expectCal($result['checkoutPriceApproved']===false && !$result['purchasable'],
        'modeled values never checkout');
}

// Independent manufacturer screenshots supplied on 06.11.2026 show
// precisely the modeled midpoints, but do NOT independently state net EK.
// The comparison must preserve the source, and never promote a display amount
// into a supplier-verified Woo price.
foreach ([
    ['L1',['L1'=>2250],48801],
    ['U1',['L1'=>2250],71504],
] as [$shape,$dimensions,$shownCents]) {
    $holdout=reviewLU($shape,'APL38',$dimensions);
    expectCal($holdout['estimatedSupplierNetCents']===$shownCents,
        $shape.' interpolation same as supplier screenshot');
    expectCal($holdout['supplierDisplayOnlyCents']===$shownCents,
        $shape.' exactly observed original screenshot');
    expectCal($holdout['modelVsSupplierDisplayDifferenceCents']===0,
        $shape.' holdout deviation is exactly zero cents');
    expectCal($holdout['modelVsSupplierDisplayStatus']==='display-matches-estimate-net-unverified',
        $shape.' holdout is independent display evidence, net not proven');
    expectCal($holdout['displayEvidenceSource']===
        'docs/references/speedmaster-lu/L1_U1_2250_PRICE_20261106.json',
        $shape.' holdout source survives handoff');
    expectCal(!$holdout['supplierNetQuoteVerifiedForExactTarget']
        && !$holdout['checkoutPriceApproved'] && !$holdout['purchasable'],
        $shape.' cannot buy based on a model even if screenshots match');
}

// User clarified that the EXISTING V3 inbound rule is correct:
// 10 EUR base net + 50 EUR additional at >=1900 mm per verified delivered
// part = 60 EUR TOTAL, not 10 + 60. Never charge freight per shape arm.
expectCal(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1899])===1000,
    'inbound 1899 mm only EUR 10 net');
expectCal(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1900])===6000,
    'inbound at 1900 mm EUR 10 + EUR 50 net = EUR 60 TOTAL');
expectCal(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1000,1900,2200])===6000,
    'only one EUR 50 surcharge, never EUR 50 per long part');

// FOUR NEW owner-confirmed W980/1.5mm decor-matched WIDTH samples.
// U1 is non-monotone across thicknesses: 17.5mm rises with width while
// 38mm falls. No generic €/m2 or positive-only width surcharge is safe.
foreach ([
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>650],53433],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>650],77640],
    ['L3','APL17.5',['L1'=>2500,'B3'=>1000,'B4'=>1000],53498],
    ['L4','APL17.5',['L1'=>2500,'B5'=>700],47819],
] as [$shape,$material,$dimensions,$net]) {
    $r=reviewLU($shape,$material,$dimensions);
    expectCal($r['priceStatus']==='exact-operator-confirmed-net-reference',
        $shape.$material.' exact width supplier net source');
    expectCal($r['netSupplierReferenceCents']===$net
        && $r['estimatedSupplierNetCents']===null,
        $shape.$material.' exact width cost in cents, not estimate');
    expectCal(count($r['referenceCaseIds'])===1
        && strpos($r['referenceCaseIds'][0],'operator-net-20261106-')===0,
        $shape.$material.' width source ID identifies exact dimensions');
    expectCal($r['grossDEWith10or60EURInboundScenario']['inbound10EUR']===
        HPZ_APL_Price_V3::targetGrossForVerifiedCosts($net,1000,0),
        'use existing V3 19% DE VAT and margins only once');
    expectCal(!$r['supplierNetQuoteVerifiedForExactTarget']
        && !$r['checkoutPriceApproved'] && !$r['purchasable']
        && !$r['realPackedDimensionsVerified'],
        'new exact width prices cannot unlock WordPress sales or manufacturing');
}
$u175 = [
    reviewLU('U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>600]),
    reviewLU('U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>650]),
    reviewLU('U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>700]),
];
$u38 = [
    reviewLU('U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>600]),
    reviewLU('U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>650]),
    reviewLU('U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>700]),
];
expectCal(array_column($u175,'netSupplierReferenceCents')===[52876,53433,53990],
    '17.5 U1 width 600/650/700 rising EUR 528.76 / 534.33 / 539.90');
expectCal(array_column($u38,'netSupplierReferenceCents')===[78569,77640,76712],
    '38 U1 width 600/650/700 falling EUR 785.69 / 776.40 / 767.12');
expectCal(2*53433===52876+53990,
    '17.5mm U1 width 650 exactly midpoint between 600 and 700');
expectCal(abs(2*77640-(78569+76712))===1,
    '38mm U1 B1=650 matches 600/700 price interpolation to half a cent');
expectCal(reviewLU('L3','APL17.5',['L1'=>2500,'B3'=>1000,'B4'=>1000])['netSupplierReferenceCents']
    -reviewLU('L3','APL17.5',['L1'=>2500,'B3'=>900,'B4'=>900])['netSupplierReferenceCents']===1169,
    'L3 paired widths B3/B4 900=>1000 net +11.69 EUR');
expectCal(reviewLU('L4','APL17.5',['L1'=>2500,'B5'=>700])['netSupplierReferenceCents']
    -reviewLU('L4','APL17.5',['L1'=>2500,'B5'=>600])['netSupplierReferenceCents']===1251,
    'L4 base B5 600=>700 net +12.51 EUR');
// Bounded widths can use a measured source bracket ONLY when everything
// else is identical. Signed rounding is conservative for U1 APL38's
// DECREASING net price; without that 38mm could be wrongly overcharged.
foreach ([
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>625],53155,'B1',[600,650]],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>675],53712,'B1',[650,700]],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>625],78105,'B1',[600,650]],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>675],77176,'B1',[650,700]],
    ['L3','APL17.5',['L1'=>2500,'B3'=>950,'B4'=>950],52914,'B3=B4',[900,1000]],
    ['L4','APL17.5',['L1'=>2500,'B5'=>650],47194,'B5',[600,700]],
] as [$shape,$material,$dimensions,$expected,$axis,$bounds]) {
    $r=reviewLU($shape,$material,$dimensions);
    expectCal(strpos($r['priceStatus'],'bounded-')===0
        && strpos($r['priceStatus'],'-width-net-estimate-not-verified')!==false,
        $shape.$material.' only bounded internal width estimate');
    expectCal($r['estimatedSupplierNetCents']===$expected
        && $r['netSupplierReferenceCents']===null,
        $shape.$material.' width interpolation exact rounded cents');
    expectCal($r['axisInterpolated']===$axis && $r['boundedByMm']===$bounds
        && count(array_unique($r['referenceCaseIds']))===2,
        $shape.$material.' distinct measured source widths and axis');
    expectCal(!$r['supplierNetQuoteVerifiedForExactTarget']
        && !$r['checkoutPriceApproved'] && !$r['purchasable'],
        'width interpolation NEVER allows supplier checkout or real order');
}
// No unsupported width, width+length 2D interpolation, decor transfer,
// uncoupled L3 B3/B4, B5 extrapolation or other thickness inference.
foreach ([
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>575],'W980'],
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>725],'W980'],
    ['U1','APL38',['L1'=>2400,'L2'=>1700,'B1'=>625],'W980'],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1650,'B1'=>625],'W980'],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>625],'H1145'],
    ['L3','APL17.5',['L1'=>2250,'B3'=>950,'B4'=>950],'W980'],
    ['L3','APL38',['L1'=>2500,'B3'=>950,'B4'=>950],'W980'],
    ['L3','APL17.5',['L1'=>2500,'B3'=>1100,'B4'=>1100],'W980'],
    ['L4','APL17.5',['L1'=>2250,'B5'=>650],'W980'],
    ['L4','APL17.5',['L1'=>2500,'B5'=>750],'W980'],
    ['L4','APL17.5',['L1'=>2500,'B5'=>650],'H1145'],
] as [$shape,$material,$dimensions,$decor]) {
    $r=reviewLU($shape,$material,$dimensions,$decor);
    expectCal($r['priceStatus']==='missing-evidence'
        && $r['netSupplierReferenceCents']===null
        && $r['estimatedSupplierNetCents']===null,
        $shape.' unsupported width/length/decor must fail closed');
}
// A B3/B4 pair is a single linked Speedmaster geometry constraint.
// It must be impossible to mix 950/1000 to obtain an invented price.
$badCoupled=false;
try {reviewLU('L3','APL17.5',['L1'=>2500,'B3'=>950,'B4'=>1000]);}
catch (InvalidArgumentException $e) {$badCoupled=true;}
expectCal($badCoupled,'L3 B3/B4 mismatched widths cannot be priced');

// The known 38-mm U1 width counterexample: 600 -> 700 mm is cheaper.
// B1=650 is NOW an independently observed source, but no extrapolation
// beyond the three measured 600/650/700 mm widths is supported.
foreach ([
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>750]],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>750]],
    ['U1','APL38',['L1'=>2600]],
    ['U1','APL38',['L1'=>1950]],
    ['U1','APL38',['L1'=>2250,'L2'=>1450]],
    ['U1','APL38',['L3'=>1750]],
    ['U1','APL38',['B2'=>650]],
    ['L1','APL38',['L1'=>2600]],
    ['L1','APL38',['L1'=>1900]],
    ['L1','APL38',['L2'=>1300]],
    ['L1','APL38',['B1'=>700]],
    ['L2','APL38',[]],
    ['L3','APL17.5',['L1'=>2600]],
] as $case) {
    $result=reviewLU($case[0],$case[1],$case[2]);
    expectCal($result['priceStatus']==='missing-evidence','no width/shape/large-length extrapolation');
    expectCal($result['estimatedSupplierNetCents']===null
        && $result['grossDEWith10or60EURInboundScenario']===null,'no fake price on unknown case');
}
foreach ([
    ['U2',68736],['U3',69149],['U4',69149],
] as [$shape,$screen]) {
    $result=reviewLU($shape);
    expectCal($result['priceStatus']==='unverified-speedmaster-screen-amount','screen-only '.$shape);
    expectCal($result['supplierDisplayOnlyCents']===$screen,'screen amount preserved');
    expectCal($result['estimatedSupplierNetCents']===null,'screen-only not manufacturer net EK');
    expectCal($result['grossDEWith10or60EURInboundScenario']===null,'unverified screenshot no sales scenario');
}
$l4=reviewLU('L4');
expectCal($l4['priceStatus']==='unverified-speedmaster-screen-amount','L4 supplier screenshot not net proof');
expectCal($l4['supplierDisplayOnlyCents']===65861,'L4 screenshot 658.61 EUR preserved');
expectCal(reviewLU('L1','APL38',['L1'=>1900],'H1145')['priceStatus']==='missing-evidence',
    'straight decor price grid may NOT be copied to L/U');
expectCal(reviewLU('U2','APL17.5',['B2'=>650])['priceStatus']==='missing-evidence',
    '17.5mm U2 exact references cannot infer unseen widths');

// Three new independent supplier-screen controls (06.11.2026).
// The L2/U2 display amounts are NOT verified net EK and must NEVER unlock
// a Woo price or turn into an automatic form/edge multiplier.
$l1At2250=reviewLU('L1','APL38',['L1'=>2250]);
$l2At2250=reviewLU('L2','APL38',['L1'=>2250]);
expectCal($l2At2250['priceStatus']==='unverified-speedmaster-screen-amount',
    'L2 same-dimension screenshot is display only');
expectCal($l2At2250['supplierDisplayOnlyCents']===48801,
    'L2 original display amount 488.01');
expectCal($l2At2250['supplierDisplayOnlyCents']===$l1At2250['supplierDisplayOnlyCents'],
    'L1/L2 parity ONLY at exact 2250mm W980 APL38 reference');
expectCal($l2At2250['estimatedSupplierNetCents']===null
    && $l2At2250['grossDEWith10or60EURInboundScenario']===null
    && !$l2At2250['purchasable'],'L2 display does not imply approved sale');

$u1At2000=reviewLU('U1','APL38',['L1'=>2000]);
$u2At2000=reviewLU('U2','APL38',['L1'=>2000]);
$u1At2250=reviewLU('U1','APL38',['L1'=>2250]);
$u2At2250=reviewLU('U2','APL38',['L1'=>2250]);
expectCal($u2At2250['priceStatus']==='unverified-speedmaster-screen-amount',
    'U2 at 2250 only screenshot evidence');
expectCal($u2At2250['supplierDisplayOnlyCents']===71091,
    'U2 original display 710.91');
expectCal($u2At2000['supplierDisplayOnlyCents']-$u1At2000['netSupplierReferenceCents']===-413,
    'U2 minus U1 display/ref = -4.13 EUR at L1=2000');
expectCal($u2At2250['supplierDisplayOnlyCents']-$u1At2250['supplierDisplayOnlyCents']===-413,
    'U2 minus U1 display = -4.13 EUR at L1=2250');
expectCal($u2At2250['estimatedSupplierNetCents']===null
    && $u2At2250['grossDEWith10or60EURInboundScenario']===null
    && !$u2At2250['purchasable'],'two matching offsets do NOT authorize public U2 pricing');

// The third photo is left chamfer (150 mm × 150 mm), Kante durchlaufend,
// NOT an isolated edge-color/finish option. Keep it out of square L1 pricing.
expectCal($l1At2250['supplierDisplayOnlyCents']===48801,
    'left chamfer screenshot must never override straight-square L1');
$leftChamfer=fixtureLU('L1','APL38',['L1'=>2250]);
$leftChamfer['lCorner']=[
    'side'=>'left','treatment'=>'chamfer',
    'parameters'=>['L3'=>150,'B3'=>150,'edge'=>'continuous']
];
$chamferRejected=false;
try {
    HPZ_APL_LU_Calibration_11::review($leftChamfer);
} catch (InvalidArgumentException $e) {
    $chamferRejected=true;
}
expectCal($chamferRejected,'150x150 corner case must stay outside square-corner public price model');

// NEW text-only supplier price observations, 06.11.2026. No PNGs and no
// screenshots archived for these eight observations. Every observation is
// a supplier DISPLAY, not a confirmed NET-EK or manufacturer cut-list.
$eightTextCases = [
 ['L2',['L1'=>2500],51156],
 ['U2',['L1'=>2500],73446],
 ['L3',['L1'=>2000,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900],79852],
 ['L3',['L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900],84562],
 ['L4',['L1'=>2000,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,'B5'=>600],65861],
 ['L4',['L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,'B5'=>600],70571],
 ['U3',['L1'=>2500],73859],
 ['U4',['L1'=>2500],73859],
];
foreach ($eightTextCases as [$shape,$dimensions,$price]) {
    $result=reviewLU($shape,'APL38',$dimensions);
    expectCal($result['priceStatus']==='unverified-speedmaster-screen-amount',
        $shape.' exact operator-text display must not be labeled net');
    expectCal($result['supplierDisplayOnlyCents']===$price,
        $shape.' original amount observed as text, exact cents');
    expectCal(in_array('docs/references/speedmaster-lu/LU_EIGHT_TEXT_PRICES_20261106.json',
        $result['displayEvidenceSources'], true),$shape.' text source preserved');
    expectCal($result['netSupplierReferenceCents']===null
        && $result['estimatedSupplierNetCents']===null
        && $result['estimatedSupplierDisplayCents']===null,
        $shape.' exact display never promoted into verified net or estimate');
    expectCal($result['grossDEWith10or60EURInboundScenario']===null
        && !$result['supplierNetQuoteVerifiedForExactTarget']
        && !$result['checkoutPriceApproved'] && !$result['purchasable'],
        $shape.' no Woo price or manufacturing approval by text');
}
$l4Twice=reviewLU('L4','APL38',['L1'=>2000,'L2'=>2000,'B1'=>600,'B2'=>600,
    'B3'=>900,'B4'=>900,'B5'=>600]);
expectCal(count($l4Twice['displayEvidenceSources'])===2,
    'L4 658.61 previously transcribed and independently re-confirmed in new text');

// A bounded model may be built from two independent DISPLAY values, only
// when EVERY non-changing dimension matches and only L1/L2 varies.
// This is NOT a supplier net EK model and must never feed the Woo price.
foreach ([
    ['L2',['L1'=>2375],49979,'L1',[2250,2500]],
    ['L3',['L1'=>2250,'L2'=>2000,'B3'=>900,'B4'=>900],82207,'L1',[2000,2500]],
    ['L4',['L1'=>2250,'L2'=>2000,'B3'=>900,'B4'=>900,'B5'=>600],68216,'L1',[2000,2500]],
    ['U2',['L1'=>2125],69914,'L1',[2000,2250]],
    ['U2',['L1'=>2375],72269,'L1',[2250,2500]],
    ['U3',['L1'=>2250],71504,'L1',[2000,2500]],
    ['U4',['L1'=>2250],71504,'L1',[2000,2500]],
] as [$shape,$dimensions,$price,$axis,$bounds]) {
    $result=reviewLU($shape,'APL38',$dimensions);
    expectCal($result['priceStatus']==='bounded-one-axis-display-estimate-not-net-verified',
        $shape.' model must remain display-only');
    expectCal($result['estimatedSupplierDisplayCents']===$price,
        $shape.' bounded model from two observed prices');
    expectCal($result['displayAxisInterpolated']===$axis
        && $result['displayBoundedByMm']===$bounds,
        $shape.' strict observed length interval');
    expectCal(count($result['displayReferenceIds'])>=2,
        $shape.' both source configurations retained');
    expectCal($result['supplierDisplayOnlyCents']===null
        && $result['netSupplierReferenceCents']===null
        && $result['estimatedSupplierNetCents']===null,
        $shape.' model must NEVER become an EK');
    expectCal($result['grossDEWith10or60EURInboundScenario']===null
        && !$result['checkoutPriceApproved'] && !$result['purchasable'],
        $shape.' supplier display interpolation cannot authorize sale');
}

// Shape comparisons: validate EXACT observed points, not a global
// pricing surcharge. Confirm that the earlier two U2 -4.13 cases still
// match the third new case, and L3/L4 +47.10 length change agrees.
foreach ([
    [2000,69149,68736,-413],
    [2250,71504,71091,-413],
    [2500,73859,73446,-413],
] as [$length,$u1,$u2,$diff]) {
    $a=reviewLU('U1','APL38',['L1'=>$length]);
    $b=reviewLU('U2','APL38',['L1'=>$length]);
    $left=$a['netSupplierReferenceCents'] ?? $a['supplierDisplayOnlyCents']
        ?? $a['estimatedSupplierNetCents'];
    expectCal($left===$u1 && $b['supplierDisplayOnlyCents']===$u2,
        'U1 vs U2 same dimensions and thickness at L1='.$length);
    expectCal($u2-$u1===$diff,'U2 observed reduction 4.13 each of 3 L1 samples');
}
foreach (['L3','L4'] as $shape) {
    $base=reviewLU($shape,'APL38',[
        'L1'=>2000,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,
    ]+($shape==='L4'?['B5'=>600]:[]));
    $long=reviewLU($shape,'APL38',[
        'L1'=>2500,'L2'=>2000,'B1'=>600,'B2'=>600,'B3'=>900,'B4'=>900,
    ]+($shape==='L4'?['B5'=>600]:[]));
    expectCal($long['supplierDisplayOnlyCents']-$base['supplierDisplayOnlyCents']===4710,
        $shape.' exactly +47.10 over 500mm, for these same B and L2 values only');
}
foreach ([2000,2500] as $length) {
    $u1=reviewLU('U1','APL38',['L1'=>$length]);
    $u3=reviewLU('U3','APL38',['L1'=>$length]);
    $u4=reviewLU('U4','APL38',['L1'=>$length]);
    $ref=$u1['netSupplierReferenceCents'];
    expectCal($u3['supplierDisplayOnlyCents']===$ref
        && $u4['supplierDisplayOnlyCents']===$ref,
        'U1/U3/U4 equal ONLY at documented length and W980 APL38');
}

// No borderless edge or different edge profile is an offered product,
// including before a separately approved public checkout.
$invalidEdge=fixtureLU('L1','APL38');
$invalidEdge['edge']='without-edge';
$edgeRejected=false;
try {HPZ_APL_LU_Calibration_11::review($invalidEdge);}
catch (InvalidArgumentException $e) {$edgeRejected=true;}
expectCal($edgeRejected,'owner decided: all external edges 1.5 mm decor matched only');

foreach ([
    ['L2',['L1'=>2100]],
    ['L2',['L1'=>2600]],
    ['L3',['L1'=>1850,'L2'=>2000,'B3'=>900,'B4'=>900]],
    ['L3',['L1'=>2700,'L2'=>2000,'B3'=>900,'B4'=>900]],
    ['L3',['L1'=>2250,'L2'=>1900,'B3'=>900,'B4'=>900]],
    ['L4',['L1'=>2250,'L2'=>2000,'B3'=>900,'B4'=>900,'B5'=>500]],
    ['U2',['L1'=>2600]],
    ['U3',['L2'=>1300]],
    ['U4',['B2'=>700]],
] as [$shape,$dimensions]) {
    $result=reviewLU($shape,'APL38',$dimensions);
    expectCal($result['priceStatus']==='missing-evidence',
        $shape.' no unverified extrapolation or width/B5/second-axis transfer');
    expectCal($result['estimatedSupplierDisplayCents']===null
        && $result['estimatedSupplierNetCents']===null,
        $shape.' incomplete dimension or outside bracket no price');
}
expectCal(reviewLU('L3','APL17.5',['L2'=>2000,'B3'=>950,'B4'=>950])['priceStatus']
    ==='missing-evidence','38mm L3 cannot price a 17.5mm L3');
expectCal(reviewLU('L4','APL38',['L2'=>2000,'B3'=>900,'B4'=>900,'B5'=>600],'H1145')['priceStatus']
    ==='missing-evidence','W980 L4 cannot price other decor');

// Never use browser-controlled EK or approved flags as source evidence.
$adversarial=fixtureLU('U3');
$adversarial['supplierNetCents']=1;
$adversarial['approved']=true;
$adversarial['customerPrice']=1;
expectCal(HPZ_APL_LU_Calibration_11::review($adversarial)['priceStatus']===
    'unverified-speedmaster-screen-amount','client-cost and approval fields ignored');

// Deliberately keep internal calibration and the reference CSV out of public
// WordPress bundles. Full checkout proof gate remains untouched.
$build=file_get_contents(__DIR__.'/../../build-plugin.mjs');
expectCal(strpos($build,'HPZ_APL_LU_Calibration_11')===false
    && strpos($build,'price-reference-cases.csv')===false,
    'internal calibration not shipped to browser or plugin');
echo "PASS $tests offline Speedmaster L/U price calibration checks – no public price release\n";
