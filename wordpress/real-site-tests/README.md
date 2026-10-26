# WordPress-Praxistest 0.6.0 – Testwerkzeuge

Diese Dateien **bereiten** die reale Prüfung vor. Sie installieren oder veröffentlichen nichts, verändern keine Produkte und führen keine Bestellung aus.

## Dateien

- TESTPLAN.md: 36 reale Rollen-, Funktions-, Layout-, Sicherheits- und Checkout-Testfälle mit Status OFFEN.
- preflight.php: echte WP-CLI-/WooCommerce-Leseprüfung; Produkt-IDs, SKUs, Versionen, aktive Schutz-Hooks, 670-EUR-V3-Referenz, nonpublic AJAX und Fingerprints vor/nach Update.
- guest-smoke.mjs: ausschließlich nicht authentifizierte HTTP-GETs; prüft öffentlichen Shop und drei Entwurfs-URLs auf vertrauliche Konfigurator-Markierungen.
- .github/workflows/real-site-kit-ci.yml: PHP- und Node-Syntaxprüfung. Diese CI prüft **nicht** WordPress zur Laufzeit.

## Sichere Reihenfolge

1. Nach ausdrücklicher Zustimmung **Staging** der echten holzplatten-zuschnitt.de einrichten/verwenden; Live bleibt unverändert.
2. Vor Update aus einer echten WP-CLI-Umgebung ausführen:
   - wp eval-file /path/to/preflight.php baseline > hpz-baseline.json
   - node wordpress/real-site-tests/guest-smoke.mjs https://staging.example.test > hpz-guest-before.json
3. Erst nach gesonderter Freigabe Admin-Test-Plugin 0.6.0 auf Staging aktivieren.
4. Danach:
   - wp eval-file /path/to/preflight.php installed > hpz-installed.json
   - node wordpress/real-site-tests/guest-smoke.mjs https://staging.example.test > hpz-guest-after.json
5. **0 FAIL** im installierten Preflight und identische Produkt-Fingerprints vor/nach erwarten. Falls nicht, abbrechen und Ursache prüfen.
6. Admin-/Gast-/Kunden- und Browser-/Store-API-Tests gemäß TESTPLAN.md durchführen. Cart- und Store-API-POSTs nur auf Staging mit Dummy-Session und ohne reale Zahlungsmethoden.
7. Screenshots mit Datum, WP/Woo/PHP/Flatsome-Version, beobachteten Ergebnissen und konkreten Fehlern dokumentieren.

## Ausdrückliche Grenzen

- Read-only-Skripte ersetzen keine echten Admin-/Nicht-Admin-Browser-Sessions und keinen echten Store-API-/Classic-Cart-Test.
- Nur GitHub-Quellcode und bestehende lokale Prüfprotokolle liegen aktuell vor. Es gibt hier keinen Zugriff auf die authentifizierte holzplatten-zuschnitt.de-WordPress-Installation oder WP-CLI.
- Für Staging eine Kopie der echten Installation benutzen; Produkt-IDs/SKUs können in einer frischen Testinstallation anders sein. Bei abweichenden IDs **nicht** heimlich Code ändern, sondern Referenz und Testkopie zuerst abgleichen.
- Keine Änderung an Live-Cache, WCPA, Shopprodukten, Zahlungs- oder Versandregeln.
- **Version 0.6.0 bleibt eine nicht bestellbare Vorschau**; ein grüner Admin-Test ist keine spätere Verkaufsfreigabe.
