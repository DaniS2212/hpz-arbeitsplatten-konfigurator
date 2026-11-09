import {catalog} from '/core/config.mjs';
import {lCornerKeys,defaultLCorner,lDimensionKeys,lVisibleDimensionKeys,lDefaultDimensions,lCornerPreviewLimits} from '../core/l-geometry.mjs';
import {cmInputToMmText,mmToCmText,cmRange,customerMeasureError} from '/core/customer-measures.mjs';
import {firstMeasureIssue} from '/core/measure-feedback.mjs';
import {svg} from '/core/geometry.mjs';
import {createPreviewController} from '/latest.mjs';
import {template} from './component-template.mjs';
import {resolveProduct} from '../core/products.mjs';
import {decorImageUrl} from './decor-images.mjs';
import {sides,treatments,straightCorner,cornerLimits,defaultCornerParameters} from '../core/straight-corners.mjs';
import {uCornerSides,uCornerTreatments,uCornerKeys,defaultUCorner,uCornerPreviewLimits} from '../core/u-corners.mjs';
import {uSplitModes} from '../core/u1-geometry.mjs';
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
 let uSide='none',uTreatment=null,uCornerValues={};
let radiusValues={},drawingDetail=null;
const fieldErrors=new Map();
const lSides={none:'Keine',left:'Links',right:'Rechts',both:'Beide Außenecken'};
 const uVariantOptions=element('div','u-variant-grid');
 uVariantOptions.id='u-variant-options';uVariantOptions.setAttribute('role','radiogroup');
 uVariantOptions.setAttribute('aria-label','Stoßaufteilung');
 $('geometry').after(uVariantOptions);
const retryPriceButton=element('button','price-retry','Preis erneut berechnen');
retryPriceButton.type='button';retryPriceButton.hidden=true;
$('price-note').after(retryPriceButton);
const partChoices=element('div','apl-part-choices');partChoices.id='part-choices';$('parts-note').append(partChoices);
const seamChoices=element('div','apl-seam-choices');seamChoices.id='seam-choices';
const seamExplain=element('p','apl-seam-explain');seamExplain.id='seam-explain';
$('parts-note').append(seamChoices,seamExplain);
 const cornerTitle=$('corners').previousElementSibling;
const sideWrap=element('fieldset','a1-sides');
const sideLegend=element('legend','','Welche Eckbearbeitung?');
sideWrap.append(sideLegend,element('div','a1-side-options'));
cornerTitle.before(sideWrap);
const radiusWrap=element('fieldset','a1-radii');
$('dimensions').after(radiusWrap);
const formError=element('p','measurement-error');
formError.id='measurement-error';formError.hidden=true;formError.setAttribute('role','alert');
radiusWrap.after(formError);
const detailOptions=element('div','a11-detail-options');detailOptions.id='drawing-detail-options';
for(const [value,title] of [['overview','Gesamtansicht'],['left','Detail vorne links'],['right','Detail vorne rechts']]){
  const button=element('button','',title);button.type='button';button.dataset.detail=value;button.addEventListener('click',()=>{drawingDetail=value==='overview'?null:value;renderDrawing();});detailOptions.append(button);
}
$('large-drawing').before(detailOptions);
function sideIcon(side){
  return `<svg viewBox="0 0 96 46" aria-hidden="true"><path d="M8 6H88V38H8Z" fill="#e6f1f1" stroke="#557b83" stroke-width="2"/><path d="M25 38H71" stroke="#146178" stroke-width="3"/>${['left','both'].includes(side)?'<path d="M8 24V38H22" fill="none" stroke="#ad8667" stroke-width="5"/>':''}${['right','both'].includes(side)?'<path d="M74 38H88V24" fill="none" stroke="#ad8667" stroke-width="5"/>':''}</svg>`;
}
// The contour of the chamfer is the same; its edge treatment is different.
// Eckig = short, separate diagonal edge with visible endpoints.
// Durchlaufend = one uninterrupted highlighted edge around the transition.
// This is a visual choice symbol, never a confirmed CNC cross-section.
function cornerTreatmentIcon(kind){
 const outline=kind==='round'
   ?'M 8 5 V 34 H 24 Q 38 34 38 20 V 5'
   :'M 8 5 V 34 H 25 L 38 21 V 5';
 const edge=kind==='round'
   ?'<path d="M 24 34 Q 38 34 38 20" fill="none" stroke="#b26b41" stroke-width="2.6" stroke-linecap="round"/>'
   :kind==='chamfer_square'
     ?'<path d="M 25 34 L 38 21" fill="none" stroke="#b26b41" stroke-width="3.4" stroke-linecap="butt"/><path d="M 25 30 V 38 M 34 21 H 42" fill="none" stroke="#557b83" stroke-width="1.7"/>'
     :'<path d="M 8 34 H 25 L 38 21 V 5" fill="none" stroke="#b26b41" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
 return `<svg data-treatment-kind="${kind}" viewBox="0 0 52 44" aria-hidden="true">
   <path d="${outline}" fill="none" stroke="#557b83" stroke-width="2.2"
      stroke-linejoin="round"/>${edge}</svg>`;
}
const cornerChoiceLabels={
 round:'Abgerundet',
 chamfer_square:'Abgeschrägt · eckig',
 chamfer_continuous:'Abgeschrägt · Kante durchlaufend'
};
// The four U models share ONE outline. Only the two visible join directions
// differ. Show these differences at the choice point, not behind "Aufteilung".
function uJoinIcon(shape){
 const [left,right]=uSplitModes[shape];
 const leftPath=left==='cross'?'M 8 32 H 30':'M 30 8 V 32';
 const rightPath=right==='cross'?'M 78 32 H 100':'M 78 8 V 32';
 return `<svg viewBox="0 0 108 70" aria-hidden="true">
   <path d="M 8 8 H 100 V 61 H 78 V 32 H 30 V 54 H 8 Z"
     fill="#e6f1f1" stroke="#557b83" stroke-width="1.8"/>
   <path d="${leftPath} M ${rightPath.slice(2)}"
     fill="none" stroke="#af6940" stroke-width="3.2" stroke-linecap="round"/>
 </svg>`;
}
const uJoinLabels={
 U1:'Links quer · rechts quer',U2:'Links längs · rechts längs',
 U3:'Links längs · rechts quer',U4:'Links quer · rechts längs'
};
function uSideIcon(side){
 const left=['left','both'].includes(side),right=['right','both'].includes(side);
 return `<svg viewBox="0 0 108 70" aria-hidden="true">
 <path d="M8 8H100V61H78V32H30V54H8Z" fill="#e6f1f1" stroke="#557b83" stroke-width="1.8"/>
 ${left?'<circle cx="30" cy="54" r="5" fill="#af6940"/>':''}
 ${right?'<circle cx="78" cy="61" r="5" fill="#af6940"/>':''}
 </svg>`;
}
function renderUVariantCards(){
 uVariantOptions.hidden=product!=='u';
 if(product!=='u')return;
 const options=Object.keys(uSplitModes).map(id=>choice('u-variant',id,
   uJoinIcon(id)+'<strong>'+id+'</strong><span>'+uJoinLabels[id]+'</span>',
   variants.u===id,()=>{
    $('geometry').value=id;
    $('geometry').dispatchEvent(new Event('change',{bubbles:true}));
   },'u-variant-card'));
 uVariantOptions.replaceChildren(...options);
}
function renderUChoices(){
 if(product!=='u')return;
 sideWrap.hidden=false;sideLegend.textContent='Welche innere Ecke bearbeiten?';
 sideWrap.lastElementChild.replaceChildren(...Object.entries(uCornerSides)
   .map(([id,name])=>choice('u-side',id,uSideIcon(id)+'<span>'+name+'</span>',
     uSide===id,()=>{
      uSide=id;uTreatment=id==='none'?null:(uTreatment??'round');
      uCornerValues=Object.fromEntries(Object.entries(defaultUCorner(uSide,uTreatment).parameters)
       .map(([k,v])=>[k,mmToCmText(Number(v))]));
      active='side-'+id;renderUChoices();renderRadiusInputs();refresh();
     },'a1-side-card')));
 cornerTitle.hidden=uSide==='none';$('corners').hidden=uSide==='none';
 cornerTitle.textContent='Bearbeitung';$('corners').style.gridTemplateColumns='1fr';
 if(uSide!=='none'){
  $('corners').replaceChildren(...Object.entries(uCornerTreatments)
    .map(([id,title])=>choice('u-treatment',id,cornerTreatmentIcon(id)
       +'<span>'+title+'</span>',uTreatment===id,()=>{
        uTreatment=id;uCornerValues=Object.fromEntries(Object.entries(defaultUCorner(uSide,uTreatment).parameters)
          .map(([k,v])=>[k,mmToCmText(Number(v))]));
        renderRadiusInputs();refresh();
       },'a1-treatment-card')));
 }
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
 for(const key of [...['R1','R2','L3','B3','L4','B4','L5','B5','L6','B6'].map(k=>'corner-'+k),
     ...['R1','R2','L2','B2','L3','B3']])fieldErrors.delete(key);
 radiusWrap.replaceChildren();
 const l=product==='l',u=product==='u',side=l?lSide:u?uSide:straightSide,
   type=l?lTreatment:u?uTreatment:straightTreatment;
 radiusWrap.hidden=side==='none'||!(l||u||product==='straight');
 if(radiusWrap.hidden)return;
 radiusWrap.append(element('legend','',type==='round'?'Deine Rundungen':'Deine Abschrägungen'));
 const keys=l?lCornerKeys(variants.l,lSide,lTreatment)
   :u?uCornerKeys(uSide,uTreatment)
   :straightCorner(straightSide,straightTreatment).parameters;
 const leftKeys=l?lCornerKeys(variants.l,'left',lTreatment)
   :u?uCornerKeys('left',uTreatment):['R1','L2','B2'];
 const grids=new Map();
 for(const key of keys){
   const atLeft=leftKeys.includes(key),which=atLeft?'left':'right';
   const place=l?'außen '+(atLeft?'links':'rechts')
     :u?'innen '+(atLeft?'links':'rechts')
     :'vorne '+(atLeft?'links':'rechts');
   if(!grids.has(which)){
     const group=element('div','a1-corner-group');
     group.setAttribute('role','group');group.setAttribute('aria-label','Ecke '+place);
     group.append(element('p','a1-corner-heading',atLeft?'Linke Ecke':'Rechte Ecke'));
     const grid=element('div','a1-corner-grid');group.append(grid);radiusWrap.append(group);grids.set(which,grid);
   }
   const wrap=element('div','a1-radius-field'),label=element('label','dimension-label'),
     input=element('input'),unit=element('div','unit-input');
   const property=key.startsWith('R')?'Radius':key.startsWith('L')?'Länge':l||u?'Breite':'Tiefe';
   const cornerId=l||u?`corner-${key}`:`dim-${key}`;
   label.htmlFor=cornerId;label.textContent=property;label.append(element('span','',key));
   input.id=cornerId;input.type='text';input.inputMode='decimal';
   input.value=l?lCornerValues[key]:u?uCornerValues[key]:radiusValues[key];
   input.setAttribute('aria-describedby',l||u?`corner-hint-${key} corner-field-error-${key}`:`hint-${key} field-error-${key}`);
   input.setAttribute('aria-label',property+' '+place+' ('+key+')');
   input.addEventListener('input',()=>{
     if(l)lCornerValues[key]=input.value;else if(u)uCornerValues[key]=input.value;
     else radiusValues[key]=input.value;
     refresh();
   });
   input.addEventListener('focus',()=>{if(inlineKey)closeInlineEditor();activateMeasure(l||u?`corner-${key}`:key);});
   const hint=element('p','microcopy');hint.id=l||u?`corner-hint-${key}`:`hint-${key}`;
   const inline=element('p','field-error');inline.id=l||u?`corner-field-error-${key}`:`field-error-${key}`;
   inline.hidden=true;inline.setAttribute('aria-live','polite');
   unit.append(input,element('span','','cm'));wrap.append(label,unit,hint,inline);grids.get(which).append(wrap);
 }
 radiusWrap.append(element('p','a1-limit-note',''));
}
function renderStraightChoices(){
  sideLegend.textContent='Welche Eckbearbeitung?';
  sideWrap.hidden=product!=='straight';
  if(product!=='straight')return;
  sideWrap.lastElementChild.replaceChildren(...Object.entries(sides).map(([id,label])=>choice('straight-side',id,`${sideIcon(id)}<span>${id==='none'?'Keine':id==='both'?'Beide':label}</span>`,straightSide===id,()=>{
    straightSide=id;straightTreatment=id==='none'?null:(straightTreatment??'round');radiusValues=Object.fromEntries(Object.entries(defaultCornerParameters(straightSide,straightTreatment)).map(([k,v])=>[k,mmToCmText(Number(v))]));corner='square';$('special').value='10';active=`side-${id}`;drawingDetail=null;renderChoices();renderRadiusInputs();refresh();
    sideWrap.querySelector(`input[value="${id}"]`).focus({preventScroll:true});
  },'a1-side-card')));
  $('corners').hidden=straightSide==='none';
  cornerTitle.hidden=straightSide==='none';cornerTitle.textContent='Bearbeitung';
  $('corners').style.gridTemplateColumns='1fr';
  $('corners').setAttribute('aria-label','Welche Bearbeitung möchtest du?');
  $('corners').replaceChildren(...Object.entries(treatments).map(([id,label])=>choice('straight-treatment',id,cornerTreatmentIcon(id)+'<span>'+cornerChoiceLabels[id]+'</span>',straightTreatment===id,()=>{
    straightTreatment=id;radiusValues=Object.fromEntries(Object.entries(defaultCornerParameters(straightSide,straightTreatment)).map(([k,v])=>[k,mmToCmText(Number(v))]));corner='square';$('special').value='10';active=`side-${straightSide}`;drawingDetail=null;renderRadiusInputs();refresh();
  },'a1-treatment-card')));
}
function renderLChoices(){
 if(product!=='l')return;
 sideWrap.hidden=false;sideLegend.textContent='Welche Außenecke?';
 const mirror=variants.l==='L2';
 const lIcon=side=>{
   const points=mirror?'M8 6 H88 V40 H65 V20 H8 Z':'M8 6 H88 V20 H31 V40 H8 Z';
   return '<svg viewBox="0 0 96 46" aria-hidden="true"><path d="'+points+'" fill="#e6f1f1" stroke="#557b83" stroke-width="2"/>'
     +(['left','both'].includes(side)?'<circle cx="'+(mirror?8:31)+'" cy="'+(mirror?20:40)+'" r="4" fill="#ad8667"/>':'')
     +(['right','both'].includes(side)?'<circle cx="88" cy="'+(mirror?40:20)+'" r="4" fill="#ad8667"/>':'')+'</svg>';
 };
 sideWrap.lastElementChild.replaceChildren(...Object.entries(lSides).map(([id,name])=>choice('l-side',id,lIcon(id)+'<span>'+(id==='both'?'Beide':name)+'</span>',lSide===id,()=>{
   lSide=id;lTreatment=id==='none'?null:(lTreatment??'round');
   lCornerValues=Object.fromEntries(Object.entries(defaultLCorner(variants.l,lSide,lTreatment).parameters).map(([k,v])=>[k,mmToCmText(Number(v))]));
   active='side-'+id;renderLChoices();renderRadiusInputs();refresh();
 },'a1-side-card')));
 $('corners').hidden=lSide==='none';cornerTitle.hidden=lSide==='none';cornerTitle.textContent='Bearbeitung';
 $('corners').style.gridTemplateColumns='1fr';
 $('corners').replaceChildren(...Object.entries(treatments).map(([id,name])=>choice('l-treatment',id,
   cornerTreatmentIcon(id)+'<span>'+cornerChoiceLabels[id]+'</span>',
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
 function showStep(index){if(index!==1&&inlineKey)closeInlineEditor();step=index;shell.dataset.currentStep=String(index);shadow.querySelectorAll('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==step);
  placeSummary();
  [...$('steps').children].forEach((e,i)=>{if(i===step)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});
  $('back').disabled=step===0;$('back').style.visibility=step===0?'hidden':'visible';
  $('next').innerHTML=step===0?'Weiter zu den Maßen <span>→</span>':step===1?'Weiter zur Oberfläche <span>→</span>':'Konfiguration prüfen <span>↓</span>';
  $('next').disabled=!valid;
}
['Ecken','Maße in cm','Oberfläche'].forEach((label,i)=>{const b=element('button');b.type='button';b.innerHTML=`<span class="step-number">${i+1}</span><span class="step-label">${label}</span>`;b.addEventListener('click',()=>showStep(i));$('steps').append(b);});
function updateFamilyCopy(){
 $('steps').querySelector('.step-label').textContent=product==='straight'?'Ecken':'Grundriss';
 $('view-parts').textContent='Aufteilung';$('view-parts').hidden=product==='straight';
 if(product==='straight'){
   view='plan';$('parts-note').hidden=true;
   $('view-plan').setAttribute('aria-pressed','true');
   $('view-parts').setAttribute('aria-pressed','false');
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
  renderUChoices();
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
  if(product==='straight'||product==='l'||product==='u')corner='square';
  renderChoices();$('variant-wrap').hidden=product==='straight';
  if(product==='u'){
    $('variant-wrap').querySelector('.field-title').textContent='Wo sollen die Stoßfugen liegen?';
    $('geometry').setAttribute('aria-hidden','true');$('geometry').tabIndex=-1;
  }else{
    $('variant-wrap').querySelector('.field-title').textContent='Ausführung';
    $('geometry').removeAttribute('aria-hidden');$('geometry').removeAttribute('tabindex');
  }
  const shapeTitles={L1:'L1 · Schenkel links',L2:'L2 · Schenkel rechts',L3:'L3 · Diagonale innen',L4:'L4 · Diagonale innen und außen',U1:'U1 · quer/quer',U2:'U2 · längs/längs',U3:'U3 · längs/quer',U4:'U4 · quer/längs'};
  $('geometry').replaceChildren(...c.families[product].geometries.map(id=>{const o=element('option','',shapeTitles[id]||`${id} · Prüfung offen`);o.value=id;return o;}));$('geometry').value=variants[product];renderUVariantCards();
  // No supplier technical explanation below the shape selector.
  
  $('dimensions').replaceChildren();
  const appendDimensionInput=(id,customerLabel,target)=>{
    const wrap=element('div'),label=element('label','dimension-label'),input=element('input'),unit=element('div','unit-input');
    label.htmlFor='dim-'+id;
    const badge=product==='l'&&['L3','L4'].includes(variants.l)&&id==='B1'?'B1/B2'
      :product==='l'&&['L3','L4'].includes(variants.l)&&id==='B3'?'B3/B4':id;
    label.append(document.createTextNode(customerLabel),element('span','',badge));
    input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=currentDimensions()[id];input.setAttribute('aria-describedby','field-error-'+id);
    input.addEventListener('input',()=>{currentDimensions()[id]=input.value;
      if(product==='l'&&['L3','L4'].includes(variants.l)){
        if(id==='B1')currentDimensions().B2=input.value;
        if(id==='B3')currentDimensions().B4=input.value;
      }
      refresh();});
    input.addEventListener('focus',()=>{if(inlineKey)closeInlineEditor();activateMeasure(id);});
    const inline=element('p','field-error');inline.id='field-error-'+id;inline.hidden=true;inline.setAttribute('aria-live','polite');
    unit.append(input,element('span','','cm'));wrap.append(label,unit,inline);target.append(wrap);
  };
  // Preserve the plain two-column measure grid from the finished straight UI.
  const names=product==='straight'?{L1:'Länge',B1:'Tiefe'}
   :product==='l'?(['L3','L4'].includes(variants.l)
     ?{L1:'Länge oben',L2:'Länge links',B1:'Schenkelbreite',B3:'Eckbreite',B5:'Diagonalbereich'}
     :{L1:'Länge oben',L2:variants.l==='L2'?'Länge rechts':'Länge links',B1:variants.l==='L2'?'Schenkelbreite rechts':'Schenkelbreite links',B2:'Tiefe oben'})
   :{L1:'Breite oben',L2:'Länge links',L3:'Länge rechts',B1:'Tiefe oben',B2:'Schenkel links',B3:'Schenkel rechts'};
  for(const id of (product==='l'?lVisibleDimensionKeys(variants.l):c.families[product].fields))appendDimensionInput(id,names[id]||id,$('dimensions'));
  renderRadiusInputs();
}
function payload(){const radii=product==='straight'?Object.fromEntries(straightCorner(straightSide,straightTreatment).parameters.map(k=>[k,cmInputToMmText(radiusValues[k])])):{};
 const lParams=product==='l'?Object.fromEntries(lCornerKeys(variants.l,lSide,lTreatment).map(k=>[k,cmInputToMmText(lCornerValues[k])])):{};
 return {schemaVersion:2,inputUnit:'mm',...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),...(product==='straight'?{straightCorner:{side:straightSide,treatment:straightTreatment,parameters:radii}}:{}),
 ...(product==='l'?{lCorner:{side:lSide,treatment:lTreatment,parameters:lParams}}:{}),
  ...(product==='u'?{uCorner:{side:uSide,treatment:uTreatment,
      parameters:Object.fromEntries(uCornerKeys(uSide,uTreatment).map(k=>[k,cmInputToMmText(uCornerValues[k])]))}}:{}),
  product,geometry:variants[product],corner,dimensions:Object.fromEntries((product==='l'?lDimensionKeys(variants.l):c.families[product].fields).map(k=>[k,cmInputToMmText(currentDimensions()[k])])),
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
  const imageWitness=!photoMatches?'':/^U[1-4]-/.test(photo.caseId)
   ?' Speedmaster-Referenz 05.11.2026 (nur '+photo.caseId.slice(0,2)+' L1=2000, L2=1200, L3=1800, B1/B2/B3=600 mm, W980, 38 mm): Drei sichtbare Teilbereiche, zwei Stoßstellen mit Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbolen. Echter Typ, Anzahl, Fräspositionen und Lieferstückzahl nicht bestätigt.'
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

 // Touch-friendly inline cm editor. Both entry points update the SAME form field.
 const drawingStage=$('drawing').closest('.stage');
 const inlineEditor=element('div','inline-measure-editor');
 inlineEditor.hidden=true;drawingStage.append(inlineEditor);
 let inlineKey=null,inlineOriginal='',inlineAnchor=null,invalidMeasureKey=null;
 function visibleMeasureKey(key){
   if(product==='l'&&['L3','L4'].includes(variants.l)){
     if(key==='B2')return 'B1';
     if(key==='B4')return 'B3';
   }
   return key;
 }
 function fieldForMeasure(key){
   const visible=visibleMeasureKey(key);
   return $(visible.startsWith('corner-')?visible:'dim-'+visible);
 }
 // Sketch and form share a single canonical measure selection.
 function activateMeasure(key){
   active=visibleMeasureKey(key);
   shell.querySelectorAll('.active-dimension').forEach(e=>e.classList.remove('active-dimension'));
   const field=fieldForMeasure(active);
   const wrap=field?.closest('.a1-radius-field')??field?.parentElement?.parentElement;
   wrap?.classList.add('active-dimension');
   renderDrawing();
 }
 function positionInlineEditor(){
   if(!inlineKey||inlineEditor.hidden)return;
   const measures=[...$('drawing').querySelectorAll('.apl-measure[data-field]')];
   const label=(measures.find(x=>x.dataset.measureId===inlineAnchor)
     ??measures.find(x=>x.dataset.field===inlineKey))?.querySelector('.apl-measure-label');
   if(!label)return;
   const bounds=label.getBoundingClientRect(),container=drawingStage.getBoundingClientRect();
   const x=bounds.left+bounds.width/2-container.left-70;
   const y=bounds.top+bounds.height/2-container.top-24;
   inlineEditor.style.left=Math.max(8,Math.min(container.width-148,x))+'px';
   inlineEditor.style.top=Math.max(8,Math.min(container.height-55,y))+'px';
 }
 function closeInlineEditor(){
   inlineEditor.hidden=true;inlineEditor.replaceChildren();inlineKey=null;inlineAnchor=null;
 }
 function openInlineMeasure(key,anchorKey=key){
   const field=fieldForMeasure(key);
   if(!field||view!=='plan')return;
   if($('drawing-dialog').open)$('drawing-dialog').close();
   if(step!==1)showStep(1);
   closeInlineEditor();inlineKey=visibleMeasureKey(key);
   inlineAnchor=anchorKey;inlineOriginal=field.value;
   activateMeasure(inlineKey);
   const displayKey=inlineKey.replace(/^corner-/,'');
   const caption=element('label','',displayKey+' in cm');
   const input=element('input');
   input.type='text';input.inputMode='decimal';input.value=field.value;
   input.setAttribute('aria-label','Maß '+displayKey+' direkt in der Zeichnung bearbeiten');
   input.setAttribute('autocomplete','off');
   inlineEditor.replaceChildren(caption,input,element('span','', 'cm'));
   inlineEditor.hidden=false;positionInlineEditor();
   input.addEventListener('input',()=>{
     field.value=input.value;
     field.dispatchEvent(new Event('input',{bubbles:true}));
   });
   input.addEventListener('keydown',event=>{
     if(event.key==='Enter'){event.preventDefault();closeInlineEditor();}
     if(event.key==='Escape'){
       event.preventDefault();field.value=inlineOriginal;
       field.dispatchEvent(new Event('input',{bubbles:true}));
       closeInlineEditor();
     }
   });
   input.addEventListener('blur',()=>closeInlineEditor());
   input.focus({preventScroll:true});input.select();
 }
function renderDrawing(){if(!lastGeometry)return;renderPartChoices();renderSeamChoices();const textureUrl=decorImageUrl(decor);const invalidField=shell.dataset.measureInvalid==='true'?invalidMeasureKey:null;const markup=svg(lastGeometry,active,{decor,showDimensions:showDimensions&&view==='plan',partsView:view==='parts',selectedPart,selectedSeam,textureUrl,unit:'cm',invalidField});$('drawing').innerHTML=namespaceSvg(markup,'main');
  detailOptions.hidden=product!=='straight'||straightSide==='none';
  for(const button of detailOptions.children){const side=button.dataset.detail;button.disabled=side!=='overview'&&straightSide!==side&&straightSide!=='both';button.setAttribute('aria-pressed',String((drawingDetail??'overview')===side));}
  if($('drawing-dialog').open)$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:product==='straight'||view==='plan',partsView:view==='parts',selectedPart,selectedSeam,detail:drawingDetail,textureUrl,unit:'cm',invalidField}),'large');
  positionInlineEditor();}
function summary(config,invalid=false){
  $('summary-shape').textContent=names[product];
  $('preview-family').textContent=names[product];
  const decorName=c.decors.find(d=>d.id===decor).label;
  const thickness=material==='APL38'?'38':'17,5';
  $('preview-material').textContent=`${thickness} mm · ${decorName}`;
  $('selected-surface-name').textContent=decorName;
  $('selected-surface-thickness').textContent=`${thickness} mm · Schichtstoff`;
  const rows=[];
  if(!config){
    rows.push(['Maße',invalid?'–':'Wird berechnet …']);
  }else if(product==='straight'){
    rows.push(['Maße',`${mmToCmText(config.dimensions.L1)} × ${mmToCmText(config.dimensions.B1)} cm`]);
  }else{
    const d=config.dimensions,main=product==='l'?['L1','L2']:['L1','L2','L3'];
    const widths=product==='l'?lVisibleDimensionKeys(variants.l).filter(k=>k.startsWith('B')):['B1','B2','B3'];
    rows.push(['Längen',main.map(k=>`${k} ${mmToCmText(d[k])}`).join(' · ')+' cm']);
    rows.push(['Breiten',widths.map(k=>`${k} ${mmToCmText(d[k])}`).join(' · ')+' cm']);
  }
  rows.push(['Oberfläche',`${decorName} · ${thickness} mm`]);
   if(product==='u'){
     rows.push(['Stoßaufteilung',uJoinLabels[variants.u]]);
     if(uSide!=='none'){
       const params=config?.uCorner?.parameters??{},pieces=uSide==='both'?['left','right']:[uSide];
       const details=pieces.map(side=>{
         const fields=uCornerKeys(side,uTreatment);
         return (side==='left'?'Links':'Rechts')+' '+fields
           .map(k=>k+' '+(params[k]===undefined?'–':mmToCmText(params[k]))).join(' / ')+' cm';
       });
       rows.push(['Innenecken',uCornerTreatments[uTreatment]+' · '+details.join(' · ')]);
     }
   }
  if(product==='l'&&lSide!=='none'){
    const p=config?.lCorner?.parameters??{},chosen=lSide==='both'?['left','right']:[lSide];
    const label=chosen.map(side=>{
      const keys=lCornerKeys(variants.l,side,lTreatment);
      const numbers=keys.map(k=>p[k]!==undefined?mmToCmText(p[k]):'–');
      const variant=lTreatment==='round'?`R ${numbers[0]} cm`:`${numbers.join(' × ')} cm`;
      return `${side==='left'?'Links':'Rechts'} ${variant}`;
    });
    rows.push(['Ecken',`${treatments[lTreatment]} · ${label.join(' / ')}`]);
  }
  if(product==='straight'&&straightSide!=='none'){
    const side={left:'Links',right:'Rechts',both:'Beidseitig'}[straightSide];
    const name=treatments[straightTreatment];
    const size=config?.straightCorner?.parameters??{};
    rows.push(['Ecken',side+' · '+name+(Object.keys(size).length
      ?' · '+Object.values(size).map(mmToCmText).join(' / ')+' cm':'')]);
  }
  $('summary').replaceChildren(...rows.map(([key,value])=>{
    const row=element('div');row.append(element('dt','',key),element('dd','',value));return row;
  }));
}
let saleReady=false,purchaseBusy=false;
function purchaseState(enabled){saleReady=enabled&&!!adapters.purchase&&valid&&!purchaseBusy;$('cart').disabled=!saleReady;if(adapters.purchase)$('cart').textContent=saleReady?'In den Warenkorb →':'Konfiguration wird geprüft';}
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
    if(!Number.isInteger(value))issue='Bitte eine Zahl in cm eingeben.';
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
  shell.dataset.measureInvalid='false';invalidMeasureKey=null;
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
    :(product==='l'?`${variants.l}: Kontur nach Speedmaster-Fotos · Stöße und Diagonalzusatzmaße vorläufig.`:((product==='u'&&result.geometry.version.startsWith('speedmaster-u'))?variants.u+': Grundkontur und Stoßrichtungen nach Speedmaster-Fotos · CNC/Versand offen.':`${variants[product]} noch nicht zeichnerisch belegt: allgemeine ${names[product]}-Skizze, ohne bestätigte Teile und Stoßkanten.`));
}
const controller=createPreviewController({request:async (body,{signal,onVisual})=>{if(adapters.preview)return adapters.preview(body,{signal,onVisual});const response=await fetch('/api/preview',{signal,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;},
  onPending:()=>{if(disposed)return;retryPriceButton.hidden=true;valid=false;purchaseState(false);$('next').disabled=true;$('drawing').setAttribute('aria-busy',String(!lastGeometry));$('error').hidden=true;priceDisplay('Wird berechnet …','Preisvorschau');$('tax-note').textContent='';$('price-note').textContent='';if(!lastGeometry)summary(null);},
   onVisual:applyVisual,
  onResult:result=>{if(disposed)return;applyVisual(result);purchaseState(false);retryPriceButton.hidden=result.quote.status!=='unavailable';
     if(result.quote.status==='calculated-ready-for-cart'&&result.quote.purchasable===true&&embedded&&adapters.purchase){
      priceDisplay(money(result.quote.totalGrossReferenceCents/100),`Bruttopreis · ${result.config.quantity} Stück`);
      $('tax-note').textContent=(result.quote.taxNote||'').includes('DE-Bruttopreis inkl. 19 %')
        ?'inkl. 19 % MwSt. · zzgl. Versand'
        :(result.quote.taxNote||'inkl. 19 % MwSt. · zzgl. Versand');
      // Server-side signed validation remains untouched.
      $('price-note').textContent='';
      purchaseState(true);
     }else if(result.quote.status==='calculated-not-sale-approved'){
      priceDisplay(money(result.quote.totalGrossReferenceCents/100),`Unverbindlicher Bruttopreis${result.config.quantity>1?' · '+result.config.quantity+' Stück':''}`);
      $('tax-note').textContent=result.quote.taxNote?.includes('19 %')
        ?'inkl. 19 % MwSt. · Versand separat':'Versand separat';
      // Internal estimate warnings remain in backend status, not in the
      // compact customer summary; sales eligibility remains unchanged.
      $('price-note').textContent='';
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
    const issue=firstMeasureIssue(product,variants[product],currentDimensions(),{material,straightTreatment});
    const rawMessage=customerMeasureError(error).replace(/^((?:corner-)?(?:L[1-6]|B[1-6]|R[12])): In dieser Konfiguration ([0-9]+(?:,[0-9]+)?)–([0-9]+(?:,[0-9]+)?) cm zulässig.*$/, '$1: Erlaubt $2–$3 cm.');
    const match=rawMessage.match(/^((?:corner-)?(?:L[1-6]|B[1-6]|R[12])):\s*/);
    const activeField=/^(?:corner-)?(?:L[1-6]|B[1-6]|R[12])$/.test(active)
      ?$(active.startsWith('corner-')?active:'dim-'+active):null;
    let activeTextInvalid=false;
    if(activeField){try{cmInputToMmText(activeField.value);}catch{activeTextInvalid=true;}}
    const message=issue?.message??(activeTextInvalid
      ?active.replace(/^corner-/,'')+': Bitte eine Zahl in cm eingeben.'
      :rawMessage);
    clearFieldErrors();
    const invalidKey=issue?.key??match?.[1]??(activeTextInvalid?active:null);
    invalidMeasureKey=invalidKey?visibleMeasureKey(invalidKey):null;
    if(invalidKey)setFieldError(invalidKey,message);
    // Exactly one visible error notice; the last valid contour is dimmed.
    formError.textContent=message;formError.hidden=false;
    shell.dataset.measureInvalid='true';
    $('drawing').setAttribute('aria-busy','false');
    if(lastGeometry)renderDrawing();
    else{$('drawing').replaceChildren();$('large-drawing').replaceChildren();}
    $('drawing-status').hidden=true;
    $('error').hidden=true;
    summary(null,true);
    priceDisplay('–','Maße prüfen');$('tax-note').textContent='';
    $('price-note').textContent='';
    $('next').disabled=true;
  }
});
function refresh(){
  purchaseState(false);
  shell.style.setProperty('--hpz-decor-image',`url("${decorImageUrl(decor)}")`);
  shell.dataset.corner=corner;
  $('special-wrap').hidden=!['round','chamfer'].includes(corner);
  $('corner-note').textContent=['round','chamfer'].includes(corner)?'Eckmuster oben links. Größe im Schritt „Maße“ anpassen; Ausführung noch zu prüfen.':corner==='continuous'?'Kontur und Verbindung dieser Ausführung sind noch zu prüfen.':'Klare, rechtwinklige Ecken. Die Außenkante ist im gleichen Dekor vorgesehen.';
  if(product==='l'){
    $('special-wrap').hidden=true;
    $('corner-note').textContent='';
    $('parts-note').querySelector('strong').textContent='Teilflächen zur Orientierung · keine Zuschnittdaten';
    $('parts-note').querySelector('p').textContent='Stoßstellen zur Orientierung.';
  }
  if(product==='u'){
    $('special-wrap').hidden=true;
    $('corner-note').textContent='';
    $('parts-note').querySelector('strong').textContent='Drei Teilflächen · Stoßfugen zur Orientierung';
    $('parts-note').querySelector('p').textContent='U1–U4: Die gewählte Stoßaufteilung ist in der Draufsicht erkennbar.';
  }
  if(product==='straight'){
    const v=straightCorner(straightSide,straightTreatment);
    $('special-wrap').hidden=true;
    $('corner-note').textContent='';
    $('summary-shape').textContent=`Gerade · ${sides[v.side]}`;
  }
  for(const id of (product==='l'?lVisibleDimensionKeys(variants.l):c.families[product].fields)){
    const input=$(`dim-${id}`);
    try{cmInputToMmText(input.value);setFieldError(id);}
    catch{setFieldError(id,'Bitte ein gültiges Maß in cm eingeben.');}
  }
  if(product==='l'){
    for(const key of lCornerKeys(variants.l,lSide,lTreatment)){
      try{cmInputToMmText(lCornerValues[key]);setFieldError('corner-'+key);}
      catch{setFieldError('corner-'+key,'Bitte ein gültiges Eckmaß in cm eingeben.');}
    }
  }
  if(product==='u'&&uSide!=='none'){
    for(const key of uCornerKeys(uSide,uTreatment)){
      try{cmInputToMmText(uCornerValues[key]);setFieldError('corner-'+key);}
      catch{setFieldError('corner-'+key,'Bitte ein gültiges Eckmaß in cm eingeben.');}
    }
    try{
      const dims=Object.fromEntries(Object.entries(currentDimensions())
        .map(([k,v])=>[k,Number(cmInputToMmText(v))]));
      const limits=uCornerPreviewLimits(dims,uSide,uTreatment).fields;
      for(const key of uCornerKeys(uSide,uTreatment)){
        const info=limits[key],hint=$('corner-hint-'+key);
        if(hint)hint.textContent=info.max>=info.min
          ?mmToCmText(info.min)+'–'+mmToCmText(info.max)+' cm':'Mit diesen Schenkelmaßen nicht möglich.';
      }
    }catch{/* Invalid base dimensions keep their own validation active. */}
  }
  if(product==='straight')updateCornerBounds();
   if(product==='l')updateLRangeHints();
  return controller.refresh(()=>payload());
}
retryPriceButton.addEventListener('click',()=>{retryPriceButton.hidden=true;refresh();});
$('geometry').addEventListener('change',()=>{
 closeInlineEditor();variants[product]=$('geometry').value;selectedPart=null;selectedSeam=null;
 if(product==='l'){
   lCornerValues=Object.fromEntries(Object.entries(defaultLCorner(variants.l,lSide,lTreatment).parameters)
     .map(([k,v])=>[k,mmToCmText(Number(v))]));rebuild();
 }else if(product==='u'){
   renderUVariantCards();renderUChoices();renderRadiusInputs();
 }
 refresh();
});
for(const id of ['quantity','special'])$(id).addEventListener('input',refresh);
for(const [id,amount] of [['minus',-1],['plus',1]])$(id).addEventListener('click',()=>{const n=Number($('quantity').value);$('quantity').value=String(Math.min(1000,Math.max(1,(Number.isFinite(n)?Math.trunc(n):1)+amount)));refresh();});
$('cart').addEventListener('click',async ()=>{
  if(!saleReady||purchaseBusy||!adapters.purchase||!valid)return;
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
for(const [id,mode] of [['view-plan','plan'],['view-parts','parts']])$(id).addEventListener('click',()=>{view=mode;$('parts-note').hidden=view!=='parts';if(view==='parts')closeInlineEditor();$('measure-toggle').hidden=true;$('view-plan').setAttribute('aria-pressed',String(view==='plan'));$('view-parts').setAttribute('aria-pressed',String(view==='parts'));renderDrawing();});
for(const id of ['drawing','large-drawing'])$(id).addEventListener('click',event=>{
  const seam=event.target.closest('[data-seam-id]');
  if(product!=='straight'&&view==='parts'&&seam){
    selectedSeam=seam.dataset.seamId;selectedPart=null;renderDrawing();return;
  }
  const part=event.target.closest('[data-part-id]');
  if(product!=='straight'&&view==='parts'&&part){
    selectedPart=part.dataset.partId;selectedSeam=null;renderDrawing();return;
  }
  const measure=event.target.closest('.apl-measure[data-field]');
  if(measure)openInlineMeasure(measure.dataset.field,measure.dataset.measureId||measure.dataset.field);
});
for(const id of ['drawing','large-drawing'])$(id).addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const measure=event.target.closest('.apl-measure[data-field]');
  if(measure){event.preventDefault();openInlineMeasure(measure.dataset.field,measure.dataset.measureId||measure.dataset.field);}
});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('enlarge').addEventListener('click',()=>{if(!lastGeometry)return;drawingDetail=product==='straight'&&straightSide!=='none'&&root.getBoundingClientRect().width<=760?(straightSide==='right'||['R2','L3','B3'].includes(active)?'right':'left'):null;$('drawing-dialog').showModal();renderDrawing();});
for(const dialog of shadow.querySelectorAll('dialog'))dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
rebuild();showStep(0);refresh();

if(embedded){
 shell.querySelector('#products').hidden=true;
 if(!adapters.purchase)$('cart').textContent='Bestellung gesperrt · Admin-Test';
}
const handle={destroy(){if(disposed)return;disposed=true;controller.cancel();abort.abort();for(const d of shadow.querySelectorAll('dialog'))if(d.open)d.close();shadow.replaceChildren();mounts.delete(root);},updateContext(next){return mountConfigurator(root,{...context,...next},adapters);}};
mounts.set(root,handle);return handle;
}
