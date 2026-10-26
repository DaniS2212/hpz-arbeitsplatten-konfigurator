import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {DECOR_CATALOG,DECOR_CATALOG_VERSION} from './local/core/decor-catalog.mjs';
const base=new URL('./',import.meta.url), out=new URL('wordpress/hpz-apl-admin-preview/assets/',base);
const version=(await readFile(new URL('wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php',base),'utf8')).match(/Version: ([\d.]+)/)[1];
const versionImports=code=>code.replace(/(from\s+['"]\.\.?\/[^'"]+\.js)(?:\?v=[^'"]+)?(['"])/g,`$1?v=${version}$2`);
await mkdir(new URL('core/',out),{recursive:true});
for(const name of ['config','geometry','products','straight-corners','straight-geometry','decor-catalog','customer-measures']) {
  let code=await readFile(new URL(`local/core/${name}.mjs`,base),'utf8');
  if(name==='decor-catalog')code=code.replace(/^\/\*\*[\s\S]*?\*\/\s*/,'// Local decor mapping; provenance is retained in the source catalog.\n');
  await writeFile(new URL(`core/${name}.js`,out),versionImports(code.replaceAll('.mjs\'','.js\'')));
}
for(const name of ['component','component-template','latest','decor-images']) {
  let code=await readFile(new URL(`local/public/${name}.mjs`,base),'utf8');
  code=code.replaceAll("'/core/","'./core/").replaceAll("'../core/","'./core/").replaceAll("'/latest.mjs'","'./latest.mjs'").replaceAll('.mjs\'','.js\'');
  if(name==='component-template')code=code.replaceAll('Zuzüglich Kundenversand. Interne Anlieferung bereits im Preisbeispiel berücksichtigt.','Kundenversand wird später separat im Checkout berechnet. Noch keine Preisfreigabe.');
  if(name==='component') {
    code=code.replace("'./component.css'",`'./component.css?v=${version}'`);
    code=code.replace("'./kuechenstudio-060.css'",`'./kuechenstudio-060.css?v=${version}'`);
    const start=code.indexOf("const response=await fetch('/api/preview'");
    const end=code.indexOf('return result;',start);
    if(start<0||end<0)throw new Error('Component request adapter changed; inspect build.');
    code=code.slice(0,start)+"throw new Error('Vorschauadapter fehlt. Kauf bleibt gesperrt.');"+code.slice(end+'return result;'.length);
  }
  await writeFile(new URL(`${name}.js`,out),versionImports(code));
}
// Static WordPress adapters also need versioned module imports after a plugin update.
const previewFile=new URL('preview.js',out);
await writeFile(previewFile,versionImports(await readFile(previewFile,'utf8')));
const bootstrapFile=new URL('bootstrap.js',out);
await writeFile(bootstrapFile,(await readFile(bootstrapFile,'utf8')).replace(/(\.js\?v=)[\d.]+/g,`$1${version}`));
await copyFile(new URL('local/public/component.css',base),new URL('component.css',out));
await copyFile(new URL('design/kuechenstudio-060.css',base),new URL('local/public/kuechenstudio-060.css',base));
await copyFile(new URL('design/kuechenstudio-060.css',base),new URL('kuechenstudio-060.css',out));
await copyFile(new URL('docs/phase-a1-evidence.md',base),new URL('../A1-NACHWEISE.md',out));
await copyFile(new URL('docs/phase-a1-1-evidence.md',base),new URL('../A1.1-NACHWEISE.md',out));
await copyFile(new URL('docs/input-contract-v2.md',base),new URL('../MILLIMETER-VERTRAG.md',out));
await copyFile(new URL('docs/040-decor-integration.md',base),new URL('../DEKORE-0.4.0.md',out));
await copyFile(new URL('docs/phase-050.md',base),new URL('../PREISVORSCHAU-0.5.0.md',out));
await copyFile(new URL('docs/phase-060.md',base),new URL('../KUECHENSTUDIO-0.6.0.md',out));
await mkdir(new URL('../includes/',out),{recursive:true});
await copyFile(new URL('pricing-v3/HPZ_APL_Price_V3.php',base),new URL('../includes/price-v3.php',out));
await mkdir(new URL('decors/',out),{recursive:true});
for(const decor of DECOR_CATALOG)for(const file of [decor.imageFilename,decor.thumbnailFilename])await copyFile(new URL('local/public/decors/'+file,base),new URL('decors/'+file,out));
await mkdir(new URL('../data/',out),{recursive:true});
await writeFile(new URL('../data/decors.json',out),JSON.stringify({version:DECOR_CATALOG_VERSION,items:DECOR_CATALOG.map(({id,supplierCode,displayName})=>({id,supplierCode,displayName}))},null,2)+'\n');
console.log('Plugin assets and unchanged PHP V3 engine bundled; local demo pricing unchanged.');
