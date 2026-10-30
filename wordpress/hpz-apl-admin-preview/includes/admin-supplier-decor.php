<?php
/** Read-only Speedmaster decor code on an internal WooCommerce order item. */
defined('ABSPATH') || exit;

final class HPZ_APL_WP_Admin_Supplier_Decor {
    public static function register(): void {
        add_action('woocommerce_after_order_itemmeta', array(__CLASS__, 'render'), 10, 3);
    }

    public static function render($itemId, $item, $product): void {
        // Woo may also render order-item templates outside the admin context.
        if (!function_exists('is_admin') || !is_admin()
            || !function_exists('current_user_can') || !current_user_can('manage_woocommerce')) return;
        if (!is_object($item) || !method_exists($item, 'get_product_id')
            || (int)$item->get_product_id() !== 1000083
            || !method_exists($item, 'get_meta')) return;

        // Saved by the existing signed checkout pipeline; no new customer data
        // or later catalog lookup may silently change an ordered decor code.
        $production = $item->get_meta('_hpz_apl_manufacturing_v2', true);
        if (!is_array($production) || ($production['productId'] ?? null) !== 1000083) return;
        $code = $production['supplierDecorCode'] ?? null;
        if (!is_string($code) || $code === '' || strlen($code) > 40) return;

        echo '<div class="hpz-apl-supplier-decor" style="margin:5px 0 0">'
            .'<strong>Speedmaster-Dekorcode (intern):</strong> <code>'
            .esc_html($code).'</code></div>';
    }
}
