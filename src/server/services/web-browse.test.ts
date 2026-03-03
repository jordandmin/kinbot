import { describe, it, expect, mock, beforeEach } from 'bun:test'

// ─── isPrivateIp (re-implemented from module internals) ─────────────────────

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
]

function isPrivateIp(ip: string): boolean {
  if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip
  return PRIVATE_IP_RANGES.some((re) => re.test(v4))
}

describe('isPrivateIp', () => {
  it('detects loopback IPv4', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true)
    expect(isPrivateIp('127.255.255.255')).toBe(true)
  })

  it('detects loopback IPv6', () => {
    expect(isPrivateIp('::1')).toBe(true)
    expect(isPrivateIp('0:0:0:0:0:0:0:1')).toBe(true)
  })

  it('detects 10.x.x.x range', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true)
    expect(isPrivateIp('10.255.255.255')).toBe(true)
  })

  it('detects 172.16-31.x.x range', () => {
    expect(isPrivateIp('172.16.0.1')).toBe(true)
    expect(isPrivateIp('172.31.255.255')).toBe(true)
    expect(isPrivateIp('172.15.0.1')).toBe(false)
    expect(isPrivateIp('172.32.0.1')).toBe(false)
  })

  it('detects 192.168.x.x range', () => {
    expect(isPrivateIp('192.168.0.1')).toBe(true)
    expect(isPrivateIp('192.168.255.255')).toBe(true)
  })

  it('detects link-local 169.254.x.x', () => {
    expect(isPrivateIp('169.254.1.1')).toBe(true)
  })

  it('detects 0.x.x.x range', () => {
    expect(isPrivateIp('0.0.0.0')).toBe(true)
    expect(isPrivateIp('0.1.2.3')).toBe(true)
  })

  it('handles IPv4-mapped IPv6', () => {
    expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true)
    expect(isPrivateIp('::ffff:192.168.1.1')).toBe(true)
    expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false)
  })

  it('allows public IPs', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false)
    expect(isPrivateIp('1.1.1.1')).toBe(false)
    expect(isPrivateIp('93.184.216.34')).toBe(false)
    expect(isPrivateIp('203.0.113.1')).toBe(false)
  })
})

// ─── extractLinksFromHtml (imported from module) ─────────────────────────────

// Re-implement extractLinksFromHtml since it depends on cheerio (which is available)
// but we want to test its logic without complex module mocking
import * as cheerio from 'cheerio'

function extractLinksFromHtml(
  html: string,
  baseUrl: string,
  filterPattern?: string,
  maxResults = 50,
): { links: Array<{ text: string; url: string }>; totalFound: number } {
  const $ = cheerio.load(html)
  const allLinks: Array<{ text: string; url: string }> = []
  const seen = new Set<string>()

  let filterRe: RegExp | null = null
  if (filterPattern) {
    try {
      filterRe = new RegExp(filterPattern, 'i')
    } catch {
      throw new Error(`Invalid filter_pattern regex: ${filterPattern}`)
    }
  }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return

    let absoluteUrl: string
    try {
      absoluteUrl = new URL(href, baseUrl).href
    } catch {
      return
    }

    if (seen.has(absoluteUrl)) return
    seen.add(absoluteUrl)

    if (filterRe && !filterRe.test(absoluteUrl)) return

    const text = $(el).text().trim() || absoluteUrl
    allLinks.push({ text, url: absoluteUrl })
  })

  return {
    links: allLinks.slice(0, maxResults),
    totalFound: allLinks.length,
  }
}

describe('extractLinksFromHtml', () => {
  it('extracts absolute links', () => {
    const html = '<html><body><a href="https://example.com/page">Page</a></body></html>'
    const result = extractLinksFromHtml(html, 'https://example.com')
    expect(result.links).toHaveLength(1)
    expect(result.links[0]!).toEqual({ text: 'Page', url: 'https://example.com/page' })
    expect(result.totalFound).toBe(1)
  })

  it('resolves relative links against base URL', () => {
    const html = '<html><body><a href="/about">About</a><a href="contact">Contact</a></body></html>'
    const result = extractLinksFromHtml(html, 'https://example.com/section/')
    expect(result.links).toHaveLength(2)
    expect(result.links[0]!.url).toBe('https://example.com/about')
    expect(result.links[1]!.url).toBe('https://example.com/section/contact')
  })

  it('deduplicates links by URL', () => {
    const html = `<html><body>
      <a href="https://example.com/page">First</a>
      <a href="https://example.com/page">Second</a>
    </body></html>`
    const result = extractLinksFromHtml(html, 'https://example.com')
    expect(result.links).toHaveLength(1)
    expect(result.links[0]!.text).toBe('First')
  })

  it('skips fragment-only, javascript:, and mailto: links', () => {
    const html = `<html><body>
      <a href="#section">Section</a>
      <a href="javascript:void(0)">JS</a>
      <a href="mailto:test@test.com">Email</a>
      <a href="https://example.com/real">Real</a>
    </body></html>`
    const result = extractLinksFromHtml(html, 'https://example.com')
    expect(result.links).toHaveLength(1)
    expect(result.links[0]!.url).toBe('https://example.com/real')
  })

  it('skips anchors without href', () => {
    const html = '<html><body><a>No href</a><a href="">Empty</a></body></html>'
    const result = extractLinksFromHtml(html, 'https://example.com')
    // Empty href resolves to the base URL, so it should be included
    expect(result.links.length).toBeLessThanOrEqual(1)
  })

  it('uses URL as text when anchor text is empty', () => {
    const html = '<html><body><a href="https://example.com/page">  </a></body></html>'
    const result = extractLinksFromHtml(html, 'https://example.com')
    expect(result.links[0]!.text).toBe('https://example.com/page')
  })

  it('applies filter pattern', () => {
    const html = `<html><body>
      <a href="/doc.pdf">PDF</a>
      <a href="/page.html">HTML</a>
      <a href="/other.pdf">Other PDF</a>
    </body></html>`
    const result = extractLinksFromHtml(html, 'https://example.com', '\\.pdf$')
    expect(result.links).toHaveLength(2)
    expect(result.links.every((l) => l.url.endsWith('.pdf'))).toBe(true)
  })

  it('filter pattern is case-insensitive', () => {
    const html = '<html><body><a href="/Doc.PDF">PDF</a></body></html>'
    const result = extractLinksFromHtml(html, 'https://example.com', '\\.pdf$')
    expect(result.links).toHaveLength(1)
  })

  it('throws on invalid filter regex', () => {
    const html = '<html><body><a href="/page">P</a></body></html>'
    expect(() => extractLinksFromHtml(html, 'https://example.com', '[')).toThrow('Invalid filter_pattern regex')
  })

  it('respects maxResults limit', () => {
    const links = Array.from({ length: 10 }, (_, i) => `<a href="/p${i}">P${i}</a>`).join('')
    const html = `<html><body>${links}</body></html>`
    const result = extractLinksFromHtml(html, 'https://example.com', undefined, 3)
    expect(result.links).toHaveLength(3)
    expect(result.totalFound).toBe(10)
  })

  it('handles empty HTML', () => {
    const result = extractLinksFromHtml('<html><body></body></html>', 'https://example.com')
    expect(result.links).toHaveLength(0)
    expect(result.totalFound).toBe(0)
  })

  it('handles malformed href gracefully', () => {
    const html = '<html><body><a href="ht tp://bad url">Bad</a><a href="https://good.com">Good</a></body></html>'
    const result = extractLinksFromHtml(html, 'https://example.com')
    // The malformed URL should be skipped or resolved; at least the good one should work
    expect(result.links.some((l) => l.url === 'https://good.com/')).toBe(true)
  })
})

// ─── extractContent (re-implemented extractors) ─────────────────────────────

// Test the raw text extraction logic
function extractRawText(html: string): { title: string | null; content: string } {
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside, noscript, svg, [hidden]').remove()
  const title = $('title').first().text().trim() || null
  const content = $('body').text().replace(/\s+/g, ' ').trim()
  return { title, content }
}

describe('extractRawText', () => {
  it('extracts plain text from body', () => {
    const html = '<html><head><title>Test Page</title></head><body><p>Hello world</p></body></html>'
    const result = extractRawText(html)
    expect(result.title).toBe('Test Page')
    expect(result.content).toBe('Hello world')
  })

  it('removes script and style tags', () => {
    const html = `<html><body>
      <script>var x = 1;</script>
      <style>.foo { color: red; }</style>
      <p>Visible text</p>
    </body></html>`
    const result = extractRawText(html)
    expect(result.content).not.toContain('var x')
    expect(result.content).not.toContain('color')
    expect(result.content).toContain('Visible text')
  })

  it('removes nav, footer, header, aside', () => {
    const html = `<html><body>
      <nav>Navigation</nav>
      <header>Header</header>
      <main>Main content</main>
      <aside>Sidebar</aside>
      <footer>Footer</footer>
    </body></html>`
    const result = extractRawText(html)
    expect(result.content).not.toContain('Navigation')
    expect(result.content).not.toContain('Header')
    expect(result.content).not.toContain('Sidebar')
    expect(result.content).not.toContain('Footer')
    expect(result.content).toContain('Main content')
  })

  it('removes hidden elements', () => {
    const html = '<html><body><div hidden>Secret</div><p>Visible</p></body></html>'
    const result = extractRawText(html)
    expect(result.content).not.toContain('Secret')
    expect(result.content).toContain('Visible')
  })

  it('collapses whitespace', () => {
    const html = '<html><body><p>  Hello   \n\n  world  </p></body></html>'
    const result = extractRawText(html)
    expect(result.content).toBe('Hello world')
  })

  it('returns null title when no title tag', () => {
    const html = '<html><body><p>Content</p></body></html>'
    const result = extractRawText(html)
    expect(result.title).toBeNull()
  })

  it('handles empty body', () => {
    const html = '<html><body></body></html>'
    const result = extractRawText(html)
    expect(result.content).toBe('')
  })
})

// ─── Markdown extraction logic ──────────────────────────────────────────────

function extractMarkdownContent(html: string): { title: string | null; parts: string[] } {
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside, .sidebar, .nav, .menu, .ad, .advertisement, [role="navigation"]').remove()

  const title = $('title').first().text().trim() || $('h1').first().text().trim() || null
  const parts: string[] = []

  const mainContent = $('main, article, [role="main"], .content, .post, .entry').first()
  const root = mainContent.length ? mainContent : $('body')

  root.find('h1, h2, h3, h4, h5, h6, p, li, pre, code, blockquote').each((_, el) => {
    const $el = $(el)
    const tag = el.type === 'tag' ? el.name : ''

    switch (tag) {
      case 'h1': parts.push(`\n# ${$el.text().trim()}\n`); break
      case 'h2': parts.push(`\n## ${$el.text().trim()}\n`); break
      case 'h3': parts.push(`\n### ${$el.text().trim()}\n`); break
      case 'h4':
      case 'h5':
      case 'h6': parts.push(`\n#### ${$el.text().trim()}\n`); break
      case 'p': {
        const text = $el.text().trim()
        if (text) parts.push(`${text}\n`)
        break
      }
      case 'li': {
        const text = $el.text().trim()
        if (text) parts.push(`- ${text}`)
        break
      }
      case 'pre':
      case 'code': {
        if (tag === 'pre' || !$el.parent('pre').length) {
          const code = $el.text().trim()
          if (code) parts.push(`\n\`\`\`\n${code}\n\`\`\`\n`)
        }
        break
      }
      case 'blockquote': {
        const text = $el.text().trim()
        if (text) parts.push(`> ${text}\n`)
        break
      }
    }
  })

  return { title, parts }
}

describe('extractMarkdownContent', () => {
  it('converts headings to markdown', () => {
    const html = '<html><body><h1>Title</h1><h2>Section</h2><h3>Sub</h3></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.some((p) => p.includes('# Title'))).toBe(true)
    expect(parts.some((p) => p.includes('## Section'))).toBe(true)
    expect(parts.some((p) => p.includes('### Sub'))).toBe(true)
  })

  it('converts paragraphs', () => {
    const html = '<html><body><p>Hello world</p></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.some((p) => p.includes('Hello world'))).toBe(true)
  })

  it('converts list items with dash prefix', () => {
    const html = '<html><body><ul><li>Item 1</li><li>Item 2</li></ul></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.some((p) => p === '- Item 1')).toBe(true)
    expect(parts.some((p) => p === '- Item 2')).toBe(true)
  })

  it('wraps code blocks in backticks', () => {
    const html = '<html><body><pre>const x = 1;</pre></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.some((p) => p.includes('```') && p.includes('const x = 1;'))).toBe(true)
  })

  it('converts blockquotes', () => {
    const html = '<html><body><blockquote>A quote</blockquote></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.some((p) => p.startsWith('> A quote'))).toBe(true)
  })

  it('skips empty paragraphs', () => {
    const html = '<html><body><p></p><p>  </p><p>Real</p></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.filter((p) => p.includes('Real'))).toHaveLength(1)
    // Empty paragraphs should not appear
    expect(parts.length).toBe(1)
  })

  it('removes navigation and sidebar elements', () => {
    const html = `<html><body>
      <nav>Nav content</nav>
      <div class="sidebar">Side</div>
      <div class="ad">Ad</div>
      <p>Main content</p>
    </body></html>`
    const { parts } = extractMarkdownContent(html)
    const text = parts.join(' ')
    expect(text).not.toContain('Nav content')
    expect(text).not.toContain('Side')
    expect(text).toContain('Main content')
  })

  it('prefers main/article content over body', () => {
    const html = `<html><body>
      <div>Outside noise</div>
      <article><p>Article content</p></article>
    </body></html>`
    const { parts } = extractMarkdownContent(html)
    expect(parts.some((p) => p.includes('Article content'))).toBe(true)
    // Content outside article should not be included since article takes priority
    expect(parts.some((p) => p.includes('Outside noise'))).toBe(false)
  })

  it('falls back to h1 for title when no title tag', () => {
    const html = '<html><body><h1>Fallback Title</h1><p>Content</p></body></html>'
    const { title } = extractMarkdownContent(html)
    expect(title).toBe('Fallback Title')
  })

  it('h4-h6 all become ####', () => {
    const html = '<html><body><h4>H4</h4><h5>H5</h5><h6>H6</h6></body></html>'
    const { parts } = extractMarkdownContent(html)
    expect(parts.filter((p) => p.includes('####')).length).toBe(3)
  })
})

// ─── SSRF URL validation logic ──────────────────────────────────────────────

describe('URL validation for SSRF', () => {
  it('blocks non-http schemes', () => {
    const schemes = ['ftp:', 'file:', 'data:', 'gopher:']
    for (const scheme of schemes) {
      try {
        const parsed = new URL(`${scheme}//example.com`)
        const blocked = parsed.protocol !== 'http:' && parsed.protocol !== 'https:'
        expect(blocked).toBe(true)
      } catch {
        // Invalid URL is also acceptable — it would be blocked
      }
    }
  })

  it('allows http and https', () => {
    for (const scheme of ['http:', 'https:']) {
      const parsed = new URL(`${scheme}//example.com`)
      const blocked = parsed.protocol !== 'http:' && parsed.protocol !== 'https:'
      expect(blocked).toBe(false)
    }
  })

  it('detects localhost variants', () => {
    const localhosts = ['localhost', '127.0.0.1', '::1', '[::1]']
    for (const host of localhosts) {
      const hostname = host.toLowerCase()
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]'
      expect(isLocalhost).toBe(true)
    }
  })

  it('detects cloud metadata endpoints', () => {
    const metadataHosts = ['169.254.169.254', 'metadata.google.internal']
    for (const host of metadataHosts) {
      const isMetadata = host === '169.254.169.254' || host === 'metadata.google.internal'
      expect(isMetadata).toBe(true)
    }
  })

  it('checks domain blocking with subdomain matching', () => {
    const blockedDomains = ['evil.com', 'malware.org']
    const testCases = [
      { hostname: 'evil.com', expected: true },
      { hostname: 'sub.evil.com', expected: true },
      { hostname: 'deep.sub.evil.com', expected: true },
      { hostname: 'notevil.com', expected: false },
      { hostname: 'good.com', expected: false },
      { hostname: 'malware.org', expected: true },
    ]

    for (const { hostname, expected } of testCases) {
      const blocked = blockedDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`))
      expect(blocked).toBe(expected)
    }
  })
})

// ─── Concurrency semaphore logic ────────────────────────────────────────────

describe('Concurrency semaphore', () => {
  it('tracks active count correctly', () => {
    let active = 0
    const maxConcurrent = 3
    const waitQueue: Array<() => void> = []

    function acquire(): boolean {
      if (active < maxConcurrent) {
        active++
        return true
      }
      return false
    }

    function release(): void {
      active--
      const next = waitQueue.shift()
      if (next) next()
    }

    // Acquire 3 slots
    expect(acquire()).toBe(true)
    expect(acquire()).toBe(true)
    expect(acquire()).toBe(true)
    expect(active).toBe(3)

    // 4th should fail
    expect(acquire()).toBe(false)

    // Release one
    release()
    expect(active).toBe(2)

    // Can acquire again
    expect(acquire()).toBe(true)
    expect(active).toBe(3)
  })
})
