# KinBot Cron Manager Journal

## 2026-03-04 07:00 UTC
### Audit summary
- **Active KinBot crons:** 16 (+ 4 non-KinBot: PinchChat, bot-chronicles, reddit-token-refresh, woodbrass-reply-check)
- **Healthy:** kinbot-memory-research, kinbot-community, kinbot-add-tests, kinbot-github-maintenance, kinbot-i18n-audit, kinbot-sse-reactivity, kinbot-ci-watchdog, kinbot-release, kinbot-mini-apps, kinbot-e2e-tests, kinbot-improve-cli, kinbot-consistency-guardian, kinbot-improve-site, kinbot-promo, PinchChat, bot-chronicles, reddit-token-refresh, woodbrass-reply-check
- **Issues found:**
  1. **kinbot-qa-explorer** — 1 timeout at 600s. Browser-based QA testing is inherently slow (successful runs take 500-570s). The 600s timeout is too tight.
  2. **kinbot-qol-features** — disabled, still has 3 consecutive timeouts at 300s. This cron has a ~50% timeout rate historically. Overlaps heavily with kinbot-improve-ux (also disabled). Both should stay disabled.

### Actions taken
1. **Increased kinbot-qa-explorer timeout**: 600s → 900s. Browser automation runs consistently take 500-570s when they succeed, leaving almost no margin at 600s. 900s gives comfortable headroom.

### Observations
- **woodbrass-reply-check**: Fixed last audit (model dot vs hyphen). Now running perfectly on Gemini Flash, completing in ~600ms. Very efficient.
- **kinbot-qol-features + kinbot-improve-ux**: Both disabled. These overlap significantly (both add frontend QoL features). If re-enabled, merge into one with 600s timeout. Propose keeping just one.
- **Git activity is healthy**: 30 recent commits from multiple crons (mini-apps, tests, memory, i18n, e2e, installer, community issues). No git conflicts observed.
- **kinbot-qa-explorer doing great work**: When it runs successfully, it finds real bugs and creates proper GitHub issues (#22-#31 in recent runs). Worth keeping despite occasional timeouts.
- **Cost observation**: 16 active KinBot crons on Opus 4.6. Many run every 2h. That's ~100+ Opus runs/day. The productive ones (community, tests, mini-apps, sse-reactivity) produce real commits. The watchdog/release crons are lightweight (8-140s). Good cost/value ratio overall.

### Proposals (for Nicolas to decide)
1. **Merge kinbot-qol-features + kinbot-improve-ux**: If re-enabling either, merge them into a single cron. They have near-identical scope.
2. **Consider Sonnet 4.6 for lightweight crons**: kinbot-ci-watchdog (8s runs, just checks CI), kinbot-release (checks if there's anything to release, often "nothing to do"), and kinbot-github-maintenance could potentially use a cheaper model. These are mostly git/gh commands with simple logic.

### Next audit focus
- Monitor kinbot-qa-explorer after timeout increase (should eliminate the timeout issue)
- Check if any crons are producing duplicate/conflicting commits
- Review kinbot-promo effectiveness (4x/day on Opus is expensive for social media posting)

## 2026-03-02 07:00 UTC
### Audit summary
- **Active KinBot crons:** 17 (+ 3 non-KinBot: PinchChat, bot-chronicles, reddit-token-refresh, woodbrass-reply-check)
- **Healthy:** kinbot-memory-research, kinbot-community, kinbot-add-tests, kinbot-kin-context, kinbot-github-maintenance, kinbot-channel-files, kinbot-i18n-audit, kinbot-sse-reactivity, kinbot-ci-watchdog, kinbot-release, kinbot-mini-apps, kinbot-e2e-tests, kinbot-frontend-perf, kinbot-consistency-guardian, PinchChat, bot-chronicles, reddit-token-refresh
- **Issues found:**
  1. **woodbrass-reply-check** — model `anthropic/claude-sonnet-4-6` (hyphen) not allowed. Should be `anthropic/claude-sonnet-4.6` (dot). 2 consecutive errors.
  2. **kinbot-improve-site** — 3 consecutive timeouts at 300s. The site is very mature now (60+ successful runs with major improvements). Runs are getting complex as the cron reads more existing code.
  3. **kinbot-improve-cli** — 1 timeout at 300s. Installer is now 3500+ lines, runs naturally take longer to read and modify.
  4. **kinbot-qol-features** — disabled, but was timing out consistently (3 consecutive) at 300s before being disabled. Many runs also timed out throughout its history (~50% timeout rate).

### Actions taken
1. **Fixed woodbrass-reply-check model**: changed `anthropic/claude-sonnet-4-6` → `anthropic/claude-sonnet-4.6`
2. **Increased kinbot-improve-site timeout**: 300s → 600s (site cron does heavy reads + builds)
3. **Increased kinbot-improve-cli timeout**: 300s → 600s (installer is 3500+ lines, shellcheck runs take time)

### Observations
- **kinbot-qol-features** (disabled): had a ~50% timeout rate at 300s with 1h frequency. If re-enabled, needs 600s timeout.
- **kinbot-improve-site** has done incredible work (60+ improvements: FAQ, comparison table, providers grid, SEO, code splitting, accessibility, etc.). The site is reaching maturity. Consider slowing its frequency from every 3h to every 6h or 12h.
- **Coordination risk**: kinbot-improve-site, kinbot-add-tests, kinbot-channel-files, kinbot-sse-reactivity, kinbot-qol-features, kinbot-frontend-perf, kinbot-mini-apps all edit `src/` files. With many running hourly, git conflicts are likely. The CI watchdog helps catch breakage but doesn't prevent conflicts.
- **Cost observation**: 17 active KinBot crons on Opus 4.6, many running every 1-3h. That's potentially 100+ Opus runs/day. The memory-research and e2e-tests crons use 600s timeouts and can run long.

### Proposals (for Nicolas to decide)
1. **Slow down kinbot-improve-site**: 3h → 6-12h. The site is very polished now. Diminishing returns.
2. **Consider Sonnet 4.6 for simpler crons**: kinbot-ci-watchdog (just checks CI status), reddit-token-refresh (already on Gemini Flash), kinbot-release (mostly git operations) could use a cheaper model.
3. **Merge consideration**: kinbot-improve-ux + kinbot-qol-features overlap significantly. Both are disabled. If re-enabling, merge into one.

### Next audit focus
- Check for git conflicts between overlapping crons
- Review kinbot-e2e-tests run duration (last run was 1200s = 20 minutes, within 600s timeout somehow?)
- Monitor woodbrass-reply-check after model fix
