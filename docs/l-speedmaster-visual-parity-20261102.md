# Speedmaster-Formtreue für L1–L4: Referenzmatrix und Prüfverfahren
Stand 02.11.2026 · Kundenhinweis: **nur Admin-Testvorschau**, keine Freigabe zum Verkauf, kein CNC-Export.

## Warum dieser PR
Beim Abgleich von Holzplatten-Zuschnitt mit Speedmaster fiel auf, dass das bisherige Modell L-/B-Eckparameter starr auf X/Y abbildete, eine **künstliche runde Bézierkurve** bei »Abgeschrägt – Vorderkante durchlaufend« verwendete und Maßschilder über die Holzfläche schob. Gerade **darf nicht** die L-Fertigung definieren; wiederverwendbar sind nur UI-/SVG-Qualitätsregeln, nicht deren spezifische L2/B2-Achsen.

## Maßachsen je L-Form
**Verifiziert direkt durch den Nutzer:** L1, linke untere Außenecke: `L3` vertikale Schenkellänge; `B3` horizontale Schenkelbreite. Die Aufnahme zeigte zuvor L3 horizontal/B3 vertikal, was falsch war.

Die übrigen Zuordnungen sind aktuell **physikalisch aus Schenkelrichtung und Spiegelung abgeleitet** und ausdrücklich noch **keine einzeln bestätigten Speedmaster-Maßzuweisungen**. Die Nutzerbilder mit je 150 mm auf beiden Achsen können eine Verwechslung naturgemäß nicht beweisen oder ausschließen.

| Form | Gewählte Außenecke | Physischer Eckpunkt (mm) | L-Achse | B-Achse | Belegstand |
| --- | --- | --- | --- | --- | --- |
| L1 | links | (B1, L2) | L3 vertikal | B3 horizontal | Nutzerbestätigung 02.11.2026 |
| L1 | rechts | (L1, B2) | L4 horizontal | B4 vertikal | plausible Ausrichtung, Einzeländerung fehlt |
| L2 | links | (0, B2) | L3 horizontal | B3 vertikal | Spiegelung, Einzeländerung fehlt |
| L2 | rechts | (L1, L2) | L4 vertikal | B4 horizontal | Spiegelung, Einzeländerung fehlt |
| L3 | links | (B1, L2) | L5 vertikal | B5 horizontal | Schenkelausrichtung, Einzeländerung fehlt |
| L3 | rechts | (L1, B2) | L6 horizontal | B6 vertikal | Schenkelausrichtung, Einzeländerung fehlt |
| L4 | links | (B1, L2) | L5 vertikal | B5 horizontal | Schenkelausrichtung, Einzeländerung fehlt |
| L4 | rechts | (L1, B2) | L6 horizontal | B6 vertikal | Schenkelausrichtung, Einzeländerung fehlt |

**Wichtig:** Grundmaß `B5` bei L4 (Diagonalenabstand) und Eckmaß `corner-B5` sind **verschiedene Parameter**, die niemals miteinander verbunden werden dürfen. Die L4-45°-Außenprojektion ist weiterhin unbestätigt.

## Bearbeitung »eckig« vs. »Vorderkante durchlaufend«
- Die bereitgestellten Speedmaster-Bilder zeigen für **beide** Varianten eine **gerade Schrägkante**, nicht die bisher gezeichnete runde Kontur. Deswegen zeichnet das SVG jetzt für beide eine lineare Abschrägung; eine echte Rundung wird ausschließlich bei »Abgerundet« gezeichnet.
- Bei »Vorderkante durchlaufend« unterscheidet sich möglicherweise der tatsächliche **Kantenverlauf bzw. Übergang**. Dessen exakte physische Ausführung ist aus den vorhandenen Ansichten noch nicht bestätigt. **Keine** CNC-Aussage aus der ähnlich aussehenden Draufsicht ableiten.
- Das kleine L-Auswahlsymbol zeigt ebenfalls eine **gerade Diagonale**. Die alte, für die fertig geprüfte Gerade verwendete Sonderdarstellung bleibt unangetastet.

## Automatische Geometrie- und Browserkontrollen
- 4 Formen × 10 auswählbare Eckzustände = **40 geometrische Zustände**, darunter alle Seiten und Bearbeitungsarten. Die Regression prüft geschlossene Kontur, gültige Maße, sichtbare zugehörige Abschrägungen, keine vorgetäuschte Preis-/Fertigungsfreigabe.
- **Nicht gleiche L/B-Maße** (z. B. `L3=240 mm`, `B3=120 mm`) entlarven eine sonst unbemerkte Achsvertauschung.
- Chromium rendert L1/L2 mit 2 Abschrägungsarten auf Desktop und Mobilgerät. Er prüft die Formpfade, die Auswahlgrafik, die Position der B1/B3/L3-Textschilder im **freien Außenbereich**, Kollisionen, horizontales Überlaufen und den gesperrten Warenkorb. **Gerenderte Screenshots** werden im GitHub-CI-Job als `l-speedmaster-visual-review` bereitgestellt.
- Dieser Test beweist geometrische *Konsistenz der eigenen Anzeige*, aber **noch keine 1:1-Fertigungstreue** zu Speedmaster. Dafür werden unabhängige Referenzbilder benötigt.

## Genau benötigte, noch nicht abgedeckte Speedmaster-Belege
1. **Ein Vorher/Nachher-Paar mit ungleichen Eckwerten** für L1 links, z. B. L3=240 mm, B3=120 mm, gleiche sonstige Grundkonfiguration. Maßpfeile und Frontend müssen zu sehen sein.
2. **L2 links und rechts**: jeweils eine Speedmaster-Draufsicht mit ungleichen L3/B3 bzw. L4/B4 (nicht beide 150 mm), um die Spiegelungsannahme eindeutig zu bestätigen.
3. **L3 und L4**: je ein Bild mit **ungleichen L5/B5** und eines mit **ungleichen L6/B6**, damit die Achsen nicht nur aus dem Spiegelbild abgeleitet werden.
4. **Gleiche L1-Konfiguration, gleiche Maße, gleiches Dekor:** einmal »eckig abgeschrägt«, einmal »Vorderkante durchlaufend«. Je eine **Draufsicht und schräge 3D-Nahaufnahme** der beiden Ecken. So klären wir den wirklichen Kontur-/Kantenunterschied, statt erneut eine runde Kontur zu erfinden.
5. **L4-Grundmaß B5 einzeln ändern**, alles andere gleich. Das ist erforderlich für die unabhängige Bestätigung der äußeren Diagonale.

## Abnahmeschritte für die nächsten PRs
1. Original-Konfiguration → dokumentierter Parameterdatensatz mit mm-Werten und Quelle/Datum.
2. Speedmaster-Referenzbild als eigener Review-Beleg (nicht allein unsere generierte Vorschau).
3. Geometrieabgleich der **vier Eckpunkte und aller relevanten Maße**, mit bewusst ungleichen L/B-Werten.
4. Bildvergleich als menschliche Sichtprüfung: Silhouette, Ecken, Kanten, Fugen, Maßschilder, Desktop und Mobil.
5. Abweichung → reproduzierender Test → kleinste Quellkorrektur → CI. Keine pauschale Freigabe.
6. Erst **separat** nach echtem Lieferantennachweis: Fertigungsdefinition, Preisformel, Versand/Teile und WooCommerce.

Dieser PR ändert keine Produktfreigabe, keine Gerade, keine U-Form, keine Preiskalkulation und keinen automatischen Updater.
