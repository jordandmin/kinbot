import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { PasswordInput } from '@/client/components/ui/password-input'
import { Label } from '@/client/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/client/components/ui/collapsible'
import { KinSelector } from '@/client/components/common/KinSelector'
import type { KinOption } from '@/client/components/common/KinSelectItem'
import { PlatformIcon } from '@/client/components/common/PlatformIcon'
import { ChevronRight, HelpCircle, Lightbulb, Loader2 } from 'lucide-react'
import { InfoTip } from '@/client/components/common/InfoTip'
import { cn } from '@/client/lib/utils'
import { api } from '@/client/lib/api'
import type { ChannelSummary } from '@/shared/types'

interface PlatformInfo {
  platform: string
  displayName: string
  brandColor?: string
  iconUrl?: string
  isPlugin: boolean
}

function PlatformSetupGuide({ platform }: { platform: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const steps = t(`settings.channels.setupGuide.${platform}.steps`, { returnObjects: true }) as string[]
  const tip = t(`settings.channels.setupGuide.${platform}.tip`)

  // Don't render setup guide if no translation exists (e.g. plugin platforms)
  const hasGuide = Array.isArray(steps) && steps.length > 0 && steps[0] !== `settings.channels.setupGuide.${platform}.steps`

  if (!hasGuide) return null

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <HelpCircle className="size-3.5" />
          <span>{t('settings.channels.setupGuide.title')}</span>
          <ChevronRight className={cn('size-3 transition-transform', open && 'rotate-90')} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border bg-muted/30 p-3 space-y-2.5 animate-in fade-in-0 slide-in-from-top-1">
          <p className="text-xs font-medium">
            {t(`settings.channels.setupGuide.${platform}.title`)}
          </p>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {tip && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground/80 pt-1 border-t border-border/50">
              <Lightbulb className="size-3 mt-0.5 shrink-0 text-yellow-500" />
              <span>{tip}</span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface ChannelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    kinId: string
    name: string
    platform: string
    botToken: string
  }) => Promise<void>
  onUpdate?: (channelId: string, data: {
    name?: string
    kinId?: string
  }) => Promise<void>
  channel?: ChannelSummary | null
  kins: KinOption[]
  /** Hub Kin ID — pre-selected for new channels */
  hubKinId?: string | null
}

export function ChannelFormDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  channel,
  kins,
  hubKinId,
}: ChannelFormDialogProps) {
  const { t } = useTranslation()
  const isEdit = !!channel

  const [selectedKinId, setSelectedKinId] = useState('')
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('')
  const [botToken, setBotToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([])

  // Fetch available platforms from API
  useEffect(() => {
    api.get<{ platforms: PlatformInfo[] }>('/channels/platforms')
      .then((res) => {
        setPlatforms(res.platforms)
        if (!platform && res.platforms.length > 0) {
          setPlatform(res.platforms[0].platform)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (channel) {
      setName(channel.name)
      setPlatform(channel.platform)
      setSelectedKinId(channel.kinId)
      setBotToken('')
    } else {
      setName('')
      setPlatform(platforms[0]?.platform ?? '')
      setSelectedKinId(hubKinId ?? '')
      setBotToken('')
    }
  }, [channel, open, hubKinId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEdit && onUpdate && channel) {
        await onUpdate(channel.id, {
          name,
          kinId: selectedKinId !== channel.kinId ? selectedKinId : undefined,
        })
      } else {
        if (!selectedKinId || !botToken.trim()) return
        await onSave({
          kinId: selectedKinId,
          name,
          platform,
          botToken: botToken.trim(),
        })
      }
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlatform = platforms.find((p) => p.platform === platform)
  const canSubmit = name.trim() && (isEdit || (selectedKinId && botToken.trim() && platform))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('common.edit') : t('settings.channels.add')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? t('common.edit') : t('settings.channels.add')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-1.5">{t('settings.channels.name')} <InfoTip content={t('settings.channels.nameTip')} /></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('settings.channels.namePlaceholder')}
              required
            />
          </div>
          {/* Kin selector */}
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-1.5">{t('settings.channels.kinLabel')} <InfoTip content={t('settings.channels.kinTip')} /></Label>
            <KinSelector
              value={selectedKinId}
              onValueChange={setSelectedKinId}
              kins={kins}
              placeholder={t('settings.channels.kinPlaceholder')}
            />
            {hubKinId && selectedKinId === hubKinId && (
              <p className="text-xs text-muted-foreground">
                {t('hub.channelHint')}
              </p>
            )}
          </div>

          {/* Platform selector (only for create) */}
          {!isEdit && platforms.length > 0 && (
            <div className="space-y-2">
              <Label>{t('settings.channels.platform')}</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <PlatformIcon platform={platform} variant="color" className="size-4" />
                      {currentPlatform?.displayName ?? platform}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.platform} value={p.platform}>
                      <span className="flex items-center gap-2">
                        <PlatformIcon platform={p.platform} variant="color" className="size-4" />
                        {p.displayName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}



          {/* Bot token (only for create) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label>{t('settings.channels.botToken')}</Label>
              <PasswordInput
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder={t('settings.channels.botTokenPlaceholder')}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.channels.botTokenHint')}
              </p>

              {/* Platform-specific setup guide */}
              <PlatformSetupGuide platform={platform} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit} className="btn-shine">
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
