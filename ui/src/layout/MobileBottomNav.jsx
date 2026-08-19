import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import MusicNoteOutlinedIcon from '@material-ui/icons/MusicNoteOutlined'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import PersonOutlineIcon from '@material-ui/icons/PersonOutline'
import PersonIcon from '@material-ui/icons/Person'
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined'
import CategoryIcon from '@material-ui/icons/Category'
import WbSunnyOutlinedIcon from '@material-ui/icons/WbSunnyOutlined'
import WbSunnyIcon from '@material-ui/icons/WbSunny'
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
    justifyContent: 'space-between',
    height: 72,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxSizing: 'content-box',
    backgroundColor: '#181820',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 -6px 28px rgba(0, 0, 0, 0.4)',
    userSelect: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  navItem: {
    flex: '1 1 0%',
    width: '25%',
    maxWidth: '25%',
    minWidth: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    padding: '4px 2px',
    boxSizing: 'border-box',
    transition: 'color 0.22s ease, transform 0.16s ease',
    WebkitTapHighlightColor: 'transparent',
    '&:active': {
      transform: 'scale(0.92)',
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
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    transition:
      'background-color 0.22s ease, color 0.22s ease',
    '& svg': {
      fontSize: 26,
    },
  },
  label: {
    fontSize: '0.74rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
    lineHeight: 1.15,
    opacity: 0.75,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    padding: '0 2px',
    boxSizing: 'border-box',
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
    path: '/artist',
    labelKey: 'resources.artist.name',
    defaultLabel: 'Artists',
    smartCount: 2,
    Icon: PersonOutlineIcon,
    ActiveIcon: PersonIcon,
    isActive: (pathname) => pathname.startsWith('/artist'),
  },
  {
    path: '/genres',
    labelKey: 'resources.genre.name',
    defaultLabel: 'Genres',
    smartCount: 2,
    Icon: CategoryOutlinedIcon,
    ActiveIcon: CategoryIcon,
    isActive: (pathname) =>
      pathname.startsWith('/genres') || pathname.startsWith('/categories'),
  },
  {
    path: '/moods',
    labelKey: 'menu.moods',
    defaultLabel: 'Moods',
    smartCount: 2,
    Icon: WbSunnyOutlinedIcon,
    ActiveIcon: WbSunnyIcon,
    isActive: (pathname) => pathname.startsWith('/moods'),
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
