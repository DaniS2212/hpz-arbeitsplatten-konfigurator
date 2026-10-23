# Aufgabe 1 Bestandsaufnahme

Status: dokumentarische Bestandsaufnahme aktualisiert; technische Laufzeitprüfung noch offen. Zielshop: https://holzplatten-zuschnitt.de/. Nur lesende Prüfung; keine Live-Testbestellung, keine Konfigurationsänderung.

## Systembericht eingegangen

Quelle: `C:/Users/danie/OneDrive/Holz-Liebling/WordPress/Systembericht Holzpl.Zuschnitt..txt`, erzeugt am 19.10.2026 um 13:02:16 Uhr +02:00. Nur gelesen; die Originaldatei bleibt unverändert. Folgende Angaben sind durch den bereitgestellten Bericht belegt, nicht durch einen neuen Live-Backendabruf:

| Punkt | Berichteter Stand |
|---|---|
| WordPress-/Website-Adresse | https://holzplatten-zuschnitt.de |
| Umgebung | production, kein Multisite |
| WordPress / PHP | 7.1.3 / 8.3.35 |
| WooCommerce / Datenbankversion | jeweils 11.2.1 |
| Acowebs Custom Product Addons | aktiv, 3.9.8 |
| Theme | Flatsome Child 3.0, Parent Flatsome 3.20.8 |
| Warenkorb / Kasse | Seiten 19/20, klassische Shortcodes `[woocommerce_cart]` / `[woocommerce_checkout]` |
| Bestellspeicherung | HPOS und HPOS-Synchronisierung deaktiviert; `WC_Order_Data_Store_CPT` |
| Währung / Ausgabe | EUR, Dezimalkomma, zwei Nachkommastellen |
| WCPA-Formularbestand | 17 Einträge vom Typ `wcpa_pt_forms`; Zuordnung/Inhalt nicht enthalten |

## Konkrete Integrationsprüfpunkte

- **SkyVerge-Maßpreisrechner 3.23.1 aktiv:** Produktbezogene Einstellungen und mögliche Eingriffe in Preis/Menge prüfen. Aktivierung allein belegt keine Kollision und keine Anwendung auf das Sockelprodukt.
- **Code Snippets 3.10.2:** Beide aktiven Snippets vollständig geprüft; ausschließlich Darstellung für Produkt 999985, keine Preis-/Versandberechnung.
- **Flexible Shipping 6.13.3 und Sendcloud 1.0.36 aktiv:** Kundenversand bleibt zusätzlich zu internen Bezugskosten erhalten. Tarife sind durch Screenshots belegt; Länderzuordnung und Grenzgewichte bleiben Laufzeittests. Germanized 4.1.5 und One Stop Shop 1.8.5 sind ebenfalls aktiv; tatsächliche Steuer-/Versandwirkung bleibt ein Einstellungsbefund.
- **WP Rocket 3.23.5.1 aktiv:** Minifizierung und Skriptverzögerung sowie Ausnahmen für Konfigurator/Warenkorb/Checkout prüfen.
- **Stripe Express Checkout auf Produkt- und Warenkorbseiten gemeldet:** Auf Staging sicherstellen, dass die neuen Arbeitsplatten auch über Express-Pfade nur mit vollständig validierter Konfiguration gekauft werden können. Bestehende Express-Funktionen anderer Produkte bleiben unverändert.
- **WooPayments meldet aktivierte Mehrwährungsfunktion:** Tatsächlich angebotene Währungen und Umrechnungspfad prüfen. EUR-Referenzwerte nicht ungeprüft auf Fremdwährungen anwenden; eine Entscheidung für die neuen Produkte darf keine globale Währungseinstellung verändern.
- **Produktions-Zahlungsanbindung vorhanden:** Bei später gesondert genehmigtem Staging Zahlungsanbieter, Sendcloud, E-Mail, Webhooks und Hintergrundaktionen isolieren. Aus dem kopierten Bericht allein wird kein sicherer Testmodus angenommen.

Der Bericht markiert acht Overrides als veraltet: Flatsome `cart/cart-shipping.php`, `cart/cart.php`, `cart/mini-cart.php`, `checkout/thankyou.php`, `single-product/product-image.php`, `single-product/product-thumbnails.php`, `single-product-reviews.php` sowie Child-Theme `woocommerce/emails/customer-on-hold-order.php`. Das ist ein Kompatibilitätsprüfpunkt, kein Nachweis einer bereits fehlerhaften Shop-Funktion. Keine Theme-/Plugin-Updates oder Reparaturen im Rahmen dieser Bestandsaufnahme. Benötigt werden insbesondere die Child-Theme-E-Maildatei und relevante Child-Theme-Anpassungen; Warenkorb-, Versand- und Mini-Warenkorb-Overrides werden bei Bedarf versionsgenau gelesen.

## Frühere öffentliche Vorprüfung

Die bisherigen öffentlichen Abrufe in dieser Unterhaltung zeigen am Produkt https://holzplatten-zuschnitt.de/produkt/moebelsockel-nach-mass/ WCPA-Pro-Frontend-Dateien mit Versionsparameter 3.9.8. Öffentlich ausgelieferte Dateien nennen außerdem Flatsome 3.20.8 und WooCommerce 11.2.1. Das belegt die ausgelieferten Dateien, nicht den tatsächlichen Backend-Stand. Hinweise auf Germanized und Cache-/WP-Rocket-Integration sind vorhanden.

Der vorhandene Holz-Liebling-Connector hat für ein exemplarisches Produkt eine URL auf www.holz-liebling.de geliefert; er wird nicht als Backend-Zugang zum Zielshop behandelt. Ein bestätigter lesender Backend-Zugang für holzplatten-zuschnitt.de liegt bislang nicht vor.

Die frühere lokale gezielte Dateisuche lieferte keine passenden Backend-Unterlagen. Inzwischen liegen Systembericht und der Export „Sockel-Konfigurator“ samt Preisoptionen-Screenshot vor. Der Export wurde lesend ausgewertet; siehe `wcpa-sockel-audit.md`. Die zwei aktiven Snippet-Exporte liegen inzwischen vollständig vor; übriger relevanter Theme-/Plugin-Code ist noch nicht geprüft. Der Projektordner ist kein Git-Repository. Synchronisierte Quellen bleiben unverändert.

## Aktuell ausgewertete Unterlagen

Systemstatus, WCPA-Sockelexport, Preis-/Anzeigeoptionen, Produktdaten, direkte Formularzuordnung, Steueroptionen, Snippet-Übersicht, beide aktiven Snippet-Exporte und dargestellte Flexible-Shipping-Regeln sind ausgewertet. Details und Quellenzuordnung: [Backend-Ergänzungen](backend-final-evidence.md).

- Sockel 999985: einfach, 14,60 € brutto, besteuerbar/Standard, Gewichtsfeld 0 kg, keine Versandklasse; direkt nur Formular 999984. Bestand vollständig unverändert lassen.
- Steuern: Bruttoeingabe, Lieferadresse, Versandsteuer nach Produkten, Zwischensummenrundung, Bruttoanzeige. Faktor 1,19 in WCPA ist damit nicht automatisch doppelte Steuer; Ende-zu-Ende-Prüfung bleibt erforderlich.
- Beide aktiven Snippets sind auf Sockel 999985 begrenzt; eines ergänzt „ab“, das andere begrenzt anfängliche Dekoransicht und bietet Alle/Weniger an.
- Interne Bezugskosten 10/50 € betreffen Speedmaster → Holz-Liebling. Reguläre Kundenversandkosten Holz-Liebling → Kunde kommen zusätzlich im Checkout hinzu. Frühere Versandbefreiungsannahme ist vollständig ersetzt.
- Drei Zonentarife dokumentiert; exakte Grenzgewichte bei Berechnungsmodus „Summe“ noch ungeprüft. Deutschland ist in der gekürzten Mitteleuropa-Länderliste nicht abschließend zuzuordnen.

## Konkrete nächste Voraussetzungen

1. Bestehende Staging-URL und geeigneter Zugang beziehungsweise gesonderte Abstimmung einer neuen isolierten Kopie. Noch keine Umgebung erstellt; keine Live-Schreibrechte benötigt.
2. Vollständige Länder/Regionen/Postleitzahlen der Zone Mitteleuropa, um Deutschland sicher zuzuordnen.
3. Relevante Standard-Steuersatz-CSV und aktive OSS-/Auslandsregeln; Steueroptionen allein belegen keine internationalen Sätze.
4. Belegte Material-/Flächengewichte für APL17,5/APL38 sowie Verpackungs-/Zubehörgewichte. Kein automatischer Verkauf mit geratenen oder Nullgewichten.

Die versionsgenaue WCPA-Anbindung, SkyVerge-Wirkung und verbleibende Child-Theme-Anpassungen werden möglichst direkt auf der isolierten Kopie geprüft. Bereits erhaltene Unterlagen müssen nicht erneut geliefert werden. Standardprodukt-Regression und vollständige Laufzeit-/Geometrie-/Preistests bleiben Teil der Umsetzung.

## Zwischenprüfung

JSON-Exporte nur geparst und statisch gelesen; Screenshots ausgewertet; keine Snippets ausgeführt. Dokumente und Testanforderungen korrigiert. Ausführbare Preis-, Steuer- und Versandtests sind mangels Implementierung/Testumgebung noch nicht gelaufen. Verbindliche Fälle stehen in [Preis-/Versandtests](shipping-tax-test-cases.md).
