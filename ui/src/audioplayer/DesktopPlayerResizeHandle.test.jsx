import React from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { afterEach, describe, expect, it } from 'vitest'
import DesktopPlayerResizeHandle from './DesktopPlayerResizeHandle'
import { clampDesktopPlayerWidth, desktopPlayerWidthProperty } from './styles'

const renderHandle = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <DesktopPlayerResizeHandle visible />
    </ThemeProvider>,
  )

describe('desktop player resizing', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    localStorage.setItem('username', 'admin')
    document.documentElement.style.removeProperty(desktopPlayerWidthProperty)
  })

  it('keeps enough room for both the player and library', () => {
    expect(clampDesktopPlayerWidth(900, 1200)).toBe(720)
    expect(clampDesktopPlayerWidth(700, 1000)).toBe(640)
    expect(clampDesktopPlayerWidth(200, 1200)).toBe(420)
  })

  it('supports keyboard resizing and persists the result', async () => {
    renderHandle()
    const separator = screen.getByRole('separator', { name: 'Resize player' })
    const initialWidth = Number(separator.getAttribute('aria-valuenow'))

    fireEvent.keyDown(separator, { key: 'ArrowLeft' })

    await waitFor(() =>
      expect(separator).toHaveAttribute(
        'aria-valuenow',
        String(initialWidth + 24),
      ),
    )
    expect(localStorage.getItem('desktopPlayerWidth')).toBe(
      String(initialWidth + 24),
    )
  })

  it('resizes when the divider is dragged', async () => {
    renderHandle()
    const separator = screen.getByRole('separator', { name: 'Resize player' })
    const targetWidth = clampDesktopPlayerWidth(574, window.innerWidth)
    const pointerEvent = (type, clientX) => {
      const event = new Event(type, { bubbles: true })
      Object.defineProperty(event, 'clientX', { value: clientX })
      return event
    }

    fireEvent(separator, pointerEvent('pointerdown', window.innerWidth - 524))
    fireEvent(
      window,
      pointerEvent('pointermove', window.innerWidth - targetWidth),
    )
    fireEvent(window, pointerEvent('pointerup', 0))

    await waitFor(() =>
      expect(separator).toHaveAttribute('aria-valuenow', String(targetWidth)),
    )
    expect(document.body.style.cursor).toBe('')
    expect(document.body.style.userSelect).toBe('')
  })
})
