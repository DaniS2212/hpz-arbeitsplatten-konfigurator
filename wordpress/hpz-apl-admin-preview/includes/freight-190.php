<?php
/**
 * 190 cm customer delivery gate, separate from the 10/60 EUR internal
 * procurement cost. Never invents shipping charges, parcel dimensions,
 * approved Woo rate IDs, or operator approvals.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_WP_Freight_190
{
    public const OPTION = 'hpz_apl_freight_190_v1';
    private const IDS = [
        1000083 => 'hpz_apl_v08',
        1000080 => 'hpz_apl_lu_v1',
        1000081 => 'hpz_apl_lu_v1',
    ];

    /** null = unknown/unverified signed config; false = below threshold. */
    public static function requiresFreight(array $line): ?bool
    {
        $id = $line['product_id'] ?? null;
        if (!is_numeric($id) || !isset(self::IDS[(int)$id])) return false;
        $snapshot = $line[self::IDS[(int)$id]] ?? null;
        if (!is_array($snapshot) || !is_array($snapshot['config'] ?? null)) return null;
        $config = $snapshot['config'];
        if (($config['productId'] ?? (int)$id) !== (int)$id
            || !is_array($config['dimensions'] ?? null)) return null;
        $dims = $config['dimensions'];
        if (!isset($dims['L1']) || !is_int($dims['L1']) || $dims['L1']<=0) return null;
        foreach (['L1','L2','L3'] as $key) {
            if (!array_key_exists($key,$dims)) continue;
            $len=$dims[$key];
            if (!is_int($len) || $len<=0) return null;
            if ($len>=1900) return true;
        }
        return false;
    }

    public static function shippingPolicy(): ?array
    {
        $policy=get_option(self::OPTION,[]);
        if (!is_array($policy) || ($policy['confirmed']??null)!==true
            || !is_array($policy['rate_ids']??null)
            || count($policy['rate_ids'])===0 || count($policy['rate_ids'])>12
            || !is_int($policy['minimum_cents']??null)
            || $policy['minimum_cents']<1
            || $policy['minimum_cents']>10000000) return null;
        foreach ($policy['rate_ids'] as $id) {
            if (!is_string($id) || !preg_match('/^[A-Za-z0-9_:-]{3,64}$/D',$id)) return null;
        }
        return $policy;
    }

    /** One configured freight method at the intended customer freight price. */
    public static function approved(array $line,string $rateId,int $shippingCents): bool
    {
        $needed=self::requiresFreight($line);
        if ($needed===false) return true;
        if ($needed!==true) return false;
        $policy=self::shippingPolicy();
        return $policy!==null
            && in_array($rateId,$policy['rate_ids'],true)
            && $shippingCents >= $policy['minimum_cents'];
    }

    /** Hide ordinary parcel methods for worktops >= 190 cm in real Woo packages. */
    public static function rates($rates,$package)
    {
        if (!is_array($rates) || !is_array($package)) return $rates;
        $long=false;
        foreach (($package['contents']??[]) as $line) {
            if (!is_array($line)) continue;
            $state=self::requiresFreight($line);
            if ($state===null) return []; // No anonymous price/size fallback.
            if ($state===true) $long=true;
        }
        if (!$long) return $rates;
        $policy=self::shippingPolicy();
        if ($policy===null) return [];
        foreach ($rates as $id=>$rate) {
            $id=(string)$id;
            $cost=is_object($rate) && method_exists($rate,'get_cost')
                ?$rate->get_cost():null;
            if (!in_array($id,$policy['rate_ids'],true)
                || !is_numeric($cost)
                || (int)round((float)$cost*100,0,PHP_ROUND_HALF_UP)<$policy['minimum_cents']) {
                unset($rates[$id]);
            }
        }
        return $rates;
    }

    /**
     * Saved manually by authorized shop operators only.
     * No default or fake shipping amounts; policy is invalid until verified.
     */
    public static function sanitize($input): array
    {
        if (!function_exists('current_user_can')
            || !current_user_can('manage_options')
            || !current_user_can('manage_woocommerce')
            || !is_array($input)) return [];
        $raw = $input['rate_ids']??'';
        $rates = is_string($raw) ? array_values(array_unique(array_filter(
            array_map('trim',explode(',',$raw))))) : [];
        $minimum = $input['minimum_eur']??'';
        if (!is_string($minimum) || !preg_match('/^[0-9]{1,5}(?:[,.][0-9]{1,2})?$/D',$minimum)
            || !$rates || count($rates)>12) return [];
        $value=str_replace(',','.',$minimum);
        [$eur,$cents]=array_pad(explode('.',$value,2),2,'0');
        $min=(int)$eur*100+(int)str_pad($cents,2,'0');
        if ($min<1 || $min>10000000) return [];
        foreach ($rates as $r) if (!preg_match('/^[A-Za-z0-9_:-]{3,64}$/D',$r)) return [];
        return [
            'confirmed'=>($input['confirmed']??null)==='1',
            'rate_ids'=>$rates,
            'minimum_cents'=>$min,
        ];
    }
}
