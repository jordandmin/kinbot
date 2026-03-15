import { tool } from 'ai'
import { z } from 'zod'
import {
  listChannels,
  getChannel,
  listChannelConversations,
  createChannel,
  updateChannel,
  deleteChannel,
  activateChannel,
  deactivateChannel,
} from '@/server/services/channels'
import { channelAdapters } from '@/server/channels/index'
import { createLogger } from '@/server/logger'
import type { ToolRegistration } from '@/server/tools/types'
import type { OutboundAttachment } from '@/server/channels/adapter'
import type { ChannelPlatform } from '@/shared/types'

const log = createLogger('tools:channel')

/**
 * list_channels — list all messaging channels connected to this Kin.
 * Available to main agents only.
 */
export const listChannelsTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'List all external messaging channels connected to this Kin.',
      inputSchema: z.object({}),
      execute: async () => {
        const items = await listChannels(ctx.kinId)
        return {
          channels: items.map((ch) => ({
            id: ch.id,
            name: ch.name,
            platform: ch.platform,
            status: ch.status,
            messagesReceived: ch.messagesReceived,
            messagesSent: ch.messagesSent,
            lastActivityAt: ch.lastActivityAt
              ? new Date(ch.lastActivityAt as unknown as number).toISOString()
              : null,
          })),
        }
      },
    }),
}

/**
 * list_channel_conversations — list known users and chat IDs for a channel.
 * Useful for proactive messaging: the Kin needs a chat_id to send messages.
 */
export const listChannelConversationsTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'List known users and chat IDs for a channel. Use this to discover who you can message proactively via send_channel_message. ' +
        'Returns users (with their platform user ID usable as chat_id for DMs) and all known chat IDs (including groups).',
      inputSchema: z.object({
        channel_id: z.string().describe('The channel ID to list conversations for'),
      }),
      execute: async ({ channel_id }) => {
        const channel = await getChannel(channel_id)
        if (!channel || channel.kinId !== ctx.kinId) {
          return { error: 'Channel not found' }
        }
        return await listChannelConversations(channel_id)
      },
    }),
}

/**
 * send_channel_message — proactively send a message to an external platform.
 * Opt-in tool (defaultDisabled). Available to main agents only.
 */
export const sendChannelMessageTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Send a message to an external platform via a connected channel. ' +
        'Use this to proactively reach out to users on external platforms, or to send follow-up messages ' +
        'after delegating work to other Kins.',
      inputSchema: z.object({
        channel_id: z.string().describe('The channel ID to send through'),
        chat_id: z.string().describe('The platform chat/channel ID to send to'),
        message: z.string().describe('The message content to send'),
        attachments: z.array(z.object({
          source: z.string().describe('File path (absolute) or URL'),
          mimeType: z.string().describe('MIME type (e.g. "image/png")'),
          fileName: z.string().optional().describe('Display file name'),
        })).optional().describe('Optional file attachments to send with the message'),
      }),
      execute: async ({ channel_id, chat_id, message, attachments }) => {
        log.debug({ kinId: ctx.kinId, channelId: channel_id, chatId: chat_id }, 'Channel message send requested')

        // Verify ownership
        const channel = await getChannel(channel_id)
        if (!channel || channel.kinId !== ctx.kinId) {
          return { error: 'Channel not found' }
        }

        if (channel.status !== 'active') {
          return { error: 'Channel is not active' }
        }

        const adapter = channelAdapters.get(channel.platform)
        if (!adapter) {
          return { error: `No adapter for platform ${channel.platform}` }
        }

        try {
          const cfg = JSON.parse(channel.platformConfig) as Record<string, unknown>
          const outboundAttachments: OutboundAttachment[] | undefined = attachments?.map(a => ({
            source: a.source,
            mimeType: a.mimeType,
            fileName: a.fileName,
          }))
          const result = await adapter.sendMessage(channel_id, cfg, {
            chatId: chat_id,
            content: message,
            attachments: outboundAttachments?.length ? outboundAttachments : undefined,
          })
          return { success: true, platformMessageId: result.platformMessageId }
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Unknown error' }
        }
      },
    }),
}

/**
 * create_channel — create a new messaging channel for this Kin.
 * Opt-in tool (defaultDisabled). Available to main agents only.
 */
export const createChannelTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description:
        'Create a new external messaging channel for this Kin. ' +
        'Available platforms: ' + channelAdapters.list().join(', ') + '. ' +
        'IMPORTANT: Retrieve bot tokens from the Vault (get_secret) — never hardcode them.',
      inputSchema: z.object({
        name: z.string().describe('Display name for the channel'),
        platform: z.string().describe('Platform identifier (e.g. "telegram", "discord")'),
        bot_token: z.string().describe('Bot token / API credential for the platform'),
        allowed_chat_ids: z.array(z.string()).optional().describe('Restrict to specific chat/group IDs'),
        auto_create_contacts: z.boolean().optional().describe('Auto-create contacts for new senders (default: true)'),
      }),
      execute: async ({ name, platform, bot_token, allowed_chat_ids, auto_create_contacts }) => {
        log.debug({ kinId: ctx.kinId, platform, name }, 'Channel creation requested')

        if (!channelAdapters.get(platform)) {
          return { error: `Unknown platform "${platform}". Available: ${channelAdapters.list().join(', ')}` }
        }

        try {
          const channel = await createChannel({
            kinId: ctx.kinId,
            name,
            platform: platform as ChannelPlatform,
            botToken: bot_token,
            allowedChatIds: allowed_chat_ids,
            autoCreateContacts: auto_create_contacts,
            createdBy: 'kin',
          })
          return {
            success: true,
            channel: {
              id: channel.id,
              name: channel.name,
              platform: channel.platform,
              status: channel.status,
            },
          }
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Unknown error' }
        }
      },
    }),
}

/**
 * update_channel — update an existing channel's configuration.
 * Opt-in tool (defaultDisabled). Available to main agents only.
 */
export const updateChannelTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description:
        'Update an existing channel\'s configuration. Only channels owned by this Kin can be updated.',
      inputSchema: z.object({
        channel_id: z.string().describe('Channel ID to update'),
        name: z.string().optional().describe('New display name'),
        allowed_chat_ids: z.array(z.string()).optional().describe('Updated chat ID restrictions (empty array to remove)'),
        auto_create_contacts: z.boolean().optional().describe('Toggle auto-contact creation'),
      }),
      execute: async ({ channel_id, name, allowed_chat_ids, auto_create_contacts }) => {
        const channel = await getChannel(channel_id)
        if (!channel || channel.kinId !== ctx.kinId) {
          return { error: 'Channel not found' }
        }

        try {
          const updated = await updateChannel(channel_id, {
            name,
            allowedChatIds: allowed_chat_ids?.length ? allowed_chat_ids : allowed_chat_ids?.length === 0 ? null : undefined,
            autoCreateContacts: auto_create_contacts,
          })
          if (!updated) return { error: 'Update failed' }
          return {
            success: true,
            channel: {
              id: updated.id,
              name: updated.name,
              platform: updated.platform,
              status: updated.status,
            },
          }
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Unknown error' }
        }
      },
    }),
}

/**
 * delete_channel — permanently delete a channel.
 * Opt-in tool (defaultDisabled). Available to main agents only.
 */
export const deleteChannelTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description:
        'Permanently delete a messaging channel. This stops the channel and removes it entirely. Only channels owned by this Kin can be deleted.',
      inputSchema: z.object({
        channel_id: z.string().describe('Channel ID to delete'),
      }),
      execute: async ({ channel_id }) => {
        const channel = await getChannel(channel_id)
        if (!channel || channel.kinId !== ctx.kinId) {
          return { error: 'Channel not found' }
        }

        try {
          const deleted = await deleteChannel(channel_id)
          return deleted ? { success: true } : { error: 'Delete failed' }
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Unknown error' }
        }
      },
    }),
}

/**
 * activate_channel — activate an inactive channel (start listening).
 * Available to main agents only.
 */
export const activateChannelTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Activate an inactive channel so it starts listening for incoming messages.',
      inputSchema: z.object({
        channel_id: z.string().describe('Channel ID to activate'),
      }),
      execute: async ({ channel_id }) => {
        const channel = await getChannel(channel_id)
        if (!channel || channel.kinId !== ctx.kinId) {
          return { error: 'Channel not found' }
        }

        if (channel.status === 'active') {
          return { error: 'Channel is already active' }
        }

        try {
          const activated = await activateChannel(channel_id)
          if (!activated) return { error: 'Activation failed' }
          return {
            success: activated.status === 'active',
            status: activated.status,
            statusMessage: activated.statusMessage,
          }
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Unknown error' }
        }
      },
    }),
}

/**
 * deactivate_channel — deactivate an active channel (stop listening).
 * Available to main agents only.
 */
export const deactivateChannelTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Deactivate an active channel so it stops listening for incoming messages.',
      inputSchema: z.object({
        channel_id: z.string().describe('Channel ID to deactivate'),
      }),
      execute: async ({ channel_id }) => {
        const channel = await getChannel(channel_id)
        if (!channel || channel.kinId !== ctx.kinId) {
          return { error: 'Channel not found' }
        }

        if (channel.status === 'inactive') {
          return { error: 'Channel is already inactive' }
        }

        try {
          const deactivated = await deactivateChannel(channel_id)
          if (!deactivated) return { error: 'Deactivation failed' }
          return { success: true, status: deactivated.status }
        } catch (err) {
          return { error: err instanceof Error ? err.message : 'Unknown error' }
        }
      },
    }),
}
