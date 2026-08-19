import { alpha, makeStyles } from '@material-ui/core/styles'

export const desktopPlayerDefaultWidth = 480
export const desktopPlayerMinWidth = 420
export const desktopPlayerMaxWidth = 720
export const desktopLibraryMinWidth = 360
export const desktopPlayerWidthProperty = '--nd-player-width'
export const desktopPlayerWidth = `var(${desktopPlayerWidthProperty}, ${desktopPlayerDefaultWidth}px)`

export const clampDesktopPlayerWidth = (width, viewportWidth) => {
  const availableWidth = Number.isFinite(viewportWidth)
    ? viewportWidth - desktopLibraryMinWidth
    : desktopPlayerMaxWidth
  const maximumWidth = Math.max(
    desktopPlayerMinWidth,
    Math.min(desktopPlayerMaxWidth, availableWidth),
  )
  const requestedWidth = Number.isFinite(width)
    ? width
    : desktopPlayerDefaultWidth
  return Math.min(maximumWidth, Math.max(desktopPlayerMinWidth, requestedWidth))
}

const useStyle = makeStyles(
  (theme) => ({
    audioTitle: {
      textDecoration: 'none',
      color: theme.palette.primary.dark,
    },
    songTitle: {
      fontWeight: 'bold',
      '&:hover + $qualityInfo': {
        opacity: 1,
      },
    },
    songInfo: {
      display: 'block',
      marginTop: '2px',
    },
    qualityInfo: {
      marginTop: '-4px',
      opacity: 0,
      transition: 'all 500ms ease-out',
    },
    ambientBackdrop: {
      position: 'fixed',
      top: theme.spacing(6),
      right: 0,
      bottom: 0,
      width: desktopPlayerWidth,
      zIndex: 98,
      overflow: 'hidden',
      pointerEvents: 'none',
      display: (props) => (props.visible && props.isDesktop ? 'block' : 'none'),
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-25%',
        left: '-25%',
        width: '150%',
        height: '150%',
        backgroundImage: (props) =>
          props.coverUrl ? `url(${props.coverUrl})` : 'none',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(65px) saturate(220%) brightness(0.65)',
        transform: 'scale(1.2)',
        transition: 'background-image 0.8s ease-in-out, opacity 0.8s ease',
        opacity: (props) => (props.coverUrl ? 0.85 : 0),
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(180deg, rgba(12, 12, 18, 0.4) 0%, rgba(8, 8, 14, 0.75) 100%)',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    resizeHandle: {
      position: 'fixed',
      top: theme.spacing(6),
      right: desktopPlayerWidth,
      bottom: 0,
      zIndex: 1001,
      display: (props) => (props.visible ? 'block' : 'none'),
      width: 12,
      padding: 0,
      background: 'transparent',
      border: 0,
      cursor: 'col-resize',
      touchAction: 'none',
      transform: 'translateX(50%)',
      '&::after': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: 2,
        background: theme.palette.divider,
        content: '""',
        opacity: 0.65,
        transform: 'translateX(-50%)',
        transition: theme.transitions.create(['width', 'background-color']),
      },
      '&:hover::after, &:focus-visible::after': {
        width: 4,
        background: theme.palette.primary.main,
      },
      '&:focus-visible': {
        outline: 'none',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    '@keyframes mobileSlideUp': {
      '0%': {
        transform: 'translate3d(0, 100%, 0)',
        opacity: 0.3,
      },
      '100%': {
        transform: 'translate3d(0, 0, 0)',
        opacity: 1,
      },
    },
    player: {
      display: (props) => (props.visible ? 'block' : 'none'),
      '@media screen and (max-width:810px)': {
        '& .sound-operation': {
          display: 'none',
        },
      },
      '@media screen and (max-width:767px)': {
        '& > .react-jinke-music-player': {
          display: 'none !important',
        },
        '& .react-jinke-music-player-mobile': {
          position: 'fixed !important',
          zIndex: '1400 !important',
          boxSizing: 'border-box !important',
          overflow: 'hidden !important',
          backgroundColor: '#0c0c12 !important',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          willChange: 'transform, border-radius, top, bottom, left, right, height, opacity',
          transition:
            'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.38s cubic-bezier(0.32, 0.72, 0, 1), top 0.38s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.38s cubic-bezier(0.32, 0.72, 0, 1), left 0.38s cubic-bezier(0.32, 0.72, 0, 1), right 0.38s cubic-bezier(0.32, 0.72, 0, 1), height 0.38s cubic-bezier(0.32, 0.72, 0, 1), padding 0.38s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.38s ease, background-color 0.38s ease',
          WebkitTapHighlightColor: 'transparent !important',
          outline: 'none !important',
          userSelect: 'none !important',
          '&, & *, & *:focus, & *:focus-visible, & *:active, & *:hover': {
            WebkitTapHighlightColor: 'transparent !important',
            outline: 'none !important',
          },
          '& .react-jinke-music-player-mobile-cover': {
            transform: 'translateZ(0)',
            transition:
              'width 0.38s cubic-bezier(0.32, 0.72, 0, 1), height 0.38s cubic-bezier(0.32, 0.72, 0, 1), max-height 0.38s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.38s cubic-bezier(0.32, 0.72, 0, 1), margin 0.38s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.38s ease !important',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            backgroundImage: (props) =>
              props.coverUrl ? `url(${props.coverUrl})` : 'none',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(65px) saturate(220%) brightness(0.65)',
            transform: 'scale(1.2)',
            transition: 'background-image 0.8s ease-in-out, opacity 0.8s ease',
            opacity: (props) => (props.coverUrl ? 0.85 : 0),
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(180deg, rgba(12, 12, 18, 0.35) 0%, rgba(8, 8, 14, 0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
            flex: '0 0 auto !important',
          },
        },
        // Dragging State (disable transitions during real-time tracking)
        '& .react-jinke-music-player-mobile.nd-mobile-dragging': {
          transition: 'none !important',
          '&, & *': {
            transition: 'none !important',
          },
        },
        // Collapsed (Mini Bar) State
        '& .react-jinke-music-player-mobile:not(.nd-mobile-expanded), & .react-jinke-music-player-mobile.nd-mobile-collapsed':
          {
            top: 'calc(100dvh - 84px - 80px - env(safe-area-inset-bottom)) !important',
            bottom: 'auto !important',
            left: 'max(10px, env(safe-area-inset-left)) !important',
            right: 'max(10px, env(safe-area-inset-right)) !important',
            width: 'auto !important',
            maxWidth: 'none !important',
            height: '84px !important',
            borderRadius: '18px !important',
            padding: '0 !important',
            display: 'flex !important',
            flexDirection: 'row !important',
            alignItems: 'center !important',
            justifyContent: 'flex-start !important',
            border: '1px solid rgba(255, 255, 255, 0.12) !important',
            boxShadow:
              '0 10px 36px rgba(0, 0, 0, 0.55), 0 3px 10px rgba(0, 0, 0, 0.35) !important',
            backdropFilter: 'blur(28px) saturate(190%) !important',
            WebkitBackdropFilter: 'blur(28px) saturate(190%) !important',
            cursor: 'pointer !important',
            touchAction: 'none !important',
            '& .react-jinke-music-player-mobile-cover': {
              position: 'absolute !important',
              left: '0 !important',
              top: '0 !important',
              bottom: '0 !important',
              width: '84px !important',
              height: '84px !important',
              maxHeight: '84px !important',
              aspectRatio: '1 / 1 !important',
              margin: '0 !important',
              borderRadius: '0 !important',
              border: '0 !important',
              boxShadow: 'none !important',
              overflow: 'hidden !important',
              zIndex: '2 !important',
              '& .nd-artwork-carousel': {
                pointerEvents: 'none !important',
                touchAction: 'none !important',
                borderRadius: '0 !important',
              },
              '&:has(.nd-lyrics-canvas) img.cover, &:has(.nd-artwork-carousel) img.cover': {
                opacity: '0 !important',
                visibility: 'hidden !important',
              },
              '& img.cover': {
                width: '100% !important',
                height: '100% !important',
                objectFit: 'cover !important',
                borderRadius: '0 !important',
                animation: 'none !important',
                transform: 'none !important',
              },
            },
            '& .react-jinke-music-player-mobile-header': {
              position: 'absolute !important',
              left: '96px !important',
              right: '76px !important',
              top: '0 !important',
              bottom: '0 !important',
              margin: '0 !important',
              padding: '0 !important',
              display: 'flex !important',
              flexDirection: 'column !important',
              justifyContent: 'center !important',
              alignItems: 'flex-start !important',
              textAlign: 'left !important',
              zIndex: '2 !important',
              '&::before': {
                display: 'none !important',
              },
              '& .react-jinke-music-player-mobile-header-title': {
                width: '100% !important',
                textAlign: 'left !important',
                padding: '0 !important',
                '& .songTitle': {
                  fontSize: '1.02rem !important',
                  fontWeight: '700 !important',
                  color: '#ffffff !important',
                  display: 'block !important',
                  lineHeight: '1.35 !important',
                  whiteSpace: 'nowrap !important',
                  overflow: 'hidden !important',
                  textOverflow: 'ellipsis !important',
                  textAlign: 'left !important',
                },
                '& .songArtist': {
                  fontSize: '0.88rem !important',
                  fontWeight: '500 !important',
                  color: 'rgba(255, 255, 255, 0.72) !important',
                  display: 'block !important',
                  marginTop: '3px !important',
                  lineHeight: '1.3 !important',
                  whiteSpace: 'nowrap !important',
                  overflow: 'hidden !important',
                  textOverflow: 'ellipsis !important',
                  textAlign: 'left !important',
                },
              },
            },
            '& .react-jinke-music-player-mobile-toggle': {
              position: 'absolute !important',
              right: '12px !important',
              top: '16px !important',
              transform: 'none !important',
              height: '52px !important',
              minHeight: '52px !important',
              width: '52px !important',
              margin: '0 !important',
              padding: '0 !important',
              zIndex: '3 !important',
              display: 'flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              '& .group:not(.play-btn):not(.loading-icon)': {
                display: 'inline-flex !important',
                opacity: '0 !important',
                pointerEvents: 'none !important',
                transform: 'scale(0.85) translateY(8px) !important',
                transition: 'opacity 0.18s ease, transform 0.18s ease !important',
              },
              '& .play-btn, & .loading-icon': {
                display: 'inline-flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
                width: '52px !important',
                height: '52px !important',
                minWidth: '52px !important',
                minHeight: '52px !important',
                margin: '0 !important',
                padding: '0 !important',
                backgroundColor: 'rgba(255, 255, 255, 0.12) !important',
                borderRadius: '50% !important',
                boxShadow: 'none !important',
                cursor: 'pointer !important',
                transition:
                  'width 0.38s cubic-bezier(0.32, 0.72, 0, 1), height 0.38s cubic-bezier(0.32, 0.72, 0, 1), min-width 0.38s cubic-bezier(0.32, 0.72, 0, 1), min-height 0.38s cubic-bezier(0.32, 0.72, 0, 1), background-color 0.28s ease, margin 0.38s cubic-bezier(0.32, 0.72, 0, 1) !important',
                '& svg': {
                  color: '#ffffff !important',
                  fill: '#ffffff !important',
                  fontSize: '32px !important',
                  transition: 'font-size 0.38s cubic-bezier(0.32, 0.72, 0, 1), fill 0.28s ease !important',
                },
              },
            },
            '& .react-jinke-music-player-mobile-progress': {
              position: 'absolute !important',
              top: '0 !important',
              left: '0 !important',
              right: '0 !important',
              height: '3.5px !important',
              margin: '0 !important',
              padding: '0 !important',
              zIndex: '4 !important',
              pointerEvents: 'none !important',
              '& .current-time, & .duration, & .rc-slider-handle': {
                opacity: '0 !important',
                pointerEvents: 'none !important',
                transition: 'opacity 0.18s ease !important',
              },
              '& .rc-slider': {
                height: '3.5px !important',
                padding: '0 !important',
              },
              '& .rc-slider-rail': {
                height: '3.5px !important',
                backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
              },
              '& .rc-slider-track': {
                height: '3.5px !important',
                backgroundColor: '#31c27c !important',
              },
            },
            '& .react-jinke-music-player-mobile-operation': {
              opacity: '0 !important',
              pointerEvents: 'none !important',
              transform: 'scale(0.92) translateY(12px) !important',
              transition: 'opacity 0.18s ease, transform 0.18s ease !important',
            },
          },
        // Expanded (Full-Screen Player) State
        '& .react-jinke-music-player-mobile.nd-mobile-expanded': {
          top: '0 !important',
          left: '0 !important',
          right: '0 !important',
          bottom: 'auto !important',
          width: '100% !important',
          maxWidth: '100vw !important',
          height: '100dvh !important',
          borderRadius: '0 !important',
          display: 'flex !important',
          flexDirection: 'column !important',
          justifyContent: 'space-between !important',
          padding:
            'max(52px, calc(36px + env(safe-area-inset-top))) 20px max(16px, env(safe-area-inset-bottom)) !important',
          border: 'none !important',
          boxShadow: 'none !important',
          backdropFilter: 'none !important',
            '& .react-jinke-music-player-mobile-header': {
              position: 'relative !important',
              minHeight: 'auto !important',
              margin: '0 0 6px !important',
              padding: '16px 40px 0 !important',
              display: 'flex !important',
              justifyContent: 'center !important',
              alignItems: 'center !important',
              '&::before': {
              content: '""',
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 42,
              height: 4.5,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.55)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              zIndex: 10,
            },
            '& .react-jinke-music-player-mobile-header-title': {
              width: '100%',
              textAlign: 'center',
              padding: '0 !important',
              '& .songTitle': {
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                display: 'block',
                lineHeight: 1.25,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              },
              '& .songArtist': {
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.72)',
                display: 'block',
                marginTop: 3,
                lineHeight: 1.25,
              },
            },
          },
            '& .react-jinke-music-player-mobile-cover': {
              position: 'relative !important',
              width: 'min(80vw, 350px) !important',
              maxHeight: 'min(42vh, 350px) !important',
              aspectRatio: '1 / 1 !important',
              height: 'auto !important',
              margin: '2px auto 8px !important',
              border: '0 !important',
              borderRadius: '20px !important',
              boxShadow: '0 18px 44px rgba(0, 0, 0, 0.5) !important',
              overflow: 'hidden !important',
              '& .nd-artwork-carousel': {
                pointerEvents: 'auto !important',
                touchAction: 'pan-y !important',
                borderRadius: '20px !important',
              },
              '&:has(.nd-lyrics-canvas)': {
              backgroundColor: '#0c0c12 !important',
            },
            '&:has(.nd-lyrics-canvas) img.cover, &:has(.nd-artwork-carousel) img.cover': {
              opacity: '0 !important',
              visibility: 'hidden !important',
            },
            '& img.cover': {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'none !important',
              transform: 'none !important',
            },
          },
          '& .react-jinke-music-player-mobile-progress': {
            margin: '4px 0 2px !important',
            touchAction: 'none !important',
            '& .current-time, & .duration': {
              display: 'inline-block !important',
              minWidth: '42px !important',
              fontVariantNumeric: 'tabular-nums !important',
              textAlign: 'center !important',
              userSelect: 'none !important',
              opacity: '1 !important',
              pointerEvents: 'auto !important',
              transition: 'opacity 0.28s cubic-bezier(0.32, 0.72, 0, 1) 0.08s !important',
            },
            '& .rc-slider': {
              height: '14px !important',
              padding: '5px 0 !important',
              boxSizing: 'border-box !important',
              touchAction: 'none !important',
            },
            '& .rc-slider-rail': {
              height: '4px !important',
              borderRadius: '2px !important',
              backgroundColor: 'rgba(255, 255, 255, 0.25) !important',
              top: '50% !important',
              marginTop: '0 !important',
              transform: 'translateY(-50%) !important',
            },
            '& .rc-slider-track': {
              height: '4px !important',
              borderRadius: '2px !important',
              backgroundColor: '#ffffff !important',
              top: '50% !important',
              marginTop: '0 !important',
              transform: 'translateY(-50%) !important',
            },
            '& .rc-slider-handle': {
              display: 'block !important',
              width: '14px !important',
              height: '14px !important',
              top: '50% !important',
              marginTop: '0 !important',
              transform: 'translateY(-50%) !important',
              backgroundColor: '#ffffff !important',
              border: 'none !important',
              opacity: '1 !important',
              pointerEvents: 'auto !important',
              transition: 'opacity 0.28s cubic-bezier(0.32, 0.72, 0, 1) 0.08s !important',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.45) !important',
              '&:hover, &:active': {
                transform: 'translateY(-50%) scale(1.2) !important',
              },
            },
          },
          '& .react-jinke-music-player-mobile-toggle': {
            display: 'flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            height: '80px !important',
            minHeight: '80px !important',
            padding: '6px 0 2px !important',
            WebkitTapHighlightColor: 'transparent !important',
            userSelect: 'none !important',
            '& *': {
              WebkitTapHighlightColor: 'transparent !important',
              outline: 'none !important',
            },
            '& .group:not(.play-btn):not(.loading-icon)': {
              display: 'inline-flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              width: '44px !important',
              height: '44px !important',
              WebkitTapHighlightColor: 'transparent !important',
              outline: 'none !important',
              userSelect: 'none !important',
              touchAction: 'manipulation !important',
              cursor: 'pointer !important',
              color: '#ffffff !important',
              opacity: '1 !important',
              pointerEvents: 'auto !important',
              transform: 'none !important',
              transition: 'opacity 0.28s cubic-bezier(0.32, 0.72, 0, 1) 0.08s, transform 0.28s cubic-bezier(0.32, 0.72, 0, 1) 0.08s !important',
              '&:focus, &:focus-visible, &:active, &:hover': {
                outline: 'none !important',
                color: '#ffffff !important',
              },
              '& svg, &:hover svg, &:focus svg, &:focus-visible svg, &:active svg': {
                color: '#ffffff !important',
                fill: '#ffffff !important',
                outline: 'none !important',
                fontSize: '34px !important',
              },
            },
            '& .play-btn, & .loading-icon': {
              display: 'inline-flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              width: '72px !important',
              height: '72px !important',
              minWidth: '72px !important',
              minHeight: '72px !important',
              margin: '0 24px !important',
              padding: '0 !important',
              color: '#121212 !important',
              backgroundColor: '#ffffff !important',
              borderRadius: '50% !important',
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.45) !important',
              WebkitTapHighlightColor: 'transparent !important',
              outline: 'none !important',
              border: 'none !important',
              userSelect: 'none !important',
              touchAction: 'manipulation !important',
              cursor: 'pointer !important',
              transition:
                'width 0.38s cubic-bezier(0.32, 0.72, 0, 1), height 0.38s cubic-bezier(0.32, 0.72, 0, 1), min-width 0.38s cubic-bezier(0.32, 0.72, 0, 1), min-height 0.38s cubic-bezier(0.32, 0.72, 0, 1), background-color 0.28s ease, margin 0.38s cubic-bezier(0.32, 0.72, 0, 1) !important',
              '&:focus, &:focus-visible, &:active': {
                outline: 'none !important',
                boxShadow: '0 8px 26px rgba(0, 0, 0, 0.45) !important',
              },
              '& svg, &:hover svg, &:focus svg, &:focus-visible svg, &:active svg': {
                color: '#121212 !important',
                fill: '#121212 !important',
                fontSize: '38px !important',
                outline: 'none !important',
                transform: 'none !important',
                transition: 'font-size 0.38s cubic-bezier(0.32, 0.72, 0, 1), fill 0.28s ease !important',
              },
            },
          },
          '& .react-jinke-music-player-mobile-operation': {
            animation: 'none !important',
            transform: 'none !important',
            width: '100% !important',
            padding: '0 !important',
            margin: '0 !important',
            boxSizing: 'border-box !important',
            display: 'block !important',
            opacity: '1 !important',
            pointerEvents: 'auto !important',
            transition: 'opacity 0.28s cubic-bezier(0.32, 0.72, 0, 1) 0.08s, transform 0.28s cubic-bezier(0.32, 0.72, 0, 1) 0.08s !important',
            '& .items': {
              display: 'flex !important',
              flexWrap: 'wrap !important',
              alignItems: 'center !important',
              justifyContent: 'space-around !important',
              width: '100% !important',
              padding: '0 !important',
              margin: '0 !important',
              listStyle: 'none !important',
              '& > li:not(.mobile-volume-control)': {
                order: 2,
                flex: '1 1 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                touchAction: 'manipulation !important',
                cursor: 'pointer !important',
                '& *': {
                  touchAction: 'manipulation !important',
                  cursor: 'pointer !important',
                },
              },
              '& > .mobile-volume-control': {
                order: 1,
                flex: '0 0 100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '-6px 0 14px 0',
                padding: 0,
              },
            },
          },
        },
        // Active interactive dragging state (no lag, 1:1 finger tracking)
        '& .react-jinke-music-player-mobile.nd-mobile-dragging': {
          transition: 'none !important',
          '& *': {
            transition: 'none !important',
          },
        },
        '& .react-jinke-music-player-mobile-singer, & .react-jinke-music-player-mobile-switch, & .react-jinke-music-player-mobile-play-model-tip':
          {
            display: 'none !important',
            height: '0 !important',
            margin: '0 !important',
            padding: '0 !important',
            flex: '0 0 0 !important',
          },
        '& .react-jinke-music-player-mobile-header, & .react-jinke-music-player-mobile-header-right, & .player-corner-menu':
          {
            zIndex: '1600 !important',
            touchAction: 'manipulation !important',
            cursor: 'pointer !important',
            '& *': {
              touchAction: 'manipulation !important',
              cursor: 'pointer !important',
            },
          },
        '& .music-player-lyric, & .react-draggable:has(.music-player-lyric)': {
          display: 'none !important',
          visibility: 'hidden !important',
          pointerEvents: 'none !important',
        },
      },
      '@media (prefers-reduced-motion)': {
        '& .music-player-panel .panel-content div.img-rotate': {
          animation: 'none',
        },
      },
      '& .progress-bar-content': {
        display: 'flex',
        flexDirection: 'column',
      },
      '& .play-mode-title, & .react-jinke-music-player-mobile-play-model-tip': {
        display: 'none !important',
      },
      '& .music-player-panel .panel-content div.img-rotate': {
        // Customize desktop player when cover animation is disabled
        animationDuration: (props) => !props.enableCoverAnimation && '0s',
        borderRadius: (props) => !props.enableCoverAnimation && '0',
        // Fix cover display when image is not square
        backgroundSize: 'contain',
        backgroundPosition: 'center',
      },
      '& .react-jinke-music-player-mobile .react-jinke-music-player-mobile-cover':
        {
          // Customize mobile player when cover animation is disabled
          borderRadius: (props) => !props.enableCoverAnimation && '0',
          width: (props) => !props.enableCoverAnimation && '85%',
          maxWidth: (props) => !props.enableCoverAnimation && '600px',
          height: (props) => !props.enableCoverAnimation && 'auto',
          // Fix cover display when image is not square
          aspectRatio: '1/1',
          display: 'flex',
        },
      '& .react-jinke-music-player-mobile .react-jinke-music-player-mobile-cover img.cover':
        {
          animationDuration: (props) => !props.enableCoverAnimation && '0s',
          objectFit: 'contain', // Fix cover display when image is not square
        },
      // Hide old singer display
      '& .react-jinke-music-player-mobile .react-jinke-music-player-mobile-singer':
        {
          display: 'none',
        },
      // Hide extra whitespace from switch div
      '& .react-jinke-music-player-mobile .react-jinke-music-player-mobile-switch':
        {
          display: 'none',
        },
      '& .music-player-panel .panel-content .progress-bar-content section.audio-main':
        {
          display: (props) => (props.isRadio ? 'none' : 'inline-flex'),
        },
      '& .react-jinke-music-player-mobile-progress': {
        display: (props) => (props.isRadio ? 'none' : 'flex'),
      },
      [theme.breakpoints.up('md')]: {
        '& .music-player-panel': {
          top: theme.spacing(6),
          right: 0,
          bottom: 0,
          left: 'auto',
          width: desktopPlayerWidth,
          height: `calc(100vh - ${theme.spacing(6)}px)`,
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: theme.shadows[8],
          backgroundColor: 'rgba(15, 15, 22, 0.35) !important',
          backdropFilter: 'blur(30px)',
          overflow: 'hidden',
        },
        '& .music-player-panel .glass-bg-container': {
          position: 'absolute',
          top: '-15%',
          left: '-15%',
          width: '130%',
          height: '130%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          filter: 'blur(70px) saturate(180%) brightness(0.55)',
          opacity: 0.65,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background-image 0.6s ease',
        },
        '& .music-player-panel .panel-content': {
          position: 'relative',
          zIndex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: theme.spacing(3),
          overflowY: 'auto',
          backgroundColor: 'transparent !important',
        },
        '& .music-player-panel .panel-content .img-content': {
          position: 'relative !important',
          overflow: 'hidden !important',
          flex: '0 0 auto',
          width: 'min(100%, 400px)',
          height: 'auto',
          aspectRatio: '1 / 1',
          marginTop: theme.spacing(1),
          borderRadius: theme.spacing(2.5),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.55)',
          animation: 'none !important',
          transform: 'none !important',
          '&:has(.nd-lyrics-canvas)': {
            backgroundImage: 'none !important',
            backgroundColor: '#0c0c12 !important',
          },
          '&:has(.nd-artwork-carousel)': {
            backgroundImage: 'none !important',
          },
          '&:has(.nd-artwork-carousel) .img-rotate': {
            opacity: '0 !important',
            visibility: 'hidden !important',
          },
          '& .img-rotate': {
            animation: 'none !important',
            transform: 'none !important',
          },
        },
        '& .music-player-panel .panel-content .progress-bar-content': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: '0 0 auto',
          width: '100%',
          padding: theme.spacing(2.5, 0, 1),
          textAlign: 'center',
        },
        '& .music-player-panel .panel-content .progress-bar-content .audio-title':
          {
            display: 'block !important',
            width: '100%',
            marginBottom: `${theme.spacing(1.5)}px !important`,
            fontSize: '1.1rem',
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#ffffff !important',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        '& .music-player-panel .panel-content .progress-bar-content .audio-main':
          {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            margin: 0,
          },
        '& .music-player-panel .panel-content .progress-bar-content .audio-main .current-time, & .music-player-panel .panel-content .progress-bar-content .audio-main .duration':
          {
            flexBasis: 42,
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#ffffff !important',
            opacity: 0.9,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
          },
        '& .music-player-panel .panel-content .progress-bar-content .audio-main .progress-bar':
          {
            flex: 1,
            margin: theme.spacing(0, 1.5),
          },
        '& .music-player-panel .panel-content .progress-bar-content .rc-slider':
          {
            height: '14px !important',
            padding: '5px 0 !important',
            boxSizing: 'border-box !important',
          },
        '& .music-player-panel .panel-content .progress-bar-content .rc-slider-rail':
          {
            height: '5px !important',
            borderRadius: '2.5px !important',
            backgroundColor: 'rgba(255, 255, 255, 0.25) !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
          },
        '& .music-player-panel .panel-content .progress-bar-content .rc-slider-track':
          {
            height: '5px !important',
            borderRadius: '2.5px !important',
            backgroundColor: '#ffffff !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
          },
        '& .music-player-panel .panel-content .progress-bar-content .rc-slider-handle':
          {
            width: '14px !important',
            height: '14px !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
            backgroundColor: '#ffffff !important',
            border: 'none !important',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45) !important',
            transition: 'transform 0.15s ease',
            '&:hover, &:active': {
              transform: 'translateY(-50%) scale(1.2) !important',
            },
          },
        '& .music-player-panel .panel-content .player-content': {
          display: 'flex !important',
          flexWrap: 'wrap !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          width: '100% !important',
          padding: '0 !important',
          margin: '0 !important',
        },
        // Row 1: Primary Playback Controls (Prev, Big Play/Pause Circle, Next)
        '& .music-player-panel .panel-content .player-content > .group:first-child':
          {
            order: '1 !important',
            flex: '0 0 100% !important',
            display: 'flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            margin: `${theme.spacing(2.5)}px 0 ${theme.spacing(1)}px !important`,
            gap: `${theme.spacing(2)}px !important`,
          },
        '& .music-player-panel .panel-content .player-content .prev-audio, & .music-player-panel .panel-content .player-content .next-audio':
          {
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            width: '48px !important',
            height: '48px !important',
            borderRadius: '50% !important',
            backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
            color: '#ffffff !important',
            cursor: 'pointer !important',
            outline: 'none !important',
            border: 'none !important',
            WebkitTapHighlightColor: 'transparent !important',
            userSelect: 'none !important',
            transition: theme.transitions.create(
              ['background-color', 'transform'],
              {
                duration: theme.transitions.duration.shortest,
              },
            ),
            '&:focus, &:focus-visible, &:active': {
              outline: 'none !important',
              color: '#ffffff !important',
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.18) !important',
              transform: 'scale(1.1) !important',
              color: '#ffffff !important',
            },
            '&:active': {
              transform: 'scale(0.92) !important',
              color: '#ffffff !important',
            },
          },
        '& .music-player-panel .panel-content .player-content .prev-audio': {
          marginRight: `${theme.spacing(2)}px !important`,
        },
        '& .music-player-panel .panel-content .player-content .play-btn, & .music-player-panel .panel-content .player-content .loading-icon':
          {
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            width: '68px !important',
            height: '68px !important',
            minWidth: '68px !important',
            minHeight: '68px !important',
            padding: '0 !important',
            margin: `0 ${theme.spacing(2)}px !important`,
            borderRadius: '50% !important',
            backgroundColor: '#ffffff !important',
            color: '#121212 !important',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45) !important',
            cursor: 'pointer !important',
            outline: 'none !important',
            border: 'none !important',
            WebkitTapHighlightColor: 'transparent !important',
            userSelect: 'none !important',
            transition: theme.transitions.create(
              ['transform', 'box-shadow', 'background-color'],
              {
                duration: theme.transitions.duration.shortest,
              },
            ),
            '&:focus, &:focus-visible, &:active': {
              outline: 'none !important',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45) !important',
            },
            '&:hover': {
              transform: 'scale(1.06) !important',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.55) !important',
            },
            '&:active': {
              transform: 'scale(0.94) !important',
            },
          },
        '& .music-player-panel .panel-content .player-content .next-audio': {
          marginLeft: `${theme.spacing(2)}px !important`,
        },
        '& .music-player-panel .panel-content .player-content .prev-audio svg, & .music-player-panel .panel-content .player-content .next-audio svg, & .music-player-panel .panel-content .player-content .prev-audio:hover svg, & .music-player-panel .panel-content .player-content .next-audio:hover svg, & .music-player-panel .panel-content .player-content .prev-audio:focus svg, & .music-player-panel .panel-content .player-content .next-audio:focus svg, & .music-player-panel .panel-content .player-content .prev-audio:active svg, & .music-player-panel .panel-content .player-content .next-audio:active svg':
          {
            fontSize: '28px !important',
            color: '#ffffff !important',
            fill: '#ffffff !important',
            outline: 'none !important',
          },
        '& .music-player-panel .panel-content .player-content .play-btn svg, & .music-player-panel .panel-content .player-content .play-btn:hover svg, & .music-player-panel .panel-content .player-content .play-btn:focus svg, & .music-player-panel .panel-content .player-content .play-btn:active svg, & .music-player-panel .panel-content .player-content .loading-icon svg, & .music-player-panel .panel-content .player-content .loading-icon:hover svg, & .music-player-panel .panel-content .player-content .loading-icon:focus svg, & .music-player-panel .panel-content .player-content .loading-icon:active svg': {
          fontSize: '34px !important',
          color: '#121212 !important',
          fill: '#121212 !important',
          outline: 'none !important',
          transform: 'none !important',
        },
        // Row 2: Centered Volume Control (Speaker Icon + Slider side-by-side)
        '& .music-player-panel .panel-content .player-content .play-sounds': {
          order: '2 !important',
          flex: '0 0 100% !important',
          display: 'flex !important',
          flexDirection: 'row !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          margin: `${theme.spacing(2.5)}px 0 ${theme.spacing(1.5)}px !important`,
          padding: '0 !important',
          gap: `${theme.spacing(1.5)}px !important`,
        },
        '& .music-player-panel .panel-content .player-content .play-sounds .sounds-icon':
          {
            display: 'inline-flex !important',
            flex: '0 0 auto !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            margin: '0 !important',
            padding: '0 !important',
            cursor: 'pointer !important',
          },
        '& .music-player-panel .panel-content .player-content .play-sounds .sounds-icon > svg':
          {
            fontSize: '22px !important',
            color: 'rgba(255, 255, 255, 0.85) !important',
            transition: 'color 0.2s ease !important',
            '&:hover': {
              color: '#ffffff !important',
            },
          },
        '& .music-player-panel .panel-content .player-content .play-sounds .sound-operation':
          {
            width: '190px !important',
            flex: '0 0 190px !important',
            position: 'relative !important',
            display: 'flex !important',
            alignItems: 'center !important',
            margin: '0 !important',
            padding: '0 !important',
          },
        '& .music-player-panel .panel-content .player-content .play-sounds .sound-operation .rc-slider':
          {
            width: '100% !important',
            height: '14px !important',
            padding: '5px 0 !important',
            boxSizing: 'border-box !important',
          },
        '& .music-player-panel .panel-content .player-content .play-sounds .sound-operation .rc-slider-rail':
          {
            height: '4px !important',
            borderRadius: '2px !important',
            backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
          },
        '& .music-player-panel .panel-content .player-content .play-sounds .sound-operation .rc-slider-track':
          {
            height: '4px !important',
            borderRadius: '2px !important',
            backgroundColor: '#ffffff !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
          },
        '& .music-player-panel .panel-content .player-content .play-sounds .sound-operation .rc-slider-handle, & .rc-slider-handle':
          {
            width: '14px !important',
            height: '14px !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
            backgroundColor: '#ffffff !important',
            border: 'none !important',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4) !important',
            '&:hover, &:active': {
              transform: 'translateY(-50%) scale(1.2) !important',
            },
          },
        // Row 3: Secondary Utility Toolbar (Save, Love, Lyrics, Loop, Queue, Destroy in ONE neat centered row)
        '& .music-player-panel .panel-content .player-content > li, & .music-player-panel .panel-content .player-content .desktop-toolbar':
          {
            order: '3 !important',
            flex: '0 0 auto !important',
            display: 'inline-flex !important',
            flexDirection: 'row !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            gap: `${theme.spacing(1.5)}px !important`,
            margin: `${theme.spacing(2.5)}px ${theme.spacing(1)}px 0 !important`,
            padding: '0 !important',
            listStyle: 'none !important',
          },
        '& .music-player-panel .panel-content .player-content .desktop-toolbar button':
          {
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            width: '38px !important',
            height: '38px !important',
            borderRadius: '50% !important',
            backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
            color: '#ffffff !important',
            border: 'none !important',
            cursor: 'pointer !important',
            transition: theme.transitions.create(
              ['background-color', 'transform'],
              {
                duration: theme.transitions.duration.shortest,
              },
            ),
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.18) !important',
              transform: 'scale(1.1) !important',
            },
            '& svg': {
              fontSize: '20px !important',
              color: '#ffffff !important',
            },
          },
        '& .music-player-panel .panel-content .player-content .lyric-btn, & .music-player-panel .panel-content .player-content .loop-btn':
          {
            order: '3 !important',
            flex: '0 0 auto !important',
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            width: '38px !important',
            height: '38px !important',
            borderRadius: '50% !important',
            backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
            color: '#ffffff !important',
            margin: `${theme.spacing(2.5)}px ${theme.spacing(1)}px 0 !important`,
            cursor: 'pointer !important',
            transition: theme.transitions.create(
              ['background-color', 'transform'],
              {
                duration: theme.transitions.duration.shortest,
              },
            ),
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.18) !important',
              transform: 'scale(1.1) !important',
            },
            '&:active': {
              transform: 'scale(0.94) !important',
            },
          },
        '& .music-player-panel .panel-content .player-content .lyric-btn svg, & .music-player-panel .panel-content .player-content .loop-btn svg':
          {
            fontSize: '20px !important',
            color: '#ffffff !important',
            fill: 'currentColor !important',
          },
        // Floating Top-Left 3-Dots Context Menu Button
        '& .music-player-panel .panel-content .player-content .player-corner-menu':
          {
            position: 'absolute !important',
            top: `${theme.spacing(2)}px !important`,
            left: `${theme.spacing(2)}px !important`,
            zIndex: '1600 !important',
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
          },
        // Floating Top-Right Close ("X") Dismiss Button
        '& .music-player-panel .panel-content .player-content .destroy-btn': {
          position: 'absolute !important',
          top: `${theme.spacing(2)}px !important`,
          right: `${theme.spacing(2)}px !important`,
          zIndex: '1600 !important',
          display: 'inline-flex !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          width: '36px !important',
          height: '36px !important',
          borderRadius: '50% !important',
          backgroundColor: 'rgba(255, 255, 255, 0.12) !important',
          color: 'rgba(255, 255, 255, 0.85) !important',
          backdropFilter: 'blur(8px) !important',
          margin: '0 !important',
          cursor: 'pointer !important',
          transition: theme.transitions.create(
            ['background-color', 'transform', 'color'],
            {
              duration: theme.transitions.duration.shortest,
            },
          ),
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.25) !important',
            color: '#ffffff !important',
            transform: 'scale(1.08) !important',
          },
          '&:active': {
            transform: 'scale(0.92) !important',
          },
        },
        '& .music-player-panel .panel-content .player-content .destroy-btn svg':
          {
            fontSize: '20px !important',
            color: 'inherit !important',
            fill: 'currentColor !important',
          },
        '& .music-player-panel .panel-content .player-content .audio-lists-btn':
          {
            order: '3 !important',
            flex: '0 0 auto !important',
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            height: '38px !important',
            minWidth: '54px !important',
            boxSizing: 'border-box !important',
            margin: `${theme.spacing(2.5)}px ${theme.spacing(1)}px 0 !important`,
            padding: `${theme.spacing(0, 1.5)}px !important`,
            borderRadius: '19px !important',
            backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
            color: '#ffffff !important',
            fontSize: '0.8rem !important',
            fontWeight: '600 !important',
            cursor: 'pointer !important',
            verticalAlign: 'middle !important',
            lineHeight: '1 !important',
            gap: `${theme.spacing(0.75)}px !important`,
            transition: theme.transitions.create(
              ['background-color', 'transform'],
              {
                duration: theme.transitions.duration.shortest,
              },
            ),
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.18) !important',
              transform: 'scale(1.05) !important',
            },
            '& .audio-lists-icon, & .audio-lists-num': {
              display: 'inline-flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              lineHeight: '1 !important',
            },
            '& svg': {
              fontSize: '18px !important',
              color: '#ffffff !important',
              display: 'block !important',
              verticalAlign: 'middle !important',
            },
          },
        '& .audio-lists-panel': {
          top: theme.spacing(6),
          right: 0,
          bottom: 0,
          width: desktopPlayerWidth,
          height: `calc(100vh - ${theme.spacing(6)}px)`,
          borderRadius: 0,
        },
        '& .audio-lists-panel-content': {
          height: `calc(100vh - ${theme.spacing(6) + 50}px)`,
        },
      },
    },
  }),
  { name: 'NDAudioPlayer' },
)

export default useStyle
