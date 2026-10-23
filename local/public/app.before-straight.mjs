import {catalog,cmToMm} from '/core/config.mjs';
import {svg} from '/core/geometry.mjs';
import {createPreviewController} from '/latest.mjs';
const c=catalog(),$=id=>document.getElementById(id);
const names={straight:'Gerade',l:'L-Form',u:'U-Form'};
const icons={straight:'M8 11 H68 V35 H8 Z',l:'M8 6 H68 V22 H26 V42 H8 Z',u:'M8 6 H68 V42 H51 V22 H25 V42 H8 Z'};
const cornerIcons={square:'M5 25 V5 H30',round:'M5 25 V17 Q5 5 17 5 H30',chamfer:'M5 25 V16 L16 5 H30',continuous:'M5 25 V5 H30 M10 25 V10 H30'};
const cornerNames={square:'Eckig',round:'Abgerundet',chamfer:'Abgeschrägt',continuous:'Durchlaufend'};
const fieldNames={L1:'Gesamtbreite',L2:'Links außen',L3:'Rechts außen',B1:'Tiefe oben',B2:'Breite links',B3:'Breite rechts'};
let product='straight',step=0,active='',lastGeometry=null,showDimensions=true,view='plan',valid=false;
let material='APL38',decor='H1145',corner='square';
const variants={straight:'straight',l:'L1',u:'U1'};
const dimensionValues={L1:'250',L2:'170',L3:'180',B1:'60',B2:'60',B3:'60'};
const money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(value));
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function choice(group,value,html,selected,callback,extraClass){const label=element('label',`choice ${extraClass}`),input=element('input');
  input.type='radio';input.name=group;input.value=value;input.checked=selected;input.addEventListener('change',()=>{if(input.checked)callback(value);});
  label.innerHTML=html;label.prepend(input);return label;}
function showStep(index){step=index;document.querySelectorAll('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==step);
  [...$('steps').children].forEach((e,i)=>{if(i===step)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});
  $('back').disabled=step===0;$('back').style.visibility=step===0?'hidden':'visible';
  $('next').innerHTML=step===0?'Weiter zu den Maßen <span>→</span>':step===1?'Weiter zur Oberfläche <span>→</span>':'Zusammenfassung ansehen <span>↓</span>';
  $('next').disabled=!valid;
}
['Form','Maße','Oberfläche'].forEach((label,i)=>{const b=element('button');b.type='button';b.innerHTML=`<span class="step-number">${i+1}</span>${label}`;b.addEventListener('click',()=>showStep(i));$('steps').append(b);});
function renderChoices(){
  $('products').replaceChildren(...Object.keys(c.families).map(id=>choice('product',id,`<svg viewBox="0 0 76 48" aria-hidden="true"><path d="${icons[id]}"/></svg><span>${names[id]}</span>`,product===id,()=>{product=id;rebuild();refresh();},'shape-card')));
  const visibleCorners=c.corners.filter(v=>v.id!=='continuous'||product!=='straight');
  $('corners').style.gridTemplateColumns=`repeat(${visibleCorners.length===4?2:3},1fr)`;
  $('corners').replaceChildren(...visibleCorners.map(item=>choice('corner',item.id,`<svg viewBox="0 0 36 30" aria-hidden="true"><path d="${cornerIcons[item.id]}"/></svg><span>${cornerNames[item.id]}</span>`,corner===item.id,()=>{corner=item.id;refresh();},'corner-card')));
  $('materials').replaceChildren(...c.materials.map(item=>choice('material',item.id,`<span class="slab ${item.id==='APL17.5'?'slim':''}" aria-hidden="true"></span><strong>${item.id==='APL17.5'?'17,5':'38'} mm</strong><small>${item.id==='APL17.5'?'Schlank & leicht in der Optik':'Klassisch & präsent'}</small>`,material===item.id,()=>{material=item.id;refresh();},'material-card')));
  $('decors').replaceChildren(...c.decors.map(item=>choice('decor',item.id,`<span class="swatch ${item.id==='H1145'?'oak':'white'}" aria-hidden="true"></span><strong>${item.label}</strong><small>${item.surface}</small>`,decor===item.id,()=>{decor=item.id;refresh();},'decor-card')));
}
function rebuild(){
  if(product==='straight'&&corner==='continuous')corner='square';
  renderChoices();$('variant-wrap').hidden=product==='straight';
  $('geometry').replaceChildren(...c.families[product].geometries.map(id=>{const o=element('option','',`${id} · Prüfung offen`);o.value=id;return o;}));$('geometry').value=variants[product];
  $('dimensions').replaceChildren();
  for(const id of c.families[product].fields){
    const wrap=element('div'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    label.htmlFor=`dim-${id}`;label.append(document.createTextNode(product==='straight'?(id==='L1'?'Länge':'Tiefe'):fieldNames[id]),element('span','',id));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=dimensionValues[id];input.setAttribute('aria-describedby','error');
    input.addEventListener('input',()=>{dimensionValues[id]=input.value;refresh();});input.addEventListener('focus',()=>{active=id;renderDrawing();});
    unit.append(input,element('span','','cm'));wrap.append(label,unit);$('dimensions').append(wrap);
  }
}
function payload(){return {product,geometry:variants[product],corner,dimensions:Object.fromEntries(c.families[product].fields.map(k=>[k,dimensionValues[k]])),
  ...(['round','chamfer'].includes(corner)?{special:{size:$('special').value}}:{}),material,decor,quantity:Number($('quantity').value)};}
function renderDrawing(){if(!lastGeometry)return;const markup=svg(lastGeometry,active,{decor,showDimensions});$('drawing').innerHTML=markup;
  if($('drawing-dialog').open)$('large-drawing').innerHTML=svg(lastGeometry,active,{decor,showDimensions:true});}
function summary(config){
  $('summary-shape').textContent=names[product];$('preview-family').textContent=names[product];
  const decorName=c.decors.find(d=>d.id===decor).label;
  $('preview-material').textContent=`${material==='APL38'?'38':'17,5'} mm · ${decorName}`;
  const measures=config?Object.entries(config.dimensions).map(([k,v])=>`${k}: ${new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(v/10)} cm`).join(' · '):'Maße werden geprüft';
  $('summary').replaceChildren(...[['Maße',measures],['Material',`Schichtstoff · ${material==='APL38'?'38':'17,5'} mm`],['Dekor',decorName],['Außenkante','1,5 mm dekorgleich']].map(([k,v])=>{const row=element('div');row.append(element('dt','',k),element('dd','',v));return row;}));
}
function priceDisplay(value,label){$('price').textContent=value;$('price-label').textContent=label;$('mobile-price').textContent=value;$('mobile-price-label').textContent=label;}
const controller=createPreviewController({request:async body=>{const response=await fetch('/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;},
  onPending:()=>{valid=false;$('next').disabled=true;$('drawing').setAttribute('aria-busy','true');$('error').hidden=true;priceDisplay('Wird geprüft …','Deine Konfiguration');$('tax-note').textContent='';$('price-note').textContent='';summary(null);},
  onResult:result=>{valid=true;lastGeometry=result.geometry;$('drawing').setAttribute('aria-busy','false');renderDrawing();summary(result.config);$('next').disabled=false;$('warnings').textContent=result.geometry.warnings.join(' ');
    $('shape-note').textContent=product==='straight'?'Planungsvorschau – Maße und Ausführung vor Bestellung prüfen.':`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`;
    if(result.quote.illustration){priceDisplay(money(result.quote.illustration.gross),`Preisbeispiel${result.config.quantity>1?' · '+result.config.quantity+' Stück':''}`);$('tax-note').textContent='inkl. 19 % MwSt. · zzgl. Kundenversand';$('price-note').textContent='Rechenbeispiel zum belegten Referenzpreis, unter der Annahme einer ungeteilten Platte. Noch kein verbindliches Angebot.';}
    else {priceDisplay('Preis auf Anfrage','Dein Preis');$('tax-note').textContent='Noch kein bestätigter Gesamtpreis';$('price-note').textContent=result.quote.referenceMatched?'Preisreferenz vorhanden. Für den Gesamtpreis fehlen noch die bestätigte Teileaufteilung und Versandprüfung.':'Diese Kombination wird noch geprüft. Wir zeigen keinen geschätzten Bestellpreis.';}
  },onError:error=>{valid=false;lastGeometry=null;$('drawing').replaceChildren();$('drawing').setAttribute('aria-busy','false');$('large-drawing').replaceChildren();$('error').textContent=error.message;$('error').hidden=false;$('shape-note').textContent='Bitte korrigiere deine Maße, damit wir die Vorschau zeichnen können.';priceDisplay('Noch offen','Bitte Maße prüfen');$('price-note').textContent='Für diese Eingabe ist keine gültige Vorschau verfügbar.';}
});
function refresh(){
  $('special-wrap').hidden=!['round','chamfer'].includes(corner);
  $('corner-note').textContent=['round','chamfer'].includes(corner)?'Eckmuster oben links. Größe im Schritt „Maße“ anpassen; Ausführung noch zu prüfen.':corner==='continuous'?'Kontur und Verbindung dieser Ausführung sind noch zu prüfen.':'Klare, rechtwinklige Ecken. Die Außenkante ist im gleichen Dekor vorgesehen.';
  for(const id of c.families[product].fields){const input=$(`dim-${id}`);try{cmToMm(input.value);input.removeAttribute('aria-invalid');}catch{input.setAttribute('aria-invalid','true');}}
  return controller.refresh(payload());
}
$('geometry').addEventListener('change',()=>{variants[product]=$('geometry').value;refresh();});
for(const id of ['quantity','special'])$(id).addEventListener('input',refresh);
for(const [id,amount] of [['minus',-1],['plus',1]])$(id).addEventListener('click',()=>{const n=Number($('quantity').value);$('quantity').value=String(Math.min(1000,Math.max(1,(Number.isFinite(n)?Math.trunc(n):1)+amount)));refresh();});
$('config').addEventListener('submit',event=>event.preventDefault());$('back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
$('next').addEventListener('click',()=>{if(!valid)return;if(step===2)document.querySelector('.order-summary').scrollIntoView({behavior:'smooth',block:'center'});else showStep(step+1);});
$('mobile-summary').addEventListener('click',()=>document.querySelector('.order-summary').scrollIntoView({behavior:'smooth',block:'center'}));
$('measure-toggle').addEventListener('click',()=>{showDimensions=!showDimensions;$('measure-toggle').setAttribute('aria-pressed',String(showDimensions));renderDrawing();});
for(const [id,mode] of [['view-plan','plan'],['view-parts','parts']])$(id).addEventListener('click',()=>{view=mode;$('parts-note').hidden=view!=='parts';$('view-plan').setAttribute('aria-pressed',String(view==='plan'));$('view-parts').setAttribute('aria-pressed',String(view==='parts'));});
$('drawing').addEventListener('click',event=>{const measure=event.target.closest('[data-field]');if(measure){showStep(1);const field=$(`dim-${measure.dataset.field}`);field?.focus();}});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('enlarge').addEventListener('click',()=>{if(!lastGeometry)return;$('drawing-dialog').showModal();renderDrawing();});
for(const dialog of document.querySelectorAll('dialog'))dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
rebuild();showStep(0);refresh();
