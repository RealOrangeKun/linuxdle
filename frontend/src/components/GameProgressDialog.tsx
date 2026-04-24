import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  Paper,
} from '@mui/material';
import { Close, ArrowForward } from '@mui/icons-material';
import { getUnfinishedGames } from '../utils/gameStatus';
import type { GameKey, GameProgressItem } from '../utils/gameStatus';

export const GAME_PROGRESS_EVENT_NAME = 'linuxdle:show-game-progress';

export type GameProgressOutcome = 'success' | 'give-up';

export interface GameProgressDialogDetail {
  outcome: GameProgressOutcome;
  unfinishedGames: GameProgressItem[];
}

interface GameProgressDialogProps {
  open: boolean;
  payload: GameProgressDialogDetail | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const GameProgressDialog: React.FC<GameProgressDialogProps> = ({ open, payload, onClose, onNavigate }) => {
  if (!payload) {
    return null;
  }

  const isSuccess = payload.outcome === 'success';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableScrollLock
      disableRestoreFocus
      PaperProps={{ variant: 'outlined' }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          pr: 6,
          color: isSuccess ? 'success.main' : 'error.main',
        }}
      >
        {isSuccess ? '[OK] MODULE_COMPLETED' : '[FAIL] MODULE_ABORTED'}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', opacity: 0.8, mb: 2 }}>
          {isSuccess
            ? '$ target locked. remaining modules:'
            : '$ round ended with SIGKILL. unfinished modules:'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {payload.unfinishedGames.map((game) => (
            <Paper
              key={game.key}
              variant="outlined"
              sx={{
                px: 1.5,
                py: 1,
                borderColor: isSuccess ? 'success.main' : 'error.main',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {`./${game.path.replace('/', '')}`}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color={isSuccess ? 'success' : 'error'}
                endIcon={<ArrowForward fontSize="small" />}
                onClick={() => onNavigate(game.path)}
                sx={{ fontFamily: 'monospace' }}
              >
                OPEN
              </Button>
            </Paper>
          ))}
        </Box>

        <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.75, fontFamily: 'monospace' }}>
          Finish all 3 modules to trigger the final completion popup.
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={onClose} size="small" sx={{ fontFamily: 'monospace' }}>
          LATER
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const dispatchGameProgressDialog = (outcome: GameProgressOutcome, completedGameKey: GameKey): void => {
  const unfinishedGames = getUnfinishedGames(completedGameKey);
  if (unfinishedGames.length === 0) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<GameProgressDialogDetail>(GAME_PROGRESS_EVENT_NAME, {
      detail: {
        outcome,
        unfinishedGames,
      },
    })
  );
};

export default GameProgressDialog;
