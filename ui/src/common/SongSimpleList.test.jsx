import React from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SongSimpleList } from './SongSimpleList'

const mockDispatch = vi.fn()
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}))

vi.mock('./Artwork', () => ({
  Artwork: ({ record, className }) => (
    <img data-testid="song-artwork" className={className} alt={record?.title} />
  ),
}))

vi.mock('./SongContextMenu', () => ({
  SongContextMenu: () => <button data-testid="song-menu">Menu</button>,
}))

vi.mock('./DurationField', () => ({
  DurationField: () => <span data-testid="duration-field">3:45</span>,
}))

describe('<SongSimpleList />', () => {
  const sampleData = {
    'song-1': {
      id: 'song-1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      duration: 354,
      rating: 5,
    },
    'song-2': {
      id: 'song-2',
      title: 'Under Pressure',
      artist: 'Queen & David Bowie',
      duration: 248,
      rating: 4,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  it('renders artworks for each song in the list', () => {
    render(
      <SongSimpleList
        data={sampleData}
        ids={['song-1', 'song-2']}
        total={2}
        hasBulkActions={false}
        selectedIds={[]}
      />,
    )

    const artworks = screen.getAllByTestId('song-artwork')
    expect(artworks).toHaveLength(2)
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument()
    expect(screen.getByText('Under Pressure')).toBeInTheDocument()
    expect(screen.getByText('Queen')).toBeInTheDocument()
    expect(screen.getByText('Queen & David Bowie')).toBeInTheDocument()
  })

  it('does not render star rating field', () => {
    render(
      <SongSimpleList
        data={sampleData}
        ids={['song-1']}
        total={1}
        hasBulkActions={false}
        selectedIds={[]}
      />,
    )

    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/star/i)).not.toBeInTheDocument()
  })

  it('dispatches setTrack when a song row is clicked', () => {
    render(
      <SongSimpleList
        data={sampleData}
        ids={['song-1']}
        total={1}
        hasBulkActions={false}
        selectedIds={[]}
      />,
    )

    fireEvent.click(screen.getByText('Bohemian Rhapsody'))
    expect(mockDispatch).toHaveBeenCalledOnce()
  })

  it('renders context menu button for each song without love button', () => {
    render(
      <SongSimpleList
        data={sampleData}
        ids={['song-1', 'song-2']}
        total={2}
        hasBulkActions={false}
        selectedIds={[]}
      />,
    )

    const menus = screen.getAllByTestId('song-menu')
    expect(menus).toHaveLength(2)
  })
})
