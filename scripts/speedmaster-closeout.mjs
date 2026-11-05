#!/usr/bin/env node
/**
 * Offline, read-only Speedmaster closeout: no WordPress API, no sale switch,
 * no price extrapolation, no supplier originals in the public plugin.
 */
import {readFile} from 'node:fs/promises';
import {auditCloseout,renderCloseoutMarkdown} from '../local/private/speedmaster-closeout.mjs';

const args=process.argv.slice(2);
const help='Verwendung: node scripts/speedmaster-closeout.mjs [--check|--require-complete|--json]\n';
if(args.length>1||(args.length===1&&!['--check','--require-complete','--json'].includes(args[0]))){
 process.stderr.write(help);process.exitCode=2;
}else try{
 const source=new URL('../docs/references/speedmaster-lu/SUPPLIER_CLOSEOUT.json',import.meta.url);
 const doc=JSON.parse(await readFile(source,'utf8'));
 const report=auditCloseout(doc);
 if(args[0]==='--json')process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else if(args[0]==='--check'||args[0]==='--require-complete'){
  for(const row of report.shapes)
   process.stdout.write(row.shape+': '+(row.evidenceComplete?'Dokumentation eingetragen':'offen')+
    ', fehlend/ungeprueft='+row.missing.length+', beobachtet='+row.observed.length+'\n');
  process.stdout.write('0 Fertigungsfreigaben; 0 freigegebene L/U-Verkaeufe; '
    +(report.overall.evidenceComplete?'Belegmappe pruefbar':'Speedmaster-Nachweise nicht vollständig')+'\n');
  if(args[0]==='--require-complete'&&!report.overall.evidenceComplete)process.exitCode=1;
 }else process.stdout.write(renderCloseoutMarkdown(report));
}catch(error){
 process.stderr.write('Speedmaster-Abnahme ungueltig: '+error.message+'\n');process.exitCode=2;
}
