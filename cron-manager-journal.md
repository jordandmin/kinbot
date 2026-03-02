# KinBot Cron Manager Journal

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
