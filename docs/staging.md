# Testumgebung Vorbedingungen

**Aktualisierung:** Hosting-Anbieter HostPress GmbH, Portal https://my.hostpress.de/, Verwaltung Plesk. Zugang liegt bei Marco. Der Nutzer hat die Erstellung vorerst zurückgestellt und lokale Entwicklung freigegeben. Es wird jetzt keine Hosting-Aktion erwartet. Die folgende ursprüngliche Anforderung nach dem Hosting-Anbieter ist damit erledigt; technische Isolations-/Integrationstests bleiben für die spätere gemeinsame Einrichtung bestehen. Lokaler Stand: `local-development.md`. Kein Staging angelegt.

Status: Vorbereitung dokumentiert, keine Testumgebung angelegt oder verbunden. Die gesonderte Abstimmung zur Staging-Erstellung aus der Nutzeranweisung bleibt erforderlich.

## Aktueller Zugriffsbefund

Im Projekt sind keine WordPress-Kopie, keine Staging-Adresse und keine Hosting-Konfiguration vorhanden. PHP und Docker sind im aktuellen Suchpfad nicht verfügbar; Git und Node sind vorhanden. Das ist keine vollständige Maschineninventur, reicht aber nicht für eine vorhandene lokale WooCommerce-Testumgebung. Die verfügbaren Verbindungen liefern bislang keinen bestätigten Hosting-/Dateizugang für diesen Shop. Deshalb wird keine fremde Plattform als vermeintliches Staging eingerichtet.

## Konkret benötigte Nutzeraktion

Bitte entweder die URL einer vorhandenen Testkopie nennen oder den Hosting-Anbieter und Namen des Hosting-Panels mitteilen. Bei vorhandener Kopie sind danach ein eigener WordPress-Testzugang und ein auf deren Verzeichnis begrenzter Datei-/Deploymentzugang nötig. Zugangsdaten nicht in die Dokumentation schreiben.

Wenn keine Testkopie existiert, kann der Hoster eine geschützte Kopie des Shops bereitstellen. Vor deren erstem normalen Start müssen ausgehende E-Mails, reale Zahlungen, Sendcloud/Fulfillment, produktive Webhooks und geplante Hintergrundaktionen isoliert sein. Eine gewöhnliche ungeschützte 1-Klick-Kopie ist noch kein geprüfter Testbetrieb. Hosting-spezifische Klickanweisungen folgen erst nach Identifikation des Panels; keine Einstellungen am Liveshop verändern.

## Abschluss von Aufgabe 1 auf der Testkopie

1. Versionsstand und kopierte Formular-/Produktzuordnungen mit der Bestandsaufnahme vergleichen.
2. WCPA-Plugin-Dateien, relevante Child-Theme-Dateien und SkyVerge-Einstellungen nur lesen; konkrete Adapterpunkte und Preisreihenfolge dokumentieren.
3. Vollständige Versandregionen und Steuertabellen aus der Kopie prüfen; Deutschland nicht aus der verkürzten Liste ableiten.
4. Sockel- und Standardprodukt-Baseline unter sicherem Testbetrieb erfassen. Erst mit diesen Ergebnissen Aufgabe 1 technisch abschließen.

Diese Prüfpunkte ersetzen zusätzliche Screenshot-Anforderungen, soweit die vollständige Testkopie verfügbar ist. Materialgewichte, Geometrienachweise und endgültige Preisformeln bleiben davon unabhängige Lieferantendaten.

Nächster operativer Schritt: Nutzer benennt eine vorhandene Staging-URL und einen geeigneten Zugang. Falls keine Kopie existiert, werden Hosting-Möglichkeit und isolierte Erstellung zuerst konkret abgestimmt. Kein Produktionszugang wird zum Schreiben verwendet.

Vor Installation: getrennte Datenbank/Dateien/Cache, Zugriffsschutz, Suchmaschinen-Ausschluss, E-Mail-Abfang, Testzahlungen, keine realen Sendcloud-/Fulfillment-Aufträge, keine schreibenden produktiven Webhooks oder Hintergrundaktionen. Bestehende Shop-Konfiguration und WCPA-Dateien versionsgleich verfügbar machen. WCPA-Lizenznutzbarkeit auf Staging prüfen; Live-Lizenz unverändert lassen.

Auf der Kopie zuerst: bestehenden Sockelpreis und Versandfluss als Baseline messen, WCPA-Adapterpunkte und SkyVerge-/Child-Theme-Einfluss lesen, deutsche Zonenzuordnung sowie Steuerfluss prüfen. Dann die nach Plan freigegebenen neuen Produkte und eigene Erweiterung umsetzen. Fehlende Gewichts-/Geometrie-/Preisregeln erlauben keine Verkaufsfreigabe.
