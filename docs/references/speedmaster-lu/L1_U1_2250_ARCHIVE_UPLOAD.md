# 06.11.2026 – zwei neue Speedmaster-Preisoriginale und zwei UI-Referenzen

**Stand: Manuelle Binärübertragung noch offen.** Das neue Preisregister und die SHA-Manifestdatei **sind** im PR #61; die vier tatsächlichen PNG-Originalbytes sind erst dann dauerhaft gesichert, wenn die ZIP im GitHub-Branch liegt. Dieser Unterschied darf bei späteren Chats nicht verloren gehen.

## Originalarchiv

Datei: `Speedmaster_L1_U1_2250_UI_20261106_Originale.zip`

- Dateigröße: **1.059.629 Bytes**
- ZIP SHA-256: `e8f5fc1aef4947f642089f4f46c4947e7b95e1a83ad0474b51869ecc011f1531`
- Git-Blob-SHA1: `3d1af1ea00d426a5456e97142d40111491911efd`
- Zwei **unveränderte Speedmaster-PNGs**: L1 2250/1200/600/600, APL38 W980, Bildschirm-Anzeige **488,01 €**; U1 2250/1200/1800/600/600/600, APL38 W980, Anzeige **715,04 €**.
- Zwei weitere **unveränderte UI-Screenshots** aus den aktuellen Chats: L4 B5 „Einstellung“ und wechselnde Zeichnungsgröße, WooCommerce-Produktkopf mit großer Galerie. Sie dienen nur dem UI-Schritt 3, nicht zur EK-Kalibrierung.
- Vollständige Bildnamen, Abmessungen, exakte Einzel-SHA256 und Konfigurationen: [L1_U1_2250_SOURCE_MANIFEST.csv](L1_U1_2250_SOURCE_MANIFEST.csv) und [Preisnachweise](L1_U1_2250_PRICE_20261106.json).
- Die sichtbaren Lieferantenbeträge treffen die vorab modellierten Längenpreise exakt; ohne weitere Beleglage **keine unabhängig bestätigte Netto-EK-Einordnung**, CNC-Freigabe oder Kundenpreis.

## Einmaliger manueller GitHub-Upload (wie PR #57)

1. Die geprüfte ZIP aus dem aktuellen Chat herunterladen.
2. GitHub-Repository **DaniS2212/hpz-arbeitsplatten-konfigurator** öffnen, Branch **`feat/lu-price-calibration-reference-grid-20261106`** (PR #61) auswählen.
3. Unter `docs/references/speedmaster-lu/` die **ZIP im Original** über **Add file → Upload files** auf den Branch committen. **Nicht entpacken oder umbenennen.**
4. GitHub Actions führt `python3 scripts/verify_lu_20261106_archive.py --require` aus. Vor dem Upload schlägt dieser einzelne Archivetest **absichtlich fehl**; nach korrektem Upload muss er mit allen Bild- und ZIP-Hashes grün sein.
5. Erst nach grünem CI und dem nächsten Dokumentations-Statusabgleich PR #61 mergen. Merge allein schaltet keinen WooCommerce-L/U-Verkauf frei.

**Nicht** in den öffentlichen WordPress-Plugin-Build kopieren. Das ZIP ist ein internes, privates Hersteller-/Entwicklungsarchiv.
