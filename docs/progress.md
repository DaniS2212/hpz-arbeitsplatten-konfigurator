# Ausführungsprotokoll zum Plan docs/superpowers/plans/2026-10-19-kuechenarbeitsplatten.md

Arbeitsweise vom Nutzer bestätigt: Aufgabe für Aufgabe in dieser Unterhaltung, dokumentierte Prüfungen, keine Unteragenten. Plan freigegeben. Staging-Erstellung und Veröffentlichung bleiben gesondert abzustimmen.

## Aktueller Stand

**Neuester Stand – lokale Umsetzung ausdrücklich freigegeben:** Staging mit Marco zurückgestellt (HostPress/Plesk). Lokaler, getrennt startbarer Entwicklungsträger unter `../local/` implementiert. 38 automatisierte Tests bestanden; Details, Browserprüfung und offene Shoptests in `local-development.md`. Keine Live-Änderungen. Die nachfolgenden bisherigen Einträge sind historischer Verlauf und werden durch diesen Stand ergänzt.

Ruling: Aufgaben 3/5/6/7/8 werden in ihren shopunabhängigen Teilen vorgezogen — ausdrücklicher Nutzerauftrag trotz fehlendem Zugang — native WCPA-/PHP-Anbindung bleibt nach Integrationsvertrag offen. Node ist Entwicklungsträger, keine Änderung der freigegebenen Shop-Architektur. Die unabhängigen Testwerte müssen später auch die PHP-Portierung prüfen.

Ruling: Frischer, ausschließlich lokaler Unterordner statt Git-Worktree — kein Repository vorhanden und kein Shop-Code verfügbar — keine fremden Dateien oder synchronisierten Quellen verändert, keine Commits behauptet. Bestehende Produkt-IDs werden nicht in einen Adapter eingetragen.

Ruling: Alle neun Formen bleiben registriert, aber L/U nur als ausdrücklich allgemeine Familienskizze — keine erreichbaren Speedmaster-Originalzeichnungen für die Zuordnung vorhanden, auch nicht über den lesbaren Gesprächsabruf — keine erfundene Teilezerlegung, Stöße oder Versandfreigabe. Eckmuster sind keine behauptete Liste lieferbarer Varianten.

Prüfung: Erst 31 Tests rot, dann grün; fünf HTTP-/Antworttests rot, dann grün. Host-Header-Test nach nachgewiesenem fetch-Headerersatz auf rohen HTTP-Client korrigiert. Zusätzlicher Kantenendpunkt-Test rot, nach Korrektur grün; Vorschau-Matrix ergänzt. Gesamtstand `node --test`: 38/38, keine übersprungenen Tests. Lokaler Browser bestätigt Kommaeingabe, Präzisionsfehler, U-Familienskizze und gesperrten Kauf.

Aufgaben bleiben insgesamt teilweise offen: Aufgabe 1 Laufzeitbefund, 2 Staging zurückgestellt, 3 reale WCPA-Produkte/Formulare, 4 Lieferantennachweise, 5 fertige Speedmaster-Geometrien, 6 Verfügbarkeiten/Bilder, 7 endgültige Formeln/PHP, 8 Shop-UI, 9–12 komplette Shopintegration und Abnahme. Nächster datenabhängiger Schritt: erreichbare Originalzeichnungen in die registrierten Geometrien überführen; kein Hosting-Zugang dafür nötig.

## Bisheriger Verlauf

Fortsetzung nach erneuter Umsetzungsanweisung: neuer Referenzfall Gerade APL17,5/W980 2000×700 mm mit 165,80 € netto aufgenommen; alle Kanten 1,5 mm dekorgleich. Dokumentarischer Kalkulationsfall 275,54 € netto / 327,89 € DE brutto vor Kundenversand ergänzt. Keine Freigabe unbestätigter Nachbarbereiche.

Nächste konkret ausführbare Schritte erledigt: vorhandene Staging-Dokumentation/Zugriffsmöglichkeiten und lokale Werkzeuge geprüft, Staging-Vorbereitung konkretisiert. Keine Staging-URL/Shopkopie/Hosting-Zuordnung vorhanden; PHP/Docker nicht im Suchpfad gefunden. Nutzer gezielt nach vorhandener Staging-URL oder Hosting-Anbieter/Panel gefragt. Kein Plugin-Code auf Basis ungeprüfter Adapter implementiert; keine Live-Änderung. Aufgabe 1 bleibt technisch offen, Aufgabe 2 ist dokumentarisch vorbereitet, aber nicht eingerichtet oder abgenommen.

- Aufgabe 1: angeforderte Dokumente/Screenshots und beide aktiven Snippets ausgewertet. Produkt 999985/Formular 999984, Grundpreis, Steuerbasis und dargestellte Versandregeln belegt. Dokumentarischer Abgleich erledigt; technische Abnahme mit konkreten WCPA-Hooks, DE-Zone und Laufzeitregression noch offen. Keine erneute Anforderung bereits gelieferter Dateien.
- Aufgaben 2–12: nicht begonnen. Keine Staging-Erstellung, kein Plugin-/Formularcode, keine Live-Änderung.
- Neue U1-Referenzen: in Spezifikation, Plan und dokumentarischen CSV-Testfalldaten ergänzt. Ausführbare Engine-Tests erst in Aufgabe 7; keine bestandenen Funktionstests behauptet.

## Zwischenprüfung Systembericht

Originaldatei nur gelesen; ausgewählte projektbezogene Angaben in baseline.md/integration-contract.md übernommen, keine Zahlungsaccount-IDs oder unnötigen Datenbankdetails kopiert. Bericht meldet acht veraltete Overrides; keine davon geändert. Neu konkretisierte Prüfpunkte: SkyVerge-Preislogik, Flexible Shipping, Code Snippets, Stripe-Express-Pfade und WooPayments-Mehrwährung. Diese Punkte sind Befunde beziehungsweise offene Integrationsprüfungen, keine nachgewiesenen Fehler. Keine Shop-Verbindung, Testzahlung oder Staging-Erstellung durchgeführt.

## Entscheidungen und Abhängigkeiten

Verbindliche Nutzerkorrektur: 10/50 € sind interne Bezugskosten Speedmaster → Holz-Liebling. Kundenversand bleibt zusätzlich im Checkout bestehen. Spezifikation und Plan angepasst; Aufgabe 10 mit Gewichtsversorgung statt Versandbefreiung neu gefasst, partition-Schnittstelle entfällt. Testfälle in shipping-tax-test-cases.md festgeschrieben, noch keine ausführbaren Integrationstests. Sockel-Formeln, beide Snippets und Versandbehandlung bleiben unverändert.

Zwischenprüfung Backend-Ergänzung: alle 18 bereitgestellten Screenshots inhaltlich gesichtet (mehrere Produktansichten doppelt); beide JSON-Exporte vollständig gelesen. Produktbegrenzung und rein darstellende Funktion bestätigt. Offene Voraussetzungen: Staging-Zugang/gesonderte Erstellung, vollständige Mitteleuropa-Länderliste, Steuersatztabellen und belegte Material-/Verpackungsgewichte. Deutschland wird aus der gekürzten Liste nicht geraten. Bruttoeingabe erklärt grundsätzlich den Formel-Faktor 1,19, ersetzt aber keine Laufzeitprüfung. Keine Live-Änderung oder Staging-Erstellung.

Zwischenprüfung WCPA: Base64 dekodiert, form_json anhand 175832 UTF-8-Bytes gelesen, JSON erfolgreich geparst. Acht eindeutige Felder, keine fehlenden gefundenen Formel-Feldreferenzen. 66 Dekor- und elf Furnierformeln enthalten jeweils Faktoren 1,30/1,19. Preisoptions-Screenshot stimmt mit Export überein. Ein zunächst fehlerhafter PowerShell-Ausdruck der Zusammenfassung wurde korrigiert und erneut erfolgreich ausgeführt; keine Quelldatei verändert. Nur Struktur-/Textprüfung, keine Formelausführung oder Laufzeittests. Details in wcpa-sockel-audit.md.

Ruling: Dokumentarische Bestandsaufnahme bleibt im vorhandenen Projektordner — kein Git-Repository oder Shop-Code vorhanden und aktuell nur Aufgabe 1 beauftragt — Entwicklungsrepository/isolierter Code-Arbeitsbereich wird vor tatsächlicher Codeimplementierung festgelegt; derzeit keine Git-Commits möglich.

Ruling: Staging-Erstellung ist nicht durch die allgemeine Planfreigabe gedeckt — ausdrückliche neueste Nutzervorgabe — Aufgabe 2 darf keine neue Umgebung ohne gesonderte Freigabe erzeugen.

Vorprüfung der Schnittstellen: Aufgabe 1 liefert den Vertrag für 3/9/10; ohne Backend-Unterlagen bleibt er offen. Aufgabe 4 liefert unabhängige Geometrie-Sollwerte für 5; 6 ergänzt Verfügbarkeit. Aufgabe 7 liefert Preisadapter für 8/9, Testadapter erlaubt ausschließlich Vorbereitung; fehlende endgültige Formeln sperren Verkaufsfreigabe. Aufgaben 9/10 liefern Warenkorb-/Versandverhalten für 11. Aufgabe 12 benötigt dokumentierte Abnahme aus 11 und separate Veröffentlichungsfreigabe. Keine neuen Schnittstellenkonflikte festgestellt; alle Abhängigkeiten bleiben bestehen.

20.10.2026 – UI-Priorität umgesetzt: lokale Fassung 0.2.0 mit drei Schritten, großer SVG-Vorschau und responsiver Ansichtsprüfung. Vorherige Fassung vollständig archiviert. 41 automatisierte Tests bestanden; Browserprüfung siehe ui-milestone-2026-10-20.md. Staging bleibt zurückgestellt, lokale Entwicklung ausdrücklich freigegeben. Keine Live-Änderungen. Offene Geometrien und alle Käufe bleiben gesperrt.
