import React from 'react'
import { useSelector } from 'react-redux'
import { Divider, Typography, makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import { useTranslate, MenuItemLink, getResources } from 'react-admin'
import ViewListIcon from '@material-ui/icons/ViewList'
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined'
import WbSunnyOutlinedIcon from '@material-ui/icons/WbSunnyOutlined'
import { humanize, pluralize } from 'inflection'
import songLists from '../song/songLists'
import LibrarySelector from '../common/LibrarySelector'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    transition: theme.transitions.create(['width', 'padding'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter,
    }),
    paddingBottom: (props) => (props.addPadding ? '80px' : '24px'),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    userSelect: 'none',
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
      backgroundColor:
        theme.palette.type === 'dark'
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
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.12) !important'
        : 'rgba(0, 0, 0, 0.08) !important',
    '& .RaMenuItemLink-icon': {
      color: `${theme.palette.primary.main} !important`,
    },
  },
}))

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

const Menu = ({ dense = false }) => {
  const open = useSelector((state) => state.admin.ui.sidebarOpen)
  const translate = useTranslate()
  const queue = useSelector((state) => state.player?.queue)
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

  return (
    <div
      className={clsx(classes.root, {
        [classes.open]: open,
        [classes.closed]: !open,
      })}
    >
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
  )
}

export default Menu
