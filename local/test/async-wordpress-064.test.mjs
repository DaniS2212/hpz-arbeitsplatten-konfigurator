import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewController} from '../public/latest.mjs';
import {preview} from '../../wordpress/hpz-apl-admin-preview/assets/preview.js';

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const payload=(decor='W980')=>({
  schemaVersion:2,inputUnit:'mm',productId:1000083,sku:'HPZ-APL-GERADE-2026',
  product:'straight',geometry:'straight',corner:'square',material:'APL38',
  decor,quantity:1,dimensions:{L1:'2000',B1:'600'},
  straightCorner:{side:'none',treatment:null,parameters:{}}
});

test('Every choice renders immediate geometry even if server has not returned',async()=>{
  let conclude;
  const responses=[],visuals=[],pendings=[];
  const controller=createPreviewController({
    request:async (raw,{onVisual})=>{
      onVisual({id:raw});
      return await new Promise(resolve=>{conclude=resolve});
    },
    onPending:()=>pendings.push('pending'),
    onVisual:v=>visuals.push(v.id),
    onResult:v=>responses.push(v.id),
    onError:e=>assert.fail('Unexpected error: '+e.message)
  });
  const request=controller.refresh('first');
  assert.deepEqual(pendings,['pending']);
  assert.deepEqual(visuals,['first'],'Drawing must update before price response');
  assert.deepEqual(responses,[],'Pending price has not resolved');
  conclude({id:'first'});
  await request;
  assert.deepEqual(responses,['first']);
  controller.cancel();
});

test('Rapid choices cancel old requests and never overwrite newest visual or quote',async()=>{
  const signals=[],events=[],fulfill=new Map();
  const controller=createPreviewController({
    request:async (raw,{signal,onVisual})=>{
      signals.push(signal);
      onVisual({id:raw});
      return new Promise(resolve=>fulfill.set(raw,resolve));
    },
    onPending:()=>events.push('pending'),
    onVisual:v=>events.push('visual:'+v.id),
    onResult:v=>events.push('result:'+v.id),
    onError:e=>events.push('error:'+e.message)
  });
  const a=controller.refresh('old');
  const b=controller.refresh('new');
  assert.equal(signals[0].aborted,true);
  assert.equal(signals[1].aborted,false);
  assert.deepEqual(events,['pending','visual:old','pending','visual:new']);
  fulfill.get('old')({id:'old'});
  await a;
  assert.equal(events.includes('result:old'),false,'Old quote must never win');
  fulfill.get('new')({id:'new'});
  await b;
  assert.equal(events.at(-1),'result:new');
  controller.cancel();
  assert.equal(signals[1].aborted,false,'Completed request no longer active');
});

test('Cancellation when leaving preview suppresses late UI updates',async()=>{
  const callbacks=[];
  let release;
  const controller=createPreviewController({
    request:async (_raw,{onVisual})=>{
      onVisual({id:'visual'});
      return await new Promise(resolve=>release=resolve);
    },
    onPending:()=>callbacks.push('pending'),
    onVisual:()=>callbacks.push('visual'),
    onResult:()=>callbacks.push('late result'),
    onError:()=>callbacks.push('late error')
  });
  const run=controller.refresh('x');
  controller.cancel();
  release({id:'x'});
  await run;
  assert.deepEqual(callbacks,['pending','visual']);
});

test('WordPress V3 adapter emits the SVG immediately, then resolves a guarded reference',async()=>{
  const original=globalThis.fetch;
  const calls=[];
  globalThis.fetch=async (_url,request)=>{
    calls.push(request);
    return new Response(JSON.stringify({success:true,data:{quote:{
      status:'calculated-not-sale-approved',currency:'EUR',purchasable:false,
      unitGrossReferenceCents:67000,totalGrossReferenceCents:67000,
      quantity:1,taxNote:'DE-Referenz',availabilityNote:'Unverbindlich.'
    }}}),{status:200,headers:{'content-type':'application/json'}});
  };
  try{
    let partial;
    const work=preview(payload(),{
      pricePreview:{url:'https://example.invalid/admin-ajax.php?action=hpz_apl_price_preview',nonce:'testnonce'},
      onVisual:v=>partial=v
    });
    assert.equal(partial.config.dimensions.L1,2000,'Visual callback before debounce');
    assert.equal(partial.geometry.width,2000);
    assert.equal(partial.quote.purchasable,false);
    assert.equal(calls.length,0,'Price should be debounced');
    const priced=await work;
    assert.equal(calls.length,1);
    assert.equal(priced.quote.totalGrossReferenceCents,67000);
    assert.equal(priced.quote.purchasable,false);
    assert.equal(calls[0].headers['X-WP-Nonce'],'testnonce');
  }finally{globalThis.fetch=original;}
});

test('Aborted WordPress request never removes the preview or starts another AJAX call',async()=>{
  const original=globalThis.fetch;
  let calls=0;
  globalThis.fetch=()=>{calls++;throw Error('Unexpected request after cancellation');};
  try{
    const stop=new AbortController();
    let visual;
    const work=preview(payload(),{
      signal:stop.signal,
      pricePreview:{url:'https://example.invalid/admin-ajax.php',nonce:'testnonce'},
      onVisual:v=>{visual=v;}
    });
    assert.ok(visual.geometry.width>0);
    stop.abort();
    const result=await work;
    assert.equal(result.geometry.width,2000);
    assert.equal(result.quote.purchasable,false);
    assert.equal(calls,0,'Debounce must cancel pending AJAX');
  }finally{globalThis.fetch=original;}
});

test('WP admin-AJAX HTTP errors preserve geometry and do not enable buying',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify({success:false,data:{message:'Eckmaße prüfen'}}),{
    status:422,headers:{'content-type':'application/json'}
  });
  try{
    let visible=false;
    const result=await preview(payload(),{
      pricePreview:{url:'https://example.invalid/admin-ajax.php',nonce:'testnonce'},
      onVisual:()=>visible=true
    });
    assert.equal(visible,true);
    assert.equal(result.quote.status,'unpriced');
    assert.equal(result.quote.purchasable,false);
    assert.equal(result.geometry.width,2000);
  }finally{globalThis.fetch=original;}
});
