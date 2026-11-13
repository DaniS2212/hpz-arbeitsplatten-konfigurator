import {straightGeometry} from './straight-geometry.js?v=1.0.3';
import {lGeometry} from './l-geometry.js?v=1.0.3';
import {u1Geometry} from './u1-geometry.js?v=1.0.3';
import {mmToCmText} from './customer-measures.js?v=1.0.3';
// U1 square and L1-L4 have image-based previews; U2-U4 remain generic.
export function geometry(config) {
  if(config.product==='straight'&&config.straightCorner)return straightGeometry(config);
  if(config.product==='l'&&config.lCorner)return lGeometry(config);
  if(config.product==='u'&&['U1','U2','U3','U4'].includes(config.geometry)&&config.corner==='square')return u1Geometry(config);
  const {L1:w,L2:left,L3:right,B1:depth,B2:leg,B3:legRight}=config.dimensions;
  const isStraight=config.product==='straight', isU=config.product==='u';
  if(!isStraight && (left<=depth || leg>=w || (isU && (right<=depth || leg+legRight>=w))))
    throw new Error('In der schematischen Vorschau bleibt keine positive Innenöffnung.');
  let points=isStraight?[[0,0],[w,0],[w,depth],[0,depth]]:
    isU?[[0,0],[w,0],[w,right],[w-legRight,right],[w-legRight,depth],[leg,depth],[leg,left],[0,left]]:
    [[0,0],[w,0],[w,depth],[leg,depth],[leg,left],[0,left]];
  let areaMm2=isStraight?w*depth:w*depth+leg*(left-depth)+(isU?legRight*(right-depth):0);
  let path=`M ${points.map(p=>p.join(' ')).join(' L ')} Z`;
  if(['round','chamfer'].includes(config.corner)) {
    const r=config.special.size;
    if(r>=Math.min(w,depth,...(isStraight?[]:[leg]))) throw new Error('Eckmaß ist für diese Außenkante zu groß.');
    path=`M ${r} 0 L ${points.slice(1).map(p=>p.join(' ')).join(' L ')} L 0 ${r}`;
    if(config.corner==='round') {path+=` A ${r} ${r} 0 0 1 ${r} 0 Z`;areaMm2-=r*r*(1-Math.PI/4);}
    else {path+=` L ${r} 0 Z`;areaMm2-=r*r/2;}
    points=[[r,0],...points.slice(1),[0,r]];
  }
  const height=isStraight?depth:Math.max(left,right??0);
  const dimensions=[{id:'L1',mm:w,from:[0,0],to:[w,0],side:-1}];
  if(isStraight) dimensions.push({id:'B1',mm:depth,from:[w,0],to:[w,depth],side:1});
  else {
    dimensions.push({id:'L2',mm:left,from:[0,0],to:[0,left],side:-1},
      {id:'B1',mm:depth,from:[w,0],to:[w,depth],side:1},
      {id:'B2',mm:leg,from:[0,left],to:[leg,left],side:1});
    if(isU) dimensions.push({id:'L3',mm:right,from:[w,0],to:[w,right],side:2},
      {id:'B3',mm:legRight,from:[w-legRight,right],to:[w,right],side:1});
  }
  return {version:'family-sketch-v1',title:isStraight?'Gerade · technische Vorschau':'L/U-Familienskizze · keine Speedmaster-Zuordnung',
    points,path,areaMm2,width:w,height,dimensions,
    edges:points.map((p,i)=>({from:p,to:points[(i+1)%points.length],finish:'matching-1.5',status:'planned',
      kind:config.corner==='round'&&i===points.length-1?'arc':'line',
      ...(config.corner==='round'&&i===points.length-1?{radiusMm:config.special.size}:{})})),
    corner:config.corner,cornerSizeMm:config.special.size??null,
    joints:null,shippingParts:null,supplierMappingVerified:false,
    warnings:['Keine Fertigungsfreigabe. Teile, Stoßkanten, Fertigmaßbezug und Lieferantengrenzen sind noch zu bestätigen.',
      ...(!isStraight?['L1–L4/U1–U4 sind noch nicht zeichnerisch zugeordnet. Diese gemeinsame Familienskizze stellt keine konkrete Speedmaster-Variante dar.']:[]),
      ...(['round','chamfer'].includes(config.corner)?['Eckmuster nur oben links; Position und Zulässigkeit beim Lieferanten ungeprüft.']:[]),
      ...(config.corner==='continuous'?['„Kante durchlaufend“ noch ohne bestätigte Kontur-/Stoßdefinition; keine geometrische Änderung unterstellt.']:[])]};
}
function escapeXml(value) {return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
// Screen-oriented quadratic blends only. They are deliberately absent from
// manufacturing parameters/area and must never be interpreted as real radii.
function schematicPath(g,trim){
  if(!g.softIndices?.length)return g.path;
  let path=`M ${g.points[0].join(' ')}`;
  for(let i=1;i<g.points.length;i++){
    const p=g.points[i],prev=g.points[i-1],next=g.points[(i+1)%g.points.length];
    if(!g.softIndices.includes(i)){path+=` L ${p.join(' ')}`;continue;}
    const before=Math.hypot(prev[0]-p[0],prev[1]-p[1]),after=Math.hypot(next[0]-p[0],next[1]-p[1]),t=Math.min(trim,before*.24,after*.24);
    const a=[p[0]+(prev[0]-p[0])*t/before,p[1]+(prev[1]-p[1])*t/before],b=[p[0]+(next[0]-p[0])*t/after,p[1]+(next[1]-p[1])*t/after];
    path+=` L ${a.join(' ')} Q ${p.join(' ')} ${b.join(' ')}`;
  }
  return path+' Z';
}
export function svg(g,active='',{decor='W980',showDimensions=true,partsView=false,transparentView=false,selectedPart=null,selectedSeam=null,detail=null,textureUrl=null,unit='mm',invalidField=null}={}) {
  const measure=mm=>unit==='cm'?`${mmToCmText(mm)} cm`:`${mm} mm`;
  // A straight worktop is visually much flatter than an L/U. A tighter
  // preview viewport makes the actual slab larger without changing its
  // dimensions, aspect ratio, measurement positions or customer price.
  const straightPreview=g.version?.startsWith('straight-');
  const isUPreview=g.version?.startsWith('speedmaster-u');
  const pad=Math.max(g.width,g.height)*(straightPreview?.11:.19),
    // Straight and L/U now use comparable ON-SCREEN label sizes. The former
    // 12%-of-depth cap made 200x60cm straight measurements unreadably small.
    font=straightPreview
      ?Math.min(pad*.54,g.width*.052,g.height*.24)
      :g.front?Math.min(pad*.28,g.width*.028,g.height*.12):pad*.28;
  detail=g.front&&['left','right'].includes(detail)?detail:null;
  const trim=g.contourStatus==='schematic'
    ?g.front?Math.min(font*.4,(g.front.to[0]-g.front.from[0])*.2)
      :g.uCorner?.treatment==='chamfer_continuous'
        ?Math.min(40,font*.32,...(g.cornerCuts??[]).map(c=>Math.hypot(c.to[0]-c.from[0],c.to[1]-c.from[1])*.20))
        :Math.min(18,font*.13,...(g.cornerCuts??[]).map(c=>Math.hypot(c.to[0]-c.from[0],c.to[1]-c.from[1])*.08))
    :0;
  // Put opaque, calm label plates in front of guide lines so dense corner
  // dimensions remain readable on both textured and light surfaces.
  const label=(text,x,y,{vertical=false,selected=false,corner=false}={})=>{
    // Active input uses colour/weight but never changes font size or ruler placement.
    const size=font*(corner?.73:1);
    const width=(text.length*.57+.60)*size,height=size*1.40;
    return `<g class="apl-measure-label" stroke="none" transform="translate(${x} ${y})${vertical?' rotate(-90)':''}" pointer-events="all"><rect x="${-width/2}" y="${-height/2}" width="${width}" height="${height}" rx="${size*.18}" fill="${selected?'#fffaf3':'#f4f7f6'}" fill-opacity=".97"/><text x="0" y="0" text-anchor="middle" dominant-baseline="central" fill="${selected?'#a34f1c':'#365861'}" font-weight="${selected?800:500}" font-size="${size}">${escapeXml(text)}</text></g>`;
  };
  const isLPreview=g.version?.startsWith('speedmaster-l');
  // A right-hand Straight chamfer adds B3 next to the full-depth B1 ruler.
  // Separate their rails so the rotated labels no longer overlap.
  const straightRightChamfer=straightPreview&&(g.cornerDimensions??[]).some(
    c=>c.axis==='vertical'&&c.side==='right'
  );
  const b2Baseline=g.dimensions?.find(d=>d.id==='B2');
  const b2Crowded=isLPreview&&b2Baseline&&(g.cornerDimensions??[])
    .some(c=>c.axis==='vertical'&&Math.abs(c.from[0]-b2Baseline.from[0])<.001);
  const lCornerFocus=active.startsWith('corner-')&&isLPreview;
  const measures=(detail?[]:g.dimensions).map(d=>{
    const field=d.focusKey??d.id;
    // L3/L4 B3/B4 and L4 B5 are essential dimensions, not hover-only
    // decorations. Their dedicated outer rails keep them visible even when
    // another dimension is focused; hide only while editing corner cuts.
    if(lCornerFocus)return '';
    const vertical=d.axis==='vertical'||(d.axis!=='horizontal'&&d.from[0]===d.to[0]);
    // A short corner-cut label sits just below the leg. Put the full B1
    // width dimension farther down to prevent opaque labels masking each other.
    const isL=g.version?.startsWith('speedmaster-l');
    const lowerCorner=isL&&(g.cornerDimensions??[]).some(c=>c.axis==='horizontal'&&c.from[1]===g.height);
    const cornerB1=!!g.cornerDimensions?.length&&d.id==='B1';
    // B2 shares its vertical alignment with an upper-corner B4 (or mirrored
    // B3). Place the long full-depth label on a distinct outer measurement rail.
    const rail=isUPreview&&d.id==='B1'?0.25:straightRightChamfer&&d.id==='B1'?1.50
      :d.id==='B2'&&b2Crowded?.95:cornerB1?(lowerCorner?1.35:.95):.45;
    const diagonal=isL&&d.axis==='diagonal';
    // B5 is a diagonal setting. Keep a real 45-degree dimension on its
    // own axis, not offset onto the B3/B4 horizontal reference rail.
    const offset=d.internal?0:diagonal?0:pad*(d.referenceOutside?(d.offsetFactor??.88):rail)*d.side;
    const a=[d.from[0]+(vertical?offset:0),d.from[1]+(vertical?0:offset)];
    const b=[d.to[0]+(vertical?offset:0),d.to[1]+(vertical?0:offset)];
    const selected=field===active,color=selected?'#a34f1c':'#365861';
    // If an input is temporarily invalid the outline is intentionally the
    // last valid geometry. Never show an obsolete NUMBER for that field.
    const labelText=invalidField===field
      ?String(d.label??d.id):`${d.label??d.id}: ${measure(d.mm)}`;
    const cutMid=diagonal&&d.diagonalCut
      ?[(d.diagonalCut.from[0]+d.diagonalCut.to[0])/2,
        (d.diagonalCut.from[1]+d.diagonalCut.to[1])/2]:null;
    // Place even a real diagonal ruler's text OUTSIDE the wood, directly
    // alongside its own diagonal rather than above B3/B4 or on the surface.
    const textX=diagonal?cutMid[0]-font*1.7:(a[0]+b[0])/2+(vertical?(d.internal?font*.92:Math.sign(d.side)*font*.85):0);
    const textY=diagonal?cutMid[1]-font*1.7:(a[1]+b[1])/2-(vertical?0:font*.75);
    // Capped B5 is a setting, not the physical length of the diagonal
    // line. Point the callout at the visible OUTER diagonal, without false
    // double-arrow dimensions. This also separates it from the B3/B4 rail.
    // Dashed projection through the L4 plate connects OUTER and INNER
    // diagonals. This is a placement aid for B5, NOT a measurable 1:1 ruler.
    const b5Guide=diagonal&&d.diagonalCut
      ?`<path class="apl-b5-guide" data-b5-axis="diagonal"
          d="M ${cutMid[0]} ${cutMid[1]} L ${d.to[0]} ${d.to[1]}"
          fill="none" stroke="${color}" stroke-width="${selected?font/17:font/27}"
          stroke-dasharray="${font*.22} ${font*.18}" opacity="${selected?.88:.56}"
          pointer-events="none"><title>Diagonalbereich B5 – Orientierung, kein Längenmaß</title></path>`:'';
    if(diagonal&&d.settingOnly){
      const cut=d.diagonalCut??{from:g.points[0],to:g.points[g.points.length-1]};
      const mid=[(cut.from[0]+cut.to[0])/2,(cut.from[1]+cut.to[1])/2];
      const text=[mid[0]-font*1.52,mid[1]-font*1.36];
      const end=[mid[0]-font*.82,mid[1]-font*.82];
      return `<g class="apl-measure" data-field="${escapeXml(field)}" data-active="${selected}" data-setting-only="true" role="button" tabindex="0" data-measure-id="B5" data-diagonal="outer-edge" aria-label="B5 an der Außendiagonale bearbeiten" stroke="${color}" fill="${color}">
        ${b5Guide}<path d="M ${mid} L ${end}" fill="none" stroke-width="${selected?font/11:font/26}"/>
        <circle cx="${mid[0]}" cy="${mid[1]}" r="${font*.08}"/>
        ${label(labelText,text[0],text[1],{selected,corner:true})}</g>`;
    }
    return `<g class="apl-measure" data-field="${escapeXml(field)}" data-active="${selected}" role="button" tabindex="0" data-measure-id="${escapeXml(d.label??d.id)}" data-diagonal="${diagonal?'diagonal-ruler':'false'}" aria-label="${escapeXml(field)} bearbeiten" stroke="${color}" fill="${color}">
      ${b5Guide}<path d="M ${d.from} L ${a} M ${d.to} L ${b}" stroke-width="${selected?font/10:font/24}" stroke-dasharray="${font/4} ${font/4}"/>
      <path d="M ${a} L ${b}" stroke-width="${selected?font/10:font/24}" marker-start="url(#apl-arrow)" marker-end="url(#apl-arrow)"/>
      ${label(labelText,textX,textY,{vertical,selected,corner:diagonal})}</g>`;
  }).join('');
  const radii=(g.cornerArcs??[]).filter(a=>!detail||a.side===detail).map(a=>{
    const selected=active===a.id||active===`side-${a.side}`||active==='side-both',color=selected?'#a34f1c':'#365861';
    // Preserve data-field="corner-R1" for editing but print just R1 in the SVG.
    const displayId=a.label??a.id.replace(/^corner-/,'');
    const x=a.labelAt?.[0]??(a.side==='left'?g.width*.18:g.width*.82),
      y=a.labelAt?.[1]??g.height+pad*.65;
    const tx=a.leaderPoint?.[0]??a.center[0]+(a.side==='left'?-1:1)*a.radiusMm/Math.SQRT2,
      ty=a.leaderPoint?.[1]??a.center[1]+a.radiusMm/Math.SQRT2;
    return `<g data-corner="${a.id}" data-active="${selected}"><path d="M ${a.from} A ${a.radiusMm} ${a.radiusMm} 0 0 1 ${a.to}" fill="none" stroke="${color}" stroke-width="${selected?font/6:font/16}"/>${showDimensions?`<g data-field="${a.id}" data-active="${selected}" class="apl-measure" role="button" tabindex="0" data-measure-id="${a.id}" aria-label="${escapeXml(a.id)} bearbeiten"><path d="M ${a.center} L ${tx} ${ty} L ${x} ${y-font}" fill="none" stroke="${color}" stroke-width="${font/24}"/><circle cx="${a.center[0]}" cy="${a.center[1]}" r="${font/20}" fill="${color}"/>${label(invalidField===a.id?displayId:`${displayId}: ${measure(a.radiusMm)}`,x,y,{selected,corner:true})}</g>`:''}</g>`;
  }).join('');
  const cuts=(g.cornerCuts??[]).filter(c=>!detail||c.side===detail).map(c=>{
    const selected=c.fields.includes(active)||active===`side-${c.side}`||active==='side-both',color=selected?'#a34f1c':'#365861';
    const len=Math.hypot(c.to[0]-c.from[0],c.to[1]-c.from[1]),t=Math.min(c.presentationOnly?trim:0,len*.24);
    const a=c.from.map((v,i)=>v+(c.to[i]-v)*t/len),b=c.to.map((v,i)=>v+(c.from[i]-v)*t/len);
    return `<g data-cut="${c.side}" data-active="${selected}"><path d="M ${a} L ${b}" fill="none" stroke="${color}" stroke-width="${selected?font/6:font/16}"/></g>`;
  }).join('');
  const cornerMeasures=(g.cornerDimensions??[]).filter(d=>!detail||d.side===detail).map(d=>{
    const vertical=d.axis==='vertical',selected=d.id===active,color=selected?'#a34f1c':'#365861';
    // Do not infer the free side from a corner's left/right *name*.
    const isL=g.version?.startsWith('speedmaster-l');
    // U L4/L5 live inside the open space, never over the B2/B3 foot.
    const normal=isUPreview?(d.side==='left'?1:-1)
      :isL&&d.labelNormal!==undefined?d.labelNormal:(d.side==='left'?-1:1);
    const offset=vertical?(isL?normal*pad*.40:isUPreview?normal*pad*.38:(d.side==='left'?-pad*.42:pad*.40)):pad*(isL?.35:.60);
    const a=[d.from[0]+(vertical?offset:0),d.from[1]+(vertical?0:offset)],b=[d.to[0]+(vertical?offset:0),d.to[1]+(vertical?0:offset)];
    const mid=(a[0]+b[0])/2;
    const x=vertical?a[0]+normal*font*.9:isL?mid:Math.max(font*3,Math.min(g.width-font*3,mid)),
      innerTop=g.dimensions?.find(dim=>dim.id==='B1')?.mm??0,
      y=vertical?(a[1]+b[1])/2-(isUPreview?Math.min(font*1.25,Math.max(0,((a[1]+b[1])/2-innerTop)*.16)):0):a[1]+font*.85;
    return `<g class="apl-measure" data-field="${d.id}" data-active="${selected}" role="button" tabindex="0" data-measure-id="${d.id}" aria-label="${escapeXml(d.id)} bearbeiten" stroke="${color}" fill="${color}"><path d="M ${d.from} L ${a} M ${d.to} L ${b}" stroke-width="${selected?font/11:font/28}" stroke-dasharray="${font/6} ${font/6}"/><path d="M ${a} L ${b}" stroke-width="${selected?font/9:font/25}" marker-start="url(#apl-arrow)" marker-end="url(#apl-arrow)"/>${label(invalidField===d.id?String(d.label??d.id):`${d.label??d.id}: ${measure(d.mm)}`,x,y,{vertical,selected,corner:true})}</g>`;
  }).join('');
  // Keep viewport fixed when active B3/B5 reference changes.
  const outsideReference=(g.dimensions??[]).some(d=>d.referenceOutside);
  const extra=outsideReference ? 0.5 : 0;
  let viewBox=`${-pad*(1+extra)} ${-pad*(1+extra)} ${g.width+pad*(2.3+extra)} ${g.height+pad*(2+extra)}`;
  if(isUPreview){
    // Right-side B1 (short) and L3 (long) have independent fixed rails.
    viewBox=`${-pad} ${-pad} ${g.width+pad*2.65} ${g.height+pad*2.15}`;
  }
  if(straightPreview && !detail){
    // Reserve only the label rails required by L1 and right-hand B1;
    // the old 19% margin on every edge made 200 x 90 cm look too small.
    viewBox=`${-pad} ${-pad} ${g.width+pad*(straightRightChamfer?4:2.5)} ${g.height+pad*2.4}`;
  }
  if(isLPreview){
    // All visible L labels must fit the actual SVG viewport (DOM visibility
    // alone does not prevent clipping). Extra rails are activated only where
    // a corner is physically present on the same external measurement edge.
    const leftRail=b2Crowded&&b2Baseline.from[0]===0;
    const rightRail=b2Crowded&&b2Baseline.from[0]===g.width;
    const bottomRail=(g.cornerDimensions??[]).some(c=>c.axis==='horizontal'&&c.from[1]===g.height);
    const leftFactor=Math.max(1+extra,leftRail?1.55:1);
    // L2's long vertical L2 ruler runs on the right with side=2, so its
    // rotated text extends farther than the standard right-hand rail.
    // At 390px the older 1.3*pad bound clipped the opaque "L2" label.
    const outsideRightDimension=(g.dimensions??[]).some(d=>
      (d.side??0)>1&&(d.from?.[0]??-1)===g.width&&d.to?.[0]===g.width
    );
    const rightFactor=outsideRightDimension?1.75:(rightRail?1.55:1.3);
    const bottomFactor=bottomRail?1.55:1;
    const topFactor=1+extra;
    viewBox=`${-pad*leftFactor} ${-pad*topFactor} ${g.width+pad*(leftFactor+rightFactor)} ${g.height+pad*(topFactor+bottomFactor)}`;
  }
  // Stage 1 presents only the visual silhouette/seams and corners.
  if(!showDimensions&&!detail){
    const margin=Math.max(g.width,g.height)*(g.front?.115:.10);
    viewBox=`${-margin} ${-margin} ${g.width+margin*2} ${g.height+margin*2}`;
  }
  let frontX=g.width/2;
  if(detail){
    const parameters=[...(g.cornerArcs??[]).filter(a=>a.side===detail).map(a=>a.radiusMm),...(g.cornerDimensions??[]).filter(d=>d.side===detail).map(d=>d.mm)];
    const extent=Math.max(g.width*.22,...parameters.map(v=>v+font*4),420),boxWidth=extent+pad*.65+font*2;
    const boxX=detail==='left'?-pad*.65:g.width+pad*.65-boxWidth,boxY=g.height-Math.max(g.height*.55,...parameters.map(v=>v+font*2))-font;
    viewBox=`${boxX} ${boxY} ${boxWidth} ${g.height+pad*.95-boxY}`;
    frontX=detail==='left'?extent*.5:g.width-extent*.5;
  }
  const front=g.front&&showDimensions?`<g aria-label="Vorderkante unten"><path d="M ${g.front.from[0]+trim} ${g.height} L ${g.front.to[0]-trim} ${g.height}" stroke="#146178" stroke-width="${font/10}"/><text x="${frontX}" y="${g.height+pad*.68}" text-anchor="middle" fill="#146178" font-size="${font*.76}">Vorderkante</text></g>`:'';
  const seams=(g.previewSeams??[]).map((seam,index)=>{
    const meta=partsView?g.previewSeamDetails?.[index]:null;
    const d='M '+seam.from+' L '+seam.to;
    if(!meta){
      // Customers can see U1–U4 join directions already in Draufsicht.
      // Switching to "Aufteilung" remains optional for selecting a join.
      const highlighted=g.version?.startsWith('speedmaster-u');
      // White underlay makes L seams legible on dark decor while preserving
      // the same schematic seam coordinates and non-manufacturing status.
      const halo=highlighted?'':'<path class="apl-preview-seam-halo" d="'+d+'" fill="none" stroke="#fffefa" stroke-width="'+(font/12)+'" stroke-dasharray="'+(font/10)+' '+(font/12)+'" opacity=".92" pointer-events="none"/>';
      return halo+'<path class="apl-preview-seam" data-preview-join="'+(highlighted?'u':'other')+'" d="'+d+'" fill="none" stroke="'+(highlighted?'#146178':'#365861')+'" stroke-width="'+(font/(partsView?11:highlighted?13:28))+'" stroke-dasharray="'+(font/(partsView?4:highlighted?5:10))+' '+(font/(partsView?6:highlighted?8:12))+'" opacity="'+(partsView?.82:highlighted?.78:.80)+'"/>';
    }
    const selected=meta.id===selectedSeam,color=selected?'#bc7045':'#365861';
    const x=(seam.from[0]+seam.to[0])/2,y=(seam.from[1]+seam.to[1])/2;
    const marker=meta.label.replace('Stoß ','');
    return '<g class="apl-seam-review" data-seam-id="'+escapeXml(meta.id)+'" data-selected="'+selected+'">'
      +'<title>'+escapeXml(meta.label)+': Lage nur skizziert. Verbinder und CNC-Fräsungen unbekannt.</title>'
      +'<path class="apl-preview-seam" d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+(font/(selected?5:11))+'" stroke-dasharray="'+(font/4)+' '+(font/7)+'" opacity=".92" pointer-events="none"/>'
      +'<g class="apl-seam-badge" transform="translate('+x+' '+y+')" pointer-events="none"><circle r="'+(font*.43)+'" fill="'+(selected?'#bc7045':'#fffefa')+'" stroke="#365861" stroke-width="'+(font/23)+'"/><text text-anchor="middle" dominant-baseline="central" font-size="'+(font*.48)+'" font-weight="700" fill="'+(selected?'#fffefa':'#365861')+'">'+marker+'</text></g>'
      +'<path class="apl-seam-hit" d="'+d+'" stroke="transparent" stroke-width="'+(font*.64)+'" fill="none" pointer-events="stroke"/></g>';
  }).join('');
  // Part polygons come from the same illustrative split planes as the seams.
  // Clip the overlays to the actual corner-edited contour, including round arcs.
  // Never render these regions as factory-approved cut plans.
  const previewParts=partsView&&Array.isArray(g.previewParts)?g.previewParts:[];
  // A selected illustrative seam touches two specific visual regions.
  // Emphasize BOTH, not the whole contour or an invented CNC connector.
  // Direct part selection takes priority if callers provide both states.
  const seam=partsView&&!selectedPart&&selectedSeam
    ?(g.previewSeamDetails??[]).find(s=>s.id===selectedSeam):null;
  const seamNeighbors=new Set(seam?.partIds?.length===2?seam.partIds:[]);
  const partsClip=previewParts.length?`<clipPath id="apl-parts-clip"><path d="${escapeXml(schematicPath(g,trim))}"/></clipPath>`:'';
  const pieceOverlays=previewParts.map(part=>{
    const selected=selectedPart===part.id,neighbor=seamNeighbors.has(part.id);
    const other=(!!selectedPart||seamNeighbors.size>0)&&!selected&&!neighbor;
    const shade=part.id==='corner'?'#b49a78':'#146178';
    const opacity=selected?.23:neighbor?.20:other?.025:part.number%2===0?.085:.055;
    // Rounded parts require an untrimmed paint cover inside the *actual*
    // SVG silhouette clip, or an arc-sized sliver would remain unshaded.
    // The truthful numeric part polygon/marker stays corner-edited.
    const paintPolygon=part.maskPaintPolygon??part.polygon;
    return `<path class="apl-preview-part" data-part-id="${escapeXml(part.id)}" data-selected="${selected}" data-seam-neighbor="${neighbor}" d="M ${paintPolygon.map(p=>p.join(' ')).join(' L ')} Z" fill="${shade}" fill-opacity="${opacity}" stroke="none"/>`;
  }).join('');
  const overlays=previewParts.length?`<g class="apl-part-overlays" clip-path="url(#apl-parts-clip)">${pieceOverlays}</g>`:'';
  const partNumbers=previewParts.map(part=>{
    const selected=selectedPart===part.id||seamNeighbors.has(part.id);
    const radius=font*.46,x=part.marker[0],y=part.marker[1];
    return `<g class="apl-part-number" transform="translate(${x} ${y})" pointer-events="none"><circle r="${radius}" fill="${selected?'#16444d':'#fffefa'}" stroke="#16444d" stroke-width="${font/24}"/><text text-anchor="middle" dominant-baseline="central" font-size="${font*.53}" font-weight="700" fill="${selected?'#fffefa':'#16444d'}">${part.number}</text></g>`;
  }).join('');
  const schematicNote=''; // the adjacent shape-note provides the non-manufacturing disclaimer
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${escapeXml(g.title+(detail?' · Detail '+(detail==='left'?'vorne links':'vorne rechts'):''))}" style="width:100%;height:auto;max-height:560px">
    <title>${escapeXml(g.title)}</title><desc>Maße in ${unit==='cm'?'Zentimetern':'Millimetern'}. Schematische Darstellung zur Orientierung; keine Fertigungszeichnung.</desc>
    <defs><marker id="apl-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 10 0 L 0 5 L 10 10" fill="#354b46"/></marker>
    <linearGradient id="apl-white" x2=".2" y2="1"><stop stop-color="#fffefa"/><stop offset="1" stop-color="#e8e7df"/></linearGradient>
    <pattern id="apl-oak" width="360" height="160" patternUnits="userSpaceOnUse"><rect width="360" height="160" fill="#c49b68"/>
    <path d="M-40 20 Q100 1 400 18 M-40 44 Q190 68 400 34 M-40 86 Q150 55 400 94 M-40 121 Q150 143 400 116 M-40 150 Q150 129 400 152" fill="none" stroke="#a77b4d" stroke-width="5" opacity=".46"/>
    <path d="M-40 29 Q180 12 400 27 M-40 102 Q150 78 400 106" fill="none" stroke="#e5c599" stroke-width="7" opacity=".5"/></pattern>${textureUrl?`<pattern id="apl-texture" width="${g.width}" height="${g.height}" patternUnits="userSpaceOnUse"><rect width="${g.width}" height="${g.height}" fill="#e9eeec"/><image href="${escapeXml(textureUrl)}" width="${g.width}" height="${g.height}" preserveAspectRatio="xMidYMid slice"/></pattern>`:''}${partsClip}</defs>
    <g stroke-width="${font/20}" font-family="system-ui,sans-serif"><path class="apl-surface" d="${escapeXml(schematicPath(g,trim))}" fill="url(#${textureUrl?'apl-texture':decor==='H1145'?'apl-oak':'apl-white'})" fill-opacity="${transparentView?'.25':'1'}" stroke="#8c887a" stroke-width="${font/12}"/>${front}${overlays}${seams}${partNumbers}${cuts}${radii}${showDimensions?measures+cornerMeasures:''}${schematicNote}</g></svg>`;
}
