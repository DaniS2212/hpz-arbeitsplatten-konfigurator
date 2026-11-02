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

## Originaldateien – Prüf- und Importstatus (PR #39)

**Das originale Bildarchiv wurde am 02.11.2026 lokal vollständig geprüft:**
- 60 PNG-Dateien aus sechs Blöcken; davon 48 Speedmaster-Herstelleransichten und 12 eigene Shop-/UX-Vergleichsbilder.
- ZIP-Datei: `Speedmaster-Referenzarchiv-2026-11-02.zip` mit 16.780.349 Bytes, SHA-256 `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb`.
- ZIP-CRC, sämtliche 60 individuellen SHA-256-Werte und Dateigrößen bestanden die Prüfung. Eine gezielt veränderte Bilddatei wurde bei der Negativprobe erkannt.
- Vollständige Beschreibungen, Originaldateinamen, Quellentypen und Prüfsummen: [SOURCE_MANIFEST.csv](SOURCE_MANIFEST.csv).
- Die originalen Chat-Entscheidungen, Übergabehinweise und erhaltene ältere Textnotizen sind ebenfalls im Verzeichnis enthalten.

**Status: Die 60 Original-PNGs sind noch NICHT in GitHub gespeichert.** Der hier verwendete GitHub-Zugang kann Textdateien, nicht aber eine lokale Binärdatei mit 16,8 MB direkt aus dem Arbeitsverzeichnis übertragen. Ein Eintrag im Manifest ist keine Bilddatei. Bis der tatsächliche Import auf den PR-Branch erfolgt, kann kein zukünftiger Chat behaupten, die Bilder seien aus dem Repository abrufbar.

### Import auf den PR-Branch (ohne WordPress-Deployment)

Der Standardbibliothek-Importer liegt unter [scripts/import_speedmaster_reference_zip.py](../../../scripts/import_speedmaster_reference_zip.py). In einem ausgecheckten Repository mit Zugriff auf das Original-ZIP:

```bash
python scripts/import_speedmaster_reference_zip.py check-zip /pfad/zum/Speedmaster-Referenzarchiv-2026-11-02.zip
python scripts/import_speedmaster_reference_zip.py import /pfad/zum/Speedmaster-Referenzarchiv-2026-11-02.zip
python scripts/import_speedmaster_reference_zip.py verify-tree
git add docs/references/speedmaster-lu/originals
git commit -m "docs: archive all 60 original Speedmaster reference PNGs"
git push
```

Nach dem Push anhand des GitHub-PR-Dateibaums **60 einzelne PNGs** verifizieren. Die `originals/`-Dateien werden weder als Shop-Assets noch in das WordPress-Plugin eingebunden. **PR #39 bis dahin als unvollständig behandeln und nicht mergen.**

### Weitere Quellen

- [Originale Entscheidungen](CHAT-ENTSCHEIDUNGEN.md) und [Originale Paketnotiz](ARCHIVE_README.md).
- [Übertragene historische Textnotizen](source-notes/) und bisherige [Entwicklungsentscheidungen](DEVELOPMENT_CONTEXT.md).
- [Integritätsprotokoll](IMPORT_VERIFICATION.md) mit den geprüften Nachweisen und dem noch offenen GitHub-Upload.

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
