import { useEffect } from 'react'
import useCurrentTheme from './themes/useCurrentTheme'

const useChangeThemeColor = () => {
  const theme = useCurrentTheme()
  const color =
    theme.palette?.primary?.light || theme.palette?.primary?.main || '#ffffff'
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
