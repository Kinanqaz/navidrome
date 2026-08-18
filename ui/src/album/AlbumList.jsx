import { cloneElement, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useLocation } from 'react-router-dom'
import {
  useListContext,
  useTranslate,
  useVersion,
} from 'react-admin'
import { useMediaQuery, withWidth } from '@material-ui/core'
import {
  List,
  ModernFilterBar,
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
import AlbumInfo from './AlbumInfo'
import ExpandInfoDialog from '../dialogs/ExpandInfoDialog'

// Waits for rows: restoring into an unrendered list leaves the page too short to hold the offset.
const ScrollRestorer = ({ children, ...rest }) => {
  const { loaded, total } = useListContext()
  useScrollRestoration(loaded && total > 0)
  return cloneElement(children, rest)
}

const AlbumFilter = (props) => {
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const albumView = useSelector((state) => state.albumView)

  return (
    <ModernFilterBar resource="album" searchSource="name" {...props}>
      {isNotSmall ? (
        <ToggleFieldsMenu
          resource="album"
          topbarComponent={AlbumViewToggler}
          hideColumns={albumView.grid}
        />
      ) : (
        <AlbumViewToggler showTitle={false} />
      )}
    </ModernFilterBar>
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
