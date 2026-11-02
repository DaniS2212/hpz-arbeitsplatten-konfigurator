# PR #39 – Integritätsprüfung des Speedmaster-Bildarchivs

Prüfung am 02.11.2026 auf Basis der 60 vom Nutzer übertragenen Originale.

## Quelle und Upload

- GitHub-Branch: `docs/pr39-speedmaster-archive-import`.
- GitHub-Pfad: `docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip`.
- GitHub-Dateigröße: **16.780.349 Bytes**, bestätigt über Git Tree API.
- GitHub-Git-Blob-SHA-1: **`e3237c4adc831bdfcbdf7778ed25d13ee20c8b78`**, bestätigt über Git Tree API.
- Unabhängig berechneter Git-Blob-SHA-1 des ursprünglichen lokalen ZIP: **`e3237c4adc831bdfcbdf7778ed25d13ee20c8b78`**. Gleicher Git-Objektinhalt, somit byteidentisch.
- SHA-256 der lokalen Originaldatei: `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb`.
- Lokal geprüfter ZIP-Inhalt: **65 Dateien**, davon **60 originale PNGs**, **5 Begleitdateien**.
- Quelle: 48 Hersteller-Speedmaster-Screenshots, 12 eigene Shop-/UX-Vergleiche.
- Bildblöcke 01–06: 1 / 17 / 14 / 9 / 3 / 16.
- **60/60** Bildgrößen und Bild-SHA-256-Werte stimmen mit `manifest.csv` im ZIP überein.
- ZIP-CRC: **keine Fehler**; 60 eindeutige PNG-Pfade.
- Der vollständige `SOURCE_MANIFEST.csv` mit Namen, Quelltyp, Beschreibung und SHA liegt zusätzlich unkomprimiert im Repository.

## Resultat und Einschränkung

**Die 60 ursprünglichen PNG-Bildbytes sind vollständig in der versionierten ZIP-Datei auf GitHub archiviert.** Sie sind nicht als 60 separate GitHub-Bilder committed, sondern liegen als PNG-Dateien **innerhalb** des ZIP-Archivs. Das genügt für die dauerhafte Archivierung; die Bilder können nach Auschecken lokal entpackt, inspiziert und mit dem Konfigurator verglichen werden.

Ein Text-Connector allein kann ZIP- und PNG-Binärinhalte möglicherweise nicht darstellen; zukünftige Sitzungen müssen die Bilder zur visuellen Prüfung tatsächlich entpacken und anzeigen. Die Quellen sind **keine Freigabe für reale CNC-Fräsungen, nicht belegte Lieferantenpreise oder WooCommerce-Bestellbarkeit**.

Vor Freigabe des PRs noch den aktuellen GitHub-CI-Status prüfen. Es gibt in dieser Änderung keine Laufzeit-/WooCommerce-/WordPress-Änderungen und keine automatische Veröffentlichung.
