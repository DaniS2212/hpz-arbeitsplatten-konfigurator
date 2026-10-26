# Praxistest 0.6.0 – WordPress / WooCommerce / Flatsome

Stand: 26.10.2026. **Testplan vorbereitet; echte Shop-/Staging-Tests noch NICHT ausgeführt.**

## Ziel und Umfang

- Shop: holzplatten-zuschnitt.de, nicht mit dem getrennten Holz-Liebling-Shop verwechseln.
- Gerade 1000083 / SKU HPZ-APL-GERADE-2026.
- L 1000080 / SKU HPZ-APL-L-FORM-2026.
- U 1000081 / SKU HPZ-APL-U-FORM-2026.
- Vergleichsprodukt: Möbelsockel 999985 (falls vorhanden) und ein veröffentlichtes normales Shopprodukt.
- Ausgangspunkt: gemergte Version 0.6.0 auf main. Nur Admin-/Entwurfs-Vorschau. V3-Preis bei Gerade, bei L/U kein V3-Preis. Bestellungen überall gesperrt.
- Bestehende CI-Nachweise aus 0.6.0 (101 Node-Tests, 379 V3-, 97 PHP-Preis- und 18 PHP-Admin-Assertions) bleiben gültige **Entwicklungsprüfungen**, sind aber keine realen WordPress-/Flatsome-Tests.
- Aktuell ist kein authentifizierter Browser oder WordPress/WP-CLI-Connector zur Zielseite verfügbar. Deshalb alle unten stehenden Echt-Shop-Fälle zunächst OFFEN. Keine Installation, Änderung oder Veröffentlichung.

## Durchführung in fünf Stufen

### A. Unveränderten Ausgangszustand sichern (WP-CLI nur lesend)

1. Bevorzugt eine passwortgeschützte Staging-Kopie der echten Website mit Flatsome, WooCommerce, WCPA und WP Rocket. Eine aktuelle Sicherung muss vorhanden sein. Keine realen Zahlungswege auf Staging.
2. Vor Update: wp eval-file /PFAD/wordpress/real-site-tests/preflight.php baseline > hpz-baseline.json
3. Optional reine Gast-GETs: node wordpress/real-site-tests/guest-smoke.mjs https://STAGING-DOMAIN > hpz-guest-before.json
4. Preflight dokumentiert Status, SKU, Theme, WP/PHP/Woo, Hooks und SHA-256-Fingerprints der drei Entwürfe und des Sockels. Der Code schreibt keine Produktdaten, Einstellungen oder Bestellungen.
5. Versionen und Einstellungen von Flatsome/Child-Theme, WP Rocket (Cache, Defer, Delay JS, Minify), WCPA, HPOS, Warenkorb-/Checkout-Typ und CSP zusätzlich im Admin erfassen.

Bei bestehender älterer Preview-Version protokolliert der Baseline-Modus nur die Version; 0.6.0-Hooks werden erst nach dem Update geprüft.

### B. Admin-Test auf isolierter Installation (erst nach Freigabe)

1. 0.6.0-ZIP aus main als Update einer vorhandenen Preview-Plugin-Instanz installieren; nicht doppelt. Vorschau aktivieren + Testmodus aktiv, Platzierung zunächst automatisch. Drei Produkte bleiben Entwürfe.
2. wp eval-file /PFAD/wordpress/real-site-tests/preflight.php installed > hpz-installed.json
3. Erwarte null FAIL. Vergleiche alle Produkt-Fingerprints exakt mit der Baseline. Bei Abweichung vor Fortsetzung Ursache klären. Die Plugin-Optionsänderung ist kein Produktdaten-Update.
4. Administrator öffnet die Entwurfs-Vorschau einzeln bei Gerade, L und U. Der Konfigurator steht einmal zwischen Produktkopf und Beschreibung. Falls Flatsome-Hook nicht passt: vorhandenen Shortcode-Modus isoliert prüfen; keine Shop-Templates oder Inhalte pauschal ersetzen.

### C. Rollen, Sicherheit, Cache und Zugriff

| ID | Test | Soll | Ergebnis |
| --- | --- | --- | --- |
| R01 | Admin, Entwurf Gerade | Vorschau sichtbar, Preis berechnet, Kauf deaktiviert | OFFEN |
| R02 | Admin, Entwürfe L und U | Vorschau sichtbar, kein V3-Preis, Kauf deaktiviert | OFFEN |
| R03 | Gast ruft alle drei Entwürfe direkt auf | Kein Produktentwurf, keine Admin-Vorschau, keine Nonce | OFFEN |
| R04 | Eingeloggter normaler Kunde | Kein Testkonfigurator oder Preisendpunkt | OFFEN |
| R05 | Redakteur/Shop-Mitarbeiter ohne manage_options | Keine Testvorschau, auch mit edit_post-Berechtigung | OFFEN |
| R06 | Gast-/Kunden-POST an admin-ajax.php?action=hpz_apl_price_preview | Kein gültiger Preis, keine internen Daten | OFFEN |
| R07 | Admin-AJAX mit fehlender/falscher Nonce, falscher Produkt-ID/SKU | Fehler/403; kein Preis | OFFEN |
| R08 | Gast nach Admin-Aufruf, WP Rocket/Proxy/CDN-Cache | Keine an Gast ausgelieferte Nonce, Admin-HTML oder Preisvorschau | OFFEN |
| R09 | Normale veröffentlichte Produkte und Sockel | Unverändert; keine ungewollte Pluginausgabe | OFFEN |

Die Datei guest-smoke.mjs macht nur GETs. Sie kann Kunden-/Redakteurrolle und Ajax-POST nicht ersetzen.

### D. Maße, Bilder, Preis, Performance, reale Geräte

| ID | Test | Soll | Ergebnis |
| --- | --- | --- | --- |
| F01 | 360 / 390 / 1366 / 1440 px, echtes Smartphone | Kein Überlauf, Bedienelemente frei, Sticky Header kollidiert nicht | OFFEN |
| F02 | Alle 10 Eckzustände, links/rechts/beidseitig | Richtiges SVG, keine vertauschten Seiten; durchlaufend sichtbar schematisch | OFFEN |
| F03 | 250,1 / 278,1 / 88,1 cm | Intern exakt 2501 / 2781 / 881 mm | OFFEN |
| F04 | 250,12 cm / leer / 0 / negativ | Validierungsfehler, kein stehen gebliebener alter Preis | OFFEN |
| F05 | W980 38 mm 200 × 60 cm, keine Ecken | 670,00 € DE-Bruttoreferenz | OFFEN |
| F06 | W980 17,5 mm 200 × 60 cm | 450,00 € DE-Bruttoreferenz | OFFEN |
| F07 | Bardolino H1145 38 mm 200 × 60 cm | 690,00 € DE-Bruttoreferenz | OFFEN |
| F08 | W980 38 mm 250 × 88,0 cm → 250 × 88,1 cm | 790 € → 1490 € | OFFEN |
| F09 | W980 38 mm 278,0 × 60 cm → 278,1 × 60 cm | 840 € → 890 € | OFFEN |
| F10 | W980 17,5 mm 250,0 × 88 cm → 250,1 × 88 cm | 700 € → 740 € | OFFEN |
| F11 | Eine und zwei bearbeitete Ecken | Einmalig +120 €, nicht +240 € | OFFEN |
| F12 | Anzahl 1 → 2 | Gesamtpreis exakt doppelt, Stückpreis konstant | OFFEN |
| F13 | Alle 16 Dekore × beide Stärken | Bild, Kurzname, Auswahl, Preis und SVG konsistent | OFFEN |
| F14 | Sehr schnelle Änderungen an Maß/Dekor/Menge | Veraltete AJAX-Antwort darf neue Eingabe nicht überschreiben | OFFEN |
| F15 | L/U, Maße und Schritte | Schematische Vorschau, keine reale Teilung oder V3-Preisbehauptung | OFFEN |
| F16 | WP Rocket Delay/Defer/Minify, CSP, Network-Tab | Module/Styles/Bilder laden, kein JS-/CSP-/404-Fehler | OFFEN |
| F17 | Flatsome, WCPA, mobile Produktseite | Keine doppelten Formulare, keine zerstörten Standardbereiche | OFFEN |
| F18 | Network/Lighthouse vor/nach Testeinbau | Wirkung mit echten Messungen dokumentiert | OFFEN |

Bei WP Rocket Fehlern zuerst isoliert die betreffenden Plugin-Skripte und dynamischen Imports prüfen. Keine ungeprüften globalen Performance-Änderungen.

### E. Kauf- und Checkout-Sperren (nur Staging, nie Echtgeld oder Live-Warenkorb)

| ID | Staging-Sicherheitsfall | Soll | Ergebnis |
| --- | --- | --- | --- |
| S01 | Klassisches ?add-to-cart=1000083 | Fehler, kein Produkt im Testwarenkorb | OFFEN |
| S02 | ?add-to-cart=1000080 und 1000081 | Beide gesperrt | OFFEN |
| S03 | Direkter WooCommerce-Formular-POST auf die drei Produkt-IDs | Kein Zielprodukt im Warenkorb | OFFEN |
| S04 | Store API POST /wp-json/wc/store/v1/cart/add-item (gültige Staging-Session) | Alle drei Ziele verweigert | OFFEN |
| S05 | Kontrolliert vorbereitete alte Zielposition im klassischen/Block-Warenkorb | check_cart / Store API blockiert Checkout | OFFEN |
| S06 | Variation mit Zielprodukt als Parent | Ebenso gesperrt | OFFEN |
| S07 | Normales, nicht betroffenes Testprodukt | Bestehender Warenkorbprozess nicht verändert | OFFEN |
| S08 | Versuch, gesperrte Position zur Kasse zu bringen | Keine Order, keine Zahlung, keine E-Mail | OFFEN |
| S09 | Plugin auf Staging deaktivieren / zurückrollen | Alle drei bleiben Entwürfe | OFFEN |

Die Session- und Store-API-Tests dürfen **nur** in einer isolierten Testumgebung mit Dummy-Daten und deaktivierter echter Zahlung ausgeführt werden. Direkte Tests an Live-Warenkörben, bestehenden Bestellungen oder echten Kundendaten sind ausgeschlossen. S05 braucht ggf. explizit vorbereitetes Testfixture.

## Kontrolle und Abnahme

- Baseline-/Installiert-Fingerprints der vier Produktpositionen vergleichen. Abweichungen sind zu untersuchen; nie durch stille Produktänderung ausgleichen.
- Der Einbau ist noch kein Produktrelease. Kein Veröffentlichen der Entwürfe, kein Umschalten von Testmodus, keine Kauffreigabe.
- Für Admin-Praxistest-Abnahme: Rollen-/Nonce-/Cache-Sicherheit, korrektes WP-Ajax-Rendering, cm→mm-Preisgrenzen, alle 16 Dekore, keine Store-API-/klassischen Warenkorb-Bypässe, übrige Produkte unverändert.
- Für spätere Verkaufsfähigkeit fehlen gesondert: Lieferanten-/Fertigungsfreigaben je Form/Eckmaß, verbindliche EK-/Margensicherung nach Rabatten, Steuer nach Zielland, Paketgewicht/Kundenversand, bestellungsfeste Konfigurationsdaten und autorisierter Warenkorb-/Checkout-Adapter. L/U zusätzlich Teile-/Stoßplanung. Keiner dieser Punkte gilt durch 0.6.0 als freigegeben.

## Ergebnisprotokoll

Je Test: Umgebung/Domain, WP/Woo/Flatsome/PHP-Version, Plugin-Version/ZIP-SHA, Produkt-ID, Rolle, Gerät, Eingabe, erwartetes Ergebnis, beobachtetes Ergebnis, PASS/FAIL/SKIP, Screenshot oder Browser-Netzwerkbeleg. **Nicht ausgeführte Tests bleiben OFFEN.** Keine Personen-, Zahlungs- oder echten Bestelldaten in Belegen.

Referenzen im Repository: INSTALLATION.md, KUECHENSTUDIO-0.6.0.md, docs/060-tests.md, pricing-v3/README.md und aktuelle PHP-Plugin-Dateien.
