import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner,lCornerKeys} from '../core/l-geometry.mjs';

const SHAPES=['L1','L2','L3','L4'];
const rawMeasures={
 L1:{L1:2500,L2:1700,B1:600,B2:600},
 L2:{L1:2500,L2:1700,B1:600,B2:600},
 L3:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
 L4:{L1:2000,L2:2000,B1:900,B2:900,B3:1050,B4:1050,B5:600}
};
const mmConfig=(shape,side='both',treatment='chamfer_square')=>{
 const corner=defaultLCorner(shape,side,treatment);
 const keys=lCornerKeys(shape,side,treatment);
 for(const key of keys) {
  if(key[0]==='L')corner.parameters[key]=key.endsWith('3')||key.endsWith('5')?'240':'160';
  else if(key[0]==='B')corner.parameters[key]=key.endsWith('3')||key.endsWith('5')?'120':'200';
 }
 return normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,material:'APL38',
  decor:'W980',corner:'square',quantity:1,lCorner:corner,
  dimensions:Object.fromEntries(Object.entries(rawMeasures[shape]).map(([name,value])=>[name,String(value)]))
 });
};
const axisFor=(shape,side,key)=>{
 // Orientation of the physical worktop leg, not the alphabetic first letter:
 // left end of mirrored L2 is horizontal; right bottom of L2 is vertical.
 const lengthHorizontal=shape==='L2'?side==='left':side==='right';
 return key.startsWith('L')?(lengthHorizontal?'horizontal':'vertical')
  :(lengthHorizontal?'vertical':'horizontal');
};
const coord=(d)=>[d.from,d.to].map(x=>x.join(',')).join('→');
function pos(html,field){
 const start=html.indexOf('data-field="'+field+'"');
 assert.ok(start>=0,'no SVG measure '+field);
 const snippet=html.slice(start,start+1800);
 const match=snippet.match(/transform="translate\(([-+eE0-9.]+) ([-+eE0-9.]+)\)( rotate\(-90\))?"/);
 assert.ok(match,'missing label transform for '+field);
 return {x:Number(match[1]),y:Number(match[2]),vertical:!!match[3]};
}
test('L1 Speedmaster reference: B3 is horizontal and L3 is vertical; unequal inputs change the correct cut edges',()=>{
 const g=geometry(mmConfig('L1','left','chamfer_square'));
 const l3=g.cornerDimensions.find(d=>d.id==='corner-L3');
 const b3=g.cornerDimensions.find(d=>d.id==='corner-B3');
 assert.equal(l3.axis,'vertical');
 assert.equal(l3.mm,240);
 assert.equal(b3.axis,'horizontal');
 assert.equal(b3.mm,120);
 assert.deepEqual(l3.from,[600,1700]);
 assert.deepEqual(b3.from,[600,1700]);
 assert.deepEqual(l3.to,[600,1460]);
 assert.deepEqual(b3.to,[480,1700]);
 assert.equal(g.contourMarkers.length,1);
 assert.equal(g.contourMarkers[0].vertical,240);
 assert.equal(g.contourMarkers[0].horizontal,120);
});
test('axis binding follows actual end-of-leg orientation for all 4 layouts and both outside corners',()=>{
 for(const shape of SHAPES){
  for(const side of ['left','right','both'])for(const treatment of ['chamfer_square','chamfer_continuous']){
   const g=geometry(mmConfig(shape,side,treatment));
   const expectedSides=side==='both'?['left','right']:[side];
   assert.equal(g.contourMarkers.length,expectedSides.length);
   for(const place of expectedSides){
    const keys=lCornerKeys(shape,place,treatment);
    for(const key of keys){
     const d=g.cornerDimensions.find(d=>d.id==='corner-'+key);
     assert.ok(d,shape+' '+place+' '+key);
     assert.equal(d.axis,axisFor(shape,place,key),shape+' '+place+' '+key+' should follow leg');
     assert.equal(d.mm,Number(mmConfig(shape,side,treatment).lCorner.parameters[key]));
     const dx=Math.abs(d.from[0]-d.to[0]),dy=Math.abs(d.from[1]-d.to[1]);
     assert.equal(d.axis==='horizontal'?dx:dy,d.mm,shape+' '+key+': '+coord(d));
     assert.equal(d.axis==='horizontal'?dy:dx,0,shape+' '+key+': '+coord(d));
    }
   }
   assert.equal(g.joints,null);
   assert.equal(g.shippingParts,null);
   assert.equal(g.supplierMappingVerified,false);
  }
 }
});
test('continuous-edge chamfers contain straight diagonals, never made-up quadratic rounded corners',()=>{
 for(const shape of SHAPES)for(const side of ['left','right','both']){
  const config=mmConfig(shape,side,'chamfer_continuous'),g=geometry(config);
  assert.doesNotMatch(g.path,/\bQ\b/,shape+' '+side+' rounded contour is not supplier evidence');
  assert.doesNotMatch(svg(g,'',{unit:'cm'}),/class="apl-surface" d="[^"]*Q/);
  assert.equal(g.cornerArcs.length,0);
  assert.equal(g.cornerCuts.length,side==='both'?2:1);
  assert.match(g.warnings.join(' '),/Vorschau|Fertigungs/);
 }
});
test('all 40 L1-L4 corner conditions preserve a closed drawing and disabled production data',()=>{
 for(const shape of SHAPES){
  let states=0;
  for(const side of ['none','left','right','both']){
   for(const treatment of side==='none'?[null]:['round','chamfer_square','chamfer_continuous']){
    const cfg=side==='none'?
     normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,material:'APL38',decor:'W980',
      corner:'square',quantity:1,lCorner:defaultLCorner(shape),
      dimensions:Object.fromEntries(Object.entries(rawMeasures[shape]).map(([name,value])=>[name,String(value)]))}):
     treatment==='round'?
      normalize({...mmConfig(shape,side,'chamfer_square'),lCorner:defaultLCorner(shape,side,'round')}):
      mmConfig(shape,side,treatment);
    const g=geometry(cfg);
    assert.ok(g.path.startsWith('M ')&&g.path.endsWith(' Z'),shape+' '+side+' '+treatment);
    assert.ok(g.areaMm2>0);
    assert.equal(g.joints,null);
    assert.equal(g.shippingParts,null);
    assert.equal(g.supplierMappingVerified,false);
    states++;
   }
  }
  assert.equal(states,10);
 }
});
test('L1 lower-leg corner labels sit OUTSIDE the wood and avoid B1 label collisions',()=>{
 for(const treatment of ['chamfer_square','chamfer_continuous']){
  const g=geometry(mmConfig('L1','both',treatment)),img=svg(g,'corner-L3',{unit:'cm'});
  const vertical=pos(img,'corner-L3'),horizontal=pos(img,'corner-B3'),base=pos(img,'B1');
  assert.equal(vertical.vertical,true);
  assert.ok(vertical.x>g.dimensions.find(d=>d.id==='B1').mm+30,'L3 vertical label must sit in inner opening, not on leg');
  assert.equal(horizontal.vertical,false);
  assert.ok(horizontal.y>g.height+110,'B3 horizontal label should be below worktop');
  assert.ok(base.y>horizontal.y+170,'B1 leg-width label must not overlap B3 label');
 }
});
test('L2 mirrored corner dimensions are placed outside the actual contour, not based on left/right names alone',()=>{
 const g=geometry(mmConfig('L2','both','chamfer_continuous')),img=svg(g,'corner-B3',{unit:'cm'});
 assert.ok(pos(img,'corner-B3').x < -30,'L2 left-end vertical label must be left of x=0');
 assert.ok(pos(img,'corner-L4').x > g.width+30,'L2 right-leg vertical label must be beyond x=L1');
});
