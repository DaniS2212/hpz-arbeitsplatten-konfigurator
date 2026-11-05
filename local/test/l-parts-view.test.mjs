import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';
import {lDefaultDimensions,defaultLCorner} from '../core/l-geometry.mjs';

function make(shape, side='none', treatment=null, dimensions=null) {
  const source=dimensions??lDefaultDimensions(shape);
  const config=normalize({
    schemaVersion:2,inputUnit:'mm',product:'l',geometry:shape,corner:'square',
    material:'APL38',decor:'W980',quantity:1,
    dimensions:Object.fromEntries(Object.entries(source).map(([key,value])=>[key,String(Number(value)*10)])),
    lCorner:defaultLCorner(shape,side,treatment)
  });
  return geometry(config);
}
function area(poly) {
  return Math.abs(poly.reduce((v,p,i)=>{
    const q=poly[(i+1)%poly.length];
    return v+p[0]*q[1]-p[1]*q[0];
  },0))/2;
}
function assertParts(shape,g,expected) {
  assert.ok(Array.isArray(g.previewParts),shape+' needs a parts view, not just dashed seams');
  assert.deepEqual(g.previewParts.map(p=>p.id),expected);
  assert.equal(g.previewParts.length,g.previewSeams.length+1);
  for(const [index,part] of g.previewParts.entries()){
    assert.equal(part.number,index+1);
    assert.ok(part.label.length>=8);
    assert.equal(part.status,'illustration-only');
    assert.ok(part.polygon.length>=3);
    assert.ok(part.polygon.every(p=>p.length===2&&p.every(Number.isFinite)));
    assert.ok(area(part.polygon)>1000,shape+' '+part.id+' must have positive projected area');
    assert.ok(part.marker.every(Number.isFinite));
  }
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
  assert.equal(g.supplierMappingVerified,false);
}
test('L1 and mirrored L2 have two distinct visible part regions and no supplier release',()=>{
  for(const shape of ['L1','L2']){
    const g=make(shape);
    assertParts(shape,g,['top','leg']);
    assert.ok(Math.abs(g.previewParts.reduce((a,p)=>a+area(p.polygon),0)-2_160_000)<.01);
    assert.deepEqual(g.previewParts.map(p=>p.label),shape==='L1'
      ?['Obere Strecke','Linker Schenkel']:['Obere Strecke','Rechter Schenkel']);
  }
});
test('L3/L4 have a separate corner region, no overlapping or missing projected surface',()=>{
  for(const shape of ['L3','L4']){
    const g=make(shape);
    assertParts(shape,g,['top','corner','leg']);
    const total=g.previewParts.reduce((v,p)=>v+area(p.polygon),0);
    assert.ok(Math.abs(total-g.areaMm2)<.01,shape+' pieces must cover the projected entire plate');
    if(shape==='L3') assert.equal(total,2_085_000);
  }
});
test('all ten L corner selections preserve exact preview-only part regions and cutting locks',()=>{
  for(const shape of ['L1','L2','L3','L4']){
    const expected=['L1','L2'].includes(shape)?['top','leg']:['top','corner','leg'];
    for(const side of ['none','left','right','both'])
      for(const treatment of side==='none'?[null]:['round','chamfer_square','chamfer_continuous']){
        const g=make(shape,side,treatment);
        assertParts(shape,g,expected);
        assert.ok(g.previewParts.every(p=>p.polygon.length>=3));
      }
  }
});
test('L4 part projections also remain valid when outer diagonal crosses top and left edges earlier',()=>{
  const g=make('L4','none',null,{L1:'200',L2:'200',B1:'30',B2:'30',B3:'95',B4:'95',B5:'30'});
  assertParts('L4',g,['top','corner','leg']);
  assert.ok(Math.abs(g.previewParts.reduce((a,p)=>a+area(p.polygon),0)-g.areaMm2)<.01);
});
test('L4 Speedmaster minimum extent has no imaginary zero-area pieces or external-border seams',()=>{
  const g=make('L4','none',null,{L1:'95',L2:'95',B1:'30',B2:'30',B3:'95',B4:'95',B5:'30'});
  assertParts('L4',g,['corner']);
  assert.equal(g.previewSeams.length,0);
  assert.ok(Math.abs(area(g.previewParts[0].polygon)-g.areaMm2)<.01);
  assert.equal((svg(g,'',{partsView:true,showDimensions:false}).match(/class="apl-preview-part"/g)||[]).length,1);
});
test('parts view shows numbered, selectively highlighted regions, but no cutting dimensions',()=>{
  const g=make('L4');
  const normal=svg(g,'L1',{unit:'cm',partsView:false});
  const parts=svg(g,'L1',{unit:'cm',showDimensions:false,partsView:true,selectedPart:'corner'});
  assert.doesNotMatch(normal,/class="apl-preview-part"/);
  assert.match(parts,/id="apl-parts-clip"/);
  assert.match(parts,/data-part-id="top" data-selected="false"/);
  assert.match(parts,/data-part-id="corner" data-selected="true"/);
  assert.match(parts,/data-part-id="leg" data-selected="false"/);
  assert.equal((parts.match(/class="apl-preview-part"/g)||[]).length,3);
  assert.equal((parts.match(/class="apl-part-number"/g)||[]).length,3);
  assert.equal((parts.match(/class="apl-preview-seam"/g)||[]).length,2);
  assert.doesNotMatch(parts,/class="apl-measure"/);
  assert.match(parts,/Ungepr.fte Vorschau, keine Fertigungszeichnung/);
  assert.equal(g.joints,null);
  assert.equal(g.shippingParts,null);
});
test('straight and U2 remain untouched when asking for parts view',()=>{
  const u=normalize({
    schemaVersion:2,inputUnit:'mm',product:'u',geometry:'U2',corner:'square',
    material:'APL38',decor:'W980',quantity:1,
    dimensions:{L1:'2500',L2:'1800',L3:'1800',B1:'600',B2:'600',B3:'600'}
  });
  const g=geometry(u),html=svg(g,'L1',{partsView:true,selectedPart:'top'});
  assert.equal(g.previewParts,undefined);
  assert.doesNotMatch(html,/apl-preview-part/);
});
