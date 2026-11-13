# Gutscheinpolitik fuer Arbeitsplatten im WooCommerce-Checkout – 13.11.2026

Die 35%-Mindestmarge gilt nur fuer die **normale Produktkalkulation vor Gutscheinen**. Bei von WooCommerce akzeptierten Gutscheinen entfällt die nachtraegliche Margenuntergrenze (auch 50% oder 100% Rabatt).

- Reguläre Preise: unverändert 10% Reserve und 40%-Zielmarge, 35%-Mindestmarge; interne 10 EUR netto unter 190 cm, 60 EUR netto ab 190 cm. Kein extra Kundenspeditionsversand.
- L/U: prueft die 35%-Grenze anhand des originalen, signierten und vom Woo-Warenkorb bestaetigten Brutto-Grundpreises vor Gutscheinen (netto umgerechnet), nicht anhand des rabattierten Warenkorb-Umsatzes.
- Gerade: hatte keine eigene Nach-Rabatt-Margensperre; erlaubt nun ebenfalls echte 100%-Gutscheine mit 0 EUR net.
- Alle anderen Sicherheitsvorgaben bleiben: DE/19% Steuer, Produkt-ID und SKU, signierte Konfigurationsdaten, echte bestehende Woo-Versandrate, positive Basispreise, Mengenlimit, Herstellungsmaterialien und Bestellmetadaten. Negative Nettobetraege oder Manipulationen am normalen Brutto-Preis bleiben gesperrt.
- 5/50/100%-Gutscheine fuer Gerade/L/U und 1899/1900/1901-mm-Grenzen sind im isolierten WooCommerce-CI-Test abgedeckt. Das ist **keine echte Liveshop-Bestellung**.

Offen vor Verkaufsfreigabe:
1. PR mergen, WordPress-Version/Auto-Update pruefen.
2. Geschuetzten Woo-Gast-Checkout auf dem echten holzplatten-zuschnitt.de fuer Gerade/L/U, mit signiertem Warenkorb, 19% MwSt., normalem Versand, Gutschein, Mengen und Bestelldaten kontrollieren; ohne Zahlung, reale Kundenmail und Speedmaster-Auftrag.
3. Produkte L (#1000080) und U (#1000081) nach Live-Freigabe veroeffentlichen, getrennte Betreiber-/Audit-Schalter und Preisfenster bewusst freigeben.
4. Kunden-Produktbeschreibungen auf irrefuehrende "Konfigurationsvorschau"-Formulierungen pruefen.
5. Optionalen gespeicherten Speditionscode weiter deaktiviert lassen.
