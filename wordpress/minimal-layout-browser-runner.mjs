import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

// Regression for the real WordPress plugin assets, not a standalone UI mock.
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  for(const [id,kind] of [[1000083,'straight'],[1000080,'l'],[1000081,'u']]){
   const page=await browser.newPage({viewport:{width,height:920}});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/?productId='+id,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('[data-hpz-apl-preview]')?.shadowRoot
     ?.querySelector('#drawing svg')&&document.querySelector('[data-hpz-apl-preview]')
     .shadowRoot.querySelector('#drawing').getAttribute('aria-busy')==='false',null,{timeout:25000});
   await page.waitForFunction(()=>{
     const r=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return r&&getComputedStyle(r.querySelector('#drawing')).display==='flex'
       &&getComputedStyle(r.querySelector('.configuration')).borderStyle==='solid';
   },null,{timeout:25000});
   if(kind==='straight'){
    const first=await page.evaluate(()=>{
     const root=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const surface=root.querySelector('#drawing .apl-surface').getBoundingClientRect();
     const drawing=root.querySelector('#drawing').getBoundingClientRect();
     return {fraction:surface.width/drawing.width,legend:root.querySelector('.a1-sides legend').textContent,
       iCount:root.querySelectorAll('.a11-info').length,
       stageHeight:root.querySelector('.stage').getBoundingClientRect().height};
    });
    assert.ok(first.fraction>.75,
     'straight slab should fill >75% of drawing width at '+width+'px, got '+first.fraction);
    assert.equal(first.legend,'Welche Eckbearbeitung?');
    assert.equal(first.iCount,0,'no confusing explanatory i icon');
    if(width===1366)assert.ok(first.stageHeight<760,'straight should not waste a huge empty sketch panel');
   }else{
    await page.evaluate(()=>{
     const root=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     if(root.querySelector('.hpz-apl').dataset.product==='l'){
      root.querySelector('#geometry').value='L4';
      root.querySelector('#geometry').dispatchEvent(new Event('change',{bubbles:true}));
     }
     root.querySelector('#steps button:nth-child(2)').click();
    });
    await page.waitForFunction(()=>{
     const r=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return r.querySelector('[data-step="1"]').hidden===false
       &&r.querySelector('#drawing').getAttribute('aria-busy')==='false';
    },null,{timeout:25000});
    const input=await page.evaluate(()=>{
     const r=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const grid=r.querySelector('#dimensions');
     const label=grid.querySelector('.dimension-label');
     const field=grid.querySelector('input');
     const labelFont=parseFloat(getComputedStyle(label).fontSize);
     const fieldFont=parseFloat(getComputedStyle(field).fontSize);
     return {labelFont,fieldFont,overflow:grid.scrollWidth-grid.clientWidth,
       labels:[...grid.querySelectorAll('.dimension-label')].map(x=>x.textContent),
       values:[...grid.querySelectorAll('input')].map(x=>x.value)};
    });
    assert.ok(input.labelFont>=12,'L/U measurement labels readable like straight');
    assert.ok(input.fieldFont>=20,'L/U measurement numbers readable like straight');
    assert.ok(input.overflow<=2,'measure grid must not overflow viewport: '+input.overflow);
    assert.ok(input.values.length>=5,'measure inputs retained');
    if(kind==='l'){
     assert.ok(input.labels.some(x=>x.includes('Schenkelbreite')&&x.includes('B1/B2')));
     assert.ok(input.labels.some(x=>x.includes('Eckbreite')&&x.includes('B3/B4')));
     assert.ok(input.labels.some(x=>x.includes('Diagonalbereich')&&x.includes('B5')));
    }
   }
   assert.deepEqual(errors,[],'no browser errors');
   await page.close();
   console.log('PASS uniform measurement UI '+kind+' @ '+width+'px');
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
