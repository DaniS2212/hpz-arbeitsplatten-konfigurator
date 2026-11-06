<?php
/**
 * Administrators only: preview all modeled L/U gross prices without releasing
 * ANY purchasable WooCommerce product. This file registers NO hooks. The
 * authenticated/nonced WP route must be added by the host plugin.
 *
 * A commercial cost estimate is never a verified supplier invoice, and a
 * preview of 0 additional business costs is NOT an operator approval of 0.
 */
defined('ABSPATH') || exit;

final class HPZ_APL_LU_Admin_Price_Preview_13
{
    public static function quote(array $raw,string $shippingCountry='',array $privateCostOption=[]): array
    {
        $id=$raw['productId'] ?? null;
        $sku=($id===1000080?'HPZ-APL-L-FORM-2026'
            :($id===1000081?'HPZ-APL-U-FORM-2026':null));
        if($sku===null || ($raw['sku']??null)!==$sku)
            throw new InvalidArgumentException('Produkt oder SKU nicht für die L-/U-Preisvorschau freigegeben.');
        $c=HPZ_APL_LU_Price_Readiness::normalize($raw);
        if(isset($c['lCorner'])){
            $candidate=HPZ_APL_LU_Shop_Ratebook_12::cornerCandidate($c,true);
        }else{
            $candidate=HPZ_APL_LU_Shop_Ratebook_12::candidate($c);
            if($candidate===null)$candidate=HPZ_APL_LU_Shop_Ratebook_12::extendedCandidate($c);
        }
        if($candidate===null)
            throw new InvalidArgumentException('Für diese Maße oder Bearbeitung liegt noch kein kalkulierbarer L-/U-Preis vor.');
        $cost=$privateCostOption['other_cost_net_cents']??null;
        $verifiedOtherCost=is_int($cost)&&$cost>=0&&$cost<=10000000;
        $other=$verifiedOtherCost?$cost:0;
        $inbound=HPZ_APL_LU_Shop_Ratebook_12::configuredInboundCents($c);
        $unit=HPZ_APL_Price_V3::targetGrossForVerifiedCosts(
            $candidate['supplierNetCents'],$inbound,$other
        );
        $source=$candidate['priceBasis'];
        $direct=in_array($source,
            ['confirmed-net-reference','operator-confirmed-single-corner-reference'],true);
        $origin=$direct?'Auf einer Speedmaster-Referenz basierender Preis'
            :'Kaufmännischer Modellpreis (noch nicht durch Speedmaster bestätigt)';
        $costNote=$verifiedOtherCost
            ?'Zusatzkosten laut hinterlegtem Admin-Kostenansatz berücksichtigt.'
            :'Zusatzkosten vorläufig 0 € für die unverbindliche Vorschau; vor Shopfreigabe bestätigen.';
        $tax=$shippingCountry==='DE'
            ?'DE-Bruttopreis inkl. 19 % MwSt. · Kundenversand im Checkout separat'
            :'Deutscher Brutto-Referenzpreis · tatsächliche Steuern und Versand im Checkout';
        return [
            'ruleVersion'=>HPZ_APL_LU_Shop_Ratebook_12::VERSION,
            'status'=>'calculated-not-sale-approved',
            'currency'=>'EUR',
            'unitGrossReferenceCents'=>$unit,
            'totalGrossReferenceCents'=>$unit*$c['quantity'],
            'quantity'=>$c['quantity'],
            'purchasable'=>false,
            'taxNote'=>$tax,
            'availabilityNote'=>$origin.'. '.$costNote.' Preisvorschau, keine Bestellung.',
        ];
    }
}
