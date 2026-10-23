import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
const base=new URL('./',import.meta.url), out=new URL('wordpress/hpz-apl-admin-preview/assets/',base);
const version=(await readFile(new URL('wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php',base),'utf8')).match(/Version: ([\d.]+)/)[1];
const versionImports=code=>code.replace(/(from\s+['"]\.\.?\/[^'"]+\.js)(?:\?v=[^'"]+)?(['"])/g,`$1?v=${version}$2`);
await mkdir(new URL('core/',out),{recursive:true});
for(const name of ['config','geometry','products','straight-corners','straight-geometry']) {
  const code=await readFile(new URL(`local/core/${name}.mjs`,base),'utf8');
  await writeFile(new URL(`core/${name}.js`,out),versionImports(code.replaceAll('.mjs\'','.js\'')));
}
for(const name of ['component','component-template','latest']) {
  let code=await readFile(new URL(`local/public/${name}.mjs`,base),'utf8');
  code=code.replaceAll("'/core/","'./core/").replaceAll("'../core/","'./core/").replaceAll("'/latest.mjs'","'./latest.mjs'").replaceAll('.mjs\'','.js\'');
  if(name==='component-template')code=code.replaceAll('Zuzüglich Kundenversand. Interne Anlieferung bereits im Preisbeispiel berücksichtigt.','Kundenversand wird später separat im Checkout berechnet. Noch keine Preisfreigabe.');
  if(name==='component') {
    code=code.replace("'./component.css'",`'./component.css?v=${version}'`);
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
await copyFile(new URL('local/public/component.css',base),new URL('component.css',out));
await copyFile(new URL('docs/phase-a1-evidence.md',base),new URL('../A1-NACHWEISE.md',out));
console.log('Plugin assets bundled; original demo and pricing unchanged.');
