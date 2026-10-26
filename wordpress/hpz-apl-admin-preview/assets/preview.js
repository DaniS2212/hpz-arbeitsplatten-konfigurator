import {normalize} from './core/config.js?v=0.4.0';
import {geometry} from './core/geometry.js?v=0.4.0';
import {resolveProduct} from './core/products.js?v=0.4.0';
// Visual validation only. Never an offer, price calculation or purchase permission.
export async function preview(raw) {
  const product=resolveProduct(raw);
  if(product.family!==raw.product)throw new Error('Produktfamilie passt nicht zum Produkt.');
  const config=normalize(raw);
  return {config,geometry:geometry(config),quote:{purchasable:false,referenceMatched:false,ruleVersion:'admin-visual-only'}};
}
