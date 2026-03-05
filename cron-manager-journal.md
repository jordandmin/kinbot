# KinBot Cron Manager Journal

## 2026-03-05 13:01 UTC
### Audit summary
- **Active KinBot crons:** 19 (+ 3 non-KinBot: PinchChat, woodbrass-reply-check, reddit-token-refresh, bot-chronicles, HN Show HN one-shot)
- **New since last audit:** `kinbot-docs-site` (2h, Opus) created today

### Healthy (productive, well-tuned)
- **kinbot-mini-apps** (2h, Opus) — Still the star. Shipped Calendar, MarkdownEditor, ColorPicker components. 600s timeout appropriate.
- **kinbot-memory-research** (3h, Opus) — Shipped subject-based score boosting. Productive.
- **kinbot-add-tests** (2h, Opus) — Solid. 1898+ tests. 900s timeout working well.
- **kinbot-release** (3x/day, Opus) — Just shipped v0.11.1 with 56 commits. Clean workflow.
- **kinbot-ci-watchdog** (3h, Opus) — CI green ✅ in ~8s most runs. Very efficient.
- **kinbot-promo** (4x/day, Opus) — Reddit API fails intermittently but falls back to Twitter. Working.
- **kinbot-qa-explorer** (4h, Opus) — Creating real issues, found and filed #61, #62. 900s timeout good.
- **kinbot-e2e-tests** (6h, Opus) — Fixing real E2E failures. Good interval.
- **kinbot-improve-cli** (6h, Opus) — Added --completions. Productive.
- **kinbot-github-maintenance** (4h, Opus) — README, CI hygiene. Good.
- **kinbot-improve-site** (4h, Opus) — Plugin section, FAQ, comparison table. Good.
- **kinbot-i18n-audit** (12h, Opus) — Appropriate interval.
- **kinbot-sse-reactivity** (12h, Opus) — Appropriate interval.
- **kinbot-consistency-guardian** (12h, Opus) — Good refactoring work.
- **kinbot-plugin-improve** (2h, Opus) — Prompt was fixed last audit (no more PR creation). Last run: created Pomodoro plugin. Productive.
- **kinbot-community** (4h, Opus) — Finally doing real work when issues exist (#61, #62 fixed). Still many "nothing to do" runs but 4h is acceptable. The `cron:docs` skip instruction added.
- **kinbot-docs-site** (2h, Opus) — NEW. Just created. First run pending. Will scaffold Starlight docs site.

### Issues found

1. **`.marlbot-context.md` STILL MISSING** (3rd audit noting this)
   - Multiple crons show `cat .marlbot-context.md: No such file or directory` in their runs
   - Crons that reference it: community, memory-research, add-tests, plugin-improve, improve-cli, e2e-tests, github-maintenance, improve-site, qa-explorer, consistency-guardian, i18n-audit, sse-reactivity, mini-apps, docs-site
   - They proceed without it, but they're missing project context that could improve their work quality
   - **This needs Nicolas to either recreate the file or have a cron create it**

2. **kinbot-community still tries to `gh pr review --approve` its own PRs**
   - Seen in runs from Mar 4-5: "Can not approve your own pull request"
   - The cron is MarlBurroW (same account), so self-approval always fails
   - Wastes a tool call per PR. Should just merge directly or comment instead.

### Actions taken
- **None this run** — ecosystem is stable. The last audit's optimizations (community 1h→4h, plugin-improve PR fix) are working well. No new breakage.

### Proposals (for Nicolas to decide)

1. **Recreate `.marlbot-context.md`** — This is the biggest gap. Every single KinBot cron references it. Either:
   - Have Nicolas create it manually with project overview
   - Create a cron that generates/maintains it from README + package.json + directory structure
   - Or remove references from all prompts (wasteful)

2. **Model downgrade: kinbot-ci-watchdog** (repeated proposal)
   - 95%+ of runs are "CI green ✅" in 8s on Opus. Could use Gemini Flash, saving significant cost.
   - Only needs Opus when actually fixing CI (rare).

3. **kinbot-community: remove self-PR-approval attempts**
   - Add to prompt: "Do NOT try to approve PRs (you're the same GitHub account). Just merge directly if CI passes, or comment."

4. **New cron proposal: kinbot-docs-site is covering #66/#67/#68**
   - The docs-site cron was just created and covers documentation. Good. No additional cron needed.

### Cost analysis
- 19 active KinBot crons, all on Opus 4.6
- Most expensive per run: kinbot-qa-explorer (900s timeout, browser interactions), kinbot-mini-apps (600s, complex SDK work), kinbot-e2e-tests (600s, Playwright)
- Most efficient: kinbot-ci-watchdog (~8s/run when green), woodbrass-reply-check (<1s on Gemini Flash), reddit-token-refresh (<1s on Gemini Flash)
- The ecosystem is now well-tuned. No major waste detected.

### Next audit focus
- Monitor kinbot-docs-site first runs (does it scaffold successfully?)
- Check if `.marlbot-context.md` gets recreated
- Monitor the HN Show HN launch tomorrow (one-shot cron)
- Review if any new crons created by other crons need oversight

## 2026-03-05 07:00 UTC
### Audit summary
- **Active KinBot crons:** 18 (+ 4 non-KinBot: PinchChat, woodbrass-reply-check, reddit-token-refresh, bot-chronicles, HN Show HN one-shot)

### Healthy (productive, well-tuned)
- **kinbot-mini-apps** (2h, Opus) — Incredibly productive. 29 runs visible, shipped ~50 components, 25 hooks, SDK v1.14+, routing, charts, templates. Consistently ships. Occasional timeouts (300s) but recovers. 1875 tests now.
- **kinbot-memory-research** (3h, Opus) — Steady R&D work on hybrid search, re-ranking, consolidation. Good interval.
- **kinbot-add-tests** (2h, Opus) — Very productive, test count went from ~200 to 1875+. Occasional timeouts and "AI overloaded" but recovers well.
- **kinbot-release** (3x/day, Opus) — Clean workflow, skips when nothing to release. Well-behaved.
- **kinbot-ci-watchdog** (3h, Opus) — Mostly "CI green ✅" in 8s. Fixed multiple real CI breaks. Efficient at current interval.
- **kinbot-promo** (4x/day, Opus) — Reddit API failures frequent but falls back to Twitter. Always produces actions.
- **kinbot-qa-explorer** (4h, Opus) — Creating useful issues via browser testing. Found real bugs (#22, #46, #54, etc). 900s timeout appropriate.
- **kinbot-e2e-tests** (6h, Opus) — Focused on fixing/adding Playwright tests. Good interval.
- **kinbot-improve-cli** (6h, Opus) — Steady installer improvements.
- **kinbot-github-maintenance** (4h, Opus) — README, CI, repo hygiene. Productive.
- **kinbot-improve-site** (4h, Opus) — Landing page improvements, plugin section. Productive.
- **kinbot-i18n-audit** (12h, Opus) — Appropriate interval, finds real i18n gaps.
- **kinbot-sse-reactivity** (12h, Opus) — Appropriate interval, finds and fixes real SSE gaps.
- **kinbot-consistency-guardian** (12h, Opus) — Refactoring/consistency work. Appropriate.

### Issues found & actions taken

1. **kinbot-community** (was 1h → changed to **4h**)
   - **Problem:** MASSIVE waste. Ran every hour on Opus, and ~80% of runs said "Nothing to do" in 10-15s (2 i18n issues sitting there as "good first issue" templates). When there ARE real issues/PRs, it handles them well, but the idle polling is burning tokens.
   - **Evidence:** 50+ consecutive "Nothing to do" runs visible in history, each taking 10-15s on Opus.
   - **Action:** Changed interval from 1h to 4h. Still responsive enough for community activity. The QA explorer and other crons create issues faster than community members do.

2. **kinbot-plugin-improve** (prompt fixed — no more PR creation)
   - **Problem:** Every single run failed at the end trying `gh pr create` which errored "you must first push the current branch to a remote". The cron was working on feature branches and trying to create PRs, but since it's all the same GitHub user (MarlBurroW), it can't approve its own PRs anyway. The work was being done but the PR step always failed.
   - **Evidence:** Last 5 runs all show the same PR creation failure.
   - **Action:** Fixed the prompt to work directly on main branch (no feature branches, no PRs). This matches how all other KinBot crons work.

### No action needed
- **kinbot-ci-watchdog** — Efficient at 3h. Already optimized to 10.8Kms interval last audit.
- **woodbrass-reply-check** — Already on Gemini Flash, finishes in <1s. Will auto-resolve when the Woodbrass order is delivered.
- **HN Show HN** — One-shot scheduled for tomorrow, will auto-delete after running.

### Cost analysis
**Savings from today:**
- kinbot-community: ~18 wasted Opus runs/day eliminated (from 24 to 6 runs/day)
- kinbot-plugin-improve: no longer wastes 30s per run on failed PR creation

### Proposals (for Nicolas to decide)
1. **Model downgrade candidate:**
   - `kinbot-ci-watchdog` — 90%+ of runs are "CI green" in 8s on Opus. Could use Gemini Flash for the check, saving significant cost. Only needs Opus when actually fixing CI.

2. **Potential merge:**
   - `kinbot-community` and `kinbot-qa-explorer` sometimes overlap (QA files issues, community implements them). Could potentially coordinate better, but they serve different purposes so probably fine as-is.

3. **`.marlbot-context.md` is missing** — Multiple crons reference this file but it doesn't exist anymore. Several crons show `cat .marlbot-context.md: No such file or directory`. This causes them to proceed without context. Either recreate the file or remove references from prompts.

### Next audit focus
- Monitor kinbot-community at 4h — does it miss any real issues?
- Monitor kinbot-plugin-improve — does the main-branch workflow cause conflicts?
- Check if `.marlbot-context.md` needs to be recreated
- Review kinbot-mini-apps timeout situation (7 timeouts in ~60 runs, maybe bump to 600s)

## 2026-03-04 21:06 UTC
### Audit summary
- **Active KinBot crons:** 16
- **Non-KinBot crons:** 5 (PinchChat, woodbrass-reply-check, reddit-token-refresh, bot-chronicles, HN Show HN one-shot)

### Healthy (productive, well-tuned)
- **kinbot-mini-apps** (2h, Opus) — consistently shipping components, hooks, templates. Very productive.
- **kinbot-memory-research** (3h, Opus) — shipped hybrid search, LLM re-ranking, multi-query retrieval, adaptive K. Great R&D cron.
- **kinbot-add-tests** (2h, Opus) — steadily adding test files. Occasional timeouts (600s) and "AI overloaded" but recovers.
- **kinbot-release** (3x/day, Opus) — clean workflow, skips when nothing to release. Well-behaved.
- **kinbot-ci-watchdog** (3h, Opus) — mostly "CI green ✅" in 8s. Efficient. 3h interval is appropriate.
- **kinbot-promo** (4x/day, Opus) — Reddit API failures are frequent but falls back to Twitter. Always produces at least 1 action per run.
- **kinbot-qa-explorer** (4h, Opus) — creating useful issues via browser testing. 900s timeout appropriate for browser work.
- **kinbot-e2e-tests** (6h, Opus) — focused on fixing/adding Playwright tests. Good interval.
- **kinbot-improve-cli** (6h, Opus) — steady installer improvements.
- **kinbot-github-maintenance** (4h, Opus) — README, CI, repo hygiene. Productive.

### Issues found & actions taken

1. **kinbot-community** (was 2h → changed to **6h**)
   - **Problem:** ~80% of runs return "Nothing to do" in 10-15s. Only 2 template issues exist as "good first issue". Running every 2h on Opus is pure waste.
   - **Action:** Changed interval from 2h to 6h. Still responsive enough for real community activity.

2. **kinbot-i18n-audit** (was 2h → changed to **12h**)
   - **Problem:** Repeatedly reports "i18n is in excellent shape" across many consecutive runs. The i18n work is essentially done.
   - **Action:** Changed interval from 2h to 12h. Will still catch regressions from new features.

3. **kinbot-sse-reactivity** (was 2h → changed to **12h**)
   - **Problem:** SSE coverage has been confirmed comprehensive and complete across multiple runs. Multiple timeouts at 300s despite having nothing new to find. Keeps re-auditing completed work.
   - **Action:** Changed interval from 2h to 12h. Sufficient to catch new SSE gaps from other crons' code changes.

### No run history available
- kinbot-consistency-guardian, kinbot-improve-site, kinbot-improve-cli, kinbot-e2e-tests, kinbot-github-maintenance — no run history returned (possibly purged or too old). They appear healthy based on their state (no consecutive errors, recent lastRunAt).

### Cost analysis
All KinBot crons run on Opus 4.6. The biggest token wasters were the three crons above running every 2h with nothing to do. Estimated savings from today's changes: ~18 Opus runs/day eliminated (6 community + 6 i18n + 6 SSE reduced to 4+2+2).

### Proposals (for Nicolas to decide)
1. **Model downgrade candidates:**
   - `kinbot-ci-watchdog` — 90% of runs are "CI green" in 8s. Could use Gemini Flash instead of Opus. Only needs Opus when actually fixing CI.
   - `kinbot-community` — when there are no issues/PRs, the "nothing to do" check is trivial. Could use Flash for the check and only escalate to Opus if work is found. (Harder to implement with current cron system.)

2. **Potential new cron:**
   - **kinbot-plugin-system** — no cron covers the plugin/tool system (`src/server/tools/`). Could improve built-in tools, add new ones, improve tool descriptions for better Kin usage.

### Next audit focus
- Check actual token usage per cron if possible
- Monitor whether the 3 adjusted crons still catch real work at their new intervals
- Review kinbot-promo Reddit failures pattern (is the token refresh cron working?)
