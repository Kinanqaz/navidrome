import { beforeEach, describe, expect, it } from 'vitest'
import { resolveAlbumListType } from './albumListRouting'

describe('resolveAlbumListType', () => {
  beforeEach(() => localStorage.clear())

  it('uses the saved default view for the initial album resource route', () => {
    localStorage.setItem('defaultView', 'song')

    expect(resolveAlbumListType('')).toBe('song')
  })

  it('keeps an explicit album list selection', () => {
    localStorage.setItem('defaultView', 'song')

    expect(resolveAlbumListType('all')).toBe('all')
  })
})
