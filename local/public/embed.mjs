import {mountConfigurator} from './component.mjs';
import {resolveProduct} from '../core/products.mjs';
const params=new URLSearchParams(location.search);
try{
 const product=resolveProduct(params.has('sku')?{sku:params.get('sku')}:{productId:params.get('productId')||1000083});
 document.getElementById('product-title').textContent='Küchenarbeitsplatte nach Maß – '+product.label;
 document.getElementById('sku').textContent='Artikelnummer: '+product.sku+' · ID '+product.productId;
 document.getElementById('product-image').setAttribute('d',({straight:'M30 70 H470 V170 H30 Z',l:'M30 30 H470 V110 H120 V210 H30 Z',u:'M30 30 H470 V210 H380 V110 H120 V210 H30 Z'})[product.family]);
 mountConfigurator(document.getElementById('hpz-embedded'),{...product,presentationMode:'embedded'});
}catch(e){const error=document.getElementById('mount-error');error.hidden=false;error.textContent=e.message;}
