import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const [productId,kind,fields] of [[1000080,'l',4],[1000081,'u',6]]){
  for(const width of [1366,390]){
   const page=await browser.newPage({viewport:{width,height:920}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/?productId='+productId,{waitUntil:'domcontentloaded'});
   const ready=()=>page.waitForFunction(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return !!s?.querySelector('#drawing svg')&&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
   },null,{timeout:25000});
   await ready();
   const info=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return {kind:s.querySelector('.hpz-apl').dataset.product,
       measures:[...s.querySelectorAll('#dimensions input')].map(e=>e.id),
       groupCards:s.querySelectorAll('.apl-dimension-group').length,
       productCardsHidden:s.querySelector('#products').hidden,
       cartDisabled:s.querySelector('#cart').disabled,
       summaryCount:s.querySelectorAll('.order-summary').length,
       labels:[...s.querySelectorAll('#dimensions label')].map(x=>x.textContent)};
   });
   assert.equal(info.kind,kind);assert.equal(info.measures.length,fields);
   assert.equal(info.groupCards,0,'L/U must use the finished straight measure grid, not separate cards');
   assert.equal(info.summaryCount,1);assert.equal(info.cartDisabled,true);assert.equal(info.productCardsHidden,true);
   if(kind==='l'){
     const cards=await page.locator('[data-hpz-apl-preview]').evaluate(el=>{
       const root=el.shadowRoot;
       const opts=root.querySelector('.a1-side-options');
       const svg=opts.querySelector('.a1-side-card svg');
       return {cols:getComputedStyle(opts).gridTemplateColumns.split(' ').filter(Boolean).length,svgWidth:svg.getBoundingClientRect().width};
     });
     assert.equal(cards.cols,width>=761?4:2,'L side cards must match straight UX grid');
     assert.ok(cards.svgWidth<=85,'L line icons must stay compact like straight');
     assert.deepEqual(info.measures,['dim-L1','dim-L2','dim-B1','dim-B2']);
     assert.ok(info.labels.some(x=>x.includes('Schenkelbreite links')));
     const initial=await page.locator('[data-hpz-apl-preview]').evaluate(el=>el.shadowRoot.querySelector('#drawing .apl-surface').getAttribute('d'));
     await page.evaluate(()=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.querySelector('#geometry').value='L2';s.querySelector('#geometry').dispatchEvent(new Event('change',{bubbles:true}));});
     await ready();
     const mirrored=await page.locator('[data-hpz-apl-preview]').evaluate(el=>{
       const s=el.shadowRoot;return {d:s.querySelector('#drawing .apl-surface').getAttribute('d'),
       labels:[...s.querySelectorAll('#dimensions label')].map(x=>x.textContent)};});
     assert.notEqual(mirrored.d,initial);assert.ok(mirrored.labels.some(x=>x.includes('Schenkelbreite rechts')));
     await page.evaluate(()=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const radio=s.querySelector('input[name="l-side"][value="left"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));});
     await ready();
     assert.equal(await page.locator('[data-hpz-apl-preview]').evaluate(el=>el.shadowRoot.querySelector('#corner-R1')?.value),'10');
     await page.evaluate(()=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const radio=s.querySelector('input[name="l-treatment"][value="chamfer_square"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));});
     await ready();
     assert.ok(await page.locator('[data-hpz-apl-preview]').evaluate(el=>!!el.shadowRoot.querySelector('#corner-L3')&&!!el.shadowRoot.querySelector('#corner-B3')));
     await page.evaluate(()=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.querySelector('#geometry').value='L3';s.querySelector('#geometry').dispatchEvent(new Event('change',{bubbles:true}));});
     await ready();
     assert.ok(await page.locator('[data-hpz-apl-preview]').evaluate(el=>!!el.shadowRoot.querySelector('#corner-L5')&&!!el.shadowRoot.querySelector('#corner-B5')));
     const l3Fields=await page.locator('[data-hpz-apl-preview]').evaluate(el=>[...el.shadowRoot.querySelectorAll('#dimensions input')].map(i=>i.id));
     assert.deepEqual(l3Fields,['dim-L1','dim-L2','dim-B1','dim-B3']);
     await page.evaluate(()=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.querySelector('#dim-B3').value='95';s.querySelector('#dim-B3').dispatchEvent(new Event('input',{bubbles:true}));});
     await ready();
     await page.evaluate(()=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.querySelector('#geometry').value='L4';s.querySelector('#geometry').dispatchEvent(new Event('change',{bubbles:true}));});
     await ready();
     const l4Fields=await page.locator('[data-hpz-apl-preview]').evaluate(el=>({
       dims:[...el.shadowRoot.querySelectorAll('#dimensions input')].map(i=>i.id),
       baseB5:el.shadowRoot.querySelectorAll('#dim-B5').length,
       cornerB5:el.shadowRoot.querySelectorAll('#corner-B5').length,
       cartDisabled:el.shadowRoot.querySelector('#cart').disabled
     }));
     assert.deepEqual(l4Fields.dims,['dim-L1','dim-L2','dim-B1','dim-B3','dim-B5']);
     assert.equal(l4Fields.baseB5,1);
     assert.equal(l4Fields.cornerB5,1);
     assert.ok(l4Fields.cartDisabled);
     await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#corner-B5').focus());
     await page.waitForFunction(()=>!!document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#drawing [data-field="corner-B5"][data-active="true"]'));
     const paired=await page.locator('[data-hpz-apl-preview]').evaluate(el=>{
       const root=el.shadowRoot;
       return {
         activeBase:root.querySelector('#drawing [data-field="B5"][data-active="true"]')!==null,
         labels:[...root.querySelectorAll('#summary dt')].map(n=>n.textContent),
         callouts:root.querySelectorAll('#drawing [data-field="corner-B5"]').length
       };
     });
     assert.equal(paired.activeBase,false,'base B5 does not highlight when corner-B5 receives focus');
     assert.ok(paired.callouts>0);
     assert.ok(paired.labels.includes('Eckbereich')&&paired.labels.includes('Diagonalbereich'),'customer-readable L summary');
     await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.querySelector('#dim-B5').focus();
       s.querySelector('#drawing [data-field="corner-B5"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
     });
     const fromDrawing=await page.locator('[data-hpz-apl-preview]').evaluate(el=>el.shadowRoot.activeElement?.id);
     assert.equal(fromDrawing,'corner-B5','clicking the L bevel diagram focuses its exact input');
   }
   await page.evaluate((key)=>{const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#steps button:nth-child(2)').click();s.querySelector('#dim-'+key).focus();
   },kind==='l'?'B1':'L3');
   await page.waitForFunction(key=>!!document.querySelector('[data-hpz-apl-preview]')?.shadowRoot.querySelector('#drawing [data-field="'+key+'"][data-active="true"]'),kind==='l'?'B1':'L3');
   await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#view-parts').click());
   const parts=await page.locator('[data-hpz-apl-preview]').evaluate(el=>{
     const s=el.shadowRoot;return {
       labels:s.querySelector('#drawing').querySelectorAll('.apl-measure').length,
       seamCount:s.querySelector('#drawing').querySelectorAll('.apl-preview-seam').length,
       warning:s.querySelector('#parts-note').textContent,
       hiddenToggle:s.querySelector('#measure-toggle').hidden,
       over:document.documentElement.scrollWidth-document.documentElement.clientWidth
     };});
   assert.equal(parts.labels,0);assert.ok(parts.hiddenToggle);assert.ok(parts.over<=1);
   if(kind==='l'){assert.ok(parts.seamCount>=1);assert.match(parts.warning,/fräs|Fräs|Verbinder|Fugen/);}
   else{assert.equal(parts.seamCount,0);assert.match(parts.warning,/noch nicht|Lieferant/);}
   await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#view-plan').click());
   const restored=await page.locator('[data-hpz-apl-preview]').evaluate(el=>{
     const s=el.shadowRoot;return {labels:s.querySelector('#drawing').querySelectorAll('.apl-measure').length,
       noteHidden:s.querySelector('#parts-note').hidden,hiddenToggle:s.querySelector('#measure-toggle').hidden};});
   assert.ok(restored.labels>0);assert.ok(restored.noteHidden);assert.equal(restored.hiddenToggle,false);
   assert.deepEqual(errors,[]);
   console.log('PASS '+kind+' '+width+' px: same UX, geometry, corners, preview-only seams, no checkout');
   await page.close();
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
