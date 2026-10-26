// Latest-selection-wins controller. Each change cancels the preceding
// WordPress price request, but allows a synchronous geometry update first.
export function createPreviewController({request,onPending,onVisual,onResult,onError}) {
  let serial=0,active=null;
  return {
    async refresh(payload) {
      const current=++serial;
      active?.abort();
      const own=new AbortController();
      active=own;
      onPending();
      try {
        const raw=typeof payload==='function'?payload():payload;
        const result=await request(raw,{
          signal:own.signal,
          onVisual:visual=>{
            if(current===serial&&!own.signal.aborted)onVisual?.(visual);
          }
        });
        if(current===serial&&!own.signal.aborted)onResult(result);
      }catch(error){
        if(current===serial&&!own.signal.aborted)onError(error);
      }finally{
        if(active===own)active=null;
      }
    },
    cancel(){
      serial++;
      active?.abort();
      active=null;
    }
  };
}
