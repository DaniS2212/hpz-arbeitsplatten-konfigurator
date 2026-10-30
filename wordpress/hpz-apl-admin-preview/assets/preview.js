import {normalize} from './core/config.js?v=1.0.3';
import {geometry} from './core/geometry.js?v=1.0.3';
import {resolveProduct} from './core/products.js?v=1.0.3';
// Preview geometry renders immediately; only the PHP engine supplies prices.
function settleInput(signal,waitMs=180) {
  return new Promise((resolve,reject)=>{
    if(signal?.aborted)return reject(new DOMException('Abgebrochen','AbortError'));
    const cancel=()=>{clearTimeout(timer);reject(new DOMException('Abgebrochen','AbortError'));};
    const timer=setTimeout(()=>{signal?.removeEventListener('abort',cancel);resolve();},waitMs);
    signal?.addEventListener('abort',cancel,{once:true});
  });
}
const unavailable=(visual,message='Preisprüfung momentan nicht erreichbar. Bitte „Preis erneut berechnen“ wählen.')=>({
  ...visual,quote:{status:'unavailable',purchasable:false,message}
});
async function postQuote(endpoint,nonce,request,signal) {
  const own=new AbortController();
  const cancel=()=>own.abort();
  signal?.addEventListener('abort',cancel,{once:true});
  if(signal?.aborted)cancel();
  const timeout=setTimeout(cancel,6000);
  try{
    const response=await fetch(endpoint.href,{method:'POST',credentials:'same-origin',cache:'no-store',
      headers:{'Content-Type':'application/json','X-WP-Nonce':nonce},
      signal:own.signal,body:JSON.stringify(request)});
    // Invalid/expired nonce is not a temporary backend error. Do not retry.
    if(response.status===401||response.status===403)return {response,data:null};
    const data=await response.json();
    return {response,data};
  }finally{
    clearTimeout(timeout);
    signal?.removeEventListener('abort',cancel);
  }
}
export async function preview(raw,{signal,pricePreview,onVisual}={}) {
  const product=resolveProduct(raw);
  if(product.family!==raw.product)throw new Error('Produktfamilie passt nicht zum Produkt.');
  const config=normalize(raw);
  const drawing=geometry(config);
  const visual={config,geometry:drawing,quote:{purchasable:false,referenceMatched:false,ruleVersion:'admin-visual-only'}};
  onVisual?.(visual);
  if(product.family!=='straight'||!pricePreview?.url||!pricePreview?.nonce)return visual;
  try{
    await settleInput(signal);
    const endpoint=new URL(pricePreview.url,typeof location==='undefined'?undefined:location.href);
    if(typeof location!=='undefined'&&endpoint.origin!==location.origin)
      return unavailable(visual,'Ungültige Preisverbindung. Bitte Produktseite neu laden.');
    const request={schemaVersion:raw.schemaVersion,inputUnit:raw.inputUnit,productId:raw.productId,sku:raw.sku,
      product:raw.product,geometry:raw.geometry,corner:raw.corner,dimensions:raw.dimensions,
      straightCorner:raw.straightCorner,material:raw.material,decor:raw.decor,quantity:raw.quantity};
    for(let attempt=0;attempt<2;attempt++){
      if(signal?.aborted)return visual;
      try{
        const {response,data}=await postQuote(endpoint,pricePreview.nonce,request,signal);
        if(signal?.aborted)return visual;
        if(response.status===401||response.status===403)
          return unavailable(visual,'Die Preisprüfung wurde abgelehnt oder ist abgelaufen. Bitte Produktseite neu laden.');
        if(response.status===422)return {...visual,quote:{status:'unpriced',purchasable:false,
          message:data?.data?.message||'Diese Maße oder Bearbeitung sind nicht zulässig.'}};
        if(response.ok&&data?.success===true){
          const q=data.data?.quote;
          const trusted=(q?.status==='calculated-not-sale-approved'&&q.purchasable===false)
            ||(q?.status==='calculated-ready-for-cart'&&q.purchasable===true&&pricePreview.sale===true);
          if(!trusted||q.currency!=='EUR'
            ||!Number.isSafeInteger(q.unitGrossReferenceCents)||q.unitGrossReferenceCents<1
            ||!Number.isSafeInteger(q.totalGrossReferenceCents)
            ||q.totalGrossReferenceCents!==q.unitGrossReferenceCents*config.quantity
            ||q.quantity!==config.quantity)
            return unavailable(visual,'Die Preisantwort konnte nicht bestätigt werden. Bitte neu berechnen.');
          return {...visual,quote:q};
        }
        if(![429,500,502,503,504].includes(response.status))
          return unavailable(visual,data?.data?.message||'Preisprüfung gerade nicht verfügbar. Bitte erneut versuchen.');
      }catch(error){
        if(signal?.aborted)return visual;
        // Timeout, intermittent network or gateway response; retry once only.
        // No JS price fallback and no cart permission without a real PHP quote.
      }
      if(attempt===0)await settleInput(signal,240);
    }
    return unavailable(visual);
  }catch{
    if(signal?.aborted)return visual;
    return unavailable(visual);
  }
}
/** Only PHP WooCommerce can add a priced, signed cart item. */
export async function addConfigured(raw,cartConfig){
  if(!cartConfig?.url||!cartConfig?.nonce)throw new Error('Bestellfunktion nicht freigegeben.');
  const endpoint=new URL(cartConfig.url,location.href);
  if(endpoint.origin!==location.origin)throw new Error('Ungültiges Bestellziel.');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(endpoint.href,{method:'POST',credentials:'same-origin',cache:'no-store',
      headers:{'Content-Type':'application/json','X-WP-Nonce':cartConfig.nonce},
      signal:controller.signal,body:JSON.stringify(raw)});
    const result=await response.json();
    if(!response.ok||result?.success!==true)throw new Error(result?.data?.message||'Bestellung nicht möglich.');
    return result.data;
  }finally{clearTimeout(timeout);}
}
