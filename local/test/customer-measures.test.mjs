import test from 'node:test';
import assert from 'node:assert/strict';
import {cmInputToMmText,mmToCmText,cmRange,customerMeasureError} from '../core/customer-measures.mjs';
import {normalize} from '../core/config.mjs';
import {geometry,svg} from '../core/geometry.mjs';

test('centimetre entry has exact integer-mm V2 handoff at V3 boundaries',()=>{
 for(const [cm,mm] of [['250','2500'],['250,1','2501'],['278','2780'],['278.1','2781'],['88','880'],['88,1','881'],['0,1','1']]){
  assert.equal(cmInputToMmText(cm),mm);assert.equal(mmToCmText(Number(mm)),cm.replace('.',','));
 }
 for(const value of ['250,01','250.12','1e3','NaN','-2',''])assert.throws(()=>cmInputToMmText(value));
 assert.equal(cmRange(60,550,10),'6–55 cm · 1-cm-Schritte');
 assert.match(customerMeasureError('Vorerst nur 2000 × 600 mm, 60–500 mm.'),/200 × 60 cm, 6–50 cm/);
 assert.match(customerMeasureError('1,5 mm Dickkante'),/1,5 mm Dickkante/);
 const raw={schemaVersion:2,inputUnit:'mm',product:'straight',geometry:'straight',corner:'square',material:'APL38',decor:'W980',quantity:1,dimensions:{L1:cmInputToMmText('250,1'),B1:cmInputToMmText('88,1')},straightCorner:{side:'none',treatment:null,parameters:{}}};
 const config=normalize(raw);assert.deepEqual(config.dimensions,{L1:2501,B1:881});
 const drawing=svg(geometry(config),'',{unit:'cm'});assert.match(drawing,/L1: 250,1 cm/);assert.match(drawing,/B1: 88,1 cm/);assert.match(drawing,/Maße in Zentimetern/);
});
