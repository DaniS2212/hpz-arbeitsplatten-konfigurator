# Speedmaster L-/U-Arbeitsplatten: vier Breiten-Kontrollpreise (06.11.2026)

**Quelle:** Vier vom Betreiber am 06.11.2026 direkt als Text übermittelte Speedmaster-Preise. **Alle Beträge netto ohne Mehrwertsteuer**, Herstellersteuerbasis vom Betreiber bestätigt; **38 mm und 17,5 mm dürfen nicht preislich gleichbehandelt werden**. Ausschließlich **W980 ST7 Platinweiß**, Profil und sämtliche sichtbaren Außenkanten **1,5 mm dekorgleich**, keine zusätzliche Eckbearbeitung, Menge 1. Keine PNGs, ZIPs oder neuen Preisbild-Belege erforderlich.

## Vier Originalbeobachtungen – exakte Maß- und Preiszuordnung

| Fall | Vollständige Abmessungen in mm | Vergleich | Speedmaster Netto-EK | Netto-Differenz |
|---|---|---:|---:|---:|
| **U1 17,5 mm** | L1=2500, L2=1700, L3=1800, **B1=650**, B2=B3=600 | B1=600: 528,76 € | **534,33 €** | **+5,57 €** |
| **U1 38 mm** | L1=2500, L2=1700, L3=1800, **B1=650**, B2=B3=600 | B1=600: 785,69 € | **776,40 €** | **−9,29 €** |
| **L3 17,5 mm** | L1=2500, L2=2000, B1=B2=600, **B3=B4=1000** | B3=B4=900: 523,29 € | **534,98 €** | **+11,69 €** |
| **L4 17,5 mm** | L1=2500, L2=2000, B1=B2=600, B3=B4=900, **B5=700** | B5=600: 465,68 € | **478,19 €** | **+12,51 €** |

**Wichtig:** Bei **L3** wurden **zwei abhängige Breiten gleichzeitig** von 900 auf 1000 mm geändert, weil die Maße im Konfigurator geometrisch gekoppelt sind. Das Ergebnis **ist kein frei verwendbarer Einzelaufpreis für B3 oder B4**. Bei **L4** ist B5 das **Grundmaß der Form**, kein zusätzlicher Eckanschnitt.

Maschinenlesbare Original-Textquelle mit allen Parametern und Provenienz: [LU_FOUR_WIDTH_NET_PRICES_20261106.json](references/speedmaster-lu/LU_FOUR_WIDTH_NET_PRICES_20261106.json) und das [zentrale 16-spaltige CSV-Preisregister](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv).

## U1 besitzt jetzt drei echte Breiten-Kontrollpunkte je Dicke

Nur U1 bei **L1=2500, L2=1700, L3=1800, B2=B3=600**, W980 ST7:

| U1 Material | B1=600 | B1=650 | B1=700 | Richtung 600→700 |
|---|---:|---:|---:|---|
| **17,5 mm** | 528,76 € | **534,33 €** | 539,90 € | **+11,14 € netto** |
| **38 mm** | 785,69 € | **776,40 €** | 767,12 € | **−18,57 € netto** |

Der 650-mm-Kontrollpunkt bestätigt die lineare Breitenform bei **17,5 mm centgenau**: (528,76+539,90)/2 = **534,33 €**. Bei **38 mm** liefert das Mittel rechnerisch **776,405 €**, die Speedmaster-Anzeige **776,40 €** weicht somit nur **einen halben Cent** vor der centgenauen Geldrundung ab. **Die tatsächliche 38-mm-Kalkulation sinkt mit größerem B1**, während die 17,5-mm-Kalkulation steigt. Eine universelle Preis-pro-Quadratmeter-, Breiten- oder Dickenregel wäre **falsch**. Aus der beobachteten Richtung darf keine unbelegte Erklärung über Materialverschnitt oder Aufteilung behauptet werden.

## Konservative interne Zwischenpreis-Kalibrierung

`pricing-v3/HPZ_APL_LU_Calibration_11.php` (PR #68) verwendet die vorhandene **eine** V3-Margenstrategie und nur **getrennte, exakt passende Netto-Anker**. Nach Änderung immer nur **eine bekannte Breitenachse**; bei L3 **B3 und B4 ausschließlich gemeinsam und in identischer Höhe**. Die folgenden Werte sind **interne netto-Schätzwerte**, die nicht bei Speedmaster abgefragt wurden:

| Form | Interpolierter Teilfall | Intern geschätzter EK netto |
|---|---|---:|
| U1 17,5 mm | B1=625 mm bei sonst identischer U1-Konfiguration | 531,55 € |
| U1 17,5 mm | B1=675 mm | 537,12 € |
| U1 38 mm | B1=625 mm | 781,05 € |
| U1 38 mm | B1=675 mm | 771,76 € |
| L3 17,5 mm | B3=B4=950 mm, alle übrigen L3-Maße wie oben | 529,14 € |
| L4 17,5 mm | B5=650 mm, alle übrigen L4-Maße wie oben | 471,94 € |

Für U1 ausschließlich B1 **zwischen 600 und 700 mm**, bei gleicher Dicke, sämtlichen anderen aufgeführten Maßen und dekorgleichen Kanten; **nächste bestätigte Nachbarwerte 600/650 bzw. 650/700 mm** als Interpolationsklammer. L3 ausschließlich B3=B4 **zwischen 900 und 1000 mm**, L4 ausschließlich B5 **zwischen 600 und 700 mm**; jeweils nur bei exakt dokumentierten anderen Maßen und 17,5 mm. Die Cent-Rundung ist beim internen Modell zugunsten einer nicht zu niedrigen EK-Schätzung.

**Keine 2D-Kombination:** z. B. L3 L1=2250 UND B3/B4=950 ist unbelegt, obwohl L3 bereits eine separate L1-Längenkalibrierung besitzt. Ebenso U1 B1=625 mit geänderter L2, U1 Breiten außerhalb 600–700 mm, andere Dekore, Formwechsel oder eine automatische Übertragung der 17,5-mm-Breitentendenz auf 38 mm.

### Freigabe- und Kostengrenzen

- **Noch keine Shoppreisausgabe aus diesen Modellen**, keine Live-Freischaltung, kein automatischer Speedmaster-Auftrag. `supplierNetQuoteVerifiedForExactTarget=false`, `realPackedDimensionsVerified=false`, `checkoutPriceApproved=false` und `purchasable=false`.
- V3 **40 % Zielmarge**, **35 % Mindestmarge nach Rabatt**, **10 % Reserve**, **19 % deutsche USt. genau einmal**. Speedmaster-Anlieferung **10 € netto** Standard plus **einmalig 50 € netto** bei tatsächlich nachgewiesenem physischem Lieferteil ≥1900 mm = **60 € netto insgesamt**, nicht 70 €.
- Hersteller-Zuschnitte, Verbinder, tatsächliche Lieferteillängen, Versand- und Gesamtkosten und kontrollierte Woo-Testbestellung sind weiter nicht durch diese vier Preiswerte bestätigt.

## Nächster sinnvoller Preisblock

Jetzt **nicht dieselben B1-Werte erneut** erfragen. Als Nächstes einen **Dekorvergleich** mit identischen Ausführungen in **beiden Dicken** und mindestens einer **L-/U-Form**, danach nur gezielte Gegenbeispiele für L3/L4 gekoppelten Breitenverlauf und weitere Größenbereiche. Präferiert direkte **Textpreise** mit vollständig gleichen Maßen; keine Screenshots/ZIPs. Parallel fertige Hersteller-Teil-/Packstückliste für repräsentativen Testauftrag ermitteln und den vorhandenen Woo-Bestellweg kontrolliert prüfen.
