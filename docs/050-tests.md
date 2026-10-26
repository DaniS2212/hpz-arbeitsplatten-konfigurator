# 0.5.0 – Prüfnachweis

Stand: 26.10.2026. Alle Prüfungen lokal; keine WordPress-Installation oder
Live-Shop-Anfrage. Die PHP-CLI war eine verifizierte portable Testlaufzeit im
ignorierten `tmp/`-Ordner. Der HTTP-Harness ruft die echte Plugin-PHP-Klasse
mit nachgebildeten WordPress-Funktionen auf; eine echte WordPress-Laufzeit
ersetzt er nicht.

| Prüfung | Ergebnis |
| --- | --- |
| V3-Originaltest | 379 Assertions, 72 historische EK-Fälle, kleinste geprüfte Marge 40,370 %, bestanden |
| PHP-Preisnormalisierung | 97 Assertions, bestanden |
| PHP-Admin-/Entwurfs-/Nonce-Gates | 18 Assertions, bestanden |
| Node-Komponente, altes Projekt, Pluginpaket und echter HTTP-Aufruf der PHP-Klasse | 100 Tests, 100 bestanden, 0 übersprungen |
| Browser mit lokalem PHP-Server | Maße 2500/2780/2781 mm, Menge 1/2 und Dekorwechsel beobachtet; alter Preis wird bei Eingabe entfernt; Kaufbutton deaktiviert |
| Desktop/Mobil | Vollseitenansichten bei normaler Desktopbreite und 390 × 844 px geprüft; Preis und Bestellsperre sichtbar |
| Plugin-ZIP | 57 Einträge bytegleich zum Plugin-Verzeichnis; V3-PHP-Datei bytegleich zur Quelle; PHP-Syntax fehlerfrei |

V3-Sprungstellen 2501, 2781 und 881 mm, alle 16 Dekore in beiden Stärken,
Eckzuschlag für eine und zwei Ecken, Mengenmultiplikation sowie manipulierte
und ungültige Werte sind in PHP-/HTTP-Tests abgedeckt. Die alte Paketprüfung
erlaubt nun ausschließlich dem WordPress-Preisadapter eine Same-Origin-Anfrage;
alle anderen gebündelten Skripte bleiben ohne Fetch und ohne externe Assets.

Die Screenshots `050-desktop-preis.png` und `050-mobile-preis.png` stammen aus
dem lokalen Testmodus. Sichtbarer Beispielzustand: Gerade, 38 mm, Platinweiß,
2781 × 600 mm, Menge 2, unverbindliche 1.780,00 € brutto. Er ist kein Angebot.

Weiter offen: echte WordPress-/WooCommerce-/Flatsome-/WCPA-Laufzeit, Cache und
Rollen, internationale Besteuerung, tatsächliches Paketgewicht/Kundenversand,
klassischer und Store-API-Warenkorb, Sockel-Regression und physisches Telefon.
Für L/U existiert noch keine freigegebene V3-Preisformel.

Paket: `dist/hpz-apl-admin-preview-0.5.0.zip`, SHA-256
`227C356BA9FDCFF16C9A853E1C0480E9D0BEF0374CEC92CA2014A926C07D5B15`.
Das vorhandene 0.4.0-Paket behielt seinen SHA-256
`EB8B6B05557A9CB9EEAC81312287C94631AC08A6002E9BDBA1E4C3A5C53575C6`.
