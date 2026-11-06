# L-/U-Arbeitsplatten: Nach PR #71 von Preisreferenzsammlung zu begrenzter Shopfreigabe

**Betreiberfrage 06.11.2026:** „Wie lange dauert das noch bis wir ne akzeptable Preisregel fürn Shop haben?“ Die Preisreferenzsammlung hat zahlreiche Kontrollpunkte für Form, L1-Länge, Breite, Materialstärke und zwei Dekore erbracht. **Ab jetzt NICHT wiederholt vier willkürliche Speedmaster-Preise pro Mini-PR abfragen.** Stattdessen mit festem Akzeptanzumfang, Konfidenzklassen, überprüften Fertigungs-/Versandkosten und Woo-Test in Richtung **begrenzte Shopversion** vorgehen. Für einen uneingeschränkten Shop aller 16 Dekore, aller Maße und Eckbearbeitungen existiert noch keine allgemeine, anhand echter Herstellerwerte validierte Kostenformel.

## 1. Vier neue Lieferanten-Preise und die Zusammenhänge

**Alle:** H1145 ST10 Bardolino Eiche, 1,5 mm dekorgleiche Profil-/Außenkanten, keine Eckbearbeitung, alle Preise **netto ohne MwSt.**, L1=2500, Menge 1.

| Form | Stärke | Vollständige Maße (mm) | H1145 EK netto | H1145 Vergleich | W980 gleicher Fall |
|---|---|---|---:|---|---:|
| **L2** | 17,5 | L1=2500 L2=1200 B1/B2=600 | **346,93 €** | L1=346,93 € (**gleich**) | L2=342,41 € |
| **L2** | 38 | wie zuvor | **516,49 €** | L1=516,49 € (**gleich**) | L2=511,56 € |
| **U2** | 17,5 | L1=2500 L2=1200 L3=1800 B1/B2/B3=600 | **499,74 €** | U1=499,74 € (**gleich**) | U2=494,03 € |
| **U2** | 38 | wie zuvor | **740,19 €** | U1=744,32 € (**−4,13 €**) | U2=734,46 € |

H1145-38-mm-U2 **−4,13 €** gegenüber U1 bestätigt unabhängig von W980 dieselbe Differenz bei L1=2500 (W980 U1 738,59 − U2 734,46 = 4,13 €); W980 auch bei L1=2000/2250 beobachtet. **Kein pauschaler Formabschlag über nicht gemessene Breiten/Längen/Dekore.** [Originale vier TEXT-Nettoquellen](references/speedmaster-lu/LU_H1145_L2_U2_NET_PRICES_20261106.json) und [zentrale Preis-CSV](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv).

## 2. Zwei Ziele klar auseinanderhalten

### Eingeschränkter Shopstart (MVP)

Die **erste akzeptable Preisregel** darf nur solche Konfigurationen verkaufen, die innerhalb eines **explizit begrenzten, kommerziell und technisch validierten Fensters** liegen:

- **Vorgeschlagener Start:** L1/U1, eckige Grundform, W980 ST7 und H1145 ST10, 17,5/38 mm, **L1 zwischen 2000 und 2500 mm**, übrige Maße unverändert exakt L1: L2=1200 B1/B2=600; U1: L2=1200 L3=1800 B1/B2/B3=600, ausschließlich **1,5 mm dekorgleiche Außenkanten**. Innerhalb dieses Fensters gibt es je Stärke und Dekor **zwei unabhängige Netto-Endpunkte**. H1145 L2/U2 bei L1=2500 und ihren unveränderten Referenzmaßen können separat als **exakt referenzierte** Testkandidaten vorbereitet werden – aber nicht automatisch L2/U2 über die ganze Länge verkaufen.
- **Außerhalb** dieses Fensters zunächst **„Anfrage“/nicht kaufbar** statt eines erfundenen Shoppreises. Es gibt weitere W980-L3/L4/U3/U4-Referenzen, doch deren vollständige Fertigung ist ebenfalls unabhängig freizugeben. Auch abweichende Breiten/Kombinationen nicht einfach aus 1D-Modellen zusammensetzen.
- Interne Preisbasis: exakt bestätigte Speedmaster-Netto-EKs bzw. **explizit begrenzte** 1D-Interpolation gleicher Form/Stärke/Dekor/sonstiger Maße. **Noch keine öffentliche Ausgabe aus Offline-Modell**, bevor reale Kosten und Fertigbarkeit freigegeben sind. Bestehende `HPZ_APL_Price_V3`: 40 % Zielmarge, 35 % Mindestrendite nach Rabatt (inkl. Gutscheinfall), 10 % Reserve, DE 19 % MwSt. **genau einmal**, Preisrundung. Kosten dürfen nicht unvollständig bzw. mit unterstelltem Versand aus Außenlänge kalkuliert werden.
- Rollout per **Feature-Flag**, zunächst geschlossener/nicht öffentlich kaufbarer Test, konkrete Testbestellung und explizite Betreiberfreigabe je Form-/Dekor-/Dicken-Fenster.

### Vollständiger frei konfigurierbarer Shop

Die bereits bestehende UI hat **acht Formen, 16 Dekore, 17,5/38 mm, variable L-/B-Maße und Eckvarianten**. Dafür sind die vorhandenen Stichproben **noch keine ausreichende multivariate Preisfunktion**. Besonders **U1 APL38 B1=600/650/700 sinkt bei steigender Breite**, während APL17.5 steigt: Eine pauschale €/m²-Regel oder allgemeiner Aufpreis ist faktisch widerlegt. Ein voller Shop benötigt entweder eine **verlässliche Preis-/Teile-API oder parametrische Preistabelle des Lieferanten** oder eine deutlich umfassendere, unabhängig geprüfte Kosten-/Zuschnittsmodellierung. **Keine ungedeckte Vollfreigabe aus positiv klingenden Stichproben.**

## 3. Die drei verbleibenden Freigabe-Arbeitspakete für einen begrenzten Start

1. **Kosten- und Geometrienachweis für 2–4 konkrete Startkonfigurationen:** Speedmaster physische Zuschnitt- und Verbinderdaten, Liefer-/Packstücklängen, Kantenbelegung und Materialverfügbarkeit liefern/technisch validieren. Frachtregel **10 € netto** Grund plus **einmalig +50 € netto** nur bei **mindestens einem nachgewiesenen tatsächlichen Lieferteil ≥1900 mm** (=60 €, **nicht 70 €**). Ohne validierte realen Teile darf kein automatischer Versandtier aus L1 abgeleitet werden. Übrige zusätzliche Kosten in V3 einrechnen; kein unterdeckter Preis.
2. **Einen gemeinsamen Preisweg per V3 aufbauen und prüfen:** Nicht noch eine zweite Engine. Genau parametrisierte, serverseitige Variante + staleness/supplier EK proof + Kosten/Fracht + 10%-Reserve + 40%-Marge + 35%-Rabatt-Floor + korrekte Steuer + serverseitige signierte Woo-Commerce-Preisfreigabe. Bei fehlender Dimension/Preis-/Kostenbeleg **klarer „Anfrage“-Status**, keine Schätzung als bindender Preis. Zusätzlich konservative Regressionstests für min-/max-, Gutscheine, Währungen, Versand DE/Ausland/CH und Mehrmengen.
3. **End-to-end Test und Freigabe:** vorhandene WordPress/Woo-Brücke, Shop-Vorschau, Warenkorb-Metadaten, Bestellung, Lieferschein/Speedmaster-Auftragsdaten **ohne Echtgeld-/Herstellerkauf** verifizieren. Betreiber sieht Testfälle mit echten Brutto-Zielpreisen, bestätigt bewusst die ersten erlaubten Fenster und aktiviert sie selbst. Öffentlich erst danach; weitere Dekore/Formen schrittweise.

**Nicht mit dem MVP zu vermischen:** UI-Finish (große Galerie, springende Grundriss-SVG, B5-„Einstellung“) kann direkt nach funktionierendem Testpfad erfolgen; Sonder-Eckbearbeitung braucht eigene Fertigungs- und Preiskontrolle.

## 4. Nächste sinnvolle Aktion

**Keine weitere pauschale Vier-Preis-Runde.** Zunächst Speedmaster **Zuschnittliste/Produktionsdaten und reale Pack-/Versandstücklängen** für eine repräsentative L1- und eine U1-Konfiguration in den beiden Stärken ermitteln (oder zuverlässige Hersteller-API/Produktliste erschließen). Damit wird die Fracht richtig und die Kostenrechnung verbindlich. Parallel nur die **bereits belegten** Parameter als L-/U-MVP-Preisfenster im Repository modellieren und prüfbar machen. Erst anschließend anhand der tatsächlich festgestellten Fehler/Abweichungen **wenige zielgerichtete weitere Preise** anfordern.

**Antwort auf die Zeiteinschätzung:** Es ist **kein seriöses fixes Fertigstellungsdatum** aus den Preis-Screenshots ableitbar, solange eine echte Lieferanten-Stückliste und ein erfolgreicher Woo-Test fehlen. Der begrenzte MVP hat **drei klar umrissene Freigabe-Arbeitspakete**; der vollständige, beliebige Shop erfordert wesentlich mehr Herstellerdaten. Kein Versprechen von unbeaufsichtigter oder zukünftiger Fertigstellung.
