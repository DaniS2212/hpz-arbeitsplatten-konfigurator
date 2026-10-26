<?php
/**
 * Plugin Name: Holz-Liebling Arbeitsplatten – Admin-Vorschau
 * Description: Isolierter Konfigurator für drei bestehende Produktentwürfe. Ausschließlich Admin-Test; kein Verkauf.
 * Version: 0.4.0
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * Author: Holz-Liebling
 * License: GPL-2.0-or-later
 * Text Domain: hpz-apl-admin-preview
 */
defined('ABSPATH') || exit;
require_once __DIR__.'/includes/decor-catalog.php';

final class HPZ_APL_Admin_Preview {
    const VERSION = '0.4.0';
    const OPTION = 'hpz_apl_admin_preview';
    const PRODUCTS = array(1000083 => 'straight', 1000080 => 'l', 1000081 => 'u');
    private static $rendered = false;

    public static function init() {
        add_action('admin_menu', array(__CLASS__, 'menu'));
        add_action('admin_init', array(__CLASS__, 'settings'));
        add_action('template_redirect', array(__CLASS__, 'no_cache'));
        add_action('woocommerce_after_single_product_summary', array(__CLASS__, 'automatic'), 5);
        add_shortcode('hpz_apl_configurator', array(__CLASS__, 'shortcode'));
        // Always closed for the three targets, independent of settings or draft status.
        add_filter('woocommerce_is_purchasable', array(__CLASS__, 'purchasable'), PHP_INT_MAX, 2);
        add_filter('woocommerce_variation_is_purchasable', array(__CLASS__, 'purchasable'), PHP_INT_MAX, 2);
        add_filter('woocommerce_add_to_cart_validation', array(__CLASS__, 'add_to_cart'), PHP_INT_MAX, 3);
        add_action('woocommerce_check_cart_items', array(__CLASS__, 'check_cart'));
        add_action('woocommerce_store_api_cart_errors', array(__CLASS__, 'store_errors'), 10, 2);
    }
    public static function options() {
        return wp_parse_args((array)get_option(self::OPTION, array()), array('enabled'=>false, 'test_mode'=>true, 'placement'=>'automatic'));
    }
    public static function sanitize($input) {
        $input = is_array($input) ? $input : array();
        return array('enabled'=>!empty($input['enabled']), 'test_mode'=>!empty($input['test_mode']), 'placement'=>isset($input['placement']) && $input['placement']==='shortcode' ? 'shortcode' : 'automatic');
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
        if (!self::allowed()) return;
        if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
        nocache_headers();
    }
    public static function automatic() {
        if (self::options()['placement']==='automatic') echo self::render(); // Escaped in render.
    }
    public static function shortcode() {
        return self::options()['placement']==='shortcode' ? self::render() : '';
    }
    public static function render() {
        if (!self::allowed() || self::$rendered) return '';
        $decor = HPZ_APL_Decor_Catalog::resolve('H1145');
        if (!$decor) return ''; // Invalid/missing bundled mapping never gets a fallback.
        self::$rendered=true;
        $url=plugin_dir_url(__FILE__).'assets/';
        // Render can run after wp_head. Print the narrowly scoped stylesheet at this location.
        wp_register_style('hpz-apl-preview-host', $url.'host.css', array(), self::VERSION);
        ob_start(); wp_print_styles('hpz-apl-preview-host'); $css=ob_get_clean();
        wp_enqueue_script('hpz-apl-preview', $url.'bootstrap.js', array(), self::VERSION, true);
        return $css.'<section class="hpz-apl-admin-preview" aria-label="Arbeitsplatte konfigurieren"><p class="hpz-apl-test-notice">Admin-Testvorschau · Kein Angebot und keine Bestellung. L-/U-Varianten sind bislang schematisch.</p><div data-hpz-apl-preview data-product-id="'.esc_attr(get_queried_object_id()).'" data-decor-id="'.esc_attr($decor['id']).'">Konfigurator wird geladen …</div></section>';
    }
    public static function purchasable($allowed, $product) {
        return self::target($product->get_id()) ? false : $allowed;
    }
    public static function message() { return 'Diese Arbeitsplatte ist noch in Prüfung und kann nicht bestellt werden.'; }
    public static function add_to_cart($passed, $product_id, $quantity) {
        if (!self::target($product_id)) return $passed;
        wc_add_notice(self::message(), 'error');
        return false;
    }
    private static function contains_target($cart) {
        if (!$cart) return false;
        foreach ($cart->get_cart() as $item) {
            if (self::target($item['product_id'])) return true;
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
        echo '<div class="wrap"><h1>Arbeitsplatten – Admin-Vorschau</h1><p>Nur Administratoren, nur Entwürfe 1000083, 1000080 und 1000081. Verkäufe bleiben bei aktivem Plugin immer gesperrt. Es werden keine Produkte oder WCPA-Formulare geändert.</p><form method="post" action="options.php">';
        settings_fields('hpz_apl_preview');
        echo '<p><label><input type="checkbox" name="'.esc_attr(self::OPTION).'[enabled]" value="1" '.checked($o['enabled'], true, false).'> Vorschau aktivieren</label></p>';
        echo '<p><label><input type="checkbox" name="'.esc_attr(self::OPTION).'[test_mode]" value="1" '.checked($o['test_mode'], true, false).'> Testmodus (erforderlich; ohne Testmodus bleibt die Vorschau aus)</label></p>';
        echo '<p><label>Einbauort <select name="'.esc_attr(self::OPTION).'[placement]"><option value="automatic" '.selected($o['placement'], 'automatic', false).'>Automatisch vor der Beschreibung</option><option value="shortcode" '.selected($o['placement'], 'shortcode', false).'>Nur Shortcode</option></select></label></p><p>Fallback: <code>[hpz_apl_configurator]</code> in einem eigenen Bereich zwischen Produktkopf und Beschreibung. Kein Produktionsmodus vorhanden.</p>';
        submit_button(); echo '</form></div>';
    }
}
HPZ_APL_Admin_Preview::init();
