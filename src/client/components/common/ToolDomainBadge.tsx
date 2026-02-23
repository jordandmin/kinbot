import { useTranslation } from 'react-i18next'
import { cn } from '@/client/lib/utils'
import { TOOL_DOMAIN_META } from '@/shared/constants'
import { ToolDomainIcon } from '@/client/components/common/ToolDomainIcon'
import type { ToolDomain } from '@/shared/types'

interface ToolDomainBadgeProps {
  domain: ToolDomain
  /** Show the text label next to the icon (default: true) */
  showLabel?: boolean
  className?: string
}

/** Reusable badge that displays a tool domain with its icon, color, and label. */
export function ToolDomainBadge({ domain, showLabel = true, className }: ToolDomainBadgeProps) {
  const { t } = useTranslation()
  const meta = TOOL_DOMAIN_META[domain]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
        meta.bg,
        meta.text,
        className,
      )}
    >
      <ToolDomainIcon domain={domain} className="size-3" />
      {showLabel && <span>{t(meta.labelKey)}</span>}
    </span>
  )
}
