# PR #40 – Speedmaster-Grenzfälle für L-Abschrägungen

Stand 02.11.2026. **Nur eine Korrektur der Admin-Vorschau, weder Herstellerfreigabe noch Checkout.**

## Direkte Nachweise aus dem Originalarchiv

Datei: `docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip`.
Alle Pfade beziehen sich auf `speedmaster-reference-20261102/originals/` innerhalb des ZIP. `SOURCE_MANIFEST.csv` dokumentiert die SHA-256-Werte.

| Speedmaster-Bild | Konfiguration im Screenshot | Aus dem Eingabeformular lesbare Abstandsgrenzen (mm) | Status |
| --- | --- | --- | --- |
| `block-06/image(20261102-115001).png` | L1, beidseitig eckig, L1=2000, L2=1200, B1=B2=600 | L3 **60–550**, B3 **60–600**, L4 **60–1350**, B4 **60–600** | direkt am Herstellerbild ablesbar |
| `block-06/image(20261102-115024).png` | L2, beidseitig, Vorderkante durchlaufend, L1=2000, L2=1200, B1=B2=600 | L3 **60–1350**, B3 **60–2000**, L4 **60–550**, B4 **60–600** | direkt am Herstellerbild ablesbar |
| `block-03/image(20261102-114354).png` | L3, beidseitig, Vorderkante durchlaufend, L1=L2=2000, B1/B2=600, B3/B4=900 | L5 **60–1050**, B5 (Ecke) **60–600**, L6 **60–1050**, B6 **60–600** | direkt am Herstellerbild ablesbar |
| `block-03/image(20261102-114510).png` | L4, beidseitig eckig, L1=L2=2000, B1/B2=600, B3/B4=900, B5 (Grundmaß)=600 | L5 **60–1050**, B5 (Ecke) **60–600**, L6 **60–1050**, B6 **60–600** | direkt am Herstellerbild ablesbar |

Die Screenshots sind **Beispiele für genau diese Maße und Bearbeitungen**, nicht für alle Form-/Stärken-/Dekor-Kombinationen. Der vom Anbieter angezeigte Maximalwert kann sich dynamisch ändern.

## Nachgewiesene Fehler vor PR #40

1. `validateLCorner` ließ Abschrägungsmaße **10–50 mm** zu, obwohl die fotografierten Speedmaster-Abstandsfelder einen Mindestwert von **60 mm** zeigen.
2. Die pauschale Obergrenze **1000 mm** blockierte belegte längere Abschrägungen: L1 L4=1200 mm, L2 L3=1200 mm, L3 L5=1050 mm und L4 L6=1050 mm (je nach Seite).
3. Beide Eingabefehler betrafen `chamfer_square` und `chamfer_continuous`. R1/R2 sind eigenständige Rundungswerte und wurden nicht entsprechend umgedeutet.

## Korrektur

- **Abschrägungen**: 60 mm als screenshotbelegte Untergrenze; großzügige rein technische Vorschau-Obergrenze von 2000 mm, statt falscher 1000-mm-Sperre.
- **Zusätzlich** gilt weiterhin die unveränderte geometrische Restkantenprüfung in `lGeometry`. Nicht darstellbare Kombinationen werden abgewiesen.
- **Rundungen**: Verhalten unverändert (10–1000 mm in der Vorschau), weil eine eigenständige Herstellergrenze R1/R2 noch nicht belegt ist.
- Die 2000-mm-Vorschaugrenze ist **ausdrücklich keine bestätigte Speedmaster-Herstellervorgabe**. Unterschiedliche dynamische Maxima und Grenzfälle mit exakt aufgehobener Restkante brauchen weitere kontrollierte Belege.
- Im WordPress-Bundle wird derselbe gültige Code gespiegelt; keine Material-, Preis-, Shop-, CNC-, Versand- oder Freigabeänderung.

## Wiederholbare Regression

`node --test local/test/l-speedmaster-chamfer-minimum-20261102.test.mjs`

Abdeckung: L1–L4, beide Abschrägungsarten, vier einzelne Eckmaßfelder pro L-Typ, 50 mm muss abgewiesen/60 mm akzeptiert werden, vier belegte über-100-cm-Beispiele müssen korrekt gezeichnet werden, Rundungen bleiben unverändert, Fertigungs-/Verkaufsdaten bleiben gesperrt.

**Rote Erstprüfung:** GitHub CI vor dem Fix meldete bei genau diesen zwei neuen Tests die erwarteten Fehler (`Missing expected exception … 50 mm` und `corner-L4 … zwischen 1 und 100`). Nach Quellkorrektur müssen die vollständigen GitHub-Checks erneut grün sein.

## Offen für den nächsten Geometrie-PR

- Dynamische Grenzformeln, auch Fälle mit Abschrägung exakt am Endpunkt einer Kante;
- L4-B5-Grundmaß mit isolierter Einzeländerung (noch kein unabhängiger Nachweis);
- tatsächliche gerundete Kantenradien und Fertigungs-/Fräsprofile;
- visuelle Referenz-gegen-Preview-Abnahme mit allen Kontur- und Beschriftungskollisionen.

Die bisherigen mehrteiligen L-Darstellungen bleiben orientierende Skizzen; sie werden durch diese Grenzkorrektur nicht zu echten Fertigungsplänen.
