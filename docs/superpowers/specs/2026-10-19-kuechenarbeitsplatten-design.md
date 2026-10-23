# Technische Spezifikation Küchenarbeitsplatten Konfigurator

Stand 19.10.2026 · Vom Nutzer endgültig freigegeben · Zielshop holzplatten-zuschnitt.de

**Aktualisierte Ausführung:** Der freigegebene Plan wird auf ausdrücklichen Nutzerwunsch zunächst lokal umgesetzt. Staging bei HostPress/Plesk ist bis zur Abstimmung mit Marco zurückgestellt. Lokale Fachlogik-/SVG-/Preistests sind erlaubt; tatsächliche Shop-Integration und Veröffentlichung benötigen weiterhin eine gesicherte Testumgebung und gesonderte Veröffentlichungsgenehmigung. Die lokale Entwicklungsfassung unter `implementation/apl/local/` ist kein auslieferbares WooCommerce-Plugin. Fehlende Geometrie-, Teile-, Preis-, Verfügbarkeits- und Gewichtsbelege bleiben Kaufsperren. Prüfstand: `implementation/apl/docs/local-development.md`.

Die bestätigte Architektur besteht aus WCPA und einer kleinen eigenen WooCommerce-Erweiterung. Der Nutzer hat diese überarbeitete Spezifikation endgültig freigegeben und die Erstellung des Implementierungsplans beauftragt. Ziel sind bestellbare, technisch eindeutige Arbeitsplatten mit belastbarer Kalkulation. Die Umsetzung beginnt erst nach Prüfung und Freigabe des Implementierungsplans. Es wurden keine Shop-Einstellungen, Produkte oder Formulare verändert.

## 1 Lesender Befund und Grenzen

Am öffentlichen [Sockelprodukt](https://holzplatten-zuschnitt.de/produkt/moebelsockel-nach-mass/) wird `woo-custom-product-addons-pro/assets/js/frontend.min.js?ver=3.9.8` ausgeliefert. Die [Startseite](https://holzplatten-zuschnitt.de/) liefert Flatsome-Dateien mit Versionsangabe 3.20.8 sowie WooCommerce-Dateien mit 11.2.1. Außerdem sind Hinweise auf WP-Rocket-Integration, minimierte Dateien und WooCommerce Germanized vorhanden. Dies sind Frontend-Indizien, keine bestätigte Backend-Inventur.

Die lokale Projektablage enthält keinen erkennbaren Quellcode dieses WordPress-Shops. Der verfügbare Holz-Liebling-Connector bietet einen Shop-Schlüssel `de`; das exemplarisch gelesene Produkt verlinkt auf www.holz-liebling.de. Seine Daten werden daher nicht auf den Zielshop übertragen.

Der Vorgängerchat liefert überwiegend Inhaltsverweise statt vollständiger Antworten. Maßgeblich sind die aktuelle Übergabe und eindeutig lesbare Screenshots. Ein geprüfter U4-Screenshot zeigt ausdrücklich Postforming; dessen Preis ist für die gewünschte Dickkante keine Kalkulationsgrundlage.

Der nachgereichte Systembericht, WCPA-Export, zwei aktive Snippet-Exporte und Backend-Screenshots belegen inzwischen Versionen, klassische Checkout-Technik, deaktiviertes HPOS, Sockelzuordnung, Steuereingabebasis und dargestellte Versandregeln. Aktueller Detailstand: `implementation/apl/docs/baseline.md`. Offene Punkte sind insbesondere die vollständige Länderzuordnung, Steuersatztabellen, Gewichtsgrundlagen, Laufzeitintegration und eine isolierte Testumgebung.

## 2 Produkte und Kundenführung

Es gibt drei separate WooCommerce-Produkte: **Arbeitsplatte Gerade**, **Arbeitsplatte L-Form**, **Arbeitsplatte U-Form**. Vorgeschlagen sind einfache Produkte mit zugeordneten WCPA-Formularen; die vielen Maßkombinationen werden nicht als einzelne WooCommerce-Varianten angelegt.

Die Standardfolge hat vier Schritte:

1. Grund-/Eckform: Gerade beziehungsweise L1–L4 oder U1–U4, einschließlich zulässiger Eckausführungen.
2. Maße: nur für die gewählte Geometrie erforderliche Felder und dynamische Maßzeichnung.
3. Material: APL 17,5 mm beidseitig Schichtstoff belegt oder APL 38 mm.
4. Dekor: zwölf kuratierte, verfügbare Bildkacheln und „Alle Dekore anzeigen“.

Die Grundform ist durch das Produkt vorbelegt. Ein Wechsel zur anderen Produktfamilie ist klar erkennbar; inkompatible Maße werden nicht still übernommen. Material und Dekor bleiben getrennte Daten, sodass ihre Darstellung später ohne neue Kalkulationslogik zusammengefasst werden kann. Die konkrete Auswahl der zwölf Dekore ist noch festzulegen; sie darf ohne Verkaufsdaten nicht als belegte Bestsellerliste ausgegeben werden. Gibt es weniger als zwölf freigegebene Dekore, erscheinen nur diese.

Rückwärtsnavigation erhält kompatible Eingaben. Ein Form-/Materialwechsel macht unzulässige Werte sichtbar ungültig und verlangt eine neue Auswahl. Auf Mobilgeräten bleiben Zeichnung, Feldbezeichnungen, Gesamtpreis und Fehlermeldungen lesbar; Tastaturbedienung und eindeutige Labels sind erforderlich.

## 3 Zuständigkeiten und Datenfluss

**WCPA:** Auswahlfelder, Bildauswahl und bedingte Sichtbarkeit; ausschließlich neue, produktspezifisch zugeordnete Formulare. WCPA unterstützt feldbezogene Preise und bedingte Logik; die konkrete Nutzung richtet sich nach der installierten Version. Quellen: [Acowebs Preisoptionen](https://acowebs.com/guideline/plugin-docs-faqs/wcpa/pricing-custom-formula/) und [bedingte Logik](https://acowebs.com/guideline/plugin-docs-faqs/wcpa/setting-conditional-logic/).

**Eigene Erweiterung:** normalisierte Konfiguration, Geometrieregeln, Teilezerlegung, Kantenbelegung, Verfügbarkeitsmatrix, verbindliche Preisberechnung, Validierung sowie Warenkorb-/Bestelldaten. Ein kleiner Frontend-Teil steuert Schritte und SVG-Zeichnung. Die Geschäftslogik gehört nicht in Flatsome oder einzelne Produktbeschreibungen.

**WooCommerce:** Warenkorb, Bestellpositionen, Zahlung, Steuerberechnung und Integration in den bestehenden Versandprozess.

Ablauf: Eingabe → Normalisierung → technische und kaufmännische Prüfung auf dem Server → bestätigter Preis → Warenkorb. Der Browser darf weder Einkaufspreise noch einen verbindlichen Verkaufspreis vorgeben. Veraltete Antworten nach schnellen Eingabewechseln dürfen den neuesten Preis nicht überschreiben. Bei fehlender gültiger Serverantwort bleibt das Hinzufügen gesperrt.

Für diese Produkte gibt es genau eine maßgebliche Preisberechnung. WCPA-Aufpreise und WooCommerce-Grundpreis dürfen den errechneten Gesamtpreis nicht nochmals erhöhen. Der versionsgerechte Integrationspunkt wird nach Einsicht in Formulare und Plugin-Schnittstellen bestimmt; konkrete Hook-Namen werden noch nicht als verifiziert festgeschrieben.

## 4 Geometrie und Maße

Die Geometriebibliothek umfasst Gerade, L1–L4 und U1–U4 sowie deren zulässige Abrundungen, Abschrägungen und die Ausführungen „eckig“ beziehungsweise „Kante durchlaufend“. Diese Bezeichnungen sind keine bloßen Bildvarianten: Jede erhält eine belegte Kontur, Maßdefinition, Teilezerlegung und Kantenbelegung.

Pro Variante werden Pflichtfelder L1/L2/L3 und B1/B2/B3, erforderliche Sondermaße, Messbezug, Minima/Maxima und abhängige Bedingungen festgelegt. Radien, Schrägen und Eckmaße werden nur dort angeboten, wo sie nachweislich herstellbar sind. L1–L4/U1–U4 werden nicht anhand ihrer Namen als Spiegelungen interpretiert. Ihre genaue Zuordnung zu Speedmaster muss vor Umsetzung der jeweiligen Variante anhand eindeutiger Zeichnungen vervollständigt werden.

Kundeneingabe in cm, Schritte 0,1 cm; Komma und Punkt werden akzeptiert. Intern werden Längen als ganze Millimeter gespeichert. Zusätzliche Nachkommastellen werden abgewiesen, nicht unbemerkt gerundet. Materialstärke 17,5 mm und Kantenstärke 1,5 mm sind feste Materialattribute und fallen nicht unter die Ganzmillimeterregel für Kundenmaße.

Die Prüfung berücksichtigt unter anderem positive Restbreiten, geometrisch gültige Innenausschnitte, zulässige Radien/Schrägen, Überschneidungen und Materialgrenzen. Bloße Einzel-Min-/Max-Werte reichen nicht. Unbekannte Grenzwerte werden nicht erfunden.

Die SVG-Draufsicht zeigt Außenkontur, Stoßlinien, Orientierung, Maßpfeile und Feldnamen. Das aktive Maß wird hervorgehoben. Zeichnung und Teileliste müssen dieselbe Geometriedefinition verwenden. Kundeneingaben sind als Fertigmaße vorgesehen; Speedmaster-Messbezug und Berücksichtigung der Kantenstärke sind vor Freigabe zu bestätigen. Die Vorschau ist keine ungeprüft an die Fertigung übertragbare CNC-Datei.

### Verbindlicher Geometrienachweis

Die vorhandenen Speedmaster-Zeichnungen werden zuerst ausgewertet. Für jede Grundgeometrie und jede abweichende Eckausführung wird ein Prüfdatensatz geführt: Quelldatei/Ansicht, Material, Messbezug, nummerierte Einzelteile, Ableitung ihrer Fertigmaße aus den Eingaben, Stoßpartner und Stoßbearbeitung, belegte Außenkanten sowie Versandmaße je Teil. Dabei werden Gesamtmaße, Fertigmaße der Teile und gegebenenfalls abweichende Verpackungsmaße getrennt dokumentiert. Die 1.900-mm-Prüfung verwendet die bestätigte relevante Länge des tatsächlich versendeten Einzelteils; Verpackungszugaben werden nicht stillschweigend hinzugerechnet.

Die Teilkonturen müssen sich ohne unbeabsichtigte Lücken oder Überlappungen zur Gesamtkontur zusammensetzen. Jede Stoßkante muss einem passenden Gegenstück zugeordnet sein. Für veränderliche Maße sind die Ableitungsregeln und deren Gültigkeitsgrenzen zu prüfen; ein einzelnes Beispielbild belegt nicht automatisch den ganzen Maßbereich. Postforming-Zeichnungen können erkennbare Konturen belegen, aber keine Dickkantenbearbeitung oder deren Fertigmaßkorrektur.

Prüfstatus je Fall: **ungeprüft**, **teilweise belegt** oder **freigegeben**, jeweils mit Quellenverweis und offenen Punkten. Derzeit ist die vollständige Teile-/Stoß-/Versandmatrix noch nicht nachgewiesen. Fehlende oder nicht lesbare Detailansichten werden gezielt nachgefordert. Nur vollständig freigegebene Geometriefälle dürfen bei zusätzlich validiertem Preis und bestätigter Verfügbarkeit automatisch kaufbar sein. Ungeprüfte und teilweise belegte Fälle bleiben serverseitig gesperrt, auch bei direktem Warenkorbaufruf.

## 5 Material, Kanten und Dekore

Compact- und Keramikplatten sind ausgeschlossen. Profil und sichtbare Außenkanten erhalten fest Dickkante 1,5 mm dekorgleich, einschließlich der Hinterkante gerader Platten, soweit technisch möglich. Für nicht bestätigte Kombinationen gibt es keinen automatischen Ersatz durch Postforming.

Bei L/U werden Außenkanten, Innenkonturen und Stoßkanten getrennt klassifiziert. Stoßkanten erhalten die zur jeweiligen Verbindung passende Bearbeitung; sie werden nicht pauschal mit Dickkante versehen. Verbindung, Fräsungen, eventuell enthaltene Verbinder und Kostenumfang müssen mit dem Lieferantenmodell übereinstimmen.

Die Verfügbarkeitsmatrix wird je Form, Material und Dekor geführt, gegebenenfalls zusätzlich nach Maßen und Kantenbearbeitung. Die beobachteten 17 Dekore bei U1 für beide Materialstärken sind ein Prüfhinweis, keine globale Freigabe. Dekorcode, Name, Oberfläche und Bild werden eindeutig zugeordnet; Bildnutzungsrechte sind vor Einbindung zu klären.

## 6 Produktpreise, Bezugskosten und Kundenversand

Für eine konfigurierte Arbeitsplatte gilt die bestätigte Kalkulation:

**Nettoverkaufspreis = validierter Speedmaster-Nettopreis × 1,30 + 10,00 € + gegebenenfalls 50,00 €.**

Die 50,00 € netto fallen einmal je konfigurierter Arbeitsplatte an, wenn mindestens ein tatsächlich versendetes Einzelteil eine relevante Versandlänge von mindestens 1.900 mm erreicht. Auch bei mehreren solchen Teilen bleibt es bei einmal 50,00 € je Arbeitsplatte. Weder die Summe der Schenkel noch ungeprüft das größte eingegebene Gesamtmaß entscheidet. Die Teilezerlegung und die Definition dieser Versandlänge müssen je Geometrie belegt sein. Bei unbekannter Zerlegung wird keine automatische Bestellung freigegeben.

**Verbindliche Korrektur:** Die 10 € netto und gegebenenfalls einmal 50 € netto je Arbeitsplatte sind ausschließlich interne Bezugskosten für Speedmaster → Holz-Liebling. Sie sind Bestandteil des Produktpreises; bei Menge zwei ergeben sich 20 € beziehungsweise 120 € netto Bezugskosten. Der zweite Transportweg Holz-Liebling → Endkunde wird zusätzlich nach den bestehenden WooCommerce-/Flexible-Shipping-Regeln im Checkout berechnet. Diese Kundenversandkosten sind keine Doppelberechnung. Flexible Shipping wird weder pauschal deaktiviert noch für Arbeitsplatten auf null gesetzt; keine künstliche Pakettrennung oder Versandbefreiung aus dieser Kostenkorrektur ableiten. Abholung beim Händler entfernt nicht die internen Bezugskosten. Der Möbelsockel bleibt einschließlich Preisformeln, Snippets und Versandbehandlung unverändert.

Für Deutschland gilt der Produktpreis `(Speedmaster-EK netto × 1,30 + 10 € + ggf. 50 €) × 1,19`, zuzüglich Kundenversand. Belegt sind Brutto-Preiseingabe, Steuerberechnung nach Lieferadresse, Versandsteuerklasse nach Produkten, Rundung auf Zwischensummenebene und Bruttoanzeige in Shop/Warenkorb/Checkout. Bei dieser Eingabebasis ist der Faktor 1,19 in einer als Brutto übergebenen WCPA-Formel nicht automatisch doppelte Besteuerung: WooCommerce ermittelt den enthaltenen Steueranteil. Der Laufzeitnachweis bleibt auf Staging erforderlich. Quelle: [WooCommerce Steuer- und Preiseingabebasis](https://woocommerce.com/document/setting-up-taxes-in-woocommerce/).

Intern kalkuliert die neue Erweiterung netto. Für die Brutto-Eingabebasis wird genau einmal der gültige Basissteuersatz berücksichtigt; WooCommerce berechnet daraus die Steuer der Lieferadresse. Kein zusätzliches Multiplizieren des Kundenpreises mit 1,19 nach dieser Anpassung. Deutschland, ein EU-Zielland mit abweichendem Satz, Schweiz/Drittland und Abholung werden anhand der tatsächlich freigegebenen Steuertabellen geprüft. Aus den Steueroptionen allein lassen sich die ausländischen Sätze oder Steuerbefreiungen nicht ableiten. Fehlende Regeln werden nicht durch pauschal 19 % für alle Länder ersetzt. Produktvorschau, Warenkorb und Checkout nutzen denselben Steuerkontext; bestehende Steuerregeln bleiben unverändert.

**Gewicht für den Kundenversand:** Je Konfiguration aus der belegten Teilegeometrie und materialabhängigen Lieferantengewichten beziehungsweise Flächengewichten ermitteln, einschließlich separat belegter Verpackung/Zubehör. Keine pauschale Null oder unbestätigte Dichte verwenden. Serverseitig je Warenkorbposition ein eigenes Produktobjekt mit Stückgewicht führen; WooCommerce wendet die Menge genau einmal an. Keine Stammdaten oder Gewichte anderer Produkte ändern. Ohne freigegebene Gewichtsregel keine automatisch kaufbare Versandkonfiguration. Flexible Shipping erhält das reguläre Paketgesamtgewicht einschließlich bestehender Produkte. Grenzgewichte, Zonen, gemischte Warenkörbe und Abholung werden auf Staging geprüft.

Geldbeträge werden dezimal und mit definierter Rundung verarbeitet; Preisvorschau und Bestellabschluss verwenden dieselbe Regel. Beispiel für Gerade 200 × 60 cm, APL 17,5, W980, ein Teil von 200 cm: 144,99 × 1,30 + 10 + 50 = 248,487 € netto, entsprechend 295,70 € brutto bei 19 %. Dieses Rechenbeispiel validiert die Aufschlagslogik, nicht die Lieferantenpreisfunktion.

### Referenzwerte aus der Übergabe

| Form und Maße in cm, W980 | APL 17,5 netto | APL 38 netto |
|---|---:|---:|
| Gerade 200 × 60 | 144,99 € | 243,11 € |
| Gerade 200 × 70, alle Kanten 1,5 mm dekorgleich | 165,80 € | nicht bestätigt |
| L1 200/120, Breiten 60 | 307,67 € | 464,45 € |
| L1 250/120, B1/B2 jeweils 60 | 342,41 € | 511,56 € |
| U1 200/120/180, Breiten 60 | 459,29 € | 691,49 € |
| U1 250/120/180, B1/B2/B3 jeweils 60 | 494,03 € | 738,59 € |
| U1 250/170/180, B1/B2/B3 jeweils 60 | 528,76 € | 785,69 € |
| U1 250/170/180, B1=70, B2/B3 jeweils 60 | 539,90 € | 767,12 € |

Diese Werte sind übernommene Referenzen, keine heute neu abgefragten Angebote. Die neuen L1-/U1-Werte mit L1=250 cm wurden vom Nutzer ausdrücklich für W980 Platinweiß und die festgelegten Dickkanten bestätigt. Die Tabelle enthält Speedmaster-Nettopreise vor unserem Aufschlag und unseren Versandanteilen. Der alte U1-Wert 528,20 € ist ausgeschlossen. Referenzen mit anderem Profil dürfen keine Dickkantenregel begründen.

Der zusätzliche Gerade-Referenzfall ist APL17,5, W980 Platinweiß, 2000 × 700 mm, alle Kanten 1,5 mm dekorgleich, EK 165,80 € netto. Bei bestätigtem Versand als ein 2000-mm-Teil ergibt die vereinbarte Kalkulation 275,54 € netto beziehungsweise 327,89 € brutto für Deutschland vor regulärem Kundenversand. Die Referenz ist kein Beleg für Zwischenmaße oder APL38; fehlende Regeln bleiben gesperrt.

Für U1 mit L1/L2/L3=250/170/180 cm und B2/B3=60 cm hat der Nutzer den niedrigeren APL38-Preis bei B1=70 cm erneut bestätigt: 767,12 € gegenüber 785,69 € bei B1=60 cm, also 18,57 € weniger. APL17,5 steigt in demselben Vergleich von 528,76 € auf 539,90 €, also um 11,14 €. Beide Vergleiche gelten für W980 Platinweiß und Dickkante 1,5 mm. Die Preislogik darf keine allgemeine Monotonie voraussetzen, bestätigte Preise nicht nach oben glätten und aus diesen zwei Punkten keine ungeprüften Zwischen- oder Außenbereiche ableiten. Konservative Näherungen benötigen weiterhin belegte Gültigkeitsbereiche; sonst bleibt der Kauf gesperrt.

**APL38, vom Nutzer bestätigte Breitenstaffel:** Bis einschließlich 880 mm (88,0 cm) gilt die normale Preisstaffel; ab 881 mm (88,1 cm) gilt die große Preisstaffel. Die Prüfung erfolgt mit ganzzahligen Millimetern. 200 × 85 cm mit 246,27 € gegenüber 200 × 90 cm mit 496,14 € sind dazu passende Preisreferenzen, aber keine vollständigen Formeln für die beiden Bereiche. Welche kalkulationsrelevante Teilbreite bei den einzelnen L-/U-Geometrien zugrunde liegt, muss mit der Teilezerlegung und der jeweiligen Preisregel belegt werden; die Schwelle wird nicht ungeprüft auf Gesamtmaße übertragen. APL17,5: Der beobachtete Sprung ab 251 cm um etwa 22,61 € gilt zunächst nur für die getesteten Breiten.

Preise werden deshalb in validierten Bereichen und mit expliziten Sprungregeln geführt. Es gibt keine pauschale Quadratmeterformel über alle Formen, Breiten und Längen. Eine konservative Näherung braucht einen begrenzten Gültigkeitsbereich, Vergleichswerte an dessen Rändern und dokumentierte Sicherheitsreserve. Die 30 % Aufschlag ersetzen diese Validierung nicht. Ungeprüfte Bereiche bleiben „Preis auf Anfrage“ und nicht direkt kaufbar. Eine Garantie gegen Unterkalkulation lässt sich aus wenigen Stichproben nicht ableiten.

Gezielte Prüfungen konzentrieren sich auf Bereichsgrenzen und abweichende Geometrien. Sobald ein Bereich ausreichend belegt ist, erfolgen keine endlosen weiteren Einzelabfragen. Lieferantenwerte, Profil, Datum, Preisregel und Gültigkeitsbereich werden versioniert gespeichert. Einkaufspreise bleiben serverseitig.

Die übrigen Preiskalkulationen werden parallel in einem anderen Chat erarbeitet. Diese Spezifikation startet keine zusätzliche Preisrecherche. Zur späteren Übernahme werden die dort bestätigten Regeln mit Material, Form, Profil, Dekorbezug, Maßbereich, Staffelgrenzen, Referenzwerten und Versionsstand benötigt. Bis zum geprüften Abgleich bleiben davon abhängige Preisbereiche nicht automatisch kaufbar.

## 7 Warenkorb und Bestellung

Die normalisierte Konfiguration enthält Produktfamilie, Geometrie, Eckausführung, Maße in mm, Material, Dekor, Kanten, Teilestückliste sowie Schema-, Geometrie- und Preisregelversion. Verborgene oder fremde Felder können keine Preiswirkung auslösen.

Serverseitige Prüfung erfolgt beim Hinzufügen, Wiederherstellen der Sitzung, relevanten Mengenänderungen und vor Bestellabschluss. Preisänderungen werden angezeigt und müssen vor Kaufabschluss akzeptiert sein. Wiederholte Summenberechnungen dürfen Aufschläge nicht kumulieren. Unterschiedliche Konfigurationen bleiben getrennte Warenkorbpositionen.

Kunden sehen verständliche Maße, Form, Material, Dekor, Kanten und Endpreis. Bestellungen speichern einen unveränderlichen Konfigurationsstand einschließlich Teilezuordnung und Kalkulationsversion; spätere Regeländerungen verändern abgeschlossene Bestellungen nicht. Einkaufspreise erscheinen nicht in Kunden-E-Mails. Bestellzugriff erfolgt über WooCommerce-Schnittstellen, damit die vorhandene Bestellspeicherung unterstützt werden kann.

## 8 Isolation und Abnahme

Die Erweiterung greift nur für explizit zugeordnete Arbeitsplattenprodukte. Keine globalen WCPA-Preisfilter oder pauschalen CSS-Eingriffe. Bestehende Sockelformulare werden weder geteilt noch überschrieben. Bei fehlender Abhängigkeit oder fehlenden Regeln sind nur die betroffenen Arbeitsplatten nicht kaufbar; es darf kein Nullpreis-Fallback entstehen.

Vor Veröffentlichung sind auf Staging erforderlich:

- Jede freizugebende Geometrie mit beiden Materialien: gültiger Normalfall, Grenzen, unmögliche Kombination und korrekte Zeichnung/Teileliste.
- Versandgrenze 189,9 / 190,0 / 190,1 cm am tatsächlichen Einzelteil; L/U mit abweichenden Gesamt- und Teilmaßen.
- Preisbereiche um 250,9 / 251,0 / 251,1 cm sowie APL38-Breitentests bei 879 / 880 / 881 / 882 mm: 880 mm gehört zur normalen, 881 mm zur großen Staffel.
- Übernommene Referenzfälle L1 und U1 mit L1=250 cm für beide Materialien, W980 Platinweiß und festgelegte Dickkanten.
- Eine Arbeitsplatte mit mehreren Teilen ab 190 cm erhält nur 50 € netto Bezugszuschlag; bei Menge zwei insgesamt 120 € netto Bezugskosten. Zusätzlich bleiben die regulären Kundenversandkosten im Checkout erhalten.
- Manipulierte Browserpreise, fehlende Felder, ungültige Dekore, alte Antworten und Serverausfall.
- Warenkorb, Sitzung, Menge zwei, unterschiedliche Konfigurationen, Mischwarenkorb und Rabatte: Bezugskosten genau einmal im Produktpreis, Kundenversand separat, Steuer je Transport-/Produktposition korrekt. Gewichtsgrenzen 4,5/9/16/21/28/9999 kg jeweils darunter, exakt und darüber sowie unbekanntes Gewicht prüfen.
- Bestellübersicht, Bestell-E-Mail und interne Fertigungsangaben mit identischen Konfigurationsdaten.
- Mobile Ansichten, Tastaturbedienung, Flatsome-Warenkorb und bestehende Cache-/Optimierungsfunktionen.
- Sockel und mindestens ein unverändertes Standardprodukt als Regressionstest.

Freigabe bedeutet: technisch gültige Kontur, bestätigte Teile-/Kantenzuordnung, verfügbare Material-Dekor-Kombination und validierter Preisbereich. Alle neun Grundgeometrien gehören zum vereinbarten Zielumfang; fehlende Belege werden als offene Voraussetzungen geführt, nicht still aus dem Umfang gestrichen.

## 9 Benötigte Backend-Unterlagen und Zugänge

Für die Bestandsprüfung ist zunächst ein Exportpaket ausreichend; es erfordert keinen schreibenden Zugang zum Liveshop:

| Unterlage | Benötigter Inhalt und Zweck |
|---|---|
| WooCommerce-Systemstatusbericht | WordPress-, PHP-, WooCommerce-, WCPA-Pro- und Theme-Versionen, aktive Plugins, Template-Overrides, HPOS und Umgebung. Geheimnisse vor Weitergabe entfernen. |
| WCPA-Formularexporte | Alle dem Sockelprodukt zugeordneten Formulare, gegebenenfalls bereits vorhandene Arbeitsplattenformulare und globale Formulare, die auf diese Produkte wirken. Möglichst nativer Export der installierten Version, vollständig mit Feld-IDs, Optionen, Formeln, Bedingungen, Validierung und Darstellung. Falls kein Export angeboten wird: lesende Einsicht oder vollständige Ansichten dieser Einstellungen. |
| WCPA-Einstellungen und Zuordnungen | Globale Preis-/Steuer-/Gebühren-/Warenkorbeinstellungen, Produkt- und Kategoriezuordnungen sowie Ausschlussregeln. Screenshots sind ausreichend, soweit kein Export vorhanden ist. |
| Referenzprodukt Sockel | Produkt-ID/URL, Produkttyp, Grundpreis, Steuerstatus/-klasse, Versandklasse, WCPA-Zuordnung und produktspezifische Preisoptionen. Ein normaler Produkt-CSV-Export allein ersetzt die WCPA-Daten nicht. |
| Bestehender Zusatzcode | Export relevanter aktiver Snippets einschließlich Ausführungsbereich; relevante eigene Plugins und MU-Plugins; Child-Theme-functions.php sowie zugehöriges JS/CSS und WooCommerce-Template-Overrides. Besonders Preis-, Add-to-cart-, Validierungs-, Gebühren- und Versandänderungen. Keine wp-config.php, Schlüssel oder komplette Kundendatenbank erforderlich. |
| Steuer- und Versandeinstellungen | Bruttoeingabe/Anzeige, Lieferadresssteuer und Rundung sind belegt. Noch benötigt: tatsächliche Steuersatztabellen, vollständige Länder der Zone Mitteleuropa, Gewichtsgrundlagen und Laufzeitprüfung der dargestellten Flexible-Shipping-Regeln. Kundenversand bleibt zusätzlich zu internen Bezugskosten bestehen. |
| Warenkorb, Checkout und Optimierung | Verwendete Seiten und Block-/Shortcode-/Flatsome-Umsetzung, relevante Germanized-Einstellungen sowie Cache-/Minify-/JS-Verzögerungsregeln für Produktseite, Warenkorb und Checkout. |
| Staging | Vorhandene URL, Stand der Kopie und Abweichungen zum Liveshop. Für die spätere Umsetzung muss eine geeignete Testumgebung bereitstehen; ihre Einrichtung ist aktuell nicht beauftragt. |

Alternativ zum Exportpaket genügt eine bereits verfügbare angemeldete Sitzung oder ein technisch auf Lesen beschränkter Zugang zu genau diesen Bereichen des Zielshops beziehungsweise einer aktuellen Staging-Kopie. Eine Standard-WordPress-Rolle wird nicht ohne Prüfung als rein lesend vorausgesetzt. Ein WooCommerce-REST-Leseschlüssel allein reicht für WCPA-Formulare, Snippets und Theme-Dateien nicht aus. Falls zusätzlicher Dateizugriff nötig ist, genügt ein lesender Zugriff auf die genannten Dateien. Zugangsdaten nicht im Spezifikationsdokument ablegen. Es werden am Liveshop keine Rollen eingerichtet, Plugins installiert, Einstellungen gespeichert oder Produkte verändert.

Für die Geometrieprüfung werden zuerst die vorhandenen Speedmaster-Zeichnungen verwendet. Nur konkret fehlende Ansichten zu Sondermaßen, Fertigmaßbezug, Stoßbearbeitung und Einzelteilmaßen werden ergänzend angefordert. Die endgültige Spezifikationsfreigabe ersetzt nicht diese fachlichen Nachweise oder die spätere Freigabe einzelner kaufbarer Konfigurationen.

Die zwölf Startdekore werden anschließend aus der bestätigten Verfügbarkeitsliste gewählt. Ausschnitte für Spüle/Kochfeld, Montageleistungen und zusätzliche Zubehörkonfiguratoren sind mangels Anforderung nicht Bestandteil dieses Entwurfs.

Nach fachlicher Freigabe dieser Spezifikation folgt der separate Implementierungsplan. Auch dessen Abstimmung geht der Umsetzung voraus. Spätere Code-Lieferungen werden als vollständig ersetzbare Dateien beziehungsweise klar abgegrenzte vollständige Codeblöcke bereitgestellt.

## Verbindliche Einbettungsergänzung – 23.10.2026

Die drei bereits vorhandenen Produktentwürfe werden wiederverwendet; keine neuen Duplikate anlegen. Bestehende Flatsome-Produktseiten samt Galerie, H1, Texten, FAQs und SEO erhalten. Konfigurator als gekapselte Komponente in eigener voller Inhaltszeile nach Einleitung/Galerie und vor Beschreibung. Familie produktbezogen vorwählen und serverseitig binden. Demo bleibt unverändert; konkrete Adapter/Hook-Auswahl erst nach Layoutprüfung. Details: implementation/apl/docs/embedding-contract.md (vom Projektstamm aus). Diese Vorgabe ersetzt frühere Planstellen, die eine Neuanlage der drei Produkte voraussetzen.

