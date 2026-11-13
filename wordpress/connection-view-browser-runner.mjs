/** WordPress packaged visual: connector switch / 390px responsiveness. */
import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
import {mkdir} from 'node:fs/promises';

const server=createPackageTestServer();
await new Promise((resolve,reject)=>{
 server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  for(const {productId,family,variant} of [
   {productId:1000080,family:'l',variant:'L3'},
   {productId:1000081,family:'u',variant:'U3'}
  ]){
   const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/?productId='+productId,
     {waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.getElementById('drawing')?.getAttribute('aria-busy')==='false'
       &&!!s.querySelector('#drawing svg');
   },null,{timeout:25000});
   const initial=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const b=s.getElementById('transparent-toggle');
     return {hidden:b.hidden,text:b.textContent.trim(),
       pressed:b.getAttribute('aria-pressed'),
       hardware:s.querySelectorAll('#drawing .apl-schematic-hardware').length,
       inHeader:b.parentElement.classList.contains('stage-caption'),
       checkoutDisabled:s.getElementById('cart').disabled};
   });
   assert.equal(initial.hidden,false);
   assert.equal(initial.text,'Verbindungen');
   assert.equal(initial.pressed,'false');
   assert.equal(initial.hardware,0);
   assert.equal(initial.inHeader,true);
   assert.equal(initial.checkoutDisabled,true,'draft L/U must stay unsellable');
   await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#steps button:nth-child(2)').click();
     s.getElementById('transparent-toggle').click();
   });
   await page.waitForFunction(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.getElementById('transparent-toggle')?.getAttribute('aria-pressed')==='true'
       &&s.querySelectorAll('#drawing .apl-schematic-hardware').length>0;
   });
   let state=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const b=s.getElementById('transparent-toggle');
     const bounds=b.getBoundingClientRect();
     const stage=s.querySelector('.stage').getBoundingClientRect();
     return {pressed:b.getAttribute('aria-pressed'),
       hardware:s.querySelectorAll('#drawing .apl-schematic-hardware').length,
       biscuits:s.querySelectorAll('#drawing .apl-schematic-biscuit').length,
       clamps:s.querySelectorAll('#drawing .apl-schematic-clamp').length,
       measures:s.querySelectorAll('#drawing .apl-measure').length,
       note:s.getElementById('transparent-note').hidden,
       fits:bounds.left>=stage.left-1&&bounds.right<=stage.right+1,
       hasOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
       checkoutDisabled:s.getElementById('cart').disabled,
       stateCss:getComputedStyle(b).backgroundColor
     };
   });
   assert.equal(state.pressed,'true');
   assert.ok(state.hardware>0);
   assert.ok(state.biscuits>=2);
   assert.ok(state.clamps>=1);
   assert.ok(state.measures>0,'measure labels remain visible in transparent view');
   assert.equal(state.note,false);
   assert.equal(state.fits,true,'header toggle stays inside stage on '+width);
   assert.equal(state.hasOverflow,false,'no horizontal scrollbar on '+width);
   assert.equal(state.checkoutDisabled,true,'no sale-gate side effect');
   await page.evaluate(({family,variant})=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const radio=s.querySelector('input[name="'+(family==='l'?'l-variant':'u-variant')+
       '"][value="'+variant+'"]');
     if(!radio)throw Error('missing variant '+variant);
     radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
   },{family,variant});
   await page.waitForFunction(({variant})=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.querySelector('#drawing svg title')?.textContent.startsWith(variant+' ·')
       &&s?.getElementById('drawing')?.getAttribute('aria-busy')==='false';
   },{variant},{timeout:25000});
   state=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return {pressed:s.getElementById('transparent-toggle').getAttribute('aria-pressed'),
       seams:s.querySelectorAll('#drawing .apl-schematic-hardware').length,
       checkoutDisabled:s.getElementById('cart').disabled};
   });
   assert.equal(state.pressed,'true','active connection view survives changing shape');
   assert.ok(state.seams>=1,'new variant still has relevant seams');
   assert.equal(state.checkoutDisabled,true);
   if(width===390){
    await mkdir('dist',{recursive:true});
    await page.screenshot({path:'dist/l-visual-connection-'+family+'-390.png',fullPage:false});
   }
   await page.evaluate(()=>{
     document.querySelector('[data-hpz-apl-preview]').shadowRoot
       .getElementById('transparent-toggle').click();
   });
   state=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return {pressed:s.getElementById('transparent-toggle').getAttribute('aria-pressed'),
       hardware:s.querySelectorAll('#drawing .apl-schematic-hardware').length};
   });
   assert.deepEqual(state,{pressed:'false',hardware:0},'normal view returns to original SVG');
   assert.deepEqual(errors,[]);
   await page.close();
   console.log('PASS '+family+' '+variant+' header connection view / measures / no-order @ '+width+'px');
  }
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
