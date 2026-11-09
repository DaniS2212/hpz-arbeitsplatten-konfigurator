import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {uSplitModes} from '../core/u1-geometry.mjs';
import {uCornerKeys,defaultUCorner,uCornerPreviewLimits} from '../core/u-corners.mjs';
const dimensions={L1:'2000',L2:'1200',L3:'1800',B1:'600',B2:'600',B3:'600'};
const make=(shape='U1',uCorner={side:'none',treatment:null,parameters:{}},more={})=>
 normalize({schemaVersion:2,inputUnit:'mm',product:'u',geometry:shape,
   corner:'square',material:'APL38',decor:'W980',edge:'matching-1.5',quantity:1,
   dimensions,...more,uCorner});
test('ten U1 Speedmaster selector choices are independent of U1-U4 join orientation',()=>{
 assert.equal(Object.keys(uSplitModes).length,4);
 for(const shape of Object.keys(uSplitModes)){
  const basic=make(shape);
  assert.equal(basic.uCorner,undefined,'base shape and old configuration fingerprint unchanged');
  assert.equal(geometry(basic).assemblyPhotoObservation?.status,'photo-observation-only');
  const joined=svg(geometry(basic),'',{unit:'cm',partsView:false});
  assert.equal((joined.match(/data-preview-join="u"/g)||[]).length,2,
   'both U joins visibly illustrated in regular top view');
  for(const side of ['left','right','both'])for(const type of
    ['round','chamfer_square','chamfer_continuous']){
   const corner=defaultUCorner(side,type);
   const c=make(shape,corner),g=geometry(c);
   assert.equal(g.uCorner.side,side);assert.equal(g.uCorner.treatment,type);
   assert.ok(g.version.includes('inner-corner-preview'));
   assert.equal(g.assemblyPhotoObservation,null);
   assert.equal(g.previewSeams.length,2);
   assert.deepEqual(g.previewSeamDetails.map(x=>x.direction),uSplitModes[shape]);
   assert.ok(g.areaMm2<geometry(basic).areaMm2);
   assert.equal(g.shippingParts,null);assert.equal(g.supplierMappingVerified,false);
   const expectedCount=side==='both'?2:1;
   assert.equal(g.cornerArcs.length,type==='round'?expectedCount:0);
   assert.equal(g.cornerCuts?.length,type==='round'?0:expectedCount);
   const want=type==='round'?(side==='both'?['corner-R1','corner-R2']:
      ['corner-'+(side==='left'?'R1':'R2')])
     :uCornerKeys(side,type).map(k=>'corner-'+k);
   for(const field of want)assert.match(svg(g,field,{unit:'cm'}),new RegExp('data-field="'+field+'" data-active="true"'));
   assert.ok(g.path.startsWith('M 0 0 L 2000 0'),
    'never cut the OUTER upper-left corner for an U inner-foot option');
  }
 }
});
test('U1 left and right inner feet are the only chamfered vertices',()=>{
 const u=make('U1',{side:'both',treatment:'chamfer_square',
   parameters:{L4:'150',B4:'150',L5:'150',B5:'150'}});
 const g=geometry(u);
 assert.deepEqual(g.cornerCuts.map(x=>x.side),['right','left']);
 assert.deepEqual(g.cornerCuts.find(x=>x.side==='left').from,[600,1050]);
 assert.deepEqual(g.cornerCuts.find(x=>x.side==='left').to,[450,1200]);
 assert.deepEqual(g.cornerCuts.find(x=>x.side==='right').from,[1550,1800]);
 assert.deepEqual(g.cornerCuts.find(x=>x.side==='right').to,[1400,1650]);
 assert.equal(g.areaMm2,2280000-2*(150*150/2));
 assert.equal((g.path.match(/ L /g)||[]).length>7,true);
});
test('U inner-foot size bounds and strict namespace forbid silent base pricing',()=>{
 const base=make('U1');
 const d=base.dimensions,b=uCornerPreviewLimits(d,'left','chamfer_square').fields;
 assert.equal(b.B4.min,60);assert.equal(b.B4.max,590);
 assert.equal(b.L4.max,590);
 const bad=defaultUCorner('left','chamfer_square');bad.parameters.B4='600';
 assert.throws(()=>make('U1',bad),/corner-B4.*Erlaubt/);
 assert.throws(()=>make('U1',{side:'left',treatment:'round',parameters:{R2:'100'}}),/Maßfelder/);
 assert.throws(()=>make('U1',{side:'none',treatment:'round',parameters:{}}),/Ohne Bearbeitung/);
 assert.throws(()=>normalize({
  schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',
  corner:'square',material:'APL38',decor:'W980',quantity:1,
  dimensions:{L1:'2000',B1:'600'},
  uCorner:{side:'left',treatment:'round',parameters:{R1:'100'}}
 }),/U-Eckbearbeitung/,'U corner must not be accepted for straight products');
 assert.deepEqual(uCornerKeys('both','chamfer_continuous'),['L4','B4','L5','B5']);
});
test('UI source includes photo-readable U seam cards, separate sides and absolute schematic orientation',()=>{
 const s=readFileSync(new URL('../public/component.mjs',import.meta.url),'utf8');
 assert.match(s,/function uJoinIcon\(shape\)/);
 assert.match(s,/function renderUVariantCards\(\)/);
 assert.match(s,/function renderUChoices\(\)/);
 assert.match(s,/Welche innere Ecke bearbeiten\?/);
 assert.match(s,/Wo sollen die Stoßfugen liegen\?/);
 assert.match(s,/uCorner:\{side:uSide,treatment:uTreatment/);
 const css=readFileSync(new URL('../../design/kuechenstudio-060.css',import.meta.url),'utf8');
 assert.match(css,/\.u-variant-grid/);
});
test('U R1/R2 dimension labels avoid B2/B3 bottom rulers',()=>{
 const left=geometry(make('U1',defaultUCorner('left','round'))).cornerArcs[0];
 assert.equal(left.side,'left');
 assert.ok(left.labelAt[0]>600 && left.labelAt[0]<1400,'R1 annotation belongs in the white inner opening');
 assert.ok(left.labelAt[1]<1200 && left.labelAt[1]>600,
   'R1 annotation should be above B2 bottom rail but below top bar');
 const right=geometry(make('U1',defaultUCorner('right','round'))).cornerArcs[0];
 assert.equal(right.side,'right');
 assert.ok(right.labelAt[0]<1400 && right.labelAt[0]>600,'R2 annotation belongs in the opening');
 assert.ok(right.labelAt[1]<1800 && right.labelAt[1]>600,'R2 annotation avoids B3 bottom rail');
});
test('U continuous edge has soft presentation junctions but retains the exact numeric reference dimensions',()=>{
 const hard=geometry(make('U1',defaultUCorner('left','chamfer_square')));
 const soft=geometry(make('U1',defaultUCorner('left','chamfer_continuous')));
 assert.equal(hard.softIndices?.length??0,0);
 assert.equal(soft.softIndices.length,2,'transition at both diagonal endpoints');
 assert.equal(soft.contourStatus,'schematic','not a confirmed supplier radius');
 assert.equal(soft.areaMm2,hard.areaMm2,'no fabricated machining-based price or size change');
 assert.equal(soft.path,hard.path,'signed straight-cut reference shape unchanged');
 const hardSvg=svg(hard,'',{unit:'cm'}),softSvg=svg(soft,'',{unit:'cm'});
 assert.ok(!hardSvg.includes(' Q '),'hard chamfer remains angular');
 assert.ok(softSvg.includes(' Q '),'gentle visual blends in actual rendered surface path');
});

test('U B1 is internal like Speedmaster and L5 uses a true vertical right-side dimension',()=>{
 const basic=geometry(make('U2'));
 const depth=basic.dimensions.find(d=>d.id==='B1');
 assert.deepEqual(depth.from,[1000,0]);
 assert.deepEqual(depth.to,[1000,600]);
 assert.equal(depth.internal,true);
 assert.equal(depth.axis,'vertical');
 const markup=svg(basic,'B1',{unit:'cm'});
 assert.match(markup,/data-field="B1" data-active="true"/);
 assert.match(markup,/M 1000,0 L 1000,0 M 1000,600 L 1000,600/);
 const g=geometry(make('U4',defaultUCorner('both','chamfer_square')));
 const l5=g.cornerDimensions.find(d=>d.id==='corner-L5');
 const b5=g.cornerDimensions.find(d=>d.id==='corner-B5');
 assert.equal(l5.axis,'vertical');
 assert.deepEqual(l5.from,[1400,1650]);
 assert.deepEqual(l5.to,[1400,1800]);
 assert.equal(b5.axis,'horizontal');
 assert.deepEqual(b5.from,[1400,1800]);
 assert.deepEqual(b5.to,[1550,1800]);
 for(const d of ['L4','B4','L5','B5'])assert.match(svg(g,'corner-'+d,{unit:'cm'}),new RegExp('data-field="corner-'+d+'"'));
});
