import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {lDefaultDimensions} from '../core/l-geometry.mjs';
import {firstMeasureIssue} from '../core/measure-feedback.mjs';
import {template} from '../public/component-template.mjs';

const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const millimetres=v=>Object.fromEntries(Object.entries(v).map(([k,val])=>[k,String(Math.round(Number(val)*10))]));
function config(shape,L1=null){
 const family=shape==='straight'?'straight':shape[0].toLowerCase();
 const raw=family==='l'?lDefaultDimensions(shape):family==='u'
   ?{L1:'200',L2:'120',L3:'180',B1:'60',B2:'60',B3:'60'}
   :{L1:'200',B1:'60'};
 if(L1!==null)raw.L1=String(L1);
 return normalize({
  schemaVersion:2,inputUnit:'mm',product:family,geometry:shape,corner:'square',
  dimensions:millimetres(raw),material:'APL17.5',decor:'W980',quantity:1,
  ...(family==='l'?{lCorner:{side:'none',treatment:null,parameters:{}}}:{})
 });
}
test('Every straight/L1-L4/U1-U4 contour and SVG responds to a real dimension edit',()=>{
 for(const shape of ['straight','L1','L2','L3','L4','U1','U2','U3','U4']){
  const a=config(shape),base=geometry(a);
  const b=config(shape,Number(a.dimensions.L1/10)+30),changed=geometry(b);
  assert.equal(changed.width,base.width+300,shape+' should grow by exactly 30 cm');
  assert.notEqual(changed.path,base.path,shape+' must update its silhouette');
  const svgBefore=svg(base,'L1',{unit:'cm'});
  const svgAfter=svg(changed,'L1',{unit:'cm'});
  assert.notEqual(svgAfter,svgBefore,shape+' should not show a stale SVG');
  assert.match(svgAfter,/data-field="L1" data-measure-id="L1"[^>]*data-active="true" role="button" tabindex="0"/);
  assert.ok(svgAfter.includes('cm'),shape+' must render cm rather than mm');
 }
});
test('Schenkelbreiten and U-leg dimensions change the actual customer contour',()=>{
 for(const shape of ['straight','L1','L2','L3','L4','U1','U2','U3','U4']){
  const origin=config(shape),updated=structuredClone(origin);
  if(shape==='L4'){
   updated.dimensions.B1-=100;updated.dimensions.B2-=100;
  }else if(shape==='L3'){
   updated.dimensions.B1+=100;updated.dimensions.B2+=100;
  }else{
   updated.dimensions.B1+=100;
  }
  const a=geometry(origin),b=geometry(updated);
  assert.notEqual(b.path,a.path,shape+' drawing must change for a real width edit');
  assert.notEqual(svg(a),svg(b),shape+' must not retain stale width SVG');
 }
 for(const shape of ['U1','U2','U3','U4']){
  const c=config(shape),other=structuredClone(c);other.dimensions.L3+=300;
  assert.notEqual(geometry(c).path,geometry(other).path,
    shape+' right U leg must extend when L3 is changed');
 }
});
test('One actionable precise warning for the customer screenshot L1=50cm',()=>{
 const issue=firstMeasureIssue('l','L1',{L1:'50',L2:'170',B1:'60',B2:'60'});
 assert.equal(issue.key,'L1');
 assert.match(issue.message,/100–400 cm/);
 assert.match(issue.message,/Eingegeben: 50 cm/);
 assert.equal(firstMeasureIssue('l','L1',{L1:'250',L2:'170',B1:'60',B2:'60'}),null);
});
test('Independent limits name the exact wrong field and the permitted numbers',()=>{
 assert.match(firstMeasureIssue('straight','straight',{L1:'200',B1:'95'}).message,/B1.*30–90 cm/);
 assert.equal(firstMeasureIssue('straight','straight',{L1:'200',B1:'95'},{material:'APL17.5'}),null,'17.5mm permits a 95cm depth');
 assert.match(firstMeasureIssue('straight','straight',{L1:'200',B1:'95'},{material:'APL17.5',straightTreatment:'chamfer_continuous'}).message,/B1.*30–90 cm/);
 assert.match(firstMeasureIssue('straight','straight',{L1:'200',B1:'121'},{material:'APL17.5'}).message,/B1.*30–120 cm/);
 assert.match(firstMeasureIssue('u','U1',{L1:'110',L2:'180',L3:'180',B1:'60',B2:'60',B3:'60'}).message,/L1.*120,1 cm/);
 assert.match(firstMeasureIssue('l','L4',{L1:'250',L2:'170',B1:'90',B2:'90',B3:'105',B4:'105',B5:'95'}).message,/B5.*30–90 cm/);
 assert.equal(firstMeasureIssue('l','L1',{L1:'200,22',L2:'170',B1:'60',B2:'60'}).message,'L1: Bitte eine Zahl in cm eingeben.');
 assert.equal(firstMeasureIssue('u','U4',{L1:'250',L2:'180',L3:'180',B1:'60',B2:'60',B3:'60'}),null);
});
test('Compact surface and summary are not duplicated and tabs own the instructions',async()=>{
 const c=await read('../public/component.mjs');
 assert.doesNotMatch(template,/SCHRITT [123] VON 3/);
 assert.doesNotMatch(template,/<h2>Grundriss wählen|<h2>Maße eingeben|Stärke wählen\. Dekor aussuchen/);
 assert.doesNotMatch(template,/class="edge-card"/);
 assert.match(template,/class="surface-edge-included"/);
 assert.match(template,/id="selected-surface-name"/);
 assert.match(c,/\['Ecken','Maße in cm','Oberfläche'\]/);
 assert.match(c,/function openInlineMeasure\(key,anchorKey=key\)/);
 assert.match(c,/field\.dispatchEvent\(new Event\('input'/);
 assert.match(c,/visibleMeasureKey\(key\)/);
 assert.match(c,/firstMeasureIssue\(product,variants\[product\],currentDimensions\(\),\{material,straightTreatment\}\)/);
 assert.match(c,/formError\.textContent=message;formError\.hidden=false/);
 assert.doesNotMatch(c,/Letzter gültiger Stand/);
 assert.match(c,/\$\('drawing-status'\)\.hidden=true/);
 assert.match(c,/\$\('error'\)\.hidden=true/);
 const css=await read('../../design/kuechenstudio-060.css');
 assert.match(css,/\.inline-measure-editor/);
 assert.match(css,/\.surface-edge-included/);
 assert.match(css,/#measure-toggle/);
 assert.equal(css,await read('../../wordpress/hpz-apl-admin-preview/assets/kuechenstudio-060.css'));
});
test('Minimal Woo product layout remains scoped to exactly the three product IDs',async()=>{
 const php=await read('../../wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php');
 assert.match(php,/!isset\(self::PRODUCTS\[\$id\]\)/);
 assert.match(php,/self::allowed\(\) && !self::can_public_configurator\(\$id\)/);
 assert.match(php,/remove_action\('woocommerce_before_single_product_summary','woocommerce_show_product_images',20\)/);
 assert.match(php,/hpz-apl-minimal-h1/);
 assert.match(php,/hpz-apl-compact-product/);
 assert.match(php,/remove_action\('woocommerce_single_product_summary','woocommerce_template_single_price',10\)/);
 assert.match(php,/self::options\(\)\['placement'\]!=='automatic'/);
});

test('L4 B5 points to outer diagonal; coupled widths always use the matching right-hand input',()=>{
 const c=config('L4');
 // 30cm is a capped supplier setting: it is NOT the physical 42.4cm gap.
 c.dimensions.B5=300;
 const g=geometry(c);
 const b5=g.dimensions.find(d=>d.id==='B5');
 assert.equal(b5.settingOnly,true);
 assert.deepEqual(b5.diagonalCut,{from:[900,0],to:[0,900]});
 const drawn=svg(g,'B5',{unit:'cm'});
 assert.match(drawn,/data-field="B5" data-measure-id="B5" data-diagonal="outer-edge" data-active="true"/);
 assert.match(drawn,/data-setting-only="true"/);
 assert.match(drawn,/M 450,450 L /,'B5 leader must start in the middle of the outer diagonal');
 assert.doesNotMatch(drawn,/B5: 42,4 cm/,'never pretend B5 is an actual gap measurement');
 const stale=svg(g,'B5',{unit:'cm',invalidField:'B5'});
 assert.doesNotMatch(stale,/B5: 30 cm/,'an invalid B5 field must not display stale geometry value');
 assert.match(stale,/data-field="B5"[^>]*data-active="true"/);
 const b1andb2=svg(g,'B1',{unit:'cm'});
 assert.match(b1andb2,/data-field="B1" data-measure-id="B2"[^>]*data-active="true"/);
 const cornerWidth=svg(g,'B3',{unit:'cm'});
 assert.match(cornerWidth,/data-field="B3" data-measure-id="B4"[^>]*data-active="true"/);
 c.dimensions.B5=900;
 const real=geometry(c);
 assert.equal(real.dimensions.find(d=>d.id==='B5').settingOnly,false);
 assert.match(svg(real,'B5',{unit:'cm'}),/data-diagonal="diagonal-ruler"/);
});
test('Every customer dimension error and inline overlay uses concise German labels',async()=>{
 const c=await read('../public/component.mjs');
 assert.doesNotMatch(c,/z\. B\.|\(z\.B\.|corner-\w+ in cm/);
 assert.match(c,/displayKey=inlineKey\.replace\(\/\^corner-\//);
 assert.match(c,/function activateMeasure\(key\)/);
 assert.match(c,/dataset\.measureId===inlineAnchor/);
 assert.match(c,/invalidMeasureKey=invalidKey\?visibleMeasureKey\(invalidKey\):null/);
 assert.match(c,/\$\('price-note'\)\.textContent='';/);
 assert.doesNotMatch(c,/customerMeasureError\(result\.quote\.availabilityNote\)/);
 const feedback=await read('../core/measure-feedback.mjs');
 assert.doesNotMatch(feedback,/z\. B\./);
});
