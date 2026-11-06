# L1–L4/U1–U4 – 17,5-mm-Netto-Einkaufspreise und Steuerbasis, 06.11.2026

> **Aktualisiert nach vier weiteren 2.000-mm-Preisbelegen (PR #67):** Für **L2/L3/L4/U2** liegen jetzt **zwei exakte Netto-Längenanker 2000/2500 mm** mit derselben Steigung **+34,74 € / 500 mm** vor. Der folgende frühere Abschnitt über „nur einen“ Referenzpunkt ist **historisch**; der aktuelle Stand steht im Nachtrag unten. Das U3/U4-Modell bei 17,5 mm bleibt mangels zweitem Längenanker offen.


**Verbindliche Betreiberbestätigung vom 06.11.2026:** **Alle Speedmaster-Produktpreise werden ohne Mehrwertsteuer angezeigt.** Für die Kalkulation sind Speedmaster-Beträge daher **Netto-EKs**. Die **19 % deutsche Umsatzsteuer** werden bereits vom vorhandenen `HPZ_APL_Price_V3::targetGrossForVerifiedCosts()` in die **deutsche Brutto-Referenz** einkalkuliert. **Kein doppelter MwSt.-Aufschlag.** Für tatsächliche Bestellungen übernimmt WooCommerce die zutreffende Steuer des Kunden/Lieferlands. Die Steuerbasis-Bestätigung ist **nicht** dasselbe wie eine Hersteller-CNC-Freigabe, aktuelle formelle Lieferantenzusage, tatsächliches Packmaß oder Checkout-Freigabe.

## Sechs neue genaue 17,5-mm-Netto-EKs (ohne Bilder/ZIPs)

**Gilt ausschließlich für:** APL17.5, Dekor **W980 ST7 Platinweiß**, Profil und alle äußeren Kanten **1,5 mm dekorgleich**, **keine zusätzliche Eckbearbeitung**, geometrische Form gemäß Spalte. Betrag: **Speedmaster netto in EUR je konfiguriertem Stück**. Quelle: direkte Betreiber-Textmitteilung vom 06.11.2026.

| Form | Vollständige Maße in mm | Speedmaster EK netto |
|---|---|---:|
| **L2** | L1=2500, L2=1200, B1=B2=600 | **342,41 €** |
| **L3** | L1=2500, L2=2000, B1=B2=600, B3=B4=900 | **523,29 €** |
| **L4** | L1=2500, L2=2000, B1=B2=600, B3=B4=900, **B5-Grundmaß=600** | **465,68 €** |
| **U2** | L1=2500, L2=1200, L3=1800, B1=B2=B3=600 | **494,03 €** |
| **U3** | L1=2500, L2=1200, L3=1800, B1=B2=B3=600 | **494,03 €** |
| **U4** | L1=2500, L2=1200, L3=1800, B1=B2=B3=600 | **494,03 €** |

**Bestehende 17,5-mm-Referenzen derselben Ausführung:** L1 bei L1=2500/L2=1200/B1=B2=600: **342,41 € netto**; U1 bei L1=2500/L2=1200/L3=1800/B1/B2/B3=600: **494,03 € netto**. Daraus folgen **bei diesen konkreten 2500-mm-Maßen** L1=L2 und U1=U2=U3=U4; L3 ist **57,61 € teurer** als L4. Dies ist **keine universelle Formpreis-Gleichheit** bei anderen Maßen, anderen Dicken oder anderen Dekoren.

Verbindliche maschinenlesbare Belege: [17,5-mm-JSON mit Netto- und Ausgangsmerkmalen](references/speedmaster-lu/LU_175_NET_PRICES_20261106.json), [zentrale CSV](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv). **Keine neuen Screenshot-Originale, ZIPs oder SHA-Nachweise** nötig.

### Steuerbasis für die älteren 38-mm-Preisfotos und Textwerte

Die **2026-11-06 Betreiberbestätigung gilt auch für die zuvor erhobenen Speedmaster-Preis-Anzeigen** (einschließlich der acht 38-mm-Textwerte). Die historischen Originalbelege selbst behalten ihre früheren `supplier_screen_display_only`-/`user_supplied_text_display_only`-Felder, weil diese die **Belegart** und die ursprüngliche Prüfgrenze beschreiben. **Die Bestätigung der Netto-Steuerbasis ist jetzt global dokumentiert**. Sie macht diese älteren Preise nicht automatisch zu **aktuellen Herstellerzusagen für variable Fertigung oder Live-WooCommerce-Bestellungen**. Der interne Kalibrierungs-Baustein führt diese Herkunftsstufen deshalb weiterhin getrennt.

## Interne V3-Brutto-Szenarien – noch keine Kundenangebote

Die bestehende V3-Funktion verwendet exakt: **10 % Reserve auf Netto-Kosten**, **40 % Zielmarge**, deutsche Bruttoreferenz **+19 % USt.** und Rundung auf die nächsten vollen **10 €**. Hier werden **nur hypothetische** 10 € beziehungsweise 60 € Netto-Anlieferung und **0 € weitere Kosten** angenommen.

| Form | Speedmaster EK netto | V3-Brutto bei 10 € Anlieferung* | V3-Brutto bei 60 € Anlieferung* |
|---|---:|---:|---:|
| L2 | 342,41 € | 770 € | 880 € |
| L3 | 523,29 € | 1.170 € | 1.280 € |
| L4 | 465,68 € | 1.040 € | 1.150 € |
| U2 | 494,03 € | 1.100 € | 1.210 € |
| U3 | 494,03 € | 1.100 € | 1.210 € |
| U4 | 494,03 € | 1.100 € | 1.210 € |

*Unverändert: Speedmaster 10 € netto Standardanlieferung, **einmalig +50 €** netto erst wenn **mindestens ein tatsächliches Hersteller-Lieferteil >=1900 mm** ist (somit 60 € netto gesamt). Außenlänge L1=2500 mm ist **kein Nachweis** der Einzellängen. Weitere Kosten und Pack-/Verbinderdaten sind noch nicht für diese neuen Beispiele überprüft. Die Beträge in dieser Tabelle sind **nicht als Shop-Verkaufspreis freigegeben**; der 35-%-Mindestmargen-Check nach Rabatten folgt unverändert aus V3.

## Technische Umsetzung

- `pricing-v3/HPZ_APL_LU_Calibration_11.php` liest ab jetzt **nur exakt typisierte**, vollständige `operator_confirmed_net_EK`-Datensätze aus der zentralen Preis-CSV **zusätzlich** zu den historischen 17,5-/38-mm-Referenzen der L1/U1. **L3/L4 B4 und L4 B5** werden vollständig geprüft, zusätzliche Dimensionsfelder ausgeschlossen.
- Für die sechs neuen exakten Fälle wird `netSupplierReferenceCents` mit `exact-operator-confirmed-net-reference` befüllt und **V3** für unverbindliche deutsche Bruttoszenarien wiederverwendet; `supplierNetQuoteVerifiedForExactTarget=false`, `checkoutPriceApproved=false` und `purchasable=false` bleiben bestehen.
- Mit **nur einem** 17,5-mm-Netto-Anker je neuer Form gibt es **noch keine** verlässliche Längeninterpolation dieser Form. Insbesondere 38-mm-Längensteigungen dürfen **nicht** ungeprüft übertragen werden.
- WooCommerce, öffentliche Preisroute, Gerade und Live-Kaufschaltung bleiben unverändert.

## Nächste hochwirksame Vergleichspreise (17,5 mm)

Zum Validieren von Preisgleichheit und einem **zweiten** Längenanker bei 17,5 mm vorzugsweise L1=2000 mm:
1. **L2:** L1=2000, L2=1200, B1/B2=600 (L1-Referenz 307,67 € netto).
2. **U2:** L1=2000, L2=1200, L3=1800, B1/B2/B3=600 (U1-Referenz 459,29 € netto).
3. **L3:** L1=2000, L2=2000, B1/B2=600, B3/B4=900.
4. **L4:** wie L3, zusätzlich B5=600.
5. Optional **U3/U4** bei L1=2000 mit U2-Daten, um die Varianten-Gleichheit vollständig gegenzuprüfen.

**Danach** gezielte Breiten- und Dekorbelege, Hersteller-Teilzuschnitte und Checkout-Test. Keine eigenmächtige Extrapolation oder neue Preistabellenarchitektur.

## Aktueller Nachtrag 06.11.2026 – vier weitere Original-Netto-Referenzen als Text

Die anschließend vom Betreiber eingegebenen **vier Speedmaster-Netto-EKs** sind in [LU_175_2000_NET_PRICES_20261106.json](references/speedmaster-lu/LU_175_2000_NET_PRICES_20261106.json) und der [zentralen Preis-CSV](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv) erfasst. Sie verwenden **17,5 mm, W980 ST7, sämtliche Kanten 1,5 mm dekorgleich, keine zusätzlichen Eckbearbeitungen**.

| Form | Maße (mm) | EK bei L1=2000 netto | EK bei L1=2500 netto | Netto-Delta |
|---|---|---:|---:|---:|
| L2 | L2=1200, B1/B2=600 | **307,67 €** | 342,41 € | +34,74 € |
| L3 | L2=2000, B1/B2=600, B3/B4=900 | **488,55 €** | 523,29 € | +34,74 € |
| L4 | L2=2000, B1/B2=600, B3/B4=900, **B5-Grundmaß=600** | **430,94 €** | 465,68 € | +34,74 € |
| U2 | L2=1200, L3=1800, B1/B2/B3=600 | **459,29 €** | 494,03 € | +34,74 € |

**Exakt kontrollierte Form-Relationen an beiden Längen:**

- L1=L2 bei **2000 und 2500 mm** (307,67/342,41 €); U1=U2 bei beiden Längen (459,29/494,03 €).
- L3-L4 = **57,61 €** bei **2000 und 2500 mm** (488,55−430,94 bzw. 523,29−465,68).
- Alle **sechs** L1/L2/L3/L4/U1/U2-Standardfälle steigen in diesem konkreten 17,5-mm-W980-Korridor für +500 mm L1 um **34,74 € netto**. Das ist eine plausible gemeinsame Preiskomponente, **keine allgemeine Formel für andere Maße, Breiten oder Dekore**.
- U3/U4 sind bei 17,5 mm weiterhin **nur bei L1=2500** belegt (494,03 €), darum **keine** Interpolation bei 2000..2500 mm für diese beiden Formen.

### Interner Längen-Zwischenpunkt bei L1=2250 mm (noch keine Herstellerabfrage)

Die vorhandene `HPZ_APL_LU_Calibration_11` bildet bei unveränderten übrigen Maßen innerhalb **L1=2000..2500 mm** jetzt streng begrenzte Netto-EK-*Schätzwerte*:

| Form | Modell-EK netto bei 2250 mm |
|---|---:|
| L2 | **325,04 €** |
| L3 | **505,92 €** |
| L4 | **448,31 €** |
| U2 | **476,66 €** |

Diese Werte wurden **nicht bei Speedmaster angefragt** und werden ausdrücklich `bounded-one-axis-estimate-not-verified` zugeordnet. Sie dürfen keinen Shoppreis oder Herstellerauftrag unmittelbar auslösen. Die V3-DE-Bruttoreferenz berücksichtigt 19 % MwSt. bereits einmal; Versand bleibt **10 € netto Standard oder insgesamt 60 € netto ab tatsächlichem Lieferteil >=1900 mm**. Das sind nur Kostenszenarien, solange Packteile nicht nachgewiesen sind.

### Nächste Erkenntnisse Richtung Veröffentlichung

**Nicht** dieselben Längen nochmals abfragen. Höherer Erkenntniswert: Zuerst **gezielte Breitenänderungen** bei L1/L3/U1, weil selbst bei U1 APL38 eine größere Breite *günstiger* sein kann und daher Flächenformeln unsicher sind; dann **ein neues repräsentatives Dekor** mit identischen Maßen in beiden Dicken zur Validierung der Dekorübertragung. Für 17,5-mm-U3/U4 ein weiterer **2000-mm-Beleg** nur falls diese separat kalkuliert werden müssen. Hersteller-Teillängen/Verbinder und die Woo-Testbestellung bleiben gesondert abzusichern. **Nur strukturierte Texte, keine ZIPs/Bilder.**
