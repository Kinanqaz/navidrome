import React from 'react'
import { useMediaQuery } from '@material-ui/core'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { QualityInfo } from '../common'
import { decisionService } from '../transcode'
import useStyle from './styles'

const AudioTitle = React.memo(({ audioInfo, gainInfo, isMobile }) => {
  const classes = useStyle()
  const className = classes.audioTitle
  const isDesktop = useMediaQuery('(min-width:810px)')

  const song = audioInfo.song

  if (!song) {
    return ''
  }

  const qi = {
    suffix: song.suffix,
    bitRate: song.bitRate,
    rgAlbumGain: song.rgAlbumGain,
    rgAlbumPeak: song.rgAlbumPeak,
    rgTrackGain: song.rgTrackGain,
    rgTrackPeak: song.rgTrackPeak,
  }

  const decision = decisionService.getCachedDecision(audioInfo.trackId)
  const transcodeProps = decision
    ? {
        transcodeStream: decision.transcodeStream || null,
        isDirectPlay: decision.canDirectPlay,
      }
    : {}

  const subtitle = song.tags?.['subtitle']
  const title = song.title + (subtitle ? ` (${subtitle})` : '')

  const linkTo = song.playlistId
    ? `/playlist/${song.playlistId}/show`
    : `/album/${song.albumId}/show`

  if (isMobile) {
    return (
      <div className={className}>
        <span>
          <span className={clsx(classes.songTitle, 'songTitle')}>{title}</span>
        </span>
        <span className={classes.songInfo}>
          <span className={'songArtist'}>{song.artist}</span>
        </span>
      </div>
    )
  }

  return (
    <Link to={linkTo} className={className}>
      <span>
        <span className={clsx(classes.songTitle, 'songTitle')}>{title}</span>
        {isDesktop && (
          <QualityInfo
            record={qi}
            className={classes.qualityInfo}
            {...gainInfo}
            {...transcodeProps}
          />
        )}
      </span>
      <span className={classes.songInfo}>
        <span className={'songArtist'}>{song.artist}</span>
      </span>
    </Link>
  )
})

AudioTitle.displayName = 'AudioTitle'

export default AudioTitle
