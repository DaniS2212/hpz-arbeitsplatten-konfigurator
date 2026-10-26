# 0.6.0 – lokaler Prüfnachweis

Stand 26.10.2026. Alle Prüfungen gegen das lokale Projekt und das lokal gebaute Plugin; keine Anfrage an den Liveshop. Die PHP-Testumgebung bildet WordPress-Rollen und -Hooks nach, ersetzt aber keine echte Flatsome-/WooCommerce-Installation.

| Prüfung | Ergebnis |
| --- | --- |
| Node-Regression (Komponente, Geometrie, Dekore, HTTP, Plugin, Preisadapter) | 101/101 bestanden, 0 übersprungen |
| Original-Preisregel V3 | 379 Assertions, 72 historische EK-Fälle, kleinste geprüfte Marge 40,370 %, bestanden |
| PHP-Preisnormalisierung | 97 Assertions bestanden |
| WordPress-Admin-/Entwurfs-/Nonce-Gates | 18 Assertions bestanden |
| PHP-Syntax im installierbaren Plugin | 4/4 Dateien ohne Fehler |
| Browser: zehn Eckzustände und cm-Eingabe | 46 Prüfungen bestanden |
| Browser: Eckdetails 360/390/1366/1440 px | 12 Layoutfälle bestanden |
| Browser: 16 echte Dekorbilder auf drei Produktseiten | 65 Prüfungen bestanden |
| Browser: Dekorkarten 360/390/1366/1440 px | 12 Layoutfälle bestanden; Premium-CSS tatsächlich geladen, kein horizontaler Überlauf |
| Browser: Basis-Layout und Komponenten-Isolation | 4 Ansichtsbreiten + 12 Komponententests bestanden |
| PHP-Preisvorschau im Browser | `250,1 cm` neu bepreist; `250,12 cm` zeigt Validierungsfehler, entfernt alten Preis und sperrt den nächsten Schritt; Kaufbutton bleibt deaktiviert |
| Paket | 60 ZIP-Einträge bytegleich zu den Plugin-Dateien, inklusive neuer CSS-/cm-Assets und Dokumentation |
| GitHub Actions auf PR #8 | „Konfigurator Vorschau CI“ und „Price V3 Regression“ erfolgreich, einschließlich PHP- und Node-Laufzeittests |

Die automatisierten Tests führen `250,0→250,1 cm`, `278,0→278,1 cm` und `88,0→88,1 cm` als exakte mm-Übergaben zur unveränderten PHP-V3-Engine aus. Der WordPress-Testadapter prüft weiterhin alle 16 Dekore in beiden Stärken sowie Rollen, Nonce, Manipulation und fehlende Lieferbarkeit. L/U werden nur visuell dargestellt und erhalten keine V3-Verkaufspreise.

Screenshots (lokaler Admin-/Paketmodus): `060-desktop.png` (Preis und gesperrter Kauf), `060-desktop-dekore.png` (Oberflächenkarten), `060-mobile.png` (390 px, Ecken) und `060-mobile-dekore.png` (390 px, Dekore). Die schmale Ansicht wurde als echte 390-px-iframe im Testbrowser gerendert; der äußere Screenshot enthält den simulierten Sticky-Shopheader.

ZIP: `dist/hpz-apl-admin-preview-0.6.0.zip`
SHA-256: `50A4E5BDF4DB4B5499AD5F0862332D320092D61578BBD2CDC70EE18D287DBCF7`

Noch offen: echte WordPress-/WooCommerce-/Flatsome-/WCPA-Integration, Rollen und Cache im Shop, physische Smartphones, tatsächliche Kundenversandkosten, internationale Steuer, klassische und Store-API-Warenkorbversuche sowie Möbelsockel-Regression auf einer freigegebenen Testinstallation. Keine Verkaufserlaubnis.
