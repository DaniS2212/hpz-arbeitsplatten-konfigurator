<?php
define('ABSPATH',__DIR__);
require_once __DIR__.'/../HPZ_APL_WP_Proof_Admin.php';
$checks=0;
function ok($v,$name){global $checks;$checks++;if(!$v)throw new RuntimeException($name);}
ok(HPZ_APL_WP_Proof_Admin_10::scaled('148,43',2)===14843,'EK cents');
ok(HPZ_APL_WP_Proof_Admin_10::scaled('207,0',1)===2070,'pack cm to mm');
ok(HPZ_APL_WP_Proof_Admin_10::scaled('27,500',3)===27500,'packed kg to grams');
ok(HPZ_APL_WP_Proof_Admin_10::scaled('15',1)===150,'integer cm to mm');
foreach(['0','-1','1,234','3.456,78','abc',''] as $bad){try{HPZ_APL_WP_Proof_Admin_10::scaled($bad,2);ok(false,'invalid '.$bad);}catch(InvalidArgumentException $e){ok(true,'reject '.$bad);}}
$fields=HPZ_APL_WP_Proof_Admin_10::proofFields(['supplier_reference'=>'SM-12345','supplier_net_eur'=>'148,43','packed_kg'=>'27,500','pack_length_cm'=>'207,0','pack_width_cm'=>'67,0','pack_height_cm'=>'11,0','max_quantity'=>'3','shipping_rate_ids'=>'flat_rate:12']);
ok($fields['supplierNetCents']==='14843'&&$fields['packedWeightGrams']==='27500'&&$fields['packageLengthMm']==='2070','parsed proof fields');
echo "PASS $checks 1.0 admin proof input assertions\n";
