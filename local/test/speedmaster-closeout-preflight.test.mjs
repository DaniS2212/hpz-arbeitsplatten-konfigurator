/**
 * PR49: Strict INTERNAL handoff checklist. Neither metadata completeness nor
 * in-memory synthetic vendor samples may unlock WooCommerce or CNC.
 * Source observations and supplier-approved technical files are distinct.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {SHAPES,REQUIREMENTS,auditCloseout,renderCloseoutMarkdown} from '../private/speedmaster-closeout.mjs';

const filename=new URL('../../docs/references/speedmaster-lu/SUPPLIER_CLOSEOUT.json',import.meta.url);
const baseline=()=>JSON.parse(readFileSync(filename,'utf8'));
const scan=doc=>auditCloseout(doc);
const all=['L1','L2','L3','L4','U1','U2','U3','U4'];

test('exact eight L/U variants and differentiated supplier proof requirements',()=>{
 assert.deepEqual(SHAPES,all);
 assert.deepEqual(Object.keys(REQUIREMENTS),all);
 for(const shape of all){
  assert.ok(REQUIREMENTS[shape].includes('contour'));
  for(const id of ['outer-corners','supplier-limits','real-parts','connectors','parcels','exact-ek','checkout-e2e'])
   assert.ok(REQUIREMENTS[shape].includes(id),shape+' missing '+id);
 }
 assert.ok(REQUIREMENTS.L4.includes('b5-controlled-comparison'));
 for(const shape of ['L3','L4'])assert.ok(REQUIREMENTS[shape].includes('diagonal-piece'));
 for(const shape of ['U1','U2','U3','U4'])assert.ok(REQUIREMENTS[shape].includes('u-variant-topology'));
 assert.ok(!REQUIREMENTS.L1.includes('u-variant-topology'));
});

test('repo handoff records L evidence and U1 screenshots as observed, never supplier-reviewed',()=>{
 const doc=baseline(),result=scan(doc);
 assert.equal(doc.schemaVersion,1);
 assert.deepEqual(Object.keys(doc.shapes),all);
 assert.equal(result.shapes.length,8);
 assert.equal(result.overall.evidenceComplete,false);
 assert.equal(result.overall.manufacturingReady,false);
 assert.equal(result.overall.checkoutEnabled,false);
 assert.equal(result.overall.unverifiedShapes,8);
 assert.equal(result.violations.length,0);
 assert.ok(result.shapes.every(s=>!s.evidenceComplete&&s.missing.length>=7));
 assert.ok(result.shapes.find(s=>s.shape==='L1').observed.includes('exact-ek'));
 assert.ok(result.shapes.find(s=>s.shape==='L4').observed.includes('b5-controlled-comparison'));
 assert.deepEqual(result.shapes.find(s=>s.shape==='U1').observed,['contour','real-parts','connectors']);
 assert.ok(result.shapes.every(s=>s.missing.includes('real-parts')&&s.missing.includes('connectors')&&s.missing.includes('parcels')));
});

test('supplier-like tokens alone cannot fake a reviewed record or use our own shop screenshot',()=>{
 const doc=baseline();
 doc.shapes.L1.contour={status:'reviewed',sourceRefs:[],reviewedBy:'X',reviewedOn:'2026-11-05',details:{a:1}};
 assert.throws(()=>scan(doc),/Quellnachweis|sourceRefs/);
 doc.shapes.L1.contour.sourceRefs=['shop-ui/custom-preview.png'];
 assert.throws(()=>scan(doc),/Shop-Vorschau|Speedmaster-Original/);
 doc.shapes.L1.contour.sourceRefs=['Speedmaster/L1-technical-source.pdf'];
 doc.shapes.L1.contour.reviewedBy='';
 assert.throws(()=>scan(doc),/Vier-Augen|Prüfer|reviewedBy/);
 doc.shapes.L1.contour.reviewedBy='Werkstattprüfung';
 doc.shapes.L1.contour.details={};
 assert.throws(()=>scan(doc),/technische|details/);
});

test('all paperwork completed in a synthetic test is still not production or shop approval',()=>{
 const doc=baseline();
 for(const shape of all)for(const id of REQUIREMENTS[shape]){
  doc.shapes[shape][id]={
   status:'reviewed',sourceRefs:['Speedmaster/synthetic-test-'+shape+'-'+id+'.pdf'],
   reviewedBy:'TEST-ONLY',reviewedOn:'2026-11-05',
   details:{sourceConfigurationId:'synthetic',measurementSet:'not-real-data'}
  };
 }
 const r=scan(doc);
 assert.equal(r.violations.length,0);
 assert.equal(r.overall.evidenceComplete,true);
 assert.equal(r.overall.unverifiedShapes,0);
 assert.equal(r.overall.manufacturingReady,false);
 assert.equal(r.overall.checkoutEnabled,false);
 assert.equal(r.overall.pricingLive,false);
 assert.ok(r.shapes.every(s=>s.missing.length===0));
});

test('unknown shapes, unexpected proof keys and incomplete reviewed data reject closed',()=>{
 const doc=baseline();
 doc.shapes.X5={};
 assert.throws(()=>scan(doc),/Unbekannte|Varianten/);
 delete doc.shapes.X5;
 doc.shapes.L1.fakeCncApproval={status:'reviewed',sourceRefs:['Speedmaster/test.pdf'],reviewedBy:'x',reviewedOn:'2026-11-05',details:{a:1}};
 assert.throws(()=>scan(doc),/Unbekannter|Nachweis/);
 delete doc.shapes.L1.fakeCncApproval;
 doc.shapes.U4.contour={status:'reviewed',sourceRefs:['Speedmaster/u4.pdf'],reviewedBy:'Tester',reviewedOn:'2026-11-05',details:null};
 assert.throws(()=>scan(doc),/technische|details/);
});

test('human-readable matrix makes the Speedmaster handoff actionable and explicitly not released',()=>{
 const md=renderCloseoutMarkdown(scan(baseline()));
 assert.match(md,/Speedmaster.*L1.*U4/s);
 assert.match(md,/L1[\s\S]+L2[\s\S]+L3[\s\S]+L4[\s\S]+U1[\s\S]+U4/);
 assert.match(md,/Stoß|Verbinder|Packstück/i);
 assert.match(md,/keine (?:Fertigungs|Verkaufs)freigabe/i);
 assert.match(md,/Speedmaster-Bilder|Original/i);
});

test('CLI --check exits zero when data are legitimately missing; --require-complete fails closed',()=>{
 const script=new URL('../../scripts/speedmaster-closeout.mjs',import.meta.url).pathname;
 const ok=spawnSync(process.execPath,[script,'--check'],{encoding:'utf8',timeout:20000});
 assert.equal(ok.status,0,ok.stderr||ok.stdout);
 assert.match(ok.stdout,/L1.*offen|L1.*fehlend/i);
 assert.match(ok.stdout,/U4.*offen|U4.*fehlend/i);
 const closed=spawnSync(process.execPath,[script,'--require-complete'],{encoding:'utf8',timeout:20000});
 assert.equal(closed.status,1);
 assert.match(closed.stdout+closed.stderr,/nicht vollständig|fehlend|offen/i);
});
