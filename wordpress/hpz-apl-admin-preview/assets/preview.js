import {normalize} from './core/config.js?v=0.5.0';
import {geometry} from './core/geometry.js?v=0.5.0';
import {resolveProduct} from './core/products.js?v=0.5.0';
// Geometry remains visual. Only the PHP endpoint may supply a V3 gross reference.
export async function preview(raw,{signal,pricePreview}={}) {
  const product=resolveProduct(raw);
  if(product.family!==raw.product)throw new Error('Produktfamilie passt nicht zum Produkt.');
  const config=normalize(raw);
  const drawing=geometry(config);
  const visual={config,geometry:drawing,quote:{purchasable:false,referenceMatched:false,ruleVersion:'admin-visual-only'}};
  if(product.family!=='straight'||!pricePreview?.url||!pricePreview?.nonce)return visual;
  try{
    const endpoint=new URL(pricePreview.url,typeof location==='undefined'?undefined:location.href);
    if(typeof location!=='undefined'&&endpoint.origin!==location.origin)throw new Error('Price endpoint origin mismatch.');
    const request={schemaVersion:raw.schemaVersion,inputUnit:raw.inputUnit,productId:raw.productId,sku:raw.sku,
      product:raw.product,geometry:raw.geometry,corner:raw.corner,dimensions:raw.dimensions,
      straightCorner:raw.straightCorner,material:raw.material,decor:raw.decor,quantity:raw.quantity};
    const response=await fetch(endpoint.href,{method:'POST',credentials:'same-origin',signal,
      headers:{'Content-Type':'application/json','X-WP-Nonce':pricePreview.nonce},body:JSON.stringify(request)});
    const data=await response.json();
    if(!response.ok||data?.success!==true){
      return {...visual,quote:{status:response.status===422?'unpriced':'unavailable',purchasable:false,
        message:response.status===422?data?.data?.message:'Preisvorschau derzeit nicht verfügbar.'}};
    }
    const q=data.data?.quote;
    if(q?.status!=='calculated-not-sale-approved'||q.purchasable!==false||q.currency!=='EUR'
      ||!Number.isSafeInteger(q.unitGrossReferenceCents)||q.unitGrossReferenceCents<1
      ||!Number.isSafeInteger(q.totalGrossReferenceCents)||q.totalGrossReferenceCents!==q.unitGrossReferenceCents*config.quantity
      ||q.quantity!==config.quantity)throw new Error('Invalid price response.');
    return {...visual,quote:q};
  }catch{
    return {...visual,quote:{status:'unavailable',purchasable:false,message:'Preisvorschau derzeit nicht verfügbar.'}};
  }
}
