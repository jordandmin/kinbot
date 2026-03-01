import { User, Brain, Network, MessageCircle } from 'lucide-react'

const HUB_COLOR = 'var(--color-primary)'

const SPECIALISTS = [
  { id: 'dev', label: 'Dev Kin', sublabel: 'Code & reviews', color: 'var(--color-glow-3)' },
  { id: 'analyst', label: 'Analyst Kin', sublabel: 'Research & data', color: 'var(--color-glow-2)' },
  { id: 'writer', label: 'Writer Kin', sublabel: 'Content & docs', color: 'var(--color-glow-1)' },
]

// ── Kin avatar ──────────────────────────────────────────────────────────
function KinAvatar({ color, size = 40, letter = 'K' }: { color: string; size?: number; letter?: string }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 35% 30%,
          color-mix(in oklch, ${color} 28%, var(--color-background)),
          color-mix(in oklch, ${color} 12%, var(--color-background)))`,
        border: `1.5px solid color-mix(in oklch, ${color} 45%, transparent)`,
        boxShadow: `0 0 18px color-mix(in oklch, ${color} 22%, transparent)`,
      }}
    >
      <span style={{ color, fontSize: Math.round(size * 0.38), fontWeight: 900, lineHeight: 1 }}>
        {letter}
      </span>
    </div>
  )
}

// ── Vertical connector ──────────────────────────────────────────────────
function Connector({ color, height = 32 }: { color: string; height?: number }) {
  return (
    <div className="flex justify-center" style={{ height }}>
      <div style={{
        width: 0, height: '100%',
        borderLeft: `1.5px dashed color-mix(in oklch, ${color} 35%, transparent)`,
      }} />
    </div>
  )
}

// ── Fan-out SVG: Hub → 3 specialists ────────────────────────────────────
function FanOut() {
  const W = 300, H = 40
  const targets = [50, 150, 250]
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H, display: 'block' }}
      aria-hidden="true"
    >
      {targets.map((x, i) => (
        <path
          key={i}
          d={x === 150
            ? `M 150 0 L 150 ${H}`
            : `M 150 0 C 150 ${H * 0.55} ${x} ${H * 0.55} ${x} ${H}`}
          fill="none"
          style={{
            stroke: `color-mix(in oklch, ${SPECIALISTS[i]!.color} 35%, transparent)`,
            strokeWidth: 1.5,
            strokeDasharray: '4 5',
          }}
        />
      ))}
    </svg>
  )
}

// ── Main component ──────────────────────────────────────────────────────
export function WhatIsKin() {
  return (
    <section id="what-is-a-kin" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{
              background: 'color-mix(in oklch, var(--color-glow-1) 10%, transparent)',
              border: '1px solid color-mix(in oklch, var(--color-glow-1) 30%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{
              background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)',
            }} />
            Core concept
          </div>

          <h2 className="gradient-text text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            What&rsquo;s a Kin?
          </h2>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-muted-foreground)' }}>
            A Kin is a specialized AI agent that lives on your server — with its own identity,
            memory, and expertise. Create several, and they work as a team.
          </p>
        </div>

        {/* ── Hub pattern diagram ── */}
        <div style={{ maxWidth: 460, margin: '0 auto' }}>

          {/* You */}
          <div className="glass-strong gradient-border rounded-2xl p-4 flex items-center gap-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
            >
              <User size={18} style={{ color: 'var(--color-muted-foreground)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-foreground)' }}>You</p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                &ldquo;Review my PR and write release notes&rdquo;
              </p>
            </div>
          </div>

          <Connector color={HUB_COLOR} />

          {/* Hub */}
          <div
            className="glass-strong rounded-2xl p-4 flex items-center gap-3"
            style={{
              border: `1px solid color-mix(in oklch, ${HUB_COLOR} 40%, transparent)`,
              boxShadow: `0 0 30px color-mix(in oklch, ${HUB_COLOR} 16%, transparent)`,
            }}
          >
            <KinAvatar color={HUB_COLOR} size={44} letter="H" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Hub</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{
                  background: `color-mix(in oklch, ${HUB_COLOR} 14%, transparent)`,
                  color: HUB_COLOR,
                }}>
                  Coordinator
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Understands your intent, routes to the right specialist
              </p>
            </div>
          </div>

          {/* Fan-out */}
          <FanOut />

          {/* Specialist cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {SPECIALISTS.map((s) => (
              <div key={s.id} className="glass-strong rounded-xl p-2.5 sm:p-3 text-center" style={{
                border: `1px solid color-mix(in oklch, ${s.color} 30%, transparent)`,
                boxShadow: `0 0 14px color-mix(in oklch, ${s.color} 10%, transparent)`,
              }}>
                <div className="flex justify-center mb-2">
                  <KinAvatar color={s.color} size={30} />
                </div>
                <p className="text-[11px] sm:text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {s.label}
                </p>
                <p className="text-[9px] sm:text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
                  {s.sublabel}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--color-muted-foreground)', opacity: 0.7 }}>
            You can also talk to any Kin directly — the Hub is recommended, not required.
          </p>
        </div>

        {/* ── Feature highlights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16">
          {([
            {
              icon: Brain,
              title: 'Persistent memory',
              desc: 'Every Kin remembers conversations, extracts facts, and builds context over months. Come back tomorrow — it knows where you left off.',
              color: 'var(--color-glow-1)',
            },
            {
              icon: Network,
              title: 'Smart routing',
              desc: "The Hub knows each specialist\u2019s expertise and delegates automatically. No manual Kin-switching — just talk naturally.",
              color: 'var(--color-glow-2)',
            },
            {
              icon: MessageCircle,
              title: 'Any channel',
              desc: 'Chat through the web UI, Telegram, Discord, Slack, WhatsApp, or Signal. Connect your channel to the Hub — it handles the rest.',
              color: 'var(--color-glow-3)',
            },
          ] as const).map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-strong rounded-xl p-5 sm:p-6 text-center">
              <div className="flex justify-center mb-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `color-mix(in oklch, ${color} 14%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
                  }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
