# L1–L4: Referenzfälle aus Speedmaster-Aufnahmen vom 02.11.2026

**Status: visuelle Referenz, keine Produktionsfreigabe.** Die Werte sind aus den vom Auftraggeber bereitgestellten Screenshots der Speedmaster-Draufsichten und Eingabefelder transkribiert. Alle Maße mm. Unterschiede in Preis, Fräsung oder Kantenbearbeitung werden dadurch nicht automatisch bestätigt.

## Für beide Ecken gleichzeitig: unterschiedliche Maßpaare

| Variante | Grundmaße | Eckfelder links | Eckfelder rechts | Beurteilung |
| --- | --- | --- | --- | --- |
| **L1** | L1=2000, L2=1200, B1=600, B2=600 | L3=120 (vertikal), B3=240 (horizontal) | L4=120 (horizontal), B4=240 (vertikal) | Abschrägungen an beiden äußeren Schenkelenden, Herstellerbild 02.11. |
| **L2** | L1=2000, L2=1200, B1=600, B2=600 | L3=240 (horizontal), B3=120 (vertikal) | L4=120 (vertikal), B4=240 (horizontal) | Gespiegelte Schenkel, beide Abschrägungen in separaten Bildern variiert. |
| **L3** | L1=L2=2000, B1/B2=600, B3/B4=900 | L5=120 (vertikal), B5=400 (horizontal) | L6=150 (horizontal), B6=150 (vertikal) | Innere Diagonale getrennt von äußerer Eckabschrägung, Grundriss. |
| **L4** | L1=L2=2000, B1/B2=600, B3/B4=900, B5-Grundmaß=600 | L5=150 (vertikal), B5-Eckmaß=150 (horizontal) | L6=120 (horizontal), B6=240 (vertikal) | Innere und äußere Diagonale; äußerer Diagonalversatz bleibt eine **nicht bestätigte mathematische Annahme**. |

**Wichtig zur Mehrdeutigkeit:** `B5` in der L4-Grundeingabe (Abstand zwischen parallelen Diagonalen) ist **nicht** `corner-B5` an der linken äußeren Ecke. Der Kern normalisiert beide getrennt. Im Kanten-/Maß-UI werden sie getrennt fokussiert.

## Konturregel und sichtbare Nuancen

- **Abgeschrägt – eckig:** Die Außenkontur besteht aus zwei scharfen Übergängen zum langen geraden Diagonalschnitt.
- **Abgeschrägt – Vorderkante durchlaufend:** Auf mehreren schrägen Speedmaster-Nahaufnahmen sieht man einen **langen geraden Diagonalschnitt mit kleinen weichen Übergängen** zwischen Diagonale und angrenzender Kante. Im reinen SVG wird deshalb nur am Endpunkt sehr wenig geometrisch geglättet; **der sichtbare Übergang hat keinen bestätigten Radius und keine Hersteller-CNC-Freigabe**. Der Kernwert `path` bleibt bewusst polygonal.
- **Abgerundet:** Separater Radius; nicht mit einer durchlaufenden abgeschrägten Vorderkante verwechseln.
- **Maße:** Die Eckfeld-Achsen folgen der Schenkelorientierung, nicht den Buchstaben L/B in der Horizontalen/Vertikalen. Bemaßung liegt außerhalb der Holzfläche; das L4-Grundmaß B5 wird als externe Bezeichnung zur Diagnosediagonale geführt, um das Dekor nicht zu verdecken.

## Automatisierte Abnahme

`node --test local/test/l-speedmaster-reference-matrix-20261102.test.mjs`

Prüft die zwei Eckpunkte pro Variante aus **ungleichen** Werten, echte Segmentlängen, Freigabesperren, kurze Beschriftungszuordnung und die beiden unterschiedlichen Sichtkonturen. `wordpress/l-visual-fidelity-browser-runner.mjs` rendert zusätzlich L1–L4 × beide Abschrägungen × Desktop/Mobil (16 Bilder) und eine Fokusansicht des L4-B5-Grundmaßes (2 Bilder). Artefaktname: `l-speedmaster-visual-review`.

Die Screenshots sind **Beleg für die gezeigten Einzelkonfigurationen**, nicht für sämtliche zulässigen Herstellermaße oder die exakten CNC-Parameter. Jede Änderung von Abmessungen, Plattenstärken oder Eckkombinationen benötigt ergänzende Prüfungen. **Teileansicht PR #32 bleibt bestehen**; die darin verwendeten Stoßlinien und Teilregionen sind derzeit ausschließlich orientierende Überlagerungen, keine Lieferantenspezifikation.

## Weiterhin offen – bewusst keine Spekulation

- Lieferantenspezifische Fräsabstände, Verbinderzahl, reale Teilplattenzuschnitte und Kantenprofile;
- die exakt zulässigen Eckmaß-Grenzen je Variante und Oberfläche;
- ein nachgemessenes Profil des weichen Vorderkantenübergangs (sichtbar, aber nicht bemaßt);
- L4 B5-Grundmaß bei nur einer isolierten Wertänderung zur unabhängigen Prüfung der äußeren Diagonalprojektion;
- technische Explosions-/Transparenzansichten sowie Produktions- und Preisfreigaben.

**L1/L2/L3/L4 bleiben reine Administrator-Vorschauen und nicht bestellbar. Gerade ist unverändert.**