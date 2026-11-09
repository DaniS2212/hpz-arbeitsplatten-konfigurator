import {strict as assert} from 'node:assert';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=createPackageTestServer();
await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
  await mkdir('wordpress/ci-artifacts',{recursive:true});
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  for(const width of [1366,390]){
    const page=await browser.newPage({viewport:{width,height:920}});
    const exceptions=[],requests=[];
    page.on('pageerror',e=>exceptions.push(e.message));

    // Test the shipped WordPress bootstrapping and AJAX frontend together:
    // add the same data-attributes PHP renders, but never touch a live shop.
    await page.route(base+'/',async route=>{
      const actual=await route.fetch();
      let html=await actual.text();
      const target='data-product-id="1000083"';
      assert.ok(html.includes(target));
      html=html.replace(target,target+
        ' data-price-endpoint="/admin-ajax.php?action=hpz_apl_price_preview" data-price-nonce="staging-test"');
      await route.fulfill({response:actual,body:html});
    });
    await page.route('**/admin-ajax.php?action=hpz_apl_price_preview',async route=>{
      const body=route.request().postDataJSON();
      requests.push(body);
      const hanging=body.decor==='F095';
      await pause(hanging?12000:1650);
      const unit=body.material==='APL17.5'?45000:body.decor==='H1145'?69000:67000;
      try{
        await route.fulfill({
          status:200,contentType:'application/json',
          body:JSON.stringify({success:true,data:{quote:{
            status:'calculated-not-sale-approved',
            purchasable:false,currency:'EUR',
            quantity:body.quantity,
            unitGrossReferenceCents:unit,
            totalGrossReferenceCents:unit*body.quantity,
            taxNote:'DE-Referenz · Versand separat',
            availabilityNote:'Noch keine Fertigungsfreigabe'
          }}})
        });
      }catch{/* The browser correctly cancelled a superseded Ajax request. */}
    });

    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return !!s?.querySelector('#drawing svg')&&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
    });

    // The first price request may still be pending, but the drawing must be
    // rendered at full opacity and every geometry control should work.
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const side=s.querySelector('input[name="straight-side"][value="right"]');
      side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return s?.querySelector('#summary')?.textContent.includes('Rechts')&&
        s?.querySelector('#drawing svg')&&
        s.querySelector('#drawing').getAttribute('aria-busy')==='false';
    });
    const immediate=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const drawing=s.querySelector('#drawing');
      return {opacity:getComputedStyle(drawing).opacity,
        busy:drawing.getAttribute('aria-busy'),
        nextDisabled:s.querySelector('#next').disabled,
        cartDisabled:s.querySelector('#cart').disabled,
        rightRadius:!!s.querySelector('[data-field="R2"]'),
        text:s.querySelector('#summary').textContent};
    });
    assert.equal(immediate.opacity,'1','Drawing must not fade while PHP is slow');
    assert.equal(immediate.busy,'false');
    assert.equal(immediate.nextDisabled,false,'Customer should navigate while price pending');
    assert.equal(immediate.cartDisabled,true);
    assert.equal(immediate.rightRadius,false,'Step 1 intentionally hides all dimension callouts');
    await page.evaluate(()=>document.querySelector('[data-hpz-apl-preview]').shadowRoot
      .querySelector('#steps button:nth-child(2)').click());
    assert.equal(await page.evaluate(()=>!!document.querySelector('[data-hpz-apl-preview]')
      .shadowRoot.querySelector('#drawing [data-field="R2"]')),true,
      'Step 2 restores the matching right radius ruler');

    // Rapid choice changes: server replies are slow and may arrive out of
    // order. Drawing and summary must always represent the latest selection.
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      s.querySelector('#steps button:nth-child(3)').click();
      for(const [kind,value] of [['decor','F021'],['decor','H3303'],['decor','W980'],['material','APL17.5']]){
        const input=s.querySelector(`input[name="${kind}"][value="${value}"]`);
        input.checked=true;
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return s?.querySelector('#selected-surface-name')?.textContent==='Platinweiß'&&
        s.querySelector('#summary')?.textContent.includes('17,5 mm')&&
        s.querySelector('#drawing svg')&&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
    });
    const active=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {
        opacity:getComputedStyle(s.querySelector('#drawing')).opacity,
        visual:s.querySelector('#selected-surface-name').textContent,
        strength:s.querySelector('#selected-surface-thickness').textContent,
        disabled:s.querySelector('#cart').disabled,
        price:s.querySelector('#price').textContent
      };
    });
    assert.equal(active.opacity,'1');
    assert.equal(active.visual,'Platinweiß');
    assert.match(active.strength,/17,5 mm/);
    assert.equal(active.disabled,true);

    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return s?.querySelector('#price').textContent.includes('450,00');
    },null,{timeout:9500});
    const priced=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {price:s.querySelector('#price').textContent,
        visual:s.querySelector('#selected-surface-name').textContent,
        disabled:s.querySelector('#cart').disabled,
        busy:s.querySelector('#drawing').getAttribute('aria-busy')};
    });
    assert.match(priced.price,/450,00/);
    assert.equal(priced.visual,'Platinweiß');
    assert.equal(priced.disabled,true);
    assert.equal(priced.busy,'false');

    if(width===1366){
      // Force a PHP-style never-finishing request. After two bounded 6-second
      // attempts only the price becomes unavailable; SVG and inputs stay live.
      await page.evaluate(()=>{
        const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
        const input=s.querySelector('input[name="decor"][value="F095"]');
        input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
      });
      await page.waitForFunction(()=>{
        const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
        return s?.querySelector('#selected-surface-name')?.textContent==='Marmor grau'
          || s?.querySelector('#selected-surface-name')?.textContent==='Lucano';
      });
      await page.waitForFunction(()=>{
        const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
        return s?.querySelector('#price').textContent==='Preis offen';
      },null,{timeout:17000});
      const blocked=await page.evaluate(()=>{
        const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
        return {image:!!s.querySelector('#drawing svg'),busy:s.querySelector('#drawing').getAttribute('aria-busy'),
          opacity:getComputedStyle(s.querySelector('#drawing')).opacity,
          nextDisabled:s.querySelector('#next').disabled,
          cartDisabled:s.querySelector('#cart').disabled,
          retryVisible:!s.querySelector('.price-retry').hidden};
      });
      assert.equal(blocked.image,true);
      assert.equal(blocked.busy,'false');
      assert.equal(blocked.opacity,'1');
      assert.equal(blocked.nextDisabled,false);
      assert.equal(blocked.cartDisabled,true);
      assert.equal(blocked.retryVisible,true,'A failed PHP quote must show a safe retry control');
    }
    await page.screenshot({path:'wordpress/ci-artifacts/064-ajax-'+width+'.png',fullPage:true});
    assert.deepEqual(exceptions,[],'No browser exceptions');
    console.log('PASS 0.6.4 '+width+' px: always responsive drawing despite slow, cancelled, failed WordPress AJAX; cart locked; '+requests.length+' backend calls');
    await page.close();
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
