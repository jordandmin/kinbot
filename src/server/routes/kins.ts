import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { mkdirSync, existsSync, rmSync } from 'fs'
import { db } from '@/server/db/index'
import { kins, kinMcpServers, mcpServers, queueItems } from '@/server/db/schema'
import { config } from '@/server/config'

const kinRoutes = new Hono()

// GET /api/kins — list all kins
kinRoutes.get('/', async (c) => {
  const allKins = await db.select().from(kins).all()

  return c.json({
    kins: allKins.map((k) => ({
      id: k.id,
      name: k.name,
      role: k.role,
      avatarUrl: k.avatarPath ? `/api/uploads/kins/${k.id}/avatar` : null,
      model: k.model,
      createdAt: k.createdAt,
    })),
  })
})

// GET /api/kins/:id — get a single kin
kinRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')

  const kin = await db.select().from(kins).where(eq(kins.id, id)).get()
  if (!kin) {
    return c.json({ error: { code: 'KIN_NOT_FOUND', message: 'Kin not found' } }, 404)
  }

  // Get MCP servers for this kin
  const mcpLinks = await db
    .select({ id: mcpServers.id, name: mcpServers.name })
    .from(kinMcpServers)
    .innerJoin(mcpServers, eq(kinMcpServers.mcpServerId, mcpServers.id))
    .where(eq(kinMcpServers.kinId, id))
    .all()

  // Get queue info
  const pendingItems = await db
    .select()
    .from(queueItems)
    .where(eq(queueItems.kinId, id))
    .all()

  const queueSize = pendingItems.filter((q) => q.status === 'pending').length
  const isProcessing = pendingItems.some((q) => q.status === 'processing')

  return c.json({
    id: kin.id,
    name: kin.name,
    role: kin.role,
    avatarUrl: kin.avatarPath ? `/api/uploads/kins/${kin.id}/avatar` : null,
    character: kin.character,
    expertise: kin.expertise,
    model: kin.model,
    workspacePath: kin.workspacePath,
    mcpServers: mcpLinks,
    queueSize,
    isProcessing,
    createdAt: kin.createdAt,
  })
})

// POST /api/kins — create a new kin
kinRoutes.post('/', async (c) => {
  const user = c.get('user') as { id: string }
  const body = await c.req.json()
  const { name, role, character, expertise, model, mcpServerIds } = body as {
    name: string
    role: string
    character: string
    expertise: string
    model: string
    mcpServerIds?: string[]
  }

  const id = uuid()
  const workspacePath = `${config.workspace.baseDir}/${id}`

  // Create workspace directory
  mkdirSync(workspacePath, { recursive: true })
  mkdirSync(`${workspacePath}/tools`, { recursive: true })

  await db.insert(kins).values({
    id,
    name,
    role,
    character,
    expertise,
    model,
    workspacePath,
    createdBy: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Link MCP servers if provided
  if (mcpServerIds && mcpServerIds.length > 0) {
    for (const mcpServerId of mcpServerIds) {
      await db.insert(kinMcpServers).values({ kinId: id, mcpServerId })
    }
  }

  return c.json(
    {
      kin: {
        id,
        name,
        role,
        avatarUrl: null,
        character,
        expertise,
        model,
        workspacePath,
        mcpServers: [],
        queueSize: 0,
        isProcessing: false,
        createdAt: new Date(),
      },
    },
    201,
  )
})

// PATCH /api/kins/:id — update a kin
kinRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const existing = await db.select().from(kins).where(eq(kins.id, id)).get()
  if (!existing) {
    return c.json({ error: { code: 'KIN_NOT_FOUND', message: 'Kin not found' } }, 404)
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) updates.name = body.name
  if (body.role !== undefined) updates.role = body.role
  if (body.character !== undefined) updates.character = body.character
  if (body.expertise !== undefined) updates.expertise = body.expertise
  if (body.model !== undefined) updates.model = body.model

  await db.update(kins).set(updates).where(eq(kins.id, id))

  // Update MCP server links if provided
  if (body.mcpServerIds !== undefined) {
    await db.delete(kinMcpServers).where(eq(kinMcpServers.kinId, id))
    for (const mcpServerId of body.mcpServerIds as string[]) {
      await db.insert(kinMcpServers).values({ kinId: id, mcpServerId })
    }
  }

  // Return updated kin
  const updated = await db.select().from(kins).where(eq(kins.id, id)).get()
  const mcpLinks = await db
    .select({ id: mcpServers.id, name: mcpServers.name })
    .from(kinMcpServers)
    .innerJoin(mcpServers, eq(kinMcpServers.mcpServerId, mcpServers.id))
    .where(eq(kinMcpServers.kinId, id))
    .all()

  return c.json({
    kin: {
      id: updated!.id,
      name: updated!.name,
      role: updated!.role,
      avatarUrl: updated!.avatarPath ? `/api/uploads/kins/${id}/avatar` : null,
      character: updated!.character,
      expertise: updated!.expertise,
      model: updated!.model,
      workspacePath: updated!.workspacePath,
      mcpServers: mcpLinks,
      queueSize: 0,
      isProcessing: false,
      createdAt: updated!.createdAt,
    },
  })
})

// DELETE /api/kins/:id — delete a kin
kinRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')

  const existing = await db.select().from(kins).where(eq(kins.id, id)).get()
  if (!existing) {
    return c.json({ error: { code: 'KIN_NOT_FOUND', message: 'Kin not found' } }, 404)
  }

  // Clean up MCP server links
  await db.delete(kinMcpServers).where(eq(kinMcpServers.kinId, id))

  // Delete the kin
  await db.delete(kins).where(eq(kins.id, id))

  // Remove workspace directory
  if (existing.workspacePath && existsSync(existing.workspacePath)) {
    rmSync(existing.workspacePath, { recursive: true, force: true })
  }

  return c.json({ success: true })
})

// POST /api/kins/:id/avatar — upload avatar
kinRoutes.post('/:id/avatar', async (c) => {
  const id = c.req.param('id')

  const existing = await db.select().from(kins).where(eq(kins.id, id)).get()
  if (!existing) {
    return c.json({ error: { code: 'KIN_NOT_FOUND', message: 'Kin not found' } }, 404)
  }

  const contentType = c.req.header('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    // Upload mode
    const formData = await c.req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return c.json({ error: { code: 'INVALID_FILE', message: 'No file provided' } }, 400)
    }

    const avatarDir = `${config.upload.dir}/kins/${id}`
    if (!existsSync(avatarDir)) {
      mkdirSync(avatarDir, { recursive: true })
    }

    const ext = file.name.split('.').pop() ?? 'png'
    const filename = `avatar.${ext}`
    const filePath = `${avatarDir}/${filename}`
    const buffer = await file.arrayBuffer()
    await Bun.write(filePath, buffer)

    await db
      .update(kins)
      .set({ avatarPath: filePath, updatedAt: new Date() })
      .where(eq(kins.id, id))

    return c.json({ avatarUrl: `/api/uploads/kins/${id}/avatar` })
  }

  // JSON mode (generate or prompt) — placeholder for Phase 21
  const body = await c.req.json()
  if (body.mode === 'generate' || body.mode === 'prompt') {
    return c.json(
      { error: { code: 'NOT_IMPLEMENTED', message: 'Image generation not yet available' } },
      501,
    )
  }

  return c.json({ error: { code: 'INVALID_REQUEST', message: 'Invalid avatar mode' } }, 400)
})

export { kinRoutes }
