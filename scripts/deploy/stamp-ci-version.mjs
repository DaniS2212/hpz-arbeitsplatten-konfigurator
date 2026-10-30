import {readFile, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

/** Create a build-unique WordPress version without changing Git history. */
export function stamp(source, runNumber) {
  if (typeof runNumber !== 'string' || !/^[1-9][0-9]*$/.test(runNumber)) {
    throw new Error('Invalid GitHub run number');
  }
  const header = source.match(/^\s*\* Version: ([0-9]+(?:\.[0-9]+){2})\s*$/m);
  const runtime = source.match(/\bconst VERSION = '([0-9]+(?:\.[0-9]+){2})';/);
  if (!header || !runtime || header[1] !== runtime[1]) {
    throw new Error('Plugin version mismatch or unexpected version format');
  }
  const release = `${header[1]}.${runNumber}`;
  return source.replace(/^([ \t]*\* Version: )[0-9.]+/m, `$1${release}`)
    .replace(/(\bconst VERSION = ')[0-9.]+(';)/, `$1${release}$2`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [file, run] = process.argv.slice(2);
  if (!file || !run) throw new Error('Usage: node stamp-ci-version.mjs <plugin-php-file> <GITHUB_RUN_NUMBER>');
  const original = await readFile(file, 'utf8');
  await writeFile(file, stamp(original, run));
}
