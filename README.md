# Küchenarbeitsplatten-Konfigurator

Privates Entwicklungsprojekt von **DaniS2212** für holzplatten-zuschnitt.de.

Repository: https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator

Aktueller Plugin-Stand: **0.2.0 / Phase A1, Admin-Testvorschau**. Die vollständige
Entwicklung einschließlich früherer Stände und Pakete wird hier erhalten.
Der Import ändert weder WordPress noch WooCommerce-Produkte.

## Orientierung

| Pfad | Inhalt |
|---|---|
| `local/core/` | Maßvalidierung, Produktzuordnung und SVG-Geometrie |
| `local/public/` | Gekapselte Komponente, Demo und lokale Einbettung |
| `local/private/` | Lokale Referenzpreisengine; interne Kalkulationsdaten, nur für dieses private Repository |
| `local/test/` | Automatisierte Fachlogik-/HTTP-Tests |
| `wordpress/hpz-apl-admin-preview/` | Installierbarer Plugin-Quellstand mit gebündelten Assets |
| `wordpress/` | Paket- und Browserprüfungen |
| `docs/` | Bestandsaufnahme, Einbettungsvertrag, technische Nachweise und Testbelege |
| `docs/superpowers/specs/` | Freigegebene Spezifikation, aus dem bisherigen übergeordneten Projekt übernommen |
| `docs/superpowers/plans/` | Freigegebener Implementierungsplan, aus dem bisherigen übergeordneten Projekt übernommen |
| `dist/` | Erhaltene installierbare ZIPs 0.1.0 und 0.2.0 |
| `archive/` | Frühere Entwicklungsstände |
| `STATUS.md` | Aktueller Stand und verbleibende Arbeiten |

Frühere Dokumente nennen den ursprünglichen Projektpfad `implementation/apl/`.
Dieser Ordner bildet jetzt die Repositorywurzel. Historische Testzahlen und
Planstände in einzelnen Dokumenten bleiben als Verlauf erhalten; für den
aktuellen Stand gilt `STATUS.md`.

## Lokal testen

Voraussetzung: Node.js **22 oder neuer**, für die ZIP-Erstellung PowerShell 7.
Für die vorhandenen Node-Tests sind keine Paketinstallationen nötig.

```sh
node --test local/test/*.test.mjs wordpress/plugin.test.mjs
node local/server.mjs
```

Die Demo läuft unter http://127.0.0.1:4173/; die eingebettete Ansicht unter
http://127.0.0.1:4173/embed?productId=1000083.

Für einen gesonderten Browser-Pakettest:

```sh
node wordpress/serve-package-test.mjs
```

http://127.0.0.1:4174/ zeigt die gebündelten Plugin-Assets ohne Entwicklungs-API.
Unter `/a1-test` und `/responsive-test` laufen die Browserprüfungen.

## Plugin-Paket erstellen

```sh
node build-plugin.mjs
```

Danach in PowerShell:

```powershell
./package-plugin.ps1
```

`prepare-embedding.mjs` war ein einmaliges Migrationswerkzeug und darf nicht
erneut ausgeführt werden. Die vorhandenen Release-ZIPs werden beim Git-Import
nicht neu gebaut. Installationshinweise liegen im Pluginordner.

## Grenzen der Testversion

- Nur eingeloggte Administratoren auf den drei Produktentwürfen: Gerade
  **1000083**, L **1000080**, U **1000081**.
- Warenkorb und Bestellungen bleiben technisch gesperrt. Kein Produktionsmodus.
- Gerade: Vorschau ohne Eckbearbeitung und mit Rundungen vorne links/rechts/
  beidseitig, einschließlich unabhängiger R1/R2. Sechs Abschrägungen warten auf
  eindeutige Konturbelege. Siehe `docs/phase-a1-evidence.md`.
- L/U bleiben schematische, nicht freigegebene Lieferantengeometrien.
- Preisregel V2 ist dokumentiert, nicht aktiviert. Kundenversand bleibt separat.
- PHP-/WooCommerce-/Flatsome-Laufzeitprüfungen der neuen Version sind weiterhin
  auf einer freigegebenen Testinstallation erforderlich.
- Keine automatische Veröffentlichung, Installation oder Shop-Verbindung.

## Zusammenarbeit

Änderungen künftig in nachvollziehbaren Commits und bei Bedarf über Featurebranches
und Pull Requests prüfen. Zugangsdaten, lokale Konfigurationen und temporäre
Build-Caches sind ausgeschlossen; Quellcode, Tests, fachliche Dokumentation,
historische Archive und geprüfte ZIP-Artefakte bleiben versioniert.
