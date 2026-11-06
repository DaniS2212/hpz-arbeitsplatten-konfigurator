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
| U1–U4 je 3 Bilder 05.11 | 12 | **Ja, seit gemergtem PR #57** – Original-ZIP samt 12/12 geprueften PNGs | `U1_JOINT_USER_20261105.json`, `U2_U4_JOINT_USER_20261105.json`, `U_20261105_SOURCE_MANIFEST.csv` |

**Abgeschlossener Binärarchiv-Schritt (PR #57 gemergt; GitHub-CI grün):** geprüfte Datei `Speedmaster_U1-U4_20261105_Originale.zip` (12 unveränderte PNGs, zwei ältere Chat-Kontexte, Prüfsummen), **6.699.368 Bytes**, SHA256 `1b1caa59a791e189192eb411387daaa8236a5963f6af4384816dff0cdff9d9c9`, Git-Blob-SHA1 `b6948a55d8cebcc55fdd21069515e9b095c2635b`, liegt **auf main** unter `docs/references/speedmaster-lu/`. GitHub hat den binären Blob und die 12 originalen SHA256-Prüfungen erfolgreich bestätigt; **U1–U4-Originalbilder sind dauerhaft im Repo**. Die alten 16 fehlenden L-Originalbilder müssen separat aus den alten Chats/Bilddateien archiviert werden.

**Historische Binärarchive:** Ein SHA256-Manifest ersetzt für historische **visuelle** Referenzen nicht die ursprünglichen PNGs; niemals Bilder/ZIPs in einen Plugin-Build aufnehmen. **Neue verbindliche Betreiber-Entscheidung vom 06.11.2026 übersteuert ausdrücklich die alte Preisbild-Pflicht:** Für **Preise** reichen strukturierte **Textdaten** im GitHub-Preisregister/JSON (Form, alle mm-Maße, Stärke/Dekor, Kanten/Ecken, Betrag, Quelle, Zeit, Netto-Status, Einzelfall-Abgrenzung). **Keine neuen Preis-Screenshot-ZIPs, keine Binärupload-/SHA-Pflichttests.** Geometrie-/CNC-Nachweise bleiben eine getrennte Frage. [Preistext-Policy](references/speedmaster-lu/PRICE_TEXT_EVIDENCE_POLICY_20261106.md).

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


## 8. Update nach PR #57 – L/U-Preis- und Checkout-Vorprüfung (neuer PR #58)

- **PR #57** (05.11.2026) ist auf `main` gemergt; 12/12 neue U1–U4-PNGs im ZIP mit originalem SHA256 und Git-Blob SHA1 verifiziert. Die 16 neueren L-Originale sind noch immer offen.
- **PR #58** (nach Freigabe/Merge erneut prüfen) führt `pricing-v3/HPZ_APL_LU_Price_Readiness.php` mit eigenen PHP-Regressionen ein. Er ermöglicht die vollständige **nicht kaufbare** Preis-/Bestellvorprüfung anhand eines **vertrauenswürdigen aktuellen EKs, verifizierter echter Zuschnitt-/Packstücke, Zusatzkosten, WooCommerce-Steuer-/Coupon-/Mengen-/Versandkontext und aktiver Operator-Policy**. Bisher keine WordPress-Anbindung oder Verkaufsschaltung.
- **Historischer Stand von PR #58 (inzwischen durch Betreiberentscheidung und PR #59 überholt):** Damals sollte eine separate per-Konfiguration-Preisregel bestätigt werden. Der Betreiber hat danach **einmal global** dieselbe V3-Kalkulationsstrategie für Gerade/L/U freigegeben: `margin40-reserve10-floor35`. PR #59 entfernt die redundante Preisregel-Einzelfreigabe. **Einzelne Speedmaster-EKs, Lieferbarkeit und Checkout-/Verkaufsgates benötigen weiterhin echte Belege und eine getrennte Freigabe.**
- Die nächsten Herstellerdaten sollen **zuerst die realen Teile, Verpackung, Gewicht, Lieferpreis und echte Netto-EK-Bestätigung der Hauptreferenzen** liefern. Für noch nicht freigegebene Maße niemals interpolierte Shop-Preise anzeigen. Speedmaster-Bestellungen werden zunächst **manuell** ausgelöst.


## 9. Verbindliche Betreiberentscheidung 05.11.2026 – gleicher Kalkulationsstandard für Gerade/L/U

Der Betreiber hat in diesem Chat ausdrücklich bestätigt: **Für L1–L4 und U1–U4 gilt die gleiche betriebswirtschaftliche Kalkulationsstrategie wie für Gerade**. Es gibt **nur ein Repository** (dieses) und keine neue unabhängige Preisarchitektur:

- **40 % Zielmarge**, **35 % Mindestmarge nach Rabatten**, **10 % Kostenreserve**. Die früher dokumentierte **30-%-Aufschlagsregel ist für die aktuelle Weiterentwicklung von L/U überholt** und darf nicht zusätzlich aufgeschlagen werden.
- Die bestehende **V3-Geraden-Preisfunktion** bleibt unverändert; sie verwendet eine kalibrierte Dimensionen-/Dekorkurve und nicht einfach den momentanen Lieferanten-EK. *Dieselbe Kalkulationsstrategie* bedeutet **identische wirtschaftliche Ziele und Sicherheitsprüfungen**, nicht fälschlich die Geraden-Preisformel auf die dreiteilige L/U-Geometrie anzuwenden.
- **PR #59 (neu, nach Merge erneut prüfen):** `HPZ_APL_Price_V3::targetGrossForVerifiedCosts()` ist die gemeinsame, serverseitige Funktion zur Ermittlung eines Brutto-Zielpreises aus **nachweislich bestätigten** EK, interner Anlieferung und echten Zusatzkosten für L/U. `HPZ_APL_LU_Price_Readiness` verwendet dazu dieselbe vorhandene V3-Mindestmargenprüfung wie Gerade. Kein neuer zweiter Rechner, kein neuer Shop, kein zweites Repository, kein Live-Checkout.
- Der nächste Entwicklungsblock muss **Preisbelege/Preisraster für L/U und die bestehende WooCommerce-Warenkorb-/Bestelllogik** konkret zusammenführen. Die bereits laufende Gerade und ihre V3-Werte nicht verändern. Nur kostenmäßig überprüfte Konfigurationen erhalten später einen Kaufpreis; unbekannte Variationen bleiben Anfrage/gesperrt.
- Diese Entscheidung ist eine **Bestätigung des Kalkulationsstandards**, keine pauschale Freigabe sämtlicher Hersteller-, Versand- oder Echtgeld-Bestellungen. Die noch fehlenden Lieferantenbelege sind individuell nachzuhalten.


## 10. L/U-WooCommerce-Bestellanbindung (PR #60, 05.11.2026)

Der Betreiber hat ausdrücklich **Bestellfähigkeit vor Produktseiten-Redesign** priorisiert. PR #60 ergänzt in demselben Plugin `HPZ_APL_WC_LU_Cart_Bridge`, `HPZ_APL_WP_LU_Runtime_11`, shared Woo-VAT/-Versandkontext, signierte L/U-Cart-Zeilen, vollständige HPOS-Bestellpositionsmetadaten und manuelle Speedmaster-Übergabe. Bei jeder Cart-/Checkout-Revalidierung wird der aktuelle serverseitige Speedmaster-Beleg geprüft. **Kein separater Shop, keine eigenständige Preisregel, keine automatische Speedmaster-Bestellung.** Testfälle simulieren alle acht Formen und die beiden Woo-Warenkorbarten.

**Bisher nicht live:** `HPZ_APL_LU_11_AUDITED_RELEASE` wird in der Pluginquelle nicht definiert; separate Option und echte geprüfte Einzelbelege fehlen noch. Bis zur gesonderten Testbestellungs-/Betreiberfreigabe können L und U nicht gekauft werden. **Danach:** echtes Admin-Belegmanagement und Testbestellung auf dem existierenden Woo-Shop, dann Shopfreigabe.

**Späterer UI-Feinschliff (05.11.2026 per Screenshot mitgeteilt):** den heutigen oberen Woo-Produktbereich mit Bildgalerie, umfangreichen Standardinformationen und wiederholtem CTA reduzieren. **Nur H1 und Kurzbeschreibung** hochwertig und direkt an den Konfigurator integrieren. Nicht vor Abschluss der Bestellanbindung erledigen. Ausdrücklicher Screenshot-Dateiname `image(20261105-113713).png`; noch kein neues GitHub-Binärarchiv dieser UI-Aufnahme.


## 11. Update 06.11.2026 – variable L/U-Preiskalibrierung und UI-Hinweise

- **PR #60 ist am 06.11.2026 gemergt**; die L/U-WooCommerce-Bestellanbindung befindet sich in `main`, die tatsächlichen L/U-Live-Kaufschalter bleiben standardmäßig aus.
- **PR #61:** [Preiskalibrierung](phase-lu-price-calibration-20261106.md). Historische Netto-Preispunkte direkt aus `docs/price-reference-cases.csv` (L1: 4 Punkte, U1: 8 Punkte), begrenzte **interne Ein-Achsen-Längeninterpolation** nur innerhalb belegter 500-mm-Intervalle. Anders dimensionierte Geometrien, andere Dekore, L2–L4 und U2–U4 ohne netto bestätigte Belege erhalten **keinen fiktiven Verkaufspreis**. 40/35/10-Margenstrategie kommt weiterhin ausschließlich aus V3; kein zusätzlicher Plugin-Preisrechner. Kauf bleibt unverändert gesperrt.
- Für den nächsten Herstellerabgleich sind **wenige zielgerichtete Speisepunkte** mit vollständigen 1,5-mm-Kanten und ausdrücklich netto bestätigten Preisen dokumentiert. Insbesondere U1 bei B1=600/700 und 38 mm verläuft nicht monoton.
- Der Betreiber hat am 06.11.2026 zwei **UI-Punkte für Schritt 3 nach Preis und Testbestellung** hinterlegt: L4 zeigt `B5: 60 cm · Einstellung`, und in Schritt 1 „Grundriss“ ändert sich die optische Größe der Platte beim Wechsel rund/abgeschrägt. **Im Code verifiziert:** B5-`settingOnly` wird als solche Textbeschriftung ausgegeben; das SVG-`viewBox` variiert mit Eck-/Maßbeschriftungen. [Konkrete Reproduktions- und Abnahmekriterien](phase-ui-step3-backlog-20261106.md). Zusätzlich bleibt der Wunsch nach nur H1+Kurzbeschreibung direkt am Konfigurator bestehen.
- Screenshot zum neuen UI-Feedback: `image(20261106-074841).png`, SHA256 `2115f5f7678413c445ec9f321157a19158f325ab09e92c9b2300271d1d500d9e`, **PNG seit PR #61 binär in GitHub main archiviert** und im Vier-PNG-Original-ZIP SHA/CI-verifiziert.
- **Nächste Priorität:** Preis-Modellvergleich mit den im Preisplan genannten gezielten Speedmaster-EKs, anschließend Woo-Preisaktivierung für ausreichend bestätigte Maßkombinationen samt Testbestellung. **Nicht** unaufgefordert Layout und Preisengine gleichzeitig umbauen.

## 12. Nachtrag 06.11.2026 – bestätigter 10+50-Freight-Tier, zwei Preisbild-Holdouts

**Zwei neue Original-Screenshots** aus Speedmaster zeigen für **38 mm W980/1,5-mm-Dickkante**:
- **L1** 2250×1200, B1/B2=600 mm: angezeigte **488,01 €**.
- **U1** L1=2250, L2=1200, L3=1800, B1/B2/B3=600 mm: angezeigte **715,04 €**.

Beide Bildbeträge entsprechen den **vor den neuen Screenshots berechneten** V1-Längen-Zwischenwerten auf den Cent genau; `HPZ_APL_LU_Calibration_11` protokolliert **sowohl Modellpreis als auch unabhängigen Bildbetrag** und eine 0-Cent-Abweichung. Das ist gute Evidenz für diese beiden Längenintervalle, **keine** allgemeine Form-/Kantenpreisregel und noch keine unabhängig bestätigte Nettopreisspezifikation des Bildbetrags. Quelle: [JSON-Originalbeleg](references/speedmaster-lu/L1_U1_2250_PRICE_20261106.json) + [Bild-SHA256-Manifest](references/speedmaster-lu/L1_U1_2250_SOURCE_MANIFEST.csv).

**Der Betreiber hat die bereits vorhandene Code-Versandregel ausdrücklich bestätigt**: 10 € netto Speedmaster-Standardversand **plus einmalig 50 € netto Speditionszuschlag**, sobald mindestens ein tatsächliches Liefer-/Packteil **≥ 1900 mm** erreicht; **60 € netto Gesamt**, nicht 70 €. Kein Code-Preis- oder Versandregelwechsel nötig. Die Ein-/Ausgangsprüfung im PR #61 testet 1899/1900 mm und mehrere lange Teile.

**Abgeschlossener Binärnachtrag seit gemergtem PR #61:** [Quelle und verifizierter Archivstatus](references/speedmaster-lu/L1_U1_2250_ARCHIVE_UPLOAD.md) für vier unveränderte Bilder (zwei aktuelle Preis-Screenshots, L4-B5-UI-Bild, Woo-Produktkopf) im ZIP `Speedmaster_L1_U1_2250_UI_20261106_Originale.zip`, 1.059.629 Bytes, SHA256 `e8f5fc1aef4947f642089f4f46c4947e7b95e1a83ad0474b51869ecc011f1531`, Git Blob `3d1af1ea00d426a5456e97142d40111491911efd`. Das Originalarchiv ist auf **GitHub main** und der Check **verify-original-pngs grün**; keine erneute Übertragung nötig.

**Als Nächstes nach dem Archivimport:** gezielte Speedmaster-Vergleiche für exakt eine veränderte Kantenbearbeitung und je eine geänderte L-/U-Stoßvariante; fehlende L2/L3- und U2–U4-Netto-EKs erfassen, bevor eine verallgemeinerte Woo-Shoppreisfreigabe möglich ist.


## 13. Weiterarbeit nach archiviertem PR #61 (06.11.2026)

- **PR #61 ist gemergt**; alle CI-Prüfungen erfolgreich, Originalbildarchive (2 neue Preise + 2 UI) auf main und anhand Git SHA/PNG-Manifest geprüft.
- Nächster gezielter Preisnachweis ist **kein neuer Preisrechner**: Speedmaster-Konfiguration mit **nur einer geänderten Eigenschaft** vergleichen. [Konkrete 3-Fälle-Reihenfolge](phase-lu-price-variation-tests-20261106.md) und [CSV-Testmatrix](references/speedmaster-lu/PRICE_VARIANT_CONTROL_20261106.csv). L1→L2 2250/1200/600/600, U1→U2 2250/1200/1800/600/600/600 und nur linke Kante bei L1 2250/1200/600/600 ändern. Baselines 488,01 € und 715,04 € bleiben unverändert.
- Preise für diese Varianten **noch unbekannt**; Nutzer liefert neue Speedmaster-Bilder. 10 € netto Standard plus einmalig 50 € netto ab einem tatsächlich nachgewiesenen langen Liefer-/Packteil von ≥1900 mm bleibt unverändert; **60 € insgesamt**.
- Alle UI-Arbeiten am B5-Text, fixierter SVG-Grundrissgröße und reduzierter Woo-Produktkopf kommen **nach** Preis-/Bestellprüfung. Keine L-/U-Liveverkaufsfreigabe erteilen, solange Hersteller- und Shop-Einzelbelege fehlen.


## 14. Nachtrag 06.11.2026 – drei neue Speedmaster-Preisvergleiche, PR #63

Der Betreiber hat drei neue **Original-Screenshots** bereitgestellt (alle **38 mm W980 ST7 Platinweiß**):

1. **L2**, L1=2250/L2=1200/B1=B2=600 mm, Standardkanten 1,5 mm: **488,01 €**. Damit **0,00 €** gegenüber der bereits archivierten **L1 488,01 €** beim identischen Maß.
2. **U2**, L1=2250/L2=1200/L3=1800/B1/B2/B3=600 mm, Standardkanten 1,5 mm: **710,91 €**, also **−4,13 €** gegenüber **U1 715,04 €**. **Dieselben −4,13 €** waren bei L1=2000 mm bereits aus U2 687,36 € vs. U1 691,49 € beobachtet. Starker Hinweis auf gleichen Variantenunterschied in **dieser** Dicke/Dekor-/Breitenkombination, nicht allgemeine Freigabe.
3. **L1 links abgeschrägt, Kante durchlaufend**, L1=2250/L2=1200/B1/B2=600, zusätzliche **Abstand L3=150 und Abstand B3=150 mm**: **510,02 €**, gegenüber eckiger L1 **+22,01 €**. **Wichtig:** Die ursprünglich erbetene reine Änderung **nur** einer linken Kante wurde NICHT isoliert getestet. Diese Aufnahme enthält eine echte **Eckkonturänderung plus durchlaufende Kante**. Niemals +22,01 € als universellen Kantenaufpreis verwenden oder die 150-mm-Eckmaße mit Form-L3/B3 gleichsetzen.

Neue Quellen: [JSON einschließlich Original-PNG-SHA](references/speedmaster-lu/LU_THREE_PRICE_CONTROLS_20261106.json), [zentrales Preisregister](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv), [Testmatrix](references/speedmaster-lu/PRICE_VARIANT_CONTROL_20261106.csv), [Auswertung und nächste Vergleichsparameter](phase-lu-price-variation-tests-20261106.md). **Historischer Stand nach PR #63:** Das Original-ZIP `Speedmaster_LU_3_Preisvergleiche_20261106_Originale.zip` wurde am 06.11.2026 tatsächlich binär nach GitHub hochgeladen und PR #63 gemergt. Git-Blob `deec662cfea4509eb98c0a58ad692762115da794`, 1.110.446 Bytes, `verify-three-price-originals` **success**. Ein erneuter ZIP-Upload ist nicht nötig. Die ursprüngliche Bildarchivpflicht wurde **für alle künftigen Preisbelege abgeschafft**; [aktuelle Text-Regel](references/speedmaster-lu/PRICE_TEXT_EVIDENCE_POLICY_20261106.md).

**Nächste gezielte Referenzen (statt neue Preisengine):** L2 bei L1=2500 und U2 bei L1=2500 (alle übrigen Maße/Varianten gleich) und eine **wirklich nur veränderte linke Kante ohne Abschrägung** bei L1=2250. Preisregeln 40/35/10 und Anlieferung 10 € + einmalig 50 € ab tatsächlichem ≥1900-mm-Lieferteil = 60 € gesamt bleiben unverändert. WooCommerce und Gerade bleiben unangetastet.


## 15. Neue verbindliche Arbeitsweise ab 06.11.2026 – Textpreise, Speedmaster-Zugriff

- **Betreiberentscheidung:** Kein ZIP, Screenshot-Binärupload oder Foto-Hash-Zwang mehr für **neue Speedmaster-Preisreferenzen**. Im selben Repository den exakten Preis als **TEXT** mit allen Maßen, Kanten/Ecken, Material, Dekor, Quelle, Beobachtungsdatum, Steuer-/Netto-Status und Variantendifferenz einpflegen. Die [zentrale Preistext-Policy](references/speedmaster-lu/PRICE_TEXT_EVIDENCE_POLICY_20261106.md) gilt vor älteren gegenteiligen Archiv-Anweisungen. Historische Bildarchive bleiben in GitHub; visuelle Fertigungs-/Geometrienachweise sind separat und weiterhin ggf. bildbasiert.
- **PR #63 ist gemergt**, original drei Preisfotos in früherem ZIP und 9/9 CI-Checks inkl. Original-ZIP-Prüfung erfolgreich. **Kein erneuter Upload!** Baselines und Deltas: L2 488,01 € wie L1; U2 710,91 € (−4,13 € ggü. U1 bei L1=2250, ebenso bei 2000); L1 links abgeschrägt Kante durchlaufend 510,02 € (+22,01 €, **kein** isolierter Standard-Kantenpreis). Die originale Preis-CSV und Quellen-JSON bleiben unverändert; kein Preis zum Netto-EK oder Woo-Preis hochgestuft.
- **Künftige Quelle:** Betreiber möchte, dass ChatGPT mit seinem erlaubten Speedmaster-Shopzugang **selbstständig die benötigten Preisabfragen im Browser** macht, ohne Screenshots vom Nutzer anzufordern. Er meldet sich selbst beim Speedmaster-Shop an; nie Passwörter/Cookies in Chats/Repo, keine Bestellung. **Aktuell noch kein Browserzugang aus dieser Chat-Sitzung:** Browser-Tabliste meldet fehlenden Ursprungsbrowser-Kontext. Erst nach tatsächlich hergestellter authentifizierter Browser-Sitzung Preise abfragen und als Text committen; nicht behaupten, die Abfragen seien bereits durchgeführt.
- **Erste automatisierte Kontrollfälle nach Zugriff:** L2 mit L1=2500 (sonst L2=1200, B1=B2=600, 38mm W980, Standardkante), U2 mit L1=2500 (sonst L2=1200, L3=1800, B1=B2=B3=600, 38mm W980, Standardkante), und isolierte linke Kantenänderung bei **eckiger** L1 2250 ohne zusätzliche Abschrägung. Dann gezielt offene Formen, Stärken, Dekore und geometrische Gegenbeispiele untersuchen. `HPZ_APL_Price_V3`, Versand 10€ + einmalig 50€ bei nachgewiesenen ≥1900mm Lieferteilen und alle Woo-Live-Gates unverändert.


## 16. Fortsetzung 06.11.2026 – acht neue TEXTpreis-Referenzen, Modellentwicklung

Der Speedmaster-Webshop ist erreichbar, sein WebGL-Konfigurator war im Cloud-Browser des anderen Chats aber **nicht verlässlich steuerbar**. Der Betreiber hat deshalb **acht neue 38-mm-W980-ST7-Preise als Text** geliefert, ohne Screenshots; [exakte JSON-Quelle mit mm-Maßen/Kanten/Ecken](references/speedmaster-lu/LU_EIGHT_TEXT_PRICES_20261106.json) und [aktualisiertes zentrales Register](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv).

| Form | Neuer Anzeigebetrag | Maße (mm) |
|---|---:|---|
| L2 | 511,56 € | L1=2500, L2=1200, B1=B2=600 |
| U2 | 734,46 € | L1=2500, L2=1200, L3=1800, B1/B2/B3=600 |
| L3 | 798,52 € / 845,62 € | L1=2000 / 2500, L2=2000, B1/B2=600, B3/B4=900 |
| L4 | 658,61 € / 705,71 € | wie L3 plus B5-Grundmaß=600 |
| U3/U4 | je 738,59 € | L1=2500, L2=1200, L3=1800, B1/B2/B3=600 |

**Alle acht neuen Werte sind Hersteller-Anzeigen, Netto-EK-Status NICHT ausdrücklich bestätigt.** Bereits vorhandener L4-Anzeigewert 658,61 € bei L1=2000 wurde durch neue Textangabe erneut bestätigt. **Betreiberentscheidung: Ausschließlich 1,5-mm-dekorgleiche Kanten an Profil und allen Außenkanten.** Die bisher geplante Prüfung „ohne Kante“ ist gestrichen; keine entsprechend abweichende Kundenoption. Keine weiteren Preis-PNG-/ZIP-Archive verlangen.

**Kalibrierungsstand (PR #65):** [Analyse](phase-lu-eight-text-prices-model-20261106.md). Das offline `HPZ_APL_LU_Calibration_11`-Modul liest weiterhin historische verifizierte Netto-Anker aus `docs/price-reference-cases.csv` getrennt von den **unbestätigten Anzeige-Referenzen**. Für die neuen Anzeige-Daten berechnet es **nur begrenzte Ein-Längen-Achsen-Zwischenwerte im Modell-Feld `estimatedSupplierDisplayCents`**, kein `estimatedSupplierNetCents`, keine Brutto-Kundenszenarien, keine WP-Kauf-Freigaben. L3/L4 +47,10 € für L1 2000→2500, U2 −4,13 € zu U1 bei drei kontrollierten Standard-Längen, U3/U4=U1 bei 2000/2500. **Kein Preis darf außerhalb des exakt belegten Korridors übertragen werden.**

**Nächster erforderlicher Fachbeleg:** Netto-/Brutto-Einordnung, reale Hersteller-Zuschnitte/Packstücke/Verbinder und Versandkostenbezug; danach gezielt 17,5 mm, geänderte Breiten und weitere Dekore. 40/35/10 aus V3 sowie **10 € Standard + einmalig 50 € ab realem Lieferteil ≥1900 mm = 60 € netto insgesamt** bleiben. Keine echte Speedmaster-/Woo-Bestellung, keine neue Live-Schaltung ohne separate persönliche Freigabe. Später UI-Feinschliff B5-„Einstellung“, stabile SVG-Größe und H1+Kurzbeschreibung im Produktkopf. Neue Chats müssen diese Sektion statt veralteter Bildanforderungen aus früheren Abschnitten verwenden.
