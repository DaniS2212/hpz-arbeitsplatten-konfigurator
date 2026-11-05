# Arbeitsplatten-Konfigurator – verbindliche Projektübergabe für neue Chats

**Aktualisiert 05.11.2026 nach GitHub-Live-Abgleich.** Diese Datei ist die Einstiegskarte, **kein Ersatz** für GitHub-Code, original gespeicherte Bilder oder Lieferantenfreigaben. Ein neuer Chat beginnt mit `AGENTS.md`, dieser Datei und der aktuellen `main`-Historie. Historische datierte Dokumente sind chronologisch zu lesen: Ältere Angaben zu Versionen/PRs können überholt sein.

## 1. Ziel, Shop, Produkte, technische Basis

- Ziel: vollständiger hochwertiger Küchenarbeitsplatten-Konfigurator in **holzplatten-zuschnitt.de** (WordPress/WooCommerce/Flatsome), nach dem bereits etablierten „Küchenstudio“-Design. **Keine grundlegenden UI-Redesigns** mehr; schnelle Weiterentwicklung zu realistisch bestellbaren Platten.
- Produkte: **Gerade 1000083**, **L 1000080**, **U 1000081**. Ursprünglicher SKU Gerade `HPZ-APL-GERADE-2026`. Live-Publikationsstatus jedes Produktes **immer im Shop prüfen**, GitHub-Merge beweist keine WordPress-Installation. 
- Geeignete Preis-/UI- und Shopkomponenten wiederverwenden; keine neue Versandplattform, **keine Speedmaster-API**. Holz-Liebling bestellt beim Lieferanten zunächst **manuell**. Dafür müssen alle Speedmaster-Bestelldaten in WooCommerce vollständig, eindeutig und kunden-/fertigungsseitig korrekt gespeichert sein.
- Eingaben: kundenfreundlich **cm mit Zehnteln**; intern der normalisierte **Millimeter-V2-Vertrag**. Material 17,5/38 mm, 16 Dekore mit echten Speedmaster-Bildern, standardmäßig **alle vorgesehenen Außenkanten 1,5 mm dekorgleiche Dickkante**.
- Oberfläche: gleiche drei Schritte, gleiche Karten/Buttons/Typografie/Preisbox/Zusammenfassung, identisch mobile UX wie Gerade. Zeichnungen mit echten Maßachsen; maßgeblich **Speedmaster, niemals die eigene Vorschau als Beweis**. L-Vorschau darf groß und fokussierbar bleiben. Hauptansicht durchgängige Fläche, „Aufteilung“ zur optischen Teile-/Stoßanalyse. Kantenbearbeitung „Vorderkante durchlaufend“ ist keine große Bézier-Rundung.
- GitHub-Releases und WordPress-Auto-Updater existieren. **Merge ≠ bewiesene Live-Version; vor jedem Test gezielt prüfen**. WordPress nicht eigenmächtig installieren/aktualisieren, keine echte Bestellung/Zahlung und keine Kundenfreigabe ohne ausdrückliche Zustimmung.

## 2. Stand nach PR #55 – nachprüfbar

- **PR #39** archivierte 60 Bilder als vollständiges privates Original-ZIP (48 Speedmaster, 12 shop-/UI-Vergleiche), siehe `docs/references/speedmaster-lu/README.md`, `SOURCE_MANIFEST.csv`. Es ist im Repo vorhanden und SHA-verifiziert; neue Chats brauchen einen Binär-Checkout und Extraktion, wenn sie Bildpixel vergleichen wollen.
- **PR #26–#52**: L1–L4 Formen, Maße, Sonderkonturen, visuelle Teile, Stoß-A/B-Auswahl und zahlreiche Browser-/Geometrieregessionen. Kritische historische Maße: L1 unten links **B3 horizontal/L3 vertikal**, L2 entsprechend gespiegelt; bei L4 `B5`-**Grundmaß** von `corner-B5`-**Eckmaß** strikt trennen. Siehe `docs/references/speedmaster-lu/DEVELOPMENT_CONTEXT.md`.
- **PR #53**: U1 gemeinsame U-Grundkontur und Foto-Stoßstellen. **PR #54**: U2–U4, vier fotografierte Stoßorientierungen. **PR #55**: ausschließlich private L/U-Margenszenarien mit exakten referenzierten Beträgen. Alle drei PRs **am 05.11.2026 im GitHub-Main als gemergt geprüft**. Bei neuen Änderungen Merge und HEAD erneut abfragen.
- U1, U2, U3, U4 haben bei der 38-mm-W980-Referenz **dieselbe Außenkontur**: L1=2000, L2=1200, L3=1800, B1=B2=B3=600 mm; Innenöffnung 800 mm, Außen-Gesamtgrundfläche 2,28 m². **Nur die Aufteilung differiert:** U1 quer/quer, U2 längs/längs, U3 längs/quer, U4 quer/längs; Stoß A links, B rechts. `local/core/u1-geometry.mjs` und `docs/phase-u2-u4-speedmaster-20261105.md`.
- **Drei grafische Bereiche ≠ drei physisch bestätigte Zuschnitte/Packstücke.** Flachdübel- und Verbinder-Symbole in transparenten Speedmaster-Grafiken belegen **keine** CNC-Koordinaten, Typen, Fräsungen, Stückzahlen oder Zulässigkeit anderer Maße.
- L/U aktuell **nicht kaufbar**. Ihre fotobasierten Grundformen sind **Vorschauen ohne CNC-/Liefer-/Verkaufsfreigabe**. Speziell U-Eckbearbeitungen und zahlreiche L-Eck- und B5-Grenzfälle fehlen noch als exakte Speedmaster-Abnahmen. Gerade behält den eigenen PHP-V3-Woo-Pfad, der nicht für L/U wiederverwendet werden darf, ohne die Datensätze und Preisfunktionen explizit anzupassen.

## 3. Preisregeln und ihre Historie – nicht vermischen

- Historische Nutzerregel vom **16.10.2026**: Speedmaster-EK netto × **1,30**, dazu 10 € interne Anlieferung und ab tatsächlichem Einzelteil **≥190 cm** zusätzliche 50 € netto **einmal je Arbeitsplatte**, anschließend 19 % DE-USt. Diese **frühere Kalkulationsidee** ist zu dokumentieren, **nicht** stillschweigend mit den neueren Margenregeln gleichzusetzen.
- Spätere Geraden-**PHP V3** (`pricing-v3/HPZ_APL_Price_V3.php`, 72 historische Fälle, 16 Dekore): DE-Brutto-Referenzen, 10 % Kostenreserve, **35 % Mindestmarge nach Rabatten**, 40 % Zielmarge in Referenzvergleichen. Basis Gerade 2000×600 mm, 38 mm W980 ohne Ecken: **670 € brutto als V3-Referenz**. Zuschlag für Eckbearbeitung in der V3-Regel **120 € brutto**. WooCommerce muss tatsächliche lokale Steuer, Coupon, Zahlung und Versand bestimmen; V3 nicht einfach für L/U kopieren.
- Für **L/U** ist aktuell der jüngere betriebswirtschaftliche Stand aus PR #37/#55 eine **interne Szenariorechnung**: echter bzw. explizit nur angenommener Lieferanten-Netto-EK + **angenommene** Anlieferung/weitere Kosten; 10 % Reserve, 40 % Ziel- und 35 % Mindestmarge, DE-Referenz-USt 19 %, auf volle 10 € aufrunden. **Noch keine kaufmännisch freigegebene verbindliche L/U-Verkaufspreisregel**. Ob der frühere pauschale 30-%-Aufschlag abgelöst ist, muss vor Live-Freigabe explizit vom Betreiber entschieden werden; nicht beides gleichzeitig anwenden.
- **L1 vier bestätigte Netto-EKs**, jeweils L2=1200, B1/B2=600, W980, alle Außenkanten, ohne Ecken: L1=2000 mm / 17,5 mm **307,67 €**, / 38 mm **464,45 €**; L1=2500 mm / 17,5 mm **342,41 €**, / 38 mm **511,56 €**. Der frühere **352,27-€-Screenshot** zur L1-38er-Platte ist **nicht vergleichbar**, dort fehlte eine Kante.
- **U1 bestätigte exakte Netto-EKs** einschließlich `[L1,L2,L3,B1,B2,B3]=[2000,1200,1800,600,600,600]`: **459,29 €** (17,5 mm), **691,49 €** (38 mm); weitere Punkte 2500-mm-Länge/andere Werte in `docs/price-reference-cases.csv` und `local/private/pricing.mjs`. Vorsicht: U1-38-mm-W980 bei L1=2500,L2=1700,L3=1800 und B1=600 ergibt 785,69 €, mit B1=700 jedoch 767,12 € – also **keine simple monotone Flächenformel**.
- **U2 687,36 €, U3/U4 je 691,49 €**: **nur die Speedmaster-Anzeigebeträge** aus exakt einem 38-mm-W980-Screenshot, netto/EK-Bezug nicht separat bestätigt. Historischer L4-Fotohinweis bei L1/L2=2000, B1/B2=600, B3/B4=900, B5-Grundmaß=600, APL38 W980 und Standardkante: **658,61 € sichtbar**, ebenfalls **kein geprüfter Netto-EK/Shoppreis**. Siehe `docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv`.
- Interne Anlieferung 10 €/60 € beruht auf Versandstücklängen, nicht allein auf der **äußeren U-/L-Breite**; reale Einzelteile, Länge, Volumen und Gewicht sind **noch nicht belegt**. Kundenversand wird mit vorhandenen Woo-Regeln geprüft, nicht dazugerechnet, solange kein verifizierter Betrag vorliegt.
- Exakte Daten nur mit Varianten-, Material-, Kanten-, Maß- und Dekorbindung; **kein stilles Extrapolieren** auf L2–L4/U2–U4 ohne neue EK-Belege. Die private PR55-Rechnung ist **nicht** als Shop-Preisengine verdrahtet; `purchasable=false`.

## 4. Screenshots – tatsächliche Binärlage und Importregel

| Serie | Bilder | Binär in GitHub? | Fundstelle |
|---|---:|---|---|
| Alte PR39-Referenzen | 60 | **Ja**, ZIP 16.780.349 Bytes, SHA256 `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb` | `docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip` |
| L4-B5-Vergleich 02.11 | 6 | **Nein** | `L4_B5_USER_20261102.json` |
| L1/L2-Stoßbilder 05.11 | 6 | **Nein** | `L1_L2_JOINT_USER_20261105.json` |
| L4-Stoßbilder 05.11 | 4 | **Nein** | `L3_L4_JOINT_USER_20261105.json` (L3 frühere PR39-Bilder vorhanden) |
| U1–U4 je 3 Bilder 05.11 | 12 | **Noch nicht auf GitHub**; **in diesem Chat original vorhanden und als ZIP vorbereitet** | `U1_JOINT_USER_20261105.json`, `U2_U4_JOINT_USER_20261105.json`, `U_20261105_SOURCE_MANIFEST.csv` |

**Nächster Binärarchiv-Schritt:** geprüfte Datei `Speedmaster_U1-U4_20261105_Originale.zip` (12 unveränderte PNGs, zwei ältere Chat-Kontexte, Prüfsummen), **6.699.368 Bytes**, SHA256 `1b1caa59a791e189192eb411387daaa8236a5963f6af4384816dff0cdff9d9c9`, Git-Blob-SHA1 `b6948a55d8cebcc55fdd21069515e9b095c2635b`, in `docs/references/speedmaster-lu/` auf dem eigens dafür vorgesehenen PR-Branch hochladen. Erst wenn GitHub den binären Blob enthält und alle 12 SHA256-Prüfungen erfolgreich sind, darf hier **„Originalbilder dauerhaft im Repo“** stehen. Die alten 16 fehlenden L-Originalbilder müssen separat aus den alten Chats/Bilddateien archiviert werden.

**Wichtig:** Ein SHA256-Manifest ersetzt **nie** die Original-PNGs. Chat-/Sandbox-Downloads sind kein GitHub-Archiv. Neue Originalaufnahmen sofort unter unverändertem Namen, mit vollständiger Konfiguration, aufgenommenem Anzeigepreis, Dateigröße/SHA256 und **nachweislich hochgeladenen Binärbytes** erfassen. Bilder/ZIPs nie in den öffentlich auslieferbaren Plugin-Build aufnehmen.

## 5. Schnellster noch notwendiger Weg zu echten L/U-Bestellungen

1. **Lieferantenvarianten festlegen und abnehmen:** mindestens echte CNC-Stück-/Verbinder-/Kantenliste und verpackte Lieferteile mit Abmessungen/Gewicht/Anlieferkosten pro genehmigtem Maßbereich; Standardkantengrenzen und Material-/Dekorverfügbarkeit.
2. **Preise finalisieren:** mit zusätzlichen kontrollierten Nettoreferenzen zuerst L2–L4 und U2–U4, mindestens die Hauptdicken und Längen-/Breitenwechsel. Betrag mit Versand-/Pack-/Zahlungskosten und Reserve gegen 40-%-Ziel und **35-%-Minimum nach Rabatten** prüfen. Alternativ **schneller Teilstart nur mit exakt belegten freigegebenen Konfigurationen**; sonst „Preis anfragen“. Die Wahl ist noch nicht als live bindende Shopregel umgesetzt.
3. **WooCommerce-Version für L/U isoliert entwickeln:** alle Frontend-Eingaben erneut serverseitig validieren, Preis manipulierungssicher, persistierte Position/Fertigungsbeschreibung, Menge/Coupon/Steuer/Adresse/Versandwechsel, HPOS und Gastkauf testen. **Speedmaster-Bestellung bleibt manuell**.
4. **Kontrollierte Shop-Testbestellung** ohne Echtzahlung/echte Lieferantenbestellung und getrennte persönliche Verkaufsfreigabe. Die Gerade-Produktstrecke, sonstige Shopprodukte und die vorhandenen Versandregeln nicht verändern.

## 6. Pflicht-Startbefehle / Bestandsaufnahme für neue Chats

1. Repo `DaniS2212/hpz-arbeitsplatten-konfigurator`, Branch `main`: aktuellen HEAD, offene PRs, Actions und vorhandene Releases **neu** abfragen.
2. `AGENTS.md`, **diese** Datei, `docs/references/speedmaster-lu/README.md`, `DEVELOPMENT_CONTEXT.md`, `EVIDENCE_GAPS.md` und `SUPPLIER_CLOSEOUT.json` lesen. Historische `STATUS.md`-Abschnitte beginnen 26.10 und sind keine zuverlässige tagesaktuelle Fortschrittsliste.
3. Zum visuellen Abgleich **Original-PNG-Bytes** aus privatem Repository entpacken und mit `scripts/import_speedmaster_reference_zip.py` bzw. dem U-Archivverifizierer prüfen, **nicht** von textbasierten Bildhashes auf eine visuelle Freigabe schließen.
4. Regressionen: `node --test local/test/*.test.mjs wordpress/*.test.mjs`; `node build-plugin.mjs`; für PHP und Chromium GitHub Actions. Lieferantenaudit `node scripts/speedmaster-closeout.mjs --check` soll offene Belege zeigen, nicht automatisch alle Freigaben erteilen.
5. PRs erst mit grüner CI und nach ausdrücklichem Betreiber-Go mergen; keine stillen WordPress-Updates, Produktschaltungen, Zahlungen oder Live-Bestellungen.

## 7. Verlässlichkeit / bekannte Widersprüche

- **V3-Geraden-Formel, frühere 30-%-Regel und neue L/U-40-%-Szenarien sind historisch unterschiedliche Stufen**, kein einheitlicher freigegebener Verkäuferalgorithmus. Quelle und Geltung getrennt halten.
- Hinweise in alten Dateien „alle Bestellungen gesperrt“ oder „Gerade bereits live“ betreffen **unterschiedliche Zeitpunkte**. Live-Freigaben und installierte WordPress-Version sind ohne erneuten Shop-Check **unbekannt**.
- L/U-Manifeste enthalten **Foto-Beobachtungen**, kein „reviewed“/„manufacturingReady“. `SUPPLIER_CLOSEOUT.json` niemals aus einem Screenshot heraus automatisch grün setzen.
- Der nächste Coding-Chat soll **zuerst das hier dokumentierte Wissen prüfen, nicht die U-Geometrien erneut erfinden**. Unbekannte Fakten als offen kennzeichnen, nicht erraten.
