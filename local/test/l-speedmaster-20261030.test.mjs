import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {lCornerKeys,defaultLCorner} from '../core/l-geometry.mjs';

const base=(shape,overrides={})=>({
  schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',
  material:'APL38',decor:'W980',quantity:1,
  dimensions:shape==='L3'?{L1:'2000',L2:'2000',B1:'600',B2:'600',B3:'900',B4:'900'}
      :shape==='L4'?{L1:'2000',L2:'2000',B1:'900',B2:'900',B3:'1050',B4:'1050',B5:'600'}
      :{L1:'2000',L2:'1200',B1:'600',B2:'600'},
  lCorner:defaultLCorner(shape),...overrides
});
const get=(shape,overrides)=>geometry(normalize(base(shape,overrides)));
test('L1 left and L2 right reflect real Speedmaster B1=leg, B2=top (NOT the earlier swapped sketch)',()=>{
  const a=get('L1'),b=get('L2');
  assert.deepEqual(a.points,[[0,0],[2000,0],[2000,600],[600,600],[600,1200],[0,1200]]);
  assert.deepEqual(b.points,[[0,0],[2000,0],[2000,1200],[1400,1200],[1400,600],[0,600]]);
  assert.equal(a.areaMm2,1560000);assert.equal(b.areaMm2,1560000);
  assert.deepEqual(a.dimensions.map(x=>[x.id,x.mm]),[['L1',2000],['L2',1200],['B1',600],['B2',600]]);
  assert.equal(b.dimensions.find(x=>x.id==='L2').from[0],2000);
  assert.equal(a.previewSeams.length,1);assert.equal(b.previewSeams.length,1);
});
test('L3 shows inside diagonal, L4 additionally outside chamfer; dimensions beyond B1/B2 explicitly unverified',()=>{
  const a=get('L3'),b=get('L4');
  assert.deepEqual(a.points,[[0,0],[2000,0],[2000,600],[900,600],[600,900],[600,2000],[0,2000]]);
  assert.ok(Math.abs(b.points[0][0]-(900+1050-600*Math.SQRT2))<.01);
  assert.deepEqual(b.points.slice(1,7),[[2000,0],[2000,900],[1050,900],[900,1050],[900,2000],[0,2000]]);
  assert.equal(a.previewSeams.length,2);assert.equal(b.previewSeams.length,2);
  for(const shape of [a,b]){assert.match(shape.warnings.join(' '),/Vorschau|nicht geprüft|keine Fertigungs/);assert.equal(shape.supplierMappingVerified,false);}
});
test('exact ten screenshot-visible variants exist for all four L outlines, independent of the straight corner contract',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    let count=0;
    for(const side of ['none','left','right','both'])for(const treatment of (side==='none'?[null]:['round','chamfer_square','chamfer_continuous'])){
      const corner=defaultLCorner(shape,side,treatment);
      const g=get(shape,{lCorner:corner});
      assert.ok(g.areaMm2>0,shape+' '+side+' '+treatment);
      assert.equal(g.joints,null);assert.equal(g.shippingParts,null);assert.equal(g.supplierMappingVerified,false);
      assert.ok(g.path.startsWith('M '));
      if(treatment==='round')assert.match(g.path,/ A 100 100 0 0 1 /);
      if(treatment==='chamfer_square')assert.doesNotMatch(g.path,/ Q /);
      count++;
    }
    assert.equal(count,10);
    assert.deepEqual(lCornerKeys(shape,'both','round'),['R1','R2']);
    assert.deepEqual(lCornerKeys(shape,'left','chamfer_square'),shape==='L1'||shape==='L2'?['L3','B3']:['L5','B5']);
    assert.deepEqual(lCornerKeys(shape,'right','chamfer_continuous'),shape==='L1'||shape==='L2'?['L4','B4']:['L6','B6']);
  }
});
test('manipulated L corners or impossible edges cannot be used for a real order',()=>{
  for(const patch of [
    {lCorner:{side:'left',treatment:'round',parameters:{R2:'100'}}},
    {lCorner:{side:'none',treatment:'round',parameters:{}}},
    {lCorner:{side:'right',treatment:'chamfer_square',parameters:{L4:'100'}}},
    {lCorner:{side:'left',treatment:'round',parameters:{R1:'1001'}}},
    {corner:'round',special:{size:'100'},lCorner:defaultLCorner('L1')}
  ])assert.throws(()=>normalize(base('L1',patch)));
  assert.throws(()=>get('L1',{dimensions:{L1:'1200',L2:'1200',B1:'1200',B2:'600'}}));
  assert.throws(()=>get('L3',{dimensions:{L1:'1000',L2:'900',B1:'600',B2:'600',B3:'900',B4:'900'}}));
  assert.throws(()=>get('L1',{lCorner:{side:'left',treatment:'round',parameters:{R1:'600'}}}));
});
test('L plan and split view stay one contour, preview seams are only illustrative',()=>{
  const shape=get('L1');
  const clean=svg(shape,'B1',{unit:'cm',partsView:false});
  const parts=svg(shape,'B1',{unit:'cm',partsView:true,showDimensions:false});
  assert.match(clean,/B1: 60 cm/);
  assert.match(clean,/class="apl-preview-seam"/);
  assert.match(parts,/class="apl-preview-seam"/);
  assert.doesNotMatch(parts,/class="apl-measure"/);
  assert.ok(!('approved' in shape));
  assert.equal(shape.joints,null);
});
