import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {straightCorners,straightCorner} from '../core/straight-corners.mjs';
import {quote} from '../private/pricing.mjs';
const input=(side='left',parameters={R1:'10'},treatment='round',dimensions={L1:'200',B1:'60'})=>({product:'straight',geometry:'straight',corner:'square',material:'APL38',decor:'W980',dimensions,straightCorner:{side,treatment:side==='none'?null:treatment,parameters}});
test('A1 registry has exactly ten distinct variants; chamfer types remain distinct and closed',()=>{
 assert.equal(straightCorners.length,10);assert.equal(new Set(straightCorners.map(v=>v.id)).size,10);
 for(const v of straightCorners){assert.equal(straightCorner(v.side,v.treatment).id,v.id);if(v.treatment?.startsWith('chamfer'))assert.throws(()=>normalize(input(v.side,{},v.treatment)),/Kontur/);}
});
test('front-left radius is a real bottom-left quarter circle and preserves front at bottom',()=>{
 const g=geometry(normalize(input()));
 assert.match(g.path,/A 100 100 0 0 1 0 500/);
 assert.equal(g.cornerArcs[0].id,'R1');assert.deepEqual(g.cornerArcs[0].center,[100,500]);
 assert.deepEqual(g.front,{from:[100,600],to:[2000,600]});
 assert.ok(Math.abs(g.areaMm2-(1200000-10000*(1-Math.PI/4)))<1e-8);
});
test('right radius mirrors left without changing area or front/back orientation',()=>{
 const l=geometry(normalize(input())),r=geometry(normalize(input('right',{R2:'10'})));
 assert.equal(l.areaMm2,r.areaMm2);assert.match(r.path,/A 100 100 0 0 1 1900 600/);
 assert.deepEqual(r.cornerArcs[0].center,[1900,500]);assert.equal(r.cornerArcs[0].id,'R2');
});
test('both radii are independent and remain exact to one millimetre',()=>{
 const g=geometry(normalize(input('both',{R1:'10,1',R2:'20,2'})));
 assert.deepEqual(g.cornerArcs.map(a=>a.radiusMm),[101,202]);assert.deepEqual(g.front,{from:[101,600],to:[1798,600]});
 assert.equal(g.edges.filter(e=>e.kind==='arc').length,2);
 assert.notEqual(g.path,geometry(normalize(input('both',{R1:'10,2',R2:'20,2'}))).path);
});
test('only relevant radius fields accepted; stale, mixed and supplier flags rejected',()=>{
 for(const data of [input('none',{R1:'10'}),input('left',{R2:'10'}),input('both',{R1:'10'}),input('left',{R1:'10.01'}),input('left',{R1:'10',L2:'20'})])assert.throws(()=>normalize(data));
 assert.throws(()=>normalize({...input(),straightCorner:{...input().straightCorner,approved:true}}));
 assert.equal(normalize(input('none',{})).straightCorner.id,'none');
});
test('observed left 2000x600 radius bounds enforced without generalising supplier limits',()=>{
 for(const r of ['5','59.9'])assert.doesNotThrow(()=>geometry(normalize(input('left',{R1:r}))));
 for(const r of ['4.9','60'])assert.throws(()=>geometry(normalize(input('left',{R1:r}))));
 const other=geometry(normalize(input('left',{R1:'4.9'},'round',{L1:'210',B1:'60'})));
 assert.equal(other.supplierMappingVerified,false);assert.ok(other.warnings.some(w=>w.includes('Grenzen')));
});
test('mathematical collisions and zero radii blocked for all dimensions',()=>{
 for(const data of [input('both',{R1:'50',R2:'50'},'round',{L1:'90',B1:'60'}),input('right',{R2:'0'}),input('right',{R2:'60'})])assert.throws(()=>geometry(normalize(data)));
});
test('SVG labels independent radii, highlights active arc, and marks front',()=>{
 const g=geometry(normalize(input('both',{R1:'10',R2:'20'})));
 const markup=svg(g,'R2');assert.match(markup,/Vorderkante/);assert.match(markup,/R1: 100 mm/);assert.match(markup,/R2: 200 mm/);assert.match(markup,/data-corner="R2" data-active="true"/);
 assert.doesNotMatch(svg(g,'R2',{showDimensions:false}),/R1: 100 mm/);
});
test('new round configurations cannot inherit a base rectangle price example',()=>{
 const q=quote(normalize(input()));assert.equal(q.referenceMatched,false);assert.equal(q.illustration,null);assert.equal(q.purchasable,false);
});
