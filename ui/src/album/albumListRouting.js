import { getStoredDefaultView } from '../personal/defaultViews'

export const resolveAlbumListType = (albumListType) =>
  albumListType || getStoredDefaultView()
