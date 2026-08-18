import React, { useMemo } from 'react'
import {
  CreateButton,
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  TextField,
  useUpdate,
  useNotify,
  useRecordContext,
  BulkDeleteButton,
  usePermissions,
  useListContext,
  useTranslate,
} from 'react-admin'
import Switch from '@material-ui/core/Switch'
import { makeStyles } from '@material-ui/core/styles'
import { useMediaQuery } from '@material-ui/core'
import {
  ArtworkAvatar,
  DurationField,
  List,
  LoveButton,
  ModernFilterBar,
  ToggleFieldsMenu,
  Writable,
  isWritable,
  useSelectedFields,
  useResourceRefresh,
} from '../common'
import config from '../config'
import ChangePublicStatusButton from './ChangePublicStatusButton'
import { songFilterStyles } from '../song/SongList'

const useStyles = makeStyles((theme) => ({
  ...songFilterStyles(theme),
  button: {
    color: theme.palette.type === 'dark' ? 'white' : undefined,
  },
}))

const PlaylistFilter = (props) => {
  const translate = useTranslate()
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))

  return (
    <ModernFilterBar resource="playlist" searchSource="q" {...props}>
      <CreateButton basePath="/playlist">
        {translate('ra.action.create')}
      </CreateButton>
      {isNotSmall && <ToggleFieldsMenu resource="playlist" />}
    </ModernFilterBar>
  )
}

const TogglePublicInput = ({ resource, source }) => {
  const record = useRecordContext()
  const notify = useNotify()
  const [togglePublic] = useUpdate(
    resource,
    record.id,
    {
      ...record,
      public: !record.public,
    },
    {
      undoable: false,
      onFailure: (error) => {
        notify('ra.page.error', 'warning')
      },
    },
  )

  const handleClick = (e) => {
    togglePublic()
    e.stopPropagation()
  }

  return (
    <Switch
      checked={record[source]}
      onClick={handleClick}
      disabled={!isWritable(record.ownerId)}
    />
  )
}

const ToggleAutoImport = ({ resource, source }) => {
  const record = useRecordContext()
  const notify = useNotify()
  const [ToggleAutoImport] = useUpdate(
    resource,
    record.id,
    {
      ...record,
      sync: !record.sync,
    },
    {
      undoable: false,
      onFailure: (error) => {
        notify('ra.page.error', 'warning')
      },
    },
  )
  const handleClick = (e) => {
    ToggleAutoImport()
    e.stopPropagation()
  }

  return record.path ? (
    <Switch
      checked={record[source]}
      onClick={handleClick}
      disabled={!isWritable(record.ownerId)}
    />
  ) : null
}

const PlaylistListBulkActions = (props) => {
  const classes = useStyles()
  return (
    <>
      <ChangePublicStatusButton
        public={true}
        {...props}
        className={classes.button}
      />
      <ChangePublicStatusButton
        public={false}
        {...props}
        className={classes.button}
      />
      <BulkDeleteButton {...props} className={classes.button} />
    </>
  )
}

// Datagrid reads `source`/`sortable`/`label` off this element for the column
// header; only record/resource are forwarded so they never leak onto the button.
export const PlaylistLove = ({ record, className }) => (
  <LoveButton record={record} resource={'playlist'} className={className} />
)
PlaylistLove.defaultProps = { source: 'starred', sortable: false }

const PlaylistList = (props) => {
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'))
  useResourceRefresh('playlist')

  const toggleableFields = useMemo(
    () => ({
      ownerName: isDesktop && <TextField source="ownerName" />,
      songCount: !isXsmall && <NumberField source="songCount" />,
      duration: <DurationField source="duration" />,
      updatedAt: isDesktop && (
        <DateField source="updatedAt" sortByOrder={'DESC'} />
      ),
      public: !isXsmall && (
        <TogglePublicInput source="public" sortByOrder={'DESC'} />
      ),
      comment: <TextField source="comment" />,
      sync: !isXsmall && (
        <ToggleAutoImport source="sync" sortByOrder={'DESC'} />
      ),
      starred: config.enableFavourites && <PlaylistLove />,
    }),
    [isDesktop, isXsmall],
  )

  const columns = useSelectedFields({
    resource: 'playlist',
    columns: toggleableFields,
    defaultOff: ['comment'],
  })

  return (
    <List
      {...props}
      exporter={false}
      sort={{ field: 'name', order: 'ASC' }}
      filters={<PlaylistFilter />}
      actions={false}
      bulkActionButtons={!isXsmall && <PlaylistListBulkActions />}
    >
      <Datagrid rowClick="show" isRowSelectable={(r) => isWritable(r?.ownerId)}>
        <ArtworkAvatar source="id" variant="square" />
        <TextField source="name" />
        {columns}
        <Writable>
          <EditButton />
        </Writable>
      </Datagrid>
    </List>
  )
}

export default PlaylistList
