# Arbeitsplatten L/U – Live-Admin-Bericht und Bereinigung vom 13.11.2026

Quelle: Vom Betreiber übergebener Work-Bericht mit 256 Ergebnissen,
12 Grenztests und zehn Screenshots. Produkte L #1000080 und U #1000081
blieben Entwürfe. Kein Warenkorb und keine Zahlung.

## Maßdarstellung – konkrete Ursache
Die Daten für L3 B3/B4 und L4 B3/B4/B5 waren in
`lGeometry().dimensions` bereits vollständig. Der SVG-Renderer
blendete jedoch `secondary`-Maße aus, wenn nicht genau dieser
Eingabefokus aktiv war. Die Referenzschienen werden ab jetzt permanent
angezeigt. L4 B5 ist weiterhin ein **Einstellwert** an der
Außendiagonale und darf bei begrenzter äußerer Diagonale nicht als
konstruiertes physikalisches Abstandsmaß ausgegeben werden.
Auf dunklen Oberflächen erhalten illustrierte L-Stoßlinien ein
helles Unterlay. Kein CNC, kein Speedmaster-Stücklistennachweis.

## Vorübergehende Preisabbrüche
Im Work-Live-Bericht hatten einzelne 38-mm-L1/L4- sowie 17,5-mm-U3-
Konfigurationen kurzzeitig `Preis offen` und nach Wiederholung
einen gültigen Preis. Exakte Backend-Ursache nicht nachgewiesen.
Der bisherige Frontend-Adapter gewährte zwei Versuche bei jeweils
sechs Sekunden. Die **nicht kaufbare Administrator-Vorschau**
erhält 3 Versuche (6/8/10 Sekunden, kurze Rücksetzpausen) bei
5xx/429/Netzwerkfehlern. Öffentliche Quote und Kauf bleiben bei
zwei Versuchen, einem serverseitig bestätigten Preis und HMAC.
401/403 und echte 422-Wertfehler niemals still wiederholen.
Wenn die Preisprüfung weiterhin scheitert, weist die Oberfläche
auf die technische Nichterreichbarkeit hin, nicht auf falsche Maße.

## U1/U2-Preisdifferenz
`HPZ_APL_LU_Shop_Ratebook_12` führt die geometrietypabhängigen
Netto-Kostenreferenzen für W980, 2000 mm:
38 mm U1 = 69149 Cent, U2 = 68736 Cent;
17,5 mm U1 = U2 = 45929 Cent.
Der 4,13-EUR-Kostenunterschied kann wegen Aufrundung des
Verkaufspreises auf ganze 10-EUR-Schritte zu einem sichtbaren
Unterschied von 10 EUR führen (W980 blieb im Work-Test gleich).
Bei gleicher äußeren Kontur sind die Stoßvarianten verschieden.
Kein belastbarer Hinweis auf einen Fehler, keine Preisänderung.

## Nachprüfung
Nach CI und Merge in der vorhandenen Live-Administrator-Vorschau:
L3/L4 Standardmaße und B3/B4/B5 mit und ohne aktives Feld, Zoom und
schmale Smartphonebreite; helles/dunkles Dekor und Stoßlinien.
Bei 2-3 zuvor sporadisch offenen Preisfällen die Anfragedauer und
HTTP-Status bei einem erneuten Fehler protokollieren.
Die 256er-Matrix muss nicht wiederholt werden.

**Keine öffentliche L-/U-Freigabe, kein Bezahlvorgang, keine
automatische Speedmaster-Bestellung.** Separate Prüfungen für
Eckbearbeitungen, signierte Fertigung und eine kontrollierte echte
Bestellung bleiben offen.
