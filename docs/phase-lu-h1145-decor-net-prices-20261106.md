# L-/U-Preisvergleich: H1145 ST10 Bardolino Eiche gegen W980 ST7 Platinweiß

**Datum:** 06.11.2026. Vier neue **Speedmaster-Netto-Einkaufspreise** direkt vom Betreiber als Text übermittelt. Alle Preise ohne MwSt.; deutsche +19 % werden bereits von `HPZ_APL_Price_V3` genau einmal berücksichtigt. Profil und **sämtliche Außenkanten ausschließlich 1,5 mm dekorgleich**, Eckform unbearbeitet, Menge 1. **Keine Screenshots, PNG-/ZIP-Archive oder manuelle Bildablage.**

## Vier kontrollierte Dekorvergleiche

Alle **L1**: L1=2500, L2=1200, B1=B2=600 mm. Alle **U1**: L1=2500, L2=1200, L3=1800, B1=B2=B3=600 mm. Bei jeder Zeile nur das Dekor ändern, Stärke/Form/Maße/Kanten bleiben gleich.

| Form | Stärke | W980 ST7 netto | **H1145 ST10 netto** | Aufpreis H1145 |
|---|---|---:|---:|---:|
| L1 | 17,5 mm | 342,41 € | **346,93 €** | **+4,52 €** |
| L1 | 38 mm | 511,56 € | **516,49 €** | **+4,93 €** |
| U1 | 17,5 mm | 494,03 € | **499,74 €** | **+5,71 €** |
| U1 | 38 mm | 738,59 € | **744,32 €** | **+5,73 €** |

**Fachliche Grenze:** Die vier Dekor-Aufpreise sind **nicht identisch**. Weder ein fixer Euro-Zuschlag, ein einheitlicher Prozentsatz noch die Übertragung der W980-Längen-/Breitenmodelle auf H1145 sind mit diesen vier Punkten belegt. Auch eine Gleichheit von L1/L2 oder U1/U2/U3/U4 in H1145 lässt sich aus der beobachteten W980-Gleichheit noch **nicht** ableiten.

**Datenquellen:** [Vier neue vollständig strukturierte Netto-Referenzen](references/speedmaster-lu/LU_H1145_FOUR_DECOR_NET_PRICES_20261106.json) (alle Maße, Dekore, 1,5-mm-Kanten, Material, EUR-Netto, differenzierter Vergleich) und [zentrales Speedmaster-Preisregister](references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv). Die Werte wurden **nicht eigenständig im Browser abgerufen** – die frühere WebGL-Bedienung im Cloud-Browser war unzuverlässig. Die Angaben stammen vom Betreiber.

## Technischer Stand (PR #69)

- `wordpress/hpz-apl-admin-preview/data/decors.json` enthält bereits das reguläre, fest freigegebene Katalogdekor `H1145` mit `supplierCode=H1145 ST10`, `displayName=Bardolino Eiche`. **Keine neue Dekorauswahl** oder Änderung des bestehenden 16-Dekore-Katalogs erforderlich.
- Das **interne**, nicht im Plugin ausgelieferte `pricing-v3/HPZ_APL_LU_Calibration_11.php` liest nun die vier neuen **`operator_confirmed_net_EK`**-Referenzen bei exakt passendem Dekor, Form, Stärke, Maßen und Kanten. Sie werden als `exact-operator-confirmed-net-reference` inkl. exaktem Netto-EK und nur **hypothetischen** deutschen V3-Bruttoszenarien ausgegeben.
- Für H1145 **gibt es keine Längeninterpolation, Breiteninterpolation oder automatisch abgeleitete Preise für L2–L4/U2–U4**. In solchen Fällen `missing-evidence`, `estimatedSupplierNetCents=null`, `purchasable=false`.
- Alle Quellen erhalten **dekorbezogene Referenz-IDs**. Das verhindert die Verwechslung identischer Form-/Maß-/Stärkenkombinationen unterschiedlicher Dekore.
- **V3 unverändert:** 40 % Zielmarge, 35 % Mindestmarge nach Rabatt, 10 % Reserve, 19 % deutsche USt. einmal. Speedmaster-Anlieferung **10 € netto** Standard plus **einmalig 50 € netto** bei nachgewiesenem realem Lieferteil ≥1900 mm, also 60 € netto gesamt. Außenmaß 2500 mm reicht als Lieferteilnachweis nicht.
- **Keine** aktuelle Speedmaster-Fertigungs-/Zuschnitt-/Verpackungs-/Verbinderdaten-Bestätigung, keine echte WooCommerce-Testbestellung oder Produktfreischaltung allein aus Preisbelegen. Historische W980-Modelle und der Gerade-Konfigurator bleiben unverändert.

## Nächster minimaler Kontrollblock

Um das Modell auf H1145 über mehrere Längen zu erweitern, **vier H1145-EKs bei L1=2000 mm**, alle anderen Parameter wie oben, jeweils **17,5 mm und 38 mm** für L1 und U1, erneut nur dekorgleiche 1,5-mm-Kanten. Die bereits belegten **W980 L1/U1**-Gegenwerte bei 2000 mm liegen vor: L1 307,67 / 464,45 € und U1 459,29 / 691,49 € netto. Dann kann geprüft werden, ob sich der Dekoraufpreis bei geänderter Länge verschiebt, und es entstehen enge echte H1145-Längenklammern. Danach gezielt H1145 bei L2 und U2 (je 2500 mm) zur Prüfung der Stoßvarianten bzw. ein drittes repräsentatives Dekor, bevor ein allgemein verkäuflicher Dekorpreisalgorithmus entwickelt wird. **Keine Massenabfrage aller 16 Dekore** ohne belastbare Transferlogik.

**Wichtig:** Der aktuelle PR ergänzt nur **offline verwendbare Preisbeobachtungen**. Keine öffentliche Verkaufspreisänderung und keine stillschweigende WooCommerce-Kauf-Freigabe.
