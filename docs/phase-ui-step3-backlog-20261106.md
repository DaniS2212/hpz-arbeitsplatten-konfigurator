# UI-Feinschliff nach Preis und Woo-Testbestellung – 06.11.2026

**Priorität laut Betreiber:** Jetzt **zuerst Schritt 1 = variable L-/U-Preiskalkulation** (PR #61), danach kontrollierte echte Woo-Testbestellung. Die hier dokumentierten UI-Punkte kommen ausdrücklich **bei Schritt 3**, nicht als ungeplanter Umbau mitten in der Preisphase.

## Screenshot (L4, Maßeingabe, B5 fokussiert)

- Vom Nutzer am **06.11.2026** mitgesendet: `image(20261106-074841).png`, **1101 × 800 px**, 261.942 Bytes.
- SHA-256 des Original-PNG: `2115f5f7678413c445ec9f321157a19158f325ab09e92c9b2300271d1d500d9e`.
- **Original-PNG ist NOCH NICHT als GitHub-Binärdatei gespeichert**. Metadaten und Reproduktionsweg sind hier erfasst; bei späterem Archiv-Upload denselben SHA prüfen. Reiner SHA-/Textbeleg ersetzt das Bild nicht.
- Sichtbarer Fall: L4, L1=200 cm, L2=200 cm, B1/B2=90 cm, B3/B4=105 cm, B5=60 cm, rechts Abschrägung L6=15 cm, B6=15 cm, 38 mm Bardolino Eiche.

### UI-Punkt A – „B5: 60 cm · Einstellung“

**Ursache im Quellcode bestätigt:** `local/core/l-geometry.mjs` kennzeichnet L4-B5 mit `settingOnly=true`, wenn die konfigurierbare B5-Breite geometrisch nicht als tatsächliche schräge Maßlinie nachgewiesen werden kann. `local/core/geometry.mjs`, im Abschnitt `if(diagonal&&d.settingOnly)`, schreibt den Text `B5: ... · Einstellung`. Dies ist **eine technische Unterscheidung zwischen Einstellwert und vermessener Strecke** – kein eigener Zuschlag und keine zusätzliche Auswahl.

**Ziel für Schritt 3:** B5-Eingabe und ihren Wert **beibehalten**, aber das technische Wort „Einstellung“ aus der sichtbaren Zeichnungsbeschriftung entfernen und die Erläuterung gegebenenfalls unaufdringlich per Hilfetext/Info zeigen. B5 muss semantisch korrekt bleiben; **nicht** vorschnell als reale diagonale Schnittmaßlinie ausgeben. Auf kleineren Displays darf das Label nicht den Umriss verdecken.

### UI-Punkt B – Springende/vergrößerte Zeichnung bei Eckauswahl

**Nutzerbeobachtung:** In Schritt 1 „Grundriss“ verschiebt sich bei Wechsel z. B. von **abgerundet** auf **abgeschrägt** die gesamte Darstellung, die Platte wirkt größer/kleiner, obwohl L1/L2/B1/B2 usw. unverändert bleiben.

**Plausible technische Ursache im Code:** `local/core/geometry.mjs` berechnet das SVG-`viewBox` abhängig von Beschriftungen, aktuell fokussiertem Feld und zusätzlichen Eck-Dimensionen (`b2Crowded`, `outsideReference`, `bottomRail`, `leftFactor/rightFactor/bottomFactor`). Die Variation des Ausschnitts verändert bei gleichem Container die gezeichnete Pixelgröße und Lage.

**Ziel für Schritt 3:** Gleiche Außenmaße → gleiche Bildskalierung, Bildmittelpunkt und Orientierung im Grundriss, unabhängig von „rund/abgeschrägt/durchlaufend/keine“ oder bloßem Fokus. Einheitlicher stabiler Darstellungsraum mit ausreichend reserviertem Platz für alle Maßachsen. Sonderfall „Vergrößern“ darf einen separaten Detailzoom verwenden.

**Abnahmetest:** L1–L4, U1–U4 und Gerade in derselben Geometrie vor/nach Variantenwechsel auf Desktop/Mobil screenshotvergleichen, gleiche Plattenbreite im Pixelbild bei identischen Außenmaßen; alle Maßtexte vollständig ohne Clipping.

### UI-Punkt C – Produktkopf reduzieren

Bereits am 05.11.2026 ausdrücklich gewünscht: Auf den WooCommerce-Produktseiten **Galerie und großen Standard-Header entfernen**, H1 sowie kurze Einleitung **hochwertig direkt am Konfigurator** integrieren. Auf **Gerade, L und U** einheitlich anwenden, ohne vorhandene Woo-/SEO-/Warenkorbstrukturen zu brechen. Der Screenshot dieses früheren Feedbacks ist separat im Repo-Kontext dokumentiert und noch nicht binär archiviert.

**Keine dieser drei Aufgaben blockiert PR #61.** Sie kommen nach den Preis- und Bestellprüfungen.
