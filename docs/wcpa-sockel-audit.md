# Lesende Prüfung WCPA Sockel Export

Quelle: `C:/Users/danie/.codex/attachments/e1a23e42-2e79-4f6f-bf5c-c72418d9741e/Eingefügter Text.txt`; Screenshot `C:/Users/danie/AppData/Local/Temp/codex-clipboard-e4adb9f2-02d6-4b18-b242-56713e323a57.png`.

Der Base64-Inhalt wurde ausschließlich als Daten dekodiert. Aus der PHP-Serialisierung wurde das Feld `form_json` anhand seiner angegebenen UTF-8-Bytelänge von 175832 Bytes gelesen und als JSON geparst. Keine Formeln ausgeführt, keine PHP-Objekte deserialisiert, kein Shop-Import. Titel des Exports: Sockel-Konfigurator. Der Export enthält form_json, title, wcpa_settings und other_settings; eine konkrete WooCommerce-Produktzuordnung ist darin nicht belegt.

## Formularstruktur

| Feld | Element-ID | Befund |
|---|---|---|
| Sockelausführung | wcpa-image-group-1791533200001 | Fünf Bilder: Vorne, Vorne + links, Vorne + rechts, U-Form, Rundum; Preiswerte 1/3/4/5/6, Vorne vorausgewählt |
| Materialart | wcpa-radio-group-1791533200002 | Dekor / Furnier; Dekor vorausgewählt |
| Dekor auswählen | wcpa-image-group-1791533200003 | 66 Optionen mit eigenen Preisformeln; materialabhängige Sichtbarkeit |
| Furnier auswählen | wcpa-image-group-1791533200004 | 11 Optionen mit eigenen Preisformeln; bedingte Sichtbarkeit aktiviert |
| Länge (cm) | wcpa-number-1791533200005 | 14–276 cm, Schritt 0,1, Vorgabe 180 |
| Tiefe (cm) | wcpa-number-1791533200006 | 15–200 cm, Schritt 0,1, Vorgabe 50; hide-Regel für Vorne |
| Höhe (cm) | wcpa-number-1791533200007 | 6–100 cm, Schritt 0,1, Vorgabe 10 |
| Bestellhinweis | wcpa-text-1791533200008 | optionales Textfeld |

Acht Felder, acht eindeutige Element-IDs. Alle im JSON gefundenen Formelreferenzen `{field.ID.value}` beziehungsweise `{field.ID.price}` zeigen auf vorhandene Element-IDs. Dies ist eine Strukturprüfung, kein Laufzeittest der Formeln oder Sichtbarkeitslogik. Maßgrenzen und Dekorauswahl gelten nur für diesen Sockelexport, nicht für Arbeitsplatten.

## Preisoptionen und Screenshotabgleich

`pric_overide_base_price_if_gt_zero=true`: Grundpreis ersetzen, wenn Optionspreis größer null. Das entspricht dem gesetzten Häkchen im Screenshot. Die übrigen dort sichtbaren Preisoptionen sind nicht angehakt; der Export bestätigt:

- `pric_overide_base_price=false`, `pric_overide_base_price_fully=false`.
- `pric_use_as_fee=false`, `pric_cal_option_once=false`.
- `exclude_from_discount=false`, `bind_quantity=false`.

Das ist ein formularbezogener Befund. Andere globale Einstellungen, Produktpreise, Steuerklassen und zusätzliche Preis-Hooks sind dadurch nicht ausgeschlossen.

## Wesentliche Preisabhängigkeiten

Alle 66 Dekor- und elf Furnierformeln enthalten die Faktoren `*1.30` und `*1.19`. Die untersuchte Formelstruktur rechnet cm-Eingaben mit Faktor 10 um und enthält Flächen-/Kanten-/Verbindungsanteile, 10 € und einen bedingten 50-€-Anteil bei 1900 mm. Die Auswahlpreise der Sockelausführung werden in Bedingungen als Formkennzeichen verwendet; am Formelabschluss wird der betreffende Auswahlpreis wieder abgezogen. Die konkreten Formeln sind damit an diese IDs und Preiswerte gekoppelt.

Folgerung für Arbeitsplatten: Eigene Formular-IDs und fachliche Formkennzeichen verwenden, keine Übernahme der Sockel-Auswahlpreise als zusätzliche Gebühren. Bestehende Sockelformeln und Einstellungen unverändert lassen. Der enthaltene Faktor 1,19 belegt nicht von sich aus eine doppelte Steuer: Dafür fehlen Preiseingabebasis, Steuerklasse, WCPA-Steueroptionen und mögliche Zusatzhooks. Diese Angaben sind jetzt prioritär zu prüfen.

Formeln referenzieren außerdem einen Kennwert 2, der in den fünf angebotenen Sockelausführungen nicht vorkommt. Das wird als ungenutzter Zweig dokumentiert, nicht automatisch als Defekt oder Reparaturauftrag behandelt.

## Nachgereichte Belege und verbleibende Prüfung

Die Produktzuordnung, Steueroptionen und beide aktiven Snippets wurden inzwischen geliefert und in `backend-final-evidence.md` ausgewertet. Produkt 999985 verwendet direkt Formular 999984; Bruttoeingabe ist bestätigt. Damit ist der Formel-Faktor 1,19 grundsätzlich mit der Eingabebasis vereinbar, kein alleiniger Beleg doppelter Besteuerung. Die früher als offen genannten Steuerbasis und Snippet-Inhalte sind dokumentarisch geklärt; Laufzeitprüfung und konkrete Auslandssätze bleiben offen.

Bezugskosten 10/50 € betreffen ausschließlich Speedmaster → Holz-Liebling; regulärer Kundenversand bleibt zusätzlich erhalten. Weitere Formular-/Preisinteraktionen und tatsächliche Versand-/Steuerwirkung werden auf Staging geprüft. Keine Live-Änderung und kein Staging angelegt.
