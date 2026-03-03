# KinBot QA Journal

## 2026-03-03 04:40 UTC
### Area tested: (none - blocked)
- **Issue:** Could not access the app. Sandbox browser is disabled (`agents.defaults.sandbox.browser.enabled` is false), host browser requires Chrome extension tab attachment, and `web_fetch` blocks private IPs.
- **Action needed:** Enable sandbox browser in OpenClaw config, or attach a Chrome tab before running QA.
- **Bugs found:** 0
- **UX suggestions:** 0

### Next run
- Area 1: Onboarding / First run (once browser access is resolved)

## 2026-03-03 16:40 UTC
### Area tested: Login / Authentication
- **Pages visited:** Login page (`/`), Invalid invite page (`/invite/test-invalid-token`), Non-existent page redirect
- **Browser:** Used `openclaw` profile (headless Chromium) - works!
- **Login method:** Used JS `evaluate` to set React input values (native `type` action doesn't trigger React state updates on this app)
- **Bugs found:** 2 (issues created: #22, #23)
  - **#22 (bug):** App crashes with `TypeError: Cannot read properties of null (reading 'charAt')` when a user has no `user_profiles` row. Root cause: `UserMenu.tsx` accesses `user.firstName.charAt(0)` without null check. Affects 4 files.
  - **#23 (bug/security):** The `POST /api/auth/sign-up/email` endpoint is open to anyone, allowing unauthenticated account creation even though the UI has no sign-up form. Combined with #22, this means anyone can create accounts that crash the app.
- **UX suggestions:** 1 (issue created: #24)
  - **#24 (enhancement):** Login page missing "Forgot password?" link, loading state on Sign In button, and Enter-to-submit confirmation.
- **All clear:**
  - Invalid credentials error message is clear and well-positioned
  - Show/hide password toggle works correctly (label updates too)
  - Empty form submission handled by HTML5 validation
  - Invalid invite tokens show proper error with "Go to login" button
  - Non-authenticated routes correctly redirect to login
  - Cloudflare Turnstile is integrated (visible in page source, though may not block headless browsers)

### Next run
- Area 2: Kin management (need to login as Nicolas or create a proper test user through onboarding)
- Note: To test authenticated pages, either need Nicolas's password or a way to create users through the onboarding flow
