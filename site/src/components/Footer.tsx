import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="border-t px-6 py-12"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-lg font-extrabold gradient-text">KinBot</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            Self-hosted AI agents. Your data, your server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {[
            { label: 'GitHub', href: 'https://github.com/marlburrow/kinbot', external: true },
            { label: 'Issues', href: 'https://github.com/marlburrow/kinbot/issues', external: true },
            { label: 'Releases', href: 'https://github.com/marlburrow/kinbot/releases', external: true },
            { label: 'License', href: 'https://github.com/marlburrow/kinbot/blob/main/LICENSE', external: true },
          ].map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          <a
            href="https://github.com/marlburrow/kinbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:opacity-80"
          >
            <Github size={14} />
            AGPL-3.0
          </a>
        </div>
      </div>
    </footer>
  )
}
