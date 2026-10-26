# Phase A1.1 – Eckvorschau 0.3.0, 26.10.2026

Fortsetzung von 0.2.0 / `16b2056` auf `feature/a1-1-corners-mm-ux`.
Dieses Dokument ersetzt für den aktuellen Vorschauumfang die Einschränkungen
aus `phase-a1-evidence.md`. Das alte Dokument bleibt als historischer Nachweis
erhalten. Keine Fertigungs-, Preis- oder Verkaufsfreigabe.

## Zehn funktionsfähige Vorschauzustände

| Seite | Bearbeitung | Maßfelder | Vorschau |
|---|---|---|---|
| Keine | keine | L1, B1 | Rechteck |
| Vorne links | abgerundet | R1 | echter Viertelkreisbogen |
| Vorne rechts | abgerundet | R2 | gespiegelter Viertelkreisbogen |
| Beide vorderen Ecken | abgerundet | R1, R2 | unabhängig einstellbare Kreisbögen |
| Vorne links | abgeschrägt, eckig | L2, B2 | gerade Diagonale |
| Vorne rechts | abgeschrägt, eckig | L3, B3 | gespiegelte Diagonale |
| Beide vorderen Ecken | abgeschrägt, eckig | L2, B2, L3, B3 | unabhängige Diagonalen |
| Vorne links | abgeschrägt, durchlaufend | L2, B2 | weichere Übergänge, schematisch |
| Vorne rechts | abgeschrägt, durchlaufend | L3, B3 | gespiegelte schematische Übergänge |
| Beide vorderen Ecken | abgeschrägt, durchlaufend | L2, B2, L3, B3 | unabhängige schematische Übergänge |

Vorderkante unten. L2/L3 messen entlang der Vorderkante, B2/B3 entlang der
linken/rechten Seite. Bezug der weichen Übergänge ist die ungerundete
Schnittkontur; es werden keine exakten Fertigungsradien angegeben.
Alle Zustände bleiben nicht bestellbar, auch bei passendem Preisreferenzpunkt.

## Quellen und Reichweite

Die vier unverändert kopierten Originalbilder liegen unter
`docs/references/speedmaster-a1-1/`:

| Datei | Sichtbare Beobachtung |
|---|---|
| `left-chamfer-square-2000x600-L150-B150.png` | Links eckig, 2000 × 600, L2/B2 jeweils 150, L2-Maximum 211,5; gerade Diagonale vorne links |
| `left-chamfer-continuous-2000x600-L200-B300.png` | Links durchlaufend, L2 200/B2 300; weichere Übergänge; angezeigte Maxima 1950/550 |
| `both-chamfer-square-2000x600-L150-B150.png` | Beide Seiten eckig, vier unabhängige Felder; auch rechts L3-Maximum 211,5 bei B3 150 |
| `both-chamfer-continuous-2000x600-L150-B150.png` | Beide Seiten durchlaufend, vier Felder; angezeigte Maxima L2/L3 1950 und B2/B3 550 |

Die Screenshots zeigen APL 17,5 mm / W980 ST7 / Dickkante 1,5 mm.
Ihre angezeigten Grundgrenzen 200–3010 bzw. 200–1260 mm sind kein Nachweis
derselben Fertigungsgrenzen für APL 38 mm, andere Dekore oder andere Varianten.
Die darin sichtbaren Preise werden nicht in die Preisengine übernommen.

Zusätzlich hat der Nutzer den Zusammenhang `L_max = 1,41 × B` aus mehreren
Abfragen bestätigt, einschließlich B2 200 → L2 max. 282. Für die rechte Seite
liegt die entsprechende gespiegelte Beobachtung bei B3 150 vor. Eine allgemeine
Lieferantenfreigabe für alle Werte wird daraus nicht abgeleitet.

## Eigene konservative Vorschaugrenzen

Diese Regeln sind **Shop-Vorschaupolitik**, keine behaupteten Speedmaster-
Fertigungsregeln. Ungültige Werte sperren die Vorschau und entfernen eine alte
Kontur; sie werden nicht still korrigiert oder gerundet.

- Alle sichtbaren Maße in mm. L1/B1 sowie gemeinsame L/U-Plattenfelder: ganze
  Millimeter. Eckmaße in 10-mm-Schritten. Allgemeine technische Schutzgrenze
  1–100000 mm ist keine Lieferantengrenze.
- Rundungen: mindestens 10 mm; nur R1 einseitig bei 2000 × 600 mm mindestens
  50 mm entsprechend dem belegten Fall 50–599. Maximal der auf 10 mm abgerundete
  kleinere Wert aus `B1 − 1` und `L1 − Gegenradius − 50`. Bei 2000 × 600 mm
  daher höchstens 590 mm. Mindestens 50 mm gerade Vorderkante bleibt erhalten.
  Für weitere Größen/R2/beidseitig sind dies geometrische Vorschaugrenzen.
- Eckige Abschrägung: eigener Prüfbereich L1 200–3010, B1 200–1260 mm;
  Sondermaße mindestens 60 mm. B2/B3 höchstens `B1 − 50`, abgerundet auf 10 mm.
  L2/L3 höchstens der kleinere Wert aus `1,40 × zugehörigem B` und
  `L1 − gegenüberliegendem L − 50`, abgerundet auf 10 mm.
  Beispiele B=150 → L≤210; B=200 → L≤280; B=300 → L≤420 mm.
  Beidseitige Überlappung und weniger als 50 mm gerade Vorderkante sind gesperrt.
- Durchlaufende Abschrägung: vorerst ausschließlich L1=2000, B1=600 mm.
  L2/L3 60–500, B2/B3 60–300 mm, jeweils 10-mm-Schritte. Dazu die gegenseitige
  Prüfung und mindestens 50 mm Reststrecke. Das ist bewusst enger als die
  angezeigten Lieferantenmaxima 1950/550. Eine Änderung der Plattengröße wird
  nicht automatisch rückgängig gemacht; sie zeigt eine klare Sperrmeldung.
- Bearbeitungswechsel: nur Sondermaße zurücksetzen (R=100, L/B=150 mm).
  Plattenmaße bleiben erhalten. Nicht passende alte Sonderfelder werden entfernt.

## Bedeutung der schematischen Kontur

Eckige Abschrägungen verwenden zwei eindeutig bemaßte Endpunkte einer geraden
Diagonale. Ihre Vorschaufläche berücksichtigt die abgeschnittenen Dreiecke.
Durchlaufende Abschrägungen verwenden dieselben bemaßten Bezugspunkte, aber
sichtbar weichere, bildschirmbezogene quadratische Übergänge. Diese sind reine
Darstellung, keine Kreisradien und kein Fertigungs- oder Fräsdatensatz.
`contourStatus` bleibt `schematic`, `areaMm2` ausdrücklich `null`.
`supplierMappingVerified` bleibt für sämtliche Varianten `false`;
`shippingParts` und `joints` bleiben ungeprüft/`null`.

## Noch gezielt benötigte technische Nachweise

1. Durchlaufend: exakte Übergangskonstruktion, Radius-/Tangentenbezug und
   Definition, auf welche Punkte L2/B2/L3/B3 als Fertigmaße verweisen.
2. Allgemeine und materialabhängige Grenzregeln für Rundungen und Abschrägungen,
   einschließlich APL 38 mm, abweichender Grundmaße sowie beidseitiger Abhängigkeit.
3. Gespiegelte eckige Abschrägung: weitere rechte Grenzpunkte (z. B. B3=200/300)
   zur späteren allgemeinen Fertigungsprüfung; aktuelle Vorschau bleibt konservativ.
4. Gültigkeit der festgelegten Dickkante an allen bearbeiteten Strecken,
   Verfügbarkeit der Dekore je Material und Bestätigung der tatsächlichen
   Versandteile/Fertigmaße. Keine Rückschlüsse aus L/U-Gesamtmaßen.
5. Prüfung der neuen Version in echter WordPress-/Flatsome-/WCPA-Laufzeit durch
   Nutzer/Marco und anschließend auf physischen Smartphones.

## Prüfung und Abnahme

85 Node-Tests: alle bisherigen 61 erhalten, 22 neue Geometrie-/Einheitenfälle
und zwei zusätzliche HTTP-/Paketfälle. 46 Browser-Funktionsprüfungen,
12 bestehende Komponenten-Isolations-/Lebenszyklusprüfungen,
vier bisherige responsive Fälle und zwölf neue Fälle
(360/390/1366/1440 px × Rundung/eckig/durchlaufend) bestanden.
Siehe `a1-1-node-results.txt` und `a1-1-browser-results.txt`.
Alte cm-Tests prüfen weiterhin ausdrücklich den separaten Legacy-Vertrag;
neue Abschrägungen erfordern den expliziten mm-Vertrag Version 2.

Screenshots unter `docs/a1-1-*.jpg`: Desktop-Auswahl und beide Abschrägungsarten,
mobile Auswahl, Maße und beide Eckdetails. Desktop-Aufnahmen aus der lokalen
Paketansicht; Smartphone-Aufnahmen sind Ausschnitte eines unskalierten
390 × 844 px iframe mit lokalem Testheader. Kein physischer Smartphone-Test.
Touch-Tastatur/iOS-Fokuszoom sind durch ≥16-px-Eingaben vorbereitet, aber erst
auf einem echten Gerät abschließend prüfbar. Keine PHP-Laufzeit vorhanden.

Paket: `dist/hpz-apl-admin-preview-0.3.0.zip`, eigenständig ohne lokalen Server.
0.2.0 unverändert erhalten. PHP-Schutzlogik unverändert; nur Versionsangaben
angepasst. Keine Änderung an Preisregel V2, Preisengine, L/U-Konstruktion,
Checkout, vorhandenen Produkten oder Liveshop.
