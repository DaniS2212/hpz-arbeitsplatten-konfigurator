#!/usr/bin/env python3
"""Build an OFFLINE-only human Speedmaster/L1-L4 image comparison.

Validated supplier originals come from the private, SHA-verified PR39 archive.
Generated screenshots are administrative previews only. This report does NOT
approve visual/manufacturing parity, CNC, supplier limits or sales. Never place
the report or supplier original PNGs in WordPress plugin distributions.
"""
import argparse
import base64
import csv
import html
import io
import json
import sys
import zipfile
from pathlib import Path

from import_speedmaster_reference_zip import (
    ARCHIVE_PREFIX, REFERENCE_RELATIVE, inspect_archive, source_rows,
)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ARCHIVE = ROOT / REFERENCE_RELATIVE / "Speedmaster_PR39_GitHub_Upload.zip"
DEFAULT_FIXTURE = ROOT / REFERENCE_RELATIVE / "REVIEW_CASES.json"


class ReportError(ValueError):
    """Source provenance or output data is absent/invalid."""


def validate_cases(cases, manifest_rows):
    if not isinstance(cases, list) or not cases:
        raise ReportError("At least one explicit Speedmaster source case is required")
    rows = {row["path"]: row for row in manifest_rows}
    result, seen = [], set()
    for case in cases:
        if not isinstance(case, dict):
            raise ReportError("Invalid reference case")
        case_id, source = case.get("id"), case.get("source")
        if case_id not in ("L1", "L2", "L3", "L4") or case_id in seen:
            raise ReportError("Unknown or duplicate L1-L4 case")
        seen.add(case_id)
        row = rows.get(source)
        if row is None:
            raise ReportError("Original source path missing from verified manifest: " + str(source))
        if row.get("source_type") != "speedmaster":
            raise ReportError("Only original Speedmaster images can be supplier references")
        if case.get("shape") != case_id or case.get("treatment") not in (
            "chamfer_square", "chamfer_continuous", "round"):
            raise ReportError("Invalid review fixture geometry")
        if not isinstance(case.get("dimensions"), dict) or not isinstance(case.get("corners"), dict):
            raise ReportError("Review fixture must carry independently visible mm dimensions and corner settings")
        result.append({**case, "source_type": row["source_type"]})
    return result


def list_unpaired_originals(manifest_rows, matched_cases):
    """Return only supplier originals without an independently paired UI case.

    The source manifest differentiates Speedmaster from our own shop/UI images.
    The caller MUST verify archive hashes before reading any pixel bytes.
    This selection by itself is NOT an automated visual equivalence check.
    """
    paired = {case["source"] for case in matched_cases}
    selected, seen = [], set()
    for row in manifest_rows:
        if row.get("source_type") != "speedmaster":
            continue
        path = row.get("path")
        if not isinstance(path, str) or not path.startswith("originals/"):
            raise ReportError("Invalid source path in verified supplier manifest")
        if path in seen:
            raise ReportError("Duplicate supplier original in source manifest: " + path)
        seen.add(path)
        if path not in paired:
            selected.append(row)
    return selected


def _png_uri(data, label):
    if not isinstance(data, bytes) or not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ReportError("Invalid or missing PNG: " + label)
    return "data:image/png;base64," + base64.b64encode(data).decode("ascii")


def render_report(cases, source_images, previews, commit, unpaired_sources=None):
    sections = []
    for case in cases:
        cid = case["id"]
        if cid not in source_images:
            raise ReportError("Original Speedmaster PNG missing: " + cid)
        reference = _png_uri(source_images[cid], "Original " + cid)
        own = []
        # L1/L2 have one illustrated seam, L3/L4 have two. These are
        # screenshot REVIEW states only, never the number of real CNC joints.
        illustrated_seam_count = 1 if cid in ("L1", "L2") else 2
        for width in (1366, 390):
            data = previews.get((cid, width))
            if data is None:
                raise ReportError(str(width) + " px Draufsicht missing for " + cid)
            own.append((f"Eigene Admin-Draufsicht {width} px",
                        f"Eigene {cid} Draufsicht {width} px",
                        _png_uri(data, cid + " Draufsicht " + str(width))))
            for seam_number in range(1, illustrated_seam_count + 1):
                letter = chr(ord("A") + seam_number - 1)
                data = previews.get((cid, width, f"seam-{seam_number}"))
                if data is None:
                    raise ReportError(
                        f"Stoß {letter} screenshot missing for {cid}, {width} px")
                own.append((
                    f"Schematische Aufteilung – Stoß {letter} ({width} px), nur zur Orientierung, nicht für CNC",
                    f"Eigene {cid} Aufteilung, Stoß {letter} markiert, {width} px",
                    _png_uri(data, f"{cid} Stoß {letter}, {width} px"),
                ))
        desc = html.escape(str(case.get("note", "")), quote=True)
        file_name = html.escape(str(case.get("source", "")), quote=True)
        dims = ", ".join(f"{html.escape(str(k))}={html.escape(str(v))}" for k, v in case["dimensions"].items())
        corner = ", ".join(f"{html.escape(str(k))}={html.escape(str(v))}" for k, v in case["corners"].items())
        sections.append(f'''<section class="case">
          <header><h2>{html.escape(cid)}</h2><p>{desc}</p>
            <p class="numbers"><strong>Grundmaße (mm):</strong> {dims}</p>
            <p class="numbers"><strong>Außenecken (mm):</strong> {corner}</p>
            <p class="numbers"><strong>Bearbeitung:</strong> {html.escape(case["treatment"])}</p></header>
          <div class="pair"><figure><figcaption>Original Speedmaster – Quelle: {file_name}</figcaption>
            <img alt="Original Speedmaster {html.escape(cid)}" src="{reference}"></figure>
          <div class="previews">
            {''.join(f'<figure><figcaption>{html.escape(caption)}</figcaption><img alt="{html.escape(alt)}" src="{uri}"></figure>' for caption, alt, uri in own)}
          </div></div>
        </section>''')
    # Place non-paired supplier sources in a separate collapsible gallery.
    # Do not invent their input values, geometry agreement or CNC topology.
    gallery = ""
    unpaired = unpaired_sources if unpaired_sources is not None else []
    seen_unpaired = set()
    paired = {case["source"] for case in cases}
    figures = []
    for entry in unpaired:
        if not isinstance(entry, dict) or entry.get("source_type") != "speedmaster":
            raise ReportError("Only original Speedmaster images may enter the unmatched gallery")
        source = entry.get("path")
        if not isinstance(source, str) or not source.startswith("originals/"):
            raise ReportError("Invalid supplier gallery path")
        if source in paired or source in seen_unpaired:
            raise ReportError("Source already paired or duplicate: " + source)
        seen_unpaired.add(source)
        image_uri = _png_uri(entry.get("image"), source)
        title = html.escape(str(entry.get("description", "Speedmaster-Original")), quote=True)
        file = html.escape(source, quote=True)
        figures.append(
            '<figure><figcaption>' + title + ' <small>(' + file + ')</small></figcaption>'
            '<img alt="Ungepaarter Speedmaster-Originalbeleg ' + file + '" src="' + image_uri + '"></figure>'
        )
    if unpaired:
        gallery = (
            '<section class="unpaired"><h2>Weitere Speedmaster-Originale</h2>'
            '<p><strong>' + str(len(unpaired)) + ' weitere Originale ohne 1:1-Paarung.</strong> '
            'Diese Herstellerbilder sind bereits archiviert, aber ihre exakten Eingaben '
            'wurden bislang nicht unabhängig an einer eigenen Vorschau abgeglichen. '
            '<strong>keine Fertigungsfreigabe</strong> und keine Bestätigung für CNC, '
            'Teilplatten, Verbinder, Preise oder U1–U4-Grundrisse.</p>'
            '<details><summary>Originalbilder einzeln anzeigen (' + str(len(unpaired)) + ')</summary>'
            '<div class="unpaired-grid">' + "".join(figures) + '</div></details></section>'
        )
    return '''<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Interner Speedmaster-Abgleich L1–L4</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;padding:28px;font:15px/1.5 system-ui,Arial,sans-serif;color:#183e45;background:#f2f4f2}
main{max-width:1580px;margin:auto}h1{font-size:clamp(24px,4vw,36px);margin:0 0 10px}
p{margin:6px 0 12px}section{background:white;border:1px solid #d6dedf;border-radius:16px;padding:20px;margin:25px 0}
h2{margin:0;color:#14556a;font-size:22px}.warning{padding:14px 0;border-top:1px solid #bbc7c6;border-bottom:1px solid #bbc7c6}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
figure{min-width:0;margin:0 0 18px}figcaption{font-weight:700;padding-bottom:8px;overflow-wrap:anywhere}
img{display:block;max-width:100%;height:auto;border:1px solid #d3d9da;border-radius:10px;object-fit:contain;background:#eee}
.numbers{font-size:13px;color:#385661;overflow-wrap:anywhere}.previews{display:grid;gap:8px}
.unpaired-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;padding-top:18px}
.unpaired details{margin-top:16px}.unpaired summary{cursor:pointer;font-weight:700}
.unpaired-grid figcaption{font-size:13px}.unpaired-grid small{font-size:11px;font-weight:400;overflow-wrap:anywhere}
@media(max-width:850px){body{padding:12px}.pair{grid-template-columns:1fr}section{padding:12px}}
</style></head><body><main>
<h1>Speedmaster / L1–L4 – interner Sichtvergleich</h1>
<p>GitHub-Commit: ''' + html.escape(str(commit)) + '''. Alle Bilder sind in dieser HTML-Datei eingebettet. Keine Netzwerkverbindungen nötig.</p>
<p class="warning"><strong>Keine automatische Herstellerfreigabe.</strong> Der Bericht zeigt dokumentierte Beispielwerte und dazu erzeugte Vorschauen. Stoß A/B und die eingefärbten Bereiche sind reine eigene Planungsgrafiken, keine echten Fertigungs- oder Lieferstücke. Die Übereinstimmung der Eingabewerte, Geometrie, Teilung, Verbinder, Kanten und Bemaßung muss anhand der Originalbilder weiterhin manuell geprüft werden. Die L/U-Produkte bleiben nicht bestellbar.</p>
''' + "\n".join(sections) + gallery + '''</main></body></html>'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist/l-reference-report.html")
    parser.add_argument("--archive", type=Path, default=DEFAULT_ARCHIVE)
    parser.add_argument("--commit", default="local-unversioned")
    args = parser.parse_args()
    config = json.loads(DEFAULT_FIXTURE.read_text(encoding="utf-8"))
    if config.get("scope") != "PRIVATE-AUDIT-ONLY":
        raise ReportError("Only private visual audits are permitted")
    rows = source_rows(ROOT / REFERENCE_RELATIVE)
    cases = validate_cases(config["cases"], rows)
    data = inspect_archive(args.archive, rows)  # verifies all 60 supplier/UI hashes
    extra_rows = list_unpaired_originals(rows, cases)
    with zipfile.ZipFile(io.BytesIO(data)) as zip_file:
        images = {case["id"]: zip_file.read(ARCHIVE_PREFIX + case["source"]) for case in cases}
        unpaired_sources = [
            {**row, "image": zip_file.read(ARCHIVE_PREFIX + row["path"])}
            for row in extra_rows
        ]
    previews = {}
    for case in cases:
        illustrated_seam_count = 1 if case["id"] in ("L1", "L2") else 2
        for width in (1366, 390):
            filename = ROOT / "dist" / f"l-review-{case['id']}-{width}.png"
            if not filename.is_file():
                raise ReportError(f"{width} px Draufsicht missing: {filename}")
            previews[(case["id"], width)] = filename.read_bytes()
            for seam_number in range(1, illustrated_seam_count + 1):
                seam_file = ROOT / "dist" / f"l-review-{case['id']}-{width}-seam-{seam_number}.png"
                if not seam_file.is_file():
                    raise ReportError(f"Stoß {chr(ord('A') + seam_number - 1)} screenshot missing: {seam_file}")
                previews[(case["id"], width, f"seam-{seam_number}")] = seam_file.read_bytes()
    content = render_report(cases, images, previews, commit=args.commit,
                            unpaired_sources=unpaired_sources)
    output = args.output.resolve()
    # The report must never be placed inside the installable WordPress assets.
    plugin_dir = (ROOT / "wordpress/hpz-apl-admin-preview").resolve()
    if output == plugin_dir or plugin_dir in output.parents:
        raise ReportError("Supplier screenshots MUST NOT enter WordPress distributions")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")
    print(f"PASS: {len(cases)} paired supplier sources + {len(unpaired_sources)} unpaired original Speedmaster images, 2 preview widths, PRIVATE offline HTML: {output}")


if __name__ == "__main__":
    try:
        main()
    except (ReportError, ValueError, OSError, zipfile.BadZipFile, KeyError, json.JSONDecodeError) as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        sys.exit(1)
