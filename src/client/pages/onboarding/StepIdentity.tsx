import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/client/components/ui/input'
import { PasswordInput } from '@/client/components/ui/password-input'
import { Button } from '@/client/components/ui/button'
import { Label } from '@/client/components/ui/label'
import { Alert, AlertDescription } from '@/client/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/client/components/ui/avatar'
import { AlertCircle, Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/client/hooks/useAuth'
import { api, getErrorMessage } from '@/client/lib/api'
import { getUserInitials } from '@/client/lib/utils'

interface StepIdentityProps {
  onComplete: () => void
}

export function StepIdentity({ onComplete }: StepIdentityProps) {
  const { t } = useTranslation()
  const { register, login } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError(t('onboarding.identity.passwordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      // 1. Register via Better Auth (or login if already registered)
      try {
        await register({
          name: `${firstName} ${lastName}`,
          email,
          password,
        })
      } catch (regErr: unknown) {
        // If registration fails because email already exists, try logging in instead.
        // This handles the case where registration succeeded but profile creation
        // failed on a previous attempt, leaving the user stuck.
        const regMsg = getErrorMessage(regErr) || ''
        if (regMsg.toLowerCase().includes('already') || regMsg.toLowerCase().includes('exists')) {
          await login(email, password)
        } else {
          throw regErr
        }
      }

      // 2. Create user profile (will 409 if it already exists, which is fine)
      try {
        await api.post('/onboarding/profile', {
          firstName,
          lastName,
          pseudonym,
          language: 'en',
        })
      } catch (profileErr: unknown) {
        const profileMsg = getErrorMessage(profileErr) || ''
        // If profile already exists (409), skip gracefully
        if (!profileMsg.includes('PROFILE_EXISTS') && !profileMsg.includes('already exists')) {
          throw profileErr
        }
      }

      // 3. Upload avatar if provided
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        await fetch('/api/me/avatar', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
      }

      onComplete()
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const initials = getUserInitials({ pseudonym, firstName, lastName })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">
          {t('onboarding.identity.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('onboarding.identity.subtitle')}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-scale-in">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Avatar upload */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative"
        >
          <Avatar className="size-20 ring-2 ring-border transition-all group-hover:ring-primary">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="Avatar" />
            ) : (
              <AvatarFallback className="text-lg">
                {initials || <Camera className="size-6 text-muted-foreground" />}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-white" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t('onboarding.identity.firstName')}</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t('onboarding.identity.lastName')}</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('onboarding.identity.email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      {/* Pseudonym */}
      <div className="space-y-2">
        <Label htmlFor="pseudonym">{t('onboarding.identity.pseudonym')}</Label>
        <Input
          id="pseudonym"
          value={pseudonym}
          onChange={(e) => setPseudonym(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t('onboarding.identity.pseudonymHint')}
        </p>
      </div>

      {/* Password */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('onboarding.identity.password')}</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">{t('onboarding.identity.passwordConfirm')}</Label>
          <PasswordInput
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="btn-shine w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('common.next')
        )}
      </Button>
    </form>
  )
}
