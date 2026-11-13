# L1–L4 illustrated selection cards (Nov 13, 2026)

The existing L configuration previously exposed only a native select for L1–L4.
It now offers four **compact illustrated radio cards in a 2x2 grid**, matching
the already-released U1–U4 chooser without crowding the separate corner controls.

- L1: Schenkel links
- L2: Schenkel rechts
- L3: Diagonale innen
- L4: Innen und außen diagonal

Simple SVG icons use the existing silhouette structure of
`lGeometry()` (square-left, mirrored-right, inner 45-degree cut,
and combined inner/outer cut). Orange diagonal strokes highlight a
**contour difference**, not a proven Speedmaster machining seam or CNC cut.

The existing `select#geometry` remains in the DOM, accessible to
the established programmatic path but visually hidden from the customer.
Cards are native radio inputs with an accessible `radiogroup`. Their
change listener selects an existing option and dispatches precisely the
same change event. That event already updates dimensions, corner inputs,
summary, price quote and the signed Woo checkout data. No new sale logic.

Desktop and mobile widths use a two-column tile layout; L has slightly
more compact cards than U to keep external corner selection visible
immediately below the chooser. Existing U and straight UIs unchanged.

A Playwright test in the WordPress release smoke exercises all four
cards in a real packaged preview at 1366px and 390px, selection state,
native-geometry synchronization, corners, signed-cart lock and overflow.
The plugin build remains deterministic from canonical `local/` and
`design/` assets.

L/U are still draft-only and not publicly purchasable. No order, payment,
shipping rate, discount, supplier order or production metadata changed.
