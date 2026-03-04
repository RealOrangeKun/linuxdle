import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import apiClient from '../api/apiClient';

interface Distro {
  name: string;
  slug: string;
}

interface GuessResult {
  isCorrect: boolean;
}

const DailyDistros: React.FC = () => {
  const [distros, setDistros] = useState<Distro[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<Distro | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hardMode] = useState(false);

  const fetchDistros = useCallback(async () => {
    try {
      const response = await apiClient.get<Distro[]>('/daily-distros');
      setDistros(response.data);
    } catch (error) {
      console.error('Error fetching distros:', error);
    }
  }, []);

  const updateLogoUrl = useCallback(async (tries: number) => {
    try {
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/daily-distros/daily-distro.png?numberOfTries=${tries}&hardMode=${hardMode}&t=${timestamp}`, {
        responseType: 'blob'
      });
      
      const newUrl = URL.createObjectURL(response.data);
      setLogoUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return newUrl;
      });
    } catch (error) {
      console.error('Error fetching distro logo:', error);
    }
  }, [hardMode]);

  useEffect(() => {
    const init = async () => {
      await fetchDistros();
      await updateLogoUrl(1);
      setLoading(false);
    };

    init();
    
    return () => {
      setLogoUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return '';
      });
    };
  }, [fetchDistros, updateLogoUrl]);

  const handleSubmitGuess = async () => {
    if (!selectedGuess || isGameOver) return;

    try {
      const response = await apiClient.post<GuessResult>('/daily-distros/guesses', {
        userGuess: selectedGuess.slug
      });

      const newGuesses = [...guesses, selectedGuess.name];
      setGuesses(newGuesses);

      if (response.data.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
        updateLogoUrl(6); // Final clear version
      } else if (newGuesses.length >= 6) {
        setIsGameOver(true);
        updateLogoUrl(6);
      } else {
        updateLogoUrl(newGuesses.length + 1);
      }
      setSelectedGuess(null);
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Daily Distro 🐧
        </Typography>

        <Box sx={{ my: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={logoUrl}
            alt="Distro Logo"
            sx={{
              width: 250,
              height: 250,
              objectFit: 'contain',
              borderRadius: 2,
              border: '2px solid #e0e0e0',
              bgcolor: '#fff'
            }}
          />
        </Box>

        <Box sx={{ width: '100%', mb: 4 }}>
          {guesses.map((guess, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 1, mb: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              {guess}
            </Paper>
          ))}
          {Array.from({ length: 6 - guesses.length }).map((_, i) => (
            <Paper key={`empty-${i}`} variant="outlined" sx={{ p: 1, mb: 1, textAlign: 'center', borderStyle: 'dashed', color: '#bdbdbd' }}>
              Guess {guesses.length + i + 1}
            </Paper>
          ))}
        </Box>

        {!isGameOver ? (
          <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
            <Autocomplete
              fullWidth
              options={distros}
              getOptionLabel={(option) => option.name}
              value={selectedGuess}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              renderInput={(params) => <TextField {...params} label="Select a Distribution" variant="outlined" />}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!selectedGuess}
              onClick={handleSubmitGuess}
            >
              Guess
            </Button>
          </Box>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" color={showSuccess ? "success.main" : "error.main"} gutterBottom>
              {showSuccess ? "Well done! You got it! 🎉" : "Out of tries! Better luck tomorrow! 🐧"}
            </Typography>
            <Button variant="outlined" onClick={() => window.location.reload()} startIcon={<Refresh />}>
              Play Again?
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>Correct guess!</Alert>
      </Snackbar>
    </Container>
  );
};

export default DailyDistros;
