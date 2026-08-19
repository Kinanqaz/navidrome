import React from 'react'
import { lazyLoad } from '../common'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'
import AlbumOutlinedIcon from '@material-ui/icons/AlbumOutlined'
import AlbumIcon from '@material-ui/icons/Album'

const AlbumList = lazyLoad(() => import('./AlbumList'))
const AlbumShow = lazyLoad(() => import('./AlbumShow'))

export default {
  list: AlbumList,
  show: AlbumShow,
  icon: (
    <DynamicMenuIcon
      path={'album'}
      icon={AlbumOutlinedIcon}
      activeIcon={AlbumIcon}
    />
  ),
}
