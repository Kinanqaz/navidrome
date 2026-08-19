import React from 'react'
import { render, screen } from '@testing-library/react'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { buildFacetSongUrl } from './facetLinks'
import { GenrePage, MoodPage } from './MusicFacetPage'

vi.mock('../subsonic', () => ({
  default: {
    getGenres: vi.fn().mockResolvedValue([
      { value: 'Rock', songCount: 42 },
      { value: 'Jazz', songCount: 1 },
    ]),
  },
}))

vi.mock('react-admin', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useGetList: (resource, pagination, sort, filter) => {
      if (resource === 'genre' || filter?.tag_name === 'genre') {
        return {
          ids: ['g-1', 'g-2'],
          data: {
            'g-1': { id: 'g-1', name: 'Rock', songCount: 42 },
            'g-2': { id: 'g-2', name: 'Jazz', songCount: 1 },
          },
          loading: false,
        }
      }
      return {
        ids: ['m-1'],
        data: {
          'm-1': { id: 'm-1', tagValue: 'Chill', songCount: 5 },
        },
        loading: false,
      }
    },
  }
})

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

describe('GenrePage and MoodPage rendering', () => {
  it('renders genres with track count badges on the right side', () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={createTheme()}>
          <GenrePage />
        </ThemeProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Rock')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Jazz')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders moods with track count badges', () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={createTheme()}>
          <MoodPage />
        </ThemeProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Chill')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

