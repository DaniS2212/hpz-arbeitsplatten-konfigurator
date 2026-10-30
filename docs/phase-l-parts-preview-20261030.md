# L1–L4: echte, auswählbare Teileansicht der Planungsgeometrie (30.10.2026)

## Ziel
Die bereits freigegebene UX der **Geraden** bleibt das Gestaltungsvorbild. Bei der L-Form gibt es neben der großen gemeinsamen Draufsicht die Ansicht **„Aufteilung“**. Bisher wurden dort lediglich gestrichelte Hilfslinien kräftiger gezeichnet. Diese Änderung macht die Bildvorlage nachvollziehbarer, ohne eine Fertigungsfreigabe vorzutäuschen.

## Was sichtbar wird
- **L1 und L2:** ein oberer Bereich und ein linker bzw. rechter Schenkel (2 Teilflächen).
- **L3 und L4:** obere Strecke, eigener Eckbereich und linker Schenkel (3 Teilflächen).
- Die Bereiche werden in der Aufteilung leicht getönt und **1/2/3** nummeriert. Über kompakte Schaltflächen („Alle Teile“, „1 · …“ usw.) oder direkt über eine Fläche in der Zeichnung kann man die Bereiche einzeln hervorheben; auch die vergrößerte Zeichnung folgt der Auswahl.
- Die Gesamtansicht bleibt unverändert: eine zusammenhängende, texturierte Oberfläche mit dezenten Stoßlinien. **Keine künstlichen Zwischenräume** und keine neuen Formularschritte.
- Bei L3/L4 werden die beiden bekannten Stoßrichtungen an denselben Maßgrenzen geteilt wie zuvor gezeichnet. Bei L4 kommt die äußere Diagonale aus der bestehenden, ausdrücklich vorläufigen B5-Projektion. Bei abgerundeten/abgeschrägten Außenecken schneidet eine SVG-Maske jede Farbfläche an der tatsächlichen Kontur ab; die Stücke überdecken die Kontur niemals.
- Der Wechsel von L1 zu L4 setzt eine ausgewählte Teilfläche zurück, nicht jedoch die gespeicherten Maße/Dekore. Die Auswahl hat **keinen** Einfluss auf Preise, Konfigurationen, Warenkorb oder Versand.

## Geometrische Methode
Die bekannten L1/L2-Grundumrisse werden an `y=B2` in zwei nicht überlappende Polygonbereiche zerlegt. Bei L3/L4 wird die Fläche durch `x=B3` (obere Strecke) und `y=B4` (linker Schenkel) in drei Bereiche aufgeteilt; der verbleibende Teil ist der Eckbereich. Polygon-Clipping entlang dieser Geraden erzeugt die gekennzeichneten Regionen, ihre Schwerpunkte bilden die Markerpositionen. Die Anzeige nutzt **dieselbe Quelle** wie die vorhandenen Stoßlinien und wird bei jeder Maßänderung neu berechnet.

Die Form entspricht damit dem aktuell **aus Speedmaster-Screenshots abgeleiteten Vorschauplan**. Die Teilflächen selbst sind *keine* bestätigten Zuschnitte und **keine** Speedmaster-Stückliste. Abgeschrägte und gerundete Ecken beeinflussen ausschließlich die sichtbare Schnittmaske. Die intern nicht bestätigten Maschinen-, Fräs- und Versandparameter `joints`, `shippingParts` bleiben `null`; `supplierMappingVerified` bleibt `false`.

## Tests
- L1/L2 gespiegelte Zweiteilung, L3/L4 Dreiteilung inkl. selbstständigem Eckbereich.
- Flächenabdeckung ohne rechnerische Überschneidungen für die unveränderte Grundkontur.
- Alle zehn Eckzustände je L1–L4 sowie zwei stark abweichende L4-Diagonalproportionen.
- SVG-Teile-/Masken-/Nummernregression und keine Teile bei Gerade/U.
- Chromium auf Desktop und mobil: Anklicken, Auswahl, Variantenwechsel, keine horizontalen Überläufe, weiterhin nur Adminvorschau.

## Nächster fachlicher Schritt
Für eine **fertigungstreue und preisfähige** Teilung werden noch Herstellerdaten benötigt: vergrößerte L1/L2-Stoßverbindungen sowie zwei Stoßbereiche bei L3/L4; genaue Dübel-, Fräs-/Verbinderlage; überprüfter L4-B5-Vergleich bei genau einer Maßänderung; Lieferanten-Mindest-/Maximalmaße je Form und Dekor. Die bereits bestätigte L1-EK-Referenz **464,45 €** ist kein allgemeiner Verkaufspreis und wird in dieser Änderung nicht verwendet.

**Unverändert:** Gerade (Woo 1000083), U-Entwurf (1000081), L-Entwurf (1000080), Produktfreischaltung, Preiskalkulation und Auto-Updater.
