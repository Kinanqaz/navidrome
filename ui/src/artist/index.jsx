import React from 'react'
import { lazyLoad } from '../common'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'
import MicNoneOutlinedIcon from '@material-ui/icons/MicNoneOutlined'
import MicIcon from '@material-ui/icons/Mic'

const ArtistList = lazyLoad(() => import('./ArtistList'))
const ArtistShow = lazyLoad(() => import('./ArtistShow'))

export default {
  list: ArtistList,
  show: ArtistShow,
  icon: (
    <DynamicMenuIcon
      path={'artist'}
      icon={MicNoneOutlinedIcon}
      activeIcon={MicIcon}
    />
  ),
}
