# Classic Warenkorb: vorzeitige Checkout-Sperre bei Arbeitsplatten (13.11.2026)

**Live-Meldung:** Gerade, Bardolino Eiche H1145 ST10, 1899 × 600 mm, 38 mm.
Im Shop-Warenkorb 670,00 EUR Produkt, 6,90 EUR Kundenversand,
676,90 EUR Gesamt, 108,08 EUR enthaltene MwSt. Der Button
"Weiter zur Kasse" blockierte mit der generischen Arbeitsplattenmeldung.
Kein Auftrag oder Zahlung ausgelöst.

**Codeanalyse:** Auf holzplatten-zuschnitt.de sind die Seiten `warenkorb`
(ID 19) und `kasse` (ID 20) ausdrücklich WooCommerce-Shortcodes
`[woocommerce_cart]` und `[woocommerce_checkout]`. Bis PR #92 lief
`finalChecks()` im Hook `woocommerce_check_cart_items`, den Woo
schon beim Anzeigen des Warenkorbs ausführt. `finalChecks()`
verlangt zwingend eine serverseitig schon ausgewählte Versandrate und
DE/19%-Checkout-Kontext. Damit kann ein noch nicht vollständig
ausgefüllter Warenkorb den Benutzer daran hindern, die Kasse
überhaupt zu erreichen. Der exakte fehlgeschlagene Code des Live-Tests
ist anhand der generischen Meldung **noch nicht eindeutig bewiesen**.

**Gezielte Änderung:** Trennung der Prüfphase bei Gerade UND L/U:
- `woocommerce_check_cart_items`: signierte, unveränderte
  Konfiguration, Menge, Produkt-ID/SKU und aktive L/U-Produktfreigabe
  prüfen. Keine frühe Forderung nach bereits ausgewählter Rate.
- `woocommerce_checkout_process`: **unveränderte** `finalChecks()`
  mit 19% DE Steuern, serverseitig berechneter und angebotener
  normaler Woo-Versandrate, Preis vor Rabatt, Nettoumsatz nach Coupon,
  gültiger Signatur/Menge, manuellen Fertigungsdaten. Keine Änderung
  der Versandkosten oder Preisformel.
- Zusätzlich bleibt `woocommerce_checkout_create_order_line_item`
  bis zur Speicherung streng validiert. Store API-Finalprüfungen
  bleiben ebenfalls unverändert; der Liveshop verwendet die
  klassischen Shortcode-Seiten.
- Sicherheitsregressionen prüfen auch ungültige HMAC-Signaturen,
  fehlende Versandrate in der Kasse und deaktivierte Produkte.

**Zurückgestellt:** Es wird weder ein Live-Testauftrag erzeugt,
noch Woo-Preise/Versandzonen, Zahlungsarten, L/U-Produktstatus oder
Verkaufsoptionen geändert. Die separat archivierte 190-cm-
Kunden-Speditionsregel bleibt deaktiviert.

Nach Merge und Plugin-Update den originalen, noch offenen
Warenkorb-Test im Live-Shop wiederholen. Wenn der Checkout dann
noch blockiert, ohne echte Bestellung weiter bis zum Formular gehen
und den Fehlercode/Status diagnostizieren – niemals die finale
Checkout-Prüfung lockern, nur um einen Test grün zu bekommen.
