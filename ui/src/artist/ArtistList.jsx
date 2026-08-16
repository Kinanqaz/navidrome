import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Datagrid,
  DatagridBody,
  DatagridRow,
  Filter,
  FilterButton,
  FunctionField,
  NumberField,
  SearchInput,
  SelectInput,
  TextField,
  useListContext,
  useTranslate,
  NullableBooleanInput,
  usePermissions,
} from 'react-admin'
import { useMediaQuery, withWidth } from '@material-ui/core'
import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import { makeStyles } from '@material-ui/core/styles'
import { useDrag } from 'react-dnd'
import clsx from 'clsx'
import {
  ArtistContextMenu,
  ArtworkAvatar,
  List,
  ToggleFieldsMenu,
  useGetHandleArtistClick,
  RatingField,
  useSelectedFields,
  useResourceRefresh,
} from '../common'
import config from '../config'
import ArtistSimpleList from './ArtistSimpleList'
import { DraggableTypes } from '../consts'
import en from '../i18n/en.json'
import { formatBytes } from '../utils/index.js'
import { songFilterStyles } from '../song/SongList'

const useStyles = makeStyles((theme) => ({
  ...songFilterStyles(theme),
  contextHeader: {
    marginLeft: '3px',
    marginTop: '-2px',
    verticalAlign: 'text-top',
  },
  row: {
    '& td': {
      paddingTop: '4px !important',
      paddingBottom: '4px !important',
    },
    '&:hover': {
      '& $contextMenu': {
        visibility: 'visible',
      },
      '& $ratingField': {
        visibility: 'visible',
      },
    },
  },
  missingRow: {
    opacity: 0.3,
  },
  contextMenu: {
    visibility: 'hidden',
  },
  ratingField: {
    visibility: 'hidden',
  },
}))

const ArtistFilter = (props) => {
  const classes = useStyles()
  const translate = useTranslate()
  const { permissions } = usePermissions()
  const isAdmin = permissions === 'admin'
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const {
    resource = 'artist',
    displayedFilters,
    filterValues,
    showFilter,
  } = useListContext(props)

  if (props.context === 'button') {
    return null
  }

  const rolesObj = en?.resources?.artist?.roles
  const roles = Object.keys(rolesObj).reduce((acc, role) => {
    acc.push({
      id: role,
      name: translate(`resources.artist.roles.${role}`, {
        smart_count: 2,
      }),
    })
    return acc
  }, [])
  roles?.sort((a, b) => a.name.localeCompare(b.name))

  const filterElements = [
    <SearchInput
      id="search"
      key="name"
      source="name"
      alwaysOn
      className={classes.searchInput}
    />,
    <SelectInput
      key="role"
      source="role"
      choices={roles}
      alwaysOn
    />,
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
        {isNotSmall && <ToggleFieldsMenu resource="artist" />}
      </div>
    </div>
  )
}

const ArtistDatagridRow = (props) => {
  const { record } = props
  const [, dragArtistRef] = useDrag(
    () => ({
      type: DraggableTypes.ARTIST,
      item: { artistIds: [record?.id] },
      options: { dropEffect: 'copy' },
    }),
    [record],
  )
  const classes = useStyles()
  const computedClasses = clsx(
    props.className,
    classes.row,
    record?.missing && classes.missingRow,
  )
  return (
    <DatagridRow ref={dragArtistRef} {...props} className={computedClasses} />
  )
}

const ArtistDatagridBody = (props) => (
  <DatagridBody {...props} row={<ArtistDatagridRow />} />
)

const ArtistDatagrid = (props) => (
  <Datagrid {...props} body={<ArtistDatagridBody />} />
)

const ArtistListView = ({ hasShow, hasEdit, hasList, width, ...rest }) => {
  const { filterValues } = rest
  const classes = useStyles()
  const handleArtistLink = useGetHandleArtistClick(width)
  const history = useHistory()
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  useResourceRefresh('artist')

  const role = filterValues?.role
  const getCounter = (record, counter) => {
    if (!record) return undefined
    return role ? record?.stats?.[role]?.[counter] : record?.[counter]
  }
  const getAlbumCount = (record) => getCounter(record, 'albumCount')
  const getSongCount = (record) => getCounter(record, 'songCount')
  const getSize = (record) => {
    const size = getCounter(record, 'size')
    return size ? formatBytes(size) : '0 MB'
  }

  const toggleableFields = useMemo(
    () => ({
      playCount: <NumberField source="playCount" sortByOrder={'DESC'} />,
      rating: config.enableStarRating && (
        <RatingField
          source="rating"
          sortByOrder={'DESC'}
          resource={'artist'}
          className={classes.ratingField}
        />
      ),
    }),
    [classes.ratingField],
  )

  const columns = useSelectedFields({
    resource: 'artist',
    columns: toggleableFields,
  })

  return isXsmall ? (
    <ArtistSimpleList
      linkType={(id) => history.push(handleArtistLink(id))}
      {...rest}
    />
  ) : (
    <ArtistDatagrid rowClick={handleArtistLink} classes={{ row: classes.row }}>
      <ArtworkAvatar source="id" />
      <TextField source="name" />
      <FunctionField
        source="albumCount"
        sortByOrder={'DESC'}
        render={getAlbumCount}
      />
      <FunctionField
        source="songCount"
        sortByOrder={'DESC'}
        render={getSongCount}
      />
      <FunctionField source="size" sortByOrder={'DESC'} render={getSize} />
      {columns}
      <ArtistContextMenu
        source={'starred_at'}
        sortByOrder={'DESC'}
        sortable={config.enableFavourites}
        className={classes.contextMenu}
        label={
          config.enableFavourites && (
            <FavoriteBorderIcon
              fontSize={'small'}
              className={classes.contextHeader}
            />
          )
        }
      />
    </ArtistDatagrid>
  )
}

const ArtistList = (props) => {
  return (
    <>
      <List
        {...props}
        sort={{ field: 'name', order: 'ASC' }}
        exporter={false}
        bulkActionButtons={false}
        filters={<ArtistFilter />}
        filterDefaultValues={{ role: 'albumartist' }}
        actions={false}
      >
        <ArtistListView {...props} />
      </List>
    </>
  )
}

const ArtistListWithWidth = withWidth()(ArtistList)

export default ArtistListWithWidth
