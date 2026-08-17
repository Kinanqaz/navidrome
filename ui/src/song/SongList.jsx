import React from 'react'
import clsx from 'clsx'
import {
  AutocompleteArrayInput,
  Filter,
  FilterButton,
  NullableBooleanInput,
  ReferenceArrayInput,
  SearchInput,
  useListContext,
  usePermissions,
  useTranslate,
} from 'react-admin'
import { IconButton, useMediaQuery } from '@material-ui/core'
import FavoriteIcon from '@material-ui/icons/Favorite'
import SearchIcon from '@material-ui/icons/Search'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { makeStyles } from '@material-ui/core/styles'
import { useLocation, Redirect } from 'react-router-dom'
import {
  List,
  ShuffleAllButton,
  SongInfo,
  Title,
  ToggleFieldsMenu,
  defaultRowsPerPageOptions,
  getStoredPerPage,
  useResourceRefresh,
  useSetToggleableFields,
} from '../common'
import config from '../config'
import ExpandInfoDialog from '../dialogs/ExpandInfoDialog'
import { ModernSongList } from './ModernSongList'
import songLists from './songLists'

// eslint-disable-next-line react-refresh/only-export-components
export const songFilterStyles = (theme) => {
  const isDark = theme.palette.type === 'dark'
  const controlBackground = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.05)'
  const controlHoverBackground = isDark
    ? 'rgba(255, 255, 255, 0.16)'
    : 'rgba(0, 0, 0, 0.09)'
  const controlBorder = isDark
    ? 'rgba(255, 255, 255, 0.14)'
    : 'rgba(0, 0, 0, 0.16)'
  const controlHoverBorder = isDark
    ? 'rgba(255, 255, 255, 0.28)'
    : 'rgba(0, 0, 0, 0.28)'
  const subtleText = theme.palette.text.secondary || theme.palette.text.primary

  return {
    toolbarRoot: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '100%',
      marginBottom: theme.spacing(1.5),
      paddingTop: theme.spacing(1),
      paddingLeft: 0,
      paddingRight: 0,
      minHeight: 40,
      gap: theme.spacing(0.75),
      boxSizing: 'border-box',
      [theme.breakpoints.down('xs')]: {
        gap: theme.spacing(0.5),
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    searchIconButton: {
      width: 36,
      height: 36,
      minWidth: 36,
      borderRadius: 18,
      backgroundColor: `${controlBackground} !important`,
      border: `1px solid ${controlBorder} !important`,
      color: `${theme.palette.text.primary} !important`,
      padding: 0,
      flex: '0 0 36px',
      marginLeft: 0,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      [theme.breakpoints.down('xs')]: {
        marginLeft: -8,
      },
      '&:hover': {
        backgroundColor: `${controlHoverBackground} !important`,
        borderColor: `${controlHoverBorder} !important`,
        transform: 'translateY(-1px)',
      },
      '& svg': {
        fontSize: '1.2rem',
        color: subtleText,
      },
    },
    searchActiveBar: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      marginLeft: 0,
      [theme.breakpoints.down('xs')]: {
        marginLeft: -8,
      },
      gap: theme.spacing(0.75),
      '& .RaFilter-root, & [class*="RaFilter-root"]': {
        flex: '0 1 auto',
        margin: '0 !important',
        padding: '0 !important',
      },
      '& form': {
        display: 'flex !important',
        alignItems: 'center !important',
        margin: '0 !important',
        padding: '0 !important',
        minHeight: 'auto !important',
      },
      '& .filter-field': {
        margin: '0 !important',
        padding: '0 !important',
      },
      '& .filter-field > div:last-child:not(:first-child)': {
        display: 'none !important',
      },
      '& form > div:last-child:not(.filter-field)': {
        display: 'none !important',
      },
      '& .RaFilterForm-clearfix, & [class*="clearfix"]': {
        display: 'none !important',
      },
    },
    searchCloseButton: {
      width: 36,
      height: 36,
      minWidth: 36,
      maxHeight: 36,
      borderRadius: 18,
      backgroundColor: `${controlBackground} !important`,
      border: `1px solid ${controlBorder} !important`,
      color: `${theme.palette.text.primary} !important`,
      padding: 0,
      flex: '0 0 36px',
      boxSizing: 'border-box !important',
      '& svg': {
        fontSize: '1.2rem',
        color: subtleText,
      },
    },
    fullSearchInput: {
      width: '180px !important',
      maxWidth: '220px !important',
      minWidth: '140px !important',
      height: '38px !important',
      maxHeight: '38px !important',
      minHeight: '38px !important',
      margin: '0 !important',
      padding: '0 !important',
      boxSizing: 'border-box !important',
      '& .MuiFormControl-root': {
        width: '100% !important',
        height: '38px !important',
        maxHeight: '38px !important',
        minHeight: '38px !important',
        margin: '0 !important',
        padding: '0 !important',
        boxSizing: 'border-box !important',
      },
      '& .MuiOutlinedInput-root': {
        height: '38px !important',
        maxHeight: '38px !important',
        minHeight: '38px !important',
        borderRadius: '19px !important',
        backgroundColor: `${controlBackground} !important`,
        border: `1px solid ${controlBorder} !important`,
        paddingLeft: '8px !important',
        paddingRight: '8px !important',
        width: '100% !important',
        boxSizing: 'border-box !important',
        '& fieldset': {
          border: 'none !important',
        },
        '&.Mui-focused': {
          backgroundColor: `${controlHoverBackground} !important`,
          borderColor: `${controlHoverBorder} !important`,
          boxShadow: `0 0 0 2px ${controlBorder}`,
        },
      },
      '& .MuiInputBase-input': {
        fontSize: '0.9rem',
        height: '36px !important',
        padding: '0 8px !important',
        boxSizing: 'border-box !important',
        color: theme.palette.text.primary,
      },
      '& .MuiInputAdornment-root svg': {
        fontSize: '1.2rem',
        color: subtleText,
      },
    },
    leftGroup: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flex: '0 0 auto',
      minWidth: 0,
      '& .RaFilter-root, & [class*="RaFilter-root"]': {
        margin: '0 !important',
        padding: '0 !important',
      },
      '& form': {
        display: 'flex !important',
        flexDirection: 'row !important',
        alignItems: 'center !important',
        flexWrap: 'nowrap !important',
        margin: '0 !important',
        padding: '0 !important',
        minHeight: 'auto !important',
      },
      '& .filter-field': {
        display: 'inline-flex !important',
        alignItems: 'center !important',
        margin: '0 !important',
        padding: '0 !important',
      },
      '& .filter-field > div:last-child:not(:first-child)': {
        display: 'none !important',
      },
      '& form > div:last-child:not(.filter-field)': {
        display: 'none !important',
      },
      '& .RaFilterForm-clearfix, & [class*="clearfix"]': {
        display: 'none !important',
      },
    },
    searchInput: {
      minWidth: 150,
      maxWidth: 220,
      flex: '0 1 180px',
      margin: '0 !important',
      '& .MuiFormControl-root': {
        margin: '0 !important',
        width: '100% !important',
      },
      '& .MuiOutlinedInput-root': {
        height: '36px !important',
        borderRadius: '18px !important',
        backgroundColor: `${controlBackground} !important`,
        border: `1px solid ${controlBorder} !important`,
        paddingLeft: '8px !important',
        paddingRight: '6px !important',
        '& fieldset': {
          border: 'none !important',
        },
        '&.Mui-focused': {
          backgroundColor: `${controlHoverBackground} !important`,
          borderColor: `${controlHoverBorder} !important`,
          boxShadow: `0 0 0 2px ${controlBorder}`,
        },
      },
      '& .MuiInputBase-input': {
        fontSize: '0.85rem',
        padding: '7px 8px',
        color: theme.palette.text.primary,
      },
      '& .MuiInputAdornment-root svg': {
        fontSize: '1.15rem',
        color: subtleText,
      },
    },
    middleFilters: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flex: '1 1 auto',
      minWidth: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      '& .RaFilter-root, & [class*="RaFilter-root"]': {
        margin: '0 !important',
        padding: '0 !important',
      },
      '& form': {
        display: 'flex !important',
        flexDirection: 'row !important',
        alignItems: 'center !important',
        flexWrap: 'nowrap !important',
        gap: `${theme.spacing(0.75)}px !important`,
        margin: '0 !important',
        padding: '0 !important',
        minHeight: 'auto !important',
      },
      '& .filter-field': {
        display: 'inline-flex !important',
        flexDirection: 'row-reverse !important',
        alignItems: 'center !important',
        backgroundColor: `${controlBackground} !important`,
        border: `1px solid ${controlBorder} !important`,
        borderRadius: '18px !important',
        height: '36px !important',
        padding: '0 4px 0 10px !important',
        boxSizing: 'border-box !important',
        margin: '0 !important',
        flexShrink: 0,
        minWidth: 90,
        maxWidth: 150,
      },
      '& .filter-field > div:last-child:not(:first-child)': {
        display: 'none !important',
      },
      '& form > div:last-child:not(.filter-field)': {
        display: 'none !important',
      },
      '& .RaFilterForm-clearfix, & [class*="clearfix"]': {
        display: 'none !important',
      },
      '& .hide-filter': {
        padding: '2px !important',
        margin: '0 0 0 2px !important',
        color: subtleText,
        transition: 'all 0.2s ease',
        '&:hover': {
          color: theme.palette.text.primary,
          backgroundColor: controlHoverBackground,
        },
        '& svg': {
          fontSize: '1.1rem',
        },
      },
      '& .filter-field .MuiFormControl-root': {
        margin: '0 !important',
        position: 'relative !important',
        flex: '1 1 auto !important',
        minWidth: 0,
        width: '100% !important',
        display: 'flex !important',
        justifyContent: 'center !important',
      },
      '& .filter-field .MuiOutlinedInput-root': {
        height: '34px !important',
        border: 'none !important',
        backgroundColor: 'transparent !important',
        padding: '0 !important',
        alignItems: 'center !important',
        flexWrap: 'nowrap !important',
        overflow: 'hidden !important',
        '& fieldset': {
          border: 'none !important',
        },
      },
      '& .filter-field .MuiInputLabel-outlined': {
        position: 'absolute !important',
        left: '2px !important',
        top: '50% !important',
        transform: 'translateY(-50%) !important',
        fontSize: '0.82rem !important',
        color: `${subtleText} !important`,
        pointerEvents: 'none',
        fontWeight: 500,
        whiteSpace: 'nowrap !important',
        overflow: 'hidden !important',
        textOverflow: 'ellipsis !important',
        maxWidth: 'calc(100% - 24px) !important',
        zIndex: 1,
        lineHeight: 1,
      },
      '& .filter-field:focus-within .MuiInputLabel-outlined, & .filter-field .MuiChip-root ~ .MuiInputLabel-outlined': {
        display: 'none !important',
      },
      '& .filter-field .MuiAutocomplete-root': {
        minWidth: 0,
        width: '100% !important',
        '& .MuiIconButton-root': {
          padding: '2px !important',
          color: subtleText,
          '& svg': {
            fontSize: '1rem',
          },
        },
      },
      '& .filter-field .MuiChip-root': {
        height: '22px !important',
        borderRadius: '11px !important',
        backgroundColor: `${controlHoverBackground} !important`,
        color: `${theme.palette.text.primary} !important`,
        fontSize: '0.75rem !important',
        fontWeight: 500,
        margin: '1px !important',
        '& .MuiChip-deleteIcon': {
          color: subtleText,
          fontSize: '0.9rem',
          marginRight: 2,
        },
      },
      '& .filter-field .MuiInputBase-input': {
        fontSize: '0.82rem',
        padding: '0 4px !important',
        height: '32px',
        color: theme.palette.text.primary,
      },
    },
    chip: {
      margin: '0 2px',
      height: 22,
      borderRadius: 11,
      backgroundColor: `${controlHoverBackground} !important`,
      color: `${theme.palette.text.primary} !important`,
      fontSize: '0.75rem',
      fontWeight: 500,
    },
    chipRow: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      flexShrink: 0,
      overflow: 'visible',
    },
    autocompleteInput: {
      flex: '1 1 24px',
      width: '24px !important',
      minWidth: 24,
    },
    rightGroup: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
      flex: '0 0 auto',
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        gap: theme.spacing(0.75),
        marginRight: theme.spacing(0.75),
      },
      '& .MuiButton-root': {
        borderRadius: '19px !important',
        height: '38px !important',
        boxSizing: 'border-box !important',
        margin: '0 !important',
        padding: '0 15px !important',
        textTransform: 'none !important',
        fontSize: '0.875rem !important',
        fontWeight: '500 !important',
        backgroundColor: `${controlBackground} !important`,
        border: `1px solid ${controlBorder} !important`,
        color: `${theme.palette.text.primary} !important`,
        boxShadow: 'none !important',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
        display: 'inline-flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        verticalAlign: 'middle !important',
        [theme.breakpoints.down('xs')]: {
          minWidth: '38px !important',
          width: '38px !important',
          height: '38px !important',
          padding: '0 !important',
          borderRadius: '19px !important',
          '& .MuiButton-startIcon': {
            margin: '0 !important',
          },
          '& .MuiButton-label': {
            width: '100%',
            justifyContent: 'center',
          },
          '& span:not(.MuiButton-startIcon):not(.MuiTouchRipple-root)': {
            display: 'none',
          },
        },
        '&:hover': {
          backgroundColor: `${controlHoverBackground} !important`,
          borderColor: `${controlHoverBorder} !important`,
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25) !important',
        },
      },
      '& .MuiIconButton-root': {
        borderRadius: '19px !important',
        width: '38px !important',
        height: '38px !important',
        boxSizing: 'border-box !important',
        margin: '0 !important',
        padding: '0 !important',
        backgroundColor: `${controlBackground} !important`,
        color: `${theme.palette.text.primary} !important`,
        border: `1px solid ${controlBorder} !important`,
        boxShadow: 'none !important',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
        display: 'inline-flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        verticalAlign: 'middle !important',
        '&:hover': {
          backgroundColor: `${controlHoverBackground} !important`,
          borderColor: `${controlHoverBorder} !important`,
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25) !important',
        },
        '& svg': {
          fontSize: '1.35rem',
        },
      },
    },
    row: {
      '&:hover': {
        '& $contextMenu': {
          visibility: 'visible',
        },
        '& $ratingField': {
          visibility: 'visible',
        },
      },
    },
    contextMenu: {
      visibility: (props) => (props?.isDesktop ? 'hidden' : 'visible'),
    },
    ratingField: {
      visibility: 'hidden',
    },
    columnIcon: {
      marginLeft: '3px',
      marginTop: '-2px',
      verticalAlign: 'text-top',
    },
  }
}

const useStyles = makeStyles(songFilterStyles)

// eslint-disable-next-line react-refresh/only-export-components
export const getAutocompleteArrayClasses = (classes) => ({
  chip: classes.chip,
  chipContainerOutlined: classes.chipRow,
  inputInput: classes.autocompleteInput,
})

const SongFilter = (props) => {
  const classes = useStyles()
  const translate = useTranslate()
  const { permissions } = usePermissions()
  const isAdmin = permissions === 'admin'
  const isNotSmall = useMediaQuery((theme) => theme.breakpoints.up('sm'))
  const {
    resource = 'song',
    displayedFilters,
    filterValues,
    setFilters,
    showFilter,
  } = useListContext(props)

  const hasSearch = Boolean(filterValues?.title)
  const [searchExpanded, setSearchExpanded] = React.useState(hasSearch)

  React.useEffect(() => {
    if (hasSearch) {
      setSearchExpanded(true)
    }
  }, [hasSearch])

  if (props.context === 'button') {
    return null
  }

  const searchElement = (
    <SearchInput
      key="title"
      source="title"
      alwaysOn
      autoFocus={searchExpanded && !isNotSmall}
      className={isNotSmall ? classes.searchInput : classes.fullSearchInput}
      placeholder={translate('ra.action.search')}
    />
  )

  const secondaryFilterElements = [
    <ReferenceArrayInput
      key="genre_id"
      label={translate('resources.song.fields.genre')}
      source="genre_id"
      reference="genre"
      perPage={0}
      sort={{ field: 'name', order: 'ASC' }}
      filterToQuery={(searchText) => ({ name: [searchText] })}
    >
      <AutocompleteArrayInput
        emptyText="-- None --"
        classes={getAutocompleteArrayClasses(classes)}
      />
    </ReferenceArrayInput>,
    <ReferenceArrayInput
      key="grouping"
      label={translate('resources.song.fields.grouping')}
      source="grouping"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'grouping' }}
      filterToQuery={(searchText) => ({ tag_value: [searchText] })}
    >
      <AutocompleteArrayInput
        emptyText="-- None --"
        classes={getAutocompleteArrayClasses(classes)}
        optionText="tagValue"
      />
    </ReferenceArrayInput>,
    <ReferenceArrayInput
      key="mood"
      label={translate('resources.song.fields.mood')}
      source="mood"
      reference="tag"
      perPage={0}
      sort={{ field: 'tagValue', order: 'ASC' }}
      filter={{ tag_name: 'mood' }}
      filterToQuery={(searchText) => ({ tag_value: [searchText] })}
    >
      <AutocompleteArrayInput
        emptyText="-- None --"
        classes={getAutocompleteArrayClasses(classes)}
        optionText="tagValue"
      />
    </ReferenceArrayInput>,
    ...(config.enableFavourites
      ? [
          <NullableBooleanInput
            key="starred"
            source="starred"
            label={<FavoriteIcon fontSize="small" />}
          />,
        ]
      : []),
    ...(isAdmin
      ? [<NullableBooleanInput key="missing" source="missing" />]
      : []),
  ]

  const allFilterElements = [searchElement, ...secondaryFilterElements]

  if (!isNotSmall && searchExpanded) {
    return (
      <div className={classes.toolbarRoot}>
        <div className={classes.searchActiveBar}>
          <IconButton
            size="small"
            className={classes.searchCloseButton}
            aria-label="Close search"
            onClick={() => {
              setSearchExpanded(false)
              if (filterValues?.title) {
                setFilters(
                  { ...filterValues, title: undefined },
                  displayedFilters,
                )
              }
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Filter
            {...props}
            variant="outlined"
            classes={{ form: classes.filterForm }}
          >
            {[searchElement]}
          </Filter>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.toolbarRoot}>
      {isNotSmall ? (
        <div className={classes.leftGroup}>
          <Filter
            {...props}
            variant="outlined"
            classes={{ form: classes.filterForm }}
          >
            {[searchElement]}
          </Filter>
        </div>
      ) : (
        <IconButton
          size="small"
          className={classes.searchIconButton}
          aria-label="Search"
          onClick={() => setSearchExpanded(true)}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      )}

      <div className={classes.middleFilters}>
        <Filter
          {...props}
          variant="outlined"
          classes={{ form: classes.filterForm }}
        >
          {secondaryFilterElements}
        </Filter>
      </div>

      <div className={classes.rightGroup}>
        <ShuffleAllButton filters={filterValues} />
        <FilterButton
          resource={resource}
          filters={allFilterElements}
          displayedFilters={displayedFilters}
          filterValues={filterValues}
          showFilter={showFilter}
        />
        {isNotSmall && <ToggleFieldsMenu resource="song" />}
      </div>
    </div>
  )
}

const SongListTitle = ({ songListType }) => {
  const translate = useTranslate()
  let title = translate('resources.song.name', { smart_count: 2 })
  if (songListType && songListType !== 'all') {
    const listTitle = translate(`resources.album.lists.${songListType}`, {
      smart_count: 2,
      _: songListType,
    })
    title = `${title} - ${listTitle}`
  }
  return <Title subTitle={title} args={{ smart_count: 2 }} />
}

const SongList = (props) => {
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))
  const location = useLocation()
  useResourceRefresh('song')

  useSetToggleableFields(
    'song',
    [
      'artist',
      'album',
      'albumArtist',
      'genre',
      'mood',
      'year',
      'playCount',
      'rating',
      'duration',
      'playDate',
      'createdAt',
      'size',
      'bpm',
      'starred',
    ],
    [
      'albumArtist',
      'mood',
      'playDate',
      'createdAt',
      'size',
      'bpm',
    ],
  )

  const songListType = location.pathname
    .replace(/^\/song/, '')
    .replace(/^\//, '')

  if (!location.search && songListType && songLists[songListType]) {
    return (
      <Redirect
        to={`/song/${songListType}?${songLists[songListType].params}`}
      />
    )
  }

  return (
    <>
      <List
        {...props}
        sort={{ field: 'createdAt', order: 'DESC' }}
        exporter={false}
        bulkActionButtons={false}
        actions={false}
        filters={<SongFilter />}
        title={<SongListTitle songListType={songListType} />}
        perPage={getStoredPerPage(
          'song',
          defaultRowsPerPageOptions,
          isXsmall ? 50 : 15,
        )}
      >
        <ModernSongList />
      </List>
      <ExpandInfoDialog content={<SongInfo />} />
    </>
  )
}

export default SongList
