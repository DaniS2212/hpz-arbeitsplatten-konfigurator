import {catalog,mmTextToMm} from './core/config.js?v=0.4.0';
import {svg} from './core/geometry.js?v=0.4.0';
import {createPreviewController} from './latest.js?v=0.4.0';
import {template} from './component-template.js?v=0.4.0';
import {resolveProduct} from './core/products.js?v=0.4.0';
import {decorImageUrl} from './decor-images.js?v=0.4.0';
import {sides,treatments,straightCorner,cornerLimits,defaultCornerParameters} from './core/straight-corners.js?v=0.4.0';
const mounts=new WeakMap();let sequence=0;
export function mountConfigurator(root,context={},adapters={}){
 const startingDecor=context.decorId??'H1145';decorImageUrl(startingDecor);
 const embedded=context.presentationMode==='embedded';
 const resolved=embedded?resolveProduct(context):null;
 if(context.family&&resolved&&context.family!==resolved.family)throw new Error('Produktfamilie passt nicht.');
 mounts.get(root)?.destroy();
 const shadow=root.shadowRoot||root.attachShadow({mode:'open'});
 const shell=document.createElement('div');shell.className='hpz-apl';shell.dataset.mode=embedded?'embedded':'demo';
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./component.css?v=0.4.0',import.meta.url).href;
 shell.innerHTML=template;shadow.replaceChildren(link,shell);
 const abort=new AbortController();let disposed=false;const instance='hpz-apl-'+(++sequence);
 function namespaceSvg(markup,view){return markup.replaceAll('apl-arrow',instance+'-'+view+'-arrow').replaceAll('apl-white',instance+'-'+view+'-white').replaceAll('apl-oak',instance+'-'+view+'-oak').replaceAll('apl-texture',instance+'-'+view+'-texture');}
const c=catalog(),$=id=>shadow.getElementById(id);
const names={straight:'Gerade',l:'L-Form',u:'U-Form'};
const icons={straight:'M8 11 H68 V35 H8 Z',l:'M8 6 H68 V22 H26 V42 H8 Z',u:'M8 6 H68 V42 H51 V22 H25 V42 H8 Z'};
const cornerIcons={square:'M5 25 V5 H30',round:'M5 25 V17 Q5 5 17 5 H30',chamfer:'M5 25 V16 L16 5 H30',continuous:'M5 25 V5 H30 M10 25 V10 H30'};
const cornerNames={square:'Eckig',round:'Abgerundet',chamfer:'Abgeschrägt',continuous:'Durchlaufend'};
const fieldNames={L1:'Gesamtbreite',L2:'Links außen',L3:'Rechts außen',B1:'Tiefe oben',B2:'Breite links',B3:'Breite rechts'};
let product=resolved?.family??'straight',step=0,active='',lastGeometry=null,showDimensions=true,view='plan',valid=false;
let material='APL38',decor=startingDecor,corner='square';
let straightSide='none',straightTreatment=null;
let radiusValues={},drawingDetail=null;
const cornerTitle=$('corners').previousElementSibling;
const sideWrap=element('fieldset','a1-sides');
const sideLegend=element('legend','','Welche vorderen Ecken möchtest du gestalten?'),cornerHelp=element('button','a11-info','i');
cornerHelp.type='button';cornerHelp.setAttribute('aria-label','Hinweise zu Eckmaßen und Vorschaugrenzen');sideLegend.append(cornerHelp);
sideWrap.append(sideLegend,element('p','a11-orientation','Betrachte deine Arbeitsplatte von oben. Die Vorderkante ist in der Zeichnung unten markiert.'),element('div','a1-side-options'));
cornerTitle.before(sideWrap);
const radiusWrap=element('fieldset','a1-radii');
$('dimensions').after(radiusWrap);
const infoDialog=element('dialog');infoDialog.id='corner-help';
infoDialog.innerHTML='<button class="dialog-close" type="button" aria-label="Eckhinweise schließen">×</button><h2>Deine vorderen Ecken</h2><p>Alle Maße sind Millimeter. Länge und Tiefe: 1-mm-Schritte. Eckmaße: 10-mm-Schritte. Beim Wechsel der Bearbeitung werden nur die Eckmaße zurückgesetzt.</p><p>R1 ist vorne links, R2 vorne rechts. Bei Schrägen bezeichnet L2/L3 die Länge entlang der Vorderkante, B2/B3 die Tiefe entlang der Seite.</p><p>Eckig: gerade Diagonale. Durchlaufend: weichere Übergänge, in dieser Vorschau schematisch ohne Fertigungsradien. Vorerst nur bei 2000 × 600 mm, Länge der Schräge 60–500 mm, Tiefe 60–300 mm.</p><p>Unsere Vorschaugrenzen sind bewusst konservativ. Die technische Fertigungs- und Preisprüfung bleibt getrennt; Bestellungen sind gesperrt.</p>';
shell.append(infoDialog);cornerHelp.addEventListener('click',()=>infoDialog.showModal());
const detailOptions=element('div','a11-detail-options');detailOptions.id='drawing-detail-options';
for(const [value,title] of [['overview','Gesamtansicht'],['left','Detail vorne links'],['right','Detail vorne rechts']]){
  const button=element('button','',title);button.type='button';button.dataset.detail=value;button.addEventListener('click',()=>{drawingDetail=value==='overview'?null:value;renderDrawing();});detailOptions.append(button);
}
$('large-drawing').before(detailOptions);
function sideIcon(side){
  return `<svg viewBox="0 0 96 46" aria-hidden="true"><path d="M8 6H88V38H8Z" fill="#e9ecdf" stroke="#4c6556" stroke-width="2"/><path d="M25 38H71" stroke="#17677a" stroke-width="3"/>${['left','both'].includes(side)?'<path d="M8 24V38H22" fill="none" stroke="#b5521c" stroke-width="5"/>':''}${['right','both'].includes(side)?'<path d="M74 38H88V24" fill="none" stroke="#b5521c" stroke-width="5"/>':''}</svg>`;
}
function treatmentIcon(kind){
  const path=kind==='round'?'M10 5H88V39H26A16 16 0 0 1 10 23Z':kind==='chamfer_square'?'M10 5H88V39H27L10 22Z':'M10 5H88V39H29Q27 39 25 37L12 24Q10 22 10 20Z';
  return `<svg viewBox="0 0 98 46" aria-hidden="true"><path d="${path}" fill="#e9ecdf" stroke="#4c6556" stroke-width="2"/><path d="M35 39H80" stroke="#17677a" stroke-width="3"/></svg>`;
}
function renderRadiusInputs(){
  radiusWrap.replaceChildren();radiusWrap.hidden=product!=='straight'||straightSide==='none';
  if(radiusWrap.hidden)return;
  radiusWrap.append(element('legend','',straightTreatment==='round'?'Deine Rundungen':'Deine Abschrägungen'));
  const keys=straightCorner(straightSide,straightTreatment).parameters;
  for(const key of keys){
    const wrap=element('div','a1-radius-field'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    const place=['R1','L2','B2'].includes(key)?'vorne links':'vorne rechts';
    label.htmlFor=`dim-${key}`;label.textContent=key.startsWith('R')?`Radius ${place}`:`Abschrägung ${place} – ${key.startsWith('L')?'Länge':'Tiefe'}`;label.append(element('span','',key));
    input.id=label.htmlFor;input.type='text';input.inputMode='numeric';input.pattern='[0-9]*';input.value=radiusValues[key];input.setAttribute('aria-describedby',`hint-${key} error`);
    input.addEventListener('input',()=>{radiusValues[key]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=key;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const hint=element('p','microcopy');hint.id=`hint-${key}`;
    unit.append(input,element('span','','mm'));wrap.append(label,unit,hint);radiusWrap.append(wrap);
  }
  radiusWrap.append(element('p','a1-limit-note','Vorschaugrenzen · Fertigungsprüfung bleibt erforderlich.'));
}
function renderStraightChoices(){
  sideWrap.hidden=product!=='straight';
  if(product!=='straight')return;
  sideWrap.lastElementChild.replaceChildren(...Object.entries(sides).map(([id,label])=>choice('straight-side',id,`${sideIcon(id)}<span>${label}</span>`,straightSide===id,()=>{
    straightSide=id;straightTreatment=id==='none'?null:(straightTreatment??'round');radiusValues=defaultCornerParameters(straightSide,straightTreatment);corner='square';$('special').value='100';active=`side-${id}`;drawingDetail=null;renderChoices();renderRadiusInputs();refresh();
    sideWrap.querySelector(`input[value="${id}"]`).focus({preventScroll:true});
  },'a1-side-card')));
  $('corners').hidden=straightSide==='none';
  cornerTitle.hidden=straightSide==='none';cornerTitle.textContent='Welche Bearbeitung möchtest du?';
  $('corners').style.gridTemplateColumns='1fr';
  $('corners').setAttribute('aria-label','Welche Bearbeitung möchtest du?');
  $('corners').replaceChildren(...Object.entries(treatments).map(([id,label])=>choice('straight-treatment',id,`${treatmentIcon(id)}<span>${label}</span>${id==='chamfer_continuous'?'<small>Weiche Übergänge · Vorschau schematisch</small>':''}`,straightTreatment===id,()=>{
    straightTreatment=id;radiusValues=defaultCornerParameters(straightSide,straightTreatment);corner='square';$('special').value='100';active=`side-${straightSide}`;drawingDetail=null;renderRadiusInputs();refresh();
  },'a1-treatment-card')));
}
const variants={straight:'straight',l:'L1',u:'U1'};
const dimensionValues={L1:'2500',L2:'1700',L3:'1800',B1:'600',B2:'600',B3:'600'};
const straightDimensionValues={L1:'2000',B1:'600'},currentDimensions=()=>product==='straight'?straightDimensionValues:dimensionValues;
const money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(value));
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function choice(group,value,html,selected,callback,extraClass){const label=element('label',`choice ${extraClass}`),input=element('input');
  input.type='radio';input.name=group;input.value=value;input.checked=selected;input.addEventListener('change',()=>{if(input.checked)callback(value);});
  label.innerHTML=html;label.prepend(input);return label;}
function showStep(index){step=index;shell.dataset.currentStep=String(index);shadow.querySelectorAll('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==step);
  // In the surface step the existing summary fills the area below the preview.
  // Mobile order stays preview → configuration → summary; no duplicate controls.
  (step===2?shadow.querySelector('.workspace'):shadow.querySelector('.configuration')).append(shadow.querySelector('.order-summary'));
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
  $('decors').replaceChildren(...c.decors.map(item=>choice('decor',item.id,`<img class="decor-photo" src="${decorImageUrl(item.id,{thumbnail:true})}" alt="" width="480" height="480" loading="lazy" decoding="async"><strong>${item.label}</strong>`,decor===item.id,()=>{decor=item.id;refresh();},'decor-card')));
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
    input.id=label.htmlFor;input.type='text';input.inputMode='numeric';input.pattern='[0-9]*';input.value=currentDimensions()[id];input.setAttribute('aria-describedby','error');
    input.addEventListener('input',()=>{currentDimensions()[id]=input.value;refresh();});input.addEventListener('focus',()=>{active=id;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    unit.append(input,element('span','','mm'));wrap.append(label,unit);$('dimensions').append(wrap);
  }
  renderRadiusInputs();
}
function payload(){const radii=product==='straight'?Object.fromEntries(straightCorner(straightSide,straightTreatment).parameters.map(k=>[k,radiusValues[k]])):{};return {schemaVersion:2,inputUnit:'mm',...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),...(product==='straight'?{straightCorner:{side:straightSide,treatment:straightTreatment,parameters:radii}}:{}),product,geometry:variants[product],corner,dimensions:Object.fromEntries(c.families[product].fields.map(k=>[k,currentDimensions()[k]])),
  ...(['round','chamfer'].includes(corner)?{special:{size:$('special').value}}:{}),material,decor,quantity:Number($('quantity').value)};}
function renderDrawing(){if(!lastGeometry)return;const textureUrl=decorImageUrl(decor);const markup=svg(lastGeometry,active,{decor,showDimensions,textureUrl});$('drawing').innerHTML=namespaceSvg(markup,'main');
  detailOptions.hidden=product!=='straight'||straightSide==='none';
  for(const button of detailOptions.children){const side=button.dataset.detail;button.disabled=side!=='overview'&&straightSide!==side&&straightSide!=='both';button.setAttribute('aria-pressed',String((drawingDetail??'overview')===side));}
  if($('drawing-dialog').open)$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:true,detail:drawingDetail,textureUrl}),'large');}
function summary(config){
  $('summary-shape').textContent=names[product];$('preview-family').textContent=names[product];
  const decorName=c.decors.find(d=>d.id===decor).label;
  $('preview-material').textContent=`${material==='APL38'?'38':'17,5'} mm · ${decorName}`;
  const measures=config?Object.entries(config.dimensions).map(([k,v])=>`${k}: ${v} mm`).join(' · '):'Maße werden geprüft';
  $('summary').replaceChildren(...[['Maße',measures],['Material',`Schichtstoff · ${material==='APL38'?'38':'17,5'} mm`],['Dekor',decorName],['Außenkante','1,5 mm dekorgleich']].map(([k,v])=>{const row=element('div');row.append(element('dt','',k),element('dd','',v));return row;}));
  if(product==='straight'){
    const row=element('div'),radii=config?.straightCorner?.parameters;
    row.append(element('dt','','Ecken'),element('dd','',`${sides[straightSide]}${straightTreatment?' · '+treatments[straightTreatment]:''}${radii&&Object.keys(radii).length?' · '+Object.entries(radii).map(([k,v])=>`${k}: ${v} mm`).join(' / '):''}`));$('summary').append(row);
  }
}
function priceDisplay(value,label){$('price').textContent=value;$('price-label').textContent=label;$('mobile-price').textContent=value;$('mobile-price-label').textContent=label;}
function updateCornerBounds(){
  if(product!=='straight'||straightSide==='none')return;
  let dims;try{dims=Object.fromEntries(Object.entries(straightDimensionValues).map(([key,value])=>[key,mmTextToMm(value)]));}catch{return;}
  const parameters=Object.fromEntries(Object.entries(radiusValues).map(([key,value])=>[key,Number(value)]));
  const limits=cornerLimits(straightSide,straightTreatment,dims,parameters);
  for(const [key,limit] of Object.entries(limits.fields)){
    const input=$(`dim-${key}`);if(!input)continue;
    input.setAttribute('aria-invalid',String(!limits.enabled||!Number.isInteger(parameters[key])||parameters[key]<limit.min||parameters[key]>limit.max||parameters[key]%limit.step!==0));
    $(`hint-${key}`).textContent=limit.max>=limit.min?`${limit.min}–${limit.max} mm · ${limit.step}-mm-Schritte`:'Dafür bleibt zu wenig Platz. Andere Eckmaße oder Plattenmaße anpassen.';
  }
  radiusWrap.querySelector('.a1-limit-note').textContent=limits.enabled?'Konservative Vorschaugrenzen · Fertigungsprüfung bleibt erforderlich.':limits.reason;
}
const controller=createPreviewController({request:async body=>{if(adapters.preview)return adapters.preview(body,{signal:abort.signal});throw new Error('Vorschauadapter fehlt. Kauf bleibt gesperrt.');},
  onPending:()=>{if(disposed)return;valid=false;$('next').disabled=true;$('drawing').setAttribute('aria-busy','true');$('error').hidden=true;priceDisplay('Wird geprüft …','Deine Konfiguration');$('tax-note').textContent='';$('price-note').textContent='';summary(null);},
  onResult:result=>{if(disposed)return;valid=true;lastGeometry=result.geometry;$('drawing').setAttribute('aria-busy','false');renderDrawing();summary(result.config);$('next').disabled=false;$('warnings').textContent=result.geometry.warnings.join(' ');
    $('shape-note').textContent=product==='straight'?(straightTreatment==='chamfer_continuous'?'Weiche Übergänge schematisch · Keine Fertigungsfreigabe.':'Planungsvorschau – Maße und Ausführung vor Bestellung prüfen.'):`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`;
    if(result.quote.illustration){priceDisplay(money(result.quote.illustration.gross),`Preisbeispiel${result.config.quantity>1?' · '+result.config.quantity+' Stück':''}`);$('tax-note').textContent='inkl. 19 % MwSt. · zzgl. Kundenversand';$('price-note').textContent='Rechenbeispiel zum belegten Referenzpreis, unter der Annahme einer ungeteilten Platte. Noch kein verbindliches Angebot.';}
    else {priceDisplay('Preis auf Anfrage','Dein Preis');$('tax-note').textContent='Noch kein bestätigter Gesamtpreis';$('price-note').textContent=result.quote.referenceMatched?'Preisreferenz vorhanden. Für den Gesamtpreis fehlen noch die bestätigte Teileaufteilung und Versandprüfung.':'Diese Kombination wird noch geprüft. Wir zeigen keinen geschätzten Bestellpreis.';}
  },onError:error=>{if(disposed)return;valid=false;lastGeometry=null;$('drawing').replaceChildren();$('drawing').setAttribute('aria-busy','false');$('large-drawing').replaceChildren();$('error').textContent=error.message;$('error').hidden=false;$('shape-note').textContent='Bitte korrigiere die markierten Maße. Die letzte Kontur wird bei ungültigen Werten entfernt.';priceDisplay('Noch offen','Bitte Maße prüfen');$('price-note').textContent='Für diese Eingabe ist keine gültige Vorschau verfügbar.';}
});
function refresh(){
  shell.style.setProperty('--hpz-decor-image',`url("${decorImageUrl(decor)}")`);
  shell.dataset.corner=corner;
  $('special-wrap').hidden=!['round','chamfer'].includes(corner);
  $('corner-note').textContent=['round','chamfer'].includes(corner)?'Eckmuster oben links. Größe im Schritt „Maße“ anpassen; Ausführung noch zu prüfen.':corner==='continuous'?'Kontur und Verbindung dieser Ausführung sind noch zu prüfen.':'Klare, rechtwinklige Ecken. Die Außenkante ist im gleichen Dekor vorgesehen.';
  if(product==='straight'){
    const v=straightCorner(straightSide,straightTreatment);
    $('special-wrap').hidden=true;
    $('corner-note').textContent=v.id==='none'?'Vorderkante unten. Ohne Eckbearbeitung.':v.treatment==='round'?'Rundungen im nächsten Schritt einstellen.':v.treatment==='chamfer_square'?'Gerade Diagonalen. Länge und Tiefe im nächsten Schritt einstellen.':'Weichere Übergänge, schematisch dargestellt. Vorschau vorerst bei 2000 × 600 mm.';
    $('summary-shape').textContent=`Gerade · ${sides[v.side]}`;
  }
  for(const id of c.families[product].fields){const input=$(`dim-${id}`);try{mmTextToMm(input.value);input.removeAttribute('aria-invalid');}catch{input.setAttribute('aria-invalid','true');}}
  updateCornerBounds();
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
for(const id of ['drawing','large-drawing'])$(id).addEventListener('click',event=>{const measure=event.target.closest('[data-field]');if(measure){if($('drawing-dialog').open)$('drawing-dialog').close();showStep(1);const field=$(`dim-${measure.dataset.field}`);field?.focus();}});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('enlarge').addEventListener('click',()=>{if(!lastGeometry)return;drawingDetail=product==='straight'&&straightSide!=='none'&&root.getBoundingClientRect().width<=760?(straightSide==='right'||['R2','L3','B3'].includes(active)?'right':'left'):null;$('drawing-dialog').showModal();renderDrawing();});
for(const dialog of shadow.querySelectorAll('dialog'))dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
rebuild();showStep(0);refresh();

if(embedded){
 shell.querySelector('#products').hidden=true;
 shell.querySelector('[data-step="0"] h2').textContent='Deine Arbeitsplatte konfigurieren';
 if(product==='straight')$('cart').textContent='Bestellung gesperrt · Admin-Test';
}
const handle={destroy(){if(disposed)return;disposed=true;abort.abort();for(const d of shadow.querySelectorAll('dialog'))if(d.open)d.close();shadow.replaceChildren();mounts.delete(root);},updateContext(next){return mountConfigurator(root,{...context,...next},adapters);}};
mounts.set(root,handle);return handle;
}
