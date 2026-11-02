# Nächste gezielte Speedmaster-Nachweise / Abnahmereihenfolge

Diese Liste ist **kein Hindernis** für weitere dokumentierende, prüfende oder UX-sichernde PRs. Sie ist eine harte Grenze für Fertigungs-/Preis-/Shop-Freigabe.

### Geometrie: zuerst abschließen
1. **L4-B5-Grundmaß**: exakt dieselbe Konfiguration zweimal, *nur* B5-Grundmaß ändern (z. B. 600 auf 300 mm), beide Male Eingabewerte und Draufsicht. Das bestätigt/entkräftet die derzeit angenäherte äußere Diagonale.
2. **Vorderkante durchlaufend**: identische L1- oder L2-Maße, einmal eckig, einmal durchlaufend; dazu 2D- und 3D-Nahaufnahme der Eckübergänge. Aus den bereits gesendeten Ansichten ist die lange gerade Schräge erkennbar, nicht aber der technische Endradius.
   - **Auch R1/R2 bleibt offen:** PR #42 sichert lediglich die mathematische 2D-Zeichnungsgrenze und korrekte SVG-Kreisbogenfläche. Tatsächliche Speedmaster-Radien bzw. Fertigungsfräsungen sind weiterhin nicht bestätigt.
3. Für eventuelle **dynamische Mindest-/Maximalwerte** die tatsächlichen Speedmaster-Grenzen je Plattenstärke, Ecktyp, Schenkelmaß belegen.
   - **PR #41 konkretisiert den Belegbedarf:** Im Herstellerfoto zu L2 erscheint B3 als 60–2000 mm, während unsere konservative Kontur bei B2=600 mm nur 60–580 mm zeichnet. Bei L1/L3/L4 liegen mehrere B-Eckfoto-Maxima bei 600 mm, unsere Zeichnung endet bei 580 mm. Benötigt werden Fotos mit tatsächlich eingestellten 600 mm, nicht nur der angezeigten Eingabefeldobergrenze. Siehe [PR-41-Referenzmatrix](../../l-speedmaster-dynamic-corner-limits-20261102.md).

### Teilplatten, Stoß und Fertigung
4. **L1/L2**: Stoßverbindung stark vergrößert von oben und schräg; echte Verbinderzahl/-typen, Fräsungen und Kanten, tatsächliche Zuschnitte/Stückzahl der angelieferten Teile.
5. **L3/L4**: beide Stoßstellen separat im Detail, besonders das diagonale Eckstück und die Verbindung zu den Schenkeln. Technische Abmessungen/Verbinder nicht aus Transparenzansichten schätzen.
6. **Packstücke/Versand**: tatsächliche Länge, Breite, Höhe und Gewicht der versandfertigen Einheiten, Stückzahl und praktikable Speditionslösung.

### Preis / Checkout
7. **L2–L4-Einkaufspreise** mit vollständiger Parameterliste (Dekor W980, Dicke 17,5/38, gleiche Standard-Außenkante, Länge/Tiefe/Ecken). Daten nicht über gerundete Screenshots extrapolieren.
8. Je Typ mindestens mehrere kontrollierte Fälle mit anderer Länge, Schenkeltiefe, Stärke und Eckbearbeitung; erst mit echten EKs/möglichem Versand die Mindestmarge und die serverseitige WooCommerce-Preisbindung entwickeln.
9. Erst nach belegtem Preis + Produktion + Versand eine kontrollierte WooCommerce-Testbestellung und **ausdrückliche Nutzerfreigabe** für L. U1–U4 separat auf gleicher Belegbasis.

### Schon möglich, ohne neue Herstellerbilder
- Referenzbilder und Chatentscheidungen katalogisieren, 60 Screenshot-Fälle systematisch vorbereiten.
- Bestehende Model-/Browser-Tests gegen die dokumentierten Beispielwerte vertiefen.
- Maß-/Labelkollisionen, mobile Darstellung und interne Freigabesperren prüfen.
- Bestehende PR #36-Aufteilung und #37-Preisbelege auf Seiteneffekte kontrollieren.
