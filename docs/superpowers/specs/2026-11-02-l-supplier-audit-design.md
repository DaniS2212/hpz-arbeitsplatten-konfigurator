# L1–L4: Speedmaster-Fertigungsabgleich (Design, 02.11.2026)

## Absicht und Nutzen
Nach der erfolgreich produktiven WordPress-Automatik und PR #32 soll die L-Form als nächstes für einen **belastbaren Herstellerabgleich** vorbereitet werden. Kundenseitig darf die bewährte Gerade-UX nicht verändert werden. Der Zweck ist **nicht** die Fertigungsfreigabe ohne Nachweise, sondern eine reproduzierbare Grundlage, um echte Speedmaster-Zeichnungen/Stücklisten und Preise später zu prüfen, statt Maße, Fugen oder CNC-Fräsungen zu erraten.

## Stand der Belege (nicht mit Freigaben verwechseln)
Aus den Speedmaster-Screenshots vom 30.10.2026 sind die Grundrisse, Maßbezeichnungen und die Zahl/Richtung der **visuell erkennbaren** Stoßbereiche bekannt:
- L1: 2.000 × 1.200 mm; B1=600, B2=600 mm; Schenkel links; ein erkennbarer gerader Stoß.
- L2: gleiche Maße; Schenkel rechts; ein erkennbarer gerader Stoß.
- L3: L1=L2=2.000 mm; B1/B2=600; B3/B4=900 mm; innere Diagonale; zwei erkennbar getrennte Stoßbereiche.
- L4: L1=L2=2.000 mm; B1/B2=900; B3/B4=1.050; B5=600 mm; innere + äußere Diagonale; zwei Stoßbereiche. Die 45°-**B5-Außenprojektion** ist noch eine Modellannahme, keine von Speedmaster bestätigte Zuschnittformel.

Die bestehende interaktive Teileansicht (PR #32) bleibt nur eine **Planning Preview**, nicht die Stückliste: `supplierMappingVerified=false`, `joints=null`, `shippingParts=null`. Bei L4-Minimalmaßen können sichtbare Teilebereiche verschwinden, ohne dass virtuelle Produktionsaufträge entstehen.

## Erörterte Wege / Abwägung
1. **Aus Screenshots Fräsbilder, Verbinder und allgemeine Zulässigkeitsgrenzen nachbauen.** Schnell sichtbar, fachlich riskant und ungeeignet für spätere Bestellung. Verworfen.
2. **Warten, bis alle Lieferantenunterlagen vorliegen.** Verhindert Spekulation, stoppt aber die sinnvolle technische Vorbereitung. Nicht gewählt.
3. **Belegmatrix mit unabhängigen Referenzkonfigurationen, geometrischer Konsistenzprüfung und klarer Nachweisliste** (gewählt). Kein neues Kundenelement; reproduzierbares CLI/CI-Prüfblatt, das bei späteren Screenshots mit konkreten, geprüften Datensätzen ergänzt werden kann.

## Ziel dieses PR
- Rein interne, versionierte Evidenzmatrix: getrennte Status für **Bildvorlage**, **Modellannahme** und **noch fehlenden Herstellerbeleg**. Keine Begriffe wie »freigegeben« für eine bildbasierte Fuge.
- Der L-Form-Kern wird für jede der 4 dokumentierten Beispiele ohne Schätzung anderer Maße gegen unabhängige Koordinatenreferenzen geprüft. Dabei werden Kontur, Kantenlängen, Fugen-Endpunkte auf dem echten Außenumriss, positive Teilflächen und Teilflächen-Summe geprüft.
- Prüfblatt gibt *konkret* die noch benötigten Speedmaster-Fotos/Werte aus (Stoßaufnahmen, Verbindungstyp und -position, Mindest-/Maximalmaße, B5-Einzeländerung, Versand/Packstücke und EK-Beispiele).
- Bei abweichenden Konfigurationen und Kantenbearbeitungen wird **keine** Referenzübereinstimmung behauptet.
- Programmatic safety: Kein `manufacturingReady` oder Preis-/Checkout-Go-live aus einer visuellen Übereinstimmung; fremde Familien, L1–L4-Referenzen und Kundenparameter werden robust geprüft. CI bleibt grün.
- **Keine** Modifikation an WordPress-Plugin, WooCommerce-Produkten, Kunde-UI, Preis-V3 oder Auto-Updater. Nutzer schaut parallel die Live-Vorschau an.

## Nicht-Ziele
Echte Speedmaster-CNC-/Dübelpositionen, Stücklisten-/Zuschnitt-Dateien, dynamische min/max-Grenzen, Gewichte, Versandaufteilung, verbindliche Endkundenpreise oder Produktfreigabe sind **nicht** aus den vorhandenen Bildern ableitbar. Die automatisch geprüfte lokale Geometrie ist ausdrücklich kein Fertigungsnachweis.

## Nachweise, die die nächste Entscheidung ändern
1. Detail L1/L2: zugehörige Stoßkante inklusive Fräs-/Verbindertyp und Zahl der gelieferten Platten.
2. Detail L3/L4: beide Stoßbereiche, innerer Diagonalwinkel und Fräs-/Verbinderschnitt.
3. L4 vor/nach *nur* B5-Änderung (z. B. 600→300 mm bei sonst gleicher Konfiguration), Draufsicht mit Maßpfeilen.
4. Grenzwerte je Form (vor allem B1/B2, B3/B4, B5 bei 17,5 und 38 mm und Eckvarianten) und erlaubte Längen.
5. Danach: exakte vollständige Speedmaster-EK-Beispiele **mit** den üblichen dekorgleichen 1,5-mm-Außenkanten, Packstücke und Gewichte für Versand.

## Akzeptanz
Node-Tests und Prüfblatt gelten nur als bestanden, wenn die bekannten Beispielkoordinaten mit den lokal erzeugten Vorschauwerten übereinstimmen, alle Fugen auf Außenkanten enden, keine imaginären Fertigungsdaten geschrieben werden und unbestätigte Annahmen sichtbar als ungeprüft bezeichnet bleiben. Vollständige CI inkl. WooCommerce-/Preisregressionen.