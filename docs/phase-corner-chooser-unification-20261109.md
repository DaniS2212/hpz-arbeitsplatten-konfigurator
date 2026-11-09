# UX – Eckauswahl für Gerade, L und U vereinheitlicht (09.11.2026)

## Ausgangspunkt

In der Betreiberprüfung zu **PR #79** zeigte die U1-Vorschau die links gerundete innere Ecke bei R1=10 cm korrekt; die Position der R1-Maßbeschriftung lag jedoch nahe dem B2-Lineal. Das neue U-Auswahlschema mit **vier kleinen Eck-Karten**, gefolgt von **drei breiten Bearbeitungskarten**, wurde vom Betreiber als deutlich verständlicher als bei Gerade und L bewertet. Gleichzeitig waren die Zeichnungssymbole für **„Abgeschrägt · eckig“** und **„Abgeschrägt · Kante durchlaufend“** faktisch gleich.

## Gewünschte Änderungen

1. **Identisches Layout für alle Familien:** Vier einfache Eckwahlkarten pro Zeile (Keine, Links, Rechts, Beide) und – sobald eine Seite ausgewählt wurde – drei gut sichtbare horizontale Bearbeitungskarten mit großem Icon links und kurzem Text rechts. Kompakte mobile Anpassung. Für Gerade bleiben die tatsächlichen vorderen Ecken gemeint; für L die Außenecken; für U die inneren Schenkelenden. Die bestehenden Optionen, zulässigen Maße und Preise werden **nicht** verändert.
2. **Eindeutige Bearbeitungsicons, gemeinsam wiederverwendet:** Runde Kontur mit weichem Bogen; **eckige Abschrägung** zeigt eine separat hervorgehobene **Diagonalkante mit sichtbaren Endpunkten**; **„Kante durchlaufend“** zeigt die optisch ununterbrochen hervorgehobene **Kantenlinie über Geraden und Diagonale**. Die beiden Schräge-Icons haben bewusst **denselben äußeren Plattenumriss**, weil hier die Kantenführung und nicht eine andere Deckplattenform dargestellt wird. Es sind bewusst **schematische Auswahlzeichen**, keine CNC- oder Kantenband-Fertigungsfreigaben.
3. **Weniger Kundentext:** U-ähnliche Bezeichnungen für alle Familien, ohne lange Sonderhinweise in den Auswahlkarten. Ausführliche Fertigungsunsicherheit bleibt in interner Dokumentation/geschützten Preisdatensätzen; die tatsächlich benötigten Hinweise für den Shop-Verkauf gelten weiterhin.
4. **R1/R2 in U besser positionieren:** Die Beschriftungen der linken/rechten Rundungen sitzen im weißen inneren Ausschnitt, entfernt von den B2-/B3-Breitenmaßlinien. Die Geometrie und Zahlenwerte bleiben unverändert.

## Technisch

- `local/public/component.mjs` und `wordpress/hpz-apl-admin-preview/assets/component.js` benutzen denselben `cornerTreatmentIcon()`-SVG-Baustein für alle drei Konfiguratorfamilien.
- `design/kuechenstudio-060.css`, `local/public/kuechenstudio-060.css` und `wordpress/hpz-apl-admin-preview/assets/kuechenstudio-060.css` teilen denselben vier-/drei-Karten-Stil; U1–U4-Stoßaufteilungskarten bleiben separat.
- `local/core/u1-geometry.mjs` und WordPress-Kopie verschieben nur `cornerArcs[].labelAt`, ohne tatsächliche Ausschnittkontur zu verändern.
- Browserregression `wordpress/corner-chooser-parity-browser-runner.mjs` prüft Gerade, L, U bei **1366 und 390 px**: Optionen, Icon-Motive, Rand- und Layoutstabilität und betätigbare Radios. Node-Geometrieprüfung sichert die R1/R2-Beschriftungsposition.

**Keine Änderungen an Steuern, WooCommerce, Preisen, Freigabe-Flags, Herstellerreferenzen oder Konfigurations-Hashes.** Nach Merge in der WordPress-Vorschau die drei Bearbeitungskarten und die U1-R1-Beschriftung prüfen; anschließend mit den restlichen U-Sonderbearbeitungen und dem Checkout-Test fortfahren.
