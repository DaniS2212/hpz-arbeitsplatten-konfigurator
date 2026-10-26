import {mountConfigurator} from './assets/component.js';
import {preview} from './assets/preview.js';
import {DECOR_CATALOG} from './assets/core/decor-catalog.js';
const root=document.getElementById('test-root'),result=document.getElementById('results'),lines=[];
const wait=()=>new Promise(r=>setTimeout(r,30));
const check=(message,ok)=>{if(!ok)throw new Error(message);lines.push('PASS '+message);result.textContent=lines.join('\n');};
async function ready(s){for(let i=0;i<80;i++){if(s.querySelector('#drawing svg')&&s.querySelector('#drawing').getAttribute('aria-busy')==='false')return;await wait();}throw new Error('Preview timeout');}
async function decode(src){const image=new Image();image.src=src;await image.decode();if(!image.naturalWidth)throw new Error('Image failed: '+src);}
try{
 for(const productId of [1000083,1000080,1000081]){
  mountConfigurator(root,{presentationMode:'embedded',productId},{preview});const s=root.shadowRoot;await ready(s);
  s.querySelector('#steps button:nth-child(3)').click();
  check(productId+': 16 Dekorkarten, kurze Namen',s.querySelectorAll('.decor-card').length===16&&DECOR_CATALOG.every(d=>s.querySelector(`input[name="decor"][value="${d.id}"]`).parentElement.innerText===d.displayName));
  await Promise.all([...s.querySelectorAll('.decor-photo')].map(img=>decode(img.src)));
  const initialPath=s.querySelector('.apl-surface').getAttribute('d');
  for(const decor of DECOR_CATALOG){
   const radio=s.querySelector(`input[name="decor"][value="${decor.id}"]`);radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));await ready(s);
   const image=s.querySelector('#drawing image'),url=image.getAttribute('href');await decode(url);
   check(productId+' / '+decor.displayName+': echtes passendes Bild, Kontur erhalten, Kauf gesperrt',new URL(url).pathname.endsWith('/'+decor.imageFilename)&&s.querySelector('.apl-surface').getAttribute('d')===initialPath&&s.querySelector('#summary').innerText.includes(decor.displayName)&&s.querySelector('#cart').disabled);
  }
  check(productId+': keine sichtbaren Lieferanten-/Artikelnummern',!DECOR_CATALOG.some(d=>s.querySelector('.hpz-apl').innerText.includes(d.id))&&!/EGGER|KAINDL|wünschen Sie|\bIhnen\b/.test(s.querySelector('.hpz-apl').innerText));
  check(productId+': genau eine Zusammenfassung und ein gesperrter Kaufbutton',s.querySelectorAll('.order-summary').length===1&&s.querySelectorAll('#cart').length===1&&s.querySelector('#cart').disabled);
  s.querySelector('#steps button:nth-child(1)').click();s.querySelector('#steps button:nth-child(3)').click();check(productId+': Schrittwechsel erhält Dekor und Zusammenfassung',s.querySelector('input[name="decor"]:checked').value==='44405'&&s.querySelectorAll('.order-summary').length===1);
  s.querySelector('#materials input[value="APL17.5"]').checked=true;s.querySelector('#materials input[value="APL17.5"]').dispatchEvent(new Event('change',{bubbles:true}));await ready(s);check(productId+': Materialwechsel erhält gewähltes Dekor',s.querySelector('input[name="decor"]:checked').value==='44405'&&s.querySelector('#summary').innerText.includes('17,5 mm'));
 }
 check('Unbekanntes Startdekor wird abgelehnt',(()=>{try{mountConfigurator(root,{presentationMode:'embedded',productId:1000083,decorId:'WRONG'},{preview});return false;}catch{return true;}})());
 check('Hauptüberschrift in Du-Ansprache',root.shadowRoot.querySelector('[data-step="0"] h2').textContent==='Deine Arbeitsplatte konfigurieren');
 result.textContent+='\nFERTIG: '+lines.length+' Dekor-Browserprüfungen bestanden.';
}catch(error){result.textContent=lines.join('\n')+'\nFEHLER: '+error.message;}
