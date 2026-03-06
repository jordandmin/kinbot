# 📅 Calendar Plugin

Manage events and reminders with a built-in calendar. Schedule meetings, set deadlines, and let your Kin keep you on track.

## Tools

| Tool | Description |
|------|-------------|
| `create_event` | Create a new event with title, time, location, tags, recurrence |
| `list_events` | List events within a date range (defaults to today) |
| `get_event` | Get details of a specific event |
| `update_event` | Modify an existing event |
| `delete_event` | Remove an event |
| `upcoming_events` | See what's coming up in the next N hours |
| `search_events` | Search events by keyword |

## Examples

```
"Schedule a meeting with Alice tomorrow at 2pm"
→ create_event({ title: "Meeting with Alice", start: "2025-03-16T14:00:00" })

"What do I have today?"
→ list_events({})

"What's coming up in the next 48 hours?"
→ upcoming_events({ hours: 48 })

"Move the dentist appointment to Friday"
→ update_event({ id: "evt-3", start: "2025-03-21T10:00:00" })
```

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| Max Events | Maximum number of events to store | 500 |
| Default Reminder | Minutes before event for reminders | 15 min |

## Notes

- Events are stored in-memory per Kin instance
- Supports recurrence patterns: daily, weekly, monthly, yearly
- All times in ISO 8601 format
- Tags allow categorization and filtering
