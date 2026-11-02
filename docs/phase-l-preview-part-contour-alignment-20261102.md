# PR #46 – Teileansicht folgt der bearbeiteten L1–L4-Außenkontur

**Stand:** 02.11.2026 · **Ausschließlich interne 2D-Planung, nicht Fertigung und nicht bestellbar.**

## Gefundene inkonsistente Zeichnung

In der normalen L-Draufsicht wurde die gewählte **Abschrägung oder Rundung** bereits aus dem bearbeiteten Außenpfad gezeichnet. Die in PR #32 eingeführten Flächen der Ansicht **„Aufteilung“**, auf denen die Teilnummern aus PR #45 liegen, wurden dagegen aus dem **unbearbeiteten Grundpolygon** berechnet. Erst eine SVG-Maske verdeckte die abgeschnittenen Ecken optisch.

Dadurch waren die tatsächlichen internen Vorschaupolygone und deren Flächenschwerpunkte nicht identisch mit der sichtbaren, zugeschnittenen Oberfläche. Besonders bei stark ungleichen Abschrägungsmaßen konnte ein späterer Nutzer dieser internen Daten den falschen Flächenumfang erhalten, selbst wenn die SVG-Maske korrekt wirkte.

## Korrektur

`previewPartRegions()` verwendet jetzt die bereits errechneten und durch Eckbearbeitungen verkürzten **`result.points`**, nicht mehr die ursprünglichen `base`-Punkte. Die SVG-Oberflächenkontur, Grundmaße und alle Speedmaster-geprüften Eckfeldzuordnungen bleiben unangetastet.

- **L1/L2:** Obere Strecke und linker/rechter Schenkel enthalten keine rechnerischen Dreiecke mehr, die durch die äußeren Abschrägungen bereits weggefallen sind.
- **L3/L4:** Die drei **illustrativen** Bereiche (obere Strecke, Eckbereich, Schenkel) werden weiterhin an denselben unbestätigten Hilfs-Stoßlinien abgegrenzt. Die Endkonturen berücksichtigen die tatsächlich gezeichneten äußeren Abschrägungen.
- **Rundungen:** Das numerische Vorschau-Teilpolygon enthält die **Sehne** zwischen den beiden Kreisbogen-Endpunkten und bestimmt damit den Schwerpunkt. Damit beim Hervorheben kein schmaler, ungetönter Bereich zwischen Sehne und Kreisbogen entsteht, bekommt die SVG-Farbfläche zusätzlich ein separates, unbeschnittenes **Masken-Füllpolygon**. Erst die vorhandene SVG-Clipkontur schneidet diese Farbe auf den **tatsächlich gerundeten Außenpfad** zu. Dieses Füllpolygon ist ausdrücklich **kein** Teilzuschnitt. Die separate mathematische Kreisbogenflächenkorrektur im Gesamtwert `areaMm2` bleibt erhalten.
- **PR #45:** Bei Auswahl von Stoß A/B werden weiterhin nur die zwei angrenzenden, jetzt korrekt gekürzten Teilregionen markiert. Die Teilnummern werden aus dem Schwerpunkt dieser bearbeiteten Regionen neu bestimmt.

## Nachvollziehbare Rechenreferenzen (mm, mm²)

| L-Form | Belegte Eingabewerte / Testvariation | Unbearbeitete 2D-Fläche | Zwei entfernte Eckdreiecke | Gezeichnete Polygonfläche |
| --- | --- | ---: | ---: | ---: |
| L1 | 2000×1200, B1/B2=600, links L3=120/B3=240, rechts L4=120/B4=240 | 1.560.000 | 14.400 + 14.400 | **1.531.200** |
| L2 | 2000×1200, B1/B2=600, links L3=240/B3=120, rechts L4=120/B4=240 | 1.560.000 | 14.400 + 14.400 | **1.531.200** |
| L3 | L1/L2=2000, B1/B2=600, B3/B4=900; L5=120/B5=400, L6=150/B6=150 | 2.085.000 | 24.000 + 11.250 | **2.049.750** |
| L4 | L1/L2=2000, B1/B2=600, B3/B4=900; **B5-Grundmaß=300**, L5=150/B5-Eckmaß=150, L6=120/B6=240 | 1.680.000 | 11.250 + 14.400 | **1.654.350** |

Die L1–L3-Eckwerte stammen aus den archivierten Speedmaster-Referenzen vom 02.11.2026. Die kombinierte L4-Prüfung mit **B5-Grundmaß=300** plus äußeren Eckbearbeitungswerten ist bewusst eine **synthetische mathematische Regression**, *kein* Screenshot einer solchen kombinierten Herstellerbestellung. Die separaten B5=300/600-Speedmaster-Fotos aus PR #44 belegen nur die dort sichtbaren Konfigurationen.

## Test- und Sicherheitsnachweis

- Tests **zuerst rot**: bei L1 enthielt die alte obere Teilfläche 1.200.000 mm² statt der bereits korrekt gezeichneten **1.185.600 mm²**; analog der untere Schenkel 360.000 statt **345.600 mm²**. Der neue Satz deckte L1–L4, beide Abschrägungsarten, 100-mm-Rundungen und B5=300/600 ab.
- Nach minimaler Korrektur muss die Summe der Vorschau-Teilpolygonflächen mit der polygonalen Außenkontur übereinstimmen. Alle Teilnummer-Schwerpunkte müssen im betreffenden Polygon liegen.
- **Keine** neuen/echten Teilzuschnitte, Verbinder, Fräsungen, Packstücke oder CNC-Maße. `previewParts.status='illustration-only'`; `joints=null`, `shippingParts=null`, `supplierMappingVerified=false`.
- Keine Änderungen an Gerade, den Produkt-/Checkoutfreigaben, Preisregeln, WordPress-Auto-Updater oder U-Form.

**Noch offen:** Bestätigung der *tatsächlichen* Speedmaster-Teilplatten/Fräsungen beider Stoßstellen, die reale abweichende Geometrie bei ungetesteten Konfigurationen, L2–L4-EKs und Versanddaten. Siehe [Evidenzlücken](references/speedmaster-lu/EVIDENCE_GAPS.md).
