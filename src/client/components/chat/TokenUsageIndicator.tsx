import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, ChevronDown } from 'lucide-react'
import { cn } from '@/client/lib/utils'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/client/components/ui/popover'
import type { MessageTokenUsage } from '@/shared/types'

interface TokenUsageIndicatorProps {
  tokenUsage: MessageTokenUsage
}

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export const TokenUsageIndicator = memo(function TokenUsageIndicator({ tokenUsage }: TokenUsageIndicatorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
            'text-[10px] font-medium tabular-nums',
            'bg-primary/10 text-primary hover:bg-primary/18',
            'transition-colors duration-150',
          )}
        >
          <Zap className="size-2.5" />
          <span>{formatTokenCount(tokenUsage.totalTokens)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-auto p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Zap className="size-3 text-primary" />
            {t('chat.tokenUsage.label', { total: formatTokenCount(tokenUsage.totalTokens) })}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground tabular-nums">
            <span>{t('chat.tokenUsage.input')}</span>
            <span className="text-right text-foreground">{formatTokenCount(tokenUsage.inputTokens)}</span>
            <span>{t('chat.tokenUsage.output')}</span>
            <span className="text-right text-foreground">{formatTokenCount(tokenUsage.outputTokens)}</span>
            {(tokenUsage.cacheReadTokens ?? 0) > 0 && (
              <>
                <span>{t('chat.tokenUsage.cacheRead')}</span>
                <span className="text-right text-foreground">{formatTokenCount(tokenUsage.cacheReadTokens!)}</span>
              </>
            )}
            {(tokenUsage.cacheWriteTokens ?? 0) > 0 && (
              <>
                <span>{t('chat.tokenUsage.cacheWrite')}</span>
                <span className="text-right text-foreground">{formatTokenCount(tokenUsage.cacheWriteTokens!)}</span>
              </>
            )}
            {(tokenUsage.reasoningTokens ?? 0) > 0 && (
              <>
                <span>{t('chat.tokenUsage.reasoning')}</span>
                <span className="text-right text-foreground">{formatTokenCount(tokenUsage.reasoningTokens!)}</span>
              </>
            )}
            {(tokenUsage.stepCount ?? 1) > 1 && (
              <>
                <span>{t('chat.tokenUsage.steps', { count: tokenUsage.stepCount })}</span>
                <span className="text-right text-foreground">{tokenUsage.stepCount}</span>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})
