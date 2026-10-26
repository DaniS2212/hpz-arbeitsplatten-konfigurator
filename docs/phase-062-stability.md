# Stabilitaet und Bemaßungen 0.6.2 – vorbereitete Korrektur

26.10.2026. Fehlerbericht: Orange vertikale Linie zwischen Maß-Eingabefeld und „cm“-Suffix, Maßhilfslinien über der Schrift, nach vielen Interaktionen zeitweise alle 16 Dekorbilder kaputt und SVG-Textur nicht geladen. Testansicht: eigener lokaler GitHub-Paketserver, nicht WordPress.

## Gesicherte Codebefunde

1. `local/public/decors/` und `wordpress/.../assets/decors/` enthalten beide jeweils alle 32 originalen WebP-Dateien (16 große und 16 Thumbnails). Es handelt sich **nicht** um fehlende GitHub-Binärdateien.
2. Der Paketserver `wordpress/serve-package-test.mjs` verwendete vor 0.6.2 für den WebP-Zweig `res.end(await readFile(...))` **ohne try/catch** um den asynchronen HTTP-Handler. Ein Lesefehler kann Node durch eine nicht abgefangene Promise-Rejection beenden. Das ist ein **echter Codefehler des lokalen Testservers**, der das beobachtete vollständige Wegbrechen der Bilder plausibel erklärt. Der konkrete ursprüngliche Windows-Ausfall (Dateilesefehler, Neustart, anderer Grund) ist mangels Zugriff auf das laufende Windows-Prozesslog aber nicht abschließend belegt.
3. `renderChoices` erzeugte die 16 Dekor-IMG-Elemente bei jedem erneuten Seiten-/Ecken-Aufbau neu, was unnötige Bildabrufe und Ausfallanfälligkeit bei langsamer oder unterbrochener Verbindung erzeugt. Keine Anforderungen an Image-Hotlinks; Bilder bleiben lokal gebündelt.
4. Das Orange zwischen Textfeld und „cm“ stammt aus einer **am flexiblen Eingabefeld abgeschnittenen Focus-Outline**: die `input:focus-visible`-Kontur lag neben dem rechten Einheit-Span. Die Fokuserkennung wird stattdessen am gesamten umschließenden Feld gezeigt. Tastaturfokus bleibt sichtbar.
5. SVG-Bemaßungen zeichneten durchgehende Maßlinien und die Beschriftungen direkt darüber ohne eigene Label-Hintergründe. Bei Eckmaßen wurden rechte und linke Texte gleich positioniert. Das verursachte Überlagerung.
6. Bei den beidseitigen Eckbearbeitungen lagen vier Sondermaßfelder vertikal hintereinander. Sie wurden in die Gruppen **„Linke Ecke“** / **„Rechte Ecke“** mit jeweils nebeneinander angeordneten Feldern **Länge** / **Tiefe** gegliedert. Im Desktop-Layout befindet sich die kompakte Konfigurationsübersicht auch in den ersten Schritten unter der linken Zeichnung statt am Ende des rechten Formulars; auf Mobilgeräten bleibt sie nach dem Formular.

## Änderungen

- `local/public/component.mjs` und gebündelte WordPress-`component.js`: Dekorbild-Elemente erhalten und Auswahl synchronisieren (keine unnötigen `img`-Neuladungen), Eckfelder gruppieren, responsive Zusammenfassung platzieren.
- `local/core/geometry.mjs` und gebündelte WordPress-`geometry.js`: Bemaßungen mit hell hinterlegten Labels, bessere Position an linker/rechter Kontur, aktive Beschriftung prominent. Redundantes „Übergänge schematisch“ innerhalb der Zeichnung entfernt; der Fertigungsvorbehalt bleibt außerhalb der Zeichnung sichtbar. Bei temporärem Bildausfall wirkt die Zeichnung neutral, nicht wie ein zufälliger Dekorverlauf.
- `design/kuechenstudio-060.css` und gebündelte Styles: keinen orangefarbenen Strich am cm-Zusatz; Gruppierung/aktivem Eingabefeld klaren Petrol-Fokus geben.
- Lokaler Paketserver: WebP-Fehler als HTTP 500 statt Prozessabbruch; `/__health` meldet Dateianfragen-Fehler, bekannte Bildanzahl und Prozess-Erreichbarkeit.
- Testpaket: Unit-/HTTP-Regression mit absichtlich fehlgeschlagenem WebP-Lesezugriff, 192 wiederholten echten Bildabfragen, 60 vollständige Chromium-Klickzyklen je 1366/390 px mit Prüfung aller 16 Dekore und des SVG-Texturabrufs.
- WordPress-Asset-Cache-Version 0.6.2.

## Diagnose direkt auf dem eigenen Windows-PC

Während die Testansicht auf Port 4180 läuft, in einem neuen Tab `http://127.0.0.1:4180/__health` öffnen. `ok:true` und `decors:32` bestätigen den lokalen Serverprozess. `imageFailures>0` weist auf einen abgefangenen tatsächlichen Lesefehler hin. Wenn diese URL gar nicht mehr erreichbar ist, ist der Node-Prozess/Port zu prüfen (Terminalfenster ansehen). Nur gesicherte Ausgabe aus diesem Test erlaubt den Rückschluss auf die ursprüngliche Ursache.

Nach dem Merge den bisherigen Starter `HPZ_Neueste_Vorschau_starten.cmd` erneut aufrufen, damit `git pull --ff-only` den aktuellen `main` in die separate Vorschaukopie übernimmt. Auch den Browser-Cache ggf. mit Strg+F5 neu laden; getrennte Tests `/stability-test` und `/__health` liefern ausführbare Diagnose. **Nicht** an Work-Entwicklungsordner oder Live-WordPress kopieren.

## Grenzen

Es gab noch **keinen** produktiven WordPress-, Flatsome- oder WooCommerce-Realtest. Der lokale Paketserver ist keine WP-AJAX-Preisvorschau; in diesem Modus kann weiterhin „Preis auf Anfrage“ erscheinen. Preisformel V3, intern vollständige mm-Daten, Lieferantenfreigaben, Produkte, Warenkorbsperren und WordPress-Entwurfsstatus bleiben unverändert. Für eine Live-Admin-Installation gesonderte Freigabe und den vorgelagerten WordPress-Praxistest einhalten.
