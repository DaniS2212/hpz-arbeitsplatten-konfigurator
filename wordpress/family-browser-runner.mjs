import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const [id,family,groups,dim] of [[1000080,'l',2,'L2'],[1000081,'u',3,'L3']]){
  for(const width of [1366,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/?productId='+id,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.querySelector('#drawing svg')&&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
   });
   const initial=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {family:s.querySelector('.hpz-apl').dataset.product,
      count:s.querySelectorAll('.apl-dimension-group').length,
      ids:[...s.querySelectorAll('.apl-dimension-group input')].map(x=>x.id),
      names:[...s.querySelectorAll('.apl-dimension-group h3')].map(x=>x.textContent),
      cartDisabled:s.querySelector('#cart').disabled,
      hasSketchDisclaimer:/nicht.*(zugeordnet|bestätigt)|schematisch/i.test(s.querySelector('#shape-note').textContent)};
   });
   assert.equal(initial.family,family);
   assert.equal(initial.count,groups);
   assert.deepEqual(initial.ids,family==='l'?['dim-L1','dim-B1','dim-L2','dim-B2']:['dim-L1','dim-B1','dim-L2','dim-B2','dim-L3','dim-B3']);
   assert.equal(initial.names[0],'Obere Strecke');
   assert.equal(initial.cartDisabled,true);
   assert.ok(initial.hasSketchDisclaimer);
   await page.evaluate((key)=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.querySelector('#steps button:nth-child(2)').click();
    s.querySelector('#dim-'+key).focus();
   },dim);
   await page.waitForFunction(key=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return !!s?.querySelector('#drawing [data-field="'+key+'"][data-active="true"]');
   },dim);
   await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.querySelector('#view-parts').click();
   });
   const parts=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {notice:s.querySelector('#parts-note').hidden?null:s.querySelector('#parts-note').textContent,
      labels:s.querySelector('#drawing svg').querySelectorAll('.apl-measure').length,
      measureToggleHidden:s.querySelector('#measure-toggle').hidden,
      horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.match(parts.notice,/noch nicht|Lieferant|Speedmaster/i);
   assert.equal(parts.labels,0);
   assert.equal(parts.measureToggleHidden,true);
   assert.ok(parts.horizontalOverflow<=1,family+': horizontal overflow at '+width+'px');
   await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#view-plan').click());
   const restored=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {labels:s.querySelector('#drawing svg').querySelectorAll('.apl-measure').length,
      noteHidden:s.querySelector('#parts-note').hidden,measureToggleHidden:s.querySelector('#measure-toggle').hidden};
   });
   assert.ok(restored.labels>0);
   assert.equal(restored.noteHidden,true);
   assert.equal(restored.measureToggleHidden,false);
   assert.deepEqual(errors,[]);
   console.log('PASS '+family+' '+width+'px: grouped measurements, focus highlight, verified-only parts note, mobile');
   await page.close();
  }
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
