# Working instructions – Küchenarbeitsplatten-Konfigurator

**Before any L/U geometry, edge, connector, measure, price or production change:**

1. Read [the Speedmaster reference register](docs/references/speedmaster-lu/README.md), [the recorded decisions](docs/references/speedmaster-lu/DEVELOPMENT_CONTEXT.md), and [the open supplier evidence](docs/references/speedmaster-lu/EVIDENCE_GAPS.md). Use the already checked-in technical assertions in `docs/l-speedmaster-screenshot-evidence-20261102.md` and `docs/l-speedmaster-visual-parity-20261102.md`.
2. Inspect the original Speedmaster screenshots in the separate source archive `docs/references/speedmaster-lu/Speedmaster-Referenzarchiv-2026-11-02.zip` **if present**. The image file names and types are indexed in `IMAGE_MANIFEST.csv`; do not treat our own shop preview screenshots as supplier references. **If the archive is absent, do not claim a screenshot-based visual sign-off.**
3. Treat confirmations, visual observations, inferred geometry, and missing supplier information as four distinct evidence categories. Every new shape/feature must be proven with source configuration + independent geometric/browser test + manual comparison. A passed test of our own model does not prove actual supplier manufacture.
4. Never infer CNC operations, connector counts, cut-piece dimensions, shipping package counts, prices or supplier limits from illustrations alone.
5. The **straight countertop (Gerade)** is the established UI/design template and has a separate live WooCommerce sales path; do not change that behavior as part of L/U previews. Keep L/U in non-purchasable test mode until explicit approval and supplier/checkout evidence.
6. Any behavior change follows a failing test, minimal fix, then full relevant test and WordPress bundle check. Do not publish or merge without explicit user approval.
7. Design rule: identical cards, type, step navigation, surfaces, mobile UX and summaries to Gerade; only form-specific geometry/fields differ. Preserve L's larger visual preview and active-dimension highlight when sound.

**Status (02 Nov 2026):** PR #36 (illustrative seams A/B) and PR #37 (four genuine L1 EK references, no public prices) were merged. L1–L4 manufacturing data and L2–L4 prices remain unverified.

This instruction file and the text register may be merged before the image archive is checked in, but their presence alone never establishes that the original images are stored in GitHub.
