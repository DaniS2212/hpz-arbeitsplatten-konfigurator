# Speedmaster-Abnahme L1–L4 und U1–U4 – technischer Übergabepunkt

Stand: 05.11.2026 · **Interne Abnahmevorbereitung, keine Fertigungs-/Preis-/Verkaufsfreigabe**

## Was seit PR #39–#49 bereits vorbereitet ist

- L1–L4 Grundriss, Ecke, Maßachsen und 2D-Teilungsillustration; visuelle Referenztests und privates Speedmaster-Review aus dem PR-39-Archiv.
- Die L4-B5-Bildpaare sind als numerische Beobachtungen katalogisiert; **die sechs Original-PNGs sind noch nicht binär im Archiv**.
- Schematische Stoßstelle A/B bleibt nach PR #48 über Maßänderungen eindeutig. PR #49 gleicht auch das interne Lieferantenaudit an diese stabilen Kennungen an.
- Vier historisch bestätigte L1-Netto-Einkaufspreise sind nur interne Einzelfallzeugen; sie dürfen nicht zu einem L2–L4- oder U-Preisschema interpoliert werden.
- Bestehender vollständiger WordPress-Kaufpfad ist **nur für Gerade**. L und U bleiben vorerst ausgeschlossen. Die U1–U4-Varianten sind noch **keine individuellen Herstellerkonturen**, sondern schematische Platzhalter.

## Zentraler, maschinenlesbarer Prüfvertrag

**[SUPPLIER_CLOSEOUT.json](references/speedmaster-lu/SUPPLIER_CLOSEOUT.json)** erfasst getrennt je Variante L1–L4 und U1–U4:

- `observed`: Herstellerfoto / Kundenangabe liegt vor, **keine** Freigabe; bereits eingetragene L-Bilder/L1-Preise bleiben hier.
- `reviewed`: tatsächlicher Speedmaster-Lieferantennachweis inklusive `sourceRefs`, `reviewedBy`, `reviewedOn` und `details` wurde vom Team geprüft. Synthetische Testfälle sind niemals Herstellerbelege.
- Fehlt der Datensatz, bleibt der Eintrag **offen**. Eigene Shop-/Vorschaubilder dürfen nicht als Speedmaster-Quelle verwendet werden.

Die folgenden Gruppen bleiben separat nachzuweisen (mit Varianten-spezifischen Extras):

| Bereich | Verbindlich benötigte Angaben und Beispiele |
| --- | --- |
| Grundriss/Zuordnung | Vollständige Speedmaster-Eingabeliste in mm und Draufsicht derselben Konfiguration; L-/B-Achsen und 1:1 Kontur, bei U1–U4 vier unterschiedliche Herstellergrundrisse |
| Ecken/Kanten | Identische Grundmaße für abgerundet/eckig/Vorderkante durchlaufend, 2D und 3D-Nahaufnahmen, echter Radius/Kantenprofil und durchlaufender Verlauf |
| Herstellergrenzen | Tatsächliche MIN/MAX pro Form, Dicke (17,5/38), Länge, Breite und Ecktyp; Screenshots mit tatsächlich eingestellten Grenzwerten, nicht nur Feldbeschriftungen |
| Teilplatten | Reale Zahl und exakte Zuschnitte (bei L3/L4 auch Diagonalstück); Stoßlinien und getrennte Kantenbearbeitungen |
| Verbinder | Pro realem Stoß Typ, Anzahl, Fräsposition/-tiefe, Fixierung, Zeichnung bzw. eindeutige Herstellerangabe |
| Verpackung/Versand | Lieferumfang als Packstücke mit Länge/Breite/Höhe/Gewicht; zulässige Versandart und reale Anlieferkosten |
| Preise | Mehrere echte EK-Netto-Angebote je Variante inklusive vollständiger Konfigurationsparameter, 17,5/38, Dekor und Standard-Dickkante 1,5 mm |
| WooCommerce | Nach geprüfter Kalkulation serverseitiger Preis/Steuer/Versand/Mindestmarge, Menge, Rabatte, absichtlich fehlerhafte Eingaben, Gast-/Checkout-E2E und **separate Betreiberfreigabe** |

Für **L4 B5** zusätzlich: B5-Eingabe einmal kontrolliert verändern (gleiche übrige Maße), tatsächliche Außen-/Innenkontur und Teilung bestätigen. Für **U1–U4** gilt: erst die echten Speedmaster-Formen zuordnen, dann auch echte Stoßstellen und Teile definieren. Keine frei erfundenen U-Polygonvarianten.

## Prüfbefehle für spätere Lieferanteninformationen

Vom Repository-Root:

```bash
node scripts/speedmaster-closeout.mjs
node scripts/speedmaster-closeout.mjs --check
node scripts/speedmaster-closeout.mjs --json
node scripts/speedmaster-closeout.mjs --require-complete
```

`--check` ist **bei lückenlos erfassten und bei offen gekennzeichneten Nachweisen grün**, meldet jedoch fehlerhafte/irreführende Register. So kann CI während der Entwicklung laufen. `--require-complete` ist bewusst **rot**, solange auch nur ein notwendiger Prüfpunkt aussteht. Selbst wenn die Belegdokumentation vollständig wird, bleiben die Shop-/CNC-/Preisfreigaben **immer aus**, bis Geometrieabnahme, Versandkalkulation und separater Freigabeprozess vorliegen.

## Realistischer Restweg bis zur Verkaufsreife

1. **Herstellerbelege einpflegen**: fehlende Speedmaster-Bilder/Zuschnitte/Verbinder/Packstücke/EK je Form mit einer eindeutigen Referenz; kein Blankoscheck für alle Maße.
2. **Reale Geometrie**: für jeden belegten Herstellerfall 1:1 Kontur- und Stoß-Abnahme (Desktop/Mobile), bei U1–U4 erst Grundrisse implementieren.
3. **Kalkulation**: erst mit echten EK-Mustern die Logik modellieren und mit unabhängigen Musterangeboten prüfen; Netto-Marge, Versand und Gutscheine getrennt behandeln.
4. **WooCommerce**: L und U erhalten einen **separaten**, standardmäßig inaktiven, serverseitig validierten Produkt-/Preis-/Bestellpfad; Gerade bleibt dabei unberührt.
5. **Testbestellungen & Abnahme**: technischer Regressionstest, echte Testbestellung ohne echte Lieferantenbestellung, Operator-Freigabe, danach UX-Feinschliff.

Weder PR #49 noch ein komplett ausgefülltes JSON aktiviert einen Shop-/Produktverkauf.
