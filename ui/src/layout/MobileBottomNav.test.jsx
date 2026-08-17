import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MobileBottomNav from './MobileBottomNav'

vi.mock('react-admin', () => ({
  useTranslate: () => (key, options) => options?._ || key,
}))

describe('<MobileBottomNav />', () => {
  it('renders navigation links for songs, categories, recently, and most', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileBottomNav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Songs' })).toHaveAttribute(
      'href',
      '/song',
    )
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      '/categories',
    )
    expect(screen.getByRole('link', { name: 'Recently' })).toHaveAttribute(
      'href',
      '/song/recentlyPlayed',
    )
    expect(screen.getByRole('link', { name: 'Most' })).toHaveAttribute(
      'href',
      '/song/mostPlayed',
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

    const inactiveLink = screen.getByRole('link', { name: 'Most' })
    expect(inactiveLink).not.toHaveAttribute('aria-current')
    expect(inactiveLink.className).not.toContain('navItemActive')
  })
})
