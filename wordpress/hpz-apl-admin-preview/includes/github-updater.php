<?php
/** Secure native WP updates from tested private GitHub Release ZIPs. */
defined('ABSPATH') || exit;

final class HPZ_APL_GitHub_Updater {
    public const PLUGIN = 'hpz-apl-admin-preview/hpz-apl-admin-preview.php';
    private const OPTION = 'hpz_apl_github_updater';
    private const STATUS_OPTION = 'hpz_apl_updater_status';
    private const URI = 'https://github.com/DaniS2212/hpz-arbeitsplatten-konfigurator';
    private const API = 'https://api.github.com/repos/DaniS2212/hpz-arbeitsplatten-konfigurator';

    public static function init(): void {
        add_filter('update_plugins_github.com', [__CLASS__, 'offer'], 10, 4);
        add_filter('plugins_api', [__CLASS__, 'information'], 10, 3);
        add_filter('auto_update_plugin', [__CLASS__, 'auto'], 10, 2);
        add_filter('upgrader_pre_download', [__CLASS__, 'download'], 10, 4);
        add_action('admin_menu', [__CLASS__, 'menu']);
        add_action('admin_post_hpz_apl_updater_save', [__CLASS__, 'save']);
        add_action('admin_post_hpz_apl_updater_check', [__CLASS__, 'checkNow']);
    }

    private static function config(): array {
        $setting = get_option(self::OPTION, []);
        return is_array($setting) ? $setting : [];
    }

    private static function token(): string {
        $token = self::config()['token'] ?? '';
        return is_string($token) && preg_match('/^[A-Za-z0-9_]{16,255}$/D', $token) ? $token : '';
    }

    private static function enabled(): bool {
        return !empty(self::config()['enabled']) && self::token() !== '';
    }

    private static function headers(bool $binary = false): array {
        return [
            'Authorization' => 'Bearer '.self::token(),
            'Accept' => $binary ? 'application/octet-stream' : 'application/vnd.github+json',
            'User-Agent' => 'HolzLiebling-APL-WordPress-Updater',
            'X-GitHub-Api-Version' => '2022-11-28',
        ];
    }


    /** This is the installed ZIP's stamped header, not the source baseline. */
    private static function installedVersion(): string {
        $data = get_file_data(dirname(__DIR__).'/hpz-apl-admin-preview.php', ['Version'=>'Version'], 'plugin');
        return is_array($data) && is_string($data['Version'] ?? null) ? $data['Version'] : 'unbekannt';
    }

    /** Only sanitized, non-sensitive diagnostics. Never persist PATs, raw URLs or GitHub response bodies. */
    private static function remember(string $state, string $message, string $version = ''): void {
        update_option(self::STATUS_OPTION, [
            'checked_at'=>time(),
            'state'=>$state,
            'message'=>$message,
            'version'=>$version,
        ], false);
    }

    /** Private plugin info for the native WP "Details der Version" dialog. */
    public static function information($result, $action, $args) {
        if ($result !== false || $action !== 'plugin_information' || !is_object($args)
            || ($args->slug ?? '') !== 'hpz-apl-admin-preview') return $result;

        $release = self::latest();
        $installed = self::installedVersion();
        $version = $release['version'] ?? $installed;
        $checkState = $release ? 'Geprueftes, getestetes GitHub-Release.' : 'GitHub-Version derzeit nicht verfuegbar; lokale Plugin-Version angezeigt.';

        // No download_link: all authenticated binary installs must continue through
        // update_plugins_github.com + upgrader_pre_download (SHA-256 verified).
        return (object)[
            'name'=>'Holz-Liebling Arbeitsplatten – Admin-Vorschau',
            'slug'=>'hpz-apl-admin-preview',
            'version'=>$version,
            'author'=>'Holz-Liebling GmbH',
            'homepage'=>self::URI,
            'external'=>true,
            'requires'=>'6.5',
            'requires_php'=>'7.4',
            'sections'=>[
                'description'=>'<p>Arbeitsplatten-Konfigurator von Holz-Liebling: Gerade mit WooCommerce-Anbindung, L- und U-Form weiterhin nur als Admin-Vorschau.</p>',
                'changelog'=>'<p>Version '.esc_html($version).' – '.esc_html($checkState).'</p><p>GitHub veroeffentlicht Plugin-ZIPs nur nach erfolgreichen Tests. Keine automatische Produktfreischaltung.</p>',
            ],
        ];
    }

    /** Only the latest published release with exact asset name and GitHub SHA-256 is trusted. */
    private static function latest(): ?array {
        if (!self::enabled()) return null;
        $res = wp_remote_get(self::API.'/releases/latest', [
            'headers'=>self::headers(), 'timeout'=>18, 'redirection'=>0,
        ]);
        if (is_wp_error($res)) {
            self::remember('error', 'GitHub ist derzeit nicht erreichbar.');
            return null;
        }
        $status = (int)wp_remote_retrieve_response_code($res);
        if ($status !== 200) {
            $message = in_array($status, [401,403,404], true)
                ? 'GitHub-Zugriff oder Release nicht verfuegbar (HTTP '.$status.'). Token-/Repository-Zugriff pruefen.'
                : 'GitHub-Release-Abfrage fehlgeschlagen (HTTP '.$status.').';
            self::remember('error', $message);
            return null;
        }
        $release = json_decode(wp_remote_retrieve_body($res), true);
        if (!is_array($release) || !empty($release['draft']) || !empty($release['prerelease'])) {
            self::remember('error', 'Keine gueltige, veroeffentlichte GitHub-Release gefunden.');
            return null;
        }
        $tag = $release['tag_name'] ?? '';
        if (!is_string($tag) || !preg_match('/^hpz-apl-v([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)$/D', $tag, $matches)) {
            self::remember('error', 'GitHub-Release hat kein gueltiges Arbeitsplatten-Versionsformat.');
            return null;
        }
        $version = $matches[1];
        $name = 'hpz-apl-admin-preview-'.$version.'.zip';
        if (!is_array($release['assets'] ?? null)) {
            self::remember('error', 'GitHub-Release enthaelt keine gueltige Plugin-ZIP.');
            return null;
        }
        foreach ($release['assets'] as $asset) {
            if (!is_array($asset) || ($asset['name'] ?? '') !== $name || ($asset['state'] ?? '') !== 'uploaded') continue;
            if (!is_int($asset['id'] ?? null) || $asset['id'] <= 0) continue;
            if (!is_int($asset['size'] ?? null) || $asset['size'] < 1000 || $asset['size'] > 30000000) continue;
            $digest = $asset['digest'] ?? '';
            if (!is_string($digest) || !preg_match('/^sha256:([a-f0-9]{64})$/D', $digest, $sha)) continue;
            self::remember('ok', 'Gepruefte GitHub-Release verfuegbar.', $version);
            return ['version'=>$version, 'id'=>$asset['id'], 'size'=>$asset['size'], 'hash'=>$sha[1]];
        }
        self::remember('error', 'GitHub-Release enthaelt keine gepruefte Plugin-ZIP mit SHA-256.');
        return null;
    }

    public static function offer($update, $pluginData, $pluginFile, $locales) {
        if ($pluginFile !== self::PLUGIN) return $update;
        $release = self::latest();
        if (!$release || !isset($pluginData['Version']) || version_compare($release['version'], (string)$pluginData['Version'], '<=')) return false;
        return [
            'id'=>self::URI,
            'slug'=>'hpz-apl-admin-preview',
            'version'=>$release['version'],
            'url'=>self::URI,
            'package'=>self::API.'/releases/assets/'.$release['id'],
            'autoupdate'=>true,
            'requires_php'=>'7.4',
        ];
    }

    public static function auto($update, $item) {
        if (!is_object($item) || ($item->plugin ?? null) !== self::PLUGIN) return $update;
        // WP 6.6+ includes fatal-error rollback for automatic plugin updates.
        return self::enabled() && version_compare((string)get_bloginfo('version'), '6.6', '>=');
    }

    private static function validLocation($url): bool {
        if (!is_string($url)) return false;
        $parts = parse_url($url);
        return is_array($parts) && ($parts['scheme'] ?? '') === 'https'
            && in_array(strtolower((string)($parts['host'] ?? '')), [
                'release-assets.githubusercontent.com', 'objects.githubusercontent.com',
            ], true)
            && !isset($parts['user']) && !isset($parts['pass'])
            && (!isset($parts['port']) || $parts['port'] === 443);
    }

    /** WordPress owns the installation/temporary-backup; only override OUR private binary fetch. */
    public static function download($reply, $package, $upgrader, $hookExtra) {
        if ($reply !== false || !is_string($package) || !preg_match(
            '~^'.preg_quote(self::API, '~').'/releases/assets/[1-9][0-9]*$~D', $package
        )) return $reply;
        $forPlugin = is_array($hookExtra) && (
            ($hookExtra['plugin'] ?? '') === self::PLUGIN
            || in_array(self::PLUGIN, (array)($hookExtra['plugins'] ?? []), true)
        );
        if (!$forPlugin) return $reply;
        $release = self::latest();
        if (!$release || $package !== self::API.'/releases/assets/'.$release['id']) {
            return new WP_Error('hpz_apl_update_missing', 'Geprueftes Arbeitsplatten-Update nicht verfuegbar.');
        }
        $temp = wp_tempnam('hpz-apl-update.zip');
        if (!$temp) return new WP_Error('hpz_apl_update_temp', 'Temporaere Datei nicht verfuegbar.');
        $response = wp_remote_get($package, [
            'headers'=>self::headers(true), 'timeout'=>90, 'redirection'=>0,
            'stream'=>true, 'filename'=>$temp,
        ]);
        if (is_wp_error($response)) {
            @unlink($temp);
            return new WP_Error('hpz_apl_update_network', 'Privater GitHub-Download fehlgeschlagen.');
        }
        $status = wp_remote_retrieve_response_code($response);
        if ($status === 302) {
            $location = wp_remote_retrieve_header($response, 'location');
            @unlink($temp);
            if (!self::validLocation($location)) return new WP_Error('hpz_apl_update_redirect', 'Nicht vertrauenswuerdige Download-Adresse.');
            // Signed CDN URL only: NEVER forward the private GitHub bearer token.
            $temp = download_url($location, 120);
            if (is_wp_error($temp)) return new WP_Error('hpz_apl_update_network', 'Signierter Download fehlgeschlagen.');
        } elseif ($status !== 200) {
            @unlink($temp);
            return new WP_Error('hpz_apl_update_http', 'GitHub-Release konnte nicht geladen werden.');
        }
        if (!is_string($temp) || !is_file($temp) || filesize($temp) !== $release['size']
            || !hash_equals($release['hash'], (string)hash_file('sha256', $temp))) {
            if (is_string($temp)) @unlink($temp);
            return new WP_Error('hpz_apl_update_digest', 'Pruefsumme des Plugin-Pakets ungueltig.');
        }
        return $temp;
    }

    /** Only runs WordPress's version check; deliberately never triggers an install. */
    public static function refreshUpdateCheck(): void {
        delete_site_transient('update_plugins');
        self::latest(); // Record actionable private-GitHub diagnostics even if WP.org is down.
        wp_update_plugins();
    }

    public static function checkNow(): void {
        if (!current_user_can('manage_options')) wp_die('Keine Berechtigung.');
        check_admin_referer('hpz_apl_updater_check');
        self::refreshUpdateCheck();
        wp_safe_redirect(admin_url('options-general.php?page=hpz-apl-updates&checked=1'));
        exit;
    }

    public static function menu(): void {
        add_options_page('Arbeitsplatten GitHub-Updates', 'Arbeitsplatten-Updates', 'manage_options', 'hpz-apl-updates', [__CLASS__, 'page']);
    }

    public static function page(): void {
        if (!current_user_can('manage_options')) return;
        $setting = self::config();
        $hasToken = self::token() !== '';
        $enabled = self::enabled();
        $status = get_option(self::STATUS_OPTION, []);
        $status = is_array($status) ? $status : [];
        $checkedAt = (int)($status['checked_at'] ?? 0);
        $state = ($status['state'] ?? '') === 'ok' ? 'Erfolgreich' : (($status['state'] ?? '') === 'error' ? 'Fehler bei der GitHub-Pruefung' : 'Noch nicht geprueft');
        if (!$enabled) $state = 'Deaktiviert';
        $latestVersion = is_string($status['version'] ?? null) && $status['version'] !== '' ? $status['version'] : 'Noch nicht erkannt';
        $lastCheck = $checkedAt > 0 ? wp_date('d.m.Y H:i', $checkedAt) : 'Noch nicht geprueft';
        $message = is_string($status['message'] ?? null) ? $status['message'] : '';

        echo '<div class="wrap"><h1>Arbeitsplatten-Konfigurator: automatische Updates</h1>';
        echo '<p>Nur gepruefte ZIP-Releases aus dem privaten GitHub-Repository. Kein Hosting-/SSH-Zugang erforderlich.</p>';
        echo '<h2>Update-Status</h2><table class="widefat striped" style="max-width:860px">';
        echo '<tr><th scope="row">Installierte Version</th><td>'.esc_html(self::installedVersion()).'</td></tr>';
        echo '<tr><th scope="row">Zuletzt erkannte GitHub-Version</th><td>'.esc_html($latestVersion).'</td></tr>';
        echo '<tr><th scope="row">Letzte GitHub-Pruefung</th><td>'.esc_html($lastCheck).'</td></tr>';
        echo '<tr><th scope="row">Status</th><td>'.esc_html($state).($enabled && $message !== '' ? ' – '.esc_html($message) : '').'</td></tr>';
        echo '<tr><th scope="row">Automatische Installation</th><td>'.($enabled ? 'Aktiviert (WordPress-Zeitplan)' : 'Deaktiviert').'</td></tr>';
        echo '</table>';
        if (!empty($_GET['checked'])) {
            echo '<div class="notice notice-info inline"><p>Eine neue WordPress-Updatepruefung wurde ausgefuehrt. Es wurde kein Plugin installiert.</p></div>';
        }

        echo '<form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';
        echo '<input type="hidden" name="action" value="hpz_apl_updater_check">';
        wp_nonce_field('hpz_apl_updater_check');
        echo '<p><button type="submit" class="button button-secondary"'.(!$enabled ? ' disabled' : '').'>Jetzt auf Updates pruefen</button></p>';
        echo '</form>';
        echo '<h2>GitHub-Verbindung</h2>';
        echo '<p><strong>GitHub-Lesetoken:</strong> '.($hasToken ? 'hinterlegt' : 'fehlt').'. Token wird hier nie angezeigt.</p>';
        if (version_compare((string)get_bloginfo('version'), '6.6', '<')) {
            echo '<p class="notice notice-warning">Automatische Updates erst ab WordPress 6.6 aktiv (Fatal-Error-Rollback).</p>';
        }
        echo '<form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';
        echo '<input type="hidden" name="action" value="hpz_apl_updater_save">';
        wp_nonce_field('hpz_apl_updater_save');
        echo '<p><label>GitHub Fine-grained PAT (nur Contents: Read fuer dieses Repo): <input type="password" name="github_token" autocomplete="new-password" class="regular-text" placeholder="Leer lassen = bisherigen Token behalten"></label></p>';
        echo '<p><label><input type="checkbox" name="enabled" value="1" '.checked(!empty($setting['enabled']),true,false).'> Updates automatisch installieren</label></p>';
        echo '<p><label><input type="checkbox" name="remove_token" value="1"> Gespeicherten Token entfernen und Updates deaktivieren</label></p>';
        submit_button('Speichern');
        echo '</form><p>WordPress prueft standardmaessig zweimal taeglich. Der Button startet nur die Updatepruefung; eine Installation erfolgt danach ueber die normale WordPress-Verwaltung bzw. automatisch gemaess Zeitplan.</p></div>';
    }

    public static function save(): void {
        if (!current_user_can('manage_options')) wp_die('Keine Berechtigung.');
        check_admin_referer('hpz_apl_updater_save');
        $old = self::config();
        $token = isset($old['token']) && is_string($old['token']) ? $old['token'] : '';
        if (!empty($_POST['remove_token'])) {
            $token = '';
        } elseif (isset($_POST['github_token']) && is_string($_POST['github_token'])) {
            $candidate = trim(wp_unslash($_POST['github_token']));
            if ($candidate !== '') {
                if (!preg_match('/^[A-Za-z0-9_]{16,255}$/D', $candidate)) wp_die('Ungueltiges Token-Format.');
                $token = $candidate;
            }
        }
        $enabled = !empty($_POST['enabled']) && $token !== '' && empty($_POST['remove_token']);
        // autoload disabled: credentials are never loaded in ordinary front-end options.
        update_option(self::OPTION, ['token'=>$token, 'enabled'=>$enabled], false);
        delete_site_transient('update_plugins');
        wp_safe_redirect(admin_url('options-general.php?page=hpz-apl-updates&saved=1'));
        exit;
    }
}
