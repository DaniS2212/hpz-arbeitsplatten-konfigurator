<?php
/**
 * Version 1.0 – Manual Speedmaster proof review screen.
 * Admin only. Never authorizes a sale by itself, never sends a supplier order.
 */
defined('ABSPATH') || exit;
final class HPZ_APL_WP_Proof_Admin_10 {
    const SLUG='hpz-apl-proofs';
    const NOTICE='hpz_apl_proof_notice_10_';
    public static function init(): void {
        add_action('admin_menu',[__CLASS__,'menu']);
        add_action('admin_post_hpz_apl_proof_save_10',[__CLASS__,'save']);
        add_action('admin_post_hpz_apl_proof_revoke_10',[__CLASS__,'revoke']);
        add_action('woocommerce_after_order_itemmeta',[__CLASS__,'orderItem'],10,3);
    }
    private static function authorize(): void {
        if (!current_user_can('manage_options') || !current_user_can('manage_woocommerce')) {
            wp_die('Keine Berechtigung.', '', ['response'=>403]);
        }
    }
    private static function rawString(array $input,string $name,int $max=300): string {
        $v=$input[$name] ?? null;
        if (!is_string($v)) throw new InvalidArgumentException('Pflichtfeld fehlt: '.$name);
        $s=trim(function_exists('wp_unslash')?wp_unslash($v):$v);
        if ($s==='' || strlen($s)>$max) throw new InvalidArgumentException('Ungültiger Wert: '.$name);
        return $s;
    }
    /** EU decimal separator, exact integer arithmetic: no floating-point EK. */
    public static function scaled(string $value,int $digits): int {
        $value=trim($value);
        if ($digits<0 || $digits>3 || !preg_match('/^([0-9]{1,7})(?:[,.]([0-9]{1,3}))?$/D',$value,$m)) {
            throw new InvalidArgumentException('Bitte einen positiven Dezimalwert ohne Tausendertrennzeichen verwenden.');
        }
        $dec=$m[2] ?? '';
        if (strlen($dec)>$digits) throw new InvalidArgumentException('Zu viele Nachkommastellen.');
        $factor=(int)pow(10,$digits);
        $number=(int)$m[1]*$factor+(int)str_pad($dec,$digits,'0');
        if ($number<=0) throw new InvalidArgumentException('Wert muss größer als null sein.');
        return $number;
    }
    public static function proofFields(array $post): array {
        return [
            'supplierReference'=>self::rawString($post,'supplier_reference',128),
            'supplierNetCents'=>(string)self::scaled(self::rawString($post,'supplier_net_eur',24),2),
            'packedWeightGrams'=>(string)self::scaled(self::rawString($post,'packed_kg',24),3),
            'packageLengthMm'=>(string)self::scaled(self::rawString($post,'pack_length_cm',24),1),
            'packageWidthMm'=>(string)self::scaled(self::rawString($post,'pack_width_cm',24),1),
            'packageHeightMm'=>(string)self::scaled(self::rawString($post,'pack_height_cm',24),1),
            'maxQuantity'=>self::rawString($post,'max_quantity',6),
            'shippingRateIds'=>self::rawString($post,'shipping_rate_ids',700),
        ];
    }
    private static function notification(string $type,string $message): void {
        set_transient(self::NOTICE.get_current_user_id(),['type'=>$type,'message'=>$message],60);
        wp_safe_redirect(admin_url('options-general.php?page='.self::SLUG));
        exit;
    }
    public static function save(): void {
        self::authorize();
        if (($_SERVER['REQUEST_METHOD']??'')!=='POST') wp_die('POST erforderlich.', '', ['response'=>405]);
        check_admin_referer('hpz_apl_supplier_proof_090');
        try {
            $json=self::rawString($_POST,'configuration_json',16384);
            $raw=json_decode($json,true);
            if (!is_array($raw) || array_values($raw)===$raw || json_last_error()!==JSON_ERROR_NONE) {
                throw new InvalidArgumentException('Bitte die kopierte Konfiguration als JSON einfügen.');
            }
            $nonce=self::rawString($_POST,'_wpnonce',200);
            $proof=HPZ_APL_WP_Supplier_Proofs_09::saveFromAdmin($raw,self::proofFields($_POST),$nonce);
            self::notification('success','Speedmaster-Freigabe gespeichert: '.$proof['decor'].' · '.$proof['lengthMm'].' × '.$proof['depthMm'].' mm.');
        } catch (Throwable $e) {
            self::notification('error',$e->getMessage());
        }
    }
    public static function revoke(): void {
        self::authorize();
        if (($_SERVER['REQUEST_METHOD']??'')!=='POST') wp_die('POST erforderlich.', '', ['response'=>405]);
        check_admin_referer('hpz_apl_supplier_proof_090');
        try {
            $key=self::rawString($_POST,'configuration_key',64);
            $nonce=self::rawString($_POST,'_wpnonce',200);
            HPZ_APL_WP_Supplier_Proofs_09::revokeFromAdmin($key,$nonce);
            self::notification('success','Freigabe gesperrt. Bestehende Warenkörbe werden erneut geprüft.');
        } catch (Throwable $e) {
            self::notification('error',$e->getMessage());
        }
    }
    public static function menu(): void {
        if (!current_user_can('manage_options') || !current_user_can('manage_woocommerce')) return;
        add_submenu_page('options-general.php','Speedmaster-Freigaben','Speedmaster-Freigaben','manage_options',self::SLUG,[__CLASS__,'page']);
    }
    public static function page(): void {
        self::authorize();
        $note=get_transient(self::NOTICE.get_current_user_id());
        if (is_array($note)) delete_transient(self::NOTICE.get_current_user_id());
        $proofs=get_option(HPZ_APL_WP_Supplier_Proofs_09::OPTION,[]);
        if (!is_array($proofs)) $proofs=[];
        $sale=HPZ_APL_WP_Straight_Runtime_09::canSell();
        $endpoint=esc_url(admin_url('admin-post.php'));
        echo '<div class="wrap"><h1>Küchenarbeitsplatte · Speedmaster-Freigaben</h1>';
        echo '<p><strong>Verkaufsstatus:</strong> '.($sale?'<span style="color:#b32d2e">Freigabeschalter aktiv – Checkout nur bei gültigen Einzelnachweisen</span>':'<span style="color:#177a3a">Gesperrt – kein öffentlicher Verkauf</span>').'</p>';
        echo '<p>Nur Gerade (Produkt 1000083). Eine gespeicherte Lieferantenbestätigung aktiviert <strong>keinen</strong> Verkauf. Keine Speedmaster-Schnittstelle.</p>';
        if (is_array($note)) {
            $cls=($note['type']??'')==='success'?'notice-success':'notice-error';
            echo '<div class="notice '.esc_attr($cls).'"><p>'.esc_html((string)($note['message']??'')).'</p></div>';
        }
        echo '<div style="max-width:820px;background:#fff;border:1px solid #c3c4c7;padding:18px 22px;border-radius:6px">';
        echo '<h2>Eine geprüfte Konfiguration freigeben</h2><p>1. Die gerade Platte in der Admin-Vorschau einstellen und <strong>„Prüfkonfiguration kopieren“</strong> klicken. 2. Diese Daten einfügen. 3. Tatsächliche Speedmaster- und Versanddaten eintragen.</p>';
        echo '<form method="post" action="'.$endpoint.'">';
        echo '<input type="hidden" name="action" value="hpz_apl_proof_save_10">';
        wp_nonce_field('hpz_apl_supplier_proof_090');
        echo '<p><label for="hpz-apl-config"><strong>Prüfkonfiguration (JSON)</strong></label></p>';
        echo '<textarea id="hpz-apl-config" name="configuration_json" rows="7" style="width:100%;font-family:monospace" required maxlength="16384" spellcheck="false"></textarea>';
        $fields=[
            ['supplier_reference','Speedmaster-Angebotsnummer oder Nachweis','SM-...','text'],
            ['supplier_net_eur','Netto-Einkaufspreis (€)','148,43','text'],
            ['packed_kg','Tatsächliches verpacktes Gewicht (kg)','27,500','text'],
            ['pack_length_cm','Verpackungslänge (cm)','207,0','text'],
            ['pack_width_cm','Verpackungsbreite (cm)','67,0','text'],
            ['pack_height_cm','Verpackungshöhe (cm)','11,0','text'],
            ['shipping_rate_ids','Geprüfte Woo-Versandart-ID(s), kommasepariert','flexible_shipping:12','text'],
            ['max_quantity','Maximal bestätigte Stückzahl','3','number'],
        ];
        echo '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">';
        foreach($fields as $item) {
            echo '<label style="display:block"><span style="display:block;margin-bottom:4px;font-weight:600">'.esc_html($item[1]).'</span>';
            echo '<input style="width:100%" name="'.esc_attr($item[0]).'" type="'.esc_attr($item[3]).'" placeholder="'.esc_attr($item[2]).'" required></label>';
        }
        echo '</div><p>Nur bestätigte Werte verwenden. Die Freigabe gilt maximal 30 Tage und ausschließlich für diese exakte Kombination.</p>';
        submit_button('Freigabe prüfen und speichern');
        echo '</form></div>';
        echo '<h2>Gespeicherte Lieferantenbestätigungen ('.count($proofs).')</h2>';
        if (!$proofs) {
            echo '<p>Keine Freigaben hinterlegt. Der Warenkorb bleibt gesperrt.</p>';
        } else {
            echo '<table class="widefat striped"><thead><tr><th>Konfiguration</th><th>Speedmaster-Referenz</th><th>EK netto</th><th>Prüfdatum</th><th>Aktion</th></tr></thead><tbody>';
            foreach ($proofs as $key=>$proof) {
                if (!is_string($key) || !is_array($proof)) continue;
                $m=$proof['reviewMeta']??[];
                $name=is_array($m)
                    ? ((string)($m['decorName']??'')).' · '.(string)($m['lengthMm']??'').' × '.(string)($m['depthMm']??'').' mm · '.(string)($m['thicknessMm']??'').' mm'
                    : '';
                if (trim($name," ·×m") === '') $name=substr($key,0,12).'…';
                echo '<tr><td>'.esc_html($name).'</td><td>'.esc_html((string)($proof['supplierReference']??'')).'</td>';
                echo '<td>'.esc_html(number_format(((int)($proof['supplierNetCents']??0))/100,2,',','.')).' €</td>';
                echo '<td>'.esc_html((string)($proof['checkedOn']??'')).'</td>';
                echo '<td><form method="post" action="'.$endpoint.'"><input type="hidden" name="action" value="hpz_apl_proof_revoke_10">';
                echo '<input type="hidden" name="configuration_key" value="'.esc_attr($key).'">';
                wp_nonce_field('hpz_apl_supplier_proof_090');
                echo '<button type="submit" class="button" onclick="return confirm(\'Diesen Nachweis sperren?\')">Sperren</button></form></td></tr>';
            }
            echo '</tbody></table>';
        }
        echo '</div>';
    }
    /** Only an administrator sees the copyable supplier order on an existing WC order. */
    public static function orderItem($itemId,$item,$product): void {
        if (!current_user_can('manage_woocommerce') || !is_object($item)
            || !method_exists($item,'get_meta')) return;
        $meta=$item->get_meta('_hpz_apl_manufacturing_v2',true);
        if (!is_array($meta) || ($meta['productId']??null)!==1000083) return;
        try { $text=HPZ_APL_WC_Cart_Bridge_08::manualSpeedmasterText($meta); }
        catch(Throwable $e){return;}
        echo '<details style="margin:10px 0"><summary><strong>Speedmaster · manuell bestellen</strong></summary>';
        echo '<textarea readonly rows="11" style="width:100%;font-family:monospace" aria-label="Speedmaster Bestelldaten">'.esc_textarea($text).'</textarea>';
        echo '<p style="margin:4px 0">Bitte Werte bei Speedmaster prüfen und die Bestellung dort manuell auslösen.</p></details>';
    }
}
