import React from 'react'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import LibraryAddOutlinedIcon from '@material-ui/icons/LibraryAddOutlined'
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary'
import VideoLibraryOutlinedIcon from '@material-ui/icons/VideoLibraryOutlined'
import RepeatIcon from '@material-ui/icons/Repeat'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'

const songLists = {
  recentlyAdded: {
    icon: (
      <DynamicMenuIcon
        path={'song/recentlyAdded'}
        icon={LibraryAddOutlinedIcon}
        activeIcon={LibraryAddIcon}
      />
    ),
    params: 'sort=recently_added&order=DESC&filter={}',
  },
  recentlyPlayed: {
    icon: (
      <DynamicMenuIcon
        path={'song/recentlyPlayed'}
        icon={VideoLibraryOutlinedIcon}
        activeIcon={VideoLibraryIcon}
      />
    ),
    params: 'sort=play_date&order=DESC&filter={"recently_played":true}',
  },
  mostPlayed: {
    icon: (
      <DynamicMenuIcon
        path={'song/mostPlayed'}
        icon={RepeatIcon}
        activeIcon={RepeatIcon}
      />
    ),
    params: 'sort=play_count&order=DESC&filter={"recently_played":true}',
  },
}

export default songLists
