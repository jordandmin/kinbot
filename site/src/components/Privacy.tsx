import { Shield, Lock, Eye, EyeOff, Server, HardDrive, ShieldCheck, KeyRound, MessageSquare, Brain } from 'lucide-react'

const privacyPoints = [
  {
    icon: Server,
    title: 'Runs on your hardware',
    description: 'Your conversations, memories, and agent configs live on your machine. Not ours, not anyone else\'s.',
    color: 'var(--color-glow-1)',
  },
  {
    icon: EyeOff,
    title: 'Zero telemetry',
    description: 'No analytics, no tracking, no phone-home. KinBot never contacts any server except the AI providers you explicitly configure.',
    color: 'var(--color-glow-2)',
  },
  {
    icon: KeyRound,
    title: 'Encrypted secrets vault',
    description: 'API keys and sensitive data are encrypted with AES-256-GCM. Never exposed in prompts, logs, or compacted summaries.',
    color: 'var(--color-glow-3)',
  },
  {
    icon: HardDrive,
    title: 'One SQLite file',
    description: 'All data in a single file. Back up with cp, restore with cp, audit with any SQLite browser. No black boxes.',
    color: 'var(--color-glow-1)',
  },
  {
    icon: Lock,
    title: 'Message redaction',
    description: 'Vault-protected values are automatically redacted from session compaction, preventing secrets from leaking into summarized context.',
    color: 'var(--color-glow-2)',
  },
  {
    icon: ShieldCheck,
    title: 'Fully offline capable',
    description: 'Pair with Ollama or any local model server. Nothing ever leaves your network. Perfect for air-gapped environments.',
    color: 'var(--color-glow-3)',
  },
]

function PrivacyCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Shield
  title: string
  description: string
  color: string
}) {
  return (
    <div
      className="group relative glass-strong rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        border: `1px solid color-mix(in oklch, ${color} 15%, transparent)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `color-mix(in oklch, ${color} 12%, transparent)`,
          border: `1px solid color-mix(in oklch, ${color} 25%, transparent)`,
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <h3
        className="text-sm font-semibold mb-1.5"
        style={{ color: 'var(--color-foreground)' }}
      >
        {title}
      </h3>
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {description}
      </p>
    </div>
  )
}

export function Privacy() {
  return (
    <section id="privacy" className="px-6 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'color-mix(in oklch, var(--color-glow-1) 12%, transparent)',
              border: '1px solid color-mix(in oklch, var(--color-glow-1) 25%, transparent)',
            }}
          >
            <Shield size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
          <span style={{ color: 'var(--color-foreground)' }}>Your data.</span>{' '}
          <span className="gradient-text">Your rules.</span>
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted-foreground)' }}>
          KinBot is self-hosted by design, not as an afterthought.
          No cloud, no accounts, no data collection. Ever.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {privacyPoints.map((point) => (
          <PrivacyCard key={point.title} {...point} />
        ))}
      </div>

      {/* Data flow visualization */}
      <div className="mt-14 mb-10">
        <h3 className="text-center text-lg font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
          Where your data goes
        </h3>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--color-muted-foreground)' }}>
          Everything stays on your machine. Only AI inference leaves your network, and only to providers you choose.
        </p>

        <div className="max-w-3xl mx-auto">
          {/* Your Server block */}
          <div
            className="rounded-2xl p-6 relative"
            style={{
              background: 'color-mix(in oklch, var(--color-glow-1) 4%, var(--color-card))',
              border: '2px solid color-mix(in oklch, var(--color-glow-1) 25%, transparent)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Server size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                Your server
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
                style={{
                  background: 'color-mix(in oklch, #10B981 15%, transparent)',
                  color: '#10B981',
                  border: '1px solid color-mix(in oklch, #10B981 30%, transparent)',
                }}
              >
                ✓ Never leaves
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: MessageSquare, label: 'Conversations', sub: 'All chat history' },
                { icon: Brain, label: 'Memories', sub: 'Vector + full-text' },
                { icon: KeyRound, label: 'Secrets', sub: 'AES-256-GCM' },
                { icon: HardDrive, label: 'SQLite DB', sub: 'Single file' },
              ].map(({ icon: ItemIcon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: 'color-mix(in oklch, var(--color-glow-1) 6%, var(--color-background))',
                    border: '1px solid color-mix(in oklch, var(--color-border) 50%, transparent)',
                  }}
                >
                  <ItemIcon size={16} className="mx-auto mb-1.5" style={{ color: 'var(--color-primary)' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>{label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center py-3">
            <div className="flex items-center gap-2">
              <svg width="2" height="28" style={{ color: 'var(--color-muted-foreground)', opacity: 0.4 }}>
                <line x1="1" y1="0" x2="1" y2="28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
            <span
              className="text-[10px] font-semibold px-3 py-1 rounded-full"
              style={{
                background: 'color-mix(in oklch, var(--color-muted-foreground) 8%, transparent)',
                color: 'var(--color-muted-foreground)',
                border: '1px solid color-mix(in oklch, var(--color-border) 40%, transparent)',
              }}
            >
              Only AI inference requests ↓
            </span>
            <svg width="2" height="12" style={{ color: 'var(--color-muted-foreground)', opacity: 0.4 }}>
              <line x1="1" y1="0" x2="1" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* AI Providers block */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'color-mix(in oklch, var(--color-muted-foreground) 3%, var(--color-card))',
              border: '1px dashed color-mix(in oklch, var(--color-border) 60%, transparent)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} style={{ color: 'var(--color-muted-foreground)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>
                AI Providers (your choice)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Ollama (local)', 'OpenAI', 'Anthropic', 'Gemini', 'Mistral', 'Groq', '17 more...'].map(provider => (
                <span
                  key={provider}
                  className="text-[11px] px-2.5 py-1 rounded-lg"
                  style={{
                    background: provider.includes('local')
                      ? 'color-mix(in oklch, #10B981 10%, transparent)'
                      : 'color-mix(in oklch, var(--color-muted-foreground) 6%, transparent)',
                    color: provider.includes('local')
                      ? '#10B981'
                      : 'var(--color-muted-foreground)',
                    border: provider.includes('local')
                      ? '1px solid color-mix(in oklch, #10B981 25%, transparent)'
                      : '1px solid color-mix(in oklch, var(--color-border) 40%, transparent)',
                    fontWeight: provider.includes('local') ? 600 : 400,
                  }}
                >
                  {provider}
                </span>
              ))}
            </div>
            <p className="text-[10px] mt-3" style={{ color: 'var(--color-muted-foreground)', opacity: 0.7 }}>
              Use Ollama for zero network traffic. Vault secrets are never included in AI requests.
            </p>
          </div>
        </div>
      </div>

      {/* Trust callout */}
      <div
        className="mt-10 glass-strong rounded-xl p-5 flex items-start gap-4 max-w-2xl mx-auto"
        style={{
          background: 'color-mix(in oklch, var(--color-glow-1) 3%, var(--color-card))',
          border: '1px solid color-mix(in oklch, var(--color-glow-1) 15%, transparent)',
        }}
      >
        <Eye size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            Don't trust us. Read the code.
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            KinBot is open source under AGPL-3.0. Every line is auditable.
            There are no hidden API calls, no bundled analytics, no obfuscated binaries.
            Run <code className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'color-mix(in oklch, var(--color-muted-foreground) 10%, transparent)' }}>grep -r "telemetry\|analytics\|tracking" src/</code> yourself.
          </p>
        </div>
      </div>
    </section>
  )
}
