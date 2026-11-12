# Zurückgestellte WooCommerce-Speditionsprüfung ab 190 cm

**Status: NUR IM REPOSITORY GESICHERT, NICHT AKTIV, NICHT INS WORDPRESS-PLUGIN GEPACKT.**

Der Code in `HPZ_APL_WP_Freight_190.php` ist die unveränderte ursprüngliche
Variante aus PR #87 (Commit `52f5a59`). PR #88 hat die entsprechende
Checkout-Sperre und das Adminformular aus dem Produktiv-Plugin entfernt.

Die spätere Entscheidung über eine **separate Kundenspeditions-Versandmethode**
steht noch aus: Daniel spricht mit Marco darüber. Bis dahin gelten ausschließlich
die **bestehenden WooCommerce-Kundenversandarten**; das vorliegende Modul wird
weder eingebunden noch initialisiert, und es erzeugt auch keine Versandart.

Wichtig zu unterscheiden:

- **Interner Kostenansatz im Produktpreis:** 10 EUR netto bei allen
  konfigurierten Längen unter 1900 mm, 60 EUR netto ab mindestens einer
  Länge von 1900 mm (einmal pro Arbeitplatte).
- **Kundenseitige Versandmethode:** zunächst unveränderte WooCommerce-Rate;
  ein angenommener Betrag von 5,90 EUR ist erst im echten Checkout zu verifizieren.
- **Option für später:** Wenn Marco eine separate Kunden-Speditionsmethode
  verlangt, die alte Filter-/Prüflogik nach erneutem technischen Review
  bewusst reaktivieren. Sie braucht dann eine echte existierende Woo-Rate,
  passende Versandzonen, klar bestätigte Kundenpreise, verlässliche
  Konfigurations-/Signaturprüfung und eigene Live-Checkout-Regressionen.
  Kein automatisches Aktivieren durch Admin-Checkbox, Plugin-Update oder PR-Merge.

Der archivierte Code allein ist **nicht** die Neuanlage einer Versandart und
**keine** Produktionsfreigabe. Der Schwellwert ist **ab** 1900 mm, nicht
erst über 1900 mm.

Tests: `wordpress/sale-launch-090/tests/dormant-freight-190.php`
sichert die Rückholbarkeit und das Fehlen jeglicher aktiver Anbindung.
