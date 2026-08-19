import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MobileBottomNav from './MobileBottomNav'

vi.mock('react-admin', () => ({
  useTranslate: () => (key, options) => options?._ || key,
}))

describe('<MobileBottomNav />', () => {
  it('renders navigation links for songs, artists, genres, and moods', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileBottomNav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Songs' })).toHaveAttribute(
      'href',
      '/song',
    )
    expect(screen.getByRole('link', { name: 'Artists' })).toHaveAttribute(
      'href',
      '/artist',
    )
    expect(screen.getByRole('link', { name: 'Genres' })).toHaveAttribute(
      'href',
      '/genres',
    )
    expect(screen.getByRole('link', { name: 'Moods' })).toHaveAttribute(
      'href',
      '/moods',
    )
  })

  it('highlights the active tab matching the current route', () => {
    render(
      <MemoryRouter initialEntries={['/song']}>
        <MobileBottomNav />
      </MemoryRouter>,
    )

    const activeLink = screen.getByRole('link', { name: 'Songs' })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink.className).toContain('navItemActive')

    const inactiveLink = screen.getByRole('link', { name: 'Artists' })
    expect(inactiveLink).not.toHaveAttribute('aria-current')
    expect(inactiveLink.className).not.toContain('navItemActive')
  })
})
