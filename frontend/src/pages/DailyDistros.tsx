import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Alert, Snackbar, Divider, FormControlLabel, Switch
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface Distro {
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

const STORAGE_KEY = 'linuxdle_distros_state';

const DailyDistros: React.FC = () => {
  const navigate = useNavigate();
  const [distros, setDistros] = useState<Distro[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<Distro | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hardMode, setHardMode] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchDistros = useCallback(async () => {
    try {
      const response = await apiClient.get<Distro[]>('/daily-distros');
      setDistros(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const updateLogoUrl = useCallback(async (tries: number, isHardMode: boolean) => {
    try {
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/daily-distros/daily-distro.png?numberOfTries=${tries}&hardMode=${isHardMode}&t=${timestamp}`, {
        responseType: 'blob'
      });
      const newUrl = URL.createObjectURL(response.data);
      setLogoUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) URL.revokeObjectURL(prevUrl);
        return newUrl;
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchDistros();
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.date === today) {
          const loadedHardMode = state.hardMode ?? true;
          setGuesses(state.guesses);
          setIsGameOver(state.isGameOver);
          setShowSuccess(state.showSuccess);
          setHardMode(loadedHardMode);
          await updateLogoUrl(state.isGameOver ? 12 : state.guesses.length + 1, state.isGameOver ? false : loadedHardMode);
          setLoading(false);
          return;
        }
      }
      await updateLogoUrl(1, true);
      setLoading(false);
    };
    init();
    return () => {
      setLogoUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) URL.revokeObjectURL(prevUrl);
        return '';
      });
    };
  }, [fetchDistros, today]); 

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: today,
        guesses,
        isGameOver,
        showSuccess,
        hardMode
      }));
    }
  }, [guesses, isGameOver, showSuccess, today, loading, hardMode]);

  const handleToggleHardMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameOver) return;
    const newMode = event.target.checked;
    setHardMode(newMode);
    updateLogoUrl(guesses.length + 1, newMode);
  };

  const handleSubmitGuess = async () => {
    if (!selectedGuess || isGameOver) return;
    try {
      const response = await apiClient.post<GuessResult>('/daily-distros/guesses', {
        userGuess: selectedGuess.slug
      });
      const newGuess = { name: selectedGuess.name, isCorrect: response.data.isCorrect };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      if (response.data.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
        updateLogoUrl(12, false); // Force normal mode on success
      } else {
        updateLogoUrl(Math.min(newGuesses.length + 1, 12), hardMode);
      }
      setSelectedGuess(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
          {`_ > DAILY_DISTRO`}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            $ fetch-logo --render
          </Typography>
          {!isGameOver && (
            <FormControlLabel
              control={
                <Switch
                  checked={hardMode}
                  onChange={handleToggleHardMode}
                  color="warning"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: hardMode ? 'warning.main' : 'inherit' }}>
                  LINUS_TORVALDS_MODE
                </Typography>
              }
            />
          )}
          {isGameOver && hardMode && (
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              MODE: LINUS_TORVALDS
            </Typography>
          )}
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper' }}>
        <Box sx={{ mb: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={logoUrl}
            alt="distro_logo"
            sx={{
              width: 200,
              height: 200,
              objectFit: 'contain',
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
              filter: hardMode && !isGameOver ? 'contrast(1.2)' : 'none'
            }}
          />
        </Box>

        <Box sx={{ width: '100%', mb: 4 }}>
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
          <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
            <Autocomplete
              fullWidth
              size="small"
              options={distros.filter(d => !guesses.some(g => g.name === d.name))}
              getOptionLabel={(option) => option?.name || ''}
              value={selectedGuess}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              onKeyDown={(e) => { if (e.key === 'Enter' && selectedGuess) handleSubmitGuess(); }}
              renderInput={(params) => <TextField {...params} label="select_distro" variant="outlined" />}
            />
            <Button variant="contained" color="primary" onClick={handleSubmitGuess} disabled={!selectedGuess}>
              EXEC
            </Button>
          </Box>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {`[OK] DISTRO_MATCHED`}
            </Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate('/des')} 
              endIcon={<ArrowForward />}
              sx={{ mt: 2 }}
            >
              CD ../DESKTOP_ENV
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DailyDistros;
