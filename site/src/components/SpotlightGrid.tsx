import { useRef, useState, useCallback, type ReactNode } from 'react'

interface SpotlightGridProps {
  children: ReactNode
  className?: string
  /** Spotlight radius in pixels (default: 350) */
  radius?: number
  /** Spotlight color, should be a CSS color (default: var(--color-glow-1)) */
  color?: string
  /** Spotlight opacity 0-1 (default: 0.07) */
  intensity?: number
}

/**
 * Wraps a grid of cards with a cursor-following spotlight effect.
 * A subtle radial gradient follows the mouse, creating a glow
 * that illuminates nearby card areas.
 */
export function SpotlightGrid({
  children,
  className = '',
  radius = 350,
  color = 'var(--color-glow-1)',
  intensity = 0.07,
}: SpotlightGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseEnter = useCallback(() => setVisible(true), [])
  const handleMouseLeave = useCallback(() => setVisible(false), [])

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, color-mix(in oklch, ${color} ${Math.round(intensity * 100)}%, transparent), transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Content renders above the spotlight */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
