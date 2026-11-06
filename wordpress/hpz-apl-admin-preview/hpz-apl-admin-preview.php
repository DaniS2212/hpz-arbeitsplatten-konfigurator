<?php
/**
 * Plugin Name: Holz-Liebling Arbeitsplatten – Admin-Vorschau
 * Description: Arbeitsplatten-Konfigurator: Gerade mit WooCommerce-Warenkorb; L- und U-Form weiterhin nur als Admin-Vorschau.
 * Version: 1.0.3
 * Update URI: https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * Author: Holz-Liebling
 * License: GPL-2.0-or-later
 * Text Domain: hpz-apl-admin-preview
 */
defined('ABSPATH') || exit;
require_once __DIR__.'/includes/decor-catalog.php';
require_once __DIR__.'/includes/admin-supplier-decor.php';
require_once __DIR__.'/includes/github-updater.php';
require_once __DIR__.'/includes/price-v3.php';
require_once __DIR__.'/includes/price-preview.php';
// 0.9 sale components: physically bundled but completely dormant unless a
// separate audited release flag, operator option and published exact SKU agree.
require_once __DIR__.'/includes/sale-readiness.php';
require_once __DIR__.'/includes/cart-bridge.php';
require_once __DIR__.'/includes/woo-hooks.php';
require_once __DIR__.'/includes/supplier-proofs.php';
require_once __DIR__.'/includes/woo-context.php';
require_once __DIR__.'/includes/straight-runtime.php';
// Same plugin, same WooCommerce store; L/U is separately gated and defaults OFF.
require_once __DIR__.'/includes/lu-price-readiness.php';
require_once __DIR__.'/includes/lu-shop-ratebook.php';
require_once __DIR__.'/includes/lu-cart-bridge.php';
require_once __DIR__.'/includes/lu-runtime.php';
// Exact supplier approval UI disabled.

final class HPZ_APL_Admin_Preview {
    const VERSION = '1.0.3';
    const OPTION = 'hpz_apl_admin_preview';
    const PRODUCTS = array(1000083 => 'straight', 1000080 => 'l', 1000081 => 'u');
    private static $rendered = false;

    public static function init() {
        // Safe by default: self-registers no public route or Woo hooks without
        // the external 0.9 audited-release constant AND saved operator flag.
        add_action('init', array('HPZ_APL_WP_Straight_Runtime_09','register'), 30);
        add_action('init', array('HPZ_APL_WP_LU_Runtime_11','register'), 31);
        HPZ_APL_WP_Admin_Supplier_Decor::register();
        HPZ_APL_GitHub_Updater::init();
        // No individual supplier approvals.
        add_action('admin_menu', array(__CLASS__, 'menu'));
        add_action('admin_init', array(__CLASS__, 'settings'));
        add_action('template_redirect', array(__CLASS__, 'no_cache'));
        add_action('wp', array(__CLASS__, 'prepare_top_configurator_cta'), 20);
        add_action('woocommerce_after_single_product_summary', array(__CLASS__, 'automatic'), 5);
        add_shortcode('hpz_apl_configurator', array(__CLASS__, 'shortcode'));
        add_action('wp_ajax_hpz_apl_price_preview', array(__CLASS__, 'price_preview'));
        // Always closed for the three targets, independent of settings or draft status.
        add_filter('woocommerce_is_purchasable', array(__CLASS__, 'purchasable'), PHP_INT_MAX, 2);
        add_filter('woocommerce_variation_is_purchasable', array(__CLASS__, 'purchasable'), PHP_INT_MAX, 2);
        add_filter('woocommerce_add_to_cart_validation', array(__CLASS__, 'add_to_cart'), PHP_INT_MAX, 3);
        add_action('woocommerce_check_cart_items', array(__CLASS__, 'check_cart'));
        add_action('woocommerce_store_api_cart_errors', array(__CLASS__, 'store_errors'), 10, 2);
    }
    public static function options() {
        return wp_parse_args((array)get_option(self::OPTION, array()), array('enabled'=>false, 'test_mode'=>true, 'sale_enabled'=>false, 'placement'=>'automatic'));
    }
    public static function sanitize($input) {
        $input = is_array($input) ? $input : array();
        return array('enabled'=>!empty($input['enabled']), 'test_mode'=>!empty($input['test_mode']), 'sale_enabled'=>!empty($input['sale_enabled']) && current_user_can('manage_options'), 'placement'=>isset($input['placement']) && $input['placement']==='shortcode' ? 'shortcode' : 'automatic');
    }
    public static function target($id) {
        return isset(self::PRODUCTS[(int)$id]) || isset(self::PRODUCTS[(int)wp_get_post_parent_id($id)]);
    }
    public static function allowed() {
        $o=self::options();
        $id=get_queried_object_id();
        return $o['enabled'] && $o['test_mode'] && is_user_logged_in() && current_user_can('manage_options')
            && function_exists('is_product') && is_product() && isset(self::PRODUCTS[$id])
            && get_post_status($id)==='draft' && current_user_can('edit_post', $id);
    }
    public static function no_cache() {
        if (!self::allowed() && !self::can_public_configurator(get_queried_object_id())) return;
        if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
        nocache_headers();
    }
    /**
     * The standard WooCommerce form cannot attach signed dimensions, decor or
     * a trusted V3 quote. Keep one buying path: the configurator below.
     * The identical CTA is shown on a separately published, audited L/U
     * product only; it never enables another SKU or changes other products.
     */
    private static function can_public_configurator($id) {
        return HPZ_APL_WP_Straight_Runtime_09::canRenderPublic($id)
            || HPZ_APL_WP_LU_Runtime_11::canRenderPublic((int)$id);
    }
    public static function prepare_top_configurator_cta() {
        if (!function_exists('get_queried_object_id')
            || !self::can_public_configurator(get_queried_object_id())) return;
        remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30);
        add_action('woocommerce_single_product_summary', array(__CLASS__, 'top_configurator_cta'), 30);
        add_action('wp_head', array(__CLASS__, 'top_configurator_style'), 30);
    }
    public static function top_configurator_cta() {
        if (!self::can_public_configurator(get_queried_object_id())) return;
        echo '<a class="button alt hpz-apl-top-cta" href="#hpz-apl-konfigurator">Jetzt konfigurieren <span aria-hidden="true">↓</span></a>';
    }
    public static function top_configurator_style() {
        if (!self::can_public_configurator(get_queried_object_id())) return;
        // Flatsome and third-party themes may print the Woo form directly.
        // Defensive CSS is emitted only on this exact, publicly enabled product.
        echo '<style id="hpz-apl-cta-103">body.single-product form.cart{display:none!important}'
            .'.hpz-apl-top-cta{display:inline-flex;align-items:center;gap:10px;background:#16444d!important;'
            .'border-radius:7px;color:#fff!important;font-weight:650;text-decoration:none;padding:12px 20px}'
            .'.hpz-apl-top-cta:hover{background:#0e3540!important}'
            .'#hpz-apl-konfigurator{scroll-margin-top:110px}'
            .'html{scroll-behavior:smooth}'
            .'@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}'
            .'</style>';
    }
    public static function automatic() {
        if (self::options()['placement']==='automatic') echo self::render(); // Escaped in render.
    }
    public static function shortcode() {
        return self::options()['placement']==='shortcode' ? self::render() : '';
    }
    public static function render() {
        $adminTest=self::allowed();
        $publicStraight=HPZ_APL_WP_Straight_Runtime_09::canRenderPublic(get_queried_object_id());
        $publicLU=HPZ_APL_WP_LU_Runtime_11::canRenderPublic((int)get_queried_object_id());
        $publicSale=$publicStraight||$publicLU;
        if ((!$adminTest && !$publicSale) || self::$rendered) return '';
        $id=(int)get_queried_object_id();
        $decor = HPZ_APL_Decor_Catalog::resolve('H1145');
        if (!$decor) return ''; // Invalid/missing bundled mapping never gets a fallback.
        self::$rendered=true;
        $url=plugin_dir_url(__FILE__).'assets/';
        // Render can run after wp_head. Print the narrowly scoped stylesheet at this location.
        wp_register_style('hpz-apl-preview-host', $url.'host.css', array(), self::VERSION);
        ob_start(); wp_print_styles('hpz-apl-preview-host'); $css=ob_get_clean();
        wp_enqueue_script('hpz-apl-preview', $url.'bootstrap.js', array(), self::VERSION, true);
        $priceAttrs=$adminTest && $id===1000083
            ? ' data-price-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_price_preview')).'" data-price-nonce="'.esc_attr(wp_create_nonce('hpz_apl_price_'.$id)).'"'
            : '';
        if($publicStraight){
            $priceAttrs=' data-public-sale="true"'
                .' data-price-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_public_quote')).'"'
                .' data-price-nonce="'.esc_attr(wp_create_nonce('hpz_apl_public_quote_'.$id)).'"'
                .' data-cart-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_add_configured')).'"'
                .' data-cart-nonce="'.esc_attr(wp_create_nonce('hpz_apl_add_configured_'.$id)).'"';
        }
        if($publicLU){
            $priceAttrs=' data-public-sale="true"'
                .' data-price-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_lu_quote')).'"'
                .' data-price-nonce="'.esc_attr(wp_create_nonce('hpz_apl_lu_quote_'.$id)).'"'
                .' data-cart-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_lu_add')).'"'
                .' data-cart-nonce="'.esc_attr(wp_create_nonce('hpz_apl_lu_add_'.$id)).'"';
        }
        $notice=$adminTest?'<p class="hpz-apl-test-notice">Admin-Testvorschau · Kein Angebot und keine Bestellung. L-/U-Stoßstellen sind Bildbeobachtungen, keine CNC-Freigabe.</p>':'';
        return $css.'<section class="hpz-apl-admin-preview" id="hpz-apl-konfigurator" aria-label="Arbeitsplatte konfigurieren">'.$notice.'<div data-hpz-apl-preview data-product-id="'.esc_attr($id).'" data-decor-id="'.esc_attr($decor['id']).'"'.$priceAttrs.'>Konfigurator wird geladen …</div></section>';
    }
    public static function price_preview_allowed($id, $nonce) {
        $o=self::options();
        if (!is_int($id) || $id!==1000083 || !is_string($nonce) || $nonce===''
            || !$o['enabled'] || !$o['test_mode'] || !is_user_logged_in()
            || !current_user_can('manage_options') || !current_user_can('edit_post',$id)
            || get_post_status($id)!=='draft' || get_post_type($id)!=='product'
            || !function_exists('wc_get_product') || !wp_verify_nonce($nonce,'hpz_apl_price_'.$id)) return false;
        $product=wc_get_product($id);
        return $product && $product->get_sku()==='HPZ-APL-GERADE-2026';
    }
    public static function price_preview() {
        if (($_SERVER['REQUEST_METHOD'] ?? '')!=='POST'
            || strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE'] ?? '')[0]))!=='application/json') {
            wp_send_json_error(array('message'=>'JSON-Anfrage erforderlich.'),415);
        }
        $body=file_get_contents('php://input',false,null,0,16385);
        if ($body===false || strlen($body)>16384) wp_send_json_error(array('message'=>'Anfrage zu groß.'),413);
        $raw=json_decode($body,true);
        if (!is_array($raw) || array_values($raw)===$raw) wp_send_json_error(array('message'=>'Ungültige Konfiguration.'),400);
        $id=$raw['productId'] ?? null;
        if (!self::price_preview_allowed($id,$_SERVER['HTTP_X_WP_NONCE'] ?? null)) {
            wp_send_json_error(array('message'=>'Preisvorschau nur im freigegebenen Admin-Test.'),403);
        }
        try {
            $country='';
            if (function_exists('WC') && WC() && WC()->customer) $country=(string)WC()->customer->get_shipping_country();
            $quote=HPZ_APL_Price_Preview::publicQuote($raw,$country);
            wp_send_json_success(array('quote'=>$quote),200);
        } catch (InvalidArgumentException $error) {
            $message=$error->getMessage();
            if (strpos($message,'Dimensions outside price V3')!==false) $message='Für diese Maße liegt noch keine V3-Preisvorschau vor.';
            elseif (strpos($message,'corner')!==false || strpos($message,'Chamfer')!==false || strpos($message,'Round')!==false) $message='Bitte Eckmaße und Bearbeitung prüfen.';
            wp_send_json_error(array('message'=>$message),422);
        } catch (Throwable $error) {
            wp_send_json_error(array('message'=>'Preisvorschau derzeit nicht verfügbar.'),500);
        }
    }
    public static function purchasable($allowed, $product) {
        if (!self::target($product->get_id())) return $allowed;
        if ((int)$product->get_id()===1000083 && HPZ_APL_WP_Straight_Runtime_09::canSell()
            && HPZ_APL_WP_Straight_Runtime_09::validPublishedProduct($product)) return true;
        if (HPZ_APL_WP_LU_Runtime_11::canSell((int)$product->get_id())
            && HPZ_APL_WP_LU_Runtime_11::validPublishedProduct($product,(int)$product->get_id())) return true;
        return false;
    }
    public static function message() { return 'Diese Arbeitsplatte ist noch in Prüfung und kann nicht bestellt werden.'; }
    public static function add_to_cart($passed, $product_id, $quantity) {
        if (!self::target($product_id)) return $passed;
        // Earlier audited cart-verification hooks (Straight priority 50,
        // L/U priority 60) are responsible for signed raw configurations.
        if ((int)$product_id===1000083 && HPZ_APL_WP_Straight_Runtime_09::canSell()) return $passed;
        // Earlier priority-60 L/U signed-cart hook strictly validates raw
        // configurations. This late gate cannot bypass that validation.
        if (HPZ_APL_WP_LU_Runtime_11::canSell((int)$product_id)) return $passed;
        wc_add_notice(self::message(), 'error');
        return false;
    }
    private static function contains_target($cart) {
        if (!$cart) return false;
        foreach ($cart->get_cart() as $item) {
            $id=(int)$item['product_id'];
            if (self::target($id)
                && !(HPZ_APL_WP_Straight_Runtime_09::canSell() && $id===1000083)
                && !HPZ_APL_WP_LU_Runtime_11::canSell($id)) return true;
        }
        return false;
    }
    public static function check_cart() {
        if (self::contains_target(WC()->cart) && !wc_has_notice(self::message(), 'error')) wc_add_notice(self::message(), 'error');
    }
    public static function store_errors($errors, $cart) {
        if (self::contains_target($cart)) $errors->add('hpz_apl_not_released', self::message());
    }
    public static function menu() {
        add_options_page('Arbeitsplatten-Vorschau', 'Arbeitsplatten-Vorschau', 'manage_options', 'hpz-apl-preview', array(__CLASS__, 'page'));
    }
    public static function settings() {
        register_setting('hpz_apl_preview', self::OPTION, array('type'=>'array', 'sanitize_callback'=>array(__CLASS__, 'sanitize')));
    }
    public static function page() {
        if (!current_user_can('manage_options')) return;
        $o=self::options();
        echo '<div class="wrap"><h1>Arbeitsplatten – Admin-Vorschau</h1><p>Admin-Vorschau: Entwürfe 1000083, 1000080 und 1000081. Die öffentliche Gerade kann nur nach separater geprüfter Freigabe verkauft werden; L/U bleiben gesperrt. Keine globalen Produktänderungen.</p><form method="post" action="options.php">';
        settings_fields('hpz_apl_preview');
        echo '<p><label><input type="checkbox" name="'.esc_attr(self::OPTION).'[enabled]" value="1" '.checked($o['enabled'], true, false).'> Vorschau aktivieren</label></p>';
        echo '<p><label><input type="checkbox" name="'.esc_attr(self::OPTION).'[test_mode]" value="1" '.checked($o['test_mode'], true, false).'> Testmodus (erforderlich; ohne Testmodus bleibt die Vorschau aus)</label></p>';
        echo '<p><label>Einbauort <select name="'.esc_attr(self::OPTION).'[placement]"><option value="automatic" '.selected($o['placement'], 'automatic', false).'>Automatisch vor der Beschreibung</option><option value="shortcode" '.selected($o['placement'], 'shortcode', false).'>Nur Shortcode</option></select></label></p><p>Fallback: <code>[hpz_apl_configurator]</code> in einem eigenen Bereich zwischen Produktkopf und Beschreibung. Kein Produktionsmodus vorhanden.</p>';
        echo '<hr><h2>Gerade Arbeitsplatte verkaufen</h2>';
        echo '<p>Erst nach dem Warenkorb- und Checkout-Test einschalten. Voraussetzung: Produkt 1000083 ist veröffentlicht. Es sind keine einzelnen Speedmaster-Freigaben nötig.</p>';
        echo '<p><label><input type="checkbox" name="'.esc_attr(self::OPTION).'[sale_enabled]" value="1" '.checked($o['sale_enabled'], true, false).'> Verkauf der geraden Arbeitsplatte aktivieren</label></p>';
        submit_button(); echo '</form></div>';
    }
}
HPZ_APL_Admin_Preview::init();
