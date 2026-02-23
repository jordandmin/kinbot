export type SSEEventType =
  | 'chat:token'
  | 'chat:done'
  | 'chat:message'
  | 'chat:tool-call-start'
  | 'chat:tool-call'
  | 'chat:tool-result'
  | 'task:status'
  | 'task:done'
  | 'cron:triggered'
  | 'cron:created'
  | 'cron:updated'
  | 'cron:deleted'
  | 'queue:update'
  | 'kin:error'
  | 'kin:updated'
  | 'prompt:pending'
  | 'prompt:answered'
  | 'connected'

export interface SSEEvent {
  type: SSEEventType
  kinId?: string
  data: Record<string, unknown>
}
