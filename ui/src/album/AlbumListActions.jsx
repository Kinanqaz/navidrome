import React from 'react'
import { Button, useTranslate } from 'react-admin'
import { ButtonGroup, Typography, makeStyles } from '@material-ui/core'
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import { useDispatch, useSelector } from 'react-redux'
import { albumViewGrid, albumViewTable } from '../actions'

const useStyles = makeStyles({
  title: { margin: '1rem' },
  buttonGroup: { width: '100%', justifyContent: 'center' },
  leftButton: { paddingRight: '0.5rem' },
  rightButton: { paddingLeft: '0.5rem' },
})

export const AlbumViewToggler = React.forwardRef(
  ({ showTitle = true }, ref) => {
    const dispatch = useDispatch()
    const albumView = useSelector((state) => state.albumView)
    const classes = useStyles()
    const translate = useTranslate()
    return (
      <div ref={ref}>
        {showTitle && (
          <Typography className={classes.title}>
            {translate('ra.toggleFieldsMenu.layout')}
          </Typography>
        )}
        <ButtonGroup
          variant="text"
          color="primary"
          aria-label="text primary button group"
          className={classes.buttonGroup}
        >
          <Button
            size="small"
            className={classes.leftButton}
            label={translate('ra.toggleFieldsMenu.grid')}
            color={albumView.grid ? 'primary' : 'secondary'}
            onClick={() => dispatch(albumViewGrid())}
          >
            <ViewModuleIcon fontSize="inherit" />
          </Button>
          <Button
            size="small"
            className={classes.rightButton}
            label={translate('ra.toggleFieldsMenu.table')}
            color={albumView.grid ? 'secondary' : 'primary'}
            onClick={() => dispatch(albumViewTable())}
          >
            <ViewHeadlineIcon fontSize="inherit" />
          </Button>
        </ButtonGroup>
      </div>
    )
  },
)

AlbumViewToggler.displayName = 'AlbumViewToggler'

export default AlbumViewToggler

