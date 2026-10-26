# Dekorkatalog 16 - historische fachliche Vorbereitung

Dieser Vorbereitungsstand aus PR #1 bleibt als Quelle erhalten. Die ausdrücklich
beauftragte Integration in 0.4.0 ist in `040-decor-integration.md` dokumentiert;
die folgenden Aussagen „nicht aktiviert“ beschreiben den früheren Stand.

Stand: 26.10.2026. Eigenstaendiger Datenbaustein `local/core/decor-catalog.mjs` auf Featurebranch `feature/dekor-katalog-16`.

## Zweck und Grenzen

- 16 Dekorcodes aus den bisherigen Nutzerreferenzen und der Speedmaster-Dekoruebersicht zugeordnet: https://www.speedmaster.at/dekore/arbeitsplatten-schichtstoff/
- Speedmaster-/Kundenbezeichnung hat Vorrang vor etwaig unterschiedlichen Herstellerbezeichnungen.
- Technische IDs `W980` und `H1145` bleiben kompatibel zum bestehenden Zweierkatalog.
- Am 26.10. wurden alle 16 Original-JPEGs vom Nutzer geliefert; daraus wurde ein separates ZIP mit Originalen und WebP-Vollbildern/Thumbnails samt decor-mapping.json erstellt. GitHub selbst enthaelt bisher nur die eindeutige Bildzuordnung und Metadaten, keine binaeren Bilddateien. Keine Preisregeln, keine Verfuegbarkeitszusagen, keine Aenderungen am Konfigurator, keine Warenkorbfreigabe.
- Die Zuordnung zu EGGER/Kaindl und einzelne Hersteller-Aliasnamen sind **vor finalem Shop-Import** gegen originalen Speedmaster-Datensatz zu pruefen. Aliasnamen sind nicht die Kundenanzeige.

## Importanforderungen fuer spaeteren Entwicklungsschritt

1. Die 16 Original-Dekorbilder sind als Nutzerupload vorhanden. Die Datei `hpz-dekore-16-speedmaster.zip` enthaelt Originale, unverfaelschte WebP-Umwandlungen und `decor-mapping.json`. Die Bilder beim spaeteren UI-Einbau aus dem separaten Paket uebernehmen, keine Hotlinks und keine kuenstlich erzeugten Muster. Vor Shopveroeffentlichung Nutzungsrechte klaeren.
2. Alle gelieferten Bilder sind quadratisch; 15 mit 1000 x 1000 px, 44375 mit 500 x 500 px. Exportdateien sind `<id>.webp` und `<id>-thumb.webp` (480 px). Referenzen liegen als `imageFilename`, `thumbnailFilename` und `sourceFilename` in `local/core/decor-catalog.mjs`. Keine eigenstaendige Aenderung an Original-Textur oder Farbe.
3. Responsive zwei Spalten mobil/mehr am Desktop, klare Auswahlzustaende, optional Suche nach Code/Bezeichnung; fuer 16 Eintraege keine unnoetigen Filterstufen.
4. Eine Dekorauswahl darf erst nach ausdruecklicher Integrationsfreigabe in `local/core/config.mjs`, `component.mjs`, gebuendelte WordPress-Assets und Tests gelangen. Work entwickelt aktuell die Ecken separat, Konflikte vermeiden.
5. Die bereits separat gesammelten Referenz-EKs (bei 2000x600 mm je 17,5/38 mm) sind **keine** Preisregel; Preisentwicklung/Verkaufssperren nicht veraendern.

## Pruefungen vor der Kundenfreigabe

- Alle 16 Codes einzeln gegen aktuelle Speedmaster-Angebots-/Dekorauswahl abgleichen.
- Produktverfuegbarkeit je Staerke und Moeglichkeit an bestimmten Abmessungen pruefen; aus Katalogpraesenz allein keine generelle Fertigungsfreigabe ableiten.
- Bildrechte und exakte Bild-zu-Code-Zuordnung dokumentieren.
- Nach UI-Einbau: Datenpersistenz, Dekorwechsel, wiederholtes Mounten, WordPress-Einbettung, mobile Ansichten, Servervalidierung und Rueckwaertskompatibilitaet testen.

## Finale Kundennamen (26.10., vom Nutzer akzeptiert)

Nur `displayName` in Dekorkacheln und Kundenansichten zeigen. `supplierCode` und `supplierName` intern fuer Bestellung, Kalkulation und Zuordnung aufbewahren. Die 16 kurzen Kundennamen stehen im Katalogmodul Version 1.1.
