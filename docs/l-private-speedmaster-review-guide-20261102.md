# PR #43 – Privater visueller Abgleich Speedmaster gegen L1–L4

Stand 02.11.2026 · **Internes Review-Werkzeug**. Keine WordPress-Oberflächen-, Produkt-, Preis- oder Freigabeänderung.

## Ziel

Die bereits mit PR #39 privat archivierten **60 unveränderten Originalbilder** bleiben die Quelle. Damit jede spätere Codeänderung an der L-Geometrie kontrolliert beurteilt werden kann, generiert `.github/workflows/l-private-reference-report.yml` einen **vollständig offline nutzbaren HTML-Bericht** mit vier Speedmaster-Originalscreenshots und je einer aktuellen Desktop- (1366 px) und Smartphone-Vorschau (390 px), direkt nebeneinander.

Das ist ein **Sichtvergleich**, kein maschineller Pixel-Gleichheitsbeweis. Speedmaster und WooCommerce haben verschiedene Kamerawinkel, Zoom, Dekore und Maßbeschriftungen. Darüber hinaus muss bei der finalen manuellen Sichtung erst geprüft werden, ob die aus den historischen Chat-/Screenshot-Notizen übernommenen Beispielwerte exakt zum einzelnen Originalfoto passen.

## Quellen, Zuordnung, Ausgabe

- Konfigurationsmatrix: `docs/references/speedmaster-lu/REVIEW_CASES.json`. Grundlage: `docs/l-speedmaster-screenshot-evidence-20261102.md`.
- Bilder: `docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip`; unveränderte SHA-256-Prüfsummen aus `SOURCE_MANIFEST.csv`.
- Der Python-Importer `scripts/import_speedmaster_reference_zip.py` prüft **alle 60 Quellen** und den gesamten ZIP-Hash. Der neue Reportgenerator `scripts/l_reference_report.py` bindet **nur** Fälle mit `source_type=speedmaster` ein und blockiert Originalbilder der `shop-ui`-Kategorie als vermeintlichen Lieferantenbeleg.
- Die Prüfkonfigurationen (W980, APL38) werden von `wordpress/l-reference-browser-runner.mjs` in der unverkäuflichen Vorschau gerendert. Für L3/L4 bleiben verknüpfte B1/B2 und B3/B4 Eingabewerte sowie die getrennte L4-B5-Grundmaß-/B5-Eckmaß-Logik bestehen.
- Ausgabe ausschließlich als **privates GitHub-Actions-Artefakt** `l-private-speedmaster-reference-review`: `dist/l-reference-report.html` plus acht Bildbelege `dist/l-review-L1-1366.png` usw. Keine Links zu externen CDNs, keine Eingabeformulare oder Scripts; Originalbilder als in HTML eingebettete Data-URIs. Das Archiv bleibt im privaten Repo.
- Ablauf: GitHub → Actions → **Speedmaster private L visual comparison (never publish)** → Lauf öffnen → Artefakt. Bei Bedarf manuell `workflow_dispatch` erneut ausführen. GitHub-Actions-Artefakte werden nach **30 Tagen** entfernt, die Originaldateien im Repo bleiben erhalten.

## Anwendungsfall und Grenzen

Für das spätere **einmalige Gesamt-Review**, das der Auftraggeber nach Abschluss der selbstständigen, belegbaren Entwicklungsbausteine machen möchte, eröffnet man diesen Bericht. Pro Form ist sichtbar:

- Soll-Eingabewerte der dokumentierten Beispielkonfiguration und archivierte Herstelleraufnahme.
- Eigene 2D-Vorschau Desktop und Smartphone nach derselben dokumentierten Eingabematrix.
- Unterschiede in Kontur, Achse, Eckbearbeitung, Maßangaben, inneren Diagonalen, Stoßverläufen und Dekor.
- **Keine** erfundenen Steckverbindungs-/CNC-Daten. Die L/U-Warenkorbfreigabe bleibt unberührt und gesperrt.

### Nicht aus dem Bericht ableiten

Ein grüner Workflow beweist nur: korrekte Bildherkunft, reproduzierbare Screenshots und stabile, nicht kaufbare UI. Eine formgetreue Übereinstimmung mit Speedmaster, zulässige Fertigungsgrenzen, echte Verbindungen, Randprofile und Preis-/Versandfreigaben werden **nicht** automatisch nachgewiesen. Die abweichenden Eck-Eingabe-Maxima aus PR #41 und die nicht bestätigte L4-B5-Außendiagonale bleiben offen.

## Absicherung

- Python-Unittests `scripts/test_l_reference_report.py`: eindeutige Quellen, kein `shop-ui`-Missbrauch, drei eingebettete Bilder pro Fall, Fehlermeldungen bei fehlenden Quellen/Browserscreenshots, HTML-Escaping und keine externen Bildlinks.
- Browsertest: alle vier festgeschriebenen Datensätze auf 1366/390 px, tatsächlich angezeigte Maße, beide Außenecken, stabile SVG-Draufsicht, kein horizontaler Überlauf, keine JavaScript-Fehler, **kein Warenkorb**.
- Der Workflow hat ausschließlich `contents: read`; Veröffentlichungs-, Merge- oder Hosting-Schritte existieren nicht. Der Bericht enthält nur Bilder aus einem verifizierten internen, privaten GitHub-Repository.

**Nach Fertigstellung der offenen Herstellerdaten** werden die Beispielpaare bei Bedarf um neue unabhängige Speedmaster-Aufnahmen ergänzt. Keine stillschweigende Umschreibung eines ungeprüften Geometriemodells.
