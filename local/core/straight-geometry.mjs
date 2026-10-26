// Contour from user-confirmed Phase A1: R1 front-left, R2 front-right, front down.
// A mathematical preview does not grant supplier/manufacturing approval.
export function straightGeometry(config){
 if(config.straightCorner.treatment?.startsWith('chamfer'))return chamferGeometry(config);
 const {L1:w,B1:d}=config.dimensions,{R1:l=0,R2:r=0}=config.straightCorner.parameters;
 let path=`M 0 0 L ${w} 0 L ${w} ${d-r}`;
 if(r)path+=` A ${r} ${r} 0 0 1 ${w-r} ${d}`;
 path+=` L ${l} ${d}`;
 if(l)path+=` A ${l} ${l} 0 0 1 0 ${d-l}`;
 path+=' Z';
 const arcs=[];
 if(l)arcs.push({id:'R1',radiusMm:l,center:[l,d-l],from:[l,d],to:[0,d-l],side:'left'});
 if(r)arcs.push({id:'R2',radiusMm:r,center:[w-r,d-r],from:[w,d-r],to:[w-r,d],side:'right'});
 const edges=[{from:[0,0],to:[w,0],kind:'line'},{from:[w,0],to:[w,d-r],kind:'line'},
  ...(r?[{...arcs.find(a=>a.id==='R2'),kind:'arc'}]:[]),{from:[w-r,d],to:[l,d],kind:'line'},
  ...(l?[{...arcs.find(a=>a.id==='R1'),kind:'arc'}]:[]),{from:[0,d-l],to:[0,0],kind:'line'}]
  .map(e=>({...e,finish:'matching-1.5',status:'planned'}));
 return {version:'straight-front-radii-a1',title:'Gerade · Vorderkante unten',path,width:w,height:d,
  points:[[0,0],[w,0],[w,d-r],[w-r,d],[l,d],[0,d-l]],edges,cornerArcs:arcs,
  front:{from:[l,d],to:[w-r,d]},areaMm2:w*d-(l*l+r*r)*(1-Math.PI/4),
  dimensions:[{id:'L1',mm:w,from:[0,0],to:[w,0],side:-1},{id:'B1',mm:d,from:[w,0],to:[w,d],side:1}],
  corner:config.corner,cornerSizeMm:null,joints:null,shippingParts:null,supplierMappingVerified:false,
  warnings:['Geometrische Vorschau. Keine Fertigungs- oder Bestellfreigabe.',
   ...(l||r?['R1 vorne links / R2 vorne rechts laut Nutzerbestätigung. Lieferanten-Grenzen sind nur für R1 einseitig bei 2000 × 600 mm (50–599 mm) dokumentiert; weitere Grenzen und Originalzeichnungen fehlen.']:[])]};
}

function chamferGeometry(config){
 const {L1:w,B1:d}=config.dimensions,{L2:l=0,B2:b=0,L3:r=0,B3:c=0}=config.straightCorner.parameters;
 const schematic=config.straightCorner.treatment==='chamfer_continuous';
 const points=[[0,0],[w,0],[w,d-c],...(r?[[w-r,d]]:[]),[l,d],...(l?[[0,d-b]]:[])];
 const cuts=[];
 if(l)cuts.push({side:'left',from:[l,d],to:[0,d-b],fields:['L2','B2'],presentationOnly:schematic});
 if(r)cuts.push({side:'right',from:[w,d-c],to:[w-r,d],fields:['L3','B3'],presentationOnly:schematic});
 const cornerDimensions=[];
 if(l)cornerDimensions.push({id:'L2',mm:l,from:[0,d],to:[l,d],side:'left',axis:'horizontal'}, {id:'B2',mm:b,from:[0,d-b],to:[0,d],side:'left',axis:'vertical'});
 if(r)cornerDimensions.push({id:'L3',mm:r,from:[w-r,d],to:[w,d],side:'right',axis:'horizontal'}, {id:'B3',mm:c,from:[w,d-c],to:[w,d],side:'right',axis:'vertical'});
 const softIndices=schematic?points.map((p,i)=>cuts.some(cut=>[cut.from,cut.to].some(q=>q[0]===p[0]&&q[1]===p[1]))?i:-1).filter(i=>i>=0):[];
 return {version:'straight-front-chamfers-a1-1',title:schematic?'Gerade · durchlaufend, Übergänge schematisch':'Gerade · eckig abgeschrägt, Vorderkante unten',
  path:`M ${points.map(p=>p.join(' ')).join(' L ')} Z`,points,width:w,height:d,cornerArcs:[],cornerCuts:cuts,cornerDimensions,
  softIndices,contourStatus:schematic?'schematic':'diagonal-preview',areaMm2:schematic?null:w*d-(l*b+r*c)/2,
  front:{from:[l,d],to:[w-r,d]},
  dimensions:[{id:'L1',mm:w,from:[0,0],to:[w,0],side:-1},{id:'B1',mm:d,from:[w,0],to:[w,d],side:1}],
  edges:points.map((p,i)=>({from:p,to:points[(i+1)%points.length],kind:'line',finish:'matching-1.5',status:schematic?'reference-only':'planned'})),
  corner:config.corner,cornerSizeMm:null,joints:null,shippingParts:null,supplierMappingVerified:false,
  warnings:['Konturvorschau nach den Speedmaster-Referenzen. Keine Fertigungs- oder Bestellfreigabe. L2/L3 zeigen den Abschnitt entlang der Vorderkante, B2/B3 die Tiefe entlang der Seite.',
   ...(schematic?['Weiche Übergänge sind ausschließlich schematisch gezeichnet. Keine exakten Fertigungsradien; Bemaßung an der ungerundeten Bezugskontur. Vorschau vorerst auf 2000 × 600 mm und konservative Sondermaße begrenzt.']:['Sondermaße sind konservativ begrenzt: Shop-Regel L ≤ 1,40 × B, 10-mm-Schritte und 50 mm verbleibende Vorderkante/Hinterkante. Das ist keine allgemeine Lieferantenfreigabe.'])]};
}
