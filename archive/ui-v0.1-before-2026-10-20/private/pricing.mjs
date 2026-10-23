// PRIVATE: never serve this module or its data to the browser.
// Exact observed points only. A reference is not a manufacturing/availability approval.
const rows=[
 ['straight',[2000,600],'APL17.5','144.99'],['straight',[2000,600],'APL38','243.11'],['straight',[2000,700],'APL17.5','165.80'],
 ['L1',[2000,1200,600,600],'APL17.5','307.67'],['L1',[2000,1200,600,600],'APL38','464.45'],
 ['L1',[2500,1200,600,600],'APL17.5','342.41'],['L1',[2500,1200,600,600],'APL38','511.56'],
 ['U1',[2000,1200,1800,600,600,600],'APL17.5','459.29'],['U1',[2000,1200,1800,600,600,600],'APL38','691.49'],
 ['U1',[2500,1200,1800,600,600,600],'APL17.5','494.03'],['U1',[2500,1200,1800,600,600,600],'APL38','738.59'],
 ['U1',[2500,1700,1800,600,600,600],'APL17.5','528.76'],['U1',[2500,1700,1800,700,600,600],'APL17.5','539.90'],
 ['U1',[2500,1700,1800,600,600,600],'APL38','785.69'],['U1',[2500,1700,1800,700,600,600],'APL38','767.12']
];
export function referencePrice(c) {
  if(c.corner!=='square' || c.edge!=='matching-1.5' || c.decor!=='W980') return null;
  const fields=c.product==='straight'?['L1','B1']:c.product==='l'?['L1','L2','B1','B2']:['L1','L2','L3','B1','B2','B3'];
  const match=rows.find(([id,dims,material])=>id===c.geometry && material===c.material && dims.every((v,i)=>v===c.dimensions[fields[i]]));
  return match?{net:match[3],version:'user-references-2026-10-19-v1',status:'reference-only'}:null;
}
function decimal(integer,places) {
  const value=integer.toString().padStart(places+1,'0');
  return `${value.slice(0,-places)}.${value.slice(-places)}`;
}
export function calculate(supplierNet,shippingLengthsMm,quantity=1) {
  if(typeof supplierNet!=='string' || !/^\d{1,8}\.\d{2}$/.test(supplierNet) || BigInt(supplierNet.replace('.',''))<=0n)
    throw new Error('Lieferantenpreis muss ein positiver EUR-Betrag mit zwei Nachkommastellen sein.');
  if(!Number.isSafeInteger(quantity) || quantity<1 || quantity>1000) throw new Error('Ungültige Menge.');
  if(!Array.isArray(shippingLengthsMm) || !shippingLengthsMm.length || shippingLengthsMm.some(v=>!Number.isSafeInteger(v)||v<=0))
    throw new Error('Bestätigte Versandteilmaße fehlen.');
  const inbound=shippingLengthsMm.some(v=>v>=1900)?6000n:1000n; // EUR cents, once per configured unit.
  const unit=BigInt(supplierNet.replace('.',''))*130n+inbound*100n; // EUR in 1/10000, no intermediate rounding.
  const total=unit*BigInt(quantity);
  return {unitNet:decimal(unit,4),totalNet:decimal(total,4),inboundTotal:decimal(inbound*BigInt(quantity),2),
    deGrossIllustration:decimal((total*119n+5000n)/10000n,2)};
}
export function widthTier(widthMm) {
  if(!Number.isSafeInteger(widthMm)||widthMm<=0) throw new Error('Ungültige Teilbreite.');
  return widthMm<=880?'normal':'large';
}
// Provider interface is private and injected in code, never selected or approved by a request.
// Future providers must return {net, version, status} or null. No extrapolation here.
export function quote(config,provider=referencePrice) {
  const reference=provider(config);
  return {purchasable:false,price:null,referenceMatched:reference!==null,
    ruleVersion:reference?.version??null,
    blockers:['local-only','geometry-unverified','shipping-parts-unverified','availability-unverified','weight-unverified','checkout-unverified',
      ...(reference?['price-reference-only']:['price-range-unverified'])],
    customerShipping:'Zusätzlich nach den bestehenden WooCommerce-Versandregeln.'};
}
