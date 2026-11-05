#!/usr/bin/env python3
"""Verify all 12 original U1-U4 Speedmaster PNGs in the private repository ZIP.

The archive must never be bundled with the public WordPress plugin.
"""
import argparse
import csv
import hashlib
import io
from pathlib import Path
import sys
import zipfile

NAME = 'Speedmaster_U1-U4_20261105_Originale.zip'
ZIP_SHA256 = '1b1caa59a791e189192eb411387daaa8236a5963f6af4384816dff0cdff9d9c9'
ZIP_BYTES = 6699368
ZIP_BLOB_SHA1 = 'b6948a55d8cebcc55fdd21069515e9b095c2635b'
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ZIP = ROOT / 'docs/references/speedmaster-lu' / NAME
DEFAULT_MANIFEST = ROOT / 'docs/references/speedmaster-lu/U_20261105_SOURCE_MANIFEST.csv'


def verify(path, manifest_path):
    data = path.read_bytes()
    assert len(data) == ZIP_BYTES, f'ZIP size mismatch: {len(data)} != {ZIP_BYTES}'
    assert hashlib.sha256(data).hexdigest() == ZIP_SHA256, 'ZIP SHA-256 differs from user source archive'
    blob_digest = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    assert blob_digest == ZIP_BLOB_SHA1, 'Git blob SHA-1 mismatch'
    expected_manifest = manifest_path.read_bytes()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        assert z.testzip() is None, 'ZIP CRC failed'
        assert z.read('SOURCE_MANIFEST.csv') == expected_manifest, 'Manifest differs from original ZIP'
        rows = list(csv.DictReader(io.StringIO(expected_manifest.decode('utf-8'))))
        assert len(rows) == 12, f'Expected 12 PNGs; found {len(rows)} rows'
        names = set(z.namelist())
        required = {'README.md', 'SOURCE_MANIFEST.csv',
                    'context/Arbeitsplatten_20261029.txt',
                    'context/LU_Altchat_Auszug_20261105.txt'}
        for case in ['U1', 'U2', 'U3', 'U4']:
            assert sum(r['variant'] == case for r in rows) == 3, f'{case} must have 3 screenshots'
        for row in rows:
            name = row['archive_path']
            assert name == f"originals/{row['variant']}/{row['original_filename']}", f'Bad path {name}'
            required.add(name)
            image = z.read(name)
            assert image[:8] == b'\x89PNG\r\n\x1a\n', f'Not PNG {name}'
            assert len(image) == int(row['bytes']), f'Size drift: {name}'
            assert hashlib.sha256(image).hexdigest() == row['sha256'], f'Image SHA-256 drift: {name}'
            width = int.from_bytes(image[16:20], 'big')
            height = int.from_bytes(image[20:24], 'big')
            assert (width, height) == (int(row['width_px']), int(row['height_px'])), f'Dimensions drift: {name}'
        assert names == required, f'Unexpected or missing ZIP entries: {sorted(names ^ required)}'
        assert z.getinfo('context/Arbeitsplatten_20261029.txt').file_size > 5000
        assert z.getinfo('context/LU_Altchat_Auszug_20261105.txt').file_size > 30000
    return 'PASS: 12/12 unchanged U1-U4 manufacturer PNGs, 2 historic text sources, manifest, ZIP SHA-256 and Git blob ID verified.'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--require', action='store_true',
                   help='Fail while the original archive has not been committed')
    p.add_argument('--archive', type=Path, default=DEFAULT_ZIP)
    p.add_argument('--manifest', type=Path, default=DEFAULT_MANIFEST)
    args = p.parse_args()
    if not args.archive.exists():
        print('PENDING: U1-U4 archive binary not in GitHub branch. Do not merge or claim archived.')
        return 1 if args.require else 0
    try:
        print(verify(args.archive, args.manifest))
        return 0
    except (AssertionError, OSError, KeyError, ValueError, zipfile.BadZipFile) as e:
        print('FAIL: U1-U4 originals do not match source: ' + str(e), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
