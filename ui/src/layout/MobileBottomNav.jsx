import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import MusicNoteOutlinedIcon from '@material-ui/icons/MusicNoteOutlined'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined'
import CategoryIcon from '@material-ui/icons/Category'
import VideoLibraryOutlinedIcon from '@material-ui/icons/VideoLibraryOutlined'
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary'
import RepeatIcon from '@material-ui/icons/Repeat'
import clsx from 'clsx'
import { useTranslate } from 'react-admin'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxSizing: 'content-box',
    backgroundColor: '#1c1c24',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 -6px 28px rgba(0, 0, 0, 0.4)',
    userSelect: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  navItem: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    padding: '6px 0',
    transition: 'color 0.22s ease, transform 0.16s ease',
    WebkitTapHighlightColor: 'transparent',
    '&:active': {
      transform: 'scale(0.9)',
    },
  },
  navItemActive: {
    color: `${theme.palette.primary.main} !important`,
    '& $iconContainer': {
      color: theme.palette.primary.main,
      backgroundColor: `${theme.palette.primary.main}22`,
    },
    '& $label': {
      color: theme.palette.primary.main,
      fontWeight: 700,
      opacity: 1,
    },
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    transition:
      'background-color 0.22s ease, color 0.22s ease',
    '& svg': {
      fontSize: 21,
    },
  },
  label: {
    fontSize: '0.64rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1,
    opacity: 0.7,
    maxWidth: '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    transition: 'color 0.22s ease, opacity 0.22s ease, font-weight 0.22s ease',
  },
}))

const navItems = [
  {
    path: '/song',
    labelKey: 'resources.song.name',
    defaultLabel: 'Songs',
    smartCount: 2,
    Icon: MusicNoteOutlinedIcon,
    ActiveIcon: MusicNoteIcon,
    isActive: (pathname) => pathname === '/song' || pathname === '/song/',
  },
  {
    path: '/categories',
    labelKey: 'menu.categories',
    defaultLabel: 'Categories',
    Icon: CategoryOutlinedIcon,
    ActiveIcon: CategoryIcon,
    isActive: (pathname) => pathname.startsWith('/categories'),
  },
  {
    path: '/song/recentlyPlayed',
    labelKey: 'resources.album.lists.recentlyPlayed',
    defaultLabel: 'Recently',
    Icon: VideoLibraryOutlinedIcon,
    ActiveIcon: VideoLibraryIcon,
    isActive: (pathname) => pathname === '/song/recentlyPlayed',
  },
  {
    path: '/song/mostPlayed',
    labelKey: 'resources.album.lists.mostPlayed',
    defaultLabel: 'Most',
    Icon: RepeatIcon,
    ActiveIcon: RepeatIcon,
    isActive: (pathname) => pathname === '/song/mostPlayed',
  },
]

const MobileBottomNav = () => {
  const classes = useStyles()
  const location = useLocation()
  const translate = useTranslate()

  return (
    <nav className={classes.root} aria-label="Bottom Navigation">
      {navItems.map((item) => {
        const isActive = item.isActive(location.pathname)
        const IconComponent = isActive ? item.ActiveIcon : item.Icon
        const label = translate(item.labelKey, {
          smart_count: item.smartCount,
          _: item.defaultLabel,
        })

        return (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(classes.navItem, {
              [classes.navItemActive]: isActive,
            })}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className={classes.iconContainer}>
              <IconComponent />
            </div>
            <span className={classes.label}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav
