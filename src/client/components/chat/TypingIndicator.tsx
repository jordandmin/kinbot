import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export function TypingIndicator() {
  const { t } = useTranslation()
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    setElapsed(0)
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatElapsed = (s: number) => {
    if (s < 60) return `${s}s`
    const m = Math.floor(s / 60)
    const rem = s % 60
    return `${m}m ${rem.toString().padStart(2, '0')}s`
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="size-1.5 rounded-full bg-muted-foreground animate-typing-dot" />
        <span className="size-1.5 rounded-full bg-muted-foreground animate-typing-dot delay-1" />
        <span className="size-1.5 rounded-full bg-muted-foreground animate-typing-dot delay-2" />
      </div>
      <span className="text-xs text-muted-foreground">{t('chat.streaming')}</span>
      {elapsed > 0 && (
        <span className="text-xs text-muted-foreground/60 tabular-nums">
          {formatElapsed(elapsed)}
        </span>
      )}
    </div>
  )
}
