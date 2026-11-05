"""TDD for the private, offline Speedmaster visual review artifact."""
import csv
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from l_reference_report import ReportError, validate_cases, render_report, list_unpaired_originals

FIXTURE = ROOT / "docs/references/speedmaster-lu/REVIEW_CASES.json"
MANIFEST = ROOT / "docs/references/speedmaster-lu/SOURCE_MANIFEST.csv"
PNG = b"\x89PNG\r\n\x1a\n" + b"test-only"


def complete_previews(cid):
    """One plan and each documented illustrative seam per screen width."""
    seams = (1,) if cid in ("L1", "L2") else (1, 2)
    result = {(cid, width): PNG for width in (1366, 390)}
    result.update({(cid, width, f"seam-{n}"): PNG for width in (1366, 390) for n in seams})
    return result


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
                             complete_previews(case["id"]),
                             "abc123")
        self.assertEqual(html.count("data:image/png;base64,"), 5)
        self.assertIn("Keine automatische Herstellerfreigabe", html)
        self.assertIn("L1", html)
        self.assertNotIn("<script", html)
        self.assertNotIn('src="https://', html)
        self.assertIn("390 px", html)
        self.assertIn("1366 px", html)

    def test_report_fails_if_supplier_or_preview_file_is_missing(self):
        case = self.cases[0]
        with self.assertRaisesRegex(ReportError, "Original"):
            render_report([case], {}, complete_previews(case["id"]), "a")
        with self.assertRaisesRegex(ReportError, "390"):
            render_report([case], {case["id"]: PNG},
                          {(case["id"], 1366): PNG, (case["id"], 1366, "seam-1"): PNG}, "a")

    def test_report_escapes_description_and_keeps_original_image_content_separate(self):
        case = dict(self.cases[0], note="<script>alert(1)</script>")
        html = render_report([case], {case["id"]: PNG},
                             complete_previews(case["id"]),
                             "a")
        self.assertIn("&lt;script&gt;", html)
        self.assertNotIn("<script>", html)


    # The PR32/45/46 illustrative part and seam views must be reviewable
    # beside the *independently archived* supplier shot. A green regression
    # cannot turn these own screenshots into manufacturer's originals.
    def test_L1_L2_offline_board_includes_draufsicht_and_stoss_A_at_both_widths(self):
        for case in self.cases[:2]:
            cid = case["id"]
            previews = {(cid, width): PNG for width in (1366, 390)}
            previews.update({(cid, width, "seam-1"): PNG for width in (1366, 390)})
            markup = render_report([case], {cid: PNG}, previews, "abc123")
            self.assertEqual(markup.count("data:image/png;base64,"), 5, cid)
            self.assertEqual(markup.count("Schematische Aufteilung – Stoß A"), 2, cid)
            self.assertNotIn("Stoß B markiert", markup)
            self.assertIn("nicht für CNC", markup)
            self.assertNotIn("<script", markup)
            self.assertNotIn('src="https://', markup)

    def test_L3_L4_offline_board_includes_both_individual_seam_selections(self):
        for case in self.cases[2:]:
            cid = case["id"]
            previews = {(cid, width): PNG for width in (1366, 390)}
            previews.update({(cid, width, seam): PNG
                             for width in (1366, 390)
                             for seam in ("seam-1", "seam-2")})
            markup = render_report([case], {cid: PNG}, previews, "abc123")
            self.assertEqual(markup.count("data:image/png;base64,"), 7, cid)
            self.assertEqual(markup.count("Schematische Aufteilung – Stoß A"), 2, cid)
            self.assertEqual(markup.count("Schematische Aufteilung – Stoß B"), 2, cid)
            self.assertEqual(markup.count("Original Speedmaster"), 2, cid)
            self.assertIn("keine echten Fertigungs- oder Lieferstücke", markup)

    def test_offline_board_never_silently_omits_a_required_seam_screenshot(self):
        case = self.cases[2]  # L3 requires A and B
        cid = case["id"]
        previews = {(cid, width): PNG for width in (1366, 390)}
        previews.update({(cid, width, "seam-1"): PNG for width in (1366, 390)})
        previews[(cid, 1366, "seam-2")] = PNG
        with self.assertRaisesRegex(ReportError, "Stoß B"):
            render_report([case], {cid: PNG}, previews, "abc123")

    def test_unpaired_originals_cover_entire_verified_supplier_archive_without_shop_ui(self):
        unmatched = list_unpaired_originals(self.rows, self.cases)
        self.assertEqual(sum(row["source_type"] == "speedmaster" for row in self.rows), 48)
        self.assertEqual(len(unmatched), 44, "Four matched examples leave 44 supplier originals")
        matched = {case["source"] for case in self.cases}
        self.assertTrue(all(row["source_type"] == "speedmaster" for row in unmatched))
        self.assertFalse(any(row["path"] in matched for row in unmatched))
        self.assertEqual(len({row["path"] for row in unmatched}), 44)
        self.assertTrue(any("U1" in row["description"] for row in unmatched),
                        "Supplier Grundformkarten remain available, NOT a proven U geometry")

    def test_unpaired_gallery_embeds_remaining_supplier_originals_offline_not_shop_images(self):
        case = self.cases[0]
        unmatched = list_unpaired_originals(self.rows, self.cases)[:2]
        evidence = [{**row, "image": PNG} for row in unmatched]
        document = render_report([case], {case["id"]: PNG},
                                 complete_previews(case["id"]), "abc123",
                                 unpaired_sources=evidence)
        self.assertIn("Weitere Speedmaster-Originale", document)
        self.assertIn("2 weitere Originale ohne", document)
        self.assertIn("<details", document)
        self.assertEqual(document.count("data:image/png;base64,"), 7)
        self.assertNotIn('src="https://', document)
        self.assertNotIn("<script", document)
        for row in unmatched:
            self.assertIn(row["path"], document)

    def test_unpaired_gallery_refuses_shop_ui_duplicate_source_and_invalid_png(self):
        case = self.cases[0]
        images={case["id"]: PNG}
        previews=complete_previews(case["id"])
        cases=[case]
        bad = {"source_type": "shop-ui", "path": "originals/block-01/example.png",
               "description": "Our own screenshot", "image": PNG}
        with self.assertRaisesRegex(ReportError, "Speedmaster"):
            render_report(cases, images, previews, "abc", unpaired_sources=[bad])
        duplicate = {"source_type": "speedmaster", "path": case["source"],
                     "description": "Duplicated", "image": PNG}
        with self.assertRaisesRegex(ReportError, "already paired|duplicate"):
            render_report(cases, images, previews, "abc", unpaired_sources=[duplicate])
        broken = {"source_type": "speedmaster",
                  "path": "originals/block-02/valid-unpaired.png",
                  "description": "Not PNG", "image": b"invalid"}
        with self.assertRaisesRegex(ReportError, "Invalid or missing PNG"):
            render_report(cases, images, previews, "abc", unpaired_sources=[broken])

    def test_unpaired_description_is_escaped_and_never_reclassified_as_manufacturing_proof(self):
        case=self.cases[0]
        item={"source_type":"speedmaster","path":"originals/block-02/unpaired.png",
              "description":"<script>alert('fake approval')</script>","image":PNG}
        document=render_report([case],{case["id"]:PNG},
                               complete_previews(case["id"]),"abc",
                               unpaired_sources=[item])
        self.assertIn("&lt;script&gt;",document)
        self.assertNotIn("<script>",document)
        self.assertIn("keine Fertigungsfreigabe",document.lower())

    def test_stoss_screenshot_must_be_valid_png_not_arbitrary_bytes(self):
        case = self.cases[0]
        cid = case["id"]
        previews = {(cid, width): PNG for width in (1366, 390)}
        previews.update({(cid, width, "seam-1"): PNG for width in (1366, 390)})
        previews[(cid, 390, "seam-1")] = b"not-a-png"
        with self.assertRaisesRegex(ReportError, "Stoß A"):
            render_report([case], {cid: PNG}, previews, "abc123")


if __name__ == "__main__":
    unittest.main()
