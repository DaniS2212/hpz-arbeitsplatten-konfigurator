/**
 * PR #46 – A part highlight must be the actual drawn, chamfered L silhouette,
 * not the uncut rectangle hidden beneath an SVG clipping mask.
 *
 * Source cases: Speedmaster screenshot measurements (2026-11-02), see
 * docs/l-speedmaster-screenshot-evidence-20261102.md. All pieces and seams
 * remain illustration-only; these polygons are NOT CNC or shipping data.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

function make(shape,{dimensions,parameters,treatment='chamfer_square'}) {
  return geometry(normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,
    material:'APL38',decor:'W980',corner:'square',quantity:1,
    dimensions:Object.fromEntries(Object.entries(dimensions).map(([key,mm])=>[key,String(mm)])),
    lCorner:{side:'both',treatment,parameters:Object.fromEntries(
      Object.entries(parameters).map(([key,mm])=>[key,String(mm)]))}
  }));
}
function area(polygon) {
  return Math.abs(polygon.reduce((sum,p,i)=>{
    const q=polygon[(i+1)%polygon.length];
    return sum+p[0]*q[1]-p[1]*q[0];
  },0))/2;
}
function piecesArea(g){return g.previewParts.reduce((total,part)=>total+area(part.polygon),0);}
function containsPoint(poly,[x,y]) {
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [xi,yi]=poly[i],[xj,yj]=poly[j];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
const photos=[
  {shape:'L1',dimensions:{L1:2000,L2:1200,B1:600,B2:600},
    parameters:{L3:120,B3:240,L4:120,B4:240},expectedArea:1531200,ids:['top','leg']},
  {shape:'L2',dimensions:{L1:2000,L2:1200,B1:600,B2:600},
    parameters:{L3:240,B3:120,L4:120,B4:240},expectedArea:1531200,ids:['top','leg']},
  {shape:'L3',dimensions:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
    parameters:{L5:120,B5:400,L6:150,B6:150},expectedArea:2049750,ids:['top','corner','leg']},
  {shape:'L4',dimensions:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900,B5:300},
    parameters:{L5:150,B5:150,L6:120,B6:240},expectedArea:1654350,ids:['top','corner','leg']}
];

test('L1: photographed unequal 120/240 chamfers must alter the actual top and leg polygons, not merely cover the old shape',()=>{
  const g=make('L1',photos[0]);
  assert.equal(g.areaMm2,1531200);
  assert.deepEqual(g.previewParts.map(p=>p.id),['top','leg']);
  assert.equal(area(g.previewParts[0].polygon),1185600,'right end chamfer removes 14,400 mm2 from upper strip');
  assert.equal(area(g.previewParts[1].polygon),345600,'left end chamfer removes 14,400 mm2 from leg');
  assert.ok(g.previewParts[0].polygon.some(p=>p[0]===1880&&p[1]===600));
  assert.ok(g.previewParts[1].polygon.some(p=>p[0]===360&&p[1]===1200), '240 mm horizontal cut from x=600 to x=360');
  assert.ok(!g.previewParts[0].polygon.some(p=>p[0]===2000&&p[1]===600),'unmodified cut vertex must not survive');
  assert.ok(!g.previewParts[1].polygon.some(p=>p[0]===600&&p[1]===1200),'unmodified cut vertex must not survive');
});
for(const reference of photos)for(const treatment of ['chamfer_square','chamfer_continuous']) {
  test(reference.shape+' '+treatment+': visual part polygons cover exactly the chamfered outline',()=>{
    const g=make(reference.shape,{...reference,treatment});
    assert.deepEqual(g.previewParts.map(p=>p.id),reference.ids);
    assert.ok(Math.abs(g.areaMm2-reference.expectedArea)<1e-5,
      reference.shape+' reference polygon area in mm2');
    assert.ok(Math.abs(piecesArea(g)-reference.expectedArea)<1e-5,
      'illustrative polygons must not include material removed from either end');
    for(const part of g.previewParts) {
      assert.equal(part.status,'illustration-only');
      assert.ok(containsPoint(part.polygon,part.marker),part.id+' number must be within its real highlighted region');
    }
    assert.equal(g.joints,null);
    assert.equal(g.shippingParts,null);
    assert.equal(g.supplierMappingVerified,false);
  });
}
test('both rounded ends use their actual chord-contour for tinted part regions; arcs retain mathematical correction',()=>{
  const ref={...photos[0],treatment:'round',parameters:{R1:100,R2:100}};
  const g=make('L1',ref);
  // Two 100-mm rounded corners: each chord removes a 5000-mm2 triangle.
  assert.equal(area(g.points),1550000);
  assert.equal(piecesArea(g),1550000,'the SVG overlay must not cover both removed chord triangles');
  const arcCorrection=2*10000*(Math.PI/4-1/2);
  assert.ok(Math.abs(g.areaMm2-(1550000+arcCorrection))<1e-6);
  assert.ok(g.previewParts.every(p=>containsPoint(p.polygon,p.marker)));
});
test('L4 B5=300 vs 600 preserves two seam neighbors, unaffected by the corrected exterior preview pieces',()=>{
  const ref=photos[3];
  const a=make('L4',ref);
  const b=make('L4',{...ref,dimensions:{...ref.dimensions,B5:600}});
  for(const g of [a,b]){
    assert.deepEqual(g.previewSeamDetails.map(s=>s.partIds),[['top','corner'],['corner','leg']]);
    const html=svg(g,'',{partsView:true,selectedSeam:'seam-2',showDimensions:false});
    assert.match(html,/data-part-id="corner" data-selected="false" data-seam-neighbor="true"/);
    assert.match(html,/data-part-id="leg" data-selected="false" data-seam-neighbor="true"/);
    assert.doesNotMatch(html,/data-part-id="top" data-selected="false" data-seam-neighbor="true"/);
    assert.ok(Math.abs(piecesArea(g)-area(g.points))<1e-5);
  }
});
