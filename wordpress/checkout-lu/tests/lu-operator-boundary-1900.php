<?php
/**
 * End-to-end SYNTHETIC operator-priced L/U model -> signed cart -> checkout
 * preflight -> HPOS/order line, at the actual 1899/1900/1901 mm boundary.
 * Never creates a Woo order or changes WordPress options.
 */
declare(strict_types=1);
define('ABSPATH', __DIR__);
require_once __DIR__.'/../../hpz-apl-admin-preview/includes/decor-catalog.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_Price_V3.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_LU_Price_Readiness.php';
require_once __DIR__.'/../../../pricing-v3/HPZ_APL_LU_Shop_Ratebook_12.php';
require_once __DIR__.'/../../checkout-v08/HPZ_APL_WC_Cart_Bridge.php';
require_once __DIR__.'/../HPZ_APL_WC_LU_Cart_Bridge.php';

$tests=0;
function borderCheck(bool $truth,string $reason):void {
  global $tests; $tests++; if(!$truth)throw new RuntimeException('FAIL '.$reason);
}
function modelRaw(string $shape,int $length):array {
  $isL=$shape==='L1';
  return [
    'schemaVersion'=>2,'inputUnit'=>'mm',
    'productId'=>$isL?1000080:1000081,
    'sku'=>$isL?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
    'product'=>$isL?'l':'u','geometry'=>$shape,'corner'=>'square',
    'dimensions'=>$isL
      ?['L1'=>(string)$length,'L2'=>'1200','B1'=>'600','B2'=>'600']
      :['L1'=>(string)$length,'L2'=>'1200','L3'=>'1800','B1'=>'600','B2'=>'600','B3'=>'600'],
    'material'=>'APL38','decor'=>'H1145','edge'=>'matching-1.5','quantity'=>1,
    ...($isL?['lCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]]]:[])
  ];
}
class MockShopOrderRow{
  public array $meta=[];
  public function add_meta_data($key,$value,$unique=false):void{$this->meta[$key]=$value;}
}
$policy=[
  'model_price_approved'=>true,'extended_model_approved'=>true,
  'corner_model_approved'=>false,'other_cost_net_cents'=>2000,
  'price_approved_on'=>'2026-11-09','max_quantity'=>2,
  'approved_shipping_rate_ids'=>['test_rate:1'],
];
$secret=str_repeat('operator-sandbox-only',3);
$now=strtotime('2026-11-09 12:00:00 UTC');
foreach(['L1','U1'] as $shape) {
  $prev=null;
  foreach([1899,1900,1901] as $length){
    $raw=modelRaw($shape,$length);
    $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
    $estimate=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($c);
    borderCheck(is_array($estimate),'extended $shape / $length estimated without fake supplier quote');
    $inbound=HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c);
    borderCheck($inbound===($length>=1900?6000:1000),
      "$shape $length internal inbound 10/60 EUR");
    $proof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$policy);
    borderCheck(is_array($proof)&&$proof['operatorPriceApproved']===true,
      "$shape $length requires trusted explicit commercial approval");
    borderCheck(HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,[])===null,
      "$shape $length anonymous customer cannot create supplier proof");
    $key=$proof['configurationKey'];
    $lookup=static fn($k)=>$k===$key?$proof:null;
    $cart=HPZ_APL_WC_LU_Cart_Bridge::issue($raw,$lookup,$secret,$now);
    $checked=HPZ_APL_WC_LU_Cart_Bridge::inspect($cart,1,$lookup,$secret,$now);
    $gross=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(
      $estimate['supplierNetCents'],$inbound,2000
    );
    borderCheck($checked['quote']['unitGrossReferenceCents']===$gross,
      "$shape $length net supplier + inbound + overhead => V3 gross");
    $shipping=1999; // Woo's SEPARATE customer delivery fixture, NOT configuredInboundCents.
    $context=[
      'country'=>'DE','taxVerified'=>true,'baseTaxRateBasisPoints'=>1900,
      'pricesConfigured'=>true,'shippingCalculated'=>true,
      'selectedShippingRateId'=>'test_rate:1','shippingAmountCents'=>$shipping,
      'preDiscountGrossCents'=>$gross,
      'actualNetLineRevenueCents'=>(int)round($gross/1.19),
      'checkoutIntegrationVerified'=>true,'manualSupplierHandoffVerified'=>true,
      'operatorSaleApproval'=>true,
    ];
    $checkout=HPZ_APL_WC_LU_Cart_Bridge::checkout(
      $cart,1,$lookup,$context,$secret,$now
    );
    borderCheck($checkout['validForReleaseReview']===true
        &&$checkout['purchasable']===false,
      "$shape $length trusted Woo context passes preflight but never auto-publishes");
    borderCheck($checkout['production']['dimensionsMm']['L1']===$length,
      "$shape $length exact physical production length");
    $order=new MockShopOrderRow();
    HPZ_APL_WC_LU_Cart_Bridge::writeOrderLine($order,$checkout);
    borderCheck(($order->meta['L1']??'')===$length.' mm'
      &&isset($order->meta['_hpz_apl_manufacturing_v2']),
      "$shape $length order contains exact L1 and HPOS structured config");
    borderCheck(strpos(json_encode($order->meta),'supplierNetCents')===false,
      "$shape $length supplier net cost is private");
    $wrong=$context;
    $wrong['selectedShippingRateId']='unapproved';
    borderCheck(!HPZ_APL_WC_LU_Cart_Bridge::checkout(
      $cart,1,$lookup,$wrong,$secret,$now)['validForReleaseReview'],
      "$shape $length rejects unmatched customer shipping rate");
    $tooCheap=$context;
    $tooCheap['actualNetLineRevenueCents']=intdiv($gross,4);
    borderCheck(!HPZ_APL_WC_LU_Cart_Bridge::checkout(
      $cart,1,$lookup,$tooCheap,$secret,$now)['validForReleaseReview'],
      "$shape $length excessive discount fails 35 pct net margin");
    $noPricePolicy=$policy;$noPricePolicy['extended_model_approved']=false;
    if($length===1899 || $length===1901)borderCheck(
      HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$noPricePolicy)===null,
      "$shape $length extended width/length cannot bypass policy");
    if($prev!==null && $length===1900)borderCheck($gross>$prev+8000,
      "$shape 1900 crosses freight tier and calculated gross increases");
    $prev=$gross;
  }
}
echo "PASS $tests isolated operator-price/190cm signed Woo cart, VAT, coupon and HPOS metadata checks. No live orders.\n";
