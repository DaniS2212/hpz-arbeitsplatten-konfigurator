/**
 * Last-mile real WordPress-package customer interaction audit.
 * Covers all 9 concrete shapes at desktop/mobile: partial corner number,
 * blur validation, readable messages, live contour preserved, repair,
 * dynamic field focus and no internal approval/error leakage.
 * Test pages only – no Woo orders, no real shipping, no supplier requests.
 */
import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
let browser,checked=0;
const cases=[
  ['straight',1000083,'straight-side','straight-treatment',null,'dim-L3','L3'],
  ['L1',1000080,'l-side','l-treatment','L1','corner-L4','L4'],
  ['L2',1000080,'l-side','l-treatment','L2','corner-L4','L4'],
  ['L3',1000080,'l-side','l-treatment','L3','corner-L6','L6'],
  ['L4',1000080,'l-side','l-treatment','L4','corner-L6','L6'],
  ['U1',1000081,'u-side','u-treatment','U1','corner-L5','L5'],
  ['U2',1000081,'u-side','u-treatment','U2','corner-L5','L5'],
  ['U3',1000081,'u-side','u-treatment','U3','corner-L5','L5'],
  ['U4',1000081,'u-side','u-treatment','U4','corner-L5','L5']
];
try{
 await mkdir('dist',{recursive:true});
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390])for(const [shape,id,sideGroup,typeGroup,variant,fieldName,key] of cases){
  const page=await browser.newPage({viewport:{width,height:920}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?productId='+id,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return !!s?.querySelector('#drawing .apl-surface')
      &&s.getElementById('drawing')?.getAttribute('aria-busy')==='false';
  },null,{timeout:25000});
  await page.evaluate(({sideGroup,typeGroup,variant})=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    if(variant){
      const v=s.getElementById('geometry');
      v.value=variant;v.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const side=s.querySelector('input[name="'+sideGroup+'"][value="both"]');
    if(!side)throw new Error('Missing two-corner selection');
    side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
    const t=s.querySelector('input[name="'+typeGroup+'"][value="chamfer_square"]');
    if(!t)throw new Error('Missing chamfer option');
    t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));
    s.getElementById('steps').querySelector('button:nth-child(2)').click();
  },{sideGroup,typeGroup,variant});
  await page.waitForFunction(({fieldName,shape})=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return !!s?.getElementById(fieldName)
      &&s.querySelector('#drawing svg title')?.textContent.startsWith((shape==='straight'?'Gerade':shape)+' ·')
      &&!s.getElementById('next').disabled
      &&s.querySelector('.hpz-apl')?.dataset.measureInvalid==='false';
  },{fieldName,shape},{timeout:25000});
  const initial=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
    .shadowRoot.querySelector('#drawing .apl-surface')?.getAttribute('d'));
  await page.evaluate(fieldName=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const input=s.getElementById(fieldName);
    input.focus();input.value='1';input.dispatchEvent(new Event('input',{bubbles:true}));
  },fieldName);
  await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    const shell=s?.querySelector('.hpz-apl');
    return shell?.dataset.measureEditing==='true'&&shell?.dataset.measureInvalid==='true'
      &&s?.getElementById('next').disabled;
  },null,{timeout:15000});
  const partial=await page.evaluate(fieldName=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {errorHidden:s.getElementById('measurement-error').hidden,
      aria:s.getElementById(fieldName).getAttribute('aria-invalid'),
      cart:s.getElementById('cart').disabled,
      price:s.getElementById('price').textContent,
      surface:s.querySelector('#drawing .apl-surface')?.getAttribute('d')};
  },fieldName);
  assert.equal(partial.errorHidden,true,shape+' should not flash error while typing "1"');
  assert.equal(partial.aria,null,'unfinished partial text is not red');
  assert.equal(partial.cart,true);assert.equal(partial.price,'–');
  assert.equal(partial.surface,initial,'invalid input retains last valid drawing');
  await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
    .shadowRoot.getElementById('back').focus());
  await page.waitForFunction(fieldName=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById(fieldName)?.getAttribute('aria-invalid')==='true'
      &&!s?.getElementById('measurement-error').hidden
      &&s?.querySelector('.hpz-apl')?.dataset.measureEditing==='false';
  },fieldName,{timeout:15000});
  const error=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {
      message:s.getElementById('measurement-error').textContent,
      summary:s.getElementById('summary').textContent,
      nextDisabled:s.getElementById('next').disabled,
      labels:s.querySelectorAll('#drawing svg .apl-measure').length,
      horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
  assert.match(error.message,new RegExp('\\('+key+'\\)'),shape+' correct input label');
  assert.match(error.message,/Erlaubt sind 6–\d+ cm/);
  assert.doesNotMatch(error.message,/corner-|Herstellerfreigabe|Fertigungsfreigabe|nur Vorschau|Speedmaster|\\bmm\\b/i);
  assert.equal(error.nextDisabled,true);
  assert.match(error.summary,/Maße/);
  assert.ok(error.horizontalOverflow<=1,'no overflow '+shape+'/'+width);
  if(shape==='L4'){
    // An invalid step-2 number must not trap the shopper at step 1.
    await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.getElementById('back').click());
    const back=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {step:s.querySelector('.hpz-apl').dataset.currentStep,
        nextDisabled:s.getElementById('next').disabled};
    });
    assert.equal(back.step,'0');
    assert.equal(back.nextDisabled,false,'allow returning to measure editing without bypassing validation');
    await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.getElementById('next').click());
    const forward=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {step:s.querySelector('.hpz-apl').dataset.currentStep,
        nextDisabled:s.getElementById('next').disabled};
    });
    assert.equal(forward.step,'1');
    assert.equal(forward.nextDisabled,true,'next step still guarded by invalid measure');
    await page.screenshot({path:'dist/last-mile-L4-'+width+'.png',fullPage:true});
  }
  await page.evaluate(fieldName=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,field=s.getElementById(fieldName);
    field.focus();field.value='15';field.dispatchEvent(new Event('input',{bubbles:true}));
  },fieldName);
  await page.waitForFunction(fieldName=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('measurement-error').hidden
      &&s?.getElementById(fieldName)?.getAttribute('aria-invalid')===null
      &&s?.querySelector('.hpz-apl')?.dataset.measureInvalid==='false'
      &&!s?.getElementById('next').disabled;
  },fieldName,{timeout:25000});
  if(shape==='L4'){
    await page.evaluate(fieldName=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,field=s.getElementById(fieldName);
      field.value='abc';field.dispatchEvent(new Event('input',{bubbles:true}));
    },fieldName);
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return !s?.getElementById('measurement-error').hidden;
    },null,{timeout:15000});
    const nonNumber=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.getElementById('measurement-error').textContent);
    assert.match(nonNumber,/Rechte Ecke · Länge \(L6\).*Bitte eine Zahl in cm eingeben/);
    assert.doesNotMatch(nonNumber,/corner-/);
  }
  assert.deepEqual(errors,[],shape+' browser exceptions '+width);
  await page.close();
  checked++;
 }
 console.log('PASS '+checked+' straight/L1-L4/U1-U4 browser measurement states, responsive + blur + recovery (no checkout)');
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
