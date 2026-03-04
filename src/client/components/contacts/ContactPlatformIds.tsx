import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/client/components/ui/badge'
import { PlatformIcon } from '@/client/components/common/PlatformIcon'
import { X } from 'lucide-react'
import { api, getErrorMessage } from '@/client/lib/api'
import type { ContactPlatformId } from '@/shared/types'

interface ContactPlatformIdsProps {
  contactId: string
}

export function ContactPlatformIds({ contactId }: ContactPlatformIdsProps) {
  const { t } = useTranslation()
  const [platformIds, setPlatformIds] = useState<ContactPlatformId[]>([])

  useEffect(() => {
    api
      .get<{ platformIds: ContactPlatformId[] }>(`/contacts/${contactId}/platform-ids`)
      .then((data) => setPlatformIds(data.platformIds))
      .catch(() => {})
  }, [contactId])

  const revokePlatformId = async (pidId: string) => {
    try {
      await api.delete(`/contacts/${contactId}/platform-ids/${pidId}`)
      setPlatformIds((prev) => prev.filter((p) => p.id !== pidId))
      toast.success(t('settings.contacts.platformIdRevoked'))
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    }
  }

  if (platformIds.length === 0) return null

  return (
    <div className="ml-8 border-t pt-2 space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {t('settings.contacts.platformIds')}
      </p>
      <div className="flex flex-wrap gap-1">
        {platformIds.map((pid) => (
          <Badge key={pid.id} variant="outline" size="xs" className="font-normal gap-1 group">
            <PlatformIcon platform={pid.platform} variant="color" className="size-3" />
            <span className="capitalize">{pid.platform}</span>: {pid.platformId}
            <button
              onClick={() => revokePlatformId(pid.id)}
              className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <X className="size-2.5" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
