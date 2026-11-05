# PR #51 – L1/L2: neue Speedmaster-Stoßansichten vom 05.11.2026

**Interne Planungs-/Belegnotiz. Weder Fertigungsfreigabe noch verbindliche CNC-/Packstück-/Preisgrundlage.**

## Sechs Originalansichten, exakt ein überprüfbarer Beispielwertsatz

Der Nutzer hat sechs **Speedmaster-Original-Screenshots** über die Unterhaltung bereitgestellt, jeweils drei für **L1** und **L2**. Die tatsächlich vorliegenden Bildpixel wurden lokal mit SHA-256 geprüft. [Quellmanifest](references/speedmaster-lu/L1_L2_JOINT_USER_20261105.json) enthält **Dateinamen, Bildgrößen, exakte Prüfsummen und Bildrollen**.

| Typ | Bilder aus der Unterhaltung | Eingaben (mm) | Beobachtung |
| --- | --- | --- | --- |
| **L1** | `image(20261105-084611).png`, `-084634`, `-084711` | L1=2000, L2=1200, B1=600, B2=600 | Linker L-Schenkel, zwei optisch abgesetzte Paneelbereiche, eine sichtbare Stoßstelle |
| **L2** | `image(20261105-084919).png`, `-084934`, `-085007` | L1=2000, L2=1200, B1=600, B2=600 | Gespiegelter rechter L-Schenkel, zwei optisch abgesetzte Paneelbereiche, eine sichtbare Stoßstelle |

Weitere im Screenshot gewählte Eigenschaften: **APL38 (38 mm), W980 ST7 Platinweiß, Dickkante 1,5 mm dekorgleich**, keine Außeneckenbearbeitung. Einzelne Screenshots zeigen zudem einen Preis; die Preiszahl ist **kein zusätzlicher, gesichert netto bestätigter EK**. Das bisher bestätigte L1-EK-Beispiel von 464,45 € gilt nur für den bereits separat dokumentierten Preisbeleg.

### Stoß-Achse – visuelle 2D-Rekonstruktion

Die symmetrischen 600-mm-Schenkelbreiten und die unterschiedlichen äußeren Achsen bestätigen genau diese **visuellen Hilfsfugen** im bestehenden Grundriss (nicht die Fräslinie einer CNC):

| Form | L-Punktekontur (mm) | Stoß A der Vorschau (mm) | Illustrierte Regionen |
| --- | --- | --- | --- |
| L1 | (0,0) (2000,0) (2000,600) (600,600) (600,1200) (0,1200) | **(0,600) → (600,600)** | Obere Strecke / linker Schenkel |
| L2 | (0,0) (2000,0) (2000,1200) (1400,1200) (1400,600) (0,600) | **(1400,600) → (2000,600)** | Obere Strecke / rechter Schenkel |

Beide Bilder zeigen im Transparentmodus grafische gelbliche **Flachdübel-/Lamello-Symbole** und dunkle **Arbeitsplattenverbinder-Symbole** am Stoß. Diese Symbole sind keine ausgemessenen Fräspunkte und keine verbindliche Packliste.

### Was ausdrücklich NICHT aus sechs Bildern hervorgeht

- **Kein verifizierter Verbindertyp, keine verbindliche Stückzahl**, kein Abstand von Außenkanten oder untereinander, keine Fräslänge/-tiefe, keine feste Verbindungsregel bei anderen Maßen.
- **Zwei gezeigte Teilbereiche sind keine verifizierte Lieferstückzahl**; tatsächliche CNC-Einzelzuschnitte, Montageorientierung und Stoßkanten-Bekantung sind noch nicht schriftlich bestätigt.
- Keine Größen-/Herstellergrenzen, keine Packstückgewichte, Speditionsklassen oder Kosten und keine universelle L1-/L2-EK-Regel.
- **Für jede abweichende Maß-/Material-/Eckkonfiguration** ist das neue Bildpaar nicht als gleichwertiger Herstellerbeleg zu verwenden.

### Programmatische Absicherung

- `local/core/l-geometry.mjs` bindet an das **exakte** Eingabeset eine zusätzliche `assemblyPhotoObservation` mit `status:'photo-observation-only'`, **zwei sichtbaren Bereichen**, einem illustrierten Stoß und den **zwei Symbolklassen**. Ohne exaktes Matching bleibt sie `null`.
- Die normale **Aufteilung** zeigt beim gewählten Stoß eine eng begrenzte Belegnotiz. Sie nennt **keine** Zahl oder Position der Verbinder. Die normale Draufsicht und das Verhalten bei anderen Maßen bleiben unverändert.
- Testnachweis: L1/L2-Stoßpunkte und Spiegelung, Matching-Grenzen bei Maßen, Stärke und Eckbearbeitung, grafische Zwei-Regionen-Ansicht, source-image SHA, und weiterhin `joints=null`, `shippingParts=null`, `supplierMappingVerified=false`.
- **L/U bleiben nicht kaufbar; Gerade, Preise, Steuer- und WooCommerce-Bestellpfad unverändert.**

## Originaldaten-Archivierung

**Wichtig:** Die sechs Bilder liegen als Nutzeruploads in der Unterhaltung und wurden tatsächlich gehasht, aber sind noch **nicht als Binärbilder im privaten GitHub-Repository** erfasst. Das frühere 60-PNG-Archiv aus PR #39 enthält **andere Originale vom 02.11.2026**; diese neuen sechs dürfen nicht fälschlich dazugezählt werden. Ein späterer verifizierter Binär-Commit ist für dauerhafte visuelle Reproduzierbarkeit nötig. Das maschinenlesbare Quellmanifest und die Beobachtungen sind unabhängig davon im GitHub-Code dokumentiert.

## Nächster Hersteller-Schritt

Nach dieser reproduzierbaren visuellen Eingabebasis: **L3/L4** transparente/nahe Fotos beider real sichtbarer Stoßstellen mit kompletter Maßliste; danach **U1–U4** Variantenkarten und echte Draufsichten. Für echte Fertigung später zusätzlich Hersteller-Unterlagen zu Verbinder-/Fräsmaße, Packstückdaten und belastbare Netto-EKs.
