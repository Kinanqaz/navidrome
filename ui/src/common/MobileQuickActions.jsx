import React, { useState, useMemo, useCallback } from 'react'
import {
  makeStyles,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  IconButton,
} from '@material-ui/core'
import { alpha } from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import FilterListIcon from '@material-ui/icons/FilterList'
import CloseIcon from '@material-ui/icons/Close'
import { MdTrendingUp, MdShuffle, MdHistory } from 'react-icons/md'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  useListContext,
  useTranslate,
  useDataProvider,
  useNotify,
  useGetList,
} from 'react-admin'
import clsx from 'clsx'
import { playTracks } from '../actions'
import config from '../config'

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.type === 'dark'
  const primaryColor = theme.palette.primary?.main || '#2196f3'
  const primaryContrast = theme.palette.primary?.contrastText || '#ffffff'
  const shadowColor = theme.palette.common?.black || '#000000'

  return {
    root: {
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '4px 0 14px 0',
      padding: '2px 0 2px 0',
      boxSizing: 'border-box',
    },
    item: {
      flex: '1 1 0%',
      maxWidth: '25%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 0.15s ease',
      padding: '4px 0',
      overflow: 'visible',
      '&:active': {
        transform: 'scale(0.92)',
      },
    },
    circle: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 2px 8px ${alpha(shadowColor, isDark ? 0.25 : 0.08)}`,
      transition: 'all 0.2s ease',
      border: `1px solid ${alpha(primaryColor, isDark ? 0.22 : 0.18)}`,
      backgroundColor: isDark
        ? alpha(primaryColor, 0.12)
        : alpha(primaryColor, 0.08),
      color: primaryColor,
      position: 'relative',
      '&:hover': {
        backgroundColor: isDark
          ? alpha(primaryColor, 0.2)
          : alpha(primaryColor, 0.15),
        borderColor: alpha(primaryColor, 0.4),
      },
    },
    circleActive: {
      backgroundColor: `${primaryColor} !important`,
      color: `${primaryContrast} !important`,
      boxShadow: `0 2px 10px ${alpha(primaryColor, 0.45)} !important`,
      borderColor: `${primaryColor} !important`,
    },
    filterCircle: {
      backgroundColor: isDark
        ? alpha(primaryColor, 0.12)
        : alpha(primaryColor, 0.08),
      color: primaryColor,
    },
    filterCircleActive: {
      backgroundColor: `${primaryColor} !important`,
      color: `${primaryContrast} !important`,
      boxShadow: `0 2px 10px ${alpha(primaryColor, 0.45)} !important`,
      borderColor: `${primaryColor} !important`,
    },
    mostPlayedCircle: {
      backgroundColor: isDark
        ? alpha(primaryColor, 0.12)
        : alpha(primaryColor, 0.08),
      color: primaryColor,
    },
    historyCircle: {
      backgroundColor: isDark
        ? alpha(primaryColor, 0.12)
        : alpha(primaryColor, 0.08),
      color: primaryColor,
    },
    shuffleCircle: {
      backgroundColor: isDark
        ? alpha(primaryColor, 0.12)
        : alpha(primaryColor, 0.08),
      color: primaryColor,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.palette.error?.main || '#f44336',
      color: '#ffffff',
      fontSize: '0.7rem',
      fontWeight: 700,
      width: 18,
      height: 18,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #181820',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
    },
    label: {
      fontSize: '0.72rem',
      fontWeight: 500,
      marginTop: 5,
      color: theme.palette.text.secondary,
      letterSpacing: '0.01em',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
    },
    // Mobile Dialog Styles
    dialogPaper: {
      backgroundColor: isDark ? '#1a1a24' : '#ffffff',
      backgroundImage: 'none',
      borderRadius: 16,
      margin: 16,
      maxHeight: 'calc(100% - 32px)',
    },
    dialogTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px 8px',
      '& h2': {
        fontSize: '1.15rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      },
    },
    dialogContent: {
      padding: '8px 20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    dialogItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    itemLabel: {
      fontSize: '0.82rem',
      fontWeight: 600,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    fieldInput: {
      width: '100%',
    },
  }
})

export const MobileQuickActions = ({ resource = 'song' }) => {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const translate = useTranslate()
  const dataProvider = useDataProvider()
  const notify = useNotify()

  const isMostPlayed = location.pathname.includes('/song/mostPlayed')
  const isRecentlyPlayed = location.pathname.includes('/song/recentlyPlayed')

  const {
    filterValues = {},
    setFilters,
    displayedFilters,
    basePath,
  } = useListContext()

  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch Genres when dialog opens
  const { data: genresData } = useGetList(
    'genre',
    { page: 1, perPage: 500 },
    { field: 'name', order: 'ASC' },
    {},
    { enabled: dialogOpen },
  )
  const genreList = useMemo(
    () => (genresData ? Object.values(genresData) : []),
    [genresData],
  )

  // Fetch Moods when dialog opens
  const { data: moodsData } = useGetList(
    'tag',
    { page: 1, perPage: 100 },
    { field: 'tagValue', order: 'ASC' },
    { tag_name: 'mood' },
    { enabled: dialogOpen },
  )
  const moodList = useMemo(
    () => (moodsData ? Object.values(moodsData) : []),
    [moodsData],
  )

  // Calculate active facet filter count (explicit user filters only)
  const activeCount = useMemo(() => {
    const userFacetKeys = [
      'starred',
      'genre_id',
      'mood',
      'releasetype',
      'role',
      'year',
    ]
    let count = 0
    userFacetKeys.forEach((key) => {
      const val = filterValues?.[key]
      if (val !== undefined && val !== '' && val !== null) {
        if (Array.isArray(val)) {
          if (val.length > 0) count += 1
        } else {
          count += 1
        }
      }
    })
    return count
  }, [filterValues])

  const handleClearAll = useCallback(() => {
    const userFacetKeys = [
      'starred',
      'genre_id',
      'mood',
      'releasetype',
      'role',
      'year',
    ]
    const newFilters = { ...filterValues }
    userFacetKeys.forEach((key) => {
      delete newFilters[key]
    })
    setFilters(newFilters, displayedFilters)
    if (Object.keys(newFilters).length === 0 && history && basePath) {
      history.replace(basePath)
    }
  }, [filterValues, setFilters, displayedFilters, history, basePath])

  const handleFilterChange = useCallback(
    (field, value) => {
      const newFilters = { ...filterValues }
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete newFilters[field]
      } else {
        newFilters[field] = value
      }
      setFilters(newFilters, displayedFilters)
      if (Object.keys(newFilters).length === 0 && history && basePath) {
        history.replace(basePath)
      }
    },
    [filterValues, setFilters, displayedFilters, history, basePath],
  )

  const handleShuffleAll = useCallback(() => {
    dataProvider
      .getList('song', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'random', order: 'ASC' },
        filter: { ...filterValues, missing: false },
      })
      .then((res) => {
        const data = {}
        res.data.forEach((song) => {
          data[song.id] = song
        })
        dispatch(playTracks(data))
      })
      .catch(() => {
        notify('ra.page.error', 'warning')
      })
  }, [dataProvider, filterValues, dispatch, notify])

  return (
    <>
      <div className={classes.root}>
        {/* 1. Filters Button */}
        <div
          className={classes.item}
          onClick={() => setDialogOpen(true)}
          role="button"
          aria-label="Open filters"
        >
          <div
            className={clsx(
              classes.circle,
              classes.filterCircle,
              activeCount > 0 && classes.filterCircleActive,
            )}
          >
            <FilterListIcon style={{ fontSize: 26 }} />
            {activeCount > 0 && (
              <span className={classes.badge}>{activeCount}</span>
            )}
          </div>
          <span className={classes.label}>Filters</span>
        </div>

        {/* 2. Most Played Button */}
        <div
          className={classes.item}
          onClick={() =>
            isMostPlayed
              ? history.push('/song?sort=title&order=ASC&filter={}')
              : history.push('/song/mostPlayed')
          }
          role="button"
          aria-label="Most Played"
        >
          <div
            className={clsx(
              classes.circle,
              classes.mostPlayedCircle,
              isMostPlayed && classes.circleActive,
            )}
          >
            <MdTrendingUp size={26} />
          </div>
          <span className={classes.label}>
            {translate('resources.song.lists.mostPlayed', {
              _: 'Most Played',
            })}
          </span>
        </div>

        {/* 3. Recently Played Button */}
        <div
          className={classes.item}
          onClick={() =>
            isRecentlyPlayed
              ? history.push('/song?sort=title&order=ASC&filter={}')
              : history.push('/song/recentlyPlayed')
          }
          role="button"
          aria-label="Recently"
        >
          <div
            className={clsx(
              classes.circle,
              classes.historyCircle,
              isRecentlyPlayed && classes.circleActive,
            )}
          >
            <MdHistory size={26} />
          </div>
          <span className={classes.label}>
            {translate('resources.song.lists.recentlyPlayed', {
              _: 'Recently',
            })}
          </span>
        </div>

        {/* 4. Shuffle Button */}
        <div
          className={classes.item}
          onClick={handleShuffleAll}
          role="button"
          aria-label="Shuffle all"
        >
          <div className={clsx(classes.circle, classes.shuffleCircle)}>
            <MdShuffle size={26} />
          </div>
          <span className={classes.label}>Shuffle</span>
        </div>
      </div>

      {/* Mobile Filter Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <Typography variant="h6">Filters</Typography>
          <IconButton
            size="small"
            onClick={() => setDialogOpen(false)}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {/* Favorites Filter */}
          {config.enableFavourites && (
            <FormControl className={classes.dialogItem}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(filterValues?.starred)}
                    onChange={(e) =>
                      handleFilterChange(
                        'starred',
                        e.target.checked ? true : undefined,
                      )
                    }
                    color="primary"
                  />
                }
                label="Only Favorites (Starred)"
              />
            </FormControl>
          )}

          {/* Genre Filter */}
          {genreList.length > 0 && (
            <div className={classes.dialogItem}>
              <Typography className={classes.itemLabel}>Genre</Typography>
              <Autocomplete
                multiple
                size="small"
                options={genreList}
                getOptionLabel={(option) => option.name || option.id || ''}
                value={
                  genreList.filter((g) =>
                    (filterValues?.genre_id || []).includes(g.id),
                  ) || []
                }
                onChange={(_, newValue) => {
                  const ids = newValue.map((v) => v.id)
                  handleFilterChange(
                    'genre_id',
                    ids.length > 0 ? ids : undefined,
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={
                      (filterValues?.genre_id || []).length === 0
                        ? 'Select genres...'
                        : ''
                    }
                    className={classes.fieldInput}
                  />
                )}
              />
            </div>
          )}

          {/* Mood Filter */}
          {moodList.length > 0 && (
            <div className={classes.dialogItem}>
              <Typography className={classes.itemLabel}>Mood</Typography>
              <Autocomplete
                multiple
                size="small"
                options={moodList}
                getOptionLabel={(option) =>
                  option.tagValue || option.name || option.id || ''
                }
                value={
                  moodList.filter((m) =>
                    (filterValues?.mood || []).includes(m.tagValue || m.id),
                  ) || []
                }
                onChange={(_, newValue) => {
                  const values = newValue.map((v) => v.tagValue || v.id)
                  handleFilterChange(
                    'mood',
                    values.length > 0 ? values : undefined,
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={
                      (filterValues?.mood || []).length === 0
                        ? 'Select moods...'
                        : ''
                    }
                    className={classes.fieldInput}
                  />
                )}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '12px 20px 16px' }}>
          {activeCount > 0 && (
            <Button onClick={handleClearAll} color="secondary">
              Clear All
            </Button>
          )}
          <Button
            onClick={() => setDialogOpen(false)}
            color="primary"
            variant="contained"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MobileQuickActions
