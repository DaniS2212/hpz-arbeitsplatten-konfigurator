import {validateStraightCorner,straightShopLimits} from './straight-corners.js?v=1.0.3';
import {validateLCorner,lDimensionKeys,validateLDimensions} from './l-geometry.js?v=1.0.3';
import {validateUCorner} from './u-corners.js?v=1.0.3';
import {DECOR_CATALOG,decorById} from './decor-catalog.js?v=1.0.3';
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
  return structuredClone({families,materials,corners,decors:DECOR_CATALOG.map(({id,displayName,imageFilename,thumbnailFilename})=>({id,label:displayName,imageFilename,thumbnailFilename})),
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
export function mmTextToMm(value){
  if(typeof value!=='string'||!/^\d{1,6}$/.test(value.trim()))throw new Error('Maß bitte als ganze Millimeter eingeben, zum Beispiel 2000.');
  const mm=Number(value.trim());
  if(mm<1||mm>100000)throw new Error('Maß außerhalb des Vorschau-Prüfbereichs (1–100000 mm).');
  return mm;
}
export function normalize(raw) {
  if(!object(raw) || !Object.hasOwn(families,raw.product)) throw new Error('Unbekanntes Arbeitsplattenprodukt.');
  const millimetres=raw.schemaVersion===2;
  if(millimetres?raw.inputUnit!=='mm':(raw.schemaVersion!==undefined&&raw.schemaVersion!==1)||(raw.inputUnit!==undefined&&raw.inputUnit!=='cm'))throw new Error('Eingabe-Version und Einheit passen nicht zusammen. Version 2 benötigt ausdrücklich Millimeter (mm).');
  const convert=millimetres?mmTextToMm:cmToMm;
  const family=families[raw.product];
  if(raw.straightCorner!==undefined){
    if(raw.product!=='straight')throw new Error('Gerade Eckauswahl gehört nicht zu L/U.');
    if(raw.corner!=='square'||(raw.special&&Object.keys(raw.special).length))throw new Error('Alte Eckmaße sind für diese Auswahl nicht zulässig.');
  }
  if(!family.geometries.includes(raw.geometry)) throw new Error('Geometrie gehört nicht zu diesem Produkt.');
  if(!materials.some(m=>m.id===raw.material)) throw new Error('Material nicht unterstützt.');
  const decor=decorById(raw.decor);
  if(!decor) throw new Error('Dekor noch nicht hinterlegt.');
  if(raw.edge!==undefined && raw.edge!=='matching-1.5') throw new Error('Nur Dickkante 1,5 mm dekorgleich vorgesehen.');
  if(!corners.some(c=>c.id===raw.corner)) throw new Error('Unbekannte Eckausführung.');
  const dimensionKeys=raw.product==='l'?lDimensionKeys(raw.geometry):family.fields;
  if(!object(raw.dimensions) || Object.keys(raw.dimensions).length!==dimensionKeys.length || Object.keys(raw.dimensions).some(k=>!dimensionKeys.includes(k)))
    throw new Error('Unzulässige oder fehlende Maßfelder.');
  const dimensions=Object.fromEntries(dimensionKeys.map(k=>[k,convert(raw.dimensions[k])]));
  if(raw.product==='l')validateLDimensions(raw.geometry,dimensions);
  if(millimetres&&raw.product==='straight'){
    if(dimensions.L1<straightShopLimits.L1.min||dimensions.L1>straightShopLimits.L1.max)
      throw new Error('L1: Länge zwischen 100 und 400 cm eingeben.');
    const depthMax=raw.straightCorner?.treatment==='chamfer_continuous'||raw.material==='APL38'?900:straightShopLimits.B1.max;
    if(dimensions.B1<straightShopLimits.B1.min||dimensions.B1>depthMax)
      throw new Error(`B1: Tiefe zwischen 30 und ${depthMax/10} cm eingeben.`);
  }
  const straightCorner=raw.straightCorner===undefined?undefined:validateStraightCorner(raw.straightCorner,convert,dimensions,{millimetres});
  if(raw.lCorner!==undefined&&raw.product!=='l')throw new Error('Diese L-Eckbearbeitung ist für das Produkt unzulässig.');
  if(raw.lCorner!==undefined&&(raw.corner!=='square'||raw.special!==undefined))throw new Error('Alte Eckmuster und L-Bearbeitung dürfen nicht kombiniert werden.');
  const lCorner=raw.lCorner===undefined?undefined:validateLCorner(raw.lCorner,convert,raw.geometry,{dimensions,material:raw.material,decor:decor.id});
  if(raw.uCorner!==undefined&&(raw.product!=='u'||raw.corner!=='square'||raw.special!==undefined))throw new Error('U-Eckbearbeitung nur für U-Formen.');
  const uCorner=raw.uCorner===undefined?undefined:validateUCorner(raw.uCorner,convert,dimensions);
  let special={};
  if(['round','chamfer'].includes(raw.corner)) {
    if(!object(raw.special) || Object.keys(raw.special).some(k=>k!=='size')) throw new Error('Eckmaß fehlt oder ist unzulässig.');
    special={size:convert(raw.special.size)};
    if(millimetres&&special.size%10)throw new Error('Eckmaß bitte in 10-mm-Schritten eingeben.');
  } else if(raw.special!==undefined && (!object(raw.special) || Object.keys(raw.special).length)) throw new Error('Eckmaß ist hier nicht zulässig.');
  const quantity=raw.quantity??1;
  if(!Number.isSafeInteger(quantity) || quantity<1 || quantity>1000) throw new Error('Menge muss eine ganze Zahl von 1 bis 1000 sein.');
  const corner=straightCorner?.treatment?{round:'round',chamfer_square:'chamfer',chamfer_continuous:'continuous'}[straightCorner.treatment]:raw.corner;
  return {schemaVersion:millimetres?2:1,...(millimetres?{unit:'mm'}:{}),product:raw.product,geometry:raw.geometry,corner,dimensions,
    ...(straightCorner?{straightCorner}:{}),
    ...(lCorner?{lCorner}:{}),
    ...(uCorner?.side!=='none'&&uCorner!==undefined?{uCorner}:{}),
    special,material:raw.material,decor:decor.id,decorSupplierCode:decor.supplierCode,edge:'matching-1.5',quantity};
}
