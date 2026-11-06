# Verbindliche Regel ab 06.11.2026 – Speedmaster-Preisbelege als Text, keine Preisbild-ZIPs

**Direkte Entscheidung des Betreibers:** Neue Speedmaster-Preise werden **ausschließlich als nachvollziehbare strukturierte TEXT-Daten** in diesem GitHub-Repository dokumentiert. Bilder, Einzel-PNGs, SHA-Manifestdateien und ZIP-Uploads sind **für Preisbelege weder notwendig noch als Merge-Voraussetzung zulässig**. In einem neuen Chat müssen alle Preise und die Geltungsbedingungen ohne Bildzugriff nachlesbar sein.

Die bis PR #63 bereits vorhandenen historischen Originalbildarchive **bleiben erhalten**, aber **neue** Preis-/Kalkulations-PRs verlangen keinen Screenshot-Binärupload und enthalten keinen dafür neu angelegten GitHub-Actions-ZIP-Pflichttest. Bereits vorhandene Tests früherer Originalarchive bleiben historische Integritätsnachweise, keine Vorlage für neue Preisarbeit.

## Verbindlicher Speicherort

- **Zentrales Preisregister:** [PRICE_EVIDENCE_CURRENT.csv](PRICE_EVIDENCE_CURRENT.csv), eine Zeile pro eindeutig konfigurierter Preisbeobachtung; für zusätzliche Parameter, die das bestehende CSV noch nicht trägt, eine eindeutige, verlinkte Text-JSON-Datei anlegen (z. B. Eckkonfiguration mit Eckabständen, Einzelkanten, Richtung, ggf. weiterer Speedmaster-Auswahl).
- **Vergleichskonfigurationen:** [PRICE_VARIANT_CONTROL_20261106.csv](PRICE_VARIANT_CONTROL_20261106.csv) und neue Varianten-Kontrolltabellen. Vergleiche nur einen Parameter auf einmal, gleiche Ausgangsdaten sicherstellen.
- **Aktuelle Analyse und nächste Prüfungen:** [Preisvergleichsanalyse](../../phase-lu-price-variation-tests-20261106.md) und [Projektübergabe](../../CURRENT_PROJECT_HANDOFF_20261105.md). Jede Änderung aktualisiert die Übergabe und bei Bedarf `AGENTS.md` für einen neuen Chat.
- **Belegform:** Quelle `Speedmaster live im angemeldeten Browser (YYYY-MM-DD Uhrzeit)` oder `vom Betreiber übermittelter Speedmaster-Screenshot, als Text abgelesen (Datum)`. Der tatsächliche Bildschirmbetrag kann aus einer sichtbaren Originalaufnahme abgelesen werden, aber das Bild muss **nicht** ins Repo übernommen werden.

## Pflichtfelder pro neuem Preis

1. **Identität:** Datum mit Zeitzone, Erhebungsart (Browser/Screenshot), eindeutige Referenz-ID, Produktform (Gerade, L1–L4, U1–U4), Lieferant Speedmaster, Preiswährung EUR.
2. **Maße:** sämtliche vom Speedmaster-Formular vorgegebenen L-/B-Parameter und Sondermaße in **Millimetern**; nicht nur die geänderte Achse, und nicht Eck-L3 mit U-L3 verwechseln.
3. **Ausführung:** Stärke (17,5/38 mm etc.), Dekor **Code und Bezeichnung** (z. B. W980 ST7), exakte Modell-/Profil- und Kantenwahl (inkl. links/rechts/Modellkante), Ausschnitte, Eckform, Rundung/Abschrägung und Stoß-/Verbinder-Variante, sofern sichtbar und relevant.
4. **Preis:** angezeigter Betrag als Text und Einheit; **Brutto/Netto nur als verifiziert kennzeichnen, wenn dies vom Lieferanten/der Preisansicht ausdrücklich bestätigt wird**, ansonsten `supplier_screen_display_only` + `net_status_unverified`.
5. **Preisabgleich:** Vergleichs-ID, unveränderte Parameter, genau eine geänderte Eigenschaft, absoluter und relativer Unterschied, begrenzte Modellhypothese, Fälle, in denen eine angenommene Regel widerlegt wird.
6. **Gültigkeit:** insbesondere echtes Lieferteil-/Packmaß, Langteil-Anlieferung und andere Kosten **nur als bestätigt markieren, wenn Speedmaster diese Daten nachweislich liefert**.

## Eigenständige Preisrecherche über freigegebenen Speedmaster-Browser

Der Betreiber möchte die erforderlichen Preisproben künftig **von ChatGPT direkt aus dem angemeldeten Speedmaster-Shop ermitteln lassen**, damit keine manuellen Screenshots mehr nötig sind.

Vorgesehener Arbeitsweg:

1. Betreiber öffnet **ChatGPT Work** mit nutzbarem Browser bzw. eine verbundene Browser-Sitzung und meldet sich **selbst** bei `https://shop.speedmaster.at/` an (inkl. eventueller Zwei-Faktor-Bestätigung). **Keine Passwörter, Tokens oder Sitzungscookies in Chats oder GitHub speichern.**
2. Mit tatsächlichem autorisiertem Browserzugriff identische L-/U-Grundvarianten einstellen, **eine Variable je Test ändern**, sichtbaren Speedmaster-Preis samt Einheiten und vollständiger Konfiguration auslesen; keine Test- oder Echtbestellungen auslösen, nichts kaufen und keine Kundendaten ändern.
3. Die Ergebnisse in der vereinbarten Textform direkt per neuem PR im einzigen gemeinsamen Repo dokumentieren. Kurze Echtheits-/Konsistenzprüfungen und dokumentierte Regressionen ergänzen. Keine unnötigen Bilder oder ZIPs generieren.
4. Belastbare Preismodelle über die **eine** vorhandene PHP V3-Preisstrategie ableiten, bei offenen Geometrie-, Einzelteil-, Preisnetto- oder Versanddetails **als nicht verkaufbar kennzeichnen**. Erst danach kontrollierte WooCommerce-Testbestellung, getrennte Shop-Livefreigabe und später der vereinbarte UI-Feinschliff.

**Zugriffslage bei dieser Entscheidung (06.11.2026):** PR #63 ist gemergt. Die aktuelle Browser-Tababfrage aus Chat meldete *„Browser access requires the originating browser context. Open ChatGPT in the browser with the connected extension and try again.”* Somit **ist der Speedmaster-Zugang hier noch nicht tatsächlich nutzbar**; keine behauptete automatische Preisabfrage. Nach autorisierter Browser-Verbindung darf die Arbeit direkt fortgeführt werden.

## Feste Betriebsregeln

- `HPZ_APL_Price_V3`: **40 % Zielmarge, 35 % Mindestmarge nach Rabatt, 10 % Reserve**; keine zweite Preisengine.
- Speedmaster-Anlieferung: **10 € netto Standard**, plus **einmalig 50 € netto** erst wenn mindestens ein **nachgewiesenes** tatsächliches Liefer-/Packteil mindestens 1900 mm lang ist; **60 € netto gesamt**, nicht 70 €. Das entspricht dem vorhandenen Code.
- Keine automatische Speedmaster-Bestellung, keine echte WooCommerce-Bestellung, keine Veröffentlichung oder L-/U-Freischaltung ohne eigenständige Betreiberfreigabe.
- Für **Geometrie-/CNC-Abnahme** dürfen weiterhin explizite Zeichnungen, CAD-Daten oder Bilder erforderlich sein. Die „kein Preisbild-ZIP“-Entscheidung ist **keine** nachträgliche Behauptung, dass bereits alle fehlenden Herstellungsgeometrien verifiziert wären.


## Betreiber-Nachtrag 06.11.2026: Kanten und Browserstand

**Produktregel für sämtliche angebotenen Arbeitsplatten:** Profil und **alle Außenkanten ausschließlich 1,5 mm dekorgleich**. Keine Option „ohne Kante“, keine andersfarbigen Kanten und **keine weitere Preisprüfung** nur für ein unbesäumtes Ende. Die alte Kanten-Testzeile ist als vom Betreiber gestrichen dokumentiert; die gesonderte **Eckkonturänderung** einer links abgeschrägten L1 aus früheren Aufnahmen bleibt eine andere, noch nicht allgemein kalkulierbare Geometrie.

**Tatsächliche Browser-Grenze:** Speedmaster Shop ist zwar erreichbar, doch die Bedienung seines WebGL-Konfigurators über den vorhandenen Cloud-Browser war im anderen Chat nicht zuverlässig möglich. Das gilt nicht als vollständiger programmatischer Shopzugriff. Deshalb vorerst **gebündelte vom Betreiber als Text übermittelte Speedmaster-Preise** erfassen; keine weiteren Screenshots oder ZIPs anfordern und keine selbstständig durchgeführte Abfrage behaupten.

**Aktuelle acht Textpreise:** [LU_EIGHT_TEXT_PRICES_20261106.json](LU_EIGHT_TEXT_PRICES_20261106.json), [Preisregister](PRICE_EVIDENCE_CURRENT.csv), [enge Modellvergleiche](../../phase-lu-eight-text-prices-model-20261106.md). Alle Beträge weiterhin nicht ausdrücklich netto bestätigt; keine Woo-Freigabe.


## Netto-Steuerbasis: verbindliche Betreiberbestätigung (06.11.2026)

Speedmaster zeigt **Produktpreise NETTO ohne USt.**. Dies gilt laut Betreiber auch für frühere Bilder und Texte, deren historischer `display-only`-Typ weiter die Belegart bezeichnet. `HPZ_APL_Price_V3::targetGrossForVerifiedCosts()` berücksichtigt die **19 % deutsche USt. genau einmal**; andere Ländersteuern werden in WooCommerce berechnet. Neue [17,5-mm-Netto-EKs](LU_175_NET_PRICES_20261106.json) liegen als sechs Textbelege vor. Keine Preisbild-ZIP-Pflicht. Steuerbasis ist nicht gleich aktuelle Zuschnitt-, Verpackungs- oder Verkaufsfreigabe.
