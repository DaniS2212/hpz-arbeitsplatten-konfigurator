# L/U – kalkulatorischer Übergang zur Verkaufsfreigabe (05.11.2026)

**Dies ist ein ausschließlich internes, geprüftes Rechenszenario. Kein Shoppreis, kein Angebot und keine Produktions-/Versandfreigabe.**

## Bestehende Preis- und Betriebsregeln

Die **V3-PHP-Preisengine für Gerade** bleibt unverändert. Für L/U übernehmen wir ausschließlich die nachgewiesenen betriebswirtschaftlichen Leitplanken: 40 % Zielmarge auf Nettoerlös, 35 % harte Mindestmarge nach Rabatten, 10 % Kostenreserve. Steuer- und Versandbehandlung im echten Shop verbleiben bei WooCommerce. Eine Price-V3-Interpolation für U oder L wäre fachlich falsch, weil geometrisch unterschiedliche Einzelteile, Schwellen und Bearbeitungen den Einkaufspreis verändern.

Die internen Speedmaster-Daten enthalten vier bestätigte Netto-EK-Referenzen für L1 (2000/2500 mm, 17,5/38 mm) und mehrere bestätigte U1-Punkte. Die neuen U2/U3/U4-Screenshots zeigen jeweils **nur einen** identischen 38-mm-W980-Referenzfall mit folgenden Anzeigepreisen: U2 **687,36 €**, U3/U4 **691,49 €**. Für U2–U4 ist der konkrete Status „Nettobezugspreis mit allen Standardkanten“ aus dem Screenshot allein **noch nicht unabhängig bestätigt**. Dies wird nicht als allgemeine Preisformel ausgegeben.

## Verbindliche Formel erst nach Kostennachweis

Für das *interne* Beispiel (Deutschland, Referenz-USt 19 %, nicht das internationale Checkout-Steuerschema):

```
Angezeigter Speedmaster-Betrag (unter expliziter Annahme = EK netto)
+ Szenario Anlieferung netto (10 € oder 60 €; noch keine verifizierten Packstücke)
+ weitere netto Stückkosten (im Beispiel explizit mit 0 € angesetzt, also noch offen)
= angenommene Netto-Stückkosten

Mindestdeckungsbasis = angenommene Netto-Stückkosten × 1,10 (10 % Reserve)
Ziel-Nettoerlös = Mindestdeckungsbasis ÷ (1 − 0,40)
Ziel-Brutto-Referenzpreis DE = Ziel-Nettoerlös × 1,19
Kalkulationsvorschlag = auf volle 10 € aufrunden

Mindestmarge 35 %: Mindest-Nettoerlös = Mindestdeckungsbasis ÷ (1 − 0,35)
```

Die tatsächliche spätere Shoppreisberechnung muss zusätzlich verifizierte Anlieferung, Verpackung, Zahlungsgebühren, ggf. eigenen Kundenversand und Netto-Marge **nach** Gutscheinen berücksichtigen. Bei fehlendem EK kein Checkout. L/U-Eckvarianten werden gesondert bepreist. **Referenz-Bruttopreise sind kein WooCommerce-Steuersatz.**

## Preisvergleich aus gleichem Speedmaster-Beispiel

| Typ | Preisbasis netto bzw. angenommen netto | Modell bei 10 € Anlieferung | Modell bei 60 € Anlieferung |
|---|---:|---:|---:|
| U1 | 691,49 € (bestätigter Referenz-EK) | 1.540 € | 1.640 € |
| U2 | 687,36 € (**nur Bild-Anzeigewert**) | 1.530 € | 1.640 € |
| U3 | 691,49 € (**nur Bild-Anzeigewert**) | 1.540 € | 1.640 € |
| U4 | 691,49 € (**nur Bild-Anzeigewert**) | 1.540 € | 1.640 € |
| L1 | 464,45 € (bestätigter EK für 2000×1200/600/600, APL38 W980) | 1.040 € | 1.150 € |

Zahlen sind pro 1 Stück, ohne zusätzlich unbekannte Kosten, Bruttoreferenz Deutschland, auf volle 10 € aufgerundet. Die 10-/60-€-Szenarien entsprechen einer im Projekt vorhandenen Anlieferungskostenschwelle nach tatsächlichen Versandstücklängen; ob sie für U1–U4 physisch zutrifft, ist **nicht** nachgewiesen. Eine grafische Projektion der drei Teilregionen ist kein Lieferstücknachweis.

## Umsetzung

- `local/private/lu-price-scenarios.mjs` nimmt **nur exakte** belegte Datensätze an, nie extrapolierte Dimensionen und nie clientseitig gemeldete Einkaufspreise.
- Der Aufruf verlangt explizit `inboundNetCents` **und** `otherNetCents`. Das Beispiel `otherNetCents=0` ist eine bewusst noch zu ersetzende Annahme und keine Bestätigung fehlender Nebenkosten.
- U2–U4 liefern stets `isNetSupplierPriceVerified=false` und `purchasable=false`; auch U1/L1 bleiben hier rein interne Szenarien ohne WooCommerce-Aktivierung.
- Die Methode ist in keinem WordPress-Bundle, keiner PHP-Preisroute und keinem Checkout eingebaut. Gerade bleibt unverändert.

## Schnellster Weg zur echten Shopfreigabe

**P0:** Pro U-Variante und L1–L4 reale Stückzahl/Packmaße/Anlieferung (und Anforderungsart der Stoßverbinder) bestätigen. Für die neuen U2–U4-Bilder explizit „EK netto, 1,5-mm-Standardkante und 38-mm-W980“ bestätigen; im B2B-System kann ein angezeigter Betrag nicht automatisch als Lieferanten-Netto-EK gelten.

**P1:** Für bislang nicht belegte Parameter nur einige gezielte zusätzliche Speedmaster-Preisbeispiele beschaffen: U2–U4 je eine andere Länge (z. B. L1=2500) und 17,5-mm-Ausführung, L2–L4 je mindestens eine vollständige EK-Konfiguration; anschließend Grenzfälle für andere Tiefen/Bearbeitungen. Preisabweichungen bei U1 zeigen bereits, dass reine Flächeninterpolation kein tauglicher Freigabenachweis ist.

**P2:** Entweder eine bestätigte Preisregel mit kontrollierten Grenztests ableiten, **oder** als schnellere Stufe zunächst nur exakt bestätigte Kombinationen kaufbar machen. Alle anderen Maße bleiben sichtbar als konfigurierte *Anfrage*, nicht mit frei erfundenem Preis. Hier kann Speedmaster manuell beliefert werden; eine API ist nicht erforderlich.

**P3:** Konfigurations- und Margenprüfung serverseitig an WooCommerce-Warenkorb, Rabatt-/Gutscheinprüfung, Steuer- und Versandlogik anbinden. Testbestellung inkl. realer Stück-/Stoßangaben; erst dann ausdrückliche Betreiberfreigabe zur Veröffentlichung. Die existente Gerade-Produktstrecke und ihre Preisengine nicht anfassen.
