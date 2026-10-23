import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveProduct} from '../core/products.mjs';
import {createServer} from '../server.mjs';
test('existing product IDs and SKUs resolve strictly',()=>{
 for(const [id,sku,family] of [[1000083,'HPZ-APL-GERADE-2026','straight'],[1000080,'HPZ-APL-L-FORM-2026','l'],[1000081,'HPZ-APL-U-FORM-2026','u']]){
  assert.equal(resolveProduct({productId:id}).family,family);assert.equal(resolveProduct({sku}).family,family);
 }
 assert.throws(()=>resolveProduct({productId:999985}));
 assert.throws(()=>resolveProduct({productId:1000083,sku:'HPZ-APL-U-FORM-2026'}));
});
test('embedded HTTP rejects family tampering and cannot order',async t=>{
 const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{s.close(r);s.closeAllConnections();}));const url=`http://127.0.0.1:${s.address().port}`;
 const body={productId:1000083,product:'l',geometry:'L1',corner:'square',material:'APL38',decor:'W980',dimensions:{L1:'250',L2:'120',B1:'60',B2:'60'},quantity:1};
 const post=b=>fetch(url+'/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
 assert.equal((await post(body)).status,422);
 const valid=await post({...body,product:'straight',geometry:'straight',dimensions:{L1:'250',B1:'60'}});assert.equal(valid.status,200);assert.equal((await valid.json()).quote.purchasable,false);
 for(const path of ['/api/cart','/api/checkout','/?add-to-cart=1000083'])assert.equal((await fetch(url+path,{method:'POST'})).status,404);
 assert.equal((await fetch(url+'/embed')).status,200);
});
test('A1 HTTP preview validates radius fields, excludes old rectangle price, and rejects unproven contours',async t=>{
 const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>{s.close(r);s.closeAllConnections();}));const url=`http://127.0.0.1:${s.address().port}`;
 const body={productId:1000083,product:'straight',geometry:'straight',corner:'square',material:'APL38',decor:'W980',dimensions:{L1:'200',B1:'60'},straightCorner:{side:'both',treatment:'round',parameters:{R1:'10,1',R2:'20,2'}}};
 const post=data=>fetch(url+'/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const response=await post(body);assert.equal(response.status,200);const result=await response.json();assert.deepEqual(result.geometry.cornerArcs.map(a=>a.radiusMm),[101,202]);assert.equal(result.quote.illustration,null);assert.equal(result.quote.purchasable,false);
 const changed=await (await post({...body,straightCorner:{...body.straightCorner,parameters:{R1:'10,2',R2:'20,2'}}})).json();assert.notEqual(result.hash,changed.hash);
 assert.equal((await post({...body,straightCorner:{side:'left',treatment:'chamfer_square',parameters:{L2:'20',B2:'15'}}})).status,422);
});
