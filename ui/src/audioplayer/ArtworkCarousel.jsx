import React, { useEffect, useMemo, useRef, useState } from 'react'
import MusicNoteIcon from '@material-ui/icons/MusicNote'

export const ArtworkCarousel = ({
  queue = [],
  playIndex = 0,
  currentTrack,
  playMode = 'all',
  audioInstance,
}) => {
  const [offset, setOffset] = useState(0)
  const [animating, setAnimating] = useState(false)
  const rootRef = useRef(null)
  const drag = useRef({ startX: 0, startY: 0, active: false, x: 0, isH: null })

  const idx = useMemo(() => {
    if (!queue.length) return 0
    const i = queue.findIndex(
      (t) =>
        (currentTrack?.id && t.id === currentTrack.id) ||
        (currentTrack?.uuid && t.uuid === currentTrack.uuid) ||
        (currentTrack?.trackId && t.trackId === currentTrack.trackId),
    )
    return i !== -1 ? i : Math.max(0, Math.min(playIndex ?? 0, queue.length - 1))
  }, [queue, currentTrack, playIndex])

  const loop = playMode === 'all' || playMode === 'shufflePlay'
  const prev = idx > 0 ? queue[idx - 1] : (loop && queue.length > 1 ? queue[queue.length - 1] : null)
  const next = idx < queue.length - 1 ? queue[idx + 1] : (loop && queue.length > 1 ? queue[0] : null)
  const current = queue[idx] || currentTrack

  useEffect(() => {
    setOffset(0)
    setAnimating(false)
  }, [idx, currentTrack?.uuid, currentTrack?.id])

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    drag.current = { startX: e.clientX, startY: e.clientY, active: true, x: 0, isH: null }
    setAnimating(false)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (d.isH === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      d.isH = Math.abs(dx) > Math.abs(dy)
    }
    if (!d.isH) return
    d.x = (dx > 0 && !prev) || (dx < 0 && !next) ? dx * 0.25 : dx
    setOffset(d.x)
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d.active) return
    d.active = false
    if (!d.isH) return setOffset(0)

    const width = rootRef.current?.offsetWidth || 350

    if (d.x < -45 && next && audioInstance?.playNext) {
      setAnimating(true)
      setOffset(-width)
      setTimeout(() => audioInstance.playNext(), 190)
    } else if (d.x > 45 && prev && audioInstance?.playPrev) {
      setAnimating(true)
      setOffset(width)
      setTimeout(() => audioInstance.playPrev(), 190)
    } else {
      setAnimating(true)
      setOffset(0)
    }
  }

  const slides = [
    { item: prev, pos: -1 },
    { item: current, pos: 0 },
    { item: next, pos: 1 },
  ].filter((s) => s.item)

  return (
    <div
      ref={rootRef}
      className="nd-artwork-carousel"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
        touchAction: 'pan-y',
        cursor: 'grab',
        zIndex: 2,
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {slides.map(({ item, pos }) => (
        <div
          key={item?.uuid || item?.id || pos}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            overflow: 'hidden',
            backgroundColor: '#161622',
            pointerEvents: 'none',
            transition: animating
              ? 'transform 220ms cubic-bezier(0.2, 0.85, 0.3, 1)'
              : 'none',
            transform: `translate3d(calc(${pos * 100}% + ${offset}px), 0, 0)`,
          }}
        >
          {item?.cover ? (
            <img
              src={item.cover}
              alt={item?.title || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable={false}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a1a26',
                color: 'rgba(255, 255, 255, 0.35)',
              }}
            >
              <MusicNoteIcon style={{ fontSize: 56 }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ArtworkCarousel
