import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const workflow=await readFile(new URL('../../.github/workflows/hpz-wordpress-updates.yml',import.meta.url),'utf8');
test('publishing is main-only and gated by all test jobs',()=>{
 assert.match(workflow,/needs: \[php, node, browser\]/);
 assert.match(workflow,/github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main'/);
 assert.match(workflow,/git diff --exit-code -- wordpress\/hpz-apl-admin-preview/);
 assert.match(workflow,/gh release create/);
 assert.doesNotMatch(workflow,/ssh|scp|sftp|HostPress|HPZ_WP_SSH/i);
});
test('GitHub write permission applies only to publishing',()=>{
 assert.match(workflow,/permissions:\n  contents: read/);
 assert.match(workflow,/  release:[\s\S]*?permissions:\n      contents: write/);
});
