# Nächste gezielte Speedmaster-Nachweise / Abnahmereihenfolge

Diese Liste ist **kein Hindernis** für weitere dokumentierende, prüfende oder UX-sichernde PRs. Sie ist eine harte Grenze für Fertigungs-/Preis-/Shop-Freigabe.

### Geometrie: zuerst abschließen
1. **L4-B5-Grundmaß – Paar jetzt vorhanden (02.11.2026)**: Zwei identische Speedmaster-Konfigurationen mit B5=600/300 mm und ergänzende 3D-/Kantenansichten wurden geliefert. Der 2D-Konturfehler bei B5=300 wurde für diese konkreten Maße belegt; siehe [Bildmessung](L4-B5-VISUAL-20261102.md). **Noch offen:** weitere B1/B3-Kombinationen, der Zwischenwertverlauf, wahre B5-Maßdefinition, echte Teilplatten und die binäre Archivierung dieser sechs neuen PNGs. Die geometrische Formel ist nicht insgesamt vom Hersteller freigegeben.
2. **Vorderkante durchlaufend**: identische L1- oder L2-Maße, einmal eckig, einmal durchlaufend; dazu 2D- und 3D-Nahaufnahme der Eckübergänge. Aus den bereits gesendeten Ansichten ist die lange gerade Schräge erkennbar, nicht aber der technische Endradius.
   - **Auch R1/R2 bleibt offen:** PR #42 sichert lediglich die mathematische 2D-Zeichnungsgrenze und korrekte SVG-Kreisbogenfläche. Tatsächliche Speedmaster-Radien bzw. Fertigungsfräsungen sind weiterhin nicht bestätigt.
3. Für eventuelle **dynamische Mindest-/Maximalwerte** die tatsächlichen Speedmaster-Grenzen je Plattenstärke, Ecktyp, Schenkelmaß belegen.
   - **PR #41 konkretisiert den Belegbedarf:** Im Herstellerfoto zu L2 erscheint B3 als 60–2000 mm, während unsere konservative Kontur bei B2=600 mm nur 60–580 mm zeichnet. Bei L1/L3/L4 liegen mehrere B-Eckfoto-Maxima bei 600 mm, unsere Zeichnung endet bei 580 mm. Benötigt werden Fotos mit tatsächlich eingestellten 600 mm, nicht nur der angezeigten Eingabefeldobergrenze. Siehe [PR-41-Referenzmatrix](../../l-speedmaster-dynamic-corner-limits-20261102.md).

### Teilplatten, Stoß und Fertigung
4. **L1/L2 – erste sechs Nah-/Übersichtsbilder vorhanden (05.11.2026):** Je drei Speedmaster-Ansichten für L1/L2 bei 2000×1200 mm, B1/B2=600 mm, APL38 W980 zeigen **zwei grafisch getrennte Bereiche, eine Hilfsfuge sowie Flachdübel-/Lamello- und Arbeitsplattenverbinder-Symbole**. [Quellmanifest und Interpretation](../../phase-l1-l2-joint-photos-20261105.md). **Immer noch erforderlich:** echte Verbindertypen und -anzahl je Maßbereich, Maßzeichnung der CNC-Fräs-/Bohrpositionen und Tiefen, Kantenaufbau der echten Einzelzuschnitte, bestätigte Lieferstückzahl sowie getrennte Packstücke. Eine vergrößerte 3D-Grafik beweist diese Fertigungsangaben nicht.
5. **L3/L4 – zwei Stoßstellen beider Formen jetzt visuell dokumentiert:** L3-Draufsicht und transparente Verbindersymbole bereits im PR39-Archiv (02.11.2026), L4 mit B5=600 mm zusätzlich vier neue transparente/nahe Speedmaster-Bilder (05.11.2026). Bei beiden werden drei optische Regionen und Stoß A/B mit Flachdübel-/Arbeitsplattenverbinder-Symbolen gezeigt. Siehe [PR-52-Bildregister](L3_L4_JOINT_USER_20261105.json) und [fachliche Auswertung](../../phase-l3-l4-joint-photos-20261105.md). **Offen:** exakte CNC-Teilzuschnitte, die tatsächliche Lieferstückzahl, Verbinder-Typ/Menge/Fräsposition/-tiefe, Kanten am Stoß, Packstücke und echte Netto-EKs. L3-Profil wurde nicht vollständig mit der Modell-Einstellung abgeglichen. Vier neue L4-PNGs benötigen noch Binärarchivierung. Keine technische Freigabe aus Transparentbildern ableiten.
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
