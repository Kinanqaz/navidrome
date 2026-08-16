import React, { useMemo } from 'react'
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import { alpha, makeStyles } from '@material-ui/core/styles'
import CategoryOutlinedIcon from '@material-ui/icons/CategoryOutlined'
import WbSunnyOutlinedIcon from '@material-ui/icons/WbSunnyOutlined'
import { useGetList } from 'react-admin'
import { Link } from 'react-router-dom'
import { buildFacetSongUrl } from './facetLinks'

const useStyles = makeStyles((theme) => ({
  root: { width: '100%', padding: theme.spacing(1, 0, 3) },
  heading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  title: { fontSize: '1.35rem', fontWeight: 750 },
  card: {
    height: '100%',
    backgroundColor: alpha(theme.palette.background.paper, 0.4),
    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    borderRadius: theme.spacing(1.5),
    boxShadow: 'none',
    transition: 'all 0.18s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.7),
      borderColor: alpha(theme.palette.primary.main, 0.5),
      transform: 'translateY(-2px)',
    },
  },
  action: { height: '100%' },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    minHeight: 82,
    padding: `${theme.spacing(1.5)}px !important`,
  },
  avatar: {
    background: alpha(theme.palette.primary.main, 0.14),
    color: theme.palette.primary.main,
  },
  name: {
    overflow: 'hidden',
    fontWeight: 700,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: { color: theme.palette.text.secondary },
  empty: { padding: theme.spacing(8, 2), textAlign: 'center' },
}))

export const MusicFacetPage = ({ kind }) => {
  const classes = useStyles()
  const isMood = kind === 'mood'
  const resource = isMood ? 'tag' : 'genre'
  const nameField = isMood ? 'tagValue' : 'name'
  const filterField = isMood ? 'mood' : 'genre_id'
  const title = isMood ? 'Moods' : 'Categories'
  const Icon = isMood ? WbSunnyOutlinedIcon : CategoryOutlinedIcon
  const { ids, data, loading } = useGetList(
    resource,
    { page: 1, perPage: 0 },
    { field: nameField, order: 'ASC' },
    isMood ? { tag_name: 'mood' } : {},
  )
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
        <Typography color="textSecondary" variant="caption">
          {items.length} available
        </Typography>
      </div>
      {items.length > 0 ? (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
              <Card className={classes.card}>
                <CardActionArea
                  className={classes.action}
                  component={Link}
                  to={buildFacetSongUrl(filterField, item.id)}
                >
                  <CardContent className={classes.content}>
                    <Avatar className={classes.avatar}>
                      <Icon fontSize="small" />
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Typography className={classes.name} variant="body2">
                        {item[nameField]}
                      </Typography>
                      <Typography className={classes.meta} variant="caption">
                        {item.songCount
                          ? `${item.songCount} tracks`
                          : 'View tracks'}
                      </Typography>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
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

export const CategoryPage = () => <MusicFacetPage kind="category" />
export const MoodPage = () => <MusicFacetPage kind="mood" />
