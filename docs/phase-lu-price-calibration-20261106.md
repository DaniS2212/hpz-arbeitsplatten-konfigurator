# L1–L4 / U1–U4: variable Speedmaster-Preiskalibrierung (06.11.2026)

**Kundenauftrag:** Nun die Preiskalkulation abschließen, nicht noch einmal die Grundgeometrie bauen. Die kommerziellen Regeln stehen fest: **40 % Zielmarge, 35 % Mindestmarge nach Gutscheinen, 10 % Kostenreserve**. Die Berechnung des DE-Brutto-Referenzpreises erfolgt weiterhin **ausschließlich** über `HPZ_APL_Price_V3::targetGrossForVerifiedCosts()`, aus echten Netto-EKs und Kosten. Keine zweite WP-Preisengine und keine Änderung an Gerade.

## PR #61 – nutzbarer erster Kalibrierungsbaustein

`pricing-v3/HPZ_APL_LU_Calibration_11.php` ist **ausschließlich internes PHP**, nicht im ausgelieferten Plugin-Build und nicht als WooCommerce-Quote verfügbar. Es liest den maßgeblichen historischen Netto-Preisbeleg direkt aus `docs/price-reference-cases.csv` und die separaten, **unbestätigten** Lieferanten-Anzeigebeträge aus `docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv`.

- Exakt belegte Netto-EKs werden mit Original-Fall-ID, exakter Geometrie, vollständigen Millimetermaßen, Dicke, Standard-Dickkante und W980 zurückgegeben. Sie sind **historische Preisbelege, keine aktuelle Liefer-/Shopfreigabe**.
- Preisänderungen dürfen nur **zwischen zwei bestätigten Referenzwerten derselben Variante, Dicke, Dekor- und Kantenkombination entlang genau einer Längenachse** berechnet werden. Achsen: L1 und L2, aktuell höchstens 500 mm Intervall. Alle anderen Maße müssen exakt identisch sein. Preise werden auf den nächsten Cent *aufgerundet*, niemals unbemerkt abgerundet.
- **Verboten**: ungestützte Flächenregel, Extrapolation außerhalb 2000–2500-mm-Strecken, diagonale Mehrdimensionaländerungen, L1-Preis auf L2–L4 kopieren, U1 auf U2–U4 kopieren, Material-/Dekoraufschläge aus Gerade ungeprüft übertragen, B1/B2/B3/B4/B5 aus U/L-Screenshotständen interpolieren.
- Unbekannte Fälle erhalten `missing-evidence` und **keinen Betrag**. Die bekannten U2–U4-/L4-Anzeigen erhalten nur `unverified-speedmaster-screen-amount`, **keinen als Netto-EK interpretierten Wert**.
- Die Szenariobeträge bei *angenommenen* 10/60 € interner Anlieferung und *angenommenen* 0 € weiteren Kosten gelten ausschließlich intern. **`purchasable=false`, `checkoutPriceApproved=false` bei jedem Ergebnis**, auch bei einem exakten historischen EK. Andere Woo-/Lieferantengates dürfen nicht umgangen werden.

### Aktuelle belastbare Preisabdeckung

| Form | Historisch bestätigter Netto-EK | Variable Längen-Zwischenwerte | Fehlende Voraussetzung |
|---|---|---|---|
| L1 | 4 Fälle, 17,5 und 38 mm, L1=2000/2500, L2=1200, B1/B2=600 | **Ja, L1=2000–2500**, ausschließlich W980 und sonst gleiche Maße | Zwischenpunkt 2250 mm inzwischen durch Screenshot bestätigt; andere Breiten/L2/Dekore/Ecken weiterhin offen |
| L2 | Keine | Nein | Mindestens zwei Netto-Preispunkte |
| L3 | Keine | Nein | Netto-EK bei zwei identischen Grundvarianten mit unterschiedlicher Länge |
| L4 | Nur Bildbetrag **658,61 €**, Netto-Status offen | Nein | Standard-Grundmaß B5 und expliziter Netto-EK bestätigen, weiterer Punkt |
| U1 | 8 Fälle, 17,5 und 38 mm | **Ja, L1 2000–2500 bei L2=1200**, **L2 1200–1700 bei L1=2500**, B1/B2/B3 je 600, L3=1800 | Zwischenpunkt 2250 mm inzwischen durch Screenshot bestätigt; Dekore, abweichende Beinbreiten, Ecken offen |
| U2 | Nur Bildbetrag **687,36 €**, 38 mm | Nein | Netto-Status, zweiter Längen- und 17,5-mm-Punkt |
| U3/U4 | Je **691,49 €** als Bildbetrag, 38 mm | Nein | Netto-Status und weitere Referenzen |

### Anker- und Modellbeispiele (W980, 1,5 mm Dickkante)

| Fall | Netto-EK-Status | Lieferant netto | Zielpreis bei hypothetisch 60 € Anlieferung |
|---|---|---:|---:|
| L1 200×120 cm, 38 mm, B1/B2=60 | Bestätigter historischer Netto-EK | **464,45 €** | 1.150 € Bruttoreferenz |
| L1 225×120 cm, 38 mm, B1/B2=60 | **Modell + unabhängiger Screenshot vom 06.11.**, Netto-Status des Bildbetrags noch offen | **488,01 €** | ca. **1.200 €** Bruttoreferenz |
| U1 L1=225, L2=120, L3=180 cm, B1/B2/B3=60, 38 mm | **Modell + unabhängiger Screenshot vom 06.11.**, Netto-Status des Bildbetrags noch offen | **715,04 €** | ca. **1.700 €** Bruttoreferenz |
| U2 200/120/180 cm, 38 mm, B1/B2/B3=60 | Nur Hersteller-Anzeige, nicht bestätigter Netto-EK | **687,36 € angezeigt** | **Keine Preisfreigabe** |

**Achtung:** Szenarien sind keine heutigen Shopangebote, enthalten keine verifizierten realen Packstücke, Zahlungs-/Verpackungskosten und keine vollständige Lieferzusage. Eine getrennte aktuelle Speedmaster-EK-Bestätigung und Fertigungs-/Packdaten bleiben vor einem echten Checkout erforderlich.

**Wichtiger Gegenbeweis gegen eine naive Breitenformel:** U1 mit L1=2500, L2=1700, L3=1800, B2/B3=600, 38 mm W980: B1=600 => **785,69 €** EK; B1=700 => **767,12 €** EK. Mehr Breite ist hier **18,57 € günstiger**. Deshalb keine automatische B1-Interpolation.

### Nächste gezielte Speedmaster-Preisabfragen (höchster Informationswert)

Für jede neue Lieferanten-Preisaufnahme reichen zunächst **zwei gleichbleibende Bilder/Angebote pro variierter Achse**, mit sichtbar gleich ausgewählten Standardkanten und **explizitem Netto-EK**. Nicht alle 16 Dekore auf einmal erfassen.

1. **Bereits erledigt (06.11.):** L1 / W980 / APL38 / L1=2250, L2=1200, B1=B2=600 und U1 / W980 / APL38 / L1=2250, L2=1200, L3=1800, B1=B2=B3=600. Speedmaster-Anzeigen betragen **488,01 €** und **715,04 €** und treffen die zuvor aus 2000/2500 mm berechneten Werte auf den **Cent genau**. Sie bestätigen die Preisform der beiden getesteten Längenschnitte empirisch, **nicht** alle Breiten, Kanten oder das Netto-EK-Prädikat. Originalbilder per [Quellenmanifest](references/speedmaster-lu/L1_U1_2250_SOURCE_MANIFEST.csv) + [JSON](references/speedmaster-lu/L1_U1_2250_PRICE_20261106.json) nachverfolgen.
2. **Formen-Grundpreise:** L2 / APL38 / W980 / L1=2000, L2=1200, B1=B2=600; L3 / APL38 / W980 / L1=L2=2000, B1=B2=600, B3=B4=900; L4 / APL38 / W980 / L1=L2=2000, B1=B2=600, B3=B4=900, B5=600. Für L4 den bisherigen 658,61-€-Anzeigebetrag abgleichen.
3. **U2–U4-Basis bestätigen:** Bestehenden Referenzfall L1=2000, L2=1200, L3=1800, B1/B2/B3=600, APL38 W980 mit 1,5-mm-Dickkante, dazu ausdrückliche Bestätigung, ob 687,36/691,49/691,49 € tatsächlich **Netto-EKs** sind.
4. Erst danach die Längendifferenzen für L2–L4/U2–U4 und 17,5-mm-Vergleiche aufnehmen. Für jede weitere Stärke und neue Dekorgruppe eigene belastbare Vergleichspunkte. Kein ungesicherter Massenexport von Fantasiepreisen.

Das ist eine **priorisierte Liste**, kein neuer Blocker für den Modellcode. Die ersten beiden Zwischenpunkte dienen insbesondere der Validierung der noch nicht als Verkaufsformel freigegebenen Längeninterpolation.

### Nach diesem PR

Die bestehende L/U-Woo-Bestellanbindung aus PR #60 bleibt vollständig erhalten. Der nächste inhaltliche Schritt besteht darin, die verifizierten zusätzlichen Preis-/Größenwerte in diese zentrale Kalibrierung aufzunehmen und danach gezielt den vorhandenen V3-/Woo-Preisprozess mit einem konservativ nachgewiesenen Bereich zu verbinden. **Nur unbestätigte Preisbereiche als Anfrage, nicht als scheinbar exakte Kaufpreise anzeigen.** Danach Testbestellung und erst dann Layout-Feinschliff.


## Nachtrag 06.11.2026 – Versandregel verbindlich geklärt

Der Betreiber hat die **bereits implementierte** Regel ausdrücklich als korrekt bestätigt:

- **10 € netto Standardanlieferung** durch Speedmaster.
- **Einmalig 50 € netto zusätzlich** nur wenn mindestens ein tatsächlich von Speedmaster geliefertes/gepacktes Plattenteil **≥1.900 mm** lang ist und Spedition nötig wird.
- Somit **60 € netto Gesamtanlieferung** bei Langteil, **nicht** „10 € plus 60 €“ (=70 €) und **nicht** 50 € pro langem Teil.
- Das entspricht unverändert `HPZ_APL_Price_V3::inboundCostForVerifiedParts()`. PR #61 ergänzt Grenzfalltests bei 1899/1900 mm sowie mehreren langen Teilen, **keine Änderung an der Preis-/Versandimplementierung**.
- Für L/U ist die **tatsächliche Einzelteillänge**, nicht die äußere L1-Gesamtausdehnung, maßgeblich. Bis reale Speedmaster-Stück-/Packmaße vorliegen, sind 10/60 € nur interne Szenarien. Die Gerade-V3 bleibt unverändert.

## Noch offener Kalibrierungstest – Kanten, Stoßvarianten, Formwechsel

Die zwei 2250-mm-Punkte zeigen eine **0-Cent-Abweichung** zur im Repo bereits angelegten linearen Längeninterpolation. Das reicht für eine Grundmodellvalidierung, aber nicht für allgemeine Preisfreigabe. Beim nächsten Speedmaster-Abgleich gezielt **jeweils nur eine Variable** ändern (alle anderen Maße, Dekor W980, Dicke 38 mm konstant): 1,5-mm-Kante an einem Ende anders konfigurieren, danach L1 ↔ L2 und U1 ↔ U2/U3/U4 sowie ggf. abgerundet ↔ abgeschrägt. Jede Abweichung als eigene Preis-/Geometrieannahme dokumentieren, bevor der Checkout sie zulässt.

Die zugehörigen zwei Preis-PNGs und zwei früheren UI-Screenshots sind unverändert in einer ZIP mit SHA-Manifest vorbereitet. **Binärarchiv-Upload nach GitHub ist noch offen**; reiner Manifesttext ist kein Bildarchiv.
