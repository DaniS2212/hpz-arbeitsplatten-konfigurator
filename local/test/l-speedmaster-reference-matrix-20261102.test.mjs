/**
 * Screenshot-grounded outside-corner fixtures supplied 02.11.2026.
 * Intentionally unequal values to detect axis swaps.
 * No manufacturing/CNC/price authorization.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';

const cases=[
 {name:'L1',dimensions:{L1:2000,L2:1200,B1:600,B2:600},
  edits:{L3:120,B3:240,L4:120,B4:240},
  expected:{left:{vertex:[600,1200],from:[600,1080],to:[360,1200]},
   right:{vertex:[2000,600],from:[2000,360],to:[1880,600]}}},
 {name:'L2',dimensions:{L1:2000,L2:1200,B1:600,B2:600},
  edits:{L3:240,B3:120,L4:120,B4:240},
  expected:{left:{vertex:[0,600],from:[240,600],to:[0,480]},
   right:{vertex:[2000,1200],from:[2000,1080],to:[1760,1200]}}},
 {name:'L3',dimensions:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
  edits:{L5:120,B5:400,L6:150,B6:150},
  expected:{left:{vertex:[600,2000],from:[600,1880],to:[200,2000]},
   right:{vertex:[2000,600],from:[2000,450],to:[1850,600]}}},
 {name:'L4',dimensions:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900,B5:600},
  edits:{L5:150,B5:150,L6:120,B6:240},
  expected:{left:{vertex:[600,2000],from:[600,1850],to:[450,2000]},
   right:{vertex:[2000,600],from:[2000,360],to:[1880,600]}}}
];
const make=(fixture,treatment='chamfer_square')=>{
 const lCorner=defaultLCorner(fixture.name,'both',treatment);
 Object.assign(lCorner.parameters,Object.fromEntries(Object.entries(fixture.edits).map(([k,v])=>[k,String(v)])));
 return normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:fixture.name,
  corner:'square',material:'APL38',decor:'W980',quantity:1,
  dimensions:Object.fromEntries(Object.entries(fixture.dimensions).map(([k,v])=>[k,String(v)])),lCorner});
};
test('Speedmaster 2026-11-02: both end cuts follow the actual physical legs for all L1–L4',()=>{
 for(const f of cases)for(const treatment of ['chamfer_square','chamfer_continuous']){
   const g=geometry(make(f,treatment));
   for(const side of ['left','right']){
    const m=g.contourMarkers.find(m=>m.side===side),exp=f.expected[side];
    assert.ok(m,f.name+' '+side+' missing');
    for(const key of ['vertex','from','to'])assert.deepEqual(m[key],exp[key],f.name+' '+side+' '+key);
    const matching=g.cornerDimensions.filter(d=>d.side===side);
    assert.equal(matching.length,2);
    for(const d of matching) assert.equal(Math.hypot(d.from[0]-d.to[0],d.from[1]-d.to[1]),d.mm);
   }
   assert.equal(g.joints,null); assert.equal(g.supplierMappingVerified,false); assert.equal(g.shippingParts,null);
 }
});
test('a 60 mm B3 cut labels its actual short measure, without clamping into another region',()=>{
 const f={...cases[0],dimensions:{L1:2500,L2:1700,B1:300,B2:600},edits:{L3:120,B3:60,L4:120,B4:240}};
 const g=geometry(make(f)),d=g.cornerDimensions.find(d=>d.id==='corner-B3');
 const html=svg(g,'corner-B3',{unit:'cm'});
 const match=html.slice(html.indexOf('data-field="corner-B3"')).match(/class="apl-measure-label"[^>]*translate\(([-\d.]+) ([-\d.]+)\)/);
 assert.ok(match,'B3 label exists');
 const x=Number(match[1]),mid=(d.from[0]+d.to[0])/2;
 assert.ok(Math.abs(x-mid)<.001,'B3 label '+x+' must follow its actual dimension midpoint '+mid);
});
test('L4 B5 diagonal distance text is placed outside wood rather than opaque on the surface',()=>{
 const g=geometry(make(cases[3])),picture=svg(g,'B5',{unit:'cm'});
 const text=picture.slice(picture.indexOf('data-field="B5"'));
 const match=text.match(/class="apl-measure-label"[^>]*translate\(([-\d.]+) ([-\d.]+)\)/);
 assert.ok(match);
 const x=Number(match[1]),y=Number(match[2]),outer=g.points[0][0];
 assert.ok(x+y<outer-100,'B5 callout at '+x+','+y+' must be in empty region, outside outer diagonal '+outer);
 assert.ok(y<0,'B5 label must remain above the visible worktop, not cover wood');
});
test('continuous-front chamfers use straight main diagonals plus subtle illustration-only transition blends',()=>{
 for(const f of cases){
  const g=geometry(make(f,'chamfer_continuous')),image=svg(g,'',{unit:'cm'});
  assert.doesNotMatch(g.path,/\bQ\b/,'logical outline always keeps its true straight chamfer');
  assert.equal(g.softIndices?.length,4,f.name+' needs two softly blended joins for each of two cuts');
  const surface=image.match(/class="apl-surface" d="([^"]+)"/)?.[1];
  assert.ok(surface,f.name+' SVG surface');
  assert.equal((surface.match(/\bQ\b/g)||[]).length,4,'two short smooth joins per cut, never one giant round');
  assert.ok((surface.match(/\bL\b/g)||[]).length>=4,'long straight diagonals remain');
  assert.match(g.warnings.join(' '),/Übergang|schematisch|Vorschau/);
 }
});
test('square-edge chamfers never gain rounded presentation joins',()=>{
 for(const f of cases){
  const g=geometry(make(f)),picture=svg(g,'',{unit:'cm'});
  assert.equal(g.softIndices?.length??0,0);
  assert.doesNotMatch(picture.match(/class="apl-surface" d="([^"]+)"/)?.[1]??'',/\bQ\b/);
 }
});
