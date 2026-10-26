# Küchenarbeitsplatten-Konfigurator

Privates Entwicklungsprojekt von **DaniS2212** für holzplatten-zuschnitt.de.

Repository: https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator

Aktueller Plugin-Stand: **0.4.0 / 16 echte Dekorbilder, Admin-Testvorschau**. Die vollständige
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
| `dist/` | Installierbare ZIP 0.4.0 und unveränderte ZIPs 0.1.0/0.2.0/0.3.0 |
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
node --test local/test/*.test.mjs wordpress/*.test.mjs
node local/server.mjs
```

Die Demo läuft unter http://127.0.0.1:4173/; die eingebettete Ansicht unter
http://127.0.0.1:4173/embed?productId=1000083.

Für einen gesonderten Browser-Pakettest:

```sh
node wordpress/serve-package-test.mjs
```

http://127.0.0.1:4174/ zeigt die gebündelten Plugin-Assets ohne Entwicklungs-API.
Unter `/a1-test`, `/responsive-test` und `/a1-1-responsive-test` laufen die
Browserprüfungen. `/review?width=390` zeigt eine unskalierte mobile Paketansicht.
Unter `/decor-test` und `/decor-responsive-test` laufen zusätzlich die Dekor-
und Layoutprüfungen. Der reine PHP-Katalogtest kann auf einer PHP-Installation
mit `php wordpress/decor-catalog.test.php` ausgeführt werden.

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
- Gerade: alle zehn Zustände als Vorschau, einschließlich unabhängiger Radien
  und Abschrägungen links/rechts. Durchlaufende Abschrägung bleibt schematisch
  und vorerst auf 2000 × 600 mm / Sondermaße L=60–500, B=60–300 mm begrenzt.
  Weitere konservative Grenzen und Nachweise: `docs/phase-a1-1-evidence.md`.
- Sichtbare Maße durchgehend in mm; Version/Einheit ausdrücklich getrennt vom
  erhaltenen Legacy-cm-Vertrag. Siehe `docs/input-contract-v2.md`.
- L/U bleiben schematische, nicht freigegebene Lieferantengeometrien.
- Preisregel V2 ist dokumentiert, nicht aktiviert. Kundenversand bleibt separat.
- Alle 16 vereinbarten Dekore mit echten, lokal gebündelten Bildern und kurzen
  Kundennamen. Katalogpräsenz bedeutet keine bestätigte Lieferbarkeit.
  Zuordnung, Bildherkunft und Tests: `docs/040-decor-integration.md`.
- PHP-/WooCommerce-/Flatsome-Laufzeitprüfungen der neuen Version sind weiterhin
  auf einer freigegebenen Testinstallation erforderlich.
- Keine automatische Veröffentlichung, Installation oder Shop-Verbindung.

## Zusammenarbeit

Änderungen künftig in nachvollziehbaren Commits und bei Bedarf über Featurebranches
und Pull Requests prüfen. Zugangsdaten, lokale Konfigurationen und temporäre
Build-Caches sind ausgeschlossen; Quellcode, Tests, fachliche Dokumentation,
historische Archive und geprüfte ZIP-Artefakte bleiben versioniert.
