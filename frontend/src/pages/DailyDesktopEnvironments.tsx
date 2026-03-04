import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import apiClient from '../api/apiClient';

interface GuessResult {
  isCorrect: boolean;
}

const DailyDesktopEnvironments: React.FC = () => {
  const [des, setDes] = useState<string[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchScreenshot = useCallback(async () => {
    try {
      const response = await apiClient.get('/daily-desktop-environments/daily-desktop-environment.png', {
        responseType: 'blob'
      });
      const newUrl = URL.createObjectURL(response.data);
      setScreenshotUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return newUrl;
      });
    } catch (error) {
      console.error('Error fetching screenshot:', error);
    }
  }, []);

  useEffect(() => {
    const fetchDes = async () => {
      try {
        // Assuming there's an endpoint to get all DE names for the autocomplete
        // If not, we can hardcode some common ones for the MVP
        setDes(['GNOME', 'KDE Plasma', 'XFCE', 'MATE', 'Cinnamon', 'Pantheon', 'Budgie', 'Sway', 'i3', 'LXQt']);
      } catch (error) {
        console.error('Error fetching DEs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDes();
    fetchScreenshot();

    return () => {
      setScreenshotUrl(prevUrl => {
        if (prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return '';
      });
    };
  }, [fetchScreenshot]);

  const handleSubmitGuess = async () => {
    if (!selectedGuess || isGameOver) return;

    try {
      const response = await apiClient.post<GuessResult>('/daily-desktop-environments/guesses', {
        userGuess: selectedGuess
      });

      const newGuesses = [...guesses, selectedGuess];
      setGuesses(newGuesses);

      if (response.data.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
      } else if (newGuesses.length >= 6) {
        setIsGameOver(true);
      }
      setSelectedGuess(null);
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Daily Desktop Environment 🖥️
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={4}>
          Identify the Desktop Environment from the screenshot!
        </Typography>

        <Box sx={{ mb: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={screenshotUrl}
            alt="Desktop Screenshot"
            sx={{
              width: '100%',
              maxWidth: 700,
              height: 'auto',
              borderRadius: 2,
              border: '2px solid #e0e0e0',
              boxShadow: 2
            }}
          />
        </Box>

        <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
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
          <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', gap: 1 }}>
            <Autocomplete
              fullWidth
              options={des}
              value={selectedGuess}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              renderInput={(params) => <TextField {...params} label="Select a Desktop Environment" variant="outlined" />}
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
            <Typography variant="h6" color={showSuccess ? "success.main" : "error.main"} gutterBottom fontWeight="bold">
              {showSuccess ? "Spot on! That's the correct DE! 🎉" : "Out of tries! Better luck tomorrow! 🐧"}
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

export default DailyDesktopEnvironments;
