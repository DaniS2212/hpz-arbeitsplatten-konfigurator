# WordPress-Adapter 0.1.0

Ergänzung 0.2.0 / Phase A1: vorhandene Einbettung und PHP-Sperren beibehalten, lediglich Versionskennzeichnung aktualisiert. Neue `straightCorner`-Struktur enthält Seite, Bearbeitungsart und ausschließlich passende Sonderparameter (R1/R2 in cm vom Formular, mm nach Normalisierung). Separater Gerade-Geometriepfad; L/U verwenden unverändert den bisherigen Pfad. Abschrägungen werden mangels Konturbeleg vor der Zeichnung abgelehnt. Kein neuer Kauf-/Preispfad. Modul-/Stylesheetimporte enthalten eine Versionskennung gegen alte Browsercache-Stände. Details: phase-a1-evidence.md.

Installationsquelle: `../wordpress/hpz-apl-admin-preview/`, Build mit `node implementation/apl/build-plugin.mjs`. Der Build kopiert die bestehende Komponente, ersetzt absolute Entwicklungsimporte durch relative Module und entfernt den lokalen HTTP-Fallback. Die ursprüngliche Demo und private Preisengine bleiben erhalten. Alle benötigten visuellen Assets sind CSS und inline SVG; keine externen Bilddateien erforderlich.

Entscheidung: Standard-WooCommerce-Hook `woocommerce_after_single_product_summary` mit Priorität 5, vor Standard-Tabs (10). Kein behaupteter Nachweis für das konkrete Flatsome-Template. Shortcode-Fallback auswählbar, pro Request höchstens eine Ausgabe. Host-CSS ausschließlich unter `.hpz-apl-admin-preview`; Komponente in Shadow DOM. Keine globalen Theme-Overrides.

Produktfamilie im PHP-Kontext anhand fester IDs; Browseradapter prüft ID/Familie nochmals für die Darstellung. Für Kaufberechtigung ist diese Browserprüfung bedeutungslos: PHP sperrt alle drei Produkte generell. Keine AJAX-/REST-Bestellroute. Die Sperre gilt solange das Plugin aktiv ist, auch bei versehentlicher Veröffentlichung. Einstellungen speichern nur eine eigene Option, keine Produktmetadaten oder WCPA-Daten.

WCPA-Vertrag für spätere Phase: Ein noch zu implementierender Adapter liest ausschließlich die freigegebenen Feld-IDs der drei Produkte und übersetzt in schemaVersion 1 (Familie, Geometrie, mm-Maße, Material, Dekor, Kanten, Menge). Ein einziger serverseitiger Validator muss aus versionierten Freigaben ein gültiges Angebot erzeugen, bevor irgendein Warenkorbadapter existiert. Aktuell kein WCPA-Hook, kein Formularimport und kein schaltbarer Produktionspfad. Die Vorschauadapter-Schnittstelle bleibt `preview(raw) -> {config, geometry, quote}` mit `quote.purchasable=false`; keine Geheimnisse im Browser.

Quellen zur Hook-Auswahl:
- https://woocommerce.github.io/code-reference/files/woocommerce-includes-wc-template-hooks.html
- https://woocommerce.github.io/code-reference/files/woocommerce-src-storeapi-utilities-cartcontroller.html

Diese offiziellen Schnittstellen ersetzen keinen Test mit den tatsächlich installierten Shopversionen.
