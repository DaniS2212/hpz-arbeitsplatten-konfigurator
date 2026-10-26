# Version 0.6.5 – letztes gültiges Maß statt verschwundener Zeichnung

26. Oktober 2026, WordPress-Admin-Test. Bei L2 = 51 cm (statt maximal 50 cm) wurde vorher die komplette Kontur entfernt. Das war sicher, aber für Kunden unnötig verwirrend.

## Abnahme

- Bei ungültiger Eingabe bleibt ausschließlich die **letzte gültige Geometrie** sichtbar; Hinweis an der Zeichnung: „Letzter gültiger Stand“. Das neue ungültige Maß wird ausdrücklich **nicht** als gezeichnet oder bestellbar dargestellt.
- Das betroffene Eingabefeld erhält `aria-invalid=true`, roten Rahmen und einen Fehler unmittelbar darunter, z. B. „Maximal 50 cm möglich“. Eine Warnung erscheint auch am unteren Ende des Eingabeformulars.
- Zusammenfassung: „Maße: Bitte korrigieren“. Es wird **kein alter gültiger Preis** weitergegeben; Preisanzeige „– / Maße prüfen“, nächste Schaltfläche deaktiviert. Die vorhandene WooCommerce-Kaufsperre bleibt unabhängig davon immer aktiv.
- Nach Korrektur verschwinden Fehler und Warnungen automatisch; die SVG und die unverbindliche Preisvorschau werden wieder aktualisiert.
- Dokumentation: keine Änderung an den konservativen A1.1-Grenzen, mm-Konvertierung, geschütztem PHP-V3-Preisendpunkt, Gast-/Kundenrechten, Shopprodukten oder Store-API-Warenkorbsperren.
- Tests: Node-/PHP-/V3-Regressionen und Chromium `wordpress/invalid-measures-browser-runner.mjs` (Desktop 1366 px, Mobil 390 px) für L2 50 → 51 → 50, ungültigen Text, zuletzt gültige SVG, Warnungen, Preis-/Navigationssperre und Erholung.
- Erst nach grünen Tests, Merge und einer getrennten WordPress-Testfreigabe das bestehende Admin-Vorschau-Plugin auf 0.6.5 aktualisieren.

## Nächster Meilenstein 0.7 – Verkaufbarkeit Gerade

1. Mit nachweisbaren Speedmaster-Konfigurationen festlegen, welche Größen, Stärken, Dekore, geraden Kanten und Ecken in den Verkauf dürfen. Die bisherigen **konservativen Vorschaugrenzen** allein sind keine Lieferanten- oder Fertigungsbestätigung.
2. Verkaufbare Kombinationen unabhängig von der hübschen SVG **serverseitig** freigeben und validieren. Nicht belegte Eckvarianten, besonders die schematisch durchlaufende Kante, bleiben zunächst gesperrt.
3. Preisregel V3 für genau diese freigegebenen Kombinationen und Steuern/Versand gegen konkrete Testfälle verifizieren; Marge absichern.
4. Anschließend in 0.8 WooCommerce-Bestellintegration mit serverseitiger Neukalkulation, vollständiger, nachvollziehbarer Konfiguration in Warenkorb und Bestellung, sichere Signatur/Sessions, Checkout- und Shop-Regressionsprüfungen. Speedmaster kann zum Start manuell bedient werden; es braucht nicht zwingend eine API.
5. Erst nach Test von Gast-/Kundenrechten, Manipulation, Preisänderungen, Steuer/Versand, Stornos und Rückabwicklung die Sperren gezielt für den freigegebenen geraden Produktumfang lösen.
