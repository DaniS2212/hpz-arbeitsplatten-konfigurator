# Küchenarbeitsplatten Konfigurator Implementierungsplan

## Aktuelle Ausführungsanpassung – lokale Entwicklung

Der Nutzer hat die Staging-Einrichtung zurückgestellt und die vom Liveshop unabhängige Entwicklung ausdrücklich beauftragt. Der HostPress/Plesk-Zugang liegt bei Marco. Damit entfällt Staging als Voraussetzung für isolierte Fachlogik-, SVG- und lokale HTTP-Tests; es bleibt Voraussetzung für Shop-Integration und Veröffentlichung. Die ursprüngliche Reihenfolge weiter unten gilt weiterhin für die tatsächliche WooCommerce-Anbindung.

Lokaler Entwicklungsstand: `implementation/apl/local/` enthält einen eigenständig startbaren Vier-Schritt-Konfigurator, Normalisierung, dynamische SVG-Familienskizzen, private modulare Referenzpreisengine und 38 bestandene automatisierte Tests. Die neun IDs sind registriert; L1–L4/U1–U4 bleiben ohne Originalzeichnungen nicht zugeordnete Familienskizzen, keine abgeschlossenen Lieferantengeometrien. Alle Käufe bleiben gesperrt. Kein PHP-Plugin, keine WCPA-Formulare oder Shop-Produkte installiert. Details und restliche Integrationstests: `implementation/apl/docs/local-development.md`.

Diese Aktualisierung ersetzt frühere Aussagen „Aufgaben 2–12 nicht begonnen“ und „erst Staging vor jeder Codearbeit“. Sie erklärt keine Aufgabe mit noch fehlenden Lieferanten-/Shopnachweisen pauschal für abgeschlossen. Die endgültige Architektur PHP + WCPA bleibt bestehen; Node dient ausschließlich der lokalen Entwicklung und wird nicht auf den Shop übertragen.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for the proposed inline execution, or superpowers:subagent-driven-development if the user selects delegation. Execute task-by-task only after plan approval. Steps use checkbox syntax for tracking.

**Ziel:** Drei eigenständige WooCommerce-Produkte mit WCPA-Auswahl, millimetergenauer technischer Vorschau und ausschließlich serverseitig freigegebenen Konfigurationen und Preisen.

**Architektur:** WCPA Pro stellt Felder, Bildkacheln, Bedingungen und vorhandene geeignete Darstellungsfunktionen bereit. Eine eigene, auf die drei neuen Produkte begrenzte Erweiterung ergänzt Geometrie, SVG, verbindliche Preise, Warenkorb-/Bestellprüfung und Versandabgrenzung. Vorhandene Shop-Produkte und Konfiguratoren werden nicht bearbeitet.

**Technik:** Bestehendes WordPress/WooCommerce/WCPA Pro/Flatsome; eigene PHP-Erweiterung mit kleinem JavaScript-/SVG-Frontend. Vorgesehen sind PHPUnit für Fachlogik und WooCommerce-Integration sowie Playwright für Browserabläufe. Kompatible Werkzeugversionen werden erst nach Prüfung der tatsächlichen PHP-/Shop-Versionen festgelegt.

**Spezifikation:** [Freigegebene technische Spezifikation](../specs/2026-10-19-kuechenarbeitsplatten-design.md).

**Status:** Vom Nutzer freigegeben; Ausführung Aufgabe für Aufgabe in dieser Unterhaltung, ohne Unteragenten. Aufgabe 1 ist begonnen. Staging-Erstellung und produktive Veröffentlichung werden ausdrücklich gesondert abgestimmt und sind durch die Planfreigabe nicht autorisiert. Fehlende Lieferantendaten und Backend-Nachweise bleiben explizite Sperren. Es wurden keine Testumgebung und keine Produkte angelegt.

## Verbindliche Rahmenbedingungen

- Produkte: **Arbeitsplatte Gerade**, **Arbeitsplatte L-Form**, **Arbeitsplatte U-Form**; jeweils ein einfaches Produkt mit eigenen Formularzuordnungen.
- Geometrien: Gerade, L1–L4, U1–U4; alle zugehörigen zulässigen Abrundungen, Abschrägungen, „eckig“ und „Kante durchlaufend“.
- Kundenmaße in cm mit 0,1-cm-Schritten; intern ganze mm. Feste Material-/Kantenstärken dürfen halbe mm enthalten.
- Nur APL 17,5 mm beidseitig Schichtstoff und APL 38 mm; Dickkante 1,5 mm dekorgleich gemäß bestätigter Kantenmatrix, gerade Platte einschließlich Hinterkante. Stoßbearbeitung separat.
- Nettoverkauf je Arbeitsplatte = freigegebener Lieferanten-Nettopreis × 1,30 + 10 € + gegebenenfalls einmal 50 € bei mindestens einem tatsächlichen Einzelteil ab 1.900 mm. Die 10/50 € sind interne Bezugskosten Speedmaster → Holz-Liebling, je Einheit. Zusätzlich berechnet WooCommerce den Kundenversand Holz-Liebling → Endkunde nach bestehenden Flexible-Shipping-Regeln. Keine Versandbefreiung oder Nullsetzung für neue Arbeitsplatten.
- APL38: normale Breitenstaffel bis 880 mm, große Staffel ab 881 mm. Die maßgebliche Teilbreite muss geometriespezifisch belegt sein.
- Für den deutschen Standardfall 19 % Umsatzsteuer genau einmal über die vorhandene WooCommerce-Steuerkonfiguration; keine globale Umstellung.
- Nur belegte Geometrie, freigegebene Material-/Dekorkombination und gültiger Preisbereich zusammen erlauben den Kauf.
- Eigene Produkt-ID-Liste, Formulare und Assets; keine Bearbeitung bestehender Produkte, Formulare, Theme-Dateien oder globaler WCPA-Einstellungen.
- Kein Überschreiben synchronisierter Dateien unter `sources/`. Neue Entwicklungsdateien entstehen außerhalb dieses Verzeichnisses.
- Erst Staging, anschließend dokumentierte Abnahme. Jede produktive Installation oder Veröffentlichung benötigt eine separate ausdrückliche Freigabe.

## Besonders zu prüfende Fehlerfälle

1. Zwei unterschiedliche Konfigurationen desselben Produkts dürfen Preise und Maße nicht gegenseitig überschreiben (Aufgabe 9).
2. Eine ältere Preisantwort nach schnellem Formwechsel darf keinen veralteten Preis kaufbar machen (Aufgabe 8).
3. Wiederhergestellte Warenkörbe mit alter Regelversion müssen neu geprüft werden; fertige Bestellungen bleiben unverändert (Aufgabe 9).
4. Gemischte Warenkörbe müssen das gesamte korrekte Gewicht an Flexible Shipping übergeben; interne Bezugskosten ersetzen Kundenversand nicht. Preisrabatte folgen geprüften bestehenden Regeln (Aufgabe 10).
5. Fehlende oder deaktivierte Erweiterung darf die drei neuen Produkte nicht zu ihrem technischen Grundpreis bestellbar machen (Aufgaben 3, 11).

## Unterlagen für den Start

**Aktueller Eingang:** Systembericht, Sockelformular, Produkt-/Steuer-/Versandscreenshots und beide aktiven Snippets sind ausgewertet; siehe `implementation/apl/docs/backend-final-evidence.md`. Sockelprodukt 999985 (14,60 € brutto, Standardsteuer, keine Versandklasse) ist direkt Formular 999984 zugeordnet. Die zwei Snippets sind ausschließlich Darstellung für dieses Produkt. Bruttoeingabe, Lieferadresssteuer, Zwischensummenrundung und drei gewichtsabhängige Nettoversandtarife sind belegt. Die folgende Tabelle beschreibt den Gesamtbedarf, keine erneute Anforderung bereits erhaltener Dateien. Noch konkret offen: vollständige Mitteleuropa-Regionen für DE-Zuordnung, Steuersatztabellen/OSS-Auslandsregeln, Gewichtsgrundlagen und isolierte Staging-URL/Zugang. Versionsgenaue WCPA-Hooks und Theme-/SkyVerge-Wirkung werden auf der Testkopie geprüft. Die WCPA-Lizenzmeldung aus den Screenshots wird bei der Testumgebungsplanung berücksichtigt, ohne die Live-Lizenz zu verändern.

| Benötigt | Konkreter Inhalt | Verwendet in |
|---|---|---|
| WooCommerce-Systemstatus | WordPress/PHP/WooCommerce/WCPA-Pro/Flatsome-Versionen, aktive Plugins, HPOS, Template-Overrides | 1–3, 9 |
| WCPA-Exporte | Vollständige Sockelformulare, eventuell vorhandene Arbeitsplattenformulare und einschlägige globale Formulare: Feld-IDs, Werte, Bilder, Formeln, Bedingungen, Validierungen, Darstellung | 1, 3 |
| WCPA-Einstellungen | Globale und produktspezifische Preis-, Steuer-, Gebühren-, Warenkorbeinstellungen; Produkt-/Kategoriezuordnungen und Ausschlüsse | 1, 3, 9 |
| Sockel-Referenz | Produkt-ID/URL, Produkttyp, Grundpreis, Steuerklasse, Versandklasse, Formularzuordnung | 1, 11 |
| Zusatzcode | Relevante aktive Snippets mit Ausführungsbereich, eigene Plugins/MU-Plugins, Child-Theme-functions.php, zugehörige JS-/CSS-Dateien und WooCommerce-Overrides | 1, 3, 9–10 |
| Steuern/Versand | Netto-/Bruttoeingabe, Rundung, Steuersätze/-klassen, Versandzonen/-methoden/-klassen, Formeln, Gebühren, Freigrenzen, einschlägige Plugins | 1, 7, 10 |
| Shop-Abläufe | Warenkorb-/Checkout-Seiten: Blocks oder klassische Umsetzung; Germanized- und Cache-/Minify-/JS-Verzögerungseinstellungen; relevante Rabattregeln | 1, 8–11 |
| Staging | URL, Aktualität, Hosting-/Dateizugriff für spätere Testinstallation, isolierte Testzahlung und E-Mail-Abfangmöglichkeit | 2 |
| Speedmaster-Unterlagen | Vorhandene Zeichnungen samt Form-/Materialzuordnung, Sondermaßen, Verbindungen, Einzelteilen und Kantenbezug; gezielte Ergänzungen nur bei Lücken | 4–5 |
| Dekore | Bestätigte Verfügbarkeit pro Form/Material, Code/Name/Oberfläche, nutzbare Bilder, Auswahl der zwölf Startdekore | 6 |
| Preisübergabe aus anderem Chat | Versionierte Regeln und Referenzfälle im unten beschriebenen Format | 7 |

Ein Exportpaket genügt zunächst. Falls WCPA keinen vollständigen Export anbietet, sind vollständige Ansichten der Einstellungen oder lesende Einsicht erforderlich. Ein normaler Produkt-CSV-Export oder WooCommerce-REST-Leseschlüssel allein deckt WCPA und Zusatzcode nicht ab. Ein lesender Zugang muss ausdrücklich zum Zielshop gehören. Staging benötigt erst zur genehmigten Umsetzung Schreibrechte. Passwörter, Lizenzschlüssel und Kundendaten gehören nicht in diese Dokumente; eine komplette Kundendatenbank ist nicht erforderlich.

## Vorgesehene Dateien und Schnittstellen

Alle folgenden Pfade sind **neu geplante**, noch nicht vorhandene Dateien relativ zum Projekt. Vorhandene Shop-Dateien werden nur als Referenz gelesen. Der spätere Plugin-Ordner wird als ZIP ausgeliefert, WCPA-Formulare als separate Exporte mit Zuordnungsanleitung.

| Pfad | Verantwortung |
|---|---|
| `implementation/apl/docs/baseline.md`, `staging.md`, `integration-contract.md` | Bestandsaufnahme, Testumgebung, verifizierte WCPA-/WooCommerce-Anbindung |
| `implementation/apl/docs/geometry-register.csv` | Quellen, Prüfstatus und Gültigkeitsbereiche sämtlicher Formen/Varianten |
| `implementation/apl/forms/straight.json`, `l.json`, `u.json`, `field-map.json` | Native WCPA-Exporte und Mapping logischer Felder auf tatsächliche IDs |
| `implementation/apl/plugin/hpz-apl/hpz-apl.php`, `src/Bootstrap.php` | Pluginstart, Abhängigkeiten, Registrierung, Versionsprüfung |
| `implementation/apl/plugin/hpz-apl/src/Config.php`, `Normalizer.php` | Konfigurationstyp und exakte cm-zu-mm-Normalisierung |
| `implementation/apl/plugin/hpz-apl/src/WcpaAdapter.php` | Ausschließlich verifizierte WCPA-Ereignisse, Feldmapping und lokale Preisneutralisierung |
| `implementation/apl/plugin/hpz-apl/src/Geometry.php`, `GeometryResult.php` | Konturen, Bemaßung, Einzelteile, Kanten, Stoßpartner, Versandlängen |
| `implementation/apl/plugin/hpz-apl/data/geometry/{straight,L1,L2,L3,L4,U1,U2,U3,U4}.json` | Je eine geprüfte Grundformdefinition samt gültigen Varianten und Quellen |
| `implementation/apl/plugin/hpz-apl/src/Availability.php`, `data/decors.json` | Material-/Dekor-/Formfreigaben und Startauswahl |
| `implementation/apl/plugin/hpz-apl/src/SupplierPriceProvider.php`, `PriceEngine.php`, `Quote.php`, `data/prices.php` | Lieferantenpreisadapter, Versionen, Aufschläge, serverseitige Preisregeln mit Schutz vor direktem Aufruf |
| `implementation/apl/plugin/hpz-apl/src/PreviewEndpoint.php` | Validierte Vorschau mit Verkaufspreis und Geometrie, ohne Einkaufspreise |
| `implementation/apl/plugin/hpz-apl/assets/configurator.js`, `drawing.js`, `configurator.css` | Schritte, Antwortreihenfolge, SVG, mobil begrenzte Styles |
| `implementation/apl/plugin/hpz-apl/src/CartBridge.php`, `OrderSnapshot.php`, `ShippingBridge.php`, `WeightProvider.php` | Warenkorbprüfung, Bestellsicherung und belegtes Konfigurationsgewicht für bestehenden Kundenversand |
| `implementation/apl/guard/hpz-apl-guard.php` | Kleiner separat ausgelieferter MU-Schutz gegen Verkauf bei fehlender Haupterweiterung |
| `implementation/apl/tests/`, `composer.json`, `phpunit.xml`, `package.json`, `playwright.config.js` | Isolierte Testwerkzeuge; keine zusätzlichen Laufzeitframeworks im Shop |
| `implementation/apl/docs/acceptance.md`, `release.md` | Ergebnisse, offene Punkte, Installations- und Rücknahmeverfahren |

`Config` enthält Produkt-ID, Formfamilie, Geometrie-ID, Eckvariante, erlaubte Maße als mm, Material-ID, Dekor-ID und Schemaversion. `GeometryResult` enthält Außenkontur, Bemaßungsanker, Teilkonturen, Kanten-/Stoßzuordnung, Versandlänge je Teil, Regelversion und Freigabestatus. Geld wird als exakte Dezimalzeichenfolge verarbeitet; Aufschläge mindestens mit vier Nachkommastellen, Rundung erst an der festgelegten WooCommerce-Grenze. `Quote` enthält kanonischen Konfigurationshash, Versionen, Nettostückpreis und Freigabestatus. Interne Lieferantenkosten gelangen nicht in die öffentliche Antwort.

Die JSON-Definitionen enthalten deklarative Daten und erlaubte Operationen, keinen ausführbaren PHP-/JavaScript-Text. Preisregeln aus dem anderen Chat werden nicht per `eval` ausgeführt. Freigegebene private Preisregeln werden als geprüfte PHP-Datentabelle in `data/prices.php` mit Direktaufrufschutz ausgeliefert, nicht als öffentlich abrufbare JSON-Datei im Plugin-Verzeichnis. Der HTTP-Direktaufruf darf weder Einkaufspreise noch Formeln ausgeben; auch öffentliche APIs und Protokollausgaben dürfen diese nicht offenlegen.

## Ausführungsreihenfolge

1 → 2 → 3 bildet die geprüfte Integrationsbasis. Danach folgen 4 → 5 → 6 → 8 für Geometrie und Bedienung. Aufgabe 7 kann nach Eingang der Preisregeln abgeschlossen werden; bis dahin werden ausschließlich als Testdaten gekennzeichnete Preisadapter benutzt. Aufgaben 9 und 10 benötigen 7 und 8. Anschließend 11 und 12. Alle Arbeitsschritte erfolgen erst nach Planfreigabe.

Für Codeaufgaben gilt: benannte Tests zuerst anlegen, deren fachliches Scheitern dokumentieren, minimal implementieren, Tests erneut ausführen, Änderung prüfen und im Entwicklungsrepository committen. Fehlende Entwicklungswerkzeuge oder Daten gelten nicht als erfolgreicher negativer Test. Ein Test gilt nur mit ausgeführtem Ergebnis als bestanden. Entwicklungsrepository und isolierter Arbeitsbereich werden bei Ausführungsbeginn festgelegt; die Planerstellung legt sie noch nicht an.

## Aufgabe 1 — Bestehende Integration lesend erfassen

**Dateien:** `implementation/apl/docs/baseline.md`, `integration-contract.md`.

**Schnittstelle:** Liefert `integration-contract.md` mit tatsächlichen Versionen, Formularzuordnungen, WCPA-Feldänderungsereignis, Preisinteraktion, Warenkorb-/Checkout-Pfaden und kollidierenden Erweiterungen. Diese Fakten werden nicht aus Frontend-Versionsstrings allein abgeleitet.

- [x] Exportpaket und Screenshots abgleichen; Befunde sowie verbleibende Voraussetzungen in `implementation/apl/docs/backend-final-evidence.md` protokolliert. Keine Laufzeitabnahme damit behauptet.
- [ ] Sockel und ein Standardprodukt als lesende Ausgangsbasis dokumentieren: Formularwerte, sichtbare Preise und bestehende Regeln. Keine Live-Testbestellung auslösen.
- [ ] Anhand verfügbarer Plugin-Dateien und Einstellungen die WCPA-Adapterpunkte und Reihenfolge der Preisberechnung bestimmen; die exakten API-/Hook-Namen im Vertrag festhalten.
- [ ] Block-/klassischen Checkout, Steuereingabebasis und Versandabhängigkeiten bestimmen. Erforderliche Unterstützung folgt der vorhandenen Shop-Technik, kein globaler Checkout-Umbau.
- [ ] Ergebnis prüfen: keine unbekannte Preisüberschreibung oder ungeklärte globale Formularzuordnung vor Aufgabe 3. Bei Konflikten einen produktspezifischen Lösungsweg dokumentieren; erforderliche Änderung bestehender Konfigurationen separat zur Entscheidung vorlegen.

**Abnahme:** Ausgefüllter Integrationsvertrag und eindeutiger Zielshop; kein Schreibzugriff nötig.

## Aufgabe 2 — Isoliertes Staging und wiederherstellbare Ausgangsbasis

**Datei:** `implementation/apl/docs/staging.md`.

**Schnittstelle:** Liefert getestete Staging-URL, Versionsstand, Wiederherstellungspunkt und Testdatenzugang für alle weiteren Aufgaben.

- [ ] Vorhandene aktuelle Staging-Kopie prüfen; eine neue Kopie erst nach gesonderter Abstimmung und ausdrücklicher Freigabe erstellen. Datenbank, Dateipfade, Cache und externe Verbindungen dürfen keine Live-Ressourcen beschreiben.
- [ ] Vor erstem Anwendungstest reale Zahlung, Kunden-E-Mails, Lieferanten-/Fulfillment-Aufträge und schreibende Webhooks unterbinden; Testzahlungen und Mail-Abfang aktivieren. Personenbezogene Daten auf notwendige Testdaten reduzieren.
- [ ] Zugriffsschutz und Suchmaschinen-Ausschluss prüfen; Staging darf kein öffentlich bestellbarer Shop sein.
- [ ] Sicherung und Wiederherstellung auf Staging testen; einen Testauftrag ausschließlich gegen Testsysteme durchführen.
- [ ] Vorher-Zustand von Sockel/Standardprodukt samt Preisen, Zuordnungen und Regeln sichern.

**Abnahme:** Nachgewiesene Isolation und Wiederherstellbarkeit; andernfalls keine Installation neuer Formulare oder Erweiterungen.

## Aufgabe 3 — Drei Produkte und minimale WCPA-Anbindung

**Dateien:** alle `forms/*`, `hpz-apl.php`, `Bootstrap.php`, `Config.php`, `Normalizer.php`, `WcpaAdapter.php`, `guard/hpz-apl-guard.php`; `tests/NormalizerTest.php`, `ScopeTest.php`, `WcpaContractTest.php`; Testkonfigurationen.

**Schnittstellen:** `Normalizer::fromWcpa(int $productId, array $fields): Config`; `WcpaAdapter::read(array $request): Config`; `Bootstrap::supportsProduct(int $id): bool`. Ungültige Eingaben liefern definierte Validierungsfehler. Mapping und zulässige Produkt-IDs werden serverseitig gespeichert.

- [ ] Tests zuerst: `cmCommaAndDot` erwartet für „88,1“/„88.1“ genau 881 mm; `rejectExtraPrecision` verwirft „88,11“, Arrays, Exponentialschreibweise und nichtendliche Werte. `scopeIsolation` erwartet unveränderte Behandlung einer fremden Produkt-ID.
- [ ] `vendor/bin/phpunit --filter 'NormalizerTest|ScopeTest|WcpaContractTest'` aus `implementation/apl` ausführen und fachliches Scheitern vor Implementierung belegen.
- [ ] Drei neue einfache Produkte nur auf Staging als Entwürfe erstellen. Eigene WCPA-Formulare anlegen; native Zahlen-, Bild-, Auswahl- und Bedingungsfelder verwenden. Material/Geometrie/Dekor haben stabile logische IDs. Bestehende Formulare nicht kopierend mit identischen aktiven Feld-IDs verknüpfen.
- [ ] Nur diese neuen Formulare preisneutral konfigurieren; eigener Adapter liefert den Endpreis. Native WCPA-Schritte nutzen, falls die installierte Version sie passend unterstützt; andernfalls ergänzt nur `configurator.js` die Navigation.
- [ ] Normalisierung und Adapter nach dem geprüften Integrationsvertrag implementieren; Client-Produktfamilie, Preise oder versteckte Felder dürfen die serverseitige Zuordnung nicht überschreiben.
- [ ] Separaten MU-Schutz für genau diese Produkt-IDs vorbereiten: bei fehlender Haupterweiterung oder Freigabe keine Kaufbarkeit. Keine bestehenden MU-Dateien bearbeiten. Hauptplugin-Deaktivierung auf Staging testen, einschließlich direktem Warenkorbzugriff; beim vollständigen Entfernen muss die Rücknahme zuerst die Produkte sperren.
- [ ] Dieselben Tests bestehen lassen, WCPA-Vertrag zusätzlich auf Staging prüfen und neue Produkt-/Formular-IDs dokumentieren. Änderung committen.

**Abnahme:** Drei isolierte Formulare, noch keine ungeprüfte Konfiguration kaufbar; Sockel-/Standardprodukt-Bestand unverändert.

## Aufgabe 4 — Alle Speedmaster-Geometrien fachlich zuordnen

**Dateien:** `docs/geometry-register.csv`, `data/geometry/{straight,L1,L2,L3,L4,U1,U2,U3,U4}.json`, `tests/fixtures/geometry/`.

**Schnittstelle:** Jede Definition liefert ID, Materialbezug, Varianten, Pflicht-/Sondermaße, Messbezug, erlaubte Bereiche, Teile-/Stoßregeln und Quellen. Status je Variante: ungeprüft, teilweise belegt, freigegeben.

- [ ] Vorhandene Zeichnungen den neun Grundformen zuordnen. Je Form Abrundungen, Abschrägungen, eckige und durchlaufende Ausführungen ausdrücklich auflisten; unzulässige Kombinationen kennzeichnen, keine pauschalen Kreuzprodukte erzeugen.
- [ ] Je Variante Teilnummern, Fertigmaßableitungen, Stoßpartner/Bearbeitung, Außenkanten und relevante Versandlänge ermitteln; Gesamt-/Teil-/Verpackungsmaß getrennt halten.
- [ ] Unklare Maße oder Kanten mit konkretem Quellenverweis bündeln und nur fehlende Detailansichten anfordern. Vorhandene Postforming-Darstellungen nicht als Dickkantennachweis verwenden.
- [ ] Mindestens Normalfall, Grenzfälle und asymmetrische Maße pro Variante fachlich herleiten und als unabhängige Sollwerte in Testfixtures speichern. Beispielwerte nicht aus der späteren Berechnungsfunktion erzeugen.
- [ ] Fachlichen Nachweis je Variante abschließen. Fehlende Varianten bleiben sichtbar im Register offen; die vollständige Zielumsetzung ist damit noch nicht abgeschlossen.

**Abnahme:** Jede vereinbarte Variante ist erfasst; freigegebene Fälle haben nachvollziehbare Maß-/Teile-/Kantennachweise. Keine geschätzten Stoßregeln.

## Aufgabe 5 — Geometrieengine und millimetergenaue SVG-Daten

**Dateien:** `Geometry.php`, `GeometryResult.php`, `assets/drawing.js`; `tests/GeometryTest.php`, `tests/browser/drawing.spec.js`.

**Schnittstellen:** `Geometry::evaluate(Config $config): GeometryResult`; `renderDrawing(svgElement, geometryResult, activeField): void`.

- [ ] `GeometryTest` gegen die unabhängigen Fixtures aus Aufgabe 4 schreiben: Außenkontur, Einzelteile, Stoßpaarung, Versandlänge und freigegebene Bereiche müssen exakt übereinstimmen. `unverifiedVariant` muss Kauf-Freigabe verweigern; unmögliche Restbreiten, sich schneidende Konturen und ungültige Radien werden verworfen.
- [ ] `vendor/bin/phpunit --filter GeometryTest` vor Implementierung ausführen.
- [ ] Geometrie aus ganzzahligen Eingabemaßen ableiten. Rundungen als mathematische Bögen statt grober Pixelpolygone beschreiben; feste halbe Millimeter nicht abschneiden. Fertigmaßanzeige darf nicht aus Bildpixeln zurückgerechnet werden.
- [ ] Server liefert Kontur, Stoßlinien und Bemaßungsanker. SVG rendert daraus proportional mit `viewBox`; Maße und aktive Feldhervorhebung bleiben unabhängig von Bildschirmgröße korrekt. Bemaßung zeigt cm mit einer Nachkommastelle und damit 1-mm-Auflösung.
- [ ] `drawing.spec.js`: Änderung 200,0 → 200,1 cm muss Maßlabel und Geometrie um exakt 1 mm ändern; Stoßlinien, Radien und Schrägen für jede freigegebene Variante sichtbar prüfen. Keine Fertigungstoleranz aus Bildschirmauflösung ableiten.
- [ ] PHPUnit und `npx playwright test tests/browser/drawing.spec.js` bestehen lassen; Änderungen committen.

**Abnahme:** Alle belegten Form-/Eckvarianten werden korrekt und dynamisch dargestellt; serverseitige Teileliste und Zeichnung verwenden dieselben Daten.

## Aufgabe 6 — Material- und Dekorfreigaben

**Dateien:** `Availability.php`, `data/decors.json`, neue WCPA-Formulare; `tests/AvailabilityTest.php`.

**Schnittstellen:** `Availability::assertAllowed(Config $config, GeometryResult $geometry): void`; `Availability::options(Config $config): array` liefert ausschließlich zulässige Kundenoptionen.

- [ ] `AvailabilityTest`: Compact/Keramik, unbekannter Dekorcode und nur für U1 belegte Kombination bei L2 werden abgewiesen. Freigegebene Kombination erscheint; bei weniger als zwölf Dekoren erscheinen keine Platzhalter oder fremden Dekore.
- [ ] Test vor Implementierung ausführen: `vendor/bin/phpunit --filter AvailabilityTest`.
- [ ] Zwei Materialien und belegte Dekor-/Form-/Maßabhängigkeiten einpflegen; zwölf Startdekore gemeinsam aus der bestätigten Auswahl festlegen. Bildrechte und Oberflächenbezeichnung dokumentieren.
- [ ] WCPA-Bildkacheln verwenden, „Alle Dekore anzeigen“ ergänzt die restlichen verfügbaren Optionen. Material-/Formwechsel invalidiert ein inkompatibles Dekor mit verständlicher Meldung.
- [ ] Test bestehen lassen und Formular-/Datenänderungen committen.

**Abnahme:** Verfügbarkeit wird serverseitig durchgesetzt; die 17 beobachteten U1-Dekore werden nicht global angenommen.

## Aufgabe 7 — Preisadapter und Übernahme aus dem anderen Chat

**Dateien:** `SupplierPriceProvider.php`, `PriceEngine.php`, `Quote.php`, `data/prices.php`; `tests/PriceEngineTest.php`, `tests/fixtures/prices.json`.

**Schnittstellen:** `SupplierPriceProvider::net(Config $config, GeometryResult $geometry): string` liefert den freigegebenen Lieferanten-Nettopreis oder einen Fehler für nicht gedeckte Bereiche. `PriceEngine::quote(Config $config, GeometryResult $geometry): Quote` ergänzt Aufschlag und interne Bezugskosten, niemals den Kundenversand. Steuerumrechnung erfolgt an der WooCommerce-Grenze in Aufgabe 9.

**Verbindliches Übergabeformat:** Version/Datum, Form- und Varianten-IDs, Material, Dekor-/Profilbezug, Maßvariablen und Einheiten, Bereichsgrenzen inklusive/exklusive, relevante Teilbreite, Regel-/Tabellenbeschreibung, Netto-Referenzwerte, Herkunft, validierte Bereiche, Sicherheitsreserve und offene Bereiche. Vorhandene Referenzfälle werden unverändert übernommen. Es ist keine automatische Verbindung oder Nachricht an den anderen Chat vorgesehen.

- [ ] Tests zunächst mit eindeutig gekennzeichnetem Lieferanten-Testadapter schreiben. `markupAndFreight` erwartet bei 144,99 € und einem 2.000-mm-Teil 248,487 € netto vor Rundung. `freightThreshold` erwartet für 1.899/1.900/1.901 mm die Zuschläge 0/50/50 €; mehrere lange Teile ergeben nur 50 € je Einheit.
- [ ] `straight175_2000x700_allEdges`: W980 Platinweiß, alle Kanten 1,5 mm dekorgleich, bestätigter Lieferantenwert 165,80 € netto. Bei einem bestätigten Versandteil von 2000 mm ergeben sich 275,54 € netto und 327,89 € DE-Bruttoproduktpreis, zusätzlich regulärer Kundenversand. Unbestätigte angrenzende Maße bleiben ohne freigegebene Regel gesperrt.
- [ ] `widthTier` erwartet 879/880 mm normal und 881/882 mm groß. Mengenprüfung erwartet für zwei zuschlagspflichtige Einheiten insgesamt 120 € netto interne Bezugskosten; zusätzlicher Kundenversand wird separat in Aufgabe 10 geprüft. Test vor Implementierung: `vendor/bin/phpunit --filter PriceEngineTest`.
- [ ] Exakte Dezimalrechnung implementieren, 30 % ausschließlich auf EK, danach interne Bezugskosten addieren. Keine pauschale Quadratmeterformel, keine verdeckte Querinterpolation über Staffeln.
- [ ] Regeln aus dem anderen Chat in deklarative Preisdefinitionen übersetzen; Gültigkeitsbereiche und Versions-ID prüfen. Unbekannte Bereiche liefern „Preis auf Anfrage“, keinen Null- oder Ersatzpreis.
- [ ] Referenzsuite für Gerade 200×60, L1 200/120 und 250/120, U1 200/120/180 und 250/120/180 mit beiden Materialien aus der Spezifikation ausführen. Insbesondere L1: 342,41/511,56 €; U1: 494,03/738,59 €. Bei Näherungen akzeptierte Abweichung und Sicherheitsreserve ausdrücklich dokumentieren; kein freigegebener Vergleichsfall darf unter seinem bestätigten Lieferantenpreis liegen. Der ausgeschlossene Wert 528,20 € wird nicht verwendet.
- [ ] Grenztests 2.509/2.510/2.511 mm für APL17,5 anhand der übernommenen gültigen Regeln ergänzen; den beobachteten Sprung nicht global festschreiben. Die APL38-Teilbreite bei L/U anhand Aufgabe 4 prüfen.
- [ ] `u1ConfirmedNonMonotonicWidth`: L1/L2/L3=2500/1700/1800 mm, B2/B3=600 mm, W980 Platinweiß, Dickkante 1,5 mm. APL38 muss für B1=600/700 mm die bestätigten Lieferantenwerte 785,69/767,12 € abbilden; Differenz −18,57 €. APL17,5 erwartet 528,76/539,90 €; Differenz +11,14 €. Keine monotone Glättung, kein Ersetzen des niedrigeren bestätigten Werts durch den vorherigen höheren. Referenzpreise und tatsächliche Adapterausgaben getrennt prüfen; bei ausdrücklich freigegebenen konservativen Näherungen deren Abweichung dokumentieren, keine universelle Monotonie erzwingen. Nicht gedeckte Zwischen-/Außenbereiche bleiben gesperrt oder benötigen eine eigenständig validierte konservative Regel. Die Testfalldaten liegen zunächst dokumentarisch in `docs/price-reference-cases.csv`; ausführbare Engine-Tests folgen in Aufgabe 7.
- [ ] Testadapter und Testfixtures aus dem auslieferbaren Paket ausschließen; direkten HTTP-Aufruf der Preisdatei und öffentliche Vorschau auf fehlende Einkaufspreisdaten prüfen. Tests bestehen lassen und Preisregelversion committen.

**Abnahme:** Kaufbare Bereiche besitzen freigegebene Preisdefinitionen. Ohne endgültige Formeln kann die übrige Entwicklung fortschreiten, die Verkaufsfreigabe bleibt gesperrt.

## Aufgabe 8 — Vier Schritte und validierte Live-Vorschau

**Dateien:** `PreviewEndpoint.php`, `assets/configurator.js`, `configurator.css`; `tests/PreviewTest.php`, `tests/browser/configurator.spec.js`.

**Schnittstelle:** `PreviewEndpoint::preview(array $request): array` normalisiert über Aufgabe 3, prüft 5/6/7 und gibt Konfigurationshash, aktuelle Versionen, Geometriedaten, formatierten Verkaufspreis und Feldfehler zurück. Keine Einkaufspreise oder internen Formeln. `configurator.js` übergibt die WCPA-Werte und akzeptiert nur die Antwort zum aktuellen Eingabestand.

- [ ] Tests für fehlende Pflichtfelder, übergroße Payloads, fremde Produkt-ID, manipulierten Preis und Serverausfall schreiben. Ungeprüfte Geometrie liefert Fehler statt kaufbarer Vorschau.
- [ ] Vor Implementierung `vendor/bin/phpunit --filter PreviewTest` ausführen.
- [ ] Produktspezifischen Vorschauendpunkt mit begrenzten Eingaben und passendem Sitzungsschutz implementieren. Cache-Schlüssel enthalten Konfiguration und Regelversionen; sensible oder sitzungsabhängige Antworten dürfen nicht zwischen Kunden vermischt werden.
- [ ] Schritte Grund-/Eckform → Maße → Material → Dekor verbinden. Kompatible Werte beim Zurückgehen erhalten; inkompatible Änderungen sichtbar zurücksetzen. Kein eigenes zweites Formular neben WCPA bauen.
- [ ] Preisabfrage zeitlich bündeln; laufende ältere Anfragen abbrechen beziehungsweise anhand Anfragenummer und Konfigurationshash verwerfen. Ohne aktuelle gültige Antwort den Kaufknopf sperren.
- [ ] Browsertests für schnelle Wechsel, Rücknavigation, alle Familien, Kommaeingaben, „Alle Dekore anzeigen“, Tastatur und Ansichten bei 360/390/768/1280 px ausführen. `npx playwright test tests/browser/configurator.spec.js` und PHPUnit müssen bestehen.
- [ ] Änderungen committen.

**Abnahme:** Zeichnung, angezeigter Preis und kaufbare Konfiguration gehören immer zum selben bestätigten Eingabestand.

## Aufgabe 9 — Warenkorb, Steuern und unveränderliche Bestelldaten

**Dateien:** `CartBridge.php`, `OrderSnapshot.php`; `tests/CartOrderTest.php`, `tests/browser/checkout.spec.js`.

**Schnittstellen:** `CartBridge::validateAndPrice(Config $config): Quote`; `OrderSnapshot::build(Config $config, GeometryResult $geometry, Quote $quote): array`. Registrierung an den nach Aufgabe 1 verifizierten Pfaden; direkte Add-to-cart- und gegebenenfalls Store-API-Wege müssen dieselbe Validierung durchlaufen.

- [ ] `CartOrderTest` schreibt Fälle für manipulierte Clientpreise, zwei Konfigurationen eines Produkts, Sitzungswiederherstellung, Mengenänderung und zehn wiederholte Summenberechnungen. Der Einzelpreis bleibt stabil; Mengen werden genau einmal angewendet.
- [ ] Tests vor Implementierung ausführen: `vendor/bin/phpunit --filter CartOrderTest`.
- [ ] Konfiguration normalisiert speichern und anhand ihres Hashes Warenkorbpositionen unterscheiden. Beim Wiederherstellen und Checkout erneut Verfügbarkeit, Geometrie und Preis prüfen. Alte Preisversion führt zu sichtbarer Aktualisierung und erneuter Bestätigung vor Kauf.
- [ ] Netto kalkulieren, für die bestätigte Brutto-Eingabebasis genau einmal in Basis-Brutto überführen; WooCommerce übernimmt Lieferadresssteuer. Referenzfall DE: Produkt 295,70 € brutto vor zusätzlichem Kundenversand, kein weiterer Faktor 1,19. Test mit tatsächlicher Steuertabelle für DE, EU-Zielland, Schweiz/Drittland, Adresswechsel und Abholung; vorläufige 20-%-/0-%-Fixtures sind nur synthetische technische Tests, keine behaupteten Ländersteuersätze. Produktvorschau und Checkout müssen denselben Nettowert und Steuerkontext verwenden. Zwischensummenrundung, Menge zwei und Express-Checkout prüfen. Bestehende Shop-Steuereinstellungen nicht umstellen.
- [ ] Kundenansicht und Bestell-E-Mail mit Form, Maßen, Material, Dekor, Kanten und Preis erzeugen. Intern Teile-/Stoßzuordnung, Geometrie- und Preisregelversion sichern. Keine Einkaufskosten in öffentliche Metadaten schreiben.
- [ ] Abgeschlossene Bestellung nach Wechsel der aktiven Regeln erneut lesen: gespeicherte Maße und Preise bleiben identisch. WooCommerce-Bestellschnittstellen verwenden und die vorhandene HPOS-Konfiguration testen.
- [ ] PHPUnit und `npx playwright test tests/browser/checkout.spec.js` bestehen lassen; committen.

**Abnahme:** Keine Umgehung der Fachprüfung, kein kumulierter Aufschlag, keine Vermischung von Konfigurationen.

## Aufgabe 10 — Gewicht und regulären Kundenversand integrieren

**Dateien:** `WeightProvider.php`, `ShippingBridge.php`; `tests/WeightTest.php`, `tests/ShippingTest.php`, `tests/browser/shipping.spec.js`; Ergänzung `docs/integration-contract.md`.

**Schnittstellen:** `WeightProvider::unitKg(Config $config, GeometryResult $geometry): string` liefert ein exakt dezimales Stückgewicht aus freigegebenen Material-/Teiledaten einschließlich belegter Verpackung/Zubehör oder einen Fehler bei fehlender Grundlage. `ShippingBridge::applyUnitWeight(WC_Product $cartProduct, string $kg): WC_Product` liefert ein separates Warenkorb-Produktobjekt mit Stückgewicht. Menge wird durch WooCommerce genau einmal berücksichtigt; keine Produktstammdaten ändern. Die frühere Methode `partition` entfällt vollständig.

- [ ] `WeightTest`: bekannte Teileflächen und belegte Flächengewichte ergeben Sollgewicht; Rundungen/Schrägen korrekt berücksichtigen, keine überlappenden Flächen doppelt zählen. Zwei Konfigurationen desselben Produkts behalten eigene Gewichte. Fehlende/negative/nichtendliche Gewichte sperren den Kauf, kein Null-Fallback. Keine geschätzten Materialdichten als Freigabe verwenden.
- [ ] `ShippingTest`: interne Bezugskosten 10/60 € je Einheit bleiben im Produktpreis und erzeugen keine eigene Checkout-Gebühr. Zusätzlich wird Flexible Shipping unverändert anhand des gesamten Paketgewichts berechnet. Menge zwei bedeutet doppeltes Warengewicht plus nur sachgerecht belegte Verpackungsanteile; das Verpackungsmodell muss vorab eindeutig als Stück- oder Paketbezug definiert werden.
- [ ] Vor Implementierung `vendor/bin/phpunit --filter 'WeightTest|ShippingTest'` ausführen.
- [ ] Gewichtsgrundlagen vom Lieferanten übernehmen und serverseitige Gewichtsanbindung implementieren. Keine Versandmethode entfernen, keine Kosten auf 0 setzen, keine Arbeitsplatten allein wegen interner Bezugskosten in Sonderpakete ausgliedern. Ein material-/konfigurationsabhängiges Stückgewicht darf nicht in gemeinsamen WC_Product-Instanzen anderer Positionen landen.
- [ ] Zonenmatrix aus `docs/shipping-tax-test-cases.md` auf Staging testen: je Zone repräsentativ 2/6/12/18/24/30 kg, zusätzlich 4,5/9/16/21/28/9999 kg darunter/exakt/darüber. Im Screenshot steht „Summe“; deshalb mögliche Überlappung der Intervallgrenzen prüfen und keine First-match-Annahme treffen. Abweichungen dokumentieren und vor Veröffentlichung entscheiden, bestehende Regeln nicht automatisch korrigieren.
- [ ] Vollständige Länderzuordnung der Zone Mitteleuropa prüfen und eine deutsche Testadresse verwenden. Erst dann die tatsächliche DE-Zone als bestätigt führen. Reiner Arbeitsplattenkorb, zwei Varianten und Mischkorb mit unverändertem Sockel/Standardprodukt müssen dieselben regulären Versandregeln verwenden.
- [ ] Abholung in der passenden Zone separat prüfen: interne Bezugskosten bleiben im Produktpreis; Kunden-Abholkosten und Steuerbehandlung folgen der bestehenden Methode. Keine pauschale Annahme „Abholung = steuerfrei“. Rabatte, Adress-/Mengenwechsel und Cache-Neuberechnung testen.
- [ ] Steuer auf Kundenversand aus den als netto eingegebenen Versandtarifen genau einmal bestimmen. DE, ein tatsächliches EU-Ziel und Schweiz/Drittland anhand der freigegebenen Steuertabelle testen; fehlende Raten nicht erfinden.
- [ ] PHPUnit und `npx playwright test tests/browser/shipping.spec.js` bestehen lassen; Gewichtsdaten, Versionen und beobachtete Zonenzuordnung dokumentieren und committen.

**Abnahme:** Bezugskosten und Kundenversand bilden zwei Transportstrecken ab; normale Kundenversandkosten bleiben erhalten, Gewichte sind belegt, bestehende Produkte unverändert.

## Aufgabe 11 — Vollständige Staging-Abnahme und Regression

**Dateien:** `docs/acceptance.md`, `tests/browser/regression.spec.js`.

**Schnittstelle:** Liefert je Anforderung Testergebnis, Umgebung, Regelversion und gegebenenfalls offenen Sperrgrund.

- [ ] Alle neun Grundformen und jede registrierte zulässige Eckvariante mit beiden Materialien prüfen: Normalfall, Grenzen, ungültiger Fall, Zeichnung, Teileliste, Kanten, Versand und Preis. Fehlende Daten ausdrücklich als nicht abgenommen führen.
- [ ] Gesperrte Fälle über direkte Requests, deaktiviertes JavaScript, Sitzung und Checkout prüfen. WCPA-Ausfall und Hauptplugin-Deaktivierung müssen neue Arbeitsplatten sperren; Sockel und Standardprodukte bleiben funktionsfähig.
- [ ] Sockel- und Standardprodukt-Daten/Zuordnungen mit der Ausgangsbasis vergleichen. Auf Staging identische Konfigurationen vor/nach Aktivierung durchspielen; Preis, Formularverhalten, Versand und Checkout dürfen sich nicht ändern.
- [ ] Aktive Flatsome-/Germanized-/Cache-Einstellungen prüfen, einschließlich Minifizierung, verzögerter Skripte, Mini-Warenkorb und mobilem Checkout. Ressourcen nur auf benötigten Seiten laden; keine neuen Fehler in Browser- oder PHP-Protokollen akzeptieren.
- [ ] Gesamte Testsuite ausführen: `vendor/bin/phpunit` und `npx playwright test`. Soll: alle vorgesehenen Fälle bestanden; übersprungene oder gesperrte Fälle werden separat ausgewiesen und gelten nicht als Erfolg.
- [ ] Visuelle und fachliche Abnahme anhand Speedmaster-Nachweisen durchführen; Kunden- und interne Bestelldarstellung vergleichen. Ergebnisse und verbleibende Sperren dokumentieren.

**Abnahme:** Technisch bestandene Tests plus nachvollziehbare fachliche Freigabe. Eine Veröffentlichung nur eines Teilumfangs wäre eine neue ausdrückliche Entscheidung; der vereinbarte Gesamtumfang bleibt erhalten.

## Aufgabe 12 — Übergabepaket und späterer Veröffentlichungsentscheid

**Dateien:** `docs/release.md`, später `implementation/apl/dist/` mit Plugin-ZIP, MU-Schutz, WCPA-Exporten und Versionsmanifest.

- [ ] Vollständige ersetzbare Dateien, Formularexporte, Produkt-/Feldzuordnung und geprüfte Abhängigkeiten bündeln; keine Testadapter, Zugangsdaten oder unfreigegebenen Preisregeln ausliefern.
- [ ] Installationsfolge dokumentieren: Sicherung → MU-Schutz → Haupterweiterung → neue Entwurfsprodukte/Formulare → explizites ID-Mapping → Prüfung → erst nach separater Freigabe Veröffentlichung. Staging-IDs niemals blind in Produktion übernehmen.
- [ ] Rücknahmefolge auf Staging proben: neue Produkte sperren/ausblenden, vorhandene Arbeitsplatten-Warenkörbe sicher blockieren, Erweiterung zurücksetzen. Bestellungen und ihre Konfigurationsstände erhalten; kein globales Datenbank-Rollback über zwischenzeitliche Shop-Bestellungen.
- [ ] Abnahmebericht, offene Punkte und genaue geplante produktive Änderungen zur gesonderten Entscheidung vorlegen. Diese Aufgabe installiert oder veröffentlicht noch nichts im Liveshop.

**Abnahme:** Reproduzierbares Paket und geprüfter Rücknahmeweg. Produktive Ausführung bleibt eine getrennte Freigabe.

## Freigaben und aktueller Übergabestand

- Spezifikation: endgültig freigegeben.
- Dieser Plan: vom Nutzer freigegeben; Ausführung in dieser Unterhaltung ohne Unteragenten.
- Backend-Prüfung, Geometrienachweise, Dekorfreigaben und endgültige Preisformeln: erforderliche Eingaben beziehungsweise Arbeitsergebnisse der beschriebenen Aufgaben, noch nicht als erledigt behauptet.
- Staging-Erstellung: gesonderte Abstimmung und Freigabe erforderlich. Umsetzung auf einer Testumgebung erst nach gesichertem Zugang und bestätigter Isolation; fehlende Preisformeln blockieren davon abhängige Freigaben.
- Liveshop: keine Änderungen im aktuellen Auftrag.

Bestätigte Arbeitsweise: Umsetzung durch denselben Agenten in dieser Unterhaltung, Aufgabe für Aufgabe mit dokumentierten Tests und Zwischenprüfungen. Vorerst keine getrennten Unteragenten. Die weitere Preisermittlung verbleibt im anderen Chat.

## Selbstprüfung des Plans

Abgedeckt sind alle neun Grundformen samt Varianten, beide Materialien, Kanten-/Stoßregeln, dynamische Bemaßung, Dekorprüfung, Preisübernahme, Versandstaffeln, Steuerbasis, Warenkorb/Bestellungen, mobile Bedienung, Bestandsschutz und Rücknahme. Jede technische Schnittstelle besitzt eine definierte Verantwortung. Unbekannte Backend-Hooks und Lieferantengeometrien werden in vorgeschalteten Prüfschritten ermittelt, nicht erfunden. Die fünf besonderen Fehlerfälle sind Aufgaben mit konkreten Tests zugeordnet. Die vollständige Umsetzung ist erst mit fachlich belegten Regeln und bestandenen Staging-Tests abgeschlossen.

## Verbindliche Einbettungsergänzung – 23.10.2026

Die drei bereits vorhandenen Produktentwürfe werden wiederverwendet; keine neuen Duplikate anlegen. Bestehende Flatsome-Produktseiten samt Galerie, H1, Texten, FAQs und SEO erhalten. Konfigurator als gekapselte Komponente in eigener voller Inhaltszeile nach Einleitung/Galerie und vor Beschreibung. Familie produktbezogen vorwählen und serverseitig binden. Demo bleibt unverändert; konkrete Adapter/Hook-Auswahl erst nach Layoutprüfung. Details: implementation/apl/docs/embedding-contract.md (vom Projektstamm aus). Diese Vorgabe ersetzt frühere Planstellen, die eine Neuanlage der drei Produkte voraussetzen.

