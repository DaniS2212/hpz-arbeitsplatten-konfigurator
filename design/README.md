# Küchenstudio-Designschicht 0.6 – Vorabstand

Stand 26.10.2026. Die Version 0.5.0 ist in Work **lokal uncommitted**, daher kein Eingriff in bestehende Plugin-Quelldateien. Dieser Branch basiert bewusst auf `main` 0.4.0. **Nicht mergen**, bevor 0.5.0 gepusht/gemergt und dieser Branch auf den neuen Stand gebracht wurde.

## Bereits umgesetzt
- `design/kuechenstudio-060.css`: vollständig gekapselte Premium-CSS-Schicht, bestehende Elemente und Auswahllogik weiterverwendet. Farbwelt: Off-white/Weiß, Petrol #153f48 / #146178, klare Slate-Typografie, dezente warme Fokuskontur, ruhige Zeichnungsbühne.
- Keine Änderung der bestehenden Konfigurator-CSS, JS, Preisengine, Bilder, WooCommerce-Kaufbuttons, Produktentwürfe oder WordPress.
- Diese Datei wird **noch nicht automatisch geladen**. Nach 0.5.0 auf einer Testansicht als letzte Komponentendesignregel einbinden und mit Vergleichsscreenshots prüfen.

## 0.6 Integrationsaufgaben
Siehe [Issue #5](https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator/issues/5): echte Cm-Kundenmaße mit 0,1 cm / intern Integer-mm, „Ecken“ statt „Form“ bei Gerade, „Teile & Stöße“ bei Gerade entfernen (bei L/U „Aufteilung“), Textreduzierung und hochwertiger Zusammenfassungsblock.

**Semantische Sicherheit:** CSS ersetzt keine barrierefreien Labels oder serverseitige Warnhinweise. Für Textänderungen erst nach 0.5.0 die Komponenten und die zugehörigen Tests ändern. Für Cm-Umstellung: eigene exakte Umrechnung als Eingabe-/Anzeigeschicht, kein Wechsel des mm-V2-Serververtrags und keine Float-Rundungsfehler. 250,1 cm muss 2501 mm; 88,1 cm muss 881 mm ergeben. Materialstärke bleibt mm.

## Akzeptanz
- Farb- und Typografiehierarchie auf 360, 390, 1366, 1440 px testen, auch bei Sticky Header.
- 16 Dekorbilder, alle 10 Eckzustände und V3-Preisvorschau bleiben unverfälscht.
- Keine stille Verkaufsfreigabe. Nur ein späterer expliziter Release kann das ändern.
