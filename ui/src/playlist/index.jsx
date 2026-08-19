import React from 'react'
import QueueMusicOutlinedIcon from '@material-ui/icons/QueueMusicOutlined'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'
import { lazyLoad } from '../common'

const PlaylistList = lazyLoad(() => import('./PlaylistList'))
const PlaylistEdit = lazyLoad(() => import('./PlaylistEdit'))
const PlaylistCreate = lazyLoad(() => import('./PlaylistCreate'))
const PlaylistShow = lazyLoad(() => import('./PlaylistShow'))

export default {
  list: PlaylistList,
  create: PlaylistCreate,
  edit: PlaylistEdit,
  show: PlaylistShow,
  icon: (
    <DynamicMenuIcon
      path={'playlist'}
      icon={QueueMusicOutlinedIcon}
      activeIcon={QueueMusicIcon}
    />
  ),
}
