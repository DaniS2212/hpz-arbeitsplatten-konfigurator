import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stamp} from './stamp-release.mjs';
const php=`<?php\n/**\n * Plugin Name: Example\n * Version: 1.0.3\n */\nfinal class HPZ_APL_Admin_Preview {\n    const VERSION = '1.0.3';\n}\n`;
test('release version increases for each green workflow run',()=>{
 const {source,version}=stamp(php,53);
 assert.equal(version,'1.0.3.53');
 assert.match(source,/Version: 1\.0\.3\.53/);
 assert.match(source,/const VERSION = '1\.0\.3\.53'/);
});
test('invalid run identifiers cannot enter a version',()=>{
 for(const n of [0,-1,'1; bad','x',1.1])assert.throws(()=>stamp(php,n));
});
test('already-stamped or mismatched source versions fail closed',()=>{
 assert.throws(()=>stamp(php.replaceAll('1.0.3','1.0.3.42'),5));
 assert.throws(()=>stamp(php.replace("const VERSION = '1.0.3'","const VERSION = '1.0.2'"),5));
});
