import { Provider } from 'react-redux'
import { createHashHistory } from 'history'
import {
  Admin as RAAdmin,
  Resource,
  useSetLocale,
  useRefresh,
} from 'react-admin'
import dataProvider from './dataProvider'
import authProvider from './authProvider'
import { Layout, Login, Logout } from './layout'
import player from './player'
import user from './user'
import song from './song'
import album from './album'
import artist from './artist'
import playlist from './playlist'
import library from './library'
import { Player } from './audioplayer'
import customRoutes from './routes'
import {
  libraryReducer,
  themeReducer,
  addToPlaylistDialogReducer,
  expandInfoDialogReducer,
  listenBrainzTokenDialogReducer,
  saveQueueDialogReducer,
  playerReducer,
  albumViewReducer,
  activityReducer,
  settingsReducer,
  replayGainReducer,
  downloadMenuDialogReducer,
  transcodingReducer,
} from './reducers'
import createAdminStore from './store/createAdminStore'
import { i18nProvider, retrieveTranslation } from './i18n'
import config from './config'
import useChangeThemeColor from './useChangeThemeColor'
import { useEffect } from 'react'

const history = createHashHistory()

const adminStore = createAdminStore({
  authProvider,
  dataProvider,
  history,
  customReducers: {
    library: libraryReducer,
    player: playerReducer,
    albumView: albumViewReducer,
    theme: themeReducer,
    addToPlaylistDialog: addToPlaylistDialogReducer,
    downloadMenuDialog: downloadMenuDialogReducer,
    expandInfoDialog: expandInfoDialogReducer,
    listenBrainzTokenDialog: listenBrainzTokenDialogReducer,
    saveQueueDialog: saveQueueDialogReducer,
    activity: activityReducer,
    settings: settingsReducer,
    replayGain: replayGainReducer,
    transcoding: transcodingReducer,
  },
})

const App = () => (
  <Provider store={adminStore}>
    <Admin />
  </Provider>
)

const Admin = (props) => {
  const setLocale = useSetLocale()
  const refresh = useRefresh()
  useEffect(() => {
    if (config.defaultLanguage !== '' && !localStorage.getItem('locale')) {
      retrieveTranslation(config.defaultLanguage)
        .then(() => setLocale(config.defaultLanguage))
        .then(() => {
          localStorage.setItem('locale', config.defaultLanguage)
          refresh(true)
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(
            'Cannot load language "' + config.defaultLanguage + '": ' + e,
          )
        })
    }
  }, [setLocale, refresh])
  useChangeThemeColor()
  /* eslint-disable react/jsx-key */
  return (
    <RAAdmin
      disableTelemetry
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      customRoutes={customRoutes}
      history={history}
      layout={Layout}
      loginPage={Login}
      logoutButton={Logout}
      {...props}
    >
      {(permissions) => [
        <Resource name="song" {...song} />,
        <Resource name="album" {...album} />,
        <Resource name="artist" {...artist} />,
        <Resource
          name="playlist"
          {...playlist}
          options={{ subMenu: 'playlist' }}
        />,
        <Resource name="user" {...user} options={{ subMenu: 'settings' }} />,
        <Resource
          name="player"
          {...player}
          options={{ subMenu: 'settings' }}
        />,
        permissions === 'admin' ? (
          <Resource
            name="library"
            {...library}
            options={{ subMenu: 'settings' }}
          />
        ) : null,

        <Resource name="translation" />,
        <Resource name="genre" />,
        <Resource name="tag" />,
        <Resource name="playlistTrack" />,
        <Resource name="keepalive" />,
        <Resource name="insights" />,
        <Resource name="config" />,
        <Player />,
      ]}
    </RAAdmin>
  )
  /* eslint-enable react/jsx-key */
}

const AppRoot = () => {
  let language = localStorage.getItem('locale') || 'en'
  document.documentElement.lang = language
  return <App />
}

export default AppRoot
