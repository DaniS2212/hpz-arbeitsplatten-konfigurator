# PR #48 – Stabile Stoßkennungen bei dynamischer L4-Teileansicht

**Stand:** 05.11.2026 · Interne Vorschau ohne Hersteller-/CNC-/Preis-/Versandfreigabe. Die folgende Grenzkonfiguration ist **synthetisch**, kein neuer Speedmaster-Screenshot.

## Reproduzierter UI-Fehler

Die mit PR #32/#45 eingeführten anschaulichen Stoßlinien werden in L3/L4 durch zwei feste Teilungsachsen abgebildet:
- **Stoß A:** vertikale, obere Hilfsfuge zwischen oberer Strecke und Eckbereich.
- **Stoß B:** horizontale, untere Hilfsfuge zwischen Eckbereich und Schenkel.

Vor PR #48 wurden die IDs anhand des **Listenindex** vergeben. Bei zulässigen Vorschau-Grenzmaßen kann eine Teilfläche verschwinden; dann gibt es nur noch eine Hilfsfuge. Fiel die obere Fläche weg, wurde die verbleibende untere Fuge fälschlich von **Stoß B** auf **Stoß A** umbenannt. Eine bereits gewählte Stoßmarkierung konnte dadurch stillschweigend auf die falsche Stelle springen.

## Begrenzte Korrektur

Die IDs und Bezeichnungen werden für L3/L4 jetzt aus der schematischen **Ausrichtung der Hilfsfuge** ermittelt, nicht mehr aus der Listenposition:

| Sichtbare Fugen | Sichtbare Kennung | Sicherheit |
| --- | --- | --- |
| Beide | Oben/vertikal = **A**, unten/horizontal = **B** | Keine echten CNC-Fräsungen |
| Nur oben | **A** | Nicht automatisch als B umdeuten |
| Nur unten | **B** | Nicht automatisch als A umdeuten |
| Keine | Keine A/B-Auswahl | Keine fiktiven Stoßstellen |

Für L1/L2 bleibt die einzelne Hilfsfuge unverändert als Stoß A beschriftet. Die sichtbaren Vorschau-Polygone, Außenkontur, B5-Projektion und Teilnummerierung ändern sich nicht. Ein gespeicherter UI-Fokus auf eine verschwundene Fuge wird wie bisher gelöscht; er darf nicht auf die andere Fuge übergehen.

## Reproduzierbare, nur mathematische L4-Grenzfälle

Alle Maße in **mm**; `B1=B2=300`, `B3=B4=950`, `B5=300`, Eckbearbeitung **keine**. Nur die Seitenlängen werden variiert:

| L1 | L2 | Illustrative Flächen | Erlaubte Fugen |
| ---: | ---: | --- | --- |
| 2000 | 2000 | obere Strecke, Eckbereich, Schenkel | A und B |
| 950 | 2000 | Eckbereich, Schenkel | nur B |
| 2000 | 950 | obere Strecke, Eckbereich | nur A |
| 950 | 950 | Eckbereich | keine |

Diese Kantenfälle stellen **keine vom Lieferanten bestätigte Standardkonfiguration** dar. Der Test prüft ausschließlich die eindeutige UI-Zuordnung und die lokale Kontur-/Vorschaukonsistenz.

## Tests

- `local/test/l-stable-seam-identity-20261105.test.mjs` reproduzierte den Fehler vor der Korrektur: erwartet `seam-2`, erhalten `seam-1`. Die Tests prüfen beide einseitigen Grenzfälle, beide fehlenden Flächen, korrekte Teilregionen und das Entfernen veralteter Stoßmarkierungen.
- `wordpress/l-reference-browser-runner.mjs` prüft zusätzlich die **Live-Eingabe** im Browser mit geöffnetem Reiter **Aufteilung** auf Desktop und Smartphone. Dabei wird eine Fuge gewählt, eine Teilfläche entfernt und anschließend wiederhergestellt; die UI darf keinen alten Fokus auf eine andere Fuge übertragen.
- Referenzbericht und vorhandene Speedmaster-Bilder bleiben unverändert. Der zusätzliche Browser-Grenzfall erzeugt **keinen angeblichen Herstellervergleich**.

## Freigabegrenzen

`previewParts` und `previewSeamDetails` bleiben `illustration-only`. `joints=null`, `shippingParts=null`, `supplierMappingVerified=false`. L/U bleiben nicht kaufbar. Gerade, Preise, WooCommerce-Kasse und Aktualisierungslogik sind nicht Teil dieses PRs.

**Für echten Zuschnitt/Steckverbinder müssen die in [EVIDENCE_GAPS](references/speedmaster-lu/EVIDENCE_GAPS.md) genannten Lieferantendetails weiter geliefert und unabhängig geprüft werden.**
