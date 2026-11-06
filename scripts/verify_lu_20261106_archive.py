#!/usr/bin/env python3
"""Verify exact user-supplied L1/U1 price and UI PNGs archived in private GitHub.

Before the manual binary upload, --require intentionally exits non-zero.
Source manifest alone is NEVER proof that the original images are archived.
"""
import argparse
import csv
import hashlib
import io
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'docs/references/speedmaster-lu'
FILENAME = 'Speedmaster_L1_U1_2250_UI_20261106_Originale.zip'
EXPECTED_SHA256 = 'e8f5fc1aef4947f642089f4f46c4947e7b95e1a83ad0474b51869ecc011f1531'
EXPECTED_BLOB_SHA1 = '3d1af1ea00d426a5456e97142d40111491911efd'
EXPECTED_BYTES = 1059629
EXPECTED_COUNT = 4

def verify(archive_path: Path, manifest_path: Path) -> str:
    data = archive_path.read_bytes()
    assert len(data) == EXPECTED_BYTES, f'ZIP byte length drift: {len(data)}'
    assert hashlib.sha256(data).hexdigest() == EXPECTED_SHA256, 'ZIP SHA256 drift'
    blob = hashlib.sha1(f'blob {len(data)}\0'.encode('ascii')+data).hexdigest()
    assert blob == EXPECTED_BLOB_SHA1, 'ZIP Git blob SHA1 drift'
    manifest = manifest_path.read_bytes()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        assert z.testzip() is None, 'ZIP CRC failed'
        assert z.read('SOURCE_MANIFEST.csv') == manifest, 'Committed manifest differs from source ZIP'
        rows = list(csv.DictReader(io.StringIO(manifest.decode('utf-8'))))
        assert len(rows) == EXPECTED_COUNT, 'Expected four screenshot manifest rows'
        expected_files = {'README.txt', 'SOURCE_MANIFEST.csv'}
        for row in rows:
            name = row['archive_path']
            expected_files.add(name)
            assert name.startswith('originals/'), 'Unexpected ZIP member path'
            assert name.endswith('.png'), 'Expected original PNG'
            img = z.read(name)
            assert img[:8] == b'\x89PNG\r\n\x1a\n', f'Invalid PNG: {name}'
            assert len(img) == int(row['bytes']), f'PNG byte size mismatch: {name}'
            assert hashlib.sha256(img).hexdigest() == row['sha256'], f'PNG SHA mismatch: {name}'
            width = int.from_bytes(img[16:20], 'big')
            height = int.from_bytes(img[20:24], 'big')
            assert (width,height) == (int(row['width_px']),int(row['height_px'])), \
                f'PNG dimension mismatch: {name}'
        assert set(z.namelist()) == expected_files, 'Unexpected/missing ZIP files'
        assert {r['variant'] for r in rows} == {'L1','U1','L4','Gerade'}
    return 'PASS: four original supplier/UI PNGs, all SHA256 hashes, ZIP SHA256 and Git blob ID match.'

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require', action='store_true')
    parser.add_argument('--archive', type=Path, default=DIR/FILENAME)
    parser.add_argument('--manifest', type=Path, default=DIR/'L1_U1_2250_SOURCE_MANIFEST.csv')
    args=parser.parse_args()
    if not args.archive.exists():
        print('PENDING: Original binary ZIP not in GitHub; upload unchanged ZIP on PR branch.')
        return 1 if args.require else 0
    try:
        print(verify(args.archive,args.manifest))
        return 0
    except (AssertionError, OSError, ValueError, KeyError, zipfile.BadZipFile) as e:
        print('FAIL: Supplier original screenshot archive differs: '+str(e),file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())
