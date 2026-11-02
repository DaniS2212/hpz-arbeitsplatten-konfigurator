# L1–L4: Gesicherte Speedmaster-EK-Referenzen und interne Preisszenarien
**Stand:** 02.11.2026 · **Status:** PRIVATE KALKULATIONSVORSTUFE, kein Angebot und keine Bestellung.

## Herkunft: nur vier vollständige L1-Beispiele
Aus der Quell-Datei docs/price-reference-cases.csv stammen diese einzeln vom Nutzer bestätigten Lieferanten-Einkaufspreise **netto**. Nur 1,5 mm dekorgleiche Standard-Außenkanten einschließlich der zuvor im Screenshot übersehenen Kante:

| Variante | Maße L1 × L2 | B1/B2 | Material / Dekor | Speedmaster-EK netto |
| --- | --- | --- | --- | ---: |
| L1 | 200 × 120 cm | 60/60 cm | 17,5 mm, W980 Platinweiß | 307,67 € |
| L1 | 200 × 120 cm | 60/60 cm | 38 mm, W980 Platinweiß | **464,45 €** |
| L1 | 250 × 120 cm | 60/60 cm | 17,5 mm, W980 Platinweiß | 342,41 € |
| L1 | 250 × 120 cm | 60/60 cm | 38 mm, W980 Platinweiß | 511,56 € |

Die überlassene historische CSV hat **keine** vollständige L2-/L3-/L4-Referenz oder bepreiste L-Abschrägungen. Diese Preise gelten weder für andere Dekore noch andere Eckbearbeitungen, Maße, Stärke oder abweichende Außenkanten.

## Reine Simulation – noch kein festgelegter L-Verkaufspreis
Das neue private Modul local/private/l-price-evidence.mjs simuliert **ausschließlich für einen exakt passenden L1-Referenzfall** die bisher betriebswirtschaftlich gewünschte Zielmarge. Es schätzt keine Speedmaster-EKs.

Die folgende Beispielrechnung verwendet bewusst angenommene (!) 60,00 € interne Anlieferung pro konfigurierter Platte. Dieser Betrag ist **keine** gemessene L-Lieferung; die echten Packstücke und die 190-cm-Schwelle müssen für L-Formen separat geprüft werden.

- Kostenbudget = (belegter EK + **angenommene** interne Anlieferung) × 1,10
- Zielmarge = 40 % auf den Nettoverkaufspreis nach Reserve
- Beispiel für DE = 19 % USt. auf den simulierten Nettoverkaufspreis, danach auf die nächsten 10 € aufrunden
- Mengen werden nach der Einzelpreis-Aufrundung multipliziert
- 35 % bleibt die Mindestmarge nach Rabatten, muss aber vor echter Bestellung **auf nachgewiesenem EK, echten Versandteilen und tatsächlichem Nettoerlös** geprüft werden

| L1 / W980 mit allen Standardkanten | Bekannter EK netto | **Nur internes Beispiel** Brutto bei angenommenen 60 € |
| --- | ---: | ---: |
| 200 × 120 cm, 17,5 mm | 307,67 € | 810,00 € |
| 200 × 120 cm, 38 mm | 464,45 € | 1.150,00 € |
| 250 × 120 cm, 17,5 mm | 342,41 € | 880,00 € |
| 250 × 120 cm, 38 mm | 511,56 € | 1.250,00 € |

**Nicht freigegeben:** keine dieser Zahlen ist ein verbindlicher Kundenpreis. Das private Modul liefert scenario-only oder blocked, immer purchasable:false, manufacturingReady:false, shippingPartsVerified:false und pricingReady:false. Bei L2/L3/L4, Eckbearbeitungen, anderer Material-/Dekor-/Maßkombination oder abweichender Kante bleibt der Bruttobetrag null, statt aus L1 einen Preis hochzurechnen.

## Trennung zu WordPress und dem fertigen Geraden-Konfigurator
- Private Quelldatei ausschließlich unter local/private/; **kein** build-plugin.mjs-Eintrag oder Import in Browser-/WordPress-Code
- Keine Änderung an der bestehenden PHP-V3-Regel der Geraden
- Keine WooCommerce-Bestellung, keine Shop-Preisvorschau, kein Merge von PR #3
- Keine Übernahme von visuellen Teilflächen oder Stoßlinien als echte Versandteile; die frühere Teileansicht bleibt Planungsgeometrie

## Was für eine belastbare L-Kalkulation noch fehlt
1. Original-Speedmaster-EKs für L1–L4 mit gleicher Referenzkonfiguration, **explizit allen Standardkanten**, Eckbearbeitungen und mindestens beiden Dicken. Für L1 fehlen systematische Abmessungs- und Dekorverläufe
2. Herstellerbestätigte Teilplattenanzahl, Stoß-/Fräsbilder und **reale Verpackungs-Längen/Gewichte** zur internen Anlieferung und Kundenversand
3. Herstellervalidierte dynamische Maßgrenzen und formabhängige Preisstufen (insbesondere L3/L4-Diagonalen und die L4-B5-Einzeländerung)
4. Danach separate serverseitige Pricing-Routine mit WooCommerce-Steuer-, Coupon- und 35-%-Margen-Nachprüfung, plus Testbestellung und expliziter manueller Freigabe

**Merke:** Nur die L1-W980-EK-Zeilen sind aus den Belegen nachgewiesen. Alles andere in der obigen Beispielpreis-Spalte sind **Modellannahmen**.
