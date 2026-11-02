/**
 * The Speedmaster photos show surface seam direction, NOT vendor-issued
 * milling, connectors, real parts or CNC/shipping data. No false promotion.
 * Tests are independent, literal observation cases (no generated expected).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';

function drawing(shape,dimensions=null,side='none',treatment=null) {
 const base=dimensions ?? ({
   L1:{L1:2000,L2:1200,B1:600,B2:600},
   L2:{L1:2000,L2:1200,B1:600,B2:600},
   L3:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
   L4:{L1:2000,L2:2000,B1:900,B2:900,B3:1050,B4:1050,B5:600}
 })[shape];
 const config=normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,
  corner:'square',material:'APL38',decor:'W980',quantity:1,
  dimensions:Object.fromEntries(Object.entries(base).map(([key,value])=>[key,String(value)])),
  lCorner:defaultLCorner(shape,side,treatment)});
 return geometry(config);
}

const supplierWitnesses=[
 ['L1',[['top','leg']]],
 ['L2',[['top','leg']]],
 ['L3',[['top','corner'],['corner','leg']]],
 ['L4',[['top','corner'],['corner','leg']]]
];
test('L1–L4 drawn seam markers identify ONLY visually adjacent preview areas',()=>{
 for(const [shape,expected] of supplierWitnesses){
  const g=drawing(shape);
  assert.deepEqual(g.previewSeamDetails.map(s=>s.partIds),expected,shape);
  assert.deepEqual(g.previewSeamDetails.map(s=>s.id),expected.map((_,i)=>'seam-'+(i+1)));
  assert.deepEqual(g.previewSeamDetails.map(s=>s.label),expected.map((_,i)=>'Stoß '+String.fromCharCode(65+i)));
  assert.equal(g.previewSeamDetails.length,g.previewSeams.length,shape);
  for(const [index,seam] of g.previewSeamDetails.entries()){
   assert.deepEqual(seam.from,g.previewSeams[index].from);
   assert.deepEqual(seam.to,g.previewSeams[index].to);
   assert.equal(seam.status,'illustration-only');
   assert.equal(seam.connectorType,null);
   assert.equal(seam.connectorCount,null);
   assert.equal(seam.machiningCoordinates,null);
   assert.ok(seam.partIds.every(id=>g.previewParts.some(p=>p.id===id)));
  }
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
  assert.equal(g.supplierMappingVerified,false);
 }
});
test('L joint badges and selection live ONLY in Aufteilung, never in customer draft',()=>{
 for(const [shape,expected] of supplierWitnesses){
  const g=drawing(shape);
  const plan=svg(g,'',{partsView:false,unit:'cm'});
  const parts=svg(g,'',{partsView:true,showDimensions:false,selectedSeam:'seam-1',unit:'cm'});
  assert.doesNotMatch(plan,/apl-seam-badge|data-seam-id=/);
  assert.equal((parts.match(/class="apl-seam-badge"/g)||[]).length,expected.length,shape);
  assert.match(parts,/data-seam-id="seam-1" data-selected="true"/);
  if(expected.length===2)assert.match(parts,/data-seam-id="seam-2" data-selected="false"/);
  assert.match(parts,/illustration-only|Ungepr.fte Vorschau/);
  assert.doesNotMatch(parts,/class="apl-measure"/);
 }
});
test('no invented seam or phantom connector if L4 top and leg preview strips vanish',()=>{
 const g=drawing('L4',{L1:950,L2:950,B1:300,B2:300,B3:950,B4:950,B5:300});
 assert.deepEqual(g.previewParts.map(p=>p.id),['corner']);
 assert.deepEqual(g.previewSeams,[]);
 assert.deepEqual(g.previewSeamDetails,[]);
 assert.doesNotMatch(svg(g,'',{partsView:true}),/apl-seam-badge|data-seam-id=/);
 assert.equal(g.joints,null);
});
test('changing corner treatment never converts an illustration-only seam into a vendor connector',()=>{
 for(const shape of ['L1','L2','L3','L4'])for(const treatment of ['chamfer_square','chamfer_continuous','round']){
  const g=drawing(shape,null,'both',treatment);
  assert.ok(g.previewSeamDetails.every(s=>s.status==='illustration-only'&&s.connectorCount===null));
  assert.equal(g.shippingParts,null);
  assert.equal(g.joints,null);
 }
});
test('straight product must not inherit L seam review metadata or L badges',()=>{
 const c=normalize({schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',
  corner:'square',material:'APL38',decor:'W980',quantity:1,dimensions:{L1:'2000',B1:'600'}});
 const g=geometry(c);
 assert.equal(g.previewSeamDetails,undefined);
 assert.doesNotMatch(svg(g,'',{partsView:true,selectedSeam:'seam-1'}),/data-seam-id=/);
});
