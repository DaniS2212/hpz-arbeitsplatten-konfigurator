(() => {
  const source=document.currentScript?.src;
  if(!source)return;
  async function start(){
    for(const root of document.querySelectorAll('[data-hpz-apl-preview]')){
      if(root.dataset.hpzMounted)continue;
      root.dataset.hpzMounted='loading';
      try{
        const [{mountConfigurator},{preview}]=await Promise.all([
          import(new URL('./component.js?v=0.6.3',source).href),import(new URL('./preview.js?v=0.6.3',source).href)
        ]);
        const pricePreview=root.dataset.priceEndpoint&&root.dataset.priceNonce
          ? {url:root.dataset.priceEndpoint,nonce:root.dataset.priceNonce}:null;
        mountConfigurator(root,{productId:Number(root.dataset.productId),decorId:root.dataset.decorId??'H1145',presentationMode:'embedded'},
          {preview:(raw,{signal,onVisual})=>preview(raw,{signal,onVisual,pricePreview})});
        root.dataset.hpzMounted='ready';
      }catch(error){root.textContent='Die Testvorschau konnte nicht geladen werden. Kaufen bleibt gesperrt.';root.dataset.hpzMounted='error';console.error('HPZ APL Vorschau:',error);}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
