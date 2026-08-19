import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import { alpha, makeStyles } from '@material-ui/core/styles'
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined'
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded'
import WbSunnyOutlinedIcon from '@material-ui/icons/WbSunnyOutlined'
import { useGetList } from 'react-admin'
import { Link } from 'react-router-dom'
import { buildFacetSongUrl } from './facetLinks'
import subsonic from '../subsonic'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing(1.5, 2, 8),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2.5, 3, 8),
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3, 4, 8),
    },
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 1.2),
    borderRadius: 16,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)',
    color: theme.palette.text.secondary,
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 10,
    width: '100%',
    boxSizing: 'border-box',
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
      gap: 10,
    },
  },
  card: {
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)'
    }`,
    borderRadius: 14,
    boxShadow:
      theme.palette.type === 'dark'
        ? '0 2px 10px rgba(0, 0, 0, 0.2)'
        : '0 2px 8px rgba(0, 0, 0, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition:
      'transform 0.18s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
    '&:hover': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255, 255, 255, 0.07)'
          : 'rgba(0, 0, 0, 0.04)',
      borderColor: alpha(theme.palette.primary.main, 0.4),
      transform: 'translateY(-2px)',
      boxShadow:
        theme.palette.type === 'dark'
          ? '0 6px 18px rgba(0, 0, 0, 0.3)'
          : '0 6px 14px rgba(0, 0, 0, 0.06)',
      '& $chevron': {
        transform: 'translateX(2px)',
        color: theme.palette.primary.main,
        opacity: 0.9,
      },
      '& $trackCount': {
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
  },
  action: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    padding: `${theme.spacing(1, 1.4)}px !important`,
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.4),
    minWidth: 0,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: alpha(theme.palette.primary.main, 0.14),
    color: theme.palette.primary.main,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.18)}`,
    flexShrink: 0,
    '& svg': {
      fontSize: 19,
    },
  },
  name: {
    overflow: 'hidden',
    fontSize: '0.94rem',
    fontWeight: 650,
    lineHeight: 1.25,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: theme.palette.text.primary,
    flex: 1,
    minWidth: 0,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
  trackCount: {
    fontSize: '0.76rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.05)',
    padding: theme.spacing(0.2, 0.85),
    borderRadius: 10,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    transition: 'all 0.18s ease',
  },
  chevron: {
    fontSize: '1.2rem',
    color: theme.palette.text.disabled,
    opacity: 0.45,
    transition: 'all 0.18s ease',
    flexShrink: 0,
  },
  empty: {
    padding: theme.spacing(6, 2),
    textAlign: 'center',
  },
}))

export const MusicFacetPage = ({ kind }) => {
  const classes = useStyles()
  const isMood = kind === 'mood'
  const resource = isMood ? 'tag' : 'genre'
  const nameField = isMood ? 'tagValue' : 'name'
  const filterField = isMood ? 'mood' : 'genre_id'
  const title = isMood ? 'Moods' : 'Genres'
  const Icon = isMood ? WbSunnyOutlinedIcon : CategoryOutlinedIcon

  const [subsonicCounts, setSubsonicCounts] = useState({})

  const { ids, data, loading } = useGetList(
    resource,
    { page: 1, perPage: 0 },
    { field: nameField, order: 'ASC' },
    isMood ? { tag_name: 'mood' } : {},
  )

  useEffect(() => {
    if (!isMood) {
      subsonic
        .getGenres()
        .then((genreList) => {
          const map = {}
          genreList.forEach((g) => {
            const val = (g.value || g.name || '').toLowerCase()
            if (val) {
              map[val] = g.songCount ?? g.song_count ?? 0
            }
          })
          setSubsonicCounts(map)
        })
        .catch(() => {})
    }
  }, [isMood])

  const items = useMemo(
    () => (ids || []).map((id) => data?.[id]).filter(Boolean),
    [data, ids],
  )

  if (loading && items.length === 0) return <LinearProgress />

  return (
    <main className={classes.root}>
      <div className={classes.heading}>
        <Typography className={classes.title} component="h1">
          {title}
        </Typography>
        <span className={classes.badge}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      {items.length > 0 ? (
        <div className={classes.grid}>
          {items.map((item) => {
            const displayName = item.tagValue || item.name || ''
            const count =
              item.songCount ??
              item.song_count ??
              (displayName ? subsonicCounts[displayName.toLowerCase()] : undefined)
            return (
              <Card key={item.id} className={classes.card}>
                <CardActionArea
                  className={classes.action}
                  component={Link}
                  to={buildFacetSongUrl(filterField, item.id)}
                >
                  <CardContent className={classes.content}>
                    <div className={classes.leftGroup}>
                      <Avatar className={classes.avatar}>
                        <Icon />
                      </Avatar>
                      <Typography className={classes.name} variant="body2">
                        {displayName}
                      </Typography>
                    </div>
                    <div className={classes.rightGroup}>
                      {count !== undefined && count !== null && (
                        <span className={classes.trackCount}>{count}</span>
                      )}
                      <ChevronRightRoundedIcon className={classes.chevron} />
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className={classes.empty}>
          <Typography color="textSecondary">
            No {title.toLowerCase()} found in the library.
          </Typography>
        </div>
      )}
    </main>
  )
}

export const GenrePage = () => <MusicFacetPage kind="genre" />
export const CategoryPage = GenrePage
export const MoodPage = () => <MusicFacetPage kind="mood" />
