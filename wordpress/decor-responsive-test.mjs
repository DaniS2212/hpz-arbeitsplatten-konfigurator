const frame=document.querySelector('iframe'),result=document.getElementById('results'),lines=[];
const wait=()=>new Promise(r=>setTimeout(r,35));const check=(name,ok)=>{if(!ok)throw new Error(name);};
try{
 for(const productId of [1000083,1000080,1000081])for(const width of [360,390,1366,1440]){
  frame.style.width=width+'px';frame.style.height='900px';await new Promise(r=>{frame.onload=r;frame.src='/?sticky=1&productId='+productId+'&decorWidth='+width;});
  const doc=frame.contentDocument;let s;
  for(let i=0;i<80;i++){s=doc.querySelector('[data-hpz-apl-preview]')?.shadowRoot;if(s?.querySelector('#drawing svg'))break;await wait();}
  await Promise.all([...s.querySelectorAll('link')].map(l=>l.sheet?Promise.resolve():new Promise(r=>l.addEventListener('load',r,{once:true}))));
  s.querySelector('#steps button:nth-child(3)').click();await wait();
  const cards=[...s.querySelectorAll('.decor-card')];check('16 Karten fehlen',cards.length===16);
  await Promise.all(cards.map(async c=>{const img=c.querySelector('img');img.loading='eager';await img.decode();check('Dekorbild nicht geladen',img.naturalWidth>0);}));
  check(width+' px Überlauf',doc.documentElement.scrollWidth<=doc.documentElement.clientWidth);
  const columns=getComputedStyle(s.querySelector('#decors')).gridTemplateColumns.split(' ').length;
  check(width+' px falsche Spaltenzahl',columns===(width<1101?2:3));
  for(const card of cards){const box=card.getBoundingClientRect();check('Kachel zu klein',box.width>=120&&box.height>=130);check('Label zu klein',parseFloat(getComputedStyle(card.querySelector('strong')).fontSize)>=13);}
  const summary=s.querySelector('.order-summary').getBoundingClientRect(),visual=s.querySelector('.visual-column').getBoundingClientRect();
  check('Zusammenfassung mehrfach',s.querySelectorAll('.order-summary').length===1);check('Kauf entsperrt',s.querySelector('#cart').disabled);
  if(width>760){check('Zusammenfassung füllt Desktopplatz unter Vorschau nicht',Math.abs(summary.left-visual.left)<3&&summary.top>=visual.bottom);}
  else check('Mobile Reihenfolge falsch',summary.top>=s.querySelector('.configuration').getBoundingClientRect().bottom);
  const chosen=s.querySelector('input[name="decor"][value="F021"]');chosen.checked=true;chosen.dispatchEvent(new Event('change',{bubbles:true}));await wait();
  check('Auswahlzustand fehlt',chosen.checked&&s.querySelector('#drawing image').getAttribute('href').includes('F021.webp'));
  s.querySelector('#steps button:nth-child(1)').click();s.querySelector('#steps button:nth-child(3)').click();check('Schrittwechsel dupliziert Zusammenfassung',s.querySelectorAll('.order-summary').length===1);
  lines.push('PASS '+productId+' / '+width+' px: 16 Bilder, große Kacheln, '+columns+' Spalten, kein Überlauf, Auswahl und kompakte Zusammenfassung, Kauf gesperrt.');result.textContent=lines.join('\n');
 }
 result.textContent+='\nFERTIG: '+lines.length+' Dekor-Layoutfälle bestanden.';
}catch(error){result.textContent=lines.join('\n')+'\nFEHLER: '+error.message;}
