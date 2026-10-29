# WooCommerce 0.8 – Gerade, ohne Speedmaster-Schnittstelle

Stand 29.10.2026. Für die Fertigung genügt die **manuelle** Übertragung aus den gespeicherten WooCommerce-Bestellangaben zu Speedmaster. Es wird keine Speedmaster-API entwickelt oder vorausgesetzt.

## Bereits vorbereitet

- **Backend:** `wordpress/checkout-v08/HPZ_APL_WC_Cart_Bridge.php` – signierter V2-mm-Konfigurationsdatensatz, neue PHP-V3-Preisberechnung ausschließlich auf dem Server, verpflichtende Prüfung des exakt passenden aktuellen Liefer-/EK- und Versandnachweises, auch nach Cart-Reload und Mengenänderung. Kein vom Kunden gesendeter Preis oder angebliche Lieferfreigabe wird übernommen.
- **WooCommerce-Hooks:** `wordpress/checkout-v08/HPZ_APL_WC_Dormant_Hooks.php` – klassische Warenkorbformulare, Store-API-Add-to-cart, Mengen, Warenkorb-Session, vorläufiger Zeilenpreis und belegtes Packmaß/Packgewicht, Preis- und Rabattschutz nach Woo-Totals, Checkout-Sperre vor Zahlung, HPOS-sichere Bestellpositions-Metadaten. Normale Waren, Sockel sowie L/U bleiben unberührt.
- **Für Werkstatt/Bestellung:** Exakte Länge/Tiefe (mm), 17,5/38 mm, Kurzname + Speedmaster-Dekorcode, Vorder-/Seiten-/Hinterkanten, Eckseite, Bearbeitungsart, R1/R2/L2/B2/L3/B3 (mm), Menge. Die Bestellung kann damit manuell bei Speedmaster eingegeben werden. Keine externe Datenübermittlung.
- **V3-Marge:** Lieferanten-EK und Bezugskosten werden pro Stück und nach echten WooCommerce-Rabatten sowie gewählter Versand-/Steuerkonfiguration gegen die 35-%-Untergrenze geprüft. WooCommerce entscheidet tatsächliche Steuern und Kundenversand; 19 % sind anfangs ausschließlich deutsche Kalkulationsreferenz.
- **Tests:** `wordpress/checkout-v08/tests/cart-bridge.php` und `wp-hooks.php` simulieren gültige/ungültige Kombinationen, 16 Dekore × 2 Stärken, Eckvarianten, manipulierte HMACs/Preise, Menge, Liefernachweis-Ablauf, Coupon, Steuer, Versand, Cart- und Store API sowie die gespeicherten Fertigungsdaten.

## Warum WordPress jetzt noch NICHT aktualisieren?

Die vorhandene WordPress-Version **0.6.5 bleibt unverändert**. Die 0.8-Bridge wird von diesem Plugin **nirgendwo eingebunden** und registriert ohne eigens gesetzte Sandbox-Testkonstante **keine WooCommerce-Hooks**. Es existiert kein produktiv aktiver neuer Warenkorb- oder Store-API-Kaufpfad; die bisherigen drei Entwürfe und sämtliche Kaufsperren bleiben vollständig bestehen.

**0.8 ist technischer, durch PHP-Tests prüfbarer WooCommerce-Adapter – kein echter Kauf-Release.** Bis 1.0 verbleiben die neuen Komponenten im Repository. Der Nutzer möchte nur einmal am Ende die finale ZIP in WordPress aktualisieren.

## 0.9 – Was fehlt jetzt noch?

1. Vertrauenswürdige, aktualisierbare Freigabeliste für Speedmaster-Lieferbarkeit, exakte EK, Verpackungsgewichte/Abmessungen und WooCommerce-Versandarten. Historische Preisreferenzen reichen als alleinige Freigabe nicht aus; eine Speedmaster-API ist nicht nötig.
2. Sichere reale Plugin-Anbindung von Preis und „In den Warenkorb“; Nonce/Session und veröffentlichte Gerade mit gezieltem Aufheben ausschließlich ihrer bisherigen Kaufsperre. Kein pauschales Freischalten der drei Produktentwürfe.
3. **Echter** Shoptest (ohne Echtgeld) für Steuer-/Versand-/Couponkonfiguration, Checkout-Blocks/klassisch, HPOS, Mails, Zahlung, Gast/Kunde, Retouren und Mischkorb, Flatsome/WCPA/WP Rocket. Aktuell nur PHP-Testharness, kein echter WooCommerce-Prozess.
4. Exakte Prüfung von tatsächlich von Woo gerundeten Preisen (besonders DE-Bruttowert vs. 6 Nachkommastellen intern), und der Shopkonfiguration inkl./exkl. Steuer. Bei Abweichungen sperren, nicht an Kunden runden oder schätzen.
5. Danach **eine** finale Plugin-ZIP, bei ausbleibenden Nachweisen sicher gesperrt, und Produktfreigabe nur auf ausdrücklichen Wunsch.

Fachliche Unterlagen: `docs/phase-070-gerade-bestellfaehig.md`, `pricing-v3/README.md`. Keine Bestellung an Speedmaster gesendet.
