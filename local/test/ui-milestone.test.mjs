import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {referencePrice,quote} from '../private/pricing.mjs';
import {geometry,svg} from '../core/geometry.mjs';
const raw={product:'straight',geometry:'straight',corner:'square',dimensions:{L1:'250',B1:'60'},material:'APL38',decor:'H1145',quantity:1};
test('new Bardolino reference is exact and never generalized to another material, dimension or decor',()=>{
  assert.equal(referencePrice(normalize(raw)).net,'298.96');
  assert.equal(referencePrice(normalize({...raw,decor:'W980'})).net,'290.70');
  assert.equal(referencePrice(normalize({...raw,material:'APL17.5'})),null);
  assert.equal(referencePrice(normalize({...raw,dimensions:{L1:'250',B1:'60.1'}})),null);
});
test('straight reference can show an explicitly conditional sales illustration but remains unpurchasable',()=>{
  const q=quote(normalize(raw));
  assert.equal(q.illustration.gross,'533.89');
  assert.equal(q.illustration.kind,'single-piece-assumption');
  assert.equal(q.purchasable,false);
  assert.equal(q.price,null);
  assert.doesNotMatch(JSON.stringify(q),/298\.96/);
  assert.equal(quote(normalize({...raw,quantity:2})).illustration.gross,'1067.78');
  assert.equal(quote(normalize({...raw,dimensions:{L1:'251',B1:'60'}})).illustration,null);
});
test('drawing options change surface and dimension visibility without changing contours',()=>{
  const g=geometry(normalize(raw));
  const technical=svg(g,'L1',{decor:'H1145',showDimensions:true});
  const plain=svg(g,'',{decor:'W980',showDimensions:false});
  assert.match(technical,/apl-oak/);
  assert.match(technical,/2500 mm/);
  assert.doesNotMatch(plain,/L1: 2500 mm/);
  assert.match(plain,/apl-surface/);
  assert.ok(plain.includes(g.path));
});
