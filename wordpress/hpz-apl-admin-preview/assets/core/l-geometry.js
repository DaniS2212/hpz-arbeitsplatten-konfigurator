/**
 * L1–L4 customer outlines after Speedmaster screenshots, 30.10.2026.
 * L3/L4 bevel projection, seams AND preview part regions remain illustration-only
 * until supplier B3/B4/B5 and machining dimensions are confirmed. No sale logic.
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
// Snapshot input ranges legible in four exact supplier screenshots.
// The max values are displayed by Speedmaster for THESE inputs, not
// generic manufacturing limits. No CNC, shipment, pricing or sale approval.
const observedChamferInputs=Object.freeze({
  L1:{image:'block-06/image(20261102-115001).png',treatment:'chamfer_square',
    dimensions:{L1:2000,L2:1200,B1:600,B2:600},
    fields:{L3:550,B3:600,L4:1350,B4:600}},
  L2:{image:'block-06/image(20261102-115024).png',treatment:'chamfer_continuous',
    dimensions:{L1:2000,L2:1200,B1:600,B2:600},
    fields:{L3:1350,B3:2000,L4:550,B4:600}},
  L3:{image:'block-03/image(20261102-114354).png',treatment:'chamfer_continuous',
    dimensions:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
    fields:{L5:1050,B5:600,L6:1050,B6:600}},
  L4:{image:'block-03/image(20261102-114510).png',treatment:'chamfer_square',
    dimensions:{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900,B5:600},
    fields:{L5:1050,B5:600,L6:1050,B6:600}}
});
export function lObservedChamferLimits(shape,dimensions,side,treatment,{material,decor}={}) {
  const photo=observedChamferInputs[shape];
  if(!photo||!dimensions||side!=='both'||treatment!==photo.treatment
    ||material!=='APL38'||decor!=='W980'
    ||Object.entries(photo.dimensions).some(([key,mm])=>dimensions[key]!==mm))return null;
  return {status:'screenshot-input-range-only',image:photo.image,
    fields:Object.fromEntries(Object.entries(photo.fields).map(([key,max])=>[key,{min:60,max}]))};
}
/**
 * Conservative numeric SKETCH guardrails. Each chamfer must leave >10 mm
 * on both physical leg edges, including L2's lower right leg (L2-B2,
 * NOT the full uninterrupted contour edge L2). Distinct from the exact
 * observed Speedmaster input limits above; neither is CNC-ready.
 */
export function lCornerPreviewLimits(shape,dimensions,side,treatment,context={}) {
  if(side==='none')return {status:'unverified-preview',fields:{},photo:null};
  if(!shapes.includes(shape)||!isObj(dimensions)||!['left','right','both'].includes(side)
    ||!['round','chamfer_square','chamfer_continuous'].includes(treatment))
    throw Error('Unbekannte L-Abschrägung.');
  const {L1,L2,B1,B2,B3,B4}=dimensions;
  const ranges={
    L1:{L3:L2-B2,B3:B1,L4:L1-B1,B4:B2},
    L2:{L3:L1-B1,B3:B2,L4:L2-B2,B4:B1},
    L3:{L5:L2-B4,B5:B1,L6:L1-B3,B6:B2},
    L4:{L5:L2-B4,B5:B1,L6:L1-B3,B6:B2}
  };
  const rounded=treatment==='round';
  const photo=rounded?null:lObservedChamferLimits(shape,dimensions,side,treatment,context);
  const suffix=shape==='L1'||shape==='L2'?['3','4']:['5','6'];
  const fields=Object.fromEntries(lCornerKeys(shape,side,treatment).map(key=>{
    // Round radii span BOTH neighboring edge segments. The supplier has
    // never approved R1/R2 sizes; cap only the numerical drawing.
    const length=key==='R1'?Math.min(ranges[shape]['L'+suffix[0]],ranges[shape]['B'+suffix[0]])
      :key==='R2'?Math.min(ranges[shape]['L'+suffix[1]],ranges[shape]['B'+suffix[1]])
      :ranges[shape][key];
    // outline() rejects a cut >= (neighbor length - 10mm). The last
    // whole-centimetre value strictly below that threshold is valid.
    const geometricMax=Math.max(0,Math.min(rounded?1000:2000,(Math.ceil((length-10)/10)-1)*10));
    const photoMax=photo?.fields[key]?.max??null;
    return [key,{min:rounded?10:60,max:Math.min(geometricMax,photoMax??Infinity),
      geometricMax,photoMax}];
  }));
  return {status:'preview-only',fields,photo};
}
export function validateLCorner(raw,convert,shape,context={}) {
  if(!isObj(raw)||Object.keys(raw).some(k=>!['side','treatment','parameters'].includes(k))||!isObj(raw.parameters))
    throw Error('Ungültige L-Eckauswahl.');
  const keys=lCornerKeys(shape,raw.side,raw.treatment);
  if(Object.keys(raw.parameters).sort().join('|')!==[...keys].sort().join('|'))throw Error('L-Eckmaßfelder stimmen nicht überein.');
  const parameters=Object.fromEntries(keys.map(k=>[k,convert(raw.parameters[k])]));
  // Archived Speedmaster fields (block-06/20261102-115001, -115024;
  // block-03/20261102-114354, -114510) show 60 mm chamfer minima and
  // valid longer cuts (L1 L4=1200; L3 L5=1050). The upper preview
  // ceiling is NOT a verified dynamic supplier/manufacturing limit.
  const chamfer=raw.treatment!=='round',minimum=chamfer?60:10,previewMaximum=chamfer?2000:1000;
  for(const [k,v] of Object.entries(parameters))if(v<minimum||v>previewMaximum||v%10!==0)
    throw Error('corner-'+k+': Bitte ganze Zentimeter zwischen '+(minimum/10)+' und '+(previewMaximum/10)+' eingeben (nur Vorschau; keine allgemeine Herstellerfreigabe).');
  if(context.dimensions){
    const limits=lCornerPreviewLimits(shape,context.dimensions,raw.side,raw.treatment,context);
    for(const [key,value] of Object.entries(parameters)){
      const limit=limits.fields[key];
      if(limit&&value>limit.max){
        const evidence=raw.treatment==='round'?'rein geometrische Rundungsgrenze'
          :limit.photoMax!==null&&limit.max===limit.photoMax
            ?'Speedmaster-Foto (nur identischer Referenzfall)':'rein geometrische Zeichnungsgrenze';
        throw Error('corner-'+key+': Maximal '+(limit.max/10)+' cm ('+evidence+'). Keine Fertigungsfreigabe.');
      }
    }
  }
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
    // Both Speedmaster chamfers have a straight diagonal contour, not a curve.
    commands.push('L '+fmt(start),c.treatment==='round'
      ?`A ${c.horizontal} ${c.horizontal} 0 0 1 ${fmt(end)}`
      :'L '+fmt(end));
    points.push(start,end);markers.push({...c,vertex:p,from:start,to:end});
  }
  return {path:commands.join(' ')+' Z',points,markers};
}
function area(points){return Math.abs(points.reduce((sum,p,i)=>{const n=points[(i+1)%points.length];return sum+p[0]*n[1]-p[1]*n[0]},0))/2;}
/** Clip a supplier-unverified outline to simple visualization regions.
 * The polygons describe ONLY what appears on screen. They are never cutting
 * coordinates, shipping parts or assembly-/CNC-ready shop instructions. */
function clipHalfPlane(polygon,axis,limit,greater){
  const inside=p=>greater?p[axis]>=limit-1e-7:p[axis]<=limit+1e-7;
  const intersect=(a,b)=>{
    const fraction=(limit-a[axis])/(b[axis]-a[axis]);
    return [a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction];
  };
  const clipped=[];
  for(let i=0;i<polygon.length;i++){
    const now=polygon[i],prev=polygon[(i+polygon.length-1)%polygon.length];
    if(inside(now)){
      if(!inside(prev))clipped.push(intersect(prev,now));
      clipped.push(now);
    }else if(inside(prev))clipped.push(intersect(prev,now));
  }
  // Avoid duplicate endpoints when a seam meets an existing polygon vertex.
  const output=clipped.filter((p,i)=>!i||len(p,clipped[i-1])>1e-7);
  if(output.length>1&&len(output[0],output[output.length-1])<1e-7)output.pop();
  return output;
}
function partMarker(polygon){
  let twiceArea=0,x=0,y=0;
  for(let i=0;i<polygon.length;i++){
    const p=polygon[i],q=polygon[(i+1)%polygon.length];
    const cross=p[0]*q[1]-q[0]*p[1];
    twiceArea+=cross;
    x+=(p[0]+q[0])*cross;
    y+=(p[1]+q[1])*cross;
  }
  if(Math.abs(twiceArea)<1e-7)throw Error('L-Teilfläche ist geometrisch leer.');
  return [x/(3*twiceArea),y/(3*twiceArea)];
}
function previewPartRegions(base,variant,b1,b2,b3,b4){
  // Two simple regions for L1/L2, three for L3/L4.
  // The same split planes drive the existing illustrated seam markers.
  const angled=variant==='L3'||variant==='L4';
  const top=angled?clipHalfPlane(base,0,b3,true):clipHalfPlane(base,1,b2,false);
  const leg=angled?clipHalfPlane(base,1,b4,true):clipHalfPlane(base,1,b2,true);
  const corner=angled?clipHalfPlane(clipHalfPlane(base,0,b3,false),1,b4,false):null;
  const parts=[
    {id:'top',label:'Obere Strecke',polygon:top},
    ...(angled?[{id:'corner',label:'Eckbereich',polygon:corner}]:[]),
    {id:'leg',label:variant==='L2'?'Rechter Schenkel':'Linker Schenkel',polygon:leg}
  ];
  // At supplier-supported boundary extents (e.g. L4 L1=B3 and L2=B4)
  // the top and/or leg strip can vanish. They must not become fake parts.
  return parts.filter(part=>part.polygon.length>=3&&area(part.polygon)>1).map((part,index)=>
    ({...part,number:index+1,marker:partMarker(part.polygon),status:'illustration-only'}));
}
export function lGeometry(config){
  if(config.product!=='l'||!shapes.includes(config.geometry)||!config.lCorner)throw Error('L-Grundriss unbekannt.');
  const {L1:w,L2:h,B1:b1,B2:b2,B3:b3,B4:b4,B5:b5}=config.dimensions,variant=config.geometry;
  if(![w,h,b1,b2].every(Number.isInteger)||b1<100||b2<100||w<=b1+100||h<=b2+100)
    throw Error('L-Form: Bitte gültige Maße mit einer positiven Innenöffnung eingeben.');
  // L3/L4 internal diagonal endpoints come from the separately supplied
  // paired widths (B3/B4). No inferred half-depth diagonal.
  // The two independent Speedmaster L4 images (B5=600 and B5=300,
  // 02.11.2026) show the 45-degree outer cut stops at the B3/B4 corner
  // projection. An unconstrained projected B5=300 line would continue
  // 176 mm past this point into the top/leg strip, unlike the supplier.
  // Keep this a visual constraint only: connector/CNC geometry is unknown.
  const outer=variant==='L4'?Math.min(b3,b1+b3-b5*Math.SQRT2):null;
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
    // L = length along the leg; B = width across it. Not fixed X/Y!
    // L2 has mirrored end orientations relative to L1/L3/L4.
    const lengthIsHorizontal=variant==='L2'?isLeft:!isLeft;
    const axisFields=corner.treatment==='round'?null:{
      horizontal:lengthIsHorizontal?keys[0]:keys[1],
      vertical:lengthIsHorizontal?keys[1]:keys[0]
    };
    const horizontal=corner.treatment==='round'?v[keys[0]]:v[axisFields.horizontal];
    const vertical=corner.treatment==='round'?horizontal:v[axisFields.vertical];
    edits.push({index,side,treatment:corner.treatment,horizontal,vertical,fields:keys,axisFields});
  }
  const result=outline(base,edits);
  // The contour points connect round endpoints by a chord. The SVG uses
  // actual quarter-circle arcs, whose surface area is larger than the
  // chord polygon by r^2*(pi/4 - 1/2) for each convex 90-degree corner.
  // This is a mathematical preview area only, never a sellable CNC area.
  const roundArcCorrection=result.markers.reduce((sum,marker)=>
    sum+(marker.treatment==='round'?marker.horizontal**2*(Math.PI/4-0.5):0),0);
  // Preview-only very short tangent blends at each end of a "continuous"
  // chamfer. The long main chamfer remains straight; no CNC radius is implied.
  const softIndices=result.markers.filter(m=>m.treatment==='chamfer_continuous')
    .flatMap(m=>[m.from,m.to].map(p=>result.points.findIndex(q=>q[0]===p[0]&&q[1]===p[1])));
  // The selected/numbered preview pieces must be built from the SAME
  // corner-edited silhouette as the visible wood surface, not the uncut
  // base outline. For rounded corners result.points are the inward chord;
  // the existing SVG path clip still draws the actual circular arc.
  // These regions remain illustrative, never production cut coordinates.
  const fittedParts=previewPartRegions(result.points,variant,b1,b2,b3,b4);
  // For round arcs the polygon uses the inward chord to calculate centroid
  // and projected area. The SVG still needs to paint the narrow area between
  // that chord and the actual arc. Supply the old uncut region ONLY as a
  // clip-mask paint cover; it is never a piece outline or CNC coordinate.
  const arcPaintParts=corner.treatment==='round'
    ?new Map(previewPartRegions(base,variant,b1,b2,b3,b4).map(p=>[p.id,p.polygon]))
    :null;
  const previewParts=fittedParts.map(p=>{
    const maskPaintPolygon=arcPaintParts?.get(p.id);
    return maskPaintPolygon?{...p,maskPaintPolygon}:p;
  });
  const dims=[
    {id:'L1',mm:w,from:pt(0,0),to:pt(w,0),side:-1},
    {id:'L2',mm:h,from:pt(left?0:w,0),to:pt(left?0:w,h),side:left?-1:2},
    {id:'B1',mm:b1,from:pt(left?0:w-b1,h),to:pt(left?b1:w,h),side:1},
    {id:'B2',mm:b2,from:pt(left?w:0,0),to:pt(left?w:0,b2),side:left?1:-1}
  ];
  if(angled){
    // B1/B2 and B3/B4 are coupled Speedmaster inputs but different
    // perpendicular projections. Never measure across the textured slab.
    dims.find(d=>d.id==='B1').focusKey='B1';
    dims.find(d=>d.id==='B2').focusKey='B1';
    dims.push(
      {id:'B3',focusKey:'B3',label:'B3',axis:'horizontal',mm:b3,from:pt(0,0),to:pt(b3,0),side:-1,secondary:true,referenceOutside:true,offsetFactor:.88},
      {id:'B3',focusKey:'B3',label:'B4',axis:'vertical',mm:b4,from:pt(0,0),to:pt(0,b4),side:-1,secondary:true,referenceOutside:true,offsetFactor:.88}
    );
    if(variant==='L4')dims.push({
      id:'B5',axis:'diagonal',mm:b5,from:pt(outer/2,outer/2),to:pt((b3+b1)/2,(b2+b4)/2),
      // At B5=300 in the supplier photos the outside is capped at B3=900,
      // leaving ~424 mm of physical gap. Drawing a 300 mm ruler across that
      // gap would be misleading. Keep B5 as a selected setting annotation.
      settingOnly:Math.abs((b1+b3-outer)/Math.SQRT2-b5)>1e-6,
      side:1,secondary:true
    });
  }
  // Match the proven straight implementation: expose projection lengths for
  // each cut, plus an arc/radius callout. Prefix the field IDs so the L4
  // basic B5 and corner B5 never select one another.
  const cornerDimensions=[],cornerCuts=[],cornerArcs=[];
  for(const marker of result.markers){
    const p=marker.vertex,{from,to,side,treatment,fields,axisFields}=marker;
    const horiz=from[1]===p[1]?from:to;
    const vert=from[0]===p[0]?from:to;
    if(treatment==='round'){
      cornerArcs.push({
        id:'corner-'+fields[0],label:fields[0],side,radiusMm:marker.horizontal,
        center:[horiz[0],vert[1]],from,to
      });
    }else{
      cornerCuts.push({side,from,to,fields:fields.map(k=>'corner-'+k),presentationOnly:treatment==='chamfer_continuous'});
      // Exterior location controls the free side for vertical label placement.
      const labelNormal=variant==='L2'&&side==='left'?-1:1;
      cornerDimensions.push(
        {id:'corner-'+axisFields.horizontal,label:axisFields.horizontal,mm:marker.horizontal,
          from:p,to:horiz,side,axis:'horizontal'},
        {id:'corner-'+axisFields.vertical,label:axisFields.vertical,mm:marker.vertical,
          from:p,to:vert,side,axis:'vertical',labelNormal}
      );
    }
  }
  const previewSeams=angled?[
    ...(previewParts.some(p=>p.id==='top')?[{from:pt(b3,variant==='L4'?Math.max(0,outer-b3):0),to:pt(b3,b2)}]:[]),
    ...(previewParts.some(p=>p.id==='leg')?[{from:pt(variant==='L4'?Math.max(0,outer-b4):0,b4),to:pt(b1,b4)}]:[])
  ]:variant==='L1'?[{from:pt(0,b2),to:pt(b1,b2)}]:[{from:pt(w-b1,b2),to:pt(w,b2)}];
  // Reference photos show an approximate surface seam, not a manufacturer
  // connector, milling operation, genuine part split or shipping item.
  const previewSeamDetails=previewSeams.map(seam=>{
    const vertical=Math.abs(seam.from[0]-seam.to[0])<1e-7;
    const neighbors=angled?(vertical?['top','corner']:['corner','leg']):['top','leg'];
    // A is ALWAYS the upper/vertical illustrated guide, B the lower/
    // horizontal guide. If one region collapses, the remaining physical
    // guide must keep its identity rather than inherit array index zero.
    // This is ONLY a stable UI mapping, not a confirmed factory seam.
    const slot=angled?(vertical?1:2):1;
    const allVisible=neighbors.every(id=>previewParts.some(p=>p.id===id));
    return {id:'seam-'+slot,label:'Stoß '+(slot===1?'A':'B'),
      from:[...seam.from],to:[...seam.to],partIds:allVisible?neighbors:[],
      status:'illustration-only',connectorType:null,connectorCount:null,machiningCoordinates:null};
  });
  // Six REAL Speedmaster photos from 05.11.2026 show TWO visible panels
  // and symbols resembling biscuits and worktop connectors for THESE EXACT
  // L1/L2 values. This is a screen observation, never a production BOM:
  // symbol counts, real connector types and milling coordinates are unknown.
  const assemblyWitnessEligible=(variant==='L1'||variant==='L2')
    &&w===2000&&h===1200&&b1===600&&b2===600
    &&config.material==='APL38'&&config.decor==='W980'
    &&config.edge==='matching-1.5'
    &&config.corner==='square'
    &&corner.side==='none'&&corner.treatment===null
    &&Object.keys(corner.parameters).length===0;
  // L3's 02.11 PR39 originals show three illustrated regions with two
  // connection-icon seams; the complete model edge PROFILE is NOT confirmed.
  // L4's FOUR 05.11 originals show the 600mm B5 case with two such seams.
  // Neither is a supplier CNC, connector-count or shipped-piece commitment.
  const angledWitnessEligible=angled&&w===2000&&h===2000
    &&b1===600&&b2===600&&b3===900&&b4===900
    &&(variant!=='L4'||b5===600)
    &&config.material==='APL38'&&config.decor==='W980'
    &&config.edge==='matching-1.5'&&config.corner==='square'
    &&corner.side==='none'&&corner.treatment===null
    &&Object.keys(corner.parameters).length===0;
  const assemblyPhotoObservation=assemblyWitnessEligible?{
    status:'photo-observation-only',
    caseId:variant+'-W980-38-2000x1200-20261105',
    visiblePanelRegions:2,
    illustratedSeamId:'seam-1',
    connectorSymbols:['biscuit-symbols','worktop-connector-symbols'],
    connectorCount:null,machiningCoordinates:null,verifiedCutList:false
  }:angledWitnessEligible?{
    status:'photo-observation-only',
    caseId:variant==='L3'?'L3-base-2000-2000-600-900-20261102'
      :'L4-W980-38-2000x2000-B5-600-20261105',
    capturedDate:variant==='L3'?'2026-11-02':'2026-11-05',
    observationScope:variant==='L3'?'layout-and-symbols-profile-not-fully-matched':'exact-visible-example-only',
    visiblePanelRegions:3,
    illustratedSeamIds:['seam-1','seam-2'],
    connectorSymbols:['biscuit-symbols','worktop-connector-symbols'],
    connectorCount:null,machiningCoordinates:null,verifiedCutList:false
  }:null;
  const warnings=[
    'L'+variant.slice(1)+' nach Speedmaster-Screenshots vom 30.10.2026: nur Maßskizze, keine Fertigungs- oder Preisfreigabe.',
    'Aufteilung illustriert die sichtbaren Anschlussrichtungen; exakte Dübel-/Verbinderfräsungen und Lieferantengrenzen bleiben offen.'
  ];
  if(angled)warnings.push('L3/L4: B1/B2 und B3/B4 folgen den gemeinsamen Speedmaster-Eingaben. Stoßfräsungen, Endbearbeitung und allgemeingültige Grenzformeln sind noch nicht geprüft.');
  if(variant==='L4')warnings.push('L4: Der äußere B5-Abstand wird in der Ansicht als parallele 45°-Diagonale projiziert; Zuschnittfreigabe fehlt.');
  if(corner.treatment)warnings.push('Eckmaße nur skizziert; zulässige Speedmaster-Maßgrenzen noch nicht nachgewiesen.');
  if(corner.treatment==='chamfer_continuous')warnings.push('Kante durchlaufend: kleine weiche Endübergänge nur schematisch dargestellt; Radius und Kantenverlauf sind noch nicht fertigungstechnisch freigegeben.');
  return {
    version:'speedmaster-l-screenshot-20261030',title:variant+' · L-Arbeitsplatte nach Speedmaster-Bild',
    points:result.points,path:result.path,areaMm2:area(result.points)+roundArcCorrection,width:w,height:h,dimensions:dims,
    edges:result.points.map((p,i)=>({from:p,to:result.points[(i+1)%result.points.length],finish:'matching-1.5',status:'planned',kind:'line'})),
    corner:'square',cornerSizeMm:null,contourMarkers:result.markers,cornerCuts,cornerDimensions,cornerArcs,previewSeams,previewSeamDetails,previewParts,assemblyPhotoObservation,
    softIndices,contourStatus:softIndices.length?'schematic':null,
    joints:null,shippingParts:null,supplierMappingVerified:false,warnings
  };
}
