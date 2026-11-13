# HPZ Gerade - Preisregel V3 (rechenfertig, nicht kaufbar)

Stand: 26.10.2026. Die Grundpreise, die 16 Dekoraufschlaege und +120 EUR brutto
pro Platte mit Eckbearbeitung sind betriebswirtschaftlich vom Nutzer bestaetigt.
Diese Dateien sind ein eigenstaendiges PHP-Modul ohne WordPress-Hooks.
**NICHT als Checkout-, Bestell- oder Fertigungsfreigabe verwenden.**

## Inhalt

- `HPZ_APL_Price_V3.php`: autoritative serverseitige Preisberechnung fuer
  *Gerade*, Material `APL17.5`/`APL38`, 16 interne Dekorcodes,
  1,5-mm-dekorgleiche Kanten und 10 Eckzustandsklassen.
- `tests/run.php`: 379 lokale Assertions, davon 72 historische EK-/Margenfaelle
  aus `../docs/price-v3-reference-checks.csv`.
- `../docs/price-rule-v3-candidate.md`: fachliche Preisformel und Quellenfenster.

## Testen

`php -l pricing-v3/HPZ_APL_Price_V3.php`

`php pricing-v3/tests/run.php`

Ergebnis beim Erstellen: 379 Assertions bestanden, 72 Vergleichsfaelle,
Minimum 40.370 % auf historischen Referenzen. Ein echter WooCommerce-Laufzeittest
ist noch **nicht** durchgefuehrt. Das 35-%-Floor ist ein getrenntes serverseitiges
Schutzgatter, keine Aussage ueber alle nicht belegten Lieferantenkombinationen.

## Schnittstelle fuer den spaeteren WooCommerce-Adapter

1. **Serverseitig selbst** die Kundenrohdaten normalisieren und die Geometrie,
   Material-/Dekorverfuegbarkeit und exakte Lieferbarkeit bestaetigen. Nicht
   nur der Browser-Normalisierung glauben. Der Preisrechner verlangt bereits
   `schemaVersion=2`, `unit=mm` und ganzzahlige normalisierte Maße.
2. `HPZ_APL_Price_V3::quote($validatedNormalizedConfig)` aufrufen.
   Nur als Referenz liefert es `unitGrossReferenceCents` und
   `totalGrossReferenceCents`. Diese Werte sind Bruttopreisbeispiele fuer DE
   mit 19 % USt., je volle 10 EUR **aufgerundet**. Alle gelieferten Zitate
   setzen `purchasable=false`. Keine Lieferanten-EK im Ergebnis.
3. Vor Bestellung eine unabhaengige **serverseitige** Quelle fuer den tatsaechlich
   geprueften Speedmaster-EK **dieser** Kombination und fuer die wirklichen
   Versandteillangen heranziehen. Bei fehlenden Daten: sperren / manuell pruefen.
4. Seit 13.11.2026 gilt pro Arbeitsplatte eine **feste interne
   Speedmaster-Anlieferung von 150 EUR netto**. Das ersetzt die komplette
   alte 10/60-EUR-Regel; die Laenge spielt keine Rolle mehr.
   `inboundCostForVerifiedParts($trustedPartLengthsMm)` validiert weiterhin
   Laengen, liefert aber immer **15000 Cent pro konfigurierte Platte**.
   Im Brutto-Produktpreis inklusive, **nicht** als Kunden-Versandgebuehr.
   Gerade historische V3-Preiskurve +330 EUR brutto je Platte, L/U
   Lieferanten-EK +150 EUR netto als Basis der 40%-Zielmarge.
   Aktueller Vertrag: `docs/20261113-flat-150-net-inbound.md`.
   Nie von Browser-Werten ableiten.
5. Nach WooCommerce-Rabatten/Steuermodell mit der **wirklichen Netto-Einnahme**
   (ohne USt, nach Coupons) `checkNetMarginForParts($supplierNetCents,
   $trustedPartLengthsMm, $actualNetRevenueCents)` erneut pruefen. Unter 35 %
   => Bestellung verhindern. 40 % bleibt Ziel. Kosten und Einnahmen muessen
   einheitlich **pro Einzelplatte** oder einheitlich als Gesamtmengenbetraege
   behandelt werden. Beim Gesamtbetrag muessen Beschaffungskosten ebenso
   mit der Menge multipliziert werden.
6. WooCommerce ist allein zustaendig fuer die **tatsaechliche** Mehrwertsteuer,
   Versandgebuehr, Couponanwendung, Warenkorbpreis und Bestellmetadaten. Die
   19-%-Referenzbruttopreise duerfen **nicht blind als Netto-Preise** an Woo
   uebergeben werden; die Shopkonfiguration fuer inkl./exkl. Steuer bestimmt
   die spaetere Umrechnung. Keine feste 19-%-Steuer bei Auslandskunden annehmen.

## Bewusst enge Preisreferenz-Fenster

- APL17.5: L 2000-3000 mm, B 600-1200 mm.
- APL38: L 2000-3000 mm, B 600-881 mm.
- Durchlaufende Eckvorschau: derzeit nur 2000 x 600 mm. Abschraegungs- und
  Rundungsmasse folgen konservativen Vorschaugrenzen, ohne Lieferantenfreigabe.
- Unbekannte Dekore, andere Staerken, L/U, andere Kanten, Null-/Bruchmasse,
  nicht bestaetigte Rundungs-/Eckkombinationen: strikte Ablehnung.

Diese Grenzen sind **unser Testfenster**, keine behaupteten Speedmaster-
Produktionsgrenzen. Errechnete Preise allein belegen niemals einen tatsaechlich
moeglichen Auftrag. Auch das 40-%-Testergebnis ist nur innerhalb der
vorliegenden historischen 72 Vergleichsfaelle nachgewiesen. Die tatsaechliche
Margenpruefung muss deshalb erst bei nachgewiesenen EK erfolgen.

## Integration und bestehender Entwicklungsstand

- Preisentwicklung laeuft unabhaengig von Work Version 0.4.0 (Dekore).
- Keine Aenderung an `local/private/pricing.mjs`, `local/core/config.mjs`,
  WordPress-Plugin, WCPA, Checkout, Produktentwuerfen oder Live-Shop.
- Vor Integration PR #3 nach Merge von 0.4.0 konfliktarm uebernehmen,
  PHP-Normalisierung und bestaetigte Teile-/Lieferantenpruefung implementieren,
  die Preisregel mit WooCommerce-Steuer-/Couponkonfiguration real testen und
  die bestehende Kaufsperre erst nach separater Freigabe entfernen.