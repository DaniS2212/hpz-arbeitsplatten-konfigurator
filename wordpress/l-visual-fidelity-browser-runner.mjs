// Real Chromium rendering for the two photographed L1/L2 front-chamfer cases.
// Screenshots are CI artifacts for HUMAN comparison with Speedmaster; without
// manufacturer golden images, automated tests do not claim full visual parity.
import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const base='http://127.0.0.1:'+server.address().port;
await mkdir('dist',{recursive:true});
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]) {
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/?productId=1000080',{waitUntil:'domcontentloaded'});
  const ready=shape=>page.waitForFunction(shape=>{
   const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
   const svg=s?.querySelector('#drawing svg');
   return svg&&svg.querySelector('title')?.textContent.startsWith(shape+' ·');
  },shape,{timeout:25000});
  // WordPress bootstrap loads modules asynchronously; wait before touching shadow DOM.
  await ready('L1');
  for(const shape of ['L1','L2']) {
   await page.evaluate(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    s.querySelector('#geometry').value=shape;
    s.querySelector('#geometry').dispatchEvent(new Event('change',{bubbles:true}));
   },shape);
   await ready(shape);
   await page.evaluate(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
    const radio=s.querySelector('input[name="l-side"][value="both"]');
    radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
   });
   await page.waitForFunction(()=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    return !!s?.querySelector('#corner-R1')&&!!s?.querySelector('#corner-R2');
   });
   for(const treatment of ['chamfer_square','chamfer_continuous']) {
    await page.evaluate(treatment=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const radio=s.querySelector('input[name="l-treatment"][value="'+treatment+'"]');
     radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
    },treatment);
    await page.waitForFunction(shape=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     const svg=s?.querySelector('#drawing svg');
     const d=svg?.querySelector('.apl-surface')?.getAttribute('d')??'';
     return svg?.querySelector('title')?.textContent.startsWith(shape+' ·')
      && !!s.querySelector('#corner-L3')&&!!s.querySelector('#corner-B3')
      && d.includes(' L ')&&!/[QA] [0-9]/.test(d);
    },shape,{timeout:25000});
    const result=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const svg=s.querySelector('#drawing svg'),surface=svg.querySelector('.apl-surface');
     const label=(field)=>{
      const rect=svg.querySelector('.apl-measure[data-field="'+field+'"] .apl-measure-label rect');
      if(!rect)throw Error('missing drawn measure '+field);
      const box=rect.getBBox();
      const center=new DOMPoint(box.x+box.width/2,box.y+box.height/2)
       .matrixTransform(rect.getScreenCTM());
      const inside=surface.isPointInFill(center.matrixTransform(surface.getScreenCTM().inverse()));
      return {inside,box:rect.getBoundingClientRect().toJSON()};
     };
     const b1=label('B1'),b3=label('corner-B3'),l3=label('corner-L3');
     const intersect=(a,b)=>{
      const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
      const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      return x*y;
     };
     const continuous=s.querySelector('input[name="l-treatment"][value="chamfer_continuous"]')?.checked;
     const icon=s.querySelector('input[name="l-treatment"][value="chamfer_continuous"]')?.closest('label')
      ?.querySelector('svg path')?.getAttribute('d')??'';
     return {cut:s.querySelector('#drawing [data-cut="left"]')!==null,iconsAngular:!/[QA] [0-9]/.test(icon),
      b1OnWood:b1.inside,b3OnWood:b3.inside,l3OnWood:l3.inside,
      b1B3OverlapPx2:intersect(b1.box,b3.box),horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      cartDisabled:s.querySelector('#cart').disabled,continuous};
    });
    assert.equal(result.cut,true,shape+' '+treatment+' must draw a chamfer');
    assert.equal(result.iconsAngular,true,'continuous-edge icon must be angular');
    assert.equal(result.b1OnWood,false,shape+' B1 opaque label over textured worktop');
    assert.equal(result.b3OnWood,false,shape+' B3 opaque label over textured worktop');
    assert.equal(result.l3OnWood,false,shape+' L3 opaque label over textured worktop');
    assert.ok(result.b1B3OverlapPx2<1,shape+' B1/B3 label collision: '+result.b1B3OverlapPx2);
    assert.ok(result.horizontalOverflow<=1,shape+' mobile overflow '+result.horizontalOverflow);
    assert.equal(result.cartDisabled,true,'L purchase must remain blocked');
    assert.equal(result.continuous,treatment==='chamfer_continuous');
    await page.screenshot({path:'dist/l-visual-'+shape+'-'+treatment+'-'+width+'.png',fullPage:true});
    console.log('PASS '+shape+' '+treatment+' '+width+'px: labels on clear space, angular contour, cart blocked');
   }
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
} finally {
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
