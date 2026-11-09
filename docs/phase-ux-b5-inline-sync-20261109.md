# UX-Korrektur nach PR #76: B5, Skizzen-Eingaben und kompakte Preisansicht

Datum: 09.11.2026. Grundlage: sechs vom Betreiber gelieferte WordPress-Screenshots mit L4, einem B5-Diagonalbereich, ungültigem B5=180 cm, direktem R2-/B6-Feld und unerwünschtem Preisinfo-Text.

## Akzeptanzkriterien
1. B5 (L4-Grundmaß) **nicht** auf der oberen Maßschiene B3/B4 beschriften. In der Skizze am **real sichtbaren äußeren Diagonalschnitt** eine knappe, anklickbare B5-Markierung zeigen. Wenn die Speedmaster-B5-Einstellung wegen der begrenzten Außendiagonale **nicht** der tatsächlichen physischen Strecke entspricht, mit einem Zeiger auf die Diagonale arbeiten, **keinen** falschen Doppelpfeil für ein geometrisch falsches Maß zeigen. Im nicht gekappten Fall zeigt eine physisch richtige Diagonallinie das Maß.
2. Die B1/B2- und B3/B4-Grundmaße sind pro Paar ein einziges synchrones Eingabefeld, aber zwei unterschiedliche **Zeichenpositionen**. Klick auf beide muss das jeweils **eine** rechte Feld und den passenden Skizzenwert aktivieren. B5-Grundmaß und „Eckmaß B5“ müssen getrennt bleiben.
3. Alle eingeblendeten Inline-Editoren sind deutsch, z. B. **R2 in cm**, nie `corner-R2 in cm`. Beim Klick auf eine Skizzenbeschriftung das tatsächlich benutzte rechte Feld markieren; beim Klick auf das rechte Feld die gleiche aktive Skizzenbeschriftung markieren. Direkte Eingabe und Formular verwenden denselben Wert und dieselbe Validierung.
4. Keine „(z. B. 180 oder 180,5)“-Beispiele in **Kunden-Fehlermeldungen**. Falscher B5-Wert `180` bei gültigem Fenster 30–90 cm: **genau ein** sichtbarer Fehler `B5: Erlaubt sind 30–90 cm. Eingegeben: 180 cm.`, keine alten B5-Zahlen in der Last-Valid-Skizze. Der gültige Rest der Skizze darf sichtbar bleiben; Warenkorb/Preisgabe bleiben gesperrt.
5. Die lange interne `availabilityNote` („Kaufmännischer Modellpreis“, „vorläufig 0 € Zusatzkosten“, „keine Bestellung“) wird **nicht** erneut in der kompakten **Kunden-Zusammenfassung** ausgegeben. Die Nachweise und Kostenunsicherheit bleiben im **internen PHP-Quote**, der tatsächliche Shop-Verkauf bleibt geschützt, der ausgewiesene Preis bleibt „Unverbindlicher Bruttopreis“ und die kurze USt-/Versandinfo bleibt.
6. Dieselbe UI für lokale Vorschau und installierbares WP-Bundle. Gerade, L1–L4, U1–U4, Kundenkauf-/Preis-Margenregeln, Lieferanten-Bestelldaten, Signaturen und Produktfreigaben werden nicht verändert.

## Tests
- Node: L4 B5 gekappt bei 30 cm, ungekappte Diagonalbemaßung bei 90 cm, B1/B2 und B3/B4 gleiche Eingaben, fehlerhafte B5 zeigt keinen alten Zahlenwert, deutsche Texte, keine Beispiele.
- Chromium Desktop **1366 px** und Mobil **390 px**, echte Plugin-Bundle-Oberfläche: Wechsel zu L4, B5=30/40/90/180, Inline-Feld, R2, synchronisierte Eingabe und vereinfachte Fehlermeldung.
- Vorhandene Price-V3-/Woo-/Browser-/WordPress-Paketprüfungen müssen grün bleiben.

**Kein Shop-Release / keine Produkte aktiviert.** Nach Merge in Admin-WordPress-Vorschau prüfen; danach die zwei bereits dokumentierten Kaufstart-Schritte: Kosten/Versand und WooCommerce-Testcheckout.
