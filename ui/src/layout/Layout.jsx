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
    paddingBottom: (props) =>
      props.addPadding ? 'calc(96px + env(safe-area-inset-bottom))' : 0,
    '& #main-content': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(4),
      transition: theme.transitions.create(['padding-right', 'padding-left'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      [theme.breakpoints.down('xs')]: {
        paddingLeft: theme.spacing(0.75),
        paddingRight: theme.spacing(0.75),
        paddingTop: theme.spacing(1),
        paddingBottom: (props) =>
          props.addPadding
            ? 'calc(100px + env(safe-area-inset-bottom))'
            : theme.spacing(3),
      },
      '& thead.MuiTableHead-root, & .RaDatagrid-thead, & .RaDatagrid-headerRow': {
        [theme.breakpoints.down('xs')]: {
          display: 'none !important',
        },
      },
      '& .RaList-content': {
        backgroundColor: 'transparent !important',
        boxShadow: 'none !important',
        backgroundImage: 'none !important',
      },
      '& .RaList-main': {
        backgroundColor: 'transparent',
      },
      '& .RaList-header': {
        minHeight: 'auto',
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      '& .RaTopToolbar-root': {
        padding: '0 !important',
        marginBottom: '0 !important',
        gap: `${theme.spacing(1)}px !important`,
        '& .MuiButton-root': {
          borderRadius: '18px !important',
          height: '36px !important',
          padding: '0 14px !important',
          textTransform: 'none !important',
          fontSize: '0.825rem !important',
          fontWeight: '500 !important',
          backgroundColor:
            theme.palette.type === 'dark'
              ? 'rgba(255, 255, 255, 0.08) !important'
              : 'rgba(0, 0, 0, 0.05) !important',
          color: `${theme.palette.text.primary} !important`,
          border:
            theme.palette.type === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.14) !important'
              : '1px solid rgba(0, 0, 0, 0.16) !important',
          boxShadow: 'none !important',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
          '&:hover': {
            backgroundColor:
              theme.palette.type === 'dark'
                ? 'rgba(255, 255, 255, 0.16) !important'
                : 'rgba(0, 0, 0, 0.09) !important',
            borderColor:
              theme.palette.type === 'dark'
                ? 'rgba(255, 255, 255, 0.28) !important'
                : 'rgba(0, 0, 0, 0.28) !important',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25) !important',
          },
        },
      },
      // Global filter form overrides — React-Admin FilterForm defaults
      // set marginTop:-16px, alignItems:flex-end, minHeight:80px, pointerEvents:none
      '& form[class*="RaFilterForm"]': {
        display: 'flex !important',
        flexDirection: 'row !important',
        alignItems: 'center !important',
        flexWrap: 'nowrap !important',
        minHeight: 'auto !important',
        marginTop: '0 !important',
        marginBottom: '0 !important',
        marginLeft: '0 !important',
        marginRight: '0 !important',
        padding: '0 !important',
        gap: `${theme.spacing(1)}px !important`,
        pointerEvents: 'auto !important',
        [theme.breakpoints.down('xs')]: {
          flexWrap: 'wrap !important',
          width: '100% !important',
          margin: '0 !important',
          padding: '0 !important',
        },
      },
      // React-Admin FilterFormInput spacer + clearfix
      '& .filter-field > div:last-child:not(:first-child)': {
        display: 'none !important',
      },
      '& .RaFilterForm-clearfix, & [class*="clearfix"], & form[class*="RaFilterForm"] > div:last-child:not(.filter-field)':
        {
          display: 'none !important',
        },
      '& .filter-field': {
        alignItems: 'center !important',
        pointerEvents: 'auto !important',
      },
      // Force autocomplete chips to display inline — override MUI's flexWrap:wrap
      // Uses #main-content's ID specificity to beat MUI's own class-based selectors
      '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]': {
        flexWrap: 'nowrap !important',
        overflow: 'hidden !important',
        alignItems: 'center !important',
      },
    },
    [theme.breakpoints.up('md')]: {
      paddingBottom: 0,
      '& #main-content': {
        paddingLeft: theme.spacing(3.5),
        paddingRight: (props) =>
          props.addPadding
            ? `calc(${desktopPlayerWidth} + ${theme.spacing(3.5)}px)`
            : theme.spacing(3.5),
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
