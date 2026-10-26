export function createPreviewController({request,onPending,onResult,onError}) {
  let serial=0;
  return {async refresh(payload) {
    const current=++serial;
    onPending();
    try {const result=await request(typeof payload==='function'?payload():payload);if(current===serial)onResult(result);}
    catch(error) {if(current===serial)onError(error);}
  }};
}
