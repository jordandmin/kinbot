import { eq, and, desc, asc } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { db, sqlite } from '@/server/db/index'
import { createLogger } from '@/server/logger'
import { queueItems } from '@/server/db/schema'
import { config } from '@/server/config'
import { sseManager } from '@/server/sse/index'

const log = createLogger('queue')

export interface EnqueueParams {
  kinId: string
  messageType: string
  content: string
  sourceType: string
  sourceId?: string
  priority?: number
  requestId?: string
  inReplyTo?: string
  taskId?: string
}

/**
 * Enqueue a message for a Kin. Returns the queue item ID and position.
 */
export async function enqueueMessage(params: EnqueueParams) {
  const id = uuid()
  const priority = params.priority ?? (params.sourceType === 'user' ? config.queue.userPriority : config.queue.kinPriority)

  await db.insert(queueItems).values({
    id,
    kinId: params.kinId,
    messageType: params.messageType,
    content: params.content,
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    priority,
    requestId: params.requestId,
    inReplyTo: params.inReplyTo,
    taskId: params.taskId,
    status: 'pending',
    createdAt: new Date(),
  })

  // Compute queue position
  const pending = await db
    .select()
    .from(queueItems)
    .where(and(eq(queueItems.kinId, params.kinId), eq(queueItems.status, 'pending')))
    .all()

  const queuePosition = pending.length

  // Emit queue update via SSE
  sseManager.sendToKin(params.kinId, {
    type: 'queue:update',
    kinId: params.kinId,
    data: { kinId: params.kinId, queueSize: queuePosition, isProcessing: false },
  })

  log.debug({ kinId: params.kinId, itemId: id, messageType: params.messageType, sourceType: params.sourceType, queuePosition }, 'Message enqueued')

  return { id, queuePosition }
}

/**
 * Dequeue the next message for a Kin. Returns null if the queue is empty.
 * Messages are ordered by priority (DESC) then creation time (ASC).
 *
 * Uses a single atomic UPDATE ... RETURNING * to prevent race conditions:
 * no two callers can grab the same item, even without external locks.
 */
export async function dequeueMessage(kinId: string) {
  const row = sqlite.query<{
    id: string
    kin_id: string
    message_type: string
    content: string
    source_type: string
    source_id: string | null
    priority: number
    request_id: string | null
    in_reply_to: string | null
    task_id: string | null
    status: string
    created_at: number
    processed_at: number | null
  }, [string]>(`
    UPDATE queue_items
    SET status = 'processing'
    WHERE id = (
      SELECT id FROM queue_items
      WHERE kin_id = ? AND status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
    )
    RETURNING *
  `).get(kinId)

  if (!row) return null

  return {
    id: row.id,
    kinId: row.kin_id,
    messageType: row.message_type,
    content: row.content,
    sourceType: row.source_type,
    sourceId: row.source_id,
    priority: row.priority,
    requestId: row.request_id,
    inReplyTo: row.in_reply_to,
    taskId: row.task_id,
    status: row.status,
    createdAt: new Date(row.created_at),
    processedAt: row.processed_at ? new Date(row.processed_at) : null,
  }
}

/**
 * Mark a queue item as done.
 */
export async function markQueueItemDone(itemId: string) {
  await db
    .update(queueItems)
    .set({ status: 'done', processedAt: new Date() })
    .where(eq(queueItems.id, itemId))
}

/**
 * Check if a Kin is currently processing a message.
 */
export async function isKinProcessing(kinId: string): Promise<boolean> {
  const processing = await db
    .select()
    .from(queueItems)
    .where(and(eq(queueItems.kinId, kinId), eq(queueItems.status, 'processing')))
    .get()

  return !!processing
}

/**
 * Get the queue size for a Kin.
 */
export async function getQueueSize(kinId: string): Promise<number> {
  const pending = await db
    .select()
    .from(queueItems)
    .where(and(eq(queueItems.kinId, kinId), eq(queueItems.status, 'pending')))
    .all()

  return pending.length
}

/**
 * Recover orphaned queue items stuck in 'processing' status.
 * This can happen after a crash or restart. Called once at worker startup.
 * Resets them to 'pending' so they get re-processed.
 */
export function recoverStaleProcessingItems() {
  const result = sqlite.run(
    `UPDATE queue_items SET status = 'pending' WHERE status = 'processing'`,
  )
  if (result.changes > 0) {
    log.warn({ count: result.changes }, 'Recovered stale processing queue items → reset to pending')
  }
}
