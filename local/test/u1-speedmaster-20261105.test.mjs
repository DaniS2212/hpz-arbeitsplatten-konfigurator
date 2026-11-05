import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
const base={L1:2000,L2:1200,L3:1800,B1:600,B2:600,B3:600};
function make({shape='U1',dims={},material='APL38',decor='W980',corner='square',special}={}){
 return geometry(normalize({schemaVersion:2,inputUnit:'mm',product:'u',geometry:shape,corner,
  material,decor,edge:'matching-1.5',quantity:1,...(special?{special:{size:String(special)}}:{}),
  dimensions:Object.fromEntries(Object.entries({...base,...dims}).map(([key,value])=>[key,String(value)]))}));
}
const area=poly=>Math.abs(poly.reduce((v,p,i)=>{const q=poly[(i+1)%poly.length];
 return v+p[0]*q[1]-p[1]*q[0];},0))/2;
test('U1 manufacturer base contour covers exactly three preview-only regions',()=>{
 const g=make();
 assert.equal(g.version,'speedmaster-u1-screenshot-20261105');
 assert.deepEqual(g.points,[[0,0],[2000,0],[2000,1800],[1400,1800],[1400,600],[600,600],[600,1200],[0,1200]]);
 assert.equal(g.areaMm2,2280000);
 assert.deepEqual(g.previewParts.map(p=>p.id),['top','left','right']);
 assert.equal(g.previewParts.reduce((sum,p)=>sum+area(p.polygon),0),g.areaMm2);
 assert.ok(g.previewParts.every(p=>p.status==='illustration-only'));
 assert.deepEqual(g.previewSeamDetails.map(s=>[s.id,s.partIds]),[
  ['seam-1',['top','left']],['seam-2',['top','right']]]);
 for(const [key,value] of Object.entries(base))assert.equal(g.dimensions.find(d=>d.id===key)?.mm,value);
 for(const seamId of ['seam-1','seam-2']){
  const html=svg(g,'',{partsView:true,selectedSeam:seamId,showDimensions:false});
  assert.match(html,new RegExp('data-seam-id="'+seamId+'" data-selected="true"'));
  assert.equal((html.match(/class="apl-preview-part"/g)||[]).length,3);
 }
 assert.equal(g.joints,null);assert.equal(g.shippingParts,null);assert.equal(g.supplierMappingVerified,false);
});
test('photographed assembly witness never leaks to changed dimensions, decor or thickness',()=>{
 const g=make();
 assert.equal(g.assemblyPhotoObservation?.status,'photo-observation-only');
 assert.deepEqual(g.assemblyPhotoObservation.illustratedSeamIds,['seam-1','seam-2']);
 assert.equal(g.assemblyPhotoObservation.connectorCount,null);
 for(const key of Object.keys(base))assert.equal(make({dims:{[key]:base[key]+10}}).assemblyPhotoObservation,null,key);
 assert.equal(make({material:'APL17.5'}).assemblyPhotoObservation,null);
 assert.equal(make({decor:'H1145'}).assemblyPhotoObservation,null);
 assert.equal(make({corner:'round',special:100}).assemblyPhotoObservation,undefined);
 for(const shape of ['U2','U3','U4'])assert.equal(make({shape}).previewParts.length,3);
});
test('U1 screenshot metadata records source hashes but cannot imply supplier clearance',()=>{
 const data=JSON.parse(readFileSync(new URL('../../docs/references/speedmaster-lu/U1_JOINT_USER_20261105.json',import.meta.url),'utf8'));
 assert.equal(data.originalBinaryInGitHub,false);assert.equal(data.images.length,3);
 assert.deepEqual(data.dimensionsMm,base);
 assert.deepEqual(data.images.map(x=>x.sha256),[
  '9c204cac26ae761a42376096595f9e07088ba8201e1f9297510492a08a9c9a06',
  '101bbec9a9140d664989b358f620b4bb845158cc1937c9845e545e0e56c16626',
  'ed4193ad0b85ad087cf8fb54494678c2f9e6597a7046a2b29eb7e4b656115871'
 ]);
 assert.equal(data.manufacturingApproval,false);
 assert.equal(data.salesApproval,false);
});
