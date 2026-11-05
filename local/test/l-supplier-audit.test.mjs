import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry} from '../core/geometry.mjs';
import {defaultLCorner} from '../core/l-geometry.mjs';
import {L_REFERENCE_CASES,auditLReference,renderLAuditMarkdown} from '../core/l-supplier-audit.mjs';
import {spawnSync} from 'node:child_process';

const asConfig=(shape,changes={})=>{
  const f=L_REFERENCE_CASES[shape],dimensions={...f.dimensionsMm,...(changes.dimensionsMm??{})};
  return normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',
    material:changes.material??'APL38',decor:changes.decor??'W980',quantity:1,
    dimensions:Object.fromEntries(Object.entries(dimensions).map(([k,v])=>[k,String(v)])),
    lCorner:changes.lCorner??defaultLCorner(shape),
  });
};
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const EPS=1e-6;
const expected={
  L1:[[0,0],[2000,0],[2000,600],[600,600],[600,1200],[0,1200]],
  L2:[[0,0],[2000,0],[2000,1200],[1400,1200],[1400,600],[0,600]],
  L3:[[0,0],[2000,0],[2000,600],[900,600],[600,900],[600,2000],[0,2000]],
  L4:[
    [Math.min(1050,900+1050-600*Math.SQRT2),0],[2000,0],[2000,900],[1050,900],
    [900,1050],[900,2000],[0,2000],[0,Math.min(1050,900+1050-600*Math.SQRT2)],
  ],
};
test('supplier evidence captures exactly four screenshot sample configurations with honest evidence classes',()=>{
  assert.deepEqual(Object.keys(L_REFERENCE_CASES),['L1','L2','L3','L4']);
  for(const [shape,f] of Object.entries(L_REFERENCE_CASES)){
    assert.equal(f.shape,shape);
    assert.equal(f.source,'Speedmaster-Screenshots 30.10.2026');
    assert.equal(f.evidence,'screenshot-observation');
    assert.equal(f.fertigungGeprueft,false);
    assert.ok(f.dimensionsMm.L1>0&&f.dimensionsMm.L2>0);
    assert.equal(f.visualSeams,shape==='L1'||shape==='L2'?1:2);
    assert.ok(f.todo.some(e=>/Verbinder|Fr.s/i.test(e)));
    assert.ok(f.todo.some(e=>/Mindest|Grenzen/i.test(e)));
    assert.ok(f.todo.some(e=>/Packst|Versand/i.test(e)));
    assert.ok(f.todo.some(e=>/Preis|EK/i.test(e)));
    if(shape==='L4'){
      assert.equal(f.B5OuterProjection,'model-derived-unverified');
      assert.ok(f.todo.some(e=>/B5/i.test(e)));
    }
    assert.ok(Object.isFrozen(f));
  }
});
test('the four independent screenshot witnesses agree with the current 2D preview coordinates but never approve production',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    const c=asConfig(shape),g=geometry(c),a=auditLReference(c,g);
    assert.equal(g.points.length,expected[shape].length);
    for(let i=0;i<g.points.length;i++)assert.ok(distance(g.points[i],expected[shape][i])<EPS,shape+' vertex '+i);
    assert.equal(a.shape,shape);
    assert.equal(a.matchedReference,true);
    assert.equal(a.geometryConsistent,true);
    assert.deepEqual(a.checks.filter(x=>!x.ok),[],shape+' consistency checks');
    assert.equal(a.status,'illustration-only');
    assert.equal(a.manufacturingReady,false);
    assert.equal(a.pricingReady,false);
    assert.equal(a.requiredProofs.length,L_REFERENCE_CASES[shape].todo.length);
    assert.equal(a.seams.length,L_REFERENCE_CASES[shape].visualSeams);
    assert.equal(a.regions.length,a.seams.length+1);
    assert.deepEqual([g.joints,g.shippingParts,g.supplierMappingVerified],[null,null,false]);
    assert.ok(a.seams.every(j=>j.from.every(Number.isFinite)&&j.to.every(Number.isFinite)));
  }
});
test('reference matching is exact: changed dimensions, thickness, decor or corners remain unreleased',()=>{
  const c=asConfig('L1'),g=geometry(c);
  for(const variant of [
    asConfig('L1',{dimensionsMm:{L1:2001}}),
    asConfig('L1',{material:'APL17.5'}),
    asConfig('L1',{decor:'U999'}),
    asConfig('L1',{lCorner:defaultLCorner('L1','left','chamfer_square')}),
  ]){
    const a=auditLReference(variant,geometry(variant));
    assert.equal(a.matchedReference,false);
    assert.equal(a.manufacturingReady,false);
    assert.equal(a.pricingReady,false);
  }
  // This audit is pure; auditing must not mutate the configuration or geometry.
  const oldConfig=structuredClone(c),oldGeometry=structuredClone(g);
  auditLReference(c,g);
  assert.deepEqual(c,oldConfig);assert.deepEqual(g,oldGeometry);
});
test('drifted seam, moved witness point and unverified production fields fail the audit',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    const c=asConfig(shape),g=geometry(c);
    const wrongSeam=structuredClone(g);
    wrongSeam.previewSeams[0].from=[-99999,-99999];
    const bad=auditLReference(c,wrongSeam);
    assert.equal(bad.geometryConsistent,false,shape+' bogus seam must fail');
    assert.ok(bad.checks.some(x=>x.id==='seam-ends-on-contour'&&!x.ok));
    assert.equal(bad.manufacturingReady,false);
    const wrongContour=structuredClone(g);
    wrongContour.points[0]=[wrongContour.points[0][0]+49,wrongContour.points[0][1]];
    assert.equal(auditLReference(c,wrongContour).geometryConsistent,false);
    const forged=structuredClone(g);
    forged.supplierMappingVerified=true;
    forged.joints=[{x:0,y:0}];
    forged.shippingParts=[1000];
    const invalid=auditLReference(c,forged);
    assert.equal(invalid.geometryConsistent,false);
    assert.ok(invalid.checks.some(x=>x.id==='production-unreleased'&&!x.ok));
  }
});
test('no source witness for other L4 B5 or L4 outer formula while numerical projection still computes',()=>{
  const c=asConfig('L4',{dimensionsMm:{B5:300}}),g=geometry(c),a=auditLReference(c,g);
  assert.equal(a.matchedReference,false);
  assert.equal(a.manufacturingReady,false);
  assert.ok(a.requiredProofs.some(v=>/B5/.test(v)));
  assert.ok(a.warnings.some(v=>/Modellannahme|nicht.*best.tigt/i.test(v)));
});
test('missing or unrelated families cannot borrow an L supplier record',()=>{
  assert.throws(()=>auditLReference({},{}),/L-Konfiguration|L-Form/);
  const straight=normalize({schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',material:'APL38',decor:'W980',corner:'square',dimensions:{L1:'2000',B1:'600'}});
  assert.throws(()=>auditLReference(straight,geometry(straight)),/L-Konfiguration|L-Form/);
});
test('human report includes exact case list, confirmation boundary and requested photographic evidence',()=>{
  const audits=['L1','L2','L3','L4'].map(shape=>{const c=asConfig(shape);return auditLReference(c,geometry(c));});
  const md=renderLAuditMarkdown(audits);
  assert.match(md,/Speedmaster-Fertigungsabgleich/);
  assert.match(md,/L1[\s\S]+L2[\s\S]+L3[\s\S]+L4/);
  assert.match(md,/keine Fertigungsfreigabe|keine CNC-Freigabe/i);
  assert.match(md,/B5/);
  assert.match(md,/464,45/);
  assert.match(md,/Speedmaster.*30\.10\.2026/);
  assert.doesNotMatch(md,/\\bfreigegeben\\b/i);
});
test('read-only CLI --check executes the audited fixtures without updating WordPress',()=>{
  const cmd=spawnSync(process.execPath,[new URL('../../scripts/l-supplier-audit.mjs',import.meta.url).pathname,'--check'],{encoding:'utf8',timeout:20000});
  assert.equal(cmd.status,0,cmd.stderr||cmd.stdout);
  assert.match(cmd.stdout,/L1.*OK/);
  assert.match(cmd.stdout,/L4.*OK/);
  assert.match(cmd.stdout,/0 Fertigungsfreigaben/);
});

test('supplier audit rejects vendor connector claims smuggled into picture-only seam data',()=>{
 for(const shape of ['L1','L2','L3','L4']){
  const config=asConfig(shape),drawing=geometry(config);
  const baseline=auditLReference(config,drawing);
  assert.ok(baseline.checks.some(check=>check.id==='seam-evidence-unapproved'&&check.ok),shape);
  for(const key of ['connectorType','connectorCount','machiningCoordinates']){
   const tampered=structuredClone(drawing);
   tampered.previewSeamDetails[0][key]=key==='connectorType'?'lamello':key==='connectorCount'?3:[[25,25]];
   const audit=auditLReference(config,tampered);
   assert.equal(audit.geometryConsistent,false,shape+' forged '+key);
   assert.ok(audit.checks.some(check=>check.id==='seam-evidence-unapproved'&&!check.ok));
   assert.equal(audit.manufacturingReady,false);
  }
  const moved=structuredClone(drawing);
  moved.previewSeamDetails[0].from=[-1,-1];
  assert.equal(auditLReference(config,moved).geometryConsistent,false,'seam metadata must match drawn line');
 }
});


test('PR49: L4 audit keeps lower visual Stoß B when upper piece vanishes after PR48',()=>{
 const c=normalize({
  schemaVersion:2,inputUnit:'mm',product:'l',geometry:'L4',
  corner:'square',material:'APL38',decor:'W980',quantity:1,
  dimensions:{L1:'950',L2:'2000',B1:'300',B2:'300',B3:'950',B4:'950',B5:'300'},
  lCorner:defaultLCorner('L4')
 });
 const g=geometry(c),result=auditLReference(c,g);
 assert.deepEqual(g.previewSeamDetails.map(s=>s.id),['seam-2']);
 assert.equal(result.matchedReference,false,'this synthetic input is not a supplier witness');
 assert.equal(result.geometryConsistent,true,'valid visual-only seam B must not fail the old sequential-ID assumption');
 assert.deepEqual(result.checks.filter(x=>!x.ok),[]);
 assert.equal(result.manufacturingReady,false);
 const impostor=structuredClone(g);
 impostor.previewSeamDetails[0].id='seam-1';
 assert.equal(auditLReference(c,impostor).geometryConsistent,false,'renaming B to A must be detected');
});
