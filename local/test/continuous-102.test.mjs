import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {cornerLimits} from '../core/straight-corners.mjs';
import {geometry,svg} from '../core/geometry.mjs';
const build=(l,b,side='both',treatment='chamfer_continuous',p={L2:'150',B2:'150',L3:'200',B3:'200'},material='APL38')=>({
 schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',material,decor:'W980',quantity:1,
 dimensions:{L1:String(l),B1:String(b)},
 straightCorner:{side,treatment,parameters:side==='none'?{}:side==='left'?{L2:p.L2,B2:p.B2}:side==='right'?{L3:p.L3,B3:p.B3}:p}
});
test('250x80 cm both continuous corners draw real measures without fixed-size block',()=>{
 const c=normalize(build(2500,800)),g=geometry(c);
 assert.equal(g.width,2500);assert.equal(g.height,800);assert.equal(g.contourStatus,'schematic');
 assert.equal(g.cornerCuts.length,2);assert.match(svg(g,'L2',{unit:'cm'}),/L2: 15 cm/);
 assert.match(svg(g,'L3',{unit:'cm'}),/L3: 20 cm/);
 assert.ok(!g.warnings.some(s=>/2000 × 600/.test(s)));
});
test('continuous bounds obey supplier cap with margin and clear straight front',()=>{
 for(const [l,b] of [[1000,300],[1200,400],[2000,600],[2500,800],[3500,900],[4000,900]])
   assert.doesNotThrow(()=>normalize(build(l,b)));
 for(const [l,b] of [[999,600],[4001,600],[2500,299],[2500,901]])
   assert.throws(()=>normalize(build(l,b)));
 const limits=cornerLimits('both','chamfer_continuous',{L1:2500,B1:800},{L2:1500,B2:500,L3:500,B3:300});
 assert.equal(limits.fields.L2.max,1800);
 assert.equal(limits.fields.B2.max,500);
 assert.doesNotThrow(()=>normalize(build(2500,800,'both','chamfer_continuous',{L2:'1500',B2:'500',L3:'500',B3:'300'})));
 for(const p of [
  {L2:'1810',B2:'150',L3:'200',B3:'150'},
  {L2:'150',B2:'510',L3:'200',B3:'150'},
  {L2:'1800',B2:'150',L3:'650',B3:'150'}
 ])assert.throws(()=>normalize(build(2500,800,'both','chamfer_continuous',p)));
});
test('historic 17.5 mm plate without continuous cut can still reach 120 cm',()=>{
 assert.doesNotThrow(()=>normalize(build(2500,1200,'none',null,{},'APL17.5')));
 assert.throws(()=>normalize(build(2500,1200,'both','chamfer_continuous',undefined,'APL17.5')));
 assert.throws(()=>normalize(build(2500,901,'none',null,{},'APL38')));
});
