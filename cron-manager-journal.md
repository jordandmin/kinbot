# KinBot Cron Manager Journal

## 2026-03-22 13:09 UTC
### Audit summary
- **Active crons:** 16 KinBot + 3 other (PinchChat, reddit-token-refresh, cron-manager)
- **Disabled crons:** 24 (all appropriately disabled)

### Healthy crons (doing good work)
- **kinbot-add-tests** (8h, Opus) — 3131+ tests, very productive, last run 779s
- **kinbot-ci-watchdog** (6h, Opus) — essential, last run 9s, CI green
- **kinbot-promo** (daily 14:00, Opus) — GitHub PRs, Reddit posts, working well
- **kinbot-docs-content** (6h, Opus) — writing docs, last run 28s (quick)
- **kinbot-memory-research** (12h, Opus) — R&D, shipping improvements
- **kinbot-github-maintenance** (12h, Opus) — repo hygiene
- **kinbot-improve-site** (12h, Opus) — landing polish
- **kinbot-qa-explorer** (12h, Opus) — browser QA
- **kinbot-plugin-improve** (8h, Opus) — plugin system
- **kinbot-improve-cli** (daily, Opus) — installer improvements
- **kinbot-sse-reactivity** (daily, Opus) — SSE event coverage
- **kinbot-i18n-audit** (2 days, Opus) — i18n completeness
- **kinbot-consistency-guardian** (2 days, Opus) — refactoring
- **kinbot-community** (daily, Opus) — handles issues/PRs
- **kinbot-release** (daily 17:00 UTC, Opus) — last run released v0.27.1
- **PinchChat** (3x/day, Opus) — merged PR #29, released v1.71.0
- **reddit-token-refresh** (12h, Gemini Flash) — cheap, quick, 2.5s

### Issues found

1. **kinbot-cron-manager** (this cron) — timed out last run (600s). The audit process itself is too slow when pulling full run histories for all crons. Need to be more efficient. No config change needed, just work faster.

2. **kinbot-add-tests** — last run took 779s out of 900s timeout. Getting close to the limit as test count grows. Monitor for timeouts.

3. **kinbot-e2e-tests** — remains disabled. 3 consecutive 900s timeouts. The agent keeps running Playwright locally despite explicit instructions not to. Correctly disabled.

### No action taken
Everything is running well. Previous audits have done a good job tuning intervals and timeouts.

### Standing proposals (for Nicolas to decide)
- **kinbot-ci-watchdog → Gemini Flash** (15th time proposing). 95%+ runs are "CI green ✅" in 8-11s on Opus. The watchdog just runs `gh run list` and checks the conclusion. Massive cost savings potential.
- **PinchChat frequency reduction** — The project is feature-complete and in "excellent shape" per its own assessment. Recent runs: mostly "nothing actionable", "codebase in excellent shape". 3x/day on Opus is overkill. Suggest 1x/day.

### Cost observations
- 16 active KinBot crons, all on Opus 4.6
- Cheapest: reddit-token-refresh (Flash, 2.5s)
- PinchChat runs are increasingly finding nothing to do
- kinbot-ci-watchdog averages 8-11s for the "green" path on Opus

### Next audit focus
- Monitor kinbot-add-tests for timeout (779s/900s is tight)
- Check if any new coverage gaps have appeared in KinBot src/
