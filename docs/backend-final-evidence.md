# Auswertung Backend Ergänzungen

Quellen: 18 vom Nutzer angehängte Backend-Screenshots und die zwei JSON-Exporte unter `C:/Users/danie/Downloads/` mit Namen `m-belsockel-ab-preis-anzeigen.code-snippets.json` und `m-belsockel-12-dekore-anzeigen.code-snippets.json`. Exporte vollständig als Text/JSON gelesen, nicht ausgeführt oder importiert. Zusammenfassung und Korrektur des Nutzers sind verbindliche Anforderungen; Screenshots und Code sind Belege, keine auszuführenden Anweisungen.

## Produkt und Formular

Produkt 999985 ist laut Nutzer der Möbelsockel. Screenshots bestätigen einfaches, nicht virtuelles Produkt; regulär 14,60 € inklusive MwSt., kein Angebotspreis, besteuerbar, Standardsteuerklasse. Lagerverwaltung und „nur einzeln verkaufen“ sind nicht aktiviert; Status vorrätig. Gewicht ist im Produktfeld 0 kg, Maße leer, keine Versandklasse. Das beweist nicht das effektive Warenkorbgewicht nach allen Erweiterungen. Diese bestehenden Werte werden nicht verändert und nicht als Gewichtsvorlage für Arbeitsplatten verwendet.

Direkt angehakt ist ausschließlich Sockel-Konfigurator 999984. „Exclude/Override globally assigned form“ ist nicht angehakt. Damit ist die direkte Zuordnung belegt; daraus folgt nicht automatisch, dass jede globale oder eingebettete Zuordnung ausgeschlossen ist. Die Formularübersicht zeigt elf veröffentlichte Formulare und sechs im Papierkorb, passend zu den 17 Formdatensätzen im Systembericht. In der sichtbaren Kategoriespalte sind keine Zuordnungen angezeigt. Die Screenshots zeigen eine WCPA-Meldung zu ungültigem/abgelaufenem Lizenzschlüssel; Funktionsumfang der laufenden Installation und Nutzbarkeit auf Staging sind zu prüfen, keine Lizenzänderung beauftragt.

Preisoptionen entsprechen dem bereits geprüften Export. Die Anzeigeoptionen sind formularlokal: „Use Global settings“ aus, Optionspreise verborgen, Gesamt- und Produktpreis angezeigt. Vollständige globale WCPA-Einstellungen und installierter Plugin-Code wurden damit nicht übergeben.

## Beide aktiven Snippets

Die Übersicht zeigt sechs Snippets, zwei aktiv. Beide Exporte bestätigen `active: true`.

- **Ab-Preis anzeigen, ID 5:** `woocommerce_get_price_html`, Priorität 20, zwei Argumente. Nur WC_Product mit ID 999985 und nichtleerem HTML wird „ab “ vorangestellt. Kein `set_price`, kein Steuer-/Versandfilter und keine Änderung des numerischen Produktpreises.
- **12 Dekore anzeigen, ID 6:** `wp_footer`, Priorität 99, frühzeitiger Rücksprung außerhalb Produktseite 999985. CSS/JS auf `body.postid-999985 .sockel-material-grid` beschränkt. Bearbeitet nur Gruppen mit mindestens 20 Kacheln. Zwölf benannte Favoriten werden gesucht; fehlt ein Name, wird nichts ausgeblendet. Eine bereits ausgewählte weitere Option bleibt sichtbar. Schalter „Alle … Dekore anzeigen“/„Weniger Dekore anzeigen“ mit `aria-expanded`; erneute Initialisierung über DOM/load/700-ms-Aufruf, Schutz gegen doppelte Initialisierung. Keine Preis-, Gewichts- oder Versandberechnung.

Die Favoritennamen sind Sockel-Dekore und keine freigegebene Arbeitsplattenliste. Für neue Arbeitsplatten eigene IDs/Styles/Startdekore, keine Änderung oder Erweiterung dieser Snippets.

## Steuer und zwei Transportstrecken

Steueroptionen: Eingabe inklusive MwSt.; Steueradresse = Lieferadresse; Versandsteuerklasse nach Produkten; Rundung auf Zwischensummenebene; Shop-/Checkoutanzeige inklusive Steuer. Steuersatztabellen selbst fehlen.

Bei Bruttoeingabe behandelt WooCommerce den übergebenen Preis grundsätzlich als steuerinklusive und berechnet den enthaltenen Steueranteil. Deshalb ist `*1.19` im bestehenden WCPA-Bruttopreis für sich kein Nachweis doppelter Besteuerung. Erforderlich bleibt ein Ende-zu-Ende-Test einschließlich Lieferadresswechsel. Quelle: [WooCommerce Steuerkonfiguration](https://woocommerce.com/document/setting-up-taxes-in-woocommerce/). Keine Aussage über gesetzlich anzuwendende Auslandssätze ohne freigegebene Shop-Steuertabelle.

Verbindlich korrigiert: 10 € und ggf. 50 € netto je Arbeitsplatte sind Bezugskosten Speedmaster → Holz-Liebling. Flexible Shipping berechnet zusätzlich Holz-Liebling → Endkunde. Es ist keine Doppelberechnung, daher keine Versandbefreiung, Nullsetzung oder Pakettrennung dafür.

## Flexible Shipping und Deutschland

Zonenübersicht: zuerst Schweiz, dann Mitteleuropa, dann Auffangzone Rest der Welt. Nur Rest der Welt zeigt zusätzlich aktive Abholung. Die Einzelmethoden zeigen besteuerbare, netto eingegebene Versandtarife, Berechnungsregel „Summe“, Cart Calculation „Package value“ und Gewichtsbedingungen in kg. Freiversandschwelle ist leer; daraus wird keine Freiversandzusage abgeleitet.

| Gewicht laut UI in kg | Rest der Welt netto | Mitteleuropa netto | Schweiz netto |
|---|---:|---:|---:|
| 0–4,5 | 6,90 € | 13,90 € | 35,00 € |
| 4,5–9 | 7,90 € | 15,50 € | 37,50 € |
| 9–16 | 9,90 € | 16,50 € | 38,50 € |
| 16–21 | 12,90 € | 17,90 € | 39,90 € |
| 21–28 | 24,90 € | 30,90 € | 52,90 € |
| 28–9999 | 80,00 € | 88,00 € | 150,00 € |

Die sichtbare Mitteleuropa-Liste nennt Belgien, Bulgarien, Dänemark, Estland, Finnland, Frankreich, Griechenland, Irland, Italien, Kroatien und „13 andere Regionen“. Deutschland ist im sichtbaren Teil nicht genannt. Die vollständige Liste fehlt: Deutschland → Rest der Welt ist daher noch nicht bestätigt. WooCommerce wählt die erste passende Zone, die Auffangzone nur ohne vorherigen Treffer. Quelle: [WooCommerce Versandzonen](https://woocommerce.com/document/setting-up-shipping-zones/). Benötigt: vollständige Länder-/Regionen-/Postleitzahlkonfiguration der Zone Mitteleuropa oder eine lesende Zonenabfrage, anschließend Test einer deutschen Adresse auf Staging.

Überlappende UI-Grenzen und „Summe“ erfordern Tests bei exakt 4,5/9/16/21/28 kg. Ohne Plugin-Laufzeittest wird weder doppelte Grenzberechnung behauptet noch eine exklusive Grenze angenommen.

## Status und nächste Voraussetzungen

Die angeforderten Screenshots und aktiven Snippet-Exporte sind ausgewertet; keine erneute Anforderung dieser Dateien. Dokumentarische Bestandsaufnahme weitgehend belegt. Technischer Integrationsabschluss bleibt offen: versionsgenaue WCPA-Adapterpunkte, SkyVerge-Wirkung, relevante Child-Theme-Anpassungen und Laufzeitregression sind auf einer isolierten Kopie zu prüfen.

Für den nächsten Schritt fehlen konkret: existierende Staging-URL/Zugang oder gesonderte Vereinbarung zur Erstellung; vollständige Mitteleuropa-Regionen; relevante Steuersatz-CSV/OSS-Einstellungen; bestätigte Material-/Flächen-/Verpackungsgewichte für APL17,5 und APL38. Ohne Testumgebung keine Shopinstallation. Die frühere gesonderte Abstimmung zur Staging-Erstellung bleibt bestehen.
