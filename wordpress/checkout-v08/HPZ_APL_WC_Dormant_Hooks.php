<?php
/**
 * Dormant WooCommerce hook adapter prototype for the straight worktop, 0.8.
 *
 * NOT included by the active 0.6.5 plugin; NOT a production sale switch.
 * registerForSandboxTests() is deliberately guarded by a TEST-ONLY constant.
 * 0.9 must replace it with audited production bootstrapping and prove actual
 * WooCommerce, Flatsome, Cart/Checkout Blocks and shipping behavior.
 */
declare(strict_types=1);

final class HPZ_APL_WC_Dormant_Hooks_08
{
    private static $proofLookup;
    private static $wooContext;
    private static $secret;
    private static $clock;
    private static $pendingErrors = [];

    public static function configure(callable $trustedProofLookup, callable $trustedWooContext, string $secret, ?int $now = null): void
    {
        if (strlen($secret) < 32) throw new InvalidArgumentException('WP server secret required.');
        self::$proofLookup = $trustedProofLookup;
        self::$wooContext = $trustedWooContext;
        self::$secret = $secret;
        self::$clock = $now;
    }

    /** Test fixture only. This method is never invoked by the WordPress plugin. */
    public static function registerForSandboxTests(): bool
    {
        if (!defined('HPZ_APL_080_SANDBOX_HOOK_TEST') || HPZ_APL_080_SANDBOX_HOOK_TEST !== true) {
            return false;
        }
        return self::registerHooks();
    }

    /** Called only by the explicitly audited, still-disabled 0.9 launch gate. */
    public static function registerForVerifiedSale(): bool
    {
        if (!class_exists('HPZ_APL_WP_Straight_Runtime_09')
            || !HPZ_APL_WP_Straight_Runtime_09::canSell()) return false;
        return self::registerHooks();
    }

    private static function registerHooks(): bool
    {
        if (!is_callable(self::$proofLookup) || !is_callable(self::$wooContext)) return false;
        add_filter('woocommerce_add_to_cart_validation',[__CLASS__,'classicValidate'],50,6);
        add_filter('woocommerce_add_cart_item_data',[__CLASS__,'classicCartData'],50,4);
        add_filter('woocommerce_store_api_add_to_cart_data',[__CLASS__,'storeCartData'],50,2);
        add_action('woocommerce_store_api_validate_add_to_cart',[__CLASS__,'storeValidate'],50,2);
        add_filter('woocommerce_get_cart_item_from_session',[__CLASS__,'fromSession'],50,3);
        add_action('woocommerce_before_calculate_totals',[__CLASS__,'beforeTotals'],50,1);
        add_action('woocommerce_check_cart_items',[__CLASS__,'classicCartCheck'],50,0);
        // Cart page: verify the signed plate and SKU only. The customer may
        // still need to enter their destination and select shipping at checkout.
        add_action('woocommerce_checkout_process',[__CLASS__,'classicCheckoutCheck'],50,0);
        add_action('woocommerce_store_api_cart_errors',[__CLASS__,'storeCartErrors'],50,2);
        add_action('woocommerce_store_api_checkout_order_processed',[__CLASS__,'storeCheckoutCheck'],50,1);
        add_action('woocommerce_checkout_create_order_line_item',[__CLASS__,'writeOrderItem'],50,4);
        add_filter('woocommerce_get_item_data',[__CLASS__,'cartDisplayData'],50,2);
        return true;
    }

    private static function proof(string $key)
    {
        if (!is_callable(self::$proofLookup)) throw new LogicException('Server proof provider absent.');
        return call_user_func(self::$proofLookup,$key);
    }

    private static function requireTarget($productId): bool
    {
        return is_numeric($productId) && HPZ_APL_WC_Cart_Bridge_08::targets((int)$productId);
    }

    private static function rawFromJson($input): array
    {
        if (!is_string($input) || strlen($input) > 16384 || strlen($input) < 2) {
            throw new InvalidArgumentException('Konfigurator-Daten fehlen.');
        }
        $data = json_decode($input, true);
        if (!is_array($data) || array_values($data) === $data) {
            throw new InvalidArgumentException('Konfigurator-Daten ungültig.');
        }
        return $data;
    }

    private static function classicRaw(): array
    {
        $nonce = isset($_POST['hpz_apl_nonce']) && is_string($_POST['hpz_apl_nonce'])
            ? (function_exists('wp_unslash') ? wp_unslash($_POST['hpz_apl_nonce']) : $_POST['hpz_apl_nonce']) : '';
        if (!function_exists('wp_verify_nonce')
            || !wp_verify_nonce($nonce,'hpz_apl_cart_'.HPZ_APL_WC_Cart_Bridge_08::PRODUCT_ID)) {
            throw new InvalidArgumentException('Formular-Sicherheitsprüfung fehlgeschlagen.');
        }
        $json = isset($_POST['hpz_apl_config']) && is_string($_POST['hpz_apl_config'])
            ? (function_exists('wp_unslash') ? wp_unslash($_POST['hpz_apl_config']) : $_POST['hpz_apl_config']) : '';
        return self::rawFromJson($json);
    }

    private static function fromApiRequest($request): array
    {
        if (!is_array($request) && !($request instanceof ArrayAccess)) {
            throw new InvalidArgumentException('Ungültige Warenkorb-Anfrage.');
        }
        $raw = $request['hpz_apl_config'] ?? null;
        if (is_array($raw) && array_values($raw) !== $raw) {
            return $raw;
        }
        return self::rawFromJson($raw);
    }

    private static function make(array $raw, int $quantity): array
    {
        $raw['quantity']=$quantity;
        return HPZ_APL_WC_Cart_Bridge_08::issue(
            $raw, function($key){return self::proof($key);}, self::$secret, self::$clock
        );
    }

    private static function checkSigned(array $cartItem, int $quantity): array
    {
        return HPZ_APL_WC_Cart_Bridge_08::inspect(
            $cartItem, $quantity, function($key){return self::proof($key);}, self::$secret, self::$clock
        );
    }

    /**
     * Classic WooCommerce add-to-cart; a naked ?add-to-cart=1000083 without
     * a checked form is refused. When Store API already signed item data,
     * check the HMAC instead of incorrectly relying on $_POST.
     */
    public static function classicValidate($passed, $productId, $quantity, $variationId = 0, $variations = [], $cartItemData = [])
    {
        if (!self::requireTarget($productId) || !$passed) return $passed;
        try {
            if (is_array($cartItemData) && isset($cartItemData[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY])) {
                self::checkSigned($cartItemData,(int)$quantity);
            } else {
                self::make(self::classicRaw(),(int)$quantity);
            }
            return true;
        } catch (Throwable $e) {
            if (function_exists('wc_add_notice')) wc_add_notice('Diese Arbeitsplatten-Konfiguration ist noch nicht bestellbar.','error');
            return false;
        }
    }

    public static function classicCartData($cartItemData, $productId, $variationId, $quantity): array
    {
        $data=is_array($cartItemData)?$cartItemData:[];
        if (!self::requireTarget($productId)) return $data;
        if (isset($data[HPZ_APL_WC_Cart_Bridge_08::ITEM_KEY])) {
            self::checkSigned($data,(int)$quantity);
            return $data;
        }
        return array_merge($data,self::make(self::classicRaw(),(int)$quantity));
    }

    public static function storeValidate($product, $request): void
    {
        if (!is_object($product) || !method_exists($product,'get_id') || !self::requireTarget($product->get_id())) return;
        $raw=self::fromApiRequest($request);
        $quantity=$request['quantity'] ?? null;
        if (!is_int($quantity) || $quantity < 1) throw new InvalidArgumentException('Ungültige Menge.');
        self::make($raw,$quantity);
    }

    public static function storeCartData($cartData, $request): array
    {
        $data=is_array($cartData)?$cartData:[];
        if (!self::requireTarget($data['id'] ?? null)) return $data;
        $quantity=$data['quantity'] ?? null;
        if (!is_int($quantity) || $quantity < 1) throw new InvalidArgumentException('Ungültige Menge.');
        $data['cart_item_data']=array_merge(
            is_array($data['cart_item_data'] ?? null)?$data['cart_item_data']:[],
            self::make(self::fromApiRequest($request),$quantity)
        );
        return $data;
    }

    public static function fromSession($cartItem, $values, $key): array
    {
        $row=is_array($cartItem)?$cartItem:[];
        if (!self::requireTarget($row['product_id'] ?? null)) return $row;
        try {
            self::checkSigned($row,(int)($row['quantity'] ?? 0));
            unset(self::$pendingErrors['session_'.$key]);
        } catch (Throwable $e) {
            self::$pendingErrors['session_'.$key]='Konfiguration im Warenkorb ist nicht mehr gültig.';
        }
        return $row;
    }

    /**
     * Price and package data are set only on a CLONED Woo product object for
     * the target cart line. Other products and persisted product prices remain
     * unchanged. Never use the old browser price as the Woo line price.
     */
    public static function beforeTotals($cart): void
    {
        if (!is_object($cart) || !method_exists($cart,'get_cart')) return;
        foreach ($cart->get_cart() as $key=>$row) {
            if (!self::requireTarget($row['product_id'] ?? null)) continue;
            try {
                $checked=self::checkSigned($row,(int)($row['quantity'] ?? 0));
                $ctx=call_user_func(self::$wooContext,$row,$cart);
                if (!is_array($ctx) || ($ctx['country'] ?? null)!=='DE'
                    || ($ctx['taxVerified'] ?? null)!==true
                    || ($ctx['baseTaxRateBasisPoints'] ?? null)!==1900
                    || ($ctx['pricesConfigured'] ?? null)!==true) {
                    throw new InvalidArgumentException('WooCommerce-Steuern nicht bestätigt.');
                }
                $product=$row['data'] ?? null;
                if (!is_object($product) || !method_exists($product,'get_id')
                    || (int)$product->get_id()!==HPZ_APL_WC_Cart_Bridge_08::PRODUCT_ID
                    || !method_exists($product,'get_sku') || $product->get_sku()!==HPZ_APL_WC_Cart_Bridge_08::SKU
                    || !method_exists($product,'is_taxable') || !$product->is_taxable()) {
                    throw new InvalidArgumentException('WooCommerce-Produkt nicht verifiziert.');
                }
                $unit=HPZ_APL_WC_Cart_Bridge_08::priceForWoo(
                    $checked['quote']['unitGrossReferenceCents'],
                    function_exists('wc_prices_include_tax') && wc_prices_include_tax(),
                    'DE'
                );
                // Existing WooCommerce product shipping setup stays unchanged.
                $copy=clone $product;
                $copy->set_price($unit);
                // set on transient cart line only, never product database.
                $cart->cart_contents[$key]['data']=$copy;
                unset(self::$pendingErrors['price_'.$key]);
            } catch (Throwable $e) {
                self::$pendingErrors['price_'.$key]='Preis oder Versand dieser Arbeitsplatte nicht bestätigt.';
            }
        }
    }

    private static function cents($amount): ?int
    {
        if (!is_numeric($amount)) return null;
        $n=(float)$amount;
        if (!is_finite($n) || $n<0 || $n>10000000) return null;
        return (int)round($n*100,0,PHP_ROUND_HALF_UP);
    }

    /**
     * Final check: authoritative Woo LINE subtotal/tax before discounts,
     * LINE total after coupons, actual country and chosen shipping from
     * server provider. No customer-supplied checkout approval can bypass it.
     */
    public static function finalChecks($cart): array
    {
        $messages=array_values(self::$pendingErrors);
        if (!is_object($cart) || !method_exists($cart,'get_cart')) return $messages;
        foreach ($cart->get_cart() as $key=>$row) {
            if (!self::requireTarget($row['product_id'] ?? null)) continue;
            try {
                $ctx=call_user_func(self::$wooContext,$row,$cart);
                if (!is_array($ctx)) throw new InvalidArgumentException('WooCommerce Kontext fehlt.');
                $subtotal=self::cents($row['line_subtotal'] ?? null);
                $subtotalTax=self::cents($row['line_subtotal_tax'] ?? null);
                $net=self::cents($row['line_total'] ?? null);
                if ($subtotal===null || $subtotalTax===null || $net===null) {
                    throw new InvalidArgumentException('WooCommerce Positionssummen fehlen.');
                }
                // Never accept a pre-discount gross or discount-adjusted net
                // value from JS, a saved session or an arbitrary context callback.
                $ctx['preDiscountGrossCents']=$subtotal+$subtotalTax;
                $ctx['actualNetLineRevenueCents']=$net;
                $result=HPZ_APL_WC_Cart_Bridge_08::checkout(
                    $row,(int)($row['quantity']??0),
                    function($key){return self::proof($key);},
                    $ctx,self::$secret,self::$clock
                );
                if ($result['validForReleaseReview'] !== true) {
                    $messages[]='Arbeitsplatte: Maße, Lieferbarkeit, Steuer, Versand oder Mindestmarge nicht bestätigt.';
                }
            } catch (Throwable $e) {
                $messages[]='Arbeitsplatten-Bestellprüfung fehlgeschlagen.';
            }
        }
        return array_values(array_unique($messages));
    }

    /**
     * Cart-page entry gate, NOT a sale approval. The signed configuration,
     * quantity, product ID and SKU are required now. Woo destination, VAT,
     * a selected shipping package and totals remain mandatory at actual
     * checkout; they can legitimately be incomplete on [woocommerce_cart].
     */
    public static function cartEntryChecks($cart): array
    {
        $messages=array_values(self::$pendingErrors);
        if (!is_object($cart) || !method_exists($cart,'get_cart')) return $messages;
        foreach ($cart->get_cart() as $key=>$row) {
            if (!self::requireTarget($row['product_id'] ?? null)) continue;
            try {
                self::checkSigned($row,(int)($row['quantity'] ?? 0));
                $product=$row['data'] ?? null;
                if (!is_object($product) || !method_exists($product,'get_id')
                    || (int)$product->get_id()!==HPZ_APL_WC_Cart_Bridge_08::PRODUCT_ID
                    || !method_exists($product,'get_sku')
                    || $product->get_sku()!==HPZ_APL_WC_Cart_Bridge_08::SKU
                    || !method_exists($product,'is_taxable') || !$product->is_taxable()) {
                    throw new InvalidArgumentException('WooCommerce-Produkt ungueltig.');
                }
            } catch (Throwable $error) {
                $messages[]='Arbeitsplatten-Konfiguration im Warenkorb ungueltig.';
            }
        }
        return array_values(array_unique($messages));
    }

    /** Called while displaying/updating the CLASSIC cart. No shipping gate. */
    public static function classicCartCheck(): void
    {
        if (!function_exists('WC') || !WC() || !WC()->cart) return;
        foreach (self::cartEntryChecks(WC()->cart) as $message) {
            if (function_exists('wc_add_notice')) wc_add_notice($message,'error');
        }
    }

    /** Called for submitting CLASSIC checkout; keep all strict final gates. */
    public static function classicCheckoutCheck(): void
    {
        if (!function_exists('WC') || !WC() || !WC()->cart) return;
        foreach (self::finalChecks(WC()->cart) as $message) {
            if (function_exists('wc_add_notice')) wc_add_notice($message,'error');
        }
    }

    public static function storeCartErrors($errors,$cart): void
    {
        foreach (self::finalChecks($cart) as $message) {
            if (is_object($errors) && method_exists($errors,'add')) $errors->add('hpz_apl_080_not_approved',$message);
        }
    }

    public static function storeCheckoutCheck($order): void
    {
        if (!function_exists('WC') || !WC() || !WC()->cart) {
            throw new RuntimeException('Warenkorb zur Kontrolle nicht verfügbar.');
        }
        if (self::finalChecks(WC()->cart)) {
            throw new RuntimeException('Arbeitsplatten-Bestellprüfung nicht erfolgreich.');
        }
    }

    public static function writeOrderItem($item,$cartKey,$values,$order): void
    {
        if (!is_array($values) || !self::requireTarget($values['product_id'] ?? null)) return;
        if (!function_exists('WC') || !WC() || !WC()->cart || self::finalChecks(WC()->cart)) {
            throw new RuntimeException('Bestellposition ohne gültige Abschlussprüfung.');
        }
        $ctx=call_user_func(self::$wooContext,$values,WC()->cart);
        $ctx['preDiscountGrossCents']=self::cents($values['line_subtotal'])+self::cents($values['line_subtotal_tax']);
        $ctx['actualNetLineRevenueCents']=self::cents($values['line_total']);
        $checked=HPZ_APL_WC_Cart_Bridge_08::checkout(
            $values,(int)$values['quantity'],function($key){return self::proof($key);},
            $ctx,self::$secret,self::$clock
        );
        HPZ_APL_WC_Cart_Bridge_08::writeOrderLine($item,$checked);
    }

    public static function cartDisplayData($itemData,$cartItem): array
    {
        $data=is_array($itemData)?$itemData:[];
        if (!is_array($cartItem) || !self::requireTarget($cartItem['product_id'] ?? null)) return $data;
        try {
            $checked=self::checkSigned($cartItem,(int)($cartItem['quantity']??0));
            foreach (HPZ_APL_WC_Cart_Bridge_08::displayFields($checked['production']) as $name=>$value) {
                $data[]=['key'=>$name,'value'=>$value,'display'=>$value];
            }
        } catch (Throwable $e) { /* Final gate rejects unverifiable items. */ }
        return $data;
    }
}
