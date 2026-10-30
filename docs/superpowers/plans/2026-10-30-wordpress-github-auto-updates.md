# Private GitHub WordPress Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** WordPress-native auto-updates for the existing Arbeitsplatten plugin without HostPress SSH, with green-CI-only private release ZIPs.

**Architecture:** Main-only GitHub Actions publishes an installable ZIP after PHP, Node, Chromium tests and reviewed-asset validation. Native WordPress update hooks authenticate to private GitHub Releases and verify the asset digest before installation.

**Tech Stack:** PHP 7.4 compatible plugin, WordPress 6.6+ for auto-rollback, GitHub Actions, Node 22.

**Spec:** \`docs/superpowers/specs/2026-10-30-wordpress-github-auto-updates-design.md\`

## Global constraints
- No HostPress SSH, no external build server and no public ZIP endpoint.
- Preserve all WordPress product, sale, tax, price, shipping and order settings.
- L/U products remain drafts and blocked. No shop publish.
- The GitHub token is readable only from a WP admin setting and must never enter customer-facing data or a redirect request.
- Auto-updates must not proceed without a trusted published private release and valid SHA-256 digest.

## Review focus
1. Bad redirect host: fail with error and never forward bearer token.
2. Wrong or missing digest: fail before WordPress receives the ZIP.
3. Unreviewed/bad-tag release: never offer update.
4. Other plugin in same WP hook: do not intercept.
5. WP<6.6, disabled token, older version or network failure: no automatic install.

---

### Task 1: Update client

**Files:** \`wordpress/hpz-apl-admin-preview/includes/github-updater.php\`, plugin entrypoint, \`wordpress/github-updater.test.php\`.

**Interfaces:** \`HPZ_APL_GitHub_Updater::init()\`, \`::offer()\`, \`::auto()\`, \`::download()\` and WP Settings form.

- [x] Write tests first for private GitHub metadata, versions, exact plugin ID, 200/302 downloads, invalid redirects, wrong digest, no token, older WordPress.
- [x] Run failing test (missing include).
- [x] Implement minimal secure updater and admin-only settings, with non-autoload option.
- [x] Run isolated PHP tests (26 assertions passed locally).
- [ ] Verify full CI and WordPress live integration after merge and bootstrap.

### Task 2: Green-only GitHub release workflow

**Files:** \`.github/workflows/hpz-wordpress-updates.yml\`, \`scripts/updater/stamp-release.mjs\` and tests.

**Interfaces:** released ZIP \`hpz-apl-admin-preview-X.Y.Z.RUN.zip\` under tag \`hpz-apl-vX.Y.Z.RUN\`.

- [x] Write release-version tests and verify missing implementation fails.
- [x] Implement monotonic run-number stamping, rejecting invalid source or run IDs.
- [x] Run Node tests locally (5 passed).
- [ ] Verify PHP, Node, browser and bundle checks in GitHub Actions on PR #25. Release job must be skipped for PR.
- [ ] On merge only: verify release ZIP, then one bootstrap install in WP-admin.

### Task 3: Operator instructions

**Files:** \`docs/wordpress-github-updates.md\` and design/plan documentation.

- [x] Document bootstrap ZIP, repository-scoped GitHub token via WordPress Settings, WP-Cron and rollback limits.
- [ ] After release, validate token-scoped private download from WordPress; only then confirm automatic updates functional.
