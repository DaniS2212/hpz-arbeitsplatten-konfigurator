// Names from Phase A1. IDs are internal, NOT supplier drawing numbers.
export const sides = Object.freeze({none:'Keine',left:'Links',right:'Rechts',both:'Beide Seiten'});
export const treatments = Object.freeze({round:'Abgerundet',chamfer_square:'Abgeschrägt – eckige Ausführung',chamfer_continuous:'Abgeschrägt – Vorderkante durchlaufend'});
export const straightCorners = Object.freeze([
  Object.freeze({id:'none',side:'none',treatment:null,drawing:null,parameters:[],status:'base-preview'}),
  ...['left','right','both'].flatMap(side=>Object.keys(treatments).map(treatment=>Object.freeze({
    id:`${side}_${treatment}`,side,treatment,drawing:null,
    parameters:treatment==='round'?(side==='left'?['R1']:side==='right'?['R2']:['R1','R2']):
      treatment==='chamfer_square'?(side==='left'?['L2','B2']:side==='right'?['L3','B3']:['L2','B2','L3','B3']):null,
    status:treatment==='round'?'contour-understood':'missing-source'
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
export function validateStraightCorner(raw,convert,dimensions){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['side','treatment','parameters'].includes(k)))throw new Error('Ungültige Eckauswahl.');
  const variant=straightCorner(raw.side,raw.treatment);
  if(variant.status==='missing-source')throw new Error(`${sides[variant.side]} · ${treatments[variant.treatment]}: Originalzeichnung und technische Grenzen fehlen. Kontur und Sondermaße bleiben gesperrt.`);
  const values=raw.parameters??{};
  if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).some(k=>!variant.parameters.includes(k)))throw new Error('Unpassende alte Eckmaße bitte entfernen.');
  const parameters=Object.fromEntries(variant.parameters.map(k=>[k,convert(values[k])]));
  for(const [key,value] of Object.entries(parameters)){
    if(value>=dimensions.B1)throw new Error(`${key}: Radius muss kleiner als die Plattentiefe sein.`);
  }
  if((parameters.R1??0)+(parameters.R2??0)>=dimensions.L1)throw new Error('Die Rundungen lassen keine gerade Vorderkante übrig. Radien verkleinern.');
  if(variant.side==='left'&&variant.treatment==='round'&&dimensions.L1===2000&&dimensions.B1===600&&parameters.R1<50)throw new Error('R1: Für den bestätigten Referenzfall 2000 × 600 mm sind 50–599 mm belegt.');
  return {id:variant.id,side:variant.side,treatment:variant.treatment,parameters};
}
