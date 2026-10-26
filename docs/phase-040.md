# Zwischenversion 0.4.0 – echte Dekorbilder

Verbindliche Grundlage: Nutzerauftrag vom 26.10.2026, bestehende Spezifikation,
Implementierungsplan und `embedding-contract.md`. Basis: gemergter PR #2,
`4f24337`; Dekorzuordnungen aus PR #1 / `8064a5a` und bereitgestelltem Bild-ZIP.
Keine neue Planungsfreigabe erforderlich; Umfang und gewünschtes Ergebnis sind
ausdrücklich beauftragt. Keine Unteragenten.

## Umsetzung und Prüfprotokoll

1. Basis und Daten sichern: Merge prüfen, neuer Featurebranch, 16 Zuordnungen
   übernehmen, Originale/Manifest erhalten, WebP-Dateien bytegenau prüfen.
2. Katalog/Validierung: alle IDs eindeutig, nur kurze Kundennamen öffentlich
   anzeigen, Lieferantencode serverseitig aus vertrauenswürdigem Katalog ableiten.
   Keine vom Browser mitgelieferten Namen/Codes übernehmen.
3. Bildkomponente: große Kacheln ohne Filter, echtes gewähltes Bild in SVG-
   Vorschau und Detail, Du-Ansprache und kompaktere Desktop-Flächennutzung.
4. Paket/Regression: 0.4.0 ohne Entwicklungsserver bauen; alle 16 Bilder/Dekore,
   Wechsel, Einbettung und vier Ansichtsbreiten prüfen. Bestehende 85 Tests als
   Ausgangsbasis erhalten. PHP-Abbildung separat von Freigabe/Preis behandeln.
5. Abnahme: ZIP, Desktop-/Mobilbilder, Protokolle und STATUS; neuer PR, kein Merge.

## Entscheidungen

- Ruling: Bestehenden sauberen Checkout auf neuem Featurebranch verwenden —
  Nutzer will das bestehende Projekt fortführen, keine parallele Entwicklungs-
  umgebung; kein Hauptbranch wird für Umsetzung verwendet.
- Ruling: PR #1 nur als Quelldaten übernehmen, nicht mergen — der Auftrag
  autorisiert die Dekorintegration, nicht die Zusammenführung anderer PRs.
- Ruling: Katalogpräsenz bedeutet nur visuelle Auswahl, keine Material-/Form-
  Verfügbarkeit. Alle Kaufwege und Preisfreigaben bleiben gesperrt.
- Ruling: Originale im Nachweisordner, nur unveränderte optimierte WebP-Dateien
  im Plugin. Keine externen Bilddienste, keine Farb-/Texturmanipulation.
- Ruling: Bildskalierung in der Planungszeichnung ist anschaulich; reale
  Rapportgröße, Maserungsrichtung/Teilanordnung sind nicht als Fertigung belegt.

## Bisher geprüft

- PR #2 ist tatsächlich gemergt; PR #1 weiterhin offen.
- Neues Branch `feature/dekorbilder-040` ab `origin/main` / `4f24337`.
- Ausgangsbasis: 85 Node-Tests bestanden, keine Fehler.
- Bild-ZIP enthält 16 Originale und 32 WebP-Dateien mit Zuordnungsmanifest.
- Aufgaben 1–4 abgeschlossen: Katalog/HTTP-Zuordnung, echte Bildkacheln und
  SVG-Texturen, PHP-Katalogadapter, kompakteres Desktoplayout und Du-Ansprache.
- TDD: neue Katalog-/Zuordnungs-/Bildauslieferungs- und SVG-Tests zuerst scheitern
  gesehen, anschließend grün. Veraltete Referenzdekortext-Prüfung ebenfalls rot/grün.
- 95 Node-Tests grün; ein PHP-Laufzeittest mangels Runtime ausdrücklich offen.
  65 Dekor-Browserprüfungen, zwölf neue Layoutfälle und alle bisherigen Browser-
  Regressionen grün. Protokolle und fünf Abnahmebilder gesichert.
- Plugin-ZIP 0.4.0 erzeugt: 54 Einträge bytegleich zur Pluginquelle, darunter
  32 WebPs. SHA256 `EB8B6B05557A9CB9EEAC81312287C94631AC08A6002E9BDBA1E4C3A5C53575C6`.
  Alte ZIPs 0.2.0/0.3.0 unverändert; `docs/040-package-results.txt`.
- Aufgabe 5: Screenshots, Protokolle und ZIP liegen vor. Neuer Pull Request
  noch ausstehend, kein Merge.
