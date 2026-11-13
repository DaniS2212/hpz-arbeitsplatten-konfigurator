# Geschützter L/U-Warenkorb- und Kassen-Test im Liveshop

## Warum
PR #97 hat in einer isolierten echten WooCommerce-Installation zwei
Bestellungen (L1 + U3) gespeichert, erneut eingelesen und gelöscht.
364 WooCommerce-Assertions inklusive Maße, Ecken, Stoßrichtungen,
normalem Woo-Versand, 19-%-DE-Steuer und signierter Fertigungsmetadaten.
Der Live-WordPress-Shop selbst hatte L #1000080 und U #1000081 weiterhin
als Entwurf mit allen öffentlichen L/U-Freigabeschaltern geschlossen.

## PR #98: Administrator-ONLY, 15 Minuten, keine Bestellung
In Einstellungen → Arbeitsplatten-Vorschau kann ein Administrator
(WordPress-Rolle manage_options und edit_post) einen an die aktuelle
WordPress-Login-Session gebundenen 15-Minuten-Test starten.
Admin-Vorschau muss bereits aktiv sein, L/U müssen echte Entwürfe mit
exaktem SKU, einfachem Produkttyp und steuerpflichtigem Status bleiben.

Nur in dieser Anmeldung:
- Konfigurator zeigt die vorhandene signierte Woo-Quote und den
  Woo-Warenkorb-Link. Öffentlicher Verkauf bleibt gesperrt.
- Warenkorb verwendet WooCommerce-Preis- und Steuerberechnung,
  Versandart, die originalen streng validierten HMAC- und Preis-Hooks.
- Weiter zur normalen Shop-Kasse; ausdrücklich NICHT bestellen.
- Der Classic-Checkout-Prozess erzeugt einen Fehler vor Bestellung;
  der Woo-Order-Hook blockiert die Speicherung.
  Store API Checkout und Store Batch werden bei draft-Positionen
  bereits im REST-Eingang abgelehnt.
- Test-beenden widerruft die persönliche Sitzung sofort und entfernt
  nur L/U-Testpositionen aus dem Admin-Warenkorb.
- Nach 15 Minuten endet auch ohne Benutzeraktion der Testzugang.
- Kein Gast, anderer Login oder normaler Shopkunde bekommt Zugriff;
  weder WordPress-Produktstatus noch öffentliche Verkaufsschalter
  werden geändert.

## Sehr kurze Live-Prüfung
1. PR mergen und neue Plugin-Version im Liveshop aktiv prüfen; L/U
   weiterhin draft.
2. Einstellungen → Arbeitsplatten-Vorschau → Test starten.
3. L-Entwurfsvorschau: L1 mit normalen Maßen, Dekor/38 mm auswählen.
   Zum Warenkorb und zur Kasse. Nur signierte Maße, Brutto,
   regulären Shopversand und 19-%-Steuer kontrollieren.
4. L aus Warenkorb entfernen, U-Entwurfsvorschau: U3 mit unterschiedlichen
   Stoßrichtungen und bearbeiteten Innenecken. Denselben Kassenweg prüfen.
5. Testmodus beenden. Anonym kontrollieren, dass L/U nicht bestellbar
   sind. KEINE Bestellung, Zahlung, Kundenmail oder Speedmaster-Aktion.
6. Ergebnisse knapp protokollieren, nicht die 256er Matrix wiederholen.

Gespeicherte Fertigungsdaten sind durch den PR-#97-Datenbanktest
nachgewiesen, NICHT durch eine behauptete Live-Bestellung.
Verkaufsfreigabe bleibt eine separate ausdrückliche Entscheidung.
