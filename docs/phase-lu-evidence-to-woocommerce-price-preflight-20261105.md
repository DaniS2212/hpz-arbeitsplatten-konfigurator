# L-/U-Arbeitsplatten: gesicherte Preis-/Bestell-Vorprüfung (PR #58)

**Status am 05.11.2026: alleinstehender serverseitiger PHP-Vertrag mit synthetischen Tests. Noch weder WordPress-Einbindung noch eine Shopfreigabe.**

Die Originalbilder U1–U4 sichern ausschließlich die visuelle Stoßaufteilung. Aus drei grafischen Flächen ergibt sich **keine reale Zuschnittliste**, und ein screenshotbasierter Anbieterpreis ist nicht automatisch ein verifizierter Netto-EK. Die L/U-Preis-Szenarien aus PR #55 dürfen die WooCommerce-Vorschau/Bestellung derzeit nicht freigeben.

## Neu: `HPZ_APL_LU_Price_Readiness`

- Separate PHP-Klasse in `pricing-v3/HPZ_APL_LU_Price_Readiness.php`. **Nicht** in der installierbaren WordPress-Laufzeit verdrahtet, kein Hook/Endpoint/Schalter.
- Unabhängige serverseitige Validierung der Rohdaten für L1–L4 und U1–U4, Produkt-IDs **1000080/1000081**, Version 2, mm, 16 bekannte Dekore, 17,5/38 mm, 1,5-mm-Dickkante, ausdrücklich nur **ohne Eckbearbeitung**. L3/L4-B1/B2 und B3/B4 müssen übereinstimmen. Eckausführungen müssen später als eigene Preis-/Herstellerfälle geprüft werden.
- SHA-256-Konfigurationsschlüssel für jede exakte Geometrie/Abmessung/Stärke/Dekor/Kante, **mengenunabhängig**. Geänderte Maße oder U1→U2 dürfen niemals eine U1-Herstellerbestätigung erben. SHA ist ein Identitätsschlüssel, **keine** Besitz-/Genehmigungssignatur.
- Nur eine privilegierte **serverseitige** Belegquelle darf Preis und Freigabeprüfung liefern. Mindestfelder: geprüftes Speedmaster-Netto-EK, reales Zuschnittverzeichnis, bestätigter Verbinderplan, Material-/Dekorlieferbarkeit, vollständige Packstücke und physische Versandteillängen, verifiziertes Verpackungsgewicht, Quellen der Verpackungs-/Versand-/Zahlungsnebenkosten, genehmigte Versandraten und begrenzte bestätigte Stückzahl. Nach 30 Tagen ist das Datum erneut zu prüfen. **Keine dieser Felder darf aus Checkout/Frontend-Daten übernommen werden**.
- Interne Anlieferung aus **bestätigten physischen Packstückmaßen**, 10 € bzw. 60 € netto je Platte, sobald die längste Seite mindestens eines tatsächlichen Packstücks **1900 mm** erreicht. Zusätzlich wird geprüft, dass alle verifizierten Zuschnittrechtecke in mindestens ein verifiziertes Packstück passen. Eine möglicherweise kürzer gemeldete Zuschnitt-/Versandteillänge darf den 50-€-Zuschlag **nicht** umgehen. Ein langer Schenkel im Bild ist **kein** Packstücknachweis.
- Zielpreis im reviewbaren Einzelbeispiel: `(EK_netto + Anlieferung_netto + Verpackung_netto + Kundenversand-Kosten_netto + Zahlungs-/Handlingkosten_netto) × 1,10 ÷ 0,60 × 1,19`, auf volle 10 € aufgerundet. Dieses Schema ist nur dann überhaupt berechenbar, wenn die **Betriebsentscheidung** `margin40-reserve10-floor35` ausdrücklich als überprüfte serverseitige Policy vorliegt. Die historische 30-%-EK-Aufschlagsregel wird **nicht** stillschweigend ersetzt.
- Netto-Mindestmarge 35 % wird nach realen WooCommerce-Gutscheinen anhand der tatsächlichen Netto-Warenposition geprüft, samt Stückzahlmultiplikation, Beschaffungskosten, Reserve und weiteren Kosten. Nur DE-19-%-Referenzkontext; andere Länder gesperrt, bis konkrete Shopregeln geprüft sind.
- Eigene manuelle Speedmaster-Übergabe und WooCommerce-Checkout-/Steuer-/Versandnachweise bleiben erforderlich. Der Rückgabewert `purchasable=false` bleibt **immer**, auch wenn synthetische Test-Evidenz alle Voraussetzungen erfüllt. Ein späterer autorisierter Shop-Adapter ist ein gesonderter PR mit expliziter Betreiberfreigabe.

## Testabdeckung und Nutzung

`php -l pricing-v3/HPZ_APL_LU_Price_Readiness.php`
`php pricing-v3/tests/lu-price-readiness.php`

GitHub Action `.github/workflows/pricing-v3.yml` führt diese Tests zusätzlich zu den bestehenden Gerade-/Woo-PHP- und Node-Regressionen aus.

Synthetische Testpläne simulieren U1 mit frei **erfundenem, nur zu Testzwecken als geprüft markiertem** Lieferantenbeleg; das ist **keine** echte Lieferung. Der Referenzpreis der Tests wird bewusst nur nach dem ausdrücklich eingesetzten Test-EK 691,49 € + hypothetischem Transport 60 € und 0 € weitere Kosten berechnet. Kein Kunde sieht diese Summe.

### Nächste konkrete Datenerhebung und Implementierung

1. **Kurzfristig**: Tatsächliche Speedmaster-EKs für L2–L4 und U2–U4 mit expliziter Netto-/Kanten-Bestätigung; für L1/U1 bereits belegte Referenzen zusammen mit Lieferanten-Teileliste/Packstückmaßen nutzen. Die archivierten Fotos können nicht als echte Packstückdaten dienen.
2. Für den **schnellen eingeschränkten Verkaufsstart** nicht alle theoretischen 16 Dekor-/Eck-/Maßkombinationen freigeben, sondern nur exakt verifizierte Lieferangebote. Alle anderen Eingaben bleiben als **Anfrage** statt Bestellbutton.
3. Server-admin-Felder für exakte geprüfte Speedmaster-EK, Zuschnitte, Verbinder und Packstücke; separate Operator-Freigabe für gewünschtes Margenmodell. Erst danach Woo classic/Store API Mengen, Coupon, Steuer, Versand und Gast/HPOS testen.
4. WooCommerce-Bestellpositionen mit **allen** tatsächlichen mm-Maßen, Dekor-/Stärkencode, Kanten, Stoßvariante und Freigabereferenz erfassen. Speedmaster initial **manuell** bestellen; niemals automatisch eine Lieferantenbestellung aus einem Checkout-Ereignis auslösen.
5. Betreiber prüft reale Testbestellung und aktiviert den Verkauf separat; Gerade und andere Produkte bleiben unverändert.

**Abnahmegrenze:** Diese Vorprüfung ist technisch hilfreich, aber ohne verifizierte neue Einkaufs-/Fertigungs-/Versandbelege sind **keine** L-/U-Formen kaufbar. Es ist kein Shop-Preis und keine selbstständige WordPress-Aktualisierung.
