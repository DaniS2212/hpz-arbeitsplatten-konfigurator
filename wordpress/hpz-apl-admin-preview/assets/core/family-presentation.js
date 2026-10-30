/** Customer-readable layout of the currently unverified L/U overview sketches. */
const layouts = {
  l: [
    {id:'top',title:'Obere Strecke',description:'Gesamtbreite und Tiefe der oberen Arbeitsfläche.',fields:[{id:'L1',label:'Gesamtbreite oben'},{id:'B1',label:'Tiefe oben'}]},
    {id:'left',title:'Linker Schenkel',description:'Gesamtlänge und Breite des linken Schenkels.',fields:[{id:'L2',label:'Gesamtlänge links'},{id:'B2',label:'Breite links'}]}
  ],
  u: [
    {id:'top',title:'Obere Strecke',description:'Gesamtbreite und Tiefe der oberen Arbeitsfläche.',fields:[{id:'L1',label:'Gesamtbreite oben'},{id:'B1',label:'Tiefe oben'}]},
    {id:'left',title:'Linker Schenkel',description:'Gesamtlänge und Breite des linken Schenkels.',fields:[{id:'L2',label:'Gesamtlänge links'},{id:'B2',label:'Breite links'}]},
    {id:'right',title:'Rechter Schenkel',description:'Gesamtlänge und Breite des rechten Schenkels.',fields:[{id:'L3',label:'Gesamtlänge rechts'},{id:'B3',label:'Breite rechts'}]}
  ]
};
export function familyDimensionGroups(family) {
  if(!Object.hasOwn(layouts,family))throw new Error('L-U-Familienskizze nicht vorhanden.');
  return layouts[family];
}
