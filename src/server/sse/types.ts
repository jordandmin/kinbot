export type SSEEventType =
  | 'chat:token'
  | 'chat:done'
  | 'chat:message'
  | 'task:status'
  | 'task:done'
  | 'cron:triggered'
  | 'queue:update'
  | 'kin:error'
  | 'connected'

export interface SSEEvent {
  type: SSEEventType
  kinId?: string
  data: Record<string, unknown>
}
