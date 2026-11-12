# Arbeitsplatten: Verkaufsstart-Preflight und Versandentscheidung (12.11.2026)

## Verbindliche Versand-Voreinstellung

Aktiv bleibt PR #88: **normale WooCommerce-Versandraten für Kunden**, ohne
separaten 190-cm-Tarif. Intern werden die 10 EUR netto vor 1900 mm und die
60 EUR netto ab 1900 mm über die V3-Beschaffungskalkulation für L/U berücksichtigt.
Bei Gerade greift derselbe Schwellwert in der Kosten-/Margenprüfung; die
historische Verkaufspreiskurve hat **keinen separaten Preissprung bei 190 cm**.

**Noch keine endgültige Entscheidung:** Daniel klärt mit Marco, ob später
kundenbezogen ein eigener Speditionsversand gefordert werden soll. Die damalige
Prüflogik aus PR #87 ist deshalb als **inaktiver Referenzcode** unter
`wordpress/optional-freight-190/` wiederhergestellt. Sie wird weder
in `build-plugin.mjs` aufgenommen noch von WordPress geladen. Ein späterer
Versandwechsel ist ein gesonderter, gezielt freizugebender Änderungsschritt.

Die historische Woo-Filterlogik hat **nie selbst einen Woo-Versandtarif angelegt**.
Vor späterer Aktivierung müssen tatsächliche Woo-Versandzonen und Rate-IDs
geprüft und der alte Code noch einmal auf Woo-Pakete, signierte
Konfigurationsdaten, Preise und Wechselwirkung mit Fremdartikeln getestet werden.

## Was maschinell nachgewiesen ist

- PR #88 entfernt die zusätzliche Checkout-Pflicht für eine eigene
  190-cm-Rate und reicht den tatsächlich gewählten bestehenden Woo-Tarif
  durch. Synthetischer Test: `standard-shipping-contract.php`.
- L/U: für L1/L2/L3 1899/1900/1901 mm, mit einem einzigen internen
  Kostenansatz pro Arbeitsplatte. Bestehende L/U-Preis-/Signatur-/Order-Tests
  prüfen die Server-Preisregeln, Gutscheinschutz und Bestellmetadaten.
- Gerade: 16 Dekore x 2 Stärken x 1899/1900/1901 mm ohne Ecken,
  einschließlich historischer 2000x600-mm-EK als **Näherung**, 10-%-
  Kostenreserve und 35-%-Mindestmarge. Ergebnis wird in CI ausgegeben.
  **Wichtig:** Ein solcher Referenz-EK ist **keine neue Lieferantenzusage**
  für 189,9 / 190,0 / 190,1 cm. Die 40-%-Zielmarge wird nicht bei jedem
  dieser Proxy-Fälle erreicht. Alte V3-Referenzpreise werden nicht verändert.
- Das frühere Woo-Speditionsmodul liegt nur als wiederherstellbare Quelle
  bereit. `dormant-freight-190.php` prüft, dass es nicht in die aktive
  WordPress-Verkaufslogik/ZIP rutscht.

## Was vor öffentlichem Verkaufsstart **noch** live zu prüfen ist

1. WordPress-Version nach CI-Release/Auto-Update prüfen; zuletzt per
   WordPress-Pluginliste gesehen: **1.0.3.361**, noch kein Nachweis
   der Installation von PR #88.
2. Product Status / SKU / Steuern auf den IDs 1000083 (Gerade),
   1000080 (L) und 1000081 (U) live verifizieren.
3. In einem kontrollierten echten WooCommerce-Checkout für Gerade, L und U
   sowie 189,9 / 190,0 / 190,1 cm: gültige Konfiguration, Brutto-/Nettopreis,
   normale Versandmethode und realen Kundentarif, 19-%-Steuer, Gutschein,
   Menge und signierte Bestelldaten prüfen. Kein Echtgeld, keine manuelle
   Speedmaster-Bestellung auslösen.
4. Erst nach Ergebnis und expliziter Betreiberfreigabe Verkaufsoptionen
   setzen und L/U-Produkte aus Entwurf veröffentlichen. Bis dahin keine
   Test-/Orientierungstexte allein durch CSS verstecken.

Der WordPress-Produktabruf war bei der letzten API-Prüfung nicht zuverlässig
erreichbar (Timeout). Dadurch sind **keine** realen WooCommerce-Testbestellungen
oder Transportart-/Kundenpreisnachweise entstanden.
