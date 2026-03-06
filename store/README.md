# KinBot Plugin Store

Official community plugins for KinBot. Each directory contains a self-contained plugin that can be installed directly from the KinBot UI.

## Available Plugins

| Plugin | Description | Tags |
|--------|-------------|------|
| [bookmarks](./bookmarks/) | Save, organize, and search bookmarks with tags. Your Kin remembers useful links so you don't have to. | productivity, tools, bookmarks, links, organization |
| [github-notifications](./github-notifications/) | Check GitHub notifications, issues, pull requests, and repository activity. Keep your Kin informed about your projects. | github, notifications, developer, tools, productivity |
| [home-automation](./home-automation/) | Control your smart home via Home Assistant. Toggle lights, check sensors, run automations, and monitor your home. | home, automation, iot, tools, smart-home |
| [notes](./notes/) | Quick note-taking for your Kin. Capture ideas, reminders, and snippets organized with tags and pinning. | productivity, tools, notes, writing, organization |
| [pomodoro](./pomodoro/) | Pomodoro technique timer. Start focused work sessions with timed breaks to boost productivity. | productivity, timer, tools, focus |
| [rss-reader](./rss-reader/) | Fetch and summarize RSS/Atom feeds. Let your Kin stay up to date with news, blogs, and podcasts. | rss, news, tools, productivity |
| [system-monitor](./system-monitor/) | Monitor system resources: CPU, memory, disk, uptime, and processes. Let your Kin keep an eye on server health. | system, monitoring, tools, devops |
| [calendar](./calendar/) | Manage events and reminders with a built-in calendar. Schedule meetings, set deadlines, and let your Kin keep you on track. | productivity, tools, calendar, scheduling, reminders |

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
