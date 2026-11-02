# L1–L4: Fertigungsabgleich / Nachweisstand 02.11.2026

**Quelle:** Speedmaster-Screenshots 30.10.2026 und die schon implementierte Kunden-Vorschaugeometrie. **Kein Hersteller-Fertigungsnachweis, keine CNC-/Preis-/Produktfreigabe.**

## Umfang der automatisierten Prüfung

Mit `node scripts/l-supplier-audit.mjs --check` werden vier konkrete Referenzeingaben aus dem Screenshot-Abgleich normalisiert und mit den gezeichneten Eckpunkten, äußeren Stoß-Endpunkten und der visuellen Flächenaufteilung überprüft. Die Tests erkennen Abweichungen durch spätere Codeänderungen und verweigern jede stillschweigende Behauptung, dass daraus eine echte CNC-Zeichnung entstehen kann.

| Speedmaster-Ausführung | Vorlage in mm | Visuelle Stoßbereiche | Evidenzstatus |
| --- | --- | ---: | --- |
| L1 (Schenkel links) | L1=2000, L2=1200, B1=600, B2=600 | 1 | Bildvorlage, keine verbindliche Fräsposition |
| L2 (Schenkel rechts) | L1=2000, L2=1200, B1=600, B2=600 | 1 | Bildvorlage, keine verbindliche Fräsposition |
| L3 (Innendiagonale) | L1=L2=2000, B1/B2=600, B3/B4=900 | 2 | Beispielzeichnung; kein CNC-Maß |
| L4 (innere und äußere Diagonale) | L1=L2=2000, B1/B2=900, B3/B4=1050, B5=600 | 2 | B5-Außendiagonale **Modellannahme**, nicht nachgewiesen |

## Benötigte Speedmaster-Nachweise vor der Preis- und Fertigungsentwicklung

1. **L1/L2:** je eine große Anschlussdetailaufnahme von oben und schräg, die **Verbindungsfräsungen, Verbinderzahl und reale Teillängen** erkennt. Die gelieferte Anzahl Teilplatten separat klären.
2. **L3/L4:** beide Anschlussfugen jeweils einzeln aus der Nähe, einschließlich Verbinder- und Dübelbild; eine Ansicht der inneren Diagonale mit genauen Zuschnittmaßen.
3. **L4 B5:** zwei identische Grundkonfigurationen mit **nur einer** Veränderung des B5-Eingabefelds (z. B. 600 auf 300 mm), jeweils mit Bemaßung und Draufsicht. Erst dadurch kann die bisherige geometrische Außenprojektion unabhängig bestätigt werden.
4. **Alle vier:** tatsächliche dynamische Speedmaster-Mindest-/Höchstmaße je Stärke und optionaler Eckbearbeitung dokumentieren; die heutigen UI-Grenzen sind nur Vorschau-Guardrails.
5. **Alle vier:** reale verpackte Stücklängen/Gewichte und Versandarten; vollständige Speedmaster-Netto-EKs einschließlich aller regulären 1,5-mm-dekorgleichen Kanten.

**Bekannte Einzelreferenz:** L1, 2.000 × 1.200 mm, B1/B2 = 600 mm, APL38 Platinweiß und reguläre Außenkante: Lieferanten-Netto-EK 464,45 €. Der Screenshot ohne eine Standardkante hatte einen niedrigeren Preis. Das ist **keine allgemeine Preisformel**.

## Qualitätssicherung und Grenzen

- Unverändert: `supplierMappingVerified:false`, `joints:null`, `shippingParts:null`, L/U nicht kaufbar.
- Testdaten sind aus Hersteller-Screenshots abgelesene Beispielwerte, keine Live-API und keine garantierte Fertigungstoleranz.
- Jede andere Stärke, anderes Dekor, abweichende Maße oder Eckform wird **nicht** als exakt dokumentierter Herstellerreferenzfall betrachtet, auch wenn die lokale Vorschaugeometrie gültig ist.
- Prüfbericht mit `node scripts/l-supplier-audit.mjs` (ohne `--check`) anzeigen.
- Dies ist ein interner Entwicklungsschritt ohne Änderungen an der derzeit sichtbaren WordPress-Vorschau. Der nächste Meilenstein wird erst nach Nachlieferung der genannten Originalangaben den exakten Zuschnitt-/Stoßvertrag festlegen.
