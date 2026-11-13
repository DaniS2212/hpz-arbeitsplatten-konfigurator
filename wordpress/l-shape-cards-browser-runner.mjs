/** L1–L4 icon selector smoke in real packaged plugin (no live order). */
import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((resolve,reject)=>{
 server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?productId=1000080',
    {waitUntil:'domcontentloaded'});
  const ready=()=>page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s?.getElementById('drawing')?.getAttribute('aria-busy')==='false'
      &&!!s.querySelector('#drawing svg');
  },null,{timeout:25000});
  await ready();
  const start=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const group=s.querySelector('#l-variant-options');
    const tiles=[...group.querySelectorAll('.l-variant-card')];
    const style=getComputedStyle(group);
    const select=s.getElementById('geometry');
    return {role:group.getAttribute('role'),
      choices:tiles.map(el=>({
       id:el.querySelector('input')?.value,
       title:el.textContent.trim(),
       svg:el.querySelector('svg')?.dataset.lShape
      })),
      selected:group.querySelector('input:checked')?.value,
      selectValue:select.value,selectHidden:select.getAttribute('aria-hidden'),
      selectTabIndex:select.tabIndex,
      columns:style.gridTemplateColumns.split(' ').length,
      corners:[...s.querySelectorAll('input[name="l-side"]')].map(el=>el.value),
      disabled:s.getElementById('cart').disabled};
  });
  assert.equal(start.role,'radiogroup');
  assert.deepEqual(start.choices.map(x=>x.id),['L1','L2','L3','L4']);
  assert.deepEqual(start.choices.map(x=>x.svg),['L1','L2','L3','L4']);
  assert.match(start.choices[2].title,/Diagonale innen/);
  assert.match(start.choices[3].title,/außen diagonal/);
  assert.equal(start.selected,'L1');
  assert.equal(start.selectValue,'L1');
  assert.equal(start.selectHidden,'true');
  assert.equal(start.selectTabIndex,-1);
  assert.equal(start.columns,2,'compact 2-column tile grid at '+width+'px');
  assert.deepEqual(start.corners,['none','left','right','both']);
  assert.equal(start.disabled,true,'unpublished L product must remain unsellable');
  for(const shape of ['L2','L3','L4','L1']){
    await page.evaluate(id=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const radio=s.querySelector('input[name="l-variant"][value="'+id+'"]');
      radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
    },shape);
    await page.waitForFunction(id=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return s?.getElementById('geometry')?.value===id
        &&s.querySelector('input[name="l-variant"]:checked')?.value===id
        &&s.querySelector('#drawing svg title')?.textContent.startsWith(id+' ·')
        &&s.getElementById('drawing')?.getAttribute('aria-busy')==='false';
    },shape,{timeout:25000});
    const state=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {cards:s.querySelectorAll('.l-variant-card').length,
        corners:s.querySelectorAll('input[name="l-side"]').length,
        summary:s.getElementById('summary-shape').textContent,
        disabled:s.getElementById('cart').disabled,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    assert.equal(state.cards,4);
    assert.equal(state.corners,4);
    assert.equal(state.summary,'L-Form');
    assert.equal(state.disabled,true);
    assert.ok(state.overflow<=1,width+'px '+shape+' overflow '+state.overflow);
  }
  await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const radio=s.querySelector('input[name="l-variant"][value="L4"]');
    radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
    s.querySelector('#steps button:nth-child(2)').click();
  });
  await ready();
  const measures=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {shape:s.querySelector('input[name="l-variant"]:checked')?.value,
      b3:!!s.getElementById('dim-B3'),b5:!!s.getElementById('dim-B5'),
      disabled:s.getElementById('cart').disabled};
  });
  assert.deepEqual(measures,{shape:'L4',b3:true,b5:true,disabled:true},
    'existing L4 measurements and sale gates stay intact');
  assert.deepEqual(errors,[],'no browser JS exceptions');
  await page.close();
  console.log('PASS L1–L4 tiles, shape updates, corners and no overflow @ '+width+'px');
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
