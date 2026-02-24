import { tool } from 'ai'
import { z } from 'zod'
import { sqlite } from '@/server/db/index'
import type { ToolRegistration } from '@/server/tools/types'

const MAX_ROWS = 500

const READ_PREFIXES = ['SELECT', 'WITH', 'EXPLAIN', 'PRAGMA']

function isReadQuery(sql: string): boolean {
  const upper = sql.trimStart().toUpperCase()
  return READ_PREFIXES.some(p => upper.startsWith(p))
}

export const executeSqlTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (_ctx) =>
    tool({
      description:
        'Execute a raw SQL query against the KinBot SQLite database. ' +
        'SELECT/WITH/EXPLAIN/PRAGMA queries return rows. ' +
        'INSERT/UPDATE/DELETE return the number of rows affected and the last insert rowid. ' +
        'Results are capped at 500 rows for read queries. ' +
        'Use parameterized queries (? placeholders) to safely bind values. ' +
        'WARNING: This is a God Tier tool — write queries are executed immediately with no undo.',
      inputSchema: z.object({
        sql: z.string().describe('The SQL query to execute'),
        params: z
          .array(z.union([z.string(), z.number(), z.null()]))
          .optional()
          .describe('Positional bind parameters for ? placeholders'),
      }),
      execute: async ({ sql, params }) => {
        try {
          const stmt = sqlite.prepare(sql)
          const bindParams = params ?? []

          if (isReadQuery(sql)) {
            const rows = stmt.all(...bindParams) as object[]
            const truncated = rows.length > MAX_ROWS
            return {
              rows: rows.slice(0, MAX_ROWS),
              rowCount: rows.length,
              truncated,
            }
          } else {
            const result = stmt.run(...bindParams)
            return {
              changes: result.changes,
              lastInsertRowid: result.lastInsertRowid?.toString() ?? null,
            }
          }
        } catch (err) {
          return { error: String(err) }
        }
      },
    }),
}
