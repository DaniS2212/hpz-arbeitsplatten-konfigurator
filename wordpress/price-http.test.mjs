import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {cmInputToMmText} from '../local/core/customer-measures.mjs';

const cwd=fileURLToPath(new URL('../',import.meta.url));
const plugin=fileURLToPath(new URL('./hpz-apl-admin-preview/',import.meta.url));
const router=fileURLToPath(new URL('./price-http-harness.php',import.meta.url));
async function port(){const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const value=socket.address().port;socket.close();await once(socket,'close');return value;}
function input(decor='W980',material='APL17.5',l='2000',b='600',quantity=1){return {schemaVersion:2,inputUnit:'mm',productId:1000083,sku:'HPZ-APL-GERADE-2026',product:'straight',geometry:'straight',corner:'square',dimensions:{L1:l,B1:b},material,decor,quantity,straightCorner:{side:'none',treatment:null,parameters:{}}};}
test('actual PHP WordPress-test adapter: admin gate, V3 prices and no internal data',async()=>{
 const listen=await port(),base=`http://127.0.0.1:${listen}`;
 const child=spawn(process.env.HPZ_PHP_BIN||'php',['-S',`127.0.0.1:${listen}`,'-t',plugin,router],{cwd,stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<40;i++){try{const r=await fetch(base+'/');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,'PHP local harness started');
  const html=await (await fetch(base+'/')).text();
  assert.match(html,/data-price-nonce="testnonce"/);
  assert.match(html,/data-price-endpoint=/);
  const send=async(raw=input(),mode='',nonce='testnonce')=>{
    const url=base+'/admin-ajax.php?action=hpz_apl_price_preview'+(mode?'&mode='+mode:'');
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-WP-Nonce':nonce},body:JSON.stringify(raw)});
    return {status:response.status,data:await response.json()};
  };
  for(const decor of ['W980','U999','H1145','H3303','F021','F095','F121','F128','F186','F235','F302','F629','F661','F812','44375','44405'])for(const material of ['APL17.5','APL38']){
    const {status,data}=await send(input(decor,material));
    assert.equal(status,200,decor+'/'+material);assert.equal(data.success,true);
    assert.equal(data.data.quote.purchasable,false);assert.ok(data.data.quote.unitGrossReferenceCents>0);
    assert.doesNotMatch(JSON.stringify(data),/supplierNet|marginPct|decorSupplierCode|inboundNet|EK_REFERENCE/);
  }
  assert.equal((await send(input('W980','APL17.5','2501','880'))).data.data.quote.unitGrossReferenceCents,107000);
  assert.equal((await send(input('W980','APL38','2781','600'))).data.data.quote.unitGrossReferenceCents,122000);
  assert.equal((await send(input('W980','APL38','1200','600'))).data.data.quote.unitGrossReferenceCents,84000,'120x60 PHP HTTP quote');
  assert.equal((await send(input('W980','APL38','3500','900'))).data.data.quote.unitGrossReferenceCents,236000,'350x90 PHP HTTP quote');
  assert.equal((await send(input('W980','APL38','2500','881'))).data.data.quote.unitGrossReferenceCents,182000);
  for(const [material,one,two,depth] of [['APL17.5','250','250,1','60'],['APL38','278','278,1','60'],['APL38','250','250','88']]){
    const before=input('W980',material,cmInputToMmText(one),cmInputToMmText(depth));
    const after=input('W980',material,cmInputToMmText(two),cmInputToMmText(depth==='88'?'88,1':depth));
    const a=(await send(before)).data.data.quote.unitGrossReferenceCents,b=(await send(after)).data.data.quote.unitGrossReferenceCents;
    assert.notEqual(a,b,`${material}: ${one}→${two} cm, ${depth} cm`);
  }
  const two=input('W980','APL17.5','2000','600',2);assert.equal((await send(two)).data.data.quote.totalGrossReferenceCents,156000);
  const through=input('W980','APL38','2500','800');
  through.straightCorner={side:'both',treatment:'chamfer_continuous',parameters:{L2:'150',B2:'150',L3:'200',B3:'200'}};
  const expanded=await send(through);
  assert.equal(expanded.status,200,'250x80 both through must be server-priced');
  assert.ok(expanded.data.data.quote.unitGrossReferenceCents>0);
  through.dimensions={L1:'4000',B1:'900'};
  assert.equal((await send(through)).status,200,'400x90 through accepted');
  through.dimensions={L1:'4001',B1:'900'};
  assert.equal((await send(through)).status,422,'400.1cm outside shop cap');

  for(const mode of ['visitor','no-test','disabled','published','wrong-sku'])assert.equal((await send(input(),mode)).status,403,mode);
  assert.equal((await send(input(),'','bad')).status,403,'bad nonce');
  const sockel=input();sockel.productId=999985;assert.equal((await send(sockel)).status,403,'sockel denied');
  const tamper=input();tamper.price=1;tamper.supplierNet=1;assert.equal((await send(tamper)).data.data.quote.totalGrossReferenceCents,78000);
  for(const wrong of [input('W980','APL38','2500','901'),input('W980','APL17.5','999','600'),input('BAD')])assert.equal((await send(wrong)).status,422);
  assert.equal((await send(input(),'CH')).data.data.quote.taxNote.includes('19'),false,'foreign address has no applied DE tax statement');
  assert.equal((await send(input(),'DE')).data.data.quote.taxNote.includes('19'),true,'DE context gets DE tax label');
  const l=input();l.productId=1000080;l.product='l';l.geometry='L1';assert.equal((await send(l)).status,403,'L has no V3');
 }finally{child.kill();}
});
