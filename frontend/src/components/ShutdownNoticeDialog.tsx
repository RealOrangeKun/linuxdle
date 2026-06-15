import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Divider, IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';

const SESSION_STORAGE_KEY = 'linuxdle_shutdown_notified';

const ShutdownNoticeDialog: React.FC = () => {
  const [open, setOpen] = useState(() => {
    const notified = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!notified) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      disableScrollLock
      disableRestoreFocus
      PaperProps={{ variant: 'outlined' }}
    >
      <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 'bold', pr: 6, color: 'error.main' }}>
        [!] TEMPORARY_OFFLINE_NOTICE
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', opacity: 0.7, mb: 2 }}>
          $ cat /etc/motd/offline.txt
        </Typography>

        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
          Attention users:
          
          Linuxdle will be temporarily offline soon. The server hosting the site is my personal laptop, and I will need it for my work for about a week. (Note: I still don't know exactly when this will happen, as I am currently in the process of planning things).
          
          Linuxdle will probably be back after that! It has been incredibly fun to develop and work on this project, and to see people use it and share their feedback. Thank you all for playing and being part of this!
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={handleClose} size="small" sx={{ fontFamily: 'monospace' }}>
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShutdownNoticeDialog;
