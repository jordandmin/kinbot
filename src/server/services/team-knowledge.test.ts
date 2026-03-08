import { describe, it, expect } from 'bun:test'
import { chunkText } from '@/server/services/knowledge'

describe('team-knowledge', () => {
  describe('chunkText (reused from knowledge)', () => {
    it('chunks empty text to empty array', () => {
      expect(chunkText('')).toEqual([])
    })

    it('produces single chunk for short text', () => {
      const result = chunkText('Hello world')
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('Hello world')
    })

    it('splits long text into multiple chunks', () => {
      const paragraphs = Array.from({ length: 20 }, (_, i) =>
        `Paragraph ${i + 1}. ` + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
      ).join('\n\n')
      const result = chunkText(paragraphs, 512, 50)
      expect(result.length).toBeGreaterThan(1)
    })
  })

  describe('FTS query building', () => {
    it('strips special characters from search terms', () => {
      const query = 'hello "world" [test]'
      const terms = query
        .replace(/['"*(){}[\]:^~!@#$%&]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3)
      expect(terms).toEqual(['hello', 'world', 'test'])
    })

    it('filters terms shorter than 3 characters', () => {
      const query = 'a bb ccc dddd'
      const terms = query
        .replace(/['"*(){}[\]:^~!@#$%&]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3)
      expect(terms).toEqual(['ccc', 'dddd'])
    })
  })

  describe('token estimation', () => {
    it('estimates tokens for a sentence', () => {
      const text = 'Hello world this is a test sentence'
      const estimated = Math.ceil(text.split(/\s+/).length / 0.75)
      expect(estimated).toBe(10) // 7 words / 0.75 = 9.33 -> 10
    })
  })

  describe('search result scoring', () => {
    it('RRF scoring produces decreasing scores for later ranks', () => {
      const K = 60
      const scores = Array.from({ length: 5 }, (_, i) => 1 / (K + i + 1))
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]!).toBeGreaterThan(scores[i + 1]!)
      }
    })
  })
})
