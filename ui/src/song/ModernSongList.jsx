import React, { useMemo } from 'react'
import {
  Box,
  Checkbox,
  Chip,
  LinearProgress,
  Paper,
  Typography,
} from '@material-ui/core'
import { alpha, makeStyles } from '@material-ui/core/styles'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import { useListContext } from 'react-admin'
import { useDispatch, useSelector } from 'react-redux'
import { Artwork } from '../common/Artwork'
import { DurationField, SongContextMenu } from '../common'
import { setTrack } from '../actions'

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(2),
    background: alpha(theme.palette.background.paper, 0.9),
    boxShadow: 'none',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    padding: theme.spacing(0.75, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  summaryLabel: {
    color: theme.palette.text.secondary,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  row: {
    display: 'grid',
    gridTemplateColumns:
      '34px 44px minmax(160px, 1.5fr) minmax(120px, 1fr) minmax(90px, 0.7fr) 54px 36px',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    minHeight: 62,
    padding: theme.spacing(0.75, 1.25),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
    cursor: 'pointer',
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.shortest,
    }),
    '&:last-child': { borderBottom: 0 },
    '&:hover': { background: alpha(theme.palette.primary.main, 0.06) },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: -2,
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '34px 40px minmax(0, 1fr) 46px 34px',
      gap: theme.spacing(1),
      minHeight: 58,
      padding: theme.spacing(0.75, 1),
    },
  },
  playing: {
    background: alpha(theme.palette.primary.main, 0.11),
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: theme.spacing(0.75),
    background: theme.palette.action.hover,
    [theme.breakpoints.down('sm')]: { width: 38, height: 38 },
  },
  titleCell: { minWidth: 0 },
  title: {
    overflow: 'hidden',
    fontWeight: 700,
    lineHeight: 1.35,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  secondary: {
    overflow: 'hidden',
    color: theme.palette.text.secondary,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  desktopOnly: { [theme.breakpoints.down('sm')]: { display: 'none' } },
  playingIcon: {
    marginRight: theme.spacing(0.5),
    color: theme.palette.primary.main,
    fontSize: 15,
    verticalAlign: 'text-bottom',
  },
  facetChip: {
    maxWidth: '100%',
    height: 24,
    background: theme.palette.action.hover,
  },
  menuFallback: { color: theme.palette.text.secondary },
  empty: { padding: theme.spacing(6, 2), textAlign: 'center' },
}))

const firstFacet = (song) => song.tags?.mood?.[0] || song.genre || ''

export const ModernTrackRows = ({
  songs,
  currentSongId,
  onPlay,
  selectedIds = [],
  onToggleSelection = () => undefined,
}) => {
  const classes = useStyles()

  return songs.map((song) => {
    const playing = currentSongId === song.id
    const facet = firstFacet(song)
    return (
      <div
        className={`${classes.row} ${playing ? classes.playing : ''}`}
        key={song.id}
        role="button"
        tabIndex={0}
        aria-label={`Play ${song.title}`}
        aria-current={playing ? 'true' : undefined}
        onClick={() => onPlay(song)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onPlay(song)
          }
        }}
      >
        <Box onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selectedIds.includes(song.id)}
            color="primary"
            inputProps={{ 'aria-label': `Select ${song.title}` }}
            onChange={() => onToggleSelection(song.id)}
          />
        </Box>
        <Artwork
          className={classes.artwork}
          record={song}
          size={84}
          square
          title={song.title}
        />
        <div className={classes.titleCell}>
          <Typography className={classes.title} variant="body2">
            {playing && <EqualizerIcon className={classes.playingIcon} />}
            {song.title}
          </Typography>
          <Typography className={classes.secondary} variant="caption">
            {song.artist || 'Unknown artist'}
          </Typography>
        </div>
        <Typography
          className={`${classes.secondary} ${classes.desktopOnly}`}
          variant="body2"
        >
          {song.album || 'Single'}
        </Typography>
        <div className={classes.desktopOnly}>
          {facet && (
            <Chip className={classes.facetChip} label={facet} size="small" />
          )}
        </div>
        <Typography className={classes.secondary} variant="caption">
          <DurationField record={song} source="duration" />
        </Typography>
        <Box onClick={(event) => event.stopPropagation()}>
          <SongContextMenu record={song} resource="song" />
        </Box>
      </div>
    )
  })
}

export const ModernSongList = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const {
    data,
    ids,
    loading,
    onSelect,
    selectedIds = [],
    total,
  } = useListContext()
  const currentSongId = useSelector(
    (state) => state.player.current?.song?.id || state.player.current?.trackId,
  )
  const songs = useMemo(
    () => (ids || []).map((id) => data?.[id]).filter(Boolean),
    [data, ids],
  )

  if (loading && songs.length === 0) return <LinearProgress />

  const allVisibleSelected =
    songs.length > 0 && songs.every((song) => selectedIds.includes(song.id))
  const someVisibleSelected = songs.some((song) =>
    selectedIds.includes(song.id),
  )
  const handleSelectAll = () => {
    const visibleIds = songs.map((song) => song.id)
    onSelect(
      allVisibleSelected
        ? selectedIds.filter((id) => !visibleIds.includes(id))
        : [...new Set([...selectedIds, ...visibleIds])],
    )
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.summary}>
        <Box display="flex" alignItems="center">
          <Checkbox
            checked={allVisibleSelected}
            color="primary"
            indeterminate={!allVisibleSelected && someVisibleSelected}
            inputProps={{ 'aria-label': 'Select visible songs' }}
            onChange={handleSelectAll}
          />
          <Typography className={classes.summaryLabel}>
            Music library
          </Typography>
        </Box>
        <Typography color="textSecondary" variant="caption">
          {selectedIds.length > 0
            ? `${selectedIds.length} selected`
            : `${total ?? songs.length} tracks`}
        </Typography>
      </div>
      {songs.length > 0 ? (
        <ModernTrackRows
          songs={songs}
          currentSongId={currentSongId}
          onPlay={(song) => dispatch(setTrack(song))}
          selectedIds={selectedIds}
          onToggleSelection={(id) =>
            onSelect(
              selectedIds.includes(id)
                ? selectedIds.filter((selectedId) => selectedId !== id)
                : [...selectedIds, id],
            )
          }
        />
      ) : (
        <div className={classes.empty}>
          <Typography color="textSecondary">No songs found</Typography>
        </div>
      )}
    </Paper>
  )
}
