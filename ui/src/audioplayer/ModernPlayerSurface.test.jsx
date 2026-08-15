import React from 'react'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReactJkMusicPlayer from 'navidrome-music-player/es/index.js'

vi.mock('sortablejs', () => ({
  default: class Sortable {
    static mount() {}
    destroy() {}
  },
  Swap: class Swap {},
}))

const track = {
  uuid: 'queue-1',
  trackId: 'song-1',
  name: 'Playable song',
  singer: 'Test artist',
  duration: 180,
  musicSrc: 'data:audio/mp3;base64,',
  cover: '',
  lyric: '[00:00.00]A lyric line',
}

describe('modern player surface', () => {
  afterEach(cleanup)
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('keeps every essential playback control available', async () => {
    render(
      <ReactJkMusicPlayer
        audioLists={[track]}
        autoPlay={false}
        mode="full"
        playIndex={0}
        showDestroy
        showDownload={false}
        showLyric
        showPlayMode
        toggleMode={false}
      />,
    )

    await waitFor(() =>
      expect(document.querySelector('.music-player-panel')).toBeTruthy(),
    )

    expect(document.querySelector('.prev-audio')).toBeTruthy()
    expect(document.querySelector('.play-btn')).toBeTruthy()
    expect(document.querySelector('.next-audio')).toBeTruthy()
    expect(document.querySelector('.play-sounds')).toBeTruthy()
    expect(document.querySelector('.loop-btn')).toBeTruthy()
    expect(document.querySelector('.lyric-btn')).toBeTruthy()
    expect(document.querySelector('.audio-lists-btn')).toBeTruthy()
    expect(document.querySelector('.destroy-btn')).toBeTruthy()
  })

  it('opens lyrics from the player lyrics control', async () => {
    render(
      <ReactJkMusicPlayer
        audioLists={[track]}
        autoPlay={false}
        mode="full"
        playIndex={0}
        showLyric
        toggleMode={false}
      />,
    )

    const lyricButton = await waitFor(() => {
      const button = document.querySelector('.lyric-btn')
      expect(button).toBeTruthy()
      return button
    })
    fireEvent.click(lyricButton)

    await waitFor(() =>
      expect(document.querySelector('.music-player-lyric')).toBeTruthy(),
    )
  })
})
