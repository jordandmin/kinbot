import { memo, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/client/components/ui/avatar'
import { MarkdownContent } from '@/client/components/chat/MarkdownContent'
import { InlineToolCall } from '@/client/components/chat/InlineToolCall'
import { TaskResultCard } from '@/client/components/chat/TaskResultCard'
import { cn } from '@/client/lib/utils'
import type { ToolCallViewItem } from '@/client/hooks/useToolCalls'

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  sourceType: string
  avatarUrl?: string | null
  senderName?: string
  timestamp?: string
  toolCalls?: ToolCallViewItem[]
  onOpenTaskDetail?: () => void
}

/** A content part is either a text segment or a group of tool calls at the same offset. */
type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'tools'; tools: ToolCallViewItem[] }

/**
 * Split message content into interleaved text and tool call parts using offsets.
 * Tool calls at the same offset are grouped together.
 * Falls back to [all text, then all tools] when offsets are missing.
 */
function buildContentParts(content: string, toolCalls: ToolCallViewItem[]): ContentPart[] {
  const hasOffsets = toolCalls.some((tc) => tc.offset !== undefined)
  if (!hasOffsets) {
    // Fallback: text first, then all tool calls at the end
    const parts: ContentPart[] = []
    if (content) parts.push({ type: 'text', text: content })
    if (toolCalls.length > 0) parts.push({ type: 'tools', tools: toolCalls })
    return parts
  }

  // Sort tool calls by offset
  const sorted = [...toolCalls].sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0))

  // Group consecutive tool calls at the same offset
  const groups: Array<{ offset: number; tools: ToolCallViewItem[] }> = []
  for (const tc of sorted) {
    const offset = tc.offset ?? 0
    const last = groups[groups.length - 1]
    if (last && last.offset === offset) {
      last.tools.push(tc)
    } else {
      groups.push({ offset, tools: [tc] })
    }
  }

  // Build interleaved parts
  const parts: ContentPart[] = []
  let cursor = 0

  for (const group of groups) {
    // Text segment before this tool call group
    if (group.offset > cursor) {
      const text = content.slice(cursor, group.offset)
      if (text.trim()) parts.push({ type: 'text', text })
    }
    parts.push({ type: 'tools', tools: group.tools })
    cursor = group.offset
  }

  // Remaining text after the last tool call
  if (cursor < content.length) {
    const text = content.slice(cursor)
    if (text.trim()) parts.push({ type: 'text', text })
  }

  return parts
}

export const MessageBubble = memo(function MessageBubble({
  role,
  content,
  sourceType,
  avatarUrl,
  senderName,
  timestamp,
  toolCalls,
  onOpenTaskDetail,
}: MessageBubbleProps) {
  const isUser = role === 'user' && sourceType === 'user'
  const isFromOtherKin = sourceType === 'kin' && role === 'user'
  const isTaskResult = sourceType === 'task'
  const isSystem = sourceType === 'system' || sourceType === 'cron'
  const hasToolCalls = toolCalls && toolCalls.length > 0

  const contentParts = useMemo(
    () => (hasToolCalls ? buildContentParts(content, toolCalls) : null),
    [content, toolCalls, hasToolCalls],
  )

  // Task result cards (from persisted messages)
  if (isTaskResult) {
    return <TaskResultCard mode="message" content={content} timestamp={timestamp} avatarUrl={avatarUrl} senderName={senderName} onOpenDetail={onOpenTaskDetail} />
  }

  // System messages centered
  if (isSystem) {
    return (
      <div className="flex justify-center px-4 py-2 animate-fade-in">
        <div className="rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          {content}
        </div>
      </div>
    )
  }

  const initials = senderName?.slice(0, 2).toUpperCase() ?? (isUser ? 'U' : 'K')

  const bubbleClass = isFromOtherKin
    ? 'bg-accent text-accent-foreground border border-border'
    : 'bg-muted text-foreground'

  // Assistant messages with tool calls: interleaved layout
  if (!isUser && contentParts) {
    return (
      <div className="flex gap-3 px-4 py-2 animate-fade-in-up">
        <Avatar className="size-8 shrink-0">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={senderName ?? ''} />
          ) : (
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          )}
        </Avatar>

        <div className="max-w-[80%] space-y-1.5">
          {senderName && (
            <p className="text-xs font-medium text-muted-foreground">{senderName}</p>
          )}

          {/* Interleaved content parts */}
          {contentParts.map((part, i) =>
            part.type === 'text' ? (
              <div
                key={`text-${i}`}
                className={cn('rounded-2xl px-4 py-2.5', bubbleClass, i === 0 && 'rounded-tl-md')}
              >
                <MarkdownContent content={part.text} isUser={false} />
              </div>
            ) : (
              <div key={`tools-${i}`} className="space-y-1">
                {part.tools.map((tc) => (
                  <InlineToolCall key={tc.id} toolCall={tc} />
                ))}
              </div>
            ),
          )}

          {timestamp && (
            <p className="text-[10px] text-muted-foreground/70">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Standard message (user or assistant without tool calls)
  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-2 animate-fade-in-up',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <Avatar className="size-8 shrink-0">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={senderName ?? ''} />
        ) : (
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        )}
      </Avatar>

      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : isFromOtherKin
              ? 'bg-accent text-accent-foreground rounded-tl-md border border-border'
              : 'bg-muted text-foreground rounded-tl-md',
        )}
      >
        {senderName && (
          <p className={cn(
            'mb-1 text-xs font-medium',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}>
            {senderName}
          </p>
        )}

        <MarkdownContent content={content} isUser={isUser} />

        {timestamp && (
          <p className={cn(
            'mt-1 text-[10px]',
            isUser ? 'text-primary-foreground/50' : 'text-muted-foreground/70',
          )}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
})
