import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, IconButton
} from '@mui/material';
import { Close, GitHub, LocalCafe, OpenInNew } from '@mui/icons-material';

const STORAGE_KEY = 'linuxdle_support_dialog_shown';
const EVENT_NAME = 'linuxdle:show-support';

export type SupportDialogReason = 'all-complete' | 'give-up';

interface SupportDialogProps {
  open: boolean;
  onClose: () => void;
}

const SupportDialog: React.FC<SupportDialogProps> = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    disableScrollLock
    disableRestoreFocus
    PaperProps={{ variant: 'outlined' }}
  >
    <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 'bold', pr: 6, color: 'success.main' }}>
      [+] THANKS_FOR_PLAYING
      <IconButton
        onClick={onClose}
        size="small"
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <Close fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', opacity: 0.7, mb: 2 }}>
        $ echo "Nice work! If you enjoy Linuxdle, consider:"
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          component="a"
          href="https://github.com/RealOrangeKun/linuxdle"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          color="inherit"
          startIcon={<GitHub />}
          fullWidth
          sx={{ fontFamily: 'monospace', justifyContent: 'flex-start' }}
        >
          Star the repo on GitHub
        </Button>

        <Button
          component="a"
          href="https://ko-fi.com/orangekun"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          color="primary"
          startIcon={<LocalCafe />}
          fullWidth
          sx={{ fontFamily: 'monospace', justifyContent: 'flex-start' }}
        >
          Support on Ko-fi
        </Button>

        <Button
          component="a"
          href="https://devguessr.site/"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          color="secondary"
          startIcon={<OpenInNew />}
          fullWidth
          sx={{ fontFamily: 'monospace', justifyContent: 'flex-start' }}
        >
          Enjoying Linuxdle? Try this out: DevGuessr
        </Button>
      </Box>
    </DialogContent>

    <Divider />

    <DialogActions>
      <Button onClick={onClose} size="small" sx={{ fontFamily: 'monospace' }}>
        CLOSE
      </Button>
    </DialogActions>
  </Dialog>
);

/** Dispatches the support dialog event — call this right after all games complete. */
export function dispatchSupportDialog(reason: SupportDialogReason = 'all-complete', delayMs = 0): void {
  const emit = () => window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { reason } }));

  if (delayMs > 0) {
    window.setTimeout(emit, delayMs);
    return;
  }

  emit();
}

export { EVENT_NAME };

/** Returns true if the dialog hasn't been shown today yet. */
export function shouldShowSupportDialog(): boolean {
  const today = new Date().toISOString().split('T')[0];
  return localStorage.getItem(STORAGE_KEY) !== today;
}

/** Marks the dialog as shown for today. */
export function markSupportDialogShown(): void {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(STORAGE_KEY, today);
}

export default SupportDialog;
