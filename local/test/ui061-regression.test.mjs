import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {template} from '../public/component-template.mjs';

const root=new URL('../',import.meta.url);
const base={
  schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',
  material:'APL38',decor:'F021',quantity:1,dimensions:{L1:'2000',B1:'600'},
  straightCorner:{side:'both',treatment:'chamfer_square',
    parameters:{L2:'150',B2:'150',L3:'150',B3:'150'}}
};
const read=path=>readFile(new URL(path,root),'utf8');

test('active chamfer dimension is stronger in main drawing, while units and geometry stay exact',()=>{
  const g=geometry(normalize(base));
  const active=svg(g,'L3',{unit:'cm'});
  const plain=svg(g,'',{unit:'cm'});
  assert.match(active,/data-field="L3" data-active="true"/);
  assert.match(active,/L3: 15 cm/);
  assert.match(active,/font-weight="800"/);
  assert.match(active,/#a34f1c/);
  assert.match(active,/class="apl-measure-label"/);
  assert.match(active,/fill="#fffaf3"/);
  assert.match(plain,/L3: 15 cm/);
  assert.doesNotMatch(plain,/data-field="L3" data-active="true"/);
  assert.equal(g.supplierMappingVerified,false,'UI emphasis must not approve fabrication');
});
test('rounding and overall measurements use the same active visual treatment',()=>{
  const plain={...base,straightCorner:{side:'none',treatment:null,parameters:{}}};
  assert.match(svg(geometry(normalize(plain)),'L1',{unit:'cm'}),/data-field="L1" data-active="true"/);
  const rounded={...base,straightCorner:{side:'both',treatment:'round',parameters:{R1:'100',R2:'150'}}};
  const markup=svg(geometry(normalize(rounded)),'R2',{unit:'cm'});
  assert.match(markup,/data-field="R2" data-active="true"/);
  assert.match(markup,/R2: 15 cm/);
});
test('customer summary is concise, not supplier-coded, and keeps cart disabled',async()=>{
  assert.match(template,/Deine Konfiguration/);
  assert.doesNotMatch(template,/Deine Auswahl/);
  assert.match(template,/id="cart"[^>]+disabled/);
  const component=await read('public/component.mjs');
  for(const required of [
    'function summary(config){',
    "['Maße',",
    "['Material',",
    "['Dekor',",
    "['Ecken',",
    "['Links',",
    "['Rechts',",
    'mmToCmText(config.dimensions.L1)',
    "summary(null);"
  ])assert.ok(component.includes(required),required);
  assert.doesNotMatch(component,/\['Außenkante','1,5 mm dekorgleich'\]/);
  assert.doesNotMatch(component,/supplierCode.*summary\(/);
});
test('the strong input highlight is identical in source and bundled WordPress styles',async()=>{
  const source=await readFile(new URL('../design/kuechenstudio-060.css',root),'utf8');
  const bundled=await readFile(new URL('../wordpress/hpz-apl-admin-preview/assets/kuechenstudio-060.css',root),'utf8');
  assert.equal(source,bundled);
  assert.match(source,/\.dimension-grid > div\.active-dimension/);
  assert.match(source,/\.a1-radius-field\.active-dimension/);
  assert.match(source,/border:2px solid #146178/);
});
test('WordPress assets are cache-busted at 0.6.2 and retain the protected price adapter',async()=>{
  const wp=new URL('../wordpress/hpz-apl-admin-preview/',root);
  const php=await readFile(new URL('hpz-apl-admin-preview.php',wp),'utf8');
  assert.match(php,/Version: 0\.6\.2/);
  const bootstrap=await readFile(new URL('assets/bootstrap.js',wp),'utf8');
  assert.match(bootstrap,/component\.js\?v=0\.6\.2/);
  assert.match(bootstrap,/preview\.js\?v=0\.6\.2/);
  const js=await readFile(new URL('assets/component.js',wp),'utf8');
  assert.match(js,/component\.css\?v=0\.6\.2/);
  assert.match(js,/kuechenstudio-060\.css\?v=0\.6\.2/);
  assert.match(js,/Deine Konfiguration|function summary\(config\)/);
  assert.match(php,/woocommerce_is_purchasable/);
  assert.match(php,/woocommerce_store_api_cart_errors/);
  const ajax=await readFile(new URL('assets/preview.js',wp),'utf8');
  assert.match(ajax,/fetch\(endpoint\.href/);
  assert.match(ajax,/credentials:'same-origin'/);
});
