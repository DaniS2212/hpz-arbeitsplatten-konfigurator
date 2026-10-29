# 0.9 – WordPress-/WooCommerce-Integration, ohne Installation

**29. Oktober 2026. Kein Speedmaster-API-Zugriff.** Das bestehende WordPress-Admin-Testplugin 0.6.5 bleibt auf dem Liveshop unverändert, bis der Shopbetreiber am Ende **einmalig** die freigegebene finale ZIP installiert.

## 0.9 im GitHub-Quellstand

1. Bundled PHP-Komponenten in `wordpress/hpz-apl-admin-preview/includes/`: 0.7 serverseitige Liefer-/Margeprüfung, 0.8 signierter Woo-Warenkorb und Produktionsdaten, neue 0.9-WordPress-Supplier-Proof-Datenhaltung, Woo-Kontext-Prüfer und Live-Release-Gate. Generator `build-plugin.mjs` hält generierte Komponenten synchron.
2. **Kunden-Button:** Die gleiche Konfigurator-Komponente kann nur bei einer serverseitig als `calculated-ready-for-cart` bestätigten Geraden den Warenkorb-Button aktivieren. Browser sendet ausschließlich V2/mm-Maße, Stärke, Dekor, Ecken, Menge; Server berechnet Preis und Nachweise immer erneut. Öffentliches Preis- und Add-to-cart-AJAX sind für den späteren Release vorbereitet.
3. **Double-off:** Ohne explizit gesetzte PHP-Auditkonstante `HPZ_APL_09_RELEASE_AUDITED===true`, Betreiberoption `hpz_apl_straight_sale_090=enabled`, veröffentlichtes Originalprodukt `1000083` mit SKU `HPZ-APL-GERADE-2026` und echte aktuelle Lieferanten-Nachweise ist der Verkauf blockiert. Diese Freigaben werden von diesem PR **nicht gesetzt**, es gibt keine öffentliche Route im aktuellen WordPress-Plugin.
4. `HPZ_APL_WP_Supplier_Proofs_09`: Ein Administrator kann für eine **exakte** Konfiguration den manuellen Speedmaster-Beleg, aktuellen netto EK, bestätigtes Paketgewicht und Paketmaße, zugelassene Woo-Versandmethoden und Menge hinterlegen bzw. widerrufen. Gültigkeit 30 Tage; Mindestmarge schon vor der Speicherung geprüft. Keine Automatik zu Speedmaster. **Für die spätere Bedienung im Backend fehlt noch eine leichtgewichtige Eingabemaske**.
5. `HPZ_APL_WP_Woo_Context_09`: Lieferland, 19-%-Steuer und EUR-Währung, Woo-Steueroptionen, tatsächlich für das Paket angebotene Versandart und ausgewählten Tarif nur aus realen WooCommerce-Objekten; keine vom Käufer vorgegebenen Preise/Versandfreigaben. Belegtes Verpackungsgewicht wird auf die einzelne Cart-Produkteinheit übertragen.
6. Klassischer und Store-API-Warenkorb, Checkout-Validierung, Gutscheine/Marge sowie HPOS-Bestellpositionen werden über vorhandenen 0.8-Adapter angebunden. **Woo 11.2 Mengenänderungen** werden zusätzlich erneut validiert. Manuelle Lieferantentext-Daten in jeder Bestellung enthalten: Maße in mm, Material 17,5/38 mm, alle Eckmaße, interne Lieferanten-Dekorbezeichnung, Kunden-Dekorname, Anzahl.
7. Die bisherigen drei Produkte sind weiterhin geschützt. L/U dürfen nie aufgrund eines Gerade-Release erworben werden; andere bestehende Produkte werden nicht verändert.

## Wichtig: Tests und offene Freigabe

- GitHub CI: bestehende 0.6.5-Vorschau- und Preis-V3-Regression, 0.7-Proof-, 0.8-Warenkorb- und neue 0.9-WordPress-Mocktests. Die Mocktests sind **kein realer WooCommerce-Bestelltest**.
- Für 1.0 fehlen reale verpackte Gewichte und Speedmaster-Preisdaten für den gewählten Verkaufsbereich, Validierung der exakten Versandarten im Live-Shop, Checkout-Test mit Gast und Kunde (einschließlich Block-Checkout), Darstellung unter Flatsome, HPOS-Speicherung und Bestellmails.
- Erst dann wird eine endgültige Plugin-ZIP mit benutzerfreundlicher Freigabemaske und ausdrücklicher Verkaufsfreigabe erstellt. Keine Live-Installation im Rahmen dieses PRs.
- Keine Änderung der vorhandenen Produktentwürfe, keine globale WooCommerce-Steuer- oder Versandänderung, kein Echtgeld-Test, kein automatisches Auslösen von Speedmaster-Bestellungen.

**An den Shopbetreiber:** Nach dem Merge direkt die End-to-End-Tests für 1.0 vorbereiten; zunächst keinerlei Schritte im WP-Backend oder am Liveshop nötig.
