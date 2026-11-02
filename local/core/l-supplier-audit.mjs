/**
 * Read-only supplier reference audit. Screenshot witnesses do NOT constitute
 * an approved CNC drawing, verified part list or a sale/price authorization.
 */
const SOURCE='Speedmaster-Screenshots 30.10.2026';
const outer=Math.min(1050,900+1050-600*Math.SQRT2); // unverified historical L4 witness; capped as in newer paired photo
const proofCommon=[
 'Hersteller-Mindest-/Höchstgrenzen je Stärke, Dekor und Eckvariante aus den Eingabefeldern',
 'Gelieferte Packstücke und deren Maße/Gewichte zur Versandprüfung',
 'Vollständige Speedmaster-EK-Preisreferenz inklusive 1,5-mm-dekorgleicher Außenkanten'
];
const proofOne=[
 'Stoßstelle im Detail von oben und schräg: genaue Fräsposition, Verbinder und Anzahl der Platten',
 'Bestätigung der lieferbaren Teilplatten und der bearbeiteten Stoßkanten',...proofCommon
];
const proofTwo=[
 'Beide Stoßbereiche im Detail: genaue Fräspositionen, Verbinder und Anzahl der Platten',
 'Innere Eckdiagonale mit Winkeln und verbindlichen Teillängen',...proofCommon
];
const make=(shape,dimensionsMm,outline,visualSeams,todo,extra={})=>Object.freeze({
 shape,source:SOURCE,evidence:'screenshot-observation',fertigungGeprueft:false,
 dimensionsMm:Object.freeze({...dimensionsMm}),expectedOutlineMm:Object.freeze(outline.map(p=>Object.freeze([...p]))),
 visualSeams,todo:Object.freeze([...todo]),...extra
});
export const L_REFERENCE_CASES=Object.freeze({
 L1:make('L1',{L1:2000,L2:1200,B1:600,B2:600},
  [[0,0],[2000,0],[2000,600],[600,600],[600,1200],[0,1200]],1,proofOne),
 L2:make('L2',{L1:2000,L2:1200,B1:600,B2:600},
  [[0,0],[2000,0],[2000,1200],[1400,1200],[1400,600],[0,600]],1,proofOne),
 L3:make('L3',{L1:2000,L2:2000,B1:600,B2:600,B3:900,B4:900},
  [[0,0],[2000,0],[2000,600],[900,600],[600,900],[600,2000],[0,2000]],2,proofTwo),
 L4:make('L4',{L1:2000,L2:2000,B1:900,B2:900,B3:1050,B4:1050,B5:600},
  [[outer,0],[2000,0],[2000,900],[1050,900],[900,1050],[900,2000],[0,2000],[0,outer]],2,
  [...proofTwo.slice(0,2),'L4-B5: zusätzliche Speedmaster-Paaransichten für B1/B2=900 und B3/B4=1050; das neue Paar (600/900) vom 02.11.2026 ist nicht identisch',...proofCommon],
  {B5OuterProjection:'model-derived-unverified'})
});
const near=(a,b,eps=1e-6)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=eps;
const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
const samePoints=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((p,i)=>validPoint(p)&&p.every((x,k)=>near(x,b[i][k])));
function onSegment(p,a,b) {
 if(!validPoint(p)||!validPoint(a)||!validPoint(b))return false;
 const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
 if(length<1e-12)return near(p[0],a[0])&&near(p[1],a[1]);
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length));
 return Math.hypot(a[0]+dx*t-p[0],a[1]+dy*t-p[1])<1e-5;
}
function onContour(point,outline) {
 return Array.isArray(outline)&&outline.length>=3&&outline.some((p,i)=>onSegment(point,p,outline[(i+1)%outline.length]));
}
function signedArea(points) {
 if(!Array.isArray(points)||points.length<3||!points.every(validPoint))return NaN;
 return points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-p[1]*q[0];},0)/2;
}
const check=(id,value)=>({id,ok:value===true});
/**
 * Consumes a NORMALIZED L config and its existing preview geometry.
 * Everything returned remains advisory; no writes, no vendor proof creation.
 */
export function auditLReference(config,drawing) {
 if(!config||config.product!=='l'||!L_REFERENCE_CASES[config.geometry]||!config.dimensions)
   throw Error('L-Konfiguration für Speedmaster-Abgleich erforderlich.');
 const sample=L_REFERENCE_CASES[config.geometry],corner=config.lCorner;
 const plain=corner?.side==='none'&&corner.treatment===null
   &&corner.parameters&&Object.keys(corner.parameters).length===0&&config.corner==='square';
 const identical=plain&&config.material==='APL38'&&config.decor==='W980'
   &&Object.keys(config.dimensions).length===Object.keys(sample.dimensionsMm).length
   &&Object.entries(sample.dimensionsMm).every(([name,mm])=>config.dimensions[name]===mm);
 const outline=Array.isArray(drawing?.points)?drawing.points:[];
 const seams=Array.isArray(drawing?.previewSeams)?drawing.previewSeams:[];
 const details=Array.isArray(drawing?.previewSeamDetails)?drawing.previewSeamDetails:[];
 const regions=Array.isArray(drawing?.previewParts)?drawing.previewParts:[];
 const area=Math.abs(signedArea(outline));
 const regionArea=regions.reduce((total,p)=>total+Math.abs(signedArea(p.polygon)),0);
 const checks=[
  check('finite-outline',outline.length>=6&&outline.every(validPoint)&&area>0
   &&near(drawing.width,config.dimensions.L1)&&near(drawing.height,config.dimensions.L2)),
  check('screenshot-contour',!identical||samePoints(outline,sample.expectedOutlineMm)),
  check('visible-seam-count',!identical||seams.length===sample.visualSeams),
  check('seam-ends-on-contour',seams.every(s=>validPoint(s.from)&&validPoint(s.to)
   &&onContour(s.from,outline)&&onContour(s.to,outline))),
  check('seam-evidence-unapproved',details.length===seams.length&&details.every((detail,i)=>
   detail?.id==='seam-'+(i+1)&&detail.status==='illustration-only'
   &&detail.connectorType===null&&detail.connectorCount===null&&detail.machiningCoordinates===null
   &&samePoints([detail.from,detail.to],[seams[i]?.from,seams[i]?.to])
   &&Array.isArray(detail.partIds)&&detail.partIds.every(id=>regions.some(p=>p.id===id)))),
  check('preview-region-coverage',regions.length>0&&regions.every(p=>
   p.status==='illustration-only'&&Array.isArray(p.polygon)&&p.polygon.length>=3
   &&p.polygon.every(validPoint)&&Math.abs(signedArea(p.polygon))>1)
   &&(!plain||near(regionArea,area,0.01))),
  check('production-unreleased',drawing?.joints===null&&drawing?.shippingParts===null
   &&drawing?.supplierMappingVerified===false)
 ];
 return {
  shape:sample.shape,status:'illustration-only',source:sample.source,
  matchedReference:Boolean(identical&&checks.find(c=>c.id==='screenshot-contour').ok),
  geometryConsistent:checks.every(c=>c.ok),manufacturingReady:false,pricingReady:false,
  checks,
  regions:regions.map(p=>({id:p.id,label:p.label,number:p.number,status:'illustration-only'})),
  seams:seams.map(s=>({from:[...s.from],to:[...s.to],status:'visual-orientation-only'})),
  requiredProofs:[...sample.todo],
  warnings:[
   'Screenshotvergleich ersetzt keine Fertigungsfreigabe; genaue Fräs- und Verbinderdaten fehlen.',
   ...(config.geometry==='L4'?['Äußere B5-Diagonale ist eine Modellannahme, nicht durch Speedmaster-Einzeländerung bestätigt.']:[]),
   ...(!identical?['Diese aktuelle Konfiguration entspricht keinem exakt transkribierten Speedmaster-Beispiel.']:[])
  ]
 };
}
const esc=value=>String(value).replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');
export function renderLAuditMarkdown(audits) {
 if(!Array.isArray(audits)||audits.length!==4||audits.some((a,i)=>!a||a.shape!==['L1','L2','L3','L4'][i]))
  throw Error('Prüfblatt verlangt vier vollständig zugeordnete L-Referenzen.');
 const out=[
  '# Speedmaster-Fertigungsabgleich L1–L4 (Stand 02.11.2026)','',
  '**Keine Fertigungsfreigabe, keine CNC-Freigabe, keine Preis- oder Warenkorbfunktion.**',
  'Quelle: Speedmaster-Screenshots 30.10.2026. Belegstand = Bild-Referenz, nicht Herstellerbestätigung.','',
  '| L-Variante | Referenzkontur/Geometrie | Visualisierte Stoßlinien | Fehlende Herstellerbelege |',
  '| --- | --- | ---: | ---: |'
 ];
 for(const a of audits)out.push('| '+a.shape+' | '+(a.matchedReference&&a.geometryConsistent?'OK, Bildvergleich':'Abweichung / kein Beleg')+
  ' | '+a.seams.length+' (nur Vorschau) | '+a.requiredProofs.length+' |');
 out.push('','## Offene Speedmaster-Nachweise');
 for(const a of audits) {
  out.push('','### '+a.shape);
  for(const missing of a.requiredProofs)out.push('- '+esc(missing));
  if(a.shape==='L4')out.push('- **B5-Außenkontur** bleibt eine nicht bestätigte 45°-Modellannahme.');
 }
 out.push('','## Bekannter Einzelpreis (keine Regel)',
  'Für L1 2.000 × 1.200 mm, B1/B2=600 mm, APL38 Platinweiß mit standardmäßiger Außenkante wurde ein Netto-EK von **464,45 €** als Einzelreferenz bestätigt; weder Stückpreise noch andere Varianten werden daraus abgeleitet.',
  '','## Folgefreigaben',
  'Erst nach dokumentierten Hersteller-CNC-/Verbinderangaben, echten Packstücken, dynamischen Maßgrenzen und vollständigen Preisbelegen darf eine getrennte fachliche Freigabe diskutiert werden.');
 return out.join('\n')+'\n';
}
