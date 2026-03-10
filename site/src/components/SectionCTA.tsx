import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

interface SectionCTAProps {
  text: string
  to: string
  label: string
}

export function SectionCTA({ text, to, label }: SectionCTAProps) {
  return (
    <div className="text-center py-8">
      <p className="text-sm mb-3" style={{ color: 'var(--color-muted-foreground)' }}>
        {text}
      </p>
      <Link
        to={to}
        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: 'color-mix(in oklch, var(--color-glow-1) 12%, transparent)',
          color: 'var(--color-primary)',
          border: '1px solid color-mix(in oklch, var(--color-glow-1) 25%, transparent)',
        }}
      >
        {/* Animated gradient glow behind the button on hover */}
        <span
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(135deg, color-mix(in oklch, var(--color-glow-1) 15%, transparent), color-mix(in oklch, var(--color-glow-2) 10%, transparent), color-mix(in oklch, var(--color-glow-3) 8%, transparent))',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
            filter: 'blur(1px)',
          }}
        />
        {/* Glow shadow on hover */}
        <span
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(135deg, color-mix(in oklch, var(--color-glow-1) 20%, transparent), color-mix(in oklch, var(--color-glow-2) 15%, transparent))',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
            filter: 'blur(12px)',
            zIndex: -1,
          }}
        />
        <span className="relative z-10 inline-flex items-center gap-2">
          {label}
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}
