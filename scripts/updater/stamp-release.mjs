import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function stamp(source, runNumber) {
  if (!Number.isSafeInteger(Number(runNumber)) || Number(runNumber)<1 ||
      !/^\d+$/.test(String(runNumber))) throw new Error('Invalid run number');
  const header = source.match(/^ \* Version: (\d+\.\d+\.\d+)\s*$/m);
  const constant = source.match(/const VERSION = '(\d+\.\d+\.\d+)'\s*;/);
  if (!header || !constant || header[1]!==constant[1]) {
    throw new Error('Plugin source has mismatched or already-stamped versions');
  }
  const version = `${header[1]}.${runNumber}`;
  return {source:source.replace(` * Version: ${header[1]}`,` * Version: ${version}`)
    .replace(`const VERSION = '${header[1]}'`,`const VERSION = '${version}'`),version};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file=process.argv[2], run=process.argv[3];
  if(!file || !run) throw new Error('Usage: stamp-release.mjs PHP_FILE GITHUB_RUN_NUMBER');
  const result=stamp(await readFile(file,'utf8'),run);
  await writeFile(file,result.source);
  process.stdout.write(result.version+'\n');
}
