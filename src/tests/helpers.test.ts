import { describe, it, expect, vi } from 'vitest'
import { getImage, formatDate } from '../routes/helpers'

vi.mock('$lib/supabase-client', () => {
  const from = vi.fn(() => ({
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.example.com/public/img.png' } })),
  }))
  return {
    supabase: {
      storage: { from },
    },
  }
})

describe('helpers', () => {
  // Ensures getImage reads a file key and returns the expected public URL
  // from the mocked Supabase Storage client.
  it('getImage returns public URL from Supabase', () => {
    const url = getImage({ filekey: 'bucket/path/to/file.jpg' })
    expect(url).toBe('https://cdn.example.com/public/img.png')
  })

  // Confirms formatDate works for both millisecond timestamps and Date
  // instances, producing non-empty localized strings for each.
  it('formatDate handles number and Date inputs', () => {
    const now = Date.now()
    const s1 = formatDate(now)
    const s2 = formatDate(new Date(now))
    expect(typeof s1).toBe('string')
    expect(typeof s2).toBe('string')
    expect(s1.length).toBeGreaterThan(0)
    expect(s2.length).toBeGreaterThan(0)
  })
})
