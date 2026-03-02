import { Shield, Lock, Eye, EyeOff, Server, HardDrive, ShieldCheck, KeyRound } from 'lucide-react'

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
