# Speedmaster L3/L4: Maßabgleich aus Kunden-Screenshots (30.10.2026)

## Produktgrenzen
- Gerade, Woo 1000083: UI, Preis-V3, Kauf- und Versandpfad bleiben unberührt.
- L, Woo 1000080: Designvorschau, keine freigegebene Preisregel, kein Warenkorb.
- U, Woo 1000081: weiterhin Entwurf, keine neuen Lieferantenfreigaben.
- Eine erfolgreiche CI oder ein WordPress-Plugin-Update ändert keine WooCommerce-Produktfreigabe.

## Direkt belegte Maße

### L3
- Grundform L3: Eingaben L1, L2, **gemeinsame Breite B1/B2** und **gemeinsame Breite B3/B4**.
- Beispiel: L1=2000 mm, L2=2000 mm, B1/B2=600 mm, B3/B4=900 mm. Die Innendiagonale verbindet (B3,B2) und (B1,B4) im schematischen Koordinatensystem.
- Dieses Beispiel: L1/L2 1200–4950 mm; B1/B2 300–900 mm; B3/B4 650–1050 mm.
- Weiteres Beispiel: B1/B2=900, B3/B4=950; Speedmaster zeigt andere Grenzen (L1/L2 1250–5000). Keine allgemeingültige Grenzformel behaupten.
- Bei beidseitiger Abschrägung bzw. durchlaufender Kante kommen **L5, B5, L6 und B6** als Eck-/Abstandsmaße hinzu: Beispiele 150 mm und 300 mm.

### L4
- Grundform L4: L1, L2, B1/B2, B3/B4 plus **eigenes Grundmaß B5**.
- Beispiel A: L1=L2=2000, B1/B2=900, B3/B4=1050, B5=600 mm; L1/L2 1550–5100 mm, B5 300–900 mm.
- Beispiel B: L1=L2=2000, B1/B2=300, B3/B4=950, B5=300 mm; L1/L2 950–5000 mm.
- Innendiagonale folgt B3/B4. Äußere 45°-Diagonale wird mit B5 als **geometrische Vorschauprojektion** dargestellt, nicht als freigegebene Zuschnittvorgabe.
- Eckparameter und das gleichnamige B5-Grundmaß liegen in **getrennten Namensräumen**. Lieferantenzuordnung von L4-Ecken bleibt zu prüfen.

## PR #28: Umsetzung
- Identisches Maßraster, Dekor-, Preis- und Zusammenfassungsdesign wie bei Gerade.
- L3: sichtbare Felder L1, L2, B1/B2, B3/B4. L4 zusätzlich B5.
- Intern bleiben B1 und B2 identisch sowie B3 und B4 identisch; manipulierte widersprüchliche Werte werden zurückgewiesen.
- Diagonalen hängen von B3/B4 und B5 ab, nicht mehr von einer geschätzten halben Schenkeltiefe.
- Zusammenhängende Draufsicht plus Aufteilung mit nur als Orientierung gekennzeichneten Stößen.
- L1/L2, U-Form und Kauf-Freigaben bleiben unverändert.

## Noch offen vor einem Verkauf
1. Dynamische Mindest-/Höchstwerte durch weitere Konfigurationen bei Speedmaster bestätigen. Die momentanen Vorschau-Sicherheitschecks sind keine Herstellerfreigabe.
2. Plattenteilung und CNC-Verbindungsmaße samt Fräsungen für L3/L4 bestätigen.
3. L4-B5 mit exakt **einer Änderung von B5** bei sonst identischen Grundmaßen fotografieren, damit die äußere Projektion geprüft werden kann.
4. Speedmaster-EK-Preisreferenzen mit **allen standardmäßigen 1,5-mm-dekorgleichen Außenkanten** sammeln. Die bestätigte L1-EK-Referenz **464,45 €** bei L1 2000 × 1200, B1/B2=600, APL38 Platinweiß bleibt unverändert. 352,27 € im Screenshot war ohne eine Standardkante.
5. U1–U4 anhand eigener Speedmaster-Zeichnungen verifizieren; kein automatischer Go-live.
