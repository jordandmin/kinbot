/**
 * Generates og-image.png using satori (Vercel's OG engine) + resvg.
 * Same font files as the site (Plus Jakarta Sans via @fontsource).
 * No browser needed.
 *
 * Usage: bun run gen-og.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const logoB64 = readFileSync(new URL('./public/kinbot.svg', import.meta.url), 'base64')
const logoDataUri = 'data:image/svg+xml;base64,' + logoB64

const PJS = (w) => new URL(
  `./node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff`,
  import.meta.url
)

const fonts = [
  { name: 'PJS', weight: 400, data: readFileSync(PJS(400)) },
  { name: 'PJS', weight: 500, data: readFileSync(PJS(500)) },
  { name: 'PJS', weight: 600, data: readFileSync(PJS(600)) },
  { name: 'PJS', weight: 700, data: readFileSync(PJS(700)) },
  { name: 'PJS', weight: 800, data: readFileSync(PJS(800)) },
]

// Colors matching site dark mode (oklch → hex approximations for satori)
const C = {
  bg: '#0d0b18',
  glowViolet: '#7c3aed',
  glowPink: '#db2777',
  glowPeach: '#f97316',
  cardBg: 'rgba(20,14,42,0.55)',
  cardBorder: 'rgba(139,92,246,0.20)',
  fg: '#ece5f5',
  mutedFg: '#8b8699',
  dimFg: '#5a5470',
}

const pill = (text, color, bgOpacity = 0.15, borderOpacity = 0.40) => ({
  type: 'span',
  props: {
    style: {
      padding: '8px 20px',
      borderRadius: 18,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: 'PJS',
      color,
      background: `rgba(${hexToRgb(color)},${bgOpacity})`,
      border: `1px solid rgba(${hexToRgb(color)},${borderOpacity})`,
    },
    children: text,
  },
})

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

const stat = (value, label, color) => ({
  type: 'div',
  props: {
    style: { display: 'flex', flexDirection: 'column', gap: 4 },
    children: [
      { type: 'div', props: { style: { fontSize: 30, fontWeight: 700, fontFamily: 'PJS', color }, children: value } },
      { type: 'div', props: { style: { fontSize: 14, fontWeight: 400, fontFamily: 'PJS', color: C.dimFg }, children: label } },
    ],
  },
})

const markup = {
  type: 'div',
  props: {
    style: {
      width: 1200,
      height: 630,
      background: C.bg,
      display: 'flex',
      position: 'relative',
      fontFamily: 'PJS',
    },
    children: [
      // Glow orbs
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: -60, left: -60,
            width: 520, height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${hexToRgb(C.glowViolet)},0.14) 0%, transparent 70%)`,
          },
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: -50, right: 100,
            width: 440, height: 440,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${hexToRgb(C.glowPink)},0.11) 0%, transparent 70%)`,
          },
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            bottom: -40, right: -40,
            width: 400, height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${hexToRgb(C.glowPeach)},0.09) 0%, transparent 70%)`,
          },
        },
      },

      // Card
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: 60, left: 72, right: 72, bottom: 60,
            borderRadius: 24,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            display: 'flex',
            padding: '48px 56px',
            gap: 48,
          },
          children: [
            // Top accent line
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  borderRadius: '24px 24px 0 0',
                  background: `linear-gradient(90deg, transparent, ${C.glowViolet}, ${C.glowPink}, transparent)`,
                  opacity: 0.9,
                },
              },
            },

            // Logo
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'flex-start', flexShrink: 0 },
                children: {
                  type: 'img',
                  props: {
                    src: logoDataUri,
                    width: 260,
                    height: 260,
                    style: {},
                  },
                },
              },
            },

            // Content
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 14,
                  flex: 1,
                },
                children: [
                  // Title
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 96,
                        fontWeight: 800,
                        fontFamily: 'PJS',
                        letterSpacing: '-0.025em',
                        lineHeight: 1,
                        backgroundImage: `linear-gradient(135deg, ${C.glowViolet}, ${C.glowPink}, ${C.glowPeach})`,
                        backgroundClip: 'text',
                        color: 'transparent',
                      },
                      children: 'KinBot',
                    },
                  },

                  // Tagline
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: 27, fontWeight: 600, fontFamily: 'PJS', color: C.fg },
                      children: 'AI agents that actually remember you.',
                    },
                  },

                  // Sub-tagline
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: 19, fontWeight: 400, fontFamily: 'PJS', color: C.mutedFg, opacity: 0.8 },
                      children: 'One process · One file · Zero cloud',
                    },
                  },

                  // Pills
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: 12, marginTop: 4 },
                      children: [
                        pill('Self-hosted', '#a78bfa'),
                        pill('Multi-agent', '#ec4899', 0.12, 0.35),
                        pill('Persistent memory', '#fb923c', 0.10, 0.30),
                        pill('Open source', '#a78bfa', 0.12, 0.30),
                      ],
                    },
                  },

                  // Stats
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: 40, marginTop: 12 },
                      children: [
                        stat('22+', 'AI Providers', C.glowViolet),
                        stat('6', 'Chat Platforms', C.glowPink),
                        stat('MCP tools', 'Native + unlimited', '#c084fc'),
                        stat('100%', 'Self-hosted', C.glowPeach),
                      ],
                    },
                  },

                  // GitHub URL
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: 15, fontWeight: 400, fontFamily: 'PJS', color: C.dimFg, opacity: 0.8, marginTop: 6 },
                      children: 'github.com/MarlBurroW/kinbot',
                    },
                  },
                ],
              },
            },
          ],
        },
      },

      // Bottom accent line
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 10,
            background: `linear-gradient(90deg, transparent, ${C.glowViolet}, ${C.glowPink}, transparent)`,
            opacity: 0.7,
          },
        },
      },
    ],
  },
}

const svg = await satori(markup, {
  width: 1200,
  height: 630,
  fonts,
})

writeFileSync(new URL('./public/og-image.svg', import.meta.url), svg)

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
const pngBuffer = resvg.render().asPng()
writeFileSync(new URL('./public/og-image.png', import.meta.url), pngBuffer)
console.log('Done — og-image.png written:', pngBuffer.length, 'bytes')
