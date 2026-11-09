/** U1-U4: Speedmaster screenshot-based silhouettes and visual-only joins, 05 Nov 2026.
 * All variants share one exterior. Each has a unique side-by-side pair of
 * longitudinal/transverse illustrated seams; not CNC, cut list or shipping.
 * The legacy exported name preserves the PR53 caller.
 */
const pt=(x,y)=>[x,y];
const box=(a,b,c,d)=>[pt(a,b),pt(c,b),pt(c,d),pt(a,d)];
const part=(id,label,number,polygon)=>({id,label,number,polygon,
 marker:pt((polygon[0][0]+polygon[2][0])/2,(polygon[0][1]+polygon[2][1])/2),status:'illustration-only'});
export const uSplitModes=Object.freeze({
 U1:Object.freeze(['cross','cross']),U2:Object.freeze(['length','length']),
 U3:Object.freeze(['length','cross']),U4:Object.freeze(['cross','length'])
});
// U-specific inner FOOT vertices: left index 6, right index 3.
 // These are NOT the outside top corners and are NOT the join seams.
 function editedContour(base,c){
   const corner=c.uCorner;
   if(!corner || corner.side==='none')return {
     path:'M '+base.map(p=>p.join(' ')).join(' L ')+' Z',
     points:base,arcs:[],cuts:[],cornerDimensions:[],removedArea:0};
   const sides=corner.side==='both'?['left','right']:[corner.side],edits=new Map();
   let removedArea=0;
   for(const side of sides){
     const index=side==='left'?6:3,vertex=base[index];
     const round=corner.treatment==='round';
     const vertical=round?corner.parameters[side==='left'?'R1':'R2']:
       corner.parameters[side==='left'?'L4':'L5'];
     const horizontal=round?vertical:corner.parameters[side==='left'?'B4':'B5'];
     const start=side==='left'?[vertex[0],vertex[1]-vertical]:
       [vertex[0]+horizontal,vertex[1]];
     const end=side==='left'?[vertex[0]-horizontal,vertex[1]]:
       [vertex[0],vertex[1]-vertical];
     edits.set(index,{side,round,vertical,horizontal,start,end,vertex});
     removedArea+=round?vertical*vertical*(1-Math.PI/4):vertical*horizontal/2;
   }
   const commands=['M '+base[0].join(' ')],points=[base[0]],arcs=[],cuts=[],cornerDimensions=[];
   for(let i=1;i<base.length;i++){
     const edit=edits.get(i);
     if(!edit){commands.push('L '+base[i].join(' '));points.push(base[i]);continue;}
     const {side,round,vertical,horizontal,start,end,vertex}=edit;
     commands.push('L '+start.join(' '),round
       ?'A '+vertical+' '+vertical+' 0 0 1 '+end.join(' ')
       :'L '+end.join(' '));
     points.push(start,end);
     if(round){
       const center=side==='left'?[vertex[0]-vertical,vertex[1]-vertical]
         :[vertex[0]+vertical,vertex[1]-vertical];
       arcs.push({id:'corner-'+(side==='left'?'R1':'R2'),radiusMm:vertical,
         center,from:start,to:end,side,
         leaderPoint:[center[0]+(side==='left'?1:-1)*vertical/Math.SQRT2,
           center[1]+vertical/Math.SQRT2],
         // Place the annotation in the WHITE inner opening, not on the
         // bottom B2/B3 width rulers. Both previews and inline editing use
         // the same leader anchor for the correct inner foot.
         labelAt:[vertex[0]+(side==='left'?1:-1)*
             Math.min(180,Math.max(80,(base[3][0]-base[6][0])/3)),
           vertex[1]-Math.min(140,Math.max(50,(vertex[1]-c.dimensions.B1)/2))]});
     }else{
       cuts.push({side,from:start,to:end,presentationOnly:corner.treatment==='chamfer_continuous',
         fields:side==='left'?['corner-L4','corner-B4']:['corner-L5','corner-B5']});
       const lenKey=side==='left'?'L4':'L5',widthKey=side==='left'?'B4':'B5';
       cornerDimensions.push(
         {id:'corner-'+lenKey,label:lenKey,mm:vertical,from:start,to:vertex,axis:'vertical',side},
         {id:'corner-'+widthKey,label:widthKey,mm:horizontal,from:vertex,to:end,axis:'horizontal',side}
       );
     }
   }
   return {path:commands.join(' ')+' Z',points,arcs,cuts,cornerDimensions,removedArea};
 }
export function u1Geometry(c){
 const split=uSplitModes[c.geometry];
 if(c.product!=='u'||!split||c.corner!=='square')throw Error('U-Fotobeleg nur für die vier unbearbeiteten Grundformen.');
 const {L1:w,L2:l,L3:r,B1:d,B2:a,B3:b}=c.dimensions;
 if(![w,l,r,d,a,b].every(Number.isInteger)||l<=d||r<=d||a>=w||b>=w||a+b>=w)
  throw Error('U-Form: Die Innenöffnung muss positiv bleiben.');
 const [leftMode,rightMode]=split;
 const base=[pt(0,0),pt(w,0),pt(w,r),pt(w-b,r),pt(w-b,d),pt(a,d),pt(a,l),pt(0,l)];
 const edit=editedContour(base,c);
 const points=edit.points;
 const hasCorner=!!c.uCorner&&c.uCorner.side!=='none';
 // Supplier photos show three visible regions for each of four seam layouts.
 // These are projected visual areas only. No manufacturer has verified their
 // physical cutting dimensions, assembly hardware or shipped piece count.
 const previewParts=[
  part('top','Obere Strecke',1,box(leftMode==='length'?a:0,0,rightMode==='length'?w-b:w,d)),
  part('left','Linker Schenkel',2,box(0,leftMode==='length'?0:d,a,l)),
  part('right','Rechter Schenkel',3,box(w-b,rightMode==='length'?0:d,w,r))
 ];
 const leftSeam=leftMode==='length'?{from:pt(a,0),to:pt(a,d)}:{from:pt(0,d),to:pt(a,d)};
 const rightSeam=rightMode==='length'?{from:pt(w-b,0),to:pt(w-b,d)}:{from:pt(w-b,d),to:pt(w,d)};
 const previewSeams=[leftSeam,rightSeam];
 const previewSeamDetails=[
  {id:'seam-1',label:'Stoß A',partIds:['top','left'],direction:leftMode,...leftSeam},
  {id:'seam-2',label:'Stoß B',partIds:['top','right'],direction:rightMode,...rightSeam}
 ].map(s=>({...s,status:'illustration-only',connectorType:null,connectorCount:null,machiningCoordinates:null}));
 const photo=!hasCorner&&w===2000&&l===1200&&r===1800&&d===600&&a===600&&b===600
  &&c.material==='APL38'&&c.decor==='W980'&&c.edge==='matching-1.5'&&c.corner==='square';
 const assemblyPhotoObservation=photo?{
  status:'photo-observation-only',caseId:c.geometry+'-W980-38-2000x1200x1800-B1B2B3-600-20261105',
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
  version:'speedmaster-'+c.geometry.toLowerCase()+(hasCorner?'-inner-corner-preview-20261109':'-screenshot-20261105'),
  title:c.geometry+' · nach Speedmaster-Bild'+(hasCorner?' · innere Ecke':''),
  points,path:edit.path,
  width:w,height:Math.max(l,r),areaMm2:w*d+a*(l-d)+b*(r-d)-edit.removedArea,dimensions,
  edges:points.map((p,i)=>({from:p,to:points[(i+1)%points.length],finish:'matching-1.5',status:'illustration-only',kind:'line'})),
  corner:'square',cornerSizeMm:null,cornerArcs:edit.arcs,cornerCuts:edit.cuts,
  cornerDimensions:edit.cornerDimensions,
  ...(hasCorner?{uCorner:c.uCorner}:{}),
  previewParts,previewSeams,previewSeamDetails,assemblyPhotoObservation,
  joints:null,shippingParts:null,supplierMappingVerified:false,
  warnings:[
   c.geometry+': Grundkontur und zwei Fugen nach Speedmaster-Fotos vom 05.11.2026; bei abweichenden Maßen nur Vorschau.',
   'Drei sichtbare Bereiche sind keine bestätigten realen Zuschnitte. Verbinderzahlen, CNC-Fräsungen und Packstücke fehlen.',
   ...(hasCorner?['Linke und rechte Innen-Eckbearbeitungen sind bildbasierte U1-Vorschauoptionen; das Maßmodell ist rein geometrisch und nicht produktionsgeprüft.']:[]),
   'Keine Fertigungs- oder Verkaufsfreigabe allein aus einer U-Skizze.'
  ]
 };
}
