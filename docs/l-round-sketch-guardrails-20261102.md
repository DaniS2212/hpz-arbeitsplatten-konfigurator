# PR #42 – L1–L4: mathematische Rundungsgrenzen und exakte Vorschaufläche

Stand 02.11.2026. **Nur Vorschau**, keine Speedmaster-Rundungs-/Radiusfreigabe, keine CNC-, Produkt-, Versand- oder Preiskalkulationsfreigabe. Gerade und WooCommerce-Verkaufsabläufe unverändert.

## Anlass / Fehler vor Änderung

- PR #41 sicherte die Abschrägungen gegen zu große Werte ab, **nicht** die eigenen Radiusfelder R1/R2. So konnte beispielsweise L1 mit 600 mm tiefem Schenkel ein R1=590 mm zunächst normalisieren, obwohl die vorhandene SVG-Kontur mindestens 10 mm Restkante benötigt. Die erst nachgelagerte Konturberechnung brach generisch mit „Restkante zu klein“ ab.
- Die L-`areaMm2` errechnete sich aus dem polygonalen Eck-Chord. Bei `round` verläuft der sichtbare SVG-Pfad jedoch als tatsächlicher Viertelkreis. Der numerische Flächenwert war daher für Rundungen **zu klein**.

## Implementierung ohne Herstellerspekulation

- `lCornerPreviewLimits` behandelt jetzt auch R1/R2 und ermittelt je Radius die kleinere der **beiden** tatsächlich angrenzenden Kantenstrecken. Es gelten weiterhin 10-mm-Schritte, die numerische Maximalgrenze 1000 mm sowie für die SVG-Kontur eine rein technische Restkante von mehr als 10 mm.
- Bei Beispielmaßen L1/L2 2000 × 1200, B1/B2=600 mm oder L3/L4 2000 × 2000, B1/B2=600 mm, B3/B4=900 mm werden 10–580 mm **als Zeichnungsgrenze** angezeigt. L1 mit B1=300 mm begrenzt R1 auf 280 mm, R2 bleibt 580 mm. Das sind **keine Speedmaster- oder Fertigungslimits**.
- Feldhinweise aktualisieren sich unmittelbar bei Änderung von L-/B-Grundmaßen. Ungültige Radien bekommen eine konkrete `corner-R1`/`corner-R2`-Fehlermeldung, und der L-Warenkorb bleibt gesperrt.
- `areaMm2` berücksichtigt bei jeder 90°-Rundung die tatsächliche Kreisbogendifferenz zum Chord-Polygon: `r² × (π/4 − 1/2)` wird hinzugerechnet. Bei zwei Radien summieren sich die Korrekturen. Die Fläche bleibt ein **nicht kaufbarer Darstellungswert**, keine Lieferanten- oder Preisgrundlage.
- Beide Änderungen sind zwischen `local/core/` und `wordpress/hpz-apl-admin-preview/assets/core/` gespiegelt.

## Testnachweise

- Node: `local/test/l-speedmaster-round-sketch-limits-20261102.test.mjs` – L1–L4, R1/R2 je Feld, akzeptierte/abgelehnte Rundungsgrenzen, dynamischer kurzer Schenkel, getrennte Auswahl, unveränderte Fertigungs- und Verkaufs-Sperren, echte mathematische Kreisfläche.
- Der **RED-Lauf** der Grenztests versagte zuvor an fehlenden R1/R2-Feldgrenzen; nach dem ersten Fix **GREEN**. Ein zusätzlicher **RED-Lauf** zeigte die fehlerhafte Rundungsfläche; nach der Bogenkorrektur erneut **GREEN**.
- Der bestehende Chromium-Test `wordpress/l-dynamic-limits-browser-runner.mjs` prüft jetzt auch R1=59 cm ungültig, R1=58 cm gültig, Änderung der Schenkelbreite auf 30 cm mit anschließendem R1-Maximum 28 cm, getrennten R2-Wert, mobile Horizontalscrollsperre und gesperrten Warenkorb.
- Vollständige CI (Node/PHP/Chromium/Preis/Plugin-ZIP) muss vor Merge grün sein. **Nichts wird automatisch gemergt.**

## Weiter offen

Die **tatsächlichen** Speedmaster-Rundungsgrenzen und die physische Radius-/Kantenfräsung sind noch nicht durch unabhängige Hersteller-Nahaufnahmen nachgewiesen. Hier wurde bewusst nur die eigene, nachvollziehbare 2D-Vorschau abgesichert. L4 B5-Grundrissgeometrie, transparente Verbindungen, Zuschnittdaten und L2–L4-Einkaufspreise bleiben separat offen.
