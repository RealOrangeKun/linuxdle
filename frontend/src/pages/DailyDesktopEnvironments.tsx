import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Divider, Backdrop, IconButton, Tooltip
} from '@mui/material';
import { Home, Close, ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface DesktopEnvironment {
  name: string;
  slug: string;
}

interface Guess {
  name: string;
  isCorrect: boolean;
}

interface GuessResult {
  isCorrect: boolean;
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

  // Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const today = new Date().toISOString().split('T')[0];

  const fetchScreenshot = useCallback(async () => {
    try {
      const response = await apiClient.get('/daily-desktop-environments/daily-desktop-environment.png', {
        responseType: 'blob'
      });
      const newUrl = URL.createObjectURL(response.data);
      setScreenshotUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) URL.revokeObjectURL(prevUrl);
        return newUrl;
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const fetchDes = useCallback(async () => {
    try {
      const response = await apiClient.get<DesktopEnvironment[]>('/daily-desktop-environments');
      setDes(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchDes(), fetchScreenshot()]);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.date === today) {
          setGuesses(state.guesses);
          setIsGameOver(state.isGameOver);
          setShowSuccess(state.showSuccess);
        }
      }
      setLoading(false);
    };
    init();
    return () => {
      setScreenshotUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) URL.revokeObjectURL(prevUrl);
        return '';
      });
    };
  }, [fetchScreenshot, fetchDes, today]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: today,
        guesses,
        isGameOver,
        showSuccess
      }));
    }
  }, [guesses, isGameOver, showSuccess, today, loading]);

  const handleSubmitGuess = async () => {
    if (!selectedGuess || isGameOver) return;
    try {
      const response = await apiClient.post<GuessResult>('/daily-desktop-environments/guesses', {
        userGuess: selectedGuess.slug
      });
      const newGuess = { name: selectedGuess.name, isCorrect: response.data.isCorrect };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      if (response.data.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
      }
      setSelectedGuess(null);
    } catch (error) {
      console.error('Error:', error);
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

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    if (isZoomed) resetZoom();
    setIsZoomed(!isZoomed);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
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

        <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
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
              {`[${index + 1}] ${guess.name}`}
            </Paper>
          ))}
        </Box>

        {!isGameOver ? (
          <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', gap: 1 }}>
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
            <Button variant="contained" color="primary" onClick={handleSubmitGuess} disabled={!selectedGuess}>
              EXEC
            </Button>
          </Box>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {`[OK] SYSTEM_IDENTIFIED`}
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
      </Paper>

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
          <Typography variant="caption">SCROLL TO ZOOM | DRAG TO PAN</Typography>
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
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
    </Container>
  );
};

export default DailyDesktopEnvironments;
