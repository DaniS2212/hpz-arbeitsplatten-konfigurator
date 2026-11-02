# L1–L4 Supplier Evidence Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduzierbarer, ausdrücklich nicht freigebender Speedmaster-Abgleich für L1–L4 als sichere Grundlage für die spätere Fertigungs- und Preisprüfung.

**Architecture:** Ein reines ES-Modul enthält unabhängig von der Zeichnungsberechnung transkribierte Screenshots als Fixture-Witnesses und vergleicht mit normalisierter L-Vorschaugeometrie. Ein separater CLI-Prozess erzeugt ein lesbares Prüfblatt bzw. bricht bei geometrischen Driftfehlern ab. Die produktive WordPress-/WooCommerce-Schicht wird nicht verändert.

**Tech Stack:** Node 22 ESM, `node:test`, bestehende `local/core/config.mjs` + `geometry.mjs` + `l-geometry.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-02-l-supplier-audit-design.md`

## Global Constraints
- Nur Produkt `l` und die dokumentierten 4 Snapshot-Beispiele L1–L4.
- Ursprung ausschließlich Screenshots 30.10.2026, kein Speedmaster-API-/CNC-Nachweis.
- Dimensionen intern ausschließlich mm, gekoppelte B1/B2 und B3/B4 gemäß vorhandenem Kontrakt.
- L/U niemals öffentlich freigeben; `supplierMappingVerified=false`, `joints=null`, `shippingParts=null`.
- Keine Änderungen am WordPress-Bundle, Preisregeln, Live-Kaufpfad oder vorhandenen Kundenkarten.
- Der bekannte Lieferanten-Netto-EK 464,45 € gehört nur zur vollständig ausgeführten L1-Konfiguration und darf nicht interpoliert werden.

## Review Focus
- Gleicher Dimensionsdatensatz bei anderem Dekor/anderer Dicke: **kein** dokumentierter Lieferantenbeleg.
- Eckbearbeitung trotz sonst identischer Grundmaße: **kein** Basisform-Referenznachweis.
- L4-B5-Veränderung: geometrisch anders, Lieferantenbezug ausdrücklich ungeprüft.
- Projektionen/Grenzlagen mit einer verschwindenden Teilfläche: kein imaginärer Stoß oder Lieferantenteil.
- Nachweisaufnahme fehlt: keine automatisch gesetzte Fertigungs-/Preisfreigabe.

---

### Task 1: Screenshot-Fixtures + fehlende Freigaben
**Files:**
- Create: `local/test/l-supplier-audit.test.mjs`
- Create: `local/core/l-supplier-audit.mjs`

**Interfaces:**
- `L_REFERENCE_CASES`: unveränderliche unabhängige Fixtures mit Referenzabmessungen, Sollkontur/Sichtstoßzahl und genauen Quellen/Status.
- `auditLReference(config, currentGeometry)`: strukturiertes, JSON-sicheres Ergebnis mit `matchedReference`, `geometryConsistent`, `manufacturingReady:false`, `missingEvidence`, `witnesses`.

- [ ] Test zuerst: alle 4 Screenshots und ihre mm-Koordinaten, Stöße, Belegstatus.
- [ ] `node --test local/test/l-supplier-audit.test.mjs` → FAIL wegen fehlendem Modul.
- [ ] Minimale Fixtures + Validierungs-/Matching-Logik implementieren.
- [ ] Gleicher Test → PASS.

### Task 2: Geometrische Konsistenz und Unveränderbarkeit
**Files:**
- Modify: `local/test/l-supplier-audit.test.mjs`
- Modify: `local/core/l-supplier-audit.mjs`

**Interfaces:** Prüft Polygone, Abschluss der Stoß-Endpunkte am Umriss, Flächen-Summe nur für unbearbeitete Referenzkonturen, blockiert falsche Geometrie und Eckvarianten.

- [ ] Fehlertests für manipulierten Eckzustand, verschobenen Stoß, fehlende/negative Teilefläche, verschobene L4-Außendiagonale und fremde Familie.
- [ ] Test → FAIL.
- [ ] Schmalen Prüfer umsetzen; keine Erfindung von Vendor-Maschinenkoordinaten.
- [ ] Test → PASS.

### Task 3: CLI-Prüfblatt + CI
**Files:**
- Create: `scripts/l-supplier-audit.mjs`
- Modify: `local/test/l-supplier-audit.test.mjs`
- Modify: `.github/workflows/configurator-preview.yml`
- Create: `docs/phase-l-fertigungsabgleich-20261102.md`

**Interfaces:** `node scripts/l-supplier-audit.mjs` druckt für alle L-Varianten Status + fehlende Speedmaster-Nachweise; `--check` scheitert bei Reference Drift; keine Preis- oder Kundeninteraktion.

- [ ] CLI-Regression zuerst als FAIL.
- [ ] CLI und lesbares Prüfblatt erstellen.
- [ ] CLI → PASS, Module- und Preisregression → PASS, vollständige GitHub-Actions-CI → PASS.
- [ ] PR mit klarer Grenze »Herstellerabgleich offen« öffnen, keine automatische Merge-/Produktfreigabe.
