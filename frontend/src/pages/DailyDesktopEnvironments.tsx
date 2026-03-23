import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Divider, Backdrop, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert
} from '@mui/material';
import { Home, Close, ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { checkAllGamesCompleted, hasRedirectedToday, markAsRedirected } from '../utils/gameStatus';
import { getCachedYesterday, cacheYesterday } from '../utils/yesterdayCache';
import { SEO, pageSEO } from '../components/SEO';
import CountdownTimer from '../components/CountdownTimer';
import { useGameSettings } from '../hooks/useGameSettings';

interface DesktopEnvironment {
  name: string;
  slug: string;
}

interface Guess {
  name: string;
  isCorrect: boolean;
  family?: string;
  configurationLanguage?: string;
  releaseYear?: number;
  primaryLanguage?: string;
}

interface GuessResult {
  isCorrect: boolean;
  family?: string;
  configurationLanguage?: string;
  releaseYear?: number;
  primaryLanguage?: string;
}

const STORAGE_KEY = 'linuxdle_des_state';

const DailyDesktopEnvironments: React.FC = () => {
  const navigate = useNavigate();
  const [des, setDes] = useState<DesktopEnvironment[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<DesktopEnvironment | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [yesterdaysTarget, setYesterdaysTarget] = useState<DesktopEnvironment | null>(null);

  const { minGuessesToGiveUp, loading: settingsLoading } = useGameSettings();
  const [giveUpDialogOpen, setGiveUpDialogOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchDes = useCallback(async () => {
    try {
      const response = await apiClient.get<DesktopEnvironment[]>('/daily-desktop-environments');
      setDes(Array.isArray(response.data) ? response.data : []);

      // Fetch yesterday's target (check cache first)
      const cachedYesterday = getCachedYesterday<DesktopEnvironment>('des');
      if (cachedYesterday) {
        setYesterdaysTarget(cachedYesterday);
      } else {
        try {
          const yesterdayResponse = await apiClient.get<DesktopEnvironment>('/daily-desktop-environments/yesterdays-target');
          setYesterdaysTarget(yesterdayResponse.data);
          cacheYesterday('des', yesterdayResponse.data);
        } catch (error) {
          // Yesterday's target might not exist
          console.log('No yesterday\'s target available');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setDes([]); // Ensure des is an array even if fetch fails
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchDes();
      setScreenshotUrl(`${apiClient.defaults.baseURL}/daily-desktop-environments/daily-desktop-environment.png?v=${today}`);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (state.date === today) {
            setGuesses(Array.isArray(state.guesses) ? state.guesses : []);
            setIsGameOver(typeof state.isGameOver === 'boolean' ? state.isGameOver : false);
            setShowSuccess(typeof state.showSuccess === 'boolean' ? state.showSuccess : false);
            setHasGivenUp(typeof state.hasGivenUp === 'boolean' ? state.hasGivenUp : false);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    };
    init();
  }, [fetchDes, today]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: today,
        guesses,
        isGameOver,
        showSuccess,
        hasGivenUp
      }));
    }
  }, [guesses, isGameOver, showSuccess, hasGivenUp, today, loading]);

  useEffect(() => {
    if (isGameOver && !loading) {
      if (checkAllGamesCompleted() && !hasRedirectedToday()) {
        markAsRedirected();
        const timer = setTimeout(() => navigate('/'), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isGameOver, loading, navigate]);

  const handleSubmitGuess = async () => {
    if (!selectedGuess || isGameOver) return;

    try {
      const response = await apiClient.post<GuessResult>('/daily-desktop-environments/guesses', {
        userGuess: selectedGuess.slug,
        numberOfGuesses: guesses.length + 1
      });

      const newGuess: Guess = { 
        name: selectedGuess.name, 
        isCorrect: response.data.isCorrect,
        family: response.data.family,
        configurationLanguage: response.data.configurationLanguage,
        releaseYear: response.data.releaseYear,
        primaryLanguage: response.data.primaryLanguage
      };

      const newGuesses = [newGuess, ...guesses];
      setGuesses(newGuesses);
      if (response.data.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
      }
      setSelectedGuess(null);
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('given up')) {
          setIsGameOver(true);
          setHasGivenUp(true);
          setShowSuccess(false);
        } else if (msg.includes('won')) {
          setIsGameOver(true);
          setShowSuccess(true);
        }
        setErrorMessage(msg);
        setErrorSnackbarOpen(true);
      }
    }
  };

  const handleGiveUpConfirm = async () => {
    setGiveUpDialogOpen(false);
    try {
      const response = await apiClient.post<DesktopEnvironment>('/daily-desktop-environments/give-up');
      setIsGameOver(true);
      setShowSuccess(false);
      setHasGivenUp(true);
      const newGuess: Guess = { name: `Gave up -> Answer: ${response.data.name}`, isCorrect: false };
      setGuesses([newGuess, ...guesses]);
      setSelectedGuess(null);
    } catch (error: any) {
      console.error('Error giving up:', error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('given up')) {
          setIsGameOver(true);
          setHasGivenUp(true);
          setShowSuccess(false);
        } else if (msg.includes('won')) {
          setIsGameOver(true);
          setShowSuccess(true);
        }
        setErrorMessage(msg);
        setErrorSnackbarOpen(true);
      }
    }
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (!isZoomed) return;
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(prev => Math.min(Math.max(1, prev + delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchDistance.current = null;
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastMousePos.current.x;
      const dy = e.touches[0].clientY - lastMousePos.current.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.hypot(dx, dy);
      const delta = (newDistance - lastTouchDistance.current) * 0.01;
      setScale(prev => Math.min(Math.max(1, prev + delta), 5));
      lastTouchDistance.current = newDistance;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    lastTouchDistance.current = null;
  };

  // Attach non-passive native touchmove to allow e.preventDefault() (React passive by default)
  useEffect(() => {
    const el = zoomContainerRef.current;
    if (!el) return;
    const nativeTouchMove = (e: TouchEvent) => {
      if (isDragging.current || (e.touches.length === 2 && lastTouchDistance.current !== null)) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', nativeTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', nativeTouchMove);
  }, [isZoomed]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    if (isZoomed) resetZoom();
    setIsZoomed(!isZoomed);
  };

  const latestHints = guesses[0] || {};
  const nextHintThresholds = [2, 4, 6, 8];
  const nextThreshold = nextHintThresholds.find(t => t > guesses.length);
  const guessesUntilNextHint = nextThreshold ? nextThreshold - guesses.length : 0;

  if (loading || settingsLoading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <>
      <SEO {...pageSEO.dailyDesktopEnvironments} />
      <Container maxWidth="md">
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
            {`_ > DAILY_DESKTOP_ENV`}
          </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          $ view-screenshot --interactive
        </Typography>
      </Box>

      {isGameOver && checkAllGamesCompleted() && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'success.main', mb: 1, fontWeight: 'bold' }}>
            [OK] ALL_MODULES_COMPLETE
          </Typography>
          <CountdownTimer />
        </Box>
      )}

      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper' }}>
        <Box sx={{ mb: 4, width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <Tooltip title="Click to zoom / focus">
            <Box
              component="img"
              src={screenshotUrl}
              alt="system_screenshot"
              onClick={toggleZoom}
              sx={{
                width: '100%',
                maxWidth: 600,
                height: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'zoom-in',
                transition: 'transform 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'scale(1.01)'
                }
              }}
            />
          </Tooltip>
        </Box>

        {/* Hints / Progress Section */}
        <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
          {!isGameOver && guessesUntilNextHint > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mb: 1, 
                color: 'primary.main',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            >
              {`[ HINT_STATUS: ${guessesUntilNextHint} guess${guessesUntilNextHint === 1 ? '' : 'es'} until next leak ]`}
            </Typography>
          )}

          {(latestHints.family || latestHints.configurationLanguage || latestHints.releaseYear || latestHints.primaryLanguage) && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: 'rgba(0, 255, 0, 0.03)', 
                borderColor: 'primary.main',
                borderStyle: 'dashed',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  bgcolor: 'primary.main', 
                  color: 'background.paper',
                  px: 1,
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  letterSpacing: 1
                }}
              >
                DECRYPTED_DATA
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {latestHints.family && (
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>FAMILY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{latestHints.family}</Typography>
                  </Box>
                )}
                {latestHints.configurationLanguage && (
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>CONFIG_LANG</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{latestHints.configurationLanguage}</Typography>
                  </Box>
                )}
                {latestHints.releaseYear && (
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>RELEASE_YEAR</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{latestHints.releaseYear}</Typography>
                  </Box>
                )}
                {latestHints.primaryLanguage && (
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>PRIMARY_LANG</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{latestHints.primaryLanguage}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Box>

        {!isGameOver ? (
          <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', gap: 1, mb: 4 }}>
            <Autocomplete
              fullWidth
              size="small"
              options={des.filter(de => !guesses.some(g => g.name === de.name))}
              getOptionLabel={(option) => option?.name || ''}
              value={selectedGuess}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              onKeyDown={(e) => { if (e.key === 'Enter' && selectedGuess) handleSubmitGuess(); }}
              renderInput={(params) => <TextField {...params} label="select_env" variant="outlined" />}
            />
            {guesses.length >= minGuessesToGiveUp && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setGiveUpDialogOpen(true)}
                sx={{ px: 2 }}
                title="Give Up"
              >
                SIGKILL
              </Button>
            )}
            <Button variant="contained" color="primary" onClick={handleSubmitGuess} disabled={!selectedGuess}>
              EXEC
            </Button>
          </Box>
        ) : (
          <Box textAlign="center" mb={4}>
            <Typography variant="h6" color={hasGivenUp ? "error.main" : "success.main"} fontWeight="bold">
              {hasGivenUp ? `[SIGKILL] SYSTEM_ABORTED` : `[OK] SYSTEM_IDENTIFIED`}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/')} 
              startIcon={<Home />}
              sx={{ mt: 2 }}
            >
              CD /HOME
            </Button>
          </Box>
        )}

        <Box sx={{ width: '100%', maxWidth: 500 }}>
          {guesses.map((guess, index) => (
            <Paper 
              key={index} 
              variant="outlined" 
              sx={{ 
                p: 1, 
                mb: 1, 
                textAlign: 'center', 
                bgcolor: guess.isCorrect ? '#4caf50' : '#f44336',
                color: 'white',
                fontWeight: 'bold',
                border: 'none'
              }}
            >
              {`[${guesses.length - index}] ${guess.name}`}
            </Paper>
          ))}
        </Box>
      </Paper>

      {yesterdaysTarget && (
        <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'background.paper', borderColor: 'primary.main' }}>
          <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
            $ cat /var/log/yesterday.log
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Yesterday's target was: <strong>{yesterdaysTarget.name}</strong>
          </Typography>
        </Paper>
      )}

      {/* Fullscreen Zoomable Backdrop */}
      <Backdrop
        open={isZoomed}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          bgcolor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 10 }}>
          <IconButton onClick={resetZoom} color="inherit" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
            <RestartAlt />
          </IconButton>
          <IconButton onClick={toggleZoom} color="inherit" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: 'rgba(0,0,0,0.6)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
          <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>SCROLL TO ZOOM | DRAG TO PAN</Typography>
          <Typography variant="caption" sx={{ display: { xs: 'block', sm: 'none' } }}>PINCH TO ZOOM | DRAG TO PAN</Typography>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'white' }} />
          <Box display="flex" alignItems="center">
            <ZoomOut fontSize="small" />
            <Typography variant="body2" sx={{ mx: 1, minWidth: 40, textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </Typography>
            <ZoomIn fontSize="small" />
          </Box>
        </Box>

        <Box
          ref={zoomContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: scale > 1 ? 'grab' : 'default',
            '&:active': { cursor: scale > 1 ? 'grabbing' : 'default' }
          }}
        >
          <Box
            component="img"
            src={screenshotUrl}
            alt="zoomed_screenshot"
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none', // Handle pointer events on the container
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
            }}
          />
        </Box>
      </Backdrop>
      
      <Dialog open={giveUpDialogOpen} onClose={() => setGiveUpDialogOpen(false)}>
        <DialogTitle>Confirm Give Up</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to give up? The answer will be revealed and you will not be able to guess again today.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGiveUpDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGiveUpConfirm} color="error" variant="contained">Give Up</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setErrorSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
    </>
  );
};

export default DailyDesktopEnvironments;