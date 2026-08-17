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

  if (song.id || info.trackId) {
    const record = {
      id: song.id || info.trackId,
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

  if (!info || (!info.name && !info.song?.title && !info.title)) {
    navigator.mediaSession.metadata = null
    return
  }

  const song = info.song || {}
  const title = song.title || info.name || info.title || ''
  const artist = song.artist || info.singer || info.artist || ''
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

export const clearMediaSessionMetadata = () => {
  if (
    typeof window !== 'undefined' &&
    'mediaSession' in navigator &&
    navigator.mediaSession
  ) {
    navigator.mediaSession.metadata = null
  }
}
