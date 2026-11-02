/**
 * Speedmaster L4 extra pair (02.11.2026), top and perspective views.
 * Two illustrated seams separate upper run / corner / left leg. This is a
 * UI review, NOT proof of machining, connectors or actual shipped pieces.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';

function l4(b5) {
  return geometry(normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:'L4',
    material:'APL38',decor:'W980',corner:'square',quantity:1,
    dimensions:{L1:'2000',L2:'2000',B1:'600',B2:'600',B3:'900',B4:'900',B5:String(b5)},
    lCorner:defaultLCorner('L4')
  }));
}
function overlayStates(g,options){
  const markup=svg(g,'',{partsView:true,showDimensions:false,...options});
  const parts=[...markup.matchAll(/class="apl-preview-part" data-part-id="([^"]+)" data-selected="([^"]+)" data-seam-neighbor="([^"]+)"/g)];
  assert.equal(parts.length,g.previewParts.length,'every illustrated piece must expose seam adjacency state');
  return Object.fromEntries(parts.map(([,id,selected,neighbor])=>[id,{selected,neighbor}]));
}
for(const b5 of [300,600]){
 test('L4 B5='+b5+' photographed seam selection highlights exactly its two adjacent visible pieces',()=>{
   const g=l4(b5);
   assert.deepEqual(g.previewParts.map(p=>p.id),['top','corner','leg']);
   assert.deepEqual(g.previewSeams,[
     {from:[900,0],to:[900,600]},{from:[0,900],to:[600,900]}
   ],'the seam guides meet the photographed top/leg junctions');
   assert.deepEqual(g.previewSeamDetails.map(s=>s.partIds),[['top','corner'],['corner','leg']]);
   for(const [seam,near] of [['seam-1',['top','corner']],['seam-2',['corner','leg']]]){
     const states=overlayStates(g,{selectedSeam:seam});
     for(const id of ['top','corner','leg']){
       assert.equal(states[id].selected,'false','seam selection must not pretend the piece itself was clicked');
       assert.equal(states[id].neighbor,String(near.includes(id)),id+' adjacency for '+seam);
     }
   }
   assert.ok(g.previewParts.every(p=>p.status==='illustration-only'));
   assert.ok(g.previewSeamDetails.every(s=>s.status==='illustration-only'&&s.connectorType===null&&s.connectorCount===null));
   assert.deepEqual([g.joints,g.shippingParts,g.supplierMappingVerified],[null,null,false]);
 });
}
test('part-only, unknown seam and plan view do not retain a stale two-piece highlight',()=>{
  const g=l4(300);
  const part=overlayStates(g,{selectedPart:'top'});
  assert.deepEqual(part,{
    top:{selected:'true',neighbor:'false'},
    corner:{selected:'false',neighbor:'false'},
    leg:{selected:'false',neighbor:'false'}
  });
  const unknown=overlayStates(g,{selectedSeam:'seam-99'});
  assert.ok(Object.values(unknown).every(p=>p.selected==='false'&&p.neighbor==='false'));
  const plan=svg(g,'',{partsView:false,selectedSeam:'seam-1'});
  assert.doesNotMatch(plan,/class="apl-preview-part"/);
  assert.doesNotMatch(plan,/data-seam-neighbor=/);
});
test('L1 one-seam plans also highlight both neighboring pieces without changing product approval',()=>{
  const g=geometry(normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:'L1',
    material:'APL38',decor:'W980',corner:'square',quantity:1,
    dimensions:{L1:'2000',L2:'1200',B1:'600',B2:'600'},
    lCorner:defaultLCorner('L1')
  }));
  const states=overlayStates(g,{selectedSeam:'seam-1'});
  assert.deepEqual(Object.entries(states).filter(([,p])=>p.neighbor==='true').map(([id])=>id),['top','leg']);
  assert.equal(g.supplierMappingVerified,false);
});
