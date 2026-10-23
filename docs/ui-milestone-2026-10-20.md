# UI-Meilenstein 20.10.2026

Nutzerpriorität: lokale visuelle Weiterentwicklung vor Preisrekonstruktion. Kein Hostingzugang erforderlich, keine Live-Verbindung. Vorherige lokale Fassung vollständig in archive/ui-v0.1-before-2026-10-20 gesichert. Bestehende Projektquellen, Sockel und Shop bleiben unverändert.

## Umsetzung

Eine zusammenhängende Oberfläche für Gerade, L-Form und U-Form: drei Schritte Form / Maße / Oberfläche. Große dynamische SVG-Draufsicht mit aktiver Bemaßung und Vergrößerung. Materialkarten 17,5/38 mm, zwei schematische Dekormuster, fest eingeschlossene passende 1,5-mm-Kante. Zusammenfassung mit Menge, bedingtem Preisbeispiel und deutlich gesperrtem Warenkorb.

L1–L4/U1–U4 sind wählbare Registereinträge, weiterhin keine belegten Lieferantenkonturen. Die Ansicht „Teile & Stöße“ erklärt die offenen Nachweise; sie erfindet keine Zerlegung. Rundung/Abschrägung bleiben exemplarische Eckmuster. Originalzeichnungen und Dekorbilder werden später ergänzt.

## Preisstand

Zwei neue exakte Referenzen APL38, Gerade, 2500×600 mm, eckig: W980 290,70 EUR, H1145 298,96 EUR. Als Netto-Einkauf entsprechend dem bisherigen Gespräch interpretiert. Kein allgemeiner Dekoraufschlag von 2,84 %. Andere Maße/Materialien werden daraus nicht extrapoliert.

H1145-Beispiel unter ausdrücklicher Einteil-Annahme: (298,96 × 1,30 + 10 + 50) × 1,19 = 533,89 EUR gerundet für eine Einheit; zwei Einheiten 1067,78 EUR. Kein verbindliches Angebot. Kundenversand kommt separat hinzu. Preisengine und Kaufstatus bleiben getrennt: keine Verkaufsfreigabe durch Vorliegen eines Referenzpreises.

## Prüfung

Automatisierte Fach-/HTTP-Tests: 41 Tests bestanden. Neue Tests sichern exakte Dekorzuordnung, gesperrte öffentliche Quote mit bedingtem Preisbeispiel und unveränderte Kontur bei Oberflächen-/Bemaßungswechsel.

Browserprüfung: Ansichtsrahmen 360/390/768/1280 px ohne horizontalen Inhaltsüberlauf; tatsächliche Inhaltsbreite unter Windows jeweils 15 px kleiner wegen Scrollbar. Formwechsel Gerade→L, Variante L4, Weiter-Navigation, Kommaeingabe 250,1 cm, Ablehnung 250,12 cm, Dekorwechsel und Zeichnungsdialog geprüft. Unbekannte Kombination zeigt keinen Bestellpreis. Smartphoneansicht ist eine Browsersimulation, kein Test auf physischem Gerät.

## Weiterhin notwendige Integration

Originalzeichnungen je Variante, Teile-/Stoßdefinitionen, Fertigungsgrenzen und Dekorverfügbarkeit verifizieren. Danach WCPA/PHP-Adapter in vereinbarter Testumgebung: tatsächliche Formulare, unabhängige serverseitige Validierung/Preise, Sessionwiederherstellung, Bestelldaten, Gewichte und Flexible Shipping. Internationale Steuerfälle, Rundung, Menge/Mischwarenkorb, Sockel-Regression, Cache/Flatsome, Tastatur/Screenreader und echte Mobilgeräte testen. Staging und Veröffentlichung gesondert mit Marco abstimmen.
