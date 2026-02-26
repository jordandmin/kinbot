import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/client/lib/i18n'
import '@/client/styles/globals.css'
import { App } from '@/client/App'
import { ThemeProvider } from '@/client/components/theme-provider'
import { Toaster } from '@/client/components/ui/sonner'
import { ErrorBoundary } from '@/client/components/common/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
