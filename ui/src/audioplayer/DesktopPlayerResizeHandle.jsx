import React, { useCallback, useEffect, useRef, useState } from 'react'
import useStyle, {
  clampDesktopPlayerWidth,
  desktopPlayerDefaultWidth,
  desktopPlayerMaxWidth,
  desktopPlayerMinWidth,
  desktopPlayerWidthProperty,
} from './styles'

const storageKey = 'desktopPlayerWidth'

const readStoredWidth = () => {
  try {
    const storedWidth = Number.parseInt(localStorage.getItem(storageKey), 10)
    return clampDesktopPlayerWidth(storedWidth, window.innerWidth)
  } catch {
    return clampDesktopPlayerWidth(desktopPlayerDefaultWidth, window.innerWidth)
  }
}

const DesktopPlayerResizeHandle = ({ visible }) => {
  const classes = useStyle({ visible })
  const [width, setWidth] = useState(readStoredWidth)
  const stopResizeRef = useRef(null)

  useEffect(() => {
    document.documentElement.style.setProperty(
      desktopPlayerWidthProperty,
      `${width}px`,
    )
    try {
      localStorage.setItem(storageKey, String(width))
    } catch {
      // The visual resize still works if browser storage is unavailable.
    }
  }, [width])

  useEffect(() => {
    const handleWindowResize = () =>
      setWidth((currentWidth) =>
        clampDesktopPlayerWidth(currentWidth, window.innerWidth),
      )
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  useEffect(() => () => stopResizeRef.current?.(), [])

  const resizeToPointer = useCallback((clientX) => {
    setWidth(
      clampDesktopPlayerWidth(window.innerWidth - clientX, window.innerWidth),
    )
  }, [])

  const handlePointerDown = useCallback(
    (event) => {
      event.preventDefault()
      stopResizeRef.current?.()
      resizeToPointer(event.clientX)

      const previousCursor = document.body.style.cursor
      const previousUserSelect = document.body.style.userSelect
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const handlePointerMove = (moveEvent) =>
        resizeToPointer(moveEvent.clientX)
      const stopResize = () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', stopResize)
        window.removeEventListener('pointercancel', stopResize)
        document.body.style.cursor = previousCursor
        document.body.style.userSelect = previousUserSelect
        stopResizeRef.current = null
      }

      stopResizeRef.current = stopResize
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', stopResize)
      window.addEventListener('pointercancel', stopResize)
    },
    [resizeToPointer],
  )

  const handleKeyDown = useCallback((event) => {
    const adjustments = {
      ArrowLeft: 24,
      ArrowRight: -24,
      Home: Number.NEGATIVE_INFINITY,
      End: Number.POSITIVE_INFINITY,
    }
    if (!(event.key in adjustments)) return
    event.preventDefault()
    setWidth((currentWidth) => {
      const adjustment = adjustments[event.key]
      const requestedWidth = Number.isFinite(adjustment)
        ? currentWidth + adjustment
        : adjustment < 0
          ? desktopPlayerMinWidth
          : desktopPlayerMaxWidth
      return clampDesktopPlayerWidth(requestedWidth, window.innerWidth)
    })
  }, [])

  return (
    <div
      aria-label="Resize player"
      aria-orientation="vertical"
      aria-valuemax={desktopPlayerMaxWidth}
      aria-valuemin={desktopPlayerMinWidth}
      aria-valuenow={width}
      className={classes.resizeHandle}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      role="separator"
      tabIndex={visible ? 0 : -1}
      title="Drag to resize player"
    />
  )
}

export default DesktopPlayerResizeHandle
