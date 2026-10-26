<?php
// Run with: php wordpress/decor-catalog.test.php. No WordPress bootstrap required.
define('ABSPATH', __DIR__);
require __DIR__.'/hpz-apl-admin-preview/includes/decor-catalog.php';
$fixture = json_decode(file_get_contents(__DIR__.'/../docs/references/decor-images/decor-mapping.json'), true);
if (count(HPZ_APL_Decor_Catalog::all()) !== 16) throw new Exception('Expected 16 IDs.');
foreach ($fixture['items'] as $expected) {
    $actual = HPZ_APL_Decor_Catalog::resolve($expected['id']);
    if (!$actual || $actual['supplierCode'] !== $expected['supplierCode'] || $actual['displayName'] !== $expected['displayName']) throw new Exception('Mapping mismatch.');
}
foreach (array(null, 44375, array(), '../W980', 'F128 PA', 'Granit schwarz', 'UNKNOWN') as $id) {
    if (HPZ_APL_Decor_Catalog::resolve($id) !== null) throw new Exception('Unknown ID accepted.');
}
echo "PASS 16 canonical decor mappings; invalid identifiers rejected.\n";
