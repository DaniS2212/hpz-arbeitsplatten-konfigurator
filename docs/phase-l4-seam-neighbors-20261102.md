# PR #45 – L4: Stoß-A/B-Prüfansicht mit benachbarten Teilflächen

Stand 02.11.2026 · **Nur interne Zeichnungs-/UX-Prüfung. Keine freigegebene Fertigung, kein verbindlicher Zuschnitt.**

## Bildgrundlage

Die Benutzerbilder aus dem am 02.11.2026 gelieferten sechs-PNG-Paket zeigen zwei L4-Ausführungen mit identischen Grundmaßen (L1/L2 2000 mm, B1/B2 600 mm, B3/B4 900 mm, APL38, W980/ST7), nur das B5-Grundmaß variiert: 600 oder 300 mm.

- `image(20261102-144608).png` und `image(20261102-144721).png` zeigen aus verschiedenen schrägen Blickwinkeln die durchgängige Plattenoberfläche, zwei sichtbare Übergangs-/Stoßlinien und die optisch abgegrenzte Eckregion.
- `image(20261102-144658).png` zeigt eine starke Kanten-/Stoßnahaufnahme mit seitlichem Innenaufbau. Es ist **keine** technische Schnittzeichnung: Zahl, Typ, Position und Fräsverfahren der Verbinder dürfen daraus nicht abgeleitet werden.
- `image(20261102-144509).png` (B5=600) und `image(20261102-144533).png` (B5=300) belegen den Außenkontur-Unterschied. Geprüfte Dateihashes, Bildgrößen und Pixelmessung: [L4_B5_USER_20261102.json](references/speedmaster-lu/L4_B5_USER_20261102.json); [Auswertung PR #44](references/speedmaster-lu/L4-B5-VISUAL-20261102.md).

Die sechs originalen PNGs liegen als ZIP in der Unterhaltung vor. Ihre *Binärdaten* wurden bisher nicht ins GitHub-Repo kopiert (siehe Provenienzstatus im JSON); sie sind deshalb **nicht** als Teil des alten 60-PNG-Archivs zu bezeichnen.

## Visualisierung – keine Herstellermaschinendaten

Für die exakte dokumentierte 2000/600/900-Konfiguration bleibt die vorhandene schematische Flächenaufteilung in beiden B5-Ansichten:

| Kennung | Illustrierte Lage | Im Modell sichtbare Hilfslinie |
| --- | --- | --- |
| Teil 1: obere Strecke | oben rechts, hinter der vertikalen Stoßgrenze | Stoß A: `(900,0) → (900,600)` mm |
| Teil 2: Eckbereich | zwischen äußerer und innerer Diagonale | grenzt an A und B |
| Teil 3: linker Schenkel | unten links, hinter der horizontalen Stoßgrenze | Stoß B: `(0,900) → (600,900)` mm |

Die obigen Hilfslinien sind **nicht** als Fräsachsen bestätigt; auch die abgeleiteten Polygonflächen sind keine verifizierten Lieferstücke oder Schneidpläne. Die gezeigten zwei Übergänge können ein reales Hersteller-Layout illustrieren, ohne dessen CNC-Maße zu belegen.

## Neuer Bedienablauf

- Im Tab **Aufteilung** markiert die Wahl von **Stoß A** genau Teil **1 (obere Strecke) + 2 (Eckbereich)**, die Wahl von **Stoß B** genau **2 (Eckbereich) + 3 (linker Schenkel)**. Die aktive Stoßlinie bleibt zusätzlich hervorgehoben.
- Die beiden betroffenen Nummern werden deutlicher, die dritte Fläche tritt zurück. Man kann weiterhin alternativ **ein einzelnes Teil** wählen; diese Auswahl geht vor einer eventuellen Stoßauswahl.
- Beim Wechsel zurück zur Draufsicht oder zu anderen L-Typen bleiben keine falschen Teilhervorhebungen übrig. Ohne sichtbare Stoßlinie werden keine Phantomverbinder erzeugt.
- Ausgeweitet auf L1–L3 nur als **UI-Interaktion der bereits bekannten schematischen Stoßflächen**, nicht als neue Herstellerbestätigung.

## Abnahmeprüfungen

- Ein reproduzierender Test wurde vor der Implementierung zunächst rot (fehlende Nachbarflächen-Hervorhebung), danach grün.
- L4 `B5=300` und `B5=600`: exakt drei Teilflächen, zwei Stoßhilfslinien, richtige Zuordnung A=1/2 und B=2/3, kein Preis-/CNC-/Packstück-Eintrag.
- Browserprüfung auf Desktop und Smartphone: Klick auf Stoß, genau zwei optisch betroffene Flächen, kein Bildschirm-Overflow, weiterhin gesperrter L-Kauf.
- Gerade, WooCommerce-Kaufweg, reale Verkaufspreise, Updater und U-Form bleiben unverändert.

## Was danach wirklich noch benötigt wird

Vor **CNC**, freigegebener Stückliste oder Preisbildung: echte Speedmaster-Fertigungsdetails beider L4-Stöße, Verbindertypen/-anzahl, Fräslage mit Maßen, Teileabmessungen, Versand-Packstücke und validierte L2–L4 EKs inklusive Standard-Außenkanten. Die vorhandenen Schatten-/Kantenbilder beweisen diese Daten nicht.
