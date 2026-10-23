export const products=Object.freeze([
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
