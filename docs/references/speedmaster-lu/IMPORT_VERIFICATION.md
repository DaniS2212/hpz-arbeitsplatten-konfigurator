# PR #39 – Prüfprotokoll der Speedmaster-Originaldateien

Stand 02.11.2026. Lokal im bereitgestellten Arbeitsverzeichnis ausgeführt:

- Originalarchiv: `Speedmaster-Referenzarchiv-2026-11-02.zip`
- Dateigröße: **16.780.349 Bytes**
- SHA-256: `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb`
- ZIP-Test: **65 Dateieinträge, keine CRC-Fehler**
- CSV-Manifest: **60 eindeutige PNG-Dateien**, verteilt 1 / 17 / 14 / 9 / 3 / 16 auf Blöcke 01–06.
- Quellenart: **48 Speedmaster-Herstelleransichten**, **12 eigene WooCommerce-/Konfigurator-Vergleiche**.
- Jede Bilddatei im ZIP mit der originalen SHA-256-Prüfsumme und der Größe aus dem Manifest abgeglichen.
- Über den Importer lokal in sechs Ordner extrahiert; `verify-tree`: **60/60 bestanden**.
- Negativtest: ein absichtlich verändertes PNG wurde vom Prüfer erkannt; nach Wiederherstellung 60/60 bestanden.

**Exakt gespeicherte Quellen in diesem PR:** vollständiges Manifest, Chatinformationen und zwei erhaltene historische Textdateien plus Import-/Prüfwerkzeug.

**Noch nicht gespeichert:** die 60 PNG-Binärdateien. Der GitHub-Connector bietet keinen Übertragungsweg für die bereits im lokalen Container vorhandenen Bildbytes. Es wurde bewusst kein Bild als GitHub-gespeichert gekennzeichnet oder mit einem Ersatzbild verwechselt.

### Abschlusskriterium

- Originalbilder in `docs/references/speedmaster-lu/originals/block-01...` bis `block-06` auf dem PR-Branch committed.
- Importer `verify-tree` nach frischem Checkout erfolgreich.
- GitHub-Pull-Request-Dateiansicht zeigt tatsächlich die 60 PNG-Binärdateien.
- Kein WordPress-Plugin, keine Produktions-/Preisregeln, keine WooCommerce-Änderung.
