import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, beforeEach, vi } from 'vitest'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { MemoryRouter } from 'react-router-dom'
import { useMediaQuery } from '@material-ui/core'
import { activityReducer } from '../reducers'
import AppBar from './AppBar'
import config from '../config'

let store

vi.mock('@material-ui/core', async () => {
  const actual = await import('@material-ui/core')
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false),
  }
})

vi.mock('react-admin', () => ({
  AppBar: ({ userMenu }) => <div data-testid="appbar">{userMenu}</div>,
  useTranslate: () => (x, opts) => opts?._ || x,
  usePermissions: () => ({ permissions: 'admin' }),
  getResources: () => [],
  useDataProvider: () => ({ getList: vi.fn().mockResolvedValue({ data: [] }) }),
  useNotify: () => vi.fn(),
  toggleSidebar: () => ({ type: 'TOGGLE_SIDEBAR' }),
  changeListParams: (resource, params) => ({
    type: 'RA/CRUD_CHANGE_LIST_PARAMS',
    payload: params,
    meta: { resource },
  }),
}))

vi.mock('./NowPlayingPanel', () => ({
  default: () => <div data-testid="now-playing-panel" />,
}))
vi.mock('./ActivityPanel', () => ({
  default: () => <div data-testid="activity-panel" />,
}))
vi.mock('./PersonalMenu', () => ({
  default: () => <div />,
}))
vi.mock('./UserMenu', () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock('../dialogs/Dialogs', () => ({
  Dialogs: () => <div />,
}))
vi.mock('../dialogs', () => ({
  AboutDialog: () => <div />,
}))

describe('<AppBar />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMediaQuery.mockReturnValue(false)
    config.devActivityPanel = true
    config.enableNowPlaying = true
    store = createStore(combineReducers({ activity: activityReducer }), {
      activity: { nowPlayingCount: 0 },
    })
  })

  it('renders NowPlayingPanel when enabled on desktop', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppBar />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.getByTestId('now-playing-panel')).toBeInTheDocument()
  })

  it('renders mobile search pill and hides desktop panels on mobile screens on music pages', () => {
    useMediaQuery.mockReturnValue(true) // isMobile = true
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/song']}>
          <AppBar />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.queryByTestId('now-playing-panel')).toBeNull()
    expect(screen.getByPlaceholderText('Search your music')).toBeInTheDocument()
    expect(screen.getByLabelText('Cast to device')).toBeInTheDocument()
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('hides mobile search pill on user and settings pages like personal, user, and player', () => {
    useMediaQuery.mockReturnValue(true) // isMobile = true
    const { unmount } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/personal']}>
          <AppBar />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.queryByPlaceholderText('Search your music')).toBeNull()
    unmount()

    const { unmount: unmountUser } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/user']}>
          <AppBar />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.queryByPlaceholderText('Search your music')).toBeNull()
    unmountUser()

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/player']}>
          <AppBar />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.queryByPlaceholderText('Search your music')).toBeNull()
  })

  it('hides NowPlayingPanel when disabled', () => {
    config.enableNowPlaying = false
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppBar />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.queryByTestId('now-playing-panel')).toBeNull()
  })
})
