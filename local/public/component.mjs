import {catalog} from '/core/config.mjs';
import {cmInputToMmText,mmToCmText,cmRange,customerMeasureError} from '/core/customer-measures.mjs';
import {svg} from '/core/geometry.mjs';
import {createPreviewController} from '/latest.mjs';
import {template} from './component-template.mjs';
import {resolveProduct} from '../core/products.mjs';
import {decorImageUrl} from './decor-images.mjs';
import {sides,treatments,straightCorner,cornerLimits,defaultCornerParameters} from '../core/straight-corners.mjs';
const mounts=new WeakMap();let sequence=0;
export function mountConfigurator(root,context={},adapters={}){
 const startingDecor=context.decorId??'H1145';decorImageUrl(startingDecor);
 const embedded=context.presentationMode==='embedded';
 const resolved=embedded?resolveProduct(context):null;
 if(context.family&&resolved&&context.family!==resolved.family)throw new Error('Produktfamilie passt nicht.');
 mounts.get(root)?.destroy();
 const shadow=root.shadowRoot||root.attachShadow({mode:'open'});
 const shell=document.createElement('div');shell.className='hpz-apl';shell.dataset.mode=embedded?'embedded':'demo';
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./component.css',import.meta.url).href;
 const studioLink=document.createElement('link');studioLink.rel='stylesheet';studioLink.href=new URL('./kuechenstudio-060.css',import.meta.url).href;
 shell.innerHTML=template;shadow.replaceChildren(link,studioLink,shell);
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
const sideLegend=element('legend','','Welche Seite?'),cornerHelp=element('button','a11-info','i');
cornerHelp.type='button';cornerHelp.setAttribute('aria-label','Hinweise zu Eckmaßen und Vorschaugrenzen');sideLegend.append(cornerHelp);
sideWrap.append(sideLegend,element('div','a1-side-options'));
cornerTitle.before(sideWrap);
const radiusWrap=element('fieldset','a1-radii');
$('dimensions').after(radiusWrap);
const infoDialog=element('dialog');infoDialog.id='corner-help';
infoDialog.innerHTML='<button class="dialog-close" type="button" aria-label="Eckhinweise schließen">×</button><h2>Deine vorderen Ecken</h2><p>Du siehst die Platte von oben; die Vorderkante liegt unten. Längen und Tiefen kannst du auf 0,1 cm genau eingeben, Eckmaße in 1-cm-Schritten. Beim Wechsel der Bearbeitung werden nur die Eckmaße zurückgesetzt.</p><p>R1 ist vorne links, R2 vorne rechts. Bei Schrägen bezeichnet L2/L3 die Länge entlang der Vorderkante, B2/B3 die Tiefe entlang der Seite.</p><p>Bei der eckigen Abschrägung entsteht eine gerade Diagonale. Die durchlaufende Vorderkante zeigen wir mit schematischen Übergängen ohne Fertigungsradien; derzeit nur bei 200 × 60 cm, mit Schrägenlänge 6–50 cm und Tiefe 6–30 cm.</p><p>Die Vorschaugrenzen sind konservativ. Fertigung und Preisfreigabe bleiben getrennt; Bestellungen sind gesperrt.</p>';
shell.append(infoDialog);cornerHelp.addEventListener('click',()=>infoDialog.showModal());
const detailOptions=element('div','a11-detail-options');detailOptions.id='drawing-detail-options';
for(const [value,title] of [['overview','Gesamtansicht'],['left','Detail vorne links'],['right','Detail vorne rechts']]){
  const button=element('button','',title);button.type='button';button.dataset.detail=value;button.addEventListener('click',()=>{drawingDetail=value==='overview'?null:value;renderDrawing();});detailOptions.append(button);
}
$('large-drawing').before(detailOptions);
function sideIcon(side){
  return `<svg viewBox="0 0 96 46" aria-hidden="true"><path d="M8 6H88V38H8Z" fill="#e6f1f1" stroke="#557b83" stroke-width="2"/><path d="M25 38H71" stroke="#146178" stroke-width="3"/>${['left','both'].includes(side)?'<path d="M8 24V38H22" fill="none" stroke="#ad8667" stroke-width="5"/>':''}${['right','both'].includes(side)?'<path d="M74 38H88V24" fill="none" stroke="#ad8667" stroke-width="5"/>':''}</svg>`;
}
function treatmentIcon(kind){
  const path=kind==='round'?'M10 5H88V39H26A16 16 0 0 1 10 23Z':kind==='chamfer_square'?'M10 5H88V39H27L10 22Z':'M10 5H88V39H29Q27 39 25 37L12 24Q10 22 10 20Z';
  return `<svg viewBox="0 0 98 46" aria-hidden="true"><path d="${path}" fill="#e6f1f1" stroke="#557b83" stroke-width="2"/><path d="M35 39H80" stroke="#146178" stroke-width="3"/></svg>`;
}
function renderRadiusInputs(){
  radiusWrap.replaceChildren();radiusWrap.hidden=product!=='straight'||straightSide==='none';
  if(radiusWrap.hidden)return;
  radiusWrap.append(element('legend','',straightTreatment==='round'?'Deine Rundungen':'Deine Abschrägungen'));
  const keys=straightCorner(straightSide,straightTreatment).parameters;
  const grids=new Map();
  for(const key of keys){
    const side=['R1','L2','B2'].includes(key)?'left':'right';
    const place=side==='left'?'vorne links':'vorne rechts';
    if(!grids.has(side)){
      const group=element('div','a1-corner-group');
      group.setAttribute('role','group');group.setAttribute('aria-label',`Ecke ${place}`);
      group.append(element('p','a1-corner-heading',side==='left'?'Linke Ecke':'Rechte Ecke'));
      const grid=element('div','a1-corner-grid');group.append(grid);radiusWrap.append(group);grids.set(side,grid);
    }
    const wrap=element('div','a1-radius-field'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    const property=key.startsWith('R')?'Radius':key.startsWith('L')?'Länge':'Tiefe';
    label.htmlFor=`dim-${key}`;label.textContent=property;label.append(element('span','',key));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=radiusValues[key];input.setAttribute('aria-describedby',`hint-${key} error`);
    input.setAttribute('aria-label',`${property} Abschrägung ${place} (${key})`.replace('Radius Abschrägung','Radius'));
    input.addEventListener('input',()=>{radiusValues[key]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=key;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const hint=element('p','microcopy');hint.id=`hint-${key}`;
    unit.append(input,element('span','','cm'));wrap.append(label,unit,hint);grids.get(side).append(wrap);
  }
  radiusWrap.append(element('p','a1-limit-note','Vorschaugrenzen · Fertigungsprüfung bleibt erforderlich.'));
}
function renderStraightChoices(){
  sideWrap.hidden=product!=='straight';
  if(product!=='straight')return;
  sideWrap.lastElementChild.replaceChildren(...Object.entries(sides).map(([id,label])=>choice('straight-side',id,`${sideIcon(id)}<span>${label}</span>`,straightSide===id,()=>{
    straightSide=id;straightTreatment=id==='none'?null:(straightTreatment??'round');radiusValues=Object.fromEntries(Object.entries(defaultCornerParameters(straightSide,straightTreatment)).map(([k,v])=>[k,mmToCmText(Number(v))]));corner='square';$('special').value='10';active=`side-${id}`;drawingDetail=null;renderChoices();renderRadiusInputs();refresh();
    sideWrap.querySelector(`input[value="${id}"]`).focus({preventScroll:true});
  },'a1-side-card')));
  $('corners').hidden=straightSide==='none';
  cornerTitle.hidden=straightSide==='none';cornerTitle.textContent='Bearbeitung';
  $('corners').style.gridTemplateColumns='1fr';
  $('corners').setAttribute('aria-label','Welche Bearbeitung möchtest du?');
  $('corners').replaceChildren(...Object.entries(treatments).map(([id,label])=>choice('straight-treatment',id,`${treatmentIcon(id)}<span>${label}</span>${id==='chamfer_continuous'?'<small>Weiche Übergänge · Vorschau schematisch</small>':''}`,straightTreatment===id,()=>{
    straightTreatment=id;radiusValues=Object.fromEntries(Object.entries(defaultCornerParameters(straightSide,straightTreatment)).map(([k,v])=>[k,mmToCmText(Number(v))]));corner='square';$('special').value='10';active=`side-${straightSide}`;drawingDetail=null;renderRadiusInputs();refresh();
  },'a1-treatment-card')));
}
const variants={straight:'straight',l:'L1',u:'U1'};
const dimensionValues={L1:'250',L2:'170',L3:'180',B1:'60',B2:'60',B3:'60'};
const straightDimensionValues={L1:'200',B1:'60'},currentDimensions=()=>product==='straight'?straightDimensionValues:dimensionValues;
const money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(value));
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function choice(group,value,html,selected,callback,extraClass){const label=element('label',`choice ${extraClass}`),input=element('input');
  input.type='radio';input.name=group;input.value=value;input.checked=selected;input.addEventListener('change',()=>{if(input.checked)callback(value);});
  label.innerHTML=html;label.prepend(input);return label;}
function placeSummary(){
  // Desktop: use the free space below the drawing at EVERY step. On mobile
  // the summary stays below the configuration, preserving reading order.
  const dest=window.matchMedia('(min-width: 761px)').matches?shadow.querySelector('.workspace'):shadow.querySelector('.configuration');
  if(dest&&shadow.querySelector('.order-summary')?.parentElement!==dest)dest.append(shadow.querySelector('.order-summary'));
 }
 window.addEventListener('resize',placeSummary,{signal:abort.signal});
 function showStep(index){step=index;shell.dataset.currentStep=String(index);shadow.querySelectorAll('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==step);
  placeSummary();
  [...$('steps').children].forEach((e,i)=>{if(i===step)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});
  $('back').disabled=step===0;$('back').style.visibility=step===0?'hidden':'visible';
  $('next').innerHTML=step===0?'Weiter zu den Maßen <span>→</span>':step===1?'Weiter zur Oberfläche <span>→</span>':'Konfiguration prüfen <span>↓</span>';
  $('next').disabled=!valid;
}
['Ecken','Maße','Oberfläche'].forEach((label,i)=>{const b=element('button');b.type='button';b.innerHTML=`<span class="step-number">${i+1}</span><span class="step-label">${label}</span>`;b.addEventListener('click',()=>showStep(i));$('steps').append(b);});
function updateFamilyCopy(){
 $('steps').querySelector('.step-label').textContent=product==='straight'?'Ecken':'Grundriss';
 $('view-parts').textContent='Aufteilung';$('view-parts').hidden=product==='straight';
 if(product==='straight'){view='plan';$('parts-note').hidden=true;$('view-plan').setAttribute('aria-pressed','true');$('view-parts').setAttribute('aria-pressed','false');}
 shadow.querySelector('[data-step="0"] h2').textContent=product==='straight'?'Vordere Ecken':'Grundriss wählen';
}
function renderChoices(){
  cornerTitle.hidden=false;cornerTitle.textContent='Wie soll die Ecke aussehen?';
  $('corners').hidden=false;
  sideWrap.hidden=product!=='straight';
  $('products').replaceChildren(...Object.keys(c.families).map(id=>choice('product',id,`<svg viewBox="0 0 76 48" aria-hidden="true"><path d="${icons[id]}"/></svg><span>${names[id]}</span>`,product===id,()=>{if(resolved)return;product=id;rebuild();refresh();},'shape-card')));
  const visibleCorners=c.corners.filter(v=>v.id!=='continuous'||product!=='straight');
  $('corners').style.gridTemplateColumns=`repeat(${visibleCorners.length===4?2:3},1fr)`;
  $('corners').replaceChildren(...visibleCorners.map(item=>choice('corner',item.id,`<svg viewBox="0 0 36 30" aria-hidden="true"><path d="${cornerIcons[item.id]}"/></svg><span>${cornerNames[item.id]}</span>`,corner===item.id,()=>{corner=item.id;refresh();},'corner-card')));
  renderStraightChoices();
  updateFamilyCopy();
  $('materials').replaceChildren(...c.materials.map(item=>choice('material',item.id,`<span class="slab ${item.id==='APL17.5'?'slim':''}" aria-hidden="true"></span><strong>${item.id==='APL17.5'?'17,5':'38'} mm</strong><small>${item.id==='APL17.5'?'Schlank & leicht in der Optik':'Klassisch & präsent'}</small>`,material===item.id,()=>{material=item.id;refresh();},'material-card')));
  // Reuse image elements across corner/side changes: recreating 16 lazy-loaded
  // photos on every choice causes unnecessary requests and can blank the grid
  // if a local preview request fails during rapid interaction.
  if($('decors').children.length!==c.decors.length){
    $('decors').replaceChildren(...c.decors.map(item=>choice('decor',item.id,`<img class="decor-photo" src="${decorImageUrl(item.id,{thumbnail:true})}" alt="" width="480" height="480" loading="lazy" decoding="async"><strong>${item.label}</strong>`,decor===item.id,()=>{decor=item.id;refresh();},'decor-card')));
  }else{
    for(const radio of $('decors').querySelectorAll('input[name="decor"]'))radio.checked=radio.value===decor;
  }
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
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=currentDimensions()[id];input.setAttribute('aria-describedby','error');
    input.addEventListener('input',()=>{currentDimensions()[id]=input.value;refresh();});input.addEventListener('focus',()=>{active=id;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    unit.append(input,element('span','','cm'));wrap.append(label,unit);$('dimensions').append(wrap);
  }
  renderRadiusInputs();
}
function payload(){const radii=product==='straight'?Object.fromEntries(straightCorner(straightSide,straightTreatment).parameters.map(k=>[k,cmInputToMmText(radiusValues[k])])):{};return {schemaVersion:2,inputUnit:'mm',...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),...(product==='straight'?{straightCorner:{side:straightSide,treatment:straightTreatment,parameters:radii}}:{}),product,geometry:variants[product],corner,dimensions:Object.fromEntries(c.families[product].fields.map(k=>[k,cmInputToMmText(currentDimensions()[k])])),
  ...(['round','chamfer'].includes(corner)?{special:{size:cmInputToMmText($('special').value)}}:{}),material,decor,quantity:Number($('quantity').value)};}
function renderDrawing(){if(!lastGeometry)return;const textureUrl=decorImageUrl(decor);const markup=svg(lastGeometry,active,{decor,showDimensions,textureUrl,unit:'cm'});$('drawing').innerHTML=namespaceSvg(markup,'main');
  detailOptions.hidden=product!=='straight'||straightSide==='none';
  for(const button of detailOptions.children){const side=button.dataset.detail;button.disabled=side!=='overview'&&straightSide!==side&&straightSide!=='both';button.setAttribute('aria-pressed',String((drawingDetail??'overview')===side));}
  if($('drawing-dialog').open)$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:true,detail:drawingDetail,textureUrl,unit:'cm'}),'large');}
function summary(config){
  $('summary-shape').textContent=names[product];$('preview-family').textContent='Vorschau';
  const decorName=c.decors.find(d=>d.id===decor).label;
  $('preview-material').textContent=`${material==='APL38'?'38':'17,5'} mm · ${decorName}`;
  $('selected-surface-name').textContent=decorName;
  $('selected-surface-thickness').textContent=`${material==='APL38'?'38':'17,5'} mm · Schichtstoff`;
  const rows=[];
  if(!config)rows.push(['Maße','Wird geprüft …']);
  else if(product==='straight')rows.push(['Maße',`${mmToCmText(config.dimensions.L1)} × ${mmToCmText(config.dimensions.B1)} cm`]);
  else rows.push(['Maße',Object.entries(config.dimensions).map(([key,value])=>`${key}: ${mmToCmText(value)} cm`).join(' · ')]);
  rows.push(['Material',`Schichtstoff · ${material==='APL38'?'38':'17,5'} mm`],['Dekor',decorName]);
  if(product==='straight'){
    const location={none:'Ohne Bearbeitung',left:'Links',right:'Rechts',both:'Beidseitig'}[straightSide];
    const finish={round:'Abgerundet',chamfer_square:'Eckig abgeschrägt',chamfer_continuous:'Vorderkante durchlaufend'}[straightTreatment];
    rows.push(['Ecken',straightSide==='none'?location:`${location} · ${finish}`]);
    const p=config?.straightCorner?.parameters;
    if(p&&straightSide!=='none'){
      if(straightTreatment==='round'){
        if(p.R1!==undefined)rows.push(['Links',`Radius ${mmToCmText(p.R1)} cm`]);
        if(p.R2!==undefined)rows.push(['Rechts',`Radius ${mmToCmText(p.R2)} cm`]);
      }else{
        if(p.L2!==undefined&&p.B2!==undefined)rows.push(['Links',`${mmToCmText(p.L2)} × ${mmToCmText(p.B2)} cm`]);
        if(p.L3!==undefined&&p.B3!==undefined)rows.push(['Rechts',`${mmToCmText(p.L3)} × ${mmToCmText(p.B3)} cm`]);
      }
    }
  }
  $('summary').replaceChildren(...rows.map(([key,value])=>{const row=element('div');row.append(element('dt','',key),element('dd','',value));return row;}));
}
function priceDisplay(value,label){$('price').textContent=value;$('price-label').textContent=label;$('mobile-price').textContent=value;$('mobile-price-label').textContent=label;}
function updateCornerBounds(){
  if(product!=='straight'||straightSide==='none')return;
  let dims;try{dims=Object.fromEntries(Object.entries(straightDimensionValues).map(([key,value])=>[key,Number(cmInputToMmText(value))]));}catch{return;}
  const parameters=Object.fromEntries(Object.entries(radiusValues).map(([key,value])=>{try{return [key,Number(cmInputToMmText(value))];}catch{return [key,NaN];}}));
  const limits=cornerLimits(straightSide,straightTreatment,dims,parameters);
  for(const [key,limit] of Object.entries(limits.fields)){
    const input=$(`dim-${key}`);if(!input)continue;
    input.setAttribute('aria-invalid',String(!limits.enabled||!Number.isInteger(parameters[key])||parameters[key]<limit.min||parameters[key]>limit.max||parameters[key]%limit.step!==0));
    $(`hint-${key}`).textContent=limit.max>=limit.min?cmRange(limit.min,limit.max,limit.step):'Dafür bleibt zu wenig Platz. Andere Eckmaße oder Plattenmaße anpassen.';
  }
  radiusWrap.querySelector('.a1-limit-note').textContent=limits.enabled?'Konservative Vorschaugrenzen · Fertigungsprüfung bleibt erforderlich.':customerMeasureError(limits.reason);
}
const controller=createPreviewController({request:async body=>{if(adapters.preview)return adapters.preview(body,{signal:abort.signal});const response=await fetch('/api/preview',{signal:abort.signal,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;},
  onPending:()=>{if(disposed)return;valid=false;$('next').disabled=true;$('drawing').setAttribute('aria-busy','true');$('error').hidden=true;priceDisplay('Wird berechnet …','Deine Konfiguration');$('tax-note').textContent='';$('price-note').textContent='';summary(null);},
  onResult:result=>{if(disposed)return;valid=true;lastGeometry=result.geometry;$('drawing').setAttribute('aria-busy','false');renderDrawing();summary(result.config);$('next').disabled=false;$('warnings').textContent=customerMeasureError(result.geometry.warnings.join(' '));
    $('shape-note').textContent=product==='straight'?(straightTreatment==='chamfer_continuous'?'Weiche Übergänge schematisch · Keine Fertigungsfreigabe.':'Planungsvorschau – Maße und Ausführung vor Bestellung prüfen.'):`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`;
    if(result.quote.status==='calculated-not-sale-approved'){
      priceDisplay(money(result.quote.totalGrossReferenceCents/100),`Unverbindlicher Bruttopreis${result.config.quantity>1?' · '+result.config.quantity+' Stück':''}`);
      $('tax-note').textContent=result.quote.taxNote;
      $('price-note').textContent=customerMeasureError(result.quote.availabilityNote);
    }else if(['unpriced','unavailable'].includes(result.quote.status)){
      priceDisplay('Preis offen','Unverbindliche Vorschau');$('tax-note').textContent='Kundenversand separat';
      $('price-note').textContent=customerMeasureError(result.quote.message||'Für diese Kombination liegt noch keine Preisvorschau vor.');
    }else if(result.quote.illustration){priceDisplay(money(result.quote.illustration.gross),`Preisbeispiel${result.config.quantity>1?' · '+result.config.quantity+' Stück':''}`);$('tax-note').textContent='inkl. 19 % MwSt. · zzgl. Kundenversand';$('price-note').textContent='Rechenbeispiel zum belegten Referenzpreis, unter der Annahme einer ungeteilten Platte. Noch kein verbindliches Angebot.';}
    else if(embedded&&result.quote.ruleVersion==='admin-visual-only'){
      // Local package preview deliberately has no admin-only WordPress PHP V3 endpoint.
      priceDisplay(product==='straight'?'Im Shop-Test':'Noch offen',product==='straight'?'V3-Preisvorschau':'Preisvorschau');
      $('tax-note').textContent='';
      $('price-note').textContent=product==='straight'?'Im lokalen Test nicht verfügbar. Der echte V3-Preis wird im geschützten WordPress-Admin-Test berechnet.':'L-/U-Formen haben noch keine freigegebene Preisvorschau.';
    }
    else {priceDisplay('Preis auf Anfrage','Dein Preis');$('tax-note').textContent='Noch kein bestätigter Gesamtpreis';$('price-note').textContent=result.quote.referenceMatched?'Preisreferenz vorhanden. Für den Gesamtpreis fehlen noch die bestätigte Teileaufteilung und Versandprüfung.':'Diese Kombination wird noch geprüft. Wir zeigen keinen geschätzten Bestellpreis.';}
  },onError:error=>{if(disposed)return;valid=false;lastGeometry=null;summary(null);$('drawing').replaceChildren();$('drawing').setAttribute('aria-busy','false');$('large-drawing').replaceChildren();$('error').textContent=customerMeasureError(error);$('error').hidden=false;$('shape-note').textContent='Bitte korrigiere die markierten Maße. Die letzte Kontur wird bei ungültigen Werten entfernt.';priceDisplay('Noch offen','Bitte Maße prüfen');$('price-note').textContent='Für diese Eingabe ist keine gültige Vorschau verfügbar.';}
});
function refresh(){
  shell.style.setProperty('--hpz-decor-image',`url("${decorImageUrl(decor)}")`);
  shell.dataset.corner=corner;
  $('special-wrap').hidden=!['round','chamfer'].includes(corner);
  $('corner-note').textContent=['round','chamfer'].includes(corner)?'Eckmuster oben links. Größe im Schritt „Maße“ anpassen; Ausführung noch zu prüfen.':corner==='continuous'?'Kontur und Verbindung dieser Ausführung sind noch zu prüfen.':'Klare, rechtwinklige Ecken. Die Außenkante ist im gleichen Dekor vorgesehen.';
  if(product==='straight'){
    const v=straightCorner(straightSide,straightTreatment);
    $('special-wrap').hidden=true;
    $('corner-note').textContent=v.id==='none'?'Vorderkante unten. Ohne Eckbearbeitung.':v.treatment==='round'?'Rundungen im nächsten Schritt einstellen.':v.treatment==='chamfer_square'?'Gerade Diagonalen. Länge und Tiefe im nächsten Schritt einstellen.':'Weichere Übergänge, schematisch dargestellt. Vorschau vorerst bei 200 × 60 cm.';
    $('summary-shape').textContent=`Gerade · ${sides[v.side]}`;
  }
  for(const id of c.families[product].fields){const input=$(`dim-${id}`);try{cmInputToMmText(input.value);input.removeAttribute('aria-invalid');}catch{input.setAttribute('aria-invalid','true');}}
  updateCornerBounds();
  return controller.refresh(()=>payload());
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
 if(product==='straight')$('cart').textContent='Bestellung gesperrt · Admin-Test';
}
const handle={destroy(){if(disposed)return;disposed=true;abort.abort();for(const d of shadow.querySelectorAll('dialog'))if(d.open)d.close();shadow.replaceChildren();mounts.delete(root);},updateContext(next){return mountConfigurator(root,{...context,...next},adapters);}};
mounts.set(root,handle);return handle;
}
