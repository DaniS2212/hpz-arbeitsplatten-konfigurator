# Phase A1 – Geometrien, Nachweise und offene Angaben

Stand 23.10.2026, Zwischenversion 0.2.0. Verbindliche Quelle dieser Ergänzung ist die fachliche Nutzerbestätigung im aktuellen Auftrag. Die erwähnten neuen Speedmaster-Screenshots selbst wurden in diesem Chat noch nicht als Dateien übergeben; im vorhandenen Projekt liegen keine Originalzeichnungen zu diesen zehn geraden Varianten. Deshalb sind keine Lieferanten-Zeichnungsnummern eingetragen. Interne IDs sind ausdrücklich keine Speedmaster-Codes.

## Zehn Varianten

| Interne ID | Bearbeitung an der Vorderkante unten | Bestätigte Parameter | Vorschau 0.2.0 | Zeichnung / Fertigungsnachweis |
|---|---|---|---|---|
| none | Keine | L1, B1 | Rechteck mit markierter Vorderkante | Grundmaße; keine allgemeine Fertigungsfreigabe |
| left_round | Vorne links abgerundet | L1, B1, R1 | Echter Viertelkreisbogen | Nutzerbestätigung; Original fehlt |
| right_round | Vorne rechts abgerundet | L1, B1, R2 | Echter gespiegelter Viertelkreisbogen | Nutzerbestätigung; Original fehlt |
| both_round | Beidseitig abgerundet | L1, B1, R1 und R2 unabhängig | Zwei unabhängig parametrierte Viertelkreise | Nutzerbestätigung; Original und gemeinsame Lieferantengrenzen fehlen |
| left_chamfer_square | Links, Abschrägung eckig | L1, B1, L2/B2 | Kontur gesperrt | Kontur, Messstrecken und Grenzregel fehlen |
| right_chamfer_square | Rechts, Abschrägung eckig | L1, B1, L3/B3 | Kontur gesperrt | Kontur, Messstrecken und Grenzregel fehlen |
| both_chamfer_square | Beidseitig, Abschrägung eckig | L2/B2 und L3/B3 unabhängig, L1/B1 | Kontur gesperrt | Beidseitige Zeichnung / Abhängigkeiten fehlen |
| left_chamfer_continuous | Links, Vorderkante durchlaufend | L1/B1; L2/B2 an Referenzmaske beobachtet, exakte Messstrecken offen | Kontur gesperrt | Originalkontur und genaue Feldzuordnung fehlen |
| right_chamfer_continuous | Rechts, Vorderkante durchlaufend | L1/B1; Sondermaßzuordnung noch nicht bestätigt | Kontur gesperrt | Rechte Zeichnung und Feldzuordnung fehlen |
| both_chamfer_continuous | Beidseitig, Vorderkante durchlaufend | L1/B1; zwei unabhängige Maßpaare, Bezeichnungen offen | Kontur gesperrt | Beidseitige Zeichnung und Abhängigkeiten fehlen |

„Vorschau funktioniert“ bedeutet ausschließlich geometrisch nachvollziehbare Darstellung. Alle zehn Varianten bleiben für Bestellungen gesperrt. Die beiden Abschrägungsarten werden separat geführt und nicht durch dieselbe angenommene Diagonale dargestellt.

## Bestätigte Regeln und umgesetzte Prüfungen

- Vorderkante ist unten; R1 vorne links, R2 vorne rechts. Darstellung als tangentialer Viertelkreis mit entsprechendem Radius. Auf dieser Nutzerbestätigung beruht die Kontur, nicht auf einer selbst inspizierten Originalzeichnung.
- Beidseitige Bearbeitung verwendet dieselbe Bearbeitungsart; R1/R2 lassen sich unabhängig einstellen. Wechsel der Variante entfernt unpassende Sonderfelder und setzt die Radiuseingaben bewusst zurück.
- Referenz links einseitig, 2000 × 600 mm: R1 50–599 mm. Nur hier wird diese konkrete Lieferantengrenze geprüft. Kein Übertrag auf andere Grundmaße, R2 oder beidseitige Ausführung. Material-/Kantengeltung bleibt vor Fertigung zu bestätigen.
- Mathematische Vorschaugrenzen: Radien positiv, kleiner als Plattentiefe; Summe der Radien kleiner als Gesamtlänge, damit eine gerade Vorderkante verbleibt. Diese strengen Vorschaugrenzen sind keine behaupteten Fertigungsgrenzen; Lieferantenzulässigkeit darüber hinaus offen.
- Eingabe cm mit maximal einer Nachkommastelle, intern ganze mm. Eigene Radiusbeschriftungen und Bezugslinien direkt zur jeweiligen Rundung, Fokus hebt den richtigen Kreisbogen hervor. Vorderkante farblich gekennzeichnet.
- Originale Preisengine / V2 unverändert. Neue Rundungen werden als `corner=round` normalisiert und erhalten daher keinen Rechteck-Referenzpreis. Plugin-Kaufsperren bleiben unverändert.

## Dokumentierte Beobachtungen, ausdrücklich keine allgemeine Formel

Bei 2000 × 600 mm und durchlaufender Abschrägung wurden maximal L2=1950 mm und B2=550 mm beobachtet. Nicht klar ist, bei welcher jeweils anderen Eingabe diese Maxima gelten und ob sie gemeinsam gültig sind. Daraus werden weder Mindestreststege noch Konturen abgeleitet.

Für die eckige Abschrägung wurden B2=150 mm → L2 max. 211,5 mm und B2=300 mm → L2 max. 423 mm berichtet. Keine Interpolation, Faktorannahme oder Verallgemeinerung. Der halbe Millimeter im Grenzwert muss zur vereinbarten ganzzahligen mm-Eingabe geklärt werden.

## Konkret noch zu beschaffen

1. **Die gesammelten Original-Screenshots als Dateien:** vollständige Draufsicht mit Vorderkantenmarkierung, Variantenname/-code, Feldnamen, eingetragenen Werten und sichtbaren Minimal-/Maximalgrenzen. Je sechs Abschrägungsvarianten ein vollständiger Satz; für die drei Rundungsvarianten ebenfalls eine Kontur-/Feldansicht. Falls der Lieferant gespiegelte Varianten verbindlich gleich definiert, genügt dazu eine entsprechende schriftliche Regel.
2. **Eckig vs. durchlaufend:** Wo beginnen/enden L2/B2 und L3/B3? Sind es projizierte Abschnitte, schräge Strecken, Restlängen oder absolute Koordinaten? Exakte Konturlinien und Kantenverlauf, einschließlich zusätzlicher kurzer Geraden, Winkel und eventueller Versätze. Welche Segmente tragen die durchlaufende Vorderkante?
3. **Grenzregeln:** Vollständige min/max-Regeln abhängig von L1/B1 und jeweils anderem Sondermaß; für beide Seiten deren gemeinsame Abhängigkeiten und Mindestabstände. Geltung je Materialstärke, Profil/Dickkante und maximale Platten-/Bearbeitungsmaße. Einzelbeobachtungen ersetzen diese Regeln nicht.
4. **Rundungen:** Allgemeine Grenzen R1/R2 bei anderen Längen/Tiefen; rechte Spiegelung der Grenzregeln; bei beidseitiger Rundung zulässige Summe/Restvorderkante; ob Radius=Tiefe oder sich treffende Rundungen zulässig sind. Die Vorschau schließt diese Grenzfälle vorerst aus.
5. **Fertigmaßbezug und Präzision:** Sind L1/B1 Außenfertigmaße inklusive 1,5-mm-Kanten? Beziehen sich die Radien auf fertige Außenkontur oder Träger? Sind 211,5 mm Grenzwerte nur berechnet oder tatsächlich bestellbare Maße, und wie behandelt Speedmaster die Eingabeschritte/Rundung?

## Abnahme dieser Zwischenversion

Zur Sichtprüfung: Rundung links/rechts/beidseitig, Vorderkantenlage, separate Radiuseingabe, aktive Eckhervorhebung, Variantenwechsel, gesperrte Abschrägungen. Vollständige Phase A1 und Fertigung bleiben offen. L-/U-Geometrien, Teile/Stöße, Katalog, SEO, Preisregel V2 und WooCommerce-Kaufwege wurden fachlich nicht erweitert.
