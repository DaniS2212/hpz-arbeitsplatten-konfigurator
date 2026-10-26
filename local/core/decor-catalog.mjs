/**
 * 16 Schichtstoff-Arbeitsplattendekore: fachlicher Datenkatalog, noch keine Shopfreigabe.
 * Quelle der Bestellbezeichnungen: https://www.speedmaster.at/dekore/arbeitsplatten-schichtstoff/
 *
 * IDs W980/H1145 bleiben kompatibel mit dem bisherigen Zweierkatalog.
 * Kundenoberflaeche: nur displayName. Lieferantencodes bleiben intern.
 * sourceFilename, imageFilename und thumbnailFilename dokumentieren die 16 bereitgestellten Originale und WebP-Dateien.
 * Dateien liegen noch nicht im GitHub-Branch; Bildpaket ist separat fuer Work vorbereitet.
 * Keine Preise, Verfuegbarkeits-, Fertigungs- oder Warenkorbfreigaben in dieser Datei.
 */
export const DECOR_CATALOG_VERSION = '1.1';
export const DECOR_CATEGORIES = Object.freeze({
  uni: 'Uni', holz: 'Holzoptik', stein: 'Stein & Marmor',
  beton: 'Beton', metall: 'Metalloptik'
});
export const DECOR_CATALOG = Object.freeze([
  Object.freeze({"id":"W980","supplierCode":"W980 ST7","supplierName":"Platinweiss","displayName":"Platinweiß","manufacturer":"EGGER","category":"uni","imageKey":"W980_ST7","sourceFilename":"3002-Weiss.jpg","imageFilename":"W980.webp","thumbnailFilename":"W980-thumb.webp"}),
  Object.freeze({"id":"U999","supplierCode":"U999 ST76","supplierName":"Schwarz","displayName":"Schwarz","manufacturer":"EGGER","category":"uni","imageKey":"U999_ST76","sourceFilename":"U999-ST76-Schwarz.jpg","imageFilename":"U999.webp","thumbnailFilename":"U999-thumb.webp"}),
  Object.freeze({"id":"H1145","supplierCode":"H1145 ST10","supplierName":"Bardolino Eiche","displayName":"Bardolino Eiche","manufacturer":"EGGER","category":"holz","imageKey":"H1145_ST10","sourceFilename":"1010-Bardolino-Eiche.jpg","imageFilename":"H1145.webp","thumbnailFilename":"H1145-thumb.webp"}),
  Object.freeze({"id":"H3303","supplierCode":"H3303 ST10","supplierName":"Eiche Arlington","displayName":"Arlington Eiche","manufacturer":"EGGER","category":"holz","imageKey":"H3303_ST10","manufacturerName":"Hamilton Eiche natur","sourceFilename":"1008-Eiche-Arlington.jpg","imageFilename":"H3303.webp","thumbnailFilename":"H3303-thumb.webp"}),
  Object.freeze({"id":"F021","supplierCode":"F021 ST75","supplierName":"Triestino Terrazzo grau","displayName":"Terrazzo grau","manufacturer":"EGGER","category":"stein","imageKey":"F021_ST75","sourceFilename":"F021-ST75-Triestino-Terrazzo-grau.jpg","imageFilename":"F021.webp","thumbnailFilename":"F021-thumb.webp"}),
  Object.freeze({"id":"F095","supplierCode":"F095 ST87","supplierName":"Lucano","displayName":"Marmor grau","manufacturer":"EGGER","category":"stein","imageKey":"F095_ST87","manufacturerName":"Siena Marmor grau","sourceFilename":"2025-Lucano.jpg","imageFilename":"F095.webp","thumbnailFilename":"F095-thumb.webp"}),
  Object.freeze({"id":"F121","supplierCode":"F121 ST87","supplierName":"Metal Rock anthrazit","displayName":"Metall anthrazit","manufacturer":"EGGER","category":"metall","imageKey":"F121_ST87","sourceFilename":"F121-ST87-Metal-Rock-anthrazit.jpg","imageFilename":"F121.webp","thumbnailFilename":"F121-thumb.webp"}),
  Object.freeze({"id":"F128","supplierCode":"F128 PA","supplierName":"Ambiance Granite schwarz","displayName":"Granit schwarz","manufacturer":"EGGER","category":"stein","imageKey":"F128_PA","sourceFilename":"F128-PA-Ambiance-Granite-schwarz.jpg","imageFilename":"F128.webp","thumbnailFilename":"F128-thumb.webp"}),
  Object.freeze({"id":"F186","supplierCode":"F186 ST9","supplierName":"Chicago Concrete hellgrau","displayName":"Beton hellgrau","manufacturer":"EGGER","category":"beton","imageKey":"F186_ST9","sourceFilename":"F186-ST9-Chicago-Concrete-hellgrau.jpg","imageFilename":"F186.webp","thumbnailFilename":"F186-thumb.webp"}),
  Object.freeze({"id":"F235","supplierCode":"F235 ST76","supplierName":"Natural slate","displayName":"Schiefer natur","manufacturer":"EGGER","category":"stein","imageKey":"F235_ST76","manufacturerName":"Scivaro Schiefer","sourceFilename":"2021-Natural-slate.jpg","imageFilename":"F235.webp","thumbnailFilename":"F235-thumb.webp"}),
  Object.freeze({"id":"F302","supplierCode":"F302 ST87","supplierName":"Ferro bronze","displayName":"Bronze","manufacturer":"EGGER","category":"metall","imageKey":"F302_ST87","sourceFilename":"F302-ST87-Ferro-bronze.jpg","imageFilename":"F302.webp","thumbnailFilename":"F302-thumb.webp"}),
  Object.freeze({"id":"F629","supplierCode":"F629 ST16","supplierName":"Dark gold Metal","displayName":"Metall gold","manufacturer":"EGGER","category":"metall","imageKey":"F629_ST16","manufacturerName":"Metal Slate schwarzgold","sourceFilename":"2016-Dark-gold-Metal.jpg","imageFilename":"F629.webp","thumbnailFilename":"F629-thumb.webp"}),
  Object.freeze({"id":"F661","supplierCode":"F661 ST76","supplierName":"Calcit Stone sandbeige","displayName":"Sandbeige","manufacturer":"EGGER","category":"stein","imageKey":"F661_ST76","sourceFilename":"F661-ST76-Calcit-Stone-sandbeige-1.jpg","imageFilename":"F661.webp","thumbnailFilename":"F661-thumb.webp"}),
  Object.freeze({"id":"F812","supplierCode":"F812 ST9","supplierName":"Levanto Marmor weiss","displayName":"Marmor weiß","manufacturer":"EGGER","category":"stein","imageKey":"F812_ST9","sourceFilename":"F812-ST9-Levanto-Marmor-weiss.jpg","imageFilename":"F812.webp","thumbnailFilename":"F812-thumb.webp"}),
  Object.freeze({"id":"44375","supplierCode":"44375 DP","supplierName":"Beton Art Perlgrau","displayName":"Perlgrau","manufacturer":"KAINDL","category":"beton","imageKey":"44375_DP","sourceFilename":"44375-DP-BetonArtPerlgrau_Ganzformatplatte.jpg","imageFilename":"44375.webp","thumbnailFilename":"44375-thumb.webp"}),
  Object.freeze({"id":"44405","supplierCode":"44405 DP","supplierName":"Beton Art Schiefergrau","displayName":"Schiefergrau","manufacturer":"KAINDL","category":"beton","imageKey":"44405_DP","sourceFilename":"44405-DP-Beton-Art-Schiefergrau.jpg","imageFilename":"44405.webp","thumbnailFilename":"44405-thumb.webp"})
]);
export function decorById(id) {
  return DECOR_CATALOG.find(decor => decor.id === id) ?? null;
}
export function decorBySupplierCode(code) {
  return DECOR_CATALOG.find(decor => decor.supplierCode === code) ?? null;
}
