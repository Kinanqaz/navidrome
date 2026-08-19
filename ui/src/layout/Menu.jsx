import React, { createElement, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Divider,
  Typography,
  makeStyles,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
} from '@material-ui/core'
import { alpha } from '@material-ui/core/styles'
import clsx from 'clsx'
import {
  useTranslate,
  MenuItemLink,
  getResources,
  useGetIdentity,
  usePermissions,
} from 'react-admin'
import ViewListIcon from '@material-ui/icons/ViewList'
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined'
import WbSunnyOutlinedIcon from '@material-ui/icons/WbSunnyOutlined'
import AccountCircle from '@material-ui/icons/AccountCircle'
import {
  MdTune,
  MdInfo,
  MdPerson,
  MdSupervisorAccount,
  MdExitToApp,
} from 'react-icons/md'
import { VscSync } from 'react-icons/vsc'
import { GiMagnifyingGlass } from 'react-icons/gi'
import { humanize, pluralize } from 'inflection'
import songLists from '../song/songLists'
import LibrarySelector from '../common/LibrarySelector'
import { AboutDialog } from '../dialogs'
import subsonic from '../subsonic'
import authProvider from '../authProvider'
import config from '../config'

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.type === 'dark'
  return {
    root: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      transition: theme.transitions.create(['width', 'padding'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      paddingBottom: (props) => (props.addPadding ? '90px' : '36px'),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 80px)',
      boxSizing: 'border-box',
    },
    navSection: {
      flex: '1 1 auto',
    },
    open: {
      width: 240,
    },
    closed: {
      width: 60,
      paddingLeft: 4,
      paddingRight: 4,
    },
    sectionHeader: {
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
      opacity: 0.65,
      padding: `${theme.spacing(1.5)}px ${theme.spacing(1.5)}px ${theme.spacing(0.5)}px`,
      userSelect: 'none',
    },
    divider: {
      margin: `${theme.spacing(1)}px ${theme.spacing(1)}px`,
      opacity: 0.25,
    },
    menuItem: {
      borderRadius: 8,
      margin: '2px 0',
      padding: '8px 12px',
      transition: 'all 0.16s ease-in-out',
      color: theme.palette.text.secondary,
      '&:hover': {
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.05)',
        color: theme.palette.text.primary,
        transform: 'translateX(3px)',
      },
      '& .RaMenuItemLink-icon': {
        minWidth: 36,
        color: 'inherit',
        transition: 'color 0.16s ease-in-out',
      },
    },
    active: {
      color: `${theme.palette.text.primary} !important`,
      fontWeight: 600,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.12) !important'
        : 'rgba(0, 0, 0, 0.08) !important',
      '& .RaMenuItemLink-icon': {
        color: `${theme.palette.primary.main} !important`,
      },
    },
    bottomSection: {
      marginTop: 'auto',
      paddingTop: theme.spacing(1.5),
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    },
    userCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 10px',
      borderRadius: 12,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.03)',
      marginBottom: theme.spacing(1),
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      minWidth: 0,
      flex: 1,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      color: theme.palette.primary.main,
    },
    userNameWrapper: {
      minWidth: 0,
      flex: 1,
    },
    userName: {
      fontSize: '0.85rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: theme.palette.text.primary,
    },
    userRole: {
      fontSize: '0.68rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
    syncButton: {
      padding: 6,
      color: theme.palette.text.secondary,
      transition: 'all 0.2s ease',
      '&:hover': {
        color: theme.palette.primary.main,
      },
    },
    spinning: {
      animation: '$spin 1.5s linear infinite',
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  }
})

const translatedResourceName = (resource, translate) =>
  translate(`resources.${resource.name}.name`, {
    smart_count: 2,
    _:
      resource.options && resource.options.label
        ? translate(resource.options.label, {
            smart_count: 2,
            _: resource.options.label,
          })
        : humanize(pluralize(resource.name)),
  })

const settingsResources = (resource) =>
  resource.name !== 'user' &&
  resource.hasList &&
  resource.options &&
  resource.options.subMenu === 'settings'

const Menu = ({ dense = false }) => {
  const open = useSelector((state) => state.admin.ui.sidebarOpen)
  const translate = useTranslate()
  const queue = useSelector((state) => state.player?.queue)
  const scanStatus = useSelector((state) => state.activity?.scanStatus || {})
  const { loaded, identity } = useGetIdentity()
  const { permissions } = usePermissions()
  const [aboutOpen, setAboutOpen] = useState(false)
  const classes = useStyles({ addPadding: queue.length > 0 })
  const resources = useSelector(getResources)
  const resourcesByName = new Map(
    resources.map((resource) => [resource.name, resource]),
  )

  const songResource = resourcesByName.get('song')
  const albumResource = resourcesByName.get('album')
  const artistResource = resourcesByName.get('artist')
  const playlistResource = resourcesByName.get('playlist')
  const radioResource = resourcesByName.get('radio')
  const shareResource = resourcesByName.get('share')

  const handleQuickScan = (e) => {
    e.stopPropagation()
    subsonic.startScan({ fullScan: false })
  }

  const handleFullScan = (e) => {
    e.stopPropagation()
    subsonic.startScan({ fullScan: true })
  }

  const handleLogout = () => {
    authProvider.logout().then((redirectTo) => {
      if (redirectTo !== false) {
        window.location.reload()
      }
    })
  }

  const renderResourceMenuItemLink = (
    resource,
    target = resource ? `/${resource.name}` : '',
  ) => {
    if (!resource) return null
    return (
      <MenuItemLink
        key={resource.name}
        to={target}
        activeClassName={classes.active}
        className={classes.menuItem}
        primaryText={translatedResourceName(resource, translate)}
        leftIcon={resource.icon || <ViewListIcon />}
        sidebarIsOpen={open}
        dense={dense}
      />
    )
  }

  const renderSongListMenuItemLink = (type, songList) => {
    const songListAddress = `/song/${type}`
    const name = translate(`resources.album.lists.${type}`, {
      _: humanize(type),
    })

    return (
      <MenuItemLink
        key={songListAddress}
        to={songListAddress}
        activeClassName={classes.active}
        className={classes.menuItem}
        primaryText={name}
        leftIcon={songList.icon || <ViewListIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
    )
  }

  const renderSettingsMenuItemLink = (resource, id) => {
    const label = translate(`resources.${resource.name}.name`, {
      smart_count: id ? 1 : 2,
    })
    const link = id ? `/${resource.name}/${id}` : `/${resource.name}`
    return (
      <MenuItemLink
        className={classes.menuItem}
        activeClassName={classes.active}
        key={resource.name}
        to={link}
        primaryText={label}
        leftIcon={
          (resource.icon && createElement(resource.icon, { size: 22 })) || (
            <ViewListIcon />
          )
        }
        sidebarIsOpen={open}
        dense={dense}
      />
    )
  }

  const renderUserMenuItemLink = () => {
    const userResource = resourcesByName.get('user')
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

  return (
    <div
      className={clsx(classes.root, {
        [classes.open]: open,
        [classes.closed]: !open,
      })}
    >
      <div className={classes.navSection}>
        {open && <LibrarySelector />}

        {/* Library Section */}
        {open && (
          <Typography className={classes.sectionHeader}>
            {translate('menu.library', { _: 'Library' })}
          </Typography>
        )}
        {renderResourceMenuItemLink(songResource)}
        {renderResourceMenuItemLink(albumResource, '/album/all')}
        {renderResourceMenuItemLink(artistResource)}
        {renderResourceMenuItemLink(playlistResource)}

        {/* Discover Section */}
        <Divider className={classes.divider} />
        {open && (
          <Typography className={classes.sectionHeader}>
            {translate('menu.discover', { _: 'Discover' })}
          </Typography>
        )}
        {Object.keys(songLists).map((type) =>
          renderSongListMenuItemLink(type, songLists[type]),
        )}
        <MenuItemLink
          to="/genres"
          activeClassName={classes.active}
          className={classes.menuItem}
          primaryText="Genres"
          leftIcon={<CategoryOutlinedIcon />}
          sidebarIsOpen={open}
          dense={dense}
        />
        <MenuItemLink
          to="/moods"
          activeClassName={classes.active}
          className={classes.menuItem}
          primaryText="Moods"
          leftIcon={<WbSunnyOutlinedIcon />}
          sidebarIsOpen={open}
          dense={dense}
        />

        {/* Radios and Shares Section */}
        <Divider className={classes.divider} />
        {renderResourceMenuItemLink(radioResource)}
        {renderResourceMenuItemLink(shareResource)}
      </div>

      {/* Bottom Profile & System Settings Section */}
      {open && (
        <div className={classes.bottomSection}>
          <div className={classes.userCard}>
            <div className={classes.userInfo}>
              {loaded && identity?.avatar ? (
                <Avatar
                  src={identity.avatar}
                  alt={identity.fullName}
                  className={classes.avatar}
                />
              ) : (
                <Avatar className={classes.avatar}>
                  <AccountCircle />
                </Avatar>
              )}
              <div className={classes.userNameWrapper}>
                <Typography className={classes.userName}>
                  {loaded && identity?.fullName ? identity.fullName : 'Navidrome'}
                </Typography>
                <Typography className={classes.userRole}>
                  {permissions === 'admin' ? 'Administrator' : 'User'}
                </Typography>
              </div>
            </div>

            <Box display="flex" alignItems="center">
              <Tooltip
                title={
                  scanStatus.scanning
                    ? `${translate('activity.status')}: Scanning...`
                    : translate('activity.quickScan')
                }
              >
                <IconButton
                  size="small"
                  className={clsx(
                    classes.syncButton,
                    scanStatus.scanning && classes.spinning,
                  )}
                  onClick={handleQuickScan}
                  disabled={scanStatus.scanning}
                  aria-label="Sync / Quick scan"
                >
                  <VscSync size={19} />
                </IconButton>
              </Tooltip>

              {permissions === 'admin' && (
                <Tooltip title={translate('activity.fullScan')}>
                  <IconButton
                    size="small"
                    className={classes.syncButton}
                    onClick={handleFullScan}
                    disabled={scanStatus.scanning}
                    aria-label="Full scan"
                  >
                    <GiMagnifyingGlass size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </div>

          <MenuItemLink
            to="/personal"
            activeClassName={classes.active}
            className={classes.menuItem}
            primaryText={translate('menu.personal.name')}
            leftIcon={<MdTune size={22} />}
            sidebarIsOpen={open}
            dense={dense}
          />

          {renderUserMenuItemLink()}
          {resources
            .filter(settingsResources)
            .map((r) => renderSettingsMenuItemLink(r))}

          <MenuItemLink
            to="#"
            className={classes.menuItem}
            primaryText={translate('menu.about')}
            leftIcon={<MdInfo size={22} />}
            onClick={(e) => {
              e.preventDefault()
              setAboutOpen(true)
            }}
            sidebarIsOpen={open}
            dense={dense}
          />

          {(!config.auth || !!config.extAuthLogoutURL) && (
            <MenuItemLink
              to="#"
              className={classes.menuItem}
              primaryText={translate('ra.auth.logout') || 'Logout'}
              leftIcon={<MdExitToApp size={22} />}
              onClick={(e) => {
                e.preventDefault()
                handleLogout()
              }}
              sidebarIsOpen={open}
              dense={dense}
            />
          )}

          <AboutDialog
            open={aboutOpen}
            onClose={() => setAboutOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

export default Menu
