// Additional A1.1 checks. Existing A1 responsive checks remain separately runnable.
const result=document.getElementById('results'),frame=document.querySelector('iframe'),lines=[];
const wait=()=>new Promise(r=>setTimeout(r,35));
let scenarios=0;
const check=(message,ok)=>{if(!ok)throw new Error(message);};
try{
 for(const width of [360,390,1366,1440]){
  frame.style.width=width+'px';frame.style.height='900px';
  await new Promise(r=>{frame.onload=r;frame.src='/?sticky=1&a11Width='+width;});
  const doc=frame.contentDocument;let s;
  for(let i=0;i<70;i++){s=doc.querySelector('[data-hpz-apl-preview]')?.shadowRoot;if(s?.querySelector('#drawing svg'))break;await wait();}
  const ready=async()=>{for(let i=0;i<50;i++){if(s.querySelector('#drawing').getAttribute('aria-busy')==='false')return;await wait();}throw new Error('Timeout');};
  const side=s.querySelector('input[name="straight-side"][value="both"]');side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));await ready();
  for(const kind of ['round','chamfer_square','chamfer_continuous']){
   const choice=s.querySelector(`input[name="straight-treatment"][value="${kind}"]`);choice.checked=true;choice.dispatchEvent(new Event('change',{bubbles:true}));await ready();
   s.querySelector('#steps button:nth-child(2)').click();
   const id=kind==='round'?'R2':'B3',input=s.getElementById('dim-'+id);
   input.scrollIntoView({block:'start'});input.focus();await wait();
   check(width+'px '+kind+' horizontal overflow',doc.documentElement.scrollWidth<=doc.documentElement.clientWidth);
   check(width+'px '+kind+' font too small',parseFloat(getComputedStyle(input).fontSize)>=16);
   check(width+'px '+kind+' field under sticky header',input.getBoundingClientRect().top>=doc.querySelector('.test-header').getBoundingClientRect().bottom);
   check('Cart unlocked',s.querySelector('#cart').disabled);
   const boxes=[...s.querySelectorAll('#drawing text')].map(e=>e.getBoundingClientRect());
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];check(width+'px '+kind+' overlapping main labels',!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top));}
   s.querySelector('#enlarge').click();await wait();
   if(width<760){
    check('Mobile detail should open on active right corner',s.querySelector('[data-detail="right"]').getAttribute('aria-pressed')==='true');
    const large=s.querySelector('#large-drawing svg'),outer=large.getBoundingClientRect();
    const labels=[...large.querySelectorAll('text')];
    for(const label of labels){
     const box=label.getBoundingClientRect();
     check(width+'px '+kind+' cropped detail label: '+label.textContent,box.left>=outer.left-1&&box.right<=outer.right+1&&box.top>=outer.top-1&&box.bottom<=outer.bottom+1);
     const renderedSize=Number(label.getAttribute('font-size'))*Math.hypot(label.getScreenCTM().a,label.getScreenCTM().b);
     if(!label.classList.contains('schematic-label'))check(width+'px '+kind+' unreadable detail number',renderedSize>=12);
    }
    for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i].getBoundingClientRect(),b=labels[j].getBoundingClientRect();check(width+'px '+kind+' overlapping detail labels',!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top));}
   }
   s.querySelector('#drawing-dialog .dialog-close').click();
   scenarios++;lines.push(`PASS ${width}px / ${kind}: Überlauf, Beschriftungen, 16px-Eingabe, Sticky Header, Detailansicht, Kaufsperre.`);result.textContent=lines.join('\n');
  }
 }
 result.textContent+='\nFERTIG: '+scenarios+' A1.1-Layoutfälle bestanden.';
}catch(error){result.textContent=lines.join('\n')+'\nFEHLER: '+error.message;}
