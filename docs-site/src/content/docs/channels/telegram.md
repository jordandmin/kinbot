---
title: Telegram
description: Connect your Kin to Telegram using a bot.
---

Telegram integration uses the [Bot API](https://core.telegram.org/bots/api) with webhooks for real-time message delivery.

## Setup

1. **Create a bot** with [@BotFather](https://t.me/BotFather) on Telegram
2. Copy the bot token
3. In KinBot, go to your Kin's **Channels** tab
4. Click **Add Channel**, select **Telegram**
5. Paste your bot token — it will be encrypted in KinBot's vault
6. Optionally, restrict to specific chat IDs with the allowlist

KinBot automatically registers a webhook with Telegram pointing to your instance.

## Configuration

| Field | Required | Description |
|-------|----------|-------------|
| Bot Token | ✅ | Token from BotFather (stored encrypted) |
| Allowed Chat IDs | ❌ | Restrict to specific chats (groups or users) |

## How It Works

- **Inbound:** Telegram sends updates to KinBot's webhook endpoint. The adapter parses messages, extracts text and attachments (photos, documents, audio, video), and routes them to the Kin.
- **Outbound:** Messages are sent via the Bot API. Long messages (>4,096 chars) are automatically split. File attachments are uploaded as multipart form data.

## Features

- Text messages with Markdown formatting
- Image, document, audio, and video attachments (inbound and outbound)
- Reply threading via `reply_to_message_id`
- Automatic message chunking at paragraph/line boundaries
- Group chat support (with optional chat ID filtering)

## Requirements

- Your KinBot instance must be reachable from the internet (Telegram needs to send webhooks)
- Configure `PUBLIC_URL` in your KinBot environment so the webhook URL is correct
