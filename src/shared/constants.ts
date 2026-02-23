// Shared constants used by both client and server

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const

export const PROVIDER_TYPES = ['anthropic', 'anthropic-oauth', 'openai', 'gemini', 'voyage', 'brave-search'] as const

/** AI providers (llm, embedding, image capabilities) */
export const AI_PROVIDER_TYPES = ['anthropic', 'anthropic-oauth', 'openai', 'gemini', 'voyage'] as const

/** Search providers (search capability) */
export const SEARCH_PROVIDER_TYPES = ['brave-search'] as const

export const PROVIDER_CAPABILITIES: Record<string, readonly string[]> = {
  anthropic: ['llm'],
  'anthropic-oauth': ['llm'],
  openai: ['llm', 'embedding', 'image'],
  gemini: ['llm', 'image'],
  voyage: ['embedding'],
  'brave-search': ['search'],
} as const

/** Human-readable display names for provider types */
export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  anthropic: 'Anthropic',
  'anthropic-oauth': 'Anthropic (Claude Max)',
  openai: 'OpenAI',
  gemini: 'Gemini',
  voyage: 'Voyage',
  'brave-search': 'Brave Search',
} as const

/** Provider types where the API key field is optional (auto-detected credentials) */
export const PROVIDERS_WITHOUT_API_KEY = ['anthropic-oauth'] as const

export const REQUIRED_CAPABILITIES = ['llm', 'embedding'] as const

export const MESSAGE_SOURCES = ['user', 'kin', 'task', 'cron', 'system'] as const

export const TASK_STATUSES = ['pending', 'in_progress', 'awaiting_human_input', 'completed', 'failed', 'cancelled'] as const

export const PALETTE_IDS = ['aurora', 'ocean', 'forest', 'sunset', 'monochrome'] as const

// ---------------------------------------------------------------------------
// Tool domains — centralized metadata for consistent UI across the app
// ---------------------------------------------------------------------------

import type { ToolDomain } from '@/shared/types'

/** Metadata for a tool domain: icon name (Lucide), CSS classes, i18n key */
export interface ToolDomainMeta {
  /** Lucide icon name (resolved client-side) */
  icon: string
  /** Tailwind bg class for subtle backgrounds (badges, containers) */
  bg: string
  /** Tailwind text class for foreground (text, icons) */
  text: string
  /** Tailwind border class */
  border: string
  /** i18n key under tools.domains.* */
  labelKey: string
}

/** Complete metadata per tool domain — single source of truth.
 *  - `bg`/`border` are used only for icon containers and badges, NOT for full cards.
 *  - Cards use neutral `bg-muted` / `border-border` — domain identity comes from the icon color only.
 *  - Avoid green (success) and red (destructive) for domain colors to prevent confusion with statuses. */
export const TOOL_DOMAIN_META: Record<ToolDomain, ToolDomainMeta> = {
  search:     { icon: 'Search',       bg: 'bg-info/40',      text: 'text-info',             border: 'border-info/40',              labelKey: 'tools.domains.search' },
  contacts:   { icon: 'Users',        bg: 'bg-primary/40',   text: 'text-primary',          border: 'border-primary/40',           labelKey: 'tools.domains.contacts' },
  memory:     { icon: 'Brain',        bg: 'bg-chart-2/40',   text: 'text-chart-2',          border: 'border-chart-2/40',           labelKey: 'tools.domains.memory' },
  vault:      { icon: 'ShieldCheck',  bg: 'bg-warning/40',   text: 'text-warning',          border: 'border-warning/40',           labelKey: 'tools.domains.vault' },
  tasks:      { icon: 'ListTodo',     bg: 'bg-chart-1/40',   text: 'text-chart-1',          border: 'border-chart-1/40',           labelKey: 'tools.domains.tasks' },
  'inter-kin':{ icon: 'MessageCircle',bg: 'bg-chart-4/40',   text: 'text-chart-4',          border: 'border-chart-4/40',           labelKey: 'tools.domains.inter-kin' },
  crons:      { icon: 'Clock',        bg: 'bg-chart-5/40',   text: 'text-chart-5',          border: 'border-chart-5/40',           labelKey: 'tools.domains.crons' },
  custom:     { icon: 'Puzzle',       bg: 'bg-chart-3/40',   text: 'text-chart-3',          border: 'border-chart-3/40',           labelKey: 'tools.domains.custom' },
  images:     { icon: 'Image',        bg: 'bg-primary/40',   text: 'text-primary',          border: 'border-primary/40',           labelKey: 'tools.domains.images' },
  shell:           { icon: 'Terminal',     bg: 'bg-chart-5/40',   text: 'text-chart-5',          border: 'border-chart-5/40',           labelKey: 'tools.domains.shell' },
  'file-storage':  { icon: 'HardDrive',   bg: 'bg-accent/40',   text: 'text-accent-foreground',border: 'border-accent/40',            labelKey: 'tools.domains.file-storage' },
  mcp:             { icon: 'Plug',         bg: 'bg-muted',        text: 'text-muted-foreground', border: 'border-muted-foreground/40',  labelKey: 'tools.domains.mcp' },
} as const

/** Map tool names to their UI domain category */
export const TOOL_DOMAIN_MAP: Record<string, ToolDomain> = {
  // Search
  web_search: 'search',
  // Contacts
  get_contact: 'contacts',
  search_contacts: 'contacts',
  create_contact: 'contacts',
  update_contact: 'contacts',
  delete_contact: 'contacts',
  set_contact_note: 'contacts',
  find_contact_by_identifier: 'contacts',
  // Memory
  recall: 'memory',
  memorize: 'memory',
  update_memory: 'memory',
  forget: 'memory',
  list_memories: 'memory',
  search_history: 'memory',
  // Vault
  get_secret: 'vault',
  redact_message: 'vault',
  create_secret: 'vault',
  update_secret: 'vault',
  delete_secret: 'vault',
  search_secrets: 'vault',
  // Tasks
  spawn_self: 'tasks',
  spawn_kin: 'tasks',
  respond_to_task: 'tasks',
  cancel_task: 'tasks',
  list_tasks: 'tasks',
  report_to_parent: 'tasks',
  update_task_status: 'tasks',
  request_input: 'tasks',
  prompt_human: 'tasks',
  // Inter-Kin
  send_message: 'inter-kin',
  reply: 'inter-kin',
  list_kins: 'inter-kin',
  // Crons
  create_cron: 'crons',
  update_cron: 'crons',
  delete_cron: 'crons',
  list_crons: 'crons',
  // Custom
  register_tool: 'custom',
  run_custom_tool: 'custom',
  list_custom_tools: 'custom',
  // Images
  generate_image: 'images',
  // Shell
  run_shell: 'shell',
  // File Storage
  store_file: 'file-storage',
  get_stored_file: 'file-storage',
  list_stored_files: 'file-storage',
  search_stored_files: 'file-storage',
  update_stored_file: 'file-storage',
  delete_stored_file: 'file-storage',
  // MCP
  add_mcp_server: 'mcp',
  update_mcp_server: 'mcp',
  remove_mcp_server: 'mcp',
  list_mcp_servers: 'mcp',
} as const

/** Suggested labels for contact identifiers (UI combo suggestions, not restrictive) */
export const CONTACT_IDENTIFIER_SUGGESTIONS = [
  'email', 'phone', 'mobile', 'whatsapp',
  'discord', 'telegram', 'signal', 'slack',
  'twitter', 'instagram', 'linkedin', 'github',
  'website',
] as const
