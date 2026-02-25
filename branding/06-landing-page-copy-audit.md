# KinBot — Landing Page Copy Audit & Refinements

*Run #6 — 2026-02-25*

Focus: **Sharpen the site copy, fix inconsistencies, and suggest concrete text changes.**

---

## Audit Findings

### 1. Provider Count Inconsistency (Critical)

The number is different everywhere:
- **Features.tsx**: "8 providers out of the box"
- **FAQ.tsx**: "Over 20 providers"
- **README.md**: "19 providers"
- **Comparison.tsx**: "Multi-Provider (8+)"

**Action:** Pick one number. The FAQ lists ~19 by name. Use **"19+ providers"** everywhere, or count the actual code. The Features card saying "8" is the worst offender since it undersells the product.

### 2. License Inconsistency

- **README badges**: AGPL-3.0
- **FAQ answer**: "open-source under the MIT license"
- **Hero badge**: AGPL-3.0

**Action:** FAQ says MIT, everything else says AGPL-3.0. Fix the FAQ to match the actual license.

### 3. Hero Sub-headline Could Hit Harder

Current:
> "Self-hosted specialized AI agents with persistent identity, continuous memory, and real collaboration. One server. One file. Zero infrastructure."

This is a feature list disguised as a tagline. The main tagline ("AI agents that actually remember you") is great. The sub should reinforce the emotional hook, not enumerate features.

**Suggested rewrite:**
> "Create AI agents that live on your server, remember everything, and work together. One process, one file, zero cloud."

Shorter, punchier, still hits the key points.

### 4. Mock Chat Preview — Good but Could Be Better

The fake conversation is solid. One tweak: the user question is too corporate ("market analysis"). For the r/selfhosted audience, something more relatable:

**Suggested replacement:**

User: "What was that Docker config we figured out last week?"

Aria: "From our session on Feb 17th — you switched from Traefik to Caddy for the reverse proxy. Here's the docker-compose.yml I helped you write. Want me to pull it up?"

This resonates with self-hosters instantly. They've all had that moment of "I know we solved this, where was it?"

### 5. FAQ — Missing Key Questions

Two questions the r/selfhosted crowd will immediately ask:

**"How much disk space / RAM does it need?"**
> Minimal. KinBot uses ~100MB RAM at idle. Storage depends on your usage — a SQLite file grows with conversations and memory entries. A typical single-user instance stays under 500MB for months. No Redis, no Postgres, no external services needed.

**"Can I migrate from ChatGPT / Open WebUI?"**
> Not yet, but it's on the roadmap. For now, KinBot starts fresh with a clean memory. The upside: your agents build genuine long-term context from day one instead of importing noisy chat logs.

### 6. Comparison Table — Add AnythingLLM

The branding docs mention AnythingLLM as a competitor, but it's missing from the comparison table. It's popular on r/selfhosted. Adding it strengthens the positioning.

### 7. GitHubCTA Section — Copy Is Flat

Current: "KinBot is free, open source, and community-driven. Star the repo to follow progress, or jump in and contribute."

Every open-source project says this. More personality:

**Suggested:** "KinBot is built by one person who got tired of AI forgetting everything. It's open source, actively developed, and looking for early adopters who want to push it further."

This is authentic, matches the indie vibe from the branding docs, and creates curiosity.

### 8. Features Section — "Multi-Provider" Card Undersells

Current: "8 providers out of the box — Anthropic, OpenAI, Gemini, Mistral, Groq, Together AI, Voyage, Brave Search."

This lists 8 names but the actual count is 19+. Either list them all (messy) or go with:

**Suggested:** "19 providers — from Anthropic and OpenAI to Ollama for fully local inference. Add an API key, capabilities auto-detected."

Mentioning Ollama here is strategic: the self-hosted crowd loves local-first.

---

## Summary of Concrete Changes

| File | What | Priority |
|------|------|----------|
| FAQ.tsx | Fix "MIT" → "AGPL-3.0" | 🔴 Critical (factual error) |
| Features.tsx | Change "8 providers" → "19 providers", mention Ollama | 🟡 Important |
| Comparison.tsx | Change "Multi-Provider (8+)" → "Multi-Provider (19+)" | 🟡 Important |
| Hero.tsx | Rewrite sub-headline (shorter, punchier) | 🟡 Nice to have |
| Hero.tsx | Replace mock chat with self-hoster-friendly example | 🟡 Nice to have |
| FAQ.tsx | Add RAM/disk question and migration question | 🟡 Important |
| Comparison.tsx | Add AnythingLLM column | 🟡 Nice to have |
| GitHubCTA.tsx | Rewrite copy with more personality | 🟢 Nice to have |

---

## Next Run Suggestion

With 6 branding docs now, the next run should either:
1. **Execute the fixes above** (actually edit the .tsx files and commit), or
2. **Focus on the #1 blocker from Run #5: screenshots.** Nothing else matters as much for first impressions.
