/**
 * PRIVATE internal L/U commercial what-if analysis (not used by WordPress).
 * Source data remain exact-only. Screenshot display is NOT automatically
 * a verified supplier net price, and scenario shipping is NOT a real parcel.
 * This module is intentionally absent from build-plugin.mjs, Woo hooks and UI.
 */
import {referencePrice} from './pricing.mjs';

const newUImageAmounts=Object.freeze({U2:68736,U3:69149,U4:69149});
const exactU=Object.freeze({L1:2000,L2:1200,L3:1800,B1:600,B2:600,B3:600});
const euroCents=str=>Number(str.replace('.',''));
function supplierSource(c){
 if(!c||c.schemaVersion!==2||c.unit!=='mm'||!['l','u'].includes(c.product)
  ||c.corner!=='square'||c.edge!=='matching-1.5')return null;
 if(c.product==='l'&&c.lCorner?.side!=='none')return null;
 const confirmed=referencePrice(c);
 if(confirmed?.net&&/^\d+\.\d{2}$/.test(confirmed.net))return {
  assumedSupplierNetCents:euroCents(confirmed.net),
  priceEvidence:'confirmed-exact-net-reference',isNetSupplierPriceVerified:true};
 if(c.product!=='u'||!(c.geometry in newUImageAmounts)
  ||c.material!=='APL38'||c.decor!=='W980'
  ||Object.entries(exactU).some(([key,val])=>c.dimensions?.[key]!==val))return null;
 return {
  assumedSupplierNetCents:newUImageAmounts[c.geometry],
  priceEvidence:'speedmaster-screen-eur-net-treatment-unverified',isNetSupplierPriceVerified:false};
}
const ceilDivide=(top,bottom)=>Math.floor((top+bottom-1)/bottom);
const upToTenEuros=cents=>ceilDivide(cents,1000)*1000;
/**
 * `inboundNetCents` and `otherNetCents` are both explicit scenario inputs,
 * never taken from client config or guessed as verified logistics costs.
 * Uses 10% reserve, margin on NET revenue, 19% DE reference VAT, then rounds
 * gross price UP to the next EUR 10 (never down).
 * Not a pricing provider, offer, Woo quote or sale approval.
 */
export function luPriceScenario(config,{inboundNetCents,otherNetCents}={}){
 if(!Number.isSafeInteger(inboundNetCents)||inboundNetCents<0||inboundNetCents>10000000
  ||!Number.isSafeInteger(otherNetCents)||otherNetCents<0||otherNetCents>10000000)
  throw new Error('Scenario must explicitly provide nonnegative inbound AND other net costs (cents).');
 const source=supplierSource(config);
 if(!source)return null; // Unknown SKU, dimensions, decor or material: never extrapolate.
 const assumedNetCostCents=source.assumedSupplierNetCents+inboundNetCents+otherNetCents;
 const grossCents40=upToTenEuros(ceilDivide(assumedNetCostCents*11*119,600));
 const grossCents35=upToTenEuros(ceilDivide(assumedNetCostCents*11*119,650));
 // 10% reserve applied to SUPPLIER + INBOUND + OTHER before margin.
 const bufferedMarginAt40=100*(1-1.1*assumedNetCostCents/(grossCents40/1.19));
 return {
  status:'private-assumption-only',geometry:config.geometry,
  priceEvidence:source.priceEvidence,isNetSupplierPriceVerified:source.isNetSupplierPriceVerified,
  assumedSupplierNetCents:source.assumedSupplierNetCents,
  assumedInboundNetCents:inboundNetCents,assumedOtherNetCents:otherNetCents,
  reservedCostsPct:10,targetMarginPct:40,minimumMarginPct:35,referenceGermanVatPct:19,
  targetGrossScenarioCents:grossCents40,minimum35GrossScenarioCents:grossCents35,
  bufferedMarginAtTargetPct:Number(bufferedMarginAt40.toFixed(2)),
  grossRoundingStepCents:1000,
  missingProofs:['real-inbound-parts-and-cost','outbound-customer-shipping-and-packaging',
   'dekor-and-thickness-availability','full-supplier-price-grid','woocommerce-tax-and-coupon-validation',
   ...(source.isNetSupplierPriceVerified?[]:['supplier-displayed-price-net-confirmation']),
   'human-supplier-and-shop-approval'],
  purchasable:false,approvedCustomerPrice:false
 };
}
