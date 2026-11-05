# PR #52 – L3 und L4: gemeinsame Speedmaster-Stoßbeobachtungen

Stand: 05.11.2026 · **Interne 2D-/Bedien-Vorschau, keine freigegebene Fertigungs- oder Warenkorb-Funktion.**

## Was für beide L-Formen tatsächlich vorliegt

| Herstellerform | Beleg und verifizierte Eingaben | Sichtbare Information | Ungeprüfter Bereich |
| --- | --- | --- | --- |
| **L3** | PR39-Originalarchiv vom 02.11.2026, `block-02/image(20261102-114219).png` (2D), `block-02/image(20261102-114229).png` (Transparenz/Verbinder), `block-03/image(20261102-114414).png` (Eingabefelder). Maße **L1=L2=2000, B1/B2=600, B3/B4=900**. | **Drei** optisch getrennte Bereiche, **zwei** eingezeichnete Stoßlinien, an beiden grafische Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbole. | Historische L3-Profil-Ausführung ist **nicht komplett identisch** bestätigt: Der Eingabe-Screenshot `114414` zeigt bei Profil (Modell) `Postforming DR, R=3 mm` und an den Seiten 1,5-mm-Dickkante. Daher nur **Grundform und Symbole** beobachtet, keine allgemeingültige Profilfreigabe. |
| **L4** | **Vier neue Original-PNGs vom 05.11.2026**, `091334`, `091405`, `091422`, `091439`. **L1=L2=2000, B1/B2=600, B3/B4=900, B5-Grundmaß=600, APL38, W980 ST7, 1,5-mm-Dickkante**. | **Drei** optisch getrennte Bereiche und **zwei** Stoßstellen. Transparente Details zeigen grafisch Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbole an beiden Bereichen. | Keine CNC-Fräs-/Bohrkoordinaten, keine vom Hersteller bestätigte Verbinderstückliste, keine echte Versandstückzahl. **B5=300 aus älterem Paar ist NICHT diese Vierbildserie.** |

[Maschinenlesbares Originalbild- und SHA-256-Register](references/speedmaster-lu/L3_L4_JOINT_USER_20261105.json)

Die drei L3-Dateien sind **bereits als Originalpixel** im verifizierten 60-PNG-Archiv von PR #39 enthalten (Einzeldatei-Hashes sind im Register genannt). Die **vier neuen L4-PNGs** befinden sich aktuell nur als vom Nutzer bereitgestellte Bilder in der Unterhaltung. Ihre tatsächlichen Bildbytes wurden lokal SHA-256-geprüft und Größen katalogisiert; **die vier Binärdateien sind noch nicht in GitHub gespeichert**. Bitte nicht als archiviert ausgeben.

## Vorschau-Abgleich und Schutz gegen falsche Schlussfolgerungen

- **L3** und **L4** mit obigen Beispielmaßen: drei Vorschau-Teilregionen `top/corner/leg`. `Stoß A` verbindet **obere Strecke/Eckbereich**, `Stoß B` den **Eckbereich/anderen Schenkel**. Position und Visualisierung kommen aus unserer bereits bestehenden schematischen 2D-Aufteilung; sie sind **keine freigegebenen Maschinenfräsungen**.
- Nur bei diesen **konkreten** Beispielwerten wird `assemblyPhotoObservation` angeboten. **L4 zusätzlich nur bei B5-Grundmaß 600 mm**. Bei abweichender Länge, Breite, Material, Dekor oder aktivierter Eckbearbeitung entfällt der Fotobeleg.
- `L3` wird in UI und Maschinenlesedaten ausdrücklich als **Grundriss- und Symbolbeobachtung, Profil nicht vollständig abgeglichen** gekennzeichnet. Das ist kein unzutreffender 1:1-Beweis der Kantenprofil-Ausrichtung.
- Bei Wahl von Stoß A oder B weist die eigene Teileansicht auf **die am Bild erkennbaren Symbolklassen**, nicht auf eine konkrete Hersteller-Verbindernorm, Stückzahl, Bohrposition oder Frästiefe hin.
- `joints=null`, `shippingParts=null`, `supplierMappingVerified=false` bleiben unverändert. **Die tatsächliche Lieferstückzahl ist unbekannt**, auch wenn drei Bereiche dargestellt werden. L/U bleiben nicht kaufbar und dürfen weder automatisch Kalkulationswerte noch Bestellungen erzeugen.

## Reproduzierbare technische Abnahme

`node --test local/test/l3-l4-joint-witness-20261105.test.mjs` prüft:
- je L3/L4 die **beiden festen IDs A/B** und **drei** beschriftete Bereiche,
- genau die jeweilige Bild-Fall-ID und den Unterschied des L3-/L4-Aufnahmedatums,
- **L4 B5=300** erhält keinen B5=600-Fotobeleg,
- keine generalisierte Freigabe für abweichende Maße, Material, Eckbearbeitung,
- keine fiktive CNC-/Packstück-Information und weiterhin gesperrter Warenkorb,
- Bildhashes, Binärstatus und **nur `observed`** im privaten [Speedmaster-Closeout](references/speedmaster-lu/SUPPLIER_CLOSEOUT.json).

`wordpress/l3-l4-photo-browser-runner.mjs` deckt im WordPress-Testbundle beide Formen und beide Stoß-Interaktionen in **1366 px / 390 px** ab, einschließlich Wegfall bei geänderten Maßen/Stärke/B5 und ohne horizontalen Overflow oder JS-Fehler. Der vorhandene Geraden-Shop, WooCommerce-Checkout, Preisregelung, Versand und WP-Updater werden nicht verändert.

## Nächster Herstellerblock: U1–U4

**Unbedingt benötigt:** je U1, U2, U3, U4 eine Speedmaster-Auswahl/Grundformkarte, eine **Draufsicht mit vollständigen Eingabefeldern**, transparente Gesamtansicht, **jede** Stoßstelle mit erkennbarer Lage und ein Überblick aller Eck-/Kantenoptionen. Die bisherigen alten Speedmaster-Grundformkarten reichen nur zur Formauswahl, nicht zur genauen Geometrie. Für reale Herstellung separat **Einzelteilzuschnitt, reale Verbinderanzahl/Fräsmaße, Packstücke und EK**. Wir fragen keine bereits archivierten L3-Bilder erneut an.
