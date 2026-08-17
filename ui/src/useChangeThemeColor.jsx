import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import useCurrentTheme from './themes/useCurrentTheme'

const useChangeThemeColor = () => {
  const theme = useCurrentTheme()
  const isPhone = useMediaQuery('(max-width:767px)', { noSsr: true })
  const queueLength = useSelector((state) => state.player?.queue?.length || 0)

  const isDark = theme.palette?.type === 'dark'
  const appBgColor =
    theme.palette?.background?.default || (isDark ? '#1a1a1a' : '#fafafa')

  // When mobile player expands fullscreen, react-jinke-music-player uses dark gradient header background (#19191f)
  // Otherwise use the theme's background color so the phone notch blends with top app header
  const color = appBgColor

  useEffect(() => {
    let themeColor = document.querySelector("meta[name='theme-color']")
    if (!themeColor) {
      themeColor = document.createElement('meta')
      themeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(themeColor)
    }
    themeColor.setAttribute('content', color)
  }, [color])
}

export default useChangeThemeColor
