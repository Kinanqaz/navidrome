import { lazyLoad } from '../common'

const UserList = lazyLoad(() => import('./UserList'))
const UserEdit = lazyLoad(() => import('./UserEdit'))
const UserCreate = lazyLoad(() => import('./UserCreate'))

export default {
  list: UserList,
  edit: UserEdit,
  create: UserCreate,
}
