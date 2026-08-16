import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LONG_PRESS_DELAY, ModernTrackRows } from './ModernSongList'

vi.mock('../common/Artwork', () => ({
  Artwork: ({ title }) => <div aria-label={`${title} cover`} />,
}))

vi.mock('../common', () => ({
  DurationField: ({ record }) => <span>{record.duration}</span>,
  SongContextMenu: () => <button aria-label="Song actions" />,
}))

const song = {
  id: 'song-1',
  title: 'Playable song',
  artist: 'Test artist',
  album: 'Test album',
  duration: 180,
  tags: { mood: ['Calm'] },
}

const renderRows = (props = {}) => {
  const onPlay = vi.fn()
  render(
    <ThemeProvider theme={createTheme()}>
      <ModernTrackRows songs={[song]} onPlay={onPlay} {...props} />
    </ThemeProvider>,
  )
  return onPlay
}

const pointerEvent = (type, options) =>
  new MouseEvent(type, { bubbles: true, ...options })

afterEach(() => vi.useRealTimers())

describe('<ModernTrackRows />', () => {
  it('hides selection boxes until selection mode starts', () => {
    renderRows()
    expect(
      screen.queryByRole('checkbox', { name: 'Select Playable song' }),
    ).not.toBeInTheDocument()
  })

  it('selects a song with the mouse', () => {
    const onPlay = renderRows()
    fireEvent.click(screen.getByRole('button', { name: 'Play Playable song' }))
    expect(onPlay).toHaveBeenCalledWith(song)
  })

  it.each(['Enter', ' '])('selects a song with the %s key', (key) => {
    const onPlay = renderRows()
    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Play Playable song' }),
      { key },
    )
    expect(onPlay).toHaveBeenCalledWith(song)
  })

  it('does not play a song when its actions menu is opened', () => {
    const onPlay = renderRows()
    fireEvent.click(screen.getByRole('button', { name: 'Song actions' }))
    expect(onPlay).not.toHaveBeenCalled()
  })

  it('selects a song without starting playback', () => {
    const onPlay = vi.fn()
    const onToggleSelection = vi.fn()
    render(
      <ThemeProvider theme={createTheme()}>
        <ModernTrackRows
          songs={[song]}
          onPlay={onPlay}
          onToggleSelection={onToggleSelection}
          selectionMode
        />
      </ThemeProvider>,
    )

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Playable song' }),
    )

    expect(onToggleSelection).toHaveBeenCalledWith(song.id)
    expect(onPlay).not.toHaveBeenCalled()
  })

  it('starts multi-selection by holding a song', () => {
    vi.useFakeTimers()
    const onPlay = vi.fn()
    const onStartSelection = vi.fn()
    render(
      <ThemeProvider theme={createTheme()}>
        <ModernTrackRows
          songs={[song]}
          onPlay={onPlay}
          onStartSelection={onStartSelection}
        />
      </ThemeProvider>,
    )

    const row = screen.getByRole('button', { name: 'Play Playable song' })
    fireEvent(row, pointerEvent('pointerdown', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_DELAY)
    })

    expect(onStartSelection).toHaveBeenCalledWith(song.id)
    expect(onPlay).not.toHaveBeenCalled()
  })

  it('cancels a hold when the pointer moves to scroll', () => {
    vi.useFakeTimers()
    const onStartSelection = vi.fn()
    renderRows({ onStartSelection })

    const row = screen.getByRole('button', { name: 'Play Playable song' })
    fireEvent(row, pointerEvent('pointerdown', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))
    fireEvent(
      row,
      pointerEvent('pointermove', { clientX: 30, clientY: 10 }),
    )
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_DELAY)
    })

    expect(onStartSelection).not.toHaveBeenCalled()
  })

  it('toggles songs instead of playing them during selection mode', () => {
    const onPlay = vi.fn()
    const onToggleSelection = vi.fn()
    renderRows({ onPlay, onToggleSelection, selectionMode: true })

    fireEvent.click(
      screen.getByRole('button', { name: 'Select Playable song' }),
    )

    expect(onToggleSelection).toHaveBeenCalledWith(song.id)
    expect(onPlay).not.toHaveBeenCalled()
  })

  it('marks the current song', () => {
    renderRows({ currentSongId: song.id })
    expect(
      screen.getByRole('button', { name: 'Play Playable song' }),
    ).toHaveAttribute('aria-current', 'true')
  })
})
