# L-/U-Preisabgleich: bereits vorhandene unabhängige Breiten-EKs verwenden (06.11.2026)

## Entscheidung und Befund
PR #72 unterstützt 8 Formen, 16 Dekore und die 2 Stärken mit einem Standardmodell und einem vorsichtigen erweiterten Maßmodell. **Nicht jede rechenbare Kombination ist damit preislich akzeptabel.** Das bisherige Modell berechnet für schmal abweichende, **bereits bei Speedmaster bestätigte** Breiten oft zu viel. Hauptgrund: absolute Breitenaufschläge und +7 % Modellreserve, obwohl echte Netto-Preise vorliegen. Bei U1/38 mm B1=600/650/700 **SINKT** der Netto-EK sogar bei wachsender Breite. Ein monotoner allgemeiner Breitenaufschlag bildet das nicht ab.

Die folgenden acht Netto-Supplier-Beispiele sind historische **direkt vom Betreiber bestätigte** Preisbeträge, **keine** neue Preisabfrage und **keine** Produktions-/Woo-Kauffreigabe. Alle W980 ST7, 1,5 mm dekorgleiche Außenkanten, keine Sonder-Eckbearbeitung; die Speditionsregel bleibt 10 € + einmalig 50 € netto ab 190 cm konfigurierter L-Achse.

| Form | Dicke | Messfall | PR-72-Basis vor Abgleich (EK-Annahme netto) | Speedmaster netto | Überhöhung der EK-Annahme |
|---|---:|---|---:|---:|---:|
| U1 | 17,5 mm | B1=600 | 575,09 € | 528,76 € | 46,33 € |
| U1 | 17,5 mm | B1=650 | 583,11 € | 534,33 € | 48,78 € |
| U1 | 17,5 mm | B1=700 | 591,14 € | 539,90 € | 51,24 € |
| U1 | 38 mm | B1=600 | 853,30 € | 785,69 € | 67,61 € |
| U1 | 38 mm | B1=650 | 869,35 € | 776,40 € | 92,95 € |
| U1 | 38 mm | B1=700 | 885,40 € | 767,12 € | 118,28 € |
| L3 | 17,5 mm | B3=B4=1000 | 592,03 € | 534,98 € | 57,05 € |
| L4 | 17,5 mm | B5=700 | 514,33 € | 478,19 € | 36,14 € |

U1 hier immer L1=2500, L2=1700, L3=1800, B2/B3=600; nur B1 variiert. L3 hier L1=2500, L2=2000, B1/B2=600 und B3=B4 gekoppelt; L4 hier L1=2500, L2=2000, B1/B2=600, B3/B4=900 und B5 als **Grundmaß**, nicht zusätzliche Eckbearbeitung.

**Beispiel der Preiswirkung:** U1/38 B1=700: Die 885,40-€-EK-Annahme hätte bei internen 60 € Anlieferung und 0 € sonstigen Kosten zur gerundeten V3-DE-Bruttoreferenz **2.070 €** geführt. Mit realer EK-Referenz 767,12 € ergibt dieselbe unveränderte V3-Regel **1.810 €**. Das sind 260 € unnötiger potenzieller Verkaufspreisunterschied (andere Kosten/Kundenzustellung noch NICHT ergänzt).

## Minimale Anpassung
- Vor `extendedCandidate()` wird ein **auf dieselben Größen, Form, Dicke und Dekor begrenzter** Supplier-Kalibrierungskorridor geprüft. Die acht gemessenen Endpunkte erhalten `confirmed-net-reference`.
- U1/W980 B1=600–700: je **getrennte** 17,5-/38-mm-Netto-Reihe mit gemessenen Stützpunkten 600,650,700. Zwischenwerte werden auf Cent **aufgerundet**, auch bei **negativer** 38-mm-Steigung; kein Extrapolieren über die drei Stützpunkte hinaus.
- L3/W980/APL17.5: B3 und B4 **gemeinsam** von 900 bis 1000 mm bei festen restlichen Maßen. L4/W980/APL17.5: B5-Grundmaß 600 bis 700 mm bei festen restlichen Maßen. Nur die Zwischenpunkte sind `bounded-single-axis-net-interpolation`.
- Andere Dekore, Formen, Längen, Eckbearbeitungen oder Kombinationen erhalten ausdrücklich **nicht** diese exakt belegte EK-Freigabe. Sie bleiben in der vorsichtigen erweiterten Schätzformel bzw. ohne Preis.
- `HPZ_APL_Price_V3` 40 %-Marge / 35 %-Gutscheinuntergrenze / 10 % Reserve / 19 % DE-USt / 10-€-Bruttorundung, die 190-cm-Regel, Woo-Commerce-Freigaben und Gerade bleiben **unverändert**.
- PR enthält **keine** Produktaktivierung, keinen Backend-Preisfreigabeschalter, keinen echten Auftrag. So bleibt der separate Woo-End-to-End-Test erforderlich.

## Nächste zielgerichtete Prüfung – keine weitere Massen-Referenzsammlung
Vor uneingeschränktem Verkauf genügt ein kleiner **Blind-Abgleich** von wenigen Fällen, deren Speedmaster-EK **nicht** schon in der Modellberechnung verwendet wurde: z. B. eine weitere U1-38-mm-Breite mit geändertem L2, ein schwieriges L3-/L4-Grundmaß, ein seltenes Dekor mit größerer Fläche sowie eine kurze L1-Länge unter 190 cm. Vor einem Kundenangebot mit Sonder-Eckbearbeitung braucht es eine gesonderte Eckaufschlagregel. Alle Eingaben und Marktangebote bleiben unter gesonderter Betreiberfreigabe.

Quellen: `docs/price-reference-cases.csv`, `docs/references/speedmaster-lu/LU_FOUR_WIDTH_NET_PRICES_20261106.json`, `pricing-v3/HPZ_APL_LU_Shop_Ratebook_12.php` und `pricing-v3/tests/lu-shop-ratebook.php`.
