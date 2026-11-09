# U-Konfigurator – Speedmaster-U1-Eckoptionen und sichtbare U1–U4-Stöße (09.11.2026)

## Tatsächlich durch die gelieferten Screenshots gestützt

Der Betreiber hat am 09.11.2026 einen Speedmaster-Kachelbildschirm mit **10 U1-Angebotsvarianten** gezeigt:

1. U1 unbearbeitet
2. U1 links abgerundet (R1)
3. U1 links abgeschrägt – eckig (L4/B4)
4. U1 links abgeschrägt – Kante durchlaufend (L4/B4)
5. U1 rechts abgerundet (R2)
6. U1 rechts abgeschrägt – eckig (L5/B5)
7. U1 rechts abgeschrägt – Kante durchlaufend (L5/B5)
8. U1 links und rechts abgerundet (R1/R2)
9. U1 beidseitig abgeschrägt – eckig (L4/B4/L5/B5)
10. U1 beidseitig abgeschrägt – Kante durchlaufend (L4/B4/L5/B5)

**Unabhängige Basis-Stoßvarianten** aus den bestehenden 05.11-Speedmaster-Fotos:
- U1 links quer, rechts quer
- U2 links längs, rechts längs
- U3 links längs, rechts quer
- U4 links quer, rechts längs

Diese vier Muster zeigen denselben Außenumriss, aber unterschiedliche sichtbare Stoßlinien. Das neue 4er-Kartenmenü zeigt diese Linien **direkt**; auch die Haupt-Draufsicht markiert sie, ohne Wechsel zu „Aufteilung“.

## Was sich funktional ändert

- U1–U4: Bildkarten statt des schwer verständlichen Auswahlfelds „U3 · längs/quer“.
- U1–U4: getrennte Entscheidung „Welche innere Ecke bearbeiten?“ (keine / links / rechts / beide), anschließend Rundung / eckige Abschrägung / Abschrägung mit durchlaufender Kante. Keine alte generische Bearbeitung der **äußeren oberen linken** Ecke mehr.
- U-Eckmaßfelder mit eigener Kennung: R1/R2 für Rundungen; L4/B4 für linke, L5/B5 für rechte Abschrägung. Schenkellängen (L2/L3), obere Tiefe B1 und Breiten B2/B3 begrenzen die **rein grafisch** zulässigen Einschnitte.
- Die Zeichnung aktualisiert tatsächlich die innere untere Schenkelecke; beim Rundungsbeispiel zwei echte Viertelkreise, bei Abschrägung zwei wirkliche Schnittsegmente. „Durchlaufend“ wird als schematische Konturvariante geführt, nicht als bestätigtes CNC-Profil.
- Gerade: SVG-Maßzahlen auf vergleichbare Bildschirmgröße wie L gesetzt (vorher begrenzte einseitige Textgröße durch niedrige Plattentiefe), ohne Maßgeometrie oder Preise zu verändern.
- L, Gerade und die bereits bekannten 4 U-Grundpreisanker bleiben unverändert.

## Preis-/Freigabegrenzen

Der U1-Speedmaster-Screenshot zeigt **keine zusätzlichen Netto-EKs für die neun U-Bearbeitungen**. Für Eckbearbeitungen verwenden wir – wie bei L – einen **ausdrücklich geschätzten** kaufmännischen Kostenansatz statt einer erfundenen Herstellerrechnung. Netto EK-Modellaufschlag pro Seite: ab 25 €; größerer Radius, größere Abschrägung und „durchlaufend“ höher; beidseitig zusätzlich 12 € Handling. Das bleibt kein bestätigter Speedmaster-EK.

Die separate Preiskennung enthält `uCorner` inklusive aller Eckmaßfelder. Basiskonfiguration **ohne Bearbeitung** behält ihren bisherigen Konfigurations-Fingerprint, Kosten und Preis. Als Kaufvoraussetzung für U mit `uCorner` gelten weiterhin Betreiber-Freigaben einschließlich **`corner_model_approved`**, weitere tatsächlich bestätigte Nebenkosten, Woo-Versand/Steuern und zuvor getesteter Checkout. Ohne diese Flags keine öffentliche Kaufbarkeit. Keine Fertigung, kein Speedmaster-API-Auftrag.

**Evidenzvorbehalt:** Der neue U1-Kachelscreenshot belegt nur die zehn **U1-Ausführungen**. Die Übertragung derselben inneren Eckvarianten auf U2–U4 ist eine geometrisch plausible **UI- und Preisannahme**, noch keine explizite Bestätigung der Speedmaster-Auswahlseiten für U2/U3/U4 oder deren Spezialkosten. Der Kunde erhält keine Aussage über abgesicherte CNC-Zuschnitte. Vor endgültiger Live-Schaltung U2–U4-Eckvarianten im Operator-Review auf Lieferbarkeit prüfen. **Die allgemeine Grundpreis-Preisrunde ist abgeschlossen; kein neuer großer Speedmaster-EK-Sammelprozess.**

## Prüfungen

- Node: alle 4 U-Stoßaufteilungen + 9 Eckbearbeitungskombinationen pro U-Form (36) sowie geometrische Mindestabstände, unveränderte Standard-Referenzen, keine Bearbeitung der falschen oberen Ecke.
- PHP: 4 × 9 separate, vom Basismodell unabhängige Eckpreise und Signatur-Fingerprints, ungültige Eingaben, Freigabesicherung.
- Checkout-Sandbox: signierte Eckmaße, U3-Stoßbeschreibung und die manuellen Speedmaster-Übergabefelder.
- Chromium: U1–U4-Kacheln, die im Standardmodus sichtbaren Stoßlinien, Rundung links sowie beidseitige Abschrägung, 1366/390 px.
- WordPress-Bundle: die gleichen neuen Module, PHP-Dateien und CSS; keine automatische Veröffentlichung.

**Anschluss:** In der WordPress-Vorschau alle 10 U1-Varianten visuell prüfen; anschließend U2–U4-Sonderbearbeitungen anhand echter Optionen bestätigen. Dann die bereits geplanten beiden letzten Shop-Schritte Kosten/Versand und Woo-Testcheckout.
