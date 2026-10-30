import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';
const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 await mkdir('wordpress/ci-artifacts',{recursive:true});
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('[data-hpz-apl-preview]')?.shadowRoot?.querySelector('#drawing svg'));
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   const side=s.querySelector('input[name="straight-side"][value="both"]');
   side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
   const treatment=s.querySelector('input[name="straight-treatment"][value="chamfer_continuous"]');
   treatment.checked=true;treatment.dispatchEvent(new Event('change',{bubbles:true}));
   s.querySelector('#steps button:nth-child(2)').click();
   const l=s.querySelector('#dim-B2');l.focus();l.value='50';l.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.querySelector('[data-field="B2"] .apl-measure-label text')?.textContent.includes('50 cm')
     &&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
  });
  const first=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return {label:s.querySelector('[data-field="B2"] .apl-measure-label text').textContent,
     contour:s.querySelector('.apl-surface')?.outerHTML};
  });
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,l=s.querySelector('#dim-B2');
   l.value='51';l.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return !s.querySelector('#field-error-B2').hidden&&!s.querySelector('#drawing-status').hidden;
  });
  const invalid=await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return {svg:!!s.querySelector('#drawing svg'),
     label:s.querySelector('[data-field="B2"] .apl-measure-label text')?.textContent,
     contour:s.querySelector('.apl-surface')?.outerHTML,
     text:s.querySelector('#field-error-B2').textContent,
     aria:s.querySelector('#dim-B2').getAttribute('aria-invalid'),
     direct:s.querySelector('#dim-B2').closest('.a1-radius-field').classList.contains('has-measure-error'),
     status:s.querySelector('#drawing-status').textContent,
     formErrorHidden:s.querySelector('#measurement-error').hidden,
     nextDisabled:s.querySelector('#next').disabled,
     price:s.querySelector('#price').textContent,
     summary:s.querySelector('#summary').textContent,
     cartDisabled:s.querySelector('#cart').disabled};
  });
  assert.equal(invalid.svg,true);
  assert.equal(invalid.label,first.label);
  assert.equal(invalid.contour,first.contour);
  assert.match(invalid.text,/Maximal 50 cm möglich/);
  assert.equal(invalid.aria,'true');
  assert.equal(invalid.direct,true);
  assert.match(invalid.status,/Letzter gültiger Stand/);
  assert.equal(invalid.formErrorHidden,false);
  assert.equal(invalid.nextDisabled,true);
  assert.equal(invalid.price,'–');
  assert.match(invalid.summary,/Bitte korrigieren/);
  assert.equal(invalid.cartDisabled,true);
  await page.screenshot({path:'wordpress/ci-artifacts/065-invalid-'+width+'.png',fullPage:true});
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,l=s.querySelector('#dim-B2');
   l.value='50';l.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.querySelector('#field-error-B2').hidden&&s.querySelector('#drawing-status').hidden
      &&!s.querySelector('#next').disabled;
  });
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,l=s.querySelector('#dim-B2');
   l.value='abc';l.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.querySelector('#field-error-B2').textContent.includes('Bitte in cm eingeben')
       &&!s.querySelector('#drawing-status').hidden;
  });
  assert.equal(await page.evaluate(()=>!!document.querySelector('[data-hpz-apl-preview]').shadowRoot.querySelector('#drawing svg')),true);
  await page.evaluate(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot,l=s.querySelector('#dim-B2');
   l.value='50';l.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>{
   const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
   return s.querySelector('#field-error-B2').hidden&&s.querySelector('#drawing-status').hidden
      &&!s.querySelector('#next').disabled;
  });
  assert.deepEqual(errors,[]);
  await page.close();
  console.log('PASS 1.0.3 '+width+' px: valid B2=50, rejected 51, bad text, SVG retained, inline error and recovery');
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
