import React, {
  createElement,
  forwardRef,
  Fragment,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import clsx from 'clsx'
import {
  AppBar as RAAppBar,
  MenuItemLink,
  useTranslate,
  usePermissions,
  getResources,
  toggleSidebar,
  changeListParams,
} from 'react-admin'
import {
  MdInfo,
  MdPerson,
  MdSupervisorAccount,
  MdCast,
  MdClose,
} from 'react-icons/md'
import MenuIcon from '@material-ui/icons/Menu'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import {
  makeStyles,
  MenuItem,
  ListItemIcon,
  Divider,
  useMediaQuery,
  IconButton,
  InputBase,
  AppBar as MuiAppBar,
} from '@material-ui/core'
import { alpha } from '@material-ui/core/styles'
import ViewListIcon from '@material-ui/icons/ViewList'
import { Dialogs } from '../dialogs/Dialogs'
import { AboutDialog } from '../dialogs'
import CastDialog from '../dialogs/CastDialog'
import PersonalMenu from './PersonalMenu'
import ActivityPanel from './ActivityPanel'
import NowPlayingPanel from './NowPlayingPanel'
import UserMenu from './UserMenu'
import config from '../config'

const useStyles = makeStyles(
  (theme) => {
    const isDark = theme.palette.type === 'dark'
    return {
      appBar: {
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: `${theme.palette.background.default} !important`,
        color: `${theme.palette.text.primary} !important`,
        boxShadow: 'none !important',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)} !important`,
        position: 'fixed !important',
        top: 0,
        left: 0,
        right: 0,
        zIndex: `${theme.zIndex.drawer + 1} !important`,
        '& .MuiToolbar-root': {
          backgroundColor: `${theme.palette.background.default} !important`,
          color: `${theme.palette.text.primary} !important`,
          paddingRight: `${theme.spacing(1)}px !important`,
          paddingLeft: `${theme.spacing(1)}px !important`,
          minHeight: '48px !important',
          height: '48px !important',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          overflow: 'hidden',
          '& #react-admin-title': {
            minWidth: 0,
            flex: '1 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '1.05rem',
            fontWeight: 600,
          },
        },
        '& .RaLoadingIndicator-loadedIcon, & [class*="RaLoadingIndicator"], & .RaLoadingIndicator-loader':
          {
            flexShrink: '0 !important',
            display: 'inline-flex !important',
            visibility: 'visible !important',
            color: 'inherit',
          },
        '& .RaUserMenu-user, & [class*="UserMenu"], & [class*="RaUserMenu"]': {
          flexShrink: '0 !important',
          display: 'inline-flex !important',
          visibility: 'visible !important',
          color: 'inherit',
        },
      },
      // Fixed Minimalistic Mobile Header with generous top spacing from phone edge
      mobileAppBar: {
        paddingTop: 'calc(env(safe-area-inset-top) + 14px)',
        paddingBottom: '8px',
        paddingLeft: '16px',
        paddingRight: '16px',
        backgroundColor: `${theme.palette.background.default} !important`,
        color: `${theme.palette.text.primary} !important`,
        boxShadow: 'none !important',
        border: 'none !important',
        borderBottom: 'none !important',
        position: 'fixed !important',
        top: 0,
        left: 0,
        right: 0,
        zIndex: `${theme.zIndex.drawer + 1} !important`,
        width: '100vw',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      // Floating Dynamic Search Pill
      searchPill: {
        width: '100%',
        height: 46,
        borderRadius: 23,
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px 0 8px',
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.05)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 4px 20px rgba(0, 0, 0, 0.35)'
          : '0 2px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
      },
      searchPillFocused: {
        borderColor: `${theme.palette.primary.main} !important`,
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.12) !important'
          : 'rgba(0, 0, 0, 0.08) !important',
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)} !important`,
      },
      pillIconButton: {
        padding: 8,
        color: theme.palette.text.primary,
        flexShrink: 0,
        '&:hover': {
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.08)',
        },
      },
      pillInput: {
        flex: 1,
        minWidth: 0,
        marginLeft: 6,
        marginRight: 6,
        fontSize: '0.95rem',
        fontWeight: 400,
        color: theme.palette.text.primary,
        '& input': {
          padding: '8px 0',
          fontSize: '0.95rem',
          color: `${theme.palette.text.primary} !important`,
          '&::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.85,
          },
        },
      },
      root: {
        color: theme.palette.text.secondary,
      },
      active: {
        color: theme.palette.text.primary,
      },
      icon: { minWidth: theme.spacing(5) },
    }
  },
  {
    name: 'NDAppBar',
  },
)

const AboutMenuItem = forwardRef(({ onClick, ...rest }, ref) => {
  const classes = useStyles(rest)
  const translate = useTranslate()
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    onClick && onClick()
    setOpen(false)
  }
  const label = translate('menu.about')
  return (
    <>
      <MenuItem ref={ref} onClick={handleOpen} className={classes.root}>
        <ListItemIcon className={classes.icon}>
          <MdInfo title={label} size={24} />
        </ListItemIcon>
        {label}
      </MenuItem>
      <AboutDialog onClose={handleClose} open={open} />
    </>
  )
})

AboutMenuItem.displayName = 'AboutMenuItem'

const settingsResources = (resource) =>
  resource.name !== 'user' &&
  resource.hasList &&
  resource.options &&
  resource.options.subMenu === 'settings'

const CustomUserMenu = ({ onClick, ...rest }) => {
  const translate = useTranslate()
  const resources = useSelector(getResources)
  const classes = useStyles(rest)
  const { permissions } = usePermissions()
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'))

  const resourceDefinition = (resourceName) =>
    resources.find((r) => r?.name === resourceName)

  const renderUserMenuItemLink = () => {
    const userResource = resourceDefinition('user')
    if (!userResource) {
      return null
    }
    if (permissions !== 'admin') {
      if (!config.enableUserEditing) {
        return null
      }
      userResource.icon = MdPerson
    } else {
      userResource.icon = MdSupervisorAccount
    }
    return renderSettingsMenuItemLink(
      userResource,
      permissions !== 'admin' ? localStorage.getItem('userId') : null,
    )
  }

  const renderSettingsMenuItemLink = (resource, id) => {
    const label = translate(`resources.${resource.name}.name`, {
      smart_count: id ? 1 : 2,
    })
    const link = id ? `/${resource.name}/${id}` : `/${resource.name}`
    return (
      <MenuItemLink
        className={classes.root}
        activeClassName={classes.active}
        key={resource.name}
        to={link}
        primaryText={label}
        leftIcon={
          (resource.icon && createElement(resource.icon, { size: 24 })) || (
            <ViewListIcon />
          )
        }
        onClick={onClick}
        sidebarIsOpen={true}
      />
    )
  }

  return (
    <>
      {!isMobile &&
        config.devActivityPanel &&
        permissions === 'admin' &&
        config.enableNowPlaying && <NowPlayingPanel />}
      {config.devActivityPanel && permissions === 'admin' && <ActivityPanel />}
      <UserMenu {...rest}>
        <PersonalMenu sidebarIsOpen={true} onClick={onClick} />
        <Divider />
        {renderUserMenuItemLink()}
        {resources
          .filter(settingsResources)
          .map((r) => renderSettingsMenuItemLink(r))}
        <Divider />
        <AboutMenuItem />
      </UserMenu>
      <Dialogs />
    </>
  )
}

const MobileTopBar = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(location.search)
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      try {
        const parsed = JSON.parse(filterParam)
        return parsed.title || ''
      } catch {
        return ''
      }
    }
    return ''
  })
  const [castOpen, setCastOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const debounceTimerRef = useRef(null)

  const handleToggleSidebar = (e) => {
    e.currentTarget?.blur()
    dispatch(toggleSidebar())
  }

  const handleOpenCast = (e) => {
    e.currentTarget?.blur()
    setCastOpen(true)
  }

  // Update filter in URL and Redux state
  const applySearchFilter = useCallback(
    (query) => {
      const trimmed = query.trim()
      let currentFilters = {}
      const searchParams = new URLSearchParams(history.location.search)
      const filterParam = searchParams.get('filter')
      if (filterParam) {
        try {
          currentFilters = JSON.parse(filterParam)
        } catch {
          currentFilters = {}
        }
      }

      const newFilters = { ...currentFilters }
      if (trimmed) {
        newFilters.title = trimmed
      } else {
        delete newFilters.title
      }

      const isSongPage = history.location.pathname.startsWith('/song')
      const targetPath = isSongPage ? history.location.pathname : '/song'

      const newQueryString =
        Object.keys(newFilters).length > 0
          ? `?filter=${encodeURIComponent(JSON.stringify(newFilters))}`
          : ''

      history.replace(`${targetPath}${newQueryString}`)

      dispatch(
        changeListParams('song', {
          filter: newFilters,
        }),
      )
    },
    [history, dispatch],
  )

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (value === '') {
      // Immediate reset when input is cleared or backspaced to empty
      applySearchFilter('')
    } else {
      // 200ms debounce while typing
      debounceTimerRef.current = setTimeout(() => {
        applySearchFilter(value)
      }, 200)
    }
  }

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setSearchQuery('')
    applySearchFilter('')
  }

  // Sync searchQuery with location search if modified externally
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      try {
        const parsed = JSON.parse(filterParam)
        if (parsed.title !== undefined && parsed.title !== searchQuery) {
          setSearchQuery(parsed.title)
        }
      } catch {}
    } else if (searchQuery !== '') {
      setSearchQuery('')
    }
  }, [location.pathname, location.search])

  return (
    <MuiAppBar position="fixed" className={classes.mobileAppBar}>
      {/* Hidden React-Admin Title Portal anchor */}
      <span id="react-admin-title" style={{ display: 'none' }} />

      {/* Floating Dynamic Search Pill */}
      <div
        className={clsx(
          classes.searchPill,
          inputFocused && classes.searchPillFocused,
        )}
      >
        <IconButton
          className={classes.pillIconButton}
          onClick={handleToggleSidebar}
          aria-label="Open menu"
          tabIndex={-1}
        >
          <MenuIcon style={{ fontSize: 24 }} />
        </IconButton>

        <InputBase
          className={classes.pillInput}
          placeholder="Search your music"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          inputProps={{ 'aria-label': 'Search your music' }}
        />

        {searchQuery ? (
          <IconButton
            className={classes.pillIconButton}
            onClick={handleClearSearch}
            aria-label="Clear search"
            tabIndex={-1}
          >
            <MdClose size={20} />
          </IconButton>
        ) : null}

        <IconButton
          className={classes.pillIconButton}
          onClick={handleOpenCast}
          aria-label="Cast to device"
          tabIndex={-1}
        >
          <MdCast size={22} />
        </IconButton>
      </div>

      <CastDialog open={castOpen} onClose={() => setCastOpen(false)} />
      <Dialogs />
    </MuiAppBar>
  )
}

const NO_SEARCH_BAR_PREFIXES = [
  '/personal',
  '/user',
  '/player',
  '/transcoding',
  '/library',
  '/missing',
  '/plugin',
]

const shouldHideSearchBar = (pathname) => {
  return NO_SEARCH_BAR_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

const AppBar = (props) => {
  const classes = useStyles()
  const location = useLocation()
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'))

  if (isMobile) {
    if (shouldHideSearchBar(location.pathname)) {
      return <Dialogs />
    }
    return <MobileTopBar />
  }

  return (
    <RAAppBar
      {...props}
      className={classes.appBar}
      container={Fragment}
      userMenu={<CustomUserMenu />}
    />
  )
}

export default AppBar
