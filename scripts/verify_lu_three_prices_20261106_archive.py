#!/usr/bin/env python3
"""Check all three exact user screenshot original bytes in a private ZIP.

Before binary upload, --require intentionally exits nonzero: screenshots
catalogued by metadata alone are not permanent source archives.
"""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'docs/references/speedmaster-lu'
EXPECTED_SIZE = 1110446
EXPECTED_ZIP_SHA256 = 'a1b76dc0cbba2d4b4007be1dc1639635bfaeb7f631b2f73e7847372a6fef6d62'
EXPECTED_GIT_BLOB_SHA1 = 'deec662cfea4509eb98c0a58ad692762115da794'
ZIP = DIR / 'Speedmaster_LU_3_Preisvergleiche_20261106_Originale.zip'
MANIFEST = DIR / 'LU_3_20261106_SOURCE_MANIFEST.csv'
EVIDENCE = DIR / 'LU_THREE_PRICE_CONTROLS_20261106.json'

def verify(archive_path=ZIP):
    original = archive_path.read_bytes()
    assert len(original) == EXPECTED_SIZE, 'ZIP size mismatch'
    assert hashlib.sha256(original).hexdigest() == EXPECTED_ZIP_SHA256, 'ZIP SHA256 mismatch'
    actual_git_id = hashlib.sha1(f'blob {len(original)}\0'.encode('ascii')+original).hexdigest()
    assert actual_git_id == EXPECTED_GIT_BLOB_SHA1, 'Git blob identity mismatch'

    raw_manifest = MANIFEST.read_bytes()
    rows = list(csv.DictReader(io.StringIO(raw_manifest.decode('utf-8'))))
    assert len(rows) == 3, 'Expect exactly three screenshot entries'
    proof = json.loads(EVIDENCE.read_text('utf-8'))
    assert len(proof['cases']) == 3, 'JSON source record count drift'
    assert proof['sourceArchive']['gitBlobSha1'] == EXPECTED_GIT_BLOB_SHA1
    by_path = {entry['image']['path']: entry for entry in proof['cases']}
    expected_entries = {'README.txt', 'SOURCE_MANIFEST.csv'}

    with zipfile.ZipFile(io.BytesIO(original)) as archive:
        assert archive.testzip() is None, 'ZIP member CRC error'
        assert archive.read('SOURCE_MANIFEST.csv') == raw_manifest, 'ZIP manifest and git manifest differ'
        for row in rows:
            member = row['archive_path']
            assert member.startswith('originals/') and member.endswith('.png')
            assert member not in expected_entries, 'Duplicated archive member'
            expected_entries.add(member)
            photo = archive.read(member)
            assert photo.startswith(b'\x89PNG\r\n\x1a\n'), 'Invalid PNG'
            assert len(photo) == int(row['bytes']), f'PNG size drift: {member}'
            assert hashlib.sha256(photo).hexdigest() == row['sha256'], f'PNG SHA drift: {member}'
            width = int.from_bytes(photo[16:20], 'big')
            height = int.from_bytes(photo[20:24], 'big')
            assert (width, height) == (int(row['width_px']), int(row['height_px'])), 'PNG dimensions drift'
            evidence = by_path[member]
            assert evidence['image']['sha256'] == row['sha256'], 'JSON and CSV hash mismatch'
            assert evidence['image']['file'] == row['filename'], 'Original filename changed'
            assert evidence['displayPriceEUR'] == row['display_price_eur'], 'Displayed price changed'
        assert set(archive.namelist()) == expected_entries, 'Missing or additional archive entries'
    return 'PASS: 3/3 unchanged Speedmaster images; PNG+ZIP+Git SHA and source JSON all match.'

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--require', action='store_true')
    p.add_argument('--archive', type=Path, default=ZIP)
    args = p.parse_args()
    if not args.archive.exists():
        print('PENDING: original binary ZIP not yet in GitHub; upload it unchanged on PR branch.')
        return 1 if args.require else 0
    try:
        print(verify(args.archive))
    except (AssertionError, KeyError, OSError, ValueError, zipfile.BadZipFile) as e:
        print('FAIL: source archive verification: '+str(e), file=sys.stderr)
        return 1
    return 0

if __name__ == '__main__':
    sys.exit(main())
