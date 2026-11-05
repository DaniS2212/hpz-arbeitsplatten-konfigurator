# U2–U4 Speedmaster-Bildabgleich – 05.11.2026

**Ausschließlich visuelle Referenz für drei konkrete Herstellerkonfigurationen.** Die neun Original-PNGs sind mit SHA-256, Byteanzahl und Bildgröße in [U2_U4_JOINT_USER_20261105.json](references/speedmaster-lu/U2_U4_JOINT_USER_20261105.json) registriert. Die Binärdateien liegen noch nicht im historischen PR39-GitHub-Archiv.

## Identische Grundmaße, vier unterschiedliche Stoßbilder

Für U1–U4 zeigen die Draufsichten denselben U-Außenumriss: L1=2000, L2=1200, L3=1800, B1=B2=B3=600 mm, APL38, W980 ST7 Platinweiß, 1,5-mm-Dickkanten. Sichtbarer Gesamtgrundriss = 2,28 m²; innere Breite zwischen den Schenkeln = 800 mm.

| Modell | Stoß links | Stoß rechts | Screenshot-Anzeigepreis |
|---|---|---|---:|
| U1 | Quer (y=B1, x=0…B2) | Quer (y=B1, x=L1−B3…L1) | 691,49 € |
| U2 | Längs (x=B2, y=0…B1) | Längs (x=L1−B3, y=0…B1) | 687,36 € |
| U3 | Längs | Quer | 691,49 € |
| U4 | Quer | Längs | 691,49 € |

Die Anzeigepreise sind Beobachtungen aus den Speedmaster-Oberflächen, **noch keine für U2–U4 unabhängig als netto verifizierten EKs**. Zu Material und Kanten gilt ausschließlich die identische Ausgangskonfiguration, keine automatische Preisübertragung auf andere Maße, Dicken, Dekore oder Eckausführungen.

## Drei Zeichnungsregionen je Variante

- **Querstoß**: Schenkel liegt zeichnerisch unterhalb der oberen Querverbindung; die obere Fläche umfasst an dieser Seite die Eckrechteckfläche.
- **Längsstoß**: Schenkel reicht zeichnerisch bis zur Außenoberkante; die obere Querteilfläche beginnt erst neben ihm.
- Die beiden durchgehenden 2D-Konturen sind gleich; nur die Teilbereichsrechtecke und Stoßlinien sind verschieden.
- „Stoß A“ bezeichnet **immer links**, „Stoß B“ **immer rechts**. Auswahl der Stoßstelle hebt genau die zwei benachbarten grafischen Bereiche hervor.
- In 3D-Transparenz und Nahaufnahme sind an beiden Anschlüssen gelbe Flachdübel-/Lamello- und dunkle Arbeitsplattenverbinder-Symbole erkennbar. Deren Anzahlen und Positionen sind nicht verbindlich ausgelesen.

Die Regionengrößen im Quellcode sind **zeichnerisch abgeleitete Projektionsflächen**, nicht tatsächlich bestätigte CNC-/Packstückdimensionen oder Lieferteile. Keine neue Live-Preisregel, keine Freischaltung.

## Implementierung und Tests

`local/core/u1-geometry.mjs` bietet nun die vier Bildsplits `U1:cross/cross`, `U2:length/length`, `U3:length/cross`, `U4:cross/length`; die bestehenden U1-Prüfungen bleiben gültig. `local/core/geometry.mjs` routet nur unbearbeitete U-Grundformen durch diese fotobasierte Vorschau; U-Eckbearbeitungen bleiben generische Skizzen. Die eingebaute Foto-Beobachtung gilt ausschließlich bei sechs exakt übereinstimmenden Maßen, 38 mm Stärke, W980 und Standardkante. Jede Änderung deaktiviert die spezifische Fotoaussage.

Automatisierte Tests decken U1–U4-Kontur, Strecken/Achsen, Flächensumme, stabile Stoßkennungen, fehlende Produktionsdaten, Foto-Invarianten und mobile/desktop Auswahl ab. Originalfotos dürfen nicht in öffentliche WordPress-Bundles gelangen. Gerade, L und deren bestehende Kaufzustände bleiben unberührt.

## Preise: schnellster belastbarer Weg

1. Vorliegende U1-EKs für weitere Maße/Stärken nutzen; U2–U4 aktuell nur jeweils **ein** Preis-Screenshot.
2. Die beobachteten U2–U4-Preise im Shop noch **nicht** als freigegebenen Netto-EK behandeln, bis der Netto-/Kanten-/Profilbezug bestätigt ist. Netto-Vergleich kann intern als ausdrücklich angenommene Preisprobe gerechnet werden.
3. Preis *nicht* linear aus Fläche oder 4,13-€-Differenz extrapolieren: Schon bei U1 zeigen 38-mm-Spezialfälle (B1=600 vs. 700) nichtmonotone Einkaufspreise.
4. Für Varianten ohne echten EK und reale bestätigte Packstücke den Kauf deaktiviert lassen. U2–U4 Materialgrenzen und CNC-Teilzuschnitte mit Speedmaster klären.

**Verkaufsfreigabe nur nach serverseitig nachvollziehbarer Lieferbarkeit, realen Kosten (inkl. interner Anlieferung und 10-%-Reserve), Mindestmarge 35 %, rabattgesichertem Preis, WooCommerce-Versand-/Steuerprüfung und ausdrücklicher Zustimmung.**
