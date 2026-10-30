import { test } from 'node:test';
import assert from 'node:assert/strict';
import { familyDimensionGroups } from '../core/family-presentation.mjs';

test('L form presents upper and left lengths with their sketch dimensions',()=>{
  const groups=familyDimensionGroups('l');
  assert.deepEqual(groups.map(g=>[g.id,g.title,g.fields.map(f=>f.id)]),[
    ['top','Obere Strecke',['L1','B1']],
    ['left','Linker Schenkel',['L2','B2']],
  ]);
});
test('U form adds the right leg and covers each of six sketch dimensions once',()=>{
  const groups=familyDimensionGroups('u');
  assert.deepEqual(groups.map(g=>g.fields.map(f=>f.id)),[['L1','B1'],['L2','B2'],['L3','B3']]);
  assert.equal(new Set(groups.flatMap(g=>g.fields.map(f=>f.id))).size,6);
});
test('presentation does not imply supplier variant approval or manufacturing joint mapping',()=>{
  for(const family of ['l','u']){
    const groups=familyDimensionGroups(family);
    assert.ok(groups.every(g=>g.description.length>8));
    assert.ok(groups.flatMap(g=>g.fields).every(f=>f.label.length>4));
    assert.ok(groups.every(g=>!('joints' in g)&&!('speedmasterVariant' in g)&&!('supplierVerified' in g)));
  }
});
test('unsupported family cannot silently inherit a sketch',()=>{
  assert.throws(()=>familyDimensionGroups('straight'),/L-U/);
  assert.throws(()=>familyDimensionGroups('z'),/L-U/);
});
