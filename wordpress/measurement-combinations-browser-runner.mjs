import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

// The customer's request is a clean, stable measuring experience, not a
// set of isolated screenshots. Audit actual DOM coordinates at 2 viewports.
const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
const collisionsFound=[];
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
       &&s.getElementById('drawing')?.getAttribute('aria-busy')==='false';
   },null,{timeout:25000});
   await ready();
   const first=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return {labels:s.querySelectorAll('#drawing .apl-measure').length,
       front:s.querySelector('#drawing g[aria-label="Vorderkante unten"]')?.textContent??'',
       box:s.querySelector('#drawing svg').getAttribute('viewBox')};
   });
   assert.equal(first.labels,0,family+' step 1 must NOT display any dimensions');
   assert.equal(first.front,'',family+' step 1 is clean of front lettering');
   await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
     .shadowRoot.querySelector('#steps button:nth-child(2)').click());
   await ready();
   const second=await page.evaluate(()=>{
     const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
     return {labels:s.querySelectorAll('#drawing .apl-measure').length,
       box:s.querySelector('#drawing svg').getAttribute('viewBox')};
   });
   assert.ok(second.labels>=2,family+' step 2 restores measurements');
   assert.notEqual(second.box,first.box,'step 1 zoom must focus on actual shape');
   const select=async(group,value)=>{
     await page.evaluate(({group,value})=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const el=s.querySelector('input[name="'+group+'"][value="'+value+'"]');
       if(!el)throw Error('Missing '+group+' '+value);
       el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));
     },{group,value});await ready();
   };
   const shape=async(value)=>{
     await page.evaluate(value=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       s.getElementById('geometry').value=value;
       s.getElementById('geometry').dispatchEvent(new Event('change',{bubbles:true}));
     },value);await ready();
   };
   const audit=async(label)=>{
     const data=await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,svg=s.querySelector('#drawing svg');
       const labels=[...svg.querySelectorAll('.apl-measure-label')].map(el=>{
         const r=el.getBoundingClientRect();
         return {id:el.closest('.apl-measure')?.getAttribute('data-field')??'? '+el.textContent,
           x:r.x,y:r.y,w:r.width,h:r.height};
       });
       const collisions=[];
       for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
         const a=labels[i],b=labels[j];
         const area=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))
           *Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
         if(area>Math.min(a.w*a.h,b.w*b.h)*.06)
           collisions.push(a.id+'/'+b.id+': '+area.toFixed(0)+'px²');
       }
       return {collisions,labels:labels.map(({id,x,y,w,h})=>({id,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)})),
         overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
         view:svg.getAttribute('viewBox'),path:svg.querySelector('.apl-surface')?.getAttribute('d')??''};
     });
     assert.equal(data.overflow<=1,true,family+' '+label+' @'+width+' unexpected horizontal overflow');
     if(data.collisions.length){
       const issue=family+' '+label+' @'+width+' '+JSON.stringify(data.collisions)+' '+JSON.stringify(data.labels);
       collisionsFound.push(issue);console.log('MEASURE COLLISION '+issue);
     }
     return data;
   };
   if(family==='straight'){
     await select('straight-side','both');
     for(const t of ['round','chamfer_square','chamfer_continuous']){
       await select('straight-treatment',t);await audit(t);
     }
   }else if(family==='l'){
     await select('l-side','both');
     for(const variant of ['L1','L2','L3','L4']){
       await shape(variant);
       for(const t of ['round','chamfer_square','chamfer_continuous']){
         await select('l-treatment',t);await audit(variant+' '+t);
       }
     }
     await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const f=s.getElementById('dim-B5');f.focus();f.dispatchEvent(new Event('focus',{bubbles:true}));
     });await ready();
     const b5=await page.evaluate(()=>{
       const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
       const svg=s.querySelector('#drawing svg');
       return {selected:svg.querySelector('.apl-measure[data-field="B5"]')?.getAttribute('data-active'),
         guide:svg.querySelector('[data-b5-axis="diagonal"]')?.getAttribute('d')??null};
     });
     assert.equal(b5.selected,'true','L4 B5 setting is active');
     assert.ok(b5.guide&&b5.guide.includes(' L '),'B5 dashed line must span diagonals within plate');
   }else{
     await select('u-side','both');
     for(const variant of ['U1','U2','U3','U4']){
       await shape(variant);
       for(const t of ['round','chamfer_square','chamfer_continuous']){
         await select('u-treatment',t);await audit(variant+' '+t);
       }
     }
   }
   await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
     .shadowRoot.querySelector('#steps button:nth-child(3)').click());
   await ready();
   assert.ok(await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]')
     .shadowRoot.querySelectorAll('#drawing .apl-measure').length)>0,
     'step 3 retains readable dimension drawing');
   assert.deepEqual(errors,[],'JavaScript exceptions in '+family);
   console.log('PASS '+family+' systematic stage/dimension audit @ '+width+'px');
   await page.close();
  }
 }
 assert.deepEqual(collisionsFound,[],'Unexpected visible measurement label intersections');
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
