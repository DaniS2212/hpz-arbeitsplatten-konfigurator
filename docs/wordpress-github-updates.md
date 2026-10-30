# Arbeitsplatten-Konfigurator: GitHub-Updates ohne HostPress

**Stand:** 30.10.2026. Das ist ausschliesslich fuer das private Repository `DaniS2212/hpz-arbeitsplatten-konfigurator` und das WP-Plugin `hpz-apl-admin-preview` auf holzplatten-zuschnitt.de.

## Einmalig einrichten

1. **Nach PR #25 und gruenem GitHub Actions-Lauf:** Unter GitHub -> Releases die neueste Release `hpz-apl-v...` oeffnen. Die einzelne ZIP `hpz-apl-admin-preview-....zip` herunterladen (nicht GitHub `Code -> Download ZIP`).
2. Im WordPress-Backend `Plugins -> Installieren -> Plugin hochladen` die ZIP einmalig ueber die installierte Version spielen. Bestehende WordPress-Einstellungen und Produkte bleiben erhalten. Nicht die ZIP eines GitHub-Actions-Artifacts mit doppelter Verpackung verwenden.
3. Mit dem GitHub-Konto, das Zugriff auf das PRIVATE Repository hat, unter GitHub -> Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens einen Token erstellen. Resource owner passend zu `DaniS2212`, nur Repository `hpz-arbeitsplatten-konfigurator` waehlen, Repository permission **Contents: Read-only**, alle anderen Berechtigungen auf Standard/kein Zusatz. Token nicht in Chat, Issues oder PRs versenden und Ablaufdatum merken.
4. Im WordPress-Backend `Einstellungen -> Arbeitsplatten-Updates` den Token in das Passwortfeld eingeben, `Updates automatisch installieren` anhaken und speichern. Das Passwortfeld bleibt nach dem Speichern leer und zeigt nur an, dass ein Token vorhanden ist.
5. Unter `Dashboard -> Aktualisierungen` die Updatepruefung anstossen oder auf die naechste WordPress-Cron-Pruefung warten. WordPress prueft in der Regel zweimal pro Tag. Unter `Werkzeuge -> Website-Zustand` sicherstellen, dass geplante Aufgaben funktionieren.

Ab dann: Ein Merge in `main` erzeugt bei gruenen Tests eine neue private Release-ZIP. WordPress erkennt diese ueber die normale Update-Suche und installiert sie im Rahmen der WordPress-Auto-Updates. **Keine SSH-Konsole und kein HostPress-Zugang erforderlich.**

## Sicherheit und Grenzen

- Der GitHub-Token ist auf die Lese-Berechtigung fuer genau dieses Repo beschraenkt, wird nur serverseitig gespeichert und nicht in Links oder Kundenwebseiten ausgegeben. WordPress speichert ihn in seiner Datenbank (nicht verschluesselt); auf verschluesselte Backups und die Admin-Rechte achten. Bei Tokenablauf oder -entzug stoppt die Update-Erkennung sicher.
- GitHub Actions veroeffentlicht eine ZIP erst nachdem PHP/WooCommerce-, Node- und Chromium-Pruefungen erfolgreich waren. Der Update-Client nimmt nur diese private Release-Asset-Datei mit verifiziertem SHA-256 an.
- WordPress 6.6 oder neuer ist fuer *automatische* Aktualisierungen Voraussetzung (native Ruecksetzung bei Installationsfehler bzw. kritischem PHP-Fehler). Das ist kein permanent aufbewahrtes Versionsbackup; bei einem fachlich fehlerhaften, aber technisch startenden Update muss bei Bedarf die vorherige Release-ZIP manuell installiert werden. Hosting-Backups bleiben sinnvoll.
- Wenn automatisches Aktualisieren serverseitig untersagt ist, der WordPress-Cron nicht arbeitet, die Dateirechte fehlen oder der Server keine HTTPS-Anfragen an GitHub absetzen kann, reicht ein Admin-Zugang alleine nicht aus. Der Updater ueberspringt dann den Vorgang, anstatt Verkaufseinstellungen zu aendern.
- Der Updater aendert weder die Produktveroeffentlichung noch Konfigurator-Freigaben. Gerade (1000083) bleibt an die vorhandenen WooCommerce-Freigaben gebunden. L (1000080) und U (1000081) bleiben Entwuerfe.

## Fuer Entwickler

- Release workflow `.github/workflows/hpz-wordpress-updates.yml` laeuft bei PR (nur Checks), `push main` oder manueller Ausloesung auf main (Checks und bei Erfolg Release).
- Release-Tag muss `hpz-apl-vX.Y.Z.RUN` lauten, Release-Asset `hpz-apl-admin-preview-X.Y.Z.RUN.zip`; die SHA-256 steht in GitHubs Release-Asset-Metadaten.
- `Update URI` identifiziert nur das Plugin; `update_plugins_github.com` liefert private Updates, `upgrader_pre_download` faengt nur den exakten Release-API-Link ab.
- Die vertraulichen GitHub-Anmeldedaten werden niemals an den per 302 gelieferten Datei-Host gesendet. Nur bekannte HTTPS-CDN-Hosts sind zugelassen.
- Versionen werden zur Buildzeit gestempelt und die JS/CSS-Bundle-Imports neu gebaut; der Git-Quellstand bleibt mit der Baseline-Version (z.B. 1.0.3) reviewbar.

## Update-Status und Versionsdetails (ab PR #29)

Unter **Einstellungen → Arbeitsplatten-Updates** gibt es zusätzlich eine Statusübersicht mit
installierter Version, zuletzt verifizierter GitHub-Release-Version, Zeit der letzten
Abfrage und einer einfachen Fehlerdiagnose (beispielsweise unzugänglicher Release,
ungültige Prüfsumme oder abgelaufener Token). Die gespeicherten Statusdaten enthalten
**keine Zugangstoken, Download-URLs oder GitHub-Antwortkörper**.

Der Button **„Jetzt auf Updates prüfen“** ist nur für WordPress-Administratoren
verfügbar und durch ein Nonce geschützt. Er verwirft lediglich den WordPress-
Updatecache und führt die native Plugin-Updateprüfung erneut aus. **Er installiert
keine ZIP und veröffentlicht keine Produkte.** Die tatsächliche Installation läuft
weiterhin über das WordPress-Update-Menü beziehungsweise dessen aktivierte
zeitgesteuerte automatische Plugin-Updates.

Der Link **„Details der Version …“** öffnet nun eine eigene WordPress-
Plugininformationsansicht für den exakten Slug `hpz-apl-admin-preview`.
Dadurch erfolgt kein fehlgeschlagener Nachschlag bei WordPress.org („Plugin not found“).
Das Fenster zeigt nur geprüfte Release-Metadaten und fest eingetragene allgemeine
Hinweise; es stellt **keinen freien oder ungesicherten Downloadlink** bereit.
Wenn die GitHub-Abfrage nicht funktioniert, zeigt es ausschließlich die lokal
installierte Version und eine sachliche Fehlermeldung. Der private ZIP-Download,
SHA-256-Abgleich und das WordPress-Rollback bleiben unverändert.

Bei einer bloßen Updateprüfung oder automatisch installiertem Plugin können
GitHub-Stand und WP-Stand zeitweilig auseinanderliegen. Das ist normal, solange
WordPress noch keinen Installationslauf durchgeführt hat; ein manuelles „Prüfen“
startet bewusst **keine** sofortige Installation.
