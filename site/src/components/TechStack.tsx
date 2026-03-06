import { ExternalLink } from 'lucide-react'

interface Tech {
  name: string
  role: string
  url: string
  icon: string // Simple Icons slug
  color: string // Brand color
}

const techs: Tech[] = [
  {
    name: 'Bun',
    role: 'Runtime & package manager',
    url: 'https://bun.sh',
    icon: 'bun',
    color: '#fbf0df',
  },
  {
    name: 'TypeScript',
    role: 'End-to-end type safety',
    url: 'https://www.typescriptlang.org',
    icon: 'typescript',
    color: '#3178C6',
  },
  {
    name: 'React',
    role: 'Web interface',
    url: 'https://react.dev',
    icon: 'react',
    color: '#61DAFB',
  },
  {
    name: 'Vite',
    role: 'Build tooling',
    url: 'https://vite.dev',
    icon: 'vite',
    color: '#646CFF',
  },
  {
    name: 'SQLite',
    role: 'Zero-ops database',
    url: 'https://www.sqlite.org',
    icon: 'sqlite',
    color: '#003B57',
  },
  {
    name: 'Drizzle ORM',
    role: 'Type-safe queries & migrations',
    url: 'https://orm.drizzle.team',
    icon: 'drizzle',
    color: '#C5F74F',
  },
  {
    name: 'Tailwind CSS',
    role: 'Utility-first styling',
    url: 'https://tailwindcss.com',
    icon: 'tailwindcss',
    color: '#06B6D4',
  },
  {
    name: 'Better Auth',
    role: 'Authentication & sessions',
    url: 'https://www.better-auth.com',
    icon: '',
    color: '#a855f7',
  },
]

function TechCard({ tech }: { tech: Tech }) {
  return (
    <a
      href={tech.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-strong rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5"
      style={{
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{
          background: `color-mix(in oklch, ${tech.color} 12%, transparent)`,
          border: `1px solid color-mix(in oklch, ${tech.color} 25%, transparent)`,
        }}
      >
        {tech.icon ? (
          <img
            src={`https://cdn.simpleicons.org/${tech.icon}`}
            alt=""
            width={24}
            height={24}
            loading="lazy"
            className="opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <span className="text-lg font-bold" style={{ color: tech.color }}>
            BA
          </span>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {tech.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
          {tech.role}
        </p>
      </div>
      <ExternalLink
        size={12}
        className="opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: 'var(--color-muted-foreground)' }}
      />
    </a>
  )
}

export function TechStack() {
  return (
    <section id="tech-stack" className="px-6 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
          <span style={{ color: 'var(--color-foreground)' }}>Built on</span>{' '}
          <span className="gradient-text">solid foundations.</span>
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted-foreground)' }}>
          Modern, battle-tested technologies. No exotic dependencies, no vendor lock-in.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {techs.map((tech) => (
          <TechCard key={tech.name} tech={tech} />
        ))}
      </div>

      <p className="text-center mt-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
        One process, one SQLite file, zero infrastructure. Runs anywhere Bun runs.
      </p>
    </section>
  )
}
