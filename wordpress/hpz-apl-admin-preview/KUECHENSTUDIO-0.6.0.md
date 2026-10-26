# 0.6.0 – Küchenstudio-Oberfläche und Zentimetermaß

Stand 26.10.2026. Basis ist der gemergte Stand von PR #7 (0.5.0); die isolierte CSS-Schicht aus PR #6 wurde übernommen und in der bestehenden Komponente und dem WordPress-Paket eingebunden. Das Plugin verwendet weiterhin dieselben drei Produktentwürfe und den bestehenden Admin-Testmodus.

## Verhalten

- Helle neutrale Zeichenfläche, dunkles Petrol, deutliche Auswahl- und Fokuszustände; 16 echte Dekorbilder und dynamische SVG-Zeichnung bleiben erhalten. Die zweite CSS-Datei wird innerhalb des Shadow DOM nach `component.css` geladen und beeinflusst Flatsome nicht.
- Bei Gerade heißt Schritt 1 „Ecken“; die Ansicht „Teile & Stöße“ ist dort nicht vorhanden. L/U zeigen „Grundriss“ und die unverbindliche Ansicht „Aufteilung“. L/U-Teile und Stöße werden weiterhin nicht als bestätigte Fertigung dargestellt.
- Kunden geben Länge, Tiefe, Radius und Schrägenmaße in cm mit höchstens einer Dezimalstelle ein. Zeichnung, Grenzhinweise, Dialoge und Zusammenfassung verwenden cm. Platten- und Kantenstärken bleiben mm.
- `customer-measures.mjs` wandelt Dezimalstrings ohne Gleitkomma-Rundung in ganze Millimeter um. Der bestehende V2-Request enthält weiterhin `schemaVersion:2`, `inputUnit:'mm'` und mm-Strings. Die PHP-V3-Engine, ihre Grenzen und die Preisformel wurden nicht verändert.
- Ungültige Präzision entfernt sofort die alte Zeichnung und den alten Preis; die nächste Schaltfläche wird gesperrt. Nur die PHP-Schnittstelle liefert im WordPress-Testmodus einen unverbindlichen Bruttopreis. Kaufbutton und serverseitige WooCommerce-Kaufsperren bleiben aktiv.

## Lokale Prüfung

`node build-plugin.mjs` aktualisiert die gebündelten Assets. Danach startet `node local/server.mjs` die Demo auf `http://127.0.0.1:4173/`; `node wordpress/serve-package-test.mjs` zeigt die gebauten Plugin-Assets auf `http://127.0.0.1:4174/`. Der separate PHP-Harness aus `wordpress/price-http-harness.php` prüft die tatsächliche WordPress-Preisadapter-Klasse ohne produktiven Shopzugriff.

Die Prüfungen umfassen alle zehn geraden Eckzustände, 16 Dekore, beide Materialstärken, die cm→mm-Grenzen 250,0/250,1, 278,0/278,1 und 88,0/88,1 cm, ungültige Eingaben, 360/390/1366/1440 px, mobile Eckdetails, Host-CSS-Isolation sowie deaktivierte Kaufaktionen. Ergebnisse und Screenshots: `docs/060-tests.md`, `docs/060-desktop.png`, `docs/060-mobile.png`.

## Vor einer Veröffentlichung offen

Echter WordPress-/Flatsome-/WooCommerce-Laufzeittest mit Admin-, Kunden- und Gastrolle; WP-Rocket/CSP/Cache; mobile Geräte; vollständige Geometrie- und Lieferbarkeitsbestätigung für L/U und nicht belegte Eckvarianten; internationale Steuer und Kundenversand; direkte klassische und Store-API-Warenkorbversuche; Regression des Möbelsockels. Diese Version ist ausschließlich eine gesperrte Testvorschau und darf nicht für Bestellungen verwendet werden.
