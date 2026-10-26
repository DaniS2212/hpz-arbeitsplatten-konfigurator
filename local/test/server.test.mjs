import {test} from 'node:test';
import assert from 'node:assert/strict';
import {request} from 'node:http';
import {createServer} from '../server.mjs';
import {createPreviewController} from '../public/latest.mjs';
const input={product:'straight',geometry:'straight',corner:'square',dimensions:{L1:'200',B1:'70'},material:'APL17.5',decor:'W980',quantity:1};
async function withServer(t) {
  const server=createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const url=`http://127.0.0.1:${server.address().port}`;
  return {url,post:(body,headers={})=>fetch(url+'/api/preview',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)})};
}
test('local HTTP preview validates on server and exposes no supplier prices',async t=>{
  const {post}=await withServer(t);
  const response=await post({...input,price:0,approved:true,shippingParts:[1],weight:0});
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.quote.purchasable,false);
  assert.equal(body.quote.referenceMatched,true);
  assert.equal(body.config.dimensions.L1,2000);
  assert.equal(body.geometry.areaMm2,1400000);
  assert.match(body.hash,/^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(body),/165\.80|supplierNet|inboundTotal/);
  assert.equal((await post({...input,dimensions:{L1:'200.11',B1:'70'}})).status,422);
  assert.equal((await post({...input,product:'999985'})).status,422);
  assert.equal((await post({...input,dimensions:{}})).status,422);
});
test('only explicitly allowed files are served; private costs, test fixtures and traversal remain inaccessible',async t=>{
  const {url}=await withServer(t);
  for(const path of ['/private/pricing.mjs','/test/core.test.mjs','/package.json','/../docs/baseline.md','/core/../private/pricing.mjs','/api/checkout'])
    assert.equal((await fetch(url+path)).status,404,path);
  const home=await fetch(url+'/');
  assert.equal(home.status,200);
  assert.match(home.headers.get('content-security-policy'),/default-src 'self'/);
  assert.equal(home.headers.get('cache-control'),'no-store');
});
test('HTTP mm contract preserves physical size, blocks invalid corners and has no purchase endpoint',async t=>{
 const {url,post}=await withServer(t);
 const modern={...input,schemaVersion:2,inputUnit:'mm',productId:1000083,dimensions:{L1:'2000',B1:'600'},straightCorner:{side:'both',treatment:'chamfer_square',parameters:{L2:'200',B2:'150',L3:'280',B3:'200'}}};
 const response=await post(modern);assert.equal(response.status,200);
 const result=await response.json();assert.equal(result.config.dimensions.L1,2000);
 assert.deepEqual(result.geometry.front,{from:[200,600],to:[1720,600]});
 assert.equal(result.quote.purchasable,false);assert.equal(result.quote.price,null);assert.equal(result.quote.referenceMatched,false);
 for(const patch of [{inputUnit:undefined},{schemaVersion:undefined},{productId:999985},{straightCorner:{...modern.straightCorner,parameters:{...modern.straightCorner.parameters,L3:'290'}}}])assert.equal((await post({...modern,...patch})).status,422);
 for(const endpoint of ['/api/cart','/api/checkout'])assert.equal((await fetch(url+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...modern,purchasable:true,price:1})})).status,404);
});
test('foreign origins and hosts, oversize payloads and wrong content types are rejected',async t=>{
  const {url,post}=await withServer(t);
  assert.equal((await post(input,{Origin:'https://example.com'})).status,403);
  // Node fetch replaces Host; use the raw HTTP client to actually send this adversarial header.
  const foreignHostStatus=await new Promise((resolve,reject)=>{
    const req=request(url+'/api/preview',{method:'POST',headers:{Host:'evil.example','Content-Type':'application/json'}},res=>{res.resume();resolve(res.statusCode);});
    req.on('error',reject);req.end(JSON.stringify(input));
  });
  assert.equal(foreignHostStatus,403);
  assert.equal((await post({...input,junk:'x'.repeat(17000)})).status,413);
  assert.equal((await post(input,{'Content-Type':'text/plain'})).status,415);
  assert.equal((await fetch(url+'/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,400);
});
test('configuration hashes distinguish dimensions but ignore untrusted prices',async t=>{
  const {post}=await withServer(t);
  const a=await (await post(input)).json();
  const b=await (await post({...input,price:1})).json();
  const c=await (await post({...input,dimensions:{L1:'200.1',B1:'70'}})).json();
  assert.match(a.hash??'',/^[a-f0-9]{64}$/);
  assert.equal(a.hash,b.hash);
  assert.notEqual(a.hash,c.hash);
});
test('late responses cannot overwrite newer dimensions and new input clears prior results immediately',async()=>{
  const pending=[],events=[];
  const controller=createPreviewController({request:payload=>new Promise((resolve,reject)=>pending.push({payload,resolve,reject})),
    onPending:()=>events.push('pending'),onResult:r=>events.push(r),onError:e=>events.push(e.message)});
  const first=controller.refresh('old');
  const second=controller.refresh('new');
  assert.deepEqual(events,['pending','pending']);
  pending[1].resolve('new-result');await second;
  pending[0].resolve('old-result');await first;
  assert.deepEqual(events,['pending','pending','new-result']);
  const third=controller.refresh('third');pending[2].reject(new Error('offline'));await third;
  assert.deepEqual(events.slice(-2),['pending','offline']);
});
