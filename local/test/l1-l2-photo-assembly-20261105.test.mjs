/**
 * Six independently supplied Speedmaster screenshots (2026-11-05):
 * L1 084611/084634/084711, L2 084919/084934/085007.
 * A 2-panel illustration, one seam and the *depiction* of biscuit and
 * worktop-connector hardware are observed; no CNC count or position proof.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';
import {readFileSync} from 'node:fs';

function sample(shape,{L1=2000,L2=1200,B1=600,B2=600,material='APL38',side='none',treatment=null}={}){
 const c=normalize({
   schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,
   corner:'square',material,decor:'W980',quantity:1,
   dimensions:{L1:String(L1),L2:String(L2),B1:String(B1),B2:String(B2)},
   lCorner:defaultLCorner(shape,side,treatment)
 });
 return geometry(c);
}
const photoCases={
 L1:{line:[[0,600],[600,600]],parts:['top','leg'],partLabels:['Obere Strecke','Linker Schenkel']},
 L2:{line:[[1400,600],[2000,600]],parts:['top','leg'],partLabels:['Obere Strecke','Rechter Schenkel']}
};
for(const [shape,proof] of Object.entries(photoCases)){
 test(shape+' photographed 2000/1200 mm W980 APL38 two-piece image has one correctly mirrored, illustrative seam',()=>{
  const g=sample(shape);
  assert.deepEqual([g.previewSeamDetails[0].from,g.previewSeamDetails[0].to],proof.line);
  assert.deepEqual(g.previewParts.map(p=>p.id),proof.parts);
  assert.deepEqual(g.previewParts.map(p=>p.label),proof.partLabels);
  assert.equal(g.previewParts.length,2);
  assert.deepEqual(g.previewSeamDetails.map(s=>s.partIds),[['top','leg']]);
  assert.equal(g.previewSeamDetails[0].id,'seam-1');
  assert.equal(g.previewSeamDetails[0].status,'illustration-only');
  assert.deepEqual(g.assemblyPhotoObservation,{
    status:'photo-observation-only',
    caseId:'L'+shape.slice(1)+'-W980-38-2000x1200-20261105',
    visiblePanelRegions:2,
    illustratedSeamId:'seam-1',
    connectorSymbols:['biscuit-symbols','worktop-connector-symbols'],
    connectorCount:null,
    machiningCoordinates:null,
    verifiedCutList:false
  });
  assert.equal(g.supplierMappingVerified,false);
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
  const preview=svg(g,'',{partsView:true,selectedSeam:'seam-1',showDimensions:false});
  assert.match(preview,/data-seam-id="seam-1" data-selected="true"/);
  assert.equal((preview.match(/class="apl-preview-part"/g)||[]).length,2);
  assert.doesNotMatch(preview,/class="apl-measure"/);
 });
 test(shape+' photo observation does not generalize to altered sizes, material or corner machining',()=>{
  for(const variation of [{L1:2100},{L2:1300},{B1:610},{B2:610},{material:'APL17.5'},{side:'left',treatment:'chamfer_square'}]){
   const g=sample(shape,variation);
   assert.equal(g.assemblyPhotoObservation,null,
     shape+' should not claim pictured hardware as a supplier rule for '+JSON.stringify(variation));
   assert.equal(g.joints,null);
   assert.equal(g.shippingParts,null);
   assert.equal(g.supplierMappingVerified,false);
  }
 });
}
test('photo source register preserves six exact SHA-256 originals without pretending they are in repository',()=>{
 const file=new URL('../../docs/references/speedmaster-lu/L1_L2_JOINT_USER_20261105.json',import.meta.url);
 const doc=JSON.parse(readFileSync(file,'utf8'));
 assert.equal(doc.schemaVersion,1);
 assert.equal(doc.sourceType,'speedmaster');
 assert.equal(doc.originalBinaryInGitHub,false);
 assert.deepEqual(Object.keys(doc.cases),['L1','L2']);
 const expected={
  'image(20261105-084611).png':'35f12e1974dd24bb00f0e8107f869611c1d2fba2af640fa0c1a1d85e57d17b24',
  'image(20261105-084634).png':'9aea6ccb8a3b5327eb77c628a5cd272120b4d4fb7b575593307a6d35db68ea0b',
  'image(20261105-084711).png':'afdbccb676e7bb431f0304c5a30e05799c2de9c3d4a99b7c7502813f19b91fd2',
  'image(20261105-084919).png':'2774d4aaf13bf2da3d5183fe1b815701f1f8f7c9ade9aea2c02b368acfe37671',
  'image(20261105-084934).png':'187d7675672dfda6c88b928cd9f07e3d05da56e995259f2183a692ed2ecadc88',
  'image(20261105-085007).png':'0f6ef6af18dbcaec529756f6b0bba4578e8361897340ff23ea68be0e0d208111'
 };
 const encountered=[];
 for(const [shape,entry] of Object.entries(doc.cases)){
  assert.deepEqual(entry.dimensionsMm,{L1:2000,L2:1200,B1:600,B2:600});
  assert.equal(entry.material,'APL38');
  assert.equal(entry.decor,'W980');
  assert.equal(entry.edge,'matching-1.5');
  assert.equal(entry.status,'observed-not-reviewed');
  assert.equal(entry.images.length,3);
  assert.equal(entry.visiblePanelRegions,2);
  assert.deepEqual(entry.connectorSymbolClasses,['biscuit-symbols','worktop-connector-symbols']);
  assert.equal(entry.connectorCountVerified,false);
  assert.equal(entry.machiningCoordinatesVerified,false);
  assert.equal(entry.actualCutListVerified,false);
  for(const img of entry.images){
   encountered.push(img.filename);
   assert.equal(img.sha256,expected[img.filename]);
   assert.ok(Number.isInteger(img.bytes)&&img.bytes>100000);
   assert.ok(img.width>=1900&&img.height>=600);
  }
  assert.equal(entry.caseId,shape+'-W980-38-2000x1200-20261105');
 }
 assert.deepEqual(encountered,Object.keys(expected));
});
test('closeout index classifies L1/L2 assembly photos only as observed, never as independent CNC or shipping approval',()=>{
 const file=new URL('../../docs/references/speedmaster-lu/SUPPLIER_CLOSEOUT.json',import.meta.url);
 const doc=JSON.parse(readFileSync(file,'utf8'));
 for(const shape of ['L1','L2']){
  for(const proofType of ['real-parts','connectors']){
   const record=doc.shapes[shape][proofType];
   assert.equal(record.status,'observed');
   assert.ok(record.sourceRefs.some(x=>x.includes('L1_L2_JOINT_USER_20261105.json')));
   assert.match(record.note,/nicht|keine/i);
   assert.equal(record.reviewedBy,undefined);
  }
 }
});
