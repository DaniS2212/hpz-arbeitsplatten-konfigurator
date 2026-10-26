<?php
/** Read-only ID mapping. No request-supplied supplier codes, prices or approvals. */
defined('ABSPATH') || exit;

final class HPZ_APL_Decor_Catalog {
    public static function all() {
        static $catalog = null;
        if ($catalog !== null) return $catalog;
        $catalog = array();
        $file = __DIR__.'/../data/decors.json';
        if (!is_readable($file)) return $catalog;
        $data = json_decode(file_get_contents($file), true);
        if (!is_array($data) || !isset($data['items']) || !is_array($data['items']) || count($data['items']) !== 16) return $catalog;
        $rows = array();
        $codes = array();
        foreach ($data['items'] as $row) {
            if (!is_array($row)) return $catalog;
            foreach (array('id', 'supplierCode', 'displayName') as $key) {
                if (!isset($row[$key]) || !is_string($row[$key]) || $row[$key] === '') return $catalog;
            }
            if (!preg_match('/^(?:[A-Z][0-9]+|[0-9]{5})$/D', $row['id']) || isset($rows[$row['id']]) || isset($codes[$row['supplierCode']])) return $catalog;
            $rows[$row['id']] = $row;
            $codes[$row['supplierCode']] = true;
        }
        $catalog = $rows;
        return $catalog;
    }
    public static function resolve($id) {
        if (!is_string($id)) return null;
        $catalog = self::all();
        return isset($catalog[$id]) ? $catalog[$id] : null;
    }
}
