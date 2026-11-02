/**
 * L1–L4 R1/R2: safe geometric sketch extents, never Speedmaster
 * manufacturing radii. RED test before updating code.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry} from '../core/geometry.mjs';
import {defaultLCorner,lCornerPreviewLimits} from '../core/l-geometry.mjs';

const fixtures={
 L1:{L1:2000,L2:1200,B1:600,B2:600},
 L2:{L1:2000,L2:1200,B1:600,B2:600},
 L3:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
 L4:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900,B5:600}
};
const prepare=(shape,values={},dims={})=>{
 const lCorner=defaultLCorner(shape,'both','round');
 Object.assign(lCorner.parameters,Object.fromEntries(Object.entries(values).map(([k,mm])=>[k,String(mm)])));
 return {schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,
  material:'APL38',decor:'W980',corner:'square',quantity:1,
  dimensions:Object.fromEntries(Object.entries({...fixtures[shape],...dims}).map(([key,mm])=>[key,String(mm)])),
  lCorner};
};
test('R1/R2 report physical sketch bounds independently of the chamfer photo limits for L1–L4',()=>{
 for(const shape of Object.keys(fixtures)){
  const fields=lCornerPreviewLimits(shape,fixtures[shape],'both','round',{material:'APL38',decor:'W980'}).fields;
  for(const key of ['R1','R2']){
   assert.equal(fields[key].min,10,shape+' '+key+' minimum');
   assert.equal(fields[key].max,580,shape+' '+key+' mathematically sketched max');
   assert.equal(fields[key].photoMax,null,'Supplier has NOT confirmed R1/R2 radius');
  }
 }
});
test('round at upper sketch limit remains drawable, just beyond is rejected at matching field',()=>{
 for(const shape of Object.keys(fixtures)){
  for(const key of ['R1','R2']){
   const valid=normalize(prepare(shape,{[key]:580}));
   const g=geometry(valid);
   assert.ok(g.cornerArcs.some(arc=>arc.id==='corner-'+key),'drawn '+shape+' '+key);
   assert.equal(g.supplierMappingVerified,false);
   assert.equal(g.joints,null);
   assert.equal(g.shippingParts,null);
   assert.throws(()=>normalize(prepare(shape,{[key]:590})),
    new RegExp('corner-'+key+':.*58'),'invalid '+shape+' '+key+' must name max=58cm');
  }
 }
});
test('shorter L-leg depth lowers R1 or R2 preview range when basic widths change',()=>{
 const dims={B1:300};
 const fields=lCornerPreviewLimits('L1',{...fixtures.L1,...dims},'both','round').fields;
 assert.equal(fields.R1.max,280);
 assert.equal(fields.R2.max,580);
 assert.throws(()=>normalize(prepare('L1',{R1:290},dims)),/corner-R1:.*28/);
 assert.doesNotThrow(()=>normalize(prepare('L1',{R1:280},dims)));
});
test('no corners leave no bounds; one active corner never creates an inactive radius field',()=>{
 const d=fixtures.L1;
 assert.deepEqual(lCornerPreviewLimits('L1',d,'none',null).fields,{});
 assert.deepEqual(Object.keys(lCornerPreviewLimits('L1',d,'left','round').fields),['R1']);
 assert.deepEqual(Object.keys(lCornerPreviewLimits('L2',d,'right','round').fields),['R2']);
});

test('actual mathematical round area is not the straight-chamfer polygon approximation',()=>{
 const cornerNone=defaultLCorner('L1','none',null);
 const noCorner=prepare('L1');noCorner.lCorner=cornerNone;
 const base=geometry(normalize(noCorner));
 for(const radii of [[100,100],[230,350],[580,100]]){
  const rounded=geometry(normalize(prepare('L1',{R1:radii[0],R2:radii[1]})));
  const removed=(radii[0]**2+radii[1]**2)*(1-Math.PI/4);
  assert.ok(Math.abs((base.areaMm2-removed)-rounded.areaMm2)<0.000001,
   'round area should use true quarter-circle arc, radii '+radii.join('/'));
  assert.equal(rounded.supplierMappingVerified,false);
 }
});
