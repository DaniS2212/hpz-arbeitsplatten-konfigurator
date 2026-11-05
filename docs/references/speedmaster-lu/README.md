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

## Originalbilder im Repository – PR #39 verifiziert

**Alle 60 Originalscreenshots wurden als ein einziges ZIP-Archiv im PR-Branch abgelegt.** Das ZIP ist keine Verzeichnisvorschau mit einzelnen Bildern, sondern enthält die vollständigen PNG-Binärdateien unverändert im Archiv.

- [Speedmaster_PR39_GitHub_Upload.zip](Speedmaster_PR39_GitHub_Upload.zip) – **16.780.349 Bytes**.
- Originalarchiv und GitHub-Datei haben denselben **Git-Blob-SHA-1**: `e3237c4adc831bdfcbdf7778ed25d13ee20c8b78`.
- SHA-256 der lokalen byteidentischen Originaldatei: `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb`.
- ZIP-CRC und **60/60 SHA-256-Prüfsummen** der enthaltenen PNGs: erfolgreich geprüft.
- Bildverzeichnis nach ursprünglicher Reihenfolge, Beschreibung und SHA-256: [SOURCE_MANIFEST.csv](SOURCE_MANIFEST.csv).
- Begleitende Entscheidungen: [CHAT-ENTSCHEIDUNGEN.md](CHAT-ENTSCHEIDUNGEN.md), [ARCHIVE_README.md](ARCHIVE_README.md), [DEVELOPMENT_CONTEXT.md](DEVELOPMENT_CONTEXT.md) und historische [source-notes/](source-notes/).

### In späteren Entwicklungssitzungen verwenden

Aus einem Checkout des **privaten** Repositories (Repo-Root):

```bash
python scripts/import_speedmaster_reference_zip.py check-zip docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip
python scripts/import_speedmaster_reference_zip.py import docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip
python scripts/import_speedmaster_reference_zip.py verify-tree
```

Anschließend stehen die 60 einzelnen Originale lokal unter `docs/references/speedmaster-lu/originals/block-01/` bis `block-06/` zur visuellen Inspektion bereit. Diese temporär extrahierten Einzelbilder **müssen nicht noch einmal in Git committet werden**; der ZIP-Commit ist die dauerhafte Quelle.

**Grenze:** Der reine GitHub-Textconnector kann das ZIP nicht selbst als Bilder anzeigen. Ein zukünftiger Chat benötigt eine Arbeitsumgebung mit Repo-Checkout/ZIP-Extraktion oder einzeln bereitgestellte Bilddateien, um die Bilder tatsächlich zu sehen. Die erfolgreiche Archivierung ist **kein visueller Geometrieabgleich** und kein Beleg für noch unbestätigte Herstellerdetails.

**Sicherheitsregel:** ZIP und Extrakte niemals als Kundenbilder veröffentlichen, nie in `dist/` oder in ein WordPress-Plugin-Bundle aufnehmen. Unsere bestehende kaufbare Gerade und L/U-Testfreigaben bleiben davon unberührt.

Weitere Prüfergebnisse: [IMPORT_VERIFICATION.md](IMPORT_VERIFICATION.md).

## Bereits im Repository verankerte technische Quellen
- [Abschrägungs-Eingabewerte aus Herstellerbildern und Grenzkorrektur (PR #40)](../../l-speedmaster-chamfer-limits-20261102.md)
- [Dynamische Zeichnungsgrenzen vs. Speedmaster-Fotolimite (PR #41)](../../l-speedmaster-dynamic-corner-limits-20261102.md)
- [R1/R2-Rundungen: dynamische Zeichnungsgrenzen und Kreisflächenkorrektur (PR #42)](../../l-round-sketch-guardrails-20261102.md)
- [L1–L4-Screenshotreferenzen](../../l-speedmaster-screenshot-evidence-20261102.md)
- [Geometrie/Visual-Parity](../../l-speedmaster-visual-parity-20261102.md)
- [Fertigungsabgleich](../../phase-l-fertigungsabgleich-20261102.md)
- [Teileansicht](../../phase-l-parts-preview-20261030.md)
- [L-Preisnachweise](../../phase-l-price-evidence-20261102.md)
- [Neue L4-B5-Paarbilder (300/600 mm): reproduzierbare Konturmessung, SHA-256 und offener Original-Binärimport](L4-B5-VISUAL-20261102.md)
- [PR #45: auswählbare L4-Stoßstellen A/B mit markierten angrenzenden Teilbereichen, nur schematische Vorschau](../../phase-l4-seam-neighbors-20261102.md)
- [PR #46: abgegrenzte und nummerierte Vorschau-Teilflächen folgen L1–L4-Abschrägungen und Rundungen](../../phase-l-preview-part-contour-alignment-20261102.md)
- [PR #47: privater Speedmaster-Bericht mit Draufsicht und markierten, rein schematischen Stoßstellen A/B auf Desktop und Smartphone](../../l-private-speedmaster-review-guide-20261102.md)
- [PR #48: stabile Bezeichnungen der L4-Stoßstellen A/B bei verschwindenden Vorschau-Teilflächen](../../phase-l-stable-seam-identities-20261105.md)
- [PR #49: maschinenlesbare Speedmaster-Fertigstellungscheckliste L1–L4 / U1–U4](../../phase-lu-speedmaster-closeout-handoff-20261105.md) – [interner Prüfdatensatz](SUPPLIER_CLOSEOUT.json)


## Verbindliche Nutzung
1. Original-Speedmaster-Bild (nicht eigener Shop-Screenshot) per Manifest finden.
2. Zuordnung aller sichtbaren Eingabewerte und Maße dokumentieren; 120/240 statt 150/150 bei Achsenprüfung nutzen.
3. Render des eigenen Konfigurators mit exakt gleichem Datensatz gegenüberstellen: Außenkontur, Ecken, Stoßlinien, Maße, Mobile/Desktop.
4. Auffälligkeit → zuerst reproduzierender Test, dann minimale Änderung; automatisierte Tests plus menschlichen visuellen Vergleich.
5. Keine Berechnung/Fertigung/Verkäuflichkeit behaupten, wo Quellen fehlen. Offene Punkte: [EVIDENCE_GAPS.md](EVIDENCE_GAPS.md).

`shop-ui` im Manifest = unser eigener WooCommerce-/Konfigurator-Screenshot, keine Hersteller-Referenz.
