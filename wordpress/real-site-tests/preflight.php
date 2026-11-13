<?php
/**
 * Real WordPress / WooCommerce read-only preflight for HPZ APL v1.0.3.
 *
 * Run from an authorized WP-CLI shell:
 *   wp eval-file /path/to/preflight.php baseline
 *   wp eval-file /path/to/preflight.php installed
 *
 * No write APIs, shopping carts, logins or orders are touched. Browser-based
 * administrator, guest and cart/Store API tests are intentionally separate.
 */
declare(strict_types=1);

if (!defined('ABSPATH') || !function_exists('get_post') || !function_exists('wc_get_product')) {
    fwrite(STDERR, "This check must run inside a real WordPress instance with WooCommerce loaded.\n");
    exit(2);
}
$runMode = (isset($args) && is_array($args) && isset($args[0])) ? $args[0] : 'baseline';
if (!in_array($runMode, ['baseline', 'installed'], true)) {
    fwrite(STDERR, "Usage: wp eval-file preflight.php [baseline|installed]\n");
    exit(2);
}

$results = [];
$failCount = 0;
$record = static function (string $check, string $status, string $details = '') use (&$results, &$failCount): void {
    $results[] = ['check'=>$check,'status'=>$status,'details'=>$details];
    if ($status === 'FAIL') ++$failCount;
};
$targetSkus = [
    1000083 => 'HPZ-APL-GERADE-2026',
    1000080 => 'HPZ-APL-L-FORM-2026',
    1000081 => 'HPZ-APL-U-FORM-2026',
];
$controlId = 999985; // Optional existing furniture-plinth regression product, never changed.
$observations = [];

$wcPresent = function_exists('WC') && class_exists('WooCommerce');
$record('woocommerce', $wcPresent ? 'PASS' : 'FAIL', $wcPresent ? 'WooCommerce available' : 'WooCommerce unavailable');
$record('wordpress-version', version_compare(get_bloginfo('version'), '6.5', '>=') ? 'PASS' : 'FAIL', get_bloginfo('version'));
$record('php-version', version_compare(PHP_VERSION, '7.4', '>=') ? 'PASS' : 'FAIL', PHP_VERSION);

$theme = wp_get_theme();
$themeName = $theme->get('Name');
$parent = $theme->parent();
$themeLabel = $themeName . ($parent ? ' / parent: ' . $parent->get('Name') : '');
$flatsome = stripos($themeLabel, 'flatsome') !== false;
$record('flatsome-theme', $flatsome ? 'PASS' : 'WARN', $themeLabel);

$activePlugins = (array) get_option('active_plugins', []);
$detected = [
    'wp-rocket' => count(preg_grep('~^wp-rocket/~', $activePlugins)) > 0,
    'wcpa' => count(preg_grep('~wcpa|product.add.ons|product-options~i', $activePlugins)) > 0,
];
foreach ($detected as $plugin => $active) {
    $record('plugin-' . $plugin, $active ? 'PASS' : 'INFO', $active ? 'Detected as active' : 'Not detectable from local active_plugins list; verify manually');
}

// Snapshot deliberately contains only hashes and public product identifiers;
// original product data / metadata never leave this process.
$fingerprint = static function (int $id, $product): string {
    $post = get_post($id);
    $snapshot = [
        'post' => $post ? [
            $post->post_type, $post->post_status, $post->post_title,
            $post->post_content, $post->post_excerpt, $post->post_name,
            $post->post_modified_gmt
        ] : null,
        'woocommerce' => $product ? [
            $product->get_type(), $product->get_sku('edit'),
            $product->get_regular_price('edit'), $product->get_sale_price('edit'),
            $product->get_price('edit'), $product->get_stock_status('edit'),
            $product->get_manage_stock('edit'), $product->get_stock_quantity('edit'),
            $product->get_virtual('edit'), $product->get_weight('edit'),
            $product->get_length('edit'), $product->get_width('edit'),
            $product->get_height('edit'), $product->get_image_id('edit'),
            $product->get_gallery_image_ids('edit')
        ] : null,
        'product_metadata' => get_post_meta($id),
    ];
    return hash('sha256', serialize($snapshot));
};

foreach ($targetSkus as $id => $expectedSku) {
    $post = get_post($id);
    $product = wc_get_product($id);
    $exists = $post && $product;
    $record('product-' . $id . '-exists', $exists ? 'PASS' : 'FAIL', 'Product must exist in this site');
    if (!$exists) continue;
    $expectedStatus = $id === 1000083 ? 'publish' : 'draft';
    $record('product-' . $id . '-status', $post->post_status === $expectedStatus ? 'PASS' : 'FAIL', 'status=' . $post->post_status . ', expected=' . $expectedStatus);
    $record('product-' . $id . '-type', $post->post_type === 'product' ? 'PASS' : 'FAIL', 'type=' . $post->post_type);
    $record('product-' . $id . '-sku', $product->get_sku() === $expectedSku ? 'PASS' : 'FAIL', 'SKU matched=' . ($product->get_sku() === $expectedSku ? 'yes' : 'no'));
    $observations[(string) $id] = $fingerprint($id, $product);
}
$control = wc_get_product($controlId);
if ($control) {
    $observations[(string) $controlId] = $fingerprint($controlId, $control);
    $record('control-' . $controlId, 'PASS', 'Regression fingerprint available');
} else {
    $record('control-' . $controlId, 'SKIP', 'This control ID does not exist on this installation');
}

$present = class_exists('HPZ_APL_Admin_Preview');
$record('preview-plugin-loaded', $present ? 'PASS' : ($runMode === 'installed' ? 'FAIL' : 'INFO'), $present ? 'Plugin loaded in WordPress' : 'Plugin not loaded; valid for baseline before installation');

if ($present) {
    $pluginVersion = defined('HPZ_APL_Admin_Preview::VERSION') ? constant('HPZ_APL_Admin_Preview::VERSION') : 'unknown';
    $currentVersion = $pluginVersion === '1.0.3';
    $record('preview-plugin-version', $currentVersion ? 'PASS' : ($runMode === 'installed' ? 'FAIL' : 'INFO'), $pluginVersion);
    if (!$currentVersion) {
        $record('preview-current-version-hooks', 'SKIP', 'Baseline of older plugin; 1.0.3-only checks run after update');
    } else {
    $opts = HPZ_APL_Admin_Preview::options();
    $active = !empty($opts['enabled']) && !empty($opts['test_mode']);
    $record('preview-admin-test-flags', $active ? 'PASS' : ($runMode === 'installed' ? 'WARN' : 'INFO'),
        'enabled=' . (!empty($opts['enabled']) ? 'yes' : 'no') . ', test_mode=' . (!empty($opts['test_mode']) ? 'yes' : 'no'));
    foreach ([
        'woocommerce_is_purchasable' => 'purchasable',
        'woocommerce_variation_is_purchasable' => 'purchasable',
        'woocommerce_add_to_cart_validation' => 'add_to_cart',
        'woocommerce_check_cart_items' => 'check_cart',
        'woocommerce_store_api_cart_errors' => 'store_errors',
        'wp_ajax_hpz_apl_price_preview' => 'price_preview'
    ] as $hook => $method) {
        $registered = has_filter($hook, ['HPZ_APL_Admin_Preview', $method]) !== false;
        $record('hook-' . $hook, $registered ? 'PASS' : 'FAIL', 'Expected plugin callback ' . $method);
    }
    $publicRoute = has_filter('wp_ajax_nopriv_hpz_apl_price_preview') !== false;
    $record('guest-ajax-not-registered', !$publicRoute ? 'PASS' : 'FAIL', 'No nopriv price action permitted');
    foreach ($targetSkus as $id => $sku) {
        $product = wc_get_product($id);
        if ($product) {
            $expected = $id === 1000083 && HPZ_APL_WP_Straight_Runtime_09::canSell();
            $actual = HPZ_APL_Admin_Preview::purchasable(true, $product);
            $record('purchase-gate-' . $id, $actual === $expected ? 'PASS' : 'FAIL', 'Straight only when live; L/U always denied');
        }
    }
    if ($control) {
        $notBlocked = HPZ_APL_Admin_Preview::purchasable(true, $control) === true;
        $record('control-product-unaffected', $notBlocked ? 'PASS' : 'FAIL', 'Plugin must not block product ' . $controlId);
    }
    if (class_exists('HPZ_APL_Price_Preview') && class_exists('HPZ_APL_Price_V3')) {
        $reference = [
            'schemaVersion'=>2, 'inputUnit'=>'mm', 'productId'=>1000083, 'sku'=>'HPZ-APL-GERADE-2026',
            'product'=>'straight', 'geometry'=>'straight', 'corner'=>'square',
            'straightCorner'=>['side'=>'none', 'treatment'=>null, 'parameters'=>[]],
            'dimensions'=>['L1'=>'2000', 'B1'=>'600'], 'material'=>'APL38',
            'decor'=>'W980', 'quantity'=>1
        ];
        try {
            $quote = HPZ_APL_Price_Preview::publicQuote($reference, 'DE');
            $safe = $quote['totalGrossReferenceCents'] === 100000
                && $quote['purchasable'] === false && $quote['status'] === 'calculated-not-sale-approved';
            $record('real-wp-v3-quote', $safe ? 'PASS' : 'FAIL', 'Expected 1000.00 EUR gross with flat 150 EUR net inbound, explicitly not purchasable');
            $serialized = wp_json_encode($quote);
            $leak = preg_match('/supplierNet|marginPct|decorSupplierCode|inboundNet|EK_REFERENCE/', $serialized) === 1;
            $record('price-does-not-leak-costs', !$leak ? 'PASS' : 'FAIL', 'No internal pricing data exposed');
        } catch (Throwable $error) {
            $record('real-wp-v3-quote', 'FAIL', 'Pricing threw: ' . get_class($error));
        }
    } else {
        $record('real-wp-v3-quote', 'FAIL', 'Required server-side price classes missing');
    }
    } // 0.6.0-only checks
}

// Intentional limits: HTTP security, login roles, cache and Store API are tested
// through the staging/browser matrix; WP-CLI never creates carts or orders.
$output = [
    'schema' => 'hpz-apl-wp-preflight-1',
    'mode' => $runMode,
    'site_host' => parse_url(home_url('/'), PHP_URL_HOST),
    'wp_version' => get_bloginfo('version'),
    'php_version' => PHP_VERSION,
    'woocommerce_version' => defined('WC_VERSION') ? WC_VERSION : null,
    'theme' => $themeLabel,
    'product_fingerprints' => $observations,
    'results' => $results,
    'fail_count' => $failCount,
    'pass' => $failCount === 0,
];
echo wp_json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
exit($failCount === 0 ? 0 : 1);
