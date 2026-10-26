# Installation – Admin-Test 0.6.1 (Küchenstudio-Vorschau)

Neu in 0.6.1: Verbesserte Hervorhebung des aktiven Maßes im Eingabefeld und in der Zeichnung; kompakte, kundenverständliche Zusammenfassung (Maße, Material, Dekor, Eckbearbeitung links/rechts). Preisregel, technische Geometrie, Kauf- und Rollensperren sind unverändert.\n\nNeu in 0.6.0: integrierte Küchenstudio-Oberfläche mit heller Zeichenfläche und Petrol-Akzenten. Kundenmaße stehen in Eingaben und Zeichnungen in cm mit optionaler Zehntelstelle; intern bleiben alle Maße ganze Millimeter. Die V3-Preisregel aus 0.5.0 und die Kaufsperren sind unverändert. Details: **KUECHENSTUDIO-0.6.0.md**.

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
eckiger und durchlaufender Abschrägungen vorne links/rechts. Der technische
V2-Eingabevertrag bleibt in mm; sichtbar sind die Maße seit 0.6.0 in cm. Die durchlaufende
Ausführung ist schematisch und vorerst nur bei 2000 × 600 mm mit Schrägenlänge
60–500 und Schrägentiefe 60–300 mm nutzbar. Grenzen und fehlende Nachweise:
**A1.1-NACHWEISE.md**, Eingabeformat: **MILLIMETER-VERTRAG.md**.
A1-NACHWEISE.md dokumentiert den historischen 0.2.0-Stand.
Kein Produkt erhält eine Fertigungs- oder Verkaufsfreigabe.
Die frühere 0.1.0-Adminansicht wurde laut Nutzer auf Flatsome bestätigt;
diese neue Version wurde bisher lokal geprüft.

Für ein Update nach Sichtfreigabe die neue 0.6.1-ZIP über „Plugin hochladen“
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


## Kontrollierter Admin-Praxistest auf dem Liveshop (nur nach Freigabe)

Da derzeit keine Staging-Installation existiert und die Geschäftsführung einen Admin-Test auf dem Liveshop freigegeben hat, ist ausschließlich folgender **nicht verkaufsfähiger** Prüfablauf vorgesehen:

1. Vollständige aktuelle Sicherung, vorheriges Plugin-ZIP und Rollback-Zugang sicherstellen. Prüfen, dass **alle drei Zielprodukte** unverändert Entwürfe sind (1000083, 1000080, 1000081) und die erwarteten SKUs besitzen. Nicht veröffentlichen.
2. Beim Update von 0.6.0 auf 0.6.1 wird die bestehende Plugin-Instanz ersetzt. Kein zweites Plugin und **keine** Shop-/WCPA-/WP-Rocket-Gesamteinstellungen verändern. Vorschau-Optionen: aktiviert, Testmodus aktiv, Platzierung automatisch.
3. Nur als eingeloggter Administrator die Vorschau jedes Entwurfs prüfen: eine einzige Konfiguratorinstanz, korrektes Flatsome-Layout, cm-Eingaben und betonte Bemaßung, 16 Dekore, kompakte Zusammenfassung. Bei Gerade muss die geschützte V3-Preisvorschau über denselben WordPress-Server antworten.
4. Als Gast in privatem Browserfenster die Entwurfs-URLs und gewöhnliche Produktseiten prüfen: **keine** Admin-Vorschau, keine geschützten Nonces. Zusätzlich als normaler Kunde testen, falls eigenes Testkonto verfügbar.
5. Vorher/nachher mindestens ein bestehendes veröffentlichtes Produkt auf Layout, Preis, Warenkorb und Ladeverhalten **nur lesend** vergleichen. Den Control-Sockel 999985 nur prüfen, wenn er auf dieser Installation wirklich existiert.
6. Cache/WP Rocket: keine generellen Ausschlüsse. Falls im Admin-JavaScript ein echter Fehler auftritt, zuerst Network/Console dokumentieren und nur nach Freigabe einen eng begrenzten Modul-/Delay-Ausschluss einsetzen.
7. Direktes Add-to-Cart, Store-API-POST, simulierte Alt-Warenkörbe und Checkout-/Zahlungsversuche gehören **nicht** zum risikoarmen Live-Admin-Test. Diese Fälle bleiben trotz automatisierter Tests offen, bis eine isolierte Testumgebung/Sitzung ausdrücklich dafür freigegeben ist.
8. Bei Problemen Plugin-Vorversion wiederherstellen oder auf den vorherigen Stand zurücksetzen. Entwürfe bleiben Entwürfe. Beim Deaktivieren fallen **die Plugin-basierten** Kaufsperren weg, daher keinesfalls veröffentlichen.

Eine Admin-Vorschau auf einer unveröffentlichten Seite ist weder eine öffentliche Produktintegration noch eine Verkaufsfreigabe. Exakte Tests und offene Gates stehen unter `wordpress/real-site-tests/TESTPLAN.md`.
