import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry} from '../core/geometry.mjs';
import {defaultLCorner,lDimensionKeys,lVisibleDimensionKeys,lDefaultDimensions} from '../core/l-geometry.mjs';

function make(shape,dims){
  return {schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',material:'APL38',decor:'W980',quantity:1,
    dimensions:dims,lCorner:defaultLCorner(shape)};
}
const l3={L1:'2000',L2:'2000',B1:'600',B2:'600',B3:'900',B4:'900'};
const l4={L1:'2000',L2:'2000',B1:'900',B2:'900',B3:'1050',B4:'1050',B5:'600'};

test('Speedmaster L3 and L4 show grouped width pairs in the same straight-style measure grid',()=>{
  assert.deepEqual(lVisibleDimensionKeys('L3'),['L1','L2','B1','B3']);
  assert.deepEqual(lVisibleDimensionKeys('L4'),['L1','L2','B1','B3','B5']);
  assert.deepEqual(lDimensionKeys('L3'),['L1','L2','B1','B2','B3','B4']);
  assert.deepEqual(lDimensionKeys('L4'),['L1','L2','B1','B2','B3','B4','B5']);
  assert.deepEqual(lVisibleDimensionKeys('L1'),['L1','L2','B1','B2']);
  assert.deepEqual(lDefaultDimensions('L3'),{L1:'200',L2:'200',B1:'60',B2:'60',B3:'90',B4:'90'});
  assert.deepEqual(lDefaultDimensions('L4'),{L1:'200',L2:'200',B1:'90',B2:'90',B3:'105',B4:'105',B5:'60'});
});
test('L3 inside diagonal follows B3/B4 explicitly rather than the former guessed half width',()=>{
  const g=geometry(normalize(make('L3',l3)));
  assert.deepEqual(g.points,[[0,0],[2000,0],[2000,600],[900,600],[600,900],[600,2000],[0,2000]]);
  const changed=geometry(normalize(make('L3',{...l3,B3:'950',B4:'950',B1:'900',B2:'900'})));
  assert.deepEqual(changed.points[3],[950,900]);
  assert.deepEqual(changed.points[4],[900,950]);
  assert.equal(g.supplierMappingVerified,false);
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
});
test('L4 B5 changes the outer diagonal independently of B3/B4 inside diagonal',()=>{
  const large=geometry(normalize(make('L4',l4)));
  const short=geometry(normalize(make('L4',{...l4,B5:'300'})));
  assert.ok(Math.abs(large.points[0][0]-(900+1050-600*Math.SQRT2))<.01);
  assert.deepEqual(large.points.slice(1,7),[[2000,0],[2000,900],[1050,900],[900,1050],[900,2000],[0,2000]]);
  assert.notDeepEqual(large.points[0],short.points[0]);
  assert.deepEqual(large.points[3],short.points[3]);
  assert.equal(large.supplierMappingVerified,false);
});
test('paired widths reject mismatches or missing properties before preview',()=>{
  for (const dims of [
    {...l3,B2:'700'}, {...l3,B4:'850'}, {...l3,B3:'620',B4:'620'}, 
    {...l3,B3:'900',B4:'900',B5:'600'},
    {...l3,B2:undefined},
    {...l4,B5:'100'},
  ]) assert.throws(()=>normalize(make(dims.B5!==undefined&&dims.B5!=='100'?'L3':dims.B5==='100'?'L4':'L3',dims)));
});
test('L4 permits the Speedmaster boundary example B1/B2 300, B3/B4 950, B5 300',()=>{
 const geometryAtLimit=geometry(normalize(make('L4',{
   L1:'950',L2:'950',B1:'300',B2:'300',B3:'950',B4:'950',B5:'300'
 })));
 assert.equal(geometryAtLimit.supplierMappingVerified,false);
 assert.ok(geometryAtLimit.areaMm2>0);
});
test('L3/L4 remain not purchasable even when all screenshot-defined fields validate',()=>{
  for(const [shape,dimensions] of [['L3',l3],['L4',l4]]){
    const g=geometry(normalize(make(shape,dimensions)));
    assert.equal(g.supplierMappingVerified,false);
    assert.equal(g.joints,null);
    assert.equal(g.shippingParts,null);
    assert.match(g.warnings.join(' '),/Vorschau|keine Fertigungs/);
  }
});
