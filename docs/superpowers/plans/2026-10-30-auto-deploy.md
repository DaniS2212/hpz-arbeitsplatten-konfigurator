# HPZ Auto-Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a versioned, verified WordPress plugin to an exact HostPress WordPress installation on every main merge once SSH secrets are configured.

**Architecture:** GitHub Actions orchestrates tests and package; bash script runs on HostPress after a pinned-host-key SSH upload; rollback restores backup files if WP-CLI install or verification fails. Build stamps every ZIP uniquely for cache safety without rewriting Git history.

**Tech Stack:** GitHub Actions, bash, Node 22, PHP 7.4+, WP-CLI, SSH, zip/unzip, WordPress/WooCommerce.

**Spec:** `docs/superpowers/specs/2026-10-30-auto-deploy-design.md`

## Global Constraints
- Deploy only merged/main and only after all tests; default-off until repository variable and secrets are configured.
- Never set product publication status or sale flags during normal deployment.
- Never affect other plugins or auto-activate inactive plugin.
- Backups outside webroot; restore prior code on failure.
- Host key must be pinned, no `StrictHostKeyChecking=no`.
- No secrets in commit, logs, or PR.

## Review Focus
- ZIP corrupted / malicious path: reject before touching plugin.
- SSH key/host missing or wrong WordPress root: abort without writes.
- Plugin inactive or L/U public: refuse automatic deployment.
- Wrong installed version or changed sale options: trigger rollback.
- Sequential main merges racing: GitHub concurrency prevents parallel deployment.

---

### Task 1: Version stamp and tests
**Files:** `scripts/deploy/stamp-ci-version.mjs`, `scripts/deploy/tests/stamp-ci-version.test.mjs`.
- [ ] Write failing version tests (header + PHP constant, invalid input, cache stamp).
- [ ] Verify expected failure.
- [ ] Implement single-purpose stamp CLI.
- [ ] Run tests and verify pass.

### Task 2: Remote deploy and rollback
**Files:** `scripts/deploy/remote-deploy.sh`, `scripts/deploy/tests/remote-deploy.test.mjs`.
- [ ] Write failing tests for wrong site, missing credentials, active plugin, success, failed update and rollback.
- [ ] Verify expected failure.
- [ ] Implement backup, pre/post checks, exact plugin replacement, failure rollback.
- [ ] Run bash syntax check and test suite.

### Task 3: Actions pipeline and docs
**Files:** `.github/workflows/hpz-auto-deploy.yml`, `docs/auto-deploy-setup.md`, `scripts/deploy/tests/workflow.test.mjs`.
- [ ] Write failing workflow-shape test, run to confirm failure.
- [ ] Add push-to-main jobs (PHP/Node/Browser, package, deploy) with needs, secrets guard, pinned SSH host, checksum, concurrency.
- [ ] Add secure setup guide with variable/secret names, HostPress CHROOT guidance, bootstrap and rollback.
- [ ] Run tests and full GitHub Actions CI on PR. Never merge/deploy without review.
