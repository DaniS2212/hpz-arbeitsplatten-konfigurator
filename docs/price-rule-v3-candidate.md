# Preisregel V3 - durchgerechneter Kandidat fuer GERADE (NICHT aktiviert)

Historischer PR-#3-Stand: Die Preisregel wurde anschließend für die **unverbindliche
Admin-Preisvorschau 0.5.0** freigegeben und ohne Formeländerung übernommen.
Die nachfolgende damalige Integrationssperre bezieht sich auf diesen früheren
Kandidatenstatus. Eine Verkaufs-, Fertigungs- oder Livefreigabe besteht weiterhin
nicht. Maßgeblich für die 0.5.0-Integration ist `docs/phase-050.md`.

Stand: 26.10.2026. Zweck: Zusammenhaengende Berechnung nach historischen Speedmaster-EK-Referenzen und 40-%-Zielmarge, **getrennt von der laufenden Plugin- und Dekorentwicklung**.

**Status: nur fachliche Kalkulationsvorlage, KEINE Freigabe fuer Plugin-Integration, Bestellung, Fertigung oder Livebetrieb.** Insbesondere `docs/price-rule-v2.md` und `local/private/pricing.mjs` bleiben unveraendert. Nach expliziter Kalkulationsfreigabe kann Work V3 in die neue Preisengine aufnehmen; keinesfalls ungefragt V2 aktivieren.

## Verkaufsprodukt / Kostenannahmen

- Nur GERADE, Schichtstoff APL17.5 oder APL38. Keramik/Compact ausgeschlossen.
- Alle vier Aussenkanten: Dickkante 1,5 mm dekorgleich. KEINE frei waehlbaren Kanten in V3.
- Speedmaster-Einkaufspreis `EK` stets **netto EUR**; kundenseitiger Bruttovergleich unter Annahme **19 % deutscher Umsatzsteuer**.
- Interne Beschaffung je Einheit: +10 EUR netto; wenn mindestens ein tatsaechlich geliefertes Versandteil >=1900 mm lang ist, zusaetzlich +50 EUR netto. Fuer alle hier erfassten Gerade-Referenzen >=2000 mm: insgesamt **+60 EUR netto**. Kundenversand separat im bestehenden WooCommerce-Checkout.
- 10 % zusaetzliche Kostenreserve auf `EK + interner Beschaffung`. Kalkulatorisches Kostenbudget: `K=1.10*(EK+10+50*I(versandteil>=1900))`.
- Ziel: 40 % Rohmarge **nach** dieser Reserve; 35 % harte Untergrenze nach allen Rabatten. `M = 100*(1-K/(Brutto/1.19))`. Mengenpreis = Einzelpreis mal Stueckzahl, keine Rundung erst am Warenkorbende.
- Die Endpreisformel rundet kundenfreundlich **immer auf die naechsten vollen 10 EUR auf**, nicht kaufmaennisch ab. Dadurch bleiben die bisherigen EK-Referenzen oberhalb des Ziels.

## Preisfunktion: Gera­de ohne Eckbearbeitung

Laenge `L` und Tiefe `B` in **mm**, Flaeche `A=(L*B)/1000000` in m².

**APL 17,5 mm / Platinweiss (Brutto EUR vor Rundung):**

`G17=450+0.035*(L-2000)+229*(A-1.20)+40*I(L>=2501)`

Expliziter +40-EUR-Sprung ab 2501 mm: Speedmaster EK springt bei 2500/2501 × 600 mm von 179,72 auf 202,40 EUR, bei 880 mm von 251,87 auf 274,57 EUR. Kein falscher Sprung bei 2781 mm.

**APL 38 mm / Platinweiss (Brutto EUR vor Rundung):**

`G38=670+0.206*(L-2000)+15*L*(B-600)/1000000+50*I(L>=2781)+0.28*L*I(B>=881)`

Ab 2781 mm: +50 EUR bruto; die fruehere V2.3-Langlaengen-Rampe `0.226*max(0,L-2780)` ist durch diese Sprungstaffel ersetzt. Ab Tiefe 881 mm grosse, laengenabhaengige Mehrkosten: `0.28*L` EUR. Speedmaster 2500 × 880 → 881 kostet bei W980 netto 294,23 → 605,79 EUR; 2780 → 2781 × 600 netto 319,00 → 341,62 EUR.

**Dekoraufschlag:** Die in der folgenden Tabelle je Staerke angegebene EK-Differenz `Delta = EK_dekor_bei_2000x600 - EK_W980_bei_2000x600` ergibt den sichtbaren Bruttopreisaufschlag vor Rundung durch:

- APL38 alle Dekore sowie APL17.5 Standarddekore: `D=2.20*Delta*(L/2000)`.
- APL17.5 NUR Ambiance/Granit `F128` und Beton Art `44375`, `44405`: `D=2.20*Delta*(A/1.20)`.
- `Einzelpreis_ohne_Ecke = 10*ceil((G17_oder_G38 + D)/10)`.

Faktor 2.20 entspricht dem aus 10-%-Reserve und 40-%-Zielmarge folgenden Brutto-Zuschlagsfaktor `1.10*1.19/0.60=2.1817` mit kleiner Vorsichtspufferung. Basis- und Dekorpreise basieren auf einem Verkaufspreismodell, **nicht** auf einem behaupteten beliebig gueltigen Speedmaster-EK-Algorithmus.

## Einheitlicher Eckbearbeitungszuschlag

- Keine Bearbeitung: `+0 EUR`.
- Rundung, eckige Abschraegung oder durchlaufende Vorderkante; links / rechts / beidseitig: **+120 EUR brutto je konfigurierte Platte**, nicht je Ecke. Kein doppelter Zuschlag fuer beide Ecken.
- Beobachtete EK-Differenzen im Referenzbereich meist ca. +51 bis +53 EUR netto, teilweise bei groesserem Radius geringer. `120 EUR` brutto deckt +52,61 EUR netto mit Reserve und 40-%-Zielmarge.
- Mathematische Preiszuordnung ist **keine** Aussage zur Lieferfaehigkeit der Eckkontur oder zum Radius. V0.3.0 sperrt alle Bestellung weiter.
- `Einzelpreis = Einzelpreis_ohne_Ecke + (Bearbeitung ? 120 : 0)`. `Gesamtpreis = Einzelpreis * Menge`.

## 16 Dekore: netto EK am Referenzmass; empfohlene Brutto-Verkaufspreise

Jeweils GERADE / keine Eckbearbeitung / 2000 × 600 mm. Der Preis in anderen Abmessungen wird mit der obigen Funktion berechnet, nicht mit starren prozentualen Dekorklassen.

| Kundenname | Interne Kennung | Speedmaster EK 17,5 | Speedmaster EK 38 | VK brutto 17,5 | VK brutto 38 |
|---|---|---:|---:|---:|---:|
| Platinweiß | `W980` | 144.99 € | 243.11 € | **450 €** | **670 €** |
| Schwarz | `U999` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Bardolino Eiche | `H1145` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Arlington Eiche | `H3303` | 145.70 € | 244.54 € | **460 €** | **680 €** |
| Terrazzo grau | `F021` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Marmor grau | `F095` | 150.03 € | 253.24 € | **470 €** | **700 €** |
| Metall anthrazit | `F121` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Granit schwarz | `F128` | 242.38 € | 292.55 € | **670 €** | **780 €** |
| Beton hellgrau | `F186` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Schiefer natur | `F235` | 145.70 € | 244.54 € | **460 €** | **680 €** |
| Bronze | `F302` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Metall gold | `F629` | 146.83 € | 246.89 € | **460 €** | **680 €** |
| Sandbeige | `F661` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Marmor weiß | `F812` | 148.43 € | 250.05 € | **460 €** | **690 €** |
| Perlgrau | `44375` | 183.92 € | 244.54 € | **540 €** | **680 €** |
| Schiefergrau | `44405` | 183.92 € | 244.54 € | **540 €** | **680 €** |

## Modellbeispiele ohne Ecken

| Staerke | Dekor | Plattenmass | VK brutto |
|---|---|---|---:|
| 17,5 mm | `W980` | 2000 × 600 mm | 450 € |
| 17,5 mm | `W980` | 2500 × 880 mm | 700 € |
| 17,5 mm | `W980` | 2501 × 880 mm | 740 € |
| 17,5 mm | `F128` | 2501 × 880 mm | 1130 € |
| 38 mm | `W980` | 2000 × 600 mm | 670 € |
| 38 mm | `W980` | 2500 × 880 mm | 790 € |
| 38 mm | `W980` | 2500 × 881 mm | 1490 € |
| 38 mm | `W980` | 2780 × 600 mm | 840 € |
| 38 mm | `W980` | 2781 × 600 mm | 890 € |
| 38 mm | `W980` | 2781 × 881 mm | 1680 € |
| 38 mm | `F128` | 2781 × 881 mm | 1830 € |
| 38 mm | `W980` | 3000 × 881 mm | 1780 € |

## Historische Referenzpruefung (KEINE Lieferanten-Liveverbindung)

Datei `docs/price-v3-reference-checks.csv` enthaelt alle **57 erfassten normalen Speedmaster-EK-Referenzen** und **15 separate Bearbeitungsreferenzen** mit Brutto-VK und ausgerechneter Marge. Daraus: 72 Vergleichsfaelle, Mindestmarge **40.37 %**, Maximalmarge **42.02 %**. Keine Referenz unter 40 %.

Das ist eine **In-sample-Modellkontrolle**, keine Prognosegarantie fuer alle kuenftigen Materialien/Masse und keine bestaetigte WooCommerce-PHP-Ausfuehrung. Die Zahlen stammen aus der bisherigen nutzerseitigen Speedmaster-Messreihe/deren Gespraechszusammenfassungen; aktuell nicht live neu abgefragt. Sonderfaelle mit Spruengen bei 2701/2751 mm (B=881, APL38) wurden mitgeprueft.

## Bestell-/Freigabegrenzen (offen, NICHT als fertig verkaufen)

- Die Testbasis deckt fuer APL17.5 **L etwa 2000–3000 mm und B 600–1200 mm**, fuer APL38 **L 2000–3000 mm und B 600–881 mm**, mit verteilten Referenzpunkten ab. Nicht jeder Zwischenwert wurde einzeln bei Speedmaster gemessen. Ausserhalb dieser Fenster: derzeit **kein garantierter 35-%-Mindestmargennachweis**, unbekannte Stueckelung und Fertigung; vor Checkout mindestens gesonderte Kostensicherung/Anfrage oder engere freigegebene Verkaufsfenster erforderlich.
- Selbst innerhalb der Fenster: Lieferantengrenzen, Dekor/Staerke-Verfuegbarkeit, allfaellige Teilerfordernisse, abweichende Eckpreise und tatsaechliche Versandteillangen koennen die Kalkulation beeinflussen.
- Kein Warenkorb/Checkout aktivieren ohne serverseitige erneute Validierung von Abmessung, Variante, Material, Dekor, Vertriebspreis und Wert nach Rabatten. **35-%-Floor** bezogen auf tatsaechlich belastbare EK-Kosten und verifizierte interne Bezugskosten; bei unbekanntem EK die Konfiguration bis dahin nicht kaufbar stellen.
- Steuern im Checkout ueber WooCommerce; 19 % nur Preisvergleichen fuer Deutschland. Keine fest eingebrannte deutsche Steuer bei anderen Lieferorten.
- L/U sind NICHT Teil von V3, benoetigen Teil-/Stoss-/Versandteile- und EK-Validierung.

**PR nur zur betriebswirtschaftlichen Freigabe. Nicht mergen oder in Work-0.4.0 integrieren, bevor Nutzer die V3-Regel genehmigt hat.**
