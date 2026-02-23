import { z } from 'zod'
import { tool } from 'ai'
import { createLogger } from '@/server/logger'
import {
  createFileFromContent,
  createFileFromWorkspace,
  createFileFromUrl,
  getFileById,
  getFileByName,
  listFiles,
  searchFiles,
  updateFile,
  deleteFile,
} from '@/server/services/file-storage'
import type { ToolRegistration } from '@/server/tools/types'

const log = createLogger('tools:file-storage')

// ─── store_file ─────────────────────────────────────────────────────────────

export const storeFileTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description:
        'Store a file in the shared file storage and get a shareable URL. ' +
        'You can provide content directly (text or base64), reference a file from your workspace, ' +
        'or download from an external URL.',
      inputSchema: z.object({
        name: z.string().describe('Display name for the file'),
        source: z.enum(['content', 'workspace', 'url']).describe(
          'How to provide the file: "content" for inline text/base64, "workspace" for a file in your workspace, "url" to download from an external URL',
        ),
        content: z.string().optional().describe('File content (text or base64). Required when source is "content"'),
        isBase64: z.boolean().optional().describe('Set to true if content is base64-encoded binary data. Default: false'),
        filePath: z.string().optional().describe('Path relative to your workspace root. Required when source is "workspace"'),
        url: z.string().optional().describe('External URL to download from. Required when source is "url"'),
        mimeType: z.string().optional().describe('MIME type (e.g. "text/plain", "application/json"). Auto-detected if not provided'),
        description: z.string().optional().describe('Optional description of the file'),
        isPublic: z.boolean().optional().describe('Whether anyone with the URL can access the file. Default: true'),
        password: z.string().optional().describe('Set a password to protect the file. Only users with the password can download it'),
        expiresIn: z.number().optional().describe('Auto-delete the file after this many minutes. Omit for no expiration'),
        readAndBurn: z.boolean().optional().describe('Delete the file after the first download. Default: false'),
      }),
      execute: async (args) => {
        log.debug({ kinId: ctx.kinId, name: args.name, source: args.source }, 'store_file invoked')

        try {
          const options = {
            description: args.description,
            isPublic: args.isPublic,
            password: args.password,
            expiresIn: args.expiresIn,
            readAndBurn: args.readAndBurn,
            createdByKinId: ctx.kinId,
          }

          let result
          switch (args.source) {
            case 'content': {
              if (!args.content) return { error: 'content is required when source is "content"' }
              result = await createFileFromContent(
                ctx.kinId,
                args.name,
                args.content,
                args.mimeType || 'text/plain',
                { ...options, isBase64: args.isBase64 },
              )
              break
            }
            case 'workspace': {
              if (!args.filePath) return { error: 'filePath is required when source is "workspace"' }
              result = await createFileFromWorkspace(
                ctx.kinId,
                args.filePath,
                args.name,
                options,
              )
              break
            }
            case 'url': {
              if (!args.url) return { error: 'url is required when source is "url"' }
              result = await createFileFromUrl(
                ctx.kinId,
                args.url,
                args.name,
                options,
              )
              break
            }
          }

          return result
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to store file'
          log.error({ error: err, kinId: ctx.kinId }, 'store_file failed')
          return { error: message }
        }
      },
    }),
}

// ─── get_stored_file ────────────────────────────────────────────────────────

export const getStoredFileTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description: 'Get metadata and share URL for a stored file by ID or name.',
      inputSchema: z.object({
        id: z.string().optional().describe('File ID. Provide either id or name'),
        name: z.string().optional().describe('File display name. Provide either id or name'),
      }),
      execute: async ({ id, name }) => {
        log.debug({ kinId: ctx.kinId, id, name }, 'get_stored_file invoked')

        if (!id && !name) return { error: 'Provide either id or name' }

        if (id) {
          const file = await getFileById(id)
          return file ?? { error: 'File not found' }
        }

        const file = await getFileByName(ctx.kinId, name!)
        return file ?? { error: 'File not found' }
      },
    }),
}

// ─── list_stored_files ──────────────────────────────────────────────────────

export const listStoredFilesTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description: 'List all files in your file storage.',
      inputSchema: z.object({
        limit: z.number().optional().describe('Max number of files to return. Default: 50'),
        offset: z.number().optional().describe('Number of files to skip. Default: 0'),
      }),
      execute: async ({ limit = 50, offset = 0 }) => {
        log.debug({ kinId: ctx.kinId }, 'list_stored_files invoked')
        const allFiles = await listFiles(ctx.kinId)
        const paginated = allFiles.slice(offset, offset + limit)
        return { files: paginated, total: allFiles.length }
      },
    }),
}

// ─── search_stored_files ────────────────────────────────────────────────────

export const searchStoredFilesTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description: 'Search stored files by name or description.',
      inputSchema: z.object({
        query: z.string().describe('Search query to match against file names and descriptions'),
      }),
      execute: async ({ query }) => {
        log.debug({ kinId: ctx.kinId, query }, 'search_stored_files invoked')
        const results = await searchFiles(query, ctx.kinId)
        return { files: results, total: results.length }
      },
    }),
}

// ─── update_stored_file ─────────────────────────────────────────────────────

export const updateStoredFileTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description: 'Update metadata of a stored file (name, description, access settings, expiration).',
      inputSchema: z.object({
        id: z.string().describe('ID of the file to update'),
        name: z.string().optional().describe('New display name'),
        description: z.string().nullable().optional().describe('New description. Set to null to remove'),
        isPublic: z.boolean().optional().describe('Change public/private access'),
        password: z.string().nullable().optional().describe('Set a new password. Set to null to remove password protection'),
        expiresIn: z.number().nullable().optional().describe('Set expiration in minutes from now. Set to null to remove expiration'),
        readAndBurn: z.boolean().optional().describe('Enable or disable read-and-burn'),
      }),
      execute: async (args) => {
        log.debug({ kinId: ctx.kinId, fileId: args.id }, 'update_stored_file invoked')

        const updated = await updateFile(args.id, {
          name: args.name,
          description: args.description,
          isPublic: args.isPublic,
          password: args.password,
          expiresIn: args.expiresIn,
          readAndBurn: args.readAndBurn,
        })

        return updated ?? { error: 'File not found' }
      },
    }),
}

// ─── delete_stored_file ─────────────────────────────────────────────────────

export const deleteStoredFileTool: ToolRegistration = {
  availability: ['main'],
  create: (ctx) =>
    tool({
      description: 'Delete a file from the storage. This permanently removes the file and invalidates its share URL.',
      inputSchema: z.object({
        id: z.string().describe('ID of the file to delete'),
      }),
      execute: async ({ id }) => {
        log.debug({ kinId: ctx.kinId, fileId: id }, 'delete_stored_file invoked')
        const deleted = await deleteFile(id)
        return deleted ? { success: true } : { error: 'File not found' }
      },
    }),
}
