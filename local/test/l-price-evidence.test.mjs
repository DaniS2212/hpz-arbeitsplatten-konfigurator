/**
 * Provisional L-price evidence, NEVER the public WooCommerce calculator.
 * Exact supplier EK observations only: no interpolation to L2/L3/L4.
 * Candidate gross values are controlled hypothetical budgeting scenarios.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize} from '../core/config.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';
import {L_COST_WITNESSES,matchLReference,simulateLPriceScenario} from '../private/l-price-evidence.mjs';
import {quote} from '../private/pricing.mjs';

const fixture=(shape='L1',l1=2000,material='APL38',decor='W980',side='none')=>{
 const dimensions=shape==='L1'||shape==='L2'?{L1:l1,L2:1200,B1:600,B2:600}
  :shape==='L3'?{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900}
  :{L1:2000,L2:2000,B1:900,B2:900,B3:1050,B4:1050,B5:600};
 return normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,
  dimensions:Object.fromEntries(Object.entries(dimensions).map(([k,v])=>[k,String(v)])),
  corner:'square',material,decor,quantity:1,
  lCorner:defaultLCorner(shape,side,side==='none'?null:'chamfer_square')});
};
const known=[
 ['l1_200_120_175',2000,'APL17.5',30767],
 ['l1_200_120_38',2000,'APL38',46445],
 ['l1_250_120_175',2500,'APL17.5',34241],
 ['l1_250_120_38',2500,'APL38',51156]
];

test('all four L1 net EK witnesses match the original 1.5 mm edge evidence, exactly in cents',()=>{
 const csv=readFileSync(new URL('../../docs/price-reference-cases.csv',import.meta.url),'utf8');
 assert.equal(L_COST_WITNESSES.length,4);
 for(const [id,length,material,cents] of known){
  const row=csv.split(/\r?\n/).find(line=>line.startsWith(id+','));
  assert.ok(row,'missing original source '+id);
  const columns=row.split(',');
  assert.equal(columns[1],'L1');
  assert.equal(columns[2],String(length));
  assert.equal(columns[3],'1200');
  assert.equal(columns[5],'600');
  assert.equal(columns[6],'600');
  assert.equal(columns[8],material);
  assert.match(columns[9],/^W980/);
  assert.equal(columns[10],'1.5');
  assert.equal(Math.round(Number(columns[11])*100),cents);
  const match=matchLReference(fixture('L1',length,material));
  assert.equal(match?.referenceId,id);
  assert.equal(match?.supplierNetCents,cents);
  assert.equal(match?.source,'docs/price-reference-cases.csv');
 }
});
test('L1 EK 464.45 is not applicable when one regular outer edge, corner, decor or dimension changes',()=>{
 const base=fixture();
 for(const variant of [
   {...base,edge:'missing-right-edge'},
   {...base,dimensions:{...base.dimensions,B1:601}},
   fixture('L1',2000,'APL38','F235'),
   fixture('L1',2000,'APL38','W980','left'),
   fixture('L1',2001,'APL38'),
   fixture('L1',2500,'APL17.5','H1145')
 ])assert.equal(matchLReference(variant),null);
});
test('unverified L2–L4 never silently copy the L1 cost or price rule',()=>{
 for(const shape of ['L2','L3','L4']){
  assert.equal(matchLReference(fixture(shape)),null,shape);
  assert.equal(quote(fixture(shape)).price,null);
  assert.equal(quote(fixture(shape)).purchasable,false);
 }
});
test('scenario-only target 40% gross model uses exact cents, 10 EUR ceiling and explicit unverified inbound costs',()=>{
 const samples=[
  [2000,'APL17.5',81000],
  [2000,'APL38',115000],
  [2500,'APL17.5',88000],
  [2500,'APL38',125000]
 ];
 for(const [length,material,wantGross] of samples){
  const result=simulateLPriceScenario(fixture('L1',length,material),{assumedInboundNetCents:6000});
  assert.equal(result.status,'scenario-only');
  assert.equal(result.unitGrossCents,wantGross);
  assert.equal(result.assumedInboundNetCents,6000);
  assert.equal(result.manufacturingReady,false);
  assert.equal(result.shippingPartsVerified,false);
  assert.equal(result.pricingReady,false);
  assert.equal(result.purchasable,false);
  assert.equal(result.currency,'EUR');
  assert.equal(result.taxMode,'DE-19-percent-simulation-only');
 }
});
test('quantity is multiplied after rounding per unit; unverified dimensions produce no scenario gross',()=>{
 const two={...fixture(),quantity:2};
 const priced=simulateLPriceScenario(two,{assumedInboundNetCents:6000});
 assert.equal(priced.unitGrossCents,115000);
 assert.equal(priced.totalGrossCents,230000);
 const missing=simulateLPriceScenario(fixture('L3'),{assumedInboundNetCents:6000});
 assert.equal(missing.status,'blocked');
 assert.equal(missing.unitGrossCents,null);
 assert.equal(missing.totalGrossCents,null);
 assert.equal(missing.purchasable,false);
});
test('scenario data cannot inject fake costs, actual shipping parts or fake sale approval',()=>{
 for(const amount of [-1,1.5,NaN,Infinity,'6000',null,1e12]){
  assert.throws(()=>simulateLPriceScenario(fixture(),{assumedInboundNetCents:amount}),/Annahme|Kosten|Betrag|Euro|netto/i);
 }
 assert.equal(quote(fixture()).purchasable,false);
 assert.equal(quote(fixture()).price,null);
 assert.doesNotMatch(JSON.stringify(quote(fixture())),/464\.45|supplierNetCents|assumedInbound/);
});
