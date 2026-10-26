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
   // A1.1 explicitly supersedes the six old "missing source" UI blockers.
   // Legacy API rejection remains covered independently in Node tests.
   check(side+' / '+treatment,!!s.querySelector('#drawing svg')&&s.querySelector('#error').hidden);
   if(treatment==='chamfer_continuous')check(side+' weiche Vorschau, keine scharfe Kontur',s.querySelector('.apl-surface').getAttribute('d').includes('Q'));
   if(treatment==='chamfer_square')check(side+' eckige Diagonalen',!s.querySelector('.apl-surface').getAttribute('d').includes('Q'));
   check(side+' / '+treatment+' Einkauf gesperrt',s.querySelector('#cart').disabled);
  }
 }
 await select('straight-side','both');
 await select('straight-treatment','round');
 s.querySelector('#steps button:nth-child(2)').click();
 await fill('dim-R1','100');await fill('dim-R2','200');
 check('Unabhängige Radien 100 und 200 mm',s.querySelector('#drawing').textContent.includes('R1: 100 mm')&&s.querySelector('#drawing').textContent.includes('R2: 200 mm'));
 s.querySelector('#dim-R2').focus();
 check('Fokus hebt die richtige Ecke hervor',s.querySelector('[data-corner="R2"]').dataset.active==='true');
 await fill('dim-L1','2001');
 check('Ein Millimeter ändert Kontur ohne Umrechnung',s.querySelector('#drawing').textContent.includes('L1: 2001 mm'));
 await fill('dim-R2','600');
 check('Ungültiger Radius löscht alte Kontur',!s.querySelector('#drawing svg')&&!s.querySelector('#error').hidden);
 await select('straight-side','left');
 check('Wechsel entfernt R2 und setzt Maße zurück',!s.querySelector('#dim-R2')&&s.querySelector('#dim-R1').value==='100');
 await fill('dim-L1','2000');
 await select('straight-side','both');await select('straight-treatment','chamfer_square');
 await fill('dim-B2','200');await fill('dim-L2','280');
 check('Linke Schräge unabhängig von rechts',s.querySelector('#drawing').textContent.includes('L2: 280 mm')&&s.querySelector('#drawing').textContent.includes('L3: 150 mm'));
 check('Dynamische Grenze sichtbar',s.querySelector('#hint-L2').textContent.includes('280 mm'));
 await fill('dim-B2','100');
 check('Unzulässige Länge nach Tiefenänderung gesperrt',!s.querySelector('#drawing svg')&&s.querySelector('#dim-L2').getAttribute('aria-invalid')==='true');
 await fill('dim-L2','140');
 check('Nach Korrektur wieder Vorschau',!!s.querySelector('#drawing svg'));
 s.querySelector('#dim-B3').focus();check('Fokus hebt rechte Schräge hervor',s.querySelector('[data-cut="right"]').dataset.active==='true');
 await select('straight-treatment','chamfer_continuous');
 check('Bearbeitungswechsel setzt Schrägenmaße zurück',s.querySelector('#dim-L2').value==='150'&&s.querySelector('#dim-B2').value==='150');
 await fill('dim-L2','200');await fill('dim-B2','300');
 check('Durchlaufende Referenz 200/300 sichtbar',!!s.querySelector('#drawing svg')&&s.querySelector('#drawing').textContent.includes('B2: 300 mm'));
 await fill('dim-L1','2100');
 check('Unbestätigte durchlaufende Plattengröße bleibt gesperrt',!s.querySelector('#drawing svg')&&s.querySelector('#error').textContent.includes('2000 × 600'));
 await fill('dim-L1','2000');
 check('Rückkehr zur Referenzgröße stellt Vorschau her',!!s.querySelector('#drawing svg'));
 await select('straight-treatment','round');
 check('Wechsel entfernt alte Abschrägungsfelder',!s.querySelector('#dim-L2')&&s.querySelector('#dim-R1').value==='100');
 await fill('dim-R1','101');
 check('Eckmaße akzeptieren keine verdeckte Rundung',!s.querySelector('#drawing svg')&&s.querySelector('#error').textContent.includes('10-mm'));
 await fill('dim-R1','100');
 await select('straight-side','none');
 check('Keine Bearbeitung entfernt Sondermaße',s.querySelector('.a1-radii').hidden&&!!s.querySelector('#drawing svg'));
 check('Keine zweite H1',!s.querySelector('h1')||getComputedStyle(s.querySelector('.intro')).display==='none');
 check('Komponentenbutton isoliert',getComputedStyle(s.querySelector('#next')).backgroundColor!=='rgb(255, 0, 255)');
 check('Sichtbare Hilfe und Zusammenfassung ohne cm',!/\bcm\b|Zentimeter/.test(s.querySelector('#help-dialog').textContent+s.querySelector('#summary').textContent));
 check('Eingabeversion ausdrücklich mm',s.querySelector('#dim-L1').value==='2000'&&s.querySelector('#dim-B1').value==='600');
 results.textContent=lines.join('\n')+'\nFERTIG: '+passed+' Prüfungen bestanden.';
}catch(error){results.textContent=lines.join('\n')+'\nFEHLER: '+error.message;}
