# Einbettung in bestehende Flatsome-Produktseiten – 23.10.2026

Verbindliche Ergänzung aus Nutzerauftrag. Architekturvorbereitung, noch kein installierter WooCommerce-Adapter. Die lokale Demo bleibt unverändert.

## Vorhandene Produkte wiederverwenden

| Bestehender Produktentwurf | Zugeordnete Familie |
|---|---|
| Küchenarbeitsplatte nach Maß – Gerade | straight |
| Küchenarbeitsplatte nach Maß – L-Form | l |
| Küchenarbeitsplatte nach Maß – U-Form | u |

Keine weiteren Produkte erzeugen. IDs/SKUs vom Nutzer bestätigt: Gerade 1000083 / HPZ-APL-GERADE-2026; L 1000080 / HPZ-APL-L-FORM-2026; U 1000081 / HPZ-APL-U-FORM-2026. Keine Zuordnung allein anhand veränderbarer Titel. Sockel 999985 ist ausdrücklich ausgeschlossen.

## Sichtbarer Einbauort

Der beigefügte Screenshot zeigt die L-Produktseite: Shopheader und Navigation, Breadcrumb, links Galerie mit Vorschaubildern, rechts H1/Kurzbeschreibung/Produktmetadaten; darunter Beschreibung und Rezensionen. Die Komponente wird nach dem gesamten zweispaltigen Einleitungs-/Galeriebereich und vor dem Beschreibungs-/Tabbereich vorgesehen. Sie erhält eine eigene Zeile über die gesamte verfügbare Inhaltsbreite; sie wird nicht in die schmale rechte Produktspalte gezwängt. Eine größere Breite als der Theme-Inhaltscontainer bleibt eine später lokal zu prüfende Layoutoption, kein globales Theme-Override.

Header, H1, Galerie, Texte, FAQ, SEO und Schema-Markup bleiben Eigentum der Produktseite. Im eingebetteten Konfigurator erscheinen kein zweiter Shopheader, keine zusätzliche H1, keine zweite Produktgalerie und keine duplizierten Beschreibungstexte. Eine kurze Abschnittsüberschrift „Arbeitsplatte konfigurieren“ ist zulässig. Die dynamische Maßzeichnung und Dekorvorschau sind funktionale Konfiguratorinhalte und bleiben erhalten.

Der Screenshot ist ein Layoutbeleg, kein Nachweis für konkrete Template-Hooks, Produkt-ID, Teilezerlegung oder Preisfreigabe. Nur die L-Seite wurde als Bild vorgelegt; entsprechende Struktur für Gerade/U ist vor Einbau zu prüfen.

## Komponentenvertrag

Ziel: mountConfigurator(root, context, adapters) liefert updateContext und destroy. Dies ist ein Schnittstellenentwurf, noch keine verfügbare Laufzeit-API.

- root: ausschließlich der eigene Container mit Namensraum hpz-apl; alle DOM-Abfragen und Ereignisse bleiben darin. Keine globalen IDs, body-Datenattribute, allgemeinen nav/button/h1-Regeln oder Änderungen am Dokument außerhalb des Containers.
- context: schemaVersion, instanceId, productId, family, initialConfiguration, locale, presentationMode (demo/embedded), availabilityVersion. Die Familie stammt aus der serverseitigen Produktzuordnung; Browserangaben sind kein Nachweis.
- embedded: passende Familie vorausgewählt und an das Produkt gebunden. Varianten derselben Familie bleiben konfigurierbar. Ein Wechsel zu einer anderen Familie erfolgt später als Link zum anderen Produkt, nicht durch stilles Umdeuten der Warenkorbposition. Nicht übertragbare Konfigurationen werden nicht automatisch übernommen.
- adapters: Katalog/Verfügbarkeit, Konfigurationsprüfung, Preisabfrage sowie separat freigegebene Warenkorbübergabe. Anzeige von unverbindlichem Beispiel und verbindlichem Angebot sind verschiedene Zustände. Demo nutzt weiterhin den lokalen HTTP-Adapter; Shop nutzt später PHP/WooCommerce. Kein Node-Dienst im Shop.
- Zustände: loading, invalid, unverified, quotable, purchasable. Nur eine erfolgreiche serverseitige Prüfung aller Freigaben darf purchasable ergeben. Fehlende Daten, veraltete Antworten und Fehler sperren die Übergabe.
- destroy entfernt nur eigene Listener und eigene Ressourcen, bricht ausstehende Anfragen ab. Mehrere Initialisierungen dürfen keine doppelten Formulare, Listener oder Warenkorbaktionen erzeugen.
- SVG-ID-Präfix je Instanz für Marker, Muster und Gradienten; sonst kollidieren Vorschau und vergrößerte Darstellung oder mehrere Komponenten.
- Konfigurationsereignisse enthalten Maße, Auswahl und Prüfstatus, keine internen Einkaufspreise. Fokusführung, Fehlermeldungen, Dialoge und mobile Vorschau funktionieren innerhalb der Komponente.

## WCPA und Darstellung

WCPA Pro bleibt die bevorzugte Feld- und Bedingungsbasis. Eine eigene Erweiterung verbindet diese Felder mit Vorschau, Validierung und Preisadapter. Pro Produkt genau eine führende Konfiguration und eine Warenkorbaktion; kein paralleles zweites WCPA-unabhängiges Bestellformular. Das versuchsweise Demoformular wird nicht einfach neben WCPA in die Produktseite kopiert.

Die aktuelle Demo ist noch nicht direkt einbettbar: Sie benutzt globale IDs, body-basierte Styles und dokumentweite Abfragen. Vor Einbau werden Shell (Header/Intro/Footer), Komponentenansicht, Zustandsverwaltung und Adapter getrennt. Die Demo behält ihre bestehende sichtbare Gestaltung und nutzt danach dieselbe Komponente innerhalb ihrer Shell. Komponenten-CSS wird unter hpz-apl gekapselt; Theme-Farben/Schrift können über eigene CSS-Variablen übernommen werden. Keine globalen CSS-Resets, keine Theme-Dateiänderung.

Einbaupunkt erst anhand des tatsächlichen Flatsome-Produktlayouts und der WCPA-Ausgabe bestätigen. Hook, Shortcode oder eigenes UX-Element wird danach gewählt; keine ungesicherte Hook-Priorität festschreiben. Bestehende Galerie/Einleitung und Beschreibung bleiben in ihrer Reihenfolge erhalten.

## Preis und Warenkorb

Server ordnet productId der Familie zu und prüft alle Maße, Geometrie, Material, Dekor, Kante, Menge, Teile und Preisregel erneut. Ein Browserpreis oder ein Freigabeflag wird niemals übernommen. Wiederholte Berechnung, direkte Add-to-cart-Anfragen, Expresswege und Checkout dürfen keine Sperre umgehen. Interne 10/50 EUR bleiben Bezugskosten im Produktpreis; Kundenversand bleibt zusätzlich über Flexible Shipping. Steuerbehandlung erfolgt über den bestehenden WooCommerce-Kontext.

Vorhandene native Kauf-/Preisbereiche der drei Zielprodukte werden im Testlayout auf doppelte Ausgabe geprüft. Falls erforderlich nur für diese IDs über den Adapter auf eine einzige führende Ausgabe abstimmen, ohne gespeicherte Inhalte oder globale Templates zu löschen. Bis vollständige Prüfungen bestanden sind bleiben alle Verkaufswege gesperrt.

## Kleine Umsetzungsschritte und Abnahme

1. Produkt-IDs, vorhandene WCPA-Zuordnung und tatsächliches Flatsome-Layout lesend erfassen. Referenzbilder für Gerade/U ergänzen.
2. Lokale Shell und Komponente trennen; Demo visuell erhalten. Root-Isolation, mehrfache Initialisierung, destroy und SVG-ID-Isolation testen.
3. Lokale Einbettungs-Testseite mit Platzhaltern für bestehende Einleitung und Beschreibung; alle drei Produktkontexte testen. Keine Kopie vollständiger Shopinhalte nötig.
4. Später auf freigegebener Testumgebung WCPA-/PHP-Adapter einbauen und einzige Preis-/Kaufaktion prüfen.
5. Tests: unveränderte H1/Galerie/Texte/FAQ/SEO; korrekte Familienbindung; keine Formnester oder CSS-Kollisionen; mobile volle Inhaltsbreite; Tastatur/Dialoge; Session/Bestellmetadaten; Manipulations- und Expresskaufversuche; Steuer/Versand; Sockel-Regression. Live erst nach gesonderter Freigabe.

Lokale technische Umsetzung erfolgt: siehe STATUS.md und local/README.md. Keine Produktbearbeitung oder Veröffentlichung.

