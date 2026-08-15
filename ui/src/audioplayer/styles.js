import { makeStyles } from '@material-ui/core/styles'

export const desktopPlayerWidth = 400

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
          width: 'min(100%, 320px)',
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
            fontSize: 38,
          },
        '& .music-player-panel .panel-content .player-content .play-btn svg': {
          fontSize: 34,
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
          top: theme.spacing(6),
          right: 0,
          bottom: 0,
          left: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: desktopPlayerWidth,
          padding: theme.spacing(4),
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          fontSize: '1.4rem',
          lineHeight: 1.7,
          textShadow: 'none',
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
