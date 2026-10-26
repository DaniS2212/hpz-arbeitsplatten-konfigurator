# Installation – Admin-Test 0.5.0 (V3-Preisvorschau)

Neu in 0.5.0: Auf dem geraden Produktentwurf 1000083 fragt die vorhandene
Konfigurator-Komponente den Bruttopreis beim geschützten WordPress-Endpunkt ab.
Alle 16 Dekore und beide Stärken sind innerhalb der V3-Modellgrenzen berechenbar.
Der Preis ist eine **unverbindliche deutsche Brutto-Referenz**; Lieferbarkeit,
Fertigungsmaße, tatsächliche Steuer im Zielland und Kundenversand sind nicht
freigegeben. Für L/U gibt es weiterhin keine V3-Preisvorschau. Keine Konfiguration
kann gekauft werden. Berechnung und Einkaufspreis-/Margendaten verbleiben in PHP;
der Browser erhält nur öffentliche Preissummen und Status. Details in
**PREISVORSCHAU-0.5.0.md**.

Der folgende Abschnitt beschreibt die erhaltenen Dekor- und Geometriefunktionen
aus 0.4.0 und 0.3.0.

Neu in 0.4.0: alle 16 vereinbarten Dekore mit unveränderten WebP-Bildern,
kurzen Kundennamen und echtem gewähltem Dekor in Vorschau/Eckdetails. Große
Bildkacheln ohne Filter; mobil zwei Spalten. Desktop-Zusammenfassung im Schritt
„Oberfläche“ unter der Vorschau. Lieferantencodes bleiben von der Anzeige
getrennt; es gibt weiterhin keine Verkaufsfreigabe. Technische Hinweise
und Testumfang stehen in **DEKORE-0.4.0.md**.

Erhalten aus 0.3.0: alle zehn geraden Eckzustände als Vorschau, einschließlich unabhängiger
eckiger und durchlaufender Abschrägungen vorne links/rechts. Sämtliche sichtbaren
Maße in mm; Länge/Tiefe in 1-mm-, Ecken in 10-mm-Schritten. Die durchlaufende
Ausführung ist schematisch und vorerst nur bei 2000 × 600 mm mit Schrägenlänge
60–500 und Schrägentiefe 60–300 mm nutzbar. Grenzen und fehlende Nachweise:
**A1.1-NACHWEISE.md**, Eingabeformat: **MILLIMETER-VERTRAG.md**.
A1-NACHWEISE.md dokumentiert den historischen 0.2.0-Stand.
Kein Produkt erhält eine Fertigungs- oder Verkaufsfreigabe.
Die frühere 0.1.0-Adminansicht wurde laut Nutzer auf Flatsome bestätigt;
diese neue Version wurde bisher lokal geprüft.

Für ein Update nach Sichtfreigabe die neue 0.5.0-ZIP über „Plugin hochladen“
wählen und WordPress die vorhandene Version ersetzen lassen. Keine zweite Kopie
parallel installieren. Bestehende Plugin-Einstellungen bleiben unter demselben
Optionsnamen erhalten. Die ZIPs 0.1.0, 0.2.0 und 0.3.0 sind unverändert verfügbar.
Installation und Aktivierung erfolgen ausschließlich durch den Nutzer.

Dieses Paket ist eine geschlossene Vorschau, kein verkaufsfähiger Konfigurator. Kein Node-Server erforderlich. Bestehende Produkte, Texte, Galerien, WCPA-Formulare und Versandregeln werden nicht gespeichert oder verändert. Die lokale Demo bleibt erhalten.

1. ZIP unverändert herunterladen. Vor dem ersten Aktivierungstest eine aktuelle Sicherung bereithalten; bevorzugt mit Marco auf einer Testkopie prüfen. Ein echter WordPress-/Flatsome-Laufzeittest steht noch aus.
2. Als Administrator: **Plugins → Installieren → Plugin hochladen**, ZIP auswählen, **Jetzt installieren → Aktivieren**. WooCommerce muss aktiv sein, WordPress mindestens 6.5, PHP mindestens 7.4.
3. **Einstellungen → Arbeitsplatten-Vorschau** öffnen. **Vorschau aktivieren** anhaken, **Testmodus** angehakt lassen, Einbauort **Automatisch vor der Beschreibung**, speichern. Nach Installation ist die Vorschau standardmäßig aus. Testmodus auszuschalten schaltet die Vorschau aus, niemals den Verkauf frei.
4. **Produkte → Entwürfe**: Gerade 1000083, L 1000080 oder U 1000081 öffnen und **Vorschau** wählen. Nicht veröffentlichen. Als eingeloggter Administrator muss der Konfigurator zwischen Produktkopf und Beschreibung stehen.
5. Maße, Schritte, Dekor und Vergrößerung auf Desktop/Smartphone prüfen. Bei Gerade erscheint nach jeder gültigen Änderung der unverbindliche V3-Preis; bei L/U bleibt der Preis offen. „In den Warenkorb“ bleibt deaktiviert. Für den Admin-Test die eigene Browseransicht verwenden und keine Kundendaten eingeben.
6. Falls Flatsome den Standard-Hook anders platziert: Einstellung **Nur Shortcode** wählen. In einem eigenen produktbezogenen UX-/Shortcode-Bereich zwischen Kopf und Beschreibung `[hpz_apl_configurator]` einsetzen. Bestehende Inhalte nicht ersetzen. Der Shortcode rendert nur auf dem jeweiligen erlaubten Entwurfsprodukt; keine ID-Parameter nötig. Nicht in globale Shopbereiche einbauen. Automatik und Shortcode sind gegenseitig ausgeschlossen.
7. Abgemeldet und als Kunde prüfen: keine Konfiguratorausgabe. Andere Produkte und Sockel 999985 gegen den bisherigen Stand vergleichen.

## Verhalten und Rücknahme

- Nur Administratorberechtigung `manage_options` plus Bearbeitungsrecht, nur Status `draft`, nur drei feste IDs. Eine veröffentlichte Produktseite erhält keine Vorschau.
- Solange das Plugin aktiv ist, sind diese drei IDs zusätzlich serverseitig nicht kaufbar, unabhängig von beiden Schaltern. Direkte Warenkorbversuche sowie vorhandene Zielpositionen im klassischen/Store-API-Warenkorb werden gesperrt. Andere Produkte bleiben unverändert.
- Plugin deaktivieren entfernt Einbettung UND dessen Kaufsperren. Deshalb Produkte weiterhin als Entwurf belassen. Keine automatische Veröffentlichung, Migration oder Rückübertragung.
- V3-Preisengine ist im serverseitigen PHP des Pakets enthalten. Lieferanten-EK und Margen werden nicht an den Browser ausgegeben; keine Kundendaten oder externen Bild-/Fontdienste. Die 16 Dekorbilder werden lokal mitgeliefert. Bildausschnitt, Rapport und Maserungsverlauf der Zeichnung sind unverbindlich. Katalogzugehörigkeit ist keine Bestätigung der Lieferbarkeit je Material oder Form.
- WCPA muss für diese rein visuelle Testphase nichts importieren. Vorhandene Formulare und globale Einstellungen unverändert lassen.

## Noch vor Bestellintegration prüfen

Aktivierung und WordPress-Sicherheitsgates in echter Laufzeit; installierte WooCommerce-/Flatsome-Version und Standard-Hook; Shortcodeposition; Admin-/Kunden-/Gastansicht; Cache darf keine Admin-Vorschau ausliefern; WP-Rocket-JS-Verzögerung/Minifizierung und CSP mit dynamischen Modulen; native Preis-/Kaufbereiche; Mobile/Tastatur; direkte klassische und Store-API-Kaufversuche; vorhandene Warenkörbe; Sockel-Regression. Die PHP-Syntax wurde lokal geprüft; ein echter WordPress-Test fehlt noch. Für einen JavaScript-Optimierungskonflikt nur dieses Plugin gezielt von Optimierung ausnehmen, keine globalen Einstellungen ungeprüft ändern.

Erst später: WCPA-Feldadapter, verbindlich bestätigte Geometrien/Teile, serverseitiger **Bestell**preis-/Geometrievalidator, Steuern für Lieferländer, Gewicht, Kundenversand, Bestellmetadaten und gesonderte Verkaufsfreigabe. Browser-Vorschau ist keine serverseitige Fertigungsprüfung.
