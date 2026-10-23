import fs from 'node:fs';
const base='implementation/apl/local/';
const read=p=>fs.readFileSync(base+p,'utf8');const write=(p,s)=>fs.writeFileSync(base+p,s);
fs.mkdirSync(base+'../archive/pre-embedding',{recursive:true});
for(const p of ['public/app.mjs','public/index.html','server.mjs'])fs.copyFileSync(base+p,base+'../archive/pre-embedding/'+p.split('/').pop());
write('core/products.mjs',`export const products=Object.freeze([
 Object.freeze({productId:1000083,sku:'HPZ-APL-GERADE-2026',family:'straight',label:'Gerade'}),
 Object.freeze({productId:1000080,sku:'HPZ-APL-L-FORM-2026',family:'l',label:'L-Form'}),
 Object.freeze({productId:1000081,sku:'HPZ-APL-U-FORM-2026',family:'u',label:'U-Form'})
]);
export function resolveProduct({productId,sku}={}) {
 const byId=productId===undefined?null:products.find(p=>String(p.productId)===String(productId));
 const bySku=sku===undefined?null:products.find(p=>p.sku===sku);
 if((productId!==undefined&&!byId)||(sku!==undefined&&!bySku)||(!byId&&!bySku)||(byId&&bySku&&byId!==bySku))throw new Error('Unbekannte oder widersprüchliche Produktzuordnung.');
 return byId||bySku;
}
`);
let html=read('public/index.html');
let template=html.match(/<body>([\s\S]*)<script type="module"/)[1];
write('public/component-template.mjs','export const template='+JSON.stringify(template)+';\n');
let app=read('public/app.mjs');
app=app.replace("const c=catalog(),$=id=>document.getElementById(id);","const c=catalog(),$=id=>shadow.getElementById(id);");
app=app.replaceAll('document.querySelectorAll','shadow.querySelectorAll').replaceAll('document.querySelector(','shadow.querySelector(').replaceAll('document.body.dataset','shell.dataset');
app=app.replace("let product='straight',step", "let product=resolved?.family??'straight',step");
app=app.replace("product=id;rebuild();refresh();","if(resolved)return;product=id;rebuild();refresh();");
app=app.replace("function payload(){return {product,", "function payload(){return {...(resolved?{productId:resolved.productId,sku:resolved.sku}:{}),product,");
app=app.replace("const response=await fetch('/api/preview'", "if(adapters.preview)return adapters.preview(body,{signal:abort.signal});const response=await fetch('/api/preview'");
app=app.replace("method:'POST',headers:","signal:abort.signal,method:'POST',headers:");
app=app.replace('onPending:()=>{','onPending:()=>{if(disposed)return;').replace('onResult:result=>{','onResult:result=>{if(disposed)return;').replace('onError:error=>{','onError:error=>{if(disposed)return;');
app=app.replace("$('drawing').innerHTML=markup;","$('drawing').innerHTML=namespaceSvg(markup,'main');");
app=app.replace("$('large-drawing').innerHTML=svg(lastGeometry,active,{decor,showDimensions:true})","$('large-drawing').innerHTML=namespaceSvg(svg(lastGeometry,active,{decor,showDimensions:true}),'large')");
let imports=app.slice(0,app.indexOf('const c='));app=app.slice(app.indexOf('const c='));
write('public/component.mjs',imports+`import {template} from './component-template.mjs';
import {resolveProduct} from '../core/products.mjs';
const mounts=new WeakMap();let sequence=0;
export function mountConfigurator(root,context={},adapters={}){
 const embedded=context.presentationMode==='embedded';
 const resolved=embedded?resolveProduct(context):null;
 if(context.family&&resolved&&context.family!==resolved.family)throw new Error('Produktfamilie passt nicht.');
 mounts.get(root)?.destroy();
 const shadow=root.shadowRoot||root.attachShadow({mode:'open'});
 const shell=document.createElement('div');shell.className='hpz-apl';shell.dataset.mode=embedded?'embedded':'demo';
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./component.css',import.meta.url).href;
 shell.innerHTML=template;shadow.replaceChildren(link,shell);
 const abort=new AbortController();let disposed=false;const instance='hpz-apl-'+(++sequence);
 function namespaceSvg(markup,view){return markup.replaceAll('apl-arrow',instance+'-'+view+'-arrow').replaceAll('apl-white',instance+'-'+view+'-white').replaceAll('apl-oak',instance+'-'+view+'-oak');}
`+app+`
if(embedded){
 shell.querySelector('#products').hidden=true;
 shell.querySelector('[data-step="0"] h2').textContent='Deine '+names[product]+' konfigurieren';
}
const handle={destroy(){if(disposed)return;disposed=true;abort.abort();for(const d of shadow.querySelectorAll('dialog'))if(d.open)d.close();shadow.replaceChildren();mounts.delete(root);},updateContext(next){return mountConfigurator(root,{...context,...next},adapters);}};
mounts.set(root,handle);return handle;
}
`);
let css=read('public/style.css').replaceAll(':root',':host').replaceAll('body','.hpz-apl');
css+=`\n:host{display:block;min-width:0;color:#29362e;font:15px/normal system-ui,sans-serif;text-align:left;letter-spacing:normal} .hpz-apl{min-width:0} .hpz-apl[data-mode="embedded"]>.workshop-strip,.hpz-apl[data-mode="embedded"]>header,.hpz-apl[data-mode="embedded"] .intro,.hpz-apl[data-mode="embedded"] footer,.hpz-apl[data-mode="embedded"] .mobile-purchase{display:none!important}.hpz-apl[data-mode="embedded"] main{max-width:none;padding:20px 0}.hpz-apl[data-mode="embedded"]{background:transparent}.hpz-apl[data-mode="embedded"] .visual-column{position:static}.hpz-apl[data-mode="embedded"] .stage{container-type:inline-size}\n`;
write('public/component.css',css);
write('public/app.mjs',"import {mountConfigurator} from './component.mjs';\nmountConfigurator(document.getElementById('hpz-demo'),{presentationMode:'demo'});\n");
write('public/index.html','<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Deine Küchenarbeitsplatte nach Maß · Holz-Liebling</title><style>body{margin:0}</style></head><body><div id="hpz-demo"></div><script type="module" src="/app.mjs"></script></body></html>');
let server=read('server.mjs').replace("import {quote}","import {resolveProduct} from './core/products.mjs';\nimport {quote}");
server=server.replace("const files=new Map([",`const files=new Map([
 ['/embed',['public/embed.html','text/html']],['/embed.mjs',['public/embed.mjs','text/javascript']],
 ['/component.mjs',['public/component.mjs','text/javascript']],['/component-template.mjs',['public/component-template.mjs','text/javascript']],['/component.css',['public/component.css','text/css']],['/core/products.mjs',['core/products.mjs','text/javascript']],`);
server=server.replace('try {config=normalize(raw);',"try {if(raw.productId!==undefined||raw.sku!==undefined){const p=resolveProduct(raw);if(raw.product!==p.family)throw new Error('Produktfamilie passt nicht zum Produkt.');}config=normalize(raw);");
write('server.mjs',server);
