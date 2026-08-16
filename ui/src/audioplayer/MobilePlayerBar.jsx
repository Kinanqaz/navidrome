import React, { useCallback, useEffect, useRef, useState } from 'react'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import PauseRoundedIcon from '@material-ui/icons/PauseRounded'
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded'

const useStyles = makeStyles(
  (theme) => ({
    '@keyframes mobileBarIn': {
      '0%': {
        transform: 'translate3d(0, 24px, 0) scale(0.96)',
        opacity: 0,
      },
      '100%': {
        transform: 'translate3d(0, 0, 0) scale(1)',
        opacity: 1,
      },
    },
    root: {
      position: 'fixed',
      right: 'max(10px, env(safe-area-inset-right))',
      bottom: 'calc(10px + env(safe-area-inset-bottom))',
      left: 'max(10px, env(safe-area-inset-left))',
      zIndex: 998,
      display: 'flex',
      alignItems: 'center',
      height: 70,
      padding: 0,
      borderRadius: 16,
      overflow: 'hidden',
      transform: 'translateZ(0)',
      willChange: 'transform, opacity',
      animation: '$mobileBarIn 220ms cubic-bezier(0.32, 0.72, 0, 1) backwards',
      color: theme.palette.text.primary,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(22, 22, 30, 0.92)'
          : 'rgba(255, 255, 255, 0.92)',
      border: `1px solid ${
        theme.palette.type === 'dark'
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.08)'
      }`,
      boxShadow:
        theme.palette.type === 'dark'
          ? '0 10px 36px rgba(0, 0, 0, 0.55), 0 3px 10px rgba(0, 0, 0, 0.35)'
          : '0 10px 36px rgba(0, 0, 0, 0.16), 0 3px 10px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(28px) saturate(190%)',
      WebkitBackdropFilter: 'blur(28px) saturate(190%)',
      transition: 'box-shadow 0.25s ease, background-color 0.25s ease',
    },
    openButton: {
      display: 'flex',
      flex: 1,
      height: '100%',
      minWidth: 0,
      alignItems: 'center',
      padding: 0,
      color: 'inherit',
      font: 'inherit',
      textAlign: 'left',
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
      },
    },
    cover: {
      flex: '0 0 auto',
      width: 70,
      height: '100%',
      objectFit: 'cover',
      backgroundColor: theme.palette.action.hover,
      borderRadius: 0,
    },
    emptyCover: {
      display: 'block',
      flex: '0 0 auto',
      width: 70,
      height: '100%',
      backgroundColor: theme.palette.action.hover,
      borderRadius: 0,
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minWidth: 0,
      flex: 1,
      padding: theme.spacing(0, 1.75),
    },
    title: {
      display: 'block',
      overflow: 'hidden',
      fontSize: '0.98rem',
      fontWeight: 700,
      lineHeight: 1.3,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: theme.palette.text.primary,
    },
    artist: {
      display: 'block',
      overflow: 'hidden',
      marginTop: 3,
      color: theme.palette.text.secondary,
      fontSize: '0.84rem',
      fontWeight: 500,
      lineHeight: 1.3,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    playButton: {
      flex: '0 0 auto',
      width: 48,
      height: 48,
      marginRight: theme.spacing(1.25),
      padding: 0,
      color: theme.palette.text.primary,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '50%',
      transition: 'background-color 0.2s ease, transform 0.15s ease',
      '&:hover': {
        backgroundColor:
          theme.palette.type === 'dark'
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(0, 0, 0, 0.1)',
        transform: 'scale(1.06)',
      },
      '&:active': {
        transform: 'scale(0.94)',
      },
      '& svg': {
        fontSize: 32,
      },
    },
    progressTrack: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: 3,
      zIndex: 2,
      overflow: 'hidden',
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.06)',
    },
    progress: {
      height: '100%',
      backgroundColor: theme.palette.primary.main,
      transition: 'width 150ms linear',
    },
  }),
  { name: 'NDMobilePlayerBar' },
)

const MobilePlayerBar = ({ audio, cover, title, artist, onOpen }) => {
  const classes = useStyles()
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!audio) {
      setPlaying(false)
      setProgress(0)
      return undefined
    }

    const updatePlayback = () => setPlaying(!audio.paused && !audio.ended)
    const updateProgress = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0
      const currentTime = Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : 0
      setProgress(duration > 0 ? (currentTime / duration) * 100 : 0)
    }

    updatePlayback()
    updateProgress()
    audio.addEventListener('play', updatePlayback)
    audio.addEventListener('pause', updatePlayback)
    audio.addEventListener('ended', updatePlayback)
    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('durationchange', updateProgress)

    return () => {
      audio.removeEventListener('play', updatePlayback)
      audio.removeEventListener('pause', updatePlayback)
      audio.removeEventListener('ended', updatePlayback)
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('durationchange', updateProgress)
    }
  }, [audio])

  const togglePlayback = useCallback(() => {
    if (!audio) return
    if (audio.paused) {
      const playPromise = audio.play()
      if (playPromise?.catch) playPromise.catch(() => {})
    } else {
      audio.pause()
    }
  }, [audio])

  const touchStartRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStartRef.current) return
      const touch = e.changedTouches?.[0]
      if (!touch) return

      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaX = touch.clientX - touchStartRef.current.x
      const elapsed = Date.now() - touchStartRef.current.time
      const velocityY = deltaY / Math.max(elapsed, 1)

      if (
        (deltaY <= -35 || (deltaY <= -20 && velocityY <= -0.3)) &&
        Math.abs(deltaY) > Math.abs(deltaX) * 1.1
      ) {
        if (onOpen) onOpen()
      }
      touchStartRef.current = null
    },
    [onOpen],
  )

  return (
    <aside className={classes.root} aria-label="Now playing">
      <div className={classes.progressTrack} aria-hidden="true">
        <div className={classes.progress} style={{ width: `${progress}%` }} />
      </div>
      <button
        type="button"
        className={classes.openButton}
        onClick={onOpen}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`Open full-screen player${title ? ` for ${title}` : ''}`}
      >
        {cover ? (
          <img className={classes.cover} src={cover} alt="" />
        ) : (
          <span className={classes.emptyCover} aria-hidden="true" />
        )}
        <span className={classes.details}>
          <span className={classes.title}>{title || 'Now playing'}</span>
          {artist && <span className={classes.artist}>{artist}</span>}
        </span>
      </button>
      <IconButton
        className={classes.playButton}
        onClick={togglePlayback}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
      </IconButton>
    </aside>
  )
}

export default MobilePlayerBar
