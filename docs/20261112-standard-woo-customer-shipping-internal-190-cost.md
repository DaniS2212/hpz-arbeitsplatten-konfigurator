> **Historischer Beschluss vom 12.11.2026 – seit 13.11.2026 ersetzt.** Die unten genannten **10/60 € und die 190-cm-Schwelle** gelten **nicht mehr** für die aktive Preisberechnung. Jetzt verbindlich: **150 € netto interne Speedmaster-Fracht pro Arbeitsplatte**, einkalkuliert im Produktpreis; Woo-Kundenversand unverändert. Aktuelle Regel: [13.11.2026 – 150 € netto pro Platte](20261113-flat-150-net-inbound.md).

# Verkaufsfreigabe: interne 190-cm-Bezugskosten, normale WooCommerce-Versandkosten
Stand: 12.11.2026, verbindliche Betreiberentscheidung

## Zweck dieser Änderung
Die Ergänzung aus PR #87, welche die Kunden-Versandarten ab 190 cm zusätzlich
filterte und einen speziellen Mindestbetrag bzw. neue WooCommerce-Frachtfreigaben
verlangte, wird zurückgenommen. **Keine neue kundenseitige Versandregel.**

- Die interne Preisrechnung muss bei **konfigurierter Arbeitsplattenlänge**
  unter 1900 mm 10 € netto Beschaffungs-/Anlieferungskosten, ab 1900 mm
  einmalig 60 € netto pro Arbeitsplatte berücksichtigen. Bei L/U gilt die
  bereits implementierte Regel für L1/L2/L3; auch mehrere lange Schenkel
  lösen nur einmal pro Einheit 60 € aus.
- Bestehende WooCommerce-Versandzonen und -tarife für den **Kunden** bleiben
  unverändert. Der Betreiber vermutet aktuell 5,90 € im deutschen Standardfall,
  aber **ein echter Checkout hat diesen Betrag noch nicht verifiziert**.
  Dies ist NICHT mit den internen 10/60 € identisch; keine Doppelberechnung
  oder separate 50-/60-€-Gebühr im Checkout erfinden.
- **Gerade:** Die feste historische V3-Preiskurve wurde bewusst nicht neu
  kalibriert. Die serverseitige Kosten-/Margenprüfung kennt 10/60,
  doch die Kurve hat selbst noch keinen expliziten 1900-mm-Preissprung.
  **Nicht behaupten, dass die reine Gerade-Verkaufspreiskurve diesen
  Schwellenwechsel bereits separat weiterrechnet.**
  Die 72 historischen Lieferantenvergleichspreise dürfen nicht durch eine
  ungeprüfte 50-€-Addition/Reduktion überschrieben werden.

## Was bei der Freigabe trotzdem erforderlich bleibt
- Bestehende Woo Versandrate muss tatsächlich auswählbar und berechnet sein;
  der L/U-Operator-Preisnachweis verwendet die echten (nicht erfundenen)
  Versandraten-IDs, aber keine durch die Länge dynamische Zusatzrate.
- DE-Steuersatz 19%, EUR, aktuelle Woo-Zwischen- und Endbeträge,
  max. erlaubte Menge, Preis-Marge nach Gutscheinen, HMAC/Bestellmetadaten.
- Live-Warenkorbproben Gerade / L / U und 189,9/190,0/190,1 cm.
  Versandtarif nur im *normalen* Woo-Checkout und keine doppelte 60-€
  Kundenfracht. Eine Testbestellung nur ohne Echtgeld/Herstellerauftrag.
- L und U sind am 12.11.2026 in WordPress noch **draft**, Gerade publiziert.
  L/U sind zusätzlich über getrennte Operator-, Checkout- und
  Preismodell-Freigaben gesichert. Kein automatisches Schalten dieser Flags.

Tests: `wordpress/sale-launch-090/tests/standard-shipping-contract.php`
und bestehende `pricing-v3/tests/launch-commercial-coverage-20261109.php`,
`wordpress/checkout-lu/tests/lu-operator-boundary-1900.php`.
