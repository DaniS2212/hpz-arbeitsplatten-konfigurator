import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize,mmTextToMm} from '../core/config.mjs';
import {straightCorners,cornerLimits,defaultCornerParameters} from '../core/straight-corners.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {quote} from '../private/pricing.mjs';
import {template} from '../public/component-template.mjs';

const input=(side='left',treatment='chamfer_square',parameters,dimensions={L1:'2000',B1:'600'})=>({schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',material:'APL17.5',decor:'W980',dimensions,straightCorner:{side,treatment:side==='none'?null:treatment,parameters:parameters??defaultCornerParameters(side,treatment)}});

test('v2 explicitly identifies mm; legacy cm remains a separate unchanged input contract',()=>{
 const mm=normalize(input('none')),cm=normalize({product:'straight',geometry:'straight',corner:'square',material:'APL17.5',decor:'W980',dimensions:{L1:'200',B1:'60'}});
 assert.deepEqual(mm.dimensions,cm.dimensions);assert.equal(mm.schemaVersion,2);assert.equal(mm.unit,'mm');assert.equal(cm.schemaVersion,1);
 for(const patch of [{inputUnit:undefined},{schemaVersion:undefined},{schemaVersion:1},{inputUnit:'cm'},{schemaVersion:3}])assert.throws(()=>normalize({...input('none'),...patch}),/Einheit|Version/);
 assert.equal(normalize(input('none',null,{}, {L1:'2001',B1:'601'})).dimensions.L1,2001);
});
test('mm parser refuses implicit conversion, decimal cm strings and exponent formats',()=>{
 assert.equal(mmTextToMm('2000'),2000);assert.equal(mmTextToMm('1'),1);
 for(const v of ['200,1','200.1','1e3','-10','0','',2000,null,Infinity,{},'100001'])assert.throws(()=>mmTextToMm(v));
});
for(const variant of straightCorners)test(`v2 preview for ${variant.id}; purchase stays closed`,()=>{
 const c=normalize(input(variant.side,variant.treatment));const g=geometry(c);
 assert.ok(g.path);assert.equal(g.supplierMappingVerified,false);assert.equal(quote(c).purchasable,false);
 if(variant.side!=='none'){assert.equal(quote(c).illustration,null);assert.equal(quote(c).referenceMatched,false);}
 assert.deepEqual(Object.keys(c.straightCorner.parameters),variant.parameters);
});
test('square cut matches reference: horizontal L2 and vertical B2, front-left diagonal',()=>{
 const g=geometry(normalize(input('left','chamfer_square',{L2:'150',B2:'150'})));
 assert.deepEqual(g.front,{from:[150,600],to:[2000,600]});assert.equal(g.areaMm2,1188750);
 assert.match(g.path,/L 150 600 L 0 450/);assert.equal(g.cornerCuts[0].side,'left');
 const dims=Object.fromEntries(g.cornerDimensions.map(d=>[d.id,d.mm]));assert.deepEqual(dims,{L2:150,B2:150});
});
test('right cut mirrors left and both sides retain independent parameters',()=>{
 const l=geometry(normalize(input())),r=geometry(normalize(input('right')));
 assert.equal(l.areaMm2,r.areaMm2);assert.match(r.path,/L 2000 450 L 1850 600/);
 const both=geometry(normalize(input('both','chamfer_square',{L2:'200',B2:'150',L3:'280',B3:'200'})));
 assert.deepEqual(both.front,{from:[200,600],to:[1720,600]});assert.equal(both.cornerCuts.length,2);
 assert.deepEqual(both.cornerDimensions.map(d=>d.id),['L2','B2','L3','B3']);
});
test('square shop cap 1.40 × depth rounds down to 10 mm, stays below confirmed 1.41 cap',()=>{
 for(const [b,max] of [[150,210],[200,280],[300,420]]){
  const limits=cornerLimits('left','chamfer_square',{L1:2000,B1:600},{L2:150,B2:b});assert.equal(limits.fields.L2.max,max);
  assert.doesNotThrow(()=>normalize(input('left','chamfer_square',{L2:String(max),B2:String(b)})));
  assert.throws(()=>normalize(input('left','chamfer_square',{L2:String(max+10),B2:String(b)})),/L2/);
 }
 assert.doesNotThrow(()=>normalize(input('right','chamfer_square',{L3:'280',B3:'200'})));
 assert.throws(()=>normalize(input('right','chamfer_square',{L3:'290',B3:'200'})),/L3/);
});
test('overlaps, too short front, back clearance, wrong fields and non-10mm corner input rejected',()=>{
 for(const data of [input('both','chamfer_square',{L2:'280',B2:'200',L3:'280',B3:'200'},{L1:'600',B1:'600'}),input('left','chamfer_square',{L2:'100',B2:'560'}),input('left','chamfer_square',{L2:'151',B2:'150'}),input('left','chamfer_square',{L2:'150',B2:'150',R1:'100'}),input('both','round',{R1:'300',R2:'300'},{L1:'600',B1:'600'}),input('left','round',{R1:'101'})])assert.throws(()=>normalize(data));
 assert.doesNotThrow(()=>normalize(input('both','chamfer_square',{L2:'280',B2:'200',L3:'270',B3:'200'},{L1:'600',B1:'600'})));
});
test('continuous reference envelope is explicit and not generalised to other plate sizes',()=>{
 for(const side of ['left','right','both'])assert.doesNotThrow(()=>normalize(input(side,'chamfer_continuous')));
 assert.doesNotThrow(()=>normalize(input('left','chamfer_continuous',{L2:'200',B2:'300'})));
 assert.throws(()=>normalize(input('left','chamfer_continuous',{L2:'1950',B2:'550'})),/L2|B2|Bereich/);
 assert.throws(()=>normalize(input('left','chamfer_continuous',undefined,{L1:'2100',B1:'600'})),/2000.*600/);
});
test('continuous outline visibly softens transitions but never invents a manufacturing radius or area',()=>{
 const square=geometry(normalize(input())),continuous=geometry(normalize(input('left','chamfer_continuous')));
 const surface=g=>svg(g).match(/class="apl-surface" d="([^"]+)"/)[1];
 assert.notEqual(surface(square),surface(continuous));assert.doesNotMatch(surface(square),/Q/);assert.match(surface(continuous),/Q/);
 assert.equal(continuous.contourStatus,'schematic');assert.equal(continuous.areaMm2,null);
 assert.equal(continuous.cornerCuts[0].radiusMm,undefined);assert.ok(continuous.warnings.some(t=>/schematisch/.test(t)));
});
test('chamfer dimensions and active side are explicit in SVG',()=>{
 const g=geometry(normalize(input('both'))),markup=svg(g,'B3');
 for(const name of ['L2','B2','L3','B3'])assert.match(markup,new RegExp(`${name}: 150 mm`));
 assert.match(markup,/data-cut="right" data-active="true"/);assert.match(markup,/data-field="B3" data-active="true"/);
 assert.match(svg(g,'side-left'),/data-cut="left" data-active="true"/);
});
test('shared L/U mm inputs preserve their v1 contours and physical dimensions',()=>{
 for(const [product,id,dims] of [['l','L4',{L1:'2500',L2:'1700',B1:'600',B2:'600'}],['u','U4',{L1:'2500',L2:'1700',L3:'1800',B1:'600',B2:'600',B3:'600'}]]){
  const common={product,geometry:id,corner:'square',material:'APL38',decor:'W980'};
  const modern=normalize({...common,schemaVersion:2,inputUnit:'mm',dimensions:dims});
  const legacy=normalize({...common,dimensions:Object.fromEntries(Object.entries(dims).map(([k,v])=>[k,String(Number(v)/10)]))});
  assert.deepEqual(modern.dimensions,legacy.dimensions);assert.equal(geometry(modern).path,geometry(legacy).path);
 }
});
test('current visible template consistently uses mm; legacy cm API is not exposed as UI',()=>{
 assert.doesNotMatch(template,/\bcm\b|Zentimeter|einer Nachkommastelle/);
 assert.match(template,/Alle Maße in mm/);assert.match(template,/1-mm-Schritte/);assert.match(template,/10-mm-Schritte/);
});
test('mobile corner details omit unrelated measures and disclose schematic transitions',()=>{
 const g=geometry(normalize(input('both','chamfer_continuous'))),left=svg(g,'L2',{detail:'left'}),right=svg(g,'B3',{detail:'right'});
 assert.match(left,/L2: 150 mm/);assert.doesNotMatch(left,/L3:|B3:|L1:|B1:/);
 assert.match(right,/B3: 150 mm/);assert.doesNotMatch(right,/L2:|B2:|L1:|B1:/);
 assert.match(left,/Übergänge schematisch/);assert.match(right,/Detail vorne rechts/);
});
