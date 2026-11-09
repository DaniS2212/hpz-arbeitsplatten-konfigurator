# Minimalistischer Arbeitsplatten-Konfigurator – UX-Anpassungen 09.11.2026 (PR #76)

> Diese UX-Überarbeitung wird **vor** den zwei verbliebenen WordPress-/Woo-Schritten umgesetzt. Referenz sind **acht vom Betreiber am 09.11.2026 bereitgestellte Screenshots** der L-Produktseite und der drei Konfigurationsschritte. Die Screenshots werden nicht als separate GitHub-Binärdateien behauptet. Der Betreiber legt Wert auf **wenig Text, auf einen Blick verständliche Bedienung auch für ältere Kunden, visuelle Qualität und schnelle Fertigstellung**.

## Anforderungen und Umsetzung

| Anforderung | Implementierung und Verhalten |
|---|---|
| Großer WooCommerce-Produktblock raus, nur H1 behalten | `wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php`: **nur** auf den drei Woo-Konfiguratorprodukten und nur bei tatsächlich verfügbarer Admin-Test- oder separat freigegebener öffentlicher Ansicht Galerie, Standardbeschreibung, Preisbox, normaler Warenkorbbutton, Meta und Tabs ausblenden; aus dem Woo-Titel eine kompakte H1 oberhalb des eingebetteten Konfigurators anzeigen. **Nicht** auf andere Produkte, ohne Freigabe und bei abweichendem Shortcode-Layout anwenden. |
| Radikale Textreduktion | Kicker `Schritt X von 3`, doppelte Abschnittsüberschriften und Einleitungstexte, Skizzenüberschrift `... Planung`, technisches Vorwissen, Maßregler, Vorschaulegende und doppelte Kaufzusammenfassungs-Headlines **nicht mehr sichtbar**. Hilfe bleibt als optionale Dialogfunktion, nicht im Kaufpfad. |
| Drei Schritte, Einheit einmal | Navigation: Ecken bzw. Grundriss, **Maße in cm**, Oberfläche. Die Zahl 1/2/3 und die Schrittnamen sind sichtbare Orientierung. |
| Zwei Oberflächenkacheln vereinigen | Nach Stärke/Dekor bleibt nur eine gewählte-Oberflächen-Kachel mit Farbprobe, Dekorname, Stärke und **„1,5 mm dekorgleiche Kanten inklusive“**. Kein zweiter Edge-Infokasten. |
| Zusammenfassung kompakt | Max. Form, relevante Längen/Breiten, Oberfläche und nur bei Auswahl die konkreten Ecken; Anzahl, Preis und Kaufbutton bleiben unverändert. Keine wiederholten Material-/Dekorwerbetexte. |
| Skizzenmaße direkt bearbeiten | `local/public/component.mjs` `openInlineMeasure()`: SVG-Maßlabel per Tap/Klick/Enter/Space öffnet über dem Maß ein cm-Feld; der Wert aktualisiert **denselben** Eingabewert im regulären Maße-Schritt und triggert dieselbe Vorschau und Preisvalidierung. **Enter** abschließen, **Escape** letzten Wert wiederherstellen; linke L3/L4 Breiten **B1/B2**, Eckbreiten **B3/B4** synchronisiert. Kein zweiter Datenbestand. |
| Fehlerausgabe vereinfachen | `local/core/measure-feedback.mjs` berechnet in kundenverständlichen **cm** einen konkreten ersten Verstoß (z. B. `L1: Erlaubt sind 100–400 cm. Eingegeben: 50 cm.`). Exakt **ein sichtbarer Fehlerhinweis**; betroffene Eingabe wird markiert; alte gültige Skizze bleibt mit verringerter Deckkraft erkennbar. Fehlende/ungültige Eingabe sperrt Preis-/Warenkorb. Keine dreifachen Warntexte oder stummen Größenkorrekturen. Der Server bleibt maßgeblich. |
| Geometrie dynamisch | Node: Längen bei Gerade, L1–L4, U1–U4 verändern tatsächlichen Konturpfad und SVG, Breiten ebenfalls; U1–U4 reagieren auf L3. Bestehende Speedmaster-Fotomodell-/Stoßtests und PHP-Checks dürfen nicht gebrochen werden. |
| Mobil bedienbar | SVG-Maßfelder bleiben im Mobile-Viewport groß genug zum Tippen und haben sichtbare Fokus-/Hover-Hervorhebung; Eingaben sind echte `input`-Felder mit Accessible Label, nicht bloß fake SVG-Text. |

## Technische Grenzen und Checkout-Sicherheit
- **Nur gemeinsame Kundendarstellung** und exakt eingegrenztes Woo-Produkte-Template; keine Änderung der V3-EK-Formeln, 1900-mm-Speditionsregel, 16 Dekore, Materialstärken, Signatur, Zahlungsarten, Fertigung oder Woo-Sale-Flags.
- `component-template.mjs`, `component.mjs`, `geometry.mjs`, `measure-feedback.mjs` sind kanonische Quellmodule. `build-plugin.mjs` erzeugt die kopierten WP-Assets; `design/kuechenstudio-060.css` ist die kanonische CSS-Quelle. Änderungen **niemals nur** im installierbaren WP-Bundle machen.
- Das gezeichnete letzte gültige L/U-Schema ist eine **Voransicht**, keine CNC-Zuschnitt-/Verbindungsgarantie. Bei bewusst ungültiger Eingabe werden die letzten gültigen Skizzenwerte **nicht** als aktuelle Maße oder Angebot verkauft.
- Die **öffentlich kaufbare L/U-Freigabe bleibt zu**. PR #76 ist UX-Feinschliff, nicht Shopstart. Für den Checkout muss weiterhin die echte Woo-Version, Steuer, Versand, Nebenkosten, Rabattfloor und die manuellen Bestellmetadaten geprüft werden.

## Akzeptanz und Übernahme
1. PHP-, Node-, Plugin-Bundle-, Dekor-/Chromium- und WordPress-Browserprüfungen müssen auf dem PR-Head erfolgreich sein. Darunter neuer `local/test/minimal-ui-inline-measures.test.mjs` (9 Formen, Maße/Breiten, genaue Grenzen), `wordpress/a1-browser-test.mjs` (tatsächliche SVG-Klick-Direkteingabe), `wordpress/invalid-measures-browser-runner.mjs` (nur ein Fehlerhinweis) und `wordpress/top-cta.test.php` (nur H1 + scoped Woo-Verhalten).
2. Vor endgültiger optischer Abnahme in WordPress tatsächlich **einmal auf Desktop und Handy** H1-only über dem Konfigurator, korrektes Flächenlayout, Popup bei Anklicken einer Skizzenzahl, unveränderte Kontur und Lesbarkeit prüfen. CI kann die reale Flatsome-Theme-Produktseite nicht vollständig beweisen.
3. Danach **A** WordPress-Preis-/Nebenkosten-/Woo-Steuer-/Versandprüfung, **B** kontrollierter signierter Testcheckout samt Bestellmetadaten und bewusster öffentlicher Freigabe. Keine neue große Speedmaster-Preisentwicklung.

**Betreiberentscheidung:** UX zuerst, dann A/B. Die bis PR #75 abgeschlossene allgemeine Preisentwicklung nicht wieder aufrollen.
