# Kundenvorschau: Gerade-Maßlesbarkeit, durchlaufende Kante, Entfall Aufteilung (09.11.2026)

## Betreiberbeobachtungen (PR #80 bereits gemergt)

1. **Gerade:** B3 (rechte Abschrägungstiefe) verdeckt die volle Tiefenbemaßung B1. „Vorderkante“ liegt zu hoch und ragt sichtbar in das Holz. Der einzige Reiter „Draufsicht“ ist überflüssig.
2. **L/U:** Der optionale Reiter „Aufteilung“ bietet technische Hervorhebungen von Flächenteilen und Stoß A/B mit Buttons unter der Skizze. Das ist für Kundinnen und Kunden redundant und missverständlich. In Schritt 1 werden die Stoßrichtungen bei U1–U4 bereits ausgewählt, und die Fugen sind **in der normalen Draufsicht** sichtbar.
3. **Abgeschrägt / Kante durchlaufend:** Nahaufnahme aus Speedmaster zeigt einen **weich auslaufenden, ununterbrochenen Kantenübergang** an der Schräge (nicht nur dieselbe harte diagonale Kontur mit farbiger Linie). Exakter Rundungsradius und CNC-Kantenbearbeitung sind im Screenshot **nicht ablesbar**.

## Umsetzung

- Gerade: B1 auf separate rechte Maßspur, sobald eine rechte B3-Abschrägung existiert; SVG-Viewport im Sonderfall rechts etwas erweitert. B3 bleibt an seiner lokalen rechten Maßspur. „Vorderkante“ deutlich unter die echte Vorderkante versetzt.
- Alle Familien: **keine Kunden-Reiter Draufsicht/Aufteilung mehr**; normale Draufsicht bleibt fest. Die darunterliegenden Teilflächen-/Fugenwahlknöpfe sind nur grafische, für Kunden nutzlose Hervorhebungen und in der Nutzeransicht ausgeblendet. Intern bleiben Polygon- und Stoßmetadaten und technische Testfunktionen unverändert; keine Produktauswahl oder Rechnungsdaten betroffen.
- Gerade/L/U: Symbole zeigen **eckig = scharfe Kantenansätze**, **Kante durchlaufend = dezente Bogenübergänge zu/aus der diagonalen Kante**. Kein behaupteter CNC-Profilradius.
- U1–U4: zusätzlich wird die sichtbare Außenkontur der Variante `chamfer_continuous` bei den zwei Diagonalenden per sehr kleinen, rein grafischen quadratischen Kurven geglättet. Die numerischen mm-Bezugspunkte, U-Eckfelder, Preis- und Warenkorb-Metadaten ändern sich nicht. Erst rechteckige Basiskontur und danach Schenkel-Ecken wie bisher; keine neue fertigungstechnische Behauptung.
- U-Radien werden in der SVG als **R1/R2** statt `corner-R1/corner-R2` angezeigt. `data-field="corner-R1"` bleibt für die korrekte Verbindung zur Eingabe erhalten.

## Prüfungen

- Neuer echter WordPress-Browsertest bei **1366 und 390 px**: Kundentab und untere Fugenknöpfe nicht sichtbar, B1/B3-Labels kollisionsfrei, Vorderkante vollständig außerhalb der Holzfläche, U eckig vs durchlaufend geometrisch unterscheidbar, U-R1 korrekt als R1 bezeichnet.
- Bestehende Node-/PHP-/Preis-/Checkout-Tests bleiben bestehen.
- Zusätzlich Node-Geometrietest: weich auslaufende U-Kante hat genau 2 grafische Übergänge pro Seite, ändert aber die numerischen Flächen- und Schnittreferenzwerte nicht.

**Wichtig:** Keine neuen Speedmaster-Kostenvorgaben, keine Bestellfreigabe oder Live-Aktivierung. Ziel ist kürzere Kundenseite mit verständlicher technischer Vorschau. Nach Merge noch einmal gerade Platte mit rechter Abschrägung und U1 durchlaufend als WordPress-Screenshot prüfen; anschließend Woo-Checkout-Gates.
