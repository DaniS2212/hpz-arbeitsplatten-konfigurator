<?php
/**
 * Straight sale runtime for WP/Woo, version 0.9 – code-ready, ALWAYS OFF
 * until the operator explicitly opts in via an audited release constant,
 * a separate saved release flag, a published EXACT SKU and supplier proofs.
 *
 * The default plugin contains NONE of those approvals. Never set them in code.
 * No Speedmaster API or automatic supplier order is used.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_WP_Straight_Runtime_09 {
    const PRODUCT_ID=1000083;
    const SKU='HPZ-APL-GERADE-2026';
    const RELEASE_OPTION='hpz_apl_straight_sale_090';

    public static function canSell(): bool {
        return defined('HPZ_APL_09_RELEASE_AUDITED')
            && HPZ_APL_09_RELEASE_AUDITED === true
            && get_option(self::RELEASE_OPTION,'disabled') === 'enabled'
            && function_exists('WC') && WC() && function_exists('wc_get_product')
            && self::validPublishedProduct(wc_get_product(self::PRODUCT_ID));
    }

    public static function validPublishedProduct($product): bool {
        return is_object($product) && method_exists($product,'get_id')
            && (int)$product->get_id()===self::PRODUCT_ID
            && method_exists($product,'get_sku') && $product->get_sku()===self::SKU
            && method_exists($product,'get_status') && $product->get_status()==='publish'
            && method_exists($product,'is_type') && $product->is_type('simple')
            && method_exists($product,'is_taxable') && $product->is_taxable();
    }

    public static function canRenderPublic($id): bool {
        return (int)$id===self::PRODUCT_ID
            && self::canSell()
            && function_exists('is_product') && is_product()
            && function_exists('get_queried_object_id') && (int)get_queried_object_id()===self::PRODUCT_ID;
    }

    public static function secret(): string {
        if (!function_exists('wp_salt')) throw new RuntimeException('WordPress Sicherheitsschlüssel fehlt.');
        $secret=wp_salt('auth').wp_salt('secure_auth');
        if (strlen($secret)<32) throw new RuntimeException('WordPress Sicherheitsschlüssel fehlt.');
        return $secret;
    }

    public static function register(): void {
        if (!self::canSell()) return;
        // Because this is guarded by a compile-time audit constant and a
        // manually set operator option, it CANNOT be triggered by a URL,
        // POST payload, visitor cookie, webhook or the preview checkbox.
        HPZ_APL_WC_Dormant_Hooks_08::configure(
            function($key){return null;},
            function($line,$cart){return HPZ_APL_WP_Woo_Context_09::context($line,$cart);},
            self::secret()
        );
        if (!HPZ_APL_WC_Dormant_Hooks_08::registerForVerifiedSale()) {
            throw new LogicException('WooCommerce Adapter für Verkaufsfreigabe fehlt.');
        }
        add_action('wp_ajax_hpz_apl_public_quote', [__CLASS__,'publicQuote']);
        add_action('wp_ajax_nopriv_hpz_apl_public_quote', [__CLASS__,'publicQuote']);
        add_action('wp_ajax_hpz_apl_add_configured', [__CLASS__,'addConfigured']);
        add_action('wp_ajax_nopriv_hpz_apl_add_configured', [__CLASS__,'addConfigured']);
        // Woo Blocks 11.2+: a direct cart quantity change needs a fresh proof.
        add_filter('woocommerce_store_api_cart_item_quantity_validation',[__CLASS__,'storeQuantity'],100,4);
        add_filter('woocommerce_update_cart_validation',[__CLASS__,'classicQuantity'],100,4);
    }

    private static function ensureRequest($action): array {
        if (!self::canSell() || ($_SERVER['REQUEST_METHOD']??'')!=='POST'
            || strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))!=='application/json') {
            wp_send_json_error(['message'=>'Bestellfunktion nicht freigegeben.'],403);
            exit;
        }
        $nonce=$_SERVER['HTTP_X_WP_NONCE'] ?? null;
        if (!is_string($nonce) || !wp_verify_nonce($nonce,$action.'_'.self::PRODUCT_ID)) {
            wp_send_json_error(['message'=>'Sicherheitsprüfung fehlgeschlagen. Bitte Seite neu laden.'],403);
            exit;
        }
        $payload=file_get_contents('php://input',false,null,0,16385);
        if (!is_string($payload)||strlen($payload)>16384) {
            wp_send_json_error(['message'=>'Ungültige Anfragegröße.'],413);
            exit;
        }
        $raw=json_decode($payload,true);
        if (!is_array($raw)||array_values($raw)===$raw) {
            wp_send_json_error(['message'=>'Ungültige Arbeitsplatten-Konfiguration.'],400);
            exit;
        }
        return $raw;
    }

    public static function publicQuote(): void {
        $raw=self::ensureRequest('hpz_apl_public_quote');
        try {
            $signed=HPZ_APL_WC_Cart_Bridge_08::issue(
                $raw,function($key){return null;},self::secret()
            );
            $normalized=HPZ_APL_Price_Preview::normalize($raw);
            $quote=HPZ_APL_Price_V3::quote($normalized);
            wp_send_json_success(['quote'=>[
                'ruleVersion'=>$quote['ruleVersion'],
                'status'=>'calculated-ready-for-cart',
                'currency'=>'EUR',
                'unitGrossReferenceCents'=>$quote['unitGrossReferenceCents'],
                'totalGrossReferenceCents'=>$quote['totalGrossReferenceCents'],
                'quantity'=>$normalized['quantity'],
                'taxNote'=>'DE-Bruttopreis inkl. 19 % MwSt. · Kundenversand wird im Checkout berechnet',
                'availabilityNote'=>'Maße und Preis geprüft. Kundenversand über WooCommerce.',
                'purchasable'=>true,
            ]],200);
        } catch(Throwable $error) {
            wp_send_json_error(['message'=>'Für diese Maße und Bearbeitungen liegt noch keine Verkaufsfreigabe vor.'],422);
        }
    }

    public static function addConfigured(): void {
        $raw=self::ensureRequest('hpz_apl_add_configured');
        try {
            if (!function_exists('WC')||!WC()) throw new LogicException('WooCommerce nicht verfügbar.');
            if (!WC()->cart && function_exists('wc_load_cart')) wc_load_cart();
            if (!WC()->cart) throw new LogicException('Warenkorb nicht verfügbar.');
            $signed=HPZ_APL_WC_Cart_Bridge_08::issue(
                $raw,function($key){return null;},self::secret()
            );
            $quantity=$raw['quantity'] ?? null;
            if (!is_int($quantity)||$quantity<1||$quantity>1000) {
                throw new InvalidArgumentException('Ungültige Bestellmenge.');
            }
            $cartKey=WC()->cart->add_to_cart(self::PRODUCT_ID,$quantity,0,[],$signed);
            if (!is_string($cartKey)||$cartKey==='') throw new RuntimeException('Warenkorb konnte nicht befüllt werden.');
            WC()->cart->calculate_totals();
            wp_send_json_success([
                'added'=>true,
                'cartUrl'=>function_exists('wc_get_cart_url')?wc_get_cart_url():'',
            ],200);
        }catch(Throwable $error){
            wp_send_json_error(['message'=>'Diese Konfiguration konnte nicht in den Warenkorb gelegt werden. Bitte Maße und Lieferbarkeit prüfen.'],422);
        }
    }

    public static function storeQuantity($allowed,$quantity,$product,$cartItem) {
        if (!is_object($product) || !method_exists($product,'get_id')
            || (int)$product->get_id()!==self::PRODUCT_ID) return $allowed;
        if (!$allowed || !self::canSell() || !is_int($quantity) || !is_array($cartItem)) return new WP_Error('hpz_apl_invalid_quantity','Die Menge dieser Arbeitsplatte ist nicht freigegeben.', ['status'=>400]);
        try {
            HPZ_APL_WC_Cart_Bridge_08::inspect(
                $cartItem,$quantity,function($key){return null;},self::secret()
            );
            return true;
        }catch(Throwable $error){return new WP_Error('hpz_apl_invalid_quantity','Die Menge dieser Arbeitsplatte ist nicht freigegeben.', ['status'=>400]);}
    }

    public static function classicQuantity($allowed,$cartKey,$values,$quantity) {
        if (!is_array($values) || (int)($values['product_id']??0)!==self::PRODUCT_ID) return $allowed;
        if (!$allowed || !self::canSell() || !is_int($quantity)) return false;
        try{
            HPZ_APL_WC_Cart_Bridge_08::inspect(
                $values,$quantity,function($key){return null;},self::secret()
            );
            return true;
        }catch(Throwable $error){return false;}
    }
}
