/**
 * PR52: exact photo-bound L3/L4 assembly witnesses, not CNC manufacturing.
 * L3: existing PR39 02.11.2026 manufacturer source (basic 2000/600/900
 * topology; illustrated connector types, profile details NOT all verified).
 * L4: four user-supplied PNGs 05.11.2026, B5(base)=600 specifically.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';

const base={L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900};
function candidate(shape,overrides={}){
 const {dims={},material='APL38',decor='W980',edge='matching-1.5',side='none',treatment=null}=overrides;
 const dimension={...base,...(shape==='L4'?{B5:600}:{}),...dims};
 const c=normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',
  material,decor,edge,quantity:1,dimensions:Object.fromEntries(Object.entries(dimension).map(([key,val])=>[key,String(val)])),
  lCorner:defaultLCorner(shape,side,treatment)});
 return geometry(c);
}
const cases=[
 ['L3','L3-base-2000-2000-600-900-20261102','2026-11-02'],
 ['L4','L4-W980-38-2000x2000-B5-600-20261105','2026-11-05']
];
for(const [shape,caseId,date] of cases){
 test(shape+' exact manufacturer 2000/2000/600/900 view has three visual regions and two fixed seam labels',()=>{
  const g=candidate(shape);
  assert.deepEqual(g.previewParts.map(p=>p.id),['top','corner','leg']);
  assert.deepEqual(g.previewSeamDetails.map(s=>({id:s.id,label:s.label,partIds:s.partIds})),[
   {id:'seam-1',label:'Stoß A',partIds:['top','corner']},
   {id:'seam-2',label:'Stoß B',partIds:['corner','leg']}
  ]);
  assert.equal(g.assemblyPhotoObservation?.caseId,caseId);
  assert.equal(g.assemblyPhotoObservation?.capturedDate,date);
  assert.equal(g.assemblyPhotoObservation?.status,'photo-observation-only');
  assert.equal(g.assemblyPhotoObservation?.visiblePanelRegions,3);
  assert.deepEqual(g.assemblyPhotoObservation?.illustratedSeamIds,['seam-1','seam-2']);
  assert.deepEqual(g.assemblyPhotoObservation?.connectorSymbols,['biscuit-symbols','worktop-connector-symbols']);
  assert.equal(g.assemblyPhotoObservation?.connectorCount,null);
  assert.equal(g.assemblyPhotoObservation?.machiningCoordinates,null);
  assert.equal(g.assemblyPhotoObservation?.verifiedCutList,false);
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
  assert.equal(g.supplierMappingVerified,false);
  for(const seamId of ['seam-1','seam-2']){
   const html=svg(g,'',{partsView:true,selectedSeam:seamId,showDimensions:false});
   assert.match(html,new RegExp('data-seam-id="'+seamId+'" data-selected="true"'));
   assert.equal((html.match(/class="apl-preview-part"/g)||[]).length,3);
  }
 });
 test(shape+' photo evidence must disappear on any different dimensions, thickness, decor or corner option',()=>{
  const variations=[{dims:{L1:2100}},{dims:{L2:1900}},{dims:{B1:610}},{dims:{B3:950}},
   {material:'APL17.5'},{decor:'DUMMY'}, {side:'both',treatment:'chamfer_square'}];
  if(shape==='L4')variations.push({dims:{B5:300}});
  for(const v of variations){
   try{
    const g=candidate(shape,v);
    assert.equal(g.assemblyPhotoObservation,null,'cannot extrapolate exact photo to '+JSON.stringify(v));
    assert.equal(g.joints,null);
    assert.equal(g.shippingParts,null);
   }catch(e){
    if(!String(e.message).includes('Dekor'))throw e;
   }
  }
 });
}
test('PR52 L3 archived supplier source and L4 four new images are indexed with exact SHA and distinct archive status',()=>{
 const json=JSON.parse(readFileSync(new URL('../../docs/references/speedmaster-lu/L3_L4_JOINT_USER_20261105.json',import.meta.url),'utf8'));
 assert.equal(json.schemaVersion,1);
 assert.deepEqual(Object.keys(json.cases),['L3','L4']);
 const l3=json.cases.L3,l4=json.cases.L4;
 assert.equal(l3.originalBinaryInGitHub,true,'only old PR39 ZIP originals are already committed');
 assert.equal(l4.originalBinaryInGitHub,false,'new PNGs are not committed');
 assert.equal(l3.status,'observed-not-reviewed');
 assert.equal(l4.status,'observed-not-reviewed');
 assert.deepEqual(l3.dimensionsMm,base);
 assert.deepEqual(l4.dimensionsMm,{...base,B5:600});
 assert.equal(l3.profileExactMatchVerified,false,'L3 2026-11-02 screenshots have mixed profile details');
 for(const c of [l3,l4]){
  assert.equal(c.visiblePanelRegions,3);
  assert.deepEqual(c.visibleSeams,['seam-1','seam-2']);
  assert.deepEqual(c.connectorSymbolClasses,['biscuit-symbols','worktop-connector-symbols']);
  assert.equal(c.connectorCountVerified,false);
  assert.equal(c.machiningCoordinatesVerified,false);
  assert.equal(c.actualCutListVerified,false);
  assert.equal(c.shippingPartsVerified,false);
 }
 assert.equal(l4.images.length,4);
 assert.deepEqual(l4.images.map(x=>x.sha256),[
  'dd4ffc41ca78fd0952a3469f2a424aa0db598eb1eba3a97665ea786b85e488db',
  'c39ee97cd357775e9076a7540af9d9ea3f3c31e14f1494d6b2a8fd48989a37f0',
  '445e04fd2b66351963e6646d9e9d4bea1d634d6f53449abc79a44a6223ad1535',
  'db9f4d5c865151cd27d05ae84925d2a9494c5972f5b5166ca232df62771ab2c8'
 ]);
 assert.ok(l4.images.every(x=>x.bytes>400000&&x.width>=2047&&x.height>=670));
 assert.ok(l3.images.some(x=>x.archivePath.includes('originals/block-02/')));
 assert.ok(l3.images.every(x=>x.binaryVerifiedInGitHubArchive));
});
test('private supplier closeout records only observed L3/L4 pieces and connector icons, not manufacturing approvals',()=>{
 const file=new URL('../../docs/references/speedmaster-lu/SUPPLIER_CLOSEOUT.json',import.meta.url);
 const doc=JSON.parse(readFileSync(file,'utf8'));
 for(const shape of ['L3','L4']){
  for(const key of ['real-parts','connectors']){
   const row=doc.shapes[shape][key];
   assert.equal(row?.status,'observed');
   assert.ok(row.sourceRefs.some(x=>x.endsWith('L3_L4_JOINT_USER_20261105.json')));
   assert.match(row.note,/keine|nicht|unbestätigt/i);
   assert.equal(row.reviewedBy,undefined);
  }
 }
});
