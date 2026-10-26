# WordPress-Admin-Ausgrauen beim Wechsel – 0.6.4

Datum: 26. Oktober 2026 · Zielprodukt: Gerade, Entwurf 1000083 · Verkauf weiterhin gesperrt.

## Befund im tatsächlich installierten 0.6.3

Nach dem ersten erfolgreichen V3-Preis von 200 × 60 cm berichtete der Nutzer: Bei weiteren Klicks und Einstellungen bleibt die Zeichnung blass, die Übersicht meldet „Wird geprüft …“, der Preis meldet „Wird berechnet …“ und die Bedienelemente reagieren scheinbar nicht mehr.

**Nachgewiesener Konstruktionsfehler im GitHub-Code:** `createPreviewController.refresh()` löste bei jedem Klick eine neue asynchrone WordPress-`admin-ajax.php`-Preisberechnung aus. In `onPending` wurde `#drawing[aria-busy=true]` gesetzt; das alte CSS reduziert die Deckkraft dann auf 40 Prozent. Erst **nach erfolgreichem oder fehlerhaft beendetem** HTTP-Aufruf wurden Geometrie und Übersicht aktualisiert. Es gab weder gezieltes Abbrechen veralteter HTTP-Requests noch ein festes Zeitlimit. Eine langsame/ausbleibende PHP-Antwort konnte deshalb die Vorschau praktisch dauerhaft im Ladezustand halten.

Das ist ein echtes Problem der 0.6.3-Architektur. Ein konkretes Server-Log aus der Nutzersitzung wurde nicht erhoben; daher ist die unmittelbare Ursache für die ausbleibende HTTP-Antwort **nicht** belegt. Mögliche zusätzliche Faktoren (PHP-Laufzeit, Admin-AJAX, Browser-Erweiterungen, WP Rocket) sollen nicht ohne Nachweis als Ursache behauptet werden.

## Umsetzung 0.6.4

1. Die WordPress-`preview.js` normalisiert und zeichnet die Platte **sofort lokal**. Mit `onVisual` gelangen Zeichnung, Maßhinweise und Konfigurationsübersicht direkt in den UI-Controller; es wird nicht mehr auf den Preis gewartet.
2. Das PHP-V3-Preisangebot folgt getrennt per geschütztem WordPress-POST. Die Browser-Seite sendet erst nach **180 ms stabiler Eingabe**, um Anfragen während schneller Eingaben zu reduzieren.
3. Beim nächsten Änderungsereignis bricht ein eigener `AbortController` die vorherige Preisabfrage ab. Ein Antwortpaket einer alten Auswahl darf weder neue Skizze noch Preis überschreiben.
4. Für eine einzelne WordPress-Preisabfrage gilt ein Timeout von **9 Sekunden**. Danach steht beim Preis eine klare Nicht-Verfügbarkeit. Die unverändert angezeigte Geometrie und die nächsten Konfigurationsschritte bleiben benutzbar.
5. Der als „busy“ markierte Zeichenbereich wird nicht mehr für jede Preisabfrage auf 40 Prozent Deckkraft reduziert. Der Warenkorbbutton bleibt unverändert **gesperrt**, auch wenn ein Preis zurückkommt.
6. Es gibt **keine** Änderungen an der serverseitigen V3-Kalkulation, Geometrie-Fertigungsfreigabe, WooCommerce-Rollen-, Entwurfs-, Warenkorb- und Store-API-Sperren. Die drei Entwurfsprodukte bleiben unveröffentlicht.

## Prüfungen und Grenzen

- Neue Node-Tests: `local/test/async-wordpress-064.test.mjs`: Sofortige Zeichnung, Antwortreihenfolge, Abbruch, WordPress-Erfolg und -Fehler.
- Neuer Chromium-Integrationstest: `wordpress/live-price-browser-runner.mjs`. Speziell aufgebauter **lokaler** Testserver simuliert den im Live-Plugin ausgegebenen AJAX-Endpunkt sowie verzögerte, veraltete und hängende Preis-POSTs. Bei 1366/390px müssen Geometrie und Dekor sichtbar bleiben und der Warenkorb gesperrt.
- Vorhandene PHPUnit/PHP-/Node-/Browser-/Kaufgates und Plugin-ZIP-Build bleiben aktiv. **Erst nach grüner CI mergen.**
- Die Simulation ersetzt keinen echten WordPress-Praxistest. Nach dem Merge ausschließlich das vorhandene Preview-Plugin **als Admin-Test** aktualisieren (0.6.4-ZIP über die bisherige Plugin-Kopie, kein zweites Plugin). Aktuelles Backup, Draft-IDs/SKUs und Testmodus prüfen. Noch keine Veröffentlichung.
- Test auf realem WordPress: W980 / 38mm / 200 × 60 cm, ohne Ecke: **670,00 Euro** unverbindlicher Bruttoreferenzpreis; schnelle Seiten-/Maß-/Dekorwechsel bei immer sofortiger Zeichnung; bei PHP-Hänger nach spätestens 9s „Preis offen“ und weiterhin bedienbare Skizze. Bei Admin-AJAX HTTP 403/422/500 relevante Response-Klasse dokumentieren, keine Nonces/Kundendaten weitergeben.
- Für Live-Verkauf fehlen weiterhin vollständige Geometrie-, Versand-, Steuer- und Woo-Checkout-Gates.
