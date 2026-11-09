import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

// Exact delivered WordPress module assets; customer-facing icon differentiation
// and compact card parity across straight, L and U, on desktop and mobile.
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  for(const [id,family,sideName,treatmentName] of [
   [1000083,'straight','straight-side','straight-treatment'],
   [1000080,'l','l-side','l-treatment'],
   [1000081,'u','u-side','u-treatment']
  ]){
   const page=await browser.newPage({viewport:{width,height:920}});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/?productId='+id,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return !!s?.querySelector('#drawing svg')
      &&s.getElementById('drawing').getAttribute('aria-busy')==='false';
   },null,{timeout:25000});
   await page.evaluate(group=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const input=s.querySelector('input[name="'+group+'"][value="left"]');
    if(!input)throw Error('Missing left side radio for '+group);
    input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
   },sideName);
   await page.waitForFunction(group=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.querySelectorAll('#corners input[name="'+group+'"]').length===3
      &&!s.getElementById('corners').hidden;
   },treatmentName,{timeout:25000});
   const ui=await page.evaluate(({group})=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const sides=[...s.querySelectorAll('.a1-side-options .a1-side-card')];
    const treatments=[...s.querySelectorAll('#corners .a1-treatment-card')];
    const types=Object.fromEntries(treatments.map(label=>{
      const svg=label.querySelector('svg');
      const key=label.querySelector('input').value;
      return [key,{label:label.querySelector('span')?.textContent,
        kind:svg?.dataset.treatmentKind,
        outline:svg?.querySelector('path')?.getAttribute('d'),
        edge:svg?.querySelectorAll('path')[1]?.getAttribute('d'),
        paths:svg?.querySelectorAll('path').length,
        width:svg?.getBoundingClientRect().width}];
    }));
    const firstSide=sides[0],firstTreatment=treatments[0];
    return {count:sides.length,treatmentCount:treatments.length,
      sideDirection:getComputedStyle(firstSide).flexDirection,
      sideLayout:getComputedStyle(s.querySelector('.a1-side-options')).gridTemplateColumns,
      treatmentDisplay:getComputedStyle(firstTreatment).display,
      treatmentColumns:getComputedStyle(firstTreatment).gridTemplateColumns,
      types,visibleLabels:sides.map(el=>el.textContent.trim()),
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   },{group:treatmentName});
   assert.equal(ui.count,4,'all four side choices remain available');
   assert.equal(ui.treatmentCount,3,'three treatments remain available');
   assert.equal(ui.sideDirection,'column','side cards vertically stacked like U');
   assert.equal(ui.treatmentDisplay,'grid','wide horizontal treatment cards like U');
   assert.equal(ui.sideLayout.split(' ').length,4,'side choices show four compact columns');
   assert.equal(ui.treatmentColumns.split(' ').length,2,'icons and labels share two columns');
   assert.deepEqual(Object.keys(ui.types).sort(),
    ['chamfer_continuous','chamfer_square','round']);
   assert.equal(ui.types.chamfer_square.label,'Abgeschrägt · eckig');
   assert.equal(ui.types.chamfer_continuous.label,'Abgeschrägt · Kante durchlaufend');
   assert.equal(ui.types.chamfer_square.kind,'chamfer_square');
   assert.equal(ui.types.chamfer_continuous.kind,'chamfer_continuous');
   assert.notEqual(ui.types.chamfer_square.edge,ui.types.chamfer_continuous.edge,
     'square cut must NOT have same visual edge path as continuous banding');
   assert.match(ui.types.chamfer_square.edge,/M 25 34 L 38 21/);
   assert.match(ui.types.chamfer_continuous.edge,/M 8 34 H 21 Q 25 34 28 31 L 35 24 Q 38 21 38 17 V 5/);
   assert.ok(ui.types.chamfer_square.paths!==ui.types.chamfer_continuous.paths,
     'distinct endpoints versus unbroken edge need different actual SVG structure');
   assert.ok(ui.types.round.width>=48,'all icons remain large and legible');
   assert.ok(ui.overflow<=1,'no horizontal page overflow at '+width+'px');
   await page.evaluate(group=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const v=s.querySelector('input[name="'+group+'"][value="chamfer_continuous"]');
    v.checked=true;v.dispatchEvent(new Event('change',{bubbles:true}));
   },treatmentName);
   const selected=await page.evaluate(group=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return s.querySelector('input[name="'+group+'"]:checked')?.value;
   },treatmentName);
   assert.equal(selected,'chamfer_continuous','selection stays functional');
   assert.deepEqual(errors,[],'no browser errors while switching corners');
   console.log('PASS corner card/icon parity '+family+' at '+width+'px');
   await page.close();
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
