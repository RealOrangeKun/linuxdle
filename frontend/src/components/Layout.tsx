import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box, IconButton, useTheme } from '@mui/material';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Brightness4, Brightness7, Terminal, GitHub, LocalCafe, Whatshot } from '@mui/icons-material';
import { ColorModeContext } from '../App';
import apiClient from '../api/apiClient';
import SupportDialog, { EVENT_NAME, markSupportDialogShown, shouldShowSupportDialog } from './SupportDialog';
import type { SupportDialogReason } from './SupportDialog';

const STREAK_STORAGE_KEY = 'linuxdle_current_streak';
const GAME_STATE_KEYS = ['linuxdle_commands_state', 'linuxdle_distros_state', 'linuxdle_des_state'] as const;

interface UserStats {
  currentStreak: number;
  lastCompletedDate: string | null;
}

interface SupportDialogFeedback {
  reason: SupportDialogReason;
  currentStreak: number;
  previousStreak: number;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [supportOpen, setSupportOpen] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [pendingStreak, setPendingStreak] = useState<number | null>(null);
  const [dialogFeedback, setDialogFeedback] = useState<SupportDialogFeedback | null>(null);
  const [streakDeltaFlash, setStreakDeltaFlash] = useState<string | null>(null);

  const getCurrentStreakFromBackend = async (): Promise<number | null> => {
    try {
      const response = await apiClient.get<UserStats>('/users/stats');
      const current = response.data.currentStreak ?? 0;
      return current;
    } catch {
      return null;
    }
  };

  const fetchCurrentStreak = async (): Promise<number | null> => {
    const current = await getCurrentStreakFromBackend();

    if (current === null) {
      return null;
    }

    setStreak(current);
    localStorage.setItem(STREAK_STORAGE_KEY, String(current));
    return current;
  };

  const fetchStreakWithFeedback = async (reason: SupportDialogReason): Promise<SupportDialogFeedback | null> => {
    const previousStreak = Number(localStorage.getItem(STREAK_STORAGE_KEY) ?? '0') || 0;
    const current = await getCurrentStreakFromBackend();

    if (current === null) {
      return null;
    }

    // Store pending streak but don't update display yet - wait until popup closes
    setPendingStreak(current);
    localStorage.setItem(STREAK_STORAGE_KEY, String(current));

    return {
      reason,
      currentStreak: current,
      previousStreak
    };
  };

  const didUserGiveUpAnyGameToday = (): boolean => {
    const today = new Date().toISOString().split('T')[0];

    return GAME_STATE_KEYS.some((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return false;
      }

      try {
        const state = JSON.parse(raw) as { date?: string; hasGivenUp?: boolean };
        return state.date === today && state.hasGivenUp === true;
      } catch {
        return false;
      }
    });
  };

  useEffect(() => {
    const handler = async (event: Event) => {
      const customEvent = event as CustomEvent<{ reason?: SupportDialogReason }>;
      const eventReason = customEvent.detail?.reason ?? 'all-complete';

      const reason: SupportDialogReason =
        eventReason === 'all-complete' && didUserGiveUpAnyGameToday()
          ? 'give-up'
          : eventReason;

      if (eventReason === 'all-complete' && !shouldShowSupportDialog()) {
        return;
      }

      const feedback = await fetchStreakWithFeedback(reason);
      setDialogFeedback(feedback);

      markSupportDialogShown();
      setSupportOpen(true);
    };

    fetchCurrentStreak();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('focus', fetchCurrentStreak);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('focus', fetchCurrentStreak);
    };
  }, []);

  useEffect(() => {
    if (!streakDeltaFlash) {
      return;
    }

    const timer = setTimeout(() => setStreakDeltaFlash(null), 1800);
    return () => clearTimeout(timer);
  }, [streakDeltaFlash]);

  const handleSupportClose = () => {
    if (dialogFeedback && pendingStreak !== null) {
      // Update the displayed streak and trigger animation together
      setStreak(pendingStreak);
      
      const flashText = dialogFeedback.reason === 'all-complete'
        ? '+1'
        : `-${dialogFeedback.previousStreak}`;

      setStreakDeltaFlash(flashText);
    }

    setSupportOpen(false);
    setDialogFeedback(null);
    setPendingStreak(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
              onClick={() => navigate('/')}
            >
              <Terminal sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                noWrap
                sx={{ fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '.1rem' }}
              >
                LINUXDLE
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main', mr: { xs: 0.5, md: 1 }, position: 'relative' }}>
                <Whatshot fontSize="small" />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {`[${streak}]`}
                </Typography>
                {streakDeltaFlash && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: -40,
                      top: -12,
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '1.4rem',
                      color: streakDeltaFlash.startsWith('+') ? '#00ff00' : '#ff4444',
                      textShadow: streakDeltaFlash.startsWith('+') 
                        ? '0 0 8px rgba(0, 255, 0, 0.8), 0 0 16px rgba(0, 255, 0, 0.5)'
                        : '0 0 8px rgba(255, 68, 68, 0.8), 0 0 16px rgba(255, 68, 68, 0.5)',
                      animation: 'streak-pop 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                      '@keyframes streak-pop': {
                        '0%': { opacity: 0, transform: 'translateY(10px) scale(0.3)' },
                        '20%': { opacity: 1, transform: 'translateY(-2px) scale(1.3)' },
                        '50%': { opacity: 1, transform: 'translateY(-8px) scale(1.1)' },
                        '100%': { opacity: 0, transform: 'translateY(-20px) scale(0.8)' }
                      }
                    }}
                  >
                    {streakDeltaFlash}
                  </Typography>
                )}
              </Box>

              <Button 
                color="inherit" 
                onClick={() => navigate('/commands')}
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'monospace' }}
              >
                ./commands
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/distros')}
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'monospace' }}
              >
                ./distros
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/des')}
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'monospace' }}
              >
                ./des
              </Button>
              
              <IconButton 
                component="a" 
                href="https://github.com/RealOrangeKun/linuxdle" 
                target="_blank" 
                rel="noopener noreferrer" 
                color="inherit" 
                sx={{ ml: 1 }}
              >
                <GitHub />
              </IconButton>
              <IconButton
                component="a"
                href="https://ko-fi.com/orangekun"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                title="Support on Ko-fi"
                sx={{ ml: 1 }}
              >
                <LocalCafe />
              </IconButton>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ ml: 1 }}>
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: { xs: 2, md: 0 } }}>
              <Typography component={RouterLink} to="/about" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                About
              </Typography>
              <Typography component={RouterLink} to="/privacy" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Privacy Policy
              </Typography>
              <Typography component={RouterLink} to="/terms" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Terms of Service
              </Typography>
            </Box>
            <Typography variant="body2" align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              $ user@linuxdle: ~ {new Date().getFullYear()}
            </Typography>
          </Box>
        </Container>
      </Box>
      <SupportDialog open={supportOpen} onClose={handleSupportClose} />
    </Box>
  );
};

export default Layout;
