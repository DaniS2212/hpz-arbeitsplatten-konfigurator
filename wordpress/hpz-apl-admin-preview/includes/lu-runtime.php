<?php
/**
 * L/U WooCommerce connection – READY FOR SANDBOX, DEFAULT OFF.
 *
 * Uses the existing WordPress/WooCommerce store and its tax/shipping rates.
 * Activation requires a separate AUDITED constant plus an explicitly saved
 * operator option, published exact product and current server-held supplier
 * evidence. This module defines none of those approvals and creates no orders
 * by itself. No Speedmaster API.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_WP_LU_Runtime_11
{
    public const SALE_OPTION = 'hpz_apl_lu_sale_v1';
    public const PROOF_OPTION = 'hpz_apl_lu_verified_proofs';
    private static $pending = [];

    private static function options(): array
    {
        $o = get_option(self::SALE_OPTION, []);
        return is_array($o) ? $o : [];
    }

    public static function validPublishedProduct($product, int $id): bool
    {
        return isset(HPZ_APL_WC_LU_Cart_Bridge::SKUS[$id])
            && is_object($product) && method_exists($product,'get_id')
            && (int)$product->get_id()===$id
            && method_exists($product,'get_sku')
            && $product->get_sku()===HPZ_APL_WC_LU_Cart_Bridge::SKUS[$id]
            && method_exists($product,'get_status') && $product->get_status()==='publish'
            && method_exists($product,'is_type') && $product->is_type('simple')
            && method_exists($product,'is_taxable') && $product->is_taxable();
    }

    public static function canSell(int $id): bool
    {
        if (!defined('HPZ_APL_LU_11_AUDITED_RELEASE')
            || HPZ_APL_LU_11_AUDITED_RELEASE !== true
            || !HPZ_APL_WC_LU_Cart_Bridge::targets($id)) return false;
        $o = self::options();
        if (($o['enabled'] ?? false)!==true
            || ($o['manual_supplier_handoff_verified'] ?? false)!==true
            || ($o['woocommerce_checkout_verified'] ?? false)!==true
            || !function_exists('WC') || !WC() || !function_exists('wc_get_product')) return false;
        return self::validPublishedProduct(wc_get_product($id),$id);
    }

    public static function canRenderPublic($id): bool
    {
        return is_int($id) && self::canSell($id)
            && function_exists('is_product') && is_product()
            && function_exists('get_queried_object_id')
            && (int)get_queried_object_id()===$id;
    }

    private static function secret(): string
    {
        if (!function_exists('wp_salt')) throw new LogicException('WP-Sicherheitsschlüssel fehlen.');
        $key = wp_salt('auth').wp_salt('secure_auth');
        if (strlen($key)<32) throw new LogicException('WP-Sicherheitsschlüssel fehlen.');
        return $key;
    }

    private static function proof(string $key)
    {
        if (!preg_match('/^[a-f0-9]{64}$/D',$key)) return null;
        // Privileged administrator-maintained, server-stored evidence only.
        // A browser payload cannot set or edit this option.
        $data=get_option(self::PROOF_OPTION,[]);
        return is_array($data)&&isset($data[$key])&&is_array($data[$key])?$data[$key]:null;
    }

    private static function lookup(?array $raw=null): callable
    {
        // Owner-approved bounded price windows are an alternative to manually
        // stored exact supplier proofs. The operator option is never writable
        // by a storefront customer. The cart signature is still mandatory.
        $candidate=null;
        if ($raw !== null) {
            try {
                $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
                $policy=get_option('hpz_apl_lu_price_window_v1',[]);
                if (is_array($policy) && class_exists('HPZ_APL_LU_Shop_Ratebook_12'))
                    $candidate=HPZ_APL_LU_Shop_Ratebook_12::operatorProof($c,$policy);
            } catch (Throwable $ignored) { $candidate=null; }
        }
        return static function($key) use ($candidate) {
            // Prefer an individually confirmed and current supplier quotation
            // over a generic commercial cost estimate for the same SKU.
            $exact=self::proof($key);
            if (is_array($exact)) return $exact;
            if (is_array($candidate) && ($candidate['configurationKey'] ?? null)===$key) return $candidate;
            return null;
        };
    }

    private static function country(): string
    {
        if (!function_exists('WC') || !WC() || !WC()->customer) return '';
        $country=(string) WC()->customer->get_shipping_country();
        return $country!==''?$country:(string) WC()->customer->get_billing_country();
    }

    private static function request(string $action): array
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '')!=='POST'
            || strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE'] ?? '')[0]))!=='application/json') {
            wp_send_json_error(['message'=>'Konfigurationsanfrage ungültig.'],415);exit;
        }
        $json=file_get_contents('php://input',false,null,0,16385);
        if (!is_string($json) || strlen($json)>16384) {
            wp_send_json_error(['message'=>'Konfigurationsdaten zu groß.'],413);exit;
        }
        $raw=json_decode($json,true);
        if (!is_array($raw) || array_values($raw)===$raw) {
            wp_send_json_error(['message'=>'Konfiguration fehlt.'],400);exit;
        }
        $id=$raw['productId'] ?? null;
        if (!is_int($id) || !self::canSell($id)
            || !function_exists('wp_verify_nonce')
            || !wp_verify_nonce($_SERVER['HTTP_X_WP_NONCE'] ?? '',$action.'_'.$id)) {
            wp_send_json_error(['message'=>'Bestellfunktion nicht freigegeben.'],403);exit;
        }
        return $raw;
    }

    private static function ensureGermanCheckout(): void
    {
        if (self::country()!=='DE' || !function_exists('wc_tax_enabled')
            || !wc_tax_enabled() || !function_exists('get_woocommerce_currency')
            || get_woocommerce_currency()!=='EUR') {
            throw new InvalidArgumentException('Aktuell nur für geprüfte deutsche Versand- und Steuerbedingungen verfügbar.');
        }
    }

    private static function signed(array $raw): array
    {
        return HPZ_APL_WC_LU_Cart_Bridge::issue($raw,self::lookup($raw),self::secret());
    }

    private static function checked(array $row, int $quantity): array
    {
        $stored=$row[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['config'] ?? null;
        $raw=is_array($stored) ? HPZ_APL_WC_LU_Cart_Bridge::toRaw($stored) : null;
        return HPZ_APL_WC_LU_Cart_Bridge::inspect($row,$quantity,self::lookup($raw),self::secret());
    }

    private static function context(array $row, $cart): array
    {
        $ctx=HPZ_APL_WP_Woo_Context_09::context($row,$cart);
        $o=self::options();
        $id=(int)($row['product_id']??0);
        $ctx['manualSupplierHandoffVerified']=
            self::canSell($id) && ($o['manual_supplier_handoff_verified']??null)===true;
        $ctx['operatorSaleApproval']=self::canSell($id);
        return $ctx;
    }

    /** Registers nothing in the active plugin unless audited release gates exist. */
    public static function register(): void
    {
        if (!self::canSell(1000080)&&!self::canSell(1000081)) return;
        add_action('wp_ajax_hpz_apl_lu_quote',[__CLASS__,'publicQuote']);
        add_action('wp_ajax_nopriv_hpz_apl_lu_quote',[__CLASS__,'publicQuote']);
        add_action('wp_ajax_hpz_apl_lu_add',[__CLASS__,'addConfigured']);
        add_action('wp_ajax_nopriv_hpz_apl_lu_add',[__CLASS__,'addConfigured']);
        add_filter('woocommerce_add_to_cart_validation',[__CLASS__,'validateClassic'],60,6);
        add_filter('woocommerce_add_cart_item_data',[__CLASS__,'classicData'],60,4);
        add_filter('woocommerce_store_api_add_to_cart_data',[__CLASS__,'storeData'],60,2);
        add_action('woocommerce_store_api_validate_add_to_cart',[__CLASS__,'storeValidate'],60,2);
        add_filter('woocommerce_get_cart_item_from_session',[__CLASS__,'fromSession'],60,3);
        add_action('woocommerce_before_calculate_totals',[__CLASS__,'beforeTotals'],60,1);
        add_action('woocommerce_check_cart_items',[__CLASS__,'checkClassicCart'],60);
        // The shortcode cart may have no confirmed destination/rate yet.
        // Keep final Woo tax/shipping/price checks for checkout submission.
        add_action('woocommerce_checkout_process',[__CLASS__,'checkClassicCheckout'],60);
        add_action('woocommerce_store_api_cart_errors',[__CLASS__,'storeCartErrors'],60,2);
        add_action('woocommerce_store_api_checkout_order_processed',[__CLASS__,'storeCheckoutCheck'],60,1);
        add_action('woocommerce_checkout_create_order_line_item',[__CLASS__,'writeOrderItem'],60,4);
        add_filter('woocommerce_get_item_data',[__CLASS__,'cartDisplayData'],60,2);
        add_filter('woocommerce_store_api_cart_item_quantity_validation',[__CLASS__,'storeQuantity'],60,4);
        add_filter('woocommerce_update_cart_validation',[__CLASS__,'classicQuantity'],60,4);
    }

    public static function publicQuote(): void
    {
        $raw=self::request('hpz_apl_lu_quote');
        try {
            self::ensureGermanCheckout();
            $signed=self::signed($raw);
            $snap=$signed[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY];
            $quantity=$raw['quantity'];
            wp_send_json_success(['quote'=>[
                'ruleVersion'=>$snap['priceVersion'],
                'status'=>'calculated-ready-for-cart','currency'=>'EUR',
                'unitGrossReferenceCents'=>$snap['unitGrossReferenceCents'],
                'totalGrossReferenceCents'=>$snap['unitGrossReferenceCents']*$quantity,
                'quantity'=>$quantity,'purchasable'=>true,
                'taxNote'=>'DE-Bruttoreferenz inkl. 19 % MwSt. · Kundenversand im Checkout',
                'availabilityNote'=>'Manuelle Speedmaster-Bestellung · Details und Versand im Checkout'
            ]],200);
        } catch (Throwable $error) {
            wp_send_json_error(['message'=>'Diese Kombination ist noch nicht verbindlich kalkuliert.'],422);
        }
    }

    public static function addConfigured(): void
    {
        $raw=self::request('hpz_apl_lu_add');
        try {
            self::ensureGermanCheckout();
            if (!WC()->cart && function_exists('wc_load_cart')) wc_load_cart();
            if (!WC()->cart) throw new LogicException('Warenkorb nicht verfügbar.');
            $signed=self::signed($raw);
            $quantity=$raw['quantity'] ?? null;
            if (!is_int($quantity) || $quantity<1 || $quantity>1000) {
                throw new InvalidArgumentException('Ungültige Menge.');
            }
            $key=WC()->cart->add_to_cart($raw['productId'],$quantity,0,[],$signed);
            if (!is_string($key)||$key==='') throw new RuntimeException('Warenkorb konnte nicht befüllt werden.');
            WC()->cart->calculate_totals();
            wp_send_json_success(['added'=>true,'cartUrl'=>function_exists('wc_get_cart_url')?wc_get_cart_url():''],200);
        }catch(Throwable $error){
            wp_send_json_error(['message'=>'L-/U-Konfiguration ist nicht bestellfähig. Bitte Maße und Preis prüfen.'],422);
        }
    }

    private static function isTarget($id): bool
    {
        return is_numeric($id) && HPZ_APL_WC_LU_Cart_Bridge::targets((int)$id);
    }

    private static function rawFromStore($request): array
    {
        if (!is_array($request) && !($request instanceof ArrayAccess)) {
            throw new InvalidArgumentException('Store-API-Konfiguration fehlt.');
        }
        $raw=$request['hpz_apl_config'] ?? null;
        if (is_string($raw)&&strlen($raw)<=16384) $raw=json_decode($raw,true);
        if (!is_array($raw)||array_values($raw)===$raw) throw new InvalidArgumentException('L-/U-Konfiguration fehlt.');
        return $raw;
    }

    private static function classicRaw($productId): array
    {
        $nonce=$_POST['hpz_apl_lu_nonce'] ?? '';
        $nonce=is_string($nonce)?(function_exists('wp_unslash')?wp_unslash($nonce):$nonce):'';
        if (!function_exists('wp_verify_nonce')
            || !wp_verify_nonce($nonce,'hpz_apl_lu_cart_'.$productId)) {
            throw new InvalidArgumentException('Konfigurator-Sicherheitsprüfung fehlgeschlagen.');
        }
        $json=$_POST['hpz_apl_lu_config'] ?? '';
        $json=is_string($json)?(function_exists('wp_unslash')?wp_unslash($json):$json):'';
        if (strlen($json)>16384) throw new InvalidArgumentException('Konfiguration zu groß.');
        $raw=json_decode($json,true);
        if (!is_array($raw)||array_values($raw)===$raw) throw new InvalidArgumentException('Konfiguration fehlt.');
        return $raw;
    }

    public static function validateClassic($passed,$productId,$quantity,$variationId=0,$variations=[],$cartData=[])
    {
        if (!self::isTarget($productId)) return $passed;
        if (!$passed || !self::canSell((int)$productId)) return false;
        try{
            if (is_array($cartData) && isset($cartData[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY])) {
                self::checked($cartData,(int)$quantity);
            } else {
                $raw=self::classicRaw((int)$productId);
                $raw['quantity']=(int)$quantity;
                self::signed($raw);
            }
            return true;
        }catch(Throwable $error){
            if(function_exists('wc_add_notice')) wc_add_notice('L-/U-Arbeitsplatte: Konfiguration nicht verifiziert.','error');
            return false;
        }
    }

    public static function classicData($data,$productId,$variationId,$quantity): array
    {
        $result=is_array($data)?$data:[];
        if (!self::isTarget($productId)) return $result;
        if (!self::canSell((int)$productId)) throw new InvalidArgumentException('Bestellung gesperrt.');
        if (isset($result[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY])) {
            self::checked($result,(int)$quantity);
            return $result;
        }
        $raw=self::classicRaw((int)$productId);
        $raw['quantity']=(int)$quantity;
        return array_merge($result,self::signed($raw));
    }

    public static function storeValidate($product,$request): void
    {
        if(!is_object($product)||!method_exists($product,'get_id')
            ||!self::isTarget($product->get_id())) return;
        if(!self::canSell((int)$product->get_id())) throw new InvalidArgumentException('Bestellung gesperrt.');
        $raw=self::rawFromStore($request);
        $quantity=$request['quantity'] ?? null;
        if(!is_int($quantity)||$quantity<1)throw new InvalidArgumentException('Menge fehlt.');
        $raw['quantity']=$quantity;
        self::signed($raw);
    }

    public static function storeData($cartData,$request): array
    {
        $data=is_array($cartData)?$cartData:[];
        $id=$data['id']??null;
        if(!self::isTarget($id))return $data;
        if(!self::canSell((int)$id))throw new InvalidArgumentException('Bestellung gesperrt.');
        $qty=$data['quantity']??null;
        if(!is_int($qty)||$qty<1)throw new InvalidArgumentException('Menge fehlt.');
        $raw=self::rawFromStore($request);
        $raw['quantity']=$qty;
        $data['cart_item_data']=array_merge(
            is_array($data['cart_item_data']??null)?$data['cart_item_data']:[],
            self::signed($raw)
        );
        return $data;
    }

    public static function fromSession($cartItem,$values,$cartKey): array
    {
        $row=is_array($cartItem)?$cartItem:[];
        if(!self::isTarget($row['product_id']??null))return $row;
        try{
            if(!self::canSell((int)$row['product_id']))throw new InvalidArgumentException('Verkauf gesperrt.');
            self::checked($row,(int)($row['quantity']??0));
            unset(self::$pending['session_'.$cartKey]);
        }catch(Throwable $error){
            self::$pending['session_'.$cartKey]='Gespeicherte L-/U-Konfiguration ungültig.';
        }
        return $row;
    }

    public static function beforeTotals($cart): void
    {
        if(!is_object($cart)||!method_exists($cart,'get_cart'))return;
        foreach($cart->get_cart() as $key=>$row){
            if(!self::isTarget($row['product_id']??null))continue;
            try{
                $id=(int)$row['product_id'];
                if(!self::canSell($id))throw new InvalidArgumentException('Verkauf gesperrt.');
                $checked=self::checked($row,(int)($row['quantity']??0));
                $ctx=self::context($row,$cart);
                if(($ctx['country']??null)!=='DE'
                    ||($ctx['taxVerified']??null)!==true
                    ||($ctx['baseTaxRateBasisPoints']??null)!==1900
                    ||($ctx['pricesConfigured']??null)!==true) {
                    throw new InvalidArgumentException('Woo-Steuern nicht bestätigt.');
                }
                $product=$row['data']??null;
                if(!self::validPublishedProduct($product,$id)
                    ||!method_exists($product,'set_price')) {
                    throw new InvalidArgumentException('Woo-Arbeitsplatte nicht bestätigt.');
                }
                $price=HPZ_APL_WC_LU_Cart_Bridge::priceForWoo(
                    $checked['quote']['unitGrossReferenceCents'],
                    function_exists('wc_prices_include_tax')&&wc_prices_include_tax(),'DE'
                );
                $clone=clone $product;
                $clone->set_price($price);
                // Only this transient cart line; NEVER the Woo product database.
                $cart->cart_contents[$key]['data']=$clone;
                unset(self::$pending['price_'.$key]);
            }catch(Throwable $error){
                self::$pending['price_'.$key]='L-/U-Arbeitsplatte: Preis, Material oder Steuer nicht bestätigt.';
            }
        }
    }

    private static function cents($value): ?int
    {
        if(!is_numeric($value))return null;
        $n=(float)$value;
        if(!is_finite($n)||$n<0||$n>10000000)return null;
        return (int)round(100*$n,0,PHP_ROUND_HALF_UP);
    }

    /** Always compare Woo's real post-discount NET revenue to the margin floor. */
    public static function finalChecks($cart): array
    {
        $messages=array_values(self::$pending);
        if(!is_object($cart)||!method_exists($cart,'get_cart'))return $messages;
        foreach($cart->get_cart() as $key=>$row){
            if(!self::isTarget($row['product_id']??null))continue;
            try{
                if(!self::canSell((int)$row['product_id']))throw new InvalidArgumentException('Verkauf gesperrt.');
                $ctx=self::context($row,$cart);
                if(!is_array($ctx))throw new InvalidArgumentException('Woo-Steuer-/Versanddaten fehlen.');
                $sub=self::cents($row['line_subtotal']??null);
                $tax=self::cents($row['line_subtotal_tax']??null);
                $net=self::cents($row['line_total']??null);
                if($sub===null||$tax===null||$net===null)throw new InvalidArgumentException('Woo-Positionspreis fehlt.');
                $ctx['preDiscountGrossCents']=$sub+$tax;
                $ctx['actualNetLineRevenueCents']=$net;
                $checked=HPZ_APL_WC_LU_Cart_Bridge::checkout(
                    $row,(int)($row['quantity']??0),
                    self::lookup(HPZ_APL_WC_LU_Cart_Bridge::toRaw($row[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['config'])),
                    $ctx,self::secret()
                );
                if(!$checked['validForReleaseReview']) {
                    $messages[]='L-/U-Arbeitsplatte: Maße, Lieferbarkeit, Versand oder 35-%-Marge nicht bestätigt.';
                }
            }catch(Throwable $error){
                $messages[]='L-/U-Arbeitsplatte: Warenkorbprüfung fehlgeschlagen.';
            }
        }
        return array_values(array_unique($messages));
    }

    /**
     * Signed configuration and product gate for CLASSIC cart navigation.
     * Country, 19% VAT, actual normal Woo rate, totals and coupon policy
     * are still verified by finalChecks before checkout submission.
     */
    public static function cartEntryChecks($cart): array
    {
        $messages=array_values(self::$pending);
        if(!is_object($cart)||!method_exists($cart,'get_cart'))return $messages;
        foreach($cart->get_cart() as $key=>$row){
            $id=(int)($row['product_id']??0);
            if(!self::isTarget($id))continue;
            try{
                if(!self::canSell($id))throw new InvalidArgumentException('Verkauf gesperrt.');
                self::checked($row,(int)($row['quantity']??0));
                if(!self::validPublishedProduct($row['data']??null,$id))
                    throw new InvalidArgumentException('Produkt ungueltig.');
            }catch(Throwable $error){
                $messages[]='L-/U-Arbeitsplatte: Konfiguration im Warenkorb ungueltig.';
            }
        }
        return array_values(array_unique($messages));
    }

    public static function checkClassicCart(): void
    {
        if(!function_exists('WC')||!WC()||!WC()->cart)return;
        foreach(self::cartEntryChecks(WC()->cart) as $message){
            if(function_exists('wc_add_notice'))wc_add_notice($message,'error');
        }
    }

    public static function checkClassicCheckout(): void
    {
        if(!function_exists('WC')||!WC()||!WC()->cart)return;
        foreach(self::finalChecks(WC()->cart) as $message){
            if(function_exists('wc_add_notice'))wc_add_notice($message,'error');
        }
    }

    public static function storeCartErrors($errors,$cart): void
    {
        foreach(self::finalChecks($cart) as $message){
            if(is_object($errors)&&method_exists($errors,'add'))$errors->add('hpz_apl_lu_not_approved',$message);
        }
    }

    public static function storeCheckoutCheck($order): void
    {
        if(!function_exists('WC')||!WC()||!WC()->cart||self::finalChecks(WC()->cart)) {
            throw new RuntimeException('L-/U-Bestellprüfung fehlgeschlagen.');
        }
    }

    public static function writeOrderItem($item,$cartKey,$values,$order): void
    {
        if(!is_array($values)||!self::isTarget($values['product_id']??null))return;
        if(!function_exists('WC')||!WC()||!WC()->cart||self::finalChecks(WC()->cart)) {
            throw new RuntimeException('L-/U-Bestellposition ohne gültigen Checkout.');
        }
        $ctx=self::context($values,WC()->cart);
        $sub=self::cents($values['line_subtotal']??null);
        $tax=self::cents($values['line_subtotal_tax']??null);
        $net=self::cents($values['line_total']??null);
        if($sub===null||$tax===null||$net===null)throw new RuntimeException('L-/U-Positionsdaten unvollständig.');
        $ctx['preDiscountGrossCents']=$sub+$tax;
        $ctx['actualNetLineRevenueCents']=$net;
        $passed=HPZ_APL_WC_LU_Cart_Bridge::checkout(
            $values,(int)($values['quantity']??0),
            self::lookup(HPZ_APL_WC_LU_Cart_Bridge::toRaw($values[HPZ_APL_WC_LU_Cart_Bridge::ITEM_KEY]['config'])),
            $ctx,self::secret()
        );
        HPZ_APL_WC_LU_Cart_Bridge::writeOrderLine($item,$passed);
    }

    public static function cartDisplayData($itemData,$cartItem): array
    {
        $out=is_array($itemData)?$itemData:[];
        if(!is_array($cartItem)||!self::isTarget($cartItem['product_id']??null))return $out;
        try{
            $checked=self::checked($cartItem,(int)($cartItem['quantity']??0));
            foreach(HPZ_APL_WC_LU_Cart_Bridge::displayFields($checked['production']) as $key=>$value){
                $out[]=['key'=>$key,'value'=>$value,'display'=>$value];
            }
        }catch(Throwable $error){ /* Rejected later by finalChecks. */ }
        return $out;
    }

    public static function storeQuantity($allowed,$qty,$product,$cartItem)
    {
        if(!is_object($product)||!method_exists($product,'get_id')
            ||!self::isTarget($product->get_id()))return $allowed;
        if(!$allowed||!is_int($qty)||!is_array($cartItem)
            ||!self::canSell((int)$product->get_id())) {
            return class_exists('WP_Error')
                ? new WP_Error('hpz_apl_lu_quantity','L-/U-Menge nicht bestätigt.',['status'=>400]) : false;
        }
        try{
            self::checked($cartItem,$qty);
            return true;
        }catch(Throwable $error){
            return class_exists('WP_Error')
                ? new WP_Error('hpz_apl_lu_quantity','L-/U-Menge nicht bestätigt.',['status'=>400]) : false;
        }
    }

    public static function classicQuantity($allowed,$cartKey,$values,$qty)
    {
        if(!is_array($values)||!self::isTarget($values['product_id']??null))return $allowed;
        if(!$allowed||!is_int($qty)||!self::canSell((int)$values['product_id']))return false;
        try{self::checked($values,$qty);return true;}catch(Throwable $error){return false;}
    }
}
