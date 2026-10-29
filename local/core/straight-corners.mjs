// Names from Phase A1. IDs are internal, NOT supplier drawing numbers.
export const sides = Object.freeze({none:'Keine',left:'Vorne links',right:'Vorne rechts',both:'Beide vorderen Ecken'});
export const treatments = Object.freeze({round:'Abgerundet',chamfer_square:'Abgeschrägt – eckige Ausführung',chamfer_continuous:'Abgeschrägt – Vorderkante durchlaufend'});
export const straightCorners = Object.freeze([
  Object.freeze({id:'none',side:'none',treatment:null,drawing:null,parameters:[],status:'base-preview'}),
  ...['left','right','both'].flatMap(side=>Object.keys(treatments).map(treatment=>Object.freeze({
    id:`${side}_${treatment}`,side,treatment,drawing:null,
    parameters:treatment==='round'?(side==='left'?['R1']:side==='right'?['R2']:['R1','R2']):
      (side==='left'?['L2','B2']:side==='right'?['L3','B3']:['L2','B2','L3','B3']),
    status:treatment==='round'?'contour-understood':treatment==='chamfer_square'?'diagonal-preview':'schematic-preview'
  })))
]);
export function straightCorner(side,treatment){
  if(!Object.hasOwn(sides,side))throw new Error('Unbekannte Bearbeitungsseite.');
  if(side==='none'){
    if(treatment!==null)throw new Error('Ohne Bearbeitung ist keine Bearbeitungsart zulässig.');
    return straightCorners[0];
  }
  const result=straightCorners.find(v=>v.side===side&&v.treatment===treatment);
  if(!result)throw new Error('Unzulässige Eckkombination.');
  return result;
}
const floor10=value=>Math.max(0,Math.floor(value/10)*10);
export function defaultCornerParameters(side,treatment){
  const variant=straightCorner(side,side==='none'?null:treatment);
  return Object.fromEntries(variant.parameters.map(key=>[key,treatment==='round'?'100':'150']));
}
// Conservative caps inside the pictured Speedmaster range:
 // supplier L1 200–4050, B1 200–900, L2/L3 60–1950, B2/B3 60–550 mm.
export const straightShopLimits=Object.freeze({L1:{min:1000,max:4000},B1:{min:300,max:900}});
export const continuousShopLimits=Object.freeze({lengthMin:60,lengthMax:1800,depthMin:60,depthMax:500,frontMin:100,backMin:100});
// Square cuts retain the previously observed 1.40 slope cap.
export function cornerLimits(side,treatment,dimensions,parameters={}){
  const variant=straightCorner(side,treatment),{L1:w,B1:d}=dimensions,fields={};
  let enabled=true,reason='';
  const value=key=>Number.isFinite(Number(parameters[key]))?Number(parameters[key]):0;
  if(w<straightShopLimits.L1.min||w>straightShopLimits.L1.max||d<straightShopLimits.B1.min||d>straightShopLimits.B1.max){
    enabled=false;reason='Für die Gerade sind 100–400 cm Länge und 30–90 cm Tiefe vorgesehen.';
  }
  for(const key of variant.parameters){
    const left=['R1','L2','B2'].includes(key),opposite=left?'L3':'L2';
    if(key.startsWith('R')){
      fields[key]={min:side==='left'&&w===2000&&d===600?50:10,max:floor10(Math.min(d-1,w-value(left?'R2':'R1')-100)),step:10};
    }else if(key.startsWith('L')){
      fields[key]={min:60,max:floor10(Math.min(w-value(opposite)-100,1800,
        treatment==='chamfer_square'?1.4*value(left?'B2':'B3'):Infinity)),step:10};
    }else{
      fields[key]={min:60,max:floor10(Math.min(d-100,500)),step:10};
    }
  }
  return {enabled,reason,fields,minFrontMm:100,minBackMm:100,source:'speedmaster-conservative-shop-102'};
}
export function validateStraightCorner(raw,convert,dimensions,{millimetres=false}={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['side','treatment','parameters'].includes(k)))throw new Error('Ungültige Eckauswahl.');
  const variant=straightCorner(raw.side,raw.treatment);
  // Legacy cm requests keep their old behavior. New chamfer previews require an
  // explicit version 2 / mm contract; old saved input cannot silently change units.
  if(!millimetres&&variant.treatment?.startsWith('chamfer'))throw new Error('Konturvorschau für Abschrägungen erfordert die explizite Millimeter-Eingabeversion 2.');
  const values=raw.parameters??{};
  if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).some(k=>!variant.parameters.includes(k)))throw new Error('Unpassende alte Eckmaße bitte entfernen.');
  const parameters=Object.fromEntries(variant.parameters.map(k=>[k,convert(values[k])]));
  if(millimetres){
    const limits=cornerLimits(variant.side,variant.treatment,dimensions,parameters);
    if(!limits.enabled)throw new Error(limits.reason);
    for(const [key,value] of Object.entries(parameters)){
      const limit=limits.fields[key];
      if(value%limit.step!==0)throw new Error(`${key}: Bitte in ${limit.step}-mm-Schritten eingeben. Es wird nichts automatisch gerundet.`);
      if(value<limit.min||value>limit.max)throw new Error(`${key}: In dieser Konfiguration ${limit.min}–${limit.max} mm zulässig (konservative Vorschaugrenze).`);
    }
    return {id:variant.id,side:variant.side,treatment:variant.treatment,parameters};
  }
  for(const [key,value] of Object.entries(parameters)){
    if(value>=dimensions.B1)throw new Error(`${key}: Radius muss kleiner als die Plattentiefe sein.`);
  }
  if((parameters.R1??0)+(parameters.R2??0)>=dimensions.L1)throw new Error('Die Rundungen lassen keine gerade Vorderkante übrig. Radien verkleinern.');
  if(variant.side==='left'&&variant.treatment==='round'&&dimensions.L1===2000&&dimensions.B1===600&&parameters.R1<50)throw new Error('R1: Für den bestätigten Referenzfall 2000 × 600 mm sind 50–599 mm belegt.');
  return {id:variant.id,side:variant.side,treatment:variant.treatment,parameters};
}
