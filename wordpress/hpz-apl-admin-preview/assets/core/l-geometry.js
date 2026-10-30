/**
 * L1–L4 customer outlines after Speedmaster screenshots, 30.10.2026.
 * L3/L4 bevel projection and seams remain illustration-only until all
 * supplier B3/B4/B5 and machining dimensions are confirmed. No sale logic.
 */
const shapes=['L1','L2','L3','L4'],sides=['none','left','right','both'],types=['round','chamfer_square','chamfer_continuous'];
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function lCornerKeys(shape,side,type) {
  if(!shapes.includes(shape)||!sides.includes(side))throw Error('L-Form oder Eckseite unbekannt.');
  if(side==='none'){if(type!==null)throw Error('Bearbeitungsart ohne Eckbearbeitung.');return [];}
  if(!types.includes(type))throw Error('Eckausführung unbekannt.');
  const left=type==='round'?['R1']:['L'+(shape==='L1'||shape==='L2'?3:5),'B'+(shape==='L1'||shape==='L2'?3:5)];
  const right=type==='round'?['R2']:['L'+(shape==='L1'||shape==='L2'?4:6),'B'+(shape==='L1'||shape==='L2'?4:6)];
  return side==='both'?[...left,...right]:side==='left'?left:right;
}
export function defaultLCorner(shape,side='none',type=null) {
  return {side,treatment:type,parameters:Object.fromEntries(lCornerKeys(shape,side,type).map(k=>[k,type==='round'?'100':'150']))};
}
export function validateLCorner(raw,convert,shape) {
  if(!isObj(raw)||Object.keys(raw).some(k=>!['side','treatment','parameters'].includes(k))||!isObj(raw.parameters))
    throw Error('Ungültige L-Eckauswahl.');
  const keys=lCornerKeys(shape,raw.side,raw.treatment);
  if(Object.keys(raw.parameters).sort().join('|')!==[...keys].sort().join('|'))throw Error('L-Eckmaßfelder stimmen nicht überein.');
  const parameters=Object.fromEntries(keys.map(k=>[k,convert(raw.parameters[k])]));
  for(const [k,v] of Object.entries(parameters))if(v<10||v>1000||v%10!==0)
    throw Error(k+': Bitte ganze Zentimeter zwischen 1 und 100 eingeben (nur Vorschau).');
  return {side:raw.side,treatment:raw.treatment,parameters};
}
const pt=(x,y)=>[x,y], fmt=p=>p.join(' ');
const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const between=(a,b,d)=>[a[0]+(b[0]-a[0])*d/len(a,b),a[1]+(b[1]-a[1])*d/len(a,b)];
function outline(base,edits){
  const map=new Map(edits.map(x=>[x.index,x])),commands=['M '+fmt(base[0])],points=[base[0]],markers=[];
  for(let i=1;i<base.length;i++){
    const p=base[i],c=map.get(i);
    if(!c){points.push(p);commands.push('L '+fmt(p));continue;}
    const before=base[i-1],after=base[(i+1)%base.length];
    const inH=Math.abs(p[0]-before[0])>Math.abs(p[1]-before[1]);
    const a=inH?c.horizontal:c.vertical,b=inH?c.vertical:c.horizontal;
    if(a>=len(p,before)-10||b>=len(p,after)-10)throw Error('L-Eckbearbeitung: Restkante zu klein.');
    const start=between(p,before,a),end=between(p,after,b);
    const smooth=c.treatment!=='chamfer_square';
    commands.push('L '+fmt(start),smooth?'Q '+fmt(p)+' '+fmt(end):'L '+fmt(end));
    points.push(start,end);markers.push({...c,from:start,to:end});
  }
  return {path:commands.join(' ')+' Z',points,markers};
}
function area(points){return Math.abs(points.reduce((sum,p,i)=>{const n=points[(i+1)%points.length];return sum+p[0]*n[1]-p[1]*n[0]},0))/2;}
export function lGeometry(config){
  if(config.product!=='l'||!shapes.includes(config.geometry)||!config.lCorner)throw Error('L-Grundriss unbekannt.');
  const {L1:w,L2:h,B1:b1,B2:b2}=config.dimensions,variant=config.geometry;
  if(![w,h,b1,b2].every(Number.isInteger)||b1<100||b2<100||w<=b1+100||h<=b2+100)
    throw Error('L-Form: Bitte gültige Maße mit einer positiven Innenöffnung eingeben.');
  const diag=Math.round(Math.min(b1,b2)*.5/10)*10;
  if(['L3','L4'].includes(variant)&&(w<=b1+diag+100||h<=b2+diag+100))
    throw Error('L3/L4: Kein Platz für die diagonale Innenecke.');
  const bases={
    L1:[pt(0,0),pt(w,0),pt(w,b2),pt(b1,b2),pt(b1,h),pt(0,h)],
    L2:[pt(0,0),pt(w,0),pt(w,h),pt(w-b1,h),pt(w-b1,b2),pt(0,b2)],
    L3:[pt(0,0),pt(w,0),pt(w,b2),pt(b1+diag,b2),pt(b1,b2+diag),pt(b1,h),pt(0,h)],
    L4:[pt(b1,0),pt(w,0),pt(w,b2),pt(b1+diag,b2),pt(b1,b2+diag),pt(b1,h),pt(0,h),pt(0,b2)]
  };
  const base=bases[variant],left=variant!=='L2',angled=['L3','L4'].includes(variant),corner=config.lCorner;
  const edits=[];
  if(corner.side!=='none')for(const side of (corner.side==='both'?['left','right']:[corner.side])){
    const isLeft=side==='left',index=isLeft?(variant==='L2'?5:angled?5:4):2;
    const keys=lCornerKeys(variant,side,corner.treatment),v=corner.parameters;
    const horizontal=corner.treatment==='round'?v[keys[0]]:v[keys[0]],vertical=corner.treatment==='round'?horizontal:v[keys[1]];
    edits.push({index,side,treatment:corner.treatment,horizontal,vertical,fields:keys});
  }
  const result=outline(base,edits);
  const dims=[
    {id:'L1',mm:w,from:pt(0,0),to:pt(w,0),side:-1},
    {id:'L2',mm:h,from:pt(left?0:w,0),to:pt(left?0:w,h),side:left?-1:2},
    {id:'B1',mm:b1,from:pt(left?0:w-b1,h),to:pt(left?b1:w,h),side:1},
    {id:'B2',mm:b2,from:pt(left?w:0,0),to:pt(left?w:0,b2),side:left?1:-1}
  ];
  const previewSeams=angled?[
    {from:pt(b1+diag,0),to:pt(b1+diag,b2)},
    {from:pt(0,b2+diag),to:pt(b1,b2+diag)}
  ]:variant==='L1'?[{from:pt(0,b2),to:pt(b1,b2)}]:[{from:pt(w-b1,b2),to:pt(w,b2)}];
  const warnings=[
    'L'+variant.slice(1)+' nach Speedmaster-Screenshots vom 30.10.2026: nur Maßskizze, keine Fertigungs- oder Preisfreigabe.',
    'Aufteilung illustriert die sichtbaren Anschlussrichtungen; exakte Dübel-/Verbinderfräsungen und Lieferantengrenzen bleiben offen.'
  ];
  if(angled)warnings.push('L3/L4: Diagonalversatz schematisch. Herstellermaße B3/B4/B5 und Stückelung noch nicht verifiziert.');
  if(corner.treatment)warnings.push('Eckmaße nur skizziert; zulässige Speedmaster-Maßgrenzen noch nicht nachgewiesen.');
  return {
    version:'speedmaster-l-screenshot-20261030',title:variant+' · L-Arbeitsplatte nach Speedmaster-Bild',
    points:result.points,path:result.path,areaMm2:area(result.points),width:w,height:h,dimensions:dims,
    edges:result.points.map((p,i)=>({from:p,to:result.points[(i+1)%result.points.length],finish:'matching-1.5',status:'planned',kind:'line'})),
    corner:'square',cornerSizeMm:null,contourMarkers:result.markers,previewSeams,
    joints:null,shippingParts:null,supplierMappingVerified:false,warnings
  };
}
