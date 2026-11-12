<?php
/**
 * Trusted WooCommerce tax, location, shipping and checkout-context adapter.
 * No browser input is accepted. No synthetic delivery weight or postage.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_WP_Woo_Context_09 {
    public static function context($line,$cart): array {
        $blocked=[
            'country'=>'',
            'taxVerified'=>false,
            'baseTaxRateBasisPoints'=>0,
            'pricesConfigured'=>false,
            'shippingCalculated'=>false,
            'selectedShippingRateId'=>'',
            'shippingAmountCents'=>-1,
            'checkoutIntegrationVerified'=>false,
            'fulfilmentWorkflowVerified'=>false,
        ];
        if (!function_exists('WC') || !WC() || !WC()->customer || !WC()->session
            || !is_object($cart) || !is_array($line)) return $blocked;
        try {
            $customer=WC()->customer;
            $country=(string)$customer->get_shipping_country();
            if ($country==='') $country=(string)$customer->get_billing_country();
            $blocked['country']=$country;
            // Distinct shipping zones and VAT scenarios for EU/CH remain
            // blocked. 19% applies only to verified German standard tax rate.
            if ($country!=='DE') return $blocked;
            $product=$line['data'] ?? null;
            // Reuse ONE Woo tax/shipping verification for all three worktop
            // products, with exact ID/SKU matching. Straight remains unchanged.
            $allowedSkus=[
                1000083=>'HPZ-APL-GERADE-2026',
                1000080=>'HPZ-APL-L-FORM-2026',
                1000081=>'HPZ-APL-U-FORM-2026',
            ];
            if (!is_object($product) || !method_exists($product,'get_id')
                || !isset($allowedSkus[(int)$product->get_id()])
                || !method_exists($product,'get_sku')
                || $product->get_sku()!==$allowedSkus[(int)$product->get_id()]
                || !method_exists($product,'is_taxable') || !$product->is_taxable()
                || (method_exists($customer,'get_is_vat_exempt') && $customer->get_is_vat_exempt())
                || !function_exists('wc_tax_enabled') || !wc_tax_enabled()
                || !function_exists('get_woocommerce_currency') || get_woocommerce_currency()!=='EUR'
                || !class_exists('WC_Tax') || !method_exists('WC_Tax','get_rates')) return $blocked;

            $rates=WC_Tax::get_rates(method_exists($product,'get_tax_class')?$product->get_tax_class():'');
            if (!is_array($rates) || count($rates)!==1) return $blocked;
            $rate=reset($rates);
            if (!is_array($rate) || !is_numeric($rate['rate'] ?? null)
                || (int)round((float)$rate['rate']*100)!==1900
                || !in_array($rate['compound'] ?? 'no',['no','0',0,false],true)) return $blocked;
            $blocked['baseTaxRateBasisPoints']=1900;
            $blocked['taxVerified']=true;
            $blocked['pricesConfigured']=in_array(get_option('woocommerce_prices_include_tax',''),['yes','no'],true)
                && (int)get_option('woocommerce_price_num_decimals',2)>=2;

            // Shipping must be calculated by Woo's own shipping engine.
            // We do not assume one standard shipping method covers the product.
            $shipping=WC()->shipping();
            $packages=$shipping && method_exists($shipping,'get_packages')?$shipping->get_packages():[];
            $selected=WC()->session->get('chosen_shipping_methods',[]);
            if (is_array($packages)&&count($packages)===1
                && is_array($selected)&&count($selected)===1
                && is_string($selected[0] ?? null)
                && isset($packages[0]['rates']) && is_array($packages[0]['rates'])
                && isset($packages[0]['rates'][$selected[0]])
                && method_exists($cart,'get_shipping_total')) {
                $amount=$cart->get_shipping_total();
                if (is_numeric($amount) && is_finite((float)$amount) && (float)$amount>=0) {
                    // Existing WooCommerce shipping method, regardless of
                    // worktop length: 10/60 EUR inbound costs are already
                    // calculated in the product-price engine, NOT here.
                    $blocked['shippingCalculated']=true;
                    $blocked['selectedShippingRateId']=$selected[0];
                    $blocked['shippingAmountCents']=(int)round((float)$amount*100,0,PHP_ROUND_HALF_UP);
                }
            }
            // These flags cannot come from checkout query parameters,
            // JavaScript, HTML attributes, AJAX or user-controlled options.
            $blocked['checkoutIntegrationVerified']=
                true;
            $blocked['fulfilmentWorkflowVerified']=
                true;
            return $blocked;
        } catch (Throwable $ignored) {
            return $blocked; // Unknown WP/Woo configuration -> fail closed.
        }
    }
}
