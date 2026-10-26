import test from 'node:test';
import assert from 'node:assert/strict';
import {preview} from './hpz-apl-admin-preview/assets/preview.js';
const raw=(productId=1000083)=>({schemaVersion:2,inputUnit:'mm',productId,sku:productId===1000083?'HPZ-APL-GERADE-2026':'HPZ-APL-L-FORM-2026',product:productId===1000083?'straight':'l',geometry:productId===1000083?'straight':'L1',corner:'square',dimensions:productId===1000083?{L1:'2000',B1:'600'}:{L1:'2500',L2:'1200',B1:'600',B2:'600'},straightCorner:productId===1000083?{side:'none',treatment:null,parameters:{}}:undefined,material:'APL17.5',decor:'W980',quantity:1});
test('WordPress adapter requests server V3 price and sends no claimed price or supplier data',async()=>{
 const old=globalThis.fetch;let seen;
 globalThis.fetch=async(url,options)=>{seen={url,options};return {ok:true,status:200,json:async()=>({success:true,data:{quote:{status:'calculated-not-sale-approved',currency:'EUR',unitGrossReferenceCents:45000,totalGrossReferenceCents:45000,quantity:1,purchasable:false,taxNote:'DE reference',availabilityNote:'Unverbindlich'}}})};};
 try{
  const r=raw();r.price=1;r.supplierNet=1;r.decorSupplierCode='FORGED';
  const result=await preview(r,{pricePreview:{url:'https://shop.example/wp-admin/admin-ajax.php?action=hpz_apl_price_preview',nonce:'token'}});
  assert.equal(result.quote.totalGrossReferenceCents,45000);assert.equal(result.quote.purchasable,false);
  assert.equal(seen.options.headers['X-WP-Nonce'],'token');assert.equal(seen.options.credentials,'same-origin');
  const sent=JSON.parse(seen.options.body);assert.equal(sent.dimensions.L1,'2000');assert.equal(sent.price,undefined);assert.equal(sent.supplierNet,undefined);assert.equal(sent.decorSupplierCode,undefined);
 }finally{globalThis.fetch=old;}
});
test('L/U and missing endpoint remain visual only',async()=>{
 const a=await preview(raw());assert.equal(a.quote.status,undefined);assert.equal(a.quote.purchasable,false);
 const b=await preview(raw(1000080),{pricePreview:{url:'https://shop.example/price',nonce:'token'}});
 assert.equal(b.quote.unitGrossReferenceCents,undefined);assert.equal(b.quote.purchasable,false);
});
test('HTTP validation/network failures never leave a stale or purchasable quote',async()=>{
 const old=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:false,status:422,json:async()=>({success:false,data:{message:'Für diese Maße liegt noch keine V3-Preisvorschau vor.'}})});
  let result=await preview(raw(),{pricePreview:{url:'https://shop.example/price',nonce:'token'}});
  assert.equal(result.quote.status,'unpriced');assert.equal(result.quote.unitGrossReferenceCents,undefined);
  globalThis.fetch=async()=>{throw new Error('network');};
  result=await preview(raw(),{pricePreview:{url:'https://shop.example/price',nonce:'token'}});
  assert.equal(result.quote.status,'unavailable');assert.equal(result.quote.purchasable,false);
 }finally{globalThis.fetch=old;}
});
