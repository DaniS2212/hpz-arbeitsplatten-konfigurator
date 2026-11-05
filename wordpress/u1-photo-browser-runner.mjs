/** U1 manufacturer screenshot evidence; browser smoke test, no purchase. */
import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?productId=1000081',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('geometry')?.value==='U1'
    &&!!s.querySelector('#drawing svg')&&s.getElementById('drawing')?.getAttribute('aria-busy')==='false';
  },null,{timeout:25000});
  // The normal studio starts with H1145; the exact supplier photo uses W980.
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const r=s.querySelector('input[name="decor"][value="W980"]');
   r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('drawing')?.getAttribute('aria-busy')==='false'
    &&s.querySelector('input[name="decor"][value="W980"]')?.checked===true;
  },null,{timeout:25000});
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   s.getElementById('view-parts').click();
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.querySelectorAll('#seam-choices [data-seam]').length===2
    &&s.querySelectorAll('#drawing .apl-preview-part').length===3;
  },null,{timeout:25000});
  for(const [id,expected] of [['seam-1',['top','left']],['seam-2',['top','right']]]){
   await page.evaluate(seamId=>{
    document.querySelector('[data-hpz-apl-preview]').shadowRoot
     .querySelector('#seam-choices [data-seam="'+seamId+'"]').click();
   },id);
   const data=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {neighbors:[...s.querySelectorAll('#drawing .apl-preview-part[data-seam-neighbor="true"]')].map(e=>e.dataset.partId),
     text:s.getElementById('seam-explain').textContent,
     cartDisabled:s.getElementById('cart').disabled,
     overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.deepEqual(data.neighbors,expected);
   assert.match(data.text,/Speedmaster-Referenz 05\.11\.2026/);
   assert.match(data.text,/Arbeitsplattenverbinder/);
   assert.equal(data.cartDisabled,true);
   assert.ok(data.overflow<=1);
  }
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const f=s.getElementById('dim-L2');f.value='130';f.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('drawing')?.getAttribute('aria-busy')==='false'
    &&s.getElementById('dim-L2')?.value==='130';
  },null,{timeout:25000});
  const changed=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.getElementById('seam-explain').textContent);
  assert.doesNotMatch(changed,/Speedmaster-Referenz/);
  assert.deepEqual(errors,[]);
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
