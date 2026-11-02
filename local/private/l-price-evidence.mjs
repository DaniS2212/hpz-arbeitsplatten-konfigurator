/**
 * PRIVATE RESEARCH ONLY. Do not expose this module through the WordPress
 * bundle, shop API, public pricing output or any checkout pathway.
 *
 * The four entries are observed Speedmaster NET EK values for fully edged
 * W980 L1 examples. They prove neither availability nor actual shipping
 * parts, CNC geometry, dynamic price rules, or any other L shape.
 */
const observed=[
 {referenceId:'l1_200_120_175',lengthMm:2000,material:'APL17.5',supplierNetCents:30767},
 {referenceId:'l1_200_120_38',lengthMm:2000,material:'APL38',supplierNetCents:46445},
 {referenceId:'l1_250_120_175',lengthMm:2500,material:'APL17.5',supplierNetCents:34241},
 {referenceId:'l1_250_120_38',lengthMm:2500,material:'APL38',supplierNetCents:51156}
];
const witness=(item)=>Object.freeze({
 referenceId:item.referenceId,
 geometry:'L1',
 product:'l',
 material:item.material,
 decor:'W980',
 edge:'matching-1.5',
 dimensions:Object.freeze({L1:item.lengthMm,L2:1200,B1:600,B2:600}),
 supplierNetCents:item.supplierNetCents,
 status:'observed-net-ek-reference-only',
 source:'docs/price-reference-cases.csv'
});
export const L_COST_WITNESSES=Object.freeze(observed.map(witness));

const sameKeys=(a,b)=>a&&typeof a==='object'&&!Array.isArray(a)
 &&Object.keys(a).length===Object.keys(b).length
 &&Object.entries(b).every(([k,v])=>a[k]===v);
const noCorner=(c)=>c?.corner==='square'
 &&c?.lCorner?.side==='none'&&c.lCorner.treatment===null
 &&sameKeys(c.lCorner.parameters,{});
/**
 * Match the FULL source configuration. No partial or nearest-neighbor price.
 * An edge setting absent from a normalized raw config cannot be used as proof.
 */
export function matchLReference(config) {
 if(config?.product!=='l'||config?.geometry!=='L1'||config?.unit!=='mm'
    ||config?.schemaVersion!==2||!noCorner(config))return null;
 const found=L_COST_WITNESSES.find(reference=>
   config.material===reference.material
   &&config.decor===reference.decor
   &&config.edge===reference.edge
   &&sameKeys(config.dimensions,reference.dimensions));
 return found??null;
}
const ceilDiv=(num,den)=>(num+den-1n)/den;

/**
 * NON-BINDING budgeting scenario. The inbound amount is an explicitly
 * assumed net cost, not an actual freight/packing proof. For unknown
 * configurations no unit or total gross price is returned.
 *
 * 10% cost reserve, target 40% net margin, simulated German 19% VAT,
 * round gross customer-facing hypothetical unit UP to full 10 EUR.
 * This tool must not be called by WooCommerce or public quote().
 */
export function simulateLPriceScenario(config,{assumedInboundNetCents}={}) {
 if(!Number.isSafeInteger(assumedInboundNetCents)||assumedInboundNetCents<0
     ||assumedInboundNetCents>100000000)
   throw Error('Kosten-Annahme netto: einen zulässigen positiven oder null Euro-Cent-Betrag angeben.');
 const evidence=matchLReference(config);
 const base={
  currency:'EUR',
  taxMode:'DE-19-percent-simulation-only',
  assumedInboundNetCents,
  manufacturingReady:false,
  shippingPartsVerified:false,
  pricingReady:false,
  purchasable:false,
  source:'private-research-only',
  evidence:'exact-speedmaster-witness-only',
  warnings:['Kein Angebot: Beschaffung und Versand nur angenommen; L-Form nicht kaufbar.',
    'Keine allgemeine Lieferantenpreisfunktion oder Produktionsfreigabe.']
 };
 if(!evidence)return {...base,status:'blocked',referenceId:null,
   unitGrossCents:null,totalGrossCents:null};
 if(!Number.isSafeInteger(config.quantity)||config.quantity<1||config.quantity>1000)
   throw Error('Ungültige Anzahl in der internen Kosten-Annahme.');
 const net=BigInt(evidence.supplierNetCents)+BigInt(assumedInboundNetCents);
 const budget=ceilDiv(net*110n,100n);
 const gross=ceilDiv(budget*119n,60n);
 const rounded=ceilDiv(gross,1000n)*1000n;
 return {...base,status:'scenario-only',referenceId:evidence.referenceId,
   unitGrossCents:Number(rounded),
   totalGrossCents:Number(rounded*BigInt(config.quantity))};
}
