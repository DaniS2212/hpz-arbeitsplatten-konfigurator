// Test harness only; never included in the WordPress ZIP.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {DECOR_CATALOG} from '../local/core/decor-catalog.mjs';
const root=new URL('./hpz-apl-admin-preview/',import.meta.url);
const port=Number(process.env.HPZ_TEST_PORT||4174);
const images=new Set(DECOR_CATALOG.flatMap(d=>[d.imageFilename,d.thumbnailFilename]));
createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4174');
 if(url.pathname==='/decor-test.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('./decor-browser-test.mjs',import.meta.url)));return;}
 if(url.pathname==='/decor-responsive-test.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('./decor-responsive-test.mjs',import.meta.url)));return;}
 if(url.pathname==='/decor-test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="de"><meta name="viewport" content="width=device-width"><h1>Dekor-Browserprüfungen</h1><pre id="results">Läuft …</pre><div id="test-root"></div><script type="module" src="/decor-test.js"></script></html>');return;}
 if(url.pathname==='/decor-responsive-test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><h1>Dekor-Layoutprüfung</h1><pre id="results">Läuft …</pre><iframe title="Dekor-Testansicht"></iframe><script type="module" src="/decor-responsive-test.js"></script></html>');return;}
 if(url.pathname==='/a1-test.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('./a1-browser-test.mjs',import.meta.url)));return;}
 if(url.pathname==='/responsive-test.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('./a1-responsive-test.mjs',import.meta.url)));return;}
 if(url.pathname==='/a1-1-responsive-test.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('./a1-1-responsive-test.mjs',import.meta.url)));return;}
 if(url.pathname==='/a1-1-responsive-test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><h1>A1.1 Responsive-Prüfung</h1><pre id="results">Läuft …</pre><iframe title="Testansicht"></iframe><script type="module" src="/a1-1-responsive-test.js"></script></html>');return;}
 if(url.pathname==='/responsive-test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><h1>A1 Responsive-Prüfung</h1><pre id="results">Läuft …</pre><iframe title="Testansicht"></iframe><script type="module" src="/responsive-test.js"></script></html>');return;}
 if(url.pathname==='/a1-test'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="de"><meta name="viewport" content="width=device-width"><h1>A1 Browserprüfungen</h1><pre id="results">Läuft …</pre><div id="test-root"></div><script type="module" src="/a1-test.js"></script></html>');return;}
 if(url.pathname==='/review'){
  const width=['360','390','1366','1440'].includes(url.searchParams.get('width'))?url.searchParams.get('width'):'1366';
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="de"><title>A1.1 ${width}px Layoutprobe</title><style>body{margin:0;background:#ddd}iframe{display:block;width:${width}px;height:844px;border:0}</style><iframe title="A1 Layoutprobe" src="/?sticky=1"></iframe></html>`);return;
 }
 if(url.pathname==='/'){
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(`<!doctype html><html lang="de"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plugin-Pakettest</title><style>body{margin:20px;font-family:system-ui}main{max-width:1350px;margin:auto}button{background:magenta}h1{font-size:24px}.test-header{position:sticky;top:0;background:#17677a;color:white;height:80px;z-index:50;display:flex;align-items:center;padding:15px}</style><link rel="stylesheet" href="/assets/host.css">${url.searchParams.get('sticky')==='1'?'<header class="test-header">Shopheader · Testhöhe 80 px</header>':''}<main><h1>Plugin-Pakettest – vorhandener Produktkopf</h1><section class="hpz-apl-admin-preview"><p class="hpz-apl-test-notice">Admin-Test · Kein Verkauf</p><div data-hpz-apl-preview data-product-id="${['1000083','1000080','1000081'].includes(url.searchParams.get('productId'))?url.searchParams.get('productId'):'1000083'}"></div></section><h2>Vorhandene Beschreibung</h2></main><script src="/assets/bootstrap.js"></script></html>`);return;
 }
 if(url.pathname.startsWith('/assets/decors/')&&images.has(url.pathname.slice('/assets/decors/'.length))){res.setHeader('Content-Type','image/webp');res.end(await readFile(new URL(url.pathname.slice(1),root)));return;}
 if(!/^\/assets\/(?:core\/)?[a-z-]+\.(js|css)$/.test(url.pathname)){res.writeHead(404);res.end();return;}
 try{const data=await readFile(new URL(url.pathname.slice(1),root));res.setHeader('Content-Type',url.pathname.endsWith('.css')?'text/css':'text/javascript');res.end(data);}catch{res.writeHead(404);res.end();}
}).listen(port,'127.0.0.1',()=>console.log('Package-only browser test http://127.0.0.1:'+port));
