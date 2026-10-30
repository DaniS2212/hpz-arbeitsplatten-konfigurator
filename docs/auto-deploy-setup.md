# Automatische WordPress-Plugin-Updates nach GitHub-Merge

**Stand:** 30.10.2026. Nur `DaniS2212/hpz-arbeitsplatten-konfigurator` und das bereits installierte Plugin `hpz-apl-admin-preview` auf **holzplatten-zuschnitt.de**. **L- und U-Produkte bleiben Entwürfe.** Das Deployment publiziert keine Produkte und ändert keine WooCommerce-Verkaufseinstellung.

## Einmalige Vorbereitung in HostPress

1. Im HostPress-/Plesk-Kundencenter SSH für das Hosting-Abonnement einrichten. Hinweis von HostPress: Der SSH-Account hat ggf. Zugriff auf alle Webinstanzen des Abonnements. Zugang daher besonders schützen.
2. Bei HostPress ggf. das Ticket **„WP-CLI CHROOT Freischaltung“** eröffnen, damit PHP und das vorinstallierte `wp` in der SSH-Sitzung funktionieren. Quellen: https://docs.hostpress.de/article/wie-lege-ich-einen-ssh-zugang-an/ und https://docs.hostpress.de/article/wp-cli-kommandozeilenwerkzeug/.
3. Für GitHub einen **separaten SSH-Ed25519-Schlüssel** erzeugen und dessen öffentlichen Schlüssel beim SSH-Konto autorisieren. **Den privaten Schlüssel niemals in Chat, PR, Code oder WordPress speichern.**
4. Einmal selbst per SSH verbinden. Im WordPress-Hauptverzeichnis (`httpdocs` oder abweichender tatsächlicher Pfad) `pwd -P`, `wp --info`, `wp core is-installed`, `wp plugin is-active hpz-apl-admin-preview` und `wp option get home` prüfen. Die URL muss `https://holzplatten-zuschnitt.de` oder `https://www.holzplatten-zuschnitt.de` sein.
5. Den **SSH-Hostschlüssel-Fingerabdruck über einen unabhängigen HostPress-Kanal** kontrollieren. Erst danach eine vollständige `known_hosts`-Zeile mit diesem Schlüssel erzeugen. Keine automatische Vertrauensannahme durch `StrictHostKeyChecking=no`.

## GitHub-Konfiguration (Repository -> Settings -> Secrets and variables -> Actions)

**Repository-Secrets (nicht als öffentliche Variablen):**

| Name | Inhalt |
|---|---|
| `HPZ_WP_SSH_HOST` | HostPress-SSH-Hostname oder IP ohne Protokoll |
| `HPZ_WP_SSH_USER` | SSH-Benutzername |
| `HPZ_WP_SSH_PORT` | SSH-Port (optional; Standard 22) |
| `HPZ_WP_SSH_PRIVATE_KEY` | Vollständiger privater Ed25519-Deploy-Schlüssel, inklusive Kopf-/Fußzeilen |
| `HPZ_WP_SSH_KNOWN_HOSTS` | Vorher unabhängig geprüfte Zeile(n) im OpenSSH-known_hosts-Format, bei Nichtstandardport mit `[host]:port` |
| `HPZ_WP_PATH` | Absoluter WordPress-Installationspfad vom SSH-Befehl `pwd -P`, ohne abschließende Leerzeichen |

**Repository-Variable:**

| Name | Wert |
|---|---|
| `HPZ_AUTO_DEPLOY_ENABLED` | Genau `true` erst nach erfolgreichem SSH- und WP-CLI-Probelauf; vorher nicht setzen |

Ohne die Variable wird der Deploy-Job übersprungen. Fehlende/ungültige Secrets führen nach Aktivierung zu einem sichtbaren Fehler; GitHub darf nie stillschweigend behaupten, es sei installiert worden.

## Ablauf nach jedem Merge in `main`

1. Die Workflow-Datei `.github/workflows/hpz-auto-deploy.yml` startet auf jedem `push` nach `main` (und lässt sich auf `main` manuell starten). PRs erhalten nur Tests, niemals SSH-Zugriff.
2. PHP/WooCommerce-, Node- und reale Chromium-Regressionen müssen **alle** grün sein. Bei einem Fehler gibt es kein Deployment.
3. Plugin-Ressourcen werden frisch generiert und gegen die eingecheckten Dateien abgeglichen. Die CI fügt eine eindeutige vierte Versionskomponente hinzu (z. B. Quellstand `1.0.3` -> installierte Version `1.0.3.42`) und aktualisiert sämtliche Version-Parameter der JS-/CSS-Module.
4. Die getestete, gezielt für WP gepackte ZIP wird als GitHub-Artefakt mit SHA-256 abgelegt, danach über SSH mit **gepinntem Hostschlüssel** auf den Server übertragen.
5. Remote überprüft das Skript URL, WP-CLI, aktiven Pluginstatus, L-/U-Entwürfe, ZIP-Inhalt, SHA-256 und Ausgangszustand der Freigabeoption und drei Produktstatuswerte. Es erstellt ein Dateibackup außerhalb des Webroots unter `~/.hpz-apl-deploy/backups/`.
6. WP-CLI installiert ausschließlich dieses ZIP per `wp plugin install <datei> --force` (kein `--activate`). Bei Fehler, Versionsabweichung, inaktivem Plugin, fehlender PHP-Laufzeit oder geändertem Freigabestatus wird die vorherige Plugin-Version aus dem Backup automatisch wiederhergestellt. Bei ungewollter Datenänderung stellt die Rücksetzroutine nur die drei Produktstatuswerte bzw. die eine Konfigurator-Option wieder her.
7. Erst nach erfolgreicher Prüfung wird der WP-Rocket-Cache der geraden Arbeitsplatten-Produktseite gezielt geleert. Die letzten **fünf** Plugin-Dateibackups bleiben erhalten. Andere Plugins werden nicht berührt.

**Kein vollständiges Datenbankbackup:** Die Backup-/Rollback-Garantie betrifft die Plugin-Dateien und die drei kontrollierten Produktstatuswerte plus die Konfigurator-Option. Das Skript führt keine Datenbankmigrationen, Bestellungen, Bezahlungen oder Produktveröffentlichungen aus. Für zukünftige migrationspflichtige Updates braucht es einen gesonderten, getesteten Prozess.

## Erste Aktivierung / Funktionsnachweis

- Vor der ersten Aktivierung auf `main` sollte die Pipeline einmal über GitHub Actions ohne `HPZ_AUTO_DEPLOY_ENABLED` erfolgreich durchgelaufen sein: dann wird die ZIP gebaut, aber nicht installiert.
- Nach sicherer Einrichtung der Secrets die Repository-Variable auf `true` setzen. In GitHub -> Actions -> **HPZ Arbeitsplatten – geprüfter Auto-Deploy** -> **Run workflow** auf `main` einmal ausführen.
- Bei grünem Deploy-Job WordPress -> Plugins -> **Holz-Liebling Arbeitsplatten** auf die CI-Versionsnummer prüfen und auf der Produktseite die bekannte Preisreferenz 120 × 60 cm, 38 mm, Platinweiß = 510 € überprüfen. Das Skript löst **keine** Testbestellung und **keine** echte Zahlung aus.
- Danach läuft die Auslieferung automatisch nach erfolgreichen `main`-Aktualisierungen.

## Rollback / Fehler

Wenn ein Deployment während der Installation oder Nachkontrolle scheitert, stellt `scripts/deploy/remote-deploy.sh` die gesicherten Dateien automatisch wieder her und der GitHub-Job wird rot. Backup-Dateien sind unter `~/.hpz-apl-deploy/backups/` nachvollziehbar. Die GitHub-Logs enthalten die alte und neue Plugin-Version, nicht den privaten Schlüssel.

Falls erst später ein Problem auffällt: GitHub-Variable `HPZ_AUTO_DEPLOY_ENABLED` entfernen bzw. auf `false` setzen. Ein HostPress-Administrator kann dann aus dem letzten passenden `hpz-apl-*.tar.gz` die vorherige Plugin-Version wiederherstellen. Vor dem manuellen Restore den Backup-Zeitpunkt, die Installation und das Archiv prüfen; die Wiederherstellung nicht blind auf einem unbekannten WordPress-Verzeichnis ausführen.

## Reichweite und Voraussetzungen

- Läuft nur unter dem autorisierten HostPress-SSH-Konto und nachdem SSH/CHROOT/WP-CLI aktiviert wurden. Hosting-Firewall muss SSH-Verbindungen aus GitHub-Runnern erlauben.
- Das Plugin muss vor Deploy aktiv sein; sonst Abbruch statt stiller Aktivierung.
- L/U (1000080/1000081) müssen weiterhin `draft` sein; sonst Abbruch. Das bestehende Gerade-Produkt (1000083) behält den Status, den es **vor** dem Deployment hatte.
- Der bestehende WooCommerce-Shop und sein Checkout, Rechnungen und Testbestellungen werden vom Deployment nicht bearbeitet.
- Vor Auslieferung komplexer oder datenbankändernder Plugin-Architekturen ist das hier beschriebene reine Dateideployment neu zu bewerten.
