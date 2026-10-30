import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cmToMm, normalize, catalog } from '../core/config.mjs';
import { geometry, svg } from '../core/geometry.mjs';
import { lDefaultDimensions } from '../core/l-geometry.mjs';
import { referencePrice, calculate, widthTier, quote } from '../private/pricing.mjs';

const input = (overrides = {}) => ({ product: 'straight', geometry: 'straight', corner: 'square',
  dimensions: { L1: '200', B1: '70' }, material: 'APL17.5', decor: 'W980', quantity: 1, ...overrides });

test('decimal comma and point produce exact integer millimetres', () => {
  for (const value of ['88,1','88.1']) assert.equal(cmToMm(value),881);
  assert.equal(cmToMm('0.1'),1);
});
test('invalid precision, types and numeric formats are rejected rather than rounded', () => {
  for (const value of ['88.11', '1e2', '-1', '0', '', 'Infinity', 'NaN', '1 000', '1000000000', [], {}, null, 88.1])
    assert.throws(() => cmToMm(value));
});
test('normalization ignores client prices and approval flags, but rejects wrong family and dimensions', () => {
  const a = normalize(input({ price: 0, approved: true }));
  assert.deepEqual(a, normalize(input()));
  assert.equal(a.dimensions.L1,2000);
  assert.throws(() => normalize(input({ geometry: 'U1' })));
  assert.throws(() => normalize(input({ product: '999985' })));
  assert.throws(() => normalize(input({ dimensions: { L1:'200', B1:'70', L2:'120' } })));
  assert.throws(() => normalize(input({ dimensions: { L1:'200' } })));
  for (const quantity of [0,-1,1.5,Infinity,1001,'2']) assert.throws(() => normalize(input({quantity})));
});
test('unsupported material, decor, edge or corner cannot silently fall back', () => {
  for (const change of [{material:'Compact'}, {decor:'UNKNOWN'}, {edge:'postforming'}, {corner:'unknown'}])
    assert.throws(() => normalize(input(change)));
});
test('all nine named geometries remain represented without invented supplier approval', () => {
  const c = catalog();
  assert.deepEqual(c.geometries.map(g=>g.id),['straight','L1','L2','L3','L4','U1','U2','U3','U4']);
  for (const g of c.geometries) assert.notEqual(g.status,'approved');
});
test('straight contour, dimensions, area and all four matching edges derive from the same mm data', () => {
  const g = geometry(normalize(input()));
  assert.deepEqual(g.points,[[0,0],[2000,0],[2000,700],[0,700]]);
  assert.equal(g.areaMm2,1400000);
  assert.equal(g.edges.length,4);
  assert.ok(g.edges.every(e=>e.finish==='matching-1.5'));
  assert.equal(g.dimensions.find(d=>d.id==='L1').mm,2000);
  assert.equal(g.shippingParts,null);
});
test('L1/U legacy family sketches remain available without inventing supplier joints or parts', () => {
  const l = geometry(normalize(input({product:'l', geometry:'L1', dimensions:{L1:'250',L2:'170',B1:'70',B2:'60'}})));
  assert.equal(l.areaMm2,2350000);
  assert.equal(l.points.length,6);
  const u = geometry(normalize(input({product:'u',geometry:'U2',dimensions:{L1:'250',L2:'170',L3:'180',B1:'70',B2:'60',B3:'60'}})));
  assert.equal(u.areaMm2,3010000);
  assert.equal(u.points.length,8);
  assert.equal(u.shippingParts,null);
  assert.equal(u.joints,null);
  assert.equal(u.supplierMappingVerified,false);
});
test('impossible inner clearance and overflowing corner treatments are rejected', () => {
  assert.throws(()=>geometry(normalize(input({product:'u',geometry:'U1',dimensions:{L1:'120',L2:'170',L3:'180',B1:'60',B2:'60',B3:'60'}}))));
  assert.throws(()=>geometry(normalize(input({product:'l',geometry:'L1',dimensions:{L1:'200',L2:'60',B1:'60',B2:'60'}}))));
  assert.throws(()=>geometry(normalize(input({corner:'round',special:{size:'71'}}))));
  assert.throws(()=>normalize(input({corner:'round'})));
});
test('round and chamfer preview remove the correct area; unverified treatment never becomes supplier geometry', () => {
  const chamfer = geometry(normalize(input({corner:'chamfer',special:{size:'10'}})));
  assert.equal(chamfer.areaMm2,1395000);
  const round = geometry(normalize(input({corner:'round',special:{size:'10'}})));
  assert.ok(Math.abs(round.areaMm2-1397853.9816339745)<0.000001);
  assert.match(round.path,/ A /);
  assert.equal(round.supplierMappingVerified,false);
});
test('corner edge descriptors terminate at actual tangent points instead of the removed corner',()=>{
  for(const corner of ['round','chamfer']) {
    const g=geometry(normalize(input({corner,special:{size:'10'}})));
    assert.deepEqual(g.points,[[100,0],[2000,0],[2000,700],[0,700],[0,100]]);
    assert.equal(g.edges.length,5);
    assert.equal(g.edges.at(-1).kind,corner==='round'?'arc':'line');
    if(corner==='round')assert.equal(g.edges.at(-1).radiusMm,100);
  }
});
test('every named variant and material renders, with unverified status and no invented joints',()=>{
  for(const [product,family] of Object.entries(catalog().families)) for(const id of family.geometries)
    for(const material of ['APL17.5','APL38']) for(const corner of ['square','continuous','round','chamfer']) {
      const values={L1:'250',L2:'170',L3:'180',B1:'70',B2:'60',B3:'60'};
      const config=normalize(input({product,geometry:id,material,corner,
        dimensions:product==='l'&&['L3','L4'].includes(id)?{...lDefaultDimensions(id),L1:'250',L2:'170'}:Object.fromEntries(family.fields.map(k=>[k,values[k]])),
        ...(['round','chamfer'].includes(corner)?{special:{size:'10'}}:{})}));
      const g=geometry(config);
      assert.ok(g.areaMm2>0);
      assert.equal(g.supplierMappingVerified,false);
      assert.equal(g.joints,null);
      assert.match(svg(g),/2500 mm/);
      assert.equal(quote(config).purchasable,false);
    }
});
test('SVG dimensions change with input, active measure is highlighted and untrusted labels are escaped', () => {
  const g = geometry(normalize(input()));
  const drawing = svg(g,'L1');
  assert.match(drawing,/L1: 2000 mm/);
  assert.match(drawing,/aria-label=/);
  assert.match(drawing,/data-active="true"/);
  assert.match(svg(geometry(normalize(input({dimensions:{L1:'200.1',B1:'70'}})))) ,/2001 mm/);
  assert.doesNotMatch(svg({...g,title:'<script>alert(1)</script>'}),/<script>/);
});

const refs = [
 ['straight',[200,60],'APL17.5','144.99'],['straight',[200,60],'APL38','243.11'],['straight',[200,70],'APL17.5','165.80'],
 ['L1',[200,120,60,60],'APL17.5','307.67'],['L1',[200,120,60,60],'APL38','464.45'],
 ['L1',[250,120,60,60],'APL17.5','342.41'],['L1',[250,120,60,60],'APL38','511.56'],
 ['U1',[200,120,180,60,60,60],'APL17.5','459.29'],['U1',[200,120,180,60,60,60],'APL38','691.49'],
 ['U1',[250,120,180,60,60,60],'APL17.5','494.03'],['U1',[250,120,180,60,60,60],'APL38','738.59'],
 ['U1',[250,170,180,60,60,60],'APL17.5','528.76'],['U1',[250,170,180,70,60,60],'APL17.5','539.90'],
 ['U1',[250,170,180,60,60,60],'APL38','785.69'],['U1',[250,170,180,70,60,60],'APL38','767.12']
];
for (const [id,values,material,expected] of refs) test(`supplier reference ${id}/${material}/${values}`,()=>{
  const fields = id==='straight'?['L1','B1']:id==='L1'?['L1','L2','B1','B2']:['L1','L2','L3','B1','B2','B3'];
  const c=normalize(input({product:id==='straight'?'straight':id[0]==='L'?'l':'u',geometry:id,material,dimensions:Object.fromEntries(fields.map((k,i)=>[k,String(values[i])]))}));
  assert.equal(referencePrice(c).net,expected);
});
test('unknown adjacent prices, corners and tier ranges are not interpolated',()=>{
  assert.equal(referencePrice(normalize(input({dimensions:{L1:'200.1',B1:'70'}}))),null);
  assert.equal(referencePrice(normalize(input({corner:'chamfer',special:{size:'10'}}))),null);
  for(const length of ['250.9','251','251.1']) assert.equal(referencePrice(normalize(input({dimensions:{L1:length,B1:'70'}}))),null);
});
test('APL38 tier changes at 881 mm, not 880 or 900',()=>{
  for (const [width,tier] of [[879,'normal'],[880,'normal'],[881,'large'],[882,'large']]) assert.equal(widthTier(width),tier);
});
test('exact markup excludes inbound costs, retains four decimals and calculates quantity before rounding',()=>{
  assert.deepEqual(calculate('144.99',[2000],1),{unitNet:'248.4870',totalNet:'248.4870',inboundTotal:'60.00',deGrossIllustration:'295.70'});
  assert.deepEqual(calculate('165.80',[2000],2),{unitNet:'275.5400',totalNet:'551.0800',inboundTotal:'120.00',deGrossIllustration:'655.79'});
});
test('inbound surcharge uses actual individual shipping parts, once per unit',()=>{
  for (const [parts,amount] of [[[1899],'10.00'],[[1900],'60.00'],[[1901],'60.00'],[[2000,2200],'60.00'],[[1200,1200],'10.00']])
    assert.equal(calculate('100.00',parts,1).inboundTotal,amount);
  for (const parts of [null,[],[0],[-1],[Infinity],[1900.5]]) assert.throws(()=>calculate('100.00',parts,1));
});
test('pricing rejects invalid money and quantities',()=>{
  for(const price of ['-1.00','NaN','1e3','100.001','0.00',100]) assert.throws(()=>calculate(price,[2000],1));
  for(const qty of [0,-1,1.5,1001]) assert.throws(()=>calculate('100.00',[2000],qty));
});
test('public quote never exposes supplier cost or makes incomplete cases purchasable',()=>{
  const q=quote(normalize(input()));
  assert.equal(q.purchasable,false);
  assert.equal(q.price,null);
  assert.ok(q.blockers.includes('shipping-parts-unverified'));
  assert.ok(q.blockers.includes('weight-unverified'));
  assert.doesNotMatch(JSON.stringify(q),/165\.80|supplierNet|inboundTotal/);
});
