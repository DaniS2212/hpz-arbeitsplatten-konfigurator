/**
 * Produce reproducible L1-L4 desktop/mobile snapshots for the PRIVATE
 * Speedmaster comparison board. Only the documented reference matrix,
 * never a claim of automatic visual/manufacturing parity.
 */
import {strict as assert} from 'node:assert';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const cases=JSON.parse(await readFile(new URL('../docs/references/speedmaster-lu/REVIEW_CASES.json',import.meta.url),'utf8')).cases;
assert.deepEqual(cases.map(c=>c.id),['L1','L2','L3','L4']);
const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const url='http://127.0.0.1:'+server.address().port+'/?productId=1000080';
await mkdir('dist',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.querySelector('#drawing svg title')?.textContent.startsWith('L1 ·');
  },null,{timeout:25000});
  async function select(name,value){
   await page.evaluate(({name,value})=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const radio=s.querySelector('input[name="'+name+'"][value="'+value+'"]');
    if(!radio)throw Error('Missing '+name+':'+value);
    radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
   },{name,value});
  }
  async function change(id,mm){
   await page.evaluate(({id,cm})=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const el=s.getElementById(id);
    if(!el)throw Error('Missing input '+id);
    el.value=cm;el.dispatchEvent(new Event('input',{bubbles:true}));
   },{id,cm:String(mm/10)});
  }
  for(const c of cases){
   await page.evaluate(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const input=s.getElementById('geometry');
    input.value=shape;input.dispatchEvent(new Event('change',{bubbles:true}));
   },c.shape);
   await page.waitForFunction(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.querySelector('#drawing svg title')?.textContent.startsWith(shape+' ·');
   },c.shape,{timeout:25000});
   await select('l-side','both');
   await select('l-treatment',c.treatment);
   await select('material','APL38');
   await select('decor','W980');
   const visible=['L3','L4'].includes(c.shape)?['L1','L2','B1','B3',...(c.shape==='L4'?['B5']:[])]:['L1','L2','B1','B2'];
   for(const id of visible)await change('dim-'+id,c.dimensions[id]);
   for(const [id,mm] of Object.entries(c.corners))await change('corner-'+id,mm);
   await page.waitForFunction(({shape,fields})=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    const drawing=s?.getElementById('drawing');
    return drawing?.getAttribute('aria-busy')==='false'
     && drawing?.querySelector('svg title')?.textContent.startsWith(shape+' ·')
     && fields.every(id=>!!drawing.querySelector('svg .apl-measure[data-field="corner-'+id+'"]'))
     && s?.getElementById('measurement-error')?.hidden===true
     && !s?.querySelector('.has-measure-error');
   },{shape:c.shape,fields:Object.keys(c.corners)},{timeout:25000});
   const state=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const vals=ids=>Object.fromEntries(ids.map(id=>[id,s.getElementById(id)?.value]));
    const svg=s.querySelector('#drawing svg');
    return {
      dimensions:vals([...s.querySelectorAll('#dimensions input')].map(e=>e.id)),
      corners:vals([...s.querySelectorAll('.a1-radius-field input')].map(e=>e.id)),
      cutCount:svg.querySelectorAll('[data-cut]').length,
      shape:s.getElementById('geometry').value,
      cartBlocked:s.getElementById('cart').disabled,
      error:s.getElementById('measurement-error').textContent,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
   });
   assert.equal(state.shape,c.shape,'Expected L shape '+c.id);
   assert.equal(state.cutCount,2,'Expected left/right cut outlines '+c.id);
   for(const id of visible)assert.equal(state.dimensions['dim-'+id],String(c.dimensions[id]/10),c.id+' '+id);
   for(const [id,mm] of Object.entries(c.corners))
    assert.equal(state.corners['corner-'+id],String(mm/10),c.id+' corner '+id);
   assert.equal(state.cartBlocked,true,c.id+' must not be purchasable');
   assert.ok(state.overflow<=1,c.id+' '+width+'px horizontal overflow');
   assert.deepEqual(errors,[],c.id+' script errors');
   await page.screenshot({path:'dist/l-review-'+c.id+'-'+width+'.png',fullPage:true});
   console.log('PASS '+c.id+' '+width+' px input fixture; image for human supplier comparison, no cart');
  }
  // PR #44: exact customer-provided Speedmaster L4 B5 pair. Both
  // dimensions and the selected contour have to change on mobile/desktop.
  // Supplier source images are human-review evidence, not auto-approved CNC.
  await page.evaluate(()=>{
    const r=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const g=r.getElementById('geometry');g.value='L4';g.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await select('l-side','none');
  for(const [id,mm] of Object.entries({L1:2000,L2:2000,B1:600,B3:900,B5:600}))
    await change('dim-'+id,mm);
  for(const [b5,outer] of [[600,651.47],[300,900]]){
    await change('dim-B5',b5);
    await page.waitForFunction(({outer,b5})=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      const path=s?.querySelector('#drawing svg .apl-surface')?.getAttribute('d')??'';
      const number=Number(path.match(/^M ([0-9.]+) 0/)?.[1]);
      return !!path&&Math.abs(number-outer)<1&&s.getElementById('dim-B5')?.value===String(b5/10);
    },{outer,b5},{timeout:25000});
    const verdict=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const d=s.querySelector('#drawing svg .apl-surface').getAttribute('d');
      return {
        outer:Number(d.match(/^M ([0-9.]+) 0/)?.[1]),
        input:s.getElementById('dim-B5').value,
        cartDisabled:s.getElementById('cart').disabled,
        error:s.getElementById('measurement-error')?.textContent,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
      };
    });
    assert.ok(Math.abs(verdict.outer-outer)<1,'L4 B5 '+b5+' outside point');
    assert.equal(verdict.input,String(b5/10));
    assert.equal(verdict.cartDisabled,true,'L4 remains non-purchasable');
    assert.ok(verdict.overflow<=1,'L4 responsive width '+width);
    assert.deepEqual(errors,[],'No browser errors for L4 '+b5);
    await page.screenshot({path:'dist/l-review-L4-B5-'+b5+'-'+width+'.png',fullPage:true});
    console.log('PASS L4 B5='+b5+' mm '+width+' px: outer='+verdict.outer+' mm, no checkout');
  }
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
