# Dekorkatalog 16 - fachliche Vorbereitung (nicht aktiviert)

Stand: 26.10.2026. Eigenstaendiger Datenbaustein `local/core/decor-catalog.mjs` auf Featurebranch `feature/dekor-katalog-16`.

## Zweck und Grenzen

- 16 Dekorcodes aus den bisherigen Nutzerreferenzen und der Speedmaster-Dekoruebersicht zugeordnet: https://www.speedmaster.at/dekore/arbeitsplatten-schichtstoff/
- Speedmaster-/Kundenbezeichnung hat Vorrang vor etwaig unterschiedlichen Herstellerbezeichnungen.
- Technische IDs `W980` und `H1145` bleiben kompatibel zum bestehenden Zweierkatalog.
- Diese Phase enthaelt nur Metadaten, keine Dekorbilder, keine Preisregeln, keine Verfuegbarkeitszusagen, keine Aenderungen am Konfigurator, keine Warenkorbfreigabe.
- Die Zuordnung zu EGGER/Kaindl und einzelne Hersteller-Aliasnamen sind **vor finalem Shop-Import** gegen originalen Speedmaster-Datensatz zu pruefen. Aliasnamen sind nicht die Kundenanzeige.

## Importanforderungen fuer spaeteren Entwicklungsschritt

1. Freigegebene Original-Dekorbilder je Lieferantencode beschaffen, bevorzugt aus dem offiziellen Lieferanten-Medienpaket. **Kein Hotlinking, keine Screenshots als Produktionsbild, keine AI-generierten Fantasie-Muster.** Nutzungsrechte und Attribution pruefen.
2. Je Dekor mindestens eine gut lesbare Kachel-/Detailtextur mit konsistenter Skalierung, Farbraum und grob einheitlichem Bildzuschnitt. Eindeutige lokale Dateinamen anhand von `imageKey`; Bilddaten nicht mit Namen allein behaupten.
3. Responsive zwei Spalten mobil/mehr am Desktop, klare Auswahlzustaende, optional Suche nach Code/Bezeichnung; fuer 16 Eintraege keine unnoetigen Filterstufen.
4. Eine Dekorauswahl darf erst nach ausdruecklicher Integrationsfreigabe in `local/core/config.mjs`, `component.mjs`, gebuendelte WordPress-Assets und Tests gelangen. Work entwickelt aktuell die Ecken separat, Konflikte vermeiden.
5. Die bereits separat gesammelten Referenz-EKs (bei 2000x600 mm je 17,5/38 mm) sind **keine** Preisregel; Preisentwicklung/Verkaufssperren nicht veraendern.

## Pruefungen vor der Kundenfreigabe

- Alle 16 Codes einzeln gegen aktuelle Speedmaster-Angebots-/Dekorauswahl abgleichen.
- Produktverfuegbarkeit je Staerke und Moeglichkeit an bestimmten Abmessungen pruefen; aus Katalogpraesenz allein keine generelle Fertigungsfreigabe ableiten.
- Bildrechte und exakte Bild-zu-Code-Zuordnung dokumentieren.
- Nach UI-Einbau: Datenpersistenz, Dekorwechsel, wiederholtes Mounten, WordPress-Einbettung, mobile Ansichten, Servervalidierung und Rueckwaertskompatibilitaet testen.
