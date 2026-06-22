import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Divider, FormControlLabel, Switch,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../api/apiClient';
import { checkAllGamesCompleted, hasRedirectedToday, markAsRedirected } from '../utils/gameStatus';
import { dispatchSupportDialog } from '../components/SupportDialog';
import { dispatchGameProgressDialog } from '../components/GameProgressDialog';
import { getCachedYesterday, cacheYesterday } from '../utils/yesterdayCache';
import { SEO, pageSEO } from '../components/SEO';
import CountdownTimer from '../components/CountdownTimer';
import { useGameSettings } from '../hooks/useGameSettings';
import { useMidnightReload } from '../hooks/useMidnightReload';

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

interface PastPuzzle {
  id: number;
  gameId: number;
  scheduledDate: string;
  isCompleted: boolean;
  isAttempted: boolean;
}

const STORAGE_KEY = 'linuxdle_distros_state';

const DailyDistros: React.FC = () => {
  const navigate = useNavigate();
  const { puzzleId } = useParams<{ puzzleId?: string }>();
  const isPastPuzzle = !!puzzleId;

  const [distros, setDistros] = useState<Distro[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<Distro | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedOptionRef = useRef<Distro | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [hardMode, setHardMode] = useState(true);
  const [yesterdaysTarget, setYesterdaysTarget] = useState<Distro | null>(null);
  const [nextPuzzleId, setNextPuzzleId] = useState<number | null>(null);
  const [allPastPuzzles, setAllPastPuzzles] = useState<PastPuzzle[]>([]);

  const { minGuessesToGiveUp, loading: settingsLoading } = useGameSettings();
  useMidnightReload();
  const [giveUpDialogOpen, setGiveUpDialogOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');

  const today = new Date().toISOString().split('T')[0];
  const storageKey = isPastPuzzle ? `linuxdle_distros_state_${puzzleId}` : STORAGE_KEY;

  const fetchDistros = useCallback(async () => {
    try {
      const response = await apiClient.get<Distro[]>('/daily-distros');
      setDistros(Array.isArray(response.data) ? response.data : []);

      // Fetch yesterday's target (check cache first) if not playing a past puzzle
      if (!isPastPuzzle) {
        const cachedYesterday = getCachedYesterday<Distro>('distros');
        if (cachedYesterday) {
          setYesterdaysTarget(cachedYesterday);
        } else {
          try {
            const yesterdayResponse = await apiClient.get<Distro>('/daily-distros/yesterdays-target');
            setYesterdaysTarget(yesterdayResponse.data);
            cacheYesterday('distros', yesterdayResponse.data);
          } catch {
            // Yesterday's target might not exist
            console.log('No yesterday\'s target available');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setDistros([]); // Ensure distros is an array even if fetch fails
    }
  }, [isPastPuzzle]);

  const updateLogoUrl = useCallback((tries: number, isHardMode: boolean) => {
    const url = isPastPuzzle
      ? `${apiClient.defaults.baseURL}/past-puzzles/${puzzleId}/logo?numberOfTries=${tries}&hardMode=${isHardMode}`
      : `${apiClient.defaults.baseURL}/daily-distros/daily-distro.png?numberOfTries=${tries}&hardMode=${isHardMode}&v=${today}`;
    setLogoUrl(url);
  }, [today, isPastPuzzle, puzzleId]);

  useEffect(() => {
    const init = async () => {
      await fetchDistros();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          const isStateValid = isPastPuzzle ? state.puzzleId === puzzleId : state.date === today;
          if (isStateValid) {
            const parsedGuesses = Array.isArray(state.guesses) ? state.guesses : [];
            const parsedIsGameOver = typeof state.isGameOver === 'boolean' ? state.isGameOver : false;
            const parsedShowSuccess = typeof state.showSuccess === 'boolean' ? state.showSuccess : false;
            const parsedHasGivenUp = typeof state.hasGivenUp === 'boolean' ? state.hasGivenUp : false;
            const loadedHardMode = typeof state.hardMode === 'boolean' ? state.hardMode : true;

            setGuesses(parsedGuesses);
            setIsGameOver(parsedIsGameOver);
            setShowSuccess(parsedShowSuccess);
            setHasGivenUp(parsedHasGivenUp);
            setHardMode(loadedHardMode);
            updateLogoUrl(parsedIsGameOver ? 12 : parsedGuesses.length + 1, parsedIsGameOver ? false : loadedHardMode);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
      updateLogoUrl(1, true);
      setLoading(false);
    };
    init();
  }, [fetchDistros, today, updateLogoUrl, storageKey, isPastPuzzle, puzzleId]); 

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(storageKey, JSON.stringify({
        date: today,
        puzzleId: puzzleId,
        guesses,
        isGameOver,
        showSuccess,
        hasGivenUp,
        hardMode
      }));
    }
  }, [guesses, isGameOver, showSuccess, hasGivenUp, today, loading, hardMode, storageKey, puzzleId]);

  useEffect(() => {
    if (isPastPuzzle && puzzleId) {
      apiClient.get<PastPuzzle[]>('/past-puzzles')
        .then(response => {
          const allPuzzles = response.data;
          setAllPastPuzzles(allPuzzles);
          const currentPuzzle = allPuzzles.find(p => p.id === Number(puzzleId));
          if (currentPuzzle) {
            const currentScheduledDate = currentPuzzle.scheduledDate;
            const nextPuzzle = allPuzzles.find(p => p.scheduledDate === currentScheduledDate && p.gameId === 3);
            if (nextPuzzle) {
              setNextPuzzleId(nextPuzzle.id);
            }
          }
        })
        .catch(err => console.error('Error fetching past puzzles for navigation:', err));
    }
  }, [isPastPuzzle, puzzleId]);

  useEffect(() => {
    if (isGameOver && !loading && !isPastPuzzle) {
      if (checkAllGamesCompleted()) {
        dispatchSupportDialog('all-complete');
        if (!hasRedirectedToday()) {
          markAsRedirected();
          const timer = setTimeout(() => navigate('/'), 2000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isGameOver, loading, navigate, isPastPuzzle]);

  const handleToggleHardMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameOver) return;
    const newMode = event.target.checked;
    setHardMode(newMode);
    updateLogoUrl(guesses.length + 1, newMode);
  };

  const handleResetPuzzle = async () => {
    if (!isPastPuzzle || !puzzleId) return;
    try {
      await apiClient.post(`/past-puzzles/${puzzleId}/reset`);
      localStorage.removeItem(storageKey);
      
      setGuesses([]);
      setIsGameOver(false);
      setShowSuccess(false);
      setHasGivenUp(false);
      setHardMode(true);
      setSelectedGuess(null);
      setInputValue('');
      updateLogoUrl(1, true);
      
      setSnackbarSeverity('success');
      setErrorMessage("Puzzle progress has been reset successfully.");
      setErrorSnackbarOpen(true);
    } catch (error) {
      console.error('Error resetting puzzle:', error);
      setSnackbarSeverity('error');
      setErrorMessage("Failed to reset puzzle.");
      setErrorSnackbarOpen(true);
    }
  };

  const handleSubmitGuess = async (overrideGuess?: Distro | null) => {
    const guess = overrideGuess !== undefined ? overrideGuess : selectedGuess;
    if (!guess || isGameOver) return;

    try {
      const isFirstTryAttempt = guesses.length === 0;
      const url = isPastPuzzle ? `/past-puzzles/${puzzleId}/guesses` : '/daily-distros/guesses';
      const response = await apiClient.post<GuessResult>(url, {
        userGuess: guess.slug
      });
      const newGuess = { name: guess.name, isCorrect: response.data.isCorrect };
      const newGuesses = [newGuess, ...guesses];
      setGuesses(newGuesses);
      if (response.data.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
        dispatchGameProgressDialog('success', 'distros', isFirstTryAttempt, puzzleId, allPastPuzzles);
        updateLogoUrl(12, false); // Force normal mode on success
      } else {
        updateLogoUrl(Math.min(newGuesses.length + 1, 12), hardMode);
      }
      setSelectedGuess(null);
      highlightedOptionRef.current = null;
      setInputValue('');
      setAutocompleteOpen(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('given up')) {
          setIsGameOver(true);
          setHasGivenUp(true);
          setShowSuccess(false);
          updateLogoUrl(12, false);
        } else if (msg.includes('won')) {
          setIsGameOver(true);
          setShowSuccess(true);
          updateLogoUrl(12, false);
        }
        setSnackbarSeverity('error');
        setErrorMessage(msg);
        setErrorSnackbarOpen(true);
      }
    }
  };

  const handleGiveUpConfirm = async () => {
    setGiveUpDialogOpen(false);
    try {
      const url = isPastPuzzle ? `/past-puzzles/${puzzleId}/give-up` : '/daily-distros/give-up';
      const response = await apiClient.post<Distro>(url);
      setIsGameOver(true);
      setShowSuccess(false);
      setHasGivenUp(true);
      setGuesses([{ name: `Gave up -> Answer: ${response.data.name}`, isCorrect: false }, ...guesses]);
      updateLogoUrl(12, false);
      setSelectedGuess(null);
      dispatchGameProgressDialog('give-up', 'distros', false, puzzleId, allPastPuzzles);
    } catch (error) {
      console.error('Error giving up:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('given up')) {
          setIsGameOver(true);
          setHasGivenUp(true);
          setShowSuccess(false);
          updateLogoUrl(12, false);
        } else if (msg.includes('won')) {
          setIsGameOver(true);
          setShowSuccess(true);
          updateLogoUrl(12, false);
        }
        setSnackbarSeverity('error');
        setErrorMessage(msg);
        setErrorSnackbarOpen(true);
      }
    }
  };

  if (loading || settingsLoading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <>
      <SEO {...pageSEO.dailyDistros} />
      <Container maxWidth="sm">
        {isPastPuzzle && (
          <Alert 
            severity="warning" 
            variant="outlined" 
            sx={{ 
              mb: 3, 
              fontFamily: 'monospace', 
              borderRadius: 0,
              '& .MuiAlert-message': {
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1.5, sm: 2 }
              }
            }}
          >
            <Box>
              This is a past puzzle. Playing or resetting it will not affect your daily streak.
            </Box>
            <Button 
              size="small" 
              variant="outlined" 
              color="warning" 
              sx={{ fontFamily: 'monospace', borderRadius: 0, flexShrink: 0 }} 
              onClick={handleResetPuzzle}
            >
              RESET_PROGRESS
            </Button>
          </Alert>
        )}
        <Box mb={4}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            sx={{ 
              color: isPastPuzzle ? 'warning.main' : 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' }
            }}
          >
            {isPastPuzzle ? `_ > PAST_DISTRO (PUZZLE #${puzzleId})` : `_ > DAILY_DISTRO`}
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

      {isGameOver && !isPastPuzzle && checkAllGamesCompleted() && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'success.main', mb: 1, fontWeight: 'bold' }}>
            [OK] ALL_MODULES_COMPLETE
          </Typography>
          <CountdownTimer />
        </Box>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper' }}>
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

        {!isGameOver ? (
          <Box 
            sx={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 1, 
              mb: 4 
            }}
          >
            <Autocomplete
              fullWidth
              size="small"
              open={autocompleteOpen}
              onOpen={() => setAutocompleteOpen(true)}
              onClose={() => {
                setAutocompleteOpen(false);
                highlightedOptionRef.current = null;
              }}
              options={distros.filter(d => !guesses.some(g => g.name === d.name))}
              getOptionLabel={(option) => option?.name || ''}
              filterOptions={(options, { inputValue }) =>
                inputValue
                  ? options.filter(o => o.name.toLowerCase().startsWith(inputValue.toLowerCase()))
                  : options
              }
              value={selectedGuess}
              inputValue={inputValue}
              onInputChange={(_, newInputValue, reason) => {
                setInputValue(newInputValue);
                highlightedOptionRef.current = null;
                if (reason === 'input') {
                  setSelectedGuess(null);
                }
                if (newInputValue) setAutocompleteOpen(true);
              }}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              onHighlightChange={(_, option) => {
                highlightedOptionRef.current = option ?? null;
              }}
              onKeyDown={(e) => {
                const availableOptions = distros.filter(d => !guesses.some(g => g.name === d.name));
                const filteredOptions = availableOptions.filter(d =>
                  d.name.toLowerCase().startsWith(inputValue.toLowerCase())
                );
                const firstOption = filteredOptions[0] ?? null;
                const normalizedInput = inputValue.trim().toLowerCase();
                const highlightedOption = highlightedOptionRef.current;
                const validHighlightedOption = highlightedOption && filteredOptions.includes(highlightedOption)
                  ? highlightedOption
                  : null;
                const exactOption = normalizedInput
                  ? filteredOptions.find(d => d.name.toLowerCase() === normalizedInput) ?? null
                  : null;
                const validSelectedOption = selectedGuess && filteredOptions.includes(selectedGuess)
                  ? selectedGuess
                  : null;

                if (e.key === 'Tab' || e.key === 'ArrowRight') {
                  if (!selectedGuess && firstOption) {
                    e.preventDefault();
                    setSelectedGuess(firstOption);
                    setInputValue(firstOption.name);
                  }
                } else if (e.key === 'Enter') {
                  const toSubmit = autocompleteOpen
                    ? validHighlightedOption ?? exactOption ?? validSelectedOption ?? firstOption
                    : selectedGuess;
                  if (toSubmit) {
                    e.preventDefault();
                    handleSubmitGuess(toSubmit);
                  }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="select_distro"
                  variant="outlined"
                  inputRef={inputRef}
                  autoFocus
                />
              )}
            />
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              {guesses.length >= minGuessesToGiveUp && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setGiveUpDialogOpen(true)}
                  sx={{ px: 2, flexGrow: { xs: 1, sm: 0 } }}
                  title="Give Up"
                >
                  SIGKILL
                </Button>
              )}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleSubmitGuess()} 
                disabled={!selectedGuess}
                sx={{ flexGrow: { xs: 1, sm: 0 }, px: 4 }}
              >
                EXEC
              </Button>
            </Box>
          </Box>
        ) : (
          <Box textAlign="center" mb={4}>
            <Typography variant="h6" color={hasGivenUp ? "error.main" : "success.main"} fontWeight="bold">
              {hasGivenUp ? `[SIGKILL] DISTRO_MISMATCH` : `[OK] DISTRO_MATCHED`}
            </Typography>
            {isPastPuzzle ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: 1.5, 
                  mt: 2, 
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 'fit-content' },
                  mx: 'auto'
                }}
              >
                <Button 
                  variant="outlined" 
                  color="warning" 
                  onClick={handleResetPuzzle} 
                  sx={{ px: 3, borderRadius: 0 }}
                >
                  RESET_PUZZLE
                </Button>
                {nextPuzzleId ? (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate(`/des/${nextPuzzleId}`)} 
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 0 }}
                  >
                    CD ../DESKTOP_ENV
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate('/history')} 
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 0 }}
                  >
                    CD ../HISTORY
                  </Button>
                )}
              </Box>
            ) : (
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate('/des')} 
                endIcon={<ArrowForward />}
                sx={{ mt: 2, borderRadius: 0 }}
              >
                CD ../DESKTOP_ENV
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ width: '100%' }}>
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
      
      <Dialog open={giveUpDialogOpen} onClose={() => setGiveUpDialogOpen(false)}>
        <DialogTitle>Confirm Give Up</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to give up? The answer will be revealed and you will not be able to guess again.
          </DialogContentText>
          {!isPastPuzzle && (
            <DialogContentText sx={{ color: 'error.main', mt: 1, fontWeight: 'bold' }}>
              [WARNING] Giving up resets your streak to 0.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGiveUpDialogOpen(false)} sx={{ borderRadius: 0 }}>Cancel</Button>
          <Button onClick={handleGiveUpConfirm} color="error" variant="contained" sx={{ borderRadius: 0 }}>Give Up</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setErrorSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: 0 }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Box mt={8} pt={4} borderTop={1} borderColor="divider" pb={6}>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
          {`[?] ABOUT_LINUX_DISTRIBUTIONS`}
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the <strong>Daily Distros</strong> module of Linuxdle. In this visual puzzle, your objective is to identify a specific Linux distribution based entirely on its logo. Initially, the logo will be heavily pixelated or obscured. With each incorrect guess you make, the image will progressively clear up, revealing more details of the distribution's branding. 
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>What is a Linux Distribution?</strong><br />
          A Linux distribution (often abbreviated as "distro") is an operating system made from a software collection that is based upon the Linux kernel and, often, a package management system. Because Linux is open-source, anyone can take the core kernel, add their preferred desktop environment, system utilities, and default applications, and release it as a custom distribution. Famous examples include Ubuntu, Debian, Arch Linux, Fedora, and Linux Mint, but there are hundreds of specialized distros catering to everything from cybersecurity (like Kali Linux) to older hardware (like Puppy Linux).
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Linus Torvalds Mode:</strong><br />
          If you find the standard game too easy, you can toggle "Linus Torvalds Mode" before making your first guess. This mode significantly increases the difficulty by applying high-contrast filters and altering the pixelation algorithm, forcing you to rely on color palettes and general shapes rather than obvious icon outlines.
        </Typography>
      </Box>
    </Container>
    </>
  );
};

export default DailyDistros;
