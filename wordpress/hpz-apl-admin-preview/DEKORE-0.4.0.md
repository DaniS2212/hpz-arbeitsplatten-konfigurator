# Dekorbilder 0.4.0 – Abnahmeunterlagen, 26.10.2026

Basis ist der vom Nutzer gemergte PR #2 (`4f24337`). Die vorbereiteten
Zuordnungen aus PR #1 (`8064a5a`, `feature/dekor-katalog-16`) wurden auf den
neuen Branch `feature/dekorbilder-040` übernommen. PR #1 wurde nicht gemergt
oder geändert. Keine WordPress-Installation, Produktbearbeitung oder Veröffentlichung.

## Lieferumfang und Bildherkunft

Quelldatei: `hpz-dekore-16-speedmaster.zip`, vom Nutzer bereitgestellt.
SHA256: `BDC7BC953BE29634194E2F875755E72FC3DBB85F5141F7F57F25B9D62BFFFF1B`.
Das Paket bleibt unverändert. Seine 16 Original-JPEGs, das Zuordnungsmanifest
und die Paketbeschreibung liegen unter `docs/references/decor-images/`.
32 unveränderte WebP-Dateien liegen unter `local/public/decors/` und werden
bytegleich nach `wordpress/hpz-apl-admin-preview/assets/decors/` gebündelt.
Alle 32 Bildhashes entsprechen dem gelieferten Manifest.

Kacheln verwenden die optimierten Vorschaubilder, die Zeichnung die Vollbilder.
Keine Hotlinks, externen Schrift-/Bilddienste oder Bildgenerierung. Die Bilder
werden weder eingefärbt noch inhaltlich bearbeitet. Die Oberfläche der Zeichnung
wird proportional mit einem Ausschnitt des echten Bildes gefüllt. Das ist keine
Zusicherung von physischem Rapport, Maserungsrichtung, fortlaufender Struktur
über mehrere Teile oder Bildschirmfarbtreue. Das betrifft auch L-/U-Skizzen.

## Vereinbarte Zuordnung

Nur die erste Spalte wird in der Kundenoberfläche angezeigt. Interne IDs bleiben
unter anderem für Bilddateien und gültige Konfigurationsdaten erforderlich.
Lieferanten- und Herstellerbezeichnungen erscheinen nicht in Kacheltexten,
Bildbeschriftungen oder Zusammenfassung.

| Kundenname | Interner Lieferantencode |
|---|---|
| Platinweiß | W980 ST7 |
| Schwarz | U999 ST76 |
| Bardolino Eiche | H1145 ST10 |
| Arlington Eiche | H3303 ST10 |
| Terrazzo grau | F021 ST75 |
| Marmor grau | F095 ST87 |
| Metall anthrazit | F121 ST87 |
| Granit schwarz | F128 PA |
| Beton hellgrau | F186 ST9 |
| Schiefer natur | F235 ST76 |
| Bronze | F302 ST87 |
| Metall gold | F629 ST16 |
| Sandbeige | F661 ST76 |
| Marmor weiß | F812 ST9 |
| Perlgrau | 44375 DP |
| Schiefergrau | 44405 DP |

Maßgeblich sind die vom Nutzer vereinbarten Speedmaster-Zuordnungen aus PR #1
und dem Bildmanifest, nicht abweichende Hersteller-Aliasnamen. Alle 16 Dekore
sind für beide Materialstärken als **visuelle Auswahl** verfügbar. Daraus folgt
keine bestätigte Lieferbarkeit je Material, Form oder Sondermaß.

## Daten- und Sicherheitsvertrag

- `local/core/decor-catalog.mjs` hält Namen, IDs, Lieferantencodes und Bilddateien
  getrennt. `catalog()` liefert der Ansicht nur ID, Kundenname und Bilddateien.
- `normalize()` akzeptiert ausschließlich bekannte Dekor-IDs und ermittelt
  `decorSupplierCode` selbst aus dem Katalog. Vom Browser mitgelieferte Namen,
  Lieferantencodes, Bild-URLs, Preise oder Freigabeflags bestimmen diese Zuordnung
  nicht. Der bestehende mm-/Legacy-Vertrag bleibt erhalten.
- Der lokale HTTP-Server prüft erneut und liefert nur 32 ausdrücklich zugeordnete
  WebPs aus. Originale, Manifest und interne Preisdateien werden nicht freigegeben.
- Der Build erzeugt aus derselben Quelle `data/decors.json` im Plugin.
  `HPZ_APL_Decor_Catalog::resolve($id)` prüft ausschließlich die lokale Zuordnung;
  unbekannte/numerische IDs und unvollständige/mehrdeutige Kataloge bleiben leer.
  Der PHP-Renderpfad verwendet ein so aufgelöstes Startdekor. Es gibt keinen
  neuen Konfigurations-, Preis-, Warenkorb- oder Bestellendpunkt.
- Das ist ein vorbereiteter PHP-Katalogadapter, keine serverseitige Fertigungs-
  oder Verkaufsfreigabe. Die vorhandenen Admin-/Entwurfs- und Kaufsperren bleiben
  unverändert. WCPA-Formulare und Einstellungen werden nicht geändert.

## Oberfläche

Große Bildkacheln mit eindeutiger Auswahl, drei Spalten am Desktop ab 1101 px
und zwei auf kleinen Ansichten. Keine Filter oder versteckten Dekore.
Alle 16 sind direkt auswählbar. Die gewählte Textur erscheint auch in der
vergrößerten Zeichnung und den Eckdetails; Materialdarstellungen passen sich an.
SVG-Musterkennungen sind pro Instanz und Dialog isoliert.

Du-Ansprache einschließlich „Deine Arbeitsplatte konfigurieren“. Im Schritt
„Oberfläche“ füllt die vorhandene Zusammenfassung den Bereich unter der Vorschau
auf dem Desktop. Mobil bleibt die Reihenfolge Vorschau → Auswahl → Zusammenfassung.
Es gibt weiterhin nur eine Zusammenfassung und einen gesperrten Kaufbutton.
Form-/Maßschritte behalten die bisherige Desktop-Breite.

## Tests und Grenzen

- 95 Node-Tests bestanden; die bisherigen 85 bleiben erhalten. Ein zusätzlicher
  PHP-Laufzeittest ist ausdrücklich übersprungen, da hier kein PHP vorhanden ist.
  Auf einer PHP-Installation: `php wordpress/decor-catalog.test.php`.
- Neue Prüfungen: 16 eindeutige IDs/Namen/Codes/Bildpaare, Manifesthashes,
  Ablehnung ungültiger IDs und manipulierter Codes, lokale Bildauslieferung,
  SVG-Textur und unveränderte Kontur, Paketbilder sowie alle 96 Kombinationen
  aus drei Produktfamilien, zwei Materialstärken und 16 Dekoren als gesperrte Vorschau.
- 65 Dekor-Browserprüfungen einschließlich aller 16 Wechsel auf allen drei
  Produktseiten, Bildladen, Material-/Schrittwechsel und fehlender Codeanzeige.
- Zwölf neue Dekor-Layoutfälle: drei Produktfamilien × 360/390/1366/1440 px.
  Keine horizontalen Überläufe, Kachelgröße/Schrift/Auswahl/Zusammenfassung geprüft.
- Regression: 46 A1-Funktionsprüfungen, zwölf Eck-Layoutfälle, vier bisherige
  Layoutfälle und zwölf Isolations-/Lebenszyklusprüfungen bestanden.
- Belege: `040-node-results.txt`, `040-browser-results.txt` und Paketprüfung.
  Screenshots: `040-desktop-dekore.jpg`, `040-desktop-granit.jpg`,
  `040-mobile-dekore.jpg`, `040-mobile-vorschau.jpg`, `040-mobile-eckdetail.jpg`.
  Desktop aus lokaler Paketansicht (1280 px), Mobil aus unskaliertem 390 × 844 px
  iframe mit Testheader. Keine Screenshots vom Liveshop, kein physischer Gerätetest.

Vor späterer Veröffentlichung weiterhin nötig: PHP-/WordPress-/Flatsome-/WCPA-
Laufzeit, Cache/CSP und Rollenansichten, direkte Kaufsperren, Sockel-Regression,
physische Smartphones sowie Lieferbarkeit/Bildnutzung/Fertigungs- und Preisfreigabe.
Keine neue Preisregel, keine Änderung der Preisengine oder Kundenversandregeln.
Die zehn Eckzustände und alle bestehenden technischen Einschränkungen aus
`phase-a1-1-evidence.md` gelten weiterhin. ZIPs 0.2.0 und 0.3.0 bleiben unverändert.
