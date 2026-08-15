import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { describe, expect, it, vi } from 'vitest'
import { ModernTrackRows } from './ModernSongList'

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

describe('<ModernTrackRows />', () => {
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
        />
      </ThemeProvider>,
    )

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Playable song' }),
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
