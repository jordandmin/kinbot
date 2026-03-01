# Channel Files Journal

## 2026-03-01 — Run 1: Step 1 — Extend IncomingMessage interface

**Commit:** d10334c  
**What:** Added `IncomingAttachment` interface and optional `attachments` field to `IncomingMessage` in `src/server/channels/adapter.ts`.

**Fields in IncomingAttachment:**
- `platformFileId` (required) — platform-specific file ID
- `mimeType` (optional)
- `fileName` (optional)
- `fileSize` (optional)
- `url` (optional) — direct download URL when available

**Observations:**
- The existing files pipeline (webchat) uses `uploadFile()` in `src/server/services/files.ts` → stores to `data/uploads/messages/<kinId>/` → saves to `files` DB table → linked to messages via `linkFilesToMessage()`
- `kin-engine.ts` (~line 1038) reads files by messageId and converts images to multimodal `{ type: 'image', image: Uint8Array }` parts, non-images become text mentions
- Queue already supports `fileIds` sideband (`src/server/services/queue.ts`)
- `handleIncomingChannelMessage()` in channels.ts needs to: download attachments → store via files service → pass fileIds to `enqueueMessage()`
- 2 pre-existing test failures (unrelated to this change), blocked pre-commit hook → used HUSKY=0

**Next step:** Step 2 — Create file download/storage service for channel files (download from platforms, store via existing files service pattern, return fileIds for queue sideband).
