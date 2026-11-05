import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize} from '../core/config.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';
import {luPriceScenario} from '../private/lu-price-scenarios.mjs';
import {quote} from '../private/pricing.mjs';

const uDims={L1:2000,L2:1200,L3:1800,B1:600,B2:600,B3:600};
function makeU(shape,{dims={},decor='W980',material='APL38',corner='square'}={}){
 return normalize({schemaVersion:2,inputUnit:'mm',product:'u',geometry:shape,decor,material,corner,quantity:1,
  dimensions:Object.fromEntries(Object.entries({...uDims,...dims}).map(([k,v])=>[k,String(v)]))});
}
function makeL(shape='L1',options={}){
 const {side='none',decor='W980',material='APL38',dims={}}=options;
 const values={L1:2000,L2:1200,B1:600,B2:600,...dims};
 return normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',decor,material,quantity:1,
  lCorner:defaultLCorner(shape,side,side==='none'?null:'round'),
  dimensions:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,String(v)]))});
}
test('two explicit 10/60 euro inbound scenarios produce reproducible German gross planning prices',()=>{
 const expected={U1:[154000,164000],U2:[153000,164000],U3:[154000,164000],U4:[154000,164000]};
 for(const [shape,[small,long]] of Object.entries(expected)){
  const c=makeU(shape);
  const a=luPriceScenario(c,{inboundNetCents:1000,otherNetCents:0});
  const b=luPriceScenario(c,{inboundNetCents:6000,otherNetCents:0});
  assert.equal(a.targetGrossScenarioCents,small);
  assert.equal(b.targetGrossScenarioCents,long);
  assert.ok(a.bufferedMarginAtTargetPct>=40);
  assert.ok(b.bufferedMarginAtTargetPct>=40);
  assert.ok(a.minimum35GrossScenarioCents<=a.targetGrossScenarioCents);
  assert.equal(a.assumedInboundNetCents,1000);
  assert.equal(a.reservedCostsPct,10);
  assert.equal(a.purchasable,false);assert.equal(a.approvedCustomerPrice,false);
  assert.equal(quote(c).purchasable,false,'public local quote must remain blocked');
  assert.ok(a.missingProofs.includes('real-inbound-parts-and-cost'));
 }
});
test('new U2-U4 screenshot prices are explicitly net-unverified, even if scenario computed',()=>{
 for(const shape of ['U2','U3','U4']){
  const scenario=luPriceScenario(makeU(shape),{inboundNetCents:6000,otherNetCents:0});
  assert.equal(scenario.isNetSupplierPriceVerified,false);
  assert.match(scenario.priceEvidence,/net-treatment-unverified/);
  assert.ok(scenario.missingProofs.includes('supplier-displayed-price-net-confirmation'));
 }
 const u1=luPriceScenario(makeU('U1'),{inboundNetCents:6000,otherNetCents:0});
 assert.equal(u1.isNetSupplierPriceVerified,true);
 assert.equal(u1.assumedSupplierNetCents,69149);
 assert.equal(u1.minimum35GrossScenarioCents,152000);
});
test('L1 can use historical exact net sample but L2-L4 do not receive invented EKs',()=>{
 const scenario=luPriceScenario(makeL(),{inboundNetCents:6000,otherNetCents:0});
 assert.equal(scenario.assumedSupplierNetCents,46445);
 assert.equal(scenario.targetGrossScenarioCents,115000);
 assert.equal(scenario.isNetSupplierPriceVerified,true);
 assert.equal(luPriceScenario(makeL('L1',{side:'left'}),{inboundNetCents:6000,otherNetCents:0}),null);
 // Only the complete exact L1 reference exists, not a fallback L2 estimate.
 const l2=makeL('L2');
 assert.equal(luPriceScenario(l2,{inboundNetCents:6000,otherNetCents:0}),null);
});
test('every unknown U width, supplier decor and 17.5-mm U2 variant fails closed',()=>{
 for(const shape of ['U2','U3','U4']){
  assert.equal(luPriceScenario(makeU(shape,{dims:{L1:2010}}),{inboundNetCents:1000,otherNetCents:0}),null);
  assert.equal(luPriceScenario(makeU(shape,{material:'APL17.5'}),{inboundNetCents:1000,otherNetCents:0}),null);
  assert.equal(luPriceScenario(makeU(shape,{decor:'H1145'}),{inboundNetCents:1000,otherNetCents:0}),null);
 }
});
test('shipping AND other cost assumptions must both be provided, not silently guessed',()=>{
 const c=makeU('U2');
 for(const args of [{},{inboundNetCents:6000},{otherNetCents:0},
  {inboundNetCents:-1,otherNetCents:0},{inboundNetCents:6000,otherNetCents:-1},
  {inboundNetCents:6000.1,otherNetCents:0}])
  assert.throws(()=>luPriceScenario(c,args),/Scenario must explicitly provide/);
 const a=luPriceScenario(c,{inboundNetCents:6000,otherNetCents:0});
 const b=luPriceScenario(c,{inboundNetCents:6000,otherNetCents:5000});
 assert.ok(b.targetGrossScenarioCents>a.targetGrossScenarioCents);
});
test('private model is never in public WordPress bundle, and price source cannot be supplied by client',()=>{
 const build=readFileSync(new URL('../../build-plugin.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(build,/lu-price-scenarios/);
 const c=makeU('U2');
 c.clientPrice=1;c.supplierNet=1;c.approved=true;
 const q=luPriceScenario(c,{inboundNetCents:1000,otherNetCents:0});
 assert.equal(q.assumedSupplierNetCents,68736);
 assert.equal(q.purchasable,false);
});
