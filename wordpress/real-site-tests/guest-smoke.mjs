#!/usr/bin/env node
/**
 * Read-only unauthenticated HTTP checks.
 *
 * Example: node wordpress/real-site-tests/guest-smoke.mjs https://staging.example.com
 *
 * Makes GET requests ONLY. It never logs in, adds carts, submits checkouts,
 * installs software, changes content or follows a secret admin preview URL.
 */
import {strict as assert} from 'node:assert';

const baseArg=process.argv[2];
if(!baseArg) {
  console.error('Usage: node wordpress/real-site-tests/guest-smoke.mjs https://staging.example.com');
  process.exit(2);
}
let base;
try {
  base=new URL(baseArg);
  assert.ok(['https:','http:'].includes(base.protocol),'Only HTTP(S) sites are supported');
  assert.ok(!base.username&&!base.password,'Credentials in URL are forbidden');
  if(base.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(base.hostname))
    throw new Error('Use HTTPS except for a local test server');
} catch(error) {console.error('Invalid site URL: '+error.message);process.exit(2);}
const targetIds=[1000083,1000080,1000081];
const checks=[];
let failures=0;
async function get(url) {
  const response=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(15000),
    headers:{'Accept':'text/html','Cache-Control':'no-cache'}});
  const body=await response.text();
  return {status:response.status,url:response.url,body};
}
function add(name,passed,details) {
  checks.push({name,status:passed?'PASS':'FAIL',details});
  if(!passed)failures++;
}
try {
  const home=await get(new URL('/',base));
  add('guest-homepage-available',home.status===200,'HTTP '+home.status);
  // No claims about registered plugin version are made from public HTML.
  const markers=[/data-hpz-apl-preview\b/i,/data-price-nonce\b/i,
    /data-price-endpoint\b/i,/\bhpz_apl_price_1000083\b/i];
  add('guest-home-no-admin-config',!markers.some(re=>re.test(home.body)),
    'No protected configurator root or price nonce in public homepage');

  for(const id of targetIds) {
    const url=new URL('/',base);
    url.searchParams.set('post_type','product');
    url.searchParams.set('p',String(id));
    const result=await get(url);
    const leaked=markers.some(re=>re.test(result.body));
    add('guest-draft-'+id+'-no-admin-config',!leaked,'HTTP '+result.status);
    const looksLikeSingleProduct=(/\bsingle-product\b/i.test(result.body)
      && /\bwoocommerce-product-gallery\b|\bproduct-type-(simple|variable)\b/i.test(result.body));
    add('guest-draft-'+id+'-not-public-product',!looksLikeSingleProduct,
      looksLikeSingleProduct?'Appears to expose a single product page':'No obvious WooCommerce single-product page');
  }
} catch(error) {
  add('network',false,String(error.message).slice(0,250));
}
console.log(JSON.stringify({schema:'hpz-apl-guest-http-1',base:base.origin,checks,fail_count:failures,pass:failures===0},null,2));
if(failures)process.exitCode=1;
