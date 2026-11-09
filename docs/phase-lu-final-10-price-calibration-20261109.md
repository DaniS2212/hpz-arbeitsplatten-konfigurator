# L/U Preisabschluss – 10 echte Speedmaster-Netto-EKs vom 09.11.2026

**Betreiberziel:** Keine weiteren langen Speedmaster-Kontrollrunden. Alle vom Konfigurator angebotenen Maße, 16 Dekore, 8 L-/U-Formen und die vorhandenen L-Eckoptionen sollen grob wirtschaftlich plausible Preise bekommen. Danach Woo-Checkout testen, dann mit ausdrücklich bestätigten Kosten und Verkaufsschaltern veröffentlichen.

## Die zehn direkten Netto-EK-Vergleiche

Quelle: `docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json`, direkte strukturierte Betreiberangaben vom 09.11.2026. **Alle Preise netto, nicht Verkaufspreise.**

| Nr. | Fall | Altes EK-Modell netto | Speedmaster netto | Abweichung |
|---|---|---:|---:|---:|
| 1 | L1 W980 17,5, L1=1890 | 325,11 € | 300,03 € | +8,4 % |
| 2 | L1 W980 17,5, L1=1900 | 325,49 € | 300,73 € | +8,2 % |
| 3 | L1 W980 38, L1=2250, links eckig 150×150 | 527,01 € | 510,06 € | +3,3 % |
| 4 | L2 H1145 17,5, L1=2250, rechts R2=150 | 378,23 € | 351,33 € | +7,7 % |
| 5 | L3 W980 17,5, B3/B4=950 | 529,14 € | 528,89 € | +0,0 % |
| 6 | L4 W980 38, L1=2700 B5=700 | 812,41 € | 724,66 € | +12,1 % |
| 7 | U1 W980 38, B1=675, L2=1700 | 771,76 € | 767,63 € | +0,5 % |
| 8 | U2 H1145 17,5, drei variierte L-/B-Maße | 602,65 € | 547,40 € | +10,1 % |
| 9 | U3 F128 38, Standardreferenz | 874,55 € | 837,82 € | +4,4 % |
| 10 | U4 F128 17,5, verlängert/verbreitert | 972,07 € | 828,24 € | +17,4 % |

Vorherige EK-Annahmen lagen **in allen zehn Fällen über Speedmaster** (mittlere relative Überhöhung ca. 7,2 %). Kein Fall zeigt einen zu niedrigen EK. Das motiviert die Abschaffung des pauschalen siebten Prozentpunkts, **nicht** einen neuen unbelegten Preisaufschlag.

## Eingearbeitete Änderungen
- Die zehn **exakten** Komplettkonfigurationen, einschließlich beider Eckbearbeitungen, erhalten ihre tatsächlichen Netto-EKs und werden als **belegt nur für exakt diese Größe** gekennzeichnet. Dazwischen noch belegte L1 1890–1900 mm, U1 B1 650–675–700 mm und L3 B3/B4 900–950–1000 mm als stückweise, sauber begrenzte Interpolationsreihen.
- Sonstige Maße behalten das bestehende V3-basierte Rechenmodell, **ohne den überflüssigen pauschalen 7-%-Schätzaufschlag** zusätzlich zur bereits vorhandenen **10-%-Kostenreserve**. Längen erhalten wieder den empirischen vollen 500-mm-Preisgradienten (statt unnötigen +25 % bei Verlängerungen oder nur der halben Gutschrift bei Verkürzungen).
- Breitenkostenansatz von 0,15 €/mm auf 0,10 €/mm für 17,5 mm, von 0,30 €/mm auf 0,20 €/mm für 38 mm reduziert; bei L4/38 verursacht **B5 allein** im generischen Näherungsmodell keinen zusätzlichen Vollbreiten-Aufschlag (es ist eine äußere Diagonale).
- U-Form `F128`: Der auf summierten Rechteckflächen basierende Dekoraufschlag wird auf **75 %** reduziert, weil die erste unabhängige U3/F128/38-Prüfung einen ca. 36,73 € zu hohen Dekor-EK-Anteil ergab. Die anderen vorhandenen V3-Dekorreferenzen bleiben unverändert.
- Die kaufmännischen Kostenschätzungen für Rundungen und Abschrägungen beginnen allgemein bei **25 € Netto-Kosten pro Seite** statt bisher 44/39/35 €. Größere Radien bzw. große Abschrägungen, L3/L4-Aufwand und beidseitige Bearbeitung können weitere Kosten tragen. Die drei direkt beobachteten Einzel-EK-Konfigurationen (früher eine durchlaufende Abschrägung, jetzt eine eckige und eine Rundung) bleiben von diesen Schätzsätzen unberührt.
- Die **190-cm-Regel** bleibt **10 € netto interne Anlieferung unter 190 cm** bzw. **60 € netto ab 190 cm**, einmalig anhand konfigurierter L-Achsen. Kundenseitige Woo-Fracht separat.
- Unverändert: V3 40 % Netto-Zielmarge gegen kalkulierte Kosten, 10 % Reserve, 35 % Mindestmarge nach Rabatt **gegen kalkulierte Kosten**, 19 % DE-USt in Bruttoreferenz, Rundung auf 10 €. Preis ist kein garantierter Gewinn, wenn echter Speedmaster-EK außerhalb der Stichproben abweicht.

## Ab hier statt weiterer Einkaufszettel
1. CI der alten und neuen Preise vollständig grün; alltagsnahe Nachbarmaße auf Ausreißer im Admin prüfen.
2. Zusätzliche Kosten und tatsächliche Woo-Versandarten übernehmen und Admin-Preise freigeben. Die im Preview ausdrücklich provisorischen 0 € sonstigen Netto-Nebenkosten sind **keine Freigabe**.
3. Deutsche Woo-Testbestellung durch den signierten L/U-Checkout mit Material, Dekor, Stoßform, Eckmaßen, deutscher USt, Menge, Versand, Gutschein und manueller Speedmaster-Auftragsübergabe.
4. Erst **nach Betreiberfreigabe** echte Produkte veröffentlichen. Keine Änderung an der geraden Platte, keine weiteren Hersteller-CNC-/Packstück-Nachweishürden für Preisbildung.

**Einschränkung:** Geometrisch/technisch vom UI abgelehnte oder außerhalb der bestehenden Preisgrenzen liegende Konfigurationen sind weiterhin nicht kalkulierbar. Das ist kein Anspruch auf ein aktuelles Speedmaster-Nettoangebot für alle mathematisch möglichen Maße.
