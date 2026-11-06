# L-/U-Preisvergleich: H1145 ST10 Bardolino Eiche gegen W980 ST7 Platinweiß

> **Nachtrag PR #70, 06.11.2026:** Die vier unten noch als nächster Schritt genannten **H1145-2000-mm-Preise liegen jetzt vor**. [Aktuelle Tabelle mit acht 2000-/2500-mm-Nettoankern, Längenregeln und nächsten Testfällen](phase-lu-h1145-length-prices-20261106.md) ist maßgeblich; der folgende 2500-mm-Vergleich beschreibt die früheren vier Ausgangsreferenzen.

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
- **Nach PR #70**: Für H1145 ist **ausschließlich zwischen L1=2000 und 2500 mm** für **L1/U1 in beiden Dicken** eine streng begrenzte interne Längeninterpolation erlaubt, wenn alle anderen Parameter identisch sind. **Weiterhin keine Breiteninterpolation oder automatische H1145-Preise für L2–L4/U2–U4**. In solchen Fällen `missing-evidence`, `estimatedSupplierNetCents=null`, `purchasable=false`.
- Alle Quellen erhalten **dekorbezogene Referenz-IDs**. Das verhindert die Verwechslung identischer Form-/Maß-/Stärkenkombinationen unterschiedlicher Dekore.
- **V3 unverändert:** 40 % Zielmarge, 35 % Mindestmarge nach Rabatt, 10 % Reserve, 19 % deutsche USt. einmal. Speedmaster-Anlieferung **10 € netto** Standard plus **einmalig 50 € netto** bei nachgewiesenem realem Lieferteil ≥1900 mm, also 60 € netto gesamt. Außenmaß 2500 mm reicht als Lieferteilnachweis nicht.
- **Keine** aktuelle Speedmaster-Fertigungs-/Zuschnitt-/Verpackungs-/Verbinderdaten-Bestätigung, keine echte WooCommerce-Testbestellung oder Produktfreischaltung allein aus Preisbelegen. Historische W980-Modelle und der Gerade-Konfigurator bleiben unverändert.

## Nächster Kontrollblock nach PR #70

Die damals angeforderten vier H1145-Netto-EKs mit **L1=2000 mm** wurden geliefert und im [Nachtrag mit Quellen und Modellen](phase-lu-h1145-length-prices-20261106.md) dokumentiert: L1 17,5/38 mm **311,53/468,72 €** und U1 17,5/38 mm **464,34/696,55 €**. Alle vier bestehenden 2500-mm-Anker bleiben unverändert.

**Neue Priorität:** H1145-**L2** und **U2**, jeweils **L1=2500 mm** und 17,5 / 38 mm, bei denselben restlichen Maßen und Kanten. So können die Form-/Stoßpreisbeziehungen geprüft werden, statt erneut dieselben L1/U1-Längen anzufragen. Netto-EK und Produktfreigabe bleiben getrennte Themen; keine Preisbild-ZIPs erforderlich.
