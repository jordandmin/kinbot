import { useEffect, useRef, useCallback } from 'react'

type SSEEventHandler = (data: Record<string, unknown>) => void

export function useSSE(handlers: Record<string, SSEEventHandler>) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    if (eventSourceRef.current) return

    const eventSource = new EventSource('/api/sse', { withCredentials: true })
    eventSourceRef.current = eventSource

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, unknown>
        const type = data.type as string
        const handler = handlersRef.current[type]
        if (handler) {
          handler(data)
        }
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('connected', () => {
      console.log('[SSE] Connected')
    })

    eventSource.onerror = () => {
      eventSource.close()
      eventSourceRef.current = null

      // Reconnect after delay
      setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [connect])
}
