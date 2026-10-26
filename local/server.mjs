import {createServer as httpServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {normalize,catalog} from './core/config.mjs';
import {geometry} from './core/geometry.mjs';
import {resolveProduct} from './core/products.mjs';
import {quote} from './private/pricing.mjs';
const files=new Map([
 ['/core/straight-corners.mjs',['core/straight-corners.mjs','text/javascript']],
 ['/core/straight-geometry.mjs',['core/straight-geometry.mjs','text/javascript']],
 ['/core/decor-catalog.mjs',['core/decor-catalog.mjs','text/javascript']],
 ['/core/customer-measures.mjs',['core/customer-measures.mjs','text/javascript']],
 ['/decor-images.mjs',['public/decor-images.mjs','text/javascript']],
 ['/component-test',['public/component-test.html','text/html']],['/component-test.mjs',['public/component-test.mjs','text/javascript']],
 ['/embed',['public/embed.html','text/html']],['/embed.mjs',['public/embed.mjs','text/javascript']],
 ['/component.mjs',['public/component.mjs','text/javascript']],['/component-template.mjs',['public/component-template.mjs','text/javascript']],['/component.css',['public/component.css','text/css']],['/kuechenstudio-060.css',['public/kuechenstudio-060.css','text/css']],['/core/products.mjs',['core/products.mjs','text/javascript']],
  ['/',['public/index.html','text/html']], ['/app.mjs',['public/app.mjs','text/javascript']],
  ['/latest.mjs',['public/latest.mjs','text/javascript']], ['/style.css',['public/style.css','text/css']],
  ['/mobile',['public/review.html','text/html']], ['/review.mjs',['public/review.mjs','text/javascript']],
  ['/core/config.mjs',['core/config.mjs','text/javascript']], ['/core/geometry.mjs',['core/geometry.mjs','text/javascript']]
]);
for(const decor of catalog().decors)for(const filename of [decor.imageFilename,decor.thumbnailFilename])files.set('/decors/'+filename,['public/decors/'+filename,'image/webp']);
export function createServer() {
  const server=httpServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'");
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
    const host=req.headers.host;
    if(![`127.0.0.1:${server.address().port}`,`localhost:${server.address().port}`].includes(host)) return json(403,{error:'Nur lokale Zugriffe erlaubt.'});
    if(req.headers.origin && req.headers.origin!==`http://${host}`) return json(403,{error:'Fremder Ursprung gesperrt.'});
    const path=new URL(req.url,`http://${host}`).pathname;
    try {
      if(req.method==='GET' && path==='/api/catalog') return json(200,catalog());
      if(req.method==='POST' && path==='/api/preview') {
        if(req.headers['content-type']?.split(';')[0]!=='application/json') return json(415,{error:'JSON erforderlich.'});
        let text='',size=0;
        for await(const chunk of req) {
          size+=chunk.length;
          if(size>16384) return json(413,{error:'Anfrage zu groß.'});
          text+=chunk.toString('utf8');
        }
        let raw;
        try {raw=JSON.parse(text);} catch {return json(400,{error:'Ungültiges JSON.'});}
        let config,g;
        try {if(raw.productId!==undefined||raw.sku!==undefined){const p=resolveProduct(raw);if(raw.product!==p.family)throw new Error('Produktfamilie passt nicht zum Produkt.');}config=normalize(raw);g=geometry(config);} catch(e) {return json(422,{error:e.message});}
        const q=quote(config);
        const hash=createHash('sha256').update(JSON.stringify({config,geometryVersion:g.version,priceVersion:q.ruleVersion})).digest('hex');
        return json(200,{config,geometry:g,quote:q,hash});
      }
      if(req.method==='GET' && files.has(path)) {
        const [file,type]=files.get(path);
        const content=await readFile(new URL(file,import.meta.url));
        res.writeHead(200,{'Content-Type':type.startsWith('image/')?type:`${type}; charset=utf-8`});return res.end(content);
      }
      return json(404,{error:'Nicht vorhanden.'});
    } catch {if(!res.headersSent)json(500,{error:'Lokale Vorschau nicht verfügbar.'});else res.end();}
  });
  server.requestTimeout=10000;
  server.headersTimeout=10000;
  return server;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const server=createServer();
  server.listen(4173,'127.0.0.1',()=>process.stdout.write('Lokaler Konfigurator: http://127.0.0.1:4173\n'));
}

