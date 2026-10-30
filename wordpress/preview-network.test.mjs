import test from 'node:test';
import assert from 'node:assert/strict';
import {preview} from './hpz-apl-admin-preview/assets/preview.js';
const raw=(l='1200',b='600')=>({
 schemaVersion:2,inputUnit:'mm',productId:1000083,sku:'HPZ-APL-GERADE-2026',
 product:'straight',geometry:'straight',corner:'square',
 straightCorner:{side:'none',treatment:null,parameters:{}},
 dimensions:{L1:l,B1:b},material:'APL38',decor:'W980',quantity:1
});
const quote=cents=>({success:true,data:{quote:{ruleVersion:'v3.0.0-approved-formula',
 status:'calculated-ready-for-cart',currency:'EUR',purchasable:true,quantity:1,
 unitGrossReferenceCents:cents,totalGrossReferenceCents:cents,taxNote:'DE'}}});
const reply=(code,data)=>new Response(JSON.stringify(data),{status:code,headers:{'Content-Type':'application/json'}});
const settings={url:'https://example.test/wp-admin/admin-ajax.php?action=hpz_apl_public_quote',nonce:'test-nonce',sale:true};
async function mockFetch(fn,callback){
 const previous=globalThis.fetch,oldLocation=globalThis.location;
 globalThis.location={href:'https://example.test/produkt/gerade/',origin:'https://example.test'};
 globalThis.fetch=fn;
 try{return await callback();}finally{
  globalThis.fetch=previous;
  if(oldLocation===undefined)delete globalThis.location;
  else globalThis.location=oldLocation;
 }
}
test('120x60 shows 510 EUR even if first PHP endpoint returns HTTP 503',async()=>{
 let calls=0,visuals=0;
 await mockFetch(async(url,options)=>{
  calls++;assert.equal(options.method,'POST');assert.equal(options.cache,'no-store');
  assert.equal(options.credentials,'same-origin');assert.match(options.body,/"L1":"1200"/);
  return calls===1?reply(503,{success:false}):reply(200,quote(51000));
 },async()=>{
  const result=await preview(raw(),{pricePreview:settings,onVisual:()=>visuals++});
  assert.equal(result.quote.totalGrossReferenceCents,51000);
  assert.equal(result.quote.purchasable,true);
  assert.equal(calls,2);assert.equal(visuals,1);
 });
});
test('single temporary network error retries once',async()=>{
 let calls=0;
 await mockFetch(async()=>{calls++;if(calls===1)throw new TypeError('temporary network error');return reply(200,quote(51000));},async()=>{
  assert.equal((await preview(raw(),{pricePreview:settings})).quote.unitGrossReferenceCents,51000);
  assert.equal(calls,2);
 });
});
test('350x90 maintains verified V3 gross price with one backend response',async()=>{
 let calls=0;
 await mockFetch(async()=>{calls++;return reply(200,quote(203000));},async()=>{
  const result=await preview(raw('3500','900'),{pricePreview:settings});
  assert.equal(result.quote.unitGrossReferenceCents,203000);
  assert.equal(calls,1);
 });
});
test('a genuine 422 dimensional rejection does not retry or give a local price',async()=>{
 let calls=0;
 await mockFetch(async()=>{calls++;return reply(422,{success:false,data:{message:'L1: Länge außerhalb des erlaubten Bereichs.'}});},async()=>{
  const result=await preview(raw(),{pricePreview:settings});
  assert.equal(result.quote.status,'unpriced');
  assert.match(result.quote.message,/L1/);
  assert.equal(result.quote.purchasable,false);assert.equal(calls,1);
 });
});
test('a 403 expired nonce is not retried',async()=>{
 let calls=0;
 await mockFetch(async()=>{calls++;return reply(403,{success:false});},async()=>{
  const result=await preview(raw(),{pricePreview:settings});
  assert.equal(result.quote.status,'unavailable');
  assert.match(result.quote.message,/neu laden/);assert.equal(calls,1);
 });
});
test('persistent server failures never authorize purchase',async()=>{
 let calls=0;
 await mockFetch(async()=>{calls++;return reply(500,{success:false});},async()=>{
  const result=await preview(raw(),{pricePreview:settings});
  assert.equal(result.quote.status,'unavailable');
  assert.equal(result.quote.purchasable,false);
  assert.equal(result.quote.unitGrossReferenceCents,undefined);
  assert.match(result.quote.message,/erneut berechnen/);
  assert.equal(calls,2);
 });
});
test('malformed 200 OK price may not enable the cart',async()=>{
 let calls=0;
 await mockFetch(async()=>{calls++;return reply(200,quote(-1));},async()=>{
  const result=await preview(raw(),{pricePreview:settings});
  assert.equal(result.quote.status,'unavailable');
  assert.equal(result.quote.purchasable,false);assert.equal(calls,1);
 });
});
test('changed input cancels any stale retry',async()=>{
 let calls=0,controller=new AbortController();
 await mockFetch(async()=>{calls++;controller.abort();throw new DOMException('Abgebrochen','AbortError');},async()=>{
  const result=await preview(raw(),{signal:controller.signal,pricePreview:settings});
  assert.equal(result.quote.ruleVersion,'admin-visual-only');
  assert.equal(calls,1);
 });
});
