import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type { ToolExecutionContext } from '@/server/tools/types'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockCreateCustomTool = mock(() =>
  Promise.resolve({ id: 'ct-1', name: 'my_tool', description: 'A test tool', scriptPath: 'tools/my_script.sh', createdAt: new Date() }),
)

const mockExecuteCustomTool = mock(() =>
  Promise.resolve({
    success: true,
    output: 'hello world',
    error: undefined,
    exitCode: 0,
    executionTime: 42,
  }),
)

const mockListCustomTools = mock(() =>
  Promise.resolve([
    { id: 'ct-1', name: 'my_tool', description: 'A test tool', scriptPath: 'tools/my_script.sh', createdAt: new Date('2025-01-01') },
    { id: 'ct-2', name: 'another_tool', description: 'Another tool', scriptPath: 'tools/another.py', createdAt: new Date('2025-01-02') },
  ]),
)

mock.module('@/server/services/custom-tools', () => ({
  createCustomTool: mockCreateCustomTool,
  executeCustomTool: mockExecuteCustomTool,
  listCustomTools: mockListCustomTools,
}))

mock.module('@/server/logger', () => ({
  createLogger: () => ({ debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }),
}))

// Import after mocks
const { registerToolTool, runCustomToolTool, listCustomToolsTool } = await import(
  '@/server/tools/custom-tool-tools'
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ctx: ToolExecutionContext = { kinId: 'kin-test', isSubKin: false }

function execute(registration: any, args: any) {
  const t = registration.create(ctx)
  return t.execute(args, { toolCallId: 'tc-1', messages: [], abortSignal: new AbortController().signal })
}

function resetMocks() {
  mockCreateCustomTool.mockReset()
  mockExecuteCustomTool.mockReset()
  mockListCustomTools.mockReset()
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('custom-tool-tools', () => {
  beforeEach(() => {
    resetMocks()
    // Restore default implementations
    mockCreateCustomTool.mockResolvedValue({
      id: 'ct-1', name: 'my_tool', description: 'A test tool',
      scriptPath: 'tools/my_script.sh', createdAt: new Date(),
    })
    mockExecuteCustomTool.mockResolvedValue({
      success: true, output: 'hello world', error: undefined, exitCode: 0, executionTime: 42,
    })
    mockListCustomTools.mockResolvedValue([
      { id: 'ct-1', name: 'my_tool', description: 'A test tool', scriptPath: 'tools/my_script.sh', createdAt: new Date('2025-01-01') },
      { id: 'ct-2', name: 'another_tool', description: 'Another tool', scriptPath: 'tools/another.py', createdAt: new Date('2025-01-02') },
    ])
  })

  // ─── register_tool ──────────────────────────────────────────────────────

  describe('registerToolTool', () => {
    it('has correct availability', () => {
      expect(registerToolTool.availability).toEqual(['main'])
    })

    it('registers a custom tool successfully', async () => {
      const result = await execute(registerToolTool, {
        name: 'my_tool',
        description: 'A test tool',
        parameters: '{"type":"object","properties":{}}',
        path: 'tools/my_script.sh',
      })

      expect(result.success).toBe(true)
      expect(result.toolId).toBe('ct-1')
      expect(result.message).toContain('my_tool')
      expect(result.message).toContain('registered')

      expect(mockCreateCustomTool).toHaveBeenCalledTimes(1)
      expect(mockCreateCustomTool).toHaveBeenCalledWith({
        kinId: 'kin-test',
        name: 'my_tool',
        description: 'A test tool',
        parameters: '{"type":"object","properties":{}}',
        scriptPath: 'tools/my_script.sh',
      })
    })

    it('returns error when createCustomTool throws', async () => {
      mockCreateCustomTool.mockRejectedValue(new Error('Duplicate tool name'))

      const result = await execute(registerToolTool, {
        name: 'my_tool',
        description: 'A test tool',
        parameters: '{}',
        path: 'tools/my_script.sh',
      })

      expect(result.error).toBe('Duplicate tool name')
      expect(result.success).toBeUndefined()
    })

    it('returns "Unknown error" for non-Error throws', async () => {
      mockCreateCustomTool.mockRejectedValue('string error')

      const result = await execute(registerToolTool, {
        name: 'my_tool',
        description: 'test',
        parameters: '{}',
        path: 'tools/x.sh',
      })

      expect(result.error).toBe('Unknown error')
    })

    it('passes kinId from context', async () => {
      const customCtx: ToolExecutionContext = { kinId: 'kin-other', isSubKin: false }
      const t = registerToolTool.create(customCtx)
      await t.execute(
        { name: 'foo', description: 'bar', parameters: '{}', path: 'tools/foo.sh' },
        { toolCallId: 'tc-2', messages: [], abortSignal: new AbortController().signal },
      )

      expect(mockCreateCustomTool.mock.calls[0][0].kinId).toBe('kin-other')
    })
  })

  // ─── run_custom_tool ────────────────────────────────────────────────────

  describe('runCustomToolTool', () => {
    it('has correct availability', () => {
      expect(runCustomToolTool.availability).toEqual(['main'])
    })

    it('executes a custom tool with args', async () => {
      const result = await execute(runCustomToolTool, {
        tool_name: 'my_tool',
        args: { url: 'https://example.com', depth: 2 },
      })

      expect(result.success).toBe(true)
      expect(result.output).toBe('hello world')
      expect(result.exitCode).toBe(0)

      expect(mockExecuteCustomTool).toHaveBeenCalledTimes(1)
      expect(mockExecuteCustomTool).toHaveBeenCalledWith(
        'kin-test',
        'my_tool',
        { url: 'https://example.com', depth: 2 },
      )
    })

    it('defaults args to empty object when not provided', async () => {
      await execute(runCustomToolTool, { tool_name: 'my_tool' })

      expect(mockExecuteCustomTool).toHaveBeenCalledWith('kin-test', 'my_tool', {})
    })

    it('returns failed execution result', async () => {
      mockExecuteCustomTool.mockResolvedValue({
        success: false,
        output: '',
        error: 'Script not found',
        exitCode: 127,
        executionTime: 5,
      })

      const result = await execute(runCustomToolTool, { tool_name: 'missing_tool' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Script not found')
      expect(result.exitCode).toBe(127)
    })

    it('passes explicit args through without modification', async () => {
      const complexArgs = {
        nested: { key: 'value' },
        list: [1, 2, 3],
        flag: true,
      }

      await execute(runCustomToolTool, { tool_name: 'my_tool', args: complexArgs })

      expect(mockExecuteCustomTool.mock.calls[0][2]).toEqual(complexArgs)
    })
  })

  // ─── list_custom_tools ──────────────────────────────────────────────────

  describe('listCustomToolsTool', () => {
    it('has correct availability', () => {
      expect(listCustomToolsTool.availability).toEqual(['main'])
    })

    it('returns all custom tools for the Kin', async () => {
      const result = await execute(listCustomToolsTool, {})

      expect(result.tools).toHaveLength(2)
      expect(result.tools[0].id).toBe('ct-1')
      expect(result.tools[0].name).toBe('my_tool')
      expect(result.tools[0].description).toBe('A test tool')
      expect(result.tools[0].scriptPath).toBe('tools/my_script.sh')
      expect(result.tools[0].createdAt).toBeDefined()

      expect(result.tools[1].id).toBe('ct-2')
      expect(result.tools[1].name).toBe('another_tool')

      expect(mockListCustomTools).toHaveBeenCalledWith('kin-test')
    })

    it('returns empty array when no tools exist', async () => {
      mockListCustomTools.mockResolvedValue([])

      const result = await execute(listCustomToolsTool, {})

      expect(result.tools).toHaveLength(0)
    })

    it('uses kinId from context', async () => {
      const customCtx: ToolExecutionContext = { kinId: 'kin-xyz', isSubKin: false }
      const t = listCustomToolsTool.create(customCtx)
      await t.execute({}, { toolCallId: 'tc-3', messages: [], abortSignal: new AbortController().signal })

      expect(mockListCustomTools).toHaveBeenCalledWith('kin-xyz')
    })
  })
})
