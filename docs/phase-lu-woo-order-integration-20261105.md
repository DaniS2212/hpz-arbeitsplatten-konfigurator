# L/U-WooCommerce-Bestellanbindung – 05.11.2026

**Stand:** Code fertig für isolierten Test; Liveverkauf und neue Woo-Produktveröffentlichung **nicht** aktiviert. Arbeitet im **selben Repo, demselben Plugin und WooCommerce-Shop** wie die Gerade. Kein Speedmaster-API-Workflow.

## Der konkrete Auftrag

Die L1–L4- und U1–U4-Geometrien sollen denselben bereits vorhandenen Bestellweg wie Gerade erhalten. Der Betreiber hat verbindlich entschieden: **40 % Zielmarge, 35 % Mindestmarge nach Rabatten, 10 % Kostenreserve** – über die gemeinsam verwendete `HPZ_APL_Price_V3`; niemals zusätzlich den historischen 30-%-EK-Aufschlag.

Die derzeitige WooCommerce-Seite zeigt oben Produktbildgalerie, H1, Beschreibung, Eigenschaften und einen „Jetzt konfigurieren“-CTA. Der eigentliche Küchenstudio-Konfigurator steht erst weiter unten. **Für den nachfolgenden UI-Feinschliff hat der Betreiber ausdrücklich angefragt**, den gesamten oberen Produktbereich weitgehend zu entfernen, **nur H1 und Kurzbeschreibung hochwertig direkt mit dem Konfigurator zu integrieren**. **Nicht in diesem PR umsetzen**: Zuerst Bestellweg und Testbestellung abschließen. Screenshot im Chat `image(20261105-113713).png` vom 05.11.2026, Ganzseitenansicht Arbeitsplatte Gerade auf holzplatten-zuschnitt.de, wurde als visueller Bezug mitgeliefert; Original-PNG hier **noch nicht als GitHub-Binärdatei** archiviert.

## Was neu im Code existiert

- `wordpress/checkout-lu/HPZ_APL_WC_LU_Cart_Bridge.php`: Aus V2-mm-Frontend-Konfiguration und ausschließlich serverseitigen Speedmaster-Belegen wird ein **HMAC-signierter** WooCommerce-Warenkorb-Datensatz `hpz_apl_lu_v1` ausgestellt. Derselbe vorhandene V3-Preisrechner und die vorhandene Woo-USt-Umrechnung werden verwendet; keine zweite eigenständige Preisengine.
- Jeder neue Warenkorb-Vorgang und jede Mengenänderung überprüft **neu** die komplette signierte Konfiguration, echte aktuelle Lieferanten-Preis-/Teile-/Paketeinträge, identische Form/Material/Dekor/Kanten, Woo-Menge und aktuellen Preis. Alte Preise können nicht aus einem signierten Warenkorb erzwungen werden.
- Für L1/L2 werden L1,L2,B1,B2 erhalten; für L3/L4 kommen B3/B4 und bei L4 **B5-Grundmaß** dazu. Für U1–U4 bleiben L1,L2,L3,B1,B2,B3 sowie die konkrete Stoßvariante erhalten. Die gezeigten optischen Verbindungen werden **nicht** als verbindliche CNC-Fräsungen interpretiert.
- `writeOrderLine()`: speichert die normalisierte Produktion und die geprüfte Lieferantenreferenz/realen Teilzuschnitte/Packstücke **HPOS-kompatibel an der WooCommerce-Bestellposition**; zusätzlich menschenlesbare Parameter für Werkstatt und Kundenkonto. Keine internen Lieferanten-EKs in sichtbaren Metafeldern.
- `manualSpeedmasterText()`: klare Übergabe für manuelle Bestellungen mit Form, allen mm-Maßen, Stärke, Dekorcode, Kanten, Menge, Herstellerreferenz und Hinweis auf die separat verifizierte Fertigung. **Kein automatischer Auftrag an Speedmaster**.
- `wordpress/checkout-lu/HPZ_APL_WP_LU_Runtime.php`: Classic Cart, Store API, Cart-Wiederherstellung, Mengenänderungen, nur geklonte Produktpreisobjekte, Coupon-/MwSt-/Versand-/Checkout-Prüfung und Bestellpositionsspeicherung werden mit denselben Woo-Komponenten wie Gerade verdrahtet.
- Der existierende Steuer-/Versandkontext `HPZ_APL_WP_Woo_Context_09` wird für die drei **exakten** Produkt-ID/SKU-Paare wiederverwendet. Andere Shopprodukte bleiben unberührt. Gerade V3-Curve, Warenkorb und Bestellpositionen bleiben unverändert.
- WordPress-Plugin-Build enthält die L/U-Module. Browser-Preisvorschau und „In den Warenkorb“ funktionieren **nur**, wenn ein gesondert freigegebener L/U-Verkaufsadapter aktiv ist. Im Admin-Test bleiben L/U unverändert ohne verbindlichen Preis und ohne Bestellbutton.

## Live-Sicherheit und Schritt zur Freigabe

Aktuell ist der L/U-Verkauf absichtlich **doppelt gesperrt**:
1. Die explizite Konstante `HPZ_APL_LU_11_AUDITED_RELEASE` ist **in keinem ausgelieferten Plugin definiert**. Der neue Runtime-Adapter registriert bis dahin **keine** Public AJAX- oder Woo-Hooks.
2. Zusätzlich müssen die streng geprüften Produkt-IDs **1000080 (SKU HPZ-APL-L-FORM-2026)** und **1000081 (SKU HPZ-APL-U-FORM-2026)** veröffentlicht sein und eine separate, berechtigte Backend-Freigabe im WP-Optionseintrag `hpz_apl_lu_sale_v1` besitzen (`enabled`, `manual_supplier_handoff_verified`, `woocommerce_checkout_verified` ausdrücklich boolesch true).

Der serverseitige Belegspeicher `hpz_apl_lu_verified_proofs` ist noch **nicht** mit verifizierten Angeboten für beliebige L/U-Kombinationen gefüllt. Ohne einen vollständigen **exakt passenden** Speedmaster-Datensatz (Netto-EK, tatsächliche realisierbare Lieferteile/Verbindung, Packstücke, Versand-/Nebenkosten, gültige Versandmethode) **keine Quote, keine signierte Bestellung, kein Checkout**. Screenshots mit bloßen angezeigten Beträgen sind weiterhin **kein** freigegebener Nettopreis. Die sicherheitsrelevanten Flags dürfen nicht aus Browserdaten übernommen werden.

Nach abgeschlossenem Test läuft der manueller Speedmaster-Prozess exakt wie bei Gerade: Der Kunde bestellt im Shop; unsere Kolleg:innen übertragen die gespeicherten Maße und Herstellerinformationen in Speedmaster. Die Detailarbeit am Produktkopf (Galerie/oben) folgt erst, wenn der Bestellfluss funktioniert.

## Tests und nächster PR

- `php wordpress/checkout-lu/tests/lu-cart-order.php`: alle **8** L/U-Formen, HMAC, exakte Konfiguration, EK-Wechsel, Mengen, 35-%-Coupon-Floor, Länder/Steuer, Versand, Bestellmetadaten und manuelle Speedmaster-Übergabe.
- `php wordpress/checkout-lu/tests/lu-runtime-hooks.php`: durch synthetische Freigaben eingeschaltete Classic-/Store-API-Hooks, sichere Preisobjekt-Kopie, Woo-Checkout-Verifizierung und Metadatenspeicherung. **Test-Freigaben sind keine echten Unternehmensfreigaben**.
- `php wordpress/sale-launch-090/tests/disabled.php`: negativer Beweis: in normalem WordPress keinerlei L/U-Public-Routen, Bestellung oder veröffentlichte Preise.
- GitHub Actions müssen alle bestehenden Gerade-/PHP-/Browser-/ZIP-Regressionen weiterhin bestehen.

**Unmittelbar als Nächstes:** Im Admin des bestehenden Plugins verifizierte L/U-Speedmaster-EKs und Freigabe für eine **kontrollierte Testbestellung** verwalten, den Checkout mit echten/isolierten Testkonfigurationen prüfen, anschließend erst die L/U-Kaufschalter individuell freigeben. Kein zweites Plugin, keine neue Preisengine, keine UX-Generalüberholung.
