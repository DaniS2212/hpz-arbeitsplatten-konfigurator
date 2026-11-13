import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

test('L1 transparency uses the existing part/seam overlay, never invented connectors',()=>{
 const c=normalize({schemaVersion:2,inputUnit:'mm',product:'l',geometry:'L1',corner:'square',
  dimensions:{L1:'2000',L2:'1700',B1:'600',B2:'600'},
  material:'APL38',decor:'H1145',quantity:1,
  lCorner:{side:'none',treatment:null,parameters:{}}});
 const g=geometry(c);
 const standard=svg(g,'',{decor:'H1145',partsView:false,transparentView:false});
 const preview=svg(g,'',{decor:'H1145',partsView:true,transparentView:true});
 assert.match(standard,/class="apl-surface"[^>]+fill-opacity="1"/);
 assert.match(preview,/class="apl-surface"[^>]+fill-opacity="\.25"/);
 assert.match(preview,/class="apl-part-overlays"/);
 assert.match(preview,/class="apl-preview-seam"/);
 assert.match(preview,/class="apl-part-number"/);
 assert.doesNotMatch(standard,/class="apl-part-overlays"/);
 assert.doesNotMatch(preview,/data-connector-verified="true"/);
});
test('toggle operates only on L/U view state without editing prices or dimensions',async()=>{
 const source=await readFile(new URL('../public/component.mjs',import.meta.url),'utf8');
 assert.match(source,/transparentToggle\.addEventListener\('click'/);
 assert.match(source,/transparentToggle\.hidden=product==='straight'/);
 assert.match(source,/view=view==='parts'\?'plan':'parts'/);
 assert.match(source,/transparentView:view==='parts'/);
 assert.match(source,/aria-pressed/);
 assert.match(source,/Dübel und Verbinderpositionen folgen nach Herstellerabgleich/);
});
