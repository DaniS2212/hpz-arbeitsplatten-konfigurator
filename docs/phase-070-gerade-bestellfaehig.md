# 0.7.0 – Gerade: sichere Verkaufsprüfung und vollständiger Bestell-Datenvertrag

Stand 29. Oktober 2026. Noch kein öffentliches Produkt, kein Woo-Checkout und keine automatische Speedmaster-Bestellung.

## Technisch umgesetzt

- Serverseitige, mengenunabhängige Signatur für **eine exakt normalisierte** Gerade-Konfiguration: Länge und Tiefe in mm, Stärke, 1,5-mm-Dickkante, eines der 16 Dekore, Eckseite/-art und passende Sondermaße. Eine andere Konfiguration kann keinen zuvor geprüften Lieferantennachweis übernehmen.
- V3-Preisformel **unverändert**. Preise bleiben die bekannten **DE-Brutto-Referenzen**, mit 0,1-cm-Eingaben als exakten Millimetern.
- Exakte **serverseitig autorisierte**, zeitlich befristete Speedmaster-Nachweise (nicht aus Besucher-Formularfeldern) als Vorbedingung: Lieferbarkeit der gewählten Material-/Dekorkombination, Lieferanten-EK netto, Referenz, Menge, bestätigte Versandteillängen. Für Gerade wird konservativ ein einzelnes Versandteil genau in Außenlänge angenommen – keine erfundene Teilung zum Wegfall der internen 50-EUR-Langtransportpauschale.
- Zusätzlich nur **belegtes verpacktes Gewicht, Paketmaße und freigegebene Versandmethode**; bestehende WooCommerce-/Flexible-Shipping-Preise bleiben unverändert.
- WooCommerce-Steuer- und Produktpreisnachweis, tatsächlich nach Coupons eingenommener Netto-Positionswert, Mengenmultiplikation der EK-/Beschaffungskosten, **35-%-Margensperre nach 10 % Reserve**.
- Erste Freigabematrix ausdrücklich nur für **Deutschland**. EU/CH und weitere Länder benötigen eigene Versand- und Steuerprüfung.
- Vollständiger strukturierter Fertigungs-/Bestelldatensatz (L/B, Stärke, Dekorname, interne Codezuordnung, Eckseite, Sondermaße, Anzahl, Preisregel). **Keine Lieferanten-EK, Margendaten oder intern vertrauliche Werte an die Kundenschnittstelle.**
- Fehlende Nachweise liefern konkrete Sperrgründe. Selbst ein vollständig ausgefüllter synthetischer Testfall setzt **niemals** `purchasable=true`. Es gibt noch keine Verkaufs-Hooks oder Schalter.

PHP-Modul: `pricing-v3/HPZ_APL_Straight_Sale_Readiness.php`.
PHP-Regressionsprüfung: `pricing-v3/tests/sale-readiness.php`.
Beide sind aktuell von der WordPress-Testplugin-Laufzeit **isoliert**, damit bestehende Produktsperren nicht versehentlich verändert werden.

## Welche Nachweise aus unserer Recherche existieren bereits?

- 16 Dekore und zwei Stärken sind im Konfigurator dokumentiert.
- 57 historische **reguläre** EK-Referenzfälle und 15 historische Eck-Referenzen sind vorhanden (Datei `docs/price-v3-reference-checks.csv`).
- Preisregel V3 hat für diese Referenzfälle die kalkulierte Mindestmarge bestanden.
- Diese alten EK-Testfälle **ersetzen weder** die aktuelle Speedmaster-Lieferfreigabe der konkreten Maßkombination **noch** belegte Paketgewichte oder Versandpreise. Referenzdatensätze werden **nicht automatisch** in Lieferantennachweise verwandelt.

## Schritt 0.8 – tatsächlicher WooCommerce-Warenkorb

1. Privilegierte Serververwaltung für bestätigte Liefer-/Kosten-/Gewichtsdaten pro freigegebener Konfiguration oder nachweislich vollständigem Lieferanten-Preisbereich. Mit Änderung/Fristablauf sofortige Sperre.
2. Kunden-Frontend mit einer einzigen verbindlichen Bestellaktion **nur für Gerade**. Unveränderliche Session-Verknüpfung der geprüften Konfiguration; Browserpreis oder manipulierte Genehmigung niemals übernehmen.
3. WooCommerce klassischer Warenkorb **und** Store API: Add-to-cart, Preis-/Steuerkontext, Menge/Adresswechsel, Coupons, Versandmethode und Checkout an allen Eintrittspunkten erneut prüfen.
4. Order-Metadaten für Produktion/Speedmaster, Admin-Lieferschein und Kundenanzeige korrekt speichern. Manuelle Bestellung bei Speedmaster genügt zu Beginn; keine API-Verpflichtung.
5. Weitere Produkte und Möbelsockel als Regression vor/nach Umsetzung unverändert. Gast-/Kundenrollen, Checkout-Blöcke, HPOS, Zahlungen, Versand/Steuern sicher testen. Kein Live-Test mit Echtgeld-Bestellungen.
6. Nach kompletter Prüfung und ausdrücklicher Freigabe von Shopbetreiber: genau die sichere Gerade-Freigabe aktivieren. L/U bleiben gesperrt.

**Verkaufsstart-Blocker:** Es fehlen echte aktuelle Speedmaster-Liefer-/EK-Bestätigungen je freigegebenem Maß-/Dekorbereich, belegte verpackte Gewichte, bestätigte Woo-Versandmethoden, echte Steuer-/Checkout-Tests und Freigabe des Shopbetreibers.
