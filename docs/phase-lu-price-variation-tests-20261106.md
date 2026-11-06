# Speedmaster – kontrollierte L-/U-Preisvergleiche, 06.11.2026

**Stand:** Drei **echte neue Speedmaster-Screenshots** eingegangen, Preisregister und Original-SHA manifestiert. Alle Beträge sind **Bildanzeigen**, keine gesondert bestätigten aktuellen Netto-EKs, weder Fertigungs- noch Woo-Verkaufsfreigabe. Der bereits gemergte PR #61 enthält zwei vorherige L1/U1-Ausgangsreferenzen; diese sind unverändert.

## Alle drei neuen Kontrollwerte

| Test | Herstellermaße / Standard | Ausgangsreferenz | Herstelleranzeige | Delta | Fachlich belastbare Aussage |
|---|---|---:|---:|---:|---|
| L1 → **L2** | L1=2250, L2=1200, B1=B2=600; 38 mm W980 ST7, 1,5-mm-Dickkanten alle dekorgleich | L1 **488,01 €** | L2 **488,01 €** | **0,00 €** | Beim **genau getesteten** Form-/Stoßwechsel keine Preisabweichung |
| U1 → **U2** | L1=2250, L2=1200, L3=1800, B1/B2/B3=600; 38 mm W980 ST7, 1,5-mm-Dickkanten alle dekorgleich | U1 **715,04 €** | U2 **710,91 €** | **−4,13 €** | U2 ist hier 4,13 € günstiger |
| L1 → **L1 links abgeschrägt („Kante durchlaufend“)** | L1=2250, L2=1200, B1=B2=600; **Abstand L3=150, B3=150**; 38 mm W980 ST7; Modell/andere sichtbare Kanten dekorgleich | L1 eckig **488,01 €** | abgeschrägt **510,02 €** | **+22,01 €** | **Eckgeometrie mit durchlaufender Kante**, kein Test einer isoliert anders beschichteten linken Kante |

Originalbilder aus dem aktuellen Chat: `image(20261106-085123).png` (L2), `image(20261106-085256).png` (U2), `image(20261106-085351).png` (L1 abgeschrägt). Exakte Preise, Maße, SHA-256 und Quellstatus: [Kontrollbeleg-JSON](references/speedmaster-lu/LU_THREE_PRICE_CONTROLS_20261106.json), [SHA-/Pixel-Manifest](references/speedmaster-lu/LU_3_20261106_SOURCE_MANIFEST.csv), [zentrale Preisliste](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv), [Kontrollmatrix](references/speedmaster-lu/PRICE_VARIANT_CONTROL_20261106.csv).

### Zusätzlicher Befund: U2 −4,13 € bei zwei unterschiedlichen Längen

Ein **älteres, unabhängig dokumentiertes Speedmaster-Bild** für 38 mm W980 mit L1=2000, L2=1200, L3=1800, B1/B2/B3=600 zeigt **U2 687,36 €** bei **U1 691,49 €** (= −4,13 €). Bei L1=2250 mm beträgt die neue Abweichung **U2 710,91 €** zu **U1 715,04 €** (= **erneut −4,13 €**). Dies stützt in der **engen, getesteten W980/38-mm-Konfiguration** eine konstante U-Form-/Stoßdifferenz über diesen 250-mm-Abschnitt, aber rechtfertigt **noch keine universelle −4,13-€-Regel** für andere Längen, Breiten, Dicken, Dekore oder Eckvarianten.

L2 hat bisher nur den **einen** Nachweis bei 2250 mm für Gleichheit mit L1. Eine generelle L1=L2-Kalkulation wäre verfrüht.

### Wichtige Abweichung von der ursprünglichen dritten Testanforderung

Der dritte Screenshot zeigt eindeutig **„Arbeitsplatte L1 links abgeschrägt (Kante durchlaufend)”** mit zwei zusätzlichen 150-mm-Abständen. Die ursprünglich gewünschte Prüfung „**nur eine linke Kante** anders einstellen, **ohne Änderung an der Grundform**” wurde daher **nicht** durchgeführt. Die +22,01 € gehören zu **diesem Eckfall** (Geometrie und durchlaufende Kante) und dürfen **nicht** als pauschaler Kantenaufpreis gespeichert werden.

## Nächste Preisbelege, minimal und gezielt

1. **L2 bei L1=2500 mm**, ansonsten L2=1200, B1/B2=600, 38 mm W980, alle 1,5-mm-Dickkanten: prüft die vorläufige Preisgleichheit L1/L2 außerhalb des einen Bildpunkts (L1-Referenz **511,56 €**).
2. **U2 bei L1=2500 mm**, ansonsten L2=1200, L3=1800, B1/B2/B3=600, 38 mm W980, alle 1,5-mm-Dickkanten: prüft, ob der beobachtete −4,13-€-Unterschied auch am dritten Längenpunkt gilt (U1-Referenz **738,59 €**).
3. **L1 eckig** mit L1=2250, L2=1200, B1=B2=600, 38 mm W980: **nur eine in Speedmaster tatsächlich angebotene Standard-Kantenoption** links ändern, ohne „links abgeschrägt“ oder neue L3/B3-Eckabstände; so wird der reine Kantenaufpreis isoliert.

Erst danach ggf. L3/L4-Basismuster, U3/U4 und weitere Dekore/Dicken. Kein neues Modell für L/U auf Basis bloßer Universalzuschläge. Beobachtungen müssen mit Nettostatus/aktuellem Lieferanten-EK und tatsächlichen Teil-/Packstücklängen separat verifiziert werden.

## Feste Grenzen

- **Preise im WordPress-Konfigurator unverändert**: L-/U-Live-Verkauf nicht freischalten. Die interne PHP-V3-Kalibrierung kann die neuen **Standard**-L2/U2-Bildbeträge vergleichen, aber weder daraus einen aktuellen Netto-EK noch eine Woo-Preissignatur ableiten. Der Sonderfall „L1 links abgeschrägt“ bleibt **explizit außerhalb** der serverseitig nur für eckige Grundformen geltenden Preisfreigabe.
- **Versand unverändert:** Speedmaster 10 € netto Grundkosten, einmalig +50 € bei mindestens einem **nachgewiesenen tatsächlich langen Liefer-/Packstück ≥1900 mm**, insgesamt 60 € netto, nicht 70 €.
- **Betriebsregeln unverändert:** 40 % Zielmarge, 35 % Mindestmarge nach Rabatt, 10 % Kostenreserve, einzige Regelimplementierung in `HPZ_APL_Price_V3`.
- **UI-Arbeit später:** B5-Label ohne technischen Wortzusatz, stabile SVG-Grundrissgröße beim Eckwechsel, kurzer Woo-Produktkopf nur H1 + Kurzbeschreibung.


**Prozessänderung 06.11.2026:** PR #63 inzwischen gemergt, historisches Original-ZIP verifiziert. **Keine weiteren Preisbilder oder ZIP-Archive anfordern**; zukünftige Speedmaster-Browserabfragen samt vollständigen Parametern und Beträgen als GitHub-Text erfassen. [Verbindliche Policy](references/speedmaster-lu/PRICE_TEXT_EVIDENCE_POLICY_20261106.md).


## Abgeschlossen/ersetzt am 06.11.2026

Die damals noch angefragten **L2/U2-Preise bei L1=2500** wurden inzwischen als Textbelege geliefert: **L2 511,56 €**, **U2 734,46 €**. Auch **L3/L4 (2000 und 2500)** und **U3/U4 (2500)** sind als Textpreise dokumentiert. Siehe [aktuelle Acht-Fälle-Analyse](phase-lu-eight-text-prices-model-20261106.md). Keine weiteren Screenshot-ZIPs mehr. Der reine Kantentest ist auf ausdrücklichen Betreiberwunsch **abgesagt**, da **ausschließlich dekorgleiche Kanten** angeboten werden. Die obige alte Liste ist historische Planung, nicht länger die nächste To-do-Liste.
