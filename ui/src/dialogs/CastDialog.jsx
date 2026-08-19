import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  makeStyles,
  Chip,
} from '@material-ui/core'
import { MdCast, MdDevices, MdSpeaker, MdCheckCircle } from 'react-icons/md'
import { alpha } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.type === 'dark'
  return {
    dialogPaper: {
      borderRadius: 16,
      backgroundColor: isDark ? '#1a1a24' : '#ffffff',
      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      minWidth: 320,
      maxWidth: 420,
      width: '90vw',
      padding: theme.spacing(1),
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      fontSize: '1.1rem',
      fontWeight: 600,
      paddingBottom: theme.spacing(1),
      '& svg': {
        color: theme.palette.primary.main,
      },
    },
    deviceItem: {
      borderRadius: 10,
      margin: '4px 0',
      padding: '10px 12px',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.03)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.06)',
      },
    },
    activeDevice: {
      backgroundColor: `${alpha(theme.palette.primary.main, 0.15)} !important`,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    hint: {
      fontSize: '0.8rem',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(1.5),
      padding: '0 4px',
    },
  }
})

const CastDialog = ({ open, onClose }) => {
  const classes = useStyles()
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('default')

  useEffect(() => {
    if (open && navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          const audioOutputs = deviceInfos.filter(
            (d) => d.kind === 'audiooutput',
          )
          if (audioOutputs.length > 0) {
            setDevices(audioOutputs)
          }
        })
        .catch(() => {})
    }
  }, [open])

  const handleCastRequest = () => {
    // If Google Cast API is available in browser
    if (window.chrome?.cast?.isAvailable) {
      try {
        window.cast?.framework?.CastContext?.getInstance()?.requestSession()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Cast request error:', e)
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle disableTypography className={classes.title}>
        <MdCast size={24} />
        <span>Cast / Connect Device</span>
      </DialogTitle>
      <DialogContent>
        <List disablePadding>
          <ListItem
            button
            className={`${classes.deviceItem} ${selectedDevice === 'default' ? classes.activeDevice : ''}`}
            onClick={() => setSelectedDevice('default')}
          >
            <ListItemIcon style={{ minWidth: 36 }}>
              <MdDevices size={22} />
            </ListItemIcon>
            <ListItemText
              primary="This Device"
              secondary="Browser & Local Speakers"
              primaryTypographyProps={{ style: { fontWeight: 600 } }}
            />
            {selectedDevice === 'default' && (
              <ListItemSecondaryAction>
                <Chip
                  size="small"
                  label="Active"
                  color="primary"
                  icon={<MdCheckCircle size={14} />}
                />
              </ListItemSecondaryAction>
            )}
          </ListItem>

          {devices.map((device, idx) => (
            <ListItem
              key={device.deviceId || idx}
              button
              className={`${classes.deviceItem} ${selectedDevice === device.deviceId ? classes.activeDevice : ''}`}
              onClick={() => setSelectedDevice(device.deviceId)}
            >
              <ListItemIcon style={{ minWidth: 36 }}>
                <MdSpeaker size={22} />
              </ListItemIcon>
              <ListItemText
                primary={device.label || `Speaker ${idx + 1}`}
                secondary="Audio Output"
              />
              {selectedDevice === device.deviceId && (
                <ListItemSecondaryAction>
                  <Chip
                    size="small"
                    label="Active"
                    color="primary"
                    icon={<MdCheckCircle size={14} />}
                  />
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}

          <ListItem
            button
            className={classes.deviceItem}
            onClick={handleCastRequest}
          >
            <ListItemIcon style={{ minWidth: 36 }}>
              <MdCast size={22} />
            </ListItemIcon>
            <ListItemText
              primary="Google Cast / Chromecast"
              secondary="Tap to search for Cast devices"
            />
          </ListItem>
        </List>
        <Typography className={classes.hint}>
          Cast to smart speakers, Chromecast, AirPlay, or select local audio
          outputs.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

CastDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default CastDialog
