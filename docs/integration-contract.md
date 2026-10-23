# Integrationsvertrag Prüfstand

Status: noch nicht zur Implementierung freigegeben; keine Hook-Namen geraten.

| Vertragspunkt | Aktueller Stand | Erforderlicher Nachweis |
|---|---|---|
| Zielsystem | beide URLs im Systembericht: holzplatten-zuschnitt.de, production | Systembericht 19.10.2026 13:02:16 +02:00 |
| Backend-Versionen | laut Bericht WP 7.1.3, PHP 8.3.35, WC 11.2.1, Acowebs 3.9.8, Flatsome Child 3.0 / Parent 3.20.8 | Systembericht erhalten; laufende Funktionskompatibilität noch nicht getestet |
| Sockel-/globale Formularzuordnung | Produkt 999985 direkt ausschließlich Formular 999984; globale Ausschlussoption nicht angehakt | Screenshot belegt direkte Zuordnung; globale/verschachtelte Wirkung auf Staging prüfen |
| Tatsächliche Feld-IDs und Datenformat | acht eindeutige Feld-IDs aus Export; siehe wcpa-sockel-audit.md | JSON strukturell gelesen; HTTP-Laufzeitformat weiterhin zu prüfen |
| WCPA-Feldänderungsereignis | offen | versionspassende Plugin-Datei/Schnittstelle |
| Reihenfolge von Grundpreis, WCPA-Preis und Zusatzcode | Grundpreis 14,60 € brutto, WCPA ersetzt bei Optionspreis >0; 77 Formeln enthalten 1,19/1,30; zwei aktive Snippets nur Darstellung | Steuerbasis belegt; Laufzeitintegration noch prüfen |
| Add-to-cart und Checkout-Wege | klassische Cart-/Checkout-Shortcodes bestätigt; Stripe Express auf Produkt/Warenkorb gemeldet | konkrete Add-to-cart-/Express-Hooks und deren Validierung noch prüfen |
| WooCommerce-Steuereingabebasis | inklusive MwSt.; Lieferadresse; Versandsteuer nach Produkten; Zwischensummenrundung; Bruttoanzeigen | Screenshot belegt; Steuersatztabellen/OSS für Ausland noch erforderlich |
| Bezugskosten und Kundenversand | 10/50 € interne Bezugskosten im Produktpreis; Flexible Shipping zusätzlich im Checkout | verbindliche Nutzerkorrektur; keine Versandbefreiung |
| Bestellspeicherung/HPOS | HPOS und Sync aus, CPT-Datenspeicher | durch Systembericht belegt; keine Migration vorgesehen |
| Konflikte mit bestehenden Konfiguratoren | nicht abschließend prüfbar | bestehende Formular-/Codezuordnungen |
| Weitere Preislogik | beide aktiven Snippets statisch geprüft, ausschließlich Sockel-Darstellung; SkyVerge aktiv | SkyVerge-/Theme-Wirkung auf Staging prüfen |
| Versandintegration | drei gewichtsabhängige Nettotarife, Modus Summe; Abholung in Rest der Welt | DE-Zuordnung, Grenzgewichte und echte Material-/Verpackungsgewichte fehlen |
| Währungen | EUR als Basis; WooPayments meldet Multi-currency aktiv | angebotene Währungen, Umrechnung und Gültigkeit für die drei neuen Produkte |
| Template-Kompatibilität | Bericht markiert acht Overrides als veraltet | gezielte Quellprüfung und spätere Staging-Regression; keine automatische Reparatur |

Fachlich verbindlich: Preisregeln dürfen nicht grundsätzlich monoton sein. Bestätigtes Beispiel siehe `price-reference-cases.csv` und freigegebene Spezifikation. Keine automatische Freigabe unbekannter Preis- oder Geometriebereiche.

Erst wenn die offenen Integrationspunkte belegt sind, werden konkrete Adapter und Hook-Reihenfolgen festgeschrieben. Dieser Prüfstand ist keine abgeschlossene Abnahme von Aufgabe 1.

## Ergänzung 23.10.2026
Architektur der Einbettung jetzt verbindlich: siehe embedding-contract.md. Drei vorhandene Produktentwürfe wiederverwenden, Produkt-IDs noch offen. Bestehende Flatsome-Inhalte erhalten. Lokale Demo ist weiterhin eigenständig und noch nicht technisch gekapselt. Laufzeit-Hooks und Shopadapter bleiben ungeprüft.

