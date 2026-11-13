<?php
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/hpz-apl-admin-preview/includes/price-preview.php';

$checks=0;
function ensure($ok, string $label): void { global $checks; ++$checks; if (!$ok) throw new RuntimeException($label); }
function fails(callable $f, string $label): void {
    try { $f(); } catch (InvalidArgumentException $e) { ensure(true,$label); return; }
    ensure(false,$label);
}
function sample(string $decor='W980', string $material='APL17.5', string $l='2000', string $b='600', int $quantity=1): array {
    return ['schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,'sku'=>'HPZ-APL-GERADE-2026',
        'product'=>'straight','geometry'=>'straight','corner'=>'square',
        'dimensions'=>['L1'=>$l,'B1'=>$b],'material'=>$material,'decor'=>$decor,'quantity'=>$quantity,
        'straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]]];
}
$catalog=HPZ_APL_Decor_Catalog::all();
ensure(count($catalog)===16,'16 canonical decors');
foreach ($catalog as $id=>$row) foreach (['APL17.5','APL38'] as $material) {
    $out=HPZ_APL_Price_Preview::publicQuote(sample((string)$id,$material),'DE');
    ensure($out['unitGrossReferenceCents']>0 && $out['purchasable']===false,'priced visual-only '.$id.'/'.$material);
    ensure(!isset($out['supplierNet'],$out['marginPct']) && !isset($out['decorSupplierCode']),'no internal cost/code '.$id.'/'.$material);
}
$baseline=HPZ_APL_Price_Preview::publicQuote(sample());
ensure($baseline['unitGrossReferenceCents']===78000 && $baseline['totalGrossReferenceCents']===78000,'base V3 price');
ensure(HPZ_APL_Price_Preview::publicQuote(sample('W980','APL38','1200','600'))['unitGrossReferenceCents']===84000,'small worktop 120x60 510 EUR');
ensure(HPZ_APL_Price_Preview::publicQuote(sample('W980','APL38','3500','900'))['unitGrossReferenceCents']===236000,'large worktop 350x90 2030 EUR');
ensure(strpos($baseline['taxNote'],'19')===false,'unknown destination does not claim applied 19% tax');
ensure(strpos(HPZ_APL_Price_Preview::publicQuote(sample(),'DE')['taxNote'],'19')!==false,'DE reference explicitly labeled');
ensure(strpos(HPZ_APL_Price_Preview::publicQuote(sample(),'CH')['taxNote'],'19')===false,'foreign destination does not claim applied 19% tax');
ensure(HPZ_APL_Price_Preview::publicQuote(sample('W980','APL17.5','2501','880'))['unitGrossReferenceCents']===107000,'2501 jump');
ensure(HPZ_APL_Price_Preview::publicQuote(sample('W980','APL38','2781','600'))['unitGrossReferenceCents']===122000,'2781 jump');
ensure(HPZ_APL_Price_Preview::publicQuote(sample('W980','APL38','2500','881'))['unitGrossReferenceCents']===182000,'881 jump');
$one=sample();$one['straightCorner']=['side'=>'left','treatment'=>'round','parameters'=>['R1'=>'150']];
$both=sample();$both['straightCorner']=['side'=>'both','treatment'=>'round','parameters'=>['R1'=>'150','R2'=>'150']];
ensure(HPZ_APL_Price_Preview::publicQuote($one)['unitGrossReferenceCents']===90000,'one corner +120');
ensure(HPZ_APL_Price_Preview::publicQuote($both)['unitGrossReferenceCents']===57000,'both corners +120 only once');
ensure(HPZ_APL_Price_Preview::publicQuote(sample('W980','APL17.5','2000','600',3))['totalGrossReferenceCents']===234000,'quantity multiplies unit');
$forged=sample();$forged['price']=1;$forged['supplierNet']=1;$forged['marginPct']=99;$forged['decorSupplierCode']='F128 PA';
ensure(HPZ_APL_Price_Preview::publicQuote($forged)['totalGrossReferenceCents']===78000,'forged price fields ignored');
foreach ([
    ['productId'=>999985],['product'=>'l'],['geometry'=>'L1'],['schemaVersion'=>1],['inputUnit'=>'cm'],
    ['sku'=>'wrong'],['decor'=>'F128 PA'],['decor'=>44375],['material'=>'APL99'],['quantity'=>1.5],['quantity'=>0],
    ['dimensions'=>['L1'=>'2000.5','B1'=>'600']],['dimensions'=>['L1'=>'1e5','B1'=>'600']],
    ['dimensions'=>['L1'=>2000,'B1'=>'600']],['dimensions'=>['L1'=>'2000','B1'=>'600','B2'=>'600']],
    ['straightCorner'=>['side'=>'none','treatment'=>null,'parameters'=>['R1'=>'100']]],
    ['straightCorner'=>['side'=>'both','treatment'=>'round','parameters'=>['R1'=>'150']]],
] as $i=>$patch) fails(static function()use($patch):void{HPZ_APL_Price_Preview::publicQuote(array_replace(sample(),$patch));},'reject forged/invalid '. $i);
fails(static function():void{HPZ_APL_Price_Preview::publicQuote(sample('W980','APL17.5','999','600'));},'outside V3 envelope');
fails(static function():void{HPZ_APL_Price_Preview::publicQuote(sample('W980','APL38','2500','901'));},'thick outside V3 depth');
$continuous=sample();$continuous['straightCorner']=['side'=>'left','treatment'=>'chamfer_continuous','parameters'=>['L2'=>'150','B2'=>'150']];
ensure(HPZ_APL_Price_Preview::publicQuote($continuous)['purchasable']===false,'continuous remains non-sale despite price');
$continuous['dimensions']['L1']='2500';$continuous['dimensions']['B1']='800';
ensure(HPZ_APL_Price_Preview::publicQuote($continuous)['unitGrossReferenceCents']>0,'continuous 250x80 server-priced');
$continuous['dimensions']['L1']='4000';$continuous['dimensions']['B1']='900';
ensure(HPZ_APL_Price_Preview::publicQuote($continuous)['unitGrossReferenceCents']>0,'continuous 400x90 server-priced');
$continuous['dimensions']['L1']='4001';
fails(static function()use($continuous):void{HPZ_APL_Price_Preview::publicQuote($continuous);},'length 400.1 cm rejected');
printf("PASS %d PHP preview assertions\n",$checks);
