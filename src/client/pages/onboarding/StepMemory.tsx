import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/client/components/ui/button'
import { Brain } from 'lucide-react'
import {
  MemoryModelConfig,
  type MemoryModelConfigRef,
} from '@/client/components/common/MemoryModelConfig'

interface StepMemoryProps {
  onComplete: () => void
  onBack?: () => void
}

export function StepMemory({ onComplete, onBack }: StepMemoryProps) {
  const { t } = useTranslation()
  const configRef = useRef<MemoryModelConfigRef>(null)
  const [saving, setSaving] = useState(false)

  const handleNext = async () => {
    setSaving(true)
    try {
      await configRef.current?.save()
    } catch {
      // Non-blocking — settings can be configured later
    } finally {
      setSaving(false)
    }
    onComplete()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">
          {t('onboarding.memory.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('onboarding.memory.subtitle')}
        </p>
      </div>

      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Brain className="size-8 text-primary" />
        </div>
      </div>

      <MemoryModelConfig ref={configRef} variant="onboarding" />

      <div className="pt-2">
        <div className="flex gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} size="lg">
              {t('common.back')}
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={saving}
            className="btn-shine flex-1"
            size="lg"
          >
            {saving ? t('common.loading') : t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
