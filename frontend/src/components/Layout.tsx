import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  IconButton,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  DarkMode,
  LightMode,
  Terminal,
  GitHub,
  LocalCafe,
  Whatshot,
  MenuBook,
  Home,
  Image,
  DesktopWindows
} from '@mui/icons-material';
import { ColorModeContext } from '../App';
import apiClient from '../api/apiClient';
import SupportDialog, { EVENT_NAME, markSupportDialogShown, shouldShowSupportDialog } from './SupportDialog';
import type { SupportDialogReason } from './SupportDialog';
import GameProgressDialog, {
  GAME_PROGRESS_EVENT_NAME,
  type GameProgressDialogDetail,
} from './GameProgressDialog';
import AdSenseLoader from './AdSenseLoader';

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
  const location = useLocation();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [supportOpen, setSupportOpen] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [pendingStreak, setPendingStreak] = useState<number | null>(null);
  const [dialogFeedback, setDialogFeedback] = useState<SupportDialogFeedback | null>(null);
  const [streakDeltaFlash, setStreakDeltaFlash] = useState<string | null>(null);
  const [gameProgressOpen, setGameProgressOpen] = useState(false);
  const [gameProgressPayload, setGameProgressPayload] = useState<GameProgressDialogDetail | null>(null);

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

    const gameProgressHandler = (event: Event) => {
      const customEvent = event as CustomEvent<GameProgressDialogDetail>;
      const detail = customEvent.detail;

      if (!detail || !Array.isArray(detail.unfinishedGames) || detail.unfinishedGames.length === 0) {
        return;
      }

      setGameProgressPayload(detail);
      setGameProgressOpen(true);
    };

    fetchCurrentStreak();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener(GAME_PROGRESS_EVENT_NAME, gameProgressHandler);
    window.addEventListener('focus', fetchCurrentStreak);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener(GAME_PROGRESS_EVENT_NAME, gameProgressHandler);
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

  const handleGameProgressClose = () => {
    setGameProgressOpen(false);
    setGameProgressPayload(null);
  };

  const handleGameProgressNavigate = (path: string) => {
    handleGameProgressClose();
    navigate(path);
  };

  const pathname = location.pathname;
  const mobileNavValue =
    pathname === '/' ? 'home'
      : pathname.startsWith('/commands') ? 'commands'
      : pathname.startsWith('/distros') ? 'distros'
      : pathname.startsWith('/des') ? 'des'
      : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdSenseLoader />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: { xs: 'block', sm: 'none' }
        }}
      >
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

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main', mr: 0.5, position: 'relative' }}>
                <Whatshot sx={{ fontSize: { xs: 21, sm: 23, md: 24 } }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {`[${streak}]`}
                </Typography>
                {streakDeltaFlash && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: 'unset',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: -12,
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '1.4rem',
                      whiteSpace: 'nowrap',
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

              <IconButton
                component="a"
                href="https://github.com/RealOrangeKun/linuxdle"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                title="GitHub Repository"
                size="small"
                sx={{ p: { xs: 0.8, sm: 1 } }}
              >
                <GitHub sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
              </IconButton>
              <IconButton
                component="a"
                href="https://ko-fi.com/orangekun"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                title="Support on Ko-fi"
                size="small"
                sx={{ p: { xs: 0.8, sm: 1 } }}
              >
                <LocalCafe sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
              </IconButton>

              <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ p: { xs: 0.8, sm: 1 } }}>
                {theme.palette.mode === 'dark'
                  ? <LightMode sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
                  : <DarkMode sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', display: { xs: 'none', sm: 'block' } }}
      >
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
                <Whatshot sx={{ fontSize: { xs: 21, sm: 23, md: 24 } }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {`[${streak}]`}
                </Typography>
                {streakDeltaFlash && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: { xs: 'unset', sm: -40 },
                      left: { xs: '50%', sm: 'unset' },
                      transform: { xs: 'translateX(-50%)', sm: 'none' },
                      top: -12,
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '1.4rem',
                      whiteSpace: 'nowrap',
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
                onClick={() => navigate('/man')}
                color="inherit"
                title="Manual (man page)"
                sx={{ ml: { xs: 0, md: 1 }, color: 'primary.main', display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <MenuBook sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://github.com/RealOrangeKun/linuxdle" 
                target="_blank" 
                rel="noopener noreferrer" 
                color="inherit" 
                title="GitHub Repository"
                sx={{ ml: { xs: 0, md: 1 }, display: { xs: 'none', sm: 'inline-flex' }, p: { sm: 0.9, md: 1 } }}
              >
                <GitHub sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
              </IconButton>
              <IconButton
                component="a"
                href="https://ko-fi.com/orangekun"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                title="Support on Ko-fi"
                sx={{ ml: { xs: 0, md: 1 }, display: { xs: 'none', sm: 'inline-flex' }, p: { sm: 0.9, md: 1 } }}
              >
                <LocalCafe sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
              </IconButton>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ ml: { xs: 0, md: 1 }, p: { sm: 0.9, md: 1 } }}>
                {theme.palette.mode === 'dark'
                  ? <LightMode sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />
                  : <DarkMode sx={{ fontSize: { xs: 23, sm: 24, md: 25 } }} />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ mt: { xs: 10, sm: 4 }, mb: { xs: 10, sm: 4 }, flex: 1 }}>
        <Outlet />
      </Container>

      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: 1,
          borderColor: 'divider',
          zIndex: theme.zIndex.appBar,
          bgcolor: 'background.paper'
        }}
      >
        <BottomNavigation
          showLabels
          value={mobileNavValue}
          sx={{
            height: 68,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              px: 0.25,
            },
            '& .MuiBottomNavigationAction-label': {
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              marginTop: '2px',
            }
          }}
        >
          <BottomNavigationAction
            value="home"
            label="Home"
            icon={<Home fontSize="small" />}
            onClick={() => navigate('/')}
            aria-label="Home"
          />
          <BottomNavigationAction
            value="commands"
            label="Commands"
            icon={<Terminal fontSize="small" />}
            onClick={() => navigate('/commands')}
            aria-label="Daily Commands"
          />
          <BottomNavigationAction
            value="distros"
            label="Distros"
            icon={<Image fontSize="small" />}
            onClick={() => navigate('/distros')}
            aria-label="Daily Distros"
          />
          <BottomNavigationAction
            value="des"
            label="DEs"
            icon={<DesktopWindows fontSize="small" />}
            onClick={() => navigate('/des')}
            aria-label="Daily Desktop Environments"
          />
        </BottomNavigation>
      </Paper>

      <Box component="footer" sx={{ py: 3, px: 2, pb: { xs: 11, sm: 3 }, mt: 'auto', borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: { xs: 2, md: 0 }, flexWrap: 'wrap' }}>
              <Typography component={RouterLink} to="/about" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                About
              </Typography>
              <Typography component={RouterLink} to="/privacy" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Privacy Policy
              </Typography>
              <Typography component={RouterLink} to="/terms" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Terms of Service
              </Typography>
              <Typography component={RouterLink} to="/contact" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Contact Us
              </Typography>
              <Typography component={RouterLink} to="/releases" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Releases
              </Typography>
              <Typography component={RouterLink} to="/guides" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Guides
              </Typography>
            </Box>
            <Typography variant="body2" align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              $ user@linuxdle: ~ {new Date().getFullYear()}
            </Typography>
          </Box>
        </Container>
      </Box>
      <GameProgressDialog
        open={gameProgressOpen}
        payload={gameProgressPayload}
        onClose={handleGameProgressClose}
        onNavigate={handleGameProgressNavigate}
      />
      <SupportDialog open={supportOpen} onClose={handleSupportClose} />
    </Box>
  );
};

export default Layout;
