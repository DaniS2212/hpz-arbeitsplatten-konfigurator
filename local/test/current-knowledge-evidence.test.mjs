import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
function csv(path){
 const [head,...body]=text(path).trimEnd().split(/\r?\n/);
 const keys=head.split(',');
 return body.map((line,i)=>{
  const values=line.split(',');
  assert.equal(values.length,keys.length,'CSV column drift on line '+(i+2));
  return Object.fromEntries(keys.map((k,n)=>[k,values[n]]));
 });
}
test('single entrypoint for new chats is linked from AGENTS, README and STATUS',()=>{
 const title='CURRENT_PROJECT_HANDOFF_20261105.md';
 assert.match(text('AGENTS.md'),new RegExp(title));
 assert.match(text('README.md'),new RegExp(title));
 assert.match(text('STATUS.md'),new RegExp(title));
 const handoff=text('docs/'+title);
 for(const word of ['1000083','1000080','1000081','U1','U2','U3','U4',
 '30-%','40-%','35-%','10 %','Speedmaster_U1-U4_20261105_Originale.zip',
 'noch nicht','manuell','GitHub'])assert.ok(handoff.includes(word),'missing documented core '+word);
});
test('central L/U price evidence is typed and exact, no new screen display accepted as net EK',()=>{
 const data=csv('docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv');
 assert.equal(data.length,49);
 const l=data.filter(x=>x.variant==='L1'&&x.amount_type==='verified_net_EK');
 assert.equal(l.length,4);
 assert.deepEqual(l.map(x=>x.amount_eur),['307.67','464.45','342.41','511.56']);
 assert.ok(l.every(x=>x.amount_type==='verified_net_EK'&&x.thickness_mm!==''));
 const u1=data.filter(x=>x.variant==='U1'&&x.amount_type==='verified_net_EK');
 assert.deepEqual(u1.map(x=>x.amount_eur),['459.29','691.49']);
 assert.ok(u1.every(x=>x.amount_type==='verified_net_EK'));
 const source=JSON.parse(text('docs/references/speedmaster-lu/U2_U4_JOINT_USER_20261105.json'));
 for(const v of ['U2','U3','U4']){
  const row=data.find(x=>x.variant===v);
  assert.equal(row.amount_eur,source.cases[v].displayedPriceEUR);
  assert.equal(row.amount_type,'supplier_screen_display_only');
  assert.equal(row.status,'net_status_unverified');
  for(const [key,value] of Object.entries(source.cases[v].dimensionsMm)){
   assert.equal(row[key+'_mm'],String(value),'wrong axis '+v+':'+key);
  }
 }
 const newPhotos=JSON.parse(text('docs/references/speedmaster-lu/L1_U1_2250_PRICE_20261106.json'));
 assert.equal(newPhotos.priceCases.length,2);
 for(const evidence of newPhotos.priceCases){
   const row=data.find(x=>x.variant===evidence.variant&&x.L1_mm==='2250');
   assert.ok(row,'new independent supplier screen evidence');
   assert.equal(row.amount_eur,evidence.displayedPriceEUR);
   assert.equal(row.amount_eur,evidence.priorModelEUR);
   assert.equal(row.amount_type,'supplier_screen_display_only');
   assert.equal(row.status,'net_status_unverified');
   assert.equal(evidence.displayedAmountIsNetVerified,false);
   for(const [key,value] of Object.entries(evidence.dimensionsMm)){
     assert.equal(row[key+'_mm'],String(value),'screenshot dimension '+key);
   }
 }
 // Three 06.11 supplier controls: L2, U2 and a LEFT CHAMFER (not merely
 // a single left edge change). Exact screenshot source and no net approval.
 const controls=JSON.parse(text('docs/references/speedmaster-lu/LU_THREE_PRICE_CONTROLS_20261106.json'));
 assert.equal(controls.cases.length,3);
 const expected = new Map([
   ['L2-2250-SAME','488.01'],['U2-2250-SAME','710.91'],
   ['L1-2250-LEFT-CHAMFER','510.02']
 ]);
 for(const c of controls.cases){
   assert.equal(c.displayPriceEUR,expected.get(c.caseId));
   const expectedEdge=c.caseId==='L1-2250-LEFT-CHAMFER'
     ? 'left_chamfer_150x150_edge_continuous':'matching_1_5mm';
   const row=data.find(x=>x.variant===c.variant&&x.L1_mm==='2250'
     && x.edge===expectedEdge);
   assert.ok(row,'price evidence must distinguish corner chamfer '+c.caseId);
   assert.equal(row.amount_eur,c.displayPriceEUR);
   assert.equal(row.amount_type,'supplier_screen_display_only');
   assert.match(row.status,/net_status_unverified/);
   assert.equal(row.source,'docs/references/speedmaster-lu/LU_THREE_PRICE_CONTROLS_20261106.json');
   const sourceRow=controls.sourceArchive;
   assert.equal(sourceRow.gitBlobSha1,'deec662cfea4509eb98c0a58ad692762115da794',
     'prepared ZIP identifies exact original bytes independent of archive state');
   assert.equal(c.image.sha256.length,64);
   for(const [k,v] of Object.entries(c.dimensionsMm)){
     assert.equal(row[k+'_mm'],String(v),'correct control dimension '+c.caseId+' '+k);
   }
 }
 assert.deepEqual(controls.cases.map(c=>c.observedDifferenceEUR),['0.00','-4.13','+22.01']);
 assert.equal(controls.cases[2].corner.parametersMm.L3,150);
 assert.equal(controls.cases[2].corner.parametersMm.B3,150);
 assert.match(controls.cases[2].changedFactor,/NOT a pure edge-finish change/);
 // The 2000mm U2 screenshot independently confirms the SAME -4.13 EUR
 // difference as the newly submitted 2250mm U2 screenshot.
 const prevU2=data.find(x=>x.variant==='U2'&&x.L1_mm==='2000');
 const prevU1=data.find(x=>x.variant==='U1'&&x.L1_mm==='2000'&&x.thickness_mm==='38');
 assert.equal(Math.round((Number(prevU2.amount_eur)-Number(prevU1.amount_eur))*100),-413);
 assert.equal(Math.round((Number(controls.cases[1].displayPriceEUR)-715.04)*100),-413);
 const textPrices=JSON.parse(text('docs/references/speedmaster-lu/LU_EIGHT_TEXT_PRICES_20261106.json'));
 assert.equal(textPrices.cases.length,8);
 assert.match(textPrices.archivePolicy,/TEXT_ONLY/);
 assert.match(textPrices.edgePolicy,/ONLY 1.5mm decor-matched/);
 const priceCases=[
   ['L2',2500,'511.56'],['U2',2500,'734.46'],
   ['L3',2000,'798.52'],['L3',2500,'845.62'],
   ['L4',2000,'658.61'],['L4',2500,'705.71'],
   ['U3',2500,'738.59'],['U4',2500,'738.59'],
 ];
 for(const [shape,l1,price] of priceCases){
   const item=textPrices.cases.find(x=>x.shape===shape&&x.dimensionsMm.L1===l1);
   assert.ok(item,shape+' '+l1+' written source price is indexed');
   assert.equal(item.supplierDisplayEur,price);
   assert.equal(item.verifiedSupplierNet,false);
   assert.equal(item.checkoutApproved,false);
   const row=data.find(x=>x.variant===shape&&x.L1_mm===String(l1)
     && x.source==='docs/references/speedmaster-lu/LU_EIGHT_TEXT_PRICES_20261106.json');
   assert.ok(row,shape+' '+l1+' text-only CSV row exists');
   assert.equal(row.amount_eur,price);
   assert.equal(row.amount_type,'user_supplied_text_display_only');
   assert.equal(row.edge,'matching_1_5mm');
   assert.match(row.status,/net_status_unverified/);
   assert.equal(row.thickness_mm,'38');
   assert.equal(row.decor,'W980');
   assert.equal(item.edgeLeft,'1.5 mm dekorgleich');
   assert.equal(item.edgeRight,'1.5 mm dekorgleich');
   assert.equal(item.specialCorner,'none');
   for(const [field,mm] of Object.entries(item.dimensionsMm)) {
     const key=field==='B5'?'B5_base_mm':field+'_mm';
     assert.equal(row[key],String(mm),shape+' '+l1+' dimension '+field);
   }
 }
 // Owner explicitly confirmed Speedmaster prices are NET of VAT on
 // 06.11.2026; manufacturer cut-list and checkout approval remain separate.
 const net175=JSON.parse(text('docs/references/speedmaster-lu/LU_175_NET_PRICES_20261106.json'));
 assert.equal(net175.cases.length,6);
 assert.equal(net175.taxBasis.supplierPrices,'net EUR excluding VAT');
 assert.equal(net175.taxBasis.germanReferenceVatRatePercent,19);
 const expected175=new Map([
   ['L2','342.41'],['L3','523.29'],['L4','465.68'],
   ['U2','494.03'],['U3','494.03'],['U4','494.03'],
 ]);
 for(const c of net175.cases){
   assert.equal(c.supplierNetEUR,expected175.get(c.geometry));
   assert.equal(c.priceIncludesVAT,false);
   assert.equal(c.netBasisExplicitlyConfirmedByOperator,true);
   assert.equal(c.supplierInvoiceOrFormalQuoteVerified,false);
   assert.equal(c.woocommerceSaleApproved,false);
   assert.equal(c.thicknessMm,17.5);
   assert.equal(c.decorCode,'W980');
   const row=data.find(x=>x.variant===c.geometry&&x.thickness_mm==='17.5'
     && x.source==='docs/references/speedmaster-lu/LU_175_NET_PRICES_20261106.json');
   assert.ok(row,'17.5mm net evidence must be in central CSV '+c.geometry);
   assert.equal(row.amount_eur,c.supplierNetEUR);
   assert.equal(row.amount_type,'operator_confirmed_net_EK');
   assert.equal(row.status,'net_basis_owner_confirmed_not_sale_approved');
   assert.equal(row.edge,'matching_1_5mm');
   for(const [key,value] of Object.entries(c.dimensionsMm)){
     assert.equal(row[key==='B5'?'B5_base_mm':key+'_mm'],String(value));
   }
 }
 // Four further 2000mm owner NET prices; only structured text, without
 // additional image/hash/ZIP requirements. Exact shape axes are mandatory.
 const fourNet=JSON.parse(text('docs/references/speedmaster-lu/LU_175_2000_NET_PRICES_20261106.json'));
 assert.equal(fourNet.cases.length,4);
 assert.equal(fourNet.priceTaxBasis.includes('NET'),true);
 assert.equal(fourNet.sourceImagesRequired,false);
 const expectedNet2000=new Map([
   ['L2','307.67'],['L3','488.55'],['L4','430.94'],['U2','459.29']
 ]);
 for(const c of fourNet.cases){
   assert.equal(c.supplierNetEUR,expectedNet2000.get(c.geometry));
   assert.equal(c.dimensionsMm.L1,2000);
   assert.equal(c.thicknessMm,17.5);
   assert.equal(c.decorCode,'W980');
   assert.equal(c.priceIncludesVAT,false);
   assert.equal(c.netBasisExplicitlyConfirmedByOperator,true);
   assert.equal(c.cutListVerified,false);
   assert.equal(c.woocommerceSaleApproved,false);
   assert.equal(c.oneAxisComparison.differenceEUR,'34.74');
   const row=data.find(x=>x.variant===c.geometry&&x.thickness_mm==='17.5'
     && x.L1_mm==='2000'&&x.source==='docs/references/speedmaster-lu/LU_175_2000_NET_PRICES_20261106.json');
   assert.ok(row,'2000mm 17.5mm net-EK in central CSV: '+c.geometry);
   assert.equal(row.amount_eur,c.supplierNetEUR);
   assert.equal(row.amount_type,'operator_confirmed_net_EK');
   assert.equal(row.status,'net_basis_owner_confirmed_not_sale_approved');
   assert.equal(row.edge,'matching_1_5mm');
   for(const [key,value]of Object.entries(c.dimensionsMm)){
     assert.equal(row[key==='B5'?'B5_base_mm':key+'_mm'],String(value));
   }
 }
 // Four new U1/L3/L4 width references from a single user text message.
 // No image ZIPs. 17.5mm U1 gets more expensive with extra width while
 // 38mm U1 gets CHEAPER; coupled L3 B3/B4 differs from L4's B5.
 const widthProof=JSON.parse(text('docs/references/speedmaster-lu/LU_FOUR_WIDTH_NET_PRICES_20261106.json'));
 assert.equal(widthProof.cases.length,4);
 assert.equal(widthProof.imagesOrZipRequired,false);
 const expectedWidth=new Map([
   ['u1_250_170_180_175_b65','534.33'],
   ['u1_250_170_180_38_b65','776.40'],
   ['l3_250_200_175_b3b4_1000','534.98'],
   ['l4_250_200_175_b5_700','478.19'],
 ]);
 const widthSource='docs/references/speedmaster-lu/LU_FOUR_WIDTH_NET_PRICES_20261106.json';
 for(const c of widthProof.cases){
   assert.equal(c.supplierNetEUR,expectedWidth.get(c.caseId));
   assert.equal(c.priceIsNet,true);
   assert.equal(c.decorCode,'W980');
   assert.equal(c.specialCorner,'none');
   assert.equal(c.woocommerceSaleApproved,false);
   assert.equal(c.cutListVerified,false);
   assert.equal(c.packagingVerified,false);
   const row=data.find(x=>x.source===widthSource&&x.variant===c.shape
     && x.thickness_mm===String(c.thicknessMm));
   assert.ok(row,'new width quote in central price CSV '+c.caseId);
   assert.equal(row.amount_eur,c.supplierNetEUR);
   assert.equal(row.amount_type,'operator_confirmed_net_EK');
   assert.equal(row.status,'net_basis_owner_confirmed_not_sale_approved');
   assert.equal(row.edge,'matching_1_5mm');
   for(const [key,mm] of Object.entries(c.dimensionsMm)){
     assert.equal(row[key==='B5'?'B5_base_mm':key+'_mm'],String(mm),
       'width price exact source dimension '+c.caseId+' '+key);
   }
 }
 const byId=Object.fromEntries(widthProof.cases.map(x=>[x.caseId,x]));
 assert.equal(byId.u1_250_170_180_175_b65.baseline.differenceEUR,'+5.57');
 assert.equal(byId.u1_250_170_180_38_b65.baseline.differenceEUR,'-9.29');
 assert.equal(byId.l3_250_200_175_b3b4_1000.baseline.differenceEUR,'+11.69');
 assert.equal(byId.l4_250_200_175_b5_700.baseline.differenceEUR,'+12.51');
 assert.equal(byId.l3_250_200_175_b3b4_1000.dimensionsMm.B3,
   byId.l3_250_200_175_b3b4_1000.dimensionsMm.B4);
  // Four owner-supplied H1145 ST10 Bardolino NET prices, NO screenshots.
 // Verify exact pairwise W980 comparisons; differences are NOT a constant
 // decor surcharge, and lack of cut/pack proof keeps sale disabled.
 const decorEvidence=JSON.parse(text('docs/references/speedmaster-lu/LU_H1145_FOUR_DECOR_NET_PRICES_20261106.json'));
 assert.equal(decorEvidence.cases.length,4);
 assert.equal(decorEvidence.imagesOrZipRequired,false);
 assert.equal(decorEvidence.newDecor,'H1145 ST10 Bardolino Eiche');
 const expectedDecor=new Map([
   ['L1/17.5',['346.93','342.41',452]],
   ['L1/38',['516.49','511.56',493]],
   ['U1/17.5',['499.74','494.03',571]],
   ['U1/38',['744.32','738.59',573]],
 ]);
 for(const c of decorEvidence.cases){
   const key=c.geometry+'/'+c.thicknessMm;
   const expected=expectedDecor.get(key);
   assert.ok(expected,'known H1145 source case '+key);
   assert.equal(c.supplierNetEUR,expected[0]);
   assert.equal(c.comparison.referenceNetEUR,expected[1]);
   assert.equal(c.comparison.deltaNetCents,expected[2]);
   assert.equal(c.comparison.sameThicknessGeometryDimensionsEdges,true);
   assert.equal(c.decorId,'H1145');
   assert.equal(c.supplierDecorCode,'H1145 ST10');
   assert.equal(c.supplierPriceNetOfVAT,true);
   assert.equal(c.supplierNetBasisConfirmedByOperator,true);
   assert.equal(c.formallyVerifiedCutList,false);
   assert.equal(c.verifiedShippingPartLengths,false);
   assert.equal(c.woocommerceSaleApproved,false);
   const row=data.find(x=>x.variant===c.geometry
     && x.thickness_mm===String(c.thicknessMm)&&x.decor==='H1145'
     && x.source==='docs/references/speedmaster-lu/LU_H1145_FOUR_DECOR_NET_PRICES_20261106.json');
   assert.ok(row,'H1145 text-net evidence in central CSV '+key);
   assert.equal(row.amount_eur,c.supplierNetEUR);
   assert.equal(row.amount_type,'operator_confirmed_net_EK');
   assert.equal(row.status,'net_basis_owner_confirmed_not_sale_approved');
   assert.equal(row.edge,'matching_1_5mm');
   for(const [dim,mm] of Object.entries(c.dimensionsMm)){
     assert.equal(row[dim+'_mm'],String(mm),'exact H1145 dimensions '+key+' '+dim);
   }
 }
 const decorDifferences=decorEvidence.cases.map(c=>c.comparison.deltaNetCents);
 assert.deepEqual(decorDifferences,[452,493,571,573]);
 assert.equal(new Set(decorDifferences).size,4,'decor premium cannot be universal');
  // Four new exact H1145 2000mm NET prices, text-only (no ZIP/image).
 const h1145LengthEvidence=JSON.parse(text('docs/references/speedmaster-lu/LU_H1145_2000_NET_PRICES_20261106.json'));
 assert.equal(h1145LengthEvidence.cases.length,4);
 assert.equal(h1145LengthEvidence.imageArchiveRequired,false);
 assert.match(h1145LengthEvidence.taxBasis,/NET supplier amounts excluding VAT/);
 const expectedH1145Len=new Map([
   ['L1/17.5',['311.53','307.67','346.93',386,3540,66]],
   ['L1/38',['468.72','464.45','516.49',427,4777,66]],
   ['U1/17.5',['464.34','459.29','499.74',505,3540,66]],
   ['U1/38',['696.55','691.49','744.32',506,4777,67]],
 ]);
 for(const c of h1145LengthEvidence.cases){
   const testId=c.geometry+'/'+c.thicknessMm;
   const expected=expectedH1145Len.get(testId);
   assert.ok(expected,'new H1145 exact reference for '+testId);
   assert.equal(c.supplierNetEUR,expected[0]);
   assert.equal(c.comparisonW980SameDimensions.supplierNetEUR,expected[1]);
   assert.equal(c.comparisonH1145AtL1_2500.supplierNetEUR,expected[2]);
   assert.equal(c.comparisonW980SameDimensions.netDeltaCents,expected[3]);
   assert.equal(c.comparisonH1145AtL1_2500.netIncreaseCents,expected[4]);
   assert.equal(c.additionalH1145LengthDeltaNetCents,expected[5]);
   assert.equal(c.dimensionsMm.L1,2000);
   assert.equal(c.decorId,'H1145');
   assert.equal(c.supplierDecorCode,'H1145 ST10');
   assert.equal(c.supplierPriceNetOfVAT,true);
   assert.equal(c.formalSupplierQuoteVerified,false);
   assert.equal(c.physicalCutListVerified,false);
   assert.equal(c.woocommerceSaleApproved,false);
   const row=data.find(x=>x.variant===c.geometry
     && x.thickness_mm===String(c.thicknessMm)
     && x.decor==='H1145'
     && x.L1_mm==='2000'
     && x.source==='docs/references/speedmaster-lu/LU_H1145_2000_NET_PRICES_20261106.json');
   assert.ok(row,'H1145 second-length exact net price retained in CSV '+testId);
   assert.equal(row.amount_eur,c.supplierNetEUR);
   assert.equal(row.amount_type,'operator_confirmed_net_EK');
   assert.equal(row.status,'net_basis_owner_confirmed_not_sale_approved');
   assert.equal(row.edge,'matching_1_5mm');
   for(const [axis,mm]of Object.entries(c.dimensionsMm)){
     assert.equal(row[axis+'_mm'],String(mm),'full source dimensions '+testId+' '+axis);
   }
 }
 const increments=h1145LengthEvidence.cases.map(c=>c.additionalH1145LengthDeltaNetCents);
 assert.deepEqual(increments,[66,66,66,67]);
 // Four more H1145 L2/U2 exact net text sources. Strong form comparison,
 // but NO unseen length, decor, cost, packaging, or checkout authorization.
 const h1145Join=JSON.parse(text('docs/references/speedmaster-lu/LU_H1145_L2_U2_NET_PRICES_20261106.json'));
 assert.equal(h1145Join.cases.length,4);
 assert.equal(h1145Join.sourceImageRequired,false);
 assert.equal(h1145Join.launchPolicy.doNotEnablePublicPurchase,true);
 const expectedJoin=new Map([
   ['L2/17.5',['346.93','L1','346.93','342.41','0.00','4.52']],
   ['L2/38',['516.49','L1','516.49','511.56','0.00','4.93']],
   ['U2/17.5',['499.74','U1','499.74','494.03','0.00','5.71']],
   ['U2/38',['740.19','U1','744.32','734.46','-4.13','5.73']]
 ]);
 for(const c of h1145Join.cases){
   const k=c.shape+'/'+c.thicknessMm;
   const exp=expectedJoin.get(k);
   assert.ok(exp,'H1145 controlled join price expected '+k);
   assert.equal(c.supplierNetEUR,exp[0]);
   assert.equal(c.sameDecorFormComparison.shape,exp[1]);
   assert.equal(c.sameDecorFormComparison.netEUR,exp[2]);
   assert.equal(c.sameGeometryW980Reference.netEUR,exp[3]);
   assert.equal(c.sameDecorFormComparison.netDifferenceEUR,exp[4]);
   assert.equal(c.sameGeometryW980Reference.netDecorDeltaEUR,exp[5]);
   assert.equal(c.manufacturingCutListVerified,false);
   assert.equal(c.checkoutPriceApproved,false);
   assert.equal(c.priceTaxBasis,'net-eur-excluding-vat');
   assert.equal(c.dimensionsMm.L1,2500);
   const row=data.find(x=>x.variant===c.shape
     && x.thickness_mm===String(c.thicknessMm)
     && x.decor==='H1145'
     && x.source==='docs/references/speedmaster-lu/LU_H1145_L2_U2_NET_PRICES_20261106.json');
   assert.ok(row,'H1145 net source registered for '+k);
   assert.equal(row.amount_eur,c.supplierNetEUR);
   assert.equal(row.amount_type,'operator_confirmed_net_EK');
   assert.equal(row.status,'net_basis_owner_confirmed_not_sale_approved');
   assert.equal(row.edge,'matching_1_5mm');
   for(const [field,value]of Object.entries(c.dimensionsMm)){
     assert.equal(row[field+'_mm'],String(value),'exact mm preserved '+k+' '+field);
   }
 }
 assert.match(text('docs/phase-lu-limited-launch-gates-20261106.md'),/begrenzte Shopversion|eingeschraenkter Shopstart|eingeschr.nkter Shopstart/i);
   const newPolicy=text('docs/references/speedmaster-lu/PRICE_TEXT_EVIDENCE_POLICY_20261106.md');
 assert.match(newPolicy,/keine Preisbild-ZIPs|keine.*ZIP|keine.*Bilder/i);
 assert.ok(text('AGENTS.md').includes('PRICE_TEXT_EVIDENCE_POLICY_20261106.md'));
 const l4=data.find(x=>x.variant==='L4');
 assert.equal(l4.amount_eur,'658.61');
 assert.equal(l4.amount_type,'prior_chat_transcribed_display_only');
 assert.equal(l4.B5_base_mm,'600');
 assert.equal(l4.status,'not_verified_net_EK');
});
