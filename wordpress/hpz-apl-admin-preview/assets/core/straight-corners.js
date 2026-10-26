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
// All caps below are SHOP PREVIEW RESTRICTIONS, not a supplier approval.
// 1.40 is intentionally below the reported supplier ratio 1.41.
export function cornerLimits(side,treatment,dimensions,parameters={}){
  const variant=straightCorner(side,treatment),{L1:w,B1:d}=dimensions,fields={};
  let enabled=true,reason='';
  const value=key=>Number.isFinite(Number(parameters[key]))?Number(parameters[key]):0;
  if(treatment==='chamfer_continuous'&&(w!==2000||d!==600)){
    enabled=false;reason='Durchlaufende Abschrägung vorerst nur in der Referenzgröße 2000 × 600 mm. Länge/Tiefe anpassen oder eine andere Bearbeitung wählen.';
  }
  if(treatment==='chamfer_square'&&(w<200||w>3010||d<200||d>1260)){
    enabled=false;reason='Eckige Abschrägung: Unser Vorschau-Prüfbereich ist 200–3010 mm Länge und 200–1260 mm Tiefe.';
  }
  for(const key of variant.parameters){
    const left=['R1','L2','B2'].includes(key),opposite=left?'L3':'L2';
    if(key.startsWith('R')){
      fields[key]={min:side==='left'&&w===2000&&d===600?50:10,max:floor10(Math.min(d-1,w-value(left?'R2':'R1')-50)),step:10};
    }else if(key.startsWith('L')){
      fields[key]={min:60,max:floor10(Math.min(w-value(opposite)-50,treatment==='chamfer_continuous'?500:1.4*value(left?'B2':'B3'))),step:10};
    }else{
      fields[key]={min:60,max:floor10(Math.min(d-50,treatment==='chamfer_continuous'?300:Infinity)),step:10};
    }
  }
  return {enabled,reason,fields,minFrontMm:50,minBackMm:50,source:'shop-preview-policy-v1'};
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
