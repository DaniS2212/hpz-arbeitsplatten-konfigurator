import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {preview} from './hpz-apl-admin-preview/assets/preview.js';
const dir=new URL('./hpz-apl-admin-preview/',import.meta.url);
const raw={productId:1000083,product:'straight',geometry:'straight',material:'APL38',decor:'W980',corner:'square',dimensions:{L1:'200',B1:'60'}};
test('all three products render geometry but never a purchase or price',async()=>{
 for(const [productId,product,geometry,dimensions] of [[1000083,'straight','straight',{L1:'200',B1:'60'}],[1000080,'l','L1',{L1:'250',L2:'170',B1:'60',B2:'60'}],[1000081,'u','U1',{L1:'250',L2:'170',L3:'180',B1:'60',B2:'60',B3:'60'}]]) {
  const result=await preview({...raw,productId,product,geometry,dimensions});
  assert.ok(result.geometry.path);assert.equal(result.quote.purchasable,false);assert.equal(result.quote.illustration,undefined);
 }
});
test('manipulated identity, family and invalid precision rejected',async()=>{
 for(const patch of [{productId:999985},{productId:1000080},{sku:'wrong'},{dimensions:{L1:'200.01',B1:'60'}}])await assert.rejects(preview({...raw,...patch}));
});
test('client price and permission flags ignored',async()=>{
 const result=await preview({...raw,price:1,purchasable:true,quote:{purchasable:true}});
 assert.equal(result.quote.purchasable,false);assert.equal(result.quote.price,undefined);
});
test('packaged legacy cm radii stay independent, front down, and unpurchasable',async()=>{
 const result=await preview({...raw,straightCorner:{side:'both',treatment:'round',parameters:{R1:'10,1',R2:'20,2'}}});
 assert.deepEqual(result.geometry.cornerArcs.map(a=>a.radiusMm),[101,202]);assert.equal(result.geometry.front.from[1],600);assert.equal(result.quote.purchasable,false);
 await assert.rejects(preview({...raw,straightCorner:{side:'left',treatment:'chamfer_continuous',parameters:{}}}),/Kontur/);
});

test('packaged v2 mm adapter previews all ten corner states without a price or purchase',async()=>{
 const {straightCorners,defaultCornerParameters}=await import('./hpz-apl-admin-preview/assets/core/straight-corners.js');
 for(const variant of straightCorners){
  const result=await preview({...raw,schemaVersion:2,inputUnit:'mm',dimensions:{L1:'2000',B1:'600'},straightCorner:{side:variant.side,treatment:variant.treatment,parameters:defaultCornerParameters(variant.side,variant.treatment)}});
  assert.equal(result.config.dimensions.L1,2000);assert.equal(result.config.schemaVersion,2);
  assert.equal(result.config.straightCorner.id,variant.id);assert.ok(result.geometry.path);
  assert.equal(result.quote.purchasable,false);assert.equal(result.quote.price,undefined);assert.equal(result.quote.illustration,undefined);
 }
 await assert.rejects(preview({...raw,schemaVersion:2,dimensions:{L1:'2000',B1:'600'}}),/Einheit|Version/);
});
test('plugin update versions bootstrap and all component module imports consistently',async()=>{
 const php=await readFile(new URL('hpz-apl-admin-preview.php',dir),'utf8'),version=php.match(/Version: ([\d.]+)/)[1];
 const bootstrap=await readFile(new URL('assets/bootstrap.js',dir),'utf8');assert.ok(bootstrap.includes(`component.js?v=${version}`));
 const component=await readFile(new URL('assets/component.js',dir),'utf8');
 for(const [,path] of component.matchAll(/from ['"]([^'"]+)['"]/g))assert.ok(path.endsWith(`?v=${version}`));
 assert.ok(component.includes(`component.css?v=${version}`));
});
test('bundled import graph complete, relative and has no fetch or external assets',async()=>{
 async function scan(path){for(const file of await readdir(path,{withFileTypes:true})) {
  const url=new URL(file.name+(file.isDirectory()?'/':''),path);
  if(file.isDirectory()){await scan(url);continue;}
  if(!/\.(js|css)$/.test(file.name))continue;
  const code=await readFile(url,'utf8');
  assert.doesNotMatch(code.replaceAll('http://www.w3.org/2000/svg',''),/localhost|127\.0\.0\.1|fetch\(|\/api\/|https?:\/\//);
  for(const match of code.matchAll(/from ['"]([^'"]+)['"]/g)){assert.ok(match[1].startsWith('.'));await readFile(new URL(match[1],url));}
 }}
 await scan(new URL('assets/',dir));
});
test('native purchase button disabled, no cart handler bundled',async()=>{
 const html=await readFile(new URL('assets/component-template.js',dir),'utf8');
 assert.match(html,/<button[^>]*disabled[^>]*>[^<]*In den Warenkorb/);
 const js=await readFile(new URL('assets/component.js',dir),'utf8');
 assert.doesNotMatch(js,/add.to.cart|wc.ajax|checkout/i);
});
test('PHP safety and settings hooks present (static contract, not PHP execution)',async()=>{
 const php=await readFile(new URL('hpz-apl-admin-preview.php',dir),'utf8');
 for(const required of ["get_post_status($id)==='draft'","current_user_can('manage_options')","is_user_logged_in()","$o['enabled'] && $o['test_mode']","'enabled'=>false","'test_mode'=>true","woocommerce_is_purchasable","woocommerce_add_to_cart_validation","woocommerce_check_cart_items","woocommerce_store_api_cart_errors","settings_fields('hpz_apl_preview')","sanitize_callback","DONOTCACHEPAGE"])assert.ok(php.includes(required),required);
 assert.doesNotMatch(php,/wp_insert_post|wp_update_post|update_post_meta|register_rest_route|wcpa_/);
});
