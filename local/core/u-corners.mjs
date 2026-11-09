/**
 * U1–U4 inner-foot corners (supplier U1 selection observed 09 Nov 2026).
 * The four join orientations are independent of left/right inner-foot edits.
 * Preview geometry only; no statement about CNC feasibility or price evidence.
 */
export const uCornerSides=Object.freeze({none:'Keine',left:'Links',right:'Rechts',both:'Beide'});
export const uCornerTreatments=Object.freeze({
 round:'Abgerundet',
 chamfer_square:'Abgeschrägt · eckig',
 chamfer_continuous:'Abgeschrägt · Kante durchlaufend'
});
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function uCornerKeys(side='none',treatment=null){
 if(!Object.hasOwn(uCornerSides,side))throw Error('U-Ecke: Seite unbekannt.');
 if(side==='none'){
  if(treatment!==null)throw Error('U-Ecke: Ohne Bearbeitung ist keine Art erlaubt.');
  return [];
 }
 if(!Object.hasOwn(uCornerTreatments,treatment))throw Error('U-Ecke: Bearbeitungsart unbekannt.');
 const left=treatment==='round'?['R1']:['L4','B4'];
 const right=treatment==='round'?['R2']:['L5','B5'];
 return side==='left'?left:side==='right'?right:[...left,...right];
}
export function defaultUCorner(side='none',treatment=null){
 return {side,treatment,parameters:Object.fromEntries(
  uCornerKeys(side,treatment).map(key=>[key,treatment==='round'?'100':'150']))};
}
const floor10=n=>Math.floor(Math.max(0,n)/10)*10;
// Pure drawing bounds, safely inside both adjacent REAL leg edges.
// Supplied Speedmaster screenshot shows 10 choices for U1 only; it does not
// provide general material/decor-specific factory bounds for U2–U4.
export function uCornerPreviewLimits(d,side,treatment){
 const keys=uCornerKeys(side,treatment),ranges={};
 const lengths={left:d.L2-d.B1,right:d.L3-d.B1};
 const widths={left:d.B2,right:d.B3};
 for(const key of keys){
  const which=['R1','L4','B4'].includes(key)?'left':'right';
  const available=key.startsWith('R')?Math.min(lengths[which],widths[which])
    :key.startsWith('L')?lengths[which]:widths[which];
  const min=key.startsWith('R')?10:60;
  const max=floor10(Math.min(key.startsWith('R')?1000:2000,available-10));
  ranges[key]={min,max,step:10};
 }
 return {status:'drawing-only',fields:ranges};
}
export function validateUCorner(raw,convert,dimensions){
 if(!isObj(raw)||Object.keys(raw).some(k=>!['side','treatment','parameters'].includes(k))
    ||!isObj(raw.parameters))throw Error('U-Ecke: Ungültige Eingaben.');
 const keys=uCornerKeys(raw.side,raw.treatment);
 if(Object.keys(raw.parameters).sort().join('|')!==[...keys].sort().join('|'))
  throw Error('U-Ecke: Maßfelder passen nicht zur gewählten Bearbeitung.');
 const parameters=Object.fromEntries(keys.map(k=>[k,convert(raw.parameters[k])]));
 const bounds=uCornerPreviewLimits(dimensions,raw.side,raw.treatment).fields;
 for(const [key,v] of Object.entries(parameters)){
  const b=bounds[key];
  if(!Number.isInteger(v)||v%b.step||v<b.min||v>b.max)
   throw Error('corner-'+key+': Erlaubt sind '+(b.min/10)+'–'+(b.max/10)+' cm. Eingegeben: '+(v/10)+' cm.');
 }
 return {side:raw.side,treatment:raw.treatment,parameters};
}
