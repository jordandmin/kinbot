---
title: Backend (_server.js)
description: Add server-side logic to mini-apps with Hono.
---

Mini-apps can have a backend by creating a `_server.js` file. The backend runs server-side in KinBot's process and is accessible via a scoped API.

## Quick Start

Create `_server.js` via the `write_mini_app_file` tool:

```javascript
export default function(ctx) {
  const app = new ctx.Hono();

  app.get("/hello", (c) => {
    return c.json({ message: "Hello from the backend!" });
  });

  return app;
}
```

The file must default-export a function that receives a context object and returns a [Hono](https://hono.dev) app (or any object with a `.fetch()` method).

## Backend Context

| Property | Type | Description |
|----------|------|-------------|
| `ctx.Hono` | `class` | Hono constructor (no import needed) |
| `ctx.appId` | `string` | The mini-app's ID |
| `ctx.kinId` | `string` | The parent Kin's ID |
| `ctx.appName` | `string` | The mini-app's display name |
| `ctx.storage` | `object` | Key-value storage scoped to this app (see [Storage](#storage)) |
| `ctx.events` | `object` | SSE event emitter (see [Real-Time Events](#real-time-events-sse)) |
| `ctx.log` | `object` | Scoped logger (see [Logging](#logging)) |

## Routes

Backend routes are served at:

```
/api/mini-apps/<appId>/api/*
```

Define routes using standard Hono patterns:

```javascript
export default function(ctx) {
  const app = new ctx.Hono();

  app.get("/items", async (c) => {
    const items = await ctx.storage.get("items") ?? [];
    return c.json(items);
  });

  app.post("/items", async (c) => {
    const body = await c.req.json();
    const items = await ctx.storage.get("items") ?? [];
    items.push({ id: Date.now(), ...body });
    await ctx.storage.set("items", items);
    return c.json({ success: true });
  });

  app.delete("/items/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const items = await ctx.storage.get("items") ?? [];
    await ctx.storage.set("items", items.filter(i => i.id !== id));
    return c.json({ success: true });
  });

  return app;
}
```

## Frontend Access

### React Hook

Use the `useApi` hook for declarative data fetching from your backend:

```jsx
import { useApi } from "@kinbot/react";

function ItemList() {
  const { data: items, loading, error, refetch } = useApi("/items");

  const addItem = async (name) => {
    // Use the SDK api object for mutations
    await KinBot.api.post("/items", { name });
    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {items?.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

`useApi` options:

| Option | Type | Description |
|--------|------|-------------|
| `method` | `string` | HTTP method (default: `"GET"`) |
| `body` | `unknown` | Request body (JSON-serialized) |
| `headers` | `Record<string, string>` | Extra headers |
| `enabled` | `boolean` | Set to `false` to skip fetching (pass `null` as path also works) |

### Raw SDK

The `KinBot.api` object provides full CRUD methods:

```javascript
// GET + parse JSON
const items = await KinBot.api.get("/items");

// POST JSON
await KinBot.api.post("/items", { name: "New item" });

// PUT / PATCH / DELETE
await KinBot.api.put("/items/123", { name: "Updated" });
await KinBot.api.patch("/items/123", { done: true });
await KinBot.api.delete("/items/123");

// Raw fetch (returns Response)
const res = await KinBot.api("/items", { method: "GET" });
```

| Method | Signature | Returns |
|--------|-----------|---------|
| `api(path, options?)` | `(string, RequestInit?) => Promise<Response>` | Raw `Response` |
| `api.get(path)` | `(string) => Promise<T>` | Parsed JSON |
| `api.json(path)` | `(string) => Promise<T>` | Parsed JSON (alias for `get`) |
| `api.post(path, data?)` | `(string, unknown?) => Promise<T>` | Parsed JSON |
| `api.put(path, data?)` | `(string, unknown?) => Promise<T>` | Parsed JSON |
| `api.patch(path, data?)` | `(string, unknown?) => Promise<T>` | Parsed JSON |
| `api.delete(path)` | `(string) => Promise<T>` | Parsed JSON |

## Real-Time Events (SSE)

The backend can push events to the frontend in real-time using the `ctx.events` emitter.

### Backend: Emit Events

```javascript
export default function(ctx) {
  const app = new ctx.Hono();

  app.post("/process", async (c) => {
    const body = await c.req.json();

    ctx.events.emit("progress", { step: 1, total: 3 });
    // ... do work ...
    ctx.events.emit("progress", { step: 2, total: 3 });
    // ... more work ...
    ctx.events.emit("done", { result: "Complete!" });

    return c.json({ success: true });
  });

  // Check how many clients are listening
  app.get("/listeners", (c) => {
    return c.json({ count: ctx.events.subscriberCount });
  });

  return app;
}
```

| Method | Description |
|--------|-------------|
| `ctx.events.emit(event, data?)` | Push a named event to all connected SSE clients |
| `ctx.events.subscriberCount` | Number of currently connected clients (read-only) |

### Frontend: React Hook

```jsx
import { useEventStream } from "@kinbot/react";

function ProcessMonitor() {
  // Accumulate all "progress" events
  const { messages, connected, clear } = useEventStream("progress");

  // Or filter with a callback (no accumulation):
  useEventStream("done", (data) => {
    console.log("Done!", data.result);
  });

  return (
    <div>
      <p>Connected: {connected ? "yes" : "no"}</p>
      {messages.map((msg, i) => (
        <p key={i}>Step {msg.data.step}/{msg.data.total}</p>
      ))}
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

Each message in the `messages` array has the shape:

```typescript
{ event: string; data: unknown; ts: number }
```

### Frontend: Raw SDK

```javascript
// Listen for a specific event
KinBot.events.on("progress", (data) => {
  console.log(`Step ${data.step}/${data.total}`);
});

// Subscribe to all events
KinBot.events.subscribe((event) => {
  console.log(event.event, event.data);
});

// Check connection status
console.log(KinBot.events.connected);

// Disconnect when done
KinBot.events.close();
```

| Method | Description |
|--------|-------------|
| `events.on(name, callback)` | Listen for a specific named event |
| `events.subscribe(callback)` | Receive all events `{ event, data }` |
| `events.connected` | Whether the SSE connection is active (read-only) |
| `events.close()` | Disconnect the SSE stream |

## Storage

The backend shares the same storage namespace as the frontend. Data written by one is readable by the other.

### Backend Storage API

```javascript
// Read
const items = await ctx.storage.get("items");    // null if not set

// Write
await ctx.storage.set("items", [{ id: 1, name: "Test" }]);

// Delete a single key
await ctx.storage.delete("items");               // returns boolean

// List all keys
const keys = await ctx.storage.list();           // [{ key, size }]

// Clear all storage for this app
const count = await ctx.storage.clear();         // returns number deleted
```

| Method | Signature | Returns |
|--------|-----------|---------|
| `get(key)` | `(string) => Promise<unknown \| null>` | Parsed JSON value or `null` |
| `set(key, value)` | `(string, unknown) => Promise<void>` | Stores as JSON |
| `delete(key)` | `(string) => Promise<boolean>` | `true` if key existed |
| `list()` | `() => Promise<{ key, size }[]>` | All keys with byte sizes |
| `clear()` | `() => Promise<number>` | Number of keys deleted |

### Frontend reads backend data

```jsx
import { useStorage } from "@kinbot/react";

function ConfigPanel() {
  // Reads the same key the backend wrote
  const [config] = useStorage("config");
  // config === { theme: "dark" } if backend did ctx.storage.set("config", { theme: "dark" })
}
```

## Logging

```javascript
ctx.log.info("Processing request");
ctx.log.warn("Deprecated endpoint called");
ctx.log.error("Something went wrong", errorDetails);
ctx.log.debug("Received data", payload);
```

Logs appear in KinBot's server logs, scoped to the app ID. Each method accepts variadic arguments (the first argument is used as the log message).
