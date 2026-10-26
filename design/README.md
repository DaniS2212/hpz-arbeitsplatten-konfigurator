# Küchenstudio-Designschicht 0.6 – integriert

Stand 26.10.2026. Diese Schicht stammt aus PR #6 und wurde auf der gemergten 0.5.0-Basis (PR #7) in den 0.6.0-Featurebranch übernommen und erweitert. `design/kuechenstudio-060.css` ist die gepflegte Quelle; `build-plugin.mjs` kopiert sie bytegleich in die lokale Komponente und das WordPress-Paket. Beide laden sie nach `component.css` im isolierten Shadow DOM.

## Umsetzung
- Premium-CSS mit Off-white/Weiß, Petrol `#153f48` / `#146178`, neutraler Bühne und warmem Fokusakzent.
- Bestehende 16 Dekorbilder, Karten und Komponentenstruktur bleiben erhalten.
- Die sichtbare cm-Eingabeschicht liegt in `local/core/customer-measures.mjs`, nicht in CSS. Sie wandelt exakt auf den unveränderten mm-V2-Serververtrag.
- PHP-V3-Preisregel, Produktentwürfe, Versand und Kaufsperren wurden durch die Designschicht nicht verändert.

## Nachweise
Siehe [Issue #5](https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator/issues/5) und `docs/phase-060.md`. Die Browserlayouttests prüfen 360, 390, 1366 und 1440 px. Die WordPress-Version bleibt ausschließlich ein Admin-/Entwurfs-Testmodus.

**Semantische Sicherheit:** CSS ersetzt keine barrierefreien Labels oder serverseitige Warnhinweise. `250,1 cm` bleibt intern `2501 mm`; `88,1 cm` bleibt `881 mm`. Material- und Kantenstärken bleiben in mm.

Die Verkaufsfreigabe ist in dieser Version weiterhin gesperrt und bedarf später eigener fachlicher und technischer Prüfung.
