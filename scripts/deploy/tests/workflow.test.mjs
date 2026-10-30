import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const workflow=new URL('../../../.github/workflows/hpz-auto-deploy.yml',import.meta.url);
const text=()=>readFile(workflow,'utf8');
test('deployment requires main and explicit enabled variable, not pull requests',async()=>{
  const yml=await text();
  assert.match(yml,/push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(yml,/workflow_dispatch:/);
  assert.match(yml,/github\.ref == 'refs\/heads\/main'/);
  assert.match(yml,/github\.event_name != 'pull_request'/);
  assert.match(yml,/vars\.HPZ_AUTO_DEPLOY_ENABLED == 'true'/);
  assert.match(yml,/cancel-in-progress: false/);
});
test('packaging waits for all PHP Node and browser tests',async()=>{
  const yml=await text();
  assert.match(yml,/verify-php:/);
  assert.match(yml,/verify-node:/);
  assert.match(yml,/verify-browser:/);
  assert.match(yml,/needs:\s*\[verify-php, verify-node, verify-browser\]/);
  assert.match(yml,/needs:\s*\[package\]/);
  assert.match(yml,/node scripts\/deploy\/stamp-ci-version\.mjs/);
  assert.match(yml,/git diff --exit-code -- wordpress\/hpz-apl-admin-preview/);
});
test('deploy uses pinned SSH host, a hash, and remote rollback script',async()=>{
  const yml=await text();
  assert.match(yml,/HPZ_WP_SSH_KNOWN_HOSTS/);
  assert.match(yml,/StrictHostKeyChecking=yes/);
  assert.doesNotMatch(yml,/StrictHostKeyChecking=no/);
  assert.match(yml,/sha256sum/);
  assert.match(yml,/remote-deploy\.sh/);
  assert.match(yml,/HPZ_WP_SSH_PRIVATE_KEY/);
  assert.match(yml,/permissions:\s*\n\s+contents: read/);
});
