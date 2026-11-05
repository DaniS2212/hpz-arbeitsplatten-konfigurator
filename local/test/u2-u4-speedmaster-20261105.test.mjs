import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {uSplitModes} from '../core/u1-geometry.mjs';
import {quote} from '../private/pricing.mjs';

const base={L1:2000,L2:1200,L3:1800,B1:600,B2:600,B3:600};
function cfg(shape,options={}){
 const {dims={},decor='W980',material='APL38',corner='square',special}=options;
 return normalize({schemaVersion:2,inputUnit:'mm',product:'u',geometry:shape,
  corner,decor,material,edge:'matching-1.5',quantity:1,
  ...(special?{special:{size:String(special)}}:{}),
  dimensions:Object.fromEntries(Object.entries({...base,...dims}).map(([k,v])=>[k,String(v)]))});
}
const area=poly=>Math.abs(poly.reduce((v,p,i)=>{
 const q=poly[(i+1)%poly.length];return v+p[0]*q[1]-p[1]*q[0];
},0))/2;
const cases={
 U1:{directions:['cross','cross'],seams:[[[0,600],[600,600]],[[1400,600],[2000,600]]]},
 U2:{directions:['length','length'],seams:[[[600,0],[600,600]],[[1400,0],[1400,600]]]},
 U3:{directions:['length','cross'],seams:[[[600,0],[600,600]],[[1400,600],[2000,600]]]},
 U4:{directions:['cross','length'],seams:[[[0,600],[600,600]],[[1400,0],[1400,600]]]}
};
test('U1-U4 all use exactly one common photographed outside contour and four distinct side joins',()=>{
 const actual=new Set();
 for(const [shape,expected] of Object.entries(cases)){
  const g=geometry(cfg(shape));
  assert.equal(g.version,'speedmaster-'+shape.toLowerCase()+'-screenshot-20261105');
  assert.equal(g.areaMm2,2280000);
  assert.equal(g.previewParts.length,3);
  assert.deepEqual(g.previewParts.map(p=>p.id),['top','left','right']);
  assert.deepEqual(g.previewParts.map(p=>p.number),[1,2,3]);
  assert.ok(g.previewParts.every(p=>p.status==='illustration-only'));
  assert.ok(Math.abs(g.previewParts.reduce((sum,p)=>sum+area(p.polygon),0)-g.areaMm2)<.0001);
  assert.deepEqual(g.previewSeams.map(s=>[s.from,s.to]),expected.seams);
  assert.deepEqual(g.previewSeamDetails.map(s=>s.direction),expected.directions);
  assert.deepEqual(g.previewSeamDetails.map(s=>[s.id,s.partIds]),
   [['seam-1',['top','left']],['seam-2',['top','right']]]);
  assert.equal(g.joints,null);assert.equal(g.shippingParts,null);assert.equal(g.supplierMappingVerified,false);
  assert.equal(quote(cfg(shape)).purchasable,false);
  assert.equal(g.assemblyPhotoObservation?.caseId,shape+'-W980-38-2000x1200x1800-B1B2B3-600-20261105');
  assert.equal(g.assemblyPhotoObservation?.connectorCount,null);
  assert.equal(g.assemblyPhotoObservation?.machiningCoordinates,null);
  const html=svg(g,'',{partsView:true,showDimensions:false,selectedSeam:'seam-2'});
  assert.equal((html.match(/class="apl-preview-part"/g)||[]).length,3);
  assert.equal((html.match(/class="apl-seam-review"/g)||[]).length,2);
  assert.match(html,/data-seam-id="seam-2" data-selected="true"/);
  actual.add(g.previewSeams.map(x=>x.from.join(',')+'-'+x.to.join(',')).join('|'));
 }
 assert.equal(actual.size,4,'each model must have its own split orientation');
 assert.deepEqual(uSplitModes.U2,['length','length']);
});
test('changed valid U dimensions still tile exact projected area but photo observation disappears',()=>{
 const dims={L1:2400,L2:1500,L3:1900,B1:700,B2:650,B3:750};
 for(const shape of Object.keys(cases)){
  const g=geometry(cfg(shape,{dims}));
  assert.equal(g.assemblyPhotoObservation,null);
  assert.equal(g.areaMm2,2400*700+650*(1500-700)+750*(1900-700));
  assert.ok(Math.abs(g.previewParts.reduce((v,p)=>v+area(p.polygon),0)-g.areaMm2)<.0001);
  assert.ok(g.previewParts.every(p=>area(p.polygon)>0));
  assert.equal(g.shippingParts,null);
 }
});
test('manufacturer case may not leak into unverified decor, material or rounded/chamfered U',()=>{
 for(const shape of Object.keys(cases)){
  assert.equal(geometry(cfg(shape,{decor:'H1145'})).assemblyPhotoObservation,null);
  assert.equal(geometry(cfg(shape,{material:'APL17.5'})).assemblyPhotoObservation,null);
  const round=geometry(cfg(shape,{corner:'round',special:100}));
  assert.equal(round.previewParts,undefined);
  assert.notEqual(round.version,'speedmaster-'+shape.toLowerCase()+'-screenshot-20261105');
  assert.equal(round.supplierMappingVerified,false);
  assert.equal(quote(cfg(shape,{corner:'round',special:100})).purchasable,false);
 }
});
test('U2-U4 source metadata records all nine original PNG hashes and unverified net prices',()=>{
 const data=JSON.parse(readFileSync(new URL('../../docs/references/speedmaster-lu/U2_U4_JOINT_USER_20261105.json',import.meta.url),'utf8'));
 assert.equal(data.schemaVersion,1);
 assert.deepEqual(Object.keys(data.cases),['U2','U3','U4']);
 const expectedPrice={U2:'687.36',U3:'691.49',U4:'691.49'};
 for(const [shape,caseData] of Object.entries(data.cases)){
  assert.deepEqual(caseData.dimensionsMm,base);
  assert.equal(caseData.originalBinaryInGitHub,false);
  assert.equal(caseData.images.length,3);
  assert.equal(caseData.displayedPriceEUR,expectedPrice[shape]);
  assert.match(caseData.priceInterpretation,/net-and-tax-not-independently-confirmed/);
  assert.ok(caseData.images.every(i=>/^[a-f0-9]{64}$/.test(i.sha256)&&i.bytes>400000));
  assert.deepEqual([caseData.leftSeamDirection,caseData.rightSeamDirection],cases[shape].directions);
  assert.equal(caseData.actualCutListVerified,false);assert.equal(caseData.salesApproval,false);
 }
 const closeout=JSON.parse(readFileSync(new URL('../../docs/references/speedmaster-lu/SUPPLIER_CLOSEOUT.json',import.meta.url),'utf8'));
 for(const shape of ['U2','U3','U4'])for(const field of ['contour','real-parts','connectors'])
  assert.equal(closeout.shapes[shape][field].status,'observed');
});
