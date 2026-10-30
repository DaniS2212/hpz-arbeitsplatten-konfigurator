import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const script=resolve(import.meta.dirname,'../remote-deploy.sh');
function run(cmd,args,options={}) {return spawnSync(cmd,args,{encoding:'utf8',...options});}

async function fixture(opts={}) {
  const root=await mkdtemp(join(tmpdir(),'hpz-deploy-test-'));
  const home=join(root,'home'),wp=join(root,'wordpress'),bin=join(root,'bin');
  const plugin=join(wp,'wp-content','plugins','hpz-apl-admin-preview');
  await Promise.all([mkdir(plugin,{recursive:true}),mkdir(bin),mkdir(home)]);
  await writeFile(join(wp,'wp-config.php'),'<?php');
  await writeFile(join(plugin,'hpz-apl-admin-preview.php'),'<?php\n * Version: 1.0.2\n');
  await writeFile(join(plugin,'keep.txt'),'previous plugin version');
  const source=join(root,'package','hpz-apl-admin-preview');
  await mkdir(source,{recursive:true});
  await writeFile(join(source,'hpz-apl-admin-preview.php'),'<?php\n * Version: 1.0.3.42\n');
  await writeFile(join(source,'keep.txt'),'new plugin version');
  const incoming=join(home,'.hpz-apl-deploy','incoming');
  await mkdir(incoming,{recursive:true});
  const basename='hpz-apl-admin-preview-ci42.zip',zip=join(incoming,basename);
  const zipped=run('zip',['-qr',zip,'hpz-apl-admin-preview'],{cwd:join(root,'package')});
  assert.equal(zipped.status,0,zipped.stderr);
  const sha=createHash('sha256').update(await readFile(zip)).digest('hex');
  const fakeWp=`#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == --path=* ]]; then ROOT="\${1#--path=}"; shift; else exit 99; fi
case "$1 $2" in
  'core is-installed') exit 0 ;;
  'option get')
     if [[ "$3" == 'home' ]]; then echo "\${MOCK_HOME_URL:-https://holzplatten-zuschnitt.de}";
     elif [[ "$3" == 'hpz_apl_admin_preview' ]]; then
       if [[ -f "\${ROOT}/mock-mutated" ]]; then echo '{"sale_enabled":true}';
       else echo '{"sale_enabled":false,"test_mode":true}'; fi
     else exit 92; fi ;;
  'plugin is-active') [[ "\${MOCK_PLUGIN_ACTIVE:-1}" == 1 ]] ;;
  'plugin get') awk '/Version:/{print $3;exit}' "\${ROOT}/wp-content/plugins/hpz-apl-admin-preview/hpz-apl-admin-preview.php" ;;
  'post get')
     if [[ "$3" == 1000083 ]]; then echo publish;
     elif [[ "$3" == 1000080 ]]; then echo "\${MOCK_L_STATUS:-draft}";
     elif [[ "$3" == 1000081 ]]; then echo draft;
     else exit 93; fi ;;
  'plugin install')
     rm -rf "\${ROOT}/wp-content/plugins/hpz-apl-admin-preview"
     [[ "\${MOCK_INSTALL_FAIL:-0}" == 0 ]] || exit 15
     unzip -oq "$3" -d "\${ROOT}/wp-content/plugins"
     [[ "\${MOCK_MUTATE_OPTION:-0}" == 0 ]] || touch "\${ROOT}/mock-mutated" ;;
  'eval '*) exit 0 ;;
  'option update')
     [[ "$3" == 'hpz_apl_admin_preview' ]] || exit 98
     rm -f "\${ROOT}/mock-mutated" ;;
  *) echo "unexpected wp args $*" >&2; exit 88 ;;
esac
`;
  await writeFile(join(bin,'wp'),fakeWp,{mode:0o755});
  const env={...process.env,HOME:home,PATH:`${bin}:${process.env.PATH}`,MOCK_PLUGIN_ACTIVE:opts.inactive?'0':'1',MOCK_INSTALL_FAIL:opts.installFail?'1':'0',MOCK_HOME_URL:opts.homeUrl??'https://holzplatten-zuschnitt.de',MOCK_L_STATUS:opts.lStatus??'draft',MOCK_MUTATE_OPTION:opts.mutateOption?'1':'0'};
  function deploy(checksum=sha) {return run('bash',[script,wp,basename,checksum,'1.0.3.42'],{env});}
  function cleanup() {return rm(root,{recursive:true,force:true});}
  return {root,home,wp,plugin,deploy,cleanup};
}

test('installs only the exact plugin and retains a rollback backup',async()=>{
  const f=await fixture();
  try {
    const result=f.deploy();assert.equal(result.status,0,result.stderr+'\n'+result.stdout);
    assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'new plugin version');
    const backups=await readdir(join(f.home,'.hpz-apl-deploy','backups'));
    assert.ok(backups.some(x=>x.endsWith('.tar.gz')),'backup not kept');
  } finally {await f.cleanup();}
});
test('refuses wrong WordPress site before plugin change',async()=>{
  const f=await fixture({homeUrl:'https://example.com'});
  try {const r=f.deploy();assert.notEqual(r.status,0);assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'previous plugin version');}
  finally {await f.cleanup();}
});
test('refuses disabled plugin without activating it',async()=>{
  const f=await fixture({inactive:true});
  try {const r=f.deploy();assert.notEqual(r.status,0);assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'previous plugin version');}
  finally {await f.cleanup();}
});
test('refuses published L-form before modifying plugin',async()=>{
  const f=await fixture({lStatus:'publish'});
  try {const r=f.deploy();assert.notEqual(r.status,0);assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'previous plugin version');}
  finally {await f.cleanup();}
});
test('rejects invalid ZIP checksum before touching plugin',async()=>{
  const f=await fixture();
  try {const r=f.deploy('0'.repeat(64));assert.notEqual(r.status,0);assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'previous plugin version');}
  finally {await f.cleanup();}
});
test('restores previous plugin bytes when WP-CLI install fails mid-update',async()=>{
  const f=await fixture({installFail:true});
  try {const r=f.deploy();assert.notEqual(r.status,0);assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'previous plugin version');}
  finally {await f.cleanup();}
});
test('fails if release flags unexpectedly change and restores plugin files',async()=>{
  const f=await fixture({mutateOption:true});
  try {const r=f.deploy();assert.notEqual(r.status,0);assert.equal(await readFile(join(f.plugin,'keep.txt'),'utf8'),'previous plugin version');}
  finally {await f.cleanup();}
});
