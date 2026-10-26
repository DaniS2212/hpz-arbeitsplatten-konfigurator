/**
 * 16 Schichtstoff-Arbeitsplattendekore: fachlicher Datenkatalog, noch keine Shopfreigabe.
 * Quelle der Bestellbezeichnungen: https://www.speedmaster.at/dekore/arbeitsplatten-schichtstoff/
 *
 * IDs W980/H1145 bleiben kompatibel mit dem bisherigen Zweierkatalog.
 * imageKey reserviert nur den spaeteren lokalen Assetnamen; Bilder sind NICHT enthalten.
 * Keine Preise, Verfuegbarkeits-, Fertigungs- oder Warenkorbfreigaben in dieser Datei.
 */
export const DECOR_CATALOG_VERSION = '1.0';
export const DECOR_CATEGORIES = Object.freeze({
  uni: 'Uni', holz: 'Holzoptik', stein: 'Stein & Marmor',
  beton: 'Beton', metall: 'Metalloptik'
});
export const DECOR_CATALOG = Object.freeze([
  Object.freeze({"id":"W980","supplierCode":"W980 ST7","supplierName":"Platinweiss","displayName":"Platinweiß","manufacturer":"EGGER","category":"uni","imageKey":"W980_ST7"}),
  Object.freeze({"id":"U999","supplierCode":"U999 ST76","supplierName":"Schwarz","displayName":"Schwarz","manufacturer":"EGGER","category":"uni","imageKey":"U999_ST76"}),
  Object.freeze({"id":"H1145","supplierCode":"H1145 ST10","supplierName":"Bardolino Eiche","displayName":"Bardolino Eiche","manufacturer":"EGGER","category":"holz","imageKey":"H1145_ST10"}),
  Object.freeze({"id":"H3303","supplierCode":"H3303 ST10","supplierName":"Eiche Arlington","displayName":"Eiche Arlington","manufacturer":"EGGER","category":"holz","imageKey":"H3303_ST10","manufacturerName":"Hamilton Eiche natur"}),
  Object.freeze({"id":"F021","supplierCode":"F021 ST75","supplierName":"Triestino Terrazzo grau","displayName":"Triestino Terrazzo grau","manufacturer":"EGGER","category":"stein","imageKey":"F021_ST75"}),
  Object.freeze({"id":"F095","supplierCode":"F095 ST87","supplierName":"Lucano","displayName":"Lucano","manufacturer":"EGGER","category":"stein","imageKey":"F095_ST87","manufacturerName":"Siena Marmor grau"}),
  Object.freeze({"id":"F121","supplierCode":"F121 ST87","supplierName":"Metal Rock anthrazit","displayName":"Metal Rock anthrazit","manufacturer":"EGGER","category":"metall","imageKey":"F121_ST87"}),
  Object.freeze({"id":"F128","supplierCode":"F128 PA","supplierName":"Ambiance Granite schwarz","displayName":"Ambiance Granite schwarz","manufacturer":"EGGER","category":"stein","imageKey":"F128_PA"}),
  Object.freeze({"id":"F186","supplierCode":"F186 ST9","supplierName":"Chicago Concrete hellgrau","displayName":"Chicago Concrete hellgrau","manufacturer":"EGGER","category":"beton","imageKey":"F186_ST9"}),
  Object.freeze({"id":"F235","supplierCode":"F235 ST76","supplierName":"Natural slate","displayName":"Natural Slate","manufacturer":"EGGER","category":"stein","imageKey":"F235_ST76","manufacturerName":"Scivaro Schiefer"}),
  Object.freeze({"id":"F302","supplierCode":"F302 ST87","supplierName":"Ferro bronze","displayName":"Ferro Bronze","manufacturer":"EGGER","category":"metall","imageKey":"F302_ST87"}),
  Object.freeze({"id":"F629","supplierCode":"F629 ST16","supplierName":"Dark gold Metal","displayName":"Dark Gold Metal","manufacturer":"EGGER","category":"metall","imageKey":"F629_ST16","manufacturerName":"Metal Slate schwarzgold"}),
  Object.freeze({"id":"F661","supplierCode":"F661 ST76","supplierName":"Calcit Stone sandbeige","displayName":"Calcit Stone sandbeige","manufacturer":"EGGER","category":"stein","imageKey":"F661_ST76"}),
  Object.freeze({"id":"F812","supplierCode":"F812 ST9","supplierName":"Levanto Marmor weiss","displayName":"Levanto Marmor weiß","manufacturer":"EGGER","category":"stein","imageKey":"F812_ST9"}),
  Object.freeze({"id":"44375","supplierCode":"44375 DP","supplierName":"Beton Art Perlgrau","displayName":"Beton Art Perlgrau","manufacturer":"KAINDL","category":"beton","imageKey":"44375_DP"}),
  Object.freeze({"id":"44405","supplierCode":"44405 DP","supplierName":"Beton Art Schiefergrau","displayName":"Beton Art Schiefergrau","manufacturer":"KAINDL","category":"beton","imageKey":"44405_DP"})
]);
export function decorById(id) {
  return DECOR_CATALOG.find(decor => decor.id === id) ?? null;
}
export function decorBySupplierCode(code) {
  return DECOR_CATALOG.find(decor => decor.supplierCode === code) ?? null;
}
