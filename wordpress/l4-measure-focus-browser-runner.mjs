import {strict as assert} from 'node:assert';
import {chromium} from 'playwright';
import {createPackageTestServer} from './serve-package-test.mjs';

// Installed plugin bundle only. Cover the exact L4 B5, German overlay and
// paired-input focus bugs reported after PR #76 on desktop and mobile.
const server=createPackageTestServer();
await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
const url='http://127.0.0.1:'+server.address().port+'/?productId=1000080';
let browser;
try {
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  for (const width of [1366,390]) {
    const page=await browser.newPage({viewport:{width,height:920}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    const ready=()=>page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]')?.shadowRoot;
      return !!s?.querySelector('#drawing svg')
        &&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
    },null,{timeout:25000});
    await ready();
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      s.querySelector('#geometry').value='L4';
      s.querySelector('#geometry').dispatchEvent(new Event('change',{bubbles:true}));
      s.querySelector('#steps button:nth-child(2)').click();
    });
    await ready();
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const b5=s.querySelector('#dim-B5');b5.focus();b5.value='30';
      b5.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return s.querySelector('#drawing')?.getAttribute('aria-busy')==='false'
        &&s.querySelector('#drawing .apl-measure[data-field="B5"]')
          ?.dataset.diagonal==='outer-edge';
    },null,{timeout:25000});
    const first=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const d=s.querySelector('#drawing .apl-measure[data-field="B5"]');
      return {
        diagonal:d.dataset.diagonal,
        active:d.dataset.active,
        label:d.querySelector('.apl-measure-label text')?.textContent,
        path:d.querySelector('path')?.getAttribute('d'),
        fieldActive:s.querySelector('#dim-B5').parentElement.parentElement
          .classList.contains('active-dimension'),
        priceNote:s.querySelector('#price-note')?.textContent
      };
    });
    assert.equal(first.diagonal,'outer-edge','B5=30 is a diagonal setting, not top B3/B4');
    assert.equal(first.active,'true','B5 sketch follows B5 input');
    assert.equal(first.fieldActive,true,'B5 input follows B5 sketch selection');
    assert.equal(first.label,'B5: 30 cm');
    assert.match(first.path,/^M 525,525 L /,'leader starts at actual diagonal midpoint');
    assert.ok(!first.priceNote.includes('Kaufmännischer Modellpreis'),
      'no long backend explanation in customer summary');

    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      s.querySelector('#drawing .apl-measure[data-field="B5"] text')
        .dispatchEvent(new MouseEvent('click',{bubbles:true}));
    });
    const editor=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {
        visible:!s.querySelector('.inline-measure-editor').hidden,
        caption:s.querySelector('.inline-measure-editor label')?.textContent,
        editorValue:s.querySelector('.inline-measure-editor input')?.value,
        rightActive:s.querySelector('#dim-B5').parentElement.parentElement
          .classList.contains('active-dimension')
      };
    });
    assert.deepEqual(editor,{visible:true,caption:'B5 in cm',editorValue:'30',rightActive:true});
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const input=s.querySelector('.inline-measure-editor input');
      input.value='40';input.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return s.querySelector('#dim-B5')?.value==='40'
        &&s.querySelector('#drawing .apl-measure[data-field="B5"] text')
          ?.textContent==='B5: 40 cm'
        &&s.querySelector('#drawing .apl-measure[data-field="B5"]').dataset.active==='true';
    },null,{timeout:25000});
    // Paired physical labels B1/B2 and B3/B4 MUST select their one real
    // input, even if clicking the physically distinct B2/B4 sketch label.
    for(const [key,physical] of [['B1','B2'],['B3','B4']]){
      await page.evaluate(([target])=>{
        const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
        s.querySelector('#dim-'+target).focus();
      },[key]);
      const result=await page.evaluate(([target,actual])=>{
        const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
        const d=s.querySelector('#drawing .apl-measure[data-measure-id="'+actual+'"]');
        return {field:d?.dataset.field,active:d?.dataset.active,
          inputActive:s.querySelector('#dim-'+target).parentElement.parentElement
            .classList.contains('active-dimension')};
      },[key,physical]);
      assert.deepEqual(result,{field:key,active:'true',inputActive:true});
      await page.evaluate(([actual])=>{
        const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
        s.querySelector('#drawing .apl-measure[data-measure-id="'+actual+'"] text')
          .dispatchEvent(new MouseEvent('click',{bubbles:true}));
      },[physical]);
      const inline=await page.evaluate(()=>{
        const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
        return {label:s.querySelector('.inline-measure-editor label')?.textContent,
          fieldActive:s.querySelector('.active-dimension input')?.id};
      });
      assert.equal(inline.label,key+' in cm');
      assert.equal(inline.fieldActive,'dim-'+key);
    }
    // First check a real 90cm physical diagonal ruler, then an invalid
    // 180cm input: no stale B5:90 number may remain in the last-valid SVG.
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const input=s.querySelector('#dim-B5');input.focus();input.value='90';
      input.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return s.querySelector('#drawing .apl-measure[data-field="B5"]')
        ?.dataset.diagonal==='diagonal-ruler'
        &&s.querySelector('#drawing').getAttribute('aria-busy')==='false';
    },null,{timeout:25000});
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const input=s.querySelector('#dim-B5');input.value='180';
      input.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return s.querySelector('#measurement-error')
        ?.textContent.includes('B5: Erlaubt sind 30–90 cm.')
        &&s.querySelector('.hpz-apl').dataset.measureInvalid==='true';
    },null,{timeout:25000});
    const invalid=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {
        error:s.querySelector('#measurement-error').textContent,
        label:s.querySelector('#drawing .apl-measure[data-field="B5"] text')?.textContent,
        visibleErrors:s.querySelector('#measurement-error').hidden?0:1,
        oldDrawing:s.querySelector('#drawing svg')!==null,
        cartDisabled:s.querySelector('#cart').disabled
      };
    });
    assert.doesNotMatch(invalid.error,/z\. ?B\.|Beispiel/);
    assert.equal(invalid.label,'B5','old valid B5 number must not be shown after invalid input');
    assert.equal(invalid.visibleErrors,1);
    assert.equal(invalid.oldDrawing,true);
    assert.equal(invalid.cartDisabled,true);
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const input=s.querySelector('#dim-B5');input.value='40';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      const side=s.querySelector('input[name="l-side"][value="right"]');
      side.checked=true;side.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await ready();
    await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      const radius=s.querySelector('#drawing .apl-measure[data-field="corner-R2"]');
      if(!radius)throw Error('Missing R2 in L4 sketch');
      radius.querySelector('text').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    });
    const radius=await page.evaluate(()=>{
      const s=document.querySelector('[data-hpz-apl-preview]').shadowRoot;
      return {label:s.querySelector('.inline-measure-editor label')?.textContent,
        rightInput:s.querySelector('#corner-R2').parentElement.parentElement
          .classList.contains('active-dimension')};
    });
    assert.equal(radius.label,'R2 in cm','never print corner-R2 in a customer label');
    assert.equal(radius.rightInput,true,'R2 inline and right-hand field share focus');
    assert.deepEqual(errors,[],'no unexpected browser exceptions');
    await page.close();
    console.log('PASS L4 B5 diagonal, real focus sync, German overlay, concise errors: '+width+'px');
  }
} finally {
  await browser?.close();
  await new Promise(ok=>{server.close(ok);server.closeAllConnections();});
}
