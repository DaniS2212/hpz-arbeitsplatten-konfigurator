import {cmToMm} from './config.js?v=1.0.3';
import {mmToCmText} from './customer-measures.js?v=1.0.3';
import {lCornerKeys,lCornerPreviewLimits} from './l-geometry.js?v=1.0.3';
import {uCornerKeys,uCornerPreviewLimits} from './u-corners.js?v=1.0.3';
import {straightCorner,cornerLimits} from './straight-corners.js?v=1.0.3';

/**
 * Exactly one actionable, customer-facing dimension error for the whole
 * configurator. Same values feed form inputs, SVG edits and the real validator;
 * never silently clamp a measurement or submit a guessed corrected value.
 */
export function firstMeasureIssue(product,shape,values,{material='APL38',straightTreatment=null}={}){
  const fields=product==='straight'?['L1','B1']
    :product==='l'?(shape==='L4'?['L1','L2','B1','B3','B5']
      :shape==='L3'?['L1','L2','B1','B3']:['L1','L2','B1','B2'])
    :['L1','L2','L3','B1','B2','B3'];
  const mm={};
  const issue=(key,text,bounds={})=>({key,message:text,...bounds});
  for(const key of fields){
    try{mm[key]=cmToMm(values[key]);}
    catch{return issue(key,`${key}: Bitte eine Zahl in cm eingeben.`);}
  }
  if(product==='l'&&(shape==='L3'||shape==='L4')){
    mm.B2=mm.B1;mm.B4=mm.B3;
  }
  for(const key of fields){
    let min=key.startsWith('L')?1000:300;
    let max=key.startsWith('L')?4000:1200;
    if(product==='straight'&&key==='B1'&&(material==='APL38'||straightTreatment==='chamfer_continuous'))max=900;
    if(product==='l'&&['L3','L4'].includes(shape)){
      if(key==='B1'||key==='B5')max=900;
      if(key==='B3'){min=mm.B1+50;max=1050;}
    }
    if(mm[key]<min||mm[key]>max){
      return issue(key,`${key}: Erlaubt sind ${mmToCmText(min)}–${mmToCmText(max)} cm. Eingegeben: ${mmToCmText(mm[key])} cm.`,{minMm:min,maxMm:max});
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


/**
 * Validate corner entry independently of supplier price or browser request.
 * The visible names and the *dynamic* geometry limits belong in customer
 * error messages; internal "corner-L6" and approval/proof wording do not.
 */
export function firstCornerIssue(product,shape,dimensionValues,{side='none',treatment=null,values={},material='APL38',decor='W980'}={}){
  if(side==='none'||!treatment||!['straight','l','u'].includes(product))return null;
  let keys,leftKeys,limits;
  try{
    keys=product==='straight'?straightCorner(side,treatment).parameters
      :product==='l'?lCornerKeys(shape,side,treatment):uCornerKeys(side,treatment);
    leftKeys=product==='straight'?straightCorner('left',treatment).parameters
      :product==='l'?lCornerKeys(shape,'left',treatment):uCornerKeys('left',treatment);
  }catch{return null;}
  const label=key=>{
    const where=leftKeys.includes(key)?'Linke':'Rechte';
    const property=key[0]==='R'?'Radius':key[0]==='L'?'Länge':product==='straight'?'Tiefe':'Breite';
    return where+' Ecke · '+property+' ('+key+')';
  };
  const issue=(key,message,bounds={})=>({
    key:(product==='straight'?'':'corner-')+key,
    message:label(key)+': '+message,
    ...bounds
  });
  const fields={};
  for(const key of keys){
    try{fields[key]=cmToMm(values[key]);}
    catch{return issue(key,'Bitte eine Zahl in cm eingeben.');}
  }
  let dims;
  try{
    dims=Object.fromEntries(Object.entries(dimensionValues)
      .map(([key,value])=>[key,cmToMm(value)]));
    if(product==='straight'){
      const data=cornerLimits(side,treatment,dims,fields);
      if(!data.enabled)return null; // Basic dimensions have their own error.
      limits=data.fields;
    }else if(product==='l'){
      limits=lCornerPreviewLimits(shape,dims,side,treatment,{material,decor}).fields;
    }else{
      limits=uCornerPreviewLimits(dims,side,treatment).fields;
    }
  }catch{return null;}
  // First identify an intrinsically invalid entry (minimum / cm precision).
  // E.g. B2=1cm must point to B2, not to L2 whose dependent maximum then
  // shrinks. Only after that check the dynamic maximums for each corner.
  for(const key of keys){
    const b=limits[key];
    if(!b)continue;
    const {min,max}=b,step=b.step??10;
    const bounds={minMm:min,maxMm:max,stepMm:step};
    if(fields[key]%step!==0)return issue(key,'Bitte ganze Zentimeter eingeben.',bounds);
    if(fields[key]<min)return issue(key,
      max<min?'Für diese Bearbeitung bleibt zu wenig Platz. Bitte die Plattenmaße anpassen.'
        :'Erlaubt sind '+mmToCmText(min)+'–'+mmToCmText(max)+' cm.',bounds);
  }
  for(const key of keys){
    const b=limits[key];
    if(!b)continue;
    const {min,max}=b,step=b.step??10;
    const bounds={minMm:min,maxMm:max,stepMm:step};
    if(max<min)return issue(key,
      'Für diese Bearbeitung bleibt zu wenig Platz. Bitte die Plattenmaße anpassen.',bounds);
    if(fields[key]>max)return issue(key,
      'Erlaubt sind '+mmToCmText(min)+'–'+mmToCmText(max)+' cm.',bounds);
  }
  return null;
}

/**
 * A digit in the middle of typing (e.g. "1" on the way to "15") should not
 * flash a red warning while that exact prefix can still become a valid
 * whole-centimetre entry. It NEVER makes the configuration valid: purchase
 * and navigation stay blocked until the full value has been validated.
 */
export function isUnfinishedCmEntry(raw,issue){
  const value=String(raw??'').trim();
  if(value===''||/^\d{1,5}[.,]$/.test(value))return true;
  if(!/^\d{1,2}$/.test(value)
      ||!Number.isFinite(issue?.minMm)||!Number.isFinite(issue?.maxMm)
      ||issue.maxMm<issue.minMm)return false;
  const minCm=Math.ceil(issue.minMm/10),maxCm=Math.floor(issue.maxMm/10);
  const prefix=Number(value);
  for(const factor of [10,100]){
    const first=prefix*factor,last=first+factor-1;
    if(first<=maxCm&&last>=minCm)return true;
  }
  return false;
}
