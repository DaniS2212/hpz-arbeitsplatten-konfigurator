import {catalog} from '/core/config.mjs';
import {familyDimensionGroups} from '../core/family-presentation.mjs';
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
const fieldErrors=new Map();
const retryPriceButton=element('button','price-retry','Preis erneut berechnen');
retryPriceButton.type='button';retryPriceButton.hidden=true;
$('price-note').after(retryPriceButton);
const cornerTitle=$('corners').previousElementSibling;
const sideWrap=element('fieldset','a1-sides');
const sideLegend=element('legend','','Welche Seite?'),cornerHelp=element('button','a11-info','i');
cornerHelp.type='button';cornerHelp.setAttribute('aria-label','Hinweise zu Eckmaßen und Vorschaugrenzen');sideLegend.append(cornerHelp);
sideWrap.append(sideLegend,element('div','a1-side-options'));
cornerTitle.before(sideWrap);
const radiusWrap=element('fieldset','a1-radii');
$('dimensions').after(radiusWrap);
const formError=element('p','measurement-error');
formError.id='measurement-error';formError.hidden=true;formError.setAttribute('role','alert');
radiusWrap.after(formError);
const infoDialog=element('dialog');infoDialog.id='corner-help';
infoDialog.innerHTML='<button class="dialog-close" type="button" aria-label="Eckhinweise schließen">×</button><h2>Deine vorderen Ecken</h2><p>Du siehst die Platte von oben; die Vorderkante liegt unten. Längen und Tiefen kannst du auf 0,1 cm genau eingeben, Eckmaße in 1-cm-Schritten. Beim Wechsel der Bearbeitung werden nur die Eckmaße zurückgesetzt.</p><p>R1 ist vorne links, R2 vorne rechts. Bei Schrägen bezeichnet L2/L3 die Länge entlang der Vorderkante, B2/B3 die Tiefe entlang der Seite.</p><p>Bei der eckigen Abschrägung entsteht eine gerade Diagonale. Die durchlaufende Vorderkante zeigen wir mit schematischen Übergängen bei allen zulässigen Maßen. Bei dieser Variante: Länge 100–400 cm, Tiefe 30–90 cm. Eckmaße L2/L3 6–180 cm, B2/B3 6–50 cm, mit mindestens 10 cm Restkante.</p><p>Die Shopgrenzen liegen vorsichtig innerhalb der in Speedmaster angezeigten Bereiche. Maßgeblich für die Fertigung sind die eingegebenen Maße.</p>';
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
function setFieldError(key,message=''){
  const input=$(`dim-${key}`),note=$(`field-error-${key}`);
  if(!input||!note){fieldErrors.delete(key);return;}
  const wrapper=input.closest('.a1-radius-field')??input.parentElement.parentElement;
  if(message){
    fieldErrors.set(key,message);
    input.setAttribute('aria-invalid','true');
    wrapper.classList.add('has-measure-error');
    note.textContent=message;note.hidden=false;
  }else{
    fieldErrors.delete(key);
    input.removeAttribute('aria-invalid');
    wrapper.classList.remove('has-measure-error');
    note.textContent='';note.hidden=true;
  }
}
function clearFieldErrors(){for(const key of [...fieldErrors.keys()])setFieldError(key);}
function renderRadiusInputs(){
  for(const key of ['R1','R2','L2','B2','L3','B3'])fieldErrors.delete(key);
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
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=radiusValues[key];input.setAttribute('aria-describedby',`hint-${key} field-error-${key}`);
    input.setAttribute('aria-label',`${property} Abschrägung ${place} (${key})`.replace('Radius Abschrägung','Radius'));
    input.addEventListener('input',()=>{radiusValues[key]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=key;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const hint=element('p','microcopy');hint.id=`hint-${key}`;
    const inline=element('p','field-error');inline.id=`field-error-${key}`;inline.hidden=true;inline.setAttribute('aria-live','polite');
    unit.append(input,element('span','','cm'));wrap.append(label,unit,hint,inline);grids.get(side).append(wrap);
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
 if(product==='straight'){view='plan';$('parts-note').hidden=true;$('measure-toggle').hidden=false;$('view-plan').setAttribute('aria-pressed','true');$('view-parts').setAttribute('aria-pressed','false');}
 shadow.querySelector('[data-step="0"] h2').textContent=product==='straight'?'Vordere Ecken':'Grundriss wählen';
  shadow.querySelector('[data-step="1"] .section-intro').textContent=product==='straight'
    ?'In cm, auf 0,1 cm genau. Tippe ein Maß an, um es in der Zeichnung hervorzuheben.'
    :'Maße deiner schematischen Arbeitsplattenform. Tippe ein Feld an, um die passende Strecke in der Zeichnung hervorzuheben.';
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
  const appendDimensionInput=(id,customerLabel,target)=>{
    const wrap=element('div'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    label.htmlFor='dim-'+id;label.append(document.createTextNode(customerLabel),element('span','',id));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=currentDimensions()[id];input.setAttribute('aria-describedby','field-error-'+id);
    input.addEventListener('input',()=>{currentDimensions()[id]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=id;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const inline=element('p','field-error');inline.id='field-error-'+id;inline.hidden=true;inline.setAttribute('aria-live','polite');
    unit.append(input,element('span','','cm'));wrap.append(label,unit,inline);target.append(wrap);
  };
  if(product==='straight'){
    for(const id of c.families[product].fields)appendDimensionInput(id,id==='L1'?'Länge':'Tiefe',$('dimensions'));
  }else{
    for(const [index,group] of familyDimensionGroups(product).entries()){
      const section=element('section','apl-dimension-group');section.dataset.group=group.id;
      const title=element('h3','',group.title);title.id='apl-group-'+group.id;
      section.setAttribute('aria-labelledby',title.id);
      const copy=element('div','apl-dimension-group-copy');copy.append(title,element('p','',group.description));
      const head=element('div','apl-dimension-group-heading');
      head.append(element('span','apl-dimension-group-number',String(index+1).padStart(2,'0')),copy);
      const fields=element('div','apl-dimension-group-fields');
      for(const field of group.fields)appendDimensionInput(field.id,field.label,fields);
      section.append(head,fields);$('dimensions').append(section);
    }
  }
  renderRadiusInputs();
}
function payload(){const radii=product==='straight'?Object.fromEntries(straightCorner(straightSide,straightTreatment).parameters.map(k=>[k,cmInputToMmText(radiusValues[k])])):{};return {schemaVersion:2,inputUnit:'mm',...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),...(product==='straight'?{straightCorner:{side:straightSide,treatment:straightTreatment,parameters:radii}}:{}),product,geometry:variants[product],corner,dimensions:Object.fromEntries(c.families[product].fields.map(k=>[k,cmInputToMmText(currentDimensions()[k])])),
  ...(['round','chamfer'].includes(corner)?{special:{size:cmInputToMmText($('special').value)}}:{}),material,decor,quantity:Number($('quantity').value)};}
function renderDrawing(){if(!lastGeometry)return;const textureUrl=decorImageUrl(decor);const markup=svg(lastGeometry,active,{decor,showDimensions:showDimensions&&view==='plan',textureUrl,unit:'cm'});$('drawing').innerHTML=namespaceSvg(markup,'main');
  detailOptions.hidden=product!=='straight'||straightSide==='none';
  for(const button of detailOptions.children){const side=button.dataset.detail;button.disabled=side!=='overview'&&straightSide!==side&&straightSide!=='both';button.setAttribute('aria-pressed',String((drawingDetail??'overview')===side));}
  if($('drawing-dialog').open)$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:product==='straight'||view==='plan',detail:drawingDetail,textureUrl,unit:'cm'}),'large');}
function summary(config,invalid=false){
  $('summary-shape').textContent=names[product];$('preview-family').textContent=product==='straight'?'Vorschau':names[product]+' · Planung';
  const decorName=c.decors.find(d=>d.id===decor).label;
  $('preview-material').textContent=`${material==='APL38'?'38':'17,5'} mm · ${decorName}`;
  $('selected-surface-name').textContent=decorName;
  $('selected-surface-thickness').textContent=`${material==='APL38'?'38':'17,5'} mm · Schichtstoff`;
  const rows=[];
  if(!config)rows.push(['Maße',invalid?'Bitte korrigieren':'Wird geprüft …']);
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
let saleReady=false,purchaseBusy=false;
function purchaseState(enabled){saleReady=enabled&&!!adapters.purchase&&product==='straight'&&valid&&!purchaseBusy;$('cart').disabled=!saleReady;if(adapters.purchase)$('cart').textContent=saleReady?'In den Warenkorb →':'Konfiguration wird geprüft';}
function priceDisplay(value,label){$('price').textContent=value;$('price-label').textContent=label;$('mobile-price').textContent=value;$('mobile-price-label').textContent=label;}
function updateCornerBounds(){
  if(product!=='straight'||straightSide==='none')return;
  let dims;
  try{dims=Object.fromEntries(Object.entries(straightDimensionValues).map(([key,value])=>[key,Number(cmInputToMmText(value))]));}catch{return;}
  const parameters=Object.fromEntries(Object.entries(radiusValues).map(([key,value])=>{try{return [key,Number(cmInputToMmText(value))];}catch{return [key,NaN];}}));
  const limits=cornerLimits(straightSide,straightTreatment,dims,parameters);
  for(const [key,limit] of Object.entries(limits.fields)){
    const input=$(`dim-${key}`);if(!input)continue;
    const value=parameters[key];
    let issue='';
    if(!Number.isInteger(value))issue='Bitte in cm eingeben, z. B. 15.';
    else if(limits.enabled){
      if(limit.max<limit.min)issue='Diese Ecke ist mit den gewählten Maßen nicht möglich.';
      else if(value<limit.min)issue=`Mindestens ${mmToCmText(limit.min)} cm möglich.`;
      else if(value>limit.max)issue=`Maximal ${mmToCmText(limit.max)} cm möglich.`;
      else if(value%limit.step!==0)issue='Bitte ganze Zentimeter eingeben.';
    }
    setFieldError(key,issue);
    $(`hint-${key}`).textContent=limit.max>=limit.min
      ?cmRange(limit.min,limit.max,limit.step)
      :'Dafür bleibt zu wenig Platz. Andere Eckmaße oder Plattenmaße anpassen.';
  }
  radiusWrap.querySelector('.a1-limit-note').textContent=limits.enabled
    ?'Konservative Vorschaugrenzen · Fertigungsprüfung bleibt erforderlich.'
    :customerMeasureError(limits.reason);
}
function applyVisual(result){
  if(disposed)return;
  valid=true;
  lastGeometry=result.geometry;
  clearFieldErrors();
  $('drawing-status').hidden=true;
  formError.hidden=true;
  $('error').hidden=true;
  $('drawing').setAttribute('aria-busy','false');
  renderDrawing();
  summary(result.config);
  $('next').disabled=false;
  $('warnings').textContent=customerMeasureError(result.geometry.warnings.join(' '));
  $('shape-note').textContent=product==='straight'
    ?(straightTreatment==='chamfer_continuous'
       ?'Weiche Übergänge schematisch · Keine Fertigungsfreigabe.'
       :'Planungsvorschau – Maße und Ausführung vor Bestellung prüfen.')
    :`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`;
}
const controller=createPreviewController({request:async (body,{signal,onVisual})=>{if(adapters.preview)return adapters.preview(body,{signal,onVisual});const response=await fetch('/api/preview',{signal,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;},
  onPending:()=>{if(disposed)return;retryPriceButton.hidden=true;valid=false;purchaseState(false);$('next').disabled=true;$('drawing').setAttribute('aria-busy',String(!lastGeometry));$('error').hidden=true;priceDisplay('Wird berechnet …','Preisvorschau');$('tax-note').textContent='';$('price-note').textContent='';if(!lastGeometry)summary(null);},
   onVisual:applyVisual,
  onResult:result=>{if(disposed)return;applyVisual(result);purchaseState(false);retryPriceButton.hidden=result.quote.status!=='unavailable';
     if(result.quote.status==='calculated-ready-for-cart'&&result.quote.purchasable===true&&embedded&&adapters.purchase&&product==='straight'){
      priceDisplay(money(result.quote.totalGrossReferenceCents/100),`Bruttopreis · ${result.config.quantity} Stück`);
      $('tax-note').textContent=result.quote.taxNote||'inkl. 19 % MwSt. · zzgl. Versand';
      $('price-note').textContent='Maße und Ausführung werden beim Hinzufügen und an der Kasse erneut geprüft.';
      purchaseState(true);
     }else if(result.quote.status==='calculated-not-sale-approved'){
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
  },onError:error=>{
    if(disposed)return;
    retryPriceButton.hidden=true;
    valid=false;purchaseState(false);
    const message=customerMeasureError(error);
    const match=message.match(/^(L[123]|B[123]|R[12]):\s*/);
    if(match&&!fieldErrors.has(match[1]))setFieldError(match[1],message.slice(match[0].length));
    formError.textContent=message;formError.hidden=false;
    $('drawing').setAttribute('aria-busy','false');
    if(lastGeometry){
      renderDrawing();
      $('drawing-status').textContent='Letzter gültiger Stand – bitte die markierte Eingabe korrigieren.';
      $('drawing-status').hidden=false;
    }else{
      $('drawing').replaceChildren();$('large-drawing').replaceChildren();
      $('drawing-status').hidden=true;
    }
    summary(null,true);
    $('error').textContent=message;$('error').hidden=fieldErrors.size>0;
    $('shape-note').textContent=lastGeometry
      ?'Die Skizze zeigt die zuletzt gültigen Maße, nicht die aktuelle ungültige Eingabe.'
      :'Bitte gültige Maße eingeben, damit die Skizze angezeigt werden kann.';
    priceDisplay('–','Maße prüfen');$('tax-note').textContent='';
    $('price-note').textContent='Bitte Maße korrigieren. Für diese Eingabe wird kein Preis berechnet.';
    $('next').disabled=true;
  }
});
function refresh(){
  purchaseState(false);
  shell.style.setProperty('--hpz-decor-image',`url("${decorImageUrl(decor)}")`);
  shell.dataset.corner=corner;
  $('special-wrap').hidden=!['round','chamfer'].includes(corner);
  $('corner-note').textContent=['round','chamfer'].includes(corner)?'Eckmuster oben links. Größe im Schritt „Maße“ anpassen; Ausführung noch zu prüfen.':corner==='continuous'?'Kontur und Verbindung dieser Ausführung sind noch zu prüfen.':'Klare, rechtwinklige Ecken. Die Außenkante ist im gleichen Dekor vorgesehen.';
  if(product==='straight'){
    const v=straightCorner(straightSide,straightTreatment);
    $('special-wrap').hidden=true;
    $('corner-note').textContent=v.id==='none'?'Vorderkante unten. Ohne Eckbearbeitung.':v.treatment==='round'?'Rundungen im nächsten Schritt einstellen.':v.treatment==='chamfer_square'?'Gerade Diagonalen. Länge und Tiefe im nächsten Schritt einstellen.':'Weichere Übergänge, schematisch dargestellt. Alle zulässigen Plattenmaße möglich.';
    $('summary-shape').textContent=`Gerade · ${sides[v.side]}`;
  }
  for(const id of c.families[product].fields){
    const input=$(`dim-${id}`);
    try{cmInputToMmText(input.value);setFieldError(id);}
    catch{setFieldError(id,'Bitte ein gültiges Maß in cm eingeben (z. B. 200 oder 200,1).');}
  }
  updateCornerBounds();
  return controller.refresh(()=>payload());
}
retryPriceButton.addEventListener('click',()=>{retryPriceButton.hidden=true;refresh();});
$('geometry').addEventListener('change',()=>{variants[product]=$('geometry').value;refresh();});
for(const id of ['quantity','special'])$(id).addEventListener('input',refresh);
for(const [id,amount] of [['minus',-1],['plus',1]])$(id).addEventListener('click',()=>{const n=Number($('quantity').value);$('quantity').value=String(Math.min(1000,Math.max(1,(Number.isFinite(n)?Math.trunc(n):1)+amount)));refresh();});
$('cart').addEventListener('click',async ()=>{
  if(!saleReady||purchaseBusy||!adapters.purchase||!valid||product!=='straight')return;
  const raw=payload();
  purchaseBusy=true;purchaseState(false);
  $('cart').textContent='Wird zum Warenkorb hinzugefügt …';
  try{
    const data=await adapters.purchase(raw);
    const url=new URL(data?.cartUrl??'',location.href);
    if(!/^https?:$/.test(url.protocol)||url.origin!==location.origin||!data?.added)
      throw new Error('Der Warenkorb konnte nicht geöffnet werden.');
    location.assign(url.href);
  }catch(error){
    purchaseBusy=false;
    $('price-note').textContent=error?.message||'Bitte versuche es erneut.';
    purchaseState(false);
  }
});
$('config').addEventListener('submit',event=>event.preventDefault());$('back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
$('next').addEventListener('click',()=>{if(!valid)return;if(step===2)shadow.querySelector('.order-summary').scrollIntoView({behavior:'smooth',block:'center'});else showStep(step+1);});
$('mobile-summary').addEventListener('click',()=>shadow.querySelector('.order-summary').scrollIntoView({behavior:'smooth',block:'center'}));
$('measure-toggle').addEventListener('click',()=>{showDimensions=!showDimensions;$('measure-toggle').setAttribute('aria-pressed',String(showDimensions));renderDrawing();});
for(const [id,mode] of [['view-plan','plan'],['view-parts','parts']])$(id).addEventListener('click',()=>{view=mode;$('parts-note').hidden=view!=='parts';$('measure-toggle').hidden=view==='parts';$('view-plan').setAttribute('aria-pressed',String(view==='plan'));$('view-parts').setAttribute('aria-pressed',String(view==='parts'));renderDrawing();});
for(const id of ['drawing','large-drawing'])$(id).addEventListener('click',event=>{const measure=event.target.closest('[data-field]');if(measure){if($('drawing-dialog').open)$('drawing-dialog').close();showStep(1);const field=$(`dim-${measure.dataset.field}`);field?.focus();}});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('enlarge').addEventListener('click',()=>{if(!lastGeometry)return;drawingDetail=product==='straight'&&straightSide!=='none'&&root.getBoundingClientRect().width<=760?(straightSide==='right'||['R2','L3','B3'].includes(active)?'right':'left'):null;$('drawing-dialog').showModal();renderDrawing();});
for(const dialog of shadow.querySelectorAll('dialog'))dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
rebuild();showStep(0);refresh();

if(embedded){
 shell.querySelector('#products').hidden=true;
 if(product==='straight'&&!adapters.purchase)$('cart').textContent='Bestellung gesperrt · Admin-Test';
}
const handle={destroy(){if(disposed)return;disposed=true;controller.cancel();abort.abort();for(const d of shadow.querySelectorAll('dialog'))if(d.open)d.close();shadow.replaceChildren();mounts.delete(root);},updateContext(next){return mountConfigurator(root,{...context,...next},adapters);}};
mounts.set(root,handle);return handle;
}
