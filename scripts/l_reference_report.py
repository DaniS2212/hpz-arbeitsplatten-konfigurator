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


def _png_uri(data, label):
    if not isinstance(data, bytes) or not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ReportError("Invalid or missing PNG: " + label)
    return "data:image/png;base64," + base64.b64encode(data).decode("ascii")


def render_report(cases, source_images, previews, commit):
    sections = []
    for case in cases:
        cid = case["id"]
        if cid not in source_images:
            raise ReportError("Original Speedmaster PNG missing: " + cid)
        reference = _png_uri(source_images[cid], "Original " + cid)
        own = []
        for width in (1366, 390):
            data = previews.get((cid, width))
            if data is None:
                raise ReportError(str(width) + " px local preview missing for " + cid)
            own.append((width, _png_uri(data, cid + " " + str(width))))
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
            {''.join(f'<figure><figcaption>Eigene Admin-Vorschau {width} px</figcaption><img alt="Eigene {html.escape(cid)} Vorschau {width} px" src="{uri}"></figure>' for width, uri in own)}
          </div></div>
        </section>''')
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
@media(max-width:850px){body{padding:12px}.pair{grid-template-columns:1fr}section{padding:12px}}
</style></head><body><main>
<h1>Speedmaster / L1–L4 – interner Sichtvergleich</h1>
<p>GitHub-Commit: ''' + html.escape(str(commit)) + '''. Alle Bilder sind in dieser HTML-Datei eingebettet. Keine Netzwerkverbindungen nötig.</p>
<p class="warning"><strong>Keine automatische Herstellerfreigabe.</strong> Der Bericht zeigt dokumentierte Beispielwerte und dazu erzeugte Vorschauen. Die Übereinstimmung der Eingabewerte, Geometrie, Teilung, Verbinder, Kanten und Bemaßung muss anhand der Originalbilder weiterhin manuell geprüft werden. Die L/U-Produkte bleiben nicht bestellbar.</p>
''' + "\n".join(sections) + '''</main></body></html>'''


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
    with zipfile.ZipFile(io.BytesIO(data)) as zip_file:
        images = {case["id"]: zip_file.read(ARCHIVE_PREFIX + case["source"]) for case in cases}
    previews = {}
    for case in cases:
        for width in (1366, 390):
            filename = ROOT / "dist" / f"l-review-{case['id']}-{width}.png"
            if not filename.is_file():
                raise ReportError(f"{width} px preview missing: {filename}")
            previews[(case["id"], width)] = filename.read_bytes()
    content = render_report(cases, images, previews, commit=args.commit)
    output = args.output.resolve()
    # The report must never be placed inside the installable WordPress assets.
    plugin_dir = (ROOT / "wordpress/hpz-apl-admin-preview").resolve()
    if output == plugin_dir or plugin_dir in output.parents:
        raise ReportError("Supplier screenshots MUST NOT enter WordPress distributions")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")
    print(f"PASS: {len(cases)} verified supplier original screenshots + 2 preview widths in offline PRIVATE report: {output}")


if __name__ == "__main__":
    try:
        main()
    except (ReportError, ValueError, OSError, zipfile.BadZipFile, KeyError, json.JSONDecodeError) as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        sys.exit(1)
