<?php
/**
 * REAL WooCommerce PHP integration in an ephemeral GitHub Actions site.
 * NEVER call on production: test-only publish/flags exist inside the CI DB.
 * Does NOT create WC_Order, send mail, invoke a payment, or call Speedmaster.
 */
// WP-CLI eval-file prepends bootstrap code; strict_types cannot be declared here.
if (!defined('ABSPATH') || !function_exists('WC') || !class_exists('WC_Cart')) {
    throw new RuntimeException('Requires isolated bootstrapped WooCommerce.');
}
$GLOBALS['hpzChecks'] = 0;
function hpzLiveCheck(bool $yes, string $message): void {
    ++$GLOBALS['hpzChecks'];
    if (!$yes) throw new RuntimeException('Woo sandbox FAIL: '.$message);
}
function hpzTestProduct(int $id,string $sku,string $name): void {
    $postId=wp_insert_post([
        'import_id'=>$id,'post_type'=>'product','post_status'=>'publish',
        'post_title'=>$name,'post_content'=>'CI test product only'
    ],true);
    if(is_wp_error($postId)||(int)$postId!==$id)
        throw new RuntimeException('Cannot create fixed CI product ID '.$id);
    $p=new WC_Product_Simple($id);
    $p->set_name($name);
    $p->set_sku($sku);
    $p->set_status('publish');
    $p->set_regular_price('1.00');
    $p->set_price('1.00');
    $p->set_tax_status('taxable');
    $p->set_virtual(false);
    $p->set_weight('10');
    $p->save();
}
update_option('woocommerce_calc_taxes','yes');
update_option('woocommerce_currency','EUR');
update_option('woocommerce_default_country','DE:BY');
update_option('woocommerce_prices_include_tax','yes');
update_option('woocommerce_price_num_decimals',2);
update_option('woocommerce_tax_based_on','shipping');
WC_Tax::_insert_tax_rate([
    'tax_rate_country'=>'DE','tax_rate_state'=>'','tax_rate'=>'19.0000',
    'tax_rate_name'=>'Mehrwertsteuer','tax_rate_priority'=>1,
    'tax_rate_compound'=>0,'tax_rate_shipping'=>1,
    'tax_rate_order'=>1,'tax_rate_class'=>''
]);
$zone=new WC_Shipping_Zone();
$zone->set_zone_name('CI Deutschland');
$zone->set_zone_order(1);
$zone->set_zone_locations([(object)['code'=>'DE','type'=>'country']]);
$zone->save();
$instance=$zone->add_shipping_method('flat_rate');
hpzLiveCheck(is_int($instance)&&$instance>0,'Woo shipping instance created');
$rateId='flat_rate:'.$instance;
update_option('woocommerce_flat_rate_'.$instance.'_settings',[
    'title'=>'CI normaler Kundenversand','enabled'=>'yes',
    'cost'=>'6.90','tax_status'=>'taxable'
]);
WC_Cache_Helper::invalidate_cache_group('shipping');
hpzTestProduct(1000083,'HPZ-APL-GERADE-2026','CI Gerade');
hpzTestProduct(1000080,'HPZ-APL-L-FORM-2026','CI L');
hpzTestProduct(1000081,'HPZ-APL-U-FORM-2026','CI U');
if (!WC()->session) WC()->initialize_session();
if (!WC()->customer) WC()->customer=new WC_Customer(0,true);
if (!WC()->cart) WC()->initialize_cart();
WC()->customer->set_shipping_country('DE');
WC()->customer->set_billing_country('DE');
WC()->customer->set_shipping_postcode('80331');
WC()->customer->set_billing_postcode('80331');
WC()->session->set('chosen_shipping_methods',[$rateId]);
hpzLiveCheck(!HPZ_APL_WP_Straight_Runtime_09::canSell(),'Straight initially closed');
hpzLiveCheck(!HPZ_APL_WP_LU_Runtime_11::canSell(1000080),'L initially closed');
hpzLiveCheck(!HPZ_APL_WP_LU_Runtime_11::canSell(1000081),'U initially closed');
// Open only in the disposable CI database. No live WordPress flags are changed.
update_option('hpz_apl_admin_preview',[
    'enabled'=>true,'test_mode'=>true,'sale_enabled'=>true,'placement'=>'automatic'
]);
define('HPZ_APL_LU_11_AUDITED_RELEASE',true);
update_option('hpz_apl_lu_sale_v1',[
    'enabled'=>true,'manual_supplier_handoff_verified'=>true,
    'woocommerce_checkout_verified'=>true
]);
$policy=[
    'model_price_approved'=>true,'extended_model_approved'=>true,
    'corner_model_approved'=>true,'other_cost_net_cents'=>2000,
    'max_quantity'=>2,'price_approved_on'=>gmdate('Y-m-d'),
    'approved_shipping_rate_ids'=>[$rateId],
];
update_option('hpz_apl_lu_price_window_v1',$policy);
hpzLiveCheck(HPZ_APL_WP_Straight_Runtime_09::canSell(),'Straight test-only release active');
hpzLiveCheck(HPZ_APL_WP_LU_Runtime_11::canSell(1000080),'L test-only release active');
hpzLiveCheck(HPZ_APL_WP_LU_Runtime_11::canSell(1000081),'U test-only release active');
// Core plugin ran init while all gate flags were OFF; register test hooks now.
HPZ_APL_WP_Straight_Runtime_09::register();
HPZ_APL_WP_LU_Runtime_11::register();
$secret=wp_salt('auth').wp_salt('secure_auth');
// Even in the test-only enabled store, a naked WooCommerce add-to-cart
// must not be usable to bypass the signed worktop configuration.
foreach([1000083,1000080,1000081] as $unsignedId) {
    WC()->cart->empty_cart(true);
    $unsigned=false;
    try {$unsigned=WC()->cart->add_to_cart($unsignedId,1);}
    catch(Throwable $ignored) {$unsigned=false;}
    hpzLiveCheck($unsigned===false,'unsigned Woo add-to-cart rejected '.$unsignedId);
    if(function_exists('wc_clear_notices')) wc_clear_notices();
}
$secret=wp_salt('auth').wp_salt('secure_auth');
function hpzStraightRaw(int $length,string $decor='W980'):array {
    return [
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>1000083,
        'sku'=>'HPZ-APL-GERADE-2026','product'=>'straight','geometry'=>'straight',
        'corner'=>'square','straightCorner'=>[
            'side'=>'none','treatment'=>null,'parameters'=>[]
        ],'dimensions'=>['L1'=>(string)$length,'B1'=>'600'],
        'material'=>'APL38','decor'=>$decor,'edge'=>'matching-1.5','quantity'=>1
    ];
}
function hpzLURaw(string $form,int $length):array {
    $l=$form==='L1';
    return [
        'schemaVersion'=>2,'inputUnit'=>'mm','productId'=>$l?1000080:1000081,
        'sku'=>$l?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026',
        'product'=>$l?'l':'u','geometry'=>$form,'corner'=>'square',
        'dimensions'=>$l
            ?['L1'=>(string)$length,'L2'=>'1200','B1'=>'600','B2'=>'600']
            :['L1'=>(string)$length,'L2'=>'1200','L3'=>'1800',
                'B1'=>'600','B2'=>'600','B3'=>'600'],
        'material'=>'APL38','decor'=>'W980','edge'=>'matching-1.5',
        'quantity'=>1,
        ...($l?['lCorner'=>['side'=>'none','treatment'=>null,'parameters'=>[]]]:[])
    ];
}
function hpzResetCart(string $rateId):void {
    WC()->cart->empty_cart(true);
    WC()->session->set('chosen_shipping_methods',[$rateId]);
}
foreach(['straight','L1','U1'] as $shape){
    foreach([1899,1900,1901] as $length) {
        hpzResetCart($rateId);
        if($shape==='straight') {
            $raw=hpzStraightRaw($length,$length===1899?'H1145':'W980');
            $id=1000083;
            $signed=HPZ_APL_WC_Cart_Bridge_08::issue(
                $raw,static fn($key)=>null,$secret
            );
        }else {
            $raw=hpzLURaw($shape,$length);
            $id=$shape==='L1'?1000080:1000081;
            $normalized=HPZ_APL_LU_Price_Readiness::normalize($raw);
            $proof=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($normalized,$policy);
            hpzLiveCheck(is_array($proof),'test-only L/U operator proof '.$shape.'/'.$length);
            $lookup=static fn($key)=>$key===$proof['configurationKey']?$proof:null;
            $signed=HPZ_APL_WC_LU_Cart_Bridge::issue($raw,$lookup,$secret);
        }
        $cartKey=WC()->cart->add_to_cart($id,1,0,[],$signed);
        hpzLiveCheck(is_string($cartKey)&&$cartKey!=='',
            'real Woo add_to_cart '.$shape.'/'.$length);
        WC()->cart->calculate_totals();
        // Woo chooses an existing rate; no 190cm-specific customer rate.
        $cart=WC()->cart;
        $row=$cart->get_cart()[$cartKey]??null;
        hpzLiveCheck(is_array($row),'real Woo signed cart line '.$shape.'/'.$length);
        if($shape==='straight' && $length===1899){
            // Reproduce the live report: 189.9x60cm Bardolino Eiche, 38mm,
            // V3 product gross 670 EUR. The synthetic CI shipping rate is
            // intentionally independent of the real Flexible Shipping fee.
            $baseGross=(int)round(
                ((float)$row['line_subtotal']+(float)$row['line_subtotal_tax'])*100
            );
            hpzLiveCheck($baseGross===67000,
                'live regression Bardolino Eiche 1899x600 gross 670.00');
            $signedDecor=$row['hpz_apl_v08']['config']['decor']??'';
            hpzLiveCheck($signedDecor==='H1145',
                'live regression Bardolino decor code remains signed');
        }
        // Regression for live classic [woocommerce_cart]: the chosen
        // shipping rate may not exist BEFORE the customer enters checkout.
        if($length===1899){
            WC()->session->set('chosen_shipping_methods',[]);
            $entryIssues=$shape==='straight'
                ?HPZ_APL_WC_Dormant_Hooks_08::cartEntryChecks($cart)
                :HPZ_APL_WP_LU_Runtime_11::cartEntryChecks($cart);
            hpzLiveCheck($entryIssues===[],
                'shortcode cart preflight permits selected config without shipping '.$shape);
            $strictIssues=$shape==='straight'
                ?HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart)
                :HPZ_APL_WP_LU_Runtime_11::finalChecks($cart);
            hpzLiveCheck($strictIssues!==[],
                'checkout final gate still blocks missing Woo rate '.$shape);
            WC()->session->set('chosen_shipping_methods',[$rateId]);
        }
        $ctx=HPZ_APL_WP_Woo_Context_09::context($row,$cart);
        hpzLiveCheck($ctx['country']==='DE'&&$ctx['taxVerified']===true,
            'real Woo DE VAT '.$shape.'/'.$length);
        hpzLiveCheck($ctx['shippingCalculated']===true
                &&$ctx['selectedShippingRateId']===$rateId
                &&$ctx['shippingAmountCents']>=0,
            'real Woo selected ordinary shipping '.$shape.'/'.$length);
        $item=new WC_Order_Item_Product();
        if ($shape==='straight') {
            $problems=HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart);
            if($problems!==[]) {
                $debugCtx=HPZ_APL_WP_Woo_Context_09::context($row,$cart);
                $debugCtx['preDiscountGrossCents']=(int)round(
                    (float)$row['line_subtotal']*100 + (float)$row['line_subtotal_tax']*100);
                $debugCtx['actualNetLineRevenueCents']=(int)round((float)$row['line_total']*100);
                $debug=HPZ_APL_WC_Cart_Bridge_08::checkout(
                    $row,1,static fn($key)=>null,$debugCtx,$secret);
                echo 'DEBUG checkout: '.json_encode([
                    'shape'=>$shape,'length'=>$length,'itemPrice'=>$row['data']->get_price(),
                    'lineSubtotal'=>$row['line_subtotal'],
                    'lineSubtotalTax'=>$row['line_subtotal_tax'],
                    'lineTotal'=>$row['line_total'],'customerShipping'=>$cart->get_shipping_total(),
                    'context'=>$debugCtx,'blockers'=>$debug['blockers'],'messages'=>$problems
                ],JSON_UNESCAPED_SLASHES)."\n";
            }
            hpzLiveCheck($problems===[],
                'Straight Woo precheckout '.$length.': '.implode(';',$problems));
            HPZ_APL_WC_Dormant_Hooks_08::writeOrderItem($item,$cartKey,$row,null);
            hpzLiveCheck($item->get_meta('Plattenmaße')===$length.' × 600 mm',
                'Straight Woo metadata '.$length);
        } else {
            $problems=HPZ_APL_WP_LU_Runtime_11::finalChecks($cart);
            hpzLiveCheck($problems===[],
                'L/U Woo precheckout '.$shape.'/'.$length.': '.implode(';',$problems));
            HPZ_APL_WP_LU_Runtime_11::writeOrderItem($item,$cartKey,$row,null);
            hpzLiveCheck($item->get_meta('Arbeitsplattenform')===$shape,
                'L/U Woo metadata '.$shape.'/'.$length);
        }
        hpzLiveCheck(is_array($item->get_meta('_hpz_apl_manufacturing_v2')),
            'real Woo product item has manufacturing record '.$shape.'/'.$length);
        if($length===1901) {
            $changed=$cart->set_quantity($cartKey,2);
            hpzLiveCheck($changed!==false,'Woo quantity update accepted '.$shape);
            $cart->calculate_totals();
            $twoProblems=$shape==='straight'
                ?HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart)
                :HPZ_APL_WP_LU_Runtime_11::finalChecks($cart);
            hpzLiveCheck($twoProblems===[],
                'two configured units keep a valid precheckout '.$shape.' '.implode(';',$twoProblems));
            if(in_array($shape,['straight','L1','U1'],true)) {
                // Genuine Woo coupons may reduce the margin below 35% while
                // the original HMAC-signed regular price must remain intact.
                $cart->set_quantity($cartKey,1);
                $cart->calculate_totals();
                foreach([5,50,100] as $percentage) {
                    $coupon=new WC_Coupon();
                    $code='hpz-ci-coupon-'.strtolower($shape).'-'.$percentage;
                    $coupon->set_code($code);
                    $coupon->set_discount_type('percent');
                    $coupon->set_amount((string)$percentage);
                    $coupon->save();
                    $cart->remove_coupons();
                    $applied=$cart->apply_coupon($code);
                    hpzLiveCheck($applied===true,
                        'Woo coupon '.$percentage.'% applied to L cart');
                    $cart->calculate_totals();
                    $couponProblems=$shape==='straight'
                        ?HPZ_APL_WC_Dormant_Hooks_08::finalChecks($cart)
                        :HPZ_APL_WP_LU_Runtime_11::finalChecks($cart);
                    hpzLiveCheck($couponProblems===[],
                        $shape.' Woo '.$percentage.'% coupon allowed: '.implode(';',$couponProblems));
                }
            }
        }
        // No WC_Order::save(), payment provider, email, or Speedmaster call.
    }
}
// The previous CI changed quantity directly on WC_Cart::set_quantity(),
// bypassing WooCommerce's real [woocommerce_cart] form handler. Work found
// 2 -> 1 on a real classic-cart POST/reload. Exercise that actual pathway.
hpzResetCart($rateId);
$liveRaw=hpzStraightRaw(1899,'H1145');
$liveSigned=HPZ_APL_WC_Cart_Bridge_08::issue(
    $liveRaw,static fn($key)=>null,$secret);
$liveKey=WC()->cart->add_to_cart(1000083,1,0,[],$liveSigned);
hpzLiveCheck(is_string($liveKey)&&$liveKey!=='',
    'Bardolino 1899x600 straight in real Woo cart');
WC()->cart->calculate_totals();
$before=WC()->cart->get_cart()[$liveKey]??null;
hpzLiveCheck(is_array($before)&&$before['quantity']===1,
    'classic form starts at quantity 1');
hpzLiveCheck(HPZ_APL_WP_Straight_Runtime_09::classicQuantity(
    true,$liveKey,$before,2)===true,'straight quantity filter allows two whole boards');
// Prevent WP-CLI test from following WooCommerce's redirect after a
// successful form POST. The actual WC_Form_Handler still validates nonce,
// products, signed configuration and quantity, and mutates the real WC cart.
add_filter('woocommerce_update_cart_action_cart_updated','__return_false',PHP_INT_MAX);
$_SERVER['REQUEST_METHOD']='POST';
$_POST=[
    'update_cart'=>'1','woocommerce-cart-nonce'=>wp_create_nonce('woocommerce-cart'),
    'cart'=>[$liveKey=>['qty'=>'2']],
];
$_REQUEST=$_POST;
WC_Form_Handler::update_cart_action();
unset($_POST,$_REQUEST);
remove_filter('woocommerce_update_cart_action_cart_updated','__return_false',PHP_INT_MAX);
$updated=WC()->cart->get_cart()[$liveKey]??null;
hpzLiveCheck(is_array($updated)&&$updated['quantity']===2,
    'real classic Woo cart POST saves 2 boards, not 1');
WC()->cart->calculate_totals();
hpzLiveCheck(HPZ_APL_WC_Dormant_Hooks_08::finalChecks(WC()->cart)===[],
    'straight two boards still validate after classic form');
WC()->cart->session->set_session();
$savedCart=WC()->session->get('cart',[]);
hpzLiveCheck(is_array($savedCart)&&isset($savedCart[$liveKey])
    &&(int)$savedCart[$liveKey]['quantity']===2,
    'WooCommerce persisted cart session contains quantity 2');
$reloadedCart=new WC_Cart();
WC()->cart=$reloadedCart;
$reloadedCart->session->get_cart_from_session();
$restored=$reloadedCart->get_cart()[$liveKey]??null;
hpzLiveCheck(is_array($restored)&&$restored['quantity']===2,
    'fresh WooCommerce cart reload restores quantity 2');
hpzLiveCheck(($restored['hpz_apl_v08']['config']['decor']??'')==='H1145'
    &&($restored['hpz_apl_v08']['config']['dimensions']['L1']??null)===1899,
    'signed Bardolino, 1899mm manufacturing configuration retained');
$restoredCheck=HPZ_APL_WC_Cart_Bridge_08::inspect(
    $restored,2,static fn($key)=>null,$secret);
hpzLiveCheck($restoredCheck['production']['quantity']===2,
    'manufacturing record reflects real updated line quantity');
// No WC_Order is saved, no payment is collected and no supplier call is made.

echo 'PASS '.$GLOBALS['hpzChecks'].
    " real WooCommerce sandbox assertions; nine configured cart scenarios, classic-cart to checkout progression, VAT, ordinary shipping, signed-cart isolation, quantity and L/U coupon checks, unsaved order-line metadata. NO ORDER CREATED.\n";
