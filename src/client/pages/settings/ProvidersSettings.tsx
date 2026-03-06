import { useTranslation } from 'react-i18next'
import { Button } from '@/client/components/ui/button'
import { Plus, Cpu } from 'lucide-react'
import { EmptyState } from '@/client/components/common/EmptyState'
import { HelpPanel } from '@/client/components/common/HelpPanel'
import { SettingsListSkeleton } from '@/client/components/common/SettingsListSkeleton'
import { TestAllProviders } from '@/client/components/common/TestAllProviders'
import { ProviderCard } from '@/client/components/kin/ProviderCard'
import { ProviderFormDialog } from '@/client/components/kin/AddProviderDialog'
import { AI_PROVIDER_TYPES } from '@/shared/constants'
import { useProviders } from '@/client/hooks/useProviders'
import { useProviderActions } from '@/client/hooks/useProviderActions'

export function ProvidersSettings() {
  const { t } = useTranslation()
  const { providers, isLoading, refetch: fetchProviders } = useProviders({ filterTypes: AI_PROVIDER_TYPES })

  const {
    testingId,
    testAllState,
    editingProvider,
    modalOpen,
    setModalOpen,
    handleTestAll,
    handleTestProvider,
    handleDeleteProvider,
    handleProviderSaved,
    openAdd,
    openEdit,
  } = useProviderActions({ providers, refetch: fetchProviders })

  if (isLoading) {
    return <SettingsListSkeleton count={3} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('settings.providers.description')}
        </p>
      </div>

      <HelpPanel
        contentKey="settings.providers.help.content"
        bulletKeys={[
          'settings.providers.help.bullet1',
          'settings.providers.help.bullet2',
          'settings.providers.help.bullet3',
          'settings.providers.help.bullet4',
        ]}
        storageKey="help.providers.open"
      />

      {providers.length > 1 && (
        <TestAllProviders testAllState={testAllState} onTestAll={handleTestAll} />
      )}

      {providers.length === 0 && (
        <EmptyState
          icon={Cpu}
          title={t('settings.providers.empty')}
          description={t('settings.providers.emptyDescription')}
          actionLabel={t('settings.providers.add')}
          onAction={openAdd}
        />
      )}

      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          isTesting={testingId === provider.id}
          onTest={() => handleTestProvider(provider.id)}
          onEdit={() => openEdit(provider)}
          onDelete={() => handleDeleteProvider(provider.id)}
        />
      ))}

      <Button variant="outline" onClick={openAdd} className="w-full">
        <Plus className="size-4" />
        {t('settings.providers.add')}
      </Button>

      <ProviderFormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={handleProviderSaved}
        provider={editingProvider}
        providerTypes={AI_PROVIDER_TYPES}
      />
    </div>
  )
}
