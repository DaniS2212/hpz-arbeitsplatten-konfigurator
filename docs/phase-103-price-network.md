# Gerade 1.0.3 – Fehlerbehebung vor öffentlichem Shopstart

## Befund aus dem echten Shop am 30.10.2026

- **120 × 60 cm / 38 mm / Platinweiß / ohne Ecken:** Nach langer Anzeige „Wird berechnet …“ endete die Preisvorschau mit „Preis offen“. Bei den zulässigen Maßen muss der **PHP-V3-Preis 510,00 € brutto** lauten.
- **350 × 90 cm / 38 mm / Platinweiß / ohne Ecken:** Shop zeigte **2.030,00 € brutto**; Speedmaster **855,95 € EK**. Das ist plausibel, wenn Speedmaster den Nettopreis angibt.
- Unabhängiger Fehler im Produktkopf: WooCommerce zeigte sein standardmäßiges „In den Warenkorb“, obwohl es keine signierte individuelle Konfiguration übergibt. Beim Klick wird die Seite neu geladen.

Die Ursache des *konkreten* ausgebliebenen Live-HTTP-Preises kann ohne WordPress/HostPress-Logs nicht abschließend festgestellt werden. Die aktuelle V3-Formel und WordPress-PHP-Preisprüfung unterstützen die 120×60-Größe, daher darf sie nicht als Lieferanten- oder Maßfehler behandelt werden.

## Fix 1.0.3

1. Öffentlicher PHP-Preisabruf aus **WordPress**: zeichnet weiterhin sofort, aber versucht bei kurzzeitigen 429/5xx-Antworten, kaputten Gatewayantworten, Netzwerkfehlern oder Timeout **ein zweites Mal**, mit eigener Deadline und stets der jüngsten Konfiguration. Kein Retry bei 422 ungültigen Maßen oder 401/403 abgelaufener Sitzung. Bei wiederholtem Fehler: **„Preis erneut berechnen“**. Der Button ist nur in diesem Fall sichtbar.
2. Es wird **kein lokaler Preis geraten** und der Konfigurator-Warenkorb bleibt bei fehlerhafter Preisantwort gesperrt. Alle V3-/HMAC-/WooCommerce-Kassenprüfungen bleiben bestehen.
3. Für Produkt **1000083, veröffentlicht und Verkaufsfunktion aktiv**, wird der native WooCommerce-Warenkorb-Formular-Hook entfernt und durch einen sichtbaren CTA **„Jetzt konfigurieren“** ersetzt. Dieser springt zum Abschnitt mit der ID `hpz-apl-konfigurator`; der Sticky-Header erhält 110px Abstand. CSS versteckt die Standard-WooCommerce-`form.cart` nur auf dieser Produktseite, falls Flatsome/andere Templates das Formular direkt ausgeben. L/U, andere Produkte und WooCommerce-Kasse bleiben unbeeinträchtigt.
4. Plugin-Version und Cache-Busting 1.0.3. CSS-Design entspricht dem vorhandenen Petrol-Stil.

## Abnahme

- 120×60/38/W980/ohne Eckbearbeitung: **510 € brutto** und aktiver Konfigurator-Warenkorb nach erfolgreicher PHP-Abfrage.
- 350×90/38/W980/ohne Eckbearbeitung: **2.030 € brutto**.
- 250×80/38/W980/beidseitig durchlaufend, 15×15 und 20×20: **910 € brutto**.
- Im Produktkopf nur „Jetzt konfigurieren“; Anker scrollt zum Konfigurator. Keine zweite Standard-Kaufmöglichkeit.
- Eine vorübergehend gestörte Preisantwort löst maximal einen automatischen Retry aus. Bei dauerhaftem Ausfall ist nur der Retry-Knopf sichtbar, **kein** Kassenknopf.
- WooCommerce-Warenkorb/Checkout inkl. Netto/Brutto/Versand unverändert.
- Produkt bleibt bis zum erneuten 120x60-Live-Test mit Sichtbarkeit „Versteckt“. Erst dann Katalogsichtbarkeit bewusst auf „Shop und Suchergebnisse“ ändern. L/U bleiben unverkaufbar.

Es wurde durch die PR **keine WordPress-Installation, Livezahlung oder Produktveröffentlichung** vorgenommen.
