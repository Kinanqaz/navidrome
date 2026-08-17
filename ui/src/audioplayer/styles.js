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
    mobileDragHandle: {
      position: 'fixed',
      top: 'max(14px, env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1401,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      height: 28,
      cursor: 'pointer',
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    mobileDragPill: {
      width: 38,
      height: 4.5,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      transition: 'background-color 0.15s ease, transform 0.15s ease',
      '$mobileDragHandle:hover &': {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        transform: 'scaleX(1.15)',
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
          top: '0 !important',
          left: '0 !important',
          right: '0 !important',
          bottom: '0 !important',
          zIndex: '1400 !important',
          width: '100% !important',
          maxWidth: '100vw !important',
          height: '100dvh !important',
          boxSizing: 'border-box !important',
          overflowX: 'hidden !important',
          display: 'flex !important',
          flexDirection: 'column !important',
          justifyContent: 'space-between !important',
          padding:
            'max(52px, calc(36px + env(safe-area-inset-top))) 20px max(16px, env(safe-area-inset-bottom)) !important',
          backgroundColor: '#0c0c12 !important',
          willChange: 'transform, opacity',
          animation: '$mobileSlideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
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
        '& .react-jinke-music-player-mobile-header': {
          minHeight: 'auto !important',
          margin: '10px 0 6px !important',
          padding: '0 40px !important',
          display: 'flex !important',
          justifyContent: 'center !important',
          alignItems: 'center !important',
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
        '& .react-jinke-music-player-mobile-singer, & .react-jinke-music-player-mobile-switch, & .react-jinke-music-player-mobile-play-model-tip':
          {
            display: 'none !important',
            height: '0 !important',
            margin: '0 !important',
            padding: '0 !important',
            flex: '0 0 0 !important',
          },
        '& .react-jinke-music-player-mobile-cover': {
          width: 'min(80vw, 350px) !important',
          maxHeight: 'min(42vh, 350px) !important',
          aspectRatio: '1 / 1 !important',
          height: 'auto !important',
          margin: '2px auto 8px !important',
          border: '0 !important',
          borderRadius: '20px !important',
          boxShadow: '0 18px 44px rgba(0, 0, 0, 0.5) !important',
          overflow: 'hidden !important',
        },
        '& .react-jinke-music-player-mobile-cover img.cover': {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          animation: 'none !important',
          transform: 'none !important',
        },
        '& .react-jinke-music-player-mobile-progress': {
          margin: '4px 0 2px !important',
          touchAction: 'none !important',
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
            width: '14px !important',
            height: '14px !important',
            top: '50% !important',
            marginTop: '0 !important',
            transform: 'translateY(-50%) !important',
            backgroundColor: '#ffffff !important',
            border: 'none !important',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.45) !important',
            '&:hover, &:active': {
              transform: 'translateY(-50%) scale(1.2) !important',
            },
          },
        },
        '& .react-jinke-music-player-mobile-toggle': {
          padding: '6px 0 2px !important',
          WebkitTapHighlightColor: 'transparent !important',
          userSelect: 'none !important',
          '& *': {
            WebkitTapHighlightColor: 'transparent !important',
            outline: 'none !important',
          },
        },
        '& .react-jinke-music-player-mobile-toggle .group': {
          WebkitTapHighlightColor: 'transparent !important',
          outline: 'none !important',
          userSelect: 'none !important',
          '&:focus, &:focus-visible, &:active': {
            outline: 'none !important',
          },
        },
        '& .react-jinke-music-player-mobile-toggle .play-btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          margin: '0 24px',
          padding: '0 !important',
          color: '#111',
          backgroundColor: '#fff',
          borderRadius: '50%',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
          WebkitTapHighlightColor: 'transparent !important',
          outline: 'none !important',
          border: 'none !important',
          userSelect: 'none !important',
          '&:focus, &:focus-visible, &:active': {
            outline: 'none !important',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35) !important',
          },
        },
        '& .react-jinke-music-player-mobile-toggle .play-btn svg': {
          color: '#111 !important',
          fontSize: '38px !important',
          outline: 'none !important',
        },
        // Operation section with full-width volume bar row + actions row
        '& .react-jinke-music-player-mobile-operation': {
          animation: 'none !important',
          transform: 'none !important',
          width: '100% !important',
          padding: '0 !important',
          margin: '0 !important',
          boxSizing: 'border-box !important',
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
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.18) !important',
              transform: 'scale(1.1) !important',
            },
            '&:active': {
              transform: 'scale(0.92) !important',
            },
          },
        '& .music-player-panel .panel-content .player-content .prev-audio': {
          marginRight: `${theme.spacing(2)}px !important`,
        },
        '& .music-player-panel .panel-content .player-content .play-btn': {
          display: 'inline-flex !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          width: '62px !important',
          height: '62px !important',
          padding: '0 !important',
          margin: `0 ${theme.spacing(2)}px !important`,
          borderRadius: '50% !important',
          backgroundColor: '#ffffff !important',
          color: '#121212 !important',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4) !important',
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
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4) !important',
          },
          '&:hover': {
            transform: 'scale(1.06) !important',
            boxShadow: '0 8px 26px rgba(0, 0, 0, 0.5) !important',
          },
          '&:active': {
            transform: 'scale(0.94) !important',
          },
        },
        '& .music-player-panel .panel-content .player-content .next-audio': {
          marginLeft: `${theme.spacing(2)}px !important`,
        },
        '& .music-player-panel .panel-content .player-content .prev-audio svg, & .music-player-panel .panel-content .player-content .next-audio svg':
          {
            fontSize: '28px !important',
            color: '#ffffff !important',
            fill: 'currentColor !important',
            outline: 'none !important',
          },
        '& .music-player-panel .panel-content .player-content .play-btn svg': {
          fontSize: '32px !important',
          color: '#121212 !important',
          fill: '#121212 !important',
          outline: 'none !important',
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
            zIndex: 10,
            display: 'inline-flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
          },
        // Floating Top-Right Close ("X") Dismiss Button
        '& .music-player-panel .panel-content .player-content .destroy-btn': {
          position: 'absolute !important',
          top: `${theme.spacing(2)}px !important`,
          right: `${theme.spacing(2)}px !important`,
          zIndex: 10,
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
        '& .music-player-lyric': {
          top: theme.spacing(10),
          right: `max(${theme.spacing(3)}px, calc((${desktopPlayerWidth} - 400px) / 2))`,
          bottom: 'auto',
          left: 'auto !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `min(calc(${desktopPlayerWidth} - ${theme.spacing(
            6,
          )}px), 400px)`,
          height: `min(calc(${desktopPlayerWidth} - ${theme.spacing(
            6,
          )}px), 400px)`,
          boxSizing: 'border-box',
          padding: theme.spacing(4),
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(2),
          boxShadow: theme.shadows[8],
          color: theme.palette.text.primary,
          fontSize: '1.4rem',
          lineHeight: 1.7,
          cursor: 'default',
          textShadow: 'none',
          transform: 'none !important',
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
