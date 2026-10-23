// Contour from user-confirmed Phase A1: R1 front-left, R2 front-right, front down.
// A mathematical preview does not grant supplier/manufacturing approval.
export function straightGeometry(config){
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
