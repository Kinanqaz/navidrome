import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInterval } from '../common'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'
import {
  createMuiTheme,
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
      showMediaSession: true,
      restartCurrentOnPrev: true,
      quietUpdate: true,
      defaultPosition: {
        top: 300,
        left: 120,
      },
      volumeFade: { fadeIn: 200, fadeOut: 200 },
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
      showMediaSession: !isRadio,
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

  const onAudioProgress = useCallback((info) => {
    if (info.ended) {
      document.title = 'Navidrome'
    }
    if (!info.isRadio && info.currentTime != null) {
      lastPositionMsRef.current = Math.floor(info.currentTime * 1000)
    }
  }, [])

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
    [context, dispatch, showNotifications, currentTrackId],
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
  }, [currentTrackId])

  const onAudioPause = useCallback(
    (info) => {
      dispatch(currentPlaying(info))
      if (!info.isRadio && currentTrackId) {
        const posMs = Math.floor(info.currentTime * 1000)
        lastPositionMsRef.current = posMs
        subsonic.reportPlayback(currentTrackId, posMs, 'paused')
      }
      setHeartbeatTrackId(null)
    },
    [dispatch, currentTrackId],
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

  const onCoverClick = useCallback((mode, audioLists, audioInfo) => {
    if (mode === 'full' && audioInfo?.song?.albumId) {
      window.location.href = `#/album/${audioInfo.song.albumId}/show`
    }
  }, [])

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
    if (el) {
      el.style.transition =
        'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease'
      el.style.transform = 'translate3d(0, 100%, 0)'
      el.style.opacity = '0'
      setTimeout(() => {
        setMobileExpanded(false)
        el.style.transform = ''
        el.style.transition = ''
        el.style.opacity = ''
      }, 260)
    } else {
      setMobileExpanded(false)
    }
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
      if (
        target?.closest?.('.rc-slider') ||
        target?.closest?.('.rc-slider-handle') ||
        target?.closest?.('.rc-slider-rail') ||
        target?.closest?.('.rc-slider-track') ||
        target?.closest?.('.rc-slider-step') ||
        target?.closest?.('.react-jinke-music-player-mobile-progress') ||
        target?.closest?.('.progress-bar-content') ||
        target?.closest?.('.progress-bar') ||
        target?.closest?.('.audio-main') ||
        target?.closest?.('.mobile-volume-control') ||
        target?.closest?.('.react-jinke-music-player-mobile-toggle') ||
        target?.closest?.('.react-jinke-music-player-mobile-operation') ||
        target?.closest?.('.player-content') ||
        target?.closest?.('button') ||
        target?.closest?.('.MuiButtonBase-root') ||
        target?.closest?.('.MuiIconButton-root') ||
        target?.closest?.('input[type="range"]')
      ) {
        startY = -1
        return
      }

      const scrollable = target?.closest?.(
        '.audio-lists-panel-content, .music-player-lyric',
      )
      if (scrollable && scrollable.scrollTop > 5) {
        startY = -1
      }
    }

    const handleTouchMove = (e) => {
      if (startY < 0 || e.touches.length !== 1) return
      const touch = e.touches[0]
      const deltaY = touch.clientY - startY
      const deltaX = touch.clientX - startX

      if (deltaY > 0 && deltaY > Math.abs(deltaX) * 0.75) {
        const el = getMobileEl()
        if (el) {
          el.style.transition = 'none'
          el.style.transform = `translate3d(0, ${deltaY}px, 0)`
          const opacityProgress = Math.min(deltaY / 380, 1)
          el.style.opacity = `${1 - opacityProgress * 0.45}`
        }
      }
    }

    const handleTouchEnd = (e) => {
      if (startY < 0) return
      const touch = e.changedTouches?.[0]
      if (!touch) return

      const deltaY = touch.clientY - startY
      const deltaX = touch.clientX - startX
      const elapsed = Date.now() - startTime
      const velocityY = deltaY / Math.max(elapsed, 1)
      const el = getMobileEl()

      if (
        (deltaY >= 50 || (deltaY >= 20 && velocityY >= 0.25)) &&
        deltaY > Math.abs(deltaX) * 0.75
      ) {
        dismissMobilePlayer()
      } else if (el && deltaY > 0) {
        el.style.transition =
          'transform 200ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease'
        el.style.transform = 'translate3d(0, 0, 0)'
        el.style.opacity = '1'
      }

      startY = -1
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      if (mobileEl) {
        mobileEl.style.transform = ''
        mobileEl.style.transition = ''
        mobileEl.style.opacity = ''
      }
    }
  }, [visible, isPhone, mobileExpanded, dismissMobilePlayer])

  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
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
      {visible && isPhone && mobileExpanded && (
        <div
          className={classes.mobileDragHandle}
          onClick={dismissMobilePlayer}
          role="button"
          tabIndex={0}
          aria-label="Collapse full-screen player"
        >
          <span className={classes.mobileDragPill} />
        </div>
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
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges />
    </ThemeProvider>
  )
}

export default Player
