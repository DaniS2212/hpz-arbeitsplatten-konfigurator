/** U1: Speedmaster screenshot-based silhouette and visual-only joins, 05 Nov 2026.
 * No real cut list, verified connector count, CNC coordinates, prices or shipping. */
const pt=(x,y)=>[x,y];
const box=(a,b,c,d)=>[pt(a,b),pt(c,b),pt(c,d),pt(a,d)];
const part=(id,label,number,polygon)=>({id,label,number,polygon,
 marker:pt((polygon[0][0]+polygon[2][0])/2,(polygon[0][1]+polygon[2][1])/2),status:'illustration-only'});
export function u1Geometry(c){
 if(c.product!=='u'||c.geometry!=='U1'||c.corner!=='square')throw Error('U1-Fotobeleg nur für die unbearbeitete Grundform.');
 const {L1:w,L2:l,L3:r,B1:d,B2:a,B3:b}=c.dimensions;
 if(![w,l,r,d,a,b].every(Number.isInteger)||l<=d||r<=d||a>=w||b>=w||a+b>=w)
  throw Error('U1: Die Innenöffnung muss positiv bleiben.');
 const points=[pt(0,0),pt(w,0),pt(w,r),pt(w-b,r),pt(w-b,d),pt(a,d),pt(a,l),pt(0,l)];
 const previewParts=[part('top','Obere Strecke',1,box(0,0,w,d)),
  part('left','Linker Schenkel',2,box(0,d,a,l)),
  part('right','Rechter Schenkel',3,box(w-b,d,w,r))];
 const previewSeams=[{from:pt(0,d),to:pt(a,d)},{from:pt(w-b,d),to:pt(w,d)}];
 const previewSeamDetails=[
  {id:'seam-1',label:'Stoß A',partIds:['top','left'],...previewSeams[0]},
  {id:'seam-2',label:'Stoß B',partIds:['top','right'],...previewSeams[1]}
 ].map(s=>({...s,status:'illustration-only',connectorType:null,connectorCount:null,machiningCoordinates:null}));
 const photo=w===2000&&l===1200&&r===1800&&d===600&&a===600&&b===600
  &&c.material==='APL38'&&c.decor==='W980'&&c.edge==='matching-1.5'&&c.corner==='square';
 const assemblyPhotoObservation=photo?{
  status:'photo-observation-only',caseId:'U1-W980-38-2000x1200x1800-B1B2B3-600-20261105',
  capturedDate:'2026-11-05',observationScope:'exact-visible-example-only',
  visiblePanelRegions:3,illustratedSeamIds:['seam-1','seam-2'],
  connectorSymbols:['biscuit-symbols','worktop-connector-symbols'],
  connectorCount:null,machiningCoordinates:null,verifiedCutList:false
 }:null;
 const dimensions=[
  {id:'L1',mm:w,from:pt(0,0),to:pt(w,0),side:-1},
  {id:'L2',mm:l,from:pt(0,0),to:pt(0,l),side:-1},
  {id:'L3',mm:r,from:pt(w,0),to:pt(w,r),side:2},
  {id:'B1',mm:d,from:pt(w,0),to:pt(w,d),side:1},
  {id:'B2',mm:a,from:pt(0,l),to:pt(a,l),side:1},
  {id:'B3',mm:b,from:pt(w-b,r),to:pt(w,r),side:1}
 ];
 return {
  version:'speedmaster-u1-screenshot-20261105',title:'U1 · nach Speedmaster-Bild',
  points,path:'M '+points.map(p=>p.join(' ')).join(' L ')+' Z',
  width:w,height:Math.max(l,r),areaMm2:w*d+a*(l-d)+b*(r-d),dimensions,
  edges:points.map((p,i)=>({from:p,to:points[(i+1)%points.length],finish:'matching-1.5',status:'planned',kind:'line'})),
  corner:'square',cornerSizeMm:null,previewParts,previewSeams,previewSeamDetails,assemblyPhotoObservation,
  joints:null,shippingParts:null,supplierMappingVerified:false,
  warnings:['U1-Grundkontur und zwei Fugen nach Speedmaster-Fotos vom 05.11.2026; bei abweichenden Maßen nur Vorschau.',
   'Drei sichtbare Bereiche sind keine bestätigten realen Zuschnitte. Verbinderzahlen, CNC-Fräsungen und Packstücke fehlen.',
   'Keine Fertigungs-, Preis- oder Verkaufsfreigabe für U1.']
 };
}
