import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner,lCornerKeys,lDefaultDimensions} from '../core/l-geometry.mjs';

const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const mm=s=>String(Number(s)*10);
function plate(shape,side='none',treatment=null) {
  const dims=lDefaultDimensions(shape);
  const conf={schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',
    material:'APL38',decor:'W980',quantity:1,
    dimensions:Object.fromEntries(Object.entries(dims).map(([k,v])=>[k,mm(v)])),
    lCorner:defaultLCorner(shape,side,treatment)};
  return {config:normalize(conf),geometry:geometry(normalize(conf))};
}

test('every L1-L4 basic dimension has a true-length reference segment',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    const {geometry:g}=plate(shape);
    for(const d of g.dimensions){
      assert.ok(Math.abs(dist(d.from,d.to)-d.mm)<.01,
        shape+' '+d.label+' / '+d.id+': displayed '+d.mm+' mm, segment '+dist(d.from,d.to)+' mm');
    }
    assert.equal(g.supplierMappingVerified,false);
    assert.equal(g.joints,null);
    assert.equal(g.shippingParts,null);
  }
});

test('L3 and L4 show B3 horizontal and B4 vertical construction dimensions only on focus',()=>{
  for(const shape of ['L3','L4']){
    const g=plate(shape).geometry;
    const pair=g.dimensions.filter(d=>d.focusKey==='B3');
    assert.equal(pair.length,2,shape+' needs both the B3 and B4 axes');
    assert.deepEqual(pair.map(d=>d.label),['B3','B4']);
    assert.deepEqual(pair.map(d=>d.axis),['horizontal','vertical']);
    for(const d of pair){
      assert.equal(d.secondary,true);
      assert.equal(d.referenceOutside,true,'dimension rail must not cut across plate surface');
      assert.ok(Math.abs(dist(d.from,d.to)-d.mm)<.01);
    }
    const focused=svg(g,'B3',{unit:'cm'});
    assert.match(focused,/data-field="B3" data-active="true"/);
    assert.match(focused,/B3: (90|105) cm/);
    assert.match(focused,/B4: (90|105) cm/);
    const other=svg(g,'L1',{unit:'cm'});
    assert.doesNotMatch(other,/class="apl-measure" data-field="B3"/);
  }
});

test('L4 B5 dimension measures the actual separation of parallel diagonals',()=>{
  const g=plate('L4').geometry,d=g.dimensions.find(m=>m.id==='B5');
  assert.ok(d);
  assert.ok(Math.abs(dist(d.from,d.to)-d.mm)<.01);
  const outer=g.points[0][0]+g.points[0][1];
  const inner=g.points[3][0]+g.points[3][1];
  assert.ok(Math.abs(d.from[0]+d.from[1]-outer)<.01,'start on outer 45-degree diagonal');
  assert.ok(Math.abs(d.to[0]+d.to[1]-inner)<.01,'end on inner 45-degree diagonal');
});

test('all L chamfers have exact L/B callouts like straight; fields remain isolated from L4 B5',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    for(const side of ['left','right','both']){
      for(const treatment of ['chamfer_square','chamfer_continuous']){
        const g=plate(shape,side,treatment).geometry;
        const keys=lCornerKeys(shape,side,treatment);
        assert.equal(g.cornerDimensions.length,keys.length,shape+' '+side+' '+treatment);
        assert.equal(g.cornerCuts.length,side==='both'?2:1);
        for(const key of keys){
          const d=g.cornerDimensions.find(d=>d.id==='corner-'+key);
          assert.ok(d,shape+' '+side+' missing '+key);
          assert.equal(d.label,key);
          assert.ok(Math.abs(dist(d.from,d.to)-d.mm)<.01);
          assert.equal(d.axis,key.startsWith('L')?'horizontal':'vertical');
          const drawing=svg(g,'corner-'+key,{unit:'cm'});
          assert.match(drawing,new RegExp('data-field="corner-'+key+'" data-active="true"'));
          assert.match(drawing,new RegExp(key+': 15 cm'));
        }
        if(shape==='L4'){
          assert.ok(g.dimensions.some(d=>d.id==='B5'),'B5 base remains independently measurable');
          assert.ok(g.cornerDimensions.some(d=>d.id==='corner-B5') || side==='right');
        }
      }
    }
  }
});

test('all L rounded outer corners show a radius dimension and real circular arc',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    for(const side of ['left','right','both']){
      const g=plate(shape,side,'round').geometry;
      const keys=lCornerKeys(shape,side,'round');
      assert.equal(g.cornerArcs.length,keys.length);
      assert.equal(g.cornerCuts.length,0);
      for(const key of keys){
        const a=g.cornerArcs.find(x=>x.id==='corner-'+key);
        assert.ok(a);
        assert.equal(a.radiusMm,100);
        assert.match(g.path,/ A 100 100 0 0 1 /);
        assert.match(svg(g,'corner-'+key,{unit:'cm'}),new RegExp('data-field="corner-'+key+'" data-active="true"'));
      }
    }
  }
});
