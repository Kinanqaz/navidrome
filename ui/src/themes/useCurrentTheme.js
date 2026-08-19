import { useSelector } from 'react-redux'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import themes from './index'
import { AUTO_THEME_ID } from '../consts'
import config from '../config'
import { useEffect, useMemo } from 'react'

const useCurrentTheme = () => {
  // Runs above the ThemeProvider carrying the prop below, so it needs its own noSsr or the
  // auto theme renders dark first and flips.
  const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)', {
    noSsr: true,
  })
  const theme = useSelector((state) => {
    if (state.theme === AUTO_THEME_ID) {
      return prefersLightMode ? themes.LightTheme : themes.DarkTheme
    }
    const themeName =
      Object.keys(themes).find((t) => t === state.theme) ||
      Object.keys(themes).find(
        (t) => themes[t].themeName === config.defaultTheme,
      ) ||
      'DarkTheme'
    return themes[themeName]
  })

  useEffect(() => {
    const styles = document.getElementsByTagName('style')
    let style
    for (let i = 0; i < styles.length; i++) {
      if (styles[i].id === 'nd-player-style-override') {
        style = styles[i]
      }
    }
    if (theme.player.stylesheet) {
      if (style === undefined) {
        style = document.createElement('style')
        style.id = 'nd-player-style-override'
        style.innerHTML = theme.player.stylesheet
        document.head.appendChild(style)
      } else {
        style.innerHTML = theme.player.stylesheet
      }
    } else {
      if (style !== undefined) {
        document.head.removeChild(style)
      }
    }

    // Set body background color to match theme (fixes white background on pull-to-refresh)
    const isDark = theme.palette?.type === 'dark'
    const bgColor =
      theme.palette?.background?.default || (isDark ? '#303030' : '#fafafa')
    document.body.style.backgroundColor = bgColor
  }, [theme])

  return useMemo(() => {
    const rawDrawerOverrides = theme.overrides?.MuiDrawer || {}
    const { root: rawDrawerRoot, ...restDrawerOverrides } = rawDrawerOverrides
    const drawerBg =
      rawDrawerRoot?.background ||
      rawDrawerRoot?.backgroundColor ||
      theme.palette?.background?.default ||
      '#1d1d1d'

    return {
      ...theme,
      zIndex: {
        mobileStepper: 1000,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 1500,
        snackbar: 1600,
        tooltip: 1700,
        ...theme.zIndex,
      },
      overrides: {
        ...theme.overrides,
        MuiAppBar: {
          ...theme.overrides?.MuiAppBar,
          root: {
            backgroundColor: `${theme.palette?.background?.default || '#1d1d1d'} !important`,
            boxShadow: 'none !important',
            ...theme.overrides?.MuiAppBar?.root,
          },
          colorSecondary: {
            ...theme.overrides?.MuiAppBar?.colorSecondary,
            backgroundColor: `${theme.palette?.background?.default || '#1d1d1d'} !important`,
            color: `${theme.palette?.text?.primary || '#fff'} !important`,
          },
          colorPrimary: {
            ...theme.overrides?.MuiAppBar?.colorPrimary,
            backgroundColor: `${theme.palette?.background?.default || '#1d1d1d'} !important`,
            color: `${theme.palette?.text?.primary || '#fff'} !important`,
          },
          positionFixed: {
            ...theme.overrides?.MuiAppBar?.positionFixed,
            backgroundColor: `${theme.palette?.background?.default || '#1d1d1d'} !important`,
            boxShadow: 'none !important',
          },
        },
        MuiDrawer: {
          ...restDrawerOverrides,
          root: {
            ...rawDrawerRoot,
            background: 'transparent',
            backgroundColor: 'transparent',
            '&.MuiDrawer-modal': {
              background: 'transparent !important',
              backgroundColor: 'transparent !important',
            },
          },
          paper: {
            background: drawerBg,
            backgroundColor: drawerBg,
            ...theme.overrides?.MuiDrawer?.paper,
          },
          modal: {
            ...theme.overrides?.MuiDrawer?.modal,
            background: 'transparent !important',
            backgroundColor: 'transparent !important',
            '& .MuiBackdrop-root': {
              backgroundColor: 'transparent !important',
              backdropFilter: 'none !important',
              WebkitBackdropFilter: 'none !important',
            },
          },
        },
        RaLayout: {
          ...theme.overrides?.RaLayout,
          content: {
            padding: 0,
            paddingTop: 0,
            '@media (max-width: 959.95px)': {
              padding: '0 !important',
              paddingTop: '0 !important',
              marginTop: '0 !important',
            },
            ...theme.overrides?.RaLayout?.content,
          },
          appFrame: {
            '@media (max-width: 959.95px)': {
              paddingTop: '0 !important',
              marginTop: '0 !important',
            },
            ...theme.overrides?.RaLayout?.appFrame,
          },
          contentWithSidebar: {
            '@media (max-width: 959.95px)': {
              paddingTop: '0 !important',
              marginTop: '0 !important',
            },
            ...theme.overrides?.RaLayout?.contentWithSidebar,
          },
          children: {
            '@media (max-width: 959.95px)': {
              paddingTop: '0 !important',
              marginTop: '0 !important',
            },
            ...theme.overrides?.RaLayout?.children,
          },
        },
        RaList: {
          ...theme.overrides?.RaList,
          root: {
            '@media (max-width: 959.95px)': {
              marginTop: '0 !important',
              paddingTop: '0 !important',
              boxShadow: 'none !important',
            },
            ...theme.overrides?.RaList?.root,
          },
          main: {
            backgroundColor: 'transparent',
            '@media (max-width: 959.95px)': {
              marginTop: '0 !important',
              paddingTop: '0 !important',
              backgroundColor: 'transparent !important',
            },
            ...theme.overrides?.RaList?.main,
          },
          content: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '@media (max-width: 959.95px)': {
              marginTop: '0 !important',
              paddingTop: '0 !important',
              marginBottom: '0 !important',
              boxShadow: 'none !important',
              backgroundColor: 'transparent !important',
            },
            ...theme.overrides?.RaList?.content,
          },
          actions: {
            '@media (max-width: 959.95px)': {
              display: 'none !important',
              minHeight: '0 !important',
              height: '0 !important',
              margin: '0 !important',
              padding: '0 !important',
            },
            ...theme.overrides?.RaList?.actions,
          },
        },
        RaTopToolbar: {
          ...theme.overrides?.RaTopToolbar,
          root: {
            '@media (max-width: 959.95px)': {
              display: 'none !important',
              minHeight: '0 !important',
              height: '0 !important',
              margin: '0 !important',
              padding: '0 !important',
            },
            ...theme.overrides?.RaTopToolbar?.root,
          },
        },
        RaFilterForm: {
          ...theme.overrides?.RaFilterForm,
          root: {
            display: 'block !important',
            width: '100% !important',
            margin: '0 !important',
            padding: '0 !important',
            ...theme.overrides?.RaFilterForm?.root,
          },
          form: {
            display: 'block !important',
            width: '100% !important',
            margin: '0 !important',
            padding: '0 !important',
            ...theme.overrides?.RaFilterForm?.form,
          },
        },
        MuiCard: {
          ...theme.overrides?.MuiCard,
          root: {
            ...theme.overrides?.MuiCard?.root,
            '@media (max-width: 959.95px)': {
              marginTop: '0 !important',
              paddingTop: '0 !important',
              marginBottom: '0 !important',
              boxShadow: 'none !important',
            },
          },
        },
      },
      props: { ...theme.props, MuiUseMediaQuery: { noSsr: true } },
    }
  }, [theme])
}

export default useCurrentTheme
