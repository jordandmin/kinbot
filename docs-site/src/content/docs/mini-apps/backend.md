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

The file must default-export a function that receives a context object and returns a [Hono](https://hono.dev) app instance.

## Backend Context

| Property | Type | Description |
|----------|------|-------------|
| `ctx.Hono` | `class` | Hono constructor (no import needed) |
| `ctx.storage` | `PluginStorage` | Key-value storage (same as frontend storage) |
| `ctx.events` | `EventEmitter` | SSE event emitter |
| `ctx.appId` | `string` | The mini-app's ID |
| `ctx.kinId` | `string` | The parent Kin's ID |
| `ctx.appName` | `string` | The mini-app's display name |
| `ctx.log` | `Logger` | Scoped logger |

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

From React, use the `useApi` hook or the `api` object:

```jsx
import { useKinBot, useApi } from "@kinbot/react";

function ItemList() {
  const { api } = useKinBot();
  const { data: items, loading, refetch } = useApi("/items");

  const addItem = async (name) => {
    await api.post("/items", { name });
    refetch();
  };

  // ...
}
```

Or use the raw API client:

```javascript
const items = await KinBot.api.get("/items");
await KinBot.api.post("/items", { name: "New item" });
await KinBot.api.delete("/items/123");
```

## Real-Time Events (SSE)

The backend can push events to the frontend in real-time.

### Backend: Emit Events

```javascript
export default function(ctx) {
  const app = new ctx.Hono();

  app.post("/process", async (c) => {
    const body = await c.req.json();

    // Emit progress events
    ctx.events.emit("progress", { step: 1, total: 3 });
    // ... do work ...
    ctx.events.emit("progress", { step: 2, total: 3 });
    // ... more work ...
    ctx.events.emit("progress", { step: 3, total: 3 });
    ctx.events.emit("done", { result: "Complete!" });

    return c.json({ success: true });
  });

  return app;
}
```

### Frontend: Subscribe

```jsx
import { useEventStream } from "@kinbot/react";

function ProcessMonitor() {
  const { messages, connected } = useEventStream("progress");

  // Or with a callback (no accumulation):
  useEventStream("done", (data) => {
    toast(data.result, "success");
  });

  return (
    <div>
      {messages.map((msg, i) => (
        <p key={i}>Step {msg.data.step}/{msg.data.total}</p>
      ))}
    </div>
  );
}
```

Or using the raw SDK:

```javascript
KinBot.events.on("progress", (data) => {
  console.log(`Step ${data.step}/${data.total}`);
});
```

## Storage

The backend shares the same storage namespace as the frontend. Data written by one is readable by the other:

```javascript
// Backend
await ctx.storage.set("config", { theme: "dark" });

// Frontend
const [config] = useStorage("config");
// config === { theme: "dark" }
```

## Logging

```javascript
ctx.log.info("Processing request");
ctx.log.error({ err }, "Something went wrong");
ctx.log.debug({ data }, "Received data");
```

Logs appear in KinBot's server logs tagged with the app name.
