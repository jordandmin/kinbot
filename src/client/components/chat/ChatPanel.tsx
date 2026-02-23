import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@/client/components/ui/scroll-area'
import { MessageBubble } from '@/client/components/chat/MessageBubble'
import { MessageInput } from '@/client/components/chat/MessageInput'
import { TypingIndicator } from '@/client/components/chat/TypingIndicator'
import { ConversationHeader } from '@/client/components/chat/ConversationHeader'
import { ToolCallsViewer } from '@/client/components/chat/ToolCallsViewer'
import { TaskResultCard } from '@/client/components/chat/TaskResultCard'
import { HumanPromptCard } from '@/client/components/chat/HumanPromptCard'
import { TaskDetailModal } from '@/client/components/sidebar/TaskDetailModal'
import { useChat } from '@/client/hooks/useChat'
import { useToolCalls } from '@/client/hooks/useToolCalls'
import { useHumanPrompts } from '@/client/hooks/useHumanPrompts'
import { useAuth } from '@/client/hooks/useAuth'
import { MessageSquare } from 'lucide-react'

interface KinInfo {
  id: string
  name: string
  role: string
  model: string
  avatarUrl: string | null
}

interface LLMModel {
  id: string
  name: string
  providerId: string
  providerType: string
  capability: string
}

interface ChatPanelProps {
  kin: KinInfo
  llmModels: LLMModel[]
  modelUnavailable?: boolean
  queueState?: { isProcessing: boolean; queueSize: number }
  onModelChange: (model: string) => void
  onEditKin: () => void
}

const COMPACTING_TOKEN_THRESHOLD = 30_000

export function ChatPanel({ kin, llmModels, modelUnavailable = false, queueState, onModelChange, onEditKin }: ChatPanelProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { messages, streamingMessage, liveTasks, isStreaming, sendMessage, stopStreaming } = useChat(kin.id)
  const { toolCalls, toolCallCount, toolCallsByMessage } = useToolCalls(kin.id, messages)
  const { prompts: pendingPrompts, respond: respondToPrompt, isResponding } = useHumanPrompts(kin.id)
  const [isToolCallsOpen, setIsToolCallsOpen] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const toggleToolCalls = useCallback(() => setIsToolCallsOpen((prev) => !prev), [])

  // Estimate token usage from message content (rough: ~4 chars per token)
  const estimatedTokens = useMemo(
    () => messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0),
    [messages],
  )

  // Auto-scroll to bottom on new messages / streaming tokens / processing start / live tasks
  const isProcessing = queueState?.isProcessing ?? false
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages, streamingMessage, isStreaming, isProcessing, liveTasks, pendingPrompts])

  // Resolve kin info for the currently open task detail modal
  const detailTask = detailTaskId ? liveTasks.find((t) => t.taskId === detailTaskId) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Conversation header */}
      <ConversationHeader
        name={kin.name}
        role={kin.role}
        model={kin.model}
        avatarUrl={kin.avatarUrl}
        llmModels={llmModels}
        modelUnavailable={modelUnavailable}
        messageCount={messages.length}
        estimatedTokens={estimatedTokens}
        maxTokens={COMPACTING_TOKEN_THRESHOLD}
        toolCallCount={toolCallCount}
        isToolCallsOpen={isToolCallsOpen}
        queueState={queueState}
        onModelChange={onModelChange}
        onToggleToolCalls={toggleToolCalls}
        onEdit={onEditKin}
      />

      {/* Middle: messages + optional tool calls panel */}
      <div className="flex min-h-0 flex-1">
        {/* Messages area */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto max-w-3xl py-4">
            {messages.length === 0 && liveTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                  <MessageSquare className="size-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{t('chat.empty')}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((msg) => {
                  const isFromUser = msg.role === 'user' && msg.sourceType === 'user'
                  const isFromKin = msg.sourceType === 'kin' && msg.role === 'user'
                  const isTask = msg.sourceType === 'task'
                  return (
                    <MessageBubble
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      sourceType={msg.sourceType}
                      avatarUrl={
                        isFromUser
                          ? user?.avatarUrl
                          : (isFromKin || isTask)
                            ? msg.sourceAvatarUrl ?? kin.avatarUrl
                            : kin.avatarUrl
                      }
                      senderName={
                        isFromUser
                          ? (user?.pseudonym ?? user?.firstName)
                          : (isFromKin || isTask)
                            ? msg.sourceName ?? kin.name
                            : kin.name
                      }
                      timestamp={msg.createdAt}
                      toolCalls={toolCallsByMessage.get(msg.id)}
                      onOpenTaskDetail={isTask && msg.resolvedTaskId ? () => setDetailTaskId(msg.resolvedTaskId) : undefined}
                    />
                  )
                })}
                {streamingMessage && (
                  <MessageBubble
                    key={streamingMessage.id}
                    role={streamingMessage.role}
                    content={streamingMessage.content}
                    sourceType={streamingMessage.sourceType}
                    avatarUrl={kin.avatarUrl}
                    senderName={kin.name}
                    timestamp={streamingMessage.createdAt}
                    toolCalls={toolCallsByMessage.get(streamingMessage.id)}
                  />
                )}
                {liveTasks.map((task) => (
                  <TaskResultCard
                    key={`live-${task.taskId}`}
                    mode="live"
                    taskId={task.taskId}
                    status={task.status}
                    title={task.title}
                    senderName={task.senderName}
                    senderAvatarUrl={task.senderAvatarUrl}
                    result={task.result}
                    error={task.error}
                    createdAt={task.createdAt}
                    onOpenDetail={() => setDetailTaskId(task.taskId)}
                  />
                ))}
                {pendingPrompts.map((prompt) => (
                  <HumanPromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onRespond={respondToPrompt}
                    isResponding={isResponding}
                  />
                ))}
                {(isStreaming || queueState?.isProcessing) && <TypingIndicator />}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Tool calls side panel — animated width wrapper */}
        <div
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
            isToolCallsOpen ? 'w-80 lg:w-96' : 'w-0'
          }`}
        >
          <ToolCallsViewer
            toolCalls={toolCalls}
            toolCallCount={toolCallCount}
            onClose={toggleToolCalls}
          />
        </div>
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        disabled={modelUnavailable}
        disabledReason={modelUnavailable ? t('kin.modelUnavailableInput') : undefined}
      />

      {/* Task detail modal — opened from live task cards */}
      <TaskDetailModal
        taskId={detailTaskId}
        open={detailTaskId !== null}
        onOpenChange={(open) => { if (!open) setDetailTaskId(null) }}
        kinName={detailTask?.senderName ?? kin.name}
        kinAvatarUrl={detailTask?.senderAvatarUrl ?? kin.avatarUrl}
      />
    </div>
  )
}
