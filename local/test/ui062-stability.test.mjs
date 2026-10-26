import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {geometry,svg} from '../core/geometry.mjs';
import {normalize} from '../core/config.mjs';
import {template} from '../public/component-template.mjs';

const raw={
 schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',
 material:'APL38',decor:'H1145',dimensions:{L1:'2000',B1:'600'},
 straightCorner:{side:'both',treatment:'chamfer_continuous',
 parameters:{L2:'150',B2:'150',L3:'150',B3:'150'}}
};
const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('SVG labels use opaque contrast plates so dotted guides do not cross letters',()=>{
 const g=geometry(normalize(raw));
 const html=svg(g,'B2',{unit:'cm',textureUrl:'/assets/decors/H1145.webp'});
 assert.match(html,/data-field="B2" data-active="true"/);
 assert.match(html,/class="apl-measure-label"/);
 assert.match(html,/<rect[^>]+fill="#fffaf3"/);
 assert.match(html,/B2: 15 cm/);
 assert.match(html,/font-weight="800"/);
 assert.match(html,/rotate\(-90\)/);
 assert.doesNotMatch(html,/class="schematic-label"/);
 assert.match(html,/<image href="\/assets\/decors\/H1145.webp"/);
 assert.match(html,/<pattern id="apl-texture"[^>]*><rect[^>]+fill="#e9eeec"/);
 assert.equal(g.supplierMappingVerified,false);
});
test('Active input outline is contained by focused unit wrapper, no orange line over suffix',async()=>{
 const css=await read('../../design/kuechenstudio-060.css');
 const packed=await read('../../wordpress/hpz-apl-admin-preview/assets/kuechenstudio-060.css');
 assert.equal(css,packed);
 assert.match(css,/\.unit-input input:focus-visible \{[\s\S]*?outline: none !important/);
 assert.match(css,/\.unit-input:focus-within \{[\s\S]*?border-color: #146178/);
 assert.match(css,/\.a1-corner-grid/);
});
test('Customer-facing corner fields are grouped and decor cards remain mounted',async()=>{
 const source=await read('../public/component.mjs');
 assert.match(source,/const grids=new Map\(\)/);
 assert.match(source,/Linke Ecke/);
 assert.match(source,/Rechte Ecke/);
 assert.match(source,/if\(\$\('decors'\)\.children\.length!==c\.decors\.length\)/);
 assert.match(source,/function placeSummary\(\)/);
 assert.match(template,/Deine Konfiguration/);
 assert.match(template,/id="cart"[^>]+disabled/);
});
test('Bundled 0.6.5 plugin still requires draft-admin and keeps sales blocked',async()=>{
 const php=await read('../../wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php');
 assert.match(php,/Version: 0\.6\.5/);
 assert.match(php,/woocommerce_is_purchasable/);
 assert.match(php,/woocommerce_store_api_cart_errors/);
 const js=await read('../../wordpress/hpz-apl-admin-preview/assets/component.js');
 assert.match(js,/const grids=new Map\(\)/);
 assert.match(js,/if\(\$\('decors'\)\.children\.length!==c\.decors\.length\)/);
});
