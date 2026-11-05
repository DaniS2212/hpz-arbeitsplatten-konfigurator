import {catalog} from './core/config.js?v=1.0.3';
import {lCornerKeys,defaultLCorner,lDimensionKeys,lVisibleDimensionKeys,lDefaultDimensions,lCornerPreviewLimits} from './core/l-geometry.js?v=1.0.3';
import {cmInputToMmText,mmToCmText,cmRange,customerMeasureError} from './core/customer-measures.js?v=1.0.3';
import {svg} from './core/geometry.js?v=1.0.3';
import {createPreviewController} from './latest.js?v=1.0.3';
import {template} from './component-template.js?v=1.0.3';
import {resolveProduct} from './core/products.js?v=1.0.3';
import {decorImageUrl} from './decor-images.js?v=1.0.3';
import {sides,treatments,straightCorner,cornerLimits,defaultCornerParameters} from './core/straight-corners.js?v=1.0.3';
const mounts=new WeakMap();let sequence=0;
export function mountConfigurator(root,context={},adapters={}){
 const startingDecor=context.decorId??'H1145';decorImageUrl(startingDecor);
 const embedded=context.presentationMode==='embedded';
 const resolved=embedded?resolveProduct(context):null;
 if(context.family&&resolved&&context.family!==resolved.family)throw new Error('Produktfamilie passt nicht.');
 mounts.get(root)?.destroy();
 const shadow=root.shadowRoot||root.attachShadow({mode:'open'});
 const shell=document.createElement('div');shell.className='hpz-apl';shell.dataset.mode=embedded?'embedded':'demo';
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./component.css?v=1.0.3',import.meta.url).href;
 const studioLink=document.createElement('link');studioLink.rel='stylesheet';studioLink.href=new URL('./kuechenstudio-060.css?v=1.0.3',import.meta.url).href;
 shell.innerHTML=template;shadow.replaceChildren(link,studioLink,shell);
 const abort=new AbortController();let disposed=false;const instance='hpz-apl-'+(++sequence);
 function namespaceSvg(markup,view){return markup.replaceAll('apl-arrow',instance+'-'+view+'-arrow').replaceAll('apl-white',instance+'-'+view+'-white').replaceAll('apl-oak',instance+'-'+view+'-oak').replaceAll('apl-texture',instance+'-'+view+'-texture').replaceAll('apl-parts-clip',instance+'-'+view+'-parts-clip');}
const c=catalog(),$=id=>shadow.getElementById(id);
const names={straight:'Gerade',l:'L-Form',u:'U-Form'};
const icons={straight:'M8 11 H68 V35 H8 Z',l:'M8 6 H68 V22 H26 V42 H8 Z',u:'M8 6 H68 V42 H51 V22 H25 V42 H8 Z'};
const cornerIcons={square:'M5 25 V5 H30',round:'M5 25 V17 Q5 5 17 5 H30',chamfer:'M5 25 V16 L16 5 H30',continuous:'M5 25 V5 H30 M10 25 V10 H30'};
const cornerNames={square:'Eckig',round:'Abgerundet',chamfer:'Abgeschrägt',continuous:'Durchlaufend'};
const fieldNames={L1:'Gesamtbreite',L2:'Links außen',L3:'Rechts außen',B1:'Tiefe oben',B2:'Breite links',B3:'Breite rechts'};
let product=resolved?.family??'straight',step=0,active='',lastGeometry=null,showDimensions=true,view='plan',selectedPart=null,selectedSeam=null,valid=false;
let material='APL38',decor=startingDecor,corner='square';
let straightSide='none',straightTreatment=null,lSide='none',lTreatment=null,lCornerValues={};
let radiusValues={},drawingDetail=null;
const fieldErrors=new Map();
const lSides={none:'Keine',left:'Links',right:'Rechts',both:'Beide Außenecken'};
const retryPriceButton=element('button','price-retry','Preis erneut berechnen');
retryPriceButton.type='button';retryPriceButton.hidden=true;
$('price-note').after(retryPriceButton);
const partChoices=element('div','apl-part-choices');partChoices.id='part-choices';$('parts-note').append(partChoices);
const seamChoices=element('div','apl-seam-choices');seamChoices.id='seam-choices';
const seamExplain=element('p','apl-seam-explain');seamExplain.id='seam-explain';
$('parts-note').append(seamChoices,seamExplain);
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
// L corner rendering follows its own Speedmaster silhouette, not the
// separately documented straight-worktop schematic rounded transitions.
function lTreatmentIcon(kind){
 if(kind!=='chamfer_continuous')return treatmentIcon(kind);
 return '<svg viewBox="0 0 98 46" aria-hidden="true"><path d="M10 5 H88 V39 H29 L10 20 Z" fill="#e6f1f1" stroke="#557b83" stroke-width="2"/><path d="M10 20 L29 39 H80" fill="none" stroke="#146178" stroke-width="3"/></svg>';
}
function setFieldError(key,message=''){
  const isLCorner=key.startsWith('corner-'),fieldKey=isLCorner?key.slice(7):key;
  const input=$(isLCorner?`corner-${fieldKey}`:`dim-${fieldKey}`),note=$(isLCorner?`corner-field-error-${fieldKey}`:`field-error-${fieldKey}`);
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
  for(const key of (product==='l'?['R1','R2','L3','B3','L4','B4','L5','B5','L6','B6'].map(k=>'corner-'+k):['R1','R2','L2','B2','L3','B3']))fieldErrors.delete(key);
  radiusWrap.replaceChildren();const l=product==='l',side=l?lSide:straightSide,type=l?lTreatment:straightTreatment;
  radiusWrap.hidden=!(l||product==='straight')||side==='none';
  if(radiusWrap.hidden)return;
  radiusWrap.append(element('legend','',type==='round'?'Deine Rundungen':'Deine Abschrägungen'));
  const keys=l?lCornerKeys(variants.l,lSide,lTreatment):straightCorner(straightSide,straightTreatment).parameters;
  const leftKeys=l?lCornerKeys(variants.l,'left',lTreatment):['R1','L2','B2'];
  const grids=new Map();
  for(const key of keys){
    const side=leftKeys.includes(key)?'left':'right';
    const place=l?(side==='left'?'außen links':'außen rechts'):(side==='left'?'vorne links':'vorne rechts');
    if(!grids.has(side)){
      const group=element('div','a1-corner-group');
      group.setAttribute('role','group');group.setAttribute('aria-label',`Ecke ${place}`);
      group.append(element('p','a1-corner-heading',side==='left'?'Linke Ecke':'Rechte Ecke'));
      const grid=element('div','a1-corner-grid');group.append(grid);radiusWrap.append(group);grids.set(side,grid);
    }
    const wrap=element('div','a1-radius-field'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    const property=key.startsWith('R')?'Radius':key.startsWith('L')?'Länge':l?'Breite':'Tiefe';
    const cornerId=l?`corner-${key}`:`dim-${key}`;
    label.htmlFor=cornerId;label.textContent=property;label.append(element('span','',key));
    input.id=cornerId;input.type='text';input.inputMode='decimal';input.value=l?lCornerValues[key]:radiusValues[key];input.setAttribute('aria-describedby',l?`corner-hint-${key} corner-field-error-${key}`:`hint-${key} field-error-${key}`);
    input.setAttribute('aria-label',`${property} Abschrägung ${place} (${key})`.replace('Radius Abschrägung','Radius'));
    input.addEventListener('input',()=>{if(l)lCornerValues[key]=input.value;else radiusValues[key]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=l?`corner-${key}`:key;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const hint=element('p','microcopy');hint.id=l?`corner-hint-${key}`:`hint-${key}`;if(l)hint.textContent='Vorschauwert · Herstellergrenzen noch offen';
    const inline=element('p','field-error');inline.id=l?`corner-field-error-${key}`:`field-error-${key}`;inline.hidden=true;inline.setAttribute('aria-live','polite');
    unit.append(input,element('span','','cm'));wrap.append(label,unit,hint,inline);grids.get(side).append(wrap);
  }
  radiusWrap.append(element('p','a1-limit-note',l?'Die tatsächlichen Speedmaster-Grenzen sind noch zu bestätigen.':'Vorschaugrenzen · Fertigungsprüfung bleibt erforderlich.'));
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
function renderLChoices(){
 if(product!=='l')return;
 sideWrap.hidden=false;sideLegend.firstChild.textContent='Welche Außenecke?';
 const mirror=variants.l==='L2';
 const lIcon=side=>{
   const points=mirror?'M8 6 H88 V40 H65 V20 H8 Z':'M8 6 H88 V20 H31 V40 H8 Z';
   return '<svg viewBox="0 0 96 46" aria-hidden="true"><path d="'+points+'" fill="#e6f1f1" stroke="#557b83" stroke-width="2"/>'
     +(['left','both'].includes(side)?'<circle cx="'+(mirror?8:31)+'" cy="'+(mirror?20:40)+'" r="4" fill="#ad8667"/>':'')
     +(['right','both'].includes(side)?'<circle cx="88" cy="'+(mirror?40:20)+'" r="4" fill="#ad8667"/>':'')+'</svg>';
 };
 sideWrap.lastElementChild.replaceChildren(...Object.entries(lSides).map(([id,name])=>choice('l-side',id,lIcon(id)+'<span>'+name+'</span>',lSide===id,()=>{
   lSide=id;lTreatment=id==='none'?null:(lTreatment??'round');
   lCornerValues=Object.fromEntries(Object.entries(defaultLCorner(variants.l,lSide,lTreatment).parameters).map(([k,v])=>[k,mmToCmText(Number(v))]));
   active='side-'+id;renderLChoices();renderRadiusInputs();refresh();
 },'a1-side-card')));
 $('corners').hidden=lSide==='none';cornerTitle.hidden=lSide==='none';cornerTitle.textContent='Bearbeitung';
 $('corners').style.gridTemplateColumns='1fr';
 $('corners').replaceChildren(...Object.entries(treatments).map(([id,name])=>choice('l-treatment',id,
   lTreatmentIcon(id)+'<span>'+name+'</span>'+(id==='chamfer_continuous'?'<small>Gerade Abschrägung · Kantenverlauf noch zu prüfen</small>':''),
   lTreatment===id,()=>{
     lTreatment=id;
     lCornerValues=Object.fromEntries(Object.entries(defaultLCorner(variants.l,lSide,lTreatment).parameters).map(([k,v])=>[k,mmToCmText(Number(v))]));
     active='side-'+lSide;renderRadiusInputs();refresh();
   },'a1-treatment-card')));
}
const variants={straight:'straight',l:'L1',u:'U1'};
const dimensionValues={L1:'200',L2:'120',L3:'180',B1:'60',B2:'60',B3:'60'};
const lDimensionValues=Object.fromEntries(['L1','L2','L3','L4'].map(id=>[id,lDefaultDimensions(id)]));
const straightDimensionValues={L1:'200',B1:'60'},currentDimensions=()=>product==='straight'?straightDimensionValues:product==='l'?lDimensionValues[variants.l]:dimensionValues;
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
    :product==='l'?'In cm: Tippe ein Maß an, um die passende Strecke in der Zeichnung hervorzuheben.'
    :'Maße deiner schematischen Arbeitsplattenform. Tippe ein Feld an, um die passende Strecke in der Zeichnung hervorzuheben.';
  if(product==='l'){
    infoDialog.querySelector('h2').textContent='Deine L-Arbeitsplatte';
    const guidance=[
      'Die Draufsicht zeigt die Außenmaße der L-Form. Die Gesamtfläche wird verbunden dargestellt; die genaue Aufteilung muss noch bestätigt werden.',
      'B1/B2 ist die gemeinsame Schenkelbreite, B3/B4 die gemeinsame Eckbreite. Bei L4 markiert B5 den Abstand zwischen den Diagonalen.',
      'Eckmaße folgen der Schenkelausrichtung: Bei L1 links unten ist L3 vertikal und B3 horizontal, rechts L4 horizontal und B4 vertikal. L2 ist gespiegelt; L3/L4 verwenden L5/B5 und L6/B6 entsprechend. Alle Eckgeometrien bleiben bis zum vollständigen Speedmaster-Abgleich Vorschauwerte.',
      'Für die Fertigung und Verbindungen fehlen noch Freigaben. Die L-Form ist derzeit nicht bestellbar.'
    ];
    infoDialog.querySelectorAll('p').forEach((p,i)=>{p.textContent=guidance[i]??'';});
  }
}
function renderChoices(){
  cornerTitle.hidden=false;cornerTitle.textContent='Wie soll die Ecke aussehen?';
  $('corners').hidden=false;
  sideWrap.hidden=product!=='straight';
  $('products').replaceChildren(...Object.keys(c.families).map(id=>choice('product',id,`<svg viewBox="0 0 76 48" aria-hidden="true"><path d="${icons[id]}"/></svg><span>${names[id]}</span>`,product===id,()=>{if(resolved)return;product=id;selectedPart=null;selectedSeam=null;rebuild();refresh();},'shape-card')));
  const visibleCorners=c.corners.filter(v=>v.id!=='continuous'||product!=='straight');
  $('corners').style.gridTemplateColumns=`repeat(${visibleCorners.length===4?2:3},1fr)`;
  $('corners').replaceChildren(...visibleCorners.map(item=>choice('corner',item.id,`<svg viewBox="0 0 36 30" aria-hidden="true"><path d="${cornerIcons[item.id]}"/></svg><span>${cornerNames[item.id]}</span>`,corner===item.id,()=>{corner=item.id;refresh();},'corner-card')));
  renderStraightChoices();
  renderLChoices();
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
  if(product==='straight'||product==='l')corner='square';
  renderChoices();$('variant-wrap').hidden=product==='straight';
  const shapeTitles={L1:'L1 · Schenkel links',L2:'L2 · Schenkel rechts',L3:'L3 · Diagonale innen',L4:'L4 · Diagonale innen und außen',U1:'U1 · zwei Schenkel'};
  $('geometry').replaceChildren(...c.families[product].geometries.map(id=>{const o=element('option','',shapeTitles[id]||`${id} · Prüfung offen`);o.value=id;return o;}));$('geometry').value=variants[product];
  if(product==='l')$('variant-wrap').querySelector('.microcopy').textContent=['L3','L4'].includes(variants.l)?'B1/B2 sowie B3/B4 werden gemeinsam eingegeben. Bearbeitung und Bestellung bleiben in Prüfung.':'Grundriss nach Speedmaster-Vorlage. Stoßfräsungen und Zusatzmaße noch in Prüfung.';
  $('dimensions').replaceChildren();
  const appendDimensionInput=(id,customerLabel,target)=>{
    const wrap=element('div'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    label.htmlFor='dim-'+id;label.append(document.createTextNode(customerLabel),element('span','',id));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=currentDimensions()[id];input.setAttribute('aria-describedby','field-error-'+id);
    input.addEventListener('input',()=>{currentDimensions()[id]=input.value;
      if(product==='l'&&['L3','L4'].includes(variants.l)){
        if(id==='B1')currentDimensions().B2=input.value;
        if(id==='B3')currentDimensions().B4=input.value;
      }
      refresh();});
    input.addEventListener('focus',()=>{active=id;shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));wrap.classList.add('active-dimension');renderDrawing();});
    const inline=element('p','field-error');inline.id='field-error-'+id;inline.hidden=true;inline.setAttribute('aria-live','polite');
    unit.append(input,element('span','','cm'));wrap.append(label,unit,inline);target.append(wrap);
  };
  // Preserve the plain two-column measure grid from the finished straight UI.
  const names=product==='straight'?{L1:'Länge',B1:'Tiefe'}
   :product==='l'?(['L3','L4'].includes(variants.l)
     ?{L1:'Gesamtlänge oben',L2:'Gesamtlänge links',B1:'Breite B1/B2 · Schenkel',B3:'Breite B3/B4 · Eckbereich',B5:'Breite B5 · Diagonalbereich'}
     :{L1:'Gesamtlänge oben',L2:variants.l==='L2'?'Gesamtlänge rechts':'Gesamtlänge links',B1:variants.l==='L2'?'Schenkelbreite rechts':'Schenkelbreite links',B2:'Tiefe oben'})
   :{L1:'Gesamtbreite oben',L2:'Gesamtlänge links',L3:'Gesamtlänge rechts',B1:'Tiefe oben',B2:'Schenkelbreite links',B3:'Schenkelbreite rechts'};
  for(const id of (product==='l'?lVisibleDimensionKeys(variants.l):c.families[product].fields))appendDimensionInput(id,names[id]||id,$('dimensions'));
  renderRadiusInputs();
}
function payload(){const radii=product==='straight'?Object.fromEntries(straightCorner(straightSide,straightTreatment).parameters.map(k=>[k,cmInputToMmText(radiusValues[k])])):{};
 const lParams=product==='l'?Object.fromEntries(lCornerKeys(variants.l,lSide,lTreatment).map(k=>[k,cmInputToMmText(lCornerValues[k])])):{};
 return {schemaVersion:2,inputUnit:'mm',...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),...(product==='straight'?{straightCorner:{side:straightSide,treatment:straightTreatment,parameters:radii}}:{}),
 ...(product==='l'?{lCorner:{side:lSide,treatment:lTreatment,parameters:lParams}}:{}),product,geometry:variants[product],corner,dimensions:Object.fromEntries((product==='l'?lDimensionKeys(variants.l):c.families[product].fields).map(k=>[k,cmInputToMmText(currentDimensions()[k])])),
  ...(['round','chamfer'].includes(corner)?{special:{size:cmInputToMmText($('special').value)}}:{}),material,decor,quantity:Number($('quantity').value)};}
function renderPartChoices(){
  const parts=product!=='straight'&&view==='parts'?(lastGeometry?.previewParts??[]):[];
  if(!parts.length){partChoices.replaceChildren();selectedPart=null;return;}
  if(selectedPart&&!parts.some(p=>p.id===selectedPart))selectedPart=null;
  const entries=[{id:'all',name:'Alle Teile'},...parts.map(p=>({id:p.id,name:`${p.number} · ${p.label}`}))];
  const wanted=entries.map(e=>e.id).join('|');
  if([...partChoices.children].map(b=>b.dataset.part).join('|')!==wanted){
    partChoices.replaceChildren(...entries.map(entry=>{
      const button=element('button','apl-part-choice',entry.name);button.type='button';button.dataset.part=entry.id;
      button.addEventListener('click',()=>{selectedPart=entry.id==='all'?null:entry.id;selectedSeam=null;renderDrawing();});
      return button;
    }));
  }
  for(const button of partChoices.children)button.setAttribute('aria-pressed',String((button.dataset.part==='all'?null:button.dataset.part)===selectedPart));
}
function renderSeamChoices(){
 const seams=product!=='straight'&&view==='parts'?(lastGeometry?.previewSeamDetails??[]):[];
 if(!seams.length){
  seamChoices.replaceChildren();selectedSeam=null;
  seamExplain.textContent=product!=='straight'&&view==='parts'?'Bei dieser Ansicht ist keine separate Stoßlinie erkennbar. Wir erfinden keine Verbindung.':'';
  return;
 }
 if(selectedSeam&&!seams.some(s=>s.id===selectedSeam))selectedSeam=null;
 const sig=seams.map(s=>s.id).join('|');
 if([...seamChoices.children].map(b=>b.dataset.seam).join('|')!==sig){
  seamChoices.replaceChildren(...seams.map(seam=>{
   const button=element('button','apl-seam-choice',seam.label+' · Lage prüfen');button.type='button';
   button.dataset.seam=seam.id;
   button.addEventListener('click',()=>{selectedSeam=seam.id;selectedPart=null;renderDrawing();});
   return button;
  }));
 }
 for(const button of seamChoices.children)button.setAttribute('aria-pressed',String(button.dataset.seam===selectedSeam));
 const selected=seams.find(s=>s.id===selectedSeam);
 if(selected){
  const labels=selected.partIds.map(id=>lastGeometry.previewParts.find(p=>p.id===id)?.label).filter(Boolean);
  // Only an exact documented photo observation may appear at a seam.
  // L3's historical 02.11 reference does NOT establish the identical model
  // profile; L4's B5=600 case is distinct from the earlier B5=300 pair.
  // Neither visual note supplies CNC, binding connector counts or cut lists.
  const photo=lastGeometry.assemblyPhotoObservation;
  const photoMatches=photo?.status==='photo-observation-only'
   &&(photo.illustratedSeamId===selected.id||photo.illustratedSeamIds?.includes(selected.id));
  const profileNote=photo?.observationScope==='layout-and-symbols-profile-not-fully-matched'
   ?' Die L3-Modellprofil-Ausführung ist nicht vollständig abgeglichen.':'';
  const imageWitness=!photoMatches?'':photo.caseId.startsWith('U1-')
   ?' Speedmaster-Referenz 05.11.2026 (nur U1 L1=2000, L2=1200, L3=1800, B1/B2/B3=600 mm, W980, 38 mm): Drei sichtbare Teilbereiche, zwei Stoßstellen mit Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbolen. Echter Typ, Anzahl, Fräspositionen und Lieferstückzahl nicht bestätigt.'
   :photo.illustratedSeamIds?.length
   ?' Speedmaster-Referenz '+(photo.capturedDate==='2026-11-02'?'02.11.2026':'05.11.2026')
     +' (nur beobachtete 2000×2000-mm-Grundform, B1/B2=600 mm, B3/B4=900 mm'
     +(photo.caseId.startsWith('L4')?', B5-Grundmaß=600 mm':'')
     +'): Drei sichtbare Plattenbereiche, zwei Stoßstellen mit Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbolen. Echter Typ, Anzahl, Fräspositionen und Lieferstückzahl nicht bestätigt.'
     +profileNote
   :' Speedmaster-Referenz 05.11.2026 (nur identische Beispielmaße, W980, 38 mm): Zwei sichtbare Plattenbereiche mit Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbolen. Echter Typ, Anzahl, Fräspositionen und Lieferstückzahl nicht bestätigt.';
  seamExplain.textContent=selected.label+': '+(labels.length?labels.join(' / ')+' · ':'')+'Die Lage folgt der Bildskizze. Verbinder, Fräsungen, echte Teilplatten und Versandstücke sind noch ungeprüft.'+imageWitness;
 }else seamExplain.textContent='Wähle '+(seams.length===1?seams[0].label:'Stoß A/B')+', um die gezeigte Stelle zu markieren. Lage aus Speedmaster-Bildern nur zur Orientierung – keine CNC-, Verbinder- oder Teilefreigabe.';
}
function renderDrawing(){if(!lastGeometry)return;renderPartChoices();renderSeamChoices();const textureUrl=decorImageUrl(decor);const markup=svg(lastGeometry,active,{decor,showDimensions:showDimensions&&view==='plan',partsView:view==='parts',selectedPart,selectedSeam,textureUrl,unit:'cm'});$('drawing').innerHTML=namespaceSvg(markup,'main');
  detailOptions.hidden=product!=='straight'||straightSide==='none';
  for(const button of detailOptions.children){const side=button.dataset.detail;button.disabled=side!=='overview'&&straightSide!==side&&straightSide!=='both';button.setAttribute('aria-pressed',String((drawingDetail??'overview')===side));}
  if($('drawing-dialog').open)$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:product==='straight'||view==='plan',partsView:view==='parts',selectedPart,selectedSeam,detail:drawingDetail,textureUrl,unit:'cm'}),'large');}
function summary(config,invalid=false){
  $('summary-shape').textContent=names[product];$('preview-family').textContent=product==='straight'?'Vorschau':names[product]+' · Planung';
  const decorName=c.decors.find(d=>d.id===decor).label;
  $('preview-material').textContent=`${material==='APL38'?'38':'17,5'} mm · ${decorName}`;
  $('selected-surface-name').textContent=decorName;
  $('selected-surface-thickness').textContent=`${material==='APL38'?'38':'17,5'} mm · Schichtstoff`;
  const rows=[];
  if(!config)rows.push(['Maße',invalid?'Bitte korrigieren':'Wird geprüft …']);
  else if(product==='straight')rows.push(['Maße',`${mmToCmText(config.dimensions.L1)} × ${mmToCmText(config.dimensions.B1)} cm`]);
  else if(product==='l'){
    const d=config.dimensions;
    rows.push(['Außenmaße',`${mmToCmText(d.L1)} × ${mmToCmText(d.L2)} cm`]);
    if(['L3','L4'].includes(variants.l)){
      rows.push(['Schenkelbreite',`${mmToCmText(d.B1)} cm`],['Eckbereich',`${mmToCmText(d.B3)} cm`]);
      if(variants.l==='L4')rows.push(['Diagonalbereich',`${mmToCmText(d.B5)} cm`]);
    }else{
      rows.push(['Schenkelbreite',`${mmToCmText(d.B1)} cm`],['Tiefe oben',`${mmToCmText(d.B2)} cm`]);
    }
  }
  else rows.push(['Maße',Object.entries(config.dimensions).map(([key,value])=>`${key}: ${mmToCmText(value)} cm`).join(' · ')]);
  rows.push(['Material',`Schichtstoff · ${material==='APL38'?'38':'17,5'} mm`],['Dekor',decorName]);
  if(product==='l'){
    rows.push(['Ecken',lSide==='none'?'Ohne Bearbeitung':lSides[lSide]+' · '+treatments[lTreatment]]);
    if(config?.lCorner?.parameters&&lSide!=='none'){
      for(const side of (lSide==='both'?['left','right']:[lSide])){
        const keys=lCornerKeys(variants.l,side,lTreatment);
        const values=keys.map(k=>mmToCmText(config.lCorner.parameters[k]));
        rows.push([side==='left'?'Linke Ecke':'Rechte Ecke',
          lTreatment==='round'?`Radius ${values[0]} cm`:`${values[0]} × ${values[1]} cm`]);
      }
    }
  }
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
function updateLRangeHints(){
  if(product!=='l'||lSide==='none')return;
  const keys=lCornerKeys(variants.l,lSide,lTreatment);
  let limits=null;
  try {
    const dimensions=Object.fromEntries(Object.entries(currentDimensions())
      .map(([key,value])=>[key,Number(cmInputToMmText(value))]));
    limits=lCornerPreviewLimits(variants.l,dimensions,lSide,lTreatment,{material,decor});
  } catch {
    // Keep editing possible while a basic dimension is temporarily invalid.
  }
  for(const key of keys){
    const hint=$('corner-hint-'+key);if(!hint)continue;
    const bound=limits?.fields[key];
    if(!bound){
      hint.textContent='Nur Vorschauwert · Herstellergrenzen noch offen.';
    }else if(bound.max<bound.min){
      hint.textContent='Mit diesen Grundmaßen keine Abschrägung in der Zeichnung möglich.';
    }else{
      const sketch='Zeichnung: '+mmToCmText(bound.min)+'–'+mmToCmText(bound.max)+' cm';
      const supplier=bound.photoMax===null?''
        :' · Speedmaster-Foto: 6–'+mmToCmText(bound.photoMax)+' cm';
      hint.textContent=sketch+supplier+' · keine Fertigungsfreigabe';
    }
  }
  const note=radiusWrap.querySelector('.a1-limit-note');
  if(!note)return;
  note.textContent=!limits
    ?'Bitte erst gültige Grundmaße eingeben. Herstellergrenzen sind ungeprüft.'
    :limits.photo
      ?'Foto-Eingabewerte gelten nur für die gezeigten Grundmaße. Zeichnungsgrenzen können abweichen; keine Fertigungsfreigabe.'
      :lTreatment==='round'
        ?'Rundungswerte sind nur skizziert. Tatsächliche Speedmaster-Grenzen fehlen.'
        :'Zeichnungsgrenzen folgen den Plattenmaßen. Speedmaster-Grenzen für andere Kombinationen sind noch offen.';
}
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
    :(product==='l'?`${variants.l}: Kontur nach Speedmaster-Fotos · Stöße und Diagonalzusatzmaße vorläufig.`:((product==='u'&&variants.u==='U1'&&result.geometry.version.startsWith('speedmaster-u1'))?'U1: Grundkontur und zwei Stoßstellen nach Speedmaster-Fotos · CNC/Versand offen.':`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`));
}
const controller=createPreviewController({request:async (body,{signal,onVisual})=>{if(adapters.preview)return adapters.preview(body,{signal,onVisual});throw new Error('Vorschauadapter fehlt. Kauf bleibt gesperrt.');},
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
    const match=message.match(/^((?:corner-)?(?:L[1-6]|B[1-6]|R[12])):\s*/);
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
  if(product==='l'||product==='u'){
    $('special-wrap').hidden=true;
    $('corner-note').textContent=product==='u'?'U1-Grundkontur ohne Eckbearbeitung belegt. Andere Eckoptionen sind nur schematisch.':lSide==='none'?'Ohne Eckbearbeitung.':lTreatment==='round'?'Rundungen im nächsten Schritt einstellen.':lTreatment==='chamfer_square'?'Gerade Abschrägungen im nächsten Schritt einstellen.':'Kante durchlaufend · gerade Abschrägung; Kantenverlauf noch zu prüfen.';
    $('parts-note').querySelector('strong').textContent='Teilflächen zur Orientierung · keine Zuschnittdaten';
    $('parts-note').querySelector('p').textContent='Wähle eine Teilfläche aus. Die Stoßlinien zeigen nur die aus Speedmaster-Bildern erkennbare Lage. Exakte Fräsungen, Verbinder und Teileabmessungen bleiben ungeprüft.';
  }
  if(product==='straight'){
    const v=straightCorner(straightSide,straightTreatment);
    $('special-wrap').hidden=true;
    $('corner-note').textContent=v.id==='none'?'Vorderkante unten. Ohne Eckbearbeitung.':v.treatment==='round'?'Rundungen im nächsten Schritt einstellen.':v.treatment==='chamfer_square'?'Gerade Diagonalen. Länge und Tiefe im nächsten Schritt einstellen.':'Weichere Übergänge, schematisch dargestellt. Alle zulässigen Plattenmaße möglich.';
    $('summary-shape').textContent=`Gerade · ${sides[v.side]}`;
  }
  for(const id of (product==='l'?lVisibleDimensionKeys(variants.l):c.families[product].fields)){
    const input=$(`dim-${id}`);
    try{cmInputToMmText(input.value);setFieldError(id);}
    catch{setFieldError(id,'Bitte ein gültiges Maß in cm eingeben (z. B. 200 oder 200,1).');}
  }
  if(product==='l'){
    for(const key of lCornerKeys(variants.l,lSide,lTreatment)){
      try{cmInputToMmText(lCornerValues[key]);setFieldError('corner-'+key);}
      catch{setFieldError('corner-'+key,'Bitte ein gültiges Eckmaß in cm eingeben.');}
    }
  }
  if(product==='straight')updateCornerBounds();
   if(product==='l')updateLRangeHints();
  return controller.refresh(()=>payload());
}
retryPriceButton.addEventListener('click',()=>{retryPriceButton.hidden=true;refresh();});
$('geometry').addEventListener('change',()=>{variants[product]=$('geometry').value;selectedPart=null;selectedSeam=null;if(product==='l'){lCornerValues=Object.fromEntries(Object.entries(defaultLCorner(variants.l,lSide,lTreatment).parameters).map(([k,v])=>[k,mmToCmText(Number(v))]));rebuild();}refresh();});
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
for(const id of ['drawing','large-drawing'])$(id).addEventListener('click',event=>{const seam=event.target.closest('[data-seam-id]');if(product!=='straight'&&view==='parts'&&seam){selectedSeam=seam.dataset.seamId;selectedPart=null;renderDrawing();return;}const part=event.target.closest('[data-part-id]');if(product!=='straight'&&view==='parts'&&part){selectedPart=part.dataset.partId;selectedSeam=null;renderDrawing();return;}const measure=event.target.closest('[data-field]');if(measure){if($('drawing-dialog').open)$('drawing-dialog').close();showStep(1);const key=measure.dataset.field;const field=$(key.startsWith('corner-')?key:`dim-${key}`);field?.focus();}});
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
