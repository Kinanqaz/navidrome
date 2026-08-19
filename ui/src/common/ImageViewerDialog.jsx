import React from 'react'
import PropTypes from 'prop-types'
import { Dialog, IconButton, makeStyles, Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles(() => ({
  dialogPaper: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    boxShadow: 'none',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    maxWidth: '100vw',
    maxHeight: '100vh',
    width: '100vw',
    height: '100vh',
  },
  header: {
    position: 'absolute',
    top: 'max(12px, env(safe-area-inset-top))',
    left: 'max(16px, env(safe-area-inset-left))',
    right: 'max(16px, env(safe-area-inset-right))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    color: '#ffffff',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    paddingRight: '1rem',
  },
  closeButton: {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
  },
  image: {
    maxWidth: '90vw',
    maxHeight: '85vh',
    objectFit: 'contain',
    borderRadius: 8,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
  },
}))

export const ImageViewerDialog = ({ open, src, title, onClose }) => {
  const classes = useStyles()

  if (!open || !src) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={onClose}
      classes={{ paper: classes.dialogPaper }}
    >
      <div className={classes.header} onClick={(e) => e.stopPropagation()}>
        {title && <Typography className={classes.title}>{title}</Typography>}
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          size="small"
          aria-label="close image"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <img
        src={src}
        alt={title || 'Enlarged artwork'}
        className={classes.image}
        onClick={(e) => e.stopPropagation()}
      />
    </Dialog>
  )
}

ImageViewerDialog.propTypes = {
  open: PropTypes.bool,
  src: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

export default ImageViewerDialog
