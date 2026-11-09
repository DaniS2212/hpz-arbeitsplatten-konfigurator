import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

test('Straight labels remain geometrically aligned after unified L-sized readable dimension typography',()=>{
 const c=normalize({
  schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',
  material:'APL38',decor:'W980',quantity:1,
  dimensions:{L1:'2000',B1:'600'},
  straightCorner:{side:'both',treatment:'chamfer_square',
   parameters:{L2:'150',B2:'150',L3:'150',B3:'150'}}
 });
 const g=geometry(c);
 assert.match(g.version,/straight/);
 const pic=svg(g,'',{unit:'cm'});
 const read=(id)=>{
  const start=pic.indexOf('data-field="'+id+'"');
  assert.ok(start>=0,id+' exists');
  const s=pic.slice(start,start+1200);
  const m=s.match(/transform="translate\(([-+eE0-9.]+) ([-+eE0-9.]+)\)( rotate\(-90\))?"/);
  assert.ok(m,id+' label transform');
  return {x:Number(m[1]),y:Number(m[2])};
 };
 const pad=Math.max(g.width,g.height)*.11;
 const font=Math.min(pad*.54,g.width*.052,g.height*.24);
 assert.ok(Math.abs(read('B1').x-(g.width+pad*.95+font*.85))<.001,
   'B1 guide should follow straight-only visual rail without confusing L guides');
 assert.ok(Math.abs(read('L2').y-(g.height+pad*.60+font*.85))<.001,
   'straight L2 horizontal cut offset is unchanged');
 assert.ok(Math.abs(read('B2').x-(-pad*.42-font*.9))<.001,
   'straight B2 vertical cut offset is unchanged');
});
