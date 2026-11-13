# PR #103 – Speedmaster-Verbindungen: Bildbeispiel als schematische SVG-Ansicht

Grundlage: [Neun Original-Screenshots und Quellenmanifest](speedmaster/2026-11-13-lu-verbindungen/README.md), PR #102. Die L-/U-Plattenvorschau zeigt nach PR #100 bereits die originalen **schematischen Stoßlinien**.

## Änderung

- Der bisherige kleine „◫ Durchsicht“-Button unten ist entfernt.
- Stattdessen sitzt rechts in der Kopfzeile der Zeichnung ein kompakter, optisch ruhiger **„Verbindungen“**-Schalter mit Schieberegler und Verbindungssymbol, standardmäßig **aus**. 40–42px Bedienhöhe und sichtbarer Ein-/Aus-Zustand, auch bei 390px.
- Bei Aktivierung wird die Holzoberfläche halbtransparent; am **jeweiligen Stoß** erscheinen gelbe, längliche **Verbindungselement-Symbole** und dunkle, quer zur Fuge liegende **Spannverbinder-Symbole**. Ihre Form und Farbkonventionen orientieren sich an den Speedmaster-Aufnahmen, nicht an einem neuen Produktdesign.
- Es erscheinen nur die Fugen von `g.previewSeams`, einschließlich L1–L4 und U1–U4; wir erzeugen weder zusätzliche Fugen noch verlässliche physische Schnittgeometrie.
- Symbole sind unabhängig von Maßeingaben berechnete **SVG-Illustrationen**. Relative Abstände und symbolische Anzahl dienen allein der Lesbarkeit; es sind **keine** tatsächlichen Abstände, Liefermengen, Fräs- oder Bohrpositionen.
- Ein unaufdringlicher Hinweis in der aktiven Ansicht nennt diese Grenze. Maße bleiben beim Einschalten sichtbar. Die Einstellung bleibt beim Wechsel der L-/U-Untervarianten erhalten.
- Beim Wechsel auf die gerade Platte gibt es **keinen** Schalter und keine Verbindungssymbole. Maße und Größen dürfen sich nicht ändern.

## Nicht geändert

Keine Preis- und Lieferantenlogik (einschließlich 150€ netto interne Speedmaster-Fracht pro Stück), kein Warenkorb, Versand, MwSt., signierte Fertigungsdaten, Sales-/Admin-Gates, Konstruktions-/CNC-Schnittlisten oder Speedmaster-Bestellungen.

## Tests

`local/test/transparent-connections-view.test.mjs` prüft **alle L1–L4/U1–U4-Varianten**, normale vs. transparente SVG-Ausgabe, vorhandene Stoß-IDs, Bemaßung, keine Gerade-Symbole und reinen Darstellungsmodus.

`wordpress/connection-view-browser-runner.mjs` prüft das tatsächlich gepackte WordPress-Frontend für L und U auf **1366 px und 390 px**, den neuen Schalter in der Vorschau-Kopfzeile, Bemaßung, Ein-/Ausschalten, Variantenwechsel, keinen horizontalen Überlauf und unveränderte Bestellsperre. Screenshots der 390px-Ansicht werden als GitHub-CI-Artefakt ausgegeben.

Diese Darstellung ist ein **visueller Kundenhinweis**, keine Herstellerbestätigung der Anzahl, Position, CNC-Fräsungen oder Montageanleitung. Für eine fertigungstreue 3D-Echtansicht braucht es künftig explizite Regeln und Daten des Lieferanten.
