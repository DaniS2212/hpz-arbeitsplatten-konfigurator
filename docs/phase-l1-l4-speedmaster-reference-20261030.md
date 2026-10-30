# Speedmaster L-Arbeitsplatten – Referenzabgleich 30.10.2026

## Produkt und Leitbild
- Woo Produkt Gerade 1000083: bewährte UI und produktiver Checkout, **nicht verändert**.
- Woo Produkt L-Form 1000080: bleibt Entwurf und gesperrt.
- Woo Produkt U-Form 1000081: bleibt Entwurf und gesperrt.
- Oberfläche von L/U verwendet dieselbe Küchenstudio-UI wie Gerade: drei Schritte, Maßraster ohne Zusatzkarten, Farbwelt, Dekore, Zusammenfassung. Nur tatsächlich formspezifische Felder unterscheiden sich.

## Screenshots: nachweisbare Grundform- und Maßzuordnung
Die Bildvorlagen kamen vom Nutzer am 30.10.2026 aus dem Speedmaster-Konfigurator.

| Typ | Grundform | L1 | L2 | B1 | B2 | Teilung aus Screenshots |
| --- | --- | --- | --- | --- | --- | --- |
| L1 | Schenkel links | gesamte obere horizontale Länge | linke Gesamtlänge | Breite linker Schenkel | Tiefe obere Platte (rechts) | zwei Platten, gerader Stoß im linken Schenkel |
| L2 | Schenkel rechts | gesamte obere horizontale Länge | rechte Gesamtlänge | Breite rechter Schenkel | Tiefe obere Platte (links) | zwei Platten, gerader Stoß rechts |
| L3 | links, innere Diagonale | obere Gesamtbreite | linke Gesamtlänge | linker Schenkel | obere Tiefe rechts | zusätzliche diagonal verlaufende Innenecke und gesondertes Eckteil in der 3D-Darstellung |
| L4 | links, innere + äußere Diagonale | obere Gesamtbreite | linke Gesamtlänge | linker Schenkel | obere Tiefe rechts | wie L3, zusätzlich obere äußere Eckdiagonale |

**Gegenüber der alten generischen Familienskizze war B1/B2 vertauscht**. Hier ist die Herstellerbeschriftung maßgebend.

## Eckvarianten
Für L1–L4 zeigt die Hersteller-Auswahl jeweils zehn Zustände: keine, links rund/eckig abgeschrägt/Kante durchlaufend, rechts rund/eckig abgeschrägt/Kante durchlaufend, beidseitig rund/eckig abgeschrägt/Kante durchlaufend.

- Links gerundet: R1, rechts gerundet: R2.
- Links abgeschnitten bei L1/L2: L3 und B3, rechts: L4 und B4.
- Links abgeschnitten bei L3/L4: L5 und B5, rechts: L6 und B6.
- Diese Eingaben dienen hier ausschließlich der Konturvorschau. Der genaue Hersteller-Grenzbereich ist noch nicht belegt; deshalb keine Preisfreigabe.

## Was die neue Zeichnung zeigt
- Kundenseitig eine durchgehende Umrissform mit korrekter L1/L2-Spiegelung und B1/B2-Beschriftung.
- Die Aufteilung visualisiert die aus den Screenshots erkennbaren Stoßrichtungen als feine Linien und benennt ausdrücklich die **ungeprüfte Maßlage**.
- L3/L4: Der Diagonalversatz wurde für die Bildervorschau aus den erkennbaren Proportionen modelliert (bei 600 mm Schenkeltiefe 300 mm), **kein fertigungsfähiges Maß oder berechneter Zuschnitt**. Exakte B3/B4/B5 und eventuelle Winkel/Abhängigkeiten offen.
- Alle Lieferanten-Fertigungsparameter, Plattenteilmaße, Fräsungen und Versandmaße bleiben null/gesperrt. Es wird kein Preis und kein Warenkorb freigeschaltet.

## Konkrete noch benötigte Speedmaster-Belege (für nächste PR)
1. **L3 und L4 jeweils im Schritt „Maße“**: vollständige Ansicht aller Maßfelder **B3, B4, B5 und ggf. L3/L4**, ihre Standardwerte und ihre Auswirkungen bei Änderung. Ein Vorher/Nachher-Screenshot einer Änderung wäre optimal. So wird die diagonale Geometrie exakt statt aus Proportionen abgeleitet.
2. **L1 und L2 – Detail Steckverbindung**: je eine vergrößerte Fräs-/Steckverbindungsansicht, möglichst von oben und schräg, inkl. Nut-/Verbinderposition und Zahl der Plattenteile.
3. **L3 und L4 – zwei Stoßbereiche**: pro Form die beiden Verbindungskanten im Detail, ebenfalls mit Fräsungen/Verbindern; zusätzlich die diagonale Innenecke separat.
4. **Eckbearbeitung**: ein Detail der Eingabefelder R1/R2, L3/B3, L4/B4, L5/B5 und L6/B6 mit min/max und Verhalten bei „eckig“ versus „Kante durchlaufend“.
5. **Später vor Bestellung**: Hersteller-Maßgrenzen, Material-/Dekor-Verfügbarkeit, Preisbeispiele für alle Typen, Teile-/Packstücklängen, Versand. Kein globaler L/U-Go-live ohne Freigabe.

## Regression und Freigabe
- Tests: L1/L2 Grundkontur, Spiegelung und Maße; L3/L4 Basisdiagonalen; 4×10 Eckzustände; keine Lieferanten-/Preisfreigabe.
- Browser: L/U und Gerade in denselben Responsive-Layouts; aktive Maße, Aufteilung, kein Cart.
- Gerade wird nicht geändert und wird durch bestehende WooCommerce- und Browserregression geprüft.
