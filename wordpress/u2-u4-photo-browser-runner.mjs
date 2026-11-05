/** Desktop/mobile regression: U2-U4 manufacturer variants, visual-only, never purchase. */
import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
let browser;
const cases={
 U2:[[[600,0],[600,600]],[[1400,0],[1400,600]]],
 U3:[[[600,0],[600,600]],[[1400,600],[2000,600]]],
 U4:[[[0,600],[600,600]],[[1400,0],[1400,600]]]
};
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?productId=1000081',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return !!s?.querySelector('#drawing svg')&&s.getElementById('drawing')?.getAttribute('aria-busy')==='false';
  },null,{timeout:25000});
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const r=s.querySelector('input[name="decor"][value="W980"]');
   r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));
   s.getElementById('view-parts').click();
  });
  for(const [shape,segments] of Object.entries(cases)){
   await page.evaluate(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const sel=s.getElementById('geometry');sel.value=shape;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
   },shape);
   await page.waitForFunction(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('drawing')?.getAttribute('aria-busy')==='false'
     &&s.querySelector('#drawing svg title')?.textContent.startsWith(shape+' ·')
     &&s.querySelectorAll('#drawing .apl-preview-part').length===3;
   },shape,{timeout:25000});
   const initial=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {
     parts:[...s.querySelectorAll('#drawing .apl-preview-part')].map(x=>x.dataset.partId),
     seams:[...s.querySelectorAll('#drawing .apl-preview-seam')].map(x=>x.getAttribute('d')),
     buttons:[...s.querySelectorAll('#seam-choices button')].map(x=>x.dataset.seam),
     cartDisabled:s.getElementById('cart').disabled,
     overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
   });
   assert.deepEqual(initial.parts,['top','left','right']);
   assert.deepEqual(initial.buttons,['seam-1','seam-2']);
   assert.deepEqual(initial.seams,segments.map(([from,to])=>'M '+from.join(',')+' L '+to.join(',')));
   assert.equal(initial.cartDisabled,true);assert.ok(initial.overflow<=1);
   for(const [seamId,neighbors] of [['seam-1',['top','left']],['seam-2',['top','right']]]){
    await page.evaluate(seamId=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#seam-choices button[data-seam="'+seamId+'"]').click();
    },seamId);
    const observed=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return {neighbors:[...s.querySelectorAll('#drawing .apl-preview-part[data-seam-neighbor="true"]')].map(x=>x.dataset.partId),
      note:s.getElementById('seam-explain').textContent,
      cartDisabled:s.getElementById('cart').disabled,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    assert.deepEqual(observed.neighbors,neighbors);
    assert.match(observed.note,new RegExp('Speedmaster-Referenz 05\\.11\\.2026.*'+shape));
    assert.match(observed.note,/nicht bestätigt/);
    assert.equal(observed.cartDisabled,true);assert.ok(observed.overflow<=1);
   }
   console.log('PASS '+shape+' at '+width+' px: observed left/right seams only; cart blocked');
  }
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const f=s.getElementById('dim-L2');f.value='130';f.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('dim-L2')?.value==='130'
     &&s?.getElementById('drawing')?.getAttribute('aria-busy')==='false';
  },null,{timeout:25000});
  const note=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.getElementById('seam-explain').textContent);
  assert.doesNotMatch(note,/Speedmaster-Referenz/,'different dimensions cannot inherit exact manufacturer witness');
  assert.deepEqual(errors,[]);
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
