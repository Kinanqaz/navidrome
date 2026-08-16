import { describe, expect, it } from 'vitest'
import { getAutocompleteArrayClasses, songFilterStyles } from './SongList'

const createTheme = (type = 'dark') => ({
  breakpoints: { down: (breakpoint) => `@media-${breakpoint}` },
  palette: {
    type,
    text: { primary: type === 'dark' ? '#fff' : '#111' },
  },
  spacing: (value) => value * 8,
})

describe('song facet filter layout', () => {
  it('keeps selected genre and mood chips in a horizontal row', () => {
    const classes = {
      chip: 'chip',
      chipRow: 'chip-row',
      autocompleteInput: 'autocomplete-input',
    }

    expect(getAutocompleteArrayClasses(classes)).toEqual({
      chip: 'chip',
      chipContainerOutlined: 'chip-row',
      inputInput: 'autocomplete-input',
    })

    const styles = songFilterStyles(createTheme())
    expect(styles.chipRow).toMatchObject({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      flexShrink: 0,
      overflow: 'visible',
    })
    expect(styles.autocompleteInput).toMatchObject({
      flex: '1 1 24px',
      width: '24px !important',
      minWidth: 24,
    })
  })

  it('uses readable palette text colors in light themes', () => {
    const styles = songFilterStyles(createTheme('light'))

    expect(styles.searchInput['& .MuiInputBase-input'].color).toBe('#111')
    expect(styles.rightGroup['& .MuiButton-root'].color).toBe('#111 !important')
  })

  it('keeps search, shuffle, and filter balanced across the row on extra-small screens', () => {
    const styles = songFilterStyles(createTheme())

    expect(styles.toolbarRoot).toMatchObject({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    })
    expect(styles.searchIconButton).toMatchObject({
      width: 36,
      height: 36,
      minWidth: 36,
    })
    expect(styles.middleFilters).toMatchObject({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      overflowX: 'auto',
    })
  })
})
