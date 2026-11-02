#!/usr/bin/env node
/**
 * Read-only, local snapshot check for L1-L4 Speedmaster screenshot references.
 * Does not write WordPress data, production files, prices or approvals.
 */
import {normalize} from '../local/core/config.mjs';
import {geometry} from '../local/core/geometry.mjs';
import {defaultLCorner} from '../local/core/l-geometry.mjs';
import {L_REFERENCE_CASES,auditLReference,renderLAuditMarkdown} from '../local/core/l-supplier-audit.mjs';

const args=process.argv.slice(2);
if(args.length>1||(args.length===1&&args[0]!=='--check')){
 process.stderr.write('Verwendung: node scripts/l-supplier-audit.mjs [--check]\n');
 process.exitCode=2;
}else{
 const results=Object.values(L_REFERENCE_CASES).map(reference=>{
  const config=normalize({
   schemaVersion:2,inputUnit:'mm',product:'l',geometry:reference.shape,
   corner:'square',material:'APL38',decor:'W980',quantity:1,
   dimensions:Object.fromEntries(Object.entries(reference.dimensionsMm).map(([key,value])=>[key,String(value)])),
   lCorner:defaultLCorner(reference.shape)
  });
  return auditLReference(config,geometry(config));
 });
 if(args[0]==='--check'){
  for(const result of results){
   const success=result.matchedReference&&result.geometryConsistent&&!result.manufacturingReady&&!result.pricingReady;
   process.stdout.write(result.shape+' '+(success?'OK':'ABWEICHUNG')+' (Bildvorlage, nicht Fertigung)\n');
   if(!success){
    process.stderr.write(result.shape+': '+JSON.stringify(result.checks.filter(x=>!x.ok))+'\n');
    process.exitCode=1;
   }
  }
  process.stdout.write('0 Fertigungsfreigaben; 0 aktivierte L-Preise; Stand: Speedmaster-Screenshots 30.10.2026\n');
 }else process.stdout.write(renderLAuditMarkdown(results));
}
