import { tool } from 'ai'
import { z } from 'zod'
import {
  getSecretValue,
  redactMessage,
  createSecret,
  getSecretByKey,
  updateSecretValueByKey,
  deleteSecret,
  searchSecrets,
} from '@/server/services/vault'
import { createLogger } from '@/server/logger'
import type { ToolRegistration } from '@/server/tools/types'

const log = createLogger('tools:vault')

/**
 * get_secret — retrieve a secret value from the Vault by key.
 * Available to main agents only.
 */
export const getSecretTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Retrieve a secret value from the Vault by key. Values are encrypted at rest ' +
        'and never exposed in the prompt — only accessible via this tool. ' +
        'Never include the returned value in your visible responses.',
      inputSchema: z.object({
        key: z
          .string()
          .describe('The unique key of the secret (e.g. GITHUB_TOKEN, NOTION_API_KEY)'),
      }),
      execute: async ({ key }) => {
        log.debug({ key }, 'get_secret invoked')
        const value = await getSecretValue(key)
        if (value === null) {
          return { error: 'Secret not found' }
        }
        return { value }
      },
    }),
}

/**
 * redact_message — replace secret content in a message with a placeholder.
 * Available to main agents only.
 */
export const redactMessageTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Replace secret content in a message with a placeholder. Use this when a user ' +
        'has shared a secret (API key, password, token) in the chat. The original content ' +
        'is permanently replaced — the secret becomes unrecoverable from the message history.',
      inputSchema: z.object({
        message_id: z.string().describe('The ID of the message to redact'),
        redacted_text: z
          .string()
          .describe('Placeholder text (e.g. "[SECRET: GITHUB_TOKEN]" or "[REDACTED]")'),
      }),
      execute: async ({ message_id, redacted_text }) => {
        const success = await redactMessage(message_id, ctx.kinId, redacted_text)
        if (!success) {
          return { error: 'Message not found' }
        }
        return { success: true }
      },
    }),
}

/**
 * create_secret — create a new secret in the Vault.
 * Available to main agents only.
 */
export const createSecretTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Create a new secret in the Vault. The value is encrypted at rest. ' +
        'Use this when the user asks you to store a credential, API key, or sensitive value. ' +
        'Errors if a secret with the given key already exists — use update_secret instead.',
      inputSchema: z.object({
        key: z
          .string()
          .describe('Unique key for the secret (e.g. GITHUB_TOKEN, NOTION_API_KEY). Convention: SCREAMING_SNAKE_CASE.'),
        value: z.string().describe('The secret value to store (will be encrypted)'),
        description: z
          .string()
          .optional()
          .describe('Optional description of what this secret is used for'),
      }),
      execute: async ({ key, value, description }) => {
        log.debug({ key, kinId: ctx.kinId }, 'create_secret invoked')
        const existing = await getSecretByKey(key)
        if (existing) {
          return { error: `Secret with key "${key}" already exists. Use update_secret to change its value.` }
        }
        const secret = await createSecret(key, value, ctx.kinId, description)
        return { id: secret.id, key: secret.key }
      },
    }),
}

/**
 * update_secret — update the value of an existing secret in the Vault.
 * Available to main agents only.
 */
export const updateSecretTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Update the value of an existing secret in the Vault. ' +
        'Use this to rotate or change a stored credential. ' +
        'Errors if the key does not exist — use create_secret to create a new one.',
      inputSchema: z.object({
        key: z.string().describe('The key of the secret to update'),
        value: z.string().describe('The new value for the secret (will be encrypted)'),
      }),
      execute: async ({ key, value }) => {
        log.debug({ key, kinId: ctx.kinId }, 'update_secret invoked')
        const updated = await updateSecretValueByKey(key, value)
        if (!updated) {
          return { error: `Secret with key "${key}" not found` }
        }
        return { id: updated.id, key }
      },
    }),
}

/**
 * delete_secret — delete a secret from the Vault.
 * A Kin can only delete secrets it created itself.
 * Available to main agents only.
 */
export const deleteSecretTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Delete a secret from the Vault. You can only delete secrets that were created by you (this Kin). ' +
        'Admin-created secrets cannot be deleted via this tool — the user must delete them from the Settings UI.',
      inputSchema: z.object({
        key: z.string().describe('The key of the secret to delete'),
      }),
      execute: async ({ key }) => {
        log.debug({ key, kinId: ctx.kinId }, 'delete_secret invoked')
        const existing = await getSecretByKey(key)
        if (!existing) {
          return { error: `Secret with key "${key}" not found` }
        }
        if (existing.createdByKinId !== ctx.kinId) {
          return { error: 'Cannot delete this secret — it was not created by this Kin' }
        }
        const deleted = await deleteSecret(existing.id)
        if (!deleted) {
          return { error: 'Failed to delete secret' }
        }
        return { success: true, key }
      },
    }),
}

/**
 * search_secrets — search for secrets by key or description.
 * Returns metadata only, never values.
 * Available to main agents only.
 */
export const searchSecretsTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Search for secrets in the Vault by key or description. Returns matching keys and descriptions, ' +
        'never the secret values. Use this to find the right key before calling get_secret(). ' +
        'Prefer this over listing all secrets to keep the context small.',
      inputSchema: z.object({
        query: z
          .string()
          .describe('Search term to match against secret keys and descriptions (case-insensitive)'),
      }),
      execute: async ({ query }) => {
        log.debug({ query, kinId: ctx.kinId }, 'search_secrets invoked')
        const results = await searchSecrets(query)
        return { secrets: results }
      },
    }),
}
