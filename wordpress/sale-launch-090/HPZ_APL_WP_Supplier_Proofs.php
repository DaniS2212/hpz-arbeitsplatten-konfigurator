<?php
/**
 * 0.9 manually maintained supplier proof store. No Speedmaster API required.
 * Closed by default. Only audited WP admins can save a proven EXACT variant.
 * Stored records never go to the public frontend, cart, or customer metadata.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_WP_Supplier_Proofs_09 {
    const OPTION = 'hpz_apl_supplier_verified_exact';
    const LIMIT = 500;

    public static function find($configurationKey) {
        if (!is_string($configurationKey) || !preg_match('/^[a-f0-9]{64}$/D',$configurationKey)) return null;
        $rows=get_option(self::OPTION,[]);
        if (!is_array($rows)) return null;
        return isset($rows[$configurationKey]) && is_array($rows[$configurationKey])
            ? $rows[$configurationKey] : null;
    }

    /**
     * Admin proves the chosen geometry via a manually checked Speedmaster
     * quotation and provides shipping dimensions measured on a REAL parcel.
     * No estimates, guessed dimensions or "approve all" setting.
     */
    public static function saveFromAdmin(array $raw, array $fields, $nonce) {
        if (!function_exists('current_user_can') || !current_user_can('manage_options')
            || !current_user_can('manage_woocommerce')
            || !is_string($nonce) || !wp_verify_nonce($nonce,'hpz_apl_supplier_proof_090')) {
            throw new InvalidArgumentException('Keine Berechtigung zur Lieferantenfreigabe.');
        }
        $normalized=HPZ_APL_Price_Preview::normalize($raw);
        $key=HPZ_APL_Straight_Sale_Readiness::configurationKey($normalized);
        $cost=self::strictInt($fields['supplierNetCents'] ?? null, 1, 50000000, 'Netto-EK');
        $weight=self::strictInt($fields['packedWeightGrams'] ?? null, 100, 250000, 'Paketgewicht');
        $package=[
            'length'=>self::strictInt($fields['packageLengthMm'] ?? null, 1, 100000, 'Paketlänge'),
            'width'=>self::strictInt($fields['packageWidthMm'] ?? null, 1, 100000, 'Paketbreite'),
            'height'=>self::strictInt($fields['packageHeightMm'] ?? null, 1, 100000, 'Pakethöhe'),
        ];
        $qty=self::strictInt($fields['maxQuantity'] ?? null, 1, 1000, 'Freigegebene Menge');
        $reference=trim((string)($fields['supplierReference'] ?? ''));
        if (!preg_match('/^[\p{L}\p{N} _.:\/#-]{4,128}$/uD',$reference)) {
            throw new InvalidArgumentException('Speedmaster-Referenz fehlt oder ist ungültig.');
        }
        $rates=isset($fields['shippingRateIds']) && is_string($fields['shippingRateIds'])
            ? explode(',', $fields['shippingRateIds']) : [];
        $rates=array_values(array_unique(array_map('trim',$rates)));
        if (count($rates)<1 || count($rates)>12) {
            throw new InvalidArgumentException('Freigegebene WooCommerce-Versandart fehlt.');
        }
        foreach($rates as $r) {
            if (!preg_match('/^[A-Za-z0-9_:-]{3,64}$/D',$r)) {
                throw new InvalidArgumentException('Ungültige Versandart-ID.');
            }
        }
        $proof=[
            'configurationKey'=>$key,
            'supplier'=>'speedmaster',
            'manufacturable'=>true,
            'materialAndDecorAvailable'=>true,
            'supplierReference'=>$reference,
            'supplierNetCents'=>$cost,
            'maxQuantity'=>$qty,
            'checkedOn'=>gmdate('Y-m-d'),
            'shippingPartLengthsMm'=>[$normalized['dimensions']['L1']],
            'packedWeightGrams'=>$weight,
            'packageDimensionsMm'=>$package,
            'approvedShippingRateIds'=>$rates,
        ];
        // Reuse 0.7's EXPLICIT same-variant/date/weight/parcel proof rules.
        $review=HPZ_APL_Straight_Sale_Readiness::review($raw,[$key=>$proof],[]);
        if (in_array('supplier-proof-missing-or-expired',$review['blockers'],true)
            || in_array('supplier-quantity-not-confirmed',$review['blockers'],true)) {
            throw new InvalidArgumentException('Lieferantennachweis unvollständig.');
        }
        // Minimal margin before coupons. Checkout rechecks discounts in real WC.
        $quote=HPZ_APL_Price_V3::quote($normalized);
        $inbound=HPZ_APL_Price_V3::inboundCostForVerifiedParts([$normalized['dimensions']['L1']]);
        $net=(int)round($quote['unitGrossReferenceCents']/1.19);
        $margin=HPZ_APL_Price_V3::checkNetMargin($cost,$inbound,$net);
        if (!$margin['passesMinimum35']) {
            throw new InvalidArgumentException('Die Grundkalkulation unterschreitet die Mindestmarge.');
        }

        $current=get_option(self::OPTION,[]);
        if (!is_array($current)) $current=[];
        if (!isset($current[$key]) && count($current)>=self::LIMIT) {
            throw new InvalidArgumentException('Maximale Anzahl an Einzelfreigaben erreicht.');
        }
        $current[$key]=$proof;
        if (!update_option(self::OPTION,$current,false)) {
            // WP update_option returns false when the new value is identical.
            if (self::find($key)!==$proof) throw new RuntimeException('Freigabe konnte nicht gespeichert werden.');
        }
        return ['configurationKey'=>$key,'decor'=>$normalized['decor'],'lengthMm'=>$normalized['dimensions']['L1'],
            'depthMm'=>$normalized['dimensions']['B1'],'expiresOn'=>gmdate('Y-m-d',time()+29*86400)];
    }

    public static function revokeFromAdmin($key,$nonce) {
        if (!is_string($key) || !preg_match('/^[a-f0-9]{64}$/D',$key)
            || !current_user_can('manage_options') || !current_user_can('manage_woocommerce')
            || !is_string($nonce) || !wp_verify_nonce($nonce,'hpz_apl_supplier_proof_090')) {
            throw new InvalidArgumentException('Keine Berechtigung zur Sperrung.');
        }
        $rows=get_option(self::OPTION,[]);
        if (!is_array($rows) || !isset($rows[$key])) return false;
        unset($rows[$key]);
        return update_option(self::OPTION,$rows,false);
    }

    private static function strictInt($v,$min,$max,$label) {
        if ((!is_string($v)&&!is_int($v)) || !preg_match('/^[0-9]{1,9}$/D',(string)$v)) {
            throw new InvalidArgumentException($label.': Ganzzahl erforderlich.');
        }
        $n=(int)$v;
        if ($n<$min || $n>$max) throw new InvalidArgumentException($label.': Wert außerhalb des Bereichs.');
        return $n;
    }
}
