import {validateStraightCorner} from './straight-corners.mjs';
const families = {
  straight: { label: 'Arbeitsplatte Gerade', geometries: ['straight'], fields: ['L1','B1'] },
  l: { label: 'Arbeitsplatte L-Form', geometries: ['L1','L2','L3','L4'], fields: ['L1','L2','B1','B2'] },
  u: { label: 'Arbeitsplatte U-Form', geometries: ['U1','U2','U3','U4'], fields: ['L1','L2','L3','B1','B2','B3'] }
};
const materials = [{id:'APL17.5',label:'APL 17,5 mm · beidseitig Schichtstoff',thicknessMm:17.5},
  {id:'APL38',label:'APL 38 mm',thicknessMm:38}];
const corners = [{id:'square',label:'Eckig'}, {id:'continuous',label:'Kante durchlaufend · Zuordnung offen'},
  {id:'round',label:'Abrundung · Eckmuster'}, {id:'chamfer',label:'Abschrägung · Eckmuster'}];
export function catalog() {
  return structuredClone({families,materials,corners,decors:[{id:'W980',label:'Platinweiß',surface:'W980 · ST7'}, {id:'H1145',label:'Bardolino Eiche',surface:'H1145 · ST10'}],
    geometries:Object.values(families).flatMap(f=>f.geometries.map(id=>({id,status:'unverified'})))});
}
function object(value) { return value!==null && typeof value==='object' && !Array.isArray(value); }
export function cmToMm(value) {
  if(typeof value!=='string' || !/^\d{1,5}(?:[.,]\d)?$/.test(value.trim()))
    throw new Error('Maß bitte in cm mit höchstens einer Nachkommastelle eingeben.');
  const [whole,fraction='0']=value.trim().replace(',','.').split('.');
  const mm=Number(whole)*10+Number(fraction);
  // Resource/precision ceiling, deliberately NOT a supplier manufacturing limit.
  if(mm<1 || mm>100000) throw new Error('Maß außerhalb des lokalen Prüfbereichs (1–100000 mm).');
  return mm;
}
export function normalize(raw) {
  if(!object(raw) || !Object.hasOwn(families,raw.product)) throw new Error('Unbekanntes Arbeitsplattenprodukt.');
  const family=families[raw.product];
  if(raw.straightCorner!==undefined){
    if(raw.product!=='straight')throw new Error('Gerade Eckauswahl gehört nicht zu L/U.');
    if(raw.corner!=='square'||(raw.special&&Object.keys(raw.special).length))throw new Error('Alte Eckmaße sind für diese Auswahl nicht zulässig.');
  }
  if(!family.geometries.includes(raw.geometry)) throw new Error('Geometrie gehört nicht zu diesem Produkt.');
  if(!materials.some(m=>m.id===raw.material)) throw new Error('Material nicht unterstützt.');
  if(!['W980','H1145'].includes(raw.decor)) throw new Error('Dekor noch nicht hinterlegt.');
  if(raw.edge!==undefined && raw.edge!=='matching-1.5') throw new Error('Nur Dickkante 1,5 mm dekorgleich vorgesehen.');
  if(!corners.some(c=>c.id===raw.corner)) throw new Error('Unbekannte Eckausführung.');
  if(!object(raw.dimensions) || Object.keys(raw.dimensions).some(k=>!family.fields.includes(k)))
    throw new Error('Unzulässige Maßfelder.');
  const dimensions=Object.fromEntries(family.fields.map(k=>[k,cmToMm(raw.dimensions[k])]));
  const straightCorner=raw.straightCorner===undefined?undefined:validateStraightCorner(raw.straightCorner,cmToMm,dimensions);
  let special={};
  if(['round','chamfer'].includes(raw.corner)) {
    if(!object(raw.special) || Object.keys(raw.special).some(k=>k!=='size')) throw new Error('Eckmaß fehlt oder ist unzulässig.');
    special={size:cmToMm(raw.special.size)};
  } else if(raw.special!==undefined && (!object(raw.special) || Object.keys(raw.special).length)) throw new Error('Eckmaß ist hier nicht zulässig.');
  const quantity=raw.quantity??1;
  if(!Number.isSafeInteger(quantity) || quantity<1 || quantity>1000) throw new Error('Menge muss eine ganze Zahl von 1 bis 1000 sein.');
  return {schemaVersion:1,product:raw.product,geometry:raw.geometry,corner:straightCorner?.treatment==='round'?'round':raw.corner,dimensions,
    ...(straightCorner?{straightCorner}:{}),
    special,material:raw.material,decor:raw.decor,edge:'matching-1.5',quantity};
}
