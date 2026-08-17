import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  buildMediaSessionArtwork,
  updateMediaSessionMetadata,
  clearMediaSessionMetadata,
} from './mediaSession'

describe('mediaSession', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    const localStorageMock = {
      getItem: vi.fn((key) => {
        const values = {
          username: 'testuser',
          'subsonic-token': 'testtoken',
          'subsonic-salt': 'testsalt',
        }
        return values[key] || null
      }),
      setItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    })

    global.MediaMetadata = vi.fn().mockImplementation(function (metadata) {
      this.title = metadata.title
      this.artist = metadata.artist
      this.album = metadata.album
      this.artwork = metadata.artwork
    })
    global.navigator.mediaSession = {
      metadata: null,
    }
  })

  describe('buildMediaSessionArtwork', () => {
    it('generates multi-size absolute artwork URLs from song record', () => {
      const artwork = buildMediaSessionArtwork({
        trackId: 'song-1',
        song: {
          id: 'song-1',
          album: 'Test Album',
        },
      })
      expect(artwork.length).toBe(6)
      expect(artwork[0].sizes).toBe('96x96')
      expect(artwork[5].sizes).toBe('512x512')
      expect(artwork[0].src).toContain('http')
      expect(artwork[0].src).toContain('getCoverArt')
    })

    it('falls back to info.cover when song record is not present', () => {
      const artwork = buildMediaSessionArtwork({
        cover: '/rest/getCoverArt.view?id=pl-1',
      })
      expect(artwork.length).toBe(6)
      expect(artwork[0].src).toContain('/rest/getCoverArt.view?id=pl-1')
      expect(artwork[0].src.startsWith('http')).toBe(true)
    })

    it('returns empty array when no artwork info is available', () => {
      const artwork = buildMediaSessionArtwork({})
      expect(artwork).toEqual([])
    })
  })

  describe('updateMediaSessionMetadata', () => {
    it('sets MediaMetadata with song title, artist, album and artwork', () => {
      updateMediaSessionMetadata({
        trackId: 'song-1',
        song: {
          id: 'song-1',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          album: 'A Night at the Opera',
        },
      })

      expect(global.navigator.mediaSession.metadata).not.toBeNull()
      expect(global.navigator.mediaSession.metadata.title).toBe(
        'Bohemian Rhapsody',
      )
      expect(global.navigator.mediaSession.metadata.artist).toBe('Queen')
      expect(global.navigator.mediaSession.metadata.album).toBe(
        'A Night at the Opera',
      )
      expect(
        global.navigator.mediaSession.metadata.artwork.length,
      ).toBeGreaterThan(0)
    })

    it('clears metadata when info is empty', () => {
      global.navigator.mediaSession.metadata = { title: 'Previous' }
      updateMediaSessionMetadata(null)
      expect(global.navigator.mediaSession.metadata).toBeNull()
    })
  })

  describe('clearMediaSessionMetadata', () => {
    it('resets mediaSession metadata to null', () => {
      global.navigator.mediaSession.metadata = { title: 'Playing' }
      clearMediaSessionMetadata()
      expect(global.navigator.mediaSession.metadata).toBeNull()
    })
  })
})
