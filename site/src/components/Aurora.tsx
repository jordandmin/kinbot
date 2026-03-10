import { useEffect, useRef } from 'react'

/**
 * Aurora background effect - organic, slowly drifting gradient blobs.
 * Renders on a canvas for smooth 60fps animation with minimal overhead.
 * Respects prefers-reduced-motion (falls back to static gradient).
 */

interface AuroraProps {
  className?: string
  /** Opacity of the aurora (0-1, default 0.12) */
  intensity?: number
  /** Animation speed multiplier (default 1) */
  speed?: number
}

interface Blob {
  x: number
  y: number
  radius: number
  color: string
  phaseX: number
  phaseY: number
  speedX: number
  speedY: number
  phaseRadius: number
  speedRadius: number
}

export function Aurora({ className = '', intensity = 0.12, speed = 1 }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Resolve CSS custom properties from document
    const resolveColor = (varName: string, fallback: string): string => {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
      return val || fallback
    }

    const colors = [
      resolveColor('--color-glow-1', '#a855f7'),
      resolveColor('--color-glow-2', '#ec4899'),
      resolveColor('--color-glow-3', '#6366f1'),
      resolveColor('--color-primary', '#7c3aed'),
    ]

    const blobs: Blob[] = [
      { x: 0.2, y: 0.15, radius: 0.35, color: colors[0], phaseX: 0, phaseY: 0.5, speedX: 0.15, speedY: 0.12, phaseRadius: 0, speedRadius: 0.08 },
      { x: 0.7, y: 0.25, radius: 0.3, color: colors[1], phaseX: 1.5, phaseY: 2.0, speedX: 0.12, speedY: 0.18, phaseRadius: 1.2, speedRadius: 0.1 },
      { x: 0.4, y: 0.65, radius: 0.28, color: colors[2], phaseX: 3.0, phaseY: 1.0, speedX: 0.18, speedY: 0.1, phaseRadius: 2.5, speedRadius: 0.06 },
      { x: 0.8, y: 0.6, radius: 0.25, color: colors[3], phaseX: 4.5, phaseY: 3.5, speedX: 0.1, speedY: 0.15, phaseRadius: 3.8, speedRadius: 0.09 },
    ]

    let w = 0
    let h = 0

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    if (prefersReduced) {
      // Draw a single static frame
      ctx.clearRect(0, 0, w, h)
      for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
          blob.x * w, blob.y * h, 0,
          blob.x * w, blob.y * h, blob.radius * Math.max(w, h)
        )
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'transparent')
        ctx.globalAlpha = intensity
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
      }
      ctx.globalAlpha = 1
      return () => ro.disconnect()
    }

    let time = 0
    let lastTs = 0

    const draw = (ts: number) => {
      const dt = lastTs ? (ts - lastTs) / 1000 : 0.016
      lastTs = ts
      time += dt * speed

      ctx.clearRect(0, 0, w, h)

      for (const blob of blobs) {
        const bx = blob.x + Math.sin(time * blob.speedX + blob.phaseX) * 0.12
        const by = blob.y + Math.cos(time * blob.speedY + blob.phaseY) * 0.08
        const br = blob.radius + Math.sin(time * blob.speedRadius + blob.phaseRadius) * 0.04

        const cx = bx * w
        const cy = by * h
        const r = br * Math.max(w, h)

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'transparent')

        ctx.globalAlpha = intensity
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [intensity, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
