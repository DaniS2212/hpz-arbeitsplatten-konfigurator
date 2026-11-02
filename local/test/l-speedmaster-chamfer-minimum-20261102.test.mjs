/**
 * Screenshot-grounded chamfer input regression.
 * Source: archived Speedmaster image set of 02 Nov 2026 in
 * docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip.
 *
 * L1/L2: block-06 images 20261102-115001..115038 (input limits).
 * L3/L4: block-03 images 20261102-114354/114510 (input limits).
 * These figures are sample-visible manufacturer inputs, not a general
 * Speedmaster manufacturing-bound or CNC rule.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry} from '../core/geometry.mjs';
import {defaultLCorner,lCornerKeys} from '../core/l-geometry.mjs';

const dimensions={
 L1:{L1:2000,L2:1200,B1:600,B2:600},
 L2:{L1:2000,L2:1200,B1:600,B2:600},
 L3:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
 L4:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900,B5:600}
};
function make(shape,side,treatment,edits={}){
 const lCorner=defaultLCorner(shape,side,treatment);
 for(const [k,value] of Object.entries(edits))lCorner.parameters[k]=String(value);
 return normalize({
  schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,material:'APL38',
  decor:'W980',corner:'square',quantity:1,
  dimensions:Object.fromEntries(Object.entries(dimensions[shape]).map(([k,v])=>[k,String(v)])),
  lCorner
 });
}
test('L1-L4: Speedmaster screenshots show 60 mm as the minimum on each chamfer distance, both styles',()=>{
 for(const shape of Object.keys(dimensions)) {
  for(const treatment of ['chamfer_square','chamfer_continuous']){
   for(const key of lCornerKeys(shape,'both',treatment)){
    assert.throws(()=>make(shape,'both',treatment,{[key]:50}),new RegExp('corner-'+key),
      shape+' '+treatment+' '+key+' must reject a 50 mm chamfer');
    const config=make(shape,'both',treatment,{[key]:60});
    assert.equal(config.lCorner.parameters[key],60,
      shape+' '+treatment+' '+key+' should accept the 60 mm screenshot minimum');
   }
  }
 }
});
test('L1-L4: documented longer chamfers beyond 100 cm are not silently rejected by a global cap',()=>{
 const fixtures=[
  {shape:'L1',side:'right',edit:{L4:1200},axis:'horizontal',mm:1200,
   source:'block-06 L1 right distance L4 maximum 1350 mm'},
  {shape:'L2',side:'left',edit:{L3:1200},axis:'horizontal',mm:1200,
   source:'block-06 L2 left distance L3 maximum 1350 mm'},
  {shape:'L3',side:'left',edit:{L5:1050},axis:'vertical',mm:1050,
   source:'block-03 L3 distance L5 range 60-1050 mm'},
  {shape:'L4',side:'right',edit:{L6:1050},axis:'horizontal',mm:1050,
   source:'block-03 L4 distance L6 range 60-1050 mm'},
 ];
 for(const f of fixtures){
  for(const treatment of ['chamfer_square','chamfer_continuous']){
   const config=make(f.shape,f.side,treatment,f.edit);
   const drawing=geometry(config),key=Object.keys(f.edit)[0];
   const measure=drawing.cornerDimensions.find(m=>m.id==='corner-'+key);
   assert.equal(measure?.mm,f.mm,f.source);
   assert.equal(measure?.axis,f.axis,f.source);
   assert.equal(drawing.supplierMappingVerified,false);
   assert.equal(drawing.joints,null);
   assert.equal(drawing.shippingParts,null);
  }
 }
});
test('rounding is a distinct unverified corner treatment, not subject to the chamfer-specific 60 mm limit',()=>{
 for(const shape of Object.keys(dimensions)){
  const config=make(shape,'left','round',{R1:50});
  assert.equal(config.lCorner.parameters.R1,50);
  const drawing=geometry(config);
  assert.equal(drawing.cornerArcs.length,1);
  assert.equal(drawing.supplierMappingVerified,false);
 }
});
