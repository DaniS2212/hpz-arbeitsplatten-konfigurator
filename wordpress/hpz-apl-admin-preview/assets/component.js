import {catalog,cmToMm} from './core/config.js?v=0.2.0';
import {svg} from './core/geometry.js?v=0.2.0';
import {createPreviewController} from './latest.js?v=0.2.0';
import {template} from './component-template.js?v=0.2.0';
import {resolveProduct} from './core/products.js?v=0.2.0';
import {sides,treatments,straightCorner} from './core/straight-corners.js?v=0.2.0';
const mounts=new WeakMap();let sequence=0;
export function mountConfigurator(root,context={},adapters={}){
 const embedded=context.presentationMode==='embedded';
 const resolved=embedded?resolveProduct(context):null;
 if(context.family&&resolved&&context.family!==resolved.family)throw new Error('Produktfamilie passt nicht.');
 mounts.get(root)?.destroy();
 const shadow=root.shadowRoot||root.attachShadow({mode:'open'});
 const shell=document.createElement('div');shell.className='hpz-apl';shell.dataset.mode=embedded?'embedded':'demo';
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./component.css?v=0.2.0',import.meta.url).href;
 shell.innerHTML=template;shadow.replaceChildren(link,shell);
 const abort=new AbortController();let disposed=false;const instance='hpz-apl-'+(++sequence);
 function namespaceSvg(markup,view){return markup.replaceAll('apl-arrow',instance+'-'+view+'-arrow').replaceAll('apl-white',instance+'-'+view+'-white').replaceAll('apl-oak',instance+'-'+view+'-oak');}
const c=catalog(),$=id=>shadow.getElementById(id);
const names={straight:'Gerade',l:'L-Form',u:'U-Form'};
const icons={straight:'M8 11 H68 V35 H8 Z',l:'M8 6 H68 V22 H26 V42 H8 Z',u:'M8 6 H68 V42 H51 V22 H25 V42 H8 Z'};
const cornerIcons={square:'M5 25 V5 H30',round:'M5 25 V17 Q5 5 17 5 H30',chamfer:'M5 25 V16 L16 5 H30',continuous:'M5 25 V5 H30 M10 25 V10 H30'};
const cornerNames={square:'Eckig',round:'Abgerundet',chamfer:'Abgeschrägt',continuous:'Durchlaufend'};
const fieldNames={L1:'Gesamtbreite',L2:'Links außen',L3:'Rechts außen',B1:'Tiefe oben',B2:'Breite links',B3:'Breite rechts'};
let product=resolved?.family??'straight',step=0,active='',lastGeometry=null,showDimensions=true,view='plan',valid=false;
let material='APL38',decor='H1145',corner='square';
let straightSide='none',straightTreatment=null;
let radiusValues={R1:'10',R2:'10'};
const cornerTitle=$('corners').previousElementSibling;
const sideWrap=element('fieldset','a1-sides');
sideWrap.append(element('legend','','Welche Seite soll bearbeitet werden?'),element('div','a1-side-options'));
cornerTitle.before(sideWrap);
const radiusWrap=element('fieldset','a1-radii');
$('dimensions').after(radiusWrap);
function renderRadiusInputs(){
  radiusWrap.replaceChildren();radiusWrap.hidden=product!=='straight'||straightTreatment!=='round';
  if(radiusWrap.hidden)return;
  radiusWrap.append(element('legend','','Deine Rundung an der Vorderkante'));
  const keys=straightCorner(straightSide,straightTreatment).parameters;
  for(const key of keys){
    const wrap=element('div','a1-radius-field'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    label.htmlFor=`dim-${key}`;label.textContent=`Radius ${key==='R1'?'vorne links':'vorne rechts'}`;label.append(element('span','',key));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=radiusValues[key];input.setAttribute('aria-describedby',`hint-${key} error`);
    input.addEventListener('input',()=>{radiusValues[key]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=key;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const hint=element('p','microcopy','Der Radius bestimmt die Größe des Kreisbogens. Größerer Wert = größere Rundung.');hint.id=`hint-${key}`;
    unit.append(input,element('span','','cm'));wrap.append(label,unit,hint);radiusWrap.append(wrap);
  }
  radiusWrap.append(element('p','a1-limit-note','Bestätigt: R1 einseitig bei 200 × 60 cm von 5 bis 59,9 cm. Andere Fälle werden geometrisch geprüft; die Lieferantengrenzen sind noch offen.'));
}
function renderStraightChoices(){
  sideWrap.hidden=product!=='straight';
  if(product!=='straight')return;
  sideWrap.lastElementChild.replaceChildren(...Object.entries(sides).map(([id,label])=>choice('straight-side',id,`<span>${label}</span>`,straightSide===id,()=>{
    straightSide=id;straightTreatment=id==='none'?null:'round';radiusValues={R1:'10',R2:'10'};corner='square';$('special').value='';active=`side-${id}`;renderChoices();renderRadiusInputs();refresh();
  },'a1-side-card')));
  $('corners').hidden=straightSide==='none';
  cornerTitle.hidden=straightSide==='none';cornerTitle.textContent='Welche Bearbeitung wünschen Sie?';
  $('corners').style.gridTemplateColumns='1fr';
  $('corners').setAttribute('aria-label','Welche Bearbeitung wünschen Sie?');
  $('corners').replaceChildren(...Object.entries(treatments).map(([id,label])=>choice('straight-treatment',id,`<span>${label}</span><small>${id==='round'?'Konturvorschau · Fertigungsprüfung offen':'Kontur gesperrt · Nachweis fehlt'}</small>`,straightTreatment===id,()=>{
    straightTreatment=id;radiusValues={R1:'10',R2:'10'};corner='square';$('special').value='';active=`side-${straightSide}`;renderRadiusInputs();refresh();
  },'a1-treatment-card')));
}
const variants={straight:'straight',l:'L1',u:'U1'};
const dimensionValues={L1:'250',L2:'170',L3:'180',B1:'60',B2:'60',B3:'60'};
const money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(value));
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function choice(group,value,html,selected,callback,extraClass){const label=element('label',`choice ${extraClass}`),input=element('input');
  input.type='radio';input.name=group;input.value=value;input.checked=selected;input.addEventListener('change',()=>{if(input.checked)callback(value);});
  label.innerHTML=html;label.prepend(input);return label;}
function showStep(index){step=index;shadow.querySelectorAll('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==step);
  [...$('steps').children].forEach((e,i)=>{if(i===step)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});
  $('back').disabled=step===0;$('back').style.visibility=step===0?'hidden':'visible';
  $('next').innerHTML=step===0?'Weiter zu den Maßen <span>→</span>':step===1?'Weiter zur Oberfläche <span>→</span>':'Zusammenfassung ansehen <span>↓</span>';
  $('next').disabled=!valid;
}
['Form','Maße','Oberfläche'].forEach((label,i)=>{const b=element('button');b.type='button';b.innerHTML=`<span class="step-number">${i+1}</span>${label}`;b.addEventListener('click',()=>showStep(i));$('steps').append(b);});
function renderChoices(){
  cornerTitle.hidden=false;cornerTitle.textContent='Wie soll die Ecke aussehen?';
  $('corners').hidden=false;
  sideWrap.hidden=product!=='straight';
  $('products').replaceChildren(...Object.keys(c.families).map(id=>choice('product',id,`<svg viewBox="0 0 76 48" aria-hidden="true"><path d="${icons[id]}"/></svg><span>${names[id]}</span>`,product===id,()=>{if(resolved)return;product=id;rebuild();refresh();},'shape-card')));
  const visibleCorners=c.corners.filter(v=>v.id!=='continuous'||product!=='straight');
  $('corners').style.gridTemplateColumns=`repeat(${visibleCorners.length===4?2:3},1fr)`;
  $('corners').replaceChildren(...visibleCorners.map(item=>choice('corner',item.id,`<svg viewBox="0 0 36 30" aria-hidden="true"><path d="${cornerIcons[item.id]}"/></svg><span>${cornerNames[item.id]}</span>`,corner===item.id,()=>{corner=item.id;refresh();},'corner-card')));
  renderStraightChoices();
  $('materials').replaceChildren(...c.materials.map(item=>choice('material',item.id,`<span class="slab ${item.id==='APL17.5'?'slim':''}" aria-hidden="true"></span><strong>${item.id==='APL17.5'?'17,5':'38'} mm</strong><small>${item.id==='APL17.5'?'Schlank & leicht in der Optik':'Klassisch & präsent'}</small>`,material===item.id,()=>{material=item.id;refresh();},'material-card')));
  $('decors').replaceChildren(...c.decors.map(item=>choice('decor',item.id,`<span class="swatch ${item.id==='H1145'?'oak':'white'}" aria-hidden="true"></span><strong>${item.label}</strong><small>${item.surface}</small>`,decor===item.id,()=>{decor=item.id;refresh();},'decor-card')));
}
function rebuild(){
  shell.dataset.product=product;
  if(product==='straight')corner='square';
  renderChoices();$('variant-wrap').hidden=product==='straight';
  $('geometry').replaceChildren(...c.families[product].geometries.map(id=>{const o=element('option','',`${id} · Prüfung offen`);o.value=id;return o;}));$('geometry').value=variants[product];
  $('dimensions').replaceChildren();
  for(const id of c.families[product].fields){
    const wrap=element('div'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    label.htmlFor=`dim-${id}`;label.append(document.createTextNode(product==='straight'?(id==='L1'?'Länge':'Tiefe'):fieldNames[id]),element('span','',id));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=dimensionValues[id];input.setAttribute('aria-describedby','error');
    input.addEventListener('input',()=>{dimensionValues[id]=input.value;refresh();});input.addEventListener('focus',()=>{active=id;shadow.querySelectorAll('#dimensions>div').forEach(e=>e.classList.toggle('active-dimension',e===wrap));renderDrawing();});
    unit.append(input,element('span','','cm'));wrap.append(label,unit);$('dimensions').append(wrap);
  }
  renderRadiusInputs();
}
function payload(){const radii=product==='straight'&&straightTreatment==='round'?Object.fromEntries(straightCorner(straightSide,straightTreatment).parameters.map(k=>[k,radiusValues[k]])):{};return {...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),...(product==='straight'?{straightCorner:{side:straightSide,treatment:straightTreatment,parameters:radii}}:{}),product,geometry:variants[product],corner,dimensions:Object.fromEntries(c.families[product].fields.map(k=>[k,dimensionValues[k]])),
  ...(['round','chamfer'].includes(corner)?{special:{size:$('special').value}}:{}),material,decor,quantity:Number($('quantity').value)};}
function renderDrawing(){if(!lastGeometry)return;const markup=svg(lastGeometry,active,{decor,showDimensions});$('drawing').innerHTML=namespaceSvg(markup,'main');
  if($('drawing-dialog').open)$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:true}),'large');}
function summary(config){
  $('summary-shape').textContent=names[product];$('preview-family').textContent=names[product];
  const decorName=c.decors.find(d=>d.id===decor).label;
  $('preview-material').textContent=`${material==='APL38'?'38':'17,5'} mm · ${decorName}`;
  const measures=config?Object.entries(config.dimensions).map(([k,v])=>`${k}: ${new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(v/10)} cm`).join(' · '):'Maße werden geprüft';
  $('summary').replaceChildren(...[['Maße',measures],['Material',`Schichtstoff · ${material==='APL38'?'38':'17,5'} mm`],['Dekor',decorName],['Außenkante','1,5 mm dekorgleich']].map(([k,v])=>{const row=element('div');row.append(element('dt','',k),element('dd','',v));return row;}));
  if(product==='straight'){
    const row=element('div'),radii=config?.straightCorner?.parameters;
    row.append(element('dt','','Ecken'),element('dd','',`${sides[straightSide]}${straightTreatment?' · '+treatments[straightTreatment]:''}${radii&&Object.keys(radii).length?' · '+Object.entries(radii).map(([k,v])=>`${k}: ${v} mm`).join(' / '):''}`));$('summary').append(row);
  }
}
function priceDisplay(value,label){$('price').textContent=value;$('price-label').textContent=label;$('mobile-price').textContent=value;$('mobile-price-label').textContent=label;}
const controller=createPreviewController({request:async body=>{if(adapters.preview)return adapters.preview(body,{signal:abort.signal});throw new Error('Vorschauadapter fehlt. Kauf bleibt gesperrt.');},
  onPending:()=>{if(disposed)return;valid=false;$('next').disabled=true;$('drawing').setAttribute('aria-busy','true');$('error').hidden=true;priceDisplay('Wird geprüft …','Deine Konfiguration');$('tax-note').textContent='';$('price-note').textContent='';summary(null);},
  onResult:result=>{if(disposed)return;valid=true;lastGeometry=result.geometry;$('drawing').setAttribute('aria-busy','false');renderDrawing();summary(result.config);$('next').disabled=false;$('warnings').textContent=result.geometry.warnings.join(' ');
    $('shape-note').textContent=product==='straight'?'Planungsvorschau – Maße und Ausführung vor Bestellung prüfen.':`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`;
    if(result.quote.illustration){priceDisplay(money(result.quote.illustration.gross),`Preisbeispiel${result.config.quantity>1?' · '+result.config.quantity+' Stück':''}`);$('tax-note').textContent='inkl. 19 % MwSt. · zzgl. Kundenversand';$('price-note').textContent='Rechenbeispiel zum belegten Referenzpreis, unter der Annahme einer ungeteilten Platte. Noch kein verbindliches Angebot.';}
    else {priceDisplay('Preis auf Anfrage','Dein Preis');$('tax-note').textContent='Noch kein bestätigter Gesamtpreis';$('price-note').textContent=result.quote.referenceMatched?'Preisreferenz vorhanden. Für den Gesamtpreis fehlen noch die bestätigte Teileaufteilung und Versandprüfung.':'Diese Kombination wird noch geprüft. Wir zeigen keinen geschätzten Bestellpreis.';}
  },onError:error=>{if(disposed)return;valid=false;lastGeometry=null;$('drawing').replaceChildren();$('drawing').setAttribute('aria-busy','false');$('large-drawing').replaceChildren();$('error').textContent=error.message;$('error').hidden=false;const locked=product==='straight'&&straightTreatment?.startsWith('chamfer');$('shape-note').textContent=locked?'Diese Kontur wartet auf die technische Zeichnung. Bitte eine Rundung oder keine Bearbeitung wählen.':'Bitte korrigiere deine Maße, damit wir die Vorschau zeichnen können.';priceDisplay('Noch offen',locked?'Technischer Nachweis fehlt':'Bitte Maße prüfen');$('price-note').textContent='Für diese Eingabe ist keine gültige Vorschau verfügbar.';}
});
function refresh(){
  shell.dataset.corner=corner;
  $('special-wrap').hidden=!['round','chamfer'].includes(corner);
  $('corner-note').textContent=['round','chamfer'].includes(corner)?'Eckmuster oben links. Größe im Schritt „Maße“ anpassen; Ausführung noch zu prüfen.':corner==='continuous'?'Kontur und Verbindung dieser Ausführung sind noch zu prüfen.':'Klare, rechtwinklige Ecken. Die Außenkante ist im gleichen Dekor vorgesehen.';
  if(product==='straight'){
    const v=straightCorner(straightSide,straightTreatment);
    $('special-wrap').hidden=true;
    $('corner-note').textContent=v.id==='none'?'Vorderkante unten. Ohne Eckbearbeitung.':v.treatment==='round'?'Vorderkante unten. R1 rundet vorne links, R2 vorne rechts. Radien im Schritt „Maße“ unabhängig einstellen.':`${sides[v.side]} · ${treatments[v.treatment]}. Kontur gesperrt: Originalzeichnung und genaue Maßbezüge fehlen.`;
    $('summary-shape').textContent=`Gerade · ${sides[v.side]}`;
  }
  for(const id of c.families[product].fields){const input=$(`dim-${id}`);try{cmToMm(input.value);input.removeAttribute('aria-invalid');}catch{input.setAttribute('aria-invalid','true');}}
  for(const input of radiusWrap.querySelectorAll('input')){try{cmToMm(input.value);input.removeAttribute('aria-invalid');}catch{input.setAttribute('aria-invalid','true');}}
  return controller.refresh(payload());
}
$('geometry').addEventListener('change',()=>{variants[product]=$('geometry').value;refresh();});
for(const id of ['quantity','special'])$(id).addEventListener('input',refresh);
for(const [id,amount] of [['minus',-1],['plus',1]])$(id).addEventListener('click',()=>{const n=Number($('quantity').value);$('quantity').value=String(Math.min(1000,Math.max(1,(Number.isFinite(n)?Math.trunc(n):1)+amount)));refresh();});
$('config').addEventListener('submit',event=>event.preventDefault());$('back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
$('next').addEventListener('click',()=>{if(!valid)return;if(step===2)shadow.querySelector('.order-summary').scrollIntoView({behavior:'smooth',block:'center'});else showStep(step+1);});
$('mobile-summary').addEventListener('click',()=>shadow.querySelector('.order-summary').scrollIntoView({behavior:'smooth',block:'center'}));
$('measure-toggle').addEventListener('click',()=>{showDimensions=!showDimensions;$('measure-toggle').setAttribute('aria-pressed',String(showDimensions));renderDrawing();});
for(const [id,mode] of [['view-plan','plan'],['view-parts','parts']])$(id).addEventListener('click',()=>{view=mode;$('parts-note').hidden=view!=='parts';$('view-plan').setAttribute('aria-pressed',String(view==='plan'));$('view-parts').setAttribute('aria-pressed',String(view==='parts'));});
$('drawing').addEventListener('click',event=>{const measure=event.target.closest('[data-field]');if(measure){showStep(1);const field=$(`dim-${measure.dataset.field}`);field?.focus();}});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('enlarge').addEventListener('click',()=>{if(!lastGeometry)return;$('drawing-dialog').showModal();renderDrawing();});
for(const dialog of shadow.querySelectorAll('dialog'))dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
rebuild();showStep(0);refresh();

if(embedded){
 shell.querySelector('#products').hidden=true;
 shell.querySelector('[data-step="0"] h2').textContent='Deine '+names[product]+' konfigurieren';
 if(product==='straight')$('cart').textContent='Bestellung gesperrt · Admin-Test';
}
const handle={destroy(){if(disposed)return;disposed=true;abort.abort();for(const d of shadow.querySelectorAll('dialog'))if(d.open)d.close();shadow.replaceChildren();mounts.delete(root);},updateContext(next){return mountConfigurator(root,{...context,...next},adapters);}};
mounts.set(root,handle);return handle;
}
