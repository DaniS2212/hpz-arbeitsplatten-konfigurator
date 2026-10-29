import {normalize} from './core/config.js?v=1.0.1';
import {geometry} from './core/geometry.js?v=1.0.1';
import {resolveProduct} from './core/products.js?v=1.0.1';
// Geometry remains visual. Only the PHP endpoint may supply a V3 gross reference.
// Allow the slab drawing to become interactive immediately. Price calculation
// is a separate, cancellable WordPress request, never a geometry dependency.
function settleInput(signal,waitMs=180) {
  return new Promise((resolve,reject)=>{
    if(signal?.aborted)return reject(new DOMException('Abgebrochen','AbortError'));
    const cancel=()=>{clearTimeout(timer);reject(new DOMException('Abgebrochen','AbortError'));};
    const timer=setTimeout(()=>{
      signal?.removeEventListener('abort',cancel);
      resolve();
    },waitMs);
    signal?.addEventListener('abort',cancel,{once:true});
  });
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
    if(typeof location!=='undefined'&&endpoint.origin!==location.origin)throw new Error('Price endpoint origin mismatch.');
    const request={schemaVersion:raw.schemaVersion,inputUnit:raw.inputUnit,productId:raw.productId,sku:raw.sku,
      product:raw.product,geometry:raw.geometry,corner:raw.corner,dimensions:raw.dimensions,
      straightCorner:raw.straightCorner,material:raw.material,decor:raw.decor,quantity:raw.quantity};
    // Timeout prevents a stalled admin-ajax.php from leaving the price loading
    // forever. Aborting the previous choice also releases its network slot.
    const priceController=new AbortController();
    const parentAborted=()=>priceController.abort();
    signal?.addEventListener('abort',parentAborted,{once:true});
    if(signal?.aborted)parentAborted();
    const timeout=setTimeout(()=>priceController.abort(),9000);
    let response,data;
    try{
      response=await fetch(endpoint.href,{method:'POST',credentials:'same-origin',signal:priceController.signal,
        headers:{'Content-Type':'application/json','X-WP-Nonce':pricePreview.nonce},body:JSON.stringify(request)});
      data=await response.json();
    }finally{
      clearTimeout(timeout);
      signal?.removeEventListener('abort',parentAborted);
    }
    if(!response.ok||data?.success!==true){
      return {...visual,quote:{status:response.status===422?'unpriced':'unavailable',purchasable:false,
        message:response.status===422?data?.data?.message:'Preisvorschau derzeit nicht verfügbar.'}};
    }
    const q=data.data?.quote;
    if(!((q?.status==='calculated-not-sale-approved'&&q.purchasable===false)||(q?.status==='calculated-ready-for-cart'&&q.purchasable===true&&pricePreview.sale===true))||q.currency!=='EUR'
      ||!Number.isSafeInteger(q.unitGrossReferenceCents)||q.unitGrossReferenceCents<1
      ||!Number.isSafeInteger(q.totalGrossReferenceCents)||q.totalGrossReferenceCents!==q.unitGrossReferenceCents*config.quantity
      ||q.quantity!==config.quantity)throw new Error('Invalid price response.');
    return {...visual,quote:q};
  }catch{
    return {...visual,quote:{status:'unavailable',purchasable:false,message:'Preisvorschau derzeit nicht verfügbar.'}};
  }
}

/** Public cart action only exists after audited server release. */
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
