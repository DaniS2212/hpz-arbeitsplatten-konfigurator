import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
function csv(path){
 const [head,...body]=text(path).trimEnd().split(/\r?\n/);
 const keys=head.split(',');
 return body.map((line,i)=>{
  const values=line.split(',');
  assert.equal(values.length,keys.length,'CSV column drift on line '+(i+2));
  return Object.fromEntries(keys.map((k,n)=>[k,values[n]]));
 });
}
test('single entrypoint for new chats is linked from AGENTS, README and STATUS',()=>{
 const title='CURRENT_PROJECT_HANDOFF_20261105.md';
 assert.match(text('AGENTS.md'),new RegExp(title));
 assert.match(text('README.md'),new RegExp(title));
 assert.match(text('STATUS.md'),new RegExp(title));
 const handoff=text('docs/'+title);
 for(const word of ['1000083','1000080','1000081','U1','U2','U3','U4',
 '30-%','40-%','35-%','10 %','Speedmaster_U1-U4_20261105_Originale.zip',
 'noch nicht','manuell','GitHub'])assert.ok(handoff.includes(word),'missing documented core '+word);
});
test('central L/U price evidence is typed and exact, no new screen display accepted as net EK',()=>{
 const data=csv('docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv');
 assert.equal(data.length,10);
 const l=data.filter(x=>x.variant==='L1');
 assert.equal(l.length,4);
 assert.deepEqual(l.map(x=>x.amount_eur),['307.67','464.45','342.41','511.56']);
 assert.ok(l.every(x=>x.amount_type==='verified_net_EK'&&x.thickness_mm!==''));
 const u1=data.filter(x=>x.variant==='U1');
 assert.deepEqual(u1.map(x=>x.amount_eur),['459.29','691.49']);
 assert.ok(u1.every(x=>x.amount_type==='verified_net_EK'));
 const source=JSON.parse(text('docs/references/speedmaster-lu/U2_U4_JOINT_USER_20261105.json'));
 for(const v of ['U2','U3','U4']){
  const row=data.find(x=>x.variant===v);
  assert.equal(row.amount_eur,source.cases[v].displayedPriceEUR);
  assert.equal(row.amount_type,'supplier_screen_display_only');
  assert.equal(row.status,'net_status_unverified');
  for(const [key,value] of Object.entries(source.cases[v].dimensionsMm)){
   assert.equal(row[key+'_mm'],String(value),'wrong axis '+v+':'+key);
  }
 }
 const l4=data.find(x=>x.variant==='L4');
 assert.equal(l4.amount_eur,'658.61');
 assert.equal(l4.amount_type,'prior_chat_transcribed_display_only');
 assert.equal(l4.B5_base_mm,'600');
 assert.equal(l4.status,'not_verified_net_EK');
});
