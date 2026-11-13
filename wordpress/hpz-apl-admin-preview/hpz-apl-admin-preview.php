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
require_once __DIR__.'/includes/lu-price-preview.php';
require_once __DIR__.'/includes/lu-cart-bridge.php';
require_once __DIR__.'/includes/lu-admin-test.php';
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
        HPZ_APL_LU_Admin_Test_98::register();
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
        // ADMIN-ONLY scenario pricing; no nopriv hook, Woo order or sale flag.
        add_action('wp_ajax_hpz_apl_lu_price_preview', array(__CLASS__, 'lu_price_preview'));
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
    /**
     * Minimal Woo product header for the exact three configurator products.
     * Only when our automatic preview/live presentation is actually enabled.
     * Keeps H1 and configurator; never modifies ordinary store products.
     */
    public static function prepare_top_configurator_cta() {
        if (!function_exists('get_queried_object_id')) return;
        $id=(int)get_queried_object_id();
        if (!isset(self::PRODUCTS[$id]) || self::options()['placement']!=='automatic'
            || (!self::allowed() && !self::can_public_configurator($id))) return;
        remove_action('woocommerce_before_single_product_summary','woocommerce_show_product_sale_flash',10);
        remove_action('woocommerce_before_single_product_summary','woocommerce_show_product_images',20);
        foreach (array(
            5=>'woocommerce_template_single_title',
            10=>'woocommerce_template_single_rating',
            20=>'woocommerce_template_single_excerpt',
            30=>'woocommerce_template_single_add_to_cart',
            40=>'woocommerce_template_single_meta',
            50=>'woocommerce_template_single_sharing'
        ) as $priority=>$callback) {
            remove_action('woocommerce_single_product_summary',$callback,$priority);
        }
        remove_action('woocommerce_single_product_summary','woocommerce_template_single_price',10);
        // Preserve the complete LOWER WooCommerce product area:
        // long description / additional information / reviews (tabs),
        // upsells and related products. Only the top gallery/summary is
        // compacted. Our configurator runs at priority 5, before tabs (10).

        add_action('woocommerce_single_product_summary',array(__CLASS__,'compact_product_title'),5);
        add_filter('body_class',array(__CLASS__,'compact_body_class'));
        add_action('wp_head',array(__CLASS__,'top_configurator_style'),30);
    }
    public static function compact_body_class($classes) {
        $classes[]='hpz-apl-compact-product';
        return $classes;
    }
    public static function compact_product_title() {
        $id=(int)get_queried_object_id();
        if (!isset(self::PRODUCTS[$id])) return;
        echo '<h1 class="hpz-apl-minimal-h1">'.esc_html(get_the_title($id)).'</h1>';
    }
    public static function top_configurator_style() {
        $id=(int)get_queried_object_id();
        if (!isset(self::PRODUCTS[$id]) ||
            (!self::allowed() && !self::can_public_configurator($id))) return;
        echo '<style id="hpz-apl-compact-product">'
            .'body.hpz-apl-compact-product .product-main{padding:14px 0 0!important}'
            .'body.hpz-apl-compact-product .product-gallery,'
            .'body.hpz-apl-compact-product .woocommerce-product-gallery,'
            .'body.hpz-apl-compact-product .shop-page-title,'
            .'body.hpz-apl-compact-product .woocommerce-breadcrumb{display:none!important}'
            .'body.hpz-apl-compact-product .product-summary,'
            .'body.hpz-apl-compact-product .summary.entry-summary{float:none!important;'
            .'max-width:100%!important;width:100%!important;flex:0 0 100%!important;'
            .'margin:0!important;padding:0 0 12px!important;min-height:0!important}'
            .'body.hpz-apl-compact-product .product-main > .row{margin-bottom:0!important}'
            .'body.hpz-apl-compact-product .hpz-apl-minimal-h1{font-size:clamp(24px,2.6vw,36px);'
            .'line-height:1.25;font-weight:700;letter-spacing:-.025em;margin:8px 0 16px!important}'
            .'body.hpz-apl-compact-product form.cart{display:none!important}'
            .'body.hpz-apl-compact-product #hpz-apl-konfigurator{scroll-margin-top:100px}'
            .'@media(max-width:760px){body.hpz-apl-compact-product .hpz-apl-minimal-h1{'
            .'font-size:24px;margin:4px 0 12px!important}}'
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
        if($adminTest && ($id===1000080 || $id===1000081)) {
            $priceAttrs=' data-price-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_lu_price_preview')).'"'
                .' data-price-nonce="'.esc_attr(wp_create_nonce('hpz_apl_lu_price_'.$id)).'"';
        }
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
        // Identical signed cart/quote endpoints, but ONLY for the bound admin
        // session; product remains draft and checkout-order creation is denied.
        $adminCart=$adminTest && HPZ_APL_LU_Admin_Test_98::canUse($id);
        if($adminCart){
            $priceAttrs=' data-public-sale="true" data-admin-cart-preview="true"'
                .' data-price-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_lu_quote')).'"'
                .' data-price-nonce="'.esc_attr(wp_create_nonce('hpz_apl_lu_quote_'.$id)).'"'
                .' data-cart-endpoint="'.esc_attr(admin_url('admin-ajax.php?action=hpz_apl_lu_add')).'"'
                .' data-cart-nonce="'.esc_attr(wp_create_nonce('hpz_apl_lu_add_'.$id)).'"';
        }
        $notice=$adminCart
            ?'<p class="hpz-apl-test-notice"><strong>ADMIN-WARENKORBTEST:</strong> L/U bleiben Entwürfe. Warenkorb und Kasse prüfen, aber Bestellung, Zahlung und Speedmaster sind gesperrt. Der Testzugang endet automatisch.</p>'
            :($adminTest?'<p class="hpz-apl-test-notice">Administratoransicht · Bestellung derzeit nicht möglich.</p>':'');
        return $css.'<section class="hpz-apl-admin-preview" id="hpz-apl-konfigurator" aria-label="Arbeitsplatte konfigurieren">'.$notice.'<div data-hpz-apl-preview data-product-id="'.esc_attr($id).'" data-decor-id="'.esc_attr($decor['id']).'"'.$priceAttrs.'>Konfigurator wird geladen …</div></section>';
    }
    /**
     * Separate authenticated price-only preview for draft L/U products.
     * This must never register for guests, grant Woo purchasability or
     * return supplier net EKs to the browser.
     */
    public static function lu_price_preview_allowed($id,$nonce) {
        $o=self::options();
        if (!is_int($id) || !isset(self::PRODUCTS[$id])
            || !in_array($id,[1000080,1000081],true)
            || !is_string($nonce) || $nonce===''
            || !$o['enabled'] || !$o['test_mode'] || !is_user_logged_in()
            || !current_user_can('manage_options') || !current_user_can('edit_post',$id)
            || get_post_status($id)!=='draft' || get_post_type($id)!=='product'
            || !function_exists('wc_get_product')
            || !wp_verify_nonce($nonce,'hpz_apl_lu_price_'.$id))return false;
        $product=wc_get_product($id);
        return $product && $product->get_sku()===($id===1000080
            ?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026');
    }

    public static function lu_price_preview() {
        if (($_SERVER['REQUEST_METHOD']??'')!=='POST'
            || strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))!=='application/json')
            wp_send_json_error(['message'=>'JSON-Anfrage erforderlich.'],415);
        $body=file_get_contents('php://input',false,null,0,16385);
        if($body===false||strlen($body)>16384)
            wp_send_json_error(['message'=>'Konfiguration zu groß.'],413);
        $raw=json_decode($body,true);
        if(!is_array($raw)||array_values($raw)===$raw)
            wp_send_json_error(['message'=>'Konfiguration fehlt.'],400);
        $id=$raw['productId']??null;
        if(!self::lu_price_preview_allowed($id,$_SERVER['HTTP_X_WP_NONCE']??null))
            wp_send_json_error(['message'=>'Nur für Administratoren in der Produkt-Testvorschau.'],403);
        try {
            $country='';
            if(function_exists('WC')&&WC()&&WC()->customer)
                $country=(string)WC()->customer->get_shipping_country();
            $option=get_option('hpz_apl_lu_price_window_v1',[]);
            $quote=HPZ_APL_LU_Admin_Price_Preview_13::quote(
                $raw,$country,is_array($option)?$option:[]
            );
            wp_send_json_success(['quote'=>$quote],200);
        }catch(InvalidArgumentException $e) {
            wp_send_json_error(['message'=>$e->getMessage()],422);
        }catch(Throwable $e) {
            wp_send_json_error(['message'=>'L-/U-Preisvorschau derzeit nicht verfügbar.'],500);
        }
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
        if (HPZ_APL_WP_LU_Runtime_11::canCart((int)$product->get_id())
            && HPZ_APL_WP_LU_Runtime_11::validCartProduct($product,(int)$product->get_id())) return true;
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
        if (HPZ_APL_WP_LU_Runtime_11::canCart((int)$product_id)) return $passed;
        wc_add_notice(self::message(), 'error');
        return false;
    }
    private static function contains_target($cart) {
        if (!$cart) return false;
        foreach ($cart->get_cart() as $item) {
            $id=(int)$item['product_id'];
            if (self::target($id)
                && !(HPZ_APL_WP_Straight_Runtime_09::canSell() && $id===1000083)
                && !HPZ_APL_WP_LU_Runtime_11::canCart($id)) return true;
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
        submit_button(); echo '</form>';
        // Read-only release truth, from this exact connected WooCommerce shop.
        // Never infer a real checkout from a synthetic GitHub test.
        echo '<hr><h2>Verkaufsstart – tatsächlicher Shopstatus</h2>';
        echo '<p>Die folgenden Werte stammen unmittelbar aus WooCommerce. Die Preisregressionen ersetzen keine reale Checkout-Bestätigung.</p>';
        echo '<table class="widefat striped" style="max-width:860px"><thead><tr><th>Produkt</th><th>Veröffentlichung</th><th>SKU/Steuer/Produkttyp</th></tr></thead><tbody>';
        foreach (self::PRODUCTS as $id=>$type) {
            $product=function_exists('wc_get_product')?wc_get_product($id):false;
            $name=['straight'=>'Gerade','l'=>'L-Form','u'=>'U-Form'][$type];
            $published=is_object($product)&&method_exists($product,'get_status')&&$product->get_status()==='publish';
            $status=is_object($product)&&method_exists($product,'get_status')?$product->get_status():'fehlt';
            $expected=$type==='straight'?'HPZ-APL-GERADE-2026':($type==='l'?'HPZ-APL-L-FORM-2026':'HPZ-APL-U-FORM-2026');
            $valid=is_object($product) && method_exists($product,'get_sku')
                && $product->get_sku()===$expected && method_exists($product,'is_type')
                && $product->is_type('simple') && method_exists($product,'is_taxable')
                && $product->is_taxable();
            echo '<tr><td>'.esc_html($name.' (#'.$id.')').'</td><td>'.esc_html($published?'Veröffentlicht':$status).'</td><td>'.esc_html($valid?'SKU, einfacher Typ und Steuer: OK':'Produktdaten prüfen').'</td></tr>';
        }
        echo '</tbody></table>';
        $lu=get_option(HPZ_APL_WP_LU_Runtime_11::SALE_OPTION,[]);
        $lu=is_array($lu)?$lu:[];
        $policy=get_option('hpz_apl_lu_price_window_v1',[]);
        $policy=is_array($policy)?$policy:[];
        $audited=defined('HPZ_APL_LU_11_AUDITED_RELEASE')&&HPZ_APL_LU_11_AUDITED_RELEASE===true;
        echo '<p><strong>Gerade:</strong> '.esc_html(!empty($o['sale_enabled'])?'Verkaufsoption eingeschaltet':'Verkaufsoption aus').'<br>';
        echo '<strong>L/U:</strong> '.esc_html($audited?'Audit-Konstante vorhanden':'Audit-Konstante fehlt')
            .' · '.esc_html(($lu['enabled']??false)===true?'Verkaufsoption an':'Verkaufsoption aus')
            .' · '.esc_html(($lu['manual_supplier_handoff_verified']??false)===true?'Manuelle Übergabe bestätigt':'Manuelle Übergabe offen')
            .' · '.esc_html(($lu['woocommerce_checkout_verified']??false)===true?'Woo-Checkout bestätigt':'Woo-Checkout offen').'<br>';
        echo '<strong>L/U-Preisregel:</strong> '.esc_html(($policy['model_price_approved']??false)===true?'Preismodell freigegeben':'Preismodell nicht freigegeben')
            .' · '.esc_html(($policy['extended_model_approved']??false)===true?'variable Maße freigegeben':'variable Maße nicht freigegeben')
            .' · '.esc_html(($policy['corner_model_approved']??false)===true?'Ecken freigegeben':'Ecken nicht freigegeben')
            .' · '.esc_html(is_int($policy['other_cost_net_cents']??null)?'Zusatzkosten hinterlegt':'Zusatzkosten fehlen').'</p>';
        echo '<hr><h2>Versand im Checkout</h2>';
        echo '<p>Der konfigurierte WooCommerce-Kundentarif bleibt unverändert. Die internen Bezugskosten von 10 € netto unter 190 cm bzw. 60 € netto ab 190 cm kalkuliert die bestehende Preisengine in den Produktpreis. Hier ist keine zusätzliche Speditionsregel und kein weiterer Speditionszuschlag einzurichten.</p>';
        echo '<p><em>Für die Verkaufsfreigabe dennoch 189,9 / 190,0 / 190,1 cm mit dem echten WooCommerce-Versandtarif im Warenkorb testen; die Höhe des bestehenden Kundentarifs wird nicht durch das Plugin festgelegt.</em></p>';
        HPZ_APL_LU_Admin_Test_98::renderAdminControls();

        echo '</div>';
    }
}
HPZ_APL_Admin_Preview::init();
