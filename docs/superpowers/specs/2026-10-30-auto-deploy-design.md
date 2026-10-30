# Automatische Plugin-Auslieferung (Design, 30.10.2026)

## Ziel
Nach jedem Merge in GitHub `main` wird ausschließlich das WordPress-Plugin `hpz-apl-admin-preview` von holzplatten-zuschnitt.de aktualisiert, sofern vollständige Tests erfolgreich waren. Kein manuelles ZIP-Hochladen.

## Architektur
Eigener GitHub-Actions-Workflow: Push nach `main` -> PHP/Node und Browserprüfungen -> generiertes Plugin aus überprüften Quellen -> CI-eindeutige Plugin-Version zur Cache-Invalidierung -> ZIP/Prüfsumme -> SSH an HostPress -> WP-CLI-Plugin-Aktualisierung -> Verifikation. Alle Aktionen auf PHP/WooCommerce-Produkte/andere Plugins unterbleiben.

## Zugang und Freigabe
Reine GitHub-Repository-Secrets für SSH-Key, Host, Nutzer, Pfad und gepinnten Host-Key; `HPZ_AUTO_DEPLOY_ENABLED=true` muss in Repository-Variablen explizit gesetzt werden. Bis dahin keine SSH-Verbindung. Kein Einfügen von Geheimnissen in Chat, Code oder Logs. Zugriff auf den Host muss getrennt eingerichtet werden; HostPress benötigt ggf. WP-CLI-CHROOT-Freischaltung. Automatische Releases nach jeder Main-Aktualisierung ohne individuelle Freigabe.

## Schutz
- Kein Deployment aus PRs oder Branches; der Deploy-Job verlangt den `main`-Ref.
- Prüfjobs als notwendige Abhängigkeit; Änderungen an generierten Assets müssen zum Quellcode passen.
- SSL/SSH mit gepinntem `known_hosts`, keine dynamische unsichere Host-Key-Akzeptanz.
- Nur gezielter Plugin-Ersatz, nur erwartete WordPress-Domain, aktives Plugin vorausgesetzt.
- Dateibackup vor Update außerhalb des WordPress-Verzeichnisses. Rollback bei Update-/Verifikationsfehler.
- WooCommerce-Option `hpz_apl_admin_preview` und Produktstatus der drei IDs werden vor und nach dem Update verglichen. Keine normale Änderung dieser Daten.
- L/U bleiben Entwürfe und gesperrt; kein automatisches Go-live.
- Alle ZIPs enthalten genau einen Plugin-Root, keine sonstigen Installationsdaten.

## Alternativen
- WordPress-internes GitHub-Updater-Plugin: einfacher, aber schwerer mit GitHub-CI, privatem Repo und atomischem Backup/Umkehr zu koppeln.
- GitHub Actions -> SSH/WP-CLI: gewählt, transparent und direkt an vorhandene Tests angebunden.
- Freigabeklick nach Merge: verworfen; Nutzer wünscht echten Automatikmodus.

## Offene Infrastruktur-Initialisierung
Zugänge und SSH/Hostschlüssel müssen persönlich im GitHub-Repository hinterlegt werden, `HPZ_AUTO_DEPLOY_ENABLED` erst nach erfolgreichem SSH-/WP-CLI-Probelauf setzen. Vorher enthält das PR nur vorbereitete Pipeline; kein Live-Update.
