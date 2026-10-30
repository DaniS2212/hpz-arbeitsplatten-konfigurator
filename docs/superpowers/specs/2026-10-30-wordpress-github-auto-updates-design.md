# WordPress native GitHub updates (private repository) - Design

**Status:** Chosen after HostPress SSH was ruled out. PR #23 was fully reverted by PR #24.

## Intent
Update only the existing HPZ Arbeitsplatten WordPress plugin without repeated manual ZIP uploads or hosting console access. An admin installs one bootstrap ZIP in WP and saves a repository-scoped read token through WP Settings. Future merges to main produce reviewed ZIPs only after green CI. WordPress checks and installs updates through its native schedule.

## Alternatives
- HostPress SSH: inaccessible to operator; rejected and reverted.
- Direct source ZIP / arbitrary Git repository checkout: risks unbuilt or unchecked artifacts; rejected.
- **Native WordPress Update URI + GitHub private Release asset:** selected. An installable ZIP has a stable plugin directory and sha256 release digest, and WordPress installs it from the dashboard without hosting SSH.

## Contract
1. GitHub Actions runs PHP/WooCommerce, Node and Chromium tests for PRs; only push/main or manual run/main may publish a release after all checks pass. It rebuilds source-controlled assets and verifies the output before stamping a numeric four-part version and packaging the plugin folder.
2. Plugin hooks update_plugins_github.com, upgrader_pre_download and auto_update_plugin apply to the exact slug only. They verify published non-draft releases named hpz-apl-vX.Y.Z.RUN, with exact ZIP filename and sha256 digest, never offer a downgrade, and never use an unreviewed GitHub source archive.
3. A fine-grained GitHub personal access token with **Contents: Read** for the exact private repository is stored by a WordPress administrator in a non-autoload option. It is never rendered or placed in update metadata; for asset redirects only a known GitHub HTTPS CDN is accepted and the token is never forwarded.
4. WordPress 6.6+ is required for automatic updates (core rollback on failed installation or PHP fatal error). WordPress checks typically twice daily via WP-Cron, subject to hosting network/permissions. The initial ZIP install remains manual.
5. No WooCommerce or product edits, no public sale switch. Straight product 1000083 maintains its existing checkout gate. L 1000080 and U 1000081 remain drafts and non-purchasable.
6. Rollback is native on failure, **not** a persistent full backup of a successfully updated version. Previous private GitHub Release ZIPs remain available for manual recovery. Backups are still recommended.

## Non-goals
No HostPress SSH, additional server, public download endpoint, automatic product publishing, supplier ordering, price calculation edits or automatic live install from this PR.

## Risks
WordPress auto updates require outbound HTTPS to api.github.com and download CDN, working WP-Cron, write permissions and working admin token; otherwise fail closed. Token is plaintext in WP database (not in client pages); restrict admin and database backups.
