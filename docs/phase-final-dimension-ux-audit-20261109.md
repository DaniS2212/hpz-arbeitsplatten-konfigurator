# Maßdarstellung – finale systematische Kunden-UX-Runde (09.11.2026)

## Ausgangslage nach gemergtem PR #81

Der Betreiber hat beim Durchgehen von Gerade, L und U weitere Skizzenfehler gezeigt und ausdrücklich eine eigenständige systematische Endkorrektur statt weiterer Einzel-Screenshots gewünscht:

- **L4 B5:** Die bislang kurze B5-Außendiagonale ist nicht selbsterklärend; eine **gestrichelte Referenzlinie durch die Platte** soll den Diagonalbereich sichtbar machen.
- **Schritt 1:** Grundriss und Eckbearbeitungen sollen im Mittelpunkt stehen, **ohne sämtliche Maße**, auch bei Vollbild. Die Maße und anklickbaren Eingaben beginnen erst in **Schritt 2**; Schritt 3 behält sie.
- **Gerade/L/U:** R1/R2 bei L/U zu weit vom eigentlichen Eckbogen, bei U nahe am Holz oder den B2/B3-Maßen. U **L4/L5** kollidieren mit den unteren Schenkelbreiten. **B1 und L3** konkurrieren um die rechte Bemaßungsspur. Selektierte Maßtexte vergrößerten sich und erzeugten ein visuelles Springen.
- Die allgemein vereinbarte **visuelle Preisgrundlage, Eckfelder, Versandschwelle und WooCommerce-Sicherheit bleiben unverändert**.

## Umsetzung

1. `component.mjs`: Ansicht Schritt 1 ohne Maßpfeile, Zahlen und Vorderkanten-Schriftzug; Hauptkontur durch engere SVG-Blickbox vergrößert. Beim Wechsel nach Schritt 2 wird dieselbe Zeichnung mit Maßen neu aufgebaut. Direkte Bearbeitung und normale Formulare sind weiterhin synchron.
2. `geometry.mjs`: Sichtbare B5-Diagonalachse **durch den L4-Holzbereich**, vom Mittelpunkt der äußeren Schräge bis zur Referenz der inneren Diagonale. Die gestrichelte Linie ist ausdrücklich nur ein **optischer Bezug**, keine 1:1 maßstäblich verifizierte B5-Distanz. B5 bleibt mit derselben Preis-/Maßeingabe verknüpft.
3. `geometry.mjs`: Fokus verändert nur Gewicht/Farbe, **nicht Größe oder ViewBox**. Für L3/L4 bleibt die zusätzliche Referenz-Marge unabhängig vom gewählten Maß konstant. U-L3 bleibt auf der äußeren Spur und B1 erhält eine eigene innere Spur. L4/L5 in U werden in der **freien Innenöffnung** statt auf der Schenkelbreite beschriftet.
4. `l-geometry.mjs` und `u1-geometry.mjs`: Radiusfelder R1/R2 stehen jeweils nahe dem sichtbaren, korrekten Bogen mit kurzer Bezugslinie; bei der beidseitigen U-Variante werden mögliche Textkollisionen durch Versetzen abgefangen.
5. Das WordPress-Bundle und die lokalen Quelldateien bleiben gespiegelt.

## Automatische Kontrolle

`wordpress/measurement-combinations-browser-runner.mjs` prüft auf Desktop 1366 px und Smartphone 390 px die tatsächlichen WordPress-Bildschirmlabels: keine Maße in Schritt 1; Maße ab Schritt 2; alle vier L- und U-Grundformen mit drei Eckbehandlungen beidseitig; B5-Achse beim L4-Diagonalmaß; Label-Überlappungen in Bildschirmkoordinaten. Bestehende Quervergleiche zu Preisen, Checkout, Plugins, L-Bildreferenzen bleiben aktiviert.

Keine Bestellfreigabe, kein Shop-Publishing und keine Herstellerbestellung. Der nächste geplante Meilenstein ist weiterhin der kontrollierte Admin-Kosten-/Versandtest und danach ein WooCommerce-Testcheckout; keine neue umfangreiche Speedmaster-Preisrunde.
