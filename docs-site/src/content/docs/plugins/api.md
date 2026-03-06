---
title: Plugin API Reference
description: Complete API reference for KinBot plugin development.
---

## Plugin Context

The `PluginContext` object is passed to your plugin's entry function. It provides access to KinBot services.

```typescript
interface PluginContext {
  config: Record<string, any>
  log: PluginLogger
  storage: PluginStorage
  http: PluginHTTPClient
  memory: PluginMemoryAPI
  notify: PluginNotifyAPI
  manifest: PluginManifest
}
```

### `ctx.config`

An object containing resolved configuration values. Secret values are decrypted automatically. Defaults from `plugin.json` are applied for unset fields.

```typescript
const { apiKey, units = 'metric' } = ctx.config
```

### `ctx.log`

A scoped logger tagged with your plugin name. Supports structured logging:

```typescript
ctx.log.info('Processing request')
ctx.log.error({ err, userId }, 'Failed to fetch data')
ctx.log.debug({ response }, 'API response received')
ctx.log.warn('Deprecated feature used')
```

```typescript
interface PluginLogger {
  debug(msg: string): void
  debug(obj: Record<string, any>, msg: string): void
  info(msg: string): void
  info(obj: Record<string, any>, msg: string): void
  warn(msg: string): void
  warn(obj: Record<string, any>, msg: string): void
  error(msg: string): void
  error(obj: Record<string, any>, msg: string): void
}
```

### `ctx.storage`

Persistent key-value store scoped to your plugin. Values are JSON-serialized. Backed by SQLite.

```typescript
interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
  clear(): Promise<void>
}
```

```typescript
// Examples
await ctx.storage.set('lastSync', Date.now())
const lastSync = await ctx.storage.get<number>('lastSync')
await ctx.storage.delete('lastSync')
const keys = await ctx.storage.list('cache:')
await ctx.storage.clear()
```

### `ctx.http`

A sandboxed HTTP client. Only URLs matching declared `permissions` (`http:*.example.com`) are allowed. Attempts to access undeclared hosts throw a `PermissionDeniedError`.

```typescript
interface PluginHTTPClient {
  fetch(url: string, init?: RequestInit): Promise<Response>
}
```

```typescript
// Must declare "http:api.example.com" in permissions
const res = await ctx.http.fetch('https://api.example.com/data', {
  headers: { 'Authorization': `Bearer ${ctx.config.apiKey}` },
})
const data = await res.json()
```

### `ctx.memory`

Access Kin memory (requires `memory:read` and/or `memory:write` permissions):

```typescript
interface PluginMemoryAPI {
  recall(query: string, kinId: string, limit?: number): Promise<MemoryEntry[]>
  memorize(kinId: string, content: string, metadata?: Record<string, string>): Promise<string>
}
```

### `ctx.notify`

Send notifications to users (requires `notify` permission):

```typescript
interface PluginNotifyAPI {
  send(kinId: string, message: string): Promise<void>
}
```

### `ctx.manifest`

The parsed `plugin.json` manifest object, read-only.

## Plugin Exports

```typescript
interface PluginExports {
  tools?: Record<string, ToolRegistration>
  providers?: Record<string, ProviderDefinition>
  channels?: Record<string, ChannelAdapter>
  hooks?: Partial<Record<HookName, HookHandler>>
  activate?(): Promise<void>
  deactivate?(): Promise<void>
}
```

### Tool Registration

```typescript
interface ToolRegistration {
  availability: Array<'main' | 'sub-kin'>
  defaultDisabled?: boolean
  create: (execCtx: ToolExecutionContext) => Tool
}
```

Tools use the [Vercel AI SDK](https://sdk.vercel.ai/) `tool()` function with Zod schemas for parameters.

### Hook Names

```typescript
type HookName =
  | 'beforeChat'
  | 'afterChat'
  | 'beforeToolCall'
  | 'afterToolCall'
  | 'beforeCompacting'
  | 'afterCompacting'
  | 'onTaskSpawn'
  | 'onCronTrigger'
```

## Plugin Manifest Types

```typescript
interface PluginManifest {
  name: string
  version: string
  description: string
  author?: string
  homepage?: string
  license?: string
  kinbot?: string
  main: string
  icon?: string
  permissions?: string[]
  config?: Record<string, PluginConfigField>
}

interface PluginConfigField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'text'
  label: string
  description?: string
  required?: boolean
  default?: any
  secret?: boolean
  options?: string[]       // select only
  min?: number             // number only
  max?: number             // number only
  step?: number            // number only
  placeholder?: string     // string, text
  pattern?: string         // string only
  rows?: number            // text only
}
```

## REST API

Plugin management is also available via the REST API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plugins` | List all plugins with status |
| `POST` | `/api/plugins/:name/enable` | Enable a plugin |
| `POST` | `/api/plugins/:name/disable` | Disable a plugin |
| `GET` | `/api/plugins/:name/config` | Get plugin config (secrets masked) |
| `PUT` | `/api/plugins/:name/config` | Update plugin config |
| `POST` | `/api/plugins/install/git` | Install from Git URL |
| `POST` | `/api/plugins/install/npm` | Install from npm package |
| `DELETE` | `/api/plugins/:name` | Uninstall a plugin |
| `POST` | `/api/plugins/:name/update` | Update an installed plugin |
| `POST` | `/api/plugins/reload` | Reload all plugins |
| `GET` | `/api/plugins/registry` | Browse the plugin registry |
| `GET` | `/api/plugins/registry/:name/readme` | Fetch a registry plugin's README |

### Install from Git

```bash
curl -X POST http://localhost:3000/api/plugins/install/git \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://github.com/user/kinbot-plugin-weather"}'
```

### Install from npm

```bash
curl -X POST http://localhost:3000/api/plugins/install/npm \
  -H 'Content-Type: application/json' \
  -d '{"package": "kinbot-plugin-weather"}'
```
