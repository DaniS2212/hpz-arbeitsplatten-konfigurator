# Version 0.5.0 – V3-Preisvorschau (Arbeitsprotokoll)

Basis: `origin/main` / `6deb158` (PR #4 bereits mit CI gemergt). Die freigegebene
Preisengine und ihre 379 Tests samt 72 historischen EK-Vergleichen wurden aus
PR #3 / `feature/preisregel-v3-kalkulation` übernommen. PR #3 wird nicht pauschal
gemergt; die 0.5.0-Integration erfolgt auf einem eigenen Branch.

## Rulings und Grenzen

- Ruling: Die V3 aus PR #3 gilt nur für **Gerade**. L- und U-Form bekommen
  weiterhin keinen berechneten Preis, weil PR #3 dafür keine Formel enthält.
- Ruling: V3 berechnet einen deutschen 19-%-Brutto-Referenzpreis. Die Vorschau
  benennt ihn als unverbindlichen DE-Referenzpreis; tatsächliche Steuer und
  Kundenversand sind erst mit Lieferadresse/Checkout verbindlich bestimmbar.
- Ruling: Eine berechenbare Konfiguration erhält niemals Kauf- oder
  Fertigungsfreigabe. Insbesondere `chamfer_continuous` bleibt schematisch.
- Ruling: Serverseitige Preisnormalisierung erfolgt unabhängig vom Browser;
  Einkaufspreise/Margen bleiben nur im PHP-Modul. Die Antwort enthält allein
  öffentliche Bruttopreis-/Statusfelder.
- Ruling: Der explizite Auftrag, PR #4 nach CI als Basis zu nehmen, ist durch
  den schon erfolgten Merge erfüllt. „Nicht eigenständig mergen“ bezieht sich
  auf den neu zu eröffnenden 0.5.0-PR.

## Arbeitsschritte

1. PR-/CI- und Testbasis prüfen, V3-Quellen ohne Formelanpassung übernehmen.
2. Reine PHP-Normalisierung und Testmodus-Endpunkt mit Admin-/Draft-/Nonce-
   Prüfung entwickeln; negative Sicherheitsfälle zuerst testen.
3. Bestehende Komponente an die Antwort anbinden; Preiszustand und Fehlerfall
   bei schnellen Eingaben sowie mobile Zusammenfassung prüfen.
4. Plugin-Bundle, PHP-/Node-/Browserregression, Paketinhalt und Screenshots.
5. STATUS, ZIP und Prüfprotokolle; neuer PR zur Prüfung, kein Merge.

## Bisherige Prüfung

- V3-Ausgangstest lokal mit offizieller portabler PHP-CLI 8.5.12:
  `PASS 379 assertions; 72 historic cases; minimum margin 40.370%`.
  Die PHP-CLI liegt nur im ignorierten lokalen Testordner.

## Umgesetzt und lokal geprüft

- Plugin-Version 0.5.0 behält die drei Produktzuordnungen, Shadow-DOM-Einbettung,
  16 Bilddekore, Geometrien und Kaufsperren. Die V3-PHP-Klasse ist beim Bau
  bytegleich aus `pricing-v3/HPZ_APL_Price_V3.php` gebündelt.
- Serveradapter `includes/price-preview.php` normalisiert Produkt-ID, SKU,
  Millimetermaße, Plattenstärke, Dekor-ID, Eckseite/-maße und Menge eigenständig.
  Er gibt nur Bruttopreis, Status und Kundentext frei. L/U erhalten keinen
  V3-Preis. Browser-Preisangaben und behauptete Freigabeflags werden ignoriert.
- Der WordPress-AJAX-Endpunkt existiert nur für eingeloggte Nutzer und prüft
  Adminrolle, Bearbeitungsrecht, aktiven Testmodus, Entwurfsstatus,
  Produkt-ID/SKU und Nonce. Ungültige Maße liefern 422; Ausfälle lassen keinen
  alten Preis stehen. Kein Kauf- oder Bestellendpunkt.
- Die bestehende Komponente zeigt die serverseitige Summe und den zutreffenden
  Steuerhinweis. Bei unbekanntem bzw. ausländischem Lieferland wird die deutsche
  19-%-Bruttoreferenz nicht als bereits anwendbarer Steuersatz dargestellt.
  Kundenseitiger WooCommerce-Versand bleibt separat.
- Testresultate und Grenzen stehen in `docs/050-tests.md`. Desktop- und
  Mobilbilder: `docs/050-desktop-preis.png`, `docs/050-mobile-preis.png`.
- Vor einer echten WordPress-Aktivierung offen: Endpunkt und Kaufsperren in
  WooCommerce/Flatsome mit Administrator, Kunde und Gast prüfen; Cache/JS-
  Optimierung, Steuerländer, Flexibel-Shipping-Gewicht, WCPA-Übergabe, reale
  Lieferbarkeit/Teilezerlegung und Sockel-Regression. Keine dieser Prüfungen
  wird durch den lokalen PHP-Harness ersetzt.
