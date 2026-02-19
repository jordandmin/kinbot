import { useAuth } from '@/client/hooks/useAuth'
import { LoginPage } from '@/client/pages/login/LoginPage'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DesignSystemPage } from '@/client/pages/design-system/DesignSystemPage'

const isDev = import.meta.env.DEV

function AuthenticatedApp() {
  const { t } = useTranslation()
  const { user, isLoading, isAuthenticated, login } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">KinBot</h1>
          <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  // Authenticated — main app (placeholder for now)
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">KinBot</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome, {user?.firstName ?? user?.pseudonym ?? 'User'}
        </p>
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {isDev && <Route path="/design-system" element={<DesignSystemPage />} />}
        <Route path="*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  )
}
