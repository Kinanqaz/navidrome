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
  useGetList,
} from 'react-admin'
import {
  Chip,
  IconButton,
  Popover,
  List as MuiList,
  ListItem,
  ListItemText,
  TextField as MuiTextField,
  InputAdornment,
  useMediaQuery,
} from '@material-ui/core'
import FavoriteIcon from '@material-ui/icons/Favorite'
import SearchIcon from '@material-ui/icons/Search'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
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
    // Clean chip-based filter area
    activeFiltersArea: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flex: '1 1 auto',
      minWidth: 0,
      gap: theme.spacing(0.5),
      overflowX: 'auto',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    filterChip: {
      height: 30,
      borderRadius: 15,
      backgroundColor: `${controlBackground} !important`,
      border: `1px solid ${controlBorder}`,
      color: `${theme.palette.text.primary} !important`,
      fontSize: '0.78rem',
      fontWeight: 500,
      flexShrink: 0,
      transition: 'all 0.18s ease',
      '&:hover': {
        backgroundColor: `${controlHoverBackground} !important`,
        borderColor: controlHoverBorder,
      },
      '& .MuiChip-deleteIcon': {
        color: subtleText,
        fontSize: '0.95rem',
        marginRight: 2,
        '&:hover': {
          color: theme.palette.text.primary,
        },
      },
    },
    addFilterButton: {
      width: 30,
      height: 30,
      minWidth: 30,
      borderRadius: 15,
      backgroundColor: `${controlBackground} !important`,
      border: `1px solid ${controlBorder} !important`,
      color: `${subtleText} !important`,
      padding: 0,
      flex: '0 0 30px',
      transition: 'all 0.18s ease',
      '&:hover': {
        backgroundColor: `${controlHoverBackground} !important`,
        borderColor: `${controlHoverBorder} !important`,
        color: `${theme.palette.text.primary} !important`,
        transform: 'scale(1.06)',
      },
      '& svg': {
        fontSize: '1.1rem',
      },
    },
    filterPopover: {
      '& .MuiPaper-root': {
        borderRadius: 12,
        backgroundColor: isDark ? '#1e1e26' : '#ffffff',
        border: `1px solid ${controlBorder}`,
        boxShadow: isDark
          ? '0 12px 40px rgba(0, 0, 0, 0.5)'
          : '0 8px 30px rgba(0, 0, 0, 0.12)',
        minWidth: 200,
        maxWidth: 280,
        maxHeight: 340,
        overflow: 'hidden',
      },
    },
    filterPopoverSearch: {
      padding: theme.spacing(1, 1.5),
      borderBottom: `1px solid ${controlBorder}`,
      '& .MuiOutlinedInput-root': {
        height: 34,
        borderRadius: 17,
        backgroundColor: `${controlBackground} !important`,
        border: `1px solid ${controlBorder}`,
        fontSize: '0.82rem',
        '& fieldset': {
          border: 'none !important',
        },
      },
      '& .MuiInputBase-input': {
        padding: '6px 8px !important',
        fontSize: '0.82rem',
      },
    },
    filterPopoverList: {
      maxHeight: 260,
      overflowY: 'auto',
      padding: theme.spacing(0.5),
      scrollbarWidth: 'thin',
    },
    filterPopoverItem: {
      borderRadius: 8,
      padding: theme.spacing(0.75, 1.5),
      fontSize: '0.82rem',
      color: theme.palette.text.primary,
      transition: 'background 0.15s ease',
      '&:hover': {
        backgroundColor: controlHoverBackground,
      },
    },
    filterPopoverItemSelected: {
      backgroundColor: `${controlHoverBackground} !important`,
      fontWeight: 600,
    },
    // Hidden filter form — keeps React-Admin filter state in sync
    hiddenFilterForm: {
      position: 'absolute !important',
      width: '0 !important',
      height: '0 !important',
      overflow: 'hidden !important',
      opacity: '0 !important',
      pointerEvents: 'none !important',
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

// Genre picker popover component
const GenrePickerPopover = ({
  anchorEl,
  open,
  onClose,
  filterValues,
  setFilters,
  displayedFilters,
  classes,
}) => {
  const translate = useTranslate()
  const [search, setSearch] = React.useState('')
  const { ids: genreIds, data: genres } = useGetList(
    'genre',
    { page: 1, perPage: 500 },
    { field: 'name', order: 'ASC' },
  )

  const genreList = (genreIds || []).map((id) => genres?.[id]).filter(Boolean)
  const selectedIds = filterValues?.genre_id || []

  const filtered = genreList.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  )

  const toggleGenre = (genreId) => {
    const current = [...selectedIds]
    const idx = current.indexOf(genreId)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(genreId)
    }
    const newFilters = { ...filterValues }
    if (current.length > 0) {
      newFilters.genre_id = current
    } else {
      delete newFilters.genre_id
    }
    setFilters(newFilters, displayedFilters)
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        onClose()
        setSearch('')
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      className={classes.filterPopover}
    >
      <div className={classes.filterPopoverSearch}>
        <MuiTextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder={translate('ra.action.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ fontSize: '1rem', opacity: 0.5 }} />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div className={classes.filterPopoverList}>
        <MuiList dense disablePadding>
          {filtered.map((genre) => {
            const isSelected = selectedIds.includes(genre.id)
            return (
              <ListItem
                key={genre.id}
                button
                onClick={() => toggleGenre(genre.id)}
                className={clsx(classes.filterPopoverItem, {
                  [classes.filterPopoverItemSelected]: isSelected,
                })}
              >
                <ListItemText
                  primary={genre.name}
                  primaryTypographyProps={{ style: { fontSize: '0.82rem' } }}
                />
              </ListItem>
            )
          })}
        </MuiList>
      </div>
    </Popover>
  )
}

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
  const [pickerAnchor, setPickerAnchor] = React.useState(null)

  // Get genre names for active chips
  const activeGenreIds = filterValues?.genre_id || []
  const { data: allGenres } = useGetList(
    'genre',
    { page: 1, perPage: 500 },
    { field: 'name', order: 'ASC' },
  )
  const genreMap = allGenres || {}

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

  const removeGenre = (genreId) => {
    const current = (filterValues?.genre_id || []).filter(
      (id) => id !== genreId,
    )
    const newFilters = { ...filterValues }
    if (current.length > 0) {
      newFilters.genre_id = current
    } else {
      delete newFilters.genre_id
    }
    setFilters(newFilters, displayedFilters)
  }

  // Build active genre chips
  const genreChips = activeGenreIds.map((genreId) => {
    const genre = genreMap[genreId]
    const label = genre ? genre.name : genreId
    return (
      <Chip
        key={genreId}
        label={label}
        size="small"
        className={classes.filterChip}
        onDelete={() => removeGenre(genreId)}
        deleteIcon={<CloseIcon />}
      />
    )
  })

  // Secondary filter elements (hidden, for React-Admin filter state compatibility)
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

      {/* Clean chips + add button instead of autocomplete field */}
      <div className={classes.activeFiltersArea}>
        {genreChips}
        <IconButton
          size="small"
          className={classes.addFilterButton}
          aria-label="Add category filter"
          onClick={(e) => setPickerAnchor(e.currentTarget)}
        >
          <AddIcon />
        </IconButton>
      </div>

      {/* Hidden filter form to keep React-Admin filter state in sync */}
      <div className={classes.hiddenFilterForm}>
        <Filter
          {...props}
          variant="outlined"
          classes={{ form: classes.filterForm }}
        >
          {secondaryFilterElements}
        </Filter>
      </div>

      <GenrePickerPopover
        anchorEl={pickerAnchor}
        open={Boolean(pickerAnchor)}
        onClose={() => setPickerAnchor(null)}
        filterValues={filterValues}
        setFilters={setFilters}
        displayedFilters={displayedFilters}
        classes={classes}
      />

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

export { SongFilter }
export default SongList
