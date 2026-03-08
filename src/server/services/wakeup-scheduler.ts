import { eq, and, lt } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { db } from '@/server/db/index'
import { scheduledWakeups, kins } from '@/server/db/schema'
import { enqueueMessage } from '@/server/services/queue'
import { config } from '@/server/config'
import { createLogger } from '@/server/logger'

const log = createLogger('wakeup-scheduler')

/** In-memory map of pending timers (cleared on restart — DB rows are the source of truth) */
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Schedule a one-shot wake-up for a Kin.
 * Persisted to DB so it survives server restarts.
 */
export async function scheduleWakeup(params: {
  callerKinId: string
  targetKinId: string
  seconds: number
  reason?: string
}): Promise<{ id: string; fireAt: Date }> {
  const { callerKinId, targetKinId, seconds, reason } = params

  await _enforceMaxPending(callerKinId)

  const id = uuid()
  const fireAt = new Date(Date.now() + seconds * 1000)

  await db.insert(scheduledWakeups).values({
    id,
    callerKinId,
    targetKinId,
    reason: reason ?? null,
    fireAt: fireAt.getTime(),
    intervalSeconds: null,
    expiresAt: null,
    status: 'pending',
    createdAt: new Date(),
  })

  _armTimer(id, targetKinId, reason, seconds * 1000)

  log.info({ id, callerKinId, targetKinId, seconds, fireAt }, 'Wake-up scheduled')

  return { id, fireAt }
}

/**
 * Schedule a recurring wake-up for a Kin.
 * Fires every `intervalSeconds` until `expiresAt` or cancelled.
 */
export async function scheduleRecurringWakeup(params: {
  callerKinId: string
  targetKinId: string
  intervalSeconds: number
  reason?: string
  expiresInSeconds?: number
}): Promise<{ id: string; fireAt: Date; expiresAt: Date | null }> {
  const { callerKinId, targetKinId, intervalSeconds, reason, expiresInSeconds } = params

  await _enforceMaxPending(callerKinId)

  const id = uuid()
  const fireAt = new Date(Date.now() + intervalSeconds * 1000)
  const expiresAt = expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000) : null

  await db.insert(scheduledWakeups).values({
    id,
    callerKinId,
    targetKinId,
    reason: reason ?? null,
    fireAt: fireAt.getTime(),
    intervalSeconds,
    expiresAt: expiresAt?.getTime() ?? null,
    status: 'pending',
    createdAt: new Date(),
  })

  _armTimer(id, targetKinId, reason, intervalSeconds * 1000)

  log.info({ id, callerKinId, targetKinId, intervalSeconds, fireAt, expiresAt }, 'Recurring wake-up scheduled')

  return { id, fireAt, expiresAt }
}

/**
 * Cancel a pending wake-up by ID.
 * Returns false if not found or already fired/cancelled.
 */
export async function cancelWakeup(id: string, requestingKinId: string): Promise<boolean> {
  const row = await db.select().from(scheduledWakeups).where(eq(scheduledWakeups.id, id)).get()

  if (!row) return false
  if (row.callerKinId !== requestingKinId) return false
  if (row.status !== 'pending') return false

  // Clear in-memory timer
  const timer = pendingTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    pendingTimers.delete(id)
  }

  await db
    .update(scheduledWakeups)
    .set({ status: 'cancelled' })
    .where(eq(scheduledWakeups.id, id))

  log.info({ id, requestingKinId }, 'Wake-up cancelled')
  return true
}

/**
 * List pending wake-ups created by a Kin.
 */
export async function listPendingWakeups(callerKinId: string) {
  return db
    .select()
    .from(scheduledWakeups)
    .where(and(eq(scheduledWakeups.callerKinId, callerKinId), eq(scheduledWakeups.status, 'pending')))
    .all()
}

/**
 * Recover pending wake-ups from DB on server startup.
 * Overdue wakeups fire immediately; future ones get new timers.
 */
export async function recoverPendingWakeups(): Promise<void> {
  const rows = await db
    .select()
    .from(scheduledWakeups)
    .where(eq(scheduledWakeups.status, 'pending'))
    .all()

  if (rows.length === 0) return

  log.info({ count: rows.length }, 'Recovering pending wake-ups')

  const now = Date.now()
  for (const row of rows) {
    const delay = row.fireAt - now
    if (delay <= 0) {
      // Overdue — fire immediately (async, don't await)
      _fireWakeup(row.id, row.targetKinId, row.reason ?? undefined).catch((err) =>
        log.error({ err, wakeupId: row.id }, 'Failed to fire overdue wake-up'),
      )
    } else {
      _armTimer(row.id, row.targetKinId, row.reason ?? undefined, delay)
    }
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function _enforceMaxPending(callerKinId: string): Promise<void> {
  const pendingCount = await db
    .select()
    .from(scheduledWakeups)
    .where(and(eq(scheduledWakeups.callerKinId, callerKinId), eq(scheduledWakeups.status, 'pending')))
    .all()

  if (pendingCount.length >= config.wakeups.maxPendingPerKin) {
    throw new Error(
      `Maximum pending wake-ups reached (${config.wakeups.maxPendingPerKin}). Cancel one before scheduling more.`,
    )
  }
}

function _armTimer(
  wakeupId: string,
  targetKinId: string,
  reason: string | undefined,
  delayMs: number,
): void {
  const timer = setTimeout(() => {
    _fireWakeup(wakeupId, targetKinId, reason).catch((err) =>
      log.error({ err, wakeupId }, 'Failed to fire wake-up'),
    )
  }, delayMs)
  pendingTimers.set(wakeupId, timer)
}

async function _fireWakeup(
  wakeupId: string,
  targetKinId: string,
  reason: string | undefined,
): Promise<void> {
  // Guard: check the row still exists and is pending (could have been cancelled)
  const row = await db.select().from(scheduledWakeups).where(eq(scheduledWakeups.id, wakeupId)).get()
  if (!row || row.status !== 'pending') return

  // Check target Kin still exists
  const kin = await db.select().from(kins).where(eq(kins.id, targetKinId)).get()
  if (!kin) {
    log.warn({ wakeupId, targetKinId }, 'Target Kin no longer exists — skipping wake-up')
    await db.update(scheduledWakeups).set({ status: 'cancelled' }).where(eq(scheduledWakeups.id, wakeupId))
    pendingTimers.delete(wakeupId)
    return
  }

  pendingTimers.delete(wakeupId)

  const isRecurring = row.intervalSeconds != null && row.intervalSeconds > 0

  // Build message
  const lines: string[] = [
    isRecurring
      ? '🔁 [Recurring wake-up] Your recurring alarm has triggered.'
      : '⏰ [Scheduled wake-up] Your scheduled alarm has triggered.',
  ]
  if (reason) {
    lines.push(`Reason: ${reason}`)
  }
  lines.push('Please proceed with what you planned.')

  // For recurring wakeups: check expiry, then re-arm or mark as fired
  if (isRecurring) {
    const nextFireAt = Date.now() + row.intervalSeconds! * 1000
    const expired = row.expiresAt != null && nextFireAt > row.expiresAt

    if (expired) {
      // Expired — mark as fired (final) and notify
      lines.push('This was the last occurrence — the recurring wake-up has expired.')
      await db
        .update(scheduledWakeups)
        .set({ status: 'fired', fireAt: Date.now() })
        .where(eq(scheduledWakeups.id, wakeupId))
      log.info({ wakeupId, targetKinId }, 'Recurring wake-up expired after final fire')
    } else {
      // Re-arm: update fireAt for next occurrence, keep status pending
      await db
        .update(scheduledWakeups)
        .set({ fireAt: nextFireAt })
        .where(eq(scheduledWakeups.id, wakeupId))
      _armTimer(wakeupId, targetKinId, reason, row.intervalSeconds! * 1000)
      log.info({ wakeupId, targetKinId, nextFireAt: new Date(nextFireAt) }, 'Recurring wake-up re-armed')
    }
  } else {
    // One-shot: mark as fired
    await db
      .update(scheduledWakeups)
      .set({ status: 'fired' })
      .where(eq(scheduledWakeups.id, wakeupId))
    log.info({ wakeupId, targetKinId }, 'Wake-up fired')
  }

  await enqueueMessage({
    kinId: targetKinId,
    messageType: 'wakeup',
    content: lines.join('\n'),
    sourceType: 'system',
    priority: config.queue.kinPriority,
  })
}
