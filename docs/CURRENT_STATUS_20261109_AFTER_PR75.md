# AKTUELLER PROJEKTSTAND — 09.11.2026, nach gemergtem PR #75

> **Verbindlicher Einstieg für jeden neuen Chat.** Diesen Stand zuerst lesen, danach `AGENTS.md`, `docs/CURRENT_PROJECT_HANDOFF_20261105.md` und den tatsächlichen GitHub-`main`-/CI-/WordPress-Stand prüfen. Frühere Preis- und CNC-Gate-Pläne im langen Handoff sind **historische Zwischenstände**, soweit sie dieser neueren Betreiberentscheidung widersprechen. Keine nochmalige Planung ab PR #36/#60/#70.

## 1. Geschäftsauftrag und abgeschlossene Entwicklung

**Priorität des Betreibers:** Den Arbeitsplattenkonfigurator schnell fertigstellen und verkaufbar machen. Für alle **im UI erlaubten** Maße, Dekore, Stärken und L-/U-Formen reichen **kaufmännisch ungefähr passende Modellpreise**, wie bei der geraden Arbeitsplatte. **Keine weiteren allgemeinen Speedmaster-Abfragerunden**; kein Anspruch auf centgenaue Lieferanten-EKs jeder denkbaren Kombination. Keine neue Pricing-Engine, kein weiterer großer Nachweis-/CNC-Baukasten und kein ausufernder UI-Umbau vor dem Checkout.

- **Gerade:** Konfigurator, separate etablierte V3-Maß-/Dekor-Preiskurve und separate WooCommerce-Verkaufsanbindung sind im Repository entwickelt. Woo-Produkt **1000083**. Die **wirkliche öffentliche Kaufbarkeit / installierte Version** muss im Shop geprüft werden; GitHub-Quellcode beweist keinen tatsächlich erfolgten Livekauf. Gerade darf durch L/U-Arbeit nicht verändert werden.
- **L-Formen:** **L1–L4**, Grundrisse, Maße, interaktive Vorschau, Stoßlinien, 16 Dekore, **17,5/38 mm**, und die im UI angebotenen Eckbearbeitungen (Rundung, eckige und durchlaufende Abschrägung, links/rechts/beidseitig) sind umgesetzt. WordPress-Woo-Produkt **1000080**.
- **U-Formen:** **U1–U4**, Grundrisse, Maße, Dekore, Stärken und formabhängige visuelle Stoßteilung implementiert. Woo-Produkt **1000081**. Stoßlinien sind **Illustrationen**, keine verbindlichen CNC-Zuschnittlisten.
- **L/U-Preise (PRs #72–#75):** Gemeinsame V3-Margen-/Steuerregel plus eigenständige L/U-Form-EK-Referenzen. 16 Dekore über V3-Dekor-EK-Referenzdifferenzen, variable Maße über kalibrierte Näherung, Sonder-Ecken mit separatem Kostenmodell; konkrete vorhandene Supplier-EK-Anker haben Vorrang. **PR #73**, **#74** und **#75** sind **gemergt**, ebenso #72; beim Handoff am 09.11.2026 sind alle fünf Prüfungen für #75 grün. **Das ist der bewusste Abschluss der allgemeinen Preisentwicklung.**
- **Wichtig:** Preisberechnung ist technisch umfangreich, aber nicht jeder frei kombinierte Modellpreis von Speedmaster unabhängig bestätigt. Nur **UI-validierte und im PHP-Preisfenster erlaubte** Kombinationen sind berechenbar. Varianten außerhalb der Grenzen bleiben gesperrt; weder eine beliebige mathematische Maßkombination noch garantierte reale Einkaufsmarge wird zugesagt.

## 2. Verbindliche kaufmännische Regeln

- **V3-Zielmarge 40 %**, **Kostenreserve 10 %** und **Mindestmarge nach Coupon 35 % bezogen auf hinterlegte kalkulierte Kosten**. Deutsche Brutto-Preisreferenz: **19 % USt genau einmal**, anschließend auf volle **10 €** aufrunden. Kernfunktion `HPZ_APL_Price_V3::targetGrossForVerifiedCosts()`; Gerade behält seine bewährte eigene `quote()`-Maßpreisformel.
- **Speedmaster-interne Anlieferung nach KONFIGURIERTEN Längen L1/L2/L3:** solange alle unter **1900 mm** sind, **10 € netto**; sobald irgendeine L-Achse **>=1900 mm**, insgesamt **60 € netto** (10 € Grundpreis + **einmal 50 €**, auch bei mehreren langen Schenkeln). **Nicht** anhand unbekannter realer Teil-/Packlängen kalkulieren, nicht 70 €; gehört in die Produktkosten. **WooCommerce-Kundenversand separat**, keinen zusätzlichen 50-€-Checkout-Aufschlag doppelt berechnen.
- Die historisch streng geforderten realen Speedmaster-Fertigungs-/Packstück-/Verbinder-Nachweise sind **keine Voraussetzung mehr, um einen kaufmännischen L/U-Preis zu modellieren**. Bei tatsächlicher **manueller** Supplier-Bestellung müssen Passfähigkeit und Ausführung weiterhin sinnvoll geprüft werden; keine automatische Speedmaster-Order.
- Private Admin-Preisvorschau kann **0 € weitere Netto-Kosten als ausdrücklich provisorisches Szenario** verwenden. Das ist **keine Freigabe**, dass Verpackung, Zahlungsabwicklung, Versandanteil etc. tatsächlich kostenlos wären. Vor Echtgeld-Verkauf Kostenannahmen prüfen und die privaten Woo-Versandmethoden abgleichen.

## 3. Die letzten zehn Speedmaster-Preise — FINALER KALIBRIERUNGSABSCHLUSS 09.11.2026

Die zehn tatsächlichen Betreiberangaben sind **Netto-EKs** und liegen strukturiert inklusive aller Maße/Dekore/Ecken unter:
`docs/references/speedmaster-lu/LU_TEN_NET_PRICE_CHECKS_20261109.json`.
Reihenfolge / Beträge: **300,03; 300,73; 510,06; 351,33; 528,89; 724,66; 767,63; 547,40; 837,82; 828,24 €**. Das vorige Modell war in allen zehn Fällen höher (im Mittel ca. **7,2 %**). PR #75 hat exakt diese Fälle hinterlegt, benachbarte Ein-Achsen-Interpolationen nachgezogen und das **redundante zusätzliche 7-%-Modellpolster** entfernt; bestehende **10-%-V3-Kostenreserve** bleibt. Außerdem Längen-/Breitenansätze, U-F128-Dekorskala und unbelegte Eckmehrkosten korrigiert. Details: [Preisabschluss](phase-lu-final-10-price-calibration-20261109.md), [Preisregister](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv). Alte Preisvorschriften älterer PRs sind nicht erneut als Sperre anzuwenden.

## 4. WooCommerce-Implementierung und ehrlicher Freigabestatus

**Quellcode vorhanden:** signierte Cart-/Checkout-Preispositionen, HPOS-/Produktions-Metadaten, durchgängige Maße und L-Eckmaße, manueller Speedmaster-Handoff, Server-Steuer-/Versand-/Coupon-Schutz. Relevante Dateien:
- `pricing-v3/HPZ_APL_Price_V3.php`
- `pricing-v3/HPZ_APL_LU_Shop_Ratebook_12.php`
- `pricing-v3/HPZ_APL_LU_Admin_Price_Preview_13.php`
- `pricing-v3/HPZ_APL_LU_Price_Readiness.php`
- `wordpress/checkout-lu/HPZ_APL_WC_LU_Cart_Bridge.php`
- `wordpress/checkout-lu/HPZ_APL_WP_LU_Runtime.php`
- `wordpress/hpz-apl-admin-preview/hpz-apl-admin-preview.php`

**Nicht behaupten:** PR-Merge/CI = reale Woo-Testbestellung oder publizierte Produkte. Für L/U ist der **öffentliche Verkauf weiterhin bewusst geschützt** durch `HPZ_APL_LU_11_AUDITED_RELEASE`, `hpz_apl_lu_sale_v1` (u. a. `enabled`, `manual_supplier_handoff_verified`, `woocommerce_checkout_verified`), Produktstatus/SKU und den privaten Betreiber-Preiskostenansatz `hpz_apl_lu_price_window_v1` (`model_price_approved`, `extended_model_approved`, `corner_model_approved`, `other_cost_net_cents`, `max_quantity`, `price_approved_on`, `approved_shipping_rate_ids`). Diese Flags **nicht automatisiert aktivieren** und keine echte Kundenbestellung oder Zahlung ohne Betreiberfreigabe auslösen. Der effektive installierte Stand im Shop und Gerade-Live-Verkauf müssen gesondert geprüft werden.

## 5. NUR noch zwei Pflichtschritte, anschließend optionaler UI-Feinschliff

**A. WordPress-Preis-/Kosten- und Versandprüfung:** Neue Preisregel mit tatsächlich installierter Plugin-Version in der Admin-L/U-Vorschau prüfen (typische, kleine, große, Sonder-Ecken; beide Stärken, mehrere Dekore). Den **realistischen Netto-Nebenkostenansatz** und die tatsächlichen WooCommerce-Versandarten / Steuerkonfiguration verifizieren. Keine weitere groß angelegte Speedmaster-EK-Recherche. Nur bei einem wirklich auffälligen Preis gezielt korrigieren.

**B. Kontrollierter WooCommerce-End-to-End-Test und bewusste Freigabe:** Testkonfiguration → Brutto-/Netto-Preis → signierter Warenkorb/Store API → Versandkosten/Steuer/Gutschein → Checkout → vollständige Bestellposition/HPOS-Produktionsmetadaten inkl. Stoßform und L-Eckmaßen → Übergabe für **manuelle** Speedmaster-Bestellung. In abgesichertem Test, **keine echte Kundenzahlung und keine öffentliche Kaufaktivierung**. Erst danach gemeinsam mit Betreiber die L/U-Sale-Flags und tatsächliche Produktveröffentlichung setzen. Die gerade Platte ggf. nur auf ihren bestehenden Livepfad prüfen, nicht umbauen.

**Erst nach A/B optionaler UI-Feinschliff:** Großen Woo-Produktkopf/Galerie durch H1 + kurze Beschreibung direkt am Konfigurator ersetzen; SVG-`viewBox` beim Eckwechsel stabil halten; L4-`B5`-Label „· Einstellung“ verständlicher machen, kleine Usability-/Mobile-Fixes. Bereits dokumentiert in `docs/phase-ui-step3-backlog-20261106.md`.

## 6. Nächster neuer Chat — sofortige Aktion

Auf Anfrage „Konfigurator weiter / fertigstellen“ **nicht wieder Preisentwicklung oder Fertigungsnachweise von vorn beginnen**. Erst tatsächlichen GitHub-`main`, PR #75, CI, Plugin-Installationsversion und Woo-Produktstatus abgleichen, dann **A und B konkret durchführen**. Shopaktivierung nur nach ausdrücklicher Betreiberfreigabe. Die vollständige historische Forschung bleibt in `docs/CURRENT_PROJECT_HANDOFF_20261105.md`; **für operative Prioritäten ist diese 09.11.2026-Übergabe maßgeblich**.
