# Status – 26.10.2026

## Aktuell: Zwischenversion 0.5.0 – geschützte V3-Preisvorschau

- Auf dem gemergten Stand von PR #4 aufgebaut. Die unveränderte PHP-Preisregel
  V3 aus PR #3 ist in das bestehende Plugin eingebunden; PR #1 und #3 wurden
  nicht pauschal gemergt. Keine neue Kalkulationsformel.
- Gerade 1000083: dynamischer, **unverbindlicher** Brutto-Referenzpreis für 16
  Dekore und beide Stärken innerhalb der V3-Grenzen. Maße, Material, Dekor,
  Ecken und Menge lösen die serverseitige Neuberechnung aus. Alte Antworten
  dürfen neue Eingaben nicht überholen. L/U bleiben ohne V3-Preis.
- Geschützter WordPress-AJAX-Endpunkt nur für Administratoren mit Bearbeitungsrecht,
  aktiven Testmodus und Entwurf 1000083 samt korrekter SKU und Nonce. Antwort
  enthält keine Lieferanten-EK oder Margen. Unbestätigte Lieferbarkeit und
  Fertigungsmaße sind ausdrücklich gekennzeichnet. Keine Bestell-API.
- Kauf- und Checkout-Sperren aus 0.4.0 bleiben wirksam; keine Produkte,
  WCPA-Formulare oder Versandregeln geändert. Kein Liveshop-Zugriff oder
  produktive Installation. UI-Anpassungen außerhalb der Preisanzeige sind für
  0.6.0 (GitHub-Issue #5) zurückgestellt.
- Vollständige lokale Prüfung: V3 **379 Assertions/72 historische EK-Fälle**,
  Preisnormalisierung **97 PHP-Assertions**, WordPress-Testmodus **18 PHP-
  Assertions**, Komponenten-/Paket-/HTTP-Regression **100 Node-Tests**; alle
  bestanden. PHP-Testharness ist keine echte WordPress-/Flatsome-Installation.
  Browser: Preiswechsel bei Maß, Menge und Dekor, gesperrter Kaufbutton,
  Desktop- und 390-px-Mobilansicht geprüft. Nachweise in `docs/phase-050.md`,
  `docs/050-tests.md`, `docs/050-desktop-preis.png` und
  `docs/050-mobile-preis.png`.
- ZIP: `dist/hpz-apl-admin-preview-0.5.0.zip`, 57 Einträge bytegleich geprüft,
  SHA-256 `227C356BA9FDCFF16C9A853E1C0480E9D0BEF0374CEC92CA2014A926C07D5B15`.
  PR zur Prüfung wird in diesem Meilenstein erstellt; kein Merge.

Die folgenden Abschnitte dokumentieren frühere Versionen.

## Aktuell: Zwischenversion 0.4.0 – 16 echte Dekorbilder

- Basis: PR #2 vom Nutzer gemergt (`4f24337`). Neuer Featurebranch
  `feature/dekorbilder-040`. Vorbereitete Zuordnungen aus PR #1 / `8064a5a`
  übernommen; PR #1 nicht gemergt oder verändert. [PR #4 zur Prüfung](https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator/pull/4)
  geöffnet, kein Merge. Implementierungscommit `a9050ca`.
- Alle 16 vereinbarten Dekore mit kurzen Kundennamen und großen echten Bildkacheln
  integriert. Keine Hersteller-/Artikelnummern in der Kundenanzeige, keine Filter.
  Ausgewähltes Bild auch in SVG-Planung, Vergrößerung und Eckdetails.
- Unveränderte 16 Originale und Manifest unter `docs/references/decor-images/`;
  32 WebPs bytegleich übernommen und im Plugin gebündelt. Keine externen Dienste.
- Interne ID, Kundennamen und Lieferantencodes getrennt. Lokaler HTTP-Server
  validiert alle IDs und leitet den Lieferantencode selbst ab; manipulierte Codes,
  Namen oder Bild-URLs bestimmen keine Zuordnung. PHP-Katalogresolver mit aus
  derselben Quelle generierter Zuordnung vorbereitet; keine neue Bestell-API.
- Durchgehende Du-Ansprache, „Deine Arbeitsplatte konfigurieren“. Desktop: drei
  Bildspalten und vorhandene Zusammenfassung unter der Vorschau im Oberflächenschritt;
  mobil zwei Bildspalten, Reihenfolge Vorschau/Auswahl/Zusammenfassung. Normale
  Form-/Maßansicht und Desktop-Breite erhalten. Keine doppelten Kauf-/Formbereiche.
- Tests: 95 Node-Tests bestanden (bisherige 85 erhalten), ein reiner PHP-
  Laufzeittest mangels PHP ausdrücklich übersprungen. 65 neue Dekor-Browserprüfungen
  (alle Dekore auf allen drei Produktseiten) und zwölf neue Dekor-Layoutfälle
  (Gerade/L/U × 360/390/1366/1440 px) bestanden. Ebenso alle bisherigen
  46 A1-Funktions-, zwölf Eck-Layout-, vier Basis-Layout- und zwölf Lebenszyklus-
  Prüfungen. Belege: `docs/040-node-results.txt`, `docs/040-browser-results.txt`.
- Screenshots: `docs/040-desktop-dekore.jpg`, `040-desktop-granit.jpg`,
  `040-mobile-dekore.jpg`, `040-mobile-vorschau.jpg`, `040-mobile-eckdetail.jpg`.
  Lokale Paketansicht; Mobil unskalierter 390×844-iframe, kein physisches Gerät.
- Paket: `dist/hpz-apl-admin-preview-0.4.0.zip` mit INSTALLATION.md und
  DEKORE-0.4.0.md. 54 Einträge mit den Plugin-Dateien bytegleich geprüft,
  darunter 32 WebPs; SHA256 `EB8B6B05557A9CB9EEAC81312287C94631AC08A6002E9BDBA1E4C3A5C53575C6`.
  Beleg: `docs/040-package-results.txt`. Alte ZIPs 0.2.0 und 0.3.0
  per SHA256 unverändert bestätigt.
- Unverändert: mm-Vertrag, zehn Eckzustände samt technischen Grenzen, L/U-
  Konstruktion, Preisengine/Preisregel V2, Kundenversand, Admin-/Entwurfs- und
  Kaufsperren. Kein Liveshop-Zugriff, keine Installation oder Produktveröffentlichung.
- Offen für spätere Integration: PHP-/WordPress-/Flatsome-/WCPA-Laufzeit, Rollen,
  Cache/CSP, direkte Kaufsperren/Sockel-Regression, echte Smartphones; Verfügbarkeit
  je Material/Form sowie Fertigungs-/Preisfreigabe. Fotos sind keine Zusage zu
  physischem Rapport oder fortlaufender Maserung. Details: `docs/040-decor-integration.md`.

## Phase A1.1 – Plugin-Zwischenversion 0.3.0

- Bestehendes Projekt von `main` / `16b2056` auf Featurebranch
  `feature/a1-1-corners-mm-ux` fortgeführt. [Pull Request #2](https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator/pull/2)
  zur Prüfung geöffnet, kein Merge. Implementierungscommit `1c43e94`.
  Alte Stände und ZIP 0.2.0 unverändert erhalten.
- Alle zehn geraden Eckzustände als Vorschau funktionsfähig: keine, links/rechts/
  beidseitig abgerundet, eckig abgeschrägt oder mit durchlaufender Vorderkante.
  Diagonalen und linke/rechte Sondermaße unabhängig. Durchlaufend sichtbar weich,
  ausdrücklich schematisch ohne erfundene Fertigungsradien oder Flächenangabe.
- Vier neue Speedmaster-Screenshots unverändert als Quellen unter
  `docs/references/speedmaster-a1-1/` gesichert und ausgewertet.
  Nachweise und gezielt offene technische Fragen: `docs/phase-a1-1-evidence.md`.
- Eigene konservative Vorschaupolitik: eckig `L ≤ 1,40 × B`, Abrundung auf
  10-mm-Grenzen, mindestens 50 mm Restfront/Hinterkante bei Schrägen;
  durchlaufend vorerst nur 2000 × 600 mm und Sondermaße L 60–500/B 60–300 mm.
  Keine allgemeine Lieferantenfreigabe. Grenzen erscheinen dynamisch am Feld.
- Durchgehend sichtbare mm, Plattenmaße in 1-mm-/Eckmaße in 10-mm-Schritten.
  Expliziter Eingabevertrag Version 2 + mm; unveränderte Legacy-cm-Eingabe separat
  erhalten, kein stiller Faktor 10. Gemeinsame L/U-Felder umgestellt, deren
  Konstruktion/Teilungen nicht verändert. Vertrag: `docs/input-contract-v2.md`.
- Kundenfreundliche Seitenauswahl mit Minizeichnungen, direkte Hervorhebung,
  Bearbeitungsvergleich, kurze Infodialoge, verständliche Sonderfelder.
  Vergrößerte mobile Zeichnung öffnet bei aktiver Ecke deren Detail;
  Gesamt-/Links-/Rechtsansicht wählbar. ≥16-px-Eingaben, 44-px-Auswahlziele,
  Sticky-Header-Abstand, normale Desktop-Breite erhalten.
- Tests: 85 Node-Prüfungen bestanden (61 vorhandene + 24 neue),
  46 Browser-Funktionsprüfungen, 12 bestehende Isolations-/Lebenszyklusprüfungen,
  vier bestehende Layoutfälle und zwölf neue Layoutfälle bei 360/390/1366/1440 px.
  Keine Fehler in den geprüften Fällen. Belege:
  `docs/a1-1-node-results.txt`, `docs/a1-1-browser-results.txt`.
- Ansichten: `docs/a1-1-desktop-auswahl.jpg`, `a1-1-desktop-eckig.jpg`,
  `a1-1-desktop-durchlaufend.jpg`, `a1-1-mobile-auswahl.jpg`,
  `a1-1-mobile-masse.jpg`, `a1-1-mobile-eckig-detail.jpg`,
  `a1-1-mobile-durchlaufend-detail.jpg`.
  Mobile Belege aus unskaliertem 390 × 844 px iframe, kein physischer Gerätetest.
- Neues Installationspaket: `dist/hpz-apl-admin-preview-0.3.0.zip`;
  Anleitung im Plugin unter `INSTALLATION.md`. Paket unabhängig von Node/localhost,
  enthält nur visuelle Prüfung, keine Preisengine und keinen Bestelladapter.
  PHP-Schutzlogik unverändert, nur Versionsangaben aktualisiert.
- Preisengine/Preisregel V2, Dekorkatalog, WooCommerce-Kauf-/Versandlogik und
  Produktinhalte unverändert. Alle Kaufwege weiterhin gesperrt. Kein Zugriff
  auf Liveshop, keine Installation/Aktivierung/Veröffentlichung durch Agenten.
- Für Abnahme bereit: ZIP, Originalnachweise, Desktop-/Mobilbilder, Tests und
  Featurebranch/PR. Danach Nutzer/Marco: echte PHP-/WordPress-/Flatsome-/WCPA-
  Laufzeit, Cache/Rollen/Kaufsperren, Sockel-Regression und physische Smartphones
  prüfen. Hier keine PHP-Laufzeit vorhanden; neue WordPress-Version nicht
  laufzeitgeprüft. Fertigungsfreigabe benötigt die gezielt gelisteten Nachweise.

Die folgenden Abschnitte dokumentieren frühere Meilensteine. Für aktuellen
Umfang, Einheiten und Maßgrenzen gilt der A1.1-Abschnitt oben.

## Phase A1 – Rundungen und geprüfte Zwischenversion 0.2.0 (23.10.2026)

- Auf den bereits begonnenen straight-corners-/UI-Änderungen aufgebaut. Keine Neuentwicklung. Vorhandene ZIP 0.1.0 bleibt erhalten; neues Testpaket `dist/hpz-apl-admin-preview-0.2.0.zip`.
- Zehn eindeutige Auswahlzustände (keine + links/rechts/beide × drei Bearbeitungsarten). Gerade unverändert breit. Kundenauswahl erst Seite, dann Bearbeitung. Variantenwechsel entfernt alte Sonderfelder und setzt Radien zurück.
- Vorschau funktionsfähig für unbearbeitet, vorne links R1, vorne rechts R2, beidseitig mit unabhängig einstellbaren R1/R2. Echte proportionale Viertelkreisbögen, Vorderkante unten markiert, Radien in mm mit Bezugslinien, aktive Ecke orange; Klick auf Radiusmaß führt zum passenden Feld. Eingaben weiterhin cm/0,1 cm.
- Referenzgrenze R1 einseitig bei 2000 × 600 mm: 50–599 mm. Nur in genau diesem Fall als beobachtete Grenze umgesetzt. Andere Maße / R2 / beidseitig: mathematische Vorschau, Lieferantengrenzen offen. Alle Kaufwege weiter gesperrt. Runde Konfigurationen erhalten keinen Rechteck-Beispielpreis; originale Preisengine/V2 unverändert.
- Sechs Abschrägungen separat geführt und ausdrücklich konturseitig gesperrt. Keine angenommene Gleichsetzung eckig/durchlaufend. Fehlende Quellen, die zehn Zuordnungen und beobachtete Grenzen präzise in `docs/phase-a1-evidence.md` und im ZIP als `A1-NACHWEISE.md` dokumentiert.
- Nutzer meldet erfolgreiche tatsächliche Flatsome-Adminvorschau für 0.1.0. Neue 0.2.0 lokal geprüft: 61 Node-Tests bestanden (alle bisherigen 49 erhalten + 12 neue), 27 A1-Browserprüfungen, 12 bestehende Browser-Isolations-/Lebenszyklusprüfungen und vier echte iframe-Ansichtsbreiten 360/390/1366/1440 px. Keine horizontalen Überläufe oder überlappenden Maßtexte in den geprüften Fällen. R2-Eingabe im Sticky-Header-Test bei y=150 px oberhalb des Headerendes y=110 px. Das ist ein Testheader, kein neuer Flatsome-Laufzeitnachweis.
- Belege: `docs/a1-browser-results.txt`, `docs/a1-node-results.txt`, Screenshots `a1-desktop-auswahl.png`, `a1-desktop-masse.png`, `a1-mobile-auswahl.png`, `a1-mobile-masse.png`, `a1-mobile-zeichnung.png`. Screenshots zeigen lokal skalierte 1366-/390-px-Ansichten; kein physischer Smartphone-Test.
- Plugin weiterhin nur Admin/Entwürfe. Gerade zeigt nun ausdrücklich einen grauen deaktivierten Button „Bestellung gesperrt · Admin-Test“. JS-/CSS-Module versioniert, damit Updates nicht alte Moduldateien aus dem Browsercache verwenden.
- Offen für vollständiges A1: die gesammelten Original-Screenshots als Dateien, genaue Konturen/Messstrecken für sechs Abschrägungen, allgemeine Lieferanten-Grenzregeln, Material-/Kanten-Geltung, beidseitige Abhängigkeiten und Fertigmaßbezug. Keine PHP-/WordPress-Laufzeit hier; 0.2.0 muss nach Sichtprüfung vom Nutzer auf der Testseite geprüft werden. Keine Installation, Aktivierung oder Veröffentlichung durch den Agenten.
- Ruling: schriftlich bestätigte Lage/Radien genügen für eine kenntlich gemachte Kreisbogenvorschau. Fehlende Fertigungsgrenzen werden nicht erfunden. Beobachtungen 1950/550 und 211,5/423 mm begründen keine Abschrägungskontur und bleiben reine Nachweiseinträge. L/U, Teile/Stöße, Dekorkatalog, SEO und Produktinhalte fachlich unverändert.

## Installierbares WordPress-Plugin – 23.10.2026

- Fertig: `dist/hpz-apl-admin-preview-0.1.0.zip`, eigenständiger Plugin-Ordner mit PHP, lokal gebündelten JS-/CSS-/SVG-Ressourcen und INSTALLATION.md. Kein Entwicklungsserver nötig. Bestehende Demo und Preisengine erhalten.
- Standardmäßig Vorschau aus, Testmodus an. Nur eingeloggte Administratoren mit Bearbeitungsrecht auf Entwürfen 1000083/1000080/1000081. Automatischer Standard-WooCommerce-Einbau vor Tabs; wählbarer Shortcode-Fallback. Kein Produkt wird erzeugt oder bearbeitet.
- Kaufbuttons deaktiviert; kein Preis-/Bestellendpunkt. PHP-Kaufsperren für die drei IDs, direkte Warenkorbzugriffe und bestehende Warenkorbpositionen (klassisch und Store API), unabhängig von Einstellungen. Keine WCPA-Hooks oder Formularänderungen. Schnittstellen dokumentiert in docs/wordpress-adapter.md.
- Preisregel V2 ausschließlich in docs/price-rule-v2.md dokumentiert, nicht implementiert. Plugin zeigt keine Preisbeispiele. Kundenversand unverändert separat.
- Geprüft: 49 Node-Tests bestanden (43 vorhandene, 6 Paket-/Adaptertests). Importabschluss, fehlende externe Dienste, falsche Produktkontexte, ignorierte Preis-/Kaufflags, deaktivierter Button und statische PHP-Sicherheitsverträge. Browser-Pakettest für alle drei IDs erfolgreich; 240,1 cm → 2401 mm, passende Familien, kein zweiter H1, Host-Buttonfarbe dringt nicht ins Shadow DOM ein. Kein neuer physischer Smartphone-Test.
- Testkorrektur: npm test der lokalen Demo auf test/*.test.mjs begrenzt; vorher erfasste Node fälschlich den nur im Browser lauffähigen component-test.mjs. Keine bestehenden Tests entfernt.
- Grenze: keine PHP-Laufzeit/WordPress-Installation in dieser Umgebung. PHP-Syntax, Aktivierung, tatsächliche Berechtigungs-/Warenkorbsperren und Flatsome-/WCPA-/Cache-Integration sind noch NICHT laufzeitgeprüft. Das ZIP ist ein Installationspaket für die geschlossene Testphase, keine Produktionsfreigabe.
- Nächster Schritt: Nutzer installiert nach Prüfung selbst; mit Marco WordPress-Testlauf, Rollen/Gastansicht, Hookposition, Mobilansicht, Cache/JS-Optimierung, klassische/Store-API-Kaufversuche und Sockel-Regression prüfen. Keine Veröffentlichung oder Live-Änderung durch den Agenten erfolgt.
- Ruling: bestehende schematische L/U-Geometrien unverändert mit Warnungen übernommen; dieser Meilenstein bestätigt weder Speedmaster-Teilezerlegung noch Fertigungsfreigabe.

## Fertig: UI-Meilenstein gerade Arbeitsplatte
- Bestehendes Projekt weitergeführt; vorherige UI-Dateien als style.before-straight.css und app.before-straight.mjs erhalten.
- Größere Desktop-Produktbühne, stärkere Kontraste, größere Material-/Dekorkarten und reduzierte Wiederholungstexte.
- Kompakte mobile Vorschau mit Vergrößerung; Formauswahl im ersten Bildschirmbereich.
- Maßfelder mit L1/B1-Kennzeichen und farbiger Zuordnung zur aktiven SVG-Bemaßung.
- Neue Darstellung auf Gerade begrenzt. L-/U-Geometrien, Preisengine, WooCommerce und Liveshop nicht geändert. Warenkorb weiterhin gesperrt.

## Geprüft
- 22.10.2026: node --test im Ordner local: 41 bestanden, 0 fehlgeschlagen, 0 übersprungen.
- Browser: Schrittwechsel, 240,1 cm → 2401 mm, aktive L1-Markierung, Dekorwechsel auf Platinweiß, mobile Zeichnung öffnen/schließen.
- Mobile Simulation 360 und 390 px: kein horizontaler Überlauf. Bei 360 px liegt die Formauswahl zwischen y=513 und 601 bei 844 px Ansichtshöhe (ohne Scrollen sichtbar).
- Vor Unterbrechung Desktop-/Mobilgestaltung visuell angesehen. Aktuelle Browser-Screenshotfunktion am 22.10. schlägt fehl; Bedienung und Layoutwerte heute anhand der Browseroberfläche geprüft. Keine neuen Screenshots behauptet.
- Kein Test auf physischem Smartphone; Dekore weiterhin schematische Muster.

## Vorschau
- http://127.0.0.1:4173/ (läuft lokal)
- http://127.0.0.1:4173/mobile (Ansichtsbreiten umschalten)
- Nach Neustart: im Ordner local mit node server.mjs starten.

## Als Nächstes
Gemeinsame Designbeurteilung dieses kleinen Meilensteins. Danach gezielt Rückmeldungen umsetzen; Originaldekorbilder und echte Smartphone-Prüfung ergänzen. Keine zusätzliche Preisrekonstruktion oder L-/U-Entwicklung in dieser Etappe.

## Architekturergänzung – 23.10.2026
Fertig: Screenshot der L-Produktseite ausgewertet; Komponenten-/Einbettungsvertrag in docs/embedding-contract.md abgelegt und Spezifikation/Plan ergänzt. Bestehende drei Produktentwürfe wiederverwenden; keine vollständigen Produktseiten ersetzen. Demo-Code unverändert. Prüfung: Dokumentabgleich, keine neuen Laufzeittests erforderlich. Nächster Implementierungsschritt: lokale Shell/Komponente isolieren; Produkt-IDs und konkretes Flatsome-Layout vor Shopanbindung prüfen. Keine Live-Änderung.


## Technische Einbettung – 23.10.2026
- Implementiert: mountConfigurator(root, context, adapters) in local/public/component.mjs, Shadow-DOM-Isolation, eigene Instanzzustände, destroy/updateContext, Abbruch laufender Anfragen und eindeutige SVG-IDs.
- Produktzuordnung: 1000083 / HPZ-APL-GERADE-2026 / straight; 1000080 / HPZ-APL-L-FORM-2026 / l; 1000081 / HPZ-APL-U-FORM-2026 / u. Unbekannte/widersprüchliche Zuordnung abgelehnt. Serverseitige Familienprüfung im lokalen Vorschauendpunkt.
- Demo verwendet dieselbe Komponente; eingebetteter Modus blendet Demoheader, H1/Intro, Footer und globale mobile Preisleiste aus. Familie gebunden; keine neuen Shopprodukte.
- Lokale Layoutprobe: /embed?productId=1000083 (auch 1000080, 1000081), mobile Simulation /mobile?embedded=1. Header/Galerie/Kurztext/Beschreibung/FAQ als ausdrücklich bezeichnete Platzhalter, nicht echter Flatsome-Laufzeitnachweis.
- Vor Umstellung Originaldateien gesichert unter archive/pre-embedding. prepare-embedding.mjs war einmaliges Migrationswerkzeug; nicht nochmals ausführen.
- Tests: 43 Node-Tests bestanden, darunter Produktbindung, falsche IDs/SKUs/Familien, direkte lokale Kaufaufrufe. 12 Browserprüfungen auf /component-test bestanden: Style-/DOM-Isolation, Formbindung, nativ deaktivierter Warenkorb, SVG-ID-Isolation, Kontextwechsel, Destroy/Abort und mehrfaches Mount.
- Kein Bestelladapter und kein Kaufendpunkt implementiert: auch Entfernen des disabled-Attributs erzeugt keine Bestellung. Preisengine und Geometriecode unverändert.
- Nächster Schritt: WCPA-/PHP-Adapter in separat freigegebener Testumgebung. Shadow-DOM-Feldzugriff braucht explizite WCPA-Brücke; Plugin-Code nicht ungeprüft in Shadow DOM ausführen. Echte Flatsome-Hooks, WCPA-Ereignisse, Steuern, Gewichte/Versand, Session/Bestellungen und Sockel-Regression bleiben offen. Noch keine Produktionsreife.
- Abschlussprüfung Einbettung: mobile Layoutprobe bei 360/390 px ohne horizontalen Überlauf, Demo im Browser weiterhin lauffähig. Screenshot docs/embedding-2026-10-23.png gespeichert. Kein physischer Gerätetest.
