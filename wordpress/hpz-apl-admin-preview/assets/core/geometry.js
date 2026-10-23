import {straightGeometry} from './straight-geometry.js?v=0.2.0';
// L/U are explicitly generic family sketches. They are not Speedmaster L1–L4/U1–U4 definitions.
export function geometry(config) {
  if(config.product==='straight'&&config.straightCorner)return straightGeometry(config);
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
export function svg(g,active='',{decor='W980',showDimensions=true}={}) {
  const pad=Math.max(g.width,g.height)*0.19,font=g.front?Math.min(pad*0.28,g.width*.028,g.height*.12):pad*0.28;
  const measures=g.dimensions.map(d=>{
    const vertical=d.from[0]===d.to[0], offset=pad*0.45*d.side;
    const a=[d.from[0]+(vertical?offset:0),d.from[1]+(vertical?0:offset)];
    const b=[d.to[0]+(vertical?offset:0),d.to[1]+(vertical?0:offset)];
    const color=d.id===active?'#b5521c':'#354b46';
    const textX=(a[0]+b[0])/2, textY=(a[1]+b[1])/2-font*0.5;
    return `<g class="apl-measure" data-field="${escapeXml(d.id)}" data-active="${d.id===active}" stroke="${color}" fill="${color}">
      <path d="M ${d.from} L ${a} M ${d.to} L ${b}" stroke-dasharray="${font/4} ${font/4}"/>
      <path d="M ${a} L ${b}" marker-start="url(#apl-arrow)" marker-end="url(#apl-arrow)"/>
      <text x="${textX}" y="${textY}" text-anchor="middle" stroke="none" font-size="${font}" ${vertical?`transform="rotate(-90 ${textX} ${(a[1]+b[1])/2})"`:''}>${escapeXml(d.id)}: ${d.mm} mm</text></g>`;
  }).join('');
  const radii=(g.cornerArcs??[]).map(a=>{
    const selected=active===a.id||active===`side-${a.side}`||active==='side-both',color=selected?'#b5521c':'#354b46';
    const x=a.side==='left'?g.width*.18:g.width*.82,y=g.height+pad*.65;
    const tx=a.center[0]+(a.side==='left'?-1:1)*a.radiusMm/Math.sqrt(2),ty=a.center[1]+a.radiusMm/Math.sqrt(2);
    return `<g data-corner="${a.id}" data-active="${selected}"><path d="M ${a.from} A ${a.radiusMm} ${a.radiusMm} 0 0 1 ${a.to}" fill="none" stroke="${color}" stroke-width="${selected?font/6:font/16}"/>${showDimensions?`<g data-field="${a.id}" class="apl-measure"><path d="M ${a.center} L ${tx} ${ty} L ${x} ${y-font}" fill="none" stroke="${color}" stroke-width="${font/24}"/><circle cx="${a.center[0]}" cy="${a.center[1]}" r="${font/20}" fill="${color}"/><text x="${x}" y="${y}" fill="${color}" text-anchor="middle" font-size="${font}">${a.id}: ${a.radiusMm} mm</text></g>`:''}</g>`;
  }).join('');
  const front=g.front?`<g aria-label="Vorderkante unten"><path d="M ${g.front.from} L ${g.front.to}" stroke="#17677a" stroke-width="${font/10}"/><text x="${g.width/2}" y="${g.height+pad*.25}" text-anchor="middle" fill="#17677a" font-size="${font*.8}">Vorderkante</text></g>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${g.width+pad*2.3} ${g.height+pad*2}" role="img" aria-label="${escapeXml(g.title)}" style="width:100%;height:auto;max-height:560px">
    <title>${escapeXml(g.title)}</title><desc>Maße in Millimetern. Ungeprüfte Vorschau, keine Fertigungszeichnung.</desc>
    <defs><marker id="apl-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 10 0 L 0 5 L 10 10" fill="#354b46"/></marker>
    <linearGradient id="apl-white" x2=".2" y2="1"><stop stop-color="#fffefa"/><stop offset="1" stop-color="#e8e7df"/></linearGradient>
    <pattern id="apl-oak" width="360" height="160" patternUnits="userSpaceOnUse"><rect width="360" height="160" fill="#c49b68"/>
    <path d="M-40 20 Q100 1 400 18 M-40 44 Q190 68 400 34 M-40 86 Q150 55 400 94 M-40 121 Q150 143 400 116 M-40 150 Q150 129 400 152" fill="none" stroke="#a77b4d" stroke-width="5" opacity=".46"/>
    <path d="M-40 29 Q180 12 400 27 M-40 102 Q150 78 400 106" fill="none" stroke="#e5c599" stroke-width="7" opacity=".5"/></pattern></defs>
    <g stroke-width="${font/20}" font-family="system-ui,sans-serif"><path class="apl-surface" d="${escapeXml(g.path)}" fill="url(#${decor==='H1145'?'apl-oak':'apl-white'})" stroke="#8c887a" stroke-width="${font/12}"/>${front}${radii}${showDimensions?measures:''}</g></svg>`;
}
