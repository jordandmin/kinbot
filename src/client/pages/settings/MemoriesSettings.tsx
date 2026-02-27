import { useTranslation } from 'react-i18next'
import { MemoryList } from '@/client/components/memory/MemoryList'
import { HelpPanel } from '@/client/components/common/HelpPanel'

export function MemoriesSettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('settings.memories.description')}
        </p>
      </div>

      <HelpPanel
        contentKey="settings.memories.help.content"
        bulletKeys={[
          'settings.memories.help.bullet1',
          'settings.memories.help.bullet2',
          'settings.memories.help.bullet3',
          'settings.memories.help.bullet4',
        ]}
        storageKey="help.memories.open"
      />

      <MemoryList kinId={null} />
    </div>
  )
}
