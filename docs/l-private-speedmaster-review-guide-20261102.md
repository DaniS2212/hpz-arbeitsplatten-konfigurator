# PR #43 / #47 – Privater visueller Abgleich Speedmaster gegen L1–L4

Aktualisiert 05.11.2026 (PR #47) · **Internes Review-Werkzeug**. Keine WordPress-Oberflächen-, Produkt-, Preis- oder Freigabeänderung.

## Ziel

Die bereits mit PR #39 privat archivierten **60 unveränderten Originalbilder** bleiben die Quelle. Damit jede spätere Codeänderung an der L-Geometrie kontrolliert beurteilt werden kann, generiert `.github/workflows/l-private-reference-report.yml` einen **vollständig offline nutzbaren HTML-Bericht** mit vier Speedmaster-Originalscreenshots und je einer aktuellen **Draufsicht sowie Einzelansichten der schematischen Stoßmarkierungen** auf Desktop (1366 px) und Smartphone (390 px), direkt nebeneinander.

Das ist ein **Sichtvergleich**, kein maschineller Pixel-Gleichheitsbeweis. Speedmaster und WooCommerce haben verschiedene Kamerawinkel, Zoom, Dekore und Maßbeschriftungen. Darüber hinaus muss bei der finalen manuellen Sichtung erst geprüft werden, ob die aus den historischen Chat-/Screenshot-Notizen übernommenen Beispielwerte exakt zum einzelnen Originalfoto passen.

### Erweiterung PR #50: 44 weitere Hersteller-Originale direkt mit ansehen

Im archivierten 60-PNG-Paket sind **48 echte Speedmaster-Aufnahmen** sowie **12 eigene Shop-/UI-Screenshots**. Vor PR #50 wurden lediglich **vier** Herstelleraufnahmen als Gegenstück zu reproduzierbaren eigenen L1–L4-Vorschauen angezeigt.

Der private HTML-Bericht ergänzt jetzt einen **aufklappbaren Galerieabschnitt** mit den verbleibenden **44 Speedmaster-Originalen**, jeweils mit der archivierten Bezeichnung und dem unveränderten Bild. Das erspart eine separate Suche im ZIP und hilft, vorhandene 3D-Ansichten, Formen, transparente Teilungsdetails und ältere Varianten bei der weiteren Entwicklung zu sichten. Das Archiv selbst wird weiterhin anhand von SHA-/Manifestnachweisen geprüft.

**Wesentliche Einschränkung:** Diese 44 Bilder haben **noch keine exakt belegte Gegenkonfiguration im eigenen Shop**. Sie werden nicht zu falschen 1:1-Vergleichspaaren umetikettiert; der Bericht kann ihren Konfigurationsdatensatz nicht automatisch erraten. Auch ein Bild mit sichtbaren U1–U4-Auswahlkarten stellt keine vollständige U-Fertigungsgeometrie dar. Kein Herstellerbeleg aus `shop-ui` wird aufgenommen. Galerie ausschließlich im **privaten Actions-Artefakt**, niemals im WooCommerce-/WordPress-Paket.


## Quellen, Zuordnung, Ausgabe

- Konfigurationsmatrix: `docs/references/speedmaster-lu/REVIEW_CASES.json`. Grundlage: `docs/l-speedmaster-screenshot-evidence-20261102.md`.
- Bilder: `docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip`; unveränderte SHA-256-Prüfsummen aus `SOURCE_MANIFEST.csv`.
- Der Python-Importer `scripts/import_speedmaster_reference_zip.py` prüft **alle 60 Quellen** und den gesamten ZIP-Hash. Der neue Reportgenerator `scripts/l_reference_report.py` bindet **nur** Fälle mit `source_type=speedmaster` ein und blockiert Originalbilder der `shop-ui`-Kategorie als vermeintlichen Lieferantenbeleg.
- Die Prüfkonfigurationen (W980, APL38) werden von `wordpress/l-reference-browser-runner.mjs` in der unverkäuflichen Vorschau gerendert. Für L3/L4 bleiben verknüpfte B1/B2 und B3/B4 Eingabewerte sowie die getrennte L4-B5-Grundmaß-/B5-Eckmaß-Logik bestehen.
- Ausgabe ausschließlich als **privates GitHub-Actions-Artefakt** `l-private-speedmaster-reference-review`: `dist/l-reference-report.html` plus **20 eigene Bildbelege**: je vier Draufsichten (vier Formen × 2 Breiten = 8), je Stoß A für L1–L4 (8) und je Stoß B für L3/L4 (4). Dateimuster `dist/l-review-L1-1366.png`, `dist/l-review-L1-1366-seam-1.png`, `dist/l-review-L4-390-seam-2.png`. Keine Links zu externen CDNs, keine Eingabeformulare oder Scripts; Originalbilder als in HTML eingebettete Data-URIs. Das Archiv bleibt im privaten Repo.
- Ablauf: GitHub → Actions → **Speedmaster private L visual comparison (never publish)** → Lauf öffnen → Artefakt. Bei Bedarf manuell `workflow_dispatch` erneut ausführen. GitHub-Actions-Artefakte werden nach **30 Tagen** entfernt, die Originaldateien im Repo bleiben erhalten.

## Anwendungsfall und Grenzen

Für das spätere **einmalige Gesamt-Review**, das der Auftraggeber nach Abschluss der selbstständigen, belegbaren Entwicklungsbausteine machen möchte, eröffnet man diesen Bericht. Pro Form ist sichtbar:

- Soll-Eingabewerte der dokumentierten Beispielkonfiguration und archivierte Herstelleraufnahme.
- Eigene 2D-Draufsicht auf Desktop und Smartphone nach derselben dokumentierten Eingabematrix.
- **Neu mit PR #47:** Bei L1/L2 der ausgewählte **schematische Stoß A**, bei L3/L4 zusätzlich jeweils Stoß A und B in **getrennten** Aufteilungsansichten mit ihren eingefärbten Nachbarregionen (PR #45/#46). Alle Bilder benutzen denselben Referenzeingabesatz; eine Aufteilung ist damit **keine reale Zuschnittfreigabe**.
- Unterschiede in Kontur, Achse, Eckbearbeitung, Maßangaben, inneren Diagonalen, Stoßverläufen und Dekor.
- **Keine** erfundenen Steckverbindungs-/CNC-Daten. Die L/U-Warenkorbfreigabe bleibt unberührt und gesperrt.

### Nicht aus dem Bericht ableiten

Ein grüner Workflow beweist nur: korrekte Bildherkunft, reproduzierbare Screenshots und stabile, nicht kaufbare UI. Eine formgetreue Übereinstimmung mit Speedmaster, zulässige Fertigungsgrenzen, echte Verbindungen, Randprofile und Preis-/Versandfreigaben werden **nicht** automatisch nachgewiesen. Die abweichenden Eck-Eingabe-Maxima aus PR #41 und die nicht bestätigte L4-B5-Außendiagonale bleiben offen.

## Absicherung

- Python-Unittests `scripts/test_l_reference_report.py`: eindeutige Quellen, kein `shop-ui`-Missbrauch, **5 eingebettete Bilder pro L1/L2-Fall bzw. 7 pro L3/L4-Fall**, harte Fehler bei fehlenden oder ungültigen Stoßbildern, HTML-Escaping und keine externen Bildlinks.
- Browsertest: alle vier festgeschriebenen Datensätze auf 1366/390 px, tatsächlich angezeigte Maße, beide Außenecken, stabile SVG-Draufsicht und zusätzlich ausgewählte **Stoß-Nachbarregionen**, keine Maßtexte in der technischen Aufteilung, kein horizontaler Überlauf, keine JavaScript-Fehler, **kein Warenkorb**.
- Der Workflow hat ausschließlich `contents: read`; Veröffentlichungs-, Merge- oder Hosting-Schritte existieren nicht. Der Bericht enthält nur Bilder aus einem verifizierten internen, privaten GitHub-Repository.

**Die sechs neueren L4-B5-Binäroriginale aus dem separaten Screenshotpaket sind weiterhin nicht im GitHub-Archiv enthalten; PR #47 behauptet hierfür keinen zusätzlichen Originalbildbeleg.**

**Nach Fertigstellung der offenen Herstellerdaten** werden die Beispielpaare bei Bedarf um neue unabhängige Speedmaster-Aufnahmen ergänzt. Keine stillschweigende Umschreibung eines ungeprüften Geometriemodells.
