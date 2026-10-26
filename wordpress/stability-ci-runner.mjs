import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const server=createPackageTestServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:920}});
  const failures=[];
  page.on('pageerror',error=>failures.push('pageerror: '+error.message));
  page.on('requestfailed',req=>failures.push('requestfailed: '+req.url()+' '+req.failure()?.errorText));
  page.on('response',response=>{
   if(response.url().includes('/assets/decors/')&&response.status()!==200)
    failures.push('HTTP '+response.status()+' '+response.url());
  });
  await page.goto(base+'/stability-test',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('results')?.dataset.done==='true',null,{timeout:150000});
  const res=await page.locator('#results').evaluate(el=>({pass:el.dataset.pass,text:el.textContent}));
  console.log(width+'px\n'+res.text);
  assert.equal(res.pass,'true','Browser stress failed at '+width+'px');
  assert.deepEqual(failures,[],'Network or JS errors at '+width+'px');
  await page.close();
 }
 const health=await(await fetch(base+'/__health')).json();
 assert.equal(health.imageFailures,0);
 console.log('PASS browser stress: 60 cycles at 1366px and 390px; 0 failed images');
}finally{
 await browser?.close();
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
