/**
 * PR #41 – L chamfer limits: distinguish exact supplier photo fields from
 * mathematical preview limits. The archived screenshots are NOT CNC or
 * manufacturing approvals.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';

const photographed={
 L1:{treatment:'chamfer_square',dims:{L1:2000,L2:1200,B1:600,B2:600}},
 L2:{treatment:'chamfer_continuous',dims:{L1:2000,L2:1200,B1:600,B2:600}},
 L3:{treatment:'chamfer_continuous',dims:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900}},
 L4:{treatment:'chamfer_square',dims:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900,B5:600}}
};
function make(shape,field,value,{dimensions={},treatment,material='APL38',decor='W980',side='both'}={}){
 const photo=photographed[shape],corner=defaultLCorner(shape,side,treatment??photo.treatment);
 if(field)corner.parameters[field]=String(value);
 return {schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,
  material,decor,corner:'square',quantity:1,
  dimensions:Object.fromEntries(Object.entries({...photo.dims,...dimensions}).map(([k,v])=>[k,String(v)])),
  lCorner:corner};
}
test('photographed manufacturer INPUT upper limits are respected only for the exact matching L1–L4 preset',()=>{
 // All these values fit the current mathematical outline yet exceed a
 // smaller field maximum legible on its supplier screenshot.
 const examples=[
  ['L1','L3',550,560], // block-06/image(20261102-115001).png
  ['L1','L4',1350,1360],
  ['L2','L3',1350,1360], // block-06/image(20261102-115024).png
  ['L2','L4',550,560],
  ['L3','L5',1050,1060], // block-03/image(20261102-114354).png
  ['L3','L6',1050,1060],
  ['L4','L5',1050,1060], // block-03/image(20261102-114510).png
  ['L4','L6',1050,1060]
 ];
 for(const [shape,key,photoMax,excess] of examples){
  const reference=normalize(make(shape,key,photoMax));
  assert.equal(reference.lCorner.parameters[key],photoMax,shape+' '+key+' should allow photographed max');
  assert.throws(()=>normalize(make(shape,key,excess)),
   new RegExp('corner-'+key+':.*'+String(photoMax/10)),
   shape+' '+key+' should show the photo-bound maximum (no general manufacturing claim)');
 }
});
test('different plate size, material, corner selection, or chamfer treatment cannot silently borrow supplier screenshot bounds',()=>{
 // 1360 mm remains inside the purely mathematical 1380 mm preview cap
 // for this L1 base; only the exact photographed BOTH + SQUARE + APL38
 // + W980 combination has the 1350 mm supplier input upper bound.
 const variants=[
  {dimensions:{L1:2500}}, {material:'APL17.5'},
  {treatment:'chamfer_continuous'}, {side:'right'},
 ];
 for(const variant of variants){
  const config=normalize(make('L1','L4',1360,variant));
  assert.equal(config.lCorner.parameters.L4,1360,JSON.stringify(variant));
  assert.equal(geometry(config).supplierMappingVerified,false);
 }
});
test('invalid physical corner cuts report the actual field and a per-layout preview maximum, not a generic outline error',()=>{
 const examples=[
  ['L1','L4',1390,'138'],
  ['L1','B3',600,'58'],
  ['L2','B3',600,'58'],
  ['L2','L4',590,'58'],
  ['L3','L5',1090,'108'],
  ['L4','L6',1090,'108'],
 ];
 for(const [shape,key,value,maxCm] of examples){
  const config=make(shape,key,value,shape==='L1'||shape==='L2'
    ?{treatment:shape==='L1'?'chamfer_continuous':'chamfer_square'}
    :{treatment:shape==='L3'?'chamfer_square':'chamfer_continuous'});
  assert.throws(()=>normalize(config),new RegExp('corner-'+key+':.*'+maxCm),
   shape+' '+key+' must identify its physically impossible sketch distance');
 }
});
test('L4 base B5 and outer-corner B5 stay separate when the diagonal basic width changes',()=>{
 const raw=make('L4','B5',150);
 const first=geometry(normalize(raw));
 const moved=structuredClone(raw);moved.dimensions.B5='300';
 const second=geometry(normalize(moved));
 assert.equal(first.cornerDimensions.find(x=>x.id==='corner-B5')?.mm,150);
 assert.equal(second.cornerDimensions.find(x=>x.id==='corner-B5')?.mm,150);
 assert.ok(Math.abs(first.points[0][0]-second.points[0][0])>300,
  'L4 outer diagonal is still model-derived, must respond independently');
 assert.equal(second.supplierMappingVerified,false);
 assert.equal(second.joints,null);
 assert.equal(second.shippingParts,null);
});
