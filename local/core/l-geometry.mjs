/**
 * L1–L4 customer outlines after Speedmaster screenshots, 30.10.2026.
 * L3/L4 bevel projection and seams remain illustration-only until all
 * supplier B3/B4/B5 and machining dimensions are confirmed. No sale logic.
 */
const shapes=['L1','L2','L3','L4'],sides=['none','left','right','both'],types=['round','chamfer_square','chamfer_continuous'];
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
// Supplier labels B1/B2 and B3/B4 are each ONE linked input in L3/L4.
// Keep both canonical values for manufacturing-proof data, never allow them to disagree.
const dimensionalProfiles=Object.freeze({
  L1:{visible:['L1','L2','B1','B2'],all:['L1','L2','B1','B2'],defaults:{L1:'250',L2:'170',B1:'60',B2:'60'}},
  L2:{visible:['L1','L2','B1','B2'],all:['L1','L2','B1','B2'],defaults:{L1:'250',L2:'170',B1:'60',B2:'60'}},
  L3:{visible:['L1','L2','B1','B3'],all:['L1','L2','B1','B2','B3','B4'],defaults:{L1:'200',L2:'200',B1:'60',B2:'60',B3:'90',B4:'90'}},
  L4:{visible:['L1','L2','B1','B3','B5'],all:['L1','L2','B1','B2','B3','B4','B5'],defaults:{L1:'200',L2:'200',B1:'90',B2:'90',B3:'105',B4:'105',B5:'60'}}
});
const profile=shape=>{
  if(!Object.hasOwn(dimensionalProfiles,shape))throw Error('L-Form unbekannt.');
  return dimensionalProfiles[shape];
};
export const lDimensionKeys=shape=>[...profile(shape).all];
export const lVisibleDimensionKeys=shape=>[...profile(shape).visible];
export const lDefaultDimensions=shape=>({...profile(shape).defaults});
// These are observed preview guardrails, NOT final supplier acceptance limits.
export function validateLDimensions(shape,dimensions) {
  if(!['L3','L4'].includes(shape))return;
  const {L1,L2,B1,B2,B3,B4,B5}=dimensions;
  if(B1!==B2)throw Error('B1: B1 und B2 müssen bei dieser Variante gleich sein.');
  if(B3!==B4)throw Error('B3: B3 und B4 müssen bei dieser Variante gleich sein.');
  if(B1<300||B1>900)throw Error('B1: Breite B1/B2 im belegten Vorschaufenster 30–90 cm.');
  if(B3<B1+50||B3>1050)throw Error('B3: Breite B3/B4 muss größer als B1/B2 sein und im belegten Vorschaufenster bleiben.');
  if(shape==='L4'&&(B5<300||B5>900))throw Error('B5: Der äußere Diagonalbereich liegt in den gezeigten Beispielen zwischen 30 und 90 cm.');
  if((shape==='L3'&&(L1<=B3+100||L2<=B4+100))||(shape==='L4'&&(L1<B3||L2<B4)))
    throw Error('L1: Für die diagonale Innenöffnung bleibt zu wenig Platz.');
}

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
  const {L1:w,L2:h,B1:b1,B2:b2,B3:b3,B4:b4,B5:b5}=config.dimensions,variant=config.geometry;
  if(![w,h,b1,b2].every(Number.isInteger)||b1<100||b2<100||w<=b1+100||h<=b2+100)
    throw Error('L-Form: Bitte gültige Maße mit einer positiven Innenöffnung eingeben.');
  // L3/L4 internal diagonal endpoints come from the separately supplied
  // paired widths (B3/B4). No inferred half-depth diagonal.
  // For L4 the screenshot shows a 45-degree exterior chamfer with width B5;
  // its projection is a preview inference, not released cutting geometry.
  const outer=variant==='L4'?Math.round((b1+b3-b5*Math.SQRT2)/10)*10:null;
  if(variant==='L4'&&(outer<100||outer>=Math.min(w,h)-100))
    throw Error('B5: Äußere Diagonale passt nicht zu diesen Schenkelmaßen.');
  const bases={
    L1:[pt(0,0),pt(w,0),pt(w,b2),pt(b1,b2),pt(b1,h),pt(0,h)],
    L2:[pt(0,0),pt(w,0),pt(w,h),pt(w-b1,h),pt(w-b1,b2),pt(0,b2)],
    L3:[pt(0,0),pt(w,0),pt(w,b2),pt(b3,b2),pt(b1,b4),pt(b1,h),pt(0,h)],
    L4:[pt(outer,0),pt(w,0),pt(w,b2),pt(b3,b2),pt(b1,b4),pt(b1,h),pt(0,h),pt(0,outer)]
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
  if(angled){
    dims.find(d=>d.id==='B1').label='B1/B2';
    dims.find(d=>d.id==='B2').label='B1/B2';
    dims.push({id:'B3',label:'B3/B4',mm:b3,from:pt(0,b2),to:pt(b3,b2),side:1,secondary:true});
    if(variant==='L4')dims.push({id:'B5',mm:b5,from:pt(outer/2,outer/2),to:pt((b3+b1)/2,(b2+b4)/2),side:1,secondary:true});
  }
  const previewSeams=angled?[
    {from:pt(b3,variant==='L4'?Math.max(0,outer-b3):0),to:pt(b3,b2)},
    {from:pt(variant==='L4'?Math.max(0,outer-b4):0,b4),to:pt(b1,b4)}
  ]:variant==='L1'?[{from:pt(0,b2),to:pt(b1,b2)}]:[{from:pt(w-b1,b2),to:pt(w,b2)}];
  const warnings=[
    'L'+variant.slice(1)+' nach Speedmaster-Screenshots vom 30.10.2026: nur Maßskizze, keine Fertigungs- oder Preisfreigabe.',
    'Aufteilung illustriert die sichtbaren Anschlussrichtungen; exakte Dübel-/Verbinderfräsungen und Lieferantengrenzen bleiben offen.'
  ];
  if(angled)warnings.push('L3/L4: B1/B2 und B3/B4 folgen den gemeinsamen Speedmaster-Eingaben. Stoßfräsungen, Endbearbeitung und allgemeingültige Grenzformeln sind noch nicht geprüft.');
  if(variant==='L4')warnings.push('L4: Der äußere B5-Abstand wird in der Ansicht als parallele 45°-Diagonale projiziert; Zuschnittfreigabe fehlt.');
  if(corner.treatment)warnings.push('Eckmaße nur skizziert; zulässige Speedmaster-Maßgrenzen noch nicht nachgewiesen.');
  return {
    version:'speedmaster-l-screenshot-20261030',title:variant+' · L-Arbeitsplatte nach Speedmaster-Bild',
    points:result.points,path:result.path,areaMm2:area(result.points),width:w,height:h,dimensions:dims,
    edges:result.points.map((p,i)=>({from:p,to:result.points[(i+1)%result.points.length],finish:'matching-1.5',status:'planned',kind:'line'})),
    corner:'square',cornerSizeMm:null,contourMarkers:result.markers,previewSeams,
    joints:null,shippingParts:null,supplierMappingVerified:false,warnings
  };
}
