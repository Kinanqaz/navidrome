import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useGetOne } from 'react-admin'
import { GlobalHotKeys } from 'react-hotkeys'
import { useMediaQuery } from '@material-ui/core'
import clsx from 'clsx'
import { LoveButton, SongContextMenu, useToggleLove } from '../common'
import { keyMap } from '../hotkeys'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  mobileListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
    height: 24,
  },
  button: {
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: '50%',
    color: theme.palette.text.secondary,
    transition: theme.transitions.create(
      ['background-color', 'color', 'transform'],
      {
        duration: theme.transitions.duration.shortest,
      },
    ),
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: theme.palette.text.primary,
      transform: 'scale(1.08)',
    },
    '&:active': {
      transform: 'scale(0.94)',
    },
  },
  cornerButton: {
    width: 38,
    height: 38,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: theme.transitions.create(
      ['background-color', 'color', 'transform'],
      {
        duration: theme.transitions.duration.shortest,
      },
    ),
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.28)',
      color: '#ffffff',
      transform: 'scale(1.08)',
    },
    '&:active': {
      transform: 'scale(0.92)',
    },
    '& svg': {
      fontSize: 22,
      color: 'inherit',
    },
  },
  cornerMenu: {
    position: 'fixed',
    top: 'max(18px, env(safe-area-inset-top))',
    right: 'max(16px, env(safe-area-inset-right))',
    zIndex: 1001,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      position: 'absolute',
      top: theme.spacing(2),
      left: theme.spacing(2),
      right: 'auto',
    },
  },
  mobileButton: {
    width: 24,
    height: 24,
    padding: 0,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: theme.palette.text.secondary,
    '& svg': {
      fontSize: '18px',
    },
  },
}))

const PlayerToolbar = ({ id, isRadio }) => {
  const currentSong = useSelector(
    (state) =>
      state.player?.current?.song ||
      state.player?.queue?.[state.player?.playIndex]?.song,
  )
  const { data, loading } = useGetOne('song', id, { enabled: !!id && !isRadio })
  const songRecord = id ? data || currentSong || { id } : null
  const [toggleLove, toggling] = useToggleLove('song', songRecord || {})
  const isDesktop = useMediaQuery('(min-width:810px)')
  const classes = useStyles()

  const handlers = {
    TOGGLE_LOVE: useCallback(() => toggleLove(), [toggleLove]),
  }

  const buttonClass = isDesktop ? classes.button : classes.mobileButton
  const listItemClass = isDesktop ? classes.toolbar : classes.mobileListItem

  const loveButton = (
    <LoveButton
      record={songRecord}
      resource={'song'}
      size={isDesktop ? undefined : 'inherit'}
      disabled={loading || toggling || !id || isRadio}
      className={buttonClass}
    />
  )

  const contextMenu = songRecord && !isRadio ? (
    <SongContextMenu
      record={songRecord}
      resource={'song'}
      showLove={false}
      className={clsx(classes.cornerMenu, 'player-corner-menu')}
      buttonClassName={classes.cornerButton}
      buttonSize="medium"
      disabled={loading || !id}
      data-testid="player-context-menu"
    />
  ) : null

  return (
    <>
      <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges />
      {contextMenu}
      <li className={`${listItemClass} item`}>{loveButton}</li>
    </>
  )
}

export default PlayerToolbar
