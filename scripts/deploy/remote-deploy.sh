#!/usr/bin/env bash
# Runs over pinned-key SSH on the HostPress account. Changes ONLY the HPZ plugin.
set -Eeuo pipefail
umask 077

fail() { echo "HPZ deploy: $*" >&2; return 1; }
if [[ $# -ne 4 ]]; then fail 'Expected: <wp-root> <zip-basename> <sha256> <plugin-version>'; exit 2; fi
WP_ROOT=$1; PACKAGE=$2; EXPECTED_SHA=$3; EXPECTED_VERSION=$4
if [[ ! "$WP_ROOT" =~ ^/[A-Za-z0-9_./-]+$ || "$WP_ROOT" == *..* ]] \
  || [[ ! "$PACKAGE" =~ ^hpz-apl-admin-preview-[A-Za-z0-9_-]+\.zip$ ]] \
  || [[ ! "$EXPECTED_SHA" =~ ^[0-9a-f]{64}$ ]] \
  || [[ ! "$EXPECTED_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  fail 'Invalid or unsafe deployment parameters'; exit 2
fi
[[ -d "$WP_ROOT" && -f "$WP_ROOT/wp-config.php" ]] || { fail 'Not a WordPress installation'; exit 2; }
WP_ROOT=$(cd "$WP_ROOT" && pwd -P)
BASE="$HOME/.hpz-apl-deploy"
ARCHIVE="$BASE/incoming/$PACKAGE"
BACKUPS="$BASE/backups"
PLUGINS="$WP_ROOT/wp-content/plugins"
PLUGIN="$PLUGINS/hpz-apl-admin-preview"
[[ -f "$ARCHIVE" && -d "$PLUGIN" && -f "$PLUGIN/hpz-apl-admin-preview.php" ]] || { fail 'Plugin or ZIP missing'; exit 2; }
[[ -d "$PLUGINS" && ! -L "$PLUGIN" ]] || { fail 'Unexpected plugin directory'; exit 2; }

sha=$(sha256sum "$ARCHIVE" | cut -d' ' -f1)
[[ "$sha" == "$EXPECTED_SHA" ]] || { fail 'ZIP checksum mismatch'; exit 2; }
unzip -tqq "$ARCHIVE" >/dev/null || { fail 'Corrupt ZIP'; exit 2; }
entries=$(unzip -Z1 "$ARCHIVE") || { fail 'ZIP listing failed'; exit 2; }
[[ -n "$entries" ]] || { fail 'Empty ZIP'; exit 2; }
while IFS= read -r path; do
  [[ "$path" == hpz-apl-admin-preview/* && "$path" != *..* && "$path" != *\\* ]] || { fail 'Unexpected ZIP entry'; exit 2; }
done <<< "$entries"
zip_header=$(unzip -p "$ARCHIVE" hpz-apl-admin-preview/hpz-apl-admin-preview.php) || { fail 'Plugin entry missing'; exit 2; }
zip_version=$(printf '%s\n' "$zip_header" | sed -n 's/^ \* Version: \([0-9.]*\)$/\1/p' | head -n 1)
[[ "$zip_version" == "$EXPECTED_VERSION" ]] || { fail 'ZIP plugin version mismatch'; exit 2; }

wp_at() { wp --path="$WP_ROOT" "$@"; }
wp_at core is-installed >/dev/null || { fail 'WP-CLI WordPress preflight failed'; exit 2; }
site=$(wp_at option get home)
[[ "$site" =~ ^https?://(www\.)?holzplatten-zuschnitt\.de/?$ ]] || { fail 'Wrong WordPress website'; exit 2; }
wp_at plugin is-active hpz-apl-admin-preview || { fail 'Target plugin must already be active'; exit 2; }
old_version=$(wp_at plugin get hpz-apl-admin-preview --field=version)
[[ "$old_version" =~ ^[0-9]+(\.[0-9]+)+$ ]] || { fail 'Existing plugin version unknown'; exit 2; }
before_option=$(wp_at option get hpz_apl_admin_preview --format=json)
before_straight=$(wp_at post get 1000083 --field=post_status)
before_l=$(wp_at post get 1000080 --field=post_status)
before_u=$(wp_at post get 1000081 --field=post_status)
[[ "$before_l" == draft && "$before_u" == draft ]] || { fail 'L/U must remain drafts'; exit 2; }

mkdir -p "$BACKUPS"
chmod 700 "$BASE" "$BASE/incoming" "$BACKUPS"
stamp=$(date -u '+%Y%m%dT%H%M%SZ')
BACKUP="$BACKUPS/hpz-apl-${stamp}-${EXPECTED_SHA:0:12}.tar.gz"
tar -czf "$BACKUP" -C "$PLUGINS" hpz-apl-admin-preview
[[ -s "$BACKUP" ]] || { fail 'Backup failed'; exit 2; }

update_started=0
rollback() {
  local rc=$1
  trap - ERR
  if [[ "$update_started" == 1 ]]; then
    echo 'HPZ deploy: failure after update started; restoring previous plugin files' >&2
    rm -rf -- "$PLUGIN"
    if ! tar -xzf "$BACKUP" -C "$PLUGINS"; then echo 'CRITICAL: rollback extraction failed' >&2; exit 9; fi
    # Only repair settings if the install unexpectedly modified them.
    local current
    current=$(wp_at option get hpz_apl_admin_preview --format=json 2>/dev/null) || current=''
    if [[ "$current" != "$before_option" ]]; then
      wp_at option update hpz_apl_admin_preview "$before_option" --format=json >/dev/null || echo 'CRITICAL: release option restore failed' >&2
    fi
    local post_id old_status new_status
    for post_id in 1000083 1000080 1000081; do
      case "$post_id" in 1000083) old_status=$before_straight;; 1000080) old_status=$before_l;; 1000081) old_status=$before_u;; esac
      new_status=$(wp_at post get "$post_id" --field=post_status 2>/dev/null) || new_status=''
      if [[ "$new_status" != "$old_status" ]]; then
        wp_at post update "$post_id" --post_status="$old_status" >/dev/null || echo "CRITICAL: product $post_id status restore failed" >&2
      fi
    done
    echo "HPZ deploy: rollback complete, previous version $old_version restored" >&2
  fi
  exit "$rc"
}
trap 'rollback $?' ERR
update_started=1
wp_at plugin install "$ARCHIVE" --force --quiet
wp_at plugin is-active hpz-apl-admin-preview
installed=$(wp_at plugin get hpz-apl-admin-preview --field=version)
[[ "$installed" == "$EXPECTED_VERSION" ]] || fail "Installed $installed, expected $EXPECTED_VERSION"
now_option=$(wp_at option get hpz_apl_admin_preview --format=json)
[[ "$now_option" == "$before_option" ]] || fail 'Plugin release flags changed unexpectedly'
[[ "$(wp_at post get 1000083 --field=post_status)" == "$before_straight" ]] || fail 'Straight product status changed'
[[ "$(wp_at post get 1000080 --field=post_status)" == "$before_l" ]] || fail 'L-product status changed'
[[ "$(wp_at post get 1000081 --field=post_status)" == "$before_u" ]] || fail 'U-product status changed'
wp_at eval 'if (!class_exists("HPZ_APL_Admin_Preview") || !class_exists("HPZ_APL_Price_V3") || !class_exists("WooCommerce")) { fwrite(STDERR, "HPZ plugin runtime check failed\n"); exit(3); }' >/dev/null
# Only invalidate the configured straight product cache, not all WooCommerce products.
wp_at eval 'if (function_exists("rocket_clean_post")) rocket_clean_post(1000083);' >/dev/null
trap - ERR
rm -f -- "$ARCHIVE"
# Retain five most recent code backups; never modify the site's other plugins.
find "$BACKUPS" -maxdepth 1 -type f -name 'hpz-apl-*.tar.gz' -printf '%T@ %p\n' | sort -rn | tail -n +6 | cut -d' ' -f2- | while IFS= read -r older; do
  [[ -z "$older" ]] || rm -f -- "$older"
done
printf 'HPZ deploy succeeded: %s -> %s (backup: %s)\n' "$old_version" "$installed" "$(basename "$BACKUP")"
