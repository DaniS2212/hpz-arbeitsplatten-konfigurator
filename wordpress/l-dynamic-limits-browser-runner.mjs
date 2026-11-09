// Browser RED/GREEN for supplier-photo-specific L corner ranges and
// non-supplier mathematical limits. This is a customer DRAWING preview,
// not evidence for CNC / acceptance / sale.
import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((resolve,reject)=>{
 server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
});
const url='http://127.0.0.1:'+server.address().port+'/?productId=1000080';
await mkdir('dist',{recursive:true});
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const root=()=>page.locator('[data-hpz-apl-preview]');
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('[data-hpz-apl-preview]')?.shadowRoot
   ?.querySelector('#drawing svg title')?.textContent?.startsWith('L1 ·'),null,{timeout:25000});
  async function select(name,value){
   await page.evaluate(({name,value})=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const input=s.querySelector('input[name="'+name+'"][value="'+value+'"]');
    if(!input)throw Error('radio missing '+name+':'+value);
    input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
   },{name,value});
  }
  async function change(id,value){
   await page.evaluate(({id,value})=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const input=s.getElementById(id);if(!input)throw Error('input missing '+id);
    input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
   },{id,value});
  }
  async function observation(){
   return page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const read=id=>s.getElementById(id)?.textContent??'';
    return {l4:read('corner-hint-L4'),b3:read('corner-hint-B3'),
      l4Error:read('corner-field-error-L4'),b3Error:read('corner-field-error-B3'),
      l4Invalid:s.getElementById('corner-L4')?.getAttribute('aria-invalid'),
      b3Invalid:s.getElementById('corner-B3')?.getAttribute('aria-invalid'),
      cartDisabled:s.getElementById('cart')?.disabled,
      over:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
  }
  await select('l-side','both');
  await select('l-treatment','chamfer_square');
  await select('decor','W980');
  await change('dim-L1','200');
  await change('dim-L2','120');
  // B1/B2 default 60 cm in this baseline case.
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('corner-hint-L4')?.textContent.includes('Möglich:');
  },null,{timeout:9000});
  let state=await observation();
  assert.match(state.l4,/Möglich.*135 cm/,'L1 photo case should cap at 135 cm');
  assert.equal(state.cartDisabled,true);
  assert.ok(state.over<=1,'L1 horizontal mobile overflow');
  await page.screenshot({path:'dist/l-visual-photo-L1-'+width+'.png',fullPage:true});
  await change('corner-L4','136');
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('corner-L4')?.getAttribute('aria-invalid')==='true'
    && s.getElementById('corner-field-error-L4')?.textContent.includes('135');
  },null,{timeout:10000});
  state=await observation();
  assert.match(state.l4Error,/135 cm/);assert.equal(state.l4Invalid,'true');
  assert.equal(state.cartDisabled,true);
  await change('dim-L1','250');
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('corner-hint-L4')?.textContent.includes('188 cm')
     && s.getElementById('corner-L4')?.getAttribute('aria-invalid')!=='true';
  },null,{timeout:10000});
  state=await observation();
  assert.match(state.l4,/Möglich.*188 cm/);
  assert.equal(state.cartDisabled,true);
  // L2: screenshot lists B3 60-2000 mm, yet the geometric drawing
  // needs more room on its 600 mm vertical leg. Expose BOTH ranges,
  // never disguise this discrepancy as supplier approval.
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   s.getElementById('geometry').value='L2';
   s.getElementById('geometry').dispatchEvent(new Event('change',{bubbles:true}));
  });
  await select('l-treatment','chamfer_continuous');
  await change('dim-L1','200');
  await change('dim-L2','120');
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('corner-hint-B3')?.textContent.includes('Möglich:');
  },null,{timeout:10000});
  state=await observation();
  assert.match(state.b3,/Möglich.*58 cm/);
  await change('corner-B3','60');
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('corner-B3')?.getAttribute('aria-invalid')==='true'
    && s.getElementById('corner-field-error-B3')?.textContent.includes('58');
  },null,{timeout:10000});
  state=await observation();
  assert.equal(state.cartDisabled,true);
  assert.ok(state.over<=1,'L2 horizontal mobile overflow');
  assert.deepEqual(errors,[],errors.join('; '));
  await page.screenshot({path:'dist/l-visual-photo-L2-'+width+'.png',fullPage:true});
  // PR #42: round R1/R2 are constrained by physical sketch edges, not
  // the supplier chamfer snapshot. The limits follow the selected leg.
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   s.getElementById('geometry').value='L1';
   s.getElementById('geometry').dispatchEvent(new Event('change',{bubbles:true}));
  });
  await select('l-treatment','round');
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('corner-hint-R1')?.textContent.includes('Möglich: 1–58 cm');
  },null,{timeout:12000});
  await change('corner-R1','59');
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('corner-R1')?.getAttribute('aria-invalid')==='true'
      && s.getElementById('corner-field-error-R1')?.textContent.includes('58');
  },null,{timeout:12000});
  await change('corner-R1','58');
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('corner-R1')?.getAttribute('aria-invalid')!=='true'
      && s.querySelector('#drawing svg [data-corner="corner-R1"]');
  },null,{timeout:12000});
  await change('dim-B1','30');
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('corner-hint-R1')?.textContent.includes('Möglich: 1–28 cm')
      && s.getElementById('corner-field-error-R1')?.textContent.includes('28');
  },null,{timeout:12000});
  const roundState=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {r1:s.getElementById('corner-hint-R1').textContent,
      r2:s.getElementById('corner-hint-R2').textContent,
      invalid:s.getElementById('corner-R1').getAttribute('aria-invalid'),
      cartDisabled:s.getElementById('cart').disabled,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  assert.match(roundState.r1,/Möglich: 1–28 cm/);
  assert.match(roundState.r2,/Möglich: 1–58 cm/);
  assert.match(roundState.r1,/Möglich/);
  assert.equal(roundState.invalid,'true');
  assert.equal(roundState.cartDisabled,true);
  assert.ok(roundState.overflow<=1,'L1 round responsive overflow');
  await page.screenshot({path:'dist/l-visual-round-L1-'+width+'.png',fullPage:true});
  console.log('PASS '+width+'px round R1/R2 physical preview limits, no supplier claim, cart blocked');
  console.log('PASS '+width+'px photo input bounds + sketch-only limits + no L checkout');
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
