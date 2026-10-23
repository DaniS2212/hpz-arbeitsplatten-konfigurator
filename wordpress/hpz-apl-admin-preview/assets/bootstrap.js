(() => {
  const source=document.currentScript?.src;
  if(!source)return;
  async function start(){
    for(const root of document.querySelectorAll('[data-hpz-apl-preview]')){
      if(root.dataset.hpzMounted)continue;
      root.dataset.hpzMounted='loading';
      try{
        const [{mountConfigurator},{preview}]=await Promise.all([
          import(new URL('./component.js?v=0.2.0',source).href),import(new URL('./preview.js?v=0.2.0',source).href)
        ]);
        mountConfigurator(root,{productId:Number(root.dataset.productId),presentationMode:'embedded'},{preview});
        root.dataset.hpzMounted='ready';
      }catch(error){root.textContent='Die Testvorschau konnte nicht geladen werden. Kaufen bleibt gesperrt.';root.dataset.hpzMounted='error';console.error('HPZ APL Vorschau:',error);}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
