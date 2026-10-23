// Real iframe viewport checks; mock shop header is 80px, not an actual Flatsome test.
const result=document.getElementById('results'),frame=document.querySelector('iframe');
const wait=()=>new Promise(r=>setTimeout(r,35));
const lines=[];
try{
 for(const width of [360,390,1366,1440]){
  frame.style.width=width+'px';frame.style.height='900px';
  await new Promise(r=>{frame.onload=r;frame.src='/?sticky=1&widthTest='+width;});
  const doc=frame.contentDocument;
  let s;
  for(let i=0;i<60;i++){s=doc.querySelector('[data-hpz-apl-preview]')?.shadowRoot;if(s?.querySelector('#drawing svg'))break;await wait();}
  const select=s.querySelector('input[name="straight-side"][value="both"]');select.checked=true;select.dispatchEvent(new Event('change',{bubbles:true}));await wait();
  s.querySelector('#steps button:nth-child(2)').click();
  for(const [id,value] of [['R1','10,1'],['R2','20,2']]){const field=s.getElementById('dim-'+id);field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));await wait();}
  const input=s.getElementById('dim-R2');input.scrollIntoView({block:'start'});input.focus();await wait();
  const fieldTop=input.getBoundingClientRect().top,headerBottom=doc.querySelector('.test-header').getBoundingClientRect().bottom;
  if(doc.documentElement.scrollWidth>doc.documentElement.clientWidth)throw new Error(width+'px horizontal overflow');
  if(fieldTop<headerBottom)throw new Error(width+'px active input under header');
  const boxes=[...s.querySelectorAll('#drawing text')].map(e=>e.getBoundingClientRect());
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j];if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)throw new Error(width+'px dimension labels overlap');
  }
  if(!s.querySelector('#cart').disabled)throw new Error('Cart unlocked');
  lines.push(`PASS ${width}px: kein Überlauf, kein Textüberlappen, R2 oberhalb Header (${Math.round(fieldTop)} ≥ ${Math.round(headerBottom)} px), Kauf gesperrt.`);
  result.textContent=lines.join('\n');
 }
 result.textContent+='\nFERTIG: 4 Ansichtsbreiten bestanden.';
}catch(error){result.textContent=lines.join('\n')+'\nFEHLER: '+error.message;}
