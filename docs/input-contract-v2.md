# Maßeingabe Version 2 – ausdrücklich Millimeter

Ab Plugin 0.3.0 senden Demo und eingebettete Komponente ausschließlich:

```json
{
  "schemaVersion": 2,
  "inputUnit": "mm",
  "productId": 1000083,
  "product": "straight",
  "geometry": "straight",
  "corner": "square",
  "dimensions": {"L1": "2000", "B1": "600"},
  "straightCorner": {
    "side": "both",
    "treatment": "chamfer_square",
    "parameters": {"L2": "150", "B2": "150", "L3": "200", "B3": "150"}
  },
  "material": "APL17.5",
  "decor": "W980",
  "quantity": 1
}
```

`mmTextToMm` akzeptiert nur positive Ganzzahltexte, keine numerischen JSON-Werte,
Nachkommastellen, Dezimalkommas, Exponenten oder impliziten Einheitenwechsel.
Die technische Schutzgrenze ist 1–100000 mm. Normalisierung liefert
`schemaVersion:2, unit:'mm'` und ganzzahlige numerische Maße. Diese Ausgabe ist
ein anderes Format als die Texteingabe und wird nicht wieder als Rohpayload
normalisiert. Mengen bleiben echte JSON-Ganzzahlen von 1 bis 1000.

Für gerade Arbeitsplatten gilt `corner:'square'` im Eingang zusammen mit der
neuen expliziten `straightCorner`-Auswahl. Kein Mischen mit alten `special`-
Feldern. Die Normalisierung setzt `corner` passend zur Bearbeitung; deshalb
kann eine Abschrägung keinen Rechteck-Referenzpreis erben.
Parameterzuordnung und konservative Grenzen: `phase-a1-1-evidence.md`.

Für L/U werden dieselben physikalischen Maße nun ebenfalls als mm-Texte
übergeben, beispielsweise U1 `L1:'2500', L2:'1700', L3:'1800',
B1:'600', B2:'600', B3:'600'`. Der Geometriealgorithmus und die ungeprüfte
Lieferantenzuordnung dieser Familien bleiben unverändert.

## Kompatibilität ohne stillen Faktor 10

Fehlende Version oder `schemaVersion:1` behält den bisherigen **cm**-Vertrag.
`inputUnit` darf dabei fehlen oder `cm` sein. Beispiel: alter Wert `'200'`
bleibt 200 cm = 2000 mm. Es wird keine Einheit aus Größenwerten geraten.
Neue Abschrägungen werden für Legacy-cm-Eingaben ausdrücklich abgelehnt.
Vorhandene Legacy-Radien und Tests bleiben mit 1-mm-Auflösung erhalten.

Version 2 ohne `inputUnit:'mm'`, `inputUnit:'mm'` ohne Version 2 oder andere
Versionen werden abgelehnt. Version und Einheit sind als Paar erforderlich.
Es gibt keine automatische Migration gespeicherter Warenkörbe; derzeit besteht
ohnehin keine Bestellpersistenz. Künftige Adapter müssen zuerst den bekannten
Quellvertrag prüfen und dann ausdrücklich konvertieren.

Lokaler HTTP-Endpunkt prüft erneut; das Plugin enthält nur die lokale visuelle
JS-Prüfung. Beide bleiben nicht kaufbar. Die spätere PHP-Prüfung muss diesen
Vertrag unabhängig implementieren und gegen dieselben Sollwerte testen.
