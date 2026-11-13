<?php
/**
 * L/U admin-only CART/CHECKOUT PREVIEW (never a live order).
 *
 * Privileged, per-login, 15-minute transient. Exact draft product/SKU only.
 * NEVER changes post status, public sale flags, pricing or shipping settings.
 * Normal public sales continue to depend solely on the audited release gates.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_LU_Admin_Test_98
{
    private const TTL = 15 * 60;
    private const PRODUCTS = [
        1000080 => 'HPZ-APL-L-FORM-2026',
        1000081 => 'HPZ-APL-U-FORM-2026',
    ];

    public static function register(): void
    {
        add_action('admin_post_hpz_apl_lu_admin_test_start',[__CLASS__,'start']);
        add_action('admin_post_hpz_apl_lu_admin_test_stop',[__CLASS__,'stop']);
        // Register the denial even before test mode starts: a surviving draft
        // cart from an expired session may never become an actual WC order.
        add_action('woocommerce_checkout_process',[__CLASS__,'blockClassicCheckout'],0);
        add_action('woocommerce_checkout_create_order',[__CLASS__,'blockOrderCreate'],0,2);
        add_filter('rest_pre_dispatch',[__CLASS__,'blockStoreCheckout'],0,3);
    }

    private static function key(): string
    {
        if(!function_exists('wp_get_session_token') || !function_exists('get_current_user_id'))
            return '';
        $token=(string)wp_get_session_token();
        $user=(int)get_current_user_id();
        if($token===''||$user<=0)return '';
        return 'hpz_lu_admin_cart_'.substr(hash('sha256',$user.'|'.$token),0,32);
    }

    private static function previewSettings(): bool
    {
        if(!class_exists('HPZ_APL_Admin_Preview'))return false;
        $o=HPZ_APL_Admin_Preview::options();
        return !empty($o['enabled']) && !empty($o['test_mode']);
    }

    private static function exactDraft(int $id): bool
    {
        if(!isset(self::PRODUCTS[$id])
           ||!function_exists('get_post_status')||get_post_status($id)!=='draft'
           ||!function_exists('get_post_type')||get_post_type($id)!=='product'
           ||!function_exists('wc_get_product'))return false;
        $product=wc_get_product($id);
        return is_object($product)
          &&method_exists($product,'get_id')&&(int)$product->get_id()===$id
          &&method_exists($product,'get_sku')&&$product->get_sku()===self::PRODUCTS[$id]
          &&method_exists($product,'get_status')&&$product->get_status()==='draft'
          &&method_exists($product,'is_type')&&$product->is_type('simple')
          &&method_exists($product,'is_taxable')&&$product->is_taxable();
    }

    public static function canUse(int $id): bool
    {
        if(!self::previewSettings()||!function_exists('is_user_logged_in')
          ||!is_user_logged_in()||!function_exists('current_user_can')
          ||!current_user_can('manage_options')||!current_user_can('edit_post',$id)
          ||!self::exactDraft($id))return false;
        $key=self::key();
        return $key!=='' && function_exists('get_transient')
          &&get_transient($key)==='active';
    }

    public static function active(): bool
    {
        return self::canUse(1000080)||self::canUse(1000081);
    }

    /** Exact product status and SKU required; no global Woo purchasability. */
    public static function validTestProduct($product,int $id): bool
    {
        return self::canUse($id)&&is_object($product)
          &&method_exists($product,'get_id')&&(int)$product->get_id()===$id
          &&method_exists($product,'get_status')&&$product->get_status()==='draft'
          &&method_exists($product,'get_sku')&&$product->get_sku()===self::PRODUCTS[$id];
    }

    private static function adminAction(string $name): void
    {
        if(($_SERVER['REQUEST_METHOD']??'')!=='POST'
           ||!function_exists('current_user_can')
           ||!current_user_can('manage_options')
           ||!function_exists('check_admin_referer'))
            wp_die('Administratorberechtigung erforderlich.',403);
        check_admin_referer('hpz_apl_lu_test_'.$name);
    }

    private static function returnToSettings(string $state): void
    {
        wp_safe_redirect(add_query_arg('hpz_lu_cart_test',$state,
            admin_url('options-general.php?page=hpz-apl-preview')));
        exit;
    }

    public static function start(): void
    {
        self::adminAction('start');
        $key=self::key();
        if($key===''||!self::previewSettings()
           ||!self::exactDraft(1000080)||!self::exactDraft(1000081)
           ||!current_user_can('edit_post',1000080)
           ||!current_user_can('edit_post',1000081))
            wp_die('Testzugang nicht freigegeben.',403);
        set_transient($key,'active',self::TTL);
        self::returnToSettings('started');
    }

    public static function stop(): void
    {
        self::adminAction('stop');
        $key=self::key();
        if($key!=='')delete_transient($key);
        // Remove only the two temporary draft lines; never touch normal
        // customer/straight or other Woo cart products.
        if(function_exists('WC')&&WC()&&WC()->cart){
            foreach(WC()->cart->get_cart() as $cartKey=>$row){
                if(isset(self::PRODUCTS[(int)($row['product_id']??0)]))
                    WC()->cart->remove_cart_item($cartKey);
            }
        }
        self::returnToSettings('ended');
    }

    public static function renderAdminControls(): void
    {
        if(!current_user_can('manage_options'))return;
        $active=self::active();
        echo '<hr><h2>L-/U-Warenkorbtest – nur Administrator</h2>'
            .'<p><strong>Keine echte Testbestellung:</strong> 15 Minuten nur für diese Anmeldung, '
            .'beide Produkte bleiben Entwürfe. Der Warenkorb und die Kassenansicht sind '
            .'erreichbar, die Bestellung wird vor dem Speichern blockiert. '
            .'Keine Zahlung, Kundenmail oder Speedmaster-Übermittlung.</p>';
        echo '<form action="'.esc_url(admin_url('admin-post.php')).'" method="post">';
        echo '<input type="hidden" name="action" value="hpz_apl_lu_admin_test_'.($active?'stop':'start').'">';
        wp_nonce_field('hpz_apl_lu_test_'.($active?'stop':'start'));
        submit_button($active?'Administrator-Testmodus beenden':'15-Minuten-Warenkorbtest starten','secondary','submit',false);
        echo '</form>';
        if($active){
            echo '<p><strong>Aktiv für diese Anmeldung.</strong> '
                .'<a href="'.esc_url(get_preview_post_link(1000080)).'">L-Form in Vorschau öffnen</a> · '
                .'<a href="'.esc_url(get_preview_post_link(1000081)).'">U-Form in Vorschau öffnen</a></p>';
        }
    }

    private static function containsDraftLine(): bool
    {
        if(!function_exists('WC')||!WC())return false;
        $wc=WC();
        if(is_object($wc->cart??null) && method_exists($wc->cart,'get_cart')){
            foreach($wc->cart->get_cart() as $row){
                $id=(int)($row['product_id']??0);
                if(isset(self::PRODUCTS[$id])&&get_post_status($id)==='draft')return true;
            }
        }
        // Store API sometimes runs before the WC_Cart object is hydrated.
        if(is_object($wc->session??null)&&method_exists($wc->session,'get')){
            $raw=$wc->session->get('cart',[]);
            if(is_array($raw))foreach($raw as $row){
                $id=(int)($row['product_id']??0);
                if(isset(self::PRODUCTS[$id])&&get_post_status($id)==='draft')return true;
            }
        }
        return false;
    }

    public static function blockClassicCheckout(): void
    {
        if(self::containsDraftLine() && function_exists('wc_add_notice'))
            wc_add_notice('Administrator-Test: Kasse und Versand sind prüfbar, '
                .'aber eine echte Bestellung ist ausdrücklich gesperrt.','error');
    }

    /** Last fail-closed guard before WooCommerce saves a classic order. */
    public static function blockOrderCreate($order,$data): void
    {
        if(self::containsDraftLine())throw new RuntimeException(
            'Administrator-Test: Bestellungen mit L-/U-Entwürfen sind gesperrt.'
        );
    }

    /** Prevent Store API checkout and its batch wrapper before order creation. */
    public static function blockStoreCheckout($preempt,$server,$request)
    {
        if(!is_object($request)||!method_exists($request,'get_route'))return $preempt;
        $route=(string)$request->get_route();
        if(self::containsDraftLine()
           &&(strpos($route,'/wc/store/v1/checkout')===0
              ||$route==='/wc/store/v1/batch')){
            return new WP_Error('hpz_apl_lu_admin_no_order',
                'Administrator-Test: Kein Bestellabschluss mit Entwürfen.',
                ['status'=>403]);
        }
        return $preempt;
    }
}
