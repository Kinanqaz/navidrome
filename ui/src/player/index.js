import DevicesIcon from '@material-ui/icons/Devices'
import { lazyLoad } from '../common'

const PlayerList = lazyLoad(() => import('./PlayerList'))
const PlayerEdit = lazyLoad(() => import('./PlayerEdit'))

export default {
  list: PlayerList,
  edit: PlayerEdit,
  icon: DevicesIcon,
}
