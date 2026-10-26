import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {normalize,catalog} from '../core/config.mjs';
import {DECOR_CATALOG,decorById,decorBySupplierCode} from '../core/decor-catalog.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {quote} from '../private/pricing.mjs';
import {createServer} from '../server.mjs';
import {template} from '../public/component-template.mjs';
const manifest=JSON.parse(await readFile(new URL('../../docs/references/decor-images/decor-mapping.json',import.meta.url),'utf8'));
const raw={schemaVersion:2,inputUnit:'mm',productId:1000083,product:'straight',geometry:'straight',corner:'square',dimensions:{L1:'2000',B1:'600'},material:'APL38',decor:'W980'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
test('current decor copy no longer promises two references or more decors later',()=>{
 assert.doesNotMatch(template,/2 Referenzdekore|Weitere Dekore folgen|Farben und Holzstruktur sind schematische/);
 assert.match(template,/16 Dekore/);assert.match(template,/Deine Arbeitsplatte konfigurieren/);
});

test('all 16 agreed names, codes and file mappings match the supplied manifest uniquely',()=>{
 assert.equal(DECOR_CATALOG.length,16);
 for(const key of ['id','supplierCode','displayName','imageFilename','thumbnailFilename'])assert.equal(new Set(DECOR_CATALOG.map(d=>d[key])).size,16,key);
 for(const row of manifest.items){const d=decorById(row.id);assert.ok(d);assert.equal(d.displayName,row.displayName);assert.equal(d.supplierCode,row.supplierCode);assert.equal(d.imageFilename,row.imagePath.split('/').at(-1));assert.equal(d.thumbnailFilename,row.thumbPath.split('/').at(-1));assert.equal(d.sourceFilename,row.sourceFile);assert.equal(decorBySupplierCode(row.supplierCode),d);}
});
test('public catalog exposes 16 short names and images without supplier labels or article surfaces',()=>{
 const rows=catalog().decors;assert.equal(rows.length,16);
 for(const row of rows){const source=decorById(row.id);assert.equal(row.label,source.displayName);assert.equal(row.imageFilename,source.imageFilename);assert.equal(row.thumbnailFilename,source.thumbnailFilename);for(const key of ['supplierCode','supplierName','manufacturer','surface'])assert.equal(row[key],undefined);}
 for(const name of ['Perlgrau','Granit schwarz','Terrazzo grau'])assert.ok(rows.some(r=>r.label===name));
});
test('each material resolves all decor IDs server-side; forged names/codes never choose a mapping or price',()=>{
 for(const d of DECOR_CATALOG)for(const material of ['APL17.5','APL38']){
  const clean=normalize({...raw,decor:d.id,material}),forged=normalize({...raw,decor:d.id,material,decorSupplierCode:'FORGED',supplierCode:'W980 ST7',displayName:'Platinweiß',imageUrl:'https://example.invalid/forged.webp',price:1,purchasable:true});
  assert.equal(clean.decor,d.id);assert.equal(clean.decorSupplierCode,d.supplierCode);assert.deepEqual(clean,forged);assert.equal(quote(clean).purchasable,false);if(!['W980','H1145'].includes(d.id))assert.equal(quote(clean).referenceMatched,false);
 }
 for(const decor of ['F128 PA','Granit schwarz','../F128',44375,null,'UNKNOWN'])assert.throws(()=>normalize({...raw,decor}));
});
test('all supplied WebP files are byte-identical to manifest; originals retained separately',async()=>{
 for(const row of manifest.items){
  for(const [path,hash] of [[row.imagePath,row.imageSha256],[row.thumbPath,row.thumbSha256]]){const bytes=await readFile(new URL('../public/decors/'+path.split('/').at(-1),import.meta.url));assert.equal(sha(bytes),hash);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
  assert.ok((await readFile(new URL('../../docs/references/decor-images/originals/'+row.sourceFile,import.meta.url))).length);
 }
});
test('SVG can fill the unchanged contour with an actual chosen image and escapes its URL',()=>{
 const g=geometry(normalize(raw));
 const markup=svg(g,'L1',{decor:'F021',textureUrl:'/decors/F021.webp?x="<&'});
 assert.match(markup,/<image[^>]+href="\/decors\/F021.webp\?x=&quot;&lt;&amp;"/);
 assert.match(markup,/preserveAspectRatio="xMidYMid slice"/);assert.match(markup,/fill="url\(#apl-texture\)"/);
 assert.ok(markup.includes(`d="${g.path}"`));assert.equal(g.areaMm2,1200000);
});
test('HTTP accepts each decor with canonical code; only known WebPs are served, no source images',async t=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{server.close(r);server.closeAllConnections();}));const base=`http://127.0.0.1:${server.address().port}`;
 for(const d of DECOR_CATALOG){
  const response=await fetch(base+'/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...raw,decor:d.id,decorSupplierCode:'WRONG'})});assert.equal(response.status,200);const result=await response.json();assert.equal(result.config.decorSupplierCode,d.supplierCode);assert.equal(result.quote.purchasable,false);
  for(const filename of [d.imageFilename,d.thumbnailFilename]){const file=await fetch(base+'/decors/'+filename);assert.equal(file.status,200);assert.equal(file.headers.get('content-type'),'image/webp');assert.equal(sha(Buffer.from(await file.arrayBuffer())),sha(await readFile(new URL('../public/decors/'+filename,import.meta.url))));}
 }
 for(const path of ['/decors/UNKNOWN.webp','/decors/../../private/pricing.mjs','/originals/3002-Weiss.jpg','/decors/decor-mapping.json'])assert.equal((await fetch(base+path)).status,404);
});
