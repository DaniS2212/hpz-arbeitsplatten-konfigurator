# Verbindliche Preis Gewichts Versand und Steuertests

Status: Testfälle spezifiziert, keine Preisengine-/WooCommerce-/Flexible-Shipping-Tests ausgeführt. Keine Testumgebung vorhanden oder verbunden. Diese Fassung ersetzt sämtliche früheren Sollwerte „Kundenversand für Arbeitsplatten = 0“.

## Bezugskosten und Produktpreis

1. EK 144,99 €, ein Teil 2000 mm, Menge 1: Nettoproduktpreis 248,487 €, DE-Bruttoproduktpreis gerundet 295,70 €, jeweils vor Kundenversand.
2. Relevante Teilelänge 1899/1900/1901 mm: interne Bezugskosten 10/60/60 € netto pro Arbeitsplatte.
3. Mehrere lange Teile einer Konfiguration: weiterhin 60 €, nicht 110 €; Menge 2 = 120 € netto Bezugskosten, nicht einmalig pro Bestellung.
4. Bezugskosten unverändert bei Wahl Abholung vor Ort. Kosten dieser Kunden-Abholmethode folgen ihrer bestehenden Einstellung.
5. U1-Nichtmonotonie aus price-reference-cases.csv erhalten; keine Annahme „größer bedeutet immer teurer“.
6. Gerade APL17,5/W980, 2000 × 700 mm, alle Kanten 1,5 mm dekorgleich: Lieferanten-EK 165,80 €. Bei bestätigtem 2000-mm-Versandteil: 165,80 × 1,30 + 10 + 50 = 275,54 € netto; DE brutto 327,89 € vor Kundenversand. Dies validiert weder Materialgewicht noch angrenzende Preisbereiche.

## Kundentarife als unabhängiger zweiter Transportweg

Jeweils ein normales Paket mit Testgewicht; synthetische Gewichte sind keine freigegebenen Materialgewichte:

| Paketgewicht kg | Rest der Welt netto | Mitteleuropa netto | Schweiz netto |
|---:|---:|---:|---:|
| 2 | 6,90 | 13,90 | 35,00 |
| 6 | 7,90 | 15,50 | 37,50 |
| 12 | 9,90 | 16,50 | 38,50 |
| 18 | 12,90 | 17,90 | 39,90 |
| 24 | 24,90 | 30,90 | 52,90 |
| 30 | 80,00 | 88,00 | 150,00 |

Ausgeführte Tests müssen diese getrennten Kundentarife trotz bereits enthaltener Bezugskosten erhalten. Keine Filter zum Entfernen der Versandmethode, zum Nullsetzen oder zum Überspringen der Arbeitsplatten im Paketgewicht.

Grenzen: 4,5/9/16/21/28/9999 kg jeweils minus 0,001, exakt, plus 0,001 kg. Die exakten Grenzerwartungen werden aus verifizierter Flexible-Shipping-Semantik ermittelt; wegen „Summe“ mögliche Mehrfachtreffer ausdrücklich protokollieren. Eine Abweichung wird nicht durch Änderung bestehender Live-Regeln behoben. Über 9999 kg oder bei fehlendem Gewicht keine erfundene kostenlose Methode; kein Kauf mit unbekannten Versandkosten.

## Gewichtsableitung

Nachweis pro Material: Lieferanten-Flächengewicht oder bestätigte Dichte und Schichtaufbau, vollständige Teilekontur, Zubehör und Verpackungsmodell. Daraus unabhängige Sollwerte für Gerade/L/U und Eckvarianten bilden. Nur belegte Werte verwenden; Sockel-Stammgewicht 0 kg unverändert lassen und niemals für Arbeitsplatten übernehmen.

Tests: zwei Konfigurationen desselben Produktes mit verschiedenen Gewichten; Menge zwei ohne doppelte Mengenmultiplikation; asymmetrische L/U ohne doppelt gezählte Eckflächen; Rundung/Schräge; unbekannte Materialdichte; Sitzungswiederherstellung; Mengen-/Adresswechsel; Mischkorb mit unverändertem Sockel/Standardprodukt. Paketgewicht bleibt die Summe der korrekten Warenpositionen und sachgerecht definierten Verpackung. Falls Verpackung paketbezogen ist, Schnittstelle vor Umsetzung festlegen, nicht pro Position duplizieren.

## Steuerfälle

- DE Standardfall: 248,487 € netto → 295,70 € brutto Produkt. Bei synthetischem Kundenversand von 80 € netto und 19 % Versandsteuer zusätzlich 95,20 € brutto; gerundeter Gesamtbetrag 390,90 €. Dies bestätigt keine DE-Zonenzuordnung oder reale Plattenmasse.
- Bei synthetischem 20-%-Zielsatz: Produkt 298,18 € brutto aus demselben Nettowert, nicht 295,70 × 1,20. Bei technisch steuerfreiem Testfall bleibt netto 248,487 € vor WooCommerce-Rundung. 20 % und 0 % sind Testfixtures, keine festgelegten Ländersteuersätze.
- Tatsächliche DE-/EU-/CH-Fälle erst mit freigegebener Steuersatztabelle/OSS-Regeln. Lieferadresswechsel muss Vorschau, Position, Versandsteuer und Bestellsumme konsistent neu berechnen. Keine zusätzliche 1,19-Multiplikation auf bereits umgerechnete Kundenpreise.
- WooCommerce-Zwischensummenrundung bei Menge zwei und Mischkorb verwenden; keine eigene frühzeitige Rundung pro interner Kostenkomponente. Abholung und Express-Zahlung separat prüfen, da Steueradresse/Validierung abweichen können.
- Sockel-Regression: identische Konfiguration vor/nach Aktivierung der neuen Erweiterung hat identischen Produktpreis, Dekorauswahl, Versand und Steuer. Beide Snippets und Formular 999984 bleiben unverändert.

## Belege für Ergebnisprotokoll

Je Fall: Konfiguration/Regelversion, reale oder synthetische Gewichtsbasis, gewählte Versandzone/-methode, Nettoproduktpreis, Bezugskosten intern, Kundentarif netto, Steuerkontext, Bruttosumme und beobachtetes Ergebnis. Kein „bestanden“ ohne ausgeführten Test auf der vorgesehenen Umgebung.
