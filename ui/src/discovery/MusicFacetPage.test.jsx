import { describe, expect, it } from 'vitest'
import { buildFacetSongUrl } from './facetLinks'

describe('buildFacetSongUrl', () => {
  it('builds a genre filter URL', () => {
    const url = buildFacetSongUrl('genre_id', 'genre-1')
    expect(url).toBe(
      `/song?filter=${encodeURIComponent(
        JSON.stringify({ genre_id: ['genre-1'] }),
      )}`,
    )
  })

  it('builds a mood filter URL', () => {
    const url = buildFacetSongUrl('mood', 'mood-1')
    expect(url).toBe(
      `/song?filter=${encodeURIComponent(
        JSON.stringify({ mood: ['mood-1'] }),
      )}`,
    )
  })
})
