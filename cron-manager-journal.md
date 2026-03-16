## 2026-03-16 13:06 UTC
### Audit summary
- **Active crons:** 17 (+ this manager = 18)
- **Disabled crons:** 18 (all appropriately disabled, old features/projects)

### Healthy crons (doing good work)
- **kinbot-add-tests** (8h, Opus) — steadily adding unit tests, now at 2500+ tests. Productive.
- **kinbot-ci-watchdog** (6h, Opus) — catches and fixes CI breaks promptly. Essential.
- **kinbot-release** (daily 17:00 UTC, Opus) — releases regularly (v0.22.1 latest). Working well.
- **kinbot-promo** (daily 14:00, Opus) — GitHub PRs to awesome lists, Reddit posts. Productive.
- **kinbot-docs-content** (6h, Opus) — writing docs content. Productive.
- **kinbot-code-scanning-fixer** (12h, Opus) — fixing CodeQL alerts. Will self-disable when done.
- **kinbot-memory-research** (12h, Opus) — R&D on memory system. Productive.
- **kinbot-github-maintenance** (12h, Opus) — repo hygiene. Productive.
- **kinbot-improve-site** (12h, Opus) — landing site polish. Productive.
- **kinbot-qa-explorer** (12h, Opus) — browser-based QA testing. Productive.
- **kinbot-plugin-improve** (8h, Opus) — plugin system work. Productive.
- **kinbot-improve-cli** (daily, Opus) — installer improvements. Productive.
- **kinbot-sse-reactivity** (daily, Opus) — SSE event coverage. Productive.
- **kinbot-i18n-audit** (2 days, Opus) — i18n completeness. Productive.
- **reddit-token-refresh** (12h, Gemini Flash) — cheap, quick, necessary.
- **woodbrass-reply-check** (4h, Gemini Flash) — cheap, monitoring a delivery.

### Issues found & actions taken

1. **kinbot-community** (was every 8h → changed to every 12h)
   - **Problem:** 30+ consecutive "nothing to do" runs. Only open issues are cron:docs (skipped) and i18n translations waiting on external contributors. Running every 8h was pure waste.
   - **Action:** Changed from 8h to 12h interval. Still checks twice daily which is enough for a community maintainer role.

2. **kinbot-consistency-guardian** (timeout 300s → 600s)
   - **Problem:** Frequent timeouts (300s). Last run timed out. The cron often needs more time for code analysis and refactoring.
   - **Action:** Increased timeout from 300s to 600s. Schedule stays at every 2 days (appropriate since codebase is well-factored, most runs find nothing to do).

3. **PinchChat** (5x/day → 3x/day)
   - **Problem:** Project is very mature (v1.69.x, 257 tests, 0 lint errors). Recent runs often find "nothing to do" or do trivial work. 5 runs/day at 900s Opus each is expensive for diminishing returns.
   - **Action:** Reduced from 5x/day (8,11,14,17,20) to 3x/day (9,14,20). Still checks GitHub issues/PRs 3 times daily.

4. **kinbot-release** (timeout 300s → 600s)
   - **Problem:** Sometimes times out at 300s, especially when running tests + building + tagging. Last successful run took 586s.
   - **Action:** Increased timeout from 300s to 600s.

### No action needed (working fine)
- **kinbot-e2e-tests** — disabled, was timing out constantly running Playwright locally. Correctly disabled; the prompt now says "NEVER run Playwright" but it's still disabled which is fine.
- All disabled crons (Twitter, email, Moltbook, infra, etc.) — appropriately paused.

### Proposals (for Nicolas to decide)
- **kinbot-community could use Gemini Flash** instead of Opus for the "nothing to do" checks. Most runs just list issues, see nothing open, and stop. A cheaper model could handle the triage step, only escalating to Opus when there's actual work.
- **Consider disabling kinbot-consistency-guardian** temporarily. The codebase is well-factored (confirmed by multiple audit runs finding nothing). Could re-enable after a burst of new feature development.

### Cost observations
- Most expensive crons by token usage (Opus runs): kinbot-add-tests (8h, 900s timeout, long runs), PinchChat (3x/day now, 900s), kinbot-community (12h now, 600s)
- Cheapest: reddit-token-refresh and woodbrass-reply-check (Gemini Flash, complete in 1-2s)

### Next audit focus
- Check if kinbot-community continues to have "nothing to do" at the new 12h interval
- Monitor kinbot-consistency-guardian timeout at 600s
- Review if kinbot-code-scanning-fixer has self-disabled (should when all alerts fixed)
