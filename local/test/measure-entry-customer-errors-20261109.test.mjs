import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {firstMeasureIssue,firstCornerIssue,isUnfinishedCmEntry} from '../core/measure-feedback.mjs';
import {lDefaultDimensions,lCornerKeys} from '../core/l-geometry.mjs';
import {uCornerKeys} from '../core/u-corners.mjs';
import {straightCorner} from '../core/straight-corners.mjs';
import {normalize} from '../core/config.mjs';

const shapes=['straight','L1','L2','L3','L4','U1','U2','U3','U4'];
const types=['round','chamfer_square','chamfer_continuous'];
const sides=['left','right','both'];
function dims(shape){
  if(shape==='straight')return {L1:'200',B1:'60'};
  if(shape[0]==='L')return lDefaultDimensions(shape);
  return {L1:'200',L2:'120',L3:'180',B1:'60',B2:'60',B3:'60'};
}
function product(shape){return shape==='straight'?'straight':shape[0].toLowerCase();}
function keys(shape,side,type){
  return shape==='straight'?straightCorner(side,type).parameters
    :shape[0]==='L'?lCornerKeys(shape,side,type):uCornerKeys(side,type);
}
const context=(shape,side,type,values)=>({side,treatment:type,values,material:'APL38',decor:'W980'});
const mm=value=>String(Number(value.replace(',','.'))*10);
function raw(shape,d,side,type,values){
  const p=product(shape),params=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,mm(v)]));
  return {
    schemaVersion:2,inputUnit:'mm',product:p,geometry:shape,corner:'square',
    dimensions:Object.fromEntries(Object.entries(d).map(([k,v])=>[k,mm(v)])),
    material:'APL38',decor:'W980',quantity:1,edge:'matching-1.5',
    ...(p==='straight'
      ?{straightCorner:{side,treatment:type,parameters:params}}
      :p==='l'?{lCorner:{side,treatment:type,parameters:params}}
        :{uCorner:{side,treatment:type,parameters:params}})
  };
}
test('Every family, variant, side and treatment has safe valid defaults and customer wording for bad values',()=>{
  let cases=0;
  for(const shape of shapes)for(const side of sides)for(const type of types){
    const d=dims(shape),names=keys(shape,side,type);
    const v=Object.fromEntries(names.map(k=>[k,type==='round'?'10':'15']));
    const c=context(shape,side,type,v);
    assert.equal(firstMeasureIssue(product(shape),shape,d,{material:'APL38'}),null,shape+' base valid');
    assert.equal(firstCornerIssue(product(shape),shape,d,c),null,shape+'/'+side+'/'+type+' valid');
    assert.doesNotThrow(()=>normalize(raw(shape,d,side,type,v)),shape+' server-like JS V2 accepts standard machining');
    const key=names.at(-1);
    const broken={...v,[key]:type==='round'?'0,1':'1'};
    const issue=firstCornerIssue(product(shape),shape,d,context(shape,side,type,broken));
    assert.ok(issue,shape+'/'+side+'/'+type+' identifies invalid '+key);
    assert.equal(issue.key,(shape==='straight'?'':'corner-')+key);
    assert.match(issue.message,new RegExp('\\('+key+'\\)'));
    assert.doesNotMatch(issue.message,/corner-|nur Vorschau|Fertigungsfreigabe|Herstellerfreigabe|Speedmaster|\\bmm\\b/i);
    assert.match(issue.message,/cm|Zentimeter|Plattenmaße/);
    assert.throws(()=>normalize(raw(shape,d,side,type,broken)),shape+' must still reject invalid corner');
    const decimal={...v,[key]:'15,5'};
    const fractional=firstCornerIssue(product(shape),shape,d,context(shape,side,type,decimal));
    assert.match(fractional?.message??'',/ganze Zentimeter|Erlaubt sind/i,shape+' cm input step');
    const empty={...v,[key]:''};
    const missing=firstCornerIssue(product(shape),shape,d,context(shape,side,type,empty));
    assert.match(missing?.message??'',/Bitte eine Zahl in cm eingeben/);
    cases++;
  }
  assert.equal(cases,81);
});
test('L4 base diagonal B5 and right-corner B6 use separate labels, right L6 is described without internal error code',()=>{
  const d=lDefaultDimensions('L4');
  const v={L6:'1',B6:'15'};
  const issue=firstCornerIssue('l','L4',d,context('L4','right','chamfer_square',v));
  assert.equal(issue.key,'corner-L6');
  assert.match(issue.message,/Rechte Ecke · Länge \(L6\): Erlaubt sind 6–\d+ cm\./);
  assert.equal(isUnfinishedCmEntry('1',issue),true,'1 is a valid prefix of 15 during typing');
  assert.equal(isUnfinishedCmEntry('1,',issue),true,'decimal separator while typing is incomplete');
  assert.equal(isUnfinishedCmEntry('1,5',issue),false,'decimal finished cannot satisfy whole-cm corner step');
  assert.equal(isUnfinishedCmEntry('999',issue),false,'obviously invalid entry is not soft');
});
test('Incomplete prefix is only softened when it can still become a valid value',()=>{
  const b2={key:'B2',message:'B2: Erlaubt sind 6–50 cm.',minMm:60,maxMm:500};
  assert.equal(isUnfinishedCmEntry('51',b2),false,'51 can never become <=50');
  assert.equal(isUnfinishedCmEntry('5',b2),true,'5 could become 50');
  assert.equal(isUnfinishedCmEntry('',b2),true);
  assert.equal(isUnfinishedCmEntry('abc',b2),false);
  assert.equal(isUnfinishedCmEntry('51,5',b2),false);
  const depth={key:'B1',minMm:300,maxMm:900};
  assert.equal(isUnfinishedCmEntry('3',depth),true);
  assert.equal(isUnfinishedCmEntry('1',depth),false,'1 cannot prefix 30..90');
  assert.equal(isUnfinishedCmEntry('90',depth),false,'valid numbers have no error in the first place');
});
test('A valid field stays valid when switching material/decor and invalid neighbor base measures take priority',()=>{
  const d=lDefaultDimensions('L3');
  const issue=firstMeasureIssue('l','L3',{...d,B3:'99',B4:'105'}, {material:'APL38'});
  assert.equal(issue,null,'base UX uses the visible linked width; linked copy happens at input dispatch');
  const corner=firstCornerIssue('l','L3',d,{...context('L3','both','round',{R1:'10',R2:'10'}),decor:'F128',material:'APL17.5'});
  assert.equal(corner,null);
  const bad={...d,B5:'200,2'};
  const base=firstMeasureIssue('l','L4',bad);
  assert.equal(base?.key,'B5');
  assert.equal(firstCornerIssue('l','L4',bad,context('L4','right','chamfer_square',{L6:'15',B6:'15'})),null,
    'base field owns its own error; corner validator should not invent corner limits from invalid input');
});

test('Customer storefront never echoes raw supplier/preview errors; invalid size can return from step 1 to editable step 2',async()=>{
  const source=await readFile(new URL('../public/component.mjs',import.meta.url),'utf8');
  const bundled=await readFile(new URL('../../wordpress/hpz-apl-admin-preview/assets/component.js',import.meta.url),'utf8');
  for(const c of [source,bundled]){
    assert.match(c,/firstCornerIssue\(product,variants\[product\],currentDimensions\(\),\{\.\.\.corners,material,decor\}\)/);
    assert.match(c,/isUnfinishedCmEntry\(rawValue,issue\)/);
    assert.match(c,/\$\('next'\)\.disabled=!valid&&step!==0/);
    assert.match(c,/\$\('next'\)\.addEventListener\('click',\(\)=>\{if\(!valid&&step!==0\)return/);
    assert.match(c,/retryPriceButton\.hidden=!!issue/);
    assert.doesNotMatch(c,/customerMeasureError\(result\.quote\.message/);
    assert.doesNotMatch(c,/customerMeasureError\(result\.quote\.availabilityNote/);
  }
});
