# L-/U-Restpreise: Sonder-Ecken und Admin-Preisvorschau (06.11.2026)

## Ausgangslage und Reichweite
Nach PR #73 bestehen form- und dekorspezifische Preisgrundlagen für acht L-/U-Typen, 16 Dekore, 17,5/38 mm. Das Standardfenster ist relativ gut durch Speedmaster-Beispiele gestützt. Die frei variablen Maße nutzen ein ausdrücklich konservatives **Schätzmodell**; es ist nicht bei jedem Maß mit einem unabhängigen Speedmaster-EK verglichen worden.

Im bisherigen Woo-/PHP-Preispfad war jede **L-Eckbearbeitung** abgelehnt, obwohl die L-Vorschau drei Arten anbietet: `round` (Rundung), `chamfer_square` (eckige Abschrägung), `chamfer_continuous` (Kante durchlaufend), jeweils links/rechts/beidseitig. L3/L4 haben gleichzeitig eine **Basis-B5** und können eine separate **Eck-B5** tragen; sie dürfen weder verwechselt noch gegenseitig ersetzt werden.

## Einziger direkt beobachteter Eck-EK
Betreiber-/Speedmaster-Anzeige vom 06.11.2026, für exakt:
- Form L1, W980 ST7, 38 mm, 1,5 mm dekorgleiche Kanten.
- L1=2250, L2=1200, B1=B2=600 mm.
- Nur **links** `chamfer_continuous`, Eck-L3=150, Eck-B3=150 mm.
- Ohne Bearbeitung **488,01 € netto**, mit Bearbeitung **510,02 € netto**, **+22,01 € netto**.

Quelle: `docs/references/speedmaster-lu/LU_THREE_PRICE_CONTROLS_20261106.json`. Der globale Netto-Steuerstatus der Speedmaster-Anzeigen ist vom Betreiber bestätigt. Der Vergleich belegt **nicht** den Zuschlag für andere Formen, Dekore, Radien, Maße oder die Bearbeitung der anderen Seite.

## Kaufmännische Eck-Modellpreise – ausdrücklich KEINE Speedmaster-Nettoangebote
Mangels separater Speedmaster-Sonder-EK-Daten gibt es **für die interne Testvorschau** folgende vorsichtige, stufenlose Annahmen als zusätzliche **Netto-Kosten in der V3-Kalkulation**, immer je tatsächlich gewählter Seite:

| Eckbearbeitung | Modellkosten je gewählter Seite, netto |
|---|---:|
| Rundung | 44 € + 0,10 €/mm ab Radius über 100 mm |
| Eckige Abschrägung | 39 € + 0,07 €/mm für Summe aus Eck-L + Eck-B über 300 mm |
| Durchlaufende Abschrägung | 35 € + 0,07 €/mm für Summe aus Eck-L + Eck-B über 300 mm |
| L3-/L4-Sonderform | Je gewählter Seite zusätzlich 12 € |
| Beide Seiten | Zusätzlich einmalig 12 € Handlingsreserve |

Die **exakte** 22,01-€-Ausnahme wird **nur** für den zuvor beschriebenen dokumentierten L1-Einzelfall verwendet. Andere Sonder-Ecken verwenden die Modellkosten – ohne stillschweigend den günstigeren Einzelfallwert zu übertragen.

Ein anderer Radius oder ein Eckenmaß erhöht ggf. die angenommene Bearbeitung; weder Herstellbarkeit noch universelle Speedmaster-Preise sind aus der Formel ableitbar. Der Endkundenpreis wird anschließend ausschließlich durch `HPZ_APL_Price_V3::targetGrossForVerifiedCosts()` mit der bereits beschlossenen 40%-Zielmarge, 35%-Mindestmarge nach Rabatt, 10%-Kostenreserve, DE-19%-USt-Referenz und Aufrundung auf 10 € ermittelt.

**Interne Speedmaster-Anlieferung:** Konfiguriertes L1/L2/L3 >=1900 mm => insgesamt 60 € netto (10 € + 50 € einmalig), sonst 10 € netto. Dies ist im Produktpreis enthalten; der **Kundenversand via Woo** bleibt separat.

## Admin-Preisvorschau: Preismodell vor Kaufabschluss wirklich sichtbar machen
Die bisherige Admin-Ansicht für L/U war weitgehend ohne Preise. Eine **neue, eingeloggte Administrator-AJAX-Route** berechnet V3-Brutto-Testpreise auch für die bisherigen Standard-/erweiterten L-/U-Maße und die nun erfassten L-Ecken. Sie gibt **keinen** Speedmaster-EK an Kunden oder Browser zurück, keine Woo-Kaufberechtigung und schreibt keine Produkte.

- Das Ergebnis ist immer `calculated-not-sale-approved`, `purchasable=false`.
- Wenn `other_cost_net_cents` noch nicht als nichtnegative ganze Centzahl hinterlegt ist, wird in der Admin-Vorschau mit **0 € vorläufigen Nebenkosten** gerechnet und dies sichtbar als noch ungeprüfte Annahme bezeichnet; nicht als Bestätigung.
- Ein passender hinterlegter privater Nebenkostenwert wird in der Szenariorechnung verwendet; selbst das aktiviert nichts.
- Die Admin-Route gilt nur für die **beiden unveröffentlichten** Woo-Produktskus L=1000080 bzw. U=1000081, wenn Testmodus, Administratorberechtigung, eigenes Nonce und Produkt-Entwurfsstatus stimmen. Es gibt **keinen** Gäste-Endpunkt.
- Andere/ungültige Maße werden mit 422 abgewiesen; keine kostenlose Bestellung, keine veröffentlichte Preiszusage.

## Öffentliche Woo-Freigabe bleibt separat
Für Sonder-Ecken benötigt der private Serverpreisnachweis `model_price_approved=true` **und** `corner_model_approved=true`; für frei variierte Maße zusätzlich `extended_model_approved=true`. Der Betreiber muss die Modellkosten und die zusätzlich anfallenden Nettokosten prüfen und selbst freigeben. Bestehende signierte Warenkorbpositionen und Produktionsmetadaten führen die konkreten Eckparameter mit; der HMAC-Fingerprint unterscheidet die Ecke von der unbearbeiteten Platte. Die bislang vorhandenen öffentlichen Verkaufsschalter bleiben unverändert AUS.

## Nächste verbliebene wirtschaftliche Kontrolle
1. Die Modellkalkulation besonders für **beidseitige Rundungen und lange Abschrägungen** mit wenigen ausgewählten neuen Speedmaster-Netto-Referenzen überprüfen (wenn möglich nur als strukturierter Text; keine Screenshot-/ZIP-Sammelaktion).
2. Die realen zusätzlichen Kosten in `other_cost_net_cents` festlegen, inklusive Verpackung, Anteil am Kundentransport und Zahlungsabwicklung; sonst bleibt die beispielhafte Bruttokalkulation potentiell zu niedrig.
3. Admin-Preisvorschau in WordPress ansehen, ungewöhnliche Preisverläufe prüfen und anschließend **Woo-Checkout-Test ohne echte Kundenzahlung** durchführen. Erst nach ausdrücklicher Betreiberfreigabe den Verkauf aktivieren.
