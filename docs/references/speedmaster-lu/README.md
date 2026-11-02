# Speedmaster L/U – dauerhafter Referenzkatalog

Stand: 02.11.2026. **Privates internes Material, keine Kunden-/Fertigungsfreigabe.**

## Ausgangslage
Der Nutzer hat für die Entwicklung aus sechs Chatblöcken **60 originale PNG-Screenshots** erneut bereitgestellt:
- Block 01: 1 WooCommerce-Produktübersicht.
- Block 02: 17 Speedmaster-Bilder zu L1–L4 und Varianten.
- Block 03: 14 Speedmaster-Bilder mit Maßen, 3D, Transparenz, Preisbeispielen.
- Block 04: 9 UX-Vergleichsbilder zwischen Gerade und L.
- Block 05: 3 Bilder: zwei eigene Vorschauen und ein Speedmaster-Gegenbeleg.
- Block 06: 16 Speedmaster-Bilder: ungleiche Eckwerte, eckig/durchlaufend, Maßachsen.

**48 Speedmaster-Originalansichten** und **12 eigene Produkt-/UI-Vergleiche**. Dateiliste und Kontext stehen in [IMAGE_MANIFEST.csv](IMAGE_MANIFEST.csv) und [DEVELOPMENT_CONTEXT.md](DEVELOPMENT_CONTEXT.md).

## Originaldateien (Importstatus)
Die Binärdateien wurden als **byte-identisches, lokal geprüftes ZIP-Archiv** vorbereitet:
`Speedmaster-Referenzarchiv-2026-11-02.zip` (16.780.349 Bytes; SHA-256 `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb`).

**WICHTIG: Dieses ZIP befindet sich zum Zeitpunkt dieses PR noch NICHT im Repository.**
Der Dateinamenindex ist ein Empfangsprotokoll, nicht der Beweis einer GitHub-Einspielung. Für die dauerhafte Nutzung in neuen Chats die ZIP-Datei in **diesen Ordner** einspielen und anschließend in GitHub verifizieren. Die ZIP enthält Original-PNGs in sechs Blöcken, Manifest mit SHA-256 je Datei, zugehörige Übergabenotizen und Chat-Entscheidungen. Nicht als Website-Asset oder WordPress-Bundle veröffentlichen.

## Bereits im Repository verankerte technische Quellen
- [L1–L4-Screenshotreferenzen](../../l-speedmaster-screenshot-evidence-20261102.md)
- [Geometrie/Visual-Parity](../../l-speedmaster-visual-parity-20261102.md)
- [Fertigungsabgleich](../../phase-l-fertigungsabgleich-20261102.md)
- [Teileansicht](../../phase-l-parts-preview-20261030.md)
- [L-Preisnachweise](../../phase-l-price-evidence-20261102.md)

## Verbindliche Nutzung
1. Original-Speedmaster-Bild (nicht eigener Shop-Screenshot) per Manifest finden.
2. Zuordnung aller sichtbaren Eingabewerte und Maße dokumentieren; 120/240 statt 150/150 bei Achsenprüfung nutzen.
3. Render des eigenen Konfigurators mit exakt gleichem Datensatz gegenüberstellen: Außenkontur, Ecken, Stoßlinien, Maße, Mobile/Desktop.
4. Auffälligkeit → zuerst reproduzierender Test, dann minimale Änderung; automatisierte Tests plus menschlichen visuellen Vergleich.
5. Keine Berechnung/Fertigung/Verkäuflichkeit behaupten, wo Quellen fehlen. Offene Punkte: [EVIDENCE_GAPS.md](EVIDENCE_GAPS.md).

`shop-ui` im Manifest = unser eigener WooCommerce-/Konfigurator-Screenshot, keine Hersteller-Referenz.
