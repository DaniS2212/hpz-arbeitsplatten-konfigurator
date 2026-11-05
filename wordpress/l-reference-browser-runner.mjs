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
   // Separate private snapshots for the parts and seam selector introduced
   // in PR32/45/46. These are user-interface illustrations, never evidence
   // of supplier CNC joints, actual number of shipped pieces or connector
   // locations. The original supplier reference image remains unchanged.
   const illustratedSeams=['L1','L2'].includes(c.shape)?1:2;
   await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.getElementById('view-parts').click();
   });
   await page.waitForFunction(({shape,count})=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     const svg=s?.querySelector('#drawing svg');
     return s?.getElementById('view-parts')?.getAttribute('aria-pressed')==='true'
       && svg?.querySelector('title')?.textContent.startsWith(shape+' ·')
       && svg.querySelectorAll('.apl-preview-seam').length===count
       && svg.querySelectorAll('.apl-preview-part').length===(count===1?2:3)
       && s.querySelectorAll('#seam-choices [data-seam]').length===count;
   },{shape:c.shape,count:illustratedSeams},{timeout:25000});
   for(let n=1;n<=illustratedSeams;n++){
     const seamId='seam-'+n;
     await page.evaluate(id=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const button=s.querySelector('#seam-choices [data-seam="'+id+'"]');
       if(!button)throw Error('Missing illustrated '+id);
       button.click();
     },seamId);
     const expectedNeighbors=illustratedSeams===1?['top','leg']
       :n===1?['top','corner']:['corner','leg'];
     await page.waitForFunction(({id,neighbors})=>{
       const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
       const svg=s?.querySelector('#drawing svg');
       return s?.getElementById('drawing')?.getAttribute('aria-busy')==='false'
         && s.querySelector('#seam-choices [data-seam="'+id+'"]')?.getAttribute('aria-pressed')==='true'
         && svg?.querySelector('[data-seam-id="'+id+'"]')?.getAttribute('data-selected')==='true'
         && [...svg.querySelectorAll('.apl-preview-part[data-seam-neighbor="true"]')]
              .map(p=>p.dataset.partId).join('|')===neighbors.join('|');
     },{id:seamId,neighbors:expectedNeighbors},{timeout:25000});
     const splitState=await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       return {cart:s.getElementById('cart').disabled,
         numbers:s.querySelectorAll('#drawing svg .apl-part-number').length,
         labels:s.querySelectorAll('#drawing svg .apl-measure').length,
         selectedParts:s.querySelectorAll('#drawing svg .apl-preview-part[data-selected="true"]').length,
         note:s.getElementById('seam-explain').textContent,
         overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
     });
     assert.equal(splitState.cart,true,'L must remain unsaleable in illustrated seam view');
     assert.equal(splitState.numbers,illustratedSeams===1?2:3,'preview piece number count');
     assert.equal(splitState.labels,0,'dimension callouts should be hidden in parts review');
     assert.equal(splitState.selectedParts,0,'seam highlight cannot pretend a single real piece was chosen');
     assert.match(splitState.note,/ungeprüft|unbestätigt|Skizze|Lage/i);
     assert.ok(splitState.overflow<=1,'no mobile overflow while selecting '+seamId);
     assert.deepEqual(errors,[],'no browser error in '+c.shape+' '+seamId);
     await page.screenshot({path:'dist/l-review-'+c.id+'-'+width+'-'+seamId+'.png',fullPage:true});
     console.log('PASS '+c.shape+' '+width+'px '+seamId+': illustrated parts only, cart blocked');
   }
   // Restore the measured plan BEFORE applying the next reference fixture.
   // Otherwise the next case's corner-dimension readiness test would only
   // see the hidden-measure parts view and time out.
   await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.getElementById('view-plan').click();
   });
   await page.waitForFunction(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.getElementById('view-plan')?.getAttribute('aria-pressed')==='true'
       && !!s.querySelector('#drawing svg .apl-measure');
   },null,{timeout:25000});
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
  // PR48: synthetic L4 edge-case (NOT a supplier reference image).
  // A top strip can disappear when L1=B3. Its removed Stoß A must not
  // silently rename the remaining lower Stoß B during live editing.
  for(const [id,mm] of [['B1',300],['B3',950],['L1',950]])
    await change('dim-'+id,mm);
  await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.getElementById('view-parts').click();
  });
  const seamState=()=>page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const svg=s.querySelector('#drawing svg');
    return {
      ids:[...s.querySelectorAll('#seam-choices [data-seam]')].map(b=>b.dataset.seam),
      names:[...s.querySelectorAll('#seam-choices [data-seam]')].map(b=>b.textContent),
      pressed:[...s.querySelectorAll('#seam-choices [data-seam][aria-pressed="true"]')].map(b=>b.dataset.seam),
      highlighted:[...svg.querySelectorAll('.apl-preview-part[data-seam-neighbor="true"]')].map(p=>p.dataset.partId),
      partCount:svg.querySelectorAll('.apl-preview-part').length,
      guidance:s.getElementById('seam-explain').textContent,
      cartDisabled:s.getElementById('cart').disabled,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('view-parts')?.getAttribute('aria-pressed')==='true'
      && s?.querySelectorAll('#seam-choices [data-seam]').length===1
      && s?.querySelector('#seam-choices [data-seam="seam-2"]')!==null
      && s?.querySelectorAll('#drawing svg .apl-preview-part').length===2;
  },null,{timeout:25000});
  let state=await seamState();
  assert.deepEqual(state.ids,['seam-2'],'only lower illustrated joint retains its original key');
  assert.ok(state.names[0].includes('Stoß B'),'lower seam remains named B');
  assert.match(state.guidance,/Wähle Stoß B/,'help text must offer only the remaining seam');
  assert.doesNotMatch(state.guidance,/Stoß A\/B/,'help must not mention an absent upper seam');
  assert.equal(state.cartDisabled,true);
  assert.ok(state.overflow<=1);
  await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.querySelector('#seam-choices [data-seam="seam-2"]').click();
  });
  state=await seamState();
  assert.deepEqual(state.pressed,['seam-2']);
  assert.deepEqual(state.highlighted,['corner','leg']);
  // Return to a three-piece layout and select upper Stoß A.
  await change('dim-L1',2000);
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.querySelectorAll('#seam-choices [data-seam]').length===2
      && !!s.querySelector('#seam-choices [data-seam="seam-1"]');
  },null,{timeout:25000});
  await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.querySelector('#seam-choices [data-seam="seam-1"]').click();
  });
  state=await seamState();
  assert.deepEqual(state.pressed,['seam-1']);
  assert.deepEqual(state.highlighted,['top','corner']);
  // When that upper strip vanishes again, the selected A becomes invalid.
  // It must NOT auto-select lower B or retain stale neighboring highlights.
  await change('dim-L1',950);
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.querySelectorAll('#seam-choices [data-seam]').length===1
      && !!s.querySelector('#seam-choices [data-seam="seam-2"]')
      && !s.querySelector('#seam-choices [aria-pressed="true"]');
  },null,{timeout:25000});
  state=await seamState();
  assert.deepEqual(state.ids,['seam-2']);
  assert.deepEqual(state.pressed,[]);
  assert.deepEqual(state.highlighted,[]);
  assert.equal(state.cartDisabled,true);
  assert.deepEqual(errors,[]);
  console.log('PASS L4 '+width+'px: synthetic collapse/restore preserves Stoß A/B identity, clears stale highlight, cart blocked');
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
