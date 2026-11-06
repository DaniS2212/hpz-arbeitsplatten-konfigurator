# Speedmaster – gezielte Preisprüfung für Kanten und Form-/Stoßvarianten

**Stand 06.11.2026, nach gemergtem PR #61.** Zwei original archivierte Speedmaster-Preise L1 2250 mm (**488,01 €**) und U1 2250 mm (**715,04 €**) treffen die zuvor berechneten Längen-Zwischenwerte auf den Cent genau. Der Import ist **vollständig**: Original-ZIP mit vier PNGs auf GitHub main, Git-Blob `3d1af1ea00d426a5456e97142d40111491911efd`, ZIP-Test `verify-original-pngs` für PR #61 **grün**. Kein Re-Upload nötig.

## Jetzt drei kontrollierte Speedmaster-Abfragen – keine neue Preisengine

Alle drei Tests verwenden **38 mm, W980 ST7 Platinweiß, die jeweils bekannten Maßfelder in mm, Standard-Dickkante 1,5 mm dekorgleich**; Fotos mit den vollständig sichtbaren Grundeinstellungen, dem Preis sowie ggf. der geänderten Kantenauswahl liefern.

1. **L1 → L2, identische Maße:** L2: L1=2250, L2=1200, B1=B2=600; die gleichen Standardkanten. Vergleichsreferenz **L1 488,01 €**. Isoliert den **Form-/Stoßvariantenwechsel**, keine Maßänderung.
2. **U1 → U2, identische Maße:** U2: L1=2250, L2=1200, L3=1800, B1=B2=B3=600; die gleichen Standardkanten. Vergleichsreferenz **U1 715,04 €**. Isoliert eine andere **U-Stoßvariante**.
3. **L1 nur eine Kante ändern:** L1 unverändert L1=2250, L2=1200, B1=B2=600; ändere in Speedmaster **genau eine** bisher 1,5 mm dekorgleich eingestellte Außenkante links auf eine **dort tatsächlich wählbare andere Einstellung** (z. B. „ohne“ nur falls wirklich verfügbar). **Exakten Optionsnamen notieren**. Vergleich **L1 488,01 €**. Kein gleichzeitiger Form-/Dekor-/Eckwechsel.

**Anschließend** die gleiche Kontrollaufnahme für U3/U4 (sonst identisch zu U1); L3 und L4 separat als neue Grundreferenzen, da diese andere Maßfelder besitzen. Die Werte aus früheren U2/U3/U4-/L4-Screenshots bleiben **nur Bildbeträge** und werden erst nach identischer Kanten-/Maßprüfung und Netto-Zuordnung zu einem Preisbeleg.

Dazu liegt die maschinenlesbare [Testmatrix](references/speedmaster-lu/PRICE_VARIANT_CONTROL_20261106.csv) mit **noch offenen Preisen bewusst leer**. Belege anschließend im zentralen `PRICE_EVIDENCE_CURRENT.csv` und mit Original-PNG-SHA/ZIP abspeichern. Jede neue Referenz erhält Form, alle L/B-Maße, Dicke, Dekor, alle Kanten, Bilddatum und genau beobachteten Betrag. Preisunterschiede als **Delta**, nicht als pauschale feste Zuschläge, interpretieren; zusätzliche Kontrollpunkte prüfen, bevor eine Regel generalisiert wird.

## Versand und Verkauf bleiben unverändert

- Speedmaster interne Anlieferung: **10 € netto Standard**, einmalig **+50 €**, sobald mindestens ein nachgewiesenes physisches Liefer-/Packteil **≥1.900 mm** Länge hat; also **60 € netto gesamt**. Bestehende V3-Funktion unverändert. Eine 2250-mm-Außenlänge **allein** ist kein Nachweis, wie lang jedes tatsächlich gelieferte Teil ist.
- 40 % Zielmarge, 35 % Rabatt-Minimum und 10 % Kostenreserve weiterhin in **`HPZ_APL_Price_V3`**, keine zweite Pricing-Engine.
- Screenshotbeträge **nicht** automatisch als nachgewiesene Nettopreise oder fertigungserlaubte Preise behandeln. Keine Freigabe von L/U-Live-Checkout oder automatische Speedmaster-Bestellung.
- Sobald Kanten-/Stoßdeltas für kontrollierte Fälle belegt sind, diese in die vorhandene interne Kalibrierung übernehmen und vor Freigabe mit weiteren echten Speedmaster-Referenzen validieren. `Gerade` unverändert lassen.

**Nächster Chat:** Zuerst `AGENTS.md`, `docs/CURRENT_PROJECT_HANDOFF_20261105.md`, diesen Testplan und das CSV-Register lesen, dann konkrete neue Nutzerbilder mit den Kontrollfall-IDs abgleichen. Offene Werte nicht erfinden.
