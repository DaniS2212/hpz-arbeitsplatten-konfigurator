"""TDD for the private, offline Speedmaster visual review artifact."""
import csv
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from l_reference_report import ReportError, validate_cases, render_report

FIXTURE = ROOT / "docs/references/speedmaster-lu/REVIEW_CASES.json"
MANIFEST = ROOT / "docs/references/speedmaster-lu/SOURCE_MANIFEST.csv"
PNG = b"\x89PNG\r\n\x1a\n" + b"test-only"


class PrivateReferenceReportTests(unittest.TestCase):
    def setUp(self):
        self.cases = json.loads(FIXTURE.read_text(encoding="utf-8"))["cases"]
        with MANIFEST.open(encoding="utf-8-sig", newline="") as stream:
            self.rows = list(csv.DictReader(stream))

    def test_all_four_cases_resolve_to_original_speedmaster_not_shop_ui(self):
        validated = validate_cases(self.cases, self.rows)
        self.assertEqual([x["id"] for x in validated], ["L1", "L2", "L3", "L4"])
        self.assertTrue(all(x["source_type"] == "speedmaster" for x in validated))

    def test_not_allowed_to_use_shop_ui_as_supplier_reference(self):
        malicious = dict(self.cases[0], source="originals/block-01/image(20261102-113921).png")
        with self.assertRaisesRegex(ReportError, "Speedmaster"):
            validate_cases([malicious], self.rows)

    def test_report_embeds_source_and_both_preview_views_without_network_links(self):
        case = self.cases[0]
        html = render_report([case], {case["id"]: PNG},
                             {(case["id"], 1366): PNG, (case["id"], 390): PNG},
                             "abc123")
        self.assertEqual(html.count("data:image/png;base64,"), 3)
        self.assertIn("Keine automatische Herstellerfreigabe", html)
        self.assertIn("L1", html)
        self.assertNotIn("<script", html)
        self.assertNotIn('src="https://', html)
        self.assertIn("390 px", html)
        self.assertIn("1366 px", html)

    def test_report_fails_if_supplier_or_preview_file_is_missing(self):
        case = self.cases[0]
        with self.assertRaisesRegex(ReportError, "Original"):
            render_report([case], {}, {(case["id"], 1366): PNG, (case["id"], 390): PNG}, "a")
        with self.assertRaisesRegex(ReportError, "390"):
            render_report([case], {case["id"]: PNG}, {(case["id"], 1366): PNG}, "a")

    def test_report_escapes_description_and_keeps_original_image_content_separate(self):
        case = dict(self.cases[0], note="<script>alert(1)</script>")
        html = render_report([case], {case["id"]: PNG},
                             {(case["id"], 1366): PNG, (case["id"], 390): PNG},
                             "a")
        self.assertIn("&lt;script&gt;", html)
        self.assertNotIn("<script>", html)


if __name__ == "__main__":
    unittest.main()
