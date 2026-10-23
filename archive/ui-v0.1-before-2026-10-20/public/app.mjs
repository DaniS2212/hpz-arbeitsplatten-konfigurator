import {catalog} from '/core/config.mjs';
import {svg} from '/core/geometry.mjs';
import {createPreviewController} from '/latest.mjs';
const c=catalog(), $=id=>document.getElementById(id);
let product='straight',step=0,active='',lastGeometry=null;
const dimensionValues={L1:'200',L2:'120',L3:'180',B1:'70',B2:'60',B3:'60'};
const options=(element,values)=>{element.replaceChildren(...values.map(({id,label})=>{const o=document.createElement('option');o.value=id;o.textContent=label??id;return o;}));};
options($('material'),c.materials);options($('corner'),c.corners);
for(const [id,family] of Object.entries(c.families)) {
  const b=document.createElement('button');b.type='button';b.textContent={straight:'Gerade',l:'L-Form',u:'U-Form'}[id];b.dataset.product=id;
  b.addEventListener('click',()=>{product=id;rebuild();refresh();});$('products').append(b);
}
['Form','Maße','Material','Dekor'].forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`${i+1} ${label}`;
  b.addEventListener('click',()=>showStep(i));$('steps').append(b);});
function showStep(i) {step=i;document.querySelectorAll('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==i);
  [...$('steps').children].forEach((e,n)=>{if(n===i)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});
  $('back').disabled=i===0;$('next').disabled=i===3;}
function rebuild() {
  for(const b of $('products').children)b.setAttribute('aria-pressed',String(b.dataset.product===product));
  options($('geometry'),c.families[product].geometries.map(id=>({id,label:id==='straight'?'Gerade':id+' · Zuordnung offen'})));
  $('dimensions').replaceChildren();
  for(const id of c.families[product].fields) {
    const wrap=document.createElement('div'),label=document.createElement('label'),input=document.createElement('input');
    label.htmlFor=`dim-${id}`;label.textContent=`${id} (cm)`;input.id=label.htmlFor;input.type='text';input.inputMode='decimal';input.value=dimensionValues[id];
    input.addEventListener('input',()=>{dimensionValues[id]=input.value;refresh();});
    input.addEventListener('focus',()=>{active=id;if(lastGeometry)$('drawing').innerHTML=svg(lastGeometry,active);});
    wrap.append(label,input);$('dimensions').append(wrap);
  }
}
function payload() {return {product,geometry:$('geometry').value,corner:$('corner').value,
  dimensions:Object.fromEntries(c.families[product].fields.map(k=>[k,dimensionValues[k]])),
  ...(['round','chamfer'].includes($('corner').value)?{special:{size:$('special').value}}:{}),
  material:$('material').value,decor:$('decor').value,quantity:Number($('quantity').value)};}
const controller=createPreviewController({
  request:async body=>{const r=await fetch('/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const result=await r.json();if(!r.ok)throw new Error(result.error);return result;},
  onPending:()=>{lastGeometry=null;$('drawing').replaceChildren();$('error').textContent='';$('warnings').textContent='';$('price').textContent='Wird geprüft …';$('price-note').textContent='';},
  onResult:result=>{lastGeometry=result.geometry;$('drawing').innerHTML=svg(lastGeometry,active);$('warnings').textContent=lastGeometry.warnings.join(' ');
    $('price').textContent='Preis auf Anfrage';$('price-note').textContent=result.quote.referenceMatched?
      'Passender Preisreferenzfall vorhanden. Bestellung bleibt bis zur Geometrie-, Gewichts- und Integrationsprüfung gesperrt.':
      'Dieser Maß- und Ausführungsbereich besitzt noch keine bestätigte Preisregel. Keine automatische Zwischenwertberechnung.';},
  onError:error=>{$('error').textContent=error.message;$('price').textContent='Keine gültige Vorschau';$('price-note').textContent='Bestellung gesperrt.';}
});
function refresh(){ $('special-wrap').hidden=!['round','chamfer'].includes($('corner').value);return controller.refresh(payload());}
for(const id of ['geometry','corner','material','decor','quantity','special'])$(id).addEventListener('input',refresh);
$('config').addEventListener('submit',e=>e.preventDefault());
$('back').addEventListener('click',()=>showStep(Math.max(0,step-1)));$('next').addEventListener('click',()=>showStep(Math.min(3,step+1)));
rebuild();showStep(0);refresh();
