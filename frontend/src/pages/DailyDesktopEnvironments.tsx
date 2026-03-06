import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Alert, Snackbar, Divider
} from '@mui/material';
import { Home } from '@mui/icons-material';
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

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
          {`_ > DAILY_DESKTOP_ENV`}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          $ view-screenshot --full-screen
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper' }}>
        <Box sx={{ mb: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={screenshotUrl}
            alt="system_screenshot"
            sx={{
              width: '100%',
              maxWidth: 600,
              height: 'auto',
              border: '1px solid',
              borderColor: 'divider'
            }}
          />
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
    </Container>
  );
};

export default DailyDesktopEnvironments;
