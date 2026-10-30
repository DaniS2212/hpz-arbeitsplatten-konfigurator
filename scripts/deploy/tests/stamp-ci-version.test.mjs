import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stamp} from '../stamp-ci-version.mjs';
const sample = `<?php\n/**\n * Version: 1.0.3\n */\nclass HPZ_APL_Admin_Preview {\n    const VERSION = '1.0.3';\n}`;
test('CI suffix versions both WP header and PHP cache version', () => {
  const stamped = stamp(sample, '405');
  assert.match(stamped, /\* Version: 1\.0\.3\.405/);
  assert.match(stamped, /const VERSION = '1\.0\.3\.405';/);
  assert.doesNotMatch(stamped, /Version: 1\.0\.3\n/);
});
test('every run gets a distinct deploy version', () => {
  assert.notEqual(stamp(sample, '405'), stamp(sample, '406'));
});
test('invalid run identifier fails closed', () => {
  for (const input of ['', '-1', 'a', '1;echo wrong', '0']) {
    assert.throws(() => stamp(sample, input), /run number/i);
  }
});
test('a mismatched PHP class header cannot produce a package', () => {
  assert.throws(() => stamp(sample.replace("const VERSION = '1.0.3'", "const VERSION = '1.0.2'"), '10'), /mismatch/i);
});
