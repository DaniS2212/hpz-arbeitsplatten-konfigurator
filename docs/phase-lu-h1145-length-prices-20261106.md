# H1145 ST10 Bardolino Eiche – zweite Länge bestätigt, 06.11.2026

**Status: PR #70.** Vier neue echte Netto-EK-Beträge, direkt vom Betreiber aus Speedmaster als Text übermittelt. **Keine Preisbilder oder ZIPs.** Exakte Hersteller-Anzeige, nicht automatische Browserermittlung und nicht bestätigte Produktions-/Versandstückliste. Das Referenzdekor ist **W980 ST7 Platinweiß**. Für sämtliche vier Fälle: Außenkanten/Profil **1,5 mm dekorgleich**, keine zusätzlichen Eckbearbeitungen, Menge 1, Preise **Netto EUR exkl. MwSt.**

## Preise mit genau gleichen Vergleichsmaßen

Bei **L1**: L1=**2000**, L2=1200, B1=B2=600 mm. Bei **U1**: L1=**2000**, L2=1200, L3=1800, B1=B2=B3=600 mm.

| Form | Stärke | W980 netto 2000 | **H1145 netto 2000** | Aufpreis H1145 bei 2000 | Aufpreis H1145 bei 2500 |
|---|---|---:|---:|---:|---:|
| **L1** | 17,5 mm | 307,67 € | **311,53 €** | +3,86 € | +4,52 € |
| **L1** | 38 mm | 464,45 € | **468,72 €** | +4,27 € | +4,93 € |
| **U1** | 17,5 mm | 459,29 € | **464,34 €** | +5,05 € | +5,71 € |
| **U1** | 38 mm | 691,49 € | **696,55 €** | +5,06 € | +5,73 € |

**Gemeinsamer Verlauf:** Bei H1145 ist der Anstieg von L1=2000 auf 2500 mm für **L1 UND U1** je Stärke identisch:

| Stärke | H1145 L1-Anstieg / 500 mm | W980 L1-Anstieg / 500 mm | W980 U1-Anstieg / 500 mm | Mehranstieg im Dekor H1145 |
|---|---:|---:|---:|---:|
| 17,5 mm | **+35,40 €** | +34,74 € | +34,74 € | **+0,66 €** |
| 38 mm | **+47,77 €** | +47,11 € | +47,10 € | **+0,66 bis 0,67 €** |

Der **Dekorunterschied wächst daher innerhalb des exakten 500-mm-Testintervalls**; ein **konstanter Euro-Dekorzuschlag** wäre falsch. Der Zuwachs ist über L1/U1 und beide Stärken auffallend ähnlich, rechtfertigt aber **keine Verallgemeinerung** auf andere Formen, 16 Dekore, Kanten, Breiten oder Längen außerhalb 2000..2500 mm.

## Preisbelege und technische Gültigkeit

- [Vier neue 2000-mm-H1145-Netto-EKs inklusive kompletter Maß- und Differenzdaten](references/speedmaster-lu/LU_H1145_2000_NET_PRICES_20261106.json), [vier vorherige 2500-mm-H1145-EKs](references/speedmaster-lu/LU_H1145_FOUR_DECOR_NET_PRICES_20261106.json), [zentrales 16-Spalten-Preisregister](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv).
- Offline `pricing-v3/HPZ_APL_LU_Calibration_11.php` verwendet die **beiden H1145-Endpunkte (2000 und 2500 mm)** getrennt für L1/U1 und 17,5/38 mm. Bei einer **exakt beobachteten** Größe liefert es `exact-operator-confirmed-net-reference`; innerhalb der Grenzen interpoliert es lediglich `bounded-one-axis-estimate-not-verified` entlang **L1**, wenn **alle anderen Maße, Kanten, Form, Stärke und Dekor unverändert** sind.
- Modell-EKs **nur intern, noch nicht direkt von Speedmaster bestätigt** für L1=2250 mm: **L1 17,5 = 329,23 €**, **L1 38 = 492,61 €**, **U1 17,5 = 482,04 €**, **U1 38 = 720,44 €** netto. Die DE-Brutto-Szenarien stammen aus der bestehenden V3-Berechnung, keine neue Preisengine.
- **Streng gesperrt:** H1145 andere Breiten, Formen **L2–L4/U2–U4**, andere Maßachsen, L1 außerhalb [2000,2500], zusätzliche Eckkonturen, anderer Kantentyp oder andere Dekore ohne eigenen Preisnachweis. Keine zweidimensionale Breiten-/Längenmodellierung, keine automatische Übernahme der W980-Form-/Breitenregeln.

## Gewerbliche Regeln unverändert

**Netto-EK ohne Mehrwertsteuer**, deutsche Bruttoreferenz aus vorhandener V3-Strategie: **40 % Zielmarge, 35 % Mindestmarge nach Rabatt, 10 % Kostenreserve, 19 % deutsche USt. genau einmal**. Speedmaster-Anlieferung **10 € netto Standard, gegebenenfalls einmalig +50 € netto**, wenn ein **tatsächliches und bestätigtes physisches Lieferteil ≥1900 mm** ist (=60 € netto insgesamt), **nicht** allein auf Basis der äußeren L1-Länge.

Zuschnitts- und Verbindungsliste, reale Pack-/Lieferstückmaße, weitere Kosten und End-to-End-WooCommerce-Testbestellung **nicht geprüft**. `purchasable=false`, `checkoutPriceApproved=false`, `supplierNetQuoteVerifiedForExactTarget=false`: **keine Freischaltung und keine reale Bestellung** durch diesen PR.

## Nächste vier aussagekräftigen Speedmaster-Preise

Um die L1↔L2- und U1↔U2-Stoßvarianten **für H1145** mit demselben Dekor und beiden Stärken zu kontrollieren, als nächstes **jeweils L1=2500 mm**:

| Form | Stärke | Maße in mm | H1145-Vergleich aus bestätigter Quelle |
|---|---|---|---:|
| L2 | 17,5 mm | L1=2500, L2=1200, B1/B2=600 | L1 **346,93 € netto** |
| L2 | 38 mm | Wie oben | L1 **516,49 € netto** |
| U2 | 17,5 mm | L1=2500, L2=1200, L3=1800, B1/B2/B3=600 | U1 **499,74 € netto** |
| U2 | 38 mm | Wie oben | U1 **744,32 € netto** |

Bei **allen**: H1145 ST10, dekorgleiche 1,5-mm-Kanten, keine Eckbearbeitung; Beträge wieder **nur als Text**, keine Screenshots/ZIPs. Weiterführende Dekor-Übertragungsregeln erst nach weiteren isolierten Prüfungen und danach Lieferteile/Fertigung/Testbestellung.
