import {decorById} from '../core/decor-catalog.mjs';
// Same relative layout in the local demo and the standalone WordPress bundle.
// No caller-controlled filename/URL and no fallback to a different decor.
export function decorImageUrl(id,{thumbnail=false}={}){
 const decor=decorById(id);
 if(!decor)throw new Error('Unbekanntes Dekorbild.');
 const url=new URL('./decors/'+(thumbnail?decor.thumbnailFilename:decor.imageFilename),import.meta.url);
 const version=new URL(import.meta.url).searchParams.get('v');
 if(version)url.searchParams.set('v',version);
 return url.href;
}
