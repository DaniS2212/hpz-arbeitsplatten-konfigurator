# L-/U-Preiskalibrierung: acht neue reine Textbelege und Längen-/Variantenvergleich

**Datum: 06.11.2026.** In einem anderen Chat ließ sich der Speedmaster-Shop zwar öffnen, der Cloud-Browser konnte den WebGL-basierten Konfigurator jedoch nicht verlässlich bedienen. **Keine behauptete automatische Preisermittlung.** Der Betreiber hat **acht angezeigte Speedmaster-Preise als Text** übermittelt; sie stehen unter `docs/references/speedmaster-lu/LU_EIGHT_TEXT_PRICES_20261106.json` sowie als eigene, vollständig parametrisierte Zeilen in `PRICE_EVIDENCE_CURRENT.csv`. **Keine neuen Screenshots, ZIPs oder SHA-Manifestdateien**. Das entspricht der [verbindlichen Preistext-Policy](references/speedmaster-lu/PRICE_TEXT_EVIDENCE_POLICY_20261106.md).

## Identische Ausführung dieser acht Referenzen

**38 mm APL, W980 ST7 Platinweiß, Profil und alle Außenkanten 1,5 mm dekorgleich; keine zusätzlichen Eckbearbeitungen.** Alle Maße mm, alle EUR-Beträge nach Anzeige bei Speedmaster; **Netto-EK nicht ausdrücklich bestätigt**. Die früher betrachtete Option „ohne Kante“ **wird auf Betreiberwunsch nicht angeboten und nicht weiter untersucht**.

| Form | Maße vollständig (mm) | Anzeige |
|---|---|---:|
| L2 | L1=2500, L2=1200, B1=B2=600 | **511,56 €** |
| U2 | L1=2500, L2=1200, L3=1800, B1=B2=B3=600 | **734,46 €** |
| L3 | L1=L2=2000, B1=B2=600, B3=B4=900 | **798,52 €** |
| L3 | L1=2500, L2=2000, B1=B2=600, B3=B4=900 | **845,62 €** |
| L4 | L1=L2=2000, B1=B2=600, B3=B4=900, B5-Grundmaß=600 | **658,61 €** |
| L4 | L1=2500, L2=2000, B1=B2=600, B3=B4=900, B5-Grundmaß=600 | **705,71 €** |
| U3 | L1=2500, L2=1200, L3=1800, B1=B2=B3=600 | **738,59 €** |
| U4 | L1=2500, L2=1200, L3=1800, B1=B2=B3=600 | **738,59 €** |

**L4 mit L1=2000 und 658,61 €** stand bereits als ältere, nicht netto bestätigte Anzeige im Preisregister. Der neue Textbeleg ist als *unabhängige Wiederholung* aufgenommen. Im Modell werden identische Preisbelege zusammengeführt. **Widersprüchliche Preise bei exakt gleichen Dimensionen dürfen nicht stillschweigend überschrieben werden.**

## Zusammenführung mit vorherigen Preisen (gleicher enger Standardkorridor)

| Form | L1 = 2000 | L1 = 2250 | L1 = 2500 | Relevanz |
|---|---:|---:|---:|---|
| L1 | 464,45 € historische Netto-Referenz | 488,01 € Anzeige | 511,56 € historische Netto-Referenz | L1-Länge unabhängig kalibriert |
| L2 | — | 488,01 € Anzeige | 511,56 € Anzeige | Gleich L1 bei **2250 und 2500** |
| L3 | 798,52 € Anzeige | *822,07 € Modell* | 845,62 € Anzeige | **+47,10 €** je 500 mm |
| L4 | 658,61 € Anzeige | *682,16 € Modell* | 705,71 € Anzeige | **+47,10 €** je 500 mm |
| U1 | 691,49 € historische Netto-Referenz | 715,04 € Anzeige | 738,59 € historische Netto-Referenz | Vergleichsbasis |
| U2 | 687,36 € Anzeige | 710,91 € Anzeige | 734,46 € Anzeige | **−4,13 €** zu U1 bei **2000, 2250 und 2500** |
| U3 | 691,49 € Anzeige | *715,04 € Modell* | 738,59 € Anzeige | Gleich U1 bei **2000 und 2500** |
| U4 | 691,49 € Anzeige | *715,04 € Modell* | 738,59 € Anzeige | Gleich U1 bei **2000 und 2500** |

*Modell* heißt: **nur entlang L1 zwischen tatsächlich beobachteten Endpunkten derselben Form, Dicke, Kantenkonfiguration, Dekor und sonstigen Dimensionen interpoliert**. Es handelt sich um einen erwarteten **Anzeige-** und ausdrücklich **nicht** um einen geprüften Netto-Einkaufspreis oder eine reale Herstellungsfreigabe. Alle anderen Maße müssen mit beiden Endpunkten **identisch** sein. Keine Längenextrapolation, keine Übertragung über unterschiedliche Formen/Dekore/Kanten/Stärken, keine Breiten-/B5-Interpolation.

### Drei fachliche Beobachtungen, noch keine weltweite Lieferantenpreisformel

- **U2 −4,13 €** bei L1 **2000 / 2250 / 2500** für die exakt verglichenen U1/U2-Maße und die 38-mm-W980-Ausführung. Die Wahrscheinlichkeit eines festen Unterschieds im engen Korridor steigt; ein allgemeiner U2-Rabatt ist damit noch **nicht** bewiesen.
- **L3 und L4**: Die L1-Längenänderung 2000→2500 kostet in beiden Varianten **+47,10 €**. Der absolute Unterschied L3 vs L4 bleibt an beiden Punkten **139,91 €**, obwohl die Formen und L4-B5-Grundmaße unterschiedlich definiert sind. Das ist ein beobachtetes Delta, **kein pauschaler Zuschnitt-/Stoßzuschlag**.
- **L1=L2** bei L1=2250 und 2500; **U1=U3=U4** bei L1=2000 und 2500. Diese Werte stützen die Preismodellierung nur bei der tatsächlich vollständig übereinstimmenden Ausführung.

## Technische Kalibrierung in PR #65

`pricing-v3/HPZ_APL_LU_Calibration_11.php` liest weiterhin den historischen **Netto-EK-Bestand getrennt** aus `docs/price-reference-cases.csv` (nur L1/U1 als bisheriger Netto-Korridor) und den **nicht netto bestätigten** Preisbestand aus `PRICE_EVIDENCE_CURRENT.csv`. Für den zweiten Datenbestand existiert eine **eigene, konservative** Ein-Achsen-Interpolation mit Ausgabe in `estimatedSupplierDisplayCents` – **niemals** in `estimatedSupplierNetCents`, `netSupplierReferenceCents`, `grossDEWith10or60EURInboundScenario`, Woo-Warenkorb oder Freigabe-Optionen. `priceStatus` unterscheidet exakt beobachtete Anzeige, modellierte Anzeige und fehlende Belege.

Der Nutzer hat ausschließlich **dekorgleiche 1,5-mm-Kanten** zur angebotenen Variante bestimmt. Sowohl das bestehende JS-Konfigurationsschema als auch die PHP-L/U-Preisnormalisierung akzeptieren nur `matching-1.5`; deshalb ist für diese Entscheidung **keine zweite Kantenauswahl oder zusätzliche Preis-Engine erforderlich**. Die vorhandenen Optionen für Abschrägungen sind **eine gesonderte Geometrie-/Preisfrage**, nicht „ohne Kante“.

## Weiterer Weg zur Veröffentlichung – keine künstlichen Umwege

1. **Netto-/Bruttostatus** der Herstellerpreisanzeige und Verlässlichkeit der engen Längen-/Formregeln einmal fachlich bestätigen. Weitere Testpunkte mit **anderen Breiten, 17,5 mm und anderen Dekoren** benötigt die Freigabe einer breiten Maßauswahl; bei U1 kann mehr Breite nachweislich **günstiger** werden (38 mm, B1=600→700 bei L2=1700: 785,69→767,12 €), daher keine schlichte Flächenformel.
2. Tatsächliche **Speedmaster-Zuschnitte, Paket-/Lieferstücklängen, Verbinder und Kosten** den freizugebenden Maßbereichen zuordnen. 10 € netto Standardanlieferung, **einmalig +50 €** bei nachgewiesener Liefer-/Packstücklänge ≥1900 mm, somit **60 € gesamt**, bleibt unverändert.
3. Bestehende **V3-Margenberechnung** (40 % Ziel, 35 % nach Rabatt Minimum, 10 % Reserve) und den schon integrierten L/U-Woo-Bestellweg verwenden, gezielt Testkauf ohne Echtzahlung und **manuelle** Speedmaster-Übergabe prüfen; keine automatische Freigabe durch Preisbild oder Textbeleg.
4. Danach vereinbarter UI-Feinschliff: Produktkopf nur H1+Kurzbeschreibung, B5-„Einstellung“ kundenfreundlich, stabiler SVG-Grundriss bei Eckwechsel.

**Offener Zugriffsweg:** Cloud-Browser kann den WebGL-Konfigurator aktuell nicht zuverlässig bedienen. Vorerst gebündelte Lieferanten-Preiswerte als reinen Text erfassen – **keine weiteren ZIPs** und keine fälschlich als selbstständig abgerufenen Preise kennzeichnen.


### Nachtrag 06.11.2026: Steuerbasis ist geklärt

Die Speedmaster-Produktpreise sind laut ausdrücklicher Betreiberbestätigung **NETTO ohne Mehrwertsteuer**. Historische `display-only`-Belege bleiben als **Quellenarten** erhalten, die Umsatzsteuerfrage ist hingegen beantwortet. **19 % deutsche USt. werden im vorhandenen V3-Bruttorechner genau einmal berücksichtigt**, nicht doppelt. Die sechs neuen **17,5-mm-Genaupreisanker** sind separat als `operator_confirmed_net_EK` erfasst, siehe [Referenztabelle](phase-lu-175-net-price-anchors-20261106.md). Keine allgemeine Preisfreigabe für ungetestete Größen.
