// Shared types used by both client and server

export type UserRole = 'admin' | 'member'

export type Language = 'en' | 'fr'

export type ProviderType = 'anthropic' | 'anthropic-oauth' | 'openai' | 'gemini' | 'voyage' | 'brave-search'

export type ProviderCapability = 'llm' | 'embedding' | 'image' | 'search'

export type MessageSource = 'user' | 'kin' | 'task' | 'cron' | 'system'

export type TaskStatus = 'pending' | 'in_progress' | 'awaiting_human_input' | 'completed' | 'failed' | 'cancelled'

export type TaskMode = 'await' | 'async'

export type InterKinMessageType = 'request' | 'inform' | 'reply'

export type MemoryCategory = 'fact' | 'preference' | 'decision' | 'knowledge'

export type QueueItemPriority = 'user' | 'kin' | 'task'

export type McpServerStatus = 'active' | 'pending_approval'

export type PaletteId = 'aurora' | 'ocean' | 'forest' | 'sunset' | 'monochrome' | 'sakura' | 'neon' | 'lavender'

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

/** A single tool call as stored in messages.tool_calls JSON */
export interface ToolCallEntry {
  id: string
  name: string
  args: unknown
  result?: unknown
  /** Character offset in the message content where this tool call was triggered */
  offset?: number
}

/** Per-Kin tool authorization config (stored as JSON in kins.tool_config) */
export interface KinToolConfig {
  /** Native tool names that are DISABLED (deny-list — empty means all enabled) */
  disabledNativeTools: string[]
  /** MCP server access — serverId → ['*'] (all tools) or specific tool names */
  mcpAccess: Record<string, string[]>
}

/** Task summary as returned by GET /api/tasks */
export interface TaskSummary {
  id: string
  parentKinId: string
  parentKinName: string
  parentKinAvatarUrl: string | null
  sourceKinId: string | null
  sourceKinName: string | null
  sourceKinAvatarUrl: string | null
  title: string | null
  description: string
  status: TaskStatus
  mode: string
  depth: number
  createdAt: string
  updatedAt: string
}

/** Cron summary as returned by GET /api/crons */
export interface CronSummary {
  id: string
  kinId: string
  kinName: string
  kinAvatarUrl: string | null
  name: string
  schedule: string
  taskDescription: string
  targetKinId: string | null
  model: string | null
  isActive: boolean
  requiresApproval: boolean
  lastTriggeredAt: number | null
  createdBy: 'user' | 'kin'
  createdAt: number
}

// ─── Human Prompt types ──────────────────────────────────────────────────────

export type HumanPromptType = 'confirm' | 'select' | 'multi_select'

export type HumanPromptStatus = 'pending' | 'answered' | 'expired' | 'cancelled'

export type HumanPromptOptionVariant = 'default' | 'success' | 'warning' | 'destructive' | 'primary'

export interface HumanPromptOption {
  label: string
  value: string
  description?: string
  variant?: HumanPromptOptionVariant
}

export interface HumanPromptSummary {
  id: string
  kinId: string
  taskId: string | null
  promptType: HumanPromptType
  question: string
  description: string | null
  options: HumanPromptOption[]
  response: unknown | null
  status: HumanPromptStatus
  createdAt: number
  respondedAt: number | null
}

/** Tool domain categories for UI grouping and color coding */
export type ToolDomain =
  | 'search'
  | 'contacts'
  | 'memory'
  | 'vault'
  | 'tasks'
  | 'inter-kin'
  | 'crons'
  | 'custom'
  | 'images'
  | 'shell'
  | 'file-storage'
  | 'mcp'
