import React, { useCallback, useEffect, useRef, useState } from 'react'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import PauseRoundedIcon from '@material-ui/icons/PauseRounded'
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: 'max(10px, env(safe-area-inset-right))',
    bottom: 'calc(68px + env(safe-area-inset-bottom))',
    left: 'max(10px, env(safe-area-inset-left))',
    zIndex: 1350,
    display: 'flex',
    alignItems: 'center',
    height: 84,
    padding: 0,
    borderRadius: 18,
    overflow: 'hidden',
    touchAction: 'none',
    transform: 'translateZ(0)',
    willChange: 'transform, opacity',
    color: theme.palette.text.primary,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(22, 22, 30, 0.88)'
        : 'rgba(255, 255, 255, 0.88)',
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
  backdrop: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    filter: 'blur(35px) saturate(220%) brightness(0.65)',
    transition: 'background-image 0.6s ease, opacity 0.6s ease',
    pointerEvents: 'none',
    zIndex: 0,
  },
  openButton: {
    position: 'relative',
    zIndex: 1,
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
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: -2,
    },
  },
  cover: {
    flex: '0 0 auto',
    width: 84,
    height: '100%',
    objectFit: 'cover',
    backgroundColor: theme.palette.action.hover,
    borderRadius: 0,
  },
    emptyCover: {
      display: 'block',
      flex: '0 0 auto',
      width: 84,
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
      padding: theme.spacing(0, 2),
    },
    title: {
      display: 'block',
      overflow: 'hidden',
      fontSize: '1.02rem',
      fontWeight: 700,
      lineHeight: 1.35,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: theme.palette.text.primary,
    },
    artist: {
      display: 'block',
      overflow: 'hidden',
      marginTop: 4,
      color: theme.palette.text.secondary,
      fontSize: '0.88rem',
      fontWeight: 500,
      lineHeight: 1.3,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    playButton: {
      position: 'relative',
      zIndex: 1,
      flex: '0 0 52px',
      width: 52,
      height: 52,
      minWidth: 52,
      minHeight: 52,
      marginRight: theme.spacing(1.5),
      padding: 0,
      color: theme.palette.text.primary,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '50%',
      overflow: 'hidden',
      outline: 'none !important',
      border: 'none !important',
      boxShadow: 'none !important',
      WebkitTapHighlightColor: 'transparent !important',
      userSelect: 'none !important',
      transition: 'background-color 0.2s ease',
      transform: 'none !important',
      '&:focus, &:focus-visible, &:active': {
        outline: 'none !important',
        boxShadow: 'none !important',
        transform: 'none !important',
      },
      '&:hover': {
        backgroundColor:
          theme.palette.type === 'dark'
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(0, 0, 0, 0.1)',
        transform: 'none !important',
      },
      '& svg': {
        fontSize: 34,
        display: 'block',
        transform: 'none !important',
      },
    },
    progressTrack: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: 3.5,
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

  const lastActionTimeRef = useRef(0)

  const togglePlayback = useCallback(
    (e) => {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault()
        if (typeof e.stopPropagation === 'function') e.stopPropagation()
      }
      const now = Date.now()
      if (now - lastActionTimeRef.current < 250) return
      lastActionTimeRef.current = now

      if (!audio) return

      if (audio.paused) {
        const playPromise = audio.play?.()
        if (playPromise?.catch) playPromise.catch(() => {})
      } else {
        audio.pause?.()
      }
    },
    [audio],
  )

  const touchStartRef = useRef(null)
  const lastSwipeTimeRef = useRef(0)
  const barRef = useRef(null)

  const handleClick = useCallback(
    (e) => {
      if (Date.now() - lastSwipeTimeRef.current < 400) {
        if (e && e.preventDefault) e.preventDefault()
        return
      }
      if (barRef.current) {
        barRef.current.style.transition =
          'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease'
        barRef.current.style.transform = 'translate3d(0, -60px, 0)'
        barRef.current.style.opacity = '0'
      }
      if (onOpen) onOpen()
    },
    [onOpen],
  )

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return
    e.stopPropagation()
    if (barRef.current) {
      barRef.current.style.transition = 'none'
    }
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current || e.touches.length !== 1) return
    const touch = e.touches[0]
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaX = touch.clientX - touchStartRef.current.x

    if (deltaY < 0 && Math.abs(deltaY) > Math.abs(deltaX) * 0.8) {
      e.stopPropagation()
      if (barRef.current) {
        barRef.current.style.transform = `translate3d(0, ${deltaY}px, 0)`
      }
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStartRef.current) return
      e.stopPropagation()
      const touch = e.changedTouches?.[0]
      if (!touch) return

      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaX = touch.clientX - touchStartRef.current.x
      const elapsed = Date.now() - touchStartRef.current.time
      const velocityY = deltaY / Math.max(elapsed, 1)

      if (
        (deltaY <= -35 || (deltaY <= -20 && velocityY <= -0.3)) &&
        Math.abs(deltaY) > Math.abs(deltaX) * 0.8
      ) {
        lastSwipeTimeRef.current = Date.now()
        if (barRef.current) {
          barRef.current.style.transition =
            'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease'
          barRef.current.style.transform = 'translate3d(0, -60px, 0)'
          barRef.current.style.opacity = '0'
        }
        if (onOpen) onOpen()
      } else if (barRef.current) {
        barRef.current.style.transition =
          'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)'
        barRef.current.style.transform = 'translate3d(0, 0, 0)'
      }
      touchStartRef.current = null
    },
    [onOpen],
  )

  return (
    <aside ref={barRef} className={classes.root} aria-label="Now playing">
      <div
        className={classes.backdrop}
        style={{
          backgroundImage: cover ? `url("${cover}")` : 'none',
          opacity: cover ? 0.35 : 0,
        }}
        aria-hidden="true"
      />
      <div className={classes.progressTrack} aria-hidden="true">
        <div className={classes.progress} style={{ width: `${progress}%` }} />
      </div>
      <button
        type="button"
        className={classes.openButton}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
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
        onTouchEnd={togglePlayback}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
      </IconButton>
    </aside>
  )
}

export default MobilePlayerBar
