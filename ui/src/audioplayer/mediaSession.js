import subsonic from '../subsonic'

const getAbsoluteUrl = (url) => {
  if (!url) return ''
  try {
    return new URL(url, window.location.href).href
  } catch (e) {
    return url
  }
}

export const buildMediaSessionArtwork = (info = {}) => {
  const song = info.song || {}
  const sizes = [96, 128, 192, 256, 384, 512]

  const trackId = song.id || info.trackId || info.id
  if (trackId) {
    const record = {
      id: trackId,
      album: song.album || info.name,
      updatedAt: song.updatedAt,
      imageHash: song.imageHash,
    }
    return sizes.map((size) => ({
      src: getAbsoluteUrl(subsonic.getCoverArtUrl(record, size, true)),
      sizes: `${size}x${size}`,
    }))
  }

  if (info.cover) {
    const absCover = getAbsoluteUrl(info.cover)
    return sizes.map((size) => ({
      src: absCover,
      sizes: `${size}x${size}`,
    }))
  }

  return []
}

export const updateMediaSessionMetadata = (info) => {
  if (
    typeof window === 'undefined' ||
    !('mediaSession' in navigator) ||
    typeof window.MediaMetadata === 'undefined'
  ) {
    return
  }

  if (!info || (!info.name && !info.song?.title && !info.title && !info.trackId)) {
    navigator.mediaSession.metadata = null
    return
  }

  const song = info.song || {}
  const title = song.title || info.name || info.title || 'Navidrome'
  const artist = song.artist || song.albumArtist || info.singer || info.artist || ''
  const album = song.album || (info.isRadio ? 'Radio' : '')

  const artwork = buildMediaSessionArtwork(info)

  try {
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title,
      artist,
      album,
      artwork,
    })
  } catch (error) {
    // ignore
  }
}

export const updateMediaSessionPlaybackState = (isPlaying) => {
  if (
    typeof window !== 'undefined' &&
    'mediaSession' in navigator &&
    navigator.mediaSession
  ) {
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    } catch (e) {
      // ignore
    }
  }
}

export const updateMediaSessionPositionState = (audio) => {
  if (
    typeof window === 'undefined' ||
    !('mediaSession' in navigator) ||
    !navigator.mediaSession ||
    typeof navigator.mediaSession.setPositionState !== 'function' ||
    !audio
  ) {
    return
  }
  try {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0
    const position = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
    const playbackRate =
      Number.isFinite(audio.playbackRate) && audio.playbackRate > 0
        ? audio.playbackRate
        : 1
    if (duration > 0 && position >= 0 && position <= duration) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position,
      })
    }
  } catch (e) {
    // ignore
  }
}

export const setupMediaSessionActionHandlers = ({
  onPlay,
  onPause,
  onPrev,
  onNext,
  onSeekTo,
  onSeekBackward,
  onSeekForward,
}) => {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

  const actions = [
    ['play', onPlay],
    ['pause', onPause],
    ['previoustrack', onPrev],
    ['nexttrack', onNext],
    ['seekto', onSeekTo],
    ['seekbackward', onSeekBackward],
    ['seekforward', onSeekForward],
  ]

  actions.forEach(([action, handler]) => {
    try {
      if (typeof handler === 'function') {
        navigator.mediaSession.setActionHandler(action, handler)
      } else {
        navigator.mediaSession.setActionHandler(action, null)
      }
    } catch (e) {
      // ignore unsupported actions
    }
  })
}

export const clearMediaSessionMetadata = () => {
  if (
    typeof window !== 'undefined' &&
    'mediaSession' in navigator &&
    navigator.mediaSession
  ) {
    try {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.playbackState = 'none'
    } catch (e) {
      // ignore
    }
  }
}
