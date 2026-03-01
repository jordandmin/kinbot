import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ── Types ─────────────────────────────────────────────────────────────

interface RepoData {
  stars: number
  forks: number
  openIssues: number
  pushedAt: string
}

interface ReleaseData {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body: string
}

interface ContributorData {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
  type: string
}

interface GitHubData {
  repo: RepoData | null
  latestVersion: string | null
  releases: ReleaseData[]
  contributors: ContributorData[]
  totalCommits: number | null
  loading: boolean
}

// ── Context ───────────────────────────────────────────────────────────

const GitHubDataContext = createContext<GitHubData>({
  repo: null,
  latestVersion: null,
  releases: [],
  contributors: [],
  totalCommits: null,
  loading: true,
})

export function useGitHubData() {
  return useContext(GitHubDataContext)
}

// ── In-memory cache (survives re-renders, cleared on page reload) ────

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

async function cachedFetch<T>(url: string, transform?: (raw: unknown) => T): Promise<T | null> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const raw = await res.json()
    const data = transform ? transform(raw) : (raw as T)
    cache.set(url, { data, timestamp: Date.now() })
    return data
  } catch {
    return null
  }
}

// ── Provider ──────────────────────────────────────────────────────────

const REPO_URL = 'https://api.github.com/repos/MarlBurroW/kinbot'

export function GitHubDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GitHubData>({
    repo: null,
    latestVersion: null,
    releases: [],
    contributors: [],
    totalCommits: null,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      // All fetches in parallel, but each URL is only fetched once thanks to cache
      const [repo, releases, contributors, commitCount] = await Promise.all([
        // 1. Repo info (stars, forks, issues, pushed_at)
        cachedFetch<RepoData>(REPO_URL, (raw: any) => ({
          stars: raw.stargazers_count ?? 0,
          forks: raw.forks_count ?? 0,
          openIssues: raw.open_issues_count ?? 0,
          pushedAt: raw.pushed_at ?? '',
        })),

        // 2. Releases (includes latest)
        cachedFetch<ReleaseData[]>(`${REPO_URL}/releases?per_page=20`, (raw: any) =>
          Array.isArray(raw) ? raw : []
        ),

        // 3. Contributors
        cachedFetch<ContributorData[]>(`${REPO_URL}/contributors?per_page=20`, (raw: any) =>
          Array.isArray(raw) ? raw.filter((c: any) => c.type === 'User') : []
        ),

        // 4. Total commit count (from Link header pagination)
        (async (): Promise<number | null> => {
          const cached = cache.get(`${REPO_URL}/commits-count`)
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data as number
          }
          try {
            const res = await fetch(`${REPO_URL}/commits?per_page=1`)
            const link = res.headers.get('Link')
            if (link) {
              const match = link.match(/page=(\d+)>;\s*rel="last"/)
              if (match) {
                const count = parseInt(match[1], 10)
                cache.set(`${REPO_URL}/commits-count`, { data: count, timestamp: Date.now() })
                return count
              }
            }
            return null
          } catch {
            return null
          }
        })(),
      ])

      if (cancelled) return

      const latestVersion = releases && releases.length > 0 ? releases[0].tag_name : null

      setData({
        repo,
        latestVersion,
        releases: releases ?? [],
        contributors: contributors ?? [],
        totalCommits: commitCount,
        loading: false,
      })
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <GitHubDataContext.Provider value={data}>
      {children}
    </GitHubDataContext.Provider>
  )
}
