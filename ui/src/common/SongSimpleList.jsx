import React from 'react'
import PropTypes from 'prop-types'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import { sanitizeListRestProps } from 'react-admin'
import { Artwork } from './Artwork'
import { DurationField, SongContextMenu } from './index'
import { setTrack } from '../actions'
import { useDispatch } from 'react-redux'
import config from '../config'

const useStyles = makeStyles(
  (theme) => ({
    link: {
      textDecoration: 'none',
      color: 'inherit',
    },
    list: {
      padding: 0,
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.75, 1),
      minHeight: 52,
      borderRadius: theme.spacing(0.5),
      transition: theme.transitions.create('background-color', {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    artwork: {
      flex: '0 0 auto',
      width: 42,
      height: 42,
      borderRadius: 6,
      marginRight: theme.spacing(1.25),
      objectFit: 'cover',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    },
    content: {
      flex: 1,
      minWidth: 0,
      paddingRight: theme.spacing(6),
    },
    title: {
      overflow: 'hidden',
      fontSize: '0.88rem',
      fontWeight: 600,
      lineHeight: 1.3,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: theme.palette.text.primary,
    },
    secondary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
      minWidth: 0,
    },
    artist: {
      overflow: 'hidden',
      fontSize: '0.78rem',
      color: theme.palette.text.secondary,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginRight: theme.spacing(1),
    },
    timeStamp: {
      flex: '0 0 auto',
      color: theme.palette.text.secondary,
      fontSize: '0.75rem',
      fontWeight: 400,
      opacity: 0.8,
    },
    rightAction: {
      right: theme.spacing(0.5),
      display: 'flex',
      alignItems: 'center',
    },
    moreButton: {
      color: theme.palette.text.secondary,
      padding: 6,
      '&:hover': {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.action.hover,
      },
    },
  }),
  { name: 'RaSongSimpleList' },
)

export const SongSimpleList = ({
  basePath,
  className,
  classes: classesOverride,
  data,
  hasBulkActions,
  ids,
  loading,
  onToggleItem,
  selectedIds,
  total,
  ...rest
}) => {
  const dispatch = useDispatch()
  const classes = useStyles({ classes: classesOverride })
  return (
    (loading || total > 0) && (
      <List className={className} {...sanitizeListRestProps(rest)}>
        {ids.map(
          (id) =>
            data[id] && (
              <span key={id} onClick={() => dispatch(setTrack(data[id]))}>
                <ListItem className={classes.listItem} button={true}>
                  <Artwork
                    record={data[id]}
                    size={config.uiCoverArtSize || 100}
                    square={true}
                    className={classes.artwork}
                    title={data[id].title}
                  />
                  <ListItemText
                    className={classes.content}
                    primary={
                      <div className={classes.title}>{data[id].title}</div>
                    }
                    secondary={
                      <span className={classes.secondary}>
                        <span className={classes.artist}>
                          {data[id].artist}
                        </span>
                        <span className={classes.timeStamp}>
                          <DurationField
                            record={data[id]}
                            source={'duration'}
                          />
                        </span>
                      </span>
                    }
                  />
                  <ListItemSecondaryAction className={classes.rightAction}>
                    <SongContextMenu
                      record={data[id]}
                      showLove={false}
                      buttonClassName={classes.moreButton}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </span>
            ),
        )}
      </List>
    )
  )
}

SongSimpleList.propTypes = {
  basePath: PropTypes.string,
  className: PropTypes.string,
  classes: PropTypes.object,
  data: PropTypes.object,
  hasBulkActions: PropTypes.bool.isRequired,
  ids: PropTypes.array,
  onToggleItem: PropTypes.func,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
}

SongSimpleList.defaultProps = {
  hasBulkActions: false,
  selectedIds: [],
}
