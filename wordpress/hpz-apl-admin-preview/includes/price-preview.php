<?php
/** Convert customer input independently and expose only safe V3 preview fields. */
defined('ABSPATH') || exit;

final class HPZ_APL_Price_Preview {
    private static function mm($value, string $label): int {
        if (!is_string($value) || !preg_match('/^[0-9]{1,6}$/D', trim($value))) {
            throw new InvalidArgumentException($label.': Bitte ganze Millimeter eingeben.');
        }
        $mm = (int)trim($value);
        if ($mm < 1 || $mm > 100000) throw new InvalidArgumentException($label.': Maß außerhalb des Prüfbereichs.');
        return $mm;
    }

    public static function normalize(array $raw): array {
        if (($raw['schemaVersion'] ?? null) !== 2 || ($raw['inputUnit'] ?? null) !== 'mm'
            || ($raw['productId'] ?? null) !== 1000083 || ($raw['sku'] ?? null) !== 'HPZ-APL-GERADE-2026'
            || ($raw['product'] ?? null) !== 'straight' || ($raw['geometry'] ?? null) !== 'straight'
            || ($raw['corner'] ?? null) !== 'square') {
            throw new InvalidArgumentException('Für dieses Produkt liegt keine V3-Preisvorschau vor.');
        }
        if (!in_array($raw['material'] ?? null, ['APL17.5','APL38'], true)) {
            throw new InvalidArgumentException('Diese Plattenstärke wird nicht berechnet.');
        }
        $decor = HPZ_APL_Decor_Catalog::resolve($raw['decor'] ?? null);
        if (!$decor) throw new InvalidArgumentException('Dieses Dekor wird nicht berechnet.');
        if (isset($raw['edge']) && $raw['edge'] !== 'matching-1.5') {
            throw new InvalidArgumentException('Nur die vorgesehene dekorgleiche Dickkante wird berechnet.');
        }
        $dim = $raw['dimensions'] ?? null;
        if (!is_array($dim) || count($dim) !== 2 || !array_key_exists('L1',$dim) || !array_key_exists('B1',$dim)) {
            throw new InvalidArgumentException('Bitte Länge und Tiefe in Millimetern angeben.');
        }
        $dimensions = ['L1'=>self::mm($dim['L1'],'Länge'), 'B1'=>self::mm($dim['B1'],'Tiefe')];
        $v = $raw['straightCorner'] ?? null;
        if (!is_array($v) || count($v) !== 3 || !array_key_exists('side',$v)
            || !array_key_exists('treatment',$v) || !array_key_exists('parameters',$v)
            || !is_array($v['parameters'])) {
            throw new InvalidArgumentException('Bitte die Eckbearbeitung prüfen.');
        }
        $side = $v['side']; $treatment = $v['treatment'];
        if (!in_array($side, ['none','left','right','both'], true)) {
            throw new InvalidArgumentException('Diese Eckseite ist nicht vorgesehen.');
        }
        $types=['round'=>'round','chamfer_square'=>'chamfer','chamfer_continuous'=>'continuous'];
        if ($side === 'none') {
            if ($treatment !== null || count($v['parameters']) !== 0) throw new InvalidArgumentException('Eckmaße ohne Bearbeitung sind nicht zulässig.');
            $keys=[]; $corner='square';
        } else {
            if (!is_string($treatment) || !isset($types[$treatment])) throw new InvalidArgumentException('Diese Eckbearbeitung ist nicht vorgesehen.');
            $corner=$types[$treatment];
            $keys=$treatment==='round'
                ? ($side==='left'?['R1']:($side==='right'?['R2']:['R1','R2']))
                : ($side==='left'?['L2','B2']:($side==='right'?['L3','B3']:['L2','B2','L3','B3']));
        }
        $actual=array_keys($v['parameters']); sort($actual);
        $expected=$keys; sort($expected);
        if ($actual !== $expected) throw new InvalidArgumentException('Die Eckmaße passen nicht zur Bearbeitung.');
        $parameters=[];
        foreach ($keys as $key) $parameters[$key]=self::mm($v['parameters'][$key],$key);
        $quantity=$raw['quantity'] ?? null;
        if (!is_int($quantity) || $quantity<1 || $quantity>1000) throw new InvalidArgumentException('Menge: Bitte eine ganze Zahl von 1 bis 1000 eingeben.');
        return [
            'schemaVersion'=>2,'unit'=>'mm','product'=>'straight','geometry'=>'straight',
            'dimensions'=>$dimensions,'edge'=>'matching-1.5','material'=>$raw['material'],
            'decor'=>$decor['id'],'straightCorner'=>['side'=>$side,'treatment'=>$treatment,'parameters'=>$parameters],
            'corner'=>$corner,'quantity'=>$quantity,
        ];
    }

    public static function publicQuote(array $raw, string $shippingCountry=''): array {
        $quote=HPZ_APL_Price_V3::quote(self::normalize($raw));
        $taxNote=$shippingCountry==='DE'
            ? 'inkl. 19 % MwSt., zzgl. Kundenversand (DE-Referenz)'
            : ($shippingCountry==='' ? 'Deutscher Brutto-Referenzpreis · Kundenversand separat'
                : 'Deutscher Brutto-Referenzpreis · Steuer und Versand für dein Lieferland offen');
        return [
            'ruleVersion'=>$quote['ruleVersion'],
            'status'=>'calculated-not-sale-approved',
            'currency'=>'EUR',
            'unitGrossReferenceCents'=>$quote['unitGrossReferenceCents'],
            'totalGrossReferenceCents'=>$quote['totalGrossReferenceCents'],
            'quantity'=>$quote['quantity'],
            'taxNote'=>$taxNote,
            'availabilityNote'=>'Unverbindliche Preisvorschau. Lieferbarkeit und Fertigungsmaße sind noch nicht bestätigt.',
            'purchasable'=>false,
        ];
    }
}
