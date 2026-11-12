# Checkout-Test: regulärer Woo-Kundenversand muss vorhanden sein

Stand: 12.11.2026, vor der öffentlichen Verkaufsfreigabe.

## Korrektur für Gerade

Der frühere reine PHP-Warenkorbtest ließ die Gerade durch, wenn **gar
keine Woo-Versandrate gewählt oder berechnet** war. Das war für einen echten
WooCommerce-Checkout keine ausreichend sichere Bestätigung.

`HPZ_APL_WC_Cart_Bridge_08::checkout()` prüft nun den tatsächlichen
trusted Woo-Kontext: `shippingCalculated=true`, nichtleere ausgewählte
Rate-ID und nichtnegativen numerischen Centbetrag. **Es wird keine
190-cm-Speditionsversandmethode eingeführt und keine Woo-Rate gefiltert.**
Ein vorhandener legitimer Nulltarif (kostenloser Versand) ist möglich,
wenn Woo ihn selbst berechnet.

Drei Grenzeingaben 1899/1900/1901 mm mit derselben validen
Kundenversandart und fehlende/ungültige Versandwerte sind separat in
`wordpress/checkout-v08/tests/simple-101.php` abgedeckt.
Die vorhandenen Signatur-, Mengenkorrektur-, Steuer- und Bestellmetadaten-
Tests sowie Preisregressionen laufen unverändert durch.

## Live-Befund (Shopkonnektor, read-only)

- Plugin auf holzplatten-zuschnitt.de: 1.0.3.363.
- Produkt 1000083 Gerade veröffentlicht; 1000080 L und 1000081 U Entwurf.
- Shopwährung EUR; `woocommerce_prices_include_tax=yes`, deutsche
  Standardsatzrate 19%, Steuern eingeschaltet.
- Flexible Shipping ist aktiv. Versandzonen und -tarife werden durch
  diese Änderung NICHT angefasst.
- Aktuelle, unterschiedliche echte Netto-Versandbeträge im Shop:
  5,80 EUR / 8,32 EUR / 67,23 EUR. Deshalb **nicht** auf den früher
  vermuteten pauschalen Kundentarif von 5,90 EUR festlegen.
- Der tatsächliche Woo-Checkout für eine **konfigurierte** Arbeitsplatte
  ist damit noch nicht belegt; öffentliche Produktanbindung
  und L/U-Freigaben sind weiterhin bewusst geschlossen.

## Weiterer notwendiger End-to-End-Schritt

Geschützt im echten Shop/staging für Gerade, L, U die Kette testen:
konfigurieren -> signierten Warenkorb erzeugen -> Woo-Versand/Steuer
berechnen -> Menge/Gutschein kontrollieren -> vor Absenden überprüfen
-> Woo-Bestellpositionsmetadaten prüfen (nur in nicht zahlungswirksamem
Testauftrag). **Kein Echtgeld, keine echten Kundenmails, keine
Speedmaster-Order ohne Freigabe.**

**Bekannter offener Prüfpunkt:** Der vereinfachte Gerade-Warenkorbadapter
prüft noch keine aus Lieferanten-EK abgeleitete 35-%-Mindestmarge nach
Gutscheinen. Er ist daher nicht voll freigabefertig für Rabatte.
Die L/U-Pricing-Readiness hat dafür bereits ihren eigenen Prüfer.
Eine spätere gerade Preis-/Coupon-Guard darf nicht unbemerkt die
historischen V3-Verkaufspreise verändern.
