<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/HPZ_APL_Price_V3.php';
$checks = 0;
function check($ok, string $label): void {
    global $checks;
    ++$checks;
    if (!$ok) { throw new RuntimeException('FAIL: ' . $label); }
}
function expectFail(callable $fn, string $label): void {
    try { $fn(); } catch (InvalidArgumentException $e) { check(true, $label); return; }
    check(false, $label);
}
function input(string $mat = 'APL17.5', string $decor = 'W980', int $l = 2000, int $b = 600, string $side = 'none', ?string $kind = null, int $quantity = 1): array {
    $p = [];
    if ($side !== 'none') {
        if ($kind === 'round') { $p = $side === 'left' ? ['R1'=>150] : ($side === 'right' ? ['R2'=>150] : ['R1'=>150,'R2'=>150]); }
        else { $p = $side === 'left' ? ['L2'=>150,'B2'=>150] : ($side === 'right' ? ['L3'=>150,'B3'=>150] : ['L2'=>150,'B2'=>150,'L3'=>150,'B3'=>150]); }
    }
    $corner = $kind === 'round' ? 'round' : ($kind === 'chamfer_square' ? 'chamfer' : ($kind === 'chamfer_continuous' ? 'continuous' : 'square'));
    return [
        'schemaVersion'=>2,'unit'=>'mm','product'=>'straight','geometry'=>'straight',
        'dimensions'=>['L1'=>$l,'B1'=>$b], 'edge'=>'matching-1.5',
        'straightCorner'=>['side'=>$side,'treatment'=>$kind,'parameters'=>$p],
        'corner'=>$corner, 'material'=>$mat,'decor'=>$decor,'quantity'=>$quantity,
    ];
}
function gross(array $c): int { return HPZ_APL_Price_V3::quote($c)['unitGrossReferenceCents']; }
// Shared 40% target / 35% discount floor / 10% reserve for supplier-priced L/U.
// Straight retains the historic shape/decor component but adds flat inbound to its product price.
check(HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69149,15000,0)===184000,'U1 verified-cost target EUR 1640');
check(HPZ_APL_Price_V3::targetGrossForVerifiedCosts(68736,15000,0)===183000,'U2 assumed-cost example EUR 1530');
check(HPZ_APL_Price_V3::targetGrossForVerifiedCosts(46445,15000,0)===135000,'L1 verified-cost target EUR 1150');
check(HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69149,15000,5000)>184000,'actual extras increase price');
expectFail(function(){HPZ_APL_Price_V3::targetGrossForVerifiedCosts(0,6000,0);},'zero EK rejected');
expectFail(function(){HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69149,-1,0);},'negative inbound rejected');
expectFail(function(){HPZ_APL_Price_V3::targetGrossForVerifiedCosts(69149,1000,-1);},'negative other costs rejected');
$minimumNetCents=intdiv((69149+15000)*110+64,65);
check(HPZ_APL_Price_V3::checkNetMargin(69149,15000,$minimumNetCents)['passesMinimum35']===true,'discount floor exact pass');
check(HPZ_APL_Price_V3::checkNetMargin(69149,15000,$minimumNetCents-1)['passesMinimum35']===false,'discount floor one-cent below rejected');

// Every material/decor pair in the agreed catalog.
$names=['W980','U999','H1145','H3303','F021','F095','F121','F128','F186','F235','F302','F629','F661','F812','44375','44405'];
foreach ($names as $decor) foreach (['APL17.5','APL38'] as $material) {
    $out = HPZ_APL_Price_V3::quote(input($material,$decor));
    check($out['unitGrossReferenceCents'] > 0 && $out['unitGrossReferenceCents'] % 1000 === 0, 'decor price multiple EUR 10: '.$decor.'/'.$material);
    check($out['purchasable'] === false, 'never authorizes checkout');
    check(!array_key_exists('supplierNet', $out), 'never leaks EK');
}
check(gross(input())===45000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'17.5 white baseline plus flat inbound');
check(gross(input('APL38'))===67000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'38 white baseline');
check(gross(input('APL38','W980',1200,600))===51000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'120x60 must price at 510 EUR');
check(gross(input('APL38','W980',3500,900))===203000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'350x90 38 mm gross price 2030 EUR');
check(gross(input('APL17.5','W980',2500,880))===70000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thin size 2500x880');
check(gross(input('APL17.5','W980',2501,880))===74000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thin length jump 2501');
check(gross(input('APL17.5','F128',2501,880))===113000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'granite thin area premium');
check(gross(input('APL38','W980',2500,880))===79000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick just below 881');
check(gross(input('APL38','W980',2500,881))===149000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick depth jump at 881');
check(gross(input('APL38','W980',2780,600))===84000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick below length jump');
check(gross(input('APL38','W980',2781,600))===89000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick length jump');
check(gross(input('APL38','W980',2781,881))===168000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick combined jump');
check(gross(input('APL38','F128',2781,881))===183000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick granite combined jump');
check(gross(input('APL38','W980',3000,881))===178000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'thick large high-end');
foreach (['round','chamfer_square','chamfer_continuous'] as $kind) foreach (['left','right','both'] as $side) {
    $q=HPZ_APL_Price_V3::quote(input('APL17.5','W980',2000,600,$side,$kind));
    check($q['unitGrossReferenceCents']===57000+HPZ_APL_Price_V3::inboundGrossContributionCents(),'only once 120 EUR corner '.$kind.'/'.$side);
    check($q['unitCornerSurchargeCents']===12000,'corner surcharge accurate');
}
$q=HPZ_APL_Price_V3::quote(input('APL38','W980',2000,600,'both','round',3));
check($q['unitGrossReferenceCents']===79000+HPZ_APL_Price_V3::inboundGrossContributionCents() && $q['totalGrossReferenceCents']===(79000+HPZ_APL_Price_V3::inboundGrossContributionCents())*3, 'unit rounding before quantity');
$c=input();$c['price']=1;$c['purchasable']=true;$c['supplierNet']=1;$c['verified']=true;
check(HPZ_APL_Price_V3::quote($c)['purchasable']===false,'client approval ignored');
foreach ([
    ['schemaVersion'=>1], ['unit'=>'cm'], ['geometry'=>'L1'], ['product'=>'l'],
    ['material'=>'APL99'], ['decor'=>'HACKED'], ['edge'=>'unfinished'],
    ['dimensions'=>['L1'=>'2000','B1'=>600]], ['dimensions'=>['L1'=>2000,'B1'=>600,'L3'=>42]],
    ['dimensions'=>['L1'=>999,'B1'=>600]], ['dimensions'=>['L1'=>4001,'B1'=>600]],
    ['dimensions'=>['L1'=>2500,'B1'=>299]], ['dimensions'=>['L1'=>2500,'B1'=>1201]],
    ['quantity'=>0], ['quantity'=>1.5], ['quantity'=>1001],
    ['straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>['R1'=>100]]],
    ['corner'=>'round'],
] as $i=>$patch) {
    expectFail(static function() use($patch):void { HPZ_APL_Price_V3::quote(array_replace(input(),$patch)); }, 'invalid input case '. $i);
}
expectFail(static function():void { HPZ_APL_Price_V3::quote(input('APL38','W980',2000,901)); },'38 depth above shop max');
foreach (['APL17.5','APL38'] as $material) foreach ([[1000,300],[2500,800],[4000,900]] as $pair) {
    foreach (['left','right','both'] as $side) {
        $c=input($material,'W980',$pair[0],$pair[1],$side,'chamfer_continuous');
        check(gross($c)>0,'continuous available at '.$material.'/'.$pair[0].'x'.$pair[1].'/'.$side);
    }
}
$c=input('APL38','W980',2500,800,'both','chamfer_continuous');
$c['straightCorner']['parameters']=['L2'=>1500,'B2'=>500,'L3'=>500,'B3'=>300];
check(gross($c)>0,'asymmetric large continuous cuts accepted');
foreach ([['L2'=>1810,'B2'=>200],['L2'=>200,'B2'=>510]] as $params) {
    $c=input('APL38','W980',2500,800,'left','chamfer_continuous');
    $c['straightCorner']['parameters']=$params;
    expectFail(static function()use($c):void{HPZ_APL_Price_V3::quote($c);},'continuous supplier-safe caps');
}
$c=input('APL38','W980',2000,600,'both','chamfer_continuous');
$c['straightCorner']['parameters']=['L2'=>1000,'B2'=>200,'L3'=>1000,'B3'=>200];
expectFail(static function()use($c):void{HPZ_APL_Price_V3::quote($c);},'continuous must leave straight front');
$c=input('APL17.5','W980',2500,1000,'left','chamfer_continuous');
expectFail(static function()use($c):void{HPZ_APL_Price_V3::quote($c);},'through depth max 90 cm');
check(gross(input('APL17.5','W980',2500,1200))>0,'existing 120 cm thin board without through-cut retained');
$c=input('APL17.5','W980',2000,600,'left','chamfer_square');$c['straightCorner']['parameters']['L2']=220;
expectFail(static function()use($c):void{HPZ_APL_Price_V3::quote($c);},'square chamfer ratio max 210 at B=150');
$c=input('APL17.5','W980',2000,600,'both','round');$c['straightCorner']['parameters']['R2']=601;
expectFail(static function()use($c):void{HPZ_APL_Price_V3::quote($c);},'radius exceeding depth');
$margin=HPZ_APL_Price_V3::checkNetMargin(10000,0,20000);
check($margin['passesMinimum35']===true && $margin['meetsTarget40']===true && abs($margin['marginPct']-45.0)<.0001,'trusted sufficient margin');
$margin=HPZ_APL_Price_V3::checkNetMargin(10000,0,18000);
check($margin['passesMinimum35']===true && $margin['meetsTarget40']===false,'passes floor below target');
$margin=HPZ_APL_Price_V3::checkNetMargin(10000,0,16000);
check($margin['passesMinimum35']===false && $margin['reason']!==null,'coupon pushes below floor');
expectFail(static function():void{HPZ_APL_Price_V3::checkNetMargin(0,5000,10000);},'missing trusted supplier cost fails');
expectFail(static function():void{HPZ_APL_Price_V3::checkNetMargin(10000,-1,10000);},'invalid inbound rejected');
expectFail(static function():void{HPZ_APL_Price_V3::checkNetMargin(10000,0,0);},'zero net revenue rejected');
check(HPZ_APL_Price_V3::inboundGrossContributionCents()===33000,'150 net contributes 330 gross at target margin and rounding');
check(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1899])===15000,'flat inbound below 190cm');
check(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1900])===15000,'flat inbound at 190cm');
check(HPZ_APL_Price_V3::inboundCostForVerifiedParts([1899,2400])===15000,'inbound charged once per configured unit');
expectFail(static function():void{HPZ_APL_Price_V3::inboundCostForVerifiedParts([]);},'missing parts rejected');
expectFail(static function():void{HPZ_APL_Price_V3::inboundCostForVerifiedParts(['2000']);},'untrusted string part length rejected');
check(HPZ_APL_Price_V3::checkNetMarginForParts(24311,[2000],(int)round((67000+HPZ_APL_Price_V3::inboundGrossContributionCents())/1.19))['meetsTarget40'],'verified parts plus 10 percent reserve');
// Regression: each historical retail reference remains as a component, plus flat inbound.
// Historical margin fixtures still reflect the old comparison methodology, NOT live prices.
// Supplier actual costs are fixtures,
// not a universal seller guarantee for configurations without verified quotes.
$path=dirname(__DIR__,2).'/docs/price-v3-reference-checks.csv';
if(!is_file($path)) { throw new RuntimeException('Reference fixture missing: '.$path); }
$fh=fopen($path,'rb'); $header=fgetcsv($fh,0,',','"',''); $rowCount=0; $minMargin=100.0;
while(($data=fgetcsv($fh,0,',','"',''))!==false){
    $row=array_combine($header,$data);
    $side='none';$kind=null;
    if($row['kind']==='supplier_corner_reference') {
        $side=strpos($row['test_id'],'both-')!==false?'both':'left';
        $kind=strpos($row['test_id'],'round')!==false?'round':(strpos($row['test_id'],'continuous')!==false?'chamfer_continuous':'chamfer_square');
    }
    $c=input($row['material'],$row['decor_code'],(int)$row['length_mm'],(int)$row['depth_mm'],$side,$kind);
    $price=HPZ_APL_Price_V3::quote($c);
    check($price['unitGrossReferenceCents']===(int)$row['suggested_customer_gross_eur']*100+HPZ_APL_Price_V3::inboundGrossContributionCents(),'historic retail '.$row['test_id']);
    $netRevenueCents=(int) round(($price['unitGrossReferenceCents']-HPZ_APL_Price_V3::inboundGrossContributionCents())/1.19);
    $m=HPZ_APL_Price_V3::checkNetMargin((int)round((float)$row['supplier_net_eur']*100),6000,$netRevenueCents);
    $minMargin=min($minMargin,$m['marginPct']);
    check($m['meetsTarget40'], 'target margin historic '.$row['test_id']);
    check(abs($m['marginPct']-(float)$row['buffered_margin_pct'])<.03,'historic margin agrees '.$row['test_id']);
    $newNet=(int)round($price['unitGrossReferenceCents']/1.19);
    check(HPZ_APL_Price_V3::checkNetMargin((int)round((float)$row['supplier_net_eur']*100),15000,$newNet)['passesMinimum35'],'updated price covers flat inbound and reserve '.$row['test_id']);
    $rowCount++;
}
fclose($fh);
check($rowCount===72,'all 72 historic reference cases checked');
printf("PASS %d assertions; %d historic cases; minimum margin %.3f%%\n",$checks,$rowCount,$minMargin);
