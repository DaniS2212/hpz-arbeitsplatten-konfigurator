# VERBINDLICHE interne Speedmaster-Fracht: 150 € NETTO pro Arbeitsplatte

**Betreiberentscheidung vom 13. November 2026.** Ersetzt die
historische 10/60-€-Regel vollständig in der aktiven
Kalkulations-/Margenprüfung und den Verkaufspreisen.

## Regel

- **150,00 € netto pro fertig konfigurierter Arbeitsplatte.**
- Gilt **für Gerade, L1–L4 und U1–U4**, für jedes Dekor, jede Stärke,
  Länge und jede zulässige Eckbearbeitung. Auch unter 190 cm.
- **Genau einmal pro Stück**, selbst wenn die L-/U-Platte mehrere
  Schenkel, Teilflächen oder Lieferpakete hat. Bei Menge 2 wird der
  Kostenansatz zweimal angesetzt. Nicht einmal pro Bestellung.
- **Nie als zusätzliche WooCommerce-Versandposition**. Der Kunde sieht
  weiterhin den Brutto-Gesamtproduktpreis inklusive interner
  Speedmaster-Anlieferung und getrennt den unveränderten **normalen
  Shopversand** nach echten Woo-Zonen und Checkout-Adresse.
- Die 150 € sind **NETTO**. Die bestehende kaufmännische Richtlinie
  bleibt: 10 % Kostenreserve, 40 % Zielmarge, 35 % Mindestmarge der
  regulären Vor-Gutschein-Bepreisung für L/U, DE 19 % USt. exakt einmal
  über den Woo-Steuerkontext. L/U-Gutscheine bleiben wie vereinbart
  auch bei niedrigerer Nach-Gutschein-Marge erlaubt.
- Keine private Lieferantenfracht als separates, an den Kunden
  ausgegebenes Order-Meta oder Kundentextfeld speichern.

## Umsetzung der beiden Preisfamilien

L/U nutzt wie zuvor ausschließlich den serverseitig geprüften
Speedmaster-Netto-EK samt Modell-/Preisfreigabepolicy:
```
netCostPerUnit = supplierNetEK + 150 EUR + approvedOtherNetCosts
grossUnit = roundUpTo10EUR(netCostPerUnit * 1.10 * 1.19 / 0.60)
```

Gerade nutzt die bewährte historische V3-Maß-/Dekor-Bruttoformel.
In der **alten** Formel war die interne Fracht nicht als separater
Preisbestandteil enthalten. Deshalb kommt nun einmal je Stück
**330 € brutto** hinzu, nämlich 150 € netto * 1,10 Reserve * 1,19 USt.
geteilt durch 0,60 Restmarge, auf volle 10 € aufgerundet.
Die ursprüngliche Maß-/Dekor-Preischarakteristik bleibt erhalten;
der alte 190-cm-Frachtsprung entfällt vollständig.
**Beispiel (W980, 38 mm, 200 x 60 cm)**: vorher 670 € brutto,
nachher **1.000 € brutto** plus unverändertem regulären Kundenversand.
Für W980 17,5 mm bei 200 x 60 cm: 450 € → 780 €.

**Wichtig:** Die historische 200x60-EK-Tabelle ist eine Referenz,
keine aktuelle Lieferantenzusage für beliebige Konfigurationen.
Die geschützten Verkaufs-/Nachweis-Gates bleiben unangetastet.

## Kassen- und Freigabegrenzen

Die Änderung ändert **keine** Woo-Versandzonen, Versandtarife,
Steuersätze, Zahlungsmittel, Bestellstatus, HMAC-Validierung, bestehende
Kundengutscheine, Verkaufsfreigaben oder Speedmaster-Auftragsübergaben.

**Achtung bei Merge + automatischem Plugin-Update:** Die bereits
öffentlich kaufbare gerade Arbeitsplatte erhält unmittelbar neue
Bruttopreise. Bestehende alte signierte Warenkorbpositionen müssen
zum Schutz gegen Mischpreise erneut validiert/re-konfiguriert werden.
L/U bleiben Entwürfe, unabhängig vom erfolgreichen Test.
Vor einem allgemeinen L/U-Verkaufsstart die kurze reale Kassenansicht
für Gerade + L + U inkl. DE-Steuer, Versand und gespeicherten
Fertigungsdaten prüfen; weder Zahlung noch Speedmaster-Auftrag auslösen.

Tests: `pricing-v3/tests/flat-150-inbound.php`,
`pricing-v3/tests/straight-190-margin-proxy.php`,
`wordpress/sale-launch-090/tests/standard-shipping-contract.php`,
`wordpress/tests/woo-sandbox-checkout.php`.
