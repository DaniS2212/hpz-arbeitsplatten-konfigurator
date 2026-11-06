# L/U shop ratebook draft – 6 November 2026

## Operator decision
The owner explicitly chose **configured geometry** instead of real cut pieces as the inbound freight threshold: EUR 10 net baseline + **one** EUR 50 net surcharge if **any configured L-axis L1/L2/L3 >=1900 mm**. At 1899 mm the surcharge is zero; at 1900 mm exactly it applies. This is an **internal acquisition-cost component of the V3 product price**, NOT a newly added customer-facing Woo shipping fee. Woo still computes customer shipping separately. It may not be added twice.

Actual manufacturing cut lists, physical parcel dimensions and connector CNC records are no longer mandatory for this **owner-approved ratebook route**. Existing legacy exact-proof route remains unchanged. Manual supplier ordering still requires a human to verify feasibility before buying from Speedmaster.

## Price window, expressly NOT all 16 decor colors or all combinations
- Shapes **L1 and U1**, no special corners, 1.5 mm matching outer edge, thickness 17.5 or 38 mm.
- Decors **W980** and **H1145** with operator-confirmed net anchors at L1=2000 and L1=2500 mm; exact supplier values are in `docs/references/speedmaster-lu/PRICE_EVIDENCE_CURRENT.csv`.
- Only vary L1 inside 2000–2500 mm, other dimensions remain fixed (L1: L2=1200 B1/B2=600; U1: L2=1200 L3=1800 B1/B2/B3=600).
- Intermediate values are rounded-up linear one-axis **cost candidates**, not exact Speedmaster supplier quotations. Operator must explicitly approve use of this model before selling.
- Outside window: no price quote or public buy. 14 remaining decor colors, L2–L4/U2–U4, combined dimensions, corners require separate staged coverage. No interpolated second axis or decor uplift.

## Business controls
- Pricing calculation uses existing V3: 40% initial target margin, 35% post-coupon minimum, 10% cost reserve, DE 19% VAT once, gross round-up per existing price engine.
- Readiness checks Woo server-side taxes, shipping rate, quantities, signed cart integrity and coupons. No customer JSON can approve net prices, other costs, rates or release flags.
- Private WP operator option for this preliminary prototype is `hpz_apl_lu_price_window_v1` with all fields: `model_price_approved` (true), `other_cost_net_cents` (verified total additional unit cost; MUST include packing, onward freight, payment fees and other net costs), `max_quantity`, `price_approved_on` (YYYY-MM-DD), and `approved_shipping_rate_ids` (verified live Woo shipping method IDs).
- **This PR does not set the option, does not add an admin control and does not activate any Woo product.** These must be explicitly approved after real price and checkout inspection; the separate `HPZ_APL_LU_11_AUDITED_RELEASE` constant, `hpz_apl_lu_sale_v1` operator flags, published products and existing Woo configuration still block public sales. Never populate dummy shipping rates or zero additional costs without an actual business decision.
- No supplier order is placed automatically.

## Acceptance before public activation
1. Run new PHP ratebook + 1899/1900 boundary tests and all existing GitHub tests.
2. Confirm actual Woo package/shipping selections (German checkout first), extra costs and after-coupon margin, including product price at 2000 / 2250 / 2500.
3. Admin-only dry run: customer cart, checkout, complete order metadata, manual Speedmaster handoff. Only then deliberately switch live on.

## Known limitations
The component may still render decors/forms not priced. A missing approved ratebook candidate must remain not purchasable. This pilot is not a general price function for every slider combination.