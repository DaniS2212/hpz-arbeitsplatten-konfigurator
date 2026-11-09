import {cmToMm} from './config.js?v=1.0.3';
import {mmToCmText} from './customer-measures.js?v=1.0.3';

/**
 * Exactly one actionable, customer-facing dimension error for the whole
 * configurator. Same values feed form inputs, SVG edits and the real validator;
 * never silently clamp a measurement or submit a guessed corrected value.
 */
export function firstMeasureIssue(product,shape,values){
  const fields=product==='straight'?['L1','B1']
    :product==='l'?(shape==='L4'?['L1','L2','B1','B3','B5']
      :shape==='L3'?['L1','L2','B1','B3']:['L1','L2','B1','B2'])
    :['L1','L2','L3','B1','B2','B3'];
  const mm={};
  const issue=(key,text)=>({key,message:text});
  for(const key of fields){
    try{mm[key]=cmToMm(values[key]);}
    catch{return issue(key,`${key}: Bitte eine Zahl in cm eingeben (z. B. 180 oder 180,5).`);}
  }
  if(product==='l'&&(shape==='L3'||shape==='L4')){
    mm.B2=mm.B1;mm.B4=mm.B3;
  }
  for(const key of fields){
    let min=key.startsWith('L')?1000:300;
    let max=key.startsWith('L')?4000:1200;
    if(product==='straight'&&key==='B1')max=900;
    if(product==='l'&&['L3','L4'].includes(shape)){
      if(key==='B1'||key==='B5')max=900;
      if(key==='B3'){min=mm.B1+50;max=1050;}
    }
    if(mm[key]<min||mm[key]>max){
      return issue(key,`${key}: Erlaubt sind ${mmToCmText(min)}–${mmToCmText(max)} cm. Eingegeben: ${mmToCmText(mm[key])} cm.`);
    }
  }
  // Positive inside clearance for each contour; the gap must not disappear.
  const need=(key,minimum,context)=>{
    if(mm[key]>minimum)return null;
    return issue(key,`${key}: Mindestens ${mmToCmText(minimum+1)} cm erforderlich (${context}).`);
  };
  if(product==='l'){
    const left=need('L1',mm.B1+100,`Schenkelbreite ${mmToCmText(mm.B1)} cm + 10 cm Innenabstand`);
    if(left)return left;
    const right=need('L2',mm.B2+100,`Plattentiefe ${mmToCmText(mm.B2)} cm + 10 cm Innenabstand`);
    if(right)return right;
    if(shape==='L3'&&(mm.L1<=mm.B3+100||mm.L2<=mm.B4+100)){
      const key=mm.L1<=mm.B3+100?'L1':'L2';
      const bound=key==='L1'?mm.B3:mm.B4;
      return issue(key,`${key}: Mindestens ${mmToCmText(bound+101)} cm, damit die diagonale Innenöffnung frei bleibt.`);
    }
    if(shape==='L4'&&(mm.L1<mm.B3||mm.L2<mm.B4)){
      const key=mm.L1<mm.B3?'L1':'L2';
      return issue(key,`${key} muss mindestens so lang wie die Eckbreite ${mmToCmText(mm.B3)} cm sein.`);
    }
  }
  if(product==='u'){
    if(mm.L1<=mm.B2+mm.B3)
      return issue('L1',`L1: Mindestens ${mmToCmText(mm.B2+mm.B3+1)} cm, damit die U-Öffnung zwischen den Schenkeln frei bleibt.`);
    for(const key of ['L2','L3']){
      if(mm[key]<=mm.B1)
        return issue(key,`${key}: Mindestens ${mmToCmText(mm.B1+1)} cm, damit der Schenkel länger als die Tiefe ist.`);
    }
  }
  return null;
}
