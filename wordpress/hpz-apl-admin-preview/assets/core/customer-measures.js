import {cmToMm} from './config.js?v=0.6.0';

// Only the presentation boundary uses centimetres. The V2 request and price
// engine continue to receive integer millimetres.
export function cmInputToMmText(value){return String(cmToMm(value));}
export function mmToCmText(value){
  if(!Number.isSafeInteger(value)||value<0)throw new Error('Ungültiges Millimetermaß.');
  const whole=Math.trunc(value/10),fraction=value%10;
  return fraction?`${whole},${fraction}`:String(whole);
}
export function cmRange(min,max,step){return `${mmToCmText(min)}–${mmToCmText(max)} cm · ${mmToCmText(step)}-cm-Schritte`;}
export function customerMeasureError(error){
  if(error===null||error===undefined)return '';
  const message=error instanceof Error?error.message:String(error);
  return message.replace(/\b(\d+)\s*[×x]\s*(\d+)\s*mm\b/g,(_,a,b)=>`${mmToCmText(Number(a))} × ${mmToCmText(Number(b))} cm`)
    .replace(/\b(\d+)\s*[–-]\s*(\d+)\s*mm\b/g,(_,a,b)=>`${mmToCmText(Number(a))}–${mmToCmText(Number(b))} cm`)
    .replace(/\b(\d+)-mm\b/g,(_,n)=>`${mmToCmText(Number(n))}-cm`)
    .replace(/(?<![.,])\b(\d+)\s*mm\b/g,(_,n)=>`${mmToCmText(Number(n))} cm`)
    .replace('als ganze Millimeter eingeben, zum Beispiel 2000','in cm mit höchstens einer Nachkommastelle eingeben, zum Beispiel 200 oder 200,1');
}
