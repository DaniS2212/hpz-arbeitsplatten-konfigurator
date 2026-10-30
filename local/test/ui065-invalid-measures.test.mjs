import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {template} from '../public/component-template.mjs';
const get=path=>readFile(new URL(path,import.meta.url),'utf8');

test('Invalid input retains the last valid SVG and blocks the price',async()=>{
 const c=await get('../public/component.mjs');
 assert.match(c,/onError:error=>\{/);
 assert.match(c,/if\(lastGeometry\)\{/);
 assert.match(c,/Letzter gültiger Stand/);
 assert.match(c,/summary\(null,true\)/);
 assert.match(c,/priceDisplay\('–','Maße prüfen'\)/);
 assert.doesNotMatch(c,/onError:error=>\{[^}]*lastGeometry=null/);
 assert.match(template,/id="drawing-status"/);
 assert.match(template,/id="cart"[^>]+disabled/);
});
test('Field errors are direct and accessible in the WordPress bundle',async()=>{
 const c=await get('../public/component.mjs');
 assert.match(c,/setFieldError\(key,issue\)/);
 assert.match(c,/Maximal \$\{mmToCmText\(limit.max\)\} cm möglich/);
 assert.match(c,/aria-invalid/);
 assert.match(c,/field-error-\$\{key\}/);
 const wp=await get('../../wordpress/hpz-apl-admin-preview/assets/component.js');
 assert.match(wp,/drawing-status/);
 assert.match(wp,/summary\(null,true\)/);
 const css=await get('../../design/kuechenstudio-060.css');
 assert.equal(css,await get('../../wordpress/hpz-apl-admin-preview/assets/kuechenstudio-060.css'));
 assert.match(css,/has-measure-error/);
 assert.match(css,/\.drawing-status/);
});
test('Only admin-preview, no purchasable path in 1.0.3',async()=>{
 const php=await get('../../wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php');
 assert.match(php,/Version: 1\.0\.3/);
 assert.match(php,/woocommerce_is_purchasable/);
 assert.match(php,/woocommerce_store_api_cart_errors/);
 const bundle=await get('../../wordpress/hpz-apl-admin-preview/assets/component.js');
 assert.match(bundle,/Vorschauadapter fehlt\. Kauf bleibt gesperrt/);
});
