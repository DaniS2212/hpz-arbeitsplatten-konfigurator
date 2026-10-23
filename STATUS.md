# Status – 22.10.2026

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
