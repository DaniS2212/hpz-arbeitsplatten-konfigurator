# 06.11.2026 – zwei neue Speedmaster-Preisoriginale und zwei UI-Referenzen

**ABGESCHLOSSEN:** PR #61 ist am **06.11.2026 um 08:40 UTC** gemergt. Das unveränderte Binär-ZIP liegt auf **GitHub main**; Git-Blob SHA-1 `3d1af1ea00d426a5456e97142d40111491911efd`, Dateigröße **1.059.629 Bytes**, GitHub Actions `verify-original-pngs` **success** (vier Einzel-PNGs, ZIP/Manifest und Prüfsummen). **Kein erneuter Upload notwendig.**

## Originalarchiv

Datei: `Speedmaster_L1_U1_2250_UI_20261106_Originale.zip`

- Dateigröße: **1.059.629 Bytes**
- ZIP SHA-256: `e8f5fc1aef4947f642089f4f46c4947e7b95e1a83ad0474b51869ecc011f1531`
- Git-Blob-SHA1: `3d1af1ea00d426a5456e97142d40111491911efd`
- Zwei **unveränderte Speedmaster-PNGs**: L1 2250/1200/600/600, APL38 W980, Bildschirm-Anzeige **488,01 €**; U1 2250/1200/1800/600/600/600, APL38 W980, Anzeige **715,04 €**.
- Zwei weitere **unveränderte UI-Screenshots** aus den aktuellen Chats: L4 B5 „Einstellung“ und wechselnde Zeichnungsgröße, WooCommerce-Produktkopf mit großer Galerie. Sie dienen nur dem UI-Schritt 3, nicht zur EK-Kalibrierung.
- Vollständige Bildnamen, Abmessungen, exakte Einzel-SHA256 und Konfigurationen: [L1_U1_2250_SOURCE_MANIFEST.csv](L1_U1_2250_SOURCE_MANIFEST.csv) und [Preisnachweise](L1_U1_2250_PRICE_20261106.json).
- Die sichtbaren Lieferantenbeträge treffen die vorab modellierten Längenpreise exakt; ohne weitere Beleglage **keine unabhängig bestätigte Netto-EK-Einordnung**, CNC-Freigabe oder Kundenpreis.

## Historischer Uploadablauf – bereits durch PR #61 abgeschlossen

Die Datei wurde unverändert hochgeladen und als PR #61 gemergt. Auf GitHub `main` kann sie über den Repo-Checkout entpackt und mit `python3 scripts/verify_lu_20261106_archive.py --require` jederzeit erneut überprüft werden. Die Archivierung schaltet **keinen** WooCommerce-L/U-Verkauf frei; Fertigungs-/Netto-EK- und Checkout-Nachweise bleiben separat erforderlich.

**Nicht** in den öffentlichen WordPress-Plugin-Build kopieren. Das ZIP ist ein internes, privates Hersteller-/Entwicklungsarchiv.
