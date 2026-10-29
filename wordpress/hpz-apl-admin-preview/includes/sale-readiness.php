<?php
/**
 * Straight-worktop production / checkout readiness contract.
 *
 * IMPORTANT: intentionally NO WordPress hooks, endpoints, side effects,
 * purchasing flags or auto-approval. All proofs are trusted SERVER data.
 * Browser input must NEVER supply supplier costs, shipping proof or approval.
 * The approval is for manual review, not a sale authorization.
 */
declare(strict_types=1);

final class HPZ_APL_Straight_Sale_Readiness
{
    public const VERSION = 'straight-sale-check-v1';
    public const ID = 1000083;
    public const SKU = 'HPZ-APL-GERADE-2026';
    public const MAX_EVIDENCE_AGE_DAYS = 30;

    /** Deterministic, quantity-independent identity for the exact worktop. */
    public static function configurationKey(array $normalized): string
    {
        if (($normalized['product'] ?? null) !== 'straight'
            || ($normalized['schemaVersion'] ?? null) !== 2
            || ($normalized['unit'] ?? null) !== 'mm'
            || ($normalized['geometry'] ?? null) !== 'straight') {
            throw new InvalidArgumentException('Only normalized straight/mm configuration is supported.');
        }
        // The already-normalized V3 validator also protects materials, dimensions,
        // decor IDs and the exact corner schema. This is not a shipping approval.
        HPZ_APL_Price_V3::quote($normalized);
        $p = $normalized['straightCorner'];
        $fields = [];
        foreach (['R1','R2','L2','B2','L3','B3'] as $field) {
            if (array_key_exists($field, $p['parameters'])) {
                $fields[$field] = $p['parameters'][$field];
            }
        }
        $key = [
            self::VERSION, self::ID, self::SKU, $normalized['material'],
            $normalized['decor'], $normalized['edge'],
            $normalized['dimensions']['L1'], $normalized['dimensions']['B1'],
            $p['side'], $p['treatment'], $fields
        ];
        return hash('sha256', json_encode($key, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    /**
     * Review readiness for one exact configuration.
     *
     * $trustedEvidence: keyed by configurationKey, constructed and stored ONLY
     * by privileged, independently verified server workflows. NEVER by request
     * payload, query parameters, browser price quote, cookie or Store API body.
     *
     * $checkout: trusted Woo-derived situation (tax/address/rate/real net).
     * This pure function never claims a product is purchasable.
     */
    public static function review(
        array $raw,
        array $trustedEvidence = [],
        array $checkout = [],
        ?int $now = null
    ): array {
        $c = HPZ_APL_Price_Preview::normalize($raw);
        $quote = HPZ_APL_Price_V3::quote($c);
        $key = self::configurationKey($c);
        $blocked = [];
        $record = $trustedEvidence[$key] ?? null;
        $supplierOkay = false;
        $shippingOkay = false;
        $invoiceOkay = false;
        $costCents = null;
        $partLengths = null;

        if (!is_array($record) || !self::proofHasRequiredFields($record, $key, $c, $now ?? time())) {
            $blocked[] = 'supplier-proof-missing-or-expired';
        } else {
            $supplierOkay = true;
            $costCents = $record['supplierNetCents'];
            $partLengths = $record['shippingPartLengthsMm'];
        }

        // Explicitly scoped initial market. An EU, CH or other destination
        // requires a separate verified tax/shipping release plan.
        if (($checkout['country'] ?? null) !== 'DE') {
            $blocked[] = 'destination-not-released';
        }
        if (($checkout['taxVerified'] ?? null) !== true
            || ($checkout['baseTaxRateBasisPoints'] ?? null) !== 1900
            || ($checkout['pricesConfigured'] ?? null) !== true) {
            $blocked[] = 'woocommerce-tax-context-unverified';
        }
        if ($supplierOkay) {
            if (($checkout['shippingCalculated'] ?? null) !== true
                || !is_string($checkout['selectedShippingRateId'] ?? null)
                || !in_array($checkout['selectedShippingRateId'], $record['approvedShippingRateIds'], true)
                || !is_int($checkout['shippingAmountCents'] ?? null)
                || $checkout['shippingAmountCents'] < 0) {
                $blocked[] = 'weight-and-customer-shipping-unverified';
            } else {
                $shippingOkay = true;
            }
            if ($c['quantity'] > $record['maxQuantity']) {
                $blocked[] = 'supplier-quantity-not-confirmed';
            }
        } else {
            $blocked[] = 'weight-and-customer-shipping-unverified';
        }

        $grossExpected = $quote['totalGrossReferenceCents'];
        $grossActual = $checkout['preDiscountGrossCents'] ?? null;
        $netActual = $checkout['actualNetLineRevenueCents'] ?? null;
        if (!is_int($grossActual) || $grossActual !== $grossExpected
            || !is_int($netActual) || $netActual <= 0
            || $netActual > $grossExpected) {
            $blocked[] = 'woocommerce-line-price-not-verified';
        } else {
            $invoiceOkay = true;
        }

        if ($supplierOkay && $invoiceOkay) {
            // Quantity always multiplies BOTH supplier costs and inbound
            // charges. No customer-controlled supplier values reach this gate.
            $inboundPerPiece = HPZ_APL_Price_V3::inboundCostForVerifiedParts($partLengths);
            $margin = HPZ_APL_Price_V3::checkNetMargin(
                $costCents * $c['quantity'],
                $inboundPerPiece * $c['quantity'],
                $netActual
            );
            if (!$margin['passesMinimum35']) {
                $blocked[] = 'margin-below-35-after-reserve-and-discounts';
            }
        } else {
            $blocked[] = 'supplier-margin-check-incomplete';
        }

        if (($checkout['checkoutIntegrationVerified'] ?? null) !== true) {
            $blocked[] = 'woocommerce-checkout-integration-not-verified';
        }
        if (($checkout['fulfilmentWorkflowVerified'] ?? null) !== true) {
            $blocked[] = 'fulfilment-handoff-not-verified';
        }
        // Guarding the LAST edge: even a complete synthetic test fixture
        // cannot unlock the WooCommerce product. This class has NO sale hooks.
        return [
            'ruleVersion' => self::VERSION,
            'configurationKey' => $key,
            'status' => count($blocked) === 0 ? 'manual-release-review-ready' : 'blocked',
            'preflightComplete' => count($blocked) === 0,
            'purchasable' => false,
            'blockers' => array_values(array_unique($blocked)),
            'unitGrossReferenceCents' => $quote['unitGrossReferenceCents'],
            'totalGrossReferenceCents' => $grossExpected,
            'quantity' => $c['quantity'],
            'production' => self::productionRecord($c),
        ];
    }

    /**
     * Exact supplier approval, cost, pieces and PACKED freight data.
     * Not sourced from the old EK research table: that table has no live
     * manufacturing approval or verified packaged weight.
     */
    private static function proofHasRequiredFields(array $p, string $key, array $c, int $now): bool
    {
        if (($p['configurationKey'] ?? null) !== $key
            || ($p['supplier'] ?? null) !== 'speedmaster'
            || ($p['manufacturable'] ?? null) !== true
            || ($p['materialAndDecorAvailable'] ?? null) !== true
            || !is_string($p['supplierReference'] ?? null)
            || strlen(trim($p['supplierReference'])) < 4
            || strlen($p['supplierReference']) > 128
            || !is_int($p['supplierNetCents'] ?? null)
            || $p['supplierNetCents'] < 1
            || !is_int($p['maxQuantity'] ?? null) || $p['maxQuantity'] < 1
            || !is_string($p['checkedOn'] ?? null)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $p['checkedOn'])) return false;
        $verified = DateTimeImmutable::createFromFormat('!Y-m-d', $p['checkedOn'], new DateTimeZone('UTC'));
        if (!$verified || $verified->format('Y-m-d') !== $p['checkedOn']) return false;
        $timestamp = $verified->getTimestamp();
        if ($timestamp > $now || $now - $timestamp > self::MAX_EVIDENCE_AGE_DAYS * 86400) return false;

        $parts = $p['shippingPartLengthsMm'] ?? null;
        if (!is_array($parts) || count($parts) !== 1
            || !is_int($parts[0]) || $parts[0] !== $c['dimensions']['L1']) return false;
        // This launch path only knows a single-piece STRAIGHT plate.
        // Never invent a split to understate the 1900-mm inbound surcharge.
        if (!is_int($p['packedWeightGrams'] ?? null)
            || $p['packedWeightGrams'] < 100 || $p['packedWeightGrams'] > 250000) return false;
        $box = $p['packageDimensionsMm'] ?? null;
        if (!is_array($box) || array_keys($box) !== ['length','width','height']
            || !is_int($box['length']) || !is_int($box['width']) || !is_int($box['height'])
            || $box['length'] < $c['dimensions']['L1']
            || $box['width'] < $c['dimensions']['B1']
            || $box['height'] < ($c['material'] === 'APL38' ? 38 : 18)
            || max($box) > 100000) return false;

        $allowed = $p['approvedShippingRateIds'] ?? null;
        if (!is_array($allowed) || count($allowed) < 1 || count($allowed) > 12) return false;
        foreach ($allowed as $id) {
            if (!is_string($id) || !preg_match('/^[A-Za-z0-9_:-]{3,64}$/D', $id)) return false;
        }
        return true;
    }

    /** Customer/production payload, without EK, margin, costs or approval flags. */
    public static function productionRecord(array $c): array
    {
        $decor = HPZ_APL_Decor_Catalog::resolve($c['decor']);
        if (!$decor) throw new InvalidArgumentException('Unknown decor.');
        $params = $c['straightCorner']['parameters'];
        $ordered = [];
        foreach (['R1','R2','L2','B2','L3','B3'] as $field) {
            if (isset($params[$field])) $ordered[$field] = $params[$field];
        }
        return [
            'schemaVersion' => 2,
            'unit' => 'mm',
            'form' => 'Gerade',
            'productId' => self::ID,
            'sku' => self::SKU,
            'lengthMm' => $c['dimensions']['L1'],
            'depthMm' => $c['dimensions']['B1'],
            'thicknessMm' => $c['material'] === 'APL38' ? 38 : 17.5,
            'materialCode' => $c['material'],
            'decorId' => $decor['id'],
            'decorName' => $decor['displayName'],
            'supplierDecorCode' => $decor['supplierCode'],
            'edge' => '1,5 mm dekorgleich',
            'cornerSide' => $c['straightCorner']['side'],
            'cornerTreatment' => $c['straightCorner']['treatment'],
            'cornerMeasuresMm' => $ordered,
            'quantity' => $c['quantity'],
            'priceRule' => HPZ_APL_Price_V3::VERSION,
        ];
    }
}
