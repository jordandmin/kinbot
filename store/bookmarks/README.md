# 🔖 Bookmarks

Save, organize, and search bookmarks with tags. Your Kin remembers useful links so you don't have to.

## Tools

| Tool | Description |
|------|-------------|
| `bookmark_save` | Save a new bookmark with URL, title, tags, and optional note |
| `bookmark_search` | Search bookmarks by keyword (matches title, URL, tags, notes) |
| `bookmark_list` | List all bookmarks or filter by tag |
| `bookmark_edit` | Update a bookmark's title, tags, or note |
| `bookmark_delete` | Remove a bookmark by ID |

## Usage Examples

- "Save this link: https://example.com/article - it's about Rust async"
- "Find my bookmarks about machine learning"
- "Show all bookmarks tagged 'work'"
- "Delete bookmark bk-3"

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| Max Bookmarks | Maximum number of bookmarks to store | 250 |

## Notes

- Bookmarks are stored in-memory per Kin session
- Duplicate URLs are detected and rejected
- Tags are automatically normalized to lowercase
- Search matches against title, URL, tags, and notes
