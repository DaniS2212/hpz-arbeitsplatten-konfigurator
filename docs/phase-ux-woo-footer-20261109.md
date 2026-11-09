# 09.11.2026 – Abschlusskorrektur Produktseiten und Maße UX

Bezug: Betreiber-Screenshots vom 09.11.2026 für Gerade, L4 und die kompakte Produktzusammenfassung.

## Gewünschte und umgesetzte Änderungen

- **Gerade, Schritt 1:** „Welche Seite?“ wird **„Welche Eckbearbeitung?“**; das kleine Info-„i“ samt separatem langen Eckhinweisdialog entfällt. Die seitlichen Auswahlkarten („Keine“ / „Vorne links“ / „Vorne rechts“ / „Beide vorderen Ecken“) und die darunter liegenden Bearbeitungsarten bleiben unberührt.
- **Gerade, Skizze:** Der Gerade-SVG-Ausschnitt hat weniger unnötige Außenränder. Die tatsächliche Werkstückfläche belegt im üblichen Seitenverhältnis mehr Platz. Zusätzlich wird der hohe freie Zeichenbereich in den Schritten 1/2 verkleinert. **Keine geometrischen Maße oder Preise verändert.**
- **L und U, Maße:** Die zweispaltigen cm-Felder nutzen vergrößerte Schrift, deutliche Maße-Kürzel, einheitliche Eingabehöhe und kompaktere Begriffe. Bei L3/L4 werden die gekoppelten Maße **B1/B2** und **B3/B4** ausdrücklich im Kürzel gezeigt; die zugrunde liegenden IDs und verknüpften Werte bleiben unverändert. Weitere Sonder-Eckmaße folgen ihrer bestehenden Zuordnung.
- **Preiszusammenfassung:** Der zusätzliche Satz „Maße und Ausführung werden beim Hinzufügen und an der Kasse erneut geprüft.“ entfällt, während **serverseitige Prüfung, signierte Warenkorbzeilen, Steuern, Versand und Sperren unverändert aktiv bleiben**. Für den bekannten DE-Bruttopreis wird der MwSt.-/Versandhinweis auf eine kurze, juristisch nötige Angabe gekürzt.
- **Produktseite:** Die schlanke **H1 statt Produktgalerie/Kurzbeschreibung** im oberen Produktkopf bleibt. **Unten werden WooCommerce-Produkt-Tabs einschließlich langer Beschreibung, Zusatzinformationen und Bewertungen sowie Upsells und ähnliche Produkte wieder normal gerendert.** Der Konfigurator wird im automatischen Einbau vor den Standard-Tabs angezeigt (Hook 5 vor Standard-Hook 10). Der zuvor eingeführte globale `.product-main .row`-Eingriff wird auf die direkte Kopfzeile begrenzt, damit normale spätere Shop-Layouts unberührt bleiben.

## Schutz und Regression

- Nur die drei exakten Produkt-IDs 1000083 (Gerade), 1000080 (L), 1000081 (U), und nur bei aktivem, erlaubtem automatischen Konfigurator wird der obere Produktkopf verdichtet. Andere WooCommerce-Produkte bleiben unverändert.
- Keine Produktveröffentlichung, keine Aktivierung von L/U-Kauf, keine Preisformel- oder Lieferregeländerung.
- PHP: `wordpress/top-cta.test.php` verifiziert, dass **nur** oberer Woo-Hook entfernt wird und untere Produkt-Hooks erhalten bleiben.
- Node: `local/test/minimal-ui-inline-measures.test.mjs` prüft SVG-Größe, einheitliche Bezeichnungen und CSS-Synchronisierung.
- Chromium: `wordpress/minimal-layout-browser-runner.mjs` prüft Gerade, L und U bei **1366 px und 390 px** auf Darstellungsgröße, Beschriftungs-/Feldgröße, gekoppelte Breiten-Badges und Überlauf.

Nach Merge: automatische Plugin-Version prüfen, dann im realen WordPress-Shop bestätigen, dass die vollständige untere Produktbeschreibung und Bewertungstabs wieder unter dem Konfigurator angezeigt werden.
