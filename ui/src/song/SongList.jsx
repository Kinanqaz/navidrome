import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useLocation, Redirect } from 'react-router-dom'
import { useListContext, useTranslate, changeListParams } from 'react-admin'
import {
  List,
  ModernFilterBar,
  modernFilterStyles,
  ShuffleAllButton,
  SongInfo,
  Title,
  ToggleFieldsMenu,
  defaultRowsPerPageOptions,
  getStoredPerPage,
  useResourceRefresh,
  useSetToggleableFields,
} from '../common'
import ExpandInfoDialog from '../dialogs/ExpandInfoDialog'
import { ModernSongList } from './ModernSongList'
import songLists from './songLists'

// eslint-disable-next-line react-refresh/only-export-components
export const songFilterStyles = (theme) => ({
  ...modernFilterStyles(theme),
  row: {
    '&:hover': {
      '& $contextMenu': {
        visibility: 'visible',
      },
      '& $ratingField': {
        visibility: 'visible',
      },
    },
  },
  contextMenu: {
    visibility: (props) => (props?.isDesktop ? 'hidden' : 'visible'),
  },
  ratingField: {
    visibility: 'hidden',
  },
  columnIcon: {
    marginLeft: '3px',
    marginTop: '-2px',
    verticalAlign: 'text-top',
  },
})

// eslint-disable-next-line react-refresh/only-export-components
export const getAutocompleteArrayClasses = (classes = {}) => ({
  chip: classes.chip,
  chipContainerOutlined: classes.chipRow,
  inputInput: classes.autocompleteInput,
})

const SongFilter = (props) => {
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const { filterValues } = useListContext(props)

  if (!isNotSmall) {
    return null
  }

  return (
    <ModernFilterBar resource="song" searchSource="title" {...props}>
      <ShuffleAllButton filters={filterValues} />
      <ToggleFieldsMenu resource="song" />
    </ModernFilterBar>
  )
}

const SongListTitle = ({ songListType }) => {
  const translate = useTranslate()
  let title = translate('resources.song.name', { smart_count: 2 })
  if (songListType && songListType !== 'all') {
    const listTitle = translate(`resources.album.lists.${songListType}`, {
      smart_count: 2,
      _: songListType,
    })
    title = `${title} - ${listTitle}`
  }
  return <Title subTitle={title} args={{ smart_count: 2 }} />
}

const SongList = (props) => {
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  const location = useLocation()
  useResourceRefresh('song')

  useSetToggleableFields(
    'song',
    [
      'artist',
      'album',
      'albumArtist',
      'genre',
      'mood',
      'year',
      'playCount',
      'rating',
      'duration',
      'playDate',
      'createdAt',
      'size',
      'bpm',
      'starred',
    ],
    [
      'albumArtist',
      'mood',
      'playDate',
      'createdAt',
      'size',
      'bpm',
    ],
  )

  const songListType = location.pathname
    .replace(/^\/song/, '')
    .replace(/^\//, '')

  const dispatch = useDispatch()
  const songParams = useSelector(
    (state) => state.admin?.resources?.song?.list?.params,
  )

  useEffect(() => {
    if (!location.search && !songListType) {
      if (songParams?.filter && Object.keys(songParams.filter).length > 0) {
        dispatch(
          changeListParams('song', {
            ...songParams,
            filter: {},
          }),
        )
      }
    }
  }, [location.pathname, location.search, songListType, songParams, dispatch])

  if (!location.search && songListType && songLists[songListType]) {
    return (
      <Redirect
        to={`/song/${songListType}?${songLists[songListType].params}`}
      />
    )
  }

  return (
    <>
      <List
        {...props}
        sort={{ field: 'createdAt', order: 'DESC' }}
        exporter={false}
        bulkActionButtons={false}
        actions={false}
        filters={<SongFilter />}
        title={<SongListTitle songListType={songListType} />}
        perPage={getStoredPerPage(
          'song',
          defaultRowsPerPageOptions,
          isXsmall ? 50 : 15,
        )}
      >
        <ModernSongList />
      </List>
      <ExpandInfoDialog content={<SongInfo />} />
    </>
  )
}

export { SongFilter }
export default SongList
