# Einmaliger Binärimport – U1–U4 Speedmaster-Originale

## Status

**ABGESCHLOSSEN (PR #57 gemergt, 05.11.2026):** Die zwölf Original-PNGs sind im GitHub-Repository als binäres ZIP archiviert. Der Pull Request ist gemergt, die Git-Blob SHA-1 und alle Original-SHA-256 stimmen überein, der GitHub-Action-Prüflauf ist grün. Dies ist ein Bildnachweis, keine CNC-/Produktionsfreigabe.

**Dauerhaft archivierte Quelle:** `Speedmaster_U1-U4_20261105_Originale.zip`

- Größe exakt **6.699.368 Bytes**.
- SHA-256 exakt `1b1caa59a791e189192eb411387daaa8236a5963f6af4384816dff0cdff9d9c9`.
- Git-Blob-SHA1 exakt `b6948a55d8cebcc55fdd21069515e9b095c2635b`.
- Inhalt: **12 unveränderte Speedmaster-PNGs** (je U1–U4 eine Draufsicht, eine transparente Gesamtansicht, eine Stoß-Nahaufnahme); CSV-Bildmanifest; README; zwei in den früheren Chats gelieferte Text-Kontexte.
- Alle 12 Bildbytes und PNG-Abmessungen lokal gegen `U_20261105_SOURCE_MANIFEST.csv` geprüft.

## Historischer Uploadablauf (bereits durch PR #57 abgeschlossen)

1. Lade die vorbereitete ZIP aus dem aktuellen Chat herunter.
2. Öffne das GitHub-Repository und wähle **Branch `docs/pr57-u1-u4-originals-binary-20261105`**.
3. Öffne Ordner `docs/references/speedmaster-lu/`, klicke **Add file → Upload files**.
4. Lade **die ZIP selbst** hinein; nicht entpacken und nicht umbenennen.
5. **Commit changes** auf **diesem Branch**, nicht direkt auf `main`.
6. Erst **nachdem** `python3 scripts/verify_u_20261105_archive.py --require` (auch automatisch in GitHub Actions) komplett grün ist, das Archiv im Code-/Dokumentenstatus als „binär gespeichert“ bezeichnen. Danach kann der PR nach Freigabe gemergt werden.

**Der zuvor absichtlich rote CI-Check ist seit dem Originalbild-Upload grün.** Der Binärimport ist abgeschlossen. Keine Platzhalterdateien verwenden und nicht erneut hochladen.

## Nutzung durch zukünftige Chats

- Private GitHub-Repo-Kopie öffnen.
- `python3 scripts/verify_u_20261105_archive.py --require`
- `unzip -l docs/references/speedmaster-lu/Speedmaster_U1-U4_20261105_Originale.zip`
- Bildbeispiel: `originals/U3/image(20261105-101636).png`.
- Das Archiv niemals unter `wordpress/`, `dist/` oder `local/public/` ausliefern. Hintergrundfotos und Projektdaten sind rein interne Entwicklungsbelege.

**Weitere separate Archivlücke:** Je 6 Originale L4-B5 02.11, 6 Originale L1/L2 05.11 und 4 Originale L4 05.11 sind laut aktuellen Registern noch nicht binär im PR39-ZIP (insgesamt 16 L-Bilder). Hier keine historische Verfügbarkeit behaupten und diese fehlenden L-Bilder nicht durch U-Fotos ersetzen.
