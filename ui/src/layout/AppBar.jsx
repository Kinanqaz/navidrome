import React, { createElement, forwardRef, Fragment } from 'react'
import {
  AppBar as RAAppBar,
  MenuItemLink,
  useTranslate,
  usePermissions,
  getResources,
} from 'react-admin'
import { MdInfo, MdPerson, MdSupervisorAccount } from 'react-icons/md'
import { useSelector } from 'react-redux'
import {
  makeStyles,
  MenuItem,
  ListItemIcon,
  Divider,
  useMediaQuery,
} from '@material-ui/core'
import { alpha } from '@material-ui/core/styles'
import ViewListIcon from '@material-ui/icons/ViewList'
import { Dialogs } from '../dialogs/Dialogs'
import { AboutDialog } from '../dialogs'
import PersonalMenu from './PersonalMenu'
import ActivityPanel from './ActivityPanel'
import NowPlayingPanel from './NowPlayingPanel'
import UserMenu from './UserMenu'
import config from '../config'

const useStyles = makeStyles(
  (theme) => ({
    appBar: {
      paddingTop: 'env(safe-area-inset-top)',
      backgroundColor: `${theme.palette.background.default} !important`,
      color: `${theme.palette.text.primary} !important`,
      boxShadow: 'none !important',
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)} !important`,
      '& .MuiToolbar-root': {
        backgroundColor: `${theme.palette.background.default} !important`,
        color: `${theme.palette.text.primary} !important`,
        paddingRight: `${theme.spacing(1)}px !important`,
        paddingLeft: `${theme.spacing(1)}px !important`,
        minHeight: '48px !important',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        overflow: 'hidden',
        '& #react-admin-title': {
          minWidth: 0,
          flex: '1 1 auto',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '1.05rem',
          fontWeight: 600,
        },
      },
      '& .RaLoadingIndicator-loadedIcon, & [class*="RaLoadingIndicator"], & .RaLoadingIndicator-loader':
        {
          flexShrink: '0 !important',
          display: 'inline-flex !important',
          visibility: 'visible !important',
          color: 'inherit',
        },
      '& .RaUserMenu-user, & [class*="UserMenu"], & [class*="RaUserMenu"]': {
        flexShrink: '0 !important',
        display: 'inline-flex !important',
        visibility: 'visible !important',
        color: 'inherit',
      },
      [theme.breakpoints.down('sm')]: {
        '& .RaLoadingIndicator-root, & .RaLoadingIndicator-loader, & .RaLoadingIndicator-loadedIcon, & [class*="RaLoadingIndicator"]':
          {
            display: 'none !important',
          },
      },
    },
    root: {
      color: theme.palette.text.secondary,
    },
    active: {
      color: theme.palette.text.primary,
    },
    icon: { minWidth: theme.spacing(5) },
  }),
  {
    name: 'NDAppBar',
  },
)

const AboutMenuItem = forwardRef(({ onClick, ...rest }, ref) => {
  const classes = useStyles(rest)
  const translate = useTranslate()
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    onClick && onClick()
    setOpen(false)
  }
  const label = translate('menu.about')
  return (
    <>
      <MenuItem ref={ref} onClick={handleOpen} className={classes.root}>
        <ListItemIcon className={classes.icon}>
          <MdInfo title={label} size={24} />
        </ListItemIcon>
        {label}
      </MenuItem>
      <AboutDialog onClose={handleClose} open={open} />
    </>
  )
})

AboutMenuItem.displayName = 'AboutMenuItem'

const settingsResources = (resource) =>
  resource.name !== 'user' &&
  resource.hasList &&
  resource.options &&
  resource.options.subMenu === 'settings'

const CustomUserMenu = ({ onClick, ...rest }) => {
  const translate = useTranslate()
  const resources = useSelector(getResources)
  const classes = useStyles(rest)
  const { permissions } = usePermissions()
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'))

  const resourceDefinition = (resourceName) =>
    resources.find((r) => r?.name === resourceName)

  const renderUserMenuItemLink = () => {
    const userResource = resourceDefinition('user')
    if (!userResource) {
      return null
    }
    if (permissions !== 'admin') {
      if (!config.enableUserEditing) {
        return null
      }
      userResource.icon = MdPerson
    } else {
      userResource.icon = MdSupervisorAccount
    }
    return renderSettingsMenuItemLink(
      userResource,
      permissions !== 'admin' ? localStorage.getItem('userId') : null,
    )
  }

  const renderSettingsMenuItemLink = (resource, id) => {
    const label = translate(`resources.${resource.name}.name`, {
      smart_count: id ? 1 : 2,
    })
    const link = id ? `/${resource.name}/${id}` : `/${resource.name}`
    return (
      <MenuItemLink
        className={classes.root}
        activeClassName={classes.active}
        key={resource.name}
        to={link}
        primaryText={label}
        leftIcon={
          (resource.icon && createElement(resource.icon, { size: 24 })) || (
            <ViewListIcon />
          )
        }
        onClick={onClick}
        sidebarIsOpen={true}
      />
    )
  }

  return (
    <>
      {!isMobile &&
        config.devActivityPanel &&
        permissions === 'admin' &&
        config.enableNowPlaying && <NowPlayingPanel />}
      {config.devActivityPanel && permissions === 'admin' && <ActivityPanel />}
      <UserMenu {...rest}>
        <PersonalMenu sidebarIsOpen={true} onClick={onClick} />
        <Divider />
        {renderUserMenuItemLink()}
        {resources
          .filter(settingsResources)
          .map((r) => renderSettingsMenuItemLink(r))}
        <Divider />
        <AboutMenuItem />
      </UserMenu>
      <Dialogs />
    </>
  )
}

const AppBar = (props) => {
  const classes = useStyles()
  return (
    <RAAppBar
      {...props}
      className={classes.appBar}
      container={Fragment}
      userMenu={<CustomUserMenu />}
    />
  )
}

export default AppBar
