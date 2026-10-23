// Browser-only regression tests, deliberately outside the installable plugin.
import {mountConfigurator} from './assets/component.js';
import {preview} from './assets/preview.js';
const root=document.getElementById('test-root'),results=document.getElementById('results');
const lines=[];let passed=0;
const check=(label,condition)=>{if(!condition)throw new Error(label);passed++;lines.push('PASS '+label);results.textContent=lines.join('\n');};
const wait=()=>new Promise(resolve=>setTimeout(resolve,30));
const ready=async()=>{for(let i=0;i<50;i++){if(s.querySelector('#drawing').getAttribute('aria-busy')==='false')return;await wait();}throw new Error('Preview timed out');};
const select=async(name,value)=>{const input=s.querySelector(`input[name="${name}"][value="${value}"]`);input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));await ready();};
const fill=async(id,value)=>{const input=s.getElementById(id);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));await ready();};
mountConfigurator(root,{productId:1000083,presentationMode:'embedded'},{preview});
const s=root.shadowRoot;
try{
 await ready();
 check('Unbearbeitet: Rechteck und Vorderkante unten',s.querySelector('#drawing').textContent.includes('Vorderkante'));
 for(const side of ['left','right','both']){
  await select('straight-side',side);
  for(const treatment of ['round','chamfer_square','chamfer_continuous']){
   await select('straight-treatment',treatment);
   const rounded=treatment==='round';
   check(side+' / '+treatment,rounded?!!s.querySelector('#drawing svg'):!s.querySelector('#drawing svg')&&!s.querySelector('#error').hidden);
   check(side+' / '+treatment+' Einkauf gesperrt',s.querySelector('#cart').disabled);
  }
 }
 await select('straight-side','both');
 s.querySelector('#steps button:nth-child(2)').click();
 await fill('dim-R1','10,1');await fill('dim-R2','20,2');
 check('Unabhängige Radien 101 und 202 mm',s.querySelector('#drawing').textContent.includes('R1: 101 mm')&&s.querySelector('#drawing').textContent.includes('R2: 202 mm'));
 s.querySelector('#dim-R2').focus();
 check('Fokus hebt die richtige Ecke hervor',s.querySelector('[data-corner="R2"]').dataset.active==='true');
 await fill('dim-R1','10,2');
 check('Ein Millimeter ändert Kontur',s.querySelector('#drawing').textContent.includes('R1: 102 mm'));
 await fill('dim-R2','60');
 check('Ungültiger Radius löscht alte Kontur',!s.querySelector('#drawing svg')&&!s.querySelector('#error').hidden);
 await select('straight-side','left');
 check('Wechsel entfernt R2 und setzt Maße zurück',!s.querySelector('#dim-R2')&&s.querySelector('#dim-R1').value==='10');
 await select('straight-side','none');
 check('Keine Bearbeitung entfernt Sondermaße',s.querySelector('.a1-radii').hidden&&!!s.querySelector('#drawing svg'));
 check('Keine zweite H1',!s.querySelector('h1')||getComputedStyle(s.querySelector('.intro')).display==='none');
 check('Komponentenbutton isoliert',getComputedStyle(s.querySelector('#next')).backgroundColor!=='rgb(255, 0, 255)');
 results.textContent=lines.join('\n')+'\nFERTIG: '+passed+' Prüfungen bestanden.';
}catch(error){results.textContent=lines.join('\n')+'\nFEHLER: '+error.message;}
