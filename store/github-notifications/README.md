# 🐙 GitHub Notifications

Stay on top of your GitHub activity directly through your Kin. Check notifications, browse issues and pull requests, and monitor repository activity.

## Features

- **Notifications** - View unread/all GitHub notifications
- **Issues** - List and filter issues by state, labels, assignee
- **Pull Requests** - Browse PRs with status indicators (draft, open, merged, closed)
- **Repository Activity** - Recent commits and releases at a glance
- **Mark as Read** - Clear all notifications in one go

## Setup

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `notifications` and `repo` scopes
2. Install the plugin from the KinBot store
3. Paste your token in the plugin settings
4. Optionally set a default repository (e.g. `octocat/hello-world`)

## Tools

| Tool | Description |
|------|-------------|
| `github_notifications` | Check unread or all notifications |
| `github_issues` | List issues for a repository |
| `github_pull_requests` | List pull requests for a repository |
| `github_repo_activity` | Recent commits and releases |
| `github_mark_read` | Mark all notifications as read |

## Example Prompts

- "Check my GitHub notifications"
- "Show open issues in owner/repo"
- "Any open PRs on my project?"
- "What's the latest activity on owner/repo?"
- "Mark all my notifications as read"

## Permissions

This plugin requires HTTP access to `api.github.com`. Your token is stored in KinBot's plugin config and never shared externally.
