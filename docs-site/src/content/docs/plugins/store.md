---
title: Plugin Store
description: Browse and install community plugins from the KinBot plugin registry.
---

The Plugin Store lets you discover and install community-built plugins directly from KinBot's UI.

## Browsing the Store

Navigate to **Settings → Plugins → Store** to browse available plugins. Each listing shows:

- Plugin name and description
- Author and license
- Version and compatibility
- Download count and rating

## Installing from the Store

Click **Install** on any plugin to download it into your `plugins/` directory. After installation, the plugin still needs to be **enabled** before it becomes active.

Configure and enable the plugin via **Settings → Plugins**.

## Available Plugins

| Plugin | Icon | Description |
|--------|------|-------------|
| `rss-reader` | 📰 | Fetch and summarize RSS/Atom feeds |
| `pomodoro` | 🍅 | Pomodoro timer for focused work sessions |
| `system-monitor` | 📊 | Monitor CPU, memory, disk, uptime, and processes |
| `bookmarks` | 🔖 | Save and organize bookmarks |
| `notes` | 📝 | Quick note-taking and retrieval |
| `github-notifications` | 🔔 | Monitor GitHub notifications and activity |
| `home-automation` | 🏠 | Control your smart home via Home Assistant |
| `calendar` | 📅 | Manage events, reminders, and scheduling |
| `dictionary` | 📖 | Look up word definitions, synonyms, antonyms, and pronunciation |

More plugins are added by the community regularly.

## Kin Plugin Management Tools

Kins have 8 built-in tools for managing plugins autonomously. These are **main-only** and **opt-in** (disabled by default, enable in Kin settings).

### `list_installed_plugins`

List all installed plugins with status, version, type, and error info.

```
"What plugins do I have installed?"
→ returns: name, version, enabled, error, tool/provider/channel/hook counts
```

### `browse_plugin_store`

Search the community plugin registry by name, description, or tag.

```
"Find me an RSS plugin"
→ browse_plugin_store({ query: "rss" })
→ returns: matching plugins with name, version, description, author, tags
```

### `get_plugin_details`

Get detailed info about an installed plugin: config schema, registered tools, providers, channels, hooks, and current config.

```
"Show me the RSS reader plugin details"
→ get_plugin_details({ name: "rss-reader" })
→ returns: full manifest, permissions, configSchema, currentConfig, tools, providers, etc.
```

### `install_plugin`

Install from the store (by name), a git URL, or an npm package. The plugin must still be enabled after installation.

```
"Install the RSS reader"
→ install_plugin({ source: "store", name: "rss-reader" })

"Install this plugin from GitHub"
→ install_plugin({ source: "git", name: "https://github.com/user/kinbot-plugin-foo" })
```

### `uninstall_plugin`

Remove an installed plugin completely (files and config).

```
"Remove the pomodoro plugin"
→ uninstall_plugin({ name: "pomodoro" })
```

### `enable_plugin`

Enable a disabled plugin so it becomes active.

```
"Turn on the RSS reader"
→ enable_plugin({ name: "rss-reader" })
```

### `disable_plugin`

Disable a plugin without uninstalling it.

```
"Disable the system monitor"
→ disable_plugin({ name: "system-monitor" })
```

### `configure_plugin`

Update a plugin's configuration by passing key-value pairs.

```
"Set the RSS reader to show 20 items max"
→ configure_plugin({ name: "rss-reader", config: { maxItems: "20" } })
```

:::note
These tools require explicit user confirmation for install/uninstall actions. Kins will not autonomously install plugins without being asked.
:::

## Publishing Your Plugin

Want to list your plugin in the store? See the [Publishing section](/kinbot/docs/plugins/developing/#publishing) of the development guide.

## Registry API

The registry can also be accessed programmatically:

```bash
# Browse the registry (returns plugins + tags)
curl http://localhost:3000/api/plugins/registry

# Search/filter the registry
curl "http://localhost:3000/api/plugins/registry/search?q=weather&tag=utility"

# Fetch a plugin's README (by repo URL)
curl "http://localhost:3000/api/plugins/registry/readme?repo=https://github.com/user/kinbot-plugin-weather"

# List built-in store plugins
curl http://localhost:3000/api/plugins/store

# Get store plugin details + README
curl http://localhost:3000/api/plugins/store/rss-reader

# Install a store plugin
curl -X POST http://localhost:3000/api/plugins/store/rss-reader/install
```
