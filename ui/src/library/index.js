import LibraryMusicIcon from '@material-ui/icons/LibraryMusic'
import { lazyLoad } from '../common'

const LibraryList = lazyLoad(() => import('./LibraryList'))
const LibraryEdit = lazyLoad(() => import('./LibraryEdit'))
const LibraryCreate = lazyLoad(() => import('./LibraryCreate'))

export default {
  icon: LibraryMusicIcon,
  list: LibraryList,
  edit: LibraryEdit,
  create: LibraryCreate,
}
