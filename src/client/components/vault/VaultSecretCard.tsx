import { useTranslation } from 'react-i18next'
import { Button } from '@/client/components/ui/button'
import { Badge } from '@/client/components/ui/badge'
import { Card, CardContent } from '@/client/components/ui/card'
import { Pencil, ShieldCheck, Trash2 } from 'lucide-react'

export interface VaultSecretData {
  id: string
  key: string
  description: string | null
  createdByKinId: string | null
  createdAt: number
  updatedAt: number
}

interface VaultSecretCardProps {
  secret: VaultSecretData
  kinName?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function VaultSecretCard({ secret, kinName, onEdit, onDelete }: VaultSecretCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="surface-card">
      <CardContent className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <ShieldCheck className="size-5 text-warning" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium font-mono truncate">{secret.key}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {secret.createdByKinId
                  ? t('settings.vault.createdByKin', { name: kinName ?? '?' })
                  : t('settings.vault.createdByAdmin')}
              </Badge>
            </div>
            {secret.description && (
              <p className="text-xs text-muted-foreground truncate">{secret.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
            <Button variant="ghost" size="icon-xs" onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon-xs" onClick={onDelete}>
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
