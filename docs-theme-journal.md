# Docs Theme Journal

## Run 1 — 2026-03-06

### Done
1. **Custom CSS foundation** — Complete overhaul of `custom.css`:
   - Imported Plus Jakarta Sans font via Google Fonts
   - Added custom Aurora tokens (`--kb-gradient-*`, `--kb-glass-*`) for both dark/light
   - Made nav/sidebar backgrounds semi-transparent for glass effect
   - Background orbs via `body::before`/`::after` (fixed, blurred radial gradients)
   - Gradient headings (h1) using Aurora palette
   - Glass-effect cards, link cards, asides, pagination links
   - Gradient CTA buttons with pill shape
   - Enhanced code blocks with Aurora palette colors
   - Styled asides (note/tip/caution/danger) with glass bg + colored left borders
   - Custom scrollbar styling
   - Search modal glass backdrop
   - Mobile menu glass effect
   - Table styling, badge pills, link hover effects

2. **Header component override** — `src/components/Header.astro`:
   - Wraps default Starlight Header
   - Adds 2px gradient accent line at the top of the page (Aurora gradient)

3. **Head component override** — `src/components/Head.astro`:
   - Preconnects to Google Fonts for faster font loading

4. **astro.config.mjs** — Registered Header and Head component overrides

### Build
- ✅ Clean build, 34 pages, 0 errors

## Run 2 — 2026-03-06

### Done
1. **Sidebar component override** — `src/components/Sidebar.astro`:
   - Active link with gradient left border (purple → pink) via ::before pseudo-element
   - Hover effect on non-active links (subtle purple tint)
   - Section group headings with gradient text
   - Separator lines between sidebar groups
   - Bottom fade effect on sidebar pane
   - Removed duplicate sidebar CSS from custom.css (moved to component)

2. **Hero component override** — `src/components/Hero.astro`:
   - Wrapper with radial gradient orb glow behind hero
   - Gradient title (purple → pink → peach) matching landing site
   - Enhanced tagline styling with max-width

3. **Footer component override** — `src/components/Footer.astro`:
   - Gradient separator line at top
   - Glass-effect pagination links with hover transform
   - Light mode variant

4. **PageFrame component override** — `src/components/PageFrame.astro`:
   - Third background orb (warm peach, mid-page right area)
   - Gradient sidebar border instead of solid

5. **CSS enhancements**:
   - Table of Contents: active/hover states with accent colors
   - CardGrid (splash page): glass cards with gradient titles, hover transform
   - Inline code: purple-tinted background with subtle border
   - Blockquotes: gradient left border + glass background
   - HR: gradient line (purple → pink → transparent)

### Build
- ✅ Clean build, 34 pages, 0 errors

### Registered overrides in astro.config
- Header, Head, Sidebar, Hero, Footer, PageFrame (6 total)

### Next priorities
- Visual verification on deployed site — iterate on rough edges
- Fine-tune expressive-code syntax token colors to better match sugar-high palette
- Consider overriding SiteTitle for gradient logo text
- Mobile responsive tweaks if needed
- Tab styling in code blocks (file tabs)

## Run 3 — 2026-03-06

### Done
1. **SiteTitle component override** — `src/components/SiteTitle.astro`:
   - Gradient text on site title (purple → pink → peach) matching landing
   - Font weight 700 for bolder presence
   - Light mode variant with darker gradient stops

2. **Expressive-code syntax token colors** — Full sugar-high palette mapping:
   - Dark: keywords pink, strings green, comments slate, types fuchsia, props cyan, constants lavender
   - Light: matching saturated variants for readability
   - Replaces old `.sh` vars with proper `--ec-tm-*` tokens

3. **Code block tab styling**:
   - Active tab with accent bottom border (purple)
   - Tab bar backgrounds matching Aurora dark/light palette
   - Terminal title bar colors
   - Rounded tab tops

4. **UI refinements**:
   - Theme select button: pill shape with subtle border + hover accent
   - Social icons: hover scale + accent color
   - Search button: pill shape with accent hover border
   - Right sidebar (TOC): subtle gradient border on desktop
   - Definition list styling (dt/dd)
   - Steps ordered list: accent-colored markers
   - Reduced-motion media query

5. **Mobile responsive polish**:
   - Slightly smaller body text on mobile
   - Full-bleed code blocks (negative margin, no border-radius)
   - Tighter hero padding

### Build
- ✅ Clean build, 34 pages, 0 errors

### Registered overrides in astro.config
- Header, Head, SiteTitle, Sidebar, Hero, Footer, PageFrame (7 total)

### Next priorities
- Visual verification on deployed site — iterate on rough edges
- Verify syntax highlighting actually picks up `--ec-tm-*` tokens (may need Starlight theme config)
- Consider PageTitle override for gradient on content page h1s
- Possible TableOfContents override for better active indicator
- Light mode fine-tuning (ensure orbs + glass look good)
