/**
 * PR #48: Stable physical identity for preview-only joints in L4.
 *
 * A boundary L4 can lose one illustrated region when L1=B3 or L2=B4.
 * Selecting "Stoß A" must never silently select the old "Stoß B" because
 * an array was shortened. These are NOT validated CNC joints or parts.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

function l4(l1,l2) {
  const dimensions={L1:l1,L2:l2,B1:300,B2:300,B3:950,B4:950,B5:300};
  const config=normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:'L4',
    corner:'square',material:'APL38',decor:'W980',quantity:1,
    dimensions:Object.fromEntries(Object.entries(dimensions).map(([key,v])=>[key,String(v)])),
    lCorner:{side:'none',treatment:null,parameters:{}}
  });
  return geometry(config);
}

test('normal L4 illustrates a fixed upper Stoß A and lower Stoß B',()=>{
  const g=l4(2000,2000);
  assert.deepEqual(g.previewSeamDetails.map(({id,label,partIds})=>({id,label,partIds})),[
    {id:'seam-1',label:'Stoß A',partIds:['top','corner']},
    {id:'seam-2',label:'Stoß B',partIds:['corner','leg']}
  ]);
  assert.equal(g.supplierMappingVerified,false);
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
});

test('when top region collapses, remaining lower seam stays Stoß B, not renamed Stoß A',()=>{
  const g=l4(950,2000); // geometric limit: L1 equals B3; left leg remains
  assert.deepEqual(g.previewParts.map(p=>p.id),['corner','leg']);
  assert.equal(g.previewSeamDetails.length,1);
  const [seam]=g.previewSeamDetails;
  assert.deepEqual({id:seam.id,label:seam.label,partIds:seam.partIds},
    {id:'seam-2',label:'Stoß B',partIds:['corner','leg']});
  assert.deepEqual(seam.from,[0,950]);
  assert.deepEqual(seam.to,[300,950]);
  const stale=svg(g,'',{partsView:true,selectedSeam:'seam-1',showDimensions:false});
  assert.doesNotMatch(stale,/data-seam-neighbor="true"/);
  assert.doesNotMatch(stale,/data-selected="true"/);
  const selected=svg(g,'',{partsView:true,selectedSeam:'seam-2',showDimensions:false});
  assert.match(selected,/data-seam-id="seam-2" data-selected="true"/);
  assert.match(selected,/data-part-id="leg" data-selected="false" data-seam-neighbor="true"/);
});

test('when leg region collapses, remaining upper seam stays Stoß A',()=>{
  const g=l4(2000,950); // L2 equals B4, upper run remains
  assert.deepEqual(g.previewParts.map(p=>p.id),['top','corner']);
  assert.deepEqual(g.previewSeamDetails.map(({id,label,partIds})=>({id,label,partIds})),[
    {id:'seam-1',label:'Stoß A',partIds:['top','corner']}
  ]);
  assert.equal(g.previewSeamDetails[0].from[0],950);
  assert.equal(g.previewSeamDetails[0].to[0],950);
});

test('when both strips collapse no fictional seams or real CNC parts appear',()=>{
  const g=l4(950,950);
  assert.deepEqual(g.previewParts.map(p=>p.id),['corner']);
  assert.deepEqual(g.previewSeamDetails,[]);
  assert.deepEqual(g.previewSeams,[]);
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
  assert.equal(g.supplierMappingVerified,false);
});
