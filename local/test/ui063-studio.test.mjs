import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {template} from '../public/component-template.mjs';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

const get=path=>readFile(new URL(path,import.meta.url),'utf8');
test('0.6.4 summary follows all choices and keeps single guarded cart',async()=>{
 assert.match(template,/class="summary-details"/);
 assert.match(template,/class="summary-purchase"/);
 assert.match(template,/class="summary-swatch"/);
 assert.match(template,/id="summary"/);
 assert.match(template,/Deine Konfiguration/);
 assert.match(template,/id="selected-surface-name"/);
 assert.match(template,/id="selected-surface-thickness"/);
 assert.match(template,/id="cart"[^>]+disabled/);
 assert.equal((template.match(/id="cart"/g)||[]).length,1);
 assert.equal((template.match(/id="summary"/g)||[]).length,1);
 assert.equal((template.match(/id="decors"/g)||[]).length,1);
 const pos={materials:template.indexOf('id="materials"'),decors:template.indexOf('id="decors"'),summary:template.indexOf('class="order-summary"')};
 assert.ok(pos.materials<pos.decors&&pos.decors<pos.summary);
 const component=await get('../public/component.mjs');
 assert.match(component,/function placeSummary\(\)/);
 assert.match(component,/const dest=window\.matchMedia/);
 assert.match(component,/selected-surface-name/);
 assert.match(component,/admin-visual-only/);
 assert.match(component,/Im Shop-Test/);
 assert.doesNotMatch(component,/addToCart|wc-ajax=add_to_cart/);
});
test('Final styling allocates the full workspace width on desktop',async()=>{
 const css=await get('../../design/kuechenstudio-060.css');
 const bundled=await get('../../wordpress/hpz-apl-admin-preview/assets/kuechenstudio-060.css');
 assert.equal(css,bundled);
 assert.match(css,/\.workspace > \.order-summary \{[\s\S]*?grid-column:1 \/ -1/);
 assert.match(css,/grid-template-areas:"visual configuration" "summary summary"/);
 assert.match(css,/\.surface-selected-swatch/);
 assert.match(css,/\.summary-details-body/);
 assert.match(css,/@media\(max-width:760px\)/);
});
test('Vertical dimension labels isolate text from inherited SVG stroke',()=>{
 const raw={schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',
  material:'APL38',decor:'H1145',dimensions:{L1:'2000',B1:'600'},
  straightCorner:{side:'both',treatment:'chamfer_square',parameters:{L2:'150',B2:'150',L3:'150',B3:'150'}}};
 const g=geometry(normalize(raw)),markup=svg(g,'B3',{unit:'cm',textureUrl:'/decors/H1145.webp'});
 const match=markup.match(/<g class="apl-measure-label"[^>]+>[^<]*<rect[^>]+\/><text[^>]+>B3: 15 cm<\/text>/);
 assert.ok(match,'B3 label should be inside its own rectangle');
 assert.match(match[0],/stroke="none"/);
 assert.match(match[0],/rotate\(-90\)/);
 assert.match(match[0],/font-weight="800"/);
 assert.match(match[0],/fill="#fffaf3"/);
 assert.equal(g.supplierMappingVerified,false);
});
test('0.6.4 WP host still restricts to admins/drafts and cart+Store API remain locked',async()=>{
 const php=await get('../../wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php');
 assert.match(php,/Version: 0\.6\.4/);
 assert.match(php,/current_user_can\('manage_options'\)/);
 assert.match(php,/get_post_status\(\$id\)==='draft'/);
 assert.match(php,/woocommerce_is_purchasable/);
 assert.match(php,/woocommerce_store_api_cart_errors/);
 const preview=await get('../../wordpress/hpz-apl-admin-preview/assets/preview.js');
 assert.match(preview,/v=0\.6\.4/);
 assert.match(preview,/endpoint\.origin!==location\.origin/);
 assert.match(preview,/purchasable:false/);
 const bundled=await get('../../wordpress/hpz-apl-admin-preview/assets/component-template.js');
 assert.match(bundled,/class=\\"summary-purchase\\"/);
});
