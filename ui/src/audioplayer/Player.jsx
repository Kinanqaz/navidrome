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
import MobilePlayerBar from './MobilePlayerBar'
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
      mode: isPhone && !mobileExpanded ? 'mini' : 'full',
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
    isPhone,
    mobileExpanded,
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
    if (!audioInstance) return
    if (audioInstance.paused) {
      const playPromise = audioInstance.play?.()
      if (playPromise?.catch) playPromise.catch(() => {})
    } else {
      audioInstance.pause?.()
    }
  }, [audioInstance])

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

  const expandTimeRef = useRef(0)

  const openMobilePlayer = useCallback(() => {
    expandTimeRef.current = Date.now()
    setMobileExpanded(true)
  }, [])

  const dismissMobilePlayer = useCallback(() => {
    if (Date.now() - expandTimeRef.current < 400) return
    const el = document.querySelector('.react-jinke-music-player-mobile')
    const transitionStr =
      'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease'

    if (el) {
      el.style.transition = transitionStr
      el.style.transform = 'translate3d(0, 100%, 0)'
      el.style.opacity = '0'
    }

    setTimeout(() => {
      setMobileExpanded(false)
      if (el) {
        el.style.transform = ''
        el.style.transition = ''
        el.style.opacity = ''
      }
    }, 250)
  }, [])

  useEffect(() => {
    if (!visible || !isPhone || !mobileExpanded) return undefined

    const initialEl = document.querySelector('.react-jinke-music-player-mobile')
    if (initialEl) {
      initialEl.style.transform = ''
      initialEl.style.transition = ''
      initialEl.style.opacity = ''
    }

    let startY = 0
    let startX = 0
    let startTime = 0
    let mobileEl = null

    const getMobileEl = () => {
      if (!mobileEl || !mobileEl.isConnected) {
        mobileEl = document.querySelector('.react-jinke-music-player-mobile')
      }
      return mobileEl
    }

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      startY = touch.clientY
      startX = touch.clientX
      startTime = Date.now()

      const target = e.target
      // Exclude interactive buttons, toolbars, menus, and scrubbing sliders from gesture dragging
      if (
        target?.closest?.('button') ||
        target?.closest?.('a') ||
        target?.closest?.('input') ||
        target?.closest?.('select') ||
        target?.closest?.('[role="button"]') ||
        target?.closest?.('.MuiButtonBase-root') ||
        target?.closest?.('.MuiIconButton-root') ||
        target?.closest?.('.react-jinke-music-player-mobile-operation') ||
        target?.closest?.('.react-jinke-music-player-mobile-toggle') ||
        target?.closest?.('.player-corner-menu') ||
        target?.closest?.('.lyric-btn') ||
        target?.closest?.('.loop-btn') ||
        target?.closest?.('.play-btn') ||
        target?.closest?.('.prev-audio') ||
        target?.closest?.('.next-audio') ||
        target?.closest?.('.destroy-btn') ||
        target?.closest?.('.reload-btn') ||
        target?.closest?.('.rc-slider') ||
        target?.closest?.('.rc-slider-handle') ||
        target?.closest?.('.rc-slider-rail') ||
        target?.closest?.('.rc-slider-track') ||
        target?.closest?.('.progress-bar-content') ||
        target?.closest?.('.progress-bar') ||
        target?.closest?.('input[type="range"]')
      ) {
        startY = -1
        startX = -1
        return
      }

      const scrollable = target?.closest?.(
        '.audio-lists-panel-content, .music-player-lyric, .nd-lyrics-canvas',
      )
      if (scrollable && scrollable.scrollTop > 5) {
        startY = -1
        startX = -1
      }
    }

    const handleTouchMove = (e) => {
      if (startY < 0 || e.touches.length !== 1) return
      const touch = e.touches[0]
      const deltaY = touch.clientY - startY
      const deltaX = touch.clientX - startX

      if (deltaY > 10 && deltaY > Math.abs(deltaX) * 0.75) {
        const el = getMobileEl()
        const opacityProgress = Math.min(deltaY / 380, 1)

        if (el) {
          el.style.transition = 'none'
          el.style.transform = `translate3d(0, ${deltaY}px, 0)`
          el.style.opacity = `${1 - opacityProgress * 0.45}`
        }
      }
    }

    const handleTouchEnd = (e) => {
      if (startY < 0 && startX < 0) return
      const touch = e.changedTouches?.[0]
      if (!touch) return

      const deltaY = touch.clientY - startY
      const deltaX = touch.clientX - startX
      const elapsed = Date.now() - startTime
      const velocityY = deltaY / Math.max(elapsed, 1)
      const velocityX = deltaX / Math.max(elapsed, 1)
      const el = getMobileEl()

      // Horizontal swipe to change songs (left = next, right = prev)
      if (
        (Math.abs(deltaX) >= 45 || (Math.abs(deltaX) >= 25 && Math.abs(velocityX) >= 0.25)) &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.2
      ) {
        if (deltaX < 0) {
          audioInstance?.playNext?.()
        } else {
          audioInstance?.playPrev?.()
        }
      } else if (
        (deltaY >= 40 || (deltaY >= 20 && velocityY >= 0.22)) &&
        deltaY > Math.abs(deltaX) * 0.75
      ) {
        dismissMobilePlayer()
      } else if (el && deltaY > 0) {
        const snapTransition =
          'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease'
        el.style.transition = snapTransition
        el.style.transform = 'translate3d(0, 0, 0)'
        el.style.opacity = '1'
      }

      startY = -1
      startX = -1
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      if (initialEl) {
        initialEl.style.transform = ''
        initialEl.style.transition = ''
        initialEl.style.opacity = ''
      }
    }
  }, [visible, isPhone, mobileExpanded, dismissMobilePlayer, audioInstance])

  // Artwork swipe gesture with smooth animated transitions across mobile and desktop
  useEffect(() => {
    if (!visible || !audioInstance || lyricsOpen) return undefined

    let startX = 0
    let startY = 0
    let startTime = 0
    let isArtworkTouch = false
    let activeCoverEl = null

    const getCoverElement = (target) => {
      return (
        target?.closest?.('.react-jinke-music-player-mobile-cover') ||
        target?.closest?.('.img-content') ||
        document.querySelector('.react-jinke-music-player-mobile-cover') ||
        document.querySelector('.music-player-panel .panel-content .img-content')
      )
    }

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const target = e.target
      const isCover =
        target?.closest?.('.react-jinke-music-player-mobile-cover') ||
        target?.closest?.('.img-content') ||
        target?.closest?.('.img-rotate')

      if (isCover) {
        startX = touch.clientX
        startY = touch.clientY
        startTime = Date.now()
        isArtworkTouch = true
        activeCoverEl = getCoverElement(target)
      } else {
        isArtworkTouch = false
        activeCoverEl = null
      }
    }

    const onTouchMove = (e) => {
      if (!isArtworkTouch || !activeCoverEl || e.touches.length !== 1) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
        const progress = Math.min(Math.abs(deltaX) / 360, 0.4)
        activeCoverEl.style.transition = 'none'
        activeCoverEl.style.transform = `translate3d(${deltaX * 0.85}px, 0, 0) scale(${1 - progress * 0.15}) rotate(${deltaX * 0.02}deg)`
        activeCoverEl.style.opacity = `${1 - progress}`
      }
    }

    const onTouchEnd = (e) => {
      if (!isArtworkTouch || !activeCoverEl) return
      const touch = e.changedTouches?.[0]
      if (!touch) return

      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const elapsed = Date.now() - startTime
      const velocityX = deltaX / Math.max(elapsed, 1)

      const el = activeCoverEl
      const passed =
        (Math.abs(deltaX) >= 45 || (Math.abs(deltaX) >= 20 && Math.abs(velocityX) >= 0.22)) &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.1

      if (passed) {
        const direction = deltaX > 0 ? 1 : -1
        el.style.transition =
          'transform 200ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 180ms ease'
        el.style.transform = `translate3d(${direction * 110}%, 0, 0) scale(0.9) rotate(${direction * 4}deg)`
        el.style.opacity = '0'

        setTimeout(() => {
          if (direction < 0) {
            audioInstance.playNext?.()
          } else {
            audioInstance.playPrev?.()
          }

          el.style.transition = 'none'
          el.style.transform = `translate3d(${-direction * 90}%, 0, 0) scale(0.92) rotate(${-direction * 3}deg)`
          el.style.opacity = '0'

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.transition =
                'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease'
              el.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
              el.style.opacity = '1'
            })
          })
        }, 190)
      } else {
        el.style.transition =
          'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease'
        el.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
        el.style.opacity = '1'
      }

      isArtworkTouch = false
      activeCoverEl = null
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      if (activeCoverEl) {
        activeCoverEl.style.transform = ''
        activeCoverEl.style.transition = ''
        activeCoverEl.style.opacity = ''
      }
    }
  }, [visible, audioInstance, lyricsOpen])

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
  }, [visible, isPhone, mobileExpanded])

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
        {visible && isPhone && !mobileExpanded && (
          <MobilePlayerBar
            audio={audioInstance}
            cover={mobileTrack.cover}
            title={mobileTrack.name || mobileTrack.song?.title}
            artist={mobileTrack.singer || mobileTrack.song?.artist}
            onOpen={openMobilePlayer}
          />
        )}
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
        <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges />
      </>
    </ThemeProvider>
  )
}

export default Player
