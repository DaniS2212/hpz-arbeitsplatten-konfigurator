# Verkaufsfreigabe – automatische Preisabdeckung und getrennte Woo-/Versandprüfung
Stand: 09.11.2026 · **Nur CI/Sandbox, keine Shop-Veröffentlichung oder Bestellung**

## Umfang des neuen Preis-Matrix-Tests

`php pricing-v3/tests/launch-commercial-coverage-20261109.php`

- **Gerade**: 16 Dekore × 2 Materialstärken × 11 Grenz-/Beispielmaße ×
  keine Bearbeitung sowie je Seite (links, rechts, beide) ×
  Rundung, eckige Abschrägung, Kante durchlaufend.
- **L1–L4 und U1–U4**: 16 Dekore × 2 Stärken × 8 Formen ×
  10 sinnvolle Szenarioklassen (100/130, 189,9, 190, 190,1, 200, 225, 250, 400 cm,
  kombinierte Änderungen, große Breiten); ohne Bearbeitung.
- **L/U-Eckbearbeitung**: 16 Dekore × 2 Stärken × 8 Formen ×
  Seite links/rechts/beide × rund/eckig/durchlaufend mit getrennten
  Bearbeitungsmaßen im ausdrücklich gebilligten **Preismodell**.
- Bei allen Fällen echte **PHP-Normalisierung**, gleicher L/U-Ratenrechner wie im
  WordPress-Plugin, Preisberechnung nach V3 mit 10% Reserve / 40% Zielmarge,
  Bruttorundung auf 10 €, explizite Freigabe-Flags für geschätzte Preise und
  Eckbearbeitung, eindeutige Fingerprints. Ohne Betreiber-Policy keine Proofs.
- Separate Grenztests für **1899 / 1900 / 1901 mm** auf allen L-Achsen,
  einmalige 50 € Zusatzbezugskosten je konfigurierter Einheit auch bei
  mehreren langen Schenkeln. Mengenlogik und Checkout-Signaturen sind in
  bestehenden `wordpress/checkout-lu/tests/lu-cart-order.php` und
  `wordpress/checkout-lu/tests/lu-runtime-hooks.php` abgesichert.

**Grenze der Methode:** Es sind repräsentative Grenz- und Äquivalenzklassen,
**nicht** jede theoretische Millimeter-Kombination im riesigen kartesischen
Maßraum. Bei Normalisierung abgewiesene Maße sind nicht automatisch
kalkulierbar; jede konkrete Kombination muss beim Kundenklick erneut
serverseitig validiert werden. Geometrische/Hersteller-Lieferbarkeit ist von
kaufmännischer Preiskalkulation getrennt.

## Entscheidend: Was mit 190 cm tatsächlich getestet ist

Der L/U-Ratenrechner enthält ab **einer konfigurierten L-Achse ≥1900 mm**
einmalig **60 € statt 10 € interne Netto-Anlieferungskosten** und kalkuliert
damit den Verkaufspreis. Das ist **kein automatisch ausgewiesener
Speditionszuschlag für den Kunden im WooCommerce-Checkout**. Der Kundenversand
kommt aus den **separat konfigurierten** WooCommerce-Tarifen; der Adapter
prüft nur die ausgewählte und explizit erlaubte reale Versandmethode sowie
den von Woo berechneten Betrag.

Die vorliegende GitHub-Sandbox kann die tatsächlichen
**Woo-Versandzonen/Flexible-Shipping-Regeln, Produktgewichte, Tarife und
Versandsteuern im echten Shop** nicht verifizieren. Deshalb kein erfundener
„versandfertig“-/„Spedition automatisch aktiv“-Status. Vor Freigabe müssen
1899/1900/1901 mm im realen deutschen Gast-Checkout durchgespielt und
die beobachteten Versandmethoden/-beträge dokumentiert werden.

## Zusätzliche Anti-Unterpreisungskorrektur

Bei U-Sonderbearbeitungen darf kein Aufrufer den **unbearbeiteten** Ratenrechner verwenden. Die Basis- und erweiterte Preisfunktion weisen daher normalisierte Konfigurationen mit gesetzter `uCorner` ausdrücklich ab. Die Bearbeitung erhält ausschließlich über `uCornerCandidate()` ihren separat kalkulierten Preis. Ein Negativtest für alle vier U-Formen und alle neun Eckklassen ist Teil der CI. Dadurch bleibt die Bestellung gegen ein versehentliches Weglassen des Eckzuschlags geschützt.

Der zusätzliche synthetische Checkout-Test `wordpress/checkout-lu/tests/lu-operator-boundary-1900.php` führt die genehmigungsabhängige Modellkalkulation **über signierte Warenkorbzeile bis zu HPOS-Bestellmetadaten** bei 1899/1900/1901 mm. Das prüft zugleich den einmaligen internen Speditionsbetrag, DE-Mehrwertsteuer, zu geringe Rabattmargen und unzulässige Woo-Versandmethoden, ohne reale Kundentarife zu erfinden.

## Freigabegatter, die unabhängig von Preisabdeckung bleiben

1. L/U: `HPZ_APL_LU_11_AUDITED_RELEASE`, Woo-Produkte published,
   `hpz_apl_lu_sale_v1.enabled`, manuelle Speedmaster-Übergabe und
   `woocommerce_checkout_verified`.
2. Je Preisfenster: `hpz_apl_lu_price_window_v1` mit bestätigtem
   nicht-negativem **echtem Zusatzkostenansatz**,
   `model_price_approved`, für sonstige Maße
   `extended_model_approved`, für Bearbeitungen
   `corner_model_approved`, erlaubten realen Versandraten und Menge.
   Das sind Shopbetreiberentscheidungen, keine Werte aus dem Browser.
3. Die bestehende HMAC-Warenkorbbrücke, aktuelle Preisquelle,
   echte Woo-DE-Steuern, rabattsichere Netto-Marge ≥35%,
   Mengen- und Lieferbarkeitsprüfung, sichere Bestell-/Produktionsmetadaten.
   **Andere Zielländer sind derzeit nicht freigegeben.**
4. Gerade hat einen getrennten V3-Verkaufsfreigabepfad, der ebenso
   einen verifizierten WooCommerce-Checkout und reale Steuer-/Versanddaten
   voraussetzt.
5. Ein vollständiger Test bis zur erzeugten Woo-Bestellung auf einer
   geeigneten Testumgebung ist durch die hier ausgeführten isolierten
   PHP-/Browser-Suiten nicht ersetzt. **Kein echtes Geld, keine
   Hersteller-Bestellung** durch diesen PR.

## Entscheidung nach CI

- **Grün:** Für die erfassten validen Szenarioklassen ergibt die bestehende
  Preisregel durchgehend positive, korrekt gerundete Preise.
- **Rot:** In der CI-Ausgabe unter `UNPRICED` sind die konkreten
  Form/Stärke/Dekor/Maß-/Eck-Konfigurationen gesammelt; diese müssen
  gezielt korrigiert oder als nicht angebotene Fälle kenntlich gemacht werden.
- Selbst **grüner Preis-Matrix-Test ist keine Live-Verkaufsfreigabe**.
  Die obigen Woo-Kaufgatter werden bewusst unverändert gelassen.

## Versand-Zweikreis-System

- Interne kalkulatorische 10/60 €: im L/U-Produktpreis enthalten.
- Kundenseitiger Versand: **separates** WooCommerce-Versandangebot.
  Nicht doppelt kassieren, aber auch keine kostenlose/falsche
  Versandmethode bei langen, schweren oder unbekannten Platten zulassen.
- Die Produkt-/Verpackungsgewichte müssen den echten Woo-Versandtarifen
  entsprechen. Über 190 cm ist nicht zwangsläufig die einzige
  Klassifizierungsgröße; Gewicht, Speditionsbedingungen und Land sind
  unabhängig zu prüfen.
