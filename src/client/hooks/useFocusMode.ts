import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'chat.focusMode'

/**
 * Hook for Focus Mode — hides header & sidebar for a distraction-free chat experience.
 * Toggled via Ctrl+Shift+F or a UI button. State is persisted in localStorage.
 */
export function useFocusMode() {
  const [focusMode, setFocusMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const exitFocusMode = useCallback(() => {
    setFocusMode(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'false')
    } catch {
      /* ignore */
    }
  }, [])

  // Keyboard shortcut: Ctrl/Cmd + Shift + F
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        toggleFocusMode()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toggleFocusMode])

  return { focusMode, toggleFocusMode, exitFocusMode }
}
