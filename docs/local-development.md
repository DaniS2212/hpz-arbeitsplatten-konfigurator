# Lokale Umsetzung und Zwischenabnahme – 19.10.2026

## Verbindliche Arbeitsentscheidung

Nutzer hat lokale, vom Shop unabhängige Entwicklung ausdrücklich beauftragt. HostPress/Plesk-Zugang liegt bei Marco; Staging ist auf Nutzerwunsch zurückgestellt. Kein Hosting-Zugang ist Voraussetzung für die nun ausgeführten Fachlogik- und Vorschauarbeiten. Veröffentlichung und endgültige Shoptests werden später mit Marco abgestimmt.

Isolierter Entwicklungsordner: `implementation/apl/local/`. Keine Shopkopie, kein Git-Repository im übergeordneten Arbeitsbereich, keine PHP-Laufzeit im Suchpfad. Deshalb werden Fachlogik und HTTP-Vorschau mit dem vorhandenen Node 24.10.0 und dessen eingebautem Testläufer entwickelt, ohne Zusatzinstallation. Keine Dateien unter `sources/` geändert. Kein Git-Commit, kein Plugin-Upload, keine Produktanlage und keine externen Schreibzugriffe.

## Ergebnis und Belege

`node --test` aus `implementation/apl/local`: **38 Tests bestanden, 0 fehlgeschlagen, 0 übersprungen**.

- Erste 31 Fälle vor Implementierung rot, danach grün: exakte Maße, Eingabeangriffe, Formenfamilien, SVG, Ecke/Fläche, 15 vollständige Lieferantenreferenzen, Aufschlag/Bezugskosten/Mengen, 880/881-mm-Grenze und Sperren.
- Fünf weitere HTTP-/Antwortreihenfolgetests zunächst rot, dann grün: serverseitige Neuberechnung aus normalisierten Eingaben, private Dateien gesperrt, Host/Origin, Payloadgrenze, Config-Hash und verspätete Antworten.
- Im Host-Test ersetzte Node-fetch den manipulierten Host-Header. Das wurde separat am empfangenen Header nachgewiesen. Der Test verwendet nun den rohen HTTP-Client und prüft damit tatsächlich den fremden Host; die Schutzprüfung wurde nicht abgeschwächt.
- Ergänzende Kantenprüfung fand, dass die gezeichnete Rundung/Schräge korrekte Flächen hatte, die Kantenbeschreibung aber noch den entfernten Rechteckpunkt enthielt. Test erst rot, Kantenpunkte/Arc-Datensatz korrigiert, gesamte Suite grün.
- Ein zusätzlicher technischer Matrixfall prüft 72 Vorschaukonfigurationen auf positive Fläche, SVG, fehlende erfundene Stöße und weiterhin gesperrten Kauf. Kein Lieferantenfreigabetest.

Browserprüfung im lokalen In-App-Browser: Grundansicht mit erkanntem 2000×700-Referenzfall; Maßeingabe 200,1 cm ergibt SVG-Text 2001 mm und keinen Preis für den unbelegten Nachbarpunkt. 200,11 cm entfernt die Zeichnung und zeigt einen Validierungsfehler. U-Familienskizze mit 2500/1700/1800 und 700/600/600 mm angezeigt, aktive Maße hervorgehoben. SVG-Beschriftung nach Sichtprüfung vergrößert. Prüfung im vorhandenen Browserfenster; keine behauptete Abnahme aller mobilen Viewports oder tatsächlichen WooCommerce-Abläufe.

## Status nach Planaufgaben

| Aufgabe | Stand |
|---|---|
| 1 Bestandsaufnahme | Dokumentarisch erfasst; tatsächliche WCPA-Hooks, vollständige Zonen/Steuern und Laufzeitbaseline offen |
| 2 Staging | Zurückgestellt; Marco hat Zugang; keine Kopie angelegt |
| 3 Produkte/WCPA | Lokale Familien-/Feld-/Validierungsbasis umgesetzt; keine Woo-Produkte oder WCPA-Formulare erstellt |
| 4 Geometrienachweise | Neun Formen im Register; Originalzeichnungen nicht lokal verfügbar; Zuordnung/Teile/Stöße offen |
| 5 Geometrie/SVG | Rechteck und allgemeine L/U-Skizzen mit dynamischen Maßen/Eckmustern umgesetzt; keine vollständige Speedmaster-Geometrieabnahme |
| 6 Materialien/Dekore | Zwei Materialien, feste Kante und W980-Referenz; Verfügbarkeitsmatrix/zwölf Bildkacheln offen |
| 7 Preisengine | Lokaler modularer Kern und 15 Referenztests umgesetzt; endgültige Formeln und PHP-Portierung offen; Kauf bleibt gesperrt |
| 8 Oberfläche | Lokale Vier-Schritt-Vorschau und Antwortschutz umgesetzt; WCPA-/Flatsome-Anbindung offen |
| 9/10 Warenkorb/Steuern/Gewichte/Versand | Anforderungen dokumentiert; keine aktivierte Logik oder bestandenen Shoptests |
| 11/12 Abnahme/Veröffentlichung | Nicht begonnen; separate Freigabe erforderlich |

## Weiterhin erforderliche Unterlagen

1. Speedmaster-Originalzeichnungen für L1–L4/U1–U4 mit Eckvarianten, Maßbezug und Einzelteilen. Frühere Screenshots in der referenzierten Unterhaltung sind über den lesbaren Gesprächsabruf nicht als Geometrienachweis zugänglich. Die hier verfügbaren Backend-Bilder zeigen keine solchen Lieferantengeometrien. Vorhandene Dateien genügen; keine neue Preisabfragerunde nötig.
2. Belegte Material-/Verpackungsgewichte und vollständige Dekorverfügbarkeit samt Bildern/Favoriten.
3. Versionierte Preisregeln aus dem parallel geführten Chat. Ein exakter Referenzpunkt legitimiert keinen umliegenden Bereich.
4. Erst für Integration: isolierte Shopkopie beziehungsweise passende Plugin-/Theme-Dateien, vollständige Steuertabellen und Versandregionen. Keine Passwörter in Entwicklungsdateien.

## Spätere Integrationstests mit Marco

- Getrennte Dateien/DB/Cache, Zugriffsschutz, noindex, Mail-Abfang, Testzahlungen, keine realen Sendcloud-Aufträge/Webhooks/Jobs; Wiederherstellung testen.
- PHP-Portierung gegen dieselben unabhängigen Maß-, Geometrie- und Geldsollwerte; WCPA 3.9.8 konkret prüfen, keine geratenen Hooks. Eigene neue Entwurfsprodukte und eigene Formular-IDs; produktbezogene Assets/Filter, MU-Ausfallschutz.
- Sämtliche bestätigten Lieferantengeometrien: Teile ohne Überlappung/Lücken, passende Stoßpaare, Außen-/Innen-/Stoßkanten, Fertigmaßbezug und tatsächliche Versandteillängen; Sondermaße und Grenzen.
- Servervalidierung bei Add-to-cart, Session-Restore, Mengenwechsel und Checkout inklusive Expresspfaden. Manipulierte Clientpreise, zwei Konfigurationen desselben Produkts, alte Regelversion und wiederholte Summenberechnung.
- Bruttoeingabe des Shops: Basissteuer genau einmal, tatsächliche Zieladresse/OSS/Schweiz/Abholung, Zwischensummenrundung, Rabatt und aktive Währungen. Lokaler DE-Beispielwert ersetzt keinen Steuerintegrationstest.
- Interne Bezugskosten 10/60 € pro Einheit, 120 € bei zwei langen Einheiten; regulärer Kundenversand zusätzlich. Gewichte nur aus bestätigten Daten, Mengen einmal anwenden, Mischkorb mit Sockel unverändert. Alle Flexible-Shipping-Grenzen beidseitig und exakt, Modus Summe, tatsächliche DE-Zone.
- Woo-/Flatsome-/Germanized-Ausgabe, Mini-Warenkorb, Bestelldaten/E-Mails, unveränderliche Snapshots, WP-Rocket/JS-Verzögerung; 360/390/768/1280 px und Tastatur.
- Sockel 999985/Formular 999984, beide aktiven Snippets und mindestens ein Standardprodukt vor/nach neuer Erweiterung vergleichen. Keine Bestandsänderungen zur Fehlerbehebung ohne gesonderte Entscheidung.
- Kauf bei deaktiviertem Plugin/WCPA oder fehlenden Daten verhindern. Erst danach Abnahme, vollständige Auslieferungsdateien und gesonderte Veröffentlichung.
