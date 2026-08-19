import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout as RALayout, toggleSidebar } from 'react-admin'
import { makeStyles } from '@material-ui/core/styles'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@material-ui/core/styles'
import Menu from './Menu'
import AppBar from './AppBar'
import Notification from './Notification'
import MobileBottomNav from './MobileBottomNav'
import useCurrentTheme from '../themes/useCurrentTheme'
import { useSearchRefocus } from '../common'
import { desktopPlayerWidth } from '../audioplayer/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    boxSizing: 'border-box',
    paddingBottom: (props) =>
      props.addPadding
        ? 'calc(184px + env(safe-area-inset-bottom))'
        : 'calc(84px + env(safe-area-inset-bottom))',
    '& .MuiDrawer-root.MuiDrawer-modal, & .MuiDrawer-modal, & .RaSidebar-root .MuiDrawer-modal':
      {
        background: 'transparent !important',
        backgroundColor: 'transparent !important',
      },
    '& .MuiDrawer-modal .MuiBackdrop-root, & .RaSidebar-root .MuiBackdrop-root':
      {
        background: 'transparent !important',
        backgroundColor: 'transparent !important',
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important',
      },
    [theme.breakpoints.down('sm')]: {
      '& [class*="appFrame"], & [class*="contentWithSidebar"], & [class*="RaLayout-appFrame"], & [class*="RaLayout-content"], & [class*="RaLayout-children"]':
        {
          marginTop: '0 !important',
          paddingTop: '0 !important',
        },
      '& [class*="RaLayout-content"]': {
        marginTop: '0 !important',
        paddingTop: '0 !important',
      },
      '& .list-page, & [class*="RaList-root"], & [class*="RaList-main"], & [class*="RaList-content"], & .MuiCard-root':
        {
          marginTop: '0 !important',
          paddingTop: '0 !important',
          marginBottom: '0 !important',
          boxShadow: 'none !important',
        },
      '& .RaList-header, & div[class*="RaList-header"], & [class*="RaList-header"], & [class*="RaList-actions"], & [class*="RaTopToolbar-root"]':
        {
          display: 'none !important',
          minHeight: '0 !important',
          height: '0 !important',
          margin: '0 !important',
          padding: '0 !important',
        },
    },
    '& #main-content': {
      width: '100%',
      boxSizing: 'border-box',
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(4),
      transition: theme.transitions.create(['padding-right', 'padding-left'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      [theme.breakpoints.down('sm')]: {
        paddingTop: '0 !important',
        paddingLeft: '16px !important',
        paddingRight: '16px !important',
        paddingBottom: theme.spacing(2),
      },
      [theme.breakpoints.down('xs')]: {
        paddingLeft: '16px !important',
        paddingRight: '16px !important',
        paddingTop: '0 !important',
        paddingBottom: theme.spacing(2),
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
        margin: '0 !important',
        padding: '0 !important',
      },
      '& .RaList-main': {
        backgroundColor: 'transparent',
        padding: '0 !important',
        margin: '0 !important',
        width: '100% !important',
      },
      '& .RaList-header': {
        display: 'none !important',
        minHeight: '0 !important',
        height: '0 !important',
        marginBottom: '0 !important',
        marginTop: '0 !important',
        padding: '0 !important',
        width: '100% !important',
      },
      '& .RaList-actions': {
        display: 'none !important',
      },
      '& .RaTopToolbar-root': {
        padding: '0 !important',
        marginBottom: '0 !important',
        gap: `${theme.spacing(1)}px !important`,
        '& .MuiButton-root': {
          borderRadius: '19px !important',
          height: '38px !important',
          padding: '0 15px !important',
          textTransform: 'none !important',
          fontSize: '0.875rem !important',
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
      '& form[class*="RaFilterForm"], & .RaFilterForm-root': {
        display: 'block !important',
        width: '100% !important',
        maxWidth: '100% !important',
        minHeight: '0 !important',
        height: 'auto !important',
        margin: '0 !important',
        padding: '0 !important',
        boxSizing: 'border-box !important',
        pointerEvents: 'auto !important',
      },
      // React-Admin FilterFormInput spacer + clearfix
      '& .filter-field > div:last-child:not(:first-child)': {
        display: 'none !important',
      },
      '& .RaFilterForm-clearfix, & [class*="clearfix"], & form[class*="RaFilterForm"] > div:last-child:not(.filter-field)':
        {
          display: 'none !important',
        },
      '& .filter-field, & div[class*="filter-field"]': {
        display: 'block !important',
        width: '100% !important',
        maxWidth: '100% !important',
        margin: '0 !important',
        padding: '0 !important',
        boxSizing: 'border-box !important',
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
        paddingBottom: theme.spacing(4),
      },
    },
  },
  appFrame: {
    [theme.breakpoints.down('sm')]: {
      marginTop: '0 !important',
      paddingTop: '0 !important',
    },
  },
  contentWithSidebar: {
    [theme.breakpoints.down('sm')]: {
      marginTop: '0 !important',
      paddingTop: '0 !important',
    },
  },
  content: {
    [theme.breakpoints.down('sm')]: {
      marginTop: '0 !important',
      paddingTop: '0 !important',
      padding: '0 !important',
    },
  },
  children: {
    [theme.breakpoints.down('sm')]: {
      marginTop: '0 !important',
      paddingTop: '0 !important',
      padding: '0 !important',
    },
  },
}))

const Layout = (props) => {
  const themeConfig = useCurrentTheme()
  const muiTheme = useMemo(() => createTheme(themeConfig), [themeConfig])
  const queue = useSelector((state) => state.player?.queue)
  const classes = useStyles({ addPadding: queue.length > 0 })
  const dispatch = useDispatch()
  useSearchRefocus()

  return (
    <>
      <RALayout
        {...props}
        className={classes.root}
        classes={{
          appFrame: classes.appFrame,
          contentWithSidebar: classes.contentWithSidebar,
          content: classes.content,
          children: classes.children,
        }}
        menu={Menu}
        appBar={AppBar}
        theme={themeConfig}
        notification={Notification}
      />
      <MuiThemeProvider theme={muiTheme}>
        <MobileBottomNav />
      </MuiThemeProvider>
    </>
  )
}

export default Layout

