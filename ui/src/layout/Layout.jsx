import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout as RALayout, toggleSidebar } from 'react-admin'
import { makeStyles } from '@material-ui/core/styles'
import { HotKeys } from 'react-hotkeys'
import Menu from './Menu'
import AppBar from './AppBar'
import Notification from './Notification'
import useCurrentTheme from '../themes/useCurrentTheme'
import { useSearchRefocus } from '../common'
import { desktopPlayerWidth } from '../audioplayer/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: (props) => (props.addPadding ? '80px' : 0),
    [theme.breakpoints.up('md')]: {
      paddingBottom: 0,
      '& #main-content': {
        paddingRight: (props) =>
          props.addPadding ? desktopPlayerWidth + theme.spacing(2) : undefined,
        transition: theme.transitions.create('padding-right', {
          duration: theme.transitions.duration.shorter,
        }),
      },
    },
  },
}))

const Layout = (props) => {
  const theme = useCurrentTheme()
  const queue = useSelector((state) => state.player?.queue)
  const classes = useStyles({ addPadding: queue.length > 0 })
  const dispatch = useDispatch()
  useSearchRefocus()

  const keyHandlers = {
    TOGGLE_MENU: useCallback(() => dispatch(toggleSidebar()), [dispatch]),
  }

  return (
    <HotKeys handlers={keyHandlers}>
      <RALayout
        {...props}
        className={classes.root}
        menu={Menu}
        appBar={AppBar}
        theme={theme}
        notification={Notification}
      />
    </HotKeys>
  )
}

export default Layout
