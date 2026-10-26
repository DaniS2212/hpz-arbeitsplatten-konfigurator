import {mountConfigurator} from './hpz-apl-admin-preview/assets/component.js';
import {preview} from './hpz-apl-admin-preview/assets/preview.js';
import {DECOR_CATALOG} from './hpz-apl-admin-preview/assets/core/decor-catalog.js';

const result=document.getElementById('results'),root=document.getElementById('test-root');
const failures=[],notes=[];const pause=ms=>new Promise(r=>setTimeout(r,ms));
const check=(condition,message)=>{if(!condition)throw new Error(message);};
window.addEventListener('error',e=>failures.push('JS error: '+(e.message||e.error?.message||'unknown')));
window.addEventListener('unhandledrejection',e=>failures.push('Unhandled rejection: '+(e.reason?.message||String(e.reason))));
async function ready(shadow){
 for(let i=0;i<120;i++){
  const element=shadow.querySelector('#drawing svg');
  if(element&&shadow.querySelector('#drawing').getAttribute('aria-busy')==='false')return;
  await pause(25);
 }
 throw new Error('Preview request timed out');
}
async function checkImages(shadow){
 const cards=[...shadow.querySelectorAll('.decor-photo')];
 check(cards.length===16,'Not all 16 thumbnails exist');
 for(const img of cards)img.loading='eager';
 await Promise.all(cards.map(async img=>{await img.decode();check(img.naturalWidth>0,'Broken thumbnail '+img.src)}));
 const active=shadow.querySelector('#drawing image')?.getAttribute('href');
 check(active,'No SVG texture');
 const response=await fetch(active,{cache:'no-store'});
 check(response.ok,'SVG texture HTTP '+response.status+' '+active);
 const bitmap=await createImageBitmap(await response.blob());
 check(bitmap.width>0&&bitmap.height>0,'SVG texture not decodable');
 bitmap.close();
}
function select(shadow,selector){
 const radio=shadow.querySelector(selector);
 check(radio,'Option missing: '+selector);
 if(!radio.checked){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
}
function setValue(shadow,selector,value){
 const field=shadow.querySelector(selector);
 check(field,'Input missing: '+selector);
 field.focus();field.value=String(value);field.dispatchEvent(new Event('input',{bubbles:true}));
}
(async()=>{
 try{
  mountConfigurator(root,{presentationMode:'embedded',productId:1000083},{preview});
  const shadow=root.shadowRoot;
  await ready(shadow);let stableFirst=null;
  const sides=['both','left','right','none'];
  const treatments=['chamfer_square','round','chamfer_continuous'];
  for(let i=0;i<60;i++){
    const side=sides[i%sides.length],kind=treatments[i%treatments.length];
    shadow.querySelector('#steps button:nth-child(1)').click();
    select(shadow,`input[name="straight-side"][value="${side}"]`);
    if(side!=='none')select(shadow,`input[name="straight-treatment"][value="${kind}"]`);
    await ready(shadow);
    shadow.querySelector('#steps button:nth-child(2)').click();
    const configImage=shadow.querySelector('.decor-photo');
    if(i===0)stableFirst=configImage;else check(configImage===stableFirst,'Decor cards were unnecessarily recreated at cycle '+i);
    setValue(shadow,'#dim-L1','200');
    setValue(shadow,'#dim-B1','60');
    for(const key of ['R1','R2','L2','B2','L3','B3'])if(shadow.querySelector('#dim-'+key))setValue(shadow,'#dim-'+key,kind==='round'?'10':'15');
    await ready(shadow);
    shadow.querySelector('#steps button:nth-child(3)').click();
    const decor=DECOR_CATALOG[i%DECOR_CATALOG.length];
    select(shadow,`input[name="decor"][value="${decor.id}"]`);
    await ready(shadow);
    check(shadow.querySelector('input[name="decor"]:checked').value===decor.id,'Decor choice mismatched');
    check(shadow.querySelector('#summary').textContent.includes(decor.displayName),'Summary dropped decor');
    check(shadow.querySelector('#cart').disabled,'Cart guard accidentally enabled');
    if(i%6===0)await checkImages(shadow);
    check(shadow.querySelector('.apl-surface')!==null,'Surface disappeared at cycle '+i);
    if(i%10===0){notes.push('PASS cycle '+i+', '+side+'/'+kind+', decor '+decor.id);result.textContent=notes.join('\n');}
  }
  await checkImages(shadow);
  check(failures.length===0,failures.join('; '));
  result.dataset.pass='true';result.textContent=notes.join('\n')+'\nPASS: 60 cycles, 16 WebP thumbnails, SVG texture and cart guard.';
 }catch(e){
  result.dataset.pass='false';result.textContent=notes.join('\n')+'\nFAIL: '+e.stack+'\n'+failures.join('\n');
 }finally{result.dataset.done='true';}
})();
