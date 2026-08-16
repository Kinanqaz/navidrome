import React from 'react'
import AlbumIcon from '@material-ui/icons/Album'
import AlbumOutlinedIcon from '@material-ui/icons/AlbumOutlined'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'

const albumLists = {
  all: {
    icon: (
      <DynamicMenuIcon
        path={'album/all'}
        icon={AlbumOutlinedIcon}
        activeIcon={AlbumIcon}
      />
    ),
    params: 'sort=name&order=ASC&filter={}',
  },
}

export default albumLists
export const defaultAlbumList = 'all'
