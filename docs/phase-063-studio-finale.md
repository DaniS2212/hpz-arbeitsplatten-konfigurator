# 0.6.3 – Küchenstudio-Abschluss und Bemaßungsfix

Stand: 26. Oktober 2026. Grundlage: 0.6.2 (PR #11, main). Keine Produkt-/Shopänderung.

## Ziel und Umsetzung

1. **Schritt 1/2: Zusammenfassung über volle Breite.** Die aus dem vorherigen Entwurf bereits unter die Zeichnung verschobene Konfigurationskarte wird jetzt zum eigenständigen, zweispaltigen Abschlussbereich unter *beiden* Desktop-Spalten. Links die Konfiguration samt Dekormuster; rechts Anzahl, Preisbereich, noch gesperrte Kaufaktion. Mobil folgt die Zusammenfassung der Konfiguration.
2. **Schritt 3: ein besserer Abschluss.** In der Desktop-Ansicht größere rechte Spalte für 16 Dekorkarten (3–4 Spalten), die Zeichnung links. Klarer Ablauf „01 Plattenstärke“ → „02 Dekor“ mit Live-Anzeige der gewählten Stärke und Oberfläche. Danach folgt die vollständig breite Konfigurations-/Preisübersicht. „Konfiguration prüfen“ scrollt dorthin.
3. **Vertikaler Text: Fehler behoben.** Untergeordnete SVG-Labelgruppen übernahmen das SVG-`stroke`-Attribut der Maßhilfslinien; insbesondere die gedrehten `B2/B3`-Labels wurden dadurch dick und doppelt überzeichnet. Die Labelgruppe erhält ausdrücklich `stroke="none"`, sodass nur Textfüllung (und ggf. Fontgewicht) dargestellt wird. Die bereits vorhandenen deckenden Beschriftungskarten bleiben erhalten.
4. **Preis im lokalen Pakettest ehrlich darstellen.** `wordpress/hpz-apl-admin-preview/assets/preview.js` liefert in der Paketvorschau `ruleVersion: 'admin-visual-only'`, denn der Paketserver enthält *keinen* WordPress-Admin-AJAX-Endpunkt und damit *keine* geschützte PHP-V3-Berechnung. Bei geraden Entwürfen steht deshalb nun „Im Shop-Test“ mit explizitem Hinweis: Preis erst im autorisierten WordPress-Admin-Test. Das ist **kein fiktiver Angebotspreis**. Erst wenn WordPress eine gültige, nicht bestellfreigegebene V3-Antwort sendet, zeigt das Frontend deren Bruttoreferenzpreis.
5. **Alte Verträge unverändert.** Interne mm-Werte, kundenfreundliche cm-Eingaben, exakte Preisregel V3, WooCommerce-Entwürfe, Rollen-/Draft-Prüfungen und sämtliche klassischen/Store-API-Kaufsperren bleiben unangetastet.

## Testhinweise

- Automatische Node-Regressionen in `local/test/ui063-studio.test.mjs`; bestehende Preis-, Konfigurations-, Dekor-, Sicherheits- und Pakettests müssen weiterhin grün sein.
- Browser QA `wordpress/ui063-browser-runner.mjs` prüft bei 1366 und 390px die Breite der Zusammenfassung in Schritt 1/2, die B3-SVG-Stroke-Isolation, breitere Oberfläche, 16 Dekore, Live-Muster, keinen horizontalen Überlauf, Preis-Hinweis und unverändert gesperrten Warenkorb.
- Bestehender 60-Zyklen-Dekor-Belastungstest je Auflösung bleibt in der GitHub-Action aktiv.
- Die Action archiviert Screenshots als `hpz-studio-063-browser-screenshots`.
- WordPress-Paketbau vergleicht gebaute WordPress-Assets exakt gegen den geprüften Commit; Installations-ZIP nur als Testartefakt.
- Nach PR-Merge lokale Paketvorschau neu laden und sehen; vor der WordPress-Installation ausdrücklich Freigabe einholen. Danach echte V3-Preise, Rollenberechtigungen, Cache-/JS-Optimierung, Woo Cart/Store API und Datenschutz in WordPress/PHP prüfen.

## Offene Punkte zur Verkaufsfreigabe

- Die Live-Admin-Installation/Flatsome-Renderprobe ist noch nicht erfolgt. Bis dahin ist die Preisanzeige in WordPress nicht praxiserprobt.
- Die geschützte V3-Preisvorschau ist kein endgültiger Verkaufspreis; Geometrie-Fertigungsgrenzen, Versand und tatsächliche Warenkorb/Bestellübergabe bedürfen weiterhin separater Freigabe.
- L- und U-Formen erhalten weiterhin keine V3-Preisfreigabe.
