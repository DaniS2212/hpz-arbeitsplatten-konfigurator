import {mountConfigurator} from './component.mjs';
const results=[];const check=(name,ok)=>{results.push((ok?'PASS ':'FAIL ')+name);document.getElementById('results').textContent=results.join('\n');if(!ok)throw new Error(name);};
const a=document.getElementById('a'),b=document.getElementById('b');
const wait=()=>new Promise(r=>setTimeout(r,150));
async function ready(root){for(let i=0;i<30;i++){if(root.shadowRoot.querySelector('#drawing svg'))return;await wait();}throw new Error('Vorschau nicht geladen');}
try{
 let handle=mountConfigurator(a,{presentationMode:'embedded',productId:1000083});await ready(a);
 await Promise.all([...a.shadowRoot.querySelectorAll('link')].map(l=>l.sheet?Promise.resolve():new Promise(r=>l.addEventListener('load',r,{once:true}))));
 check('Shadow DOM und kein globales drawing-ID',!!a.shadowRoot&&!document.getElementById('drawing'));
 check('Host-Styles unverändert',getComputedStyle(document.getElementById('outside')).color==='rgb(255, 0, 0)');
 check('Komponentenbutton isoliert',getComputedStyle(a.shadowRoot.querySelector('#next')).color!=='rgb(255, 0, 0)');
 check('Kein sichtbarer zweiter Titel',getComputedStyle(a.shadowRoot.querySelector('.intro')).display==='none');
 check('Form gebunden',a.shadowRoot.querySelector('#products').hidden&&a.shadowRoot.querySelector('.hpz-apl').dataset.product==='straight');
 check('Warenkorb nativ disabled',a.shadowRoot.querySelector('#cart').disabled);
 mountConfigurator(b,{presentationMode:'embedded',sku:'HPZ-APL-L-FORM-2026'});await ready(b);
 a.shadowRoot.querySelector('#enlarge').click();
 const ids=[...a.shadowRoot.querySelectorAll('svg [id]'),...b.shadowRoot.querySelectorAll('svg [id]')].map(e=>e.id);
 check('SVG IDs pro Instanz und Dialog eindeutig',new Set(ids).size===ids.length);
 a.shadowRoot.querySelector('.dialog-close[aria-label="Zeichnung schließen"]').click();
 handle=handle.updateContext({productId:1000081});await ready(a);
 check('updateContext setzt U-Familie',a.shadowRoot.querySelector('.hpz-apl').dataset.product==='u');
 handle.destroy();check('destroy entfernt eigene Oberfläche',a.shadowRoot.children.length===0);
 let signal;handle=mountConfigurator(a,{presentationMode:'embedded',productId:1000083},{preview:(_,options)=>{signal=options.signal;return new Promise(()=>{});}});handle.destroy();
 check('destroy bricht ausstehende Anfrage ab',signal.aborted);
 handle=mountConfigurator(a,{presentationMode:'embedded',productId:1000083});mountConfigurator(a,{presentationMode:'embedded',productId:1000083});await ready(a);
 check('Doppeltes Mount erzeugt genau eine Oberfläche',a.shadowRoot.querySelectorAll('.hpz-apl').length===1);
 check('Unbekanntes Produkt verweigert',(()=>{try{mountConfigurator(a,{presentationMode:'embedded',productId:999985});return false;}catch{return true;}})());
 results.push('FERTIG: '+results.length+' Prüfungen bestanden.');document.getElementById('results').textContent=results.join('\n');
}catch(e){document.getElementById('results').textContent=results.join('\n')+'\nFEHLER: '+e.message;}
