<?php
/**
 * Operator price candidates for a deliberately LIMITED L1/U1 shop pilot.
 *
 * Source: owner-confirmed Speedmaster NET prices of 06.11.2026 in the
 * repository price register. No extrapolation, mixed axes, fabricated
 * supplier quotations or new WooCommerce tax/margin algorithm.
 *
 * This class cannot activate sales. WordPress must supply an explicit
 * operator-approved price policy and release the Woo product separately.
 */
declare(strict_types=1);

final class HPZ_APL_LU_Shop_Ratebook_12
{
    public const VERSION = 'lu-ratebook-w980-h1145-20261106-v1';

    private const ANCHORS = [
        'L1' => [
            'W980' => [
                'APL17.5' => [2000 => 30767, 2500 => 34241],
                'APL38' => [2000 => 46445, 2500 => 51156],
            ],
            'H1145' => [
                'APL17.5' => [2000 => 31153, 2500 => 34693],
                'APL38' => [2000 => 46872, 2500 => 51649],
            ],
        ],
        'U1' => [
            'W980' => [
                'APL17.5' => [2000 => 45929, 2500 => 49403],
                'APL38' => [2000 => 69149, 2500 => 73859],
            ],
            'H1145' => [
                'APL17.5' => [2000 => 46434, 2500 => 49974],
                'APL38' => [2000 => 69655, 2500 => 74432],
            ],
        ],
    ];

    /** Only L1 can vary; all other standard dimensions must match exactly. */
    public static function candidate(array $c): ?array
    {
        $shape = $c['geometry'] ?? null;
        $decor = $c['decor'] ?? null;
        $material = $c['material'] ?? null;
        $d = $c['dimensions'] ?? null;
        if (!is_string($shape) || !is_string($decor) || !is_string($material)
            || !is_array($d)
            || !isset(self::ANCHORS[$shape][$decor][$material])
            || ($c['corner'] ?? null) !== 'square'
            || ($c['edge'] ?? null) !== 'matching-1.5') return null;

        $fixed = $shape === 'L1'
            ? ['L2'=>1200,'B1'=>600,'B2'=>600]
            : ['L2'=>1200,'L3'=>1800,'B1'=>600,'B2'=>600,'B3'=>600];
        if (count($d) !== count($fixed)+1 || !is_int($d['L1'] ?? null)) return null;
        foreach ($fixed as $key=>$value) {
            if (($d[$key] ?? null) !== $value) return null;
        }
        $length = $d['L1'];
        if ($length < 2000 || $length > 2500) return null;
        $a = self::ANCHORS[$shape][$decor][$material];
        $delta = $a[2500] - $a[2000];
        // Conservative integer-cent interpolation, rounded UP.
        $netCents = $a[2000] + intdiv($delta*($length-2000)+499,500);
        return [
            'supplierNetCents'=>$netCents,
            'source'=>'docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv',
            'priceBasis'=>($length===2000 || $length===2500)
                ? 'owner-confirmed-net-anchor' : 'bounded-interpolated-net-candidate',
            'priceWindow'=>'L1 2000..2500 mm; other dimensions fixed',
            'ratebookVersion'=>self::VERSION,
        ];
    }

    /**
     * Build a trusted server-side *candidate proof* from an explicit WP
     * administrator policy, never from the customer's configuration JSON.
     * No manufacturing or packaging assertion is made.
     */
    public static function operatorProof(array $c, array $policy): ?array
    {
        $candidate = self::candidate($c);
        if ($candidate === null
            || ($policy['model_price_approved'] ?? null) !== true
            || !is_int($policy['other_cost_net_cents'] ?? null)
            || $policy['other_cost_net_cents'] < 0
            || $policy['other_cost_net_cents'] > 10000000
            || !is_int($policy['max_quantity'] ?? null)
            || $policy['max_quantity'] < 1 || $policy['max_quantity'] > 1000
            || !is_string($policy['price_approved_on'] ?? null)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/D',$policy['price_approved_on'])
            || !is_array($policy['approved_shipping_rate_ids'] ?? null)) return null;

        $rates=$policy['approved_shipping_rate_ids'];
        if (count($rates)<1 || count($rates)>12) return null;
        foreach ($rates as $rate) {
            if (!is_string($rate) || !preg_match('/^[A-Za-z0-9_:-]{3,64}$/D',$rate)) return null;
        }
        return [
            'configurationKey'=>HPZ_APL_LU_Price_Readiness::configurationKey($c),
            'supplier'=>'speedmaster',
            'pricingBasis'=>'operator-priced-lu-ratebook-v1',
            'operatorPriceApproved'=>true,
            'priceEvidenceType'=>$candidate['priceBasis'],
            'priceModelVersion'=>self::VERSION,
            'supplierReference'=>'HPZ-INTERNES-PREISREGISTER-20261106',
            'supplierNetCents'=>$candidate['supplierNetCents'],
            'maxQuantity'=>$policy['max_quantity'],
            'checkedOn'=>$policy['price_approved_on'],
            'packagingNetCents'=>0,
            'outboundNetCostCents'=>$policy['other_cost_net_cents'],
            'paymentAndHandlingNetCents'=>0,
            'approvedShippingRateIds'=>array_values(array_unique($rates)),
            // Actual Speedmaster cut and package pieces remain unknown.
            'verifiedCutParts'=>[],
            'verifiedPackages'=>[],
        ];
    }
}
