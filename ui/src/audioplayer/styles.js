import { makeStyles } from '@material-ui/core/styles'

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
    songAlbum: {
      fontStyle: 'italic',
      fontSize: 'smaller',
    },
    qualityInfo: {
      marginTop: '-4px',
      opacity: 0,
      transition: 'all 500ms ease-out',
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
    player: {
      display: (props) => (props.visible ? 'block' : 'none'),
      '@media screen and (max-width:810px)': {
        '& .sound-operation': {
          display: 'none',
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
      '& .play-mode-title': {
        'pointer-events': 'none',
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
          borderLeft: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[8],
        },
        '& .music-player-panel .panel-content': {
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: theme.spacing(3),
          overflowY: 'auto',
        },
        '& .music-player-panel .panel-content .img-content': {
          flex: '0 0 auto',
          width: 'min(100%, 400px)',
          height: 'auto',
          aspectRatio: '1 / 1',
          marginTop: theme.spacing(1),
          borderRadius: theme.spacing(2),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: theme.shadows[8],
        },
        '& .music-player-panel .panel-content .progress-bar-content': {
          flex: '0 0 auto',
          width: '100%',
          padding: theme.spacing(3, 0, 2),
          textAlign: 'center',
        },
        '& .music-player-panel .panel-content .progress-bar-content .audio-title':
          {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
        '& .music-player-panel .panel-content .progress-bar-content .audio-main':
          {
            alignItems: 'center',
            marginTop: theme.spacing(2),
          },
        '& .music-player-panel .panel-content .progress-bar-content .audio-main .current-time, & .music-player-panel .panel-content .progress-bar-content .audio-main .duration':
          {
            flexBasis: 38,
            fontVariantNumeric: 'tabular-nums',
          },
        '& .music-player-panel .panel-content .progress-bar-content .audio-main .progress-bar':
          {
            margin: theme.spacing(0, 1.5),
          },
        '& .music-player-panel .panel-content .player-content': {
          display: 'flex',
          flex: '0 0 auto',
          flexBasis: 'auto',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          padding: 0,
          gap: theme.spacing(1),
        },
        '& .music-player-panel .panel-content .player-content > .group:first-child':
          {
            flex: '0 0 100%',
            justifyContent: 'center',
            margin: theme.spacing(0, 0, 1),
          },
        '& .music-player-panel .panel-content .player-content .prev-audio svg, & .music-player-panel .panel-content .player-content .next-audio svg':
          {
            fontSize: 48,
          },
        '& .music-player-panel .panel-content .player-content .play-btn svg': {
          fontSize: 52,
        },
        '& .music-player-panel .panel-content .player-content .play-btn': {
          padding: theme.spacing(0, 2.5),
        },
        '& .music-player-panel .panel-content .player-content .play-sounds': {
          flex: '1 0 100%',
          justifyContent: 'center',
          margin: theme.spacing(1, 0),
        },
        '& .music-player-panel .panel-content .player-content .play-sounds .sound-operation':
          {
            width: 180,
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
