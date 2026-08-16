import { cloneElement, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useLocation } from 'react-router-dom'
import {
  AutocompleteArrayInput,
  AutocompleteInput,
  Filter,
  FilterButton,
  NullableBooleanInput,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  SearchInput,
  useListContext,
  usePermissions,
  useTranslate,
  useVersion,
} from 'react-admin'
import FavoriteIcon from '@material-ui/icons/Favorite'
import { useMediaQuery, withWidth } from '@material-ui/core'
import {
  List,
  Pagination,
  Title,
  ToggleFieldsMenu,
  useAlbumsPerPage,
  useResourceRefresh,
  useScrollRestoration,
  useSetToggleableFields,
} from '../common'
import { AlbumViewToggler } from './AlbumListActions'
import AlbumTableView from './AlbumTableView'
import AlbumGridView from './AlbumGridView'
import { useRollChanged } from './useRollChanged'
import albumLists from './albumLists'
import { isResourceDefaultView } from '../personal/defaultViews'
import { resolveAlbumListType } from './albumListRouting'
import config from '../config'
import AlbumInfo from './AlbumInfo'
import ExpandInfoDialog from '../dialogs/ExpandInfoDialog'
import { humanize } from 'inflection'
import { makeStyles } from '@material-ui/core/styles'
import {
  songFilterStyles,
  getAutocompleteArrayClasses,
} from '../song/SongList'

// Waits for rows: restoring into an unrendered list leaves the page too short to hold the offset.
const ScrollRestorer = ({ children, ...rest }) => {
  const { loaded, total } = useListContext()
  useScrollRestoration(loaded && total > 0)
  return cloneElement(children, rest)
}

const useStyles = makeStyles(songFilterStyles)

const formatReleaseType = (record) =>
  record?.tagValue ? humanize(record?.tagValue) : '-- None --'

const AlbumFilter = (props) => {
  const classes = useStyles()
  const translate = useTranslate()
  const { permissions } = usePermissions()
  const isAdmin = permissions === 'admin'
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const albumView = useSelector((state) => state.albumView)
  const {
    resource = 'album',
    displayedFilters,
    filterValues,
    showFilter,
  } = useListContext(props)

  if (props.context === 'button') {
    return null
  }

  const filterElements = [
    <SearchInput
      id="search"
      key="name"
      source="name"
      alwaysOn
      className={classes.searchInput}
    />,
    <ReferenceInput
      key="artist_id"
      label={translate('resources.album.fields.artist')}
      source="artist_id"
      reference="artist"
      sort={{ field: 'name', order: 'ASC' }}
      filterToQuery={(searchText) => ({ name: [searchText] })}
    >
      <AutocompleteInput emptyText="-- None --" />
    </ReferenceInput>,
    <ReferenceArrayInput
      key="genre_id"
      label={translate('resources.album.fields.genre')}
      source="genre_id"
      reference="genre"
      perPage={0}
      sort={{ field: 'name', order: 'ASC' }}
      filterToQuery={(searchText) => ({ name: [searchText] })}
    >
      <AutocompleteArrayInput
        emptyText="-- None --"
        classes={getAutocompleteArrayClasses(classes)}
      />
    </ReferenceArrayInput>,
    <ReferenceInput
      key="recordlabel"
      label={translate('resources.album.fields.recordLabel')}
      source="recordlabel"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'recordlabel' }}
      filterToQuery={(searchText) => ({
        tag_value: [searchText],
      })}
    >
      <AutocompleteInput emptyText="-- None --" optionText="tagValue" />
    </ReferenceInput>,
    <ReferenceArrayInput
      key="grouping"
      label={translate('resources.album.fields.grouping')}
      source="grouping"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'grouping' }}
      filterToQuery={(searchText) => ({
        tag_value: [searchText],
      })}
    >
      <AutocompleteArrayInput
        emptyText="-- None --"
        classes={getAutocompleteArrayClasses(classes)}
        optionText="tagValue"
      />
    </ReferenceArrayInput>,
    <ReferenceArrayInput
      key="mood"
      label={translate('resources.album.fields.mood')}
      source="mood"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'mood' }}
      filterToQuery={(searchText) => ({
        tag_value: [searchText],
      })}
    >
      <AutocompleteArrayInput
        emptyText="-- None --"
        classes={getAutocompleteArrayClasses(classes)}
        optionText="tagValue"
      />
    </ReferenceArrayInput>,
    <ReferenceInput
      key="media"
      label={translate('resources.album.fields.media')}
      source="media"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'media' }}
      filterToQuery={(searchText) => ({
        tag_value: [searchText],
      })}
    >
      <AutocompleteInput emptyText="-- None --" optionText="tagValue" />
    </ReferenceInput>,
    <ReferenceInput
      key="releasetype"
      label={translate('resources.album.fields.releaseType')}
      source="releasetype"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'releasetype' }}
      filterToQuery={(searchText) => ({
        tag_value: [searchText],
      })}
    >
      <AutocompleteInput
        emptyText="-- None --"
        optionText={formatReleaseType}
      />
    </ReferenceInput>,
    <NullableBooleanInput key="compilation" source="compilation" />,
    <NumberInput key="year" source="year" />,
    ...(config.enableFavourites
      ? [
          <NullableBooleanInput
            key="starred"
            source="starred"
            label={<FavoriteIcon fontSize={'small'} />}
          />,
        ]
      : []),
    ...(isAdmin
      ? [<NullableBooleanInput key="missing" source="missing" />]
      : []),
  ]

  return (
    <div className={classes.toolbarRoot}>
      <div className={classes.leftGroup}>
        <Filter
          {...props}
          variant="outlined"
          classes={{ form: classes.filterForm }}
        >
          {filterElements}
        </Filter>
      </div>
      <div className={classes.rightGroup}>
        <FilterButton
          resource={resource}
          filters={filterElements}
          displayedFilters={displayedFilters}
          filterValues={filterValues}
          showFilter={showFilter}
        />
        {isNotSmall ? (
          <ToggleFieldsMenu
            resource="album"
            topbarComponent={AlbumViewToggler}
            hideColumns={albumView.grid}
          />
        ) : (
          <AlbumViewToggler showTitle={false} />
        )}
      </div>
    </div>
  )
}

const AlbumListTitle = ({ albumListType }) => {
  const translate = useTranslate()
  let title = translate('resources.album.name', { smart_count: 2 })
  if (albumListType) {
    let listTitle = translate(`resources.album.lists.${albumListType}`, {
      smart_count: 2,
    })
    title = `${title} - ${listTitle}`
  }
  return <Title subTitle={title} args={{ smart_count: 2 }} />
}

const AlbumListPagination = ({ albumListType, seed, shownSeed, ...rest }) => {
  const { loading } = useListContext()
  const rerolling = useRollChanged(shownSeed, seed, loading)
  if (rerolling && albumListType === 'random') {
    return null
  }
  return <Pagination {...rest} />
}

const randomStartingSeed = Math.random().toString()

const AlbumList = (props) => {
  const { width } = props
  const shownSeed = useRef(null)
  const albumView = useSelector((state) => state.albumView)
  const [perPage, perPageOptions] = useAlbumsPerPage(width)
  const location = useLocation()
  const version = useVersion()
  useResourceRefresh('album')

  const seed = `${randomStartingSeed}-${version}`

  const albumListType = location.pathname
    .replace(/^\/album/, '')
    .replace(/^\//, '')

  // Workaround to force album columns to appear the first time.
  // See https://github.com/navidrome/navidrome/pull/923#issuecomment-833004842
  // TODO: Find a better solution
  useSetToggleableFields(
    'album',
    [
      'artist',
      'songCount',
      'playCount',
      'year',
      'mood',
      'duration',
      'rating',
      'size',
      'createdAt',
    ],
    ['createdAt', 'size'],
  )

  if (!location.search) {
    const type = resolveAlbumListType(albumListType)
    if (isResourceDefaultView(type) && type !== 'album') {
      return <Redirect to={`/${type}`} />
    }
    const listParams = albumLists[type]
    if (listParams) {
      return <Redirect to={`/album/${type}?${listParams.params}`} />
    }
  }

  return (
    <>
      <List
        {...props}
        exporter={false}
        bulkActionButtons={false}
        filter={{ seed }}
        actions={false}
        filters={<AlbumFilter />}
        perPage={perPage}
        pagination={
          <AlbumListPagination
            rowsPerPageOptions={perPageOptions}
            albumListType={albumListType}
            seed={seed}
            shownSeed={shownSeed}
          />
        }
        title={<AlbumListTitle albumListType={albumListType} />}
      >
        <ScrollRestorer>
          {albumView.grid ? (
            <AlbumGridView
              albumListType={albumListType}
              seed={seed}
              shownSeed={shownSeed}
              {...props}
            />
          ) : (
            <AlbumTableView {...props} />
          )}
        </ScrollRestorer>
      </List>
      <ExpandInfoDialog content={<AlbumInfo />} />
    </>
  )
}

const AlbumListWithWidth = withWidth()(AlbumList)

export default AlbumListWithWidth
