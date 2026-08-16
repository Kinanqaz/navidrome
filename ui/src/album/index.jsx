import React from 'react'
import AlbumList from './AlbumList'
import AlbumShow from './AlbumShow'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'
import AlbumOutlinedIcon from '@material-ui/icons/AlbumOutlined'
import AlbumIcon from '@material-ui/icons/Album'

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
