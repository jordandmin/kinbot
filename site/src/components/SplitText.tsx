import { useRef, useEffect, useState, useMemo } from 'react'

interface SplitTextProps {
  children: string
  className?: string
  style?: React.CSSProperties
  /** Split by 'word' or 'char' (default: 'word') */
  splitBy?: 'word' | 'char'
  /** Stagger delay between each element in ms (default: 60) */
  stagger?: number
  /** Animation duration per element in ms (default: 500) */
  duration?: number
  /** Intersection threshold to trigger (default: 0.3) */
  threshold?: number
}

/**
 * Splits text into words or characters and animates them in
 * with a staggered fade-up effect on scroll into view.
 * Pure CSS transitions, no animation library needed.
 */
export function SplitText({
  children,
  className = '',
  style,
  splitBy = 'word',
  stagger = 60,
  duration = 500,
  threshold = 0.3,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const triggered = useRef(false)

  const parts = useMemo(() => {
    if (splitBy === 'char') {
      return children.split('').map((ch, i) => ({ text: ch, key: i }))
    }
    // Split by word, preserving spaces
    return children.split(/(\s+)/).map((segment, i) => ({ text: segment, key: i }))
  }, [children, splitBy])

  useEffect(() => {
    const el = containerRef.current
    if (!el || triggered.current) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ display: 'inline', ...style }}
      aria-label={children}
    >
      {parts.map(({ text, key }) => {
        // Whitespace segments render as-is
        if (/^\s+$/.test(text)) {
          return <span key={key}>{text}</span>
        }

        const delay = splitBy === 'word'
          ? key * stagger * 0.5 // words have key 0,2,4... due to space splitting
          : key * stagger

        return (
          <span
            key={key}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              filter: visible ? 'blur(0px)' : 'blur(4px)',
              transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
              willChange: visible ? 'auto' : 'opacity, transform, filter',
            }}
          >
            {text}
          </span>
        )
      })}
    </span>
  )
}
