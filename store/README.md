# KinBot Plugin Store

Official community plugins for KinBot. Each directory contains a self-contained plugin that can be installed directly from the KinBot UI.

## Available Plugins

| Plugin | Description | Tags |
|--------|-------------|------|
| [rss-reader](./rss-reader/) | Fetch and summarize RSS/Atom feeds | rss, news, productivity |

## Contributing a Plugin

```bash
# Scaffold a new plugin
bun store:create my-plugin -d "What it does" -a "Your Name" -i "🚀"

# Validate your manifest
bun store:validate my-plugin

# Test locally
cp -r store/my-plugin plugins/
bun run dev
```

Then open a PR. See [CONTRIBUTING.md](../CONTRIBUTING.md#submitting-a-store-plugin) for full details and the [Plugin Development Guide](../docs/plugins.md) for the API reference.
