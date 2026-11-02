#!/usr/bin/env python3
"""Verify and import the original Speedmaster reference screenshots.

Usage (from a clone of the GitHub repository):
  python scripts/import_speedmaster_reference_zip.py check-zip docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip
  python scripts/import_speedmaster_reference_zip.py import docs/references/speedmaster-lu/Speedmaster_PR39_GitHub_Upload.zip
  python scripts/import_speedmaster_reference_zip.py verify-tree

This is a documentation-only importer; it never modifies the shop plugin.
"""
import argparse
import csv
import hashlib
import io
import sys
import zipfile
from pathlib import Path, PurePosixPath

ARCHIVE_PREFIX = "speedmaster-reference-20261102/"
EXPECTED_ZIP_SHA256 = "c32267e1dba0b8374f3215002b1505675b364a589d3128954feba5db34b4f9eb"
EXPECTED_BLOCKS = {"01": 1, "02": 17, "03": 14, "04": 9, "05": 3, "06": 16}
REFERENCE_RELATIVE = Path("docs/references/speedmaster-lu")
OTHER_ARCHIVE_FILES = {
    "README.md",
    "CHAT-ENTSCHEIDUNGEN.md",
    "manifest.csv",
    "source-notes/Arbeitsplatten.txt",
    "source-notes/Eingefügter Text(6).txt",
}


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def source_rows(reference_dir):
    manifest = reference_dir / "SOURCE_MANIFEST.csv"
    with manifest.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if len(rows) != 60:
        raise ValueError(f"expected 60 PNG entries; found {len(rows)}")
    counts = {block: 0 for block in EXPECTED_BLOCKS}
    names = set()
    for row in rows:
        block = row["block"]
        if block not in counts:
            raise ValueError(f"unexpected block: {block}")
        counts[block] += 1
        name = row["path"]
        p = PurePosixPath(name)
        if (p.is_absolute() or ".." in p.parts or len(p.parts) != 3
                or p.parts[0] != "originals" or p.parts[1] != f"block-{block}"
                or p.name != row["original_filename"] or p.suffix.lower() != ".png"):
            raise ValueError(f"unsafe or inconsistent path: {name}")
        if name in names:
            raise ValueError(f"duplicate image path: {name}")
        names.add(name)
        if len(row["sha256"]) != 64 or not all(ch in "0123456789abcdef" for ch in row["sha256"]):
            raise ValueError(f"bad SHA-256 for {name}")
        if row["source_type"] not in ("speedmaster", "shop-ui"):
            raise ValueError(f"unexpected source type for {name}")
    if counts != EXPECTED_BLOCKS:
        raise ValueError(f"incorrect block counts: {counts}")
    if sum(r["source_type"] == "speedmaster" for r in rows) != 48:
        raise ValueError("expected exactly 48 Speedmaster screenshots")
    if sum(r["source_type"] == "shop-ui" for r in rows) != 12:
        raise ValueError("expected exactly 12 shop/UX screenshots")
    return rows


def inspect_archive(archive_path, rows):
    data = archive_path.read_bytes()
    digest = sha256(data)
    if digest != EXPECTED_ZIP_SHA256:
        raise ValueError(f"wrong archive SHA-256: {digest}")
    with zipfile.ZipFile(io.BytesIO(data), "r") as z:
        found = set()
        for info in z.infolist():
            if info.is_dir():
                continue
            if not info.filename.startswith(ARCHIVE_PREFIX):
                raise ValueError(f"unexpected archive prefix: {info.filename}")
            relative = info.filename[len(ARCHIVE_PREFIX):]
            if relative in found or not relative or ".." in PurePosixPath(relative).parts:
                raise ValueError(f"duplicate or unsafe archive member: {relative}")
            if ((info.external_attr >> 16) & 0o170000) == 0o120000:
                raise ValueError(f"symlink not allowed: {relative}")
            found.add(relative)
        expected = OTHER_ARCHIVE_FILES | {row["path"] for row in rows}
        if found != expected:
            raise ValueError(f"archive contents mismatch: missing={sorted(expected-found)}; extra={sorted(found-expected)}")
        for row in rows:
            image = z.read(ARCHIVE_PREFIX + row["path"])
            if len(image) != int(row["size_bytes"]):
                raise ValueError(f"size mismatch: {row['path']}")
            if sha256(image) != row["sha256"]:
                raise ValueError(f"image checksum mismatch: {row['path']}")
        if z.testzip() is not None:
            raise ValueError("ZIP CRC error")
    return data


def verify_tree(reference_dir, rows):
    for row in rows:
        target = reference_dir / row["path"]
        if not target.is_file():
            raise FileNotFoundError(f"missing original screenshot: {target}")
        if sha256(target.read_bytes()) != row["sha256"]:
            raise ValueError(f"stored original differs from source: {target}")
    print(f"PASS: {len(rows)} original PNG files, every SHA-256 matches the source manifest")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("check-zip", "import", "verify-tree"))
    parser.add_argument("archive", nargs="?", type=Path)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    reference_dir = args.repo_root / REFERENCE_RELATIVE
    rows = source_rows(reference_dir)
    if args.action == "verify-tree":
        verify_tree(reference_dir, rows)
        return
    if args.archive is None:
        parser.error("check-zip and import require an archive path")
    archive_data = inspect_archive(args.archive, rows)
    print(f"PASS: ZIP SHA-256, ZIP CRC and {len(rows)} source image hashes verified")
    if args.action == "import":
        with zipfile.ZipFile(io.BytesIO(archive_data)) as z:
            for row in rows:
                path = reference_dir / row["path"]
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(z.read(ARCHIVE_PREFIX + row["path"]))
        verify_tree(reference_dir, rows)
        print("Source PNG files are now on disk. Commit and push them on the PR branch, then verify GitHub filenames.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, FileNotFoundError, zipfile.BadZipFile, OSError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
