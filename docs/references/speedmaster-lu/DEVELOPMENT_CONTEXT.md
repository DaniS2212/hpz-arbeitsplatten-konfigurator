# Historischer Chat-Kontext: Speedmaster-Referenzen, UX und PR #26–#37

Dieses Dokument hält die vom Auftraggeber zusammen mit den Originalbildern in sechs Blöcken gelieferten Anweisungen und entscheidenden Korrekturen fest. Es ersetzt nicht die Originalbilder und ist kein alleiniger CNC-/Herstellerbeleg.

## Produkt und UX

- Drei vorhandene WooCommerce-Produkte: Gerade ID 1000083, L-Form ID 1000080, U-Form ID 1000081.
- Benutzerwunsch: Gerade ist die **1:1 Design- und Bedienvorlage** für L/U: Layout, Typografie, Farben, Abstände, Karten, 3 Schritte, Dekore, Preis-/Bestellzusammenfassung und Mobile. Keine neuen Designexperimente; nur formbedingte Änderungen.
- Gefällt beim L-Konfigurator: größere Vorschau und deutliche Hervorhebung des jeweils aktiven Maßes, insbesondere Diagonalmaß B5.
- Hauptansicht: zusammenhängende hochwertige Plattenoptik, Stoßlinien dezent; Tab **Aufteilung** für technische Flächen und auswählbare Stoßstellen A/B. PR #32 hat die Teileansicht aufgebaut, PR #36 hat die Stoßstellen hervorgehoben. Diese Überlagerungen sind bisher **illustrativ**, ohne verifizierte Herstellermaschinendaten.

## Speedmaster-Sollgeometrie (aus den gelieferten Ansichten)

- L1: linker Schenkel. Untere linke Außenecke: **B3 horizontal**, **L3 vertikal**; obere rechte Außenecke: **L4 horizontal**, **B4 vertikal**.
- L2: gespiegelte Form. Obere linke Außenecke: **L3 horizontal**, **B3 vertikal**; untere rechte Außenecke: **L4 vertikal**, **B4 horizontal**.
- L3: Grundmaße L1, L2, gemeinsame Schenkelbreite B1/B2 und Eckbreite B3/B4; bei beidseitiger Abschrägung zusätzlich L5, B5, L6, B6. Innendiagonale separat prüfen.
- L4: Grundmaße wie L3, zusätzlich **B5-Grundmaß** für Diagonalbereich; nicht mit **B5-Eckmaß** der Außenkantenbearbeitung verwechseln. Die äußere Diagonalprojektion ist noch keine gesicherte Fertigungsgeometrie.
- Bei 'Abgeschrägt – eckig' zeigt Speedmaster gerade Diagonalen mit scharfen Übergängen. Bei 'Abgeschrägt – Vorderkante durchlaufend' ebenfalls **lange gerade Diagonalen**, allenfalls kleine weiche Übergänge an den Enden. Der alte künstliche durchgehende Bézier-Rundungsbogen der Vorschau war falsch. Exakter Radius/Kantenaufbau noch nicht belegt.
- Ähnliche Zahlen für beide Achsen (z. B. 150/150) verdecken Vertauschungen. Screenshots mit 120/240, 240/120 sowie ganzen Eingabelisten sind entscheidend.
- Maßtexte gehören außerhalb der Holzfläche. Eingaben müssen echte Kantenstrecken ändern, nicht nur die Labels tauschen.
- Transparenz in den Referenzen zeitweise 0 %, um zuerst die Außenkontur zu kontrollieren; echte transparente Einzelplatten/Verbinder werden danach separat abgeglichen.

## Preis

- Standard: alle vorgesehenen Außenkanten als **1,5 mm dekorgleiche Dickkante**. Bei L1 2000×1200 mm, B1/B2=600 mm, 38 mm W980 Platinweiß ist **EK netto 464,45 €** korrekt bestätigt.
- Ein niedrigerer Speedmaster-Screenshot (~352,27 €) war **nicht** dieselbe Standardausführung (Kante fehlte); dieser Wert darf nicht für die Kalkulation verwendet werden.
- Vier echte, nur für **exakte** L1-Referenzdatensätze gültige netto EKs: L1=2000 mm/17,5 mm: 307,67 €; 2000/38: 464,45 €; 2500/17,5: 342,41 €; 2500/38: 511,56 €. Jeweils L2=1200, B1/B2=600, W980 mit Standardkante und ohne Ecken.
- PR #37 enthält eine nur interne hypothetische L1-Kalkulation: 40 % Zielmarge, 35 % Mindestmarge, 10 % Reserve, **angenommene**, nicht bestätigte Anlieferung. Nicht als öffentliche Verkaufspreise ausgeben und nicht auf andere Maße/Dekore übertragen.

## Entwicklungsverlauf

- #26 L/U-Designgrundlage; #27 L1–L4 Grundformen und zehn Eckvarianten; #28 L3/L4-Maße; #29 GitHub-WordPress-Aktualisierung; #30 Maßdarstellung und Gerade-UX; #32 Teileansicht; #33 Fertigungs-/Geometrie-Audit; #34 fehlerhafte Maßachsen, Maßkollisionen und Rundung; #35 visuelle Referenzmatrix 16 Browser-Ansichten; #36 Stoß A/B; #37 L1-EK-Referenzen und sichere Szenariorechnung.
- #36 und #37 sind laut GitHub am 02.11.2026 um 11:32 UTC gemergt.
- Letzte bestätigte Auto-Update-Anzeige vor diesem Archivierungs-PR: Plugin-Version 1.0.3.51 war über GitHub veröffentlicht; der aktuelle WordPress-Installationsstand nach #36/#37 muss separat geprüft werden.

## Grenzen

**Eine Speedmaster-Screenshotansicht ist ein Geometrie-/UX-Beleg, kein vollständiger Nachweis für CNC-Verbindungen, die tatsächliche Stückzahl realer Platten oder Versandgewichte.** Neue Chats müssen den aktuellen GitHub-Zweig, CI, aktive Plugin-Version und die konkreten Quelldaten erneut prüfen. L/U derzeit weiterhin nicht bestellbar. Gerade unverändert lassen.
