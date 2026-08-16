import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MobilePlayerBar from './MobilePlayerBar'

describe('MobilePlayerBar', () => {
  afterEach(cleanup)

  it('opens the full-screen player from the track area', () => {
    const onOpen = vi.fn()

    render(
      <MobilePlayerBar
        title="Test song"
        artist="Test artist"
        cover="cover.jpg"
        onOpen={onOpen}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open full-screen player for Test song',
      }),
    )

    expect(onOpen).toHaveBeenCalledOnce()
    expect(screen.getByText('Test artist')).toBeInTheDocument()
  })

  it('controls playback without opening the full-screen player', () => {
    const onOpen = vi.fn()
    const audio = document.createElement('audio')
    const play = vi.fn(() => Promise.resolve())
    Object.defineProperty(audio, 'paused', { configurable: true, value: true })
    Object.defineProperty(audio, 'play', { configurable: true, value: play })

    render(<MobilePlayerBar audio={audio} title="Test song" onOpen={onOpen} />)

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))

    expect(play).toHaveBeenCalledOnce()
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('renders title and artist cleanly without album name', () => {
    render(
      <MobilePlayerBar
        title="My Cool Song"
        artist="Awesome Artist"
        cover="cover.jpg"
        onOpen={() => {}}
      />,
    )

    expect(screen.getByText('My Cool Song')).toBeInTheDocument()
    expect(screen.getByText('Awesome Artist')).toBeInTheDocument()
  })

  it('opens the full-screen player when swiping up on the bar', () => {
    const onOpen = vi.fn()

    render(
      <MobilePlayerBar
        title="Swipe Song"
        artist="Swipe Artist"
        onOpen={onOpen}
      />,
    )

    const button = screen.getByRole('button', {
      name: 'Open full-screen player for Swipe Song',
    })

    fireEvent.touchStart(button, {
      touches: [{ clientX: 100, clientY: 300 }],
    })
    fireEvent.touchEnd(button, {
      changedTouches: [{ clientX: 100, clientY: 240 }],
    })

    expect(onOpen).toHaveBeenCalledOnce()
  })
})
