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

// No second same-shape 17.5mm length quote: bounded display interpolation
// for 38mm must NEVER transfer to 17.5mm or extrapolate.
foreach ([
    ['L2',['L1'=>2250]],
    ['L3',['L1'=>2250]],
    ['L4',['L1'=>2250]],
    ['U2',['L1'=>2250]],
    ['U3',['L1'=>2250]],
    ['U4',['L1'=>2250]],
] as [$shape,$dimensions]) {
    $candidate=reviewLU($shape,'APL17.5',$dimensions);
    expectCal($candidate['priceStatus']==='missing-evidence',
        $shape.' no inferred 17.5mm interpolation from lone 2500 net anchor');
    expectCal($candidate['netSupplierReferenceCents']===null
        && $candidate['estimatedSupplierNetCents']===null
        && $candidate['supplierDisplayOnlyCents']===null,
        $shape.' cannot borrow 38mm prices for 17.5mm');
}
expectCal(reviewLU('L4','APL17.5',['L1'=>2500,'B5'=>700])['priceStatus']
    ==='missing-evidence','L4 17.5mm B5=700 never transferred from B5=600');
expectCal(reviewLU('L3','APL38',['L1'=>2500,'B2'=>700])['priceStatus']
    ==='missing-evidence','17.5mm L3 price cannot be transferred to unrelated 38mm widths');
expectCal(reviewLU('L3','APL17.5',['L1'=>2500],'H1145')['priceStatus']
    ==='missing-evidence','17.5mm W980 price never substitutes another decor');

// Only L1/U1 variable-length models within proven same-thickness brackets.
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

// The known 38-mm U1 width counterexample: 600 -> 700 mm is cheaper.
// MUST NOT infer any 650-mm price between these records.
foreach ([
    ['U1','APL38',['L1'=>2500,'L2'=>1700,'B1'=>650]],
    ['U1','APL17.5',['L1'=>2500,'L2'=>1700,'B1'=>650]],
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
    ['L3','APL17.5',[]],
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
expectCal(reviewLU('L1','APL38',[],'H1145')['priceStatus']==='missing-evidence',
    'straight decor price grid may NOT be copied to L/U');
expectCal(reviewLU('U2','APL17.5')['priceStatus']==='missing-evidence',
    'one 38-mm screenshot cannot certify 17.5-mm U2');

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
expectCal(reviewLU('L3','APL17.5',['L2'=>2000,'B3'=>900,'B4'=>900])['priceStatus']
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
