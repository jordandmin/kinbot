const BASE_URL = '/api'

// ─── Custom error class ───────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

// ─── Universal error message extractor ──────────────────────────────────────

/**
 * Extract a displayable string from any caught value.
 * Always use this in catch blocks instead of `String(err)`.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (
    err !== null &&
    typeof err === 'object' &&
    'error' in err &&
    typeof (err as { error: unknown }).error === 'object'
  ) {
    const inner = (err as { error: { message?: unknown } }).error
    if (typeof inner.message === 'string' && inner.message) return inner.message
  }
  return 'An unexpected error occurred'
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let code = 'REQUEST_FAILED'
    let message = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } }
      if (body?.error?.message) message = body.error.message
      if (body?.error?.code) code = body.error.code
    } catch {
      // Non-JSON body (HTML 502, 504, Nginx error pages) — keep defaults
    }
    throw new ApiRequestError(message, code, response.status)
  }

  // Guard against empty bodies (204 No Content, DELETE with no body, etc.)
  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json') || response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
