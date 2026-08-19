import React from 'react'
import { List as RAList } from 'react-admin'
import { makeStyles, useMediaQuery } from '@material-ui/core'
import config from '../config'
import { Pagination } from './Pagination'
import { defaultRowsPerPageOptions, getStoredPerPage } from './perPageStore'
import { Title } from './index'

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      margin: '0 !important',
      padding: '0 !important',
      marginTop: '0 !important',
      paddingTop: '0 !important',
      boxShadow: 'none !important',
      border: 'none !important',
    },
  },
  content: {
    [theme.breakpoints.down('sm')]: {
      margin: '0 !important',
      padding: '0 !important',
      marginTop: '0 !important',
      paddingTop: '0 !important',
      marginBottom: '0 !important',
      boxShadow: 'none !important',
      border: 'none !important',
      backgroundColor: 'transparent !important',
    },
  },
  main: {
    [theme.breakpoints.down('sm')]: {
      margin: '0 !important',
      padding: '0 !important',
      marginTop: '0 !important',
      paddingTop: '0 !important',
      backgroundColor: 'transparent !important',
    },
  },
  actions: {
    [theme.breakpoints.down('sm')]: {
      display: 'none !important',
    },
  },
}))

export const List = (props) => {
  const { resource, classes: classesProp, filters, ...rest } = props
  const classes = useStyles()
  const isMobile = useMediaQuery('(max-width:959.95px)')

  return (
    <RAList
      title={
        <Title
          subTitle={`resources.${resource}.name`}
          args={{ smart_count: 2 }}
        />
      }
      debounce={config.uiSearchDebounceMs}
      perPage={getStoredPerPage(resource, defaultRowsPerPageOptions)}
      pagination={<Pagination />}
      filters={isMobile ? undefined : filters}
      classes={{
        root: classes.root,
        content: classes.content,
        main: classes.main,
        actions: classes.actions,
        ...classesProp,
      }}
      {...rest}
    />
  )
}
