import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 await mkdir('wordpress/ci-artifacts',{recursive:true});
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().includes('/assets/decors/')&&r.status()!==200)errors.push('Decor HTTP '+r.status())});
  await page.goto(base+'/?productId=1000083',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return !!s?.querySelector('#drawing svg')&&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
  });
  const step1=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const workspace=s.querySelector('.workspace').getBoundingClientRect();
   const summary=s.querySelector('.order-summary').getBoundingClientRect();
   const visual=s.querySelector('.visual-column').getBoundingClientRect();
   const form=s.querySelector('.configuration').getBoundingClientRect();
   return {workspace:workspace.toJSON(),summary:summary.toJSON(),visual:visual.toJSON(),form:form.toJSON(),
    parent:s.querySelector('.order-summary').parentElement.className,
    summaryCount:s.querySelectorAll('.order-summary').length};
  });
  assert.equal(step1.summaryCount,1);
  if(width>760){
   assert.equal(step1.parent,'workspace');
   assert.ok(Math.abs(step1.summary.width-step1.workspace.width)<4,'Summary must span full desktop workspace in step 1');
   assert.ok(step1.summary.top>=Math.max(step1.visual.bottom,step1.form.bottom)-3,'Summary must follow both columns');
  }else assert.equal(step1.parent,'configuration');
  // Exercise the vertical B3 highlight and verify SVG text no longer inherits
  // the line stroke, which used to render doubled text on top of the label.
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const side=s.querySelector('input[name="straight-side"][value="both"]');
   side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
   const tr=s.querySelector('input[name="straight-treatment"][value="chamfer_square"]');
   tr.checked=true;tr.dispatchEvent(new Event('change',{bubbles:true}));
   s.querySelector('#steps button:nth-child(2)').click();
   s.querySelector('#dim-B3').focus();
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.querySelector('#drawing').getAttribute('aria-busy')==='false'&&!!s.querySelector('[data-field="B3"][data-active="true"] .apl-measure-label');
  });
  const vertical=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const g=s.querySelector('[data-field="B3"][data-active="true"] .apl-measure-label');
   return {stroke:g.getAttribute('stroke'),effective:getComputedStyle(g.querySelector('text')).stroke,
    text:g.querySelector('text').textContent,transform:g.getAttribute('transform')};
  });
  assert.equal(vertical.stroke,'none');
  assert.equal(vertical.effective,'none');
  assert.match(vertical.text,/B3: 15 cm/);
  assert.match(vertical.transform,/rotate\(-90\)/);
  const step2=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const workspace=s.querySelector('.workspace').getBoundingClientRect();
   const summary=s.querySelector('.order-summary').getBoundingClientRect();
   return {workspace:workspace.toJSON(),summary:summary.toJSON()};
  });
  if(width>760)assert.ok(Math.abs(step2.summary.width-step2.workspace.width)<4,'Step 2 summary must span full width');
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   s.querySelector('#steps button:nth-child(3)').click();
   const choice=s.querySelector('input[name="decor"][value="F021"]');
   choice.checked=true;choice.dispatchEvent(new Event('change',{bubbles:true}));
   const mat=s.querySelector('#materials input[value="APL17.5"]');
   mat.checked=true;mat.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.querySelector('#drawing').getAttribute('aria-busy')==='false'&&
     s.querySelector('#selected-surface-name').textContent==='Terrazzo grau'&&
     s.querySelector('#summary').textContent.includes('Terrazzo grau');
  });
  const finish=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const workspace=s.querySelector('.workspace').getBoundingClientRect();
   const summary=s.querySelector('.order-summary').getBoundingClientRect();
   const visual=s.querySelector('.visual-column').getBoundingClientRect();
   const form=s.querySelector('.configuration').getBoundingClientRect();
   const columns=getComputedStyle(s.querySelector('#decors')).gridTemplateColumns.split(' ').length;
   const price=s.querySelector('#price').textContent;
   const cart=s.querySelector('#cart');
   return {workspace:workspace.toJSON(),summary:summary.toJSON(),visual:visual.toJSON(),form:form.toJSON(),
    columns,price,cartDisabled:cart.disabled,summaryParent:s.querySelector('.order-summary').parentElement.className,
    decorCards:s.querySelectorAll('.decor-card').length,
    label:s.querySelector('#selected-surface-name').textContent,
    strength:s.querySelector('#selected-surface-thickness').textContent,
    horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  assert.equal(finish.decorCards,16);
  assert.equal(finish.label,'Terrazzo grau');
  assert.match(finish.strength,/17,5 mm/);
  assert.equal(finish.price,'Preis wird geprüft');
  assert.equal(finish.cartDisabled,true);
  assert.ok(finish.horizontalOverflow<=1,'No horizontal overflow at '+width);
  if(width>760){
   assert.ok(finish.form.width>finish.visual.width,'Finish step gives more space to decor selection');
   assert.ok(finish.columns>=3,'Finish step shows at least three decor columns');
   assert.ok(Math.abs(finish.summary.width-finish.workspace.width)<4,'Final summary spans both columns');
   assert.ok(finish.summary.top>=finish.form.bottom-3,'Final summary follows all decor choices');
  }else{
   assert.equal(finish.summaryParent,'configuration');
   assert.equal(finish.columns,2);
  }
  await page.screenshot({path:'wordpress/ci-artifacts/063-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS 0.6.3 '+width+'px – two full-width summaries, isolated B3 text, live decor summary, responsive finale, guarded cart');
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
