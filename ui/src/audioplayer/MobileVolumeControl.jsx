import React, { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import VolumeDownIcon from '@material-ui/icons/VolumeDown'
import VolumeMuteIcon from '@material-ui/icons/VolumeMute'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import { setVolume } from '../actions'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 'min(88vw, 380px)',
    margin: '0 auto',
    padding: '0 4px',
    boxSizing: 'border-box',
    gap: 10,
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.75)',
    transition: 'color 0.2s ease, transform 0.15s ease',
    '&:hover': {
      color: '#ffffff',
      transform: 'scale(1.1)',
    },
    '&:active': {
      transform: 'scale(0.92)',
    },
    '& svg': {
      fontSize: 20,
    },
  },
  maxIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.45)',
    pointerEvents: 'none',
    '& svg': {
      fontSize: 20,
    },
  },
  sliderContainer: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    height: 36,
    touchAction: 'none',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: 6,
    borderRadius: 3,
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.85), #ffffff)',
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.9)',
    pointerEvents: 'none',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  thumbActive: {
    transform: 'translate(-50%, -50%) scale(1.25)',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.6), 0 0 4px rgba(255, 255, 255, 1)',
  },
  rangeInput: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    margin: 0,
    padding: 0,
    cursor: 'pointer',
    zIndex: 2,
  },
}))

const MobileVolumeControl = ({ className }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const rawVolume = useSelector((state) => state?.player?.volume)
  const volume = typeof rawVolume === 'number' ? rawVolume : 1
  const prevVolumeRef = useRef(volume > 0 ? volume : 1)
  const [isDragging, setIsDragging] = useState(false)

  const handleVolumeChange = useCallback(
    (e) => {
      const val = parseFloat(e.target.value)
      const audio = document.querySelector('audio.music-player-audio')
      if (audio) {
        audio.volume = val * val
      }
      dispatch(setVolume(val))
      if (val > 0) {
        prevVolumeRef.current = val
      }
    },
    [dispatch],
  )

  const handleToggleMute = useCallback(() => {
    const audio = document.querySelector('audio.music-player-audio')
    if (volume > 0) {
      prevVolumeRef.current = volume
      if (audio) audio.volume = 0
      dispatch(setVolume(0))
    } else {
      const restore = prevVolumeRef.current || 1
      if (audio) audio.volume = restore * restore
      dispatch(setVolume(restore))
    }
  }, [dispatch, volume])

  const renderIcon = () => {
    if (volume <= 0) return <VolumeOffIcon />
    if (volume < 0.3) return <VolumeMuteIcon />
    if (volume < 0.7) return <VolumeDownIcon />
    return <VolumeDownIcon />
  }

  const fillPercent = Math.round(volume * 100)

  return (
    <div className={clsx(classes.root, className, 'mobile-volume-control')}>
      <button
        type="button"
        className={classes.iconButton}
        onClick={handleToggleMute}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {renderIcon()}
      </button>
      <div className={classes.sliderContainer}>
        <div className={classes.trackBg} />
        <div
          className={classes.trackFill}
          style={{ width: `${fillPercent}%` }}
        />
        <div
          className={clsx(classes.thumb, isDragging && classes.thumbActive)}
          style={{ left: `${fillPercent}%` }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          className={classes.rangeInput}
          aria-label="Volume"
        />
      </div>
      <div className={classes.maxIcon} aria-hidden="true">
        <VolumeUpIcon />
      </div>
    </div>
  )
}

export default MobileVolumeControl
