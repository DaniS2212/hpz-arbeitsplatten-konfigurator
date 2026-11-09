import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

// Tests the ACTUAL WordPress asset bundle; no customer checkout or WP writes.
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  for(const [id,family] of [[1000083,'straight'],[1000080,'l'],[1000081,'u']]){
   const page=await browser.newPage({viewport:{width,height:920}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/?productId='+id,{waitUntil:'domcontentloaded'});
   const ready=()=>page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return !!s?.querySelector('#drawing .apl-surface')
      &&s.getElementById('drawing').getAttribute('aria-busy')==='false';
   },null,{timeout:25000});
   await ready();
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return s&&getComputedStyle(s.querySelector('.stage-top')).display==='none'
      &&getComputedStyle(s.getElementById('parts-note')).display==='none';
   },null,{timeout:25000});
   const hidden=await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    return {pressed:s.getElementById('view-plan').getAttribute('aria-pressed'),
      stage:s.querySelector('.stage-top').hidden,
      tabs:s.querySelector('.view-tabs').hidden,
      parts:s.getElementById('parts-note').hidden,
      partChoices:s.querySelectorAll('#parts-note button').length,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.equal(hidden.stage,true,family+' technical top-view menu hidden');
   assert.equal(hidden.tabs,true);assert.equal(hidden.parts,true);
   assert.equal(hidden.pressed,'true','single top view always active');
   assert.ok(hidden.overflow<=1,'no horizontal overflow at '+width+'px');
   // Dimensions are intentionally absent until step 2.
   await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#steps button:nth-child(2)').click());
   await ready();
   if(family==='straight'){
    await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const side=s.querySelector('input[name="straight-side"][value="right"]');
     side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
     const t=s.querySelector('input[name="straight-treatment"][value="chamfer_square"]');
     t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await ready();
    const visible=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,svg=s.querySelector('#drawing svg');
     const r1=svg.querySelector('[data-field="B1"] .apl-measure-label')?.getBoundingClientRect();
     const r3=svg.querySelector('[data-field="B3"] .apl-measure-label')?.getBoundingClientRect();
     const front=svg.querySelector('g[aria-label="Vorderkante unten"] text');
     const surface=svg.querySelector('.apl-surface');
     return {hasB1:!!r1,hasB3:!!r3,
      b1:r1&&{left:r1.left,right:r1.right,top:r1.top,bottom:r1.bottom},
      b3:r3&&{left:r3.left,right:r3.right,top:r3.top,bottom:r3.bottom},
      frontBottom:front?.getBBox()?.y,frontText:front?.textContent,
      surfaceBottom:(surface?.getBBox()?.y??0)+(surface?.getBBox()?.height??0)};
    });
    assert.equal(visible.hasB1,true);assert.equal(visible.hasB3,true);
    const overlapX=Math.min(visible.b1.right,visible.b3.right)-Math.max(visible.b1.left,visible.b3.left);
    const overlapY=Math.min(visible.b1.bottom,visible.b3.bottom)-Math.max(visible.b1.top,visible.b3.top);
    assert.ok(overlapX<=1||overlapY<=1,
      'B1 and B3 SVG labels cannot collide at '+width+'px; overlap='+overlapX+'x'+overlapY);
    assert.equal(visible.frontText,'Vorderkante');
    assert.ok(visible.frontBottom>=visible.surfaceBottom+8,
      'Vorderkante text must be fully below the slab rather than inside the wood');
    console.log('PASS straight B1/B3 separate, front label below contour at '+width+'px');
   }
   if(family==='u'){
    await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const side=s.querySelector('input[name="u-side"][value="left"]');
     side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
     const t=s.querySelector('input[name="u-treatment"][value="chamfer_square"]');
     t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await ready();
    const square=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.querySelector('#drawing .apl-surface').getAttribute('d'));
    await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const t=s.querySelector('input[name="u-treatment"][value="chamfer_continuous"]');
     t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await ready();
    const soft=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.querySelector('#drawing .apl-surface').getAttribute('d'));
    assert.notEqual(soft,square,'continuous should be visually different, even at equal L4/B4');
    assert.ok(!square.includes(' Q '),'square chamfer has no tangent blending');
    assert.ok(soft.includes(' Q '),'continuous chamfer visibly softens both junctions');
    await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const t=s.querySelector('input[name="u-treatment"][value="round"]');
     t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await ready();
    const label=await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.querySelector('#drawing [data-field="corner-R1"] .apl-measure-label text')?.textContent);
    assert.equal(label,'R1: 10 cm','print localized R1 rather than internal corner-R1');
    console.log('PASS U soft continuous edge and German radius label at '+width+'px');
   }
   assert.deepEqual(errors,[],'no JavaScript errors in '+family);
   await page.close();
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
