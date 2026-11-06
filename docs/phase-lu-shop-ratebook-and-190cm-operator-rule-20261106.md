# L/U-Verkaufspreis-Regel nach dem Gerade-V3-Vorbild – 06.11.2026

## Warum wir nicht von null anfangen
Die **Gerade V3** verwendet eine kommerzielle Preisfunktion mit Basis-/Maß-/Dekoraufschlägen. Sie braucht für ein **unverbindliches Preisangebot** keine Hersteller-CNC-Zeichnung je Maß. Nur der gesonderte Checkout-Freigabepfad prüft weitere Lieferanten-/Versandangaben. Die Preiskalkulation und die Fertigung waren also auch bei Gerade getrennte Aufgaben.

**Entscheidung des Betreibers:** Bei L/U genauso arbeiten: vorhandene Woo-Anbindung, 16-V3-Dekorreferenzen und V3-Margen wiederverwenden; keine separate Preisengine, keine Hersteller-Stückliste als zwingende Preisvoraussetzung. Weitere Produktionsdetails bei der **manuellen** Speedmaster-Bestellung prüfen.

## 1. Preisregel
- Ausgangsbasis: acht **geometriespezifische** Netto-W980-Kostenkurven L1–L4/U1–U4, je Stärke 17,5/38 mm, L1=2000 und 2500 mm; Netto-/Quellenqualität je Form gemischt (vollständige Belege in `PRICE_EVIDENCE_CURRENT.csv`). Bei U3/U4 17,5 mm 2000 mm sind die Werte aus der Formgleichheit abgeleitet; L3/L4 und mehrere 38-mm-Werte beruhen auf Herstelleranzeigen.
- Für H1145 liegen exakte Netto-Referenzen für L1/U1 an beiden Enden und L2/U2 bei 2500 mm vor; fehlende L2/U2-2000-Werte werden aus Formgleichheit bzw. den mehrfach beobachteten U2-Differenzen abgeleitet.
- Für die anderen 14 Dekore wird der **originale** Netto-Dekorunterschied aus `HPZ_APL_Price_V3::EK_REFERENCE_CENTS` wiederverwendet (über `referenceDecorNetDifferenceCents()`), skaliert über konservativ summierte rechteckige L-/U-Materialflächen. **Keine Behauptung, dies sei ein echter Speedmaster-EK für L/U.**
- Standardmodell: alle acht Formen, beide Stärken und alle 16 Dekore, L1 **2000–2500 mm**, übrige Maße je Form exakt wie ihre historischen Referenzvarianten, eckig, 1,5-mm-Dickkanten. Zwischenwerte auf Netto-Cent aufrunden. Keine Mischinterpolation.
- **Erweitertes Maßmodell** für normale Maße: L-Achsen 1000–4000 mm, B-Achsen 300–1200 mm (weiterhin nur eckig und 1,5-mm-Dickkante). Nutzt die bestätigte form-/stärkenspezifische L1-Steigung, 25%-konservative Aufwertung der positiven Längenextrapolation, halbe Gutschrift für kürzere Schenkel, absolute Breitenänderungsaufschläge (17,5 mm 0,15 €/mm, 38 mm 0,30 €/mm pro Achse) und **7 % zusätzliche Modellunsicherheit**. Diese Annahmen sind kaufmännische Sicherheitspuffer, nicht Herstellerpreise. Das erweiterte Modell muss gesondert genehmigt werden.
- Beide Modelle nutzen **unverändert** die V3-Verkaufspolitik: 40 % Zielmarge auf **angenommene** Kosten, 10 % Kostenreserve, 35 % Mindestrendite nach Rabatt **relativ zur angenommenen Kostenbasis**, 19 % DE-USt genau einmal und Aufrundung zum nächsten 10-€-Bruttopreis. Reale Marge kann bei abweichendem Lieferanten-EK kleiner ausfallen.

## 2. Verbindliche 190-cm-Regel des Betreibers
Berechne die interne Speedmaster-Anlieferung aus **konfigurierten L1/L2/L3**, ohne reale CNC-Teilaufteilung:
- bei allen L-Achsen <1900 mm: **10,00 € netto**;
- sobald mindestens eine L-Achse >=1900 mm: **60,00 € netto insgesamt** (=10 € Grundkosten + einmal 50 € Zuschlag);
- nie 70 € und nie einen zweiten Zuschlag für weitere lange Schenkel.
Diese Kosten sind **bereits in V3-Produktpreis kalkuliert**. Der WooCommerce-Kundenversand wird getrennt über die vorhandenen Versandarten ermittelt; keinen zusätzlichen 50-€-Checkout-Zuschlag doppelt anlegen.

## 3. Konkrete DE-Brutto-Preiskandidaten, L1=2500 mm (Beispiele)
Annahmen: **Speedmaster EK laut Preisregister bzw. kommerziellem Modell, interne Anlieferung 60 € netto, zusätzliche Kosten 0 € netto**, 40% Zielmarge/10% Reserve/19% deutsche USt/Rundung V3. Alle weiteren Maße wie die W980-Referenzgeometrie je Form.

| Form | W980 17,5 mm | W980 38 mm | H1145 17,5 mm | H1145 38 mm |
|---|---:|---:|---:|---:|
| L1 | 880 € | 1.250 € | 890 € | 1.260 € |
| L2 | 880 € | 1.250 € | 890 € | 1.260 € |
| L3 | 1.280 € | 1.980 € | ca. 1.300 € | ca. 2.030 € |
| L4 | 1.150 € | 1.680 € | ca. 1.170 € | ca. 1.720 € |
| U1 | 1.210 € | 1.750 € | 1.230 € | 1.760 € |
| U2 | 1.210 € | 1.740 € | 1.230 € | 1.750 € |
| U3 | 1.210 € | 1.750 € | ca. 1.230 € | ca. 1.790 € |
| U4 | 1.210 € | 1.750 € | ca. 1.230 € | ca. 1.790 € |

**WICHTIG:** Die 0 € Zusatzkosten sind hier nur eine Szenarioannahme. Erst tatsächliche Kalkulationsnebenkosten (z. B. kundenseitiger Versandanteil, Verpackung, Zahlungsgebühren) in `other_cost_net_cents` bestätigen. Die Modelle liefern Preisvorschläge, noch keine für Kunden angebotenen Shoppreise.

## 4. Server-/Woo-Sicherheit
- `HPZ_APL_LU_Shop_Ratebook_12::candidate()`: Standardmodell; fehlende oder unbekannte Maße erhalten keine verbindliche Quote.
- `::extendedCandidate()`: breit gefasstes Maßmodell, **ausschließlich Schätzung**, nicht automatisch freigegeben.
- `::operatorProof()` benötigt die **serverseitige** WordPress-Option `hpz_apl_lu_price_window_v1` mit `model_price_approved=true`, `other_cost_net_cents`, `max_quantity`, `price_approved_on`, `approved_shipping_rate_ids`. Für das erweiterte Modell zusätzlich `extended_model_approved=true` (separate ausdrückliche Entscheidung).
- Verbindlich erst nach eigenem Shop-Release-Schalter `HPZ_APL_LU_11_AUDITED_RELEASE`, Produktveröffentlichung und gesetztem `hpz_apl_lu_sale_v1` inklusive erfolgreichem Woo-Checkout-Test. Alle Schalter stehen weiter **OFF**.
- Keine Magento-/Shopify-/zweite Woo-Preisengine, keine Änderung an Gerade, keine automatische Speedmaster-Bestellung. Signatur, Preisaktualisierung, Couponfloor und Steuer-/Versandsicherheit im WooCommerce-Adapter bleiben.

## 5. Vor der Testbestellung
1. Preisbeispiele und den Umgang mit Modellsicherheitszuschlägen mit dem Betreiber prüfen; fehlende zusätzlichen Netto-Kosten im Admin-Preisoptionseintrag festlegen.
2. PHP-/Node-/Browser-/WordPress-ZIP-Regression komplett grün, insbesondere 1899/1900 mm, alle 16 Dekore und Formvarianten.
3. Nur im abgesicherten Admin-Test: signierte Woo-Position, Preis-/MwSt-/Versandberechnung, Gutschein, komplette Bestellmetadaten und manuelle Speedmaster-Übergabe. Keine Echtgeldbestellung.
4. Betreiber gibt die konkreten Preisfenster und anschließend die öffentliche Veröffentlichung selbst frei. Merge allein veröffentlicht nichts.
