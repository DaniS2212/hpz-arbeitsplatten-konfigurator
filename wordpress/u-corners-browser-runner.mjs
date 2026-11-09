/** Browser regression: exact delivered plugin files, four U split choices and
 * U inner-foot machining options. No live Woo cart or supplier order. */
import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?productId=1000081',{waitUntil:'domcontentloaded'});
  const ready=()=>page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return !!s?.querySelector('#drawing svg')&&s.getElementById('drawing')?.getAttribute('aria-busy')==='false';
  },null,{timeout:25000});
  await ready();
  const initial=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return {
    cards:[...s.querySelectorAll('.u-variant-card')].map(x=>x.textContent.trim()),
    chosen:s.querySelector('.u-variant-card input:checked')?.value,
    selector:s.getElementById('geometry').value,
    joins:[...s.querySelectorAll('#drawing [data-preview-join="u"]')]
      .map(x=>x.getAttribute('d')),
    cornerSides:[...s.querySelectorAll('input[name="u-side"]')].map(x=>x.value),
    oldGeneric:[...s.querySelectorAll('input[name="corner"]')].filter(x=>!x.closest('[hidden]')).length,
    cartDisabled:s.getElementById('cart').disabled,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
   };
  });
  assert.equal(initial.cards.length,4);
  assert.equal(initial.chosen,'U1');assert.equal(initial.selector,'U1');
  assert.ok(initial.cards.some(x=>x.includes('U3')&&x.includes('Links längs')));
  assert.deepEqual(initial.cornerSides,['none','left','right','both']);
  assert.equal(initial.joins.length,2,'seams are visible in Draufsicht, no Aufteilung tab required');
  assert.ok(initial.overflow<=1,'no horizontal overflow');
  assert.equal(initial.cartDisabled,true);
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const r=s.querySelector('input[name="u-variant"][value="U3"]');
   r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.getElementById('geometry').value==='U3'
     &&s.querySelector('#drawing svg title')?.textContent.startsWith('U3 ·')
     &&s.getElementById('drawing').getAttribute('aria-busy')==='false';
  },null,{timeout:25000});
  const split=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return [...s.querySelectorAll('#drawing [data-preview-join="u"]')]
     .map(x=>x.getAttribute('d'));
  });
  assert.deepEqual(split,['M 600,0 L 600,600','M 1400,600 L 2000,600']);
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const r=s.querySelector('input[name="u-side"][value="left"]');
   r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await ready();
  const rounded=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return {
    radius:s.querySelector('#corner-R1')?.value,
    cornerTitle:s.querySelector('#corners').previousElementSibling.textContent,
    path:s.querySelector('#drawing .apl-surface')?.getAttribute('d'),
    sku:s.querySelector('#summary').textContent,
    cartDisabled:s.getElementById('cart').disabled
   };
  });
  assert.equal(rounded.radius,'10');
  assert.equal(rounded.cornerTitle,'Bearbeitung');
  assert.match(rounded.path,/A 100 100 0 0 1/,'actual inner leg radius, not top-left');
  assert.match(rounded.sku,/Innenecken/);
  assert.equal(rounded.cartDisabled,true,'no unaudited real order');
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const side=s.querySelector('input[name="u-side"][value="both"]');
   side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
   const treatment=s.querySelector('input[name="u-treatment"][value="chamfer_continuous"]');
   treatment.checked=true;treatment.dispatchEvent(new Event('change',{bubbles:true}));
   s.querySelector('#steps button:nth-child(2)').click();
  });
  await ready();
  const chamfer=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return {
    values:['L4','B4','L5','B5'].map(k=>s.getElementById('corner-'+k)?.value),
    selected:s.querySelector('input[name="u-treatment"]:checked')?.value,
    hidden:s.getElementById('special-wrap').hidden,
    cuts:[...s.querySelectorAll('#drawing [data-cut]')].map(x=>x.dataset.cut),
    summary:s.getElementById('summary').textContent
   };
  });
  assert.deepEqual(chamfer.values,['15','15','15','15']);
  assert.equal(chamfer.selected,'chamfer_continuous');
  assert.equal(chamfer.hidden,true,'old top-left special size not shown');
  assert.deepEqual(chamfer.cuts,['right','left']);
  assert.match(chamfer.summary,/Durchlaufend|durchlaufend/i);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=1,'U chooser/form must fit '+width+'px, got '+overflow);
  assert.deepEqual(errors,[],'no new browser exceptions');
  await page.close();
  console.log('PASS U1–U4 join chooser and both inner-leg corners @ '+width+'px');
 }
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
