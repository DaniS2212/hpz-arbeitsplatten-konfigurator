// Chromium evidence for all four photographed Speedmaster L1-L4 corner variants.
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
  for(const shape of ['L1','L2','L3','L4']) {
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
   await page.waitForFunction(shape=>{
    const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
    // Changing the shape preserves the currently selected corner treatment;
    // round-specific R1/R2 fields are therefore NOT guaranteed.
    return !!s?.querySelector('input[name="l-side"][value="both"]')?.checked
      && !!s?.querySelector('#drawing svg title')?.textContent.startsWith(shape+' ·');
   },shape,{timeout:25000});
   for(const treatment of ['chamfer_square','chamfer_continuous']) {
    await page.evaluate(treatment=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const radio=s.querySelector('input[name="l-treatment"][value="'+treatment+'"]');
     radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
    },treatment);
    await page.waitForFunction(({shape,treatment})=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     const svg=s?.querySelector('#drawing svg');
     const d=svg?.querySelector('.apl-surface')?.getAttribute('d')??'';
     const cornerSuffix=['L3','L4'].includes(shape)?'5':'3';
     const curves=(d.match(/\bQ\b/g)||[]).length;
     return svg?.querySelector('title')?.textContent.startsWith(shape+' ·')
      && !!s.querySelector('#corner-L'+cornerSuffix)&&!!s.querySelector('#corner-B'+cornerSuffix)
      && d.includes(' L ')
      && (treatment==='chamfer_continuous'?curves===4:curves===0);
    },{shape,treatment},{timeout:25000});
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
     const suffix=['L3','L4'].includes(s.querySelector('#geometry').value)?'5':'3';
     const b1=label('B1'),b3=label('corner-B'+suffix),l3=label('corner-L'+suffix);
     const intersect=(a,b)=>{
      const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
      const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      return x*y;
     };
     const continuous=s.querySelector('input[name="l-treatment"][value="chamfer_continuous"]')?.checked;
     const icon=s.querySelector('input[name="l-treatment"][value="chamfer_continuous"]')?.closest('label')
      ?.querySelector('svg path')?.getAttribute('d')??'';
     // A label can be clear of the textured fill yet cover ANOTHER label.
     // Check ALL visible callouts, not just the previously reported B1/B3 pair.
     const labels=[...svg.querySelectorAll('.apl-measure .apl-measure-label rect')].map(rect=>({
       id:rect.closest('.apl-measure')?.getAttribute('data-field')??'?...',
       box:rect.getBoundingClientRect().toJSON()
     }));
     // SVG objects can exist in the DOM while being cut off by viewBox.
     const frame=svg.getBoundingClientRect();
     const clippedLabels=labels.filter(l=>l.box.left<frame.left-1||l.box.right>frame.right+1
       ||l.box.top<frame.top-1||l.box.bottom>frame.bottom+1).map(l=>l.id);
     const labelOverlaps=[];
     for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
       const a=labels[i],b=labels[j];
       const dx=Math.max(0,Math.min(a.box.right,b.box.right)-Math.max(a.box.left,b.box.left));
       const dy=Math.max(0,Math.min(a.box.bottom,b.box.bottom)-Math.max(a.box.top,b.box.top));
       const area=dx*dy,minArea=Math.min(a.box.width*a.box.height,b.box.width*b.box.height);
       if(minArea>0&&area/minArea>.08)labelOverlaps.push(a.id+' / '+b.id);
     }
     return {labelOverlaps,clippedLabels,cut:s.querySelector('#drawing [data-cut="left"]')!==null,iconsAngular:!/[QA] [0-9]/.test(icon),
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
    assert.deepEqual(result.labelOverlaps,[],shape+' '+treatment+' overlapping dimensions (B2 vs upper corner etc.)');
    assert.deepEqual(result.clippedLabels,[],shape+' '+treatment+' dimension text clipped by SVG viewport');
    assert.ok(result.horizontalOverflow<=1,shape+' mobile overflow '+result.horizontalOverflow);
    assert.equal(result.cartDisabled,true,'L purchase must remain blocked');
    assert.equal(result.continuous,treatment==='chamfer_continuous');
    await page.screenshot({path:'dist/l-visual-'+shape+'-'+treatment+'-'+width+'.png',fullPage:true});
    console.log('PASS '+shape+' '+treatment+' '+width+'px: labels in clear space, long diagonal and subtle transition, cart blocked');
   }
   // Visual-only supplier seam review: make the true screenshot locations
   // inspectable without implying a connector count, CNC path or sale.
   await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#view-parts').click();
   });
   const expectedJoints=['L1','L2'].includes(shape)?1:2;
   await page.waitForFunction(count=>{
     const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
     return s?.querySelectorAll('#seam-choices [data-seam]').length===count
       && s?.querySelectorAll('#drawing svg [data-seam-id]').length===count;
   },expectedJoints,{timeout:25000});
   const chosen='seam-'+expectedJoints;
   await page.evaluate(id=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#seam-choices [data-seam="'+id+'"]').click();
   },chosen);
   const review=await page.evaluate(id=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     const line=s.querySelector('#drawing svg [data-seam-id="'+id+'"]');
     return {
       active:line?.getAttribute('data-selected'),
       button:s.querySelector('#seam-choices [data-seam="'+id+'"]')?.getAttribute('aria-pressed'),
       explanation:s.querySelector('#seam-explain')?.textContent??'',
       neighbors:[...s.querySelectorAll('#drawing svg .apl-preview-part[data-seam-neighbor="true"]')]
         .map(p=>p.dataset.partId),
       selectedParts:[...s.querySelectorAll('#drawing svg .apl-preview-part[data-selected="true"]')]
         .map(p=>p.dataset.partId),
       cartDisabled:s.querySelector('#cart').disabled,
       horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
     };
   },chosen);
   assert.equal(review.active,'true',shape+' selected seam must be visibly highlighted');
   assert.equal(review.button,'true',shape+' seam button must announce pressed state');
   assert.match(review.explanation,/Fräs|Verbinder|nicht bestätigt|noch ungeprüft/);
   // The selected illustrated joint must emphasize exactly the two
   // neighboring areas, never all pieces or an invented connector.
   assert.deepEqual(review.neighbors,expectedJoints===1?['top','leg']:['corner','leg'],
     shape+' seam '+chosen+' must highlight only adjacent areas');
   assert.deepEqual(review.selectedParts,[],'no part was individually selected');
   assert.equal(review.cartDisabled,true);
   assert.ok(review.horizontalOverflow<=1,shape+' seam UI mobile overflow');
   await page.screenshot({path:'dist/l-visual-joint-'+shape+'-'+width+'.png',fullPage:true});
   await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     s.querySelector('#view-plan').click();
   });
   if(shape==='L4') {
     // B5 in the BASIC L4 geometry is different from the corner-B5 cut.
     await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.querySelector('#dim-B5').dispatchEvent(new Event('focus'));
     });
     await page.waitForFunction(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
       return s?.querySelector('#drawing svg .apl-measure[data-field="B5"][data-active="true"]');
     },null,{timeout:25000});
     const clear=await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const svg=s.querySelector('#drawing svg');
       const text=svg.querySelector('.apl-measure[data-field="B5"] .apl-measure-label rect');
       const surface=svg.querySelector('.apl-surface');
       const bbox=text.getBBox(),point=new DOMPoint(bbox.x+bbox.width/2,bbox.y+bbox.height/2)
        .matrixTransform(text.getScreenCTM());
       return !surface.isPointInFill(point.matrixTransform(surface.getScreenCTM().inverse()));
     });
     assert.equal(clear,true,'L4 B5 opaque diagonal label must not hide the real worktop surface');
     await page.screenshot({path:'dist/l-visual-L4-B5-focus-'+width+'.png',fullPage:true});
   }
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
} finally {
 await browser?.close();
 await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
