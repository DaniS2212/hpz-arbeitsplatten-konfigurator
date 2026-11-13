# Speedmaster – L-/U-Verbindungen (Bildreferenzen, 13.11.2026)

## Originalbilder / Abruf ohne erneutes Hochladen

Der Nutzer hat **neun echte Speedmaster-Screenshots** im Chat bereitgestellt. Diese Dokumentation ist im GitHub-Repository versioniert. **Die unveränderten PNG-Originale liegen als ein ZIP in der ChatGPT Library**, weil der verfügbare GitHub-Connector für Repository-Schreibzugriffe nur Text/Blob-Inhalte und keinen direkten Binärtransfer aus ChatGPT-Anhängen unterstützt.

**Referenzarchiv:** `/Holz-Liebling/Arbeitsplatten/Speedmaster/Speedmaster_LU_Verbindungen_Referenzen_2026-11-13.zip`

**Library-Datei-ID:** `libfile_841cd72ee7a08191a56b4fd1eb892793`

**ZIP SHA-256:** `8f6adc7d3c838664cbd4cc06b2bd0a7dfa9fb492f09148a1546b867b623e59b1`

**Für Work:** Bitte das Archiv aus der **persönlichen ChatGPT Library** anhand des exakten Namens/Pfades abrufen; `README.md`, `manifest.json` und neun PNGs sind bereits darin. **Den Nutzer nicht erneut um Upload bitten.** Alternativ sind die Originalbilder als Anhänge dieser Unterhaltung vom 13.11.2026 vorhanden. Das maschinenlesbare Verzeichnis in GitHub steht unter `manifest.json` neben dieser README.

> **Wichtig:** Im Git-Repository liegen derzeit die **Referenzdaten und Beschreibungen**, nicht die Binär-PNGs. Der private Library-Pfad ist kein öffentlicher GitHub-Bildlink.

## Bildzuordnung

| ID | Form | Original-Screenshot | Auflösung | Erkennbarer Inhalt |
|---|---|---|---|---|
| L-01 | L | `image(20261113-153924).png` | 2048×718 | 3D-Nahansicht einer Fuge; gelbe ovale Verbindungselemente und dunkle Spannverbinder |
| L-02 | L | `image(20261113-153933).png` | 2048×792 | Verbindungsteile bei ausgeblendeten Platten; nur Anschauung |
| L-03 | L | `image(20261113-153956).png` | 1818×850 | Freigestellte Draufsicht; L1=1899, L2=1200, B1/B2=600 mm |
| U-01 | U | `image(20261113-154012).png` | 2047×802 | 3D-Gesamtperspektive mit zwei Stossbereichen |
| U-02 | U | `image(20261113-154021).png` | 2048×921 | U-Perspektive mit L1=1899, L2=1200, L3=1800 und B1/B2/B3=600 mm |
| U-03 | U | `image(20261113-154033).png` | 1517×1123 | Zwei Verbindungsgruppen bei ausgeblendeten Holzflaechen |
| U-04 | U | `image(20261113-154055).png` | 1651×1061 | Draufsicht schraeg mit beiden Stossfugen |
| U-05 | U | `image(20261113-154110).png` | 1657×1071 | Freigestellte Draufsicht zweier Verbindungsgruppen |
| U-06 | U | `image(20261113-154133).png` | 2048×593 | Kantennahe 3D-Perspektive mit gelben und dunklen Verbindungselementen |

Die Dateien sind auch über die originalen Zeitstempel und SHA-256-Hashes im Manifest eindeutig zugeordnet. **L:** 3 Bilder. **U:** 6 Bilder.

## Was sich aus den Screenshots tatsächlich erkennen lässt

- **Dunkle stangenförmige Elemente** verbinden beidseits einer Stoßfuge Plattenteile; die Ansicht wirkt wie ein Arbeitsplatten-/Spannverbinder mit beidseitigen Halteelementen.
- **Gelbe länglich-ovale Elemente** liegen entlang der Stoßkanten. Ihre genaue Herstellerbezeichnung (z. B. Flachdübel/Lamello/anderer Formverbinder) ist allein aus den Bildern **nicht sicher ableitbar**.
- **L:** ein Verbindungsbereich in verschiedenen Zuständen, darunter eine Ansicht mit ausgeblendeten Holzflächen. Beispielmaße: L1 1899 mm, L2 1200 mm, B1/B2 600 mm.
- **U:** zwei Verbindungsbereiche, je nach Teilung/Stoßvariante anders ausgerichtet. Beispielmaße: L1 1899 mm, L2 1200 mm, L3 1800 mm, B1/B2/B3 600 mm. In Perspektive und freigestellter Ansicht erkennbar.
- In den Speedmaster-Aufnahmen gibt es oben links einen **Transparenzregler**. Bei ausgeblendeten Holzflächen bleiben Fugenverbinder sichtbar. **Diese Art visueller Ein-/Ausblendung** ist die Referenz für unseren Kundenschalter.
- Mehrere Fotos zeigen nur eine **konkrete Beispielkonfiguration**: Anzahl, Randabstände, Bohrpunkte oder Verbindungslängen können für andere Maße/Stärken anders sein. Die Bilder alleine legen **keine Produktionsregel** fest.

## Gewünschte Umsetzung im Konfigurator

**Ausgangslage:** PR #100 hat bereits den L-/U-Schalter **„Durchsicht“ / „Normalansicht“** und die schematische 2D-Teilflächen-/Stoßlinien-Ansicht eingeführt. Diese Entwicklung **weiterverwenden**, nicht von vorne anfangen.

**Nächster minimaler Schritt:**
1. In der Durchsicht-Ansicht vorhandene Holzoberflächen transparenter darstellen, dabei originale Form/Maße/Dekore beibehalten.
2. Gelbe längliche Verbinder und dunkle Spannverbinder **nur illustrativ** entlang der bereits vorhandenen `previewSeams` zeigen; klar als **„Schematische Darstellung der Verbindungen“** kennzeichnen.
3. Für die acht L-/U-Grundrisse L1–L4/U1–U4 nur die **tatsächlich ausgewählten Stoßlinien** berücksichtigen. Die U-Variante ist nicht pauschal für alle U-Grundrisse übertragbar.
4. Standardmäßig Normalansicht, ein kompakter Toggle in einer Ecke des Vorschau-Bereichs, auf Desktop und Smartphone lesbar. Ein zusätzlicher 3D-Motor ist für die erste Stufe nicht erforderlich.
5. **Keine** festen Herstellerkoordinaten, Stückzahlen, Verbinderlängen, Mindestabstände oder CNC-/Speedmaster-Stücklisten aus Fotos ableiten. Falls später fertigungstreue Daten angezeigt/gespeichert werden sollen, sind dafür bestätigte Lieferantenregeln und Tests nötig.
6. Keine Änderungen an Preisen, der aktuell beschlossenen **150 € Netto-Anlieferung je Arbeitsplatte**, Versandzonen, Rabatten, HMAC-Signaturen, WooCommerce-Metadaten oder Freigabeschaltern. **Keine öffentliche Verkaufsfreigabe**.

## Abnahmekriterien

- L- und U-Form bei Normalansicht unverändert.
- Durchsicht zeigt korrekte **Fugenrichtung** und gut erkennbare, deutlich als **schematisch** gekennzeichnete Verbindungselemente.
- Wechsel der Stoßvariante/Geometrie verschiebt die illustrativen Verbindungen zur passenden Fuge.
- Kein Verbinder auf einer Stelle ohne Stoßfuge; keine frei erfundenen echten Bohrpositionen.
- Auf 390 px Smartphone-Breite keine Überlagerung von Maßen/Schalter.
- Preis-/Warenkorb-/Fertigungsdaten-Tests weiterhin grün.
