import React, { useEffect, useMemo, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import clsx from 'clsx'

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderRadius: 'inherit',
    backgroundColor: '#0c0c12',
    color: '#ffffff',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 14px',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 10,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    cursor: 'pointer',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  contentContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    padding: '40% 0',
  },
  emptyContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyIcon: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  emptyText: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#ffffff',
    letterSpacing: '0.02em',
  },
  emptySubtext: {
    fontSize: '0.78rem',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  line: {
    fontSize: '0.98rem',
    fontWeight: 500,
    lineHeight: 1.45,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    transition: 'color 0.22s ease, font-size 0.22s ease, transform 0.22s ease, opacity 0.22s ease',
    padding: '2px 8px',
    borderRadius: '8px',
  },
  activeLine: {
    color: '#ffffff !important',
    fontSize: '1.18rem !important',
    fontWeight: '700 !important',
    transform: 'scale(1.05)',
    textShadow: '0 2px 14px rgba(255, 255, 255, 0.35)',
  },
}))

function parseLrc(rawLyric) {
  if (!rawLyric || typeof rawLyric !== 'string') return []
  const lines = rawLyric.split('\n')
  const parsed = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/

  for (const line of lines) {
    const match = line.match(timeRegex)
    if (match) {
      const min = parseInt(match[1], 10)
      const sec = parseInt(match[2], 10)
      const ms = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10)
      const time = min * 60 + sec + ms / 1000
      const text = match[4].trim()
      if (text) {
        parsed.push({ time, text })
      }
    } else if (line.trim() && !line.startsWith('[')) {
      parsed.push({ time: -1, text: line.trim() })
    }
  }
  return parsed
}

export const LyricsCanvas = ({ audio, lyric, onClose }) => {
  const classes = useStyles()
  const scrollRef = useRef(null)
  const activeLineRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)

  const parsedLines = useMemo(() => parseLrc(lyric), [lyric])
  const isSynced = useMemo(
    () => parsedLines.some((l) => l.time >= 0),
    [parsedLines],
  )

  useEffect(() => {
    if (!audio) return undefined

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [audio])

  // Determine active lyric index
  const activeIndex = useMemo(() => {
    if (!isSynced || parsedLines.length === 0) return -1
    let idx = -1
    for (let i = 0; i < parsedLines.length; i++) {
      if (parsedLines[i].time <= currentTime + 0.2) {
        idx = i
      } else {
        break
      }
    }
    return idx
  }, [isSynced, parsedLines, currentTime])

  // Smooth auto-scroll to keep active line centered
  useEffect(() => {
    if (activeLineRef.current && scrollRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex])

  const handleClick = (e) => {
    e.stopPropagation()
    if (onClose) onClose()
  }

  const handleLineClick = (e, line) => {
    e.stopPropagation()
    if (audio && line.time >= 0) {
      audio.currentTime = line.time
    }
  }

  if (parsedLines.length === 0) {
    return (
      <div
        className={clsx(classes.root, 'nd-lyrics-canvas')}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Lyrics overlay, click to close"
      >
        <div className={classes.emptyContainer}>
          <MusicNoteIcon className={classes.emptyIcon} />
          <span className={classes.emptyText}>No lyrics available</span>
          <span className={classes.emptySubtext}>Tap to view album artwork</span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={clsx(classes.root, 'nd-lyrics-canvas')}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Lyrics canvas, tap to return to artwork"
    >
      <div className={classes.contentContainer}>
        {parsedLines.map((line, idx) => {
          const isActive = idx === activeIndex
          return (
            <div
              key={`${line.time}-${idx}`}
              ref={isActive ? activeLineRef : null}
              className={clsx(classes.line, {
                [classes.activeLine]: isActive,
              })}
              onClick={(e) => handleLineClick(e, line)}
            >
              {line.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LyricsCanvas
