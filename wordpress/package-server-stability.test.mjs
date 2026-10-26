import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPackageTestServer} from './serve-package-test.mjs';

const listen=server=>new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port));
});
const close=server=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});

test('Missing one decor image does NOT crash the local package preview server',async t=>{
 const server=createPackageTestServer({loadFile:async url=>{
   if(url.href.endsWith('F021-thumb.webp'))throw Object.assign(new Error('Simulated missing texture'),{code:'ENOENT'});
   return readFile(url);
 }});
 const base=await listen(server);t.after(()=>close(server));
 const bad=await fetch(base+'/assets/decors/F021-thumb.webp');
 assert.equal(bad.status,500);
 const health=await fetch(base+'/__health');
 assert.equal(health.status,200);
 assert.equal((await health.json()).imageFailures,1);
 const remaining=await fetch(base+'/assets/decors/H1145-thumb.webp');
 assert.equal(remaining.status,200);
 assert.equal(remaining.headers.get('content-type'),'image/webp');
 const homepage=await fetch(base+'/');
 assert.equal(homepage.status,200);
});

test('Repeated requests for all 32 images leave package preview alive',async t=>{
 const server=createPackageTestServer();
 const base=await listen(server);t.after(()=>close(server));
 const {DECOR_CATALOG}=await import('../local/core/decor-catalog.mjs');
 for(let round=0;round<6;round++){
   const responses=await Promise.all(DECOR_CATALOG.flatMap(d=>[d.imageFilename,d.thumbnailFilename]).map(async filename=>{
     const res=await fetch(base+'/assets/decors/'+filename);
     const bytes=await res.arrayBuffer();
     return {filename,status:res.status,type:res.headers.get('content-type'),length:bytes.byteLength};
   }));
   assert.equal(responses.length,32);
   for(const r of responses){
     assert.equal(r.status,200,r.filename);
     assert.equal(r.type,'image/webp',r.filename);
     assert.ok(r.length>100,r.filename);
   }
 }
 const health=await(await fetch(base+'/__health')).json();
 assert.equal(health.imageFailures,0);
 assert.equal(health.decors,32);
});
