/**
 * PRIVATE ONLY – supplier evidence closeout for L1–L4 and U1–U4.
 * This is a documentary intake checklist, NEVER a sale/production authority.
 * Keep outside build-plugin.mjs and any browser/PHP endpoint.
 */
export const SHAPES=Object.freeze(['L1','L2','L3','L4','U1','U2','U3','U4']);
const common=Object.freeze([
 'contour','outer-corners','supplier-limits','real-parts','connectors',
 'parcels','exact-ek','checkout-e2e'
]);
const reqs=Object.fromEntries(SHAPES.map(shape=>[shape,Object.freeze([
 ...common,
 ...(['L3','L4'].includes(shape)?['diagonal-piece']:[]),
 ...(shape==='L4'?['b5-controlled-comparison']:[]),
 ...(shape.startsWith('U')?['u-variant-topology']:[])
])]));
export const REQUIREMENTS=Object.freeze(reqs);

const names=Object.freeze({
 contour:'Speedmaster-Original: vollständiger Maßdatensatz + Draufsicht und überprüfte Außenkontur',
 'outer-corners':'Eckbearbeitungen: 2D/3D-Paarbilder, Außenecken, echte Radien/Kantenverlauf',
 'supplier-limits':'Speedmaster-Eingabegrenzen je Stärke, Grundriss, Ecken und Dimension',
 'real-parts':'Echte Teilplatten: Anzahl, vollständige Fertigmaße und Konturen je Teil',
 connectors:'Stoßstellen/Verbinder: Detailbilder, Fräsungen, exakte Position und Zahl',
 parcels:'Versand-Packstücke: Einzelmaße, Gewichte und zulässige Versandarten',
 'exact-ek':'Mehrere vollständige Netto-EK-Angebote je Material/Dekor, Stärke und Eckvariante',
 'checkout-e2e':'Abgesicherte WooCommerce-Testbestellung: serverseitiger Preis, Menge, Versand, Rabatt und Rückprüfung',
 'diagonal-piece':'L3/L4: Innenwinkel, Diagonalzuschnitt und Anbindung der angrenzenden Teilplatten',
 'b5-controlled-comparison':'L4: B5 isoliert ändern, Grundmaß und echte Diagonallinie inkl. Teilung bestätigen',
 'u-variant-topology':'U1–U4: je eigener Herstellergrundriss, Achszuordnung, Ecke/Stöße und spiegelnde Varianten'
});
export const CLOSEOUT_PROOF_NAMES=names;
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const properText=(s,min=1,max=200)=>typeof s==='string'&&s.trim().length>=min&&s.trim().length<=max;
const actualDate=s=> {
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const time=Date.parse(s+'T00:00:00Z');
 return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===s;
};
const referenceSource=s=>properText(s,8,500)
 &&!/(?:shop[-_ ]ui|our[-_ ]preview|frontend[-_ ]mock|local[-_ ]preview)/i.test(s)
 &&!/[\u0000-\u001f]/.test(s);
/** 
 * Evidence classifications:
 * - observed: photo or user supplied value exists, not manufacturer-approved.
 * - reviewed: supplier data independently reviewed and archived; still no sale.
 * Missing proof keys mean missing data, NOT a null supplier approval.
 */
export function auditCloseout(doc) {
 if(!isObj(doc)||doc.schemaVersion!==1||doc.scope!=='private-supplier-handoff'
    ||!isObj(doc.shapes))throw Error('Ungültiges internes Speedmaster-Abnahmeformat.');
 const actualShapes=Object.keys(doc.shapes);
 if(actualShapes.length!==SHAPES.length||actualShapes.some(s=>!SHAPES.includes(s)))
   throw Error('Unbekannte oder fehlende L/U-Varianten im Herstellerregister.');
 const shapes=SHAPES.map(shape=>{
  const row=doc.shapes[shape],allowed=REQUIREMENTS[shape];
  if(!isObj(row)||Object.keys(row).some(k=>!allowed.includes(k)))
    throw Error(shape+': Unbekannter oder unzulässiger Nachweis.');
  const missing=[],observed=[],reviewed=[];
  for(const id of allowed){
   const proof=row[id];
   if(proof===undefined){missing.push(id);continue;}
   if(!isObj(proof)||!['observed','reviewed'].includes(proof.status))
     throw Error(shape+' '+id+': Unbekannter Nachweisstatus.');
   if(!Array.isArray(proof.sourceRefs)||proof.sourceRefs.length<1||proof.sourceRefs.length>20
      ||proof.sourceRefs.some(s=>!referenceSource(s)))
     throw Error(shape+' '+id+': Quellnachweis (sourceRefs) fehlt oder ist eine Shop-Vorschau statt Speedmaster-Original.');
   if(proof.status==='observed'){
    if(proof.reviewedBy!==undefined||proof.reviewedOn!==undefined)
      throw Error(shape+' '+id+': Bildbeobachtung darf keine Vier-Augen-Abnahme vortäuschen.');
    observed.push(id);missing.push(id);continue;
   }
   if(!properText(proof.reviewedBy,3,100)||!actualDate(proof.reviewedOn))
     throw Error(shape+' '+id+': Vier-Augen-Prüfer (reviewedBy) und gültiges Prüfdatum (reviewedOn) erforderlich.');
   if(!isObj(proof.details)||Object.keys(proof.details).length===0
      ||Object.values(proof.details).some(v=>v===null||v===undefined||v===''))
     throw Error(shape+' '+id+': technische Belegdaten (details) fehlen.');
   reviewed.push(id);
  }
  return {shape,evidenceComplete:missing.length===0,missing,observed,reviewed,
   required:allowed.length};
 });
 const complete=shapes.every(s=>s.evidenceComplete);
 return {
  format:'speedmaster-private-closeout-v1',shapes,violations:[],
  overall:{
   evidenceComplete:complete,unverifiedShapes:shapes.filter(s=>!s.evidenceComplete).length,
   observedOnlyCount:shapes.reduce((a,s)=>a+s.observed.length,0),
   reviewedProofCount:shapes.reduce((a,s)=>a+s.reviewed.length,0),
   // CRITICAL: no review record can independently authorize sale/production.
   manufacturingReady:false,pricingLive:false,checkoutEnabled:false,
   needsHumanApproval:true
  }
 };
}
const escapeCell=s=>String(s).replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');
export function renderCloseoutMarkdown(report) {
 if(!report||!Array.isArray(report.shapes)||report.shapes.length!==SHAPES.length)
   throw Error('Speedmaster-Abnahme erfordert L1–L4/U1–U4.');
 const out=[
  '# Speedmaster-Übergabe: L1–U4 (intern)', '',
  '**Keine Fertigungsfreigabe, keine Verkaufsfreigabe, keine automatische Preisschaltung.**',
  'Original-Screenshots, Herstellerunterlagen, echte Packstücke und bestätigte Nettopreise werden hier getrennt geprüft.','',
  '| Form | Bereits beobachtete Belege | Fehlende/bisher unbestätigte Nachweise | Status |',
  '| --- | ---: | ---: | --- |'
 ];
 for(const row of report.shapes)
  out.push('| '+row.shape+' | '+row.observed.length+' | '+row.missing.length+' | '
    +(row.evidenceComplete?'Dokumentation vollständig – menschliche Prüfung nötig':'offen')+' |');
 out.push('','## Konkret noch benötigte Speedmaster-Informationen','','');
 for(const row of report.shapes){
  out.push('### '+row.shape);
  if(row.evidenceComplete)out.push('Belege formal vollständig; keine automatische Freigabe.');
  else for(const id of row.missing)out.push('- '+escapeCell(names[id]));
  out.push('');
 }
 out.push('**Sperren bleiben bestehen:** Lieferantenprüfung ≠ CNC-Fertigung, ≠ echte Versandzuordnung, ≠ freigegebener Preis und ≠ WooCommerce-Kaufbarkeit.');
 return out.join('\n')+'\n';
}
