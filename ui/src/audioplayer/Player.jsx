import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useInterval } from '../common'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from '@material-ui/core'
import { ThemeProvider, createTheme } from '@material-ui/core/styles'
import {
  useAuthState,
  useDataProvider,
  useTranslate,
} from 'react-admin'
import ReactGA from 'react-ga'
import { GlobalHotKeys } from 'react-hotkeys'
import ReactJkMusicPlayer from 'navidrome-music-player'
import 'navidrome-music-player/assets/index.css'
import useCurrentTheme from '../themes/useCurrentTheme'
import config from '../config'
import useStyle from './styles'
import AudioTitle from './AudioTitle'
import LyricsCanvas from './LyricsCanvas'
import ArtworkCarousel from './ArtworkCarousel'
import {
  clearQueue,
  currentPlaying,
  refreshQueue,
  setPlayMode,
  setTranscodingProfile,
  setVolume,
  syncQueue,
} from '../actions'
import PlayerToolbar from './PlayerToolbar'
import { sendNotification } from '../utils'
import subsonic from '../subsonic'
import locale from './locale'
import { keyMap } from '../hotkeys'
import keyHandlers from './keyHandlers'
import { calculateGain } from '../utils/calculateReplayGain'
import { detectBrowserProfile, decisionService } from '../transcode'
import DesktopPlayerResizeHandle from './DesktopPlayerResizeHandle'
import {
  clearMediaSessionMetadata,
  setupMediaSessionActionHandlers,
  updateMediaSessionMetadata,
  updateMediaSessionPlaybackState,
  updateMediaSessionPositionState,
} from './mediaSession'

export const Player = () => {
  const theme = useCurrentTheme()
  const translate = useTranslate()
  const playerTheme = theme.player?.theme || 'dark'
  const dataProvider = useDataProvider()
  const playerState = useSelector((state) => state.player)
  const dispatch = useDispatch()
  const [currentTrackId, setCurrentTrackId] = useState(null)
  const [heartbeatTrackId, setHeartbeatTrackId] = useState(null)
  const lastPositionMsRef = useRef(0)
  const currentTrackIdRef = useRef(null)
  const stoppedRef = useRef(false)
  const [audioInstance, setAudioInstance] = useState(null)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [coverTarget, setCoverTarget] = useState(null)
  const isDesktop = useMediaQuery('(min-width:810px)')
  const isPhone = useMediaQuery('(max-width:767px)')
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const isMobilePlayer =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )

  const { authenticated } = useAuthState()

  // Keep a ref to playerState so the mount effect can read the latest value
  // without re-triggering on every queue/position change
  const playerStateRef = useRef(playerState)
  playerStateRef.current = playerState

  currentTrackIdRef.current = currentTrackId

  useInterval(
    () => {
      if (heartbeatTrackId && !stoppedRef.current) {
        subsonic.reportPlayback(
          heartbeatTrackId,
          lastPositionMsRef.current,
          'playing',
        )
      }
    },
    heartbeatTrackId ? config.playbackReportIntervalMs : null,
  )

  // Detect browser codec profile and eagerly resolve transcode URLs for the
  // persisted queue once on mount (e.g. after a browser refresh)
  useEffect(() => {
    const profile = detectBrowserProfile()
    decisionService.setProfile(profile)
    dispatch(setTranscodingProfile(profile))

    const state = playerStateRef.current
    const currentIdx = state.savedPlayIndex || 0
    const trackIds = state.queue
      .slice(currentIdx, currentIdx + 4)
      .filter((item) => !item.isRadio && item.trackId)
      .map((item) => item.trackId)

    if (trackIds.length === 0) {
      dispatch(refreshQueue())
      return
    }

    Promise.allSettled(
      trackIds.map((id) =>
        decisionService.resolveStreamUrl(id).then((url) => [id, url]),
      ),
    ).then((results) => {
      const resolvedUrls = {}
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          resolvedUrls[r.value[0]] = r.value[1]
        }
      })
      dispatch(refreshQueue(resolvedUrls))
    })
  }, [dispatch])

  // Pre-fetch transcode decisions for next 2-3 songs when queue or position changes
  useEffect(() => {
    if (!playerState.queue.length) return

    const currentIdx = playerState.savedPlayIndex || 0
    const nextSongIds = playerState.queue
      .slice(currentIdx + 1, currentIdx + 4)
      .filter((item) => !item.isRadio)
      .map((item) => item.trackId)

    if (nextSongIds.length > 0) {
      decisionService.prefetchDecisions(nextSongIds)
    }
  }, [playerState.queue, playerState.savedPlayIndex])

  const visible = authenticated && playerState.queue.length > 0
  const isRadio = playerState.current?.isRadio || false
  const currentCover =
    playerState.current?.cover ||
    playerState.queue[playerState.playIndex]?.cover ||
    ''
  const mobileTrack =
    (playerState.current?.uuid && playerState.current) ||
    playerState.queue[
      playerState.playIndex ?? playerState.savedPlayIndex ?? 0
    ] ||
    {}
  const classes = useStyle({
    isRadio,
    visible,
    isDesktop,
    coverUrl: currentCover,
    enableCoverAnimation: config.enableCoverAnimation,
  })
  const showNotifications = useSelector(
    (state) => state.settings.notifications || false,
  )
  const gainInfo = useSelector((state) => state.replayGain)
  const [context, setContext] = useState(null)
  const [gainNode, setGainNode] = useState(null)

  useEffect(() => {
    if (
      context === null &&
      audioInstance &&
      config.enableReplayGain &&
      'AudioContext' in window &&
      (gainInfo.gainMode === 'album' || gainInfo.gainMode === 'track')
    ) {
      const ctx = new AudioContext()
      // we need this to support radios in firefox
      audioInstance.crossOrigin = 'anonymous'
      const source = ctx.createMediaElementSource(audioInstance)
      const gain = ctx.createGain()

      source.connect(gain)
      gain.connect(ctx.destination)

      setContext(ctx)
      setGainNode(gain)
    }
  }, [audioInstance, context, gainInfo.gainMode])

  useEffect(() => {
    if (gainNode) {
      const current = playerState.current || {}
      const song = current.song || {}

      const numericGain = calculateGain(gainInfo, song)
      gainNode.gain.setValueAtTime(numericGain, context.currentTime)
    }
  }, [audioInstance, context, gainNode, playerState, gainInfo])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (playerState.current?.uuid && audioInstance && !audioInstance.paused) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePageHide = () => {
      if (currentTrackIdRef.current && !playerState.current?.isRadio) {
        stoppedRef.current = true
        try {
          subsonic.reportPlaybackKeepalive(
            currentTrackIdRef.current,
            lastPositionMsRef.current,
            'stopped',
          )
        } catch {
          // fetch/sendBeacon may throw; ignore
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [playerState, audioInstance])

  const defaultOptions = useMemo(
    () => ({
      theme: playerTheme,
      bounds: 'body',
      playMode: playerState.mode,
      mode: 'full',
      loadAudioErrorPlayNext: false,
      autoPlayInitLoadPlayList: true,
      clearPriorAudioLists: false,
      showDestroy: true,
      showDownload: false,
      showLyric: true,
      showReload: false,
      toggleMode: false,
      glassBg: isDesktop,
      showThemeSwitch: false,
      showMediaSession: false,
      preload: 'auto',
      restartCurrentOnPrev: false,
      quietUpdate: true,
      defaultPosition: {
        top: 300,
        left: 120,
      },
      renderAudioTitle: (audioInfo, isMobile) => (
        <AudioTitle
          audioInfo={audioInfo}
          gainInfo={gainInfo}
          isMobile={isMobile}
        />
      ),
      locale: locale(translate),
      sortableOptions: { delay: 200, delayOnTouchOnly: true },
    }),
    [gainInfo, isDesktop, playerTheme, translate, playerState.mode],
  )

  const options = useMemo(() => {
    const activeItem =
      (playerState.current?.uuid && playerState.current) ||
      playerState.queue[
        playerState.playIndex ?? playerState.savedPlayIndex ?? 0
      ] ||
      {}
    const currentTrackId =
      activeItem.trackId || activeItem.song?.id || activeItem.id
    const isRadio = activeItem.isRadio || activeItem.song?.isRadio || false

    return {
      ...defaultOptions,
      mode: 'full',
      audioLists: playerState.queue.map((item) => item),
      playIndex: playerState.playIndex,
      autoPlay:
        playerState.queue.length > 0 &&
        playerState.autoPlay !== false &&
        (playerState.clear || playerState.playIndex === 0),
      clearPriorAudioLists: playerState.clear,
      extendsContent: (
        <PlayerToolbar id={currentTrackId} isRadio={isRadio} />
      ),
      defaultVolume: isMobilePlayer ? 1 : playerState.volume,
      showMediaSession: false,
    }
  }, [
    playerState,
    defaultOptions,
    isMobilePlayer,
  ])

  useEffect(() => {
    if (!isPhone || !visible) setMobileExpanded(false)
  }, [isPhone, visible])

  const onAudioListsChange = useCallback(
    (_, audioLists, audioInfo) => dispatch(syncQueue(audioInfo, audioLists)),
    [dispatch],
  )

  const onAudioProgress = useCallback(
    (info) => {
      if (info.ended) {
        document.title = 'Navidrome'
      }
      if (!info.isRadio && info.currentTime != null) {
        lastPositionMsRef.current = Math.floor(info.currentTime * 1000)
      }
      if (audioInstance) {
        updateMediaSessionPositionState(audioInstance)
      }
    },
    [audioInstance],
  )

  const onAudioVolumeChange = useCallback(
    // sqrt to compensate for the logarithmic volume
    (volume) => dispatch(setVolume(Math.sqrt(volume))),
    [dispatch],
  )

  const onAudioPlay = useCallback(
    (info) => {
      if (context && context.state !== 'running') {
        context.resume()
      }

      dispatch(currentPlaying(info))
      updateMediaSessionMetadata(info)
      updateMediaSessionPlaybackState(true)
      if (audioInstance) {
        updateMediaSessionPositionState(audioInstance)
      }

      if (info.duration) {
        const song = info.song
        document.title = `${song.title} - ${song.artist} - Navidrome`
        if (!info.isRadio) {
          const posMs = Math.floor(info.currentTime * 1000)
          lastPositionMsRef.current = posMs
          const isNewTrack = info.trackId !== currentTrackId
          if (isNewTrack) {
            subsonic
              .reportPlayback(info.trackId, posMs, 'starting')
              .then(() =>
                subsonic.reportPlayback(info.trackId, posMs, 'playing'),
              )
            setCurrentTrackId(info.trackId)
          } else {
            subsonic.reportPlayback(info.trackId, posMs, 'playing')
          }
          setHeartbeatTrackId(info.trackId)
        }
        if (config.gaTrackingId) {
          ReactGA.event({
            category: 'Player',
            action: 'Play song',
            label: `${song.title} - ${song.artist}`,
          })
        }
        if (showNotifications) {
          sendNotification(
            song.title,
            `${song.artist} - ${song.album}`,
            info.cover,
          )
        }
      }
    },
    [context, dispatch, showNotifications, currentTrackId, audioInstance],
  )

  const onAudioPlayTrackChange = useCallback(() => {
    if (currentTrackId) {
      subsonic.reportPlayback(
        currentTrackId,
        lastPositionMsRef.current,
        'stopped',
      )
    }
    setHeartbeatTrackId(null)
    setCurrentTrackId(null)
    const activeItem =
      (playerState.current?.uuid && playerState.current) ||
      playerState.queue[playerState.playIndex ?? 0]
    if (activeItem) {
      updateMediaSessionMetadata(activeItem)
    }
  }, [currentTrackId, playerState])

  const onAudioPause = useCallback(
    (info) => {
      dispatch(currentPlaying(info))
      updateMediaSessionPlaybackState(false)
      if (audioInstance) {
        updateMediaSessionPositionState(audioInstance)
      }
      if (!info.isRadio && currentTrackId) {
        const posMs = Math.floor(info.currentTime * 1000)
        lastPositionMsRef.current = posMs
        subsonic.reportPlayback(currentTrackId, posMs, 'paused')
      }
      setHeartbeatTrackId(null)
    },
    [dispatch, currentTrackId, audioInstance],
  )

  const onAudioEnded = useCallback(
    (currentPlayId, audioLists, info) => {
      if (currentTrackId && !info.isRadio) {
        const posMs = Math.floor((info.duration || 0) * 1000)
        subsonic.reportPlayback(currentTrackId, posMs, 'stopped')
      }
      setHeartbeatTrackId(null)
      setCurrentTrackId(null)
      dispatch(currentPlaying(info))
      dataProvider
        .getOne('keepalive', { id: info.trackId })
        // eslint-disable-next-line no-console
        .catch((e) => console.log('Keepalive error:', e))
    },
    [dispatch, dataProvider, currentTrackId],
  )

  const onCoverClick = useCallback(() => {
    if (isPhone) {
      if (!mobileExpanded) {
        setMobileExpanded(true)
      }
      return
    }
    if (!audioInstance) return
    if (audioInstance.paused) {
      const playPromise = audioInstance.play?.()
      if (playPromise?.catch) playPromise.catch(() => {})
    } else {
      audioInstance.pause?.()
    }
  }, [isPhone, mobileExpanded, audioInstance])

  const onAudioError = useCallback(
    (error, currentPlayId, audioLists, audioInfo) => {
      // Invalidate all cached decisions — token may be stale
      decisionService.invalidateAll()

      // Pre-fetch decisions for upcoming songs with fresh tokens
      const currentIdx = playerState.queue.findIndex(
        (item) => item.uuid === currentPlayId,
      )
      if (currentIdx >= 0) {
        const nextSongIds = playerState.queue
          .slice(currentIdx + 1, currentIdx + 4)
          .filter((item) => !item.isRadio)
          .map((item) => item.trackId)
        if (nextSongIds.length > 0) {
          decisionService.prefetchDecisions(nextSongIds)
        }
      }
    },
    [playerState.queue],
  )

  const onBeforeDestroy = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (currentTrackId && !playerStateRef.current?.current?.isRadio) {
        subsonic.reportPlayback(
          currentTrackId,
          lastPositionMsRef.current,
          'stopped',
        )
      }
      setHeartbeatTrackId(null)
      setCurrentTrackId(null)
      clearMediaSessionMetadata()
      dispatch(clearQueue())
      reject()
    })
  }, [dispatch, currentTrackId])

  if (!visible) {
    document.title = 'Navidrome'
  }

  const handlers = useMemo(
    () => keyHandlers(audioInstance, playerState),
    [audioInstance, playerState],
  )

  useEffect(() => {
    if (isMobilePlayer && audioInstance) {
      audioInstance.volume = 1
    }
  }, [isMobilePlayer, audioInstance])

  // MediaSession Action Handlers and Metadata synchronization for Android & iOS notification center / lock screen
  useEffect(() => {
    if (!audioInstance) return undefined

    setupMediaSessionActionHandlers({
      onPlay: () => {
        if (typeof audioInstance.togglePlay === 'function') {
          audioInstance.togglePlay()
        } else {
          audioInstance.play?.()
        }
      },
      onPause: () => {
        if (typeof audioInstance.togglePlay === 'function') {
          audioInstance.togglePlay()
        } else {
          audioInstance.pause?.()
        }
      },
      onPrev: () => {
        if (typeof audioInstance.playPrev === 'function') {
          audioInstance.playPrev()
        }
      },
      onNext: () => {
        if (typeof audioInstance.playNext === 'function') {
          audioInstance.playNext()
        }
      },
      onSeekTo: (details) => {
        if (details.seekTime != null && Number.isFinite(details.seekTime)) {
          audioInstance.currentTime = details.seekTime
          updateMediaSessionPositionState(audioInstance)
        }
      },
      onSeekBackward: (details) => {
        const offset = details.seekOffset || 10
        audioInstance.currentTime = Math.max(0, audioInstance.currentTime - offset)
        updateMediaSessionPositionState(audioInstance)
      },
      onSeekForward: (details) => {
        const offset = details.seekOffset || 10
        audioInstance.currentTime = Math.min(
          audioInstance.duration || Infinity,
          audioInstance.currentTime + offset,
        )
        updateMediaSessionPositionState(audioInstance)
      },
    })

    return () => {
      clearMediaSessionMetadata()
    }
  }, [audioInstance])

  useEffect(() => {
    if (playerState.current?.uuid || playerState.current?.song?.id) {
      updateMediaSessionMetadata(playerState.current)
    }
  }, [playerState])

  // Intercept all .play-btn clicks/touches to ensure synchronous, instantaneous execution on the 1st tap/click
  useEffect(() => {
    let lastPlayBtnTime = 0

    const handleGlobalPlayBtn = (e) => {
      const playBtn = e.target.closest?.('.play-btn')
      if (!playBtn || !audioInstance) return

      const now = Date.now()
      if (now - lastPlayBtnTime < 250) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      lastPlayBtnTime = now

      e.preventDefault()
      e.stopPropagation()

      if (audioInstance.paused) {
        const playPromise = audioInstance.play?.()
        if (playPromise?.catch) playPromise.catch(() => {})
      } else {
        audioInstance.pause?.()
      }
    }

    window.addEventListener('click', handleGlobalPlayBtn, true)
    window.addEventListener('touchend', handleGlobalPlayBtn, true)

    return () => {
      window.removeEventListener('click', handleGlobalPlayBtn, true)
      window.removeEventListener('touchend', handleGlobalPlayBtn, true)
    }
  }, [audioInstance])

  // Report every seek (including programmatic ones the library does not surface
  // via onAudioSeeked, e.g. restartCurrentOnPrev). Debounce coalesces drag
  // bursts into one report at the final position.
  useEffect(() => {
    if (!audioInstance) return
    let timer = null
    const flush = () => {
      timer = null
      if (
        !currentTrackIdRef.current ||
        playerStateRef.current?.current?.isRadio
      ) {
        return
      }
      const posMs = Math.floor((audioInstance.currentTime || 0) * 1000)
      const state = audioInstance.paused ? 'paused' : 'playing'
      subsonic.reportPlayback(currentTrackIdRef.current, posMs, state)
    }
    const handleSeeked = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, 250)
    }
    audioInstance.addEventListener('seeked', handleSeeked)
    return () => {
      if (timer) clearTimeout(timer)
      audioInstance.removeEventListener('seeked', handleSeeked)
    }
  }, [audioInstance])

  // Sync mobile expanded/collapsed classes
  useEffect(() => {
    if (!isPhone || !visible) return undefined
    const el = document.querySelector('.react-jinke-music-player-mobile')
    if (!el) return undefined

    if (mobileExpanded) {
      el.classList.add('nd-mobile-expanded')
      el.classList.remove('nd-mobile-collapsed')
    } else {
      el.classList.add('nd-mobile-collapsed')
      el.classList.remove('nd-mobile-expanded')
    }
    el.classList.remove('nd-mobile-dragging')
    el.style.transform = ''
  }, [isPhone, visible, mobileExpanded])

  // Clean Mobile swipe & tap gesture handler
  useEffect(() => {
    if (!visible || !isPhone) return undefined

    let startY = 0
    let startX = 0
    let startTime = 0
    let isDragging = false
    let wasExpanded = mobileExpanded

    const getMobileEl = () =>
      document.querySelector('.react-jinke-music-player-mobile')

    const handlePointerStart = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX
      const clientY = e.clientY ?? e.touches?.[0]?.clientY
      if (clientX == null || clientY == null) return

      const target = e.target
      const el = getMobileEl()
      if (!el) return
      const container = target?.closest?.('.react-jinke-music-player-mobile')
      if (!container) return

      if (mobileExpanded) {
        const isHeaderOrTop =
          target?.closest?.('.react-jinke-music-player-mobile-header') ||
          clientY < 90

        if (!isHeaderOrTop) {
          const scrollable = target?.closest?.(
            '.audio-lists-panel-content, .music-player-lyric, .nd-lyrics-canvas',
          )
          if (scrollable && scrollable.scrollTop > 5) return

          if (
            target?.closest?.('.rc-slider') ||
            target?.closest?.('input[type="range"]') ||
            target?.closest?.('.MuiIconButton-root') ||
            target?.closest?.('.player-corner-menu') ||
            target?.closest?.('.lyric-btn') ||
            target?.closest?.('.loop-btn') ||
            target?.closest?.('.play-btn') ||
            target?.closest?.('.prev-audio') ||
            target?.closest?.('.next-audio')
          ) {
            return
          }
        }
      } else {
        if (
          target?.closest?.('.play-btn') ||
          target?.closest?.('.loading-icon')
        ) {
          return
        }
      }

      startY = clientY
      startX = clientX
      startTime = Date.now()
      wasExpanded = mobileExpanded
      isDragging = false
    }

    const handlePointerMove = (e) => {
      if (startY <= 0) return
      const clientX = e.clientX ?? e.touches?.[0]?.clientX
      const clientY = e.clientY ?? e.touches?.[0]?.clientY
      if (clientX == null || clientY == null) return

      const deltaY = clientY - startY
      const deltaX = clientX - startX
      const el = getMobileEl()
      if (!el) return

      if (wasExpanded) {
        // Pulling down from full screen
        if (deltaY > 6 && deltaY > Math.abs(deltaX) * 0.6) {
          if (!isDragging) {
            isDragging = true
            el.classList.add('nd-mobile-dragging')
          }
          const scale = Math.max(0.88, 1 - (deltaY / window.innerHeight) * 0.18)
          el.style.transform = `translate3d(0, ${deltaY}px, 0) scale(${scale})`
        }
      } else {
        // Swiping up from mini bar
        if (deltaY < -6 && Math.abs(deltaY) > Math.abs(deltaX) * 0.6) {
          if (!isDragging) {
            isDragging = true
            el.classList.add('nd-mobile-dragging')
          }
          el.style.transform = `translate3d(0, ${deltaY * 0.75}px, 0)`
        }
      }
    }

    const handlePointerEnd = (e) => {
      if (startY <= 0) return
      const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? startX
      const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? startY
      const el = getMobileEl()

      const deltaY = clientY - startY
      const deltaX = clientX - startX
      const elapsed = Date.now() - startTime
      const velocityY = deltaY / Math.max(elapsed, 1)

      if (el) {
        el.classList.remove('nd-mobile-dragging')
        el.style.transform = ''
      }

      if (isDragging) {
        if (wasExpanded) {
          if (deltaY > 50 || velocityY > 0.25) {
            setMobileExpanded(false)
          }
        } else {
          if (deltaY < -35 || velocityY < -0.25) {
            setMobileExpanded(true)
          }
        }
      } else if (Math.abs(deltaY) < 12 && Math.abs(deltaX) < 12) {
        // Clean tap/click toggle
        const target = e.target
        if (!wasExpanded) {
          const isPlayBtn =
            target?.closest?.('.play-btn') ||
            target?.closest?.('.loading-icon')
          if (!isPlayBtn) {
            setMobileExpanded(true)
          }
        } else {
          const isHeaderClick =
            target?.closest?.('.react-jinke-music-player-mobile-header') ||
            target?.closest?.('.react-jinke-music-player-mobile-header-right')
          const isTopArea = clientY < 80
          if (isHeaderClick || isTopArea) {
            setMobileExpanded(false)
          }
        }
      }

      startY = 0
      startX = 0
      isDragging = false
    }

    window.addEventListener('touchstart', handlePointerStart, { passive: true })
    window.addEventListener('touchmove', handlePointerMove, { passive: true })
    window.addEventListener('touchend', handlePointerEnd, { passive: true })

    window.addEventListener('pointerdown', handlePointerStart, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handlePointerStart)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerEnd)
      window.removeEventListener('pointerdown', handlePointerStart)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)

      const cleanupEl = getMobileEl()
      if (cleanupEl) {
        cleanupEl.classList.remove('nd-mobile-dragging')
        cleanupEl.style.transform = ''
      }
    }
  }, [visible, isPhone, mobileExpanded])

  // Track target cover container element dynamically
  useEffect(() => {
    if (!visible) {
      setCoverTarget(null)
      return undefined
    }

    const updateCoverTarget = () => {
      const mobileCover = document.querySelector(
        '.react-jinke-music-player-mobile-cover',
      )
      const desktopCover = document.querySelector(
        '.music-player-panel .panel-content .img-content',
      )
      const target = isPhone ? mobileCover : desktopCover
      setCoverTarget(target)
    }

    updateCoverTarget()
    const timer = setInterval(updateCoverTarget, 400)
    return () => clearInterval(timer)
  }, [visible, isPhone])

  // Listen to toolbar lyrics button clicks/touches to toggle lyrics
  useEffect(() => {
    let lastLyricTime = 0

    const handleLyricToggle = (e) => {
      const lyricBtn = e.target?.closest?.('.lyric-btn')
      if (!lyricBtn) return

      const now = Date.now()
      if (now - lastLyricTime < 250) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      lastLyricTime = now

      e.preventDefault()
      e.stopPropagation()
      setLyricsOpen((prev) => !prev)
    }

    window.addEventListener('click', handleLyricToggle, true)
    window.addEventListener('touchend', handleLyricToggle, true)

    return () => {
      window.removeEventListener('click', handleLyricToggle, true)
      window.removeEventListener('touchend', handleLyricToggle, true)
    }
  }, [])

  // Sync active class on lyric buttons
  useEffect(() => {
    const btns = document.querySelectorAll('.lyric-btn')
    btns.forEach((btn) => {
      if (lyricsOpen) {
        btn.classList.add('lyric-btn-active')
      } else {
        btn.classList.remove('lyric-btn-active')
      }
    })
  }, [lyricsOpen])

  return (
    <ThemeProvider theme={createTheme(theme)}>
      <>
        <div className={classes.ambientBackdrop} aria-hidden="true" />
        <DesktopPlayerResizeHandle visible={visible && isDesktop} />
        <ReactJkMusicPlayer
          {...options}
          className={classes.player}
          onAudioListsChange={onAudioListsChange}
          onAudioVolumeChange={onAudioVolumeChange}
          onAudioProgress={onAudioProgress}
          onAudioPlay={onAudioPlay}
          onAudioPlayTrackChange={onAudioPlayTrackChange}
          onAudioPause={onAudioPause}
          onPlayModeChange={(mode) => dispatch(setPlayMode(mode))}
          onAudioEnded={onAudioEnded}
          onCoverClick={onCoverClick}
          onAudioError={onAudioError}
          onBeforeDestroy={onBeforeDestroy}
          getAudioInstance={setAudioInstance}
        />
        {lyricsOpen &&
          coverTarget &&
          createPortal(
            <LyricsCanvas
              audio={audioInstance}
              lyric={
                mobileTrack.lyric ||
                playerState.current?.lyric ||
                playerState.current?.song?.lyrics ||
                ''
              }
              onClose={() => setLyricsOpen(false)}
            />,
            coverTarget,
          )}
        {!lyricsOpen &&
          coverTarget &&
          createPortal(
            <ArtworkCarousel
              queue={playerState.queue}
              playIndex={playerState.playIndex ?? playerState.savedPlayIndex ?? 0}
              currentTrack={playerState.current || mobileTrack}
              playMode={playerState.mode}
              audioInstance={audioInstance}
            />,
            coverTarget,
          )}
        <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges />
      </>
    </ThemeProvider>
  )
}

export default Player
