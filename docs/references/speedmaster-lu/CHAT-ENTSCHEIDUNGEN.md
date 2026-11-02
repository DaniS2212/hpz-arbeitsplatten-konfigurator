# Chat-Kontext und verbindliche Entwicklungsentscheidungen – Arbeitsplattenkonfigurator

**Kontext:** Übertragung aus mehreren vollgelaufenen Chats, gesammelt am 02.11.2026, zu PR #26 bis #37. Dies ist eine inhaltliche Übergabe aus den um die Bilder herum übermittelten Nachrichten – keine wortgetreue Rekonstruktion aller alten Chats. `source-notes/` enthält die mitgesendeten Original-Textdateien.

## Kundensicht und Produkte

- WooCommerce hat getrennte Produkte für Gerade (1000083), L (1000080) und U (1000081). L und U bleiben gesperrte Entwürfe; die Gerade und deren bestehende Bestellung dürfen nicht beeinträchtigt werden.
- **Gerade ist visuell und funktional die 1:1-UI-Vorlage** für L/U: drei Schritte, Karten, Buttons, Layout, Dekorauswahl, Preisbox, Zusammenfassung, Mobil. Nur Form-spezifische Eingaben und Zeichnungen anpassen. Die größere L-Skizze und aktive Fokusmarkierung, u.a. B5, wurden positiv beurteilt.
- Hauptansicht soll eine ruhige zusammenhängende Gesamtplatte mit feinen, soweit belegt fertigungstreuen Stoßlinien zeigen; Aufteilung ist ein eigener technischer Tab, nicht der Hauptkonfigurator.

## Unverzichtbare Speedmaster-Geometrie

- Keine geschätzte Kontur als 1:1/produktionsreif ausgeben; Abgleich mit Originalbildern ist erforderlich.
- **L1 unten links:** B3 = horizontal, L3 = vertikal. **L1 oben rechts:** L4 = horizontal, B4 = vertikal (aus den danach gelieferten ungleichen Eckwerten abgeleitet, konkrete Abnahme anhand Originalbilder erforderlich).
- **L2 oben links:** L3 = horizontal, B3 = vertikal. **L2 unten rechts:** L4 = vertikal, B4 = horizontal.
- L3: L1/L2, gemeinsame B1/B2-Schenkelbreite und B3/B4-Eckbreite; Eck-Zusatzpaare L5/B5 sowie L6/B6 je nach Variante. Innere diagonale Verbindung nicht aus frei geschätzten Werten ableiten.
- L4: Grundmaße wie L3 plus **B5-Grundmaß** für den Diagonalbereich. B5-Grundmaß darf niemals mit dem bei Eckbearbeitung ebenfalls als B5 bezeichneten Eckmaß verwechselt werden. Äußere Diagonale bei B5-Änderung ist noch unabhängig zu belegen.
- „Abgeschrägt – eckig“ und „Abgeschrägt – Vorderkante durchlaufend“ haben lange gerade Schnitte, keine künstlich runden Bögen. Kleine optische Übergänge der durchlaufenden Ausführung können sichtbar sein, jedoch ist deren Fertigungsradius **nicht** nachgewiesen.
- Bei Maßen sind die Buchstaben kein globales Synonym für horizontal/vertikal. Texte gehören außerhalb der Holzfläche und dürfen sich nicht überlappen; Eingabe muss die geometrisch passende Strecke bewegen.
- Transparenz bei Geometrie-Vergleich auf 0 % gesetzt; echte Verbinder-/Einzelplattenansichten erst auf korrekter Basis nachziehen. Aufteilung wurde in PR #32 erstellt, Stoß A/B in PR #36 ergänzt; die sichtbaren Fugen sind bisher illustrative Prüfungen.

## Preis und Sicherheit

- Standard-Außenkanten: **1,5 mm dekorgleiche Dickkante** an allen vorgesehenen Außenkanten.
- Korrekte Speedmaster-EK-Referenz L1, L1=2000 mm, L2=1200 mm, B1/B2=600 mm, 38 mm W980 Platinweiß, inklusive aller Standardkanten: **464,45 € netto**. Der Screenshot mit ~352 € war nicht gleichwertig, da dort eine Standardkante fehlte.
- PR #37 dokumentiert insgesamt vier L1-Referenzen (netto): 2000/17,5 mm 307,67 €; 2000/38 mm 464,45 €; 2500/17,5 mm 342,41 €; 2500/38 mm 511,56 €; jeweils L2=1200, B1/B2=600, W980, gleiche Kanten.
- Interne hypothetische L-Szenariokalkulation ist **kein** Shoppreis: 40 % Zielmarge, 35 % Mindestmarge, 10 % Kostenreserve und noch unbelegte Anlieferung-/Versandkosten. Nicht auf andere Varianten extrapolieren.
- L/U bleiben nicht kaufbar; keine CNC- oder Bestelldaten aus illustrativen Bildern ableiten; die V3-Preisengine der Geraden nicht verändern.

## Abgeschlossene Entwicklungsbausteine (Stand aus übertragenem Chat, GitHub-Merges separat prüfen)

- PR #26: L/U Designgrundlage.
- PR #27: Speedmaster-Grundformen L1–L4.
- PR #28: Maßmodell L3/L4.
- PR #29: WordPress-Updater.
- PR #30: Maßzeichnung, Eckdarstellung, UX-Vereinheitlichung.
- PR #32: Teile-/Aufteilungsansicht.
- PR #33: Fertigungs-Audit ohne Freigabe.
- PR #34: Geometrie-/Maßachsenfehler und SVG-Rundungsfehler.
- PR #35: weitere Zeichnungs-/Bemaßungstests.
- PR #36: auswählbare Stoßstellen A/B in der Aufteilung.
- PR #37: vier L1-EK-Referenzen und simulierte interne Preiskalkulation.

## Noch unbewiesene Sachverhalte / benötigte Herstellerdaten

1. L1/L2: Nahaufnahmen Stoß, Fräsungen, tatsächliche Verbinder und Stückzahl sowie reale Fertigungsteile.
2. L3/L4: beide Anschlüsse getrennt, diagonales Teil, Fräsungen, echte Zuschnitte/Verbindungslagen.
3. L4: exakt gleiche Konfiguration zwei Mal, einzig B5-Grundmaß verändert, mit ganzer Maßliste und Draufsicht.
4. Alle L-Formen: dynamische Lieferantengrenzwerte nach Dicke, Dekor und Ecktyp; echte Packstücke, Längen, Gewichte und Versandart.
5. EK für L2/L3/L4 mit allen Standardkanten und zusätzlichen bepreisten Bearbeitungen; genaue Material-/Stärkenmatrix.
6. U1–U4: eigenständige vergleichbare Speedmaster-Maß-/Teile-/Kantenbelege, sobald L fachlich abgesichert ist.

## Wichtig für neue Coding-Chats

Die originalen Bilder in diesem Archiv müssen **gegen unsere Darstellung** geprüft werden, nicht nur gegenüber der eigenen gespeicherten Geometrie. `shop-ui`-Screenshots sind Negativbeispiele und UX-Sollbilder, aber keine Hersteller-Maßbelege. Hersteller-Screenshots belegen die gezeigten Ansichten; präzise CNC-Fräsdaten oder verbindliche Liefer-/Preisbedingungen werden daraus nicht automatisch abgeleitet.