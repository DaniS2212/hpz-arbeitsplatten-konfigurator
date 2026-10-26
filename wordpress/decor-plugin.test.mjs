import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {DECOR_CATALOG} from '../local/core/decor-catalog.mjs';
import {preview} from './hpz-apl-admin-preview/assets/preview.js';
const root=new URL('./hpz-apl-admin-preview/',import.meta.url);
const php=spawnSync('php',['--version'],{encoding:'utf8',windowsHide:true});
test('WordPress PHP map has the same 16 canonical supplier identities as the source catalog',async()=>{
 const data=JSON.parse(await readFile(new URL('data/decors.json',root),'utf8'));
 assert.deepEqual(data.items,DECOR_CATALOG.map(({id,supplierCode,displayName})=>({id,supplierCode,displayName})));
 const resolver=await readFile(new URL('includes/decor-catalog.php',root),'utf8');
 for(const required of ['is_string($id)',"count($data['items']) !== 16","isset($codes[$row['supplierCode']])","__DIR__.'/../data/decors.json'"])assert.ok(resolver.includes(required));
 assert.doesNotMatch(resolver,/update_|insert_|add_to_cart|register_rest_route|\$_(?:GET|POST|REQUEST)/);
 const plugin=await readFile(new URL('hpz-apl-admin-preview.php',root),'utf8');assert.ok(plugin.includes("HPZ_APL_Decor_Catalog::resolve('H1145')"));assert.ok(plugin.includes('data-decor-id='));
});
test('all 32 packaged WebPs match source bytes; no deployment-server dependency',async()=>{
 for(const d of DECOR_CATALOG)for(const file of [d.imageFilename,d.thumbnailFilename]){
  const packaged=await readFile(new URL('assets/decors/'+file,root));
  const source=await readFile(new URL('../local/public/decors/'+file,import.meta.url));
  assert.equal(createHash('sha256').update(packaged).digest('hex'),createHash('sha256').update(source).digest('hex'),file);
 }
 const {decorImageUrl}=await import('./hpz-apl-admin-preview/assets/decor-images.js');
 for(const d of DECOR_CATALOG){assert.ok(new URL(decorImageUrl(d.id)).pathname.endsWith('/assets/decors/'+d.imageFilename));assert.ok(new URL(decorImageUrl(d.id,{thumbnail:true})).pathname.endsWith('/assets/decors/'+d.thumbnailFilename));}
 assert.throws(()=>decorImageUrl('../W980'));assert.throws(()=>decorImageUrl('Perlgrau'));
});
test('all products/materials accept each mapped decor only as locked visual preview',async()=>{
 for(const [productId,product,geometry,dimensions] of [[1000083,'straight','straight',{L1:'2000',B1:'600'}],[1000080,'l','L1',{L1:'2500',L2:'1700',B1:'600',B2:'600'}],[1000081,'u','U1',{L1:'2500',L2:'1700',L3:'1800',B1:'600',B2:'600',B3:'600'}]])for(const material of ['APL17.5','APL38'])for(const d of DECOR_CATALOG){
  const result=await preview({schemaVersion:2,inputUnit:'mm',productId,product,geometry,dimensions,corner:'square',material,decor:d.id,decorSupplierCode:'FORGED',purchasable:true,price:0});
  assert.equal(result.config.decorSupplierCode,d.supplierCode);assert.equal(result.quote.purchasable,false);assert.equal(result.quote.price,undefined);assert.ok(result.geometry.path);
 }
});
test('PHP resolver runtime: all IDs, short names, unknown and numeric ID rejection',{skip:php.error?'PHP runtime unavailable in this workspace':false},()=>{
 const result=spawnSync('php',[new URL('./decor-catalog.test.php',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/PASS 16/);
});
