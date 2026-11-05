/**
 * Exact L1/L2 2026-11-05 Speedmaster evidence is shown ONLY for the matching
 * 2000x1200 B1/B2=600 mm APL38 W980 case. Browser verifies the note
 * disappears with a changed dimension/material. NEVER assert CNC quantities.
 */
import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port+'/?productId=1000080';
await mkdir('dist',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
   const root=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return root?.getElementById('geometry')?.value==='L1'
     &&root?.querySelector('#drawing svg');
  },null,{timeout:25000});
  const choose=async(name,value)=>page.evaluate(({name,value})=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const r=s.querySelector('input[name="'+name+'"][value="'+value+'"]');
   if(!r)throw Error('Missing '+name+':'+value);
   r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));
  },{name,value});
  const change=async(id,mm)=>page.evaluate(({id,value})=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const input=s.getElementById(id);
   if(!input)throw Error('Missing '+id);
   input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
  },{id,value:String(mm/10)});
  const explanation=()=>page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return {
    text:s.getElementById('seam-explain').textContent,
    cart:s.getElementById('cart').disabled,
    seam:s.querySelector('#seam-choices [data-seam="seam-1"]')?.getAttribute('aria-pressed'),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
   };
  });
  for(const shape of ['L1','L2']){
   await page.evaluate(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const sel=s.getElementById('geometry');
    sel.value=shape;sel.dispatchEvent(new Event('change',{bubbles:true}));
   },shape);
   await choose('l-side','none');
   await choose('material','APL38');
   await choose('decor','W980');
   for(const [id,mm] of Object.entries({L1:2000,L2:1200,B1:600,B2:600}))
    await change('dim-'+id,mm);
   await page.waitForFunction(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('geometry')?.value===shape
       &&s.querySelector('#drawing svg title')?.textContent.startsWith(shape+' ·')
       &&s.getElementById('measurement-error')?.hidden===true;
   },shape,{timeout:25000});
   await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.getElementById('view-parts').click();
    s.querySelector('#seam-choices [data-seam="seam-1"]').click();
   });
   const found=await explanation();
   assert.match(found.text,/Speedmaster.*05\.11\.2026/,shape+' exact photo evidence should be recognizable');
   assert.match(found.text,/Flachdübel|Lamello/);
   assert.match(found.text,/Arbeitsplattenverbinder/);
   assert.match(found.text,/nicht bestätigt|ungeprüft/);
   assert.doesNotMatch(found.text,/\b(?:zwei|2|3|4) Verbinder\b|Fräsposition \d/);
   assert.equal(found.seam,'true');
   assert.equal(found.cart,true);
   assert.ok(found.overflow<=1,shape+' responsive width');
   await page.screenshot({path:'dist/l-visual-assembly-'+shape+'-'+width+'.png',fullPage:true});
   await change('dim-L1',2100);
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('dim-L1')?.value==='210'
      &&s?.getElementById('drawing')?.getAttribute('aria-busy')==='false';
   },null,{timeout:25000});
   const different=await explanation();
   assert.doesNotMatch(different.text,/Speedmaster.*05\.11\.2026/,'non-identical dimensions are not a supplier witness');
   assert.equal(different.cart,true);
   await change('dim-L1',2000);
   await choose('material','APL17.5');
   const materialDifferent=await explanation();
   assert.doesNotMatch(materialDifferent.text,/Speedmaster.*05\.11\.2026/,'different thickness is not the pictured case');
   assert.equal(materialDifferent.cart,true);
   console.log('PASS '+shape+' '+width+'px: exact photographic symbols shown only for exact reference; cart blocked');
  }
  assert.deepEqual(errors,[],'no JavaScript errors');
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
