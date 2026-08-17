import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { useMediaQuery } from '@material-ui/core'
import { useGetOne } from 'react-admin'
import { useSelector } from 'react-redux'
import { useToggleLove } from '../common'
import PlayerToolbar from './PlayerToolbar'

// Mock dependencies
vi.mock('@material-ui/core', async () => {
  const actual = await import('@material-ui/core')
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  }
})

vi.mock('react-admin', () => ({
  useGetOne: vi.fn(),
}))

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}))

vi.mock('../common', () => ({
  LoveButton: ({ className, disabled }) => (
    <button data-testid="love-button" className={className} disabled={disabled}>
      Love
    </button>
  ),
  SongContextMenu: ({ className, buttonClassName, disabled }) => (
    <div data-testid="player-context-menu" className={className}>
      <button
        data-testid="more-button"
        className={buttonClassName}
        disabled={disabled}
      >
        More
      </button>
    </div>
  ),
  useToggleLove: vi.fn(),
}))

vi.mock('react-hotkeys', () => ({
  GlobalHotKeys: () => <div data-testid="global-hotkeys" />,
}))

describe('<PlayerToolbar />', () => {
  const mockToggleLove = vi.fn()
  const mockSongData = { id: 'song-1', name: 'Test Song', starred: false }

  beforeEach(() => {
    vi.clearAllMocks()
    useSelector.mockReturnValue(null)
    useGetOne.mockReturnValue({ data: mockSongData, loading: false })
    useToggleLove.mockReturnValue([mockToggleLove, false])
  })

  afterEach(cleanup)

  describe('Desktop layout', () => {
    beforeEach(() => {
      useMediaQuery.mockReturnValue(true) // isDesktop = true
    })

    it('renders desktop layout with upper corner context menu and toolbar love button', () => {
      render(<PlayerToolbar id="song-1" />)

      // Context menu should be rendered with corner menu class
      const contextMenu = screen.getByTestId('player-context-menu')
      expect(contextMenu).toBeInTheDocument()
      expect(contextMenu.className).toContain('cornerMenu')

      // Love button should be in the toolbar list item
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(1)
      expect(screen.getByTestId('love-button')).toBeInTheDocument()
      expect(listItems[0].className).toContain('toolbar')

      // Save queue button should not be present
      expect(screen.queryByTestId('save-queue-button')).not.toBeInTheDocument()
    })

    it('hides context menu when isRadio is true', () => {
      render(<PlayerToolbar id="song-1" isRadio={true} />)

      expect(
        screen.queryByTestId('player-context-menu'),
      ).not.toBeInTheDocument()
    })

    it('disables love button when loading is true', () => {
      useGetOne.mockReturnValue({ data: mockSongData, loading: true })

      render(<PlayerToolbar id="song-1" />)

      const loveButton = screen.getByTestId('love-button')
      expect(loveButton).toBeDisabled()
    })
  })

  describe('Mobile layout', () => {
    beforeEach(() => {
      useMediaQuery.mockReturnValue(false) // isDesktop = false
    })

    it('renders mobile layout with upper corner context menu and toolbar love button', () => {
      render(<PlayerToolbar id="song-1" />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(1)

      expect(screen.getByTestId('love-button')).toBeInTheDocument()
      const contextMenu = screen.getByTestId('player-context-menu')
      expect(contextMenu).toBeInTheDocument()
      expect(contextMenu.className).toContain('cornerMenu')
      expect(screen.queryByTestId('save-queue-button')).not.toBeInTheDocument()

      expect(listItems[0].className).toContain('mobileListItem')
    })

    it('hides context menu on mobile when isRadio is true', () => {
      render(<PlayerToolbar id="song-1" isRadio={true} />)

      expect(
        screen.queryByTestId('player-context-menu'),
      ).not.toBeInTheDocument()
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(1)
    })

    it('disables love button when conditions are met', () => {
      useGetOne.mockReturnValue({ data: mockSongData, loading: true })

      render(<PlayerToolbar id="song-1" />)

      const loveButton = screen.getByTestId('love-button')
      expect(loveButton).toBeDisabled()
    })
  })

  describe('Common behavior', () => {
    it('renders global hotkeys in both layouts', () => {
      // Test desktop layout
      useMediaQuery.mockReturnValue(true)
      render(<PlayerToolbar id="song-1" />)
      expect(screen.getByTestId('global-hotkeys')).toBeInTheDocument()

      // Cleanup and test mobile layout
      cleanup()
      useMediaQuery.mockReturnValue(false)
      render(<PlayerToolbar id="song-1" />)
      expect(screen.getByTestId('global-hotkeys')).toBeInTheDocument()
    })

    it('disables buttons when id is not provided and no queue song exists', () => {
      render(<PlayerToolbar />)

      const loveButton = screen.getByTestId('love-button')
      expect(loveButton).toBeDisabled()
      expect(
        screen.queryByTestId('player-context-menu'),
      ).not.toBeInTheDocument()
    })

    it('renders context menu when id is not provided as prop but song is present in player queue', () => {
      useSelector.mockImplementation((selector) =>
        selector({
          player: {
            queue: [{ song: { id: 'song-queue-1', title: 'Queue Song' } }],
            playIndex: 0,
          },
        }),
      )
      useGetOne.mockReturnValue({
        data: { id: 'song-queue-1', title: 'Queue Song' },
        loading: false,
      })

      render(<PlayerToolbar />)

      expect(screen.getByTestId('player-context-menu')).toBeInTheDocument()
    })
  })
})
