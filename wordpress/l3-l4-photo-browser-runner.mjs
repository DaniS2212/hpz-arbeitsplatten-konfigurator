/**
 * Browser regression: photographed L3 PR39 two-seam overview vs. the new
 * four L4 B5=600 originals. Only show observed symbols for exact fixtures;
 * the WooCommerce cart stays blocked for both preview-only shapes.
 */
import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port+'/?productId=1000080';
await mkdir('dist',{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   return s?.getElementById('geometry')?.value==='L1'&&s.querySelector('#drawing svg');
  },null,{timeout:25000});
  const choose=async(name,value)=>page.evaluate(({name,value})=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const r=s.querySelector('input[name="'+name+'"][value="'+value+'"]');
   if(!r)throw Error('Missing '+name+':'+value);
   r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));
  },{name,value});
  const change=async(id,mm)=>page.evaluate(({id,value})=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const field=s.getElementById(id);
   if(!field)throw Error('Missing '+id);
   field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));
  },{id,value:String(mm/10)});
  const status=()=>page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const svg=s.querySelector('#drawing svg');
   return {text:s.getElementById('seam-explain').textContent,
    selected:[...s.querySelectorAll('#seam-choices [aria-pressed="true"]')].map(b=>b.dataset.seam),
    neighborParts:[...svg.querySelectorAll('.apl-preview-part[data-seam-neighbor="true"]')].map(p=>p.dataset.partId),
    availableSeams:[...s.querySelectorAll('#seam-choices [data-seam]')].map(b=>b.dataset.seam),
    cartDisabled:s.getElementById('cart').disabled,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  for(const shape of ['L3','L4']){
   const date=shape==='L3'?'02.11.2026':'05.11.2026';
   await page.evaluate(value=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const r=s.getElementById('geometry');r.value=value;r.dispatchEvent(new Event('change',{bubbles:true}));
   },shape);
   await choose('l-side','none');await choose('material','APL38');await choose('decor','W980');
   for(const [id,mm] of Object.entries({L1:2000,L2:2000,B1:600,B3:900,...(shape==='L4'?{B5:600}:{})}))
    await change('dim-'+id,mm);
   await page.waitForFunction(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('geometry')?.value===shape
      &&s.querySelector('#drawing svg title')?.textContent.startsWith(shape+' ·')
      &&s.getElementById('measurement-error')?.hidden===true;
   },shape,{timeout:25000});
   await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.getElementById('view-parts').click();
   });
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.querySelectorAll('#seam-choices [data-seam]').length===2
      &&s.querySelectorAll('#drawing svg .apl-preview-part').length===3;
   },null,{timeout:25000});
   for(const [seam,neighbors] of [['seam-1',['top','corner']],['seam-2',['corner','leg']]]){
    await page.evaluate(id=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#seam-choices [data-seam="'+id+'"]').click();
    },seam);
    await page.waitForFunction(id=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.querySelector('#seam-choices [data-seam="'+id+'"]')?.getAttribute('aria-pressed')==='true';
    },seam,{timeout:25000});
    const v=await status();
    assert.deepEqual(v.availableSeams,['seam-1','seam-2']);
    assert.deepEqual(v.selected,[seam]);
    assert.deepEqual(v.neighborParts,neighbors);
    assert.match(v.text,new RegExp('Speedmaster-Referenz '+date.replace(/\./g,'\\.')));
    assert.match(v.text,/Flachdübel|Lamello/);assert.match(v.text,/Arbeitsplattenverbinder/);
    assert.match(v.text,/nicht bestätigt|ungeprüft/);
    assert.equal(v.cartDisabled,true);
    assert.ok(v.overflow<=1,shape+' '+width+'px no horizontal overflow');
    if(shape==='L3')assert.match(v.text,/profil.*nicht vollständig/i);
    else assert.match(v.text,/B5-Grundmaß=600 mm/);
    await page.screenshot({path:'dist/l-joint-photo-'+shape+'-'+width+'-'+seam+'.png',fullPage:true});
   }
   await change('dim-L1',2100);
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('dim-L1')?.value==='210'&&s?.getElementById('drawing')?.getAttribute('aria-busy')==='false';
   },null,{timeout:25000});
   assert.doesNotMatch((await status()).text,/Speedmaster-Referenz/);
   await change('dim-L1',2000);
   if(shape==='L4'){
    await change('dim-B5',300);
    await page.waitForFunction(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.getElementById('dim-B5')?.value==='30'&&s?.getElementById('drawing')?.getAttribute('aria-busy')==='false';
    },null,{timeout:25000});
    assert.doesNotMatch((await status()).text,/Speedmaster-Referenz/,'B5 300 cannot inherit B5 600 hardware witness');
   }
   await choose('material','APL17.5');
   assert.doesNotMatch((await status()).text,/Speedmaster-Referenz/,'thickness must invalidate the photo witness');
   assert.equal((await status()).cartDisabled,true);
   console.log('PASS '+shape+' '+width+'px: photographed two-seam note only for exact sample, no CNC, cart blocked');
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
