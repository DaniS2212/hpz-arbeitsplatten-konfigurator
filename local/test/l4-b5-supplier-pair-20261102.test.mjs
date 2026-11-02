/**
 * L4 outside diagonal reference from the user's 2026-11-02 Speedmaster
 * screenshots. Two independent unedited manufacturer views, ALL base
 * measures identical except B5 = 600 / 300 mm, no exterior corner cuts:
 *
 *   image(20261102-144509).png: outer chord ~655 mm, 600 mm B5.
 *   image(20261102-144533).png: outer chord ~894 mm, 300 mm B5.
 *
 * Expected mathematical preview corners are ~651.47 and 900.00 mm.
 * These are screenshot-matched customer outline assertions only,
 * NOT supplier/CNC machining, transport, seam or pricing approval.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';

function l4(b5){
  return normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:'L4',corner:'square',
    material:'APL38',decor:'W980',quantity:1,
    dimensions:{L1:'2000',L2:'2000',B1:'600',B2:'600',B3:'900',B4:'900',B5:String(b5)},
    lCorner:defaultLCorner('L4','none',null)
  });
}
const approx=(actual,expected,tolerance=1)=>
  assert.ok(Math.abs(actual-expected)<=tolerance,
    'expected '+expected+' ±'+tolerance+', got '+actual);

test('two user-supplied Speedmaster views constrain L4 B5 outside diagonal at 600/300',()=>{
 const far=geometry(l4(600)),near=geometry(l4(300));
 assert.equal(far.points.length,8);
 assert.equal(near.points.length,8);
 approx(far.points[0][0],651.47);
 approx(far.points[7][1],651.47);
 approx(near.points[0][0],900);
 approx(near.points[7][1],900);
 // Supplier photos independently corroborate approximate pixel extents:
 // ~655 mm and ~894 mm using the unchanged 600 mm left leg as scale.
 approx(far.points[0][0],655,10);
 approx(near.points[0][0],894,10);
 // The internal diagonal and full extents do not move with B5.
 assert.deepEqual(near.points.slice(1,7),far.points.slice(1,7));
 assert.deepEqual(near.points.slice(3,5),[[900,600],[600,900]]);
 assert.ok(near.points[0][0]<=900&&near.points[7][1]<=900);
});
test('B5 300 to 600 changes only outer edge, never presents a made-up joint or piece count',()=>{
 for(const b5 of [300,450,600]){
  const g=geometry(l4(b5));
  assert.ok(g.points[0][0]<=900,'outer diagonal cannot overshoot the B3/B4 corner projection');
  assert.equal(g.points[0][0],g.points[g.points.length-1][1],
    'both ends meet on symmetric 45-degree outside edge');
  assert.equal(g.previewParts.length,3,'three preview regions only');
  assert.equal(g.previewSeamDetails.length,2,'two illustrative seams only');
  assert.ok(g.previewSeamDetails.every(s=>s.status==='illustration-only'));
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
  assert.equal(g.supplierMappingVerified,false);
  assert.match(g.warnings.join(' '),/keine Fertigungs|Zuschnittfreigabe/);
 }
});
test('L4 B5 remains a distinct diagram focus key from corner-B5',()=>{
 const image=svg(geometry(l4(300)),'B5',{unit:'cm'});
 assert.match(image,/data-field="B5"/);
 assert.doesNotMatch(image,/data-field="corner-B5"/);
 const poly=geometry(l4(300)).points;
 const p=poly[0],q=poly[7];
 assert.equal(p[1],0);
 assert.equal(q[0],0);
});
