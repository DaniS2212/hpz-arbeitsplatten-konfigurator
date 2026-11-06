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
    ['L3','APL38',[]],
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
