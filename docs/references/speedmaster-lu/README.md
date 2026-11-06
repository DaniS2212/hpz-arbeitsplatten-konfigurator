> **Verbindliche Änderung vom 06.11.2026:** **NEUE Speedmaster-PREISE nur noch als TEXT im Repository erfassen. Keine neuen Screenshot-/ZIP-/SHA-Binäruploads als Voraussetzung für Preiskalkulation oder Merge.** Siehe [Preistext-Policy und Browser-Ablauf](PRICE_TEXT_EVIDENCE_POLICY_20261106.md). Das nachfolgende Bildarchiv beschreibt **historische Geometrie-/Herstellerreferenzen**, ist keine Pflichtvorgabe für neue Preiswerte. Betreiber möchte Preisabfragen nach authentifiziertem Work-Browserzugriff künftig durch ChatGPT direkt erledigen lassen. 

> **Weiterführung 05.11.2026:** [Zentrale Projektübergabe](../../CURRENT_PROJECT_HANDOFF_20261105.md), [aktueller Netto-EK-/Bildbetragsüberblick](PRICE_EVIDENCE_CURRENT.csv). Die folgenden 60 PR39-Originale sind tatsächlich in GitHub. **12 zusätzliche U1–U4-PNGs sind seit PR #57 separat als Original-ZIP binär in GitHub vorhanden**; Integritätsprüfung der gesamten ZIP und aller zwölf Bilder grün. Ältere 16 L-PNGs stehen weiterhin aus.\n\n# Speedmaster L/U – dauerhafter Referenzkatalog

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
- [PR #51: neue L1/L2-Stoßansichten (2000×1200, 38 mm, W980) mit sechs SHA-256-Originalnachweisen, ohne CNC-Freigabe](../../phase-l1-l2-joint-photos-20261105.md) – [Quellmanifest](L1_L2_JOINT_USER_20261105.json). Die sechs neuen PNG-Binärdateien sind **nicht** Teil des PR-39-Archivs.
- [PR #52: L3 und L4 – beide Stoßstellen A/B mit zwei Hersteller-Belegserien (L3 historische PR39-PNGs, L4 vier neue B5=600-PNGs)](../../phase-l3-l4-joint-photos-20261105.md) – [Foto-Metadaten und SHA-256](L3_L4_JOINT_USER_20261105.json). L3-Profilvariante nur eingeschränkt belegbar; vier aktuelle L4-Originale noch nicht als GitHub-Binärdateien hinterlegt.



## Verbindliche Nutzung
1. Original-Speedmaster-Bild (nicht eigener Shop-Screenshot) per Manifest finden.
2. Zuordnung aller sichtbaren Eingabewerte und Maße dokumentieren; 120/240 statt 150/150 bei Achsenprüfung nutzen.
3. Render des eigenen Konfigurators mit exakt gleichem Datensatz gegenüberstellen: Außenkontur, Ecken, Stoßlinien, Maße, Mobile/Desktop.
4. Auffälligkeit → zuerst reproduzierender Test, dann minimale Änderung; automatisierte Tests plus menschlichen visuellen Vergleich.
5. Keine Berechnung/Fertigung/Verkäuflichkeit behaupten, wo Quellen fehlen. Offene Punkte: [EVIDENCE_GAPS.md](EVIDENCE_GAPS.md).

`shop-ui` im Manifest = unser eigener WooCommerce-/Konfigurator-Screenshot, keine Hersteller-Referenz.

- [U1 05.11.2026: drei neue Speedmaster-Ansichten, sechs Maße, drei Teilbereiche und zwei Stöße](../../phase-u1-speedmaster-20261105.md) – [Bildprüfsummen](U1_JOINT_USER_20261105.json). Original-PNGs sind als ZIP aus PR #57 binär vorhanden; weiterhin keine Fertigungsfreigabe.

- [PR U2–U4 05.11.2026: U-Formen alle vier Stoßvarianten (Quer/Längs) mit je drei Herstelleraufnahmen](../../phase-u2-u4-speedmaster-20261105.md) – [neun Original-PNG-Hashes](U2_U4_JOINT_USER_20261105.json); Original-Binärarchiv durch PR #57 bestätigt; weiterhin keine Produktionsfreigabe.

- **Originalarchiv U1–U4 (PR #57):** [Speedmaster_U1-U4_20261105_Originale.zip](Speedmaster_U1-U4_20261105_Originale.zip), 6.699.368 Bytes, Git-Blob SHA1 `b6948a55d8cebcc55fdd21069515e9b095c2635b`. [12 Bild-SHA256](U_20261105_SOURCE_MANIFEST.csv), [Verifikationsskript](../../../scripts/verify_u_20261105_archive.py). Erst die überprüften Bytes (nicht das reine Text-Manifest) machen dieses Archiv dauerhaft; die neue ZIP wird niemals in den WordPress-Build aufgenommen.

- **L1/U1 Preisreferenzen 06.11.2026:** [Originalbelege 488,01 €/715,04 €](L1_U1_2250_PRICE_20261106.json), [Preis- und UI-Bild-Hashes](L1_U1_2250_SOURCE_MANIFEST.csv), [ZIP-Binärimport-Vorgehen](L1_U1_2250_ARCHIVE_UPLOAD.md). **4 weitere PNG-Originale liegen seit gemergtem PR #61 unverändert im ZIP auf GitHub main; `verify-original-pngs` ist grün, Git-Blob `3d1af1ea00d426a5456e97142d40111491911efd`**. Diese zwei Preisbilder stützen unabhängig die vorab berechneten L1-/U1-Längenwerte, aber kein unbestätigtes Netto-EK- oder Fertigungsversprechen. Standard-Anlieferung seit 06.11. vom Betreiber präzisiert und bestehender V3-Code bestätigt: 10 € + 50 € ab 1900 mm = 60 € gesamt.

- **Nächste Preisvergleiche (06.11.):** [Kontrollmatrix](PRICE_VARIANT_CONTROL_20261106.csv) und [konkreter Testplan](../../phase-lu-price-variation-tests-20261106.md): L1→L2, U1→U2 sowie links exakt eine Kante ändern; bislang keine zusätzlichen Herstellerpreise aus diesen Versuchen erhalten.

- **06.11.2026 drei neue Speedmaster-Vergleichspreise:** L2 488,01 € (gleich L1), U2 710,91 € (−4,13 € ggü. U1, ebenso bereits bei L1=2000), L1 **links abgeschrägt und durchlaufende Kante** 510,02 € (+22,01 €, **kein isolierter Kantenpreis**). [Quelldatensatz/PNG-SHA](LU_THREE_PRICE_CONTROLS_20261106.json), [Manifest](LU_3_20261106_SOURCE_MANIFEST.csv), [ZIP-Upload ausstehend](LU_THREE_PRICE_CONTROLS_ARCHIVE_20261106.md). **Noch nicht als Netto-EK oder Kanten-/Stoßformel freigegeben**; bei neuen Chats auf tatsächlichen GitHub-Binärstatus prüfen.


**PR #63 tatsächlich gemergt am 06.11.2026:** die drei neuen Bild-originale liegen historisch im privaten GitHub-ZIP (1.110.446 Bytes, Git-Blob `deec662cfea4509eb98c0a58ad692762115da794`, `verify-three-price-originals` success). Keine künftigen Bild-/ZIP-Uploads für Preisentwicklung mehr verlangen; Preisregister `PRICE_EVIDENCE_CURRENT.csv` ist fortan die dauerhafte Quelle.
