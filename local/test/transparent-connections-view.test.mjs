import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

function example(product,shape){
 const dims=product==='u'
   ?{L1:1899,L2:1200,L3:1800,B1:600,B2:600,B3:600}
   :shape==='L4'
     ?{L1:2000,L2:1700,B1:600,B2:600,B3:900,B4:900,B5:440}
     :shape==='L3'
       ?{L1:2000,L2:1700,B1:600,B2:600,B3:900,B4:900}
       :{L1:2000,L2:1700,B1:600,B2:600};
 return normalize({
  schemaVersion:2,inputUnit:'mm',product,geometry:shape,corner:'square',
  dimensions:Object.fromEntries(Object.entries(dims).map(([k,v])=>[k,String(v)])),material:'APL38',decor:'H1145',edge:'matching-1.5',quantity:1,
  ...(product==='l'?{lCorner:{side:'none',treatment:null,parameters:{}}}
    :{uCorner:{side:'none',treatment:null,parameters:{}}})
 });
}

test('all four L and U joins: normal unchanged, connection view uses only configured seam vectors',()=>{
 for(const [product,shapes] of [['l',['L1','L2','L3','L4']],['u',['U1','U2','U3','U4']]]){
  for(const shape of shapes){
   const g=geometry(example(product,shape));
   const standard=svg(g,'',{decor:'H1145',partsView:false,transparentView:false,showDimensions:true});
   const visible=svg(g,'',{decor:'H1145',partsView:true,transparentView:true,showDimensions:true});
   const overlays=[...visible.matchAll(/class="apl-schematic-hardware" data-seam-id="([^"]+)"/g)];
   assert.ok((g.previewSeams??[]).length>0,shape+' has documented schematic joints');
   assert.equal(overlays.length,g.previewSeams.length,shape+' only actual selected joins get symbols');
   assert.deepEqual(overlays.map(x=>x[1]),g.previewSeamDetails.map(x=>x.id));
   assert.match(visible,/class="apl-schematic-biscuit"/,shape+' golden ovals');
   assert.match(visible,/class="apl-schematic-clamp"/,shape+' dark worktop ties');
   assert.match(visible,/data-illustration-only="true"/,shape+' visibly non-CNC');
   assert.match(standard,/class="apl-surface"[^>]*fill-opacity="1"/);
   assert.match(visible,/class="apl-surface"[^>]*fill-opacity="\.25"/);
   assert.match(visible,/class="apl-part-overlays"/);
   assert.match(visible,/class="apl-preview-seam"/);
   assert.match(visible,/class="apl-measure"/,shape+' dimensions stay visible');
   assert.doesNotMatch(standard,/class="apl-schematic-(?:hardware|biscuit|clamp)"/,
     shape+' default excludes all hardware');
   assert.doesNotMatch(standard,/data-connector-verified="true"/);
  }
 }
});

test('straight never draws connector symbols even if view flags are supplied',()=>{
 const c=normalize({
   schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',
   dimensions:{L1:'1899',B1:'600'},corner:'square',material:'APL38',
   edge:'matching-1.5',decor:'H1145',quantity:1,
   straightCorner:{side:'none',treatment:null,parameters:{}}
 });
 const g=geometry(c);
 const rendered=svg(g,'',{partsView:true,transparentView:true});
 assert.doesNotMatch(rendered,/class="apl-schematic-(?:hardware|biscuit|clamp)"/);
});

test('header switch is accessible, preserves state across variant changes and does not touch pricing',async()=>{
 const source=await readFile(new URL('../public/component.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../../design/kuechenstudio-060.css',import.meta.url),'utf8');
 assert.match(source,/transparentToggle\.addEventListener\('click'/);
 assert.match(source,/\$\('preview-material'\)\.after\(transparentToggle\)/);
 assert.doesNotMatch(source,/\$\('enlarge'\)\.before\(transparentToggle\)/);
 assert.match(source,/transparentToggle\.hidden=product==='straight'/);
 assert.match(source,/lastViewProduct!==product/);
 assert.match(source,/showDimensions:step>=1&&showDimensions,partsView:view==='parts'/);
 assert.match(source,/transparentView:view==='parts'/);
 assert.match(source,/aria-pressed/);
 assert.match(source,/Verbindungen schematisch dargestellt/);
 assert.match(css,/\.stage-caption>\.apl-transparent-toggle/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto/);
 assert.doesNotMatch(source,/transparentToggle\.addEventListener\('click'[\s\S]{0,350}refresh\(\)/,
  'visual toggle must not call commercial price backend');
});
