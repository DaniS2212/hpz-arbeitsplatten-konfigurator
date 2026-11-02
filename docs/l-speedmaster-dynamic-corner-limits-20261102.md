# PR #41 – Dynamische L-Eckmaßgrenzen: Zeichnungsraum ≠ Speedmaster-Fotobeleg

Stand 02.11.2026 · **nur L1–L4-Administratorvorschau**. Die Gerade bleibt kaufbar und unverändert, L/U bleiben nicht bestellbar. Keine neuen CNC-, Teile-, Verbinder-, Kalkulations- oder Versandregeln.

## Unabhängige Quellen / Verlässlichkeit

Hersteller-Originale liegen im versionierten, privaten ZIP `docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip` (SHA-256 `c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb`). Alle vier Bilder wurden visuell auf ihre tatsächlich **angezeigten Eingabefeldgrenzen** geprüft, nicht auf tatsächliche CNC-/Fertigungsmöglichkeit.

| Variante | Archivfoto | Grundmaße in mm | Ausführung, Material / Dekor |
| --- | --- | --- | --- |
| L1 | `originals/block-06/image(20261102-115001).png` | L1 2000, L2 1200, B1=B2 600 | beide Ecken eckig; APL 38, W980 |
| L2 | `originals/block-06/image(20261102-115024).png` | L1 2000, L2 1200, B1=B2 600 | beide Ecken, Vorderkante durchlaufend; APL 38, W980 |
| L3 | `originals/block-03/image(20261102-114354).png` | L1=L2 2000, B1/B2 600, B3/B4 900 | beide Ecken, Vorderkante durchlaufend; APL 38, W980 |
| L4 | `originals/block-03/image(20261102-114510).png` | L1=L2 2000, B1/B2 600, B3/B4 900, **B5-Grundmaß 600** | beide Ecken eckig; APL 38, W980 |

Die Feldwerte im Foto gelten als **beobachtete Eingabebereiche für eine Beispielkonfiguration**. Sie belegen weder ein allgemeines dynamisches Herstellerregelwerk noch ein erfolgreiches Bestellergebnis. Insbesondere können die aktuell gewählten Eckwerte, die zusätzlich zu den Grundmaßen gelten, bei anderen Konfigurationen abweichen. PR #41 verwendet die Foto-Maxima daher nur als **konservative Obergrenze in der Admin-Zeichnung** bei denselben Grundmaßen, beiden Ecken, derselben Bearbeitungsart, Stärke und Dekor – **nicht als Produktionslimit für den Shop**.

## Konkrete Zahlen und Unterschiede

Jeweils Minimum **60 mm** für Abschrägungsabstände. Spalten enthalten **Maximalwerte in mm**.

| Typ | Feld | Speedmaster-Eingabefeld im Foto | rein geometrische Zeichnungsgrenze | effektive Admin-Vorschau | Befund |
| --- | --- | ---: | ---: | ---: | --- |
| L1 | L3 | 550 | 580 | 550 | Foto enger |
| L1 | B3 | 600 | 580 | 580 | **Foto größer als Zeichnung** |
| L1 | L4 | 1350 | 1380 | 1350 | Foto enger |
| L1 | B4 | 600 | 580 | 580 | **Foto größer als Zeichnung** |
| L2 | L3 | 1350 | 1380 | 1350 | Foto enger |
| L2 | B3 | 2000 | 580 | 580 | **starke Abweichung; Herstellerklärung offen** |
| L2 | L4 | 550 | 580 | 550 | Foto enger |
| L2 | B4 | 600 | 580 | 580 | Foto größer als Zeichnung |
| L3 | L5 / L6 | je 1050 | je 1080 | je 1050 | Foto enger |
| L3 | B5-Eckmaß / B6 | je 600 | je 580 | je 580 | Foto größer als Zeichnung |
| L4 | L5 / L6 | je 1050 | je 1080 | je 1050 | Foto enger |
| L4 | B5-Eckmaß / B6 | je 600 | je 580 | je 580 | Foto größer als Zeichnung |

**Nicht zu verwechseln:** `dimensions.B5` ist bei L4 die Grundriss-/Diagonalbreite. `lCorner.parameters.B5` ist die äußere Eckabschrägung. Nur die zweite erscheint in der B5-Eckmaß-Zeile.

### Geometrisch begründete Vorschaugrenzen

Die zulässige Länge wird für die Außenkante, an der tatsächlich geschnitten wird, berechnet. Die aktuelle Skizzenform benötigt mindestens 10 mm Rest bis zum benachbarten Kantenende; bei 10-mm-Schritten liegt der größte akzeptierte Wert **strikt unter** `verfügbare Kantenlänge - 10 mm`. Die Grenzen ändern sich live mit den Grundmaßen.

- **L1:** L3 aus `L2 − B2`, B3 aus `B1`, L4 aus `L1 − B1`, B4 aus `B2`.
- **L2:** L3 aus `L1 − B1`, B3 aus `B2`, L4 aus **`L2 − B2`**, B4 aus `B1`. Wichtig: Die L2-Außenkontur enthält rechts eine längere, durchgehende Kante; diese ist **nicht** mit der verfügbaren unteren Schenkellänge für L4 gleichzusetzen.
- **L3 / L4:** L5 aus `L2 − B4`, B5-Eckmaß aus `B1`, L6 aus `L1 − B3`, B6 aus `B2`.

Diese Regeln sind **konservative numerische Schutzplanken der bestehenden Darstellung**, keine bestätigten Speedmaster-Formeln. Beim Überschreiten wird nun die **konkrete Feldkennung** und die entsprechende Zeichnungsgrenze gezeigt statt eines unspezifischen „Restkante zu klein“.

### Sichtbare UX

An den aktiven L-Eckmaßfeldern erscheint zum Beispiel: „Zeichnung: 6–58 cm · Speedmaster-Foto: 6–200 cm · keine Fertigungsfreigabe“. Das macht insbesondere bei L2/B3 die offene Abweichung sichtbar, anstatt eine Herstellergenauigkeit vorzutäuschen. Bei anderer Dicke, anderem Dekor, anderen Grundmaßen, nur einer ausgewählten Ecke oder anderer Bearbeitungsart wird **kein** Fotolimit übernommen. Rundungen R1/R2 bleiben separat ungeprüft. Die allgemeine restliche Teile-/Stoßansicht bleibt eine Illustration.

## Regression und Sicherheit

- Neuer Node-Test `local/test/l-speedmaster-dynamic-chamfer-limits-20261102.test.mjs`: acht durch Fotografien belegte Obergrenzen, Negativfälle anderer Konfigurationen, sechs unmögliche Segmentkürzungen mit richtigem Feldbezug, getrennte L4-B5-Parameter, keine Herstellungs-/Verkaufsfreigabe.
- Neuer Chromium-Test `wordpress/l-dynamic-limits-browser-runner.mjs` (Desktop 1366 px, Mobil 390 px): Foto-Hinweise, Foto/Zeichnungs-Konflikt L2-B3, ungültige Maße und Behebung nach Grundmaßänderung, kein Warenkorb, kein horizontales Überlaufen. Bilder heißen `dist/l-visual-photo-*` und sind im CI-Artefakt einsehbar.
- Tests wurden zuerst gegen den unveränderten Ausgangscode **rot** ausgeführt (nicht angezeigte Eingabebegrenzung, nicht benannte Schenkelgrenze, danach nicht angezeigter Foto-Hinweis). Anschließend Kern-/Browserkorrektur und vollständiger CI-Lauf.
- `wordpress/hpz-apl-admin-preview/assets/` ist zur bearbeiteten Quellversion synchron. Keine neue Preisbindung, kein Freigabe-Flag für L/U, kein automatischer Merge.

## Als Nächstes noch notwendige Herstellerbelege

1. **Maximalwerte tatsächlich einstellen und Ergebnis fotografieren:** mindestens L1 B3=600 mm und L2 B3=600 mm – Eingangswerte, Draufsicht und Schrägansicht. Für L2 ist der im Feld angezeigte 2000-mm-Wert besonders erklärungsbedürftig.
2. **L4-Grundmaß B5** separat 600→300 mm bei exakt gleichen übrigen Werten inklusive Draufsicht, um die derzeit angenäherte Außenprojektion zu prüfen.
3. Detailfotos der Stöße L1/L2 und der beiden L3/L4-Stöße sowie echte Fertigungs-/Teilplatten-Daten, wenn der Abgleich der Außenkontur abgeschlossen ist.

Der PR ist **keine allgemeine 1:1-Speedmaster-Abnahme**. Eine vollständig herstellergetreue Umsetzung benötigt die oben genannten Einzeltests.
