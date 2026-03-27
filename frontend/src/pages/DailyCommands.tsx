import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Snackbar, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Tooltip
} from '@mui/material';
import { ArrowUpward, ArrowDownward, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { MatchResult, YearDirection } from '../types/game';
import { checkAllGamesCompleted, hasRedirectedToday, markAsRedirected } from '../utils/gameStatus';
import { dispatchSupportDialog } from '../components/SupportDialog';
import { getCachedYesterday, cacheYesterday } from '../utils/yesterdayCache';
import { SEO, pageSEO } from '../components/SEO';
import CountdownTimer from '../components/CountdownTimer';
import { useGameSettings } from '../hooks/useGameSettings';
import { useMidnightReload } from '../hooks/useMidnightReload';

interface CommandResult {
  matchResults: {
    isCorrect: boolean;
    name: MatchResult;
    package: MatchResult;
    year: MatchResult;
    yearHint: YearDirection;
    section: MatchResult;
    builtIn: MatchResult;
    posix: MatchResult;
    categories: MatchResult;
  };
  guessCommandDetails: {
    name: string;
    package: string;
    originYear: number;
    manSection: number;
    isBuiltIn: boolean;
    requiresArgs: boolean;
    isPosix: boolean;
    categories: string[];
  };
}

interface YesterdaysCommand {
  id: number;
  name: string;
  package: string;
  originYear: number;
  manSection: number;
  isBuiltIn: boolean;
  requiresArgs: boolean;
  isPosix: boolean;
  categoryIds: number[];
  categoryNames: string[];
}

const STORAGE_KEY = 'linuxdle_commands_state';

const DailyCommands: React.FC = () => {
  const navigate = useNavigate();
  const [commands, setCommands] = useState<string[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [yesterdaysTarget, setYesterdaysTarget] = useState<YesterdaysCommand | null>(null);

  const { minGuessesToGiveUp, loading: settingsLoading } = useGameSettings();
  useMidnightReload();
  const [giveUpDialogOpen, setGiveUpDialogOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const response = await apiClient.get<string[]>('/daily-commands');
        setCommands(Array.isArray(response.data) ? response.data : []);

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const state = JSON.parse(saved);
            if (state.date === today) {
              const parsedResults = Array.isArray(state.results) ? state.results : [];
              setResults(parsedResults);
              setIsGameOver(typeof state.isGameOver === 'boolean' ? state.isGameOver : false);
              setShowSuccess(typeof state.showSuccess === 'boolean' ? state.showSuccess : false);
              setHasGivenUp(typeof state.hasGivenUp === 'boolean' ? state.hasGivenUp : false);
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // Fetch yesterday's target (check cache first)
        const cachedYesterday = getCachedYesterday<YesterdaysCommand>('commands');
        if (cachedYesterday) {
          setYesterdaysTarget(cachedYesterday);
        } else {
          try {
            const yesterdayResponse = await apiClient.get<YesterdaysCommand>('/daily-commands/yesterdays-target');
            setYesterdaysTarget(yesterdayResponse.data);
            cacheYesterday('commands', yesterdayResponse.data);
          } catch (error) {
            // Yesterday's target might not exist (e.g., first day)
            console.log('No yesterday\'s target available');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setCommands([]); // Ensure commands is an array even if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchCommands();
  }, [today]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: today,
        results,
        isGameOver,
        showSuccess,
        hasGivenUp
      }));
    }
  }, [results, isGameOver, showSuccess, hasGivenUp, today, loading]);

  useEffect(() => {
    if (isGameOver && !loading) {
      if (checkAllGamesCompleted()) {
        dispatchSupportDialog('all-complete');
        if (!hasRedirectedToday()) {
          markAsRedirected();
          const timer = setTimeout(() => navigate('/'), 2000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isGameOver, loading, navigate]);

  const handleSubmitGuess = async (overrideGuess?: string | null) => {
    const guess = overrideGuess !== undefined ? overrideGuess : selectedGuess;
    if (!guess || isGameOver) return;

    try {
      const response = await apiClient.post<CommandResult>('/daily-commands/guesses', {
        userGuess: guess
      });

      const newResults = [response.data, ...results];
      setResults(newResults);

      if (response.data.matchResults.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
      }
      setSelectedGuess(null);
      setInputValue('');
      setAutocompleteOpen(false);
      setTimeout(() => inputRef.current?.focus(), 50);
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
      const response = await apiClient.post<{name: string}>('/daily-commands/give-up');
      setIsGameOver(true);
      setShowSuccess(false);
      setHasGivenUp(true);

      const fakeResult: CommandResult = {
        matchResults: {
          isCorrect: false,
          name: MatchResult.Red,
          package: MatchResult.Red,
          year: MatchResult.Red,
          yearHint: YearDirection.Higher, // Using Higher just as fallback since None might not exist
          section: MatchResult.Red,
          builtIn: MatchResult.Red,
          posix: MatchResult.Red,
          categories: MatchResult.Red
        },
        guessCommandDetails: {
          name: `Gave up -> Answer: ${response.data.name}`,
          package: '-',
          originYear: 0,
          manSection: 0,
          isBuiltIn: false,
          requiresArgs: false,
          isPosix: false,
          categories: []
        }
      };

      setResults([fakeResult, ...results]);
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

  const getCellColor = (result: MatchResult) => {
    switch (result) {
      case MatchResult.Green: return '#4caf50';
      case MatchResult.Yellow: return '#ff9800';
      case MatchResult.Red: return '#f44336';
      default: return 'transparent';
    }
  };

  if (loading || settingsLoading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <>
      <SEO {...pageSEO.dailyCommands} />
      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
            {`_ > DAILY_COMMAND`}
          </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          $ guess-command --interactive
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

      <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        {!isGameOver ? (
          <Box sx={{ display: 'flex', gap: 1, mb: 4, maxWidth: 600 }}>
            <Autocomplete
              fullWidth
              size="small"
              open={autocompleteOpen}
              onOpen={() => setAutocompleteOpen(true)}
              onClose={() => setAutocompleteOpen(false)}
              options={commands.filter(cmd => !results.some(r => r.guessCommandDetails.name === cmd))}
              filterOptions={(options, { inputValue }) =>
                inputValue
                  ? options.filter(o => o.toLowerCase().startsWith(inputValue.toLowerCase()))
                  : options
              }
              value={selectedGuess}
              inputValue={inputValue}
              onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
                if (newInputValue) setAutocompleteOpen(true);
              }}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              onKeyDown={(e) => {
                const availableOptions = commands.filter(cmd => !results.some(r => r.guessCommandDetails.name === cmd));
                const filteredOptions = availableOptions.filter(cmd =>
                  cmd.toLowerCase().startsWith(inputValue.toLowerCase())
                );
                const firstOption = filteredOptions[0] ?? null;

                if (e.key === 'Tab' || e.key === 'ArrowRight') {
                  // Autocomplete the first match without submitting
                  if (!selectedGuess && firstOption) {
                    e.preventDefault();
                    setSelectedGuess(firstOption);
                    setInputValue(firstOption);
                  }
                } else if (e.key === 'Enter') {
                  if (!autocompleteOpen) return;
                  if (selectedGuess) {
                    e.preventDefault();
                    handleSubmitGuess(selectedGuess);
                  } else if (firstOption) {
                    e.preventDefault();
                    handleSubmitGuess(firstOption);
                  }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="input_command"
                  variant="outlined"
                  inputRef={inputRef}
                  autoFocus
                />
              )}
            />
            {results.length >= minGuessesToGiveUp && (
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
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedGuess}
              onClick={() => handleSubmitGuess()}
              sx={{ px: 4 }}
            >
              EXEC
            </Button>
          </Box>
        ) : (
          <Box mb={4}>
            <Typography variant="h6" color={hasGivenUp ? "error.main" : "success.main"} fontWeight="bold">
              {hasGivenUp ? `[SIGKILL] PROCESS_TERMINATED` : `[OK] COMMAND_IDENTIFIED`}
            </Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate('/distros')} 
              endIcon={<ArrowForward />}
              sx={{ mt: 2 }}
            >
              CD ../DAILY_DISTROS
            </Button>
          </Box>
        )}

        {results.length > 0 && (
          <Box>
            <TableContainer sx={{
              overflowX: 'auto',
              // Bigger, easier-to-hit scrollbar with breathing room on mobile
              pb: { xs: 1, sm: 0 },
              mt: { xs: 1, sm: 0 },
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-track': { bgcolor: 'divider' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'primary.main' },
            }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><Tooltip title="The command name" arrow placement="top"><span style={{ cursor: 'help', borderBottom: '1px dashed' }}>NAME</span></Tooltip></TableCell>
                  <TableCell><Tooltip title="The package that provides this command (e.g. coreutils, util-linux)" arrow placement="top"><span style={{ cursor: 'help', borderBottom: '1px dashed' }}>PKG</span></Tooltip></TableCell>
                  <TableCell><Tooltip title="The year this command was first introduced" arrow placement="top"><span style={{ cursor: 'help', borderBottom: '1px dashed' }}>YEAR</span></Tooltip></TableCell>
                  <TableCell>
                    <Tooltip
                      arrow
                      placement="top"
                      title={
                        <Box sx={{ fontSize: '0.75rem' }}>
                          <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>Man Page Sections</Box>
                          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <tbody>
                              {[
                                ['1', 'User commands'],
                                ['2', 'System calls'],
                                ['3', 'Library functions'],
                                ['4', 'Special files / devices'],
                                ['5', 'File formats & conventions'],
                                ['6', 'Games'],
                                ['7', 'Miscellaneous'],
                                ['8', 'System admin commands'],
                              ].map(([num, desc]) => (
                                <tr key={num}>
                                  <td style={{ paddingRight: 8, fontWeight: 'bold', opacity: 0.7 }}>{num}</td>
                                  <td>{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      }
                    >
                      <span style={{ cursor: 'help', borderBottom: '1px dashed' }}>SEC</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell><Tooltip title="Built-in: whether the command is built into the shell (e.g. cd, echo in bash) rather than an external binary" arrow placement="top"><span style={{ cursor: 'help', borderBottom: '1px dashed' }}>B-IN</span></Tooltip></TableCell>
                  <TableCell><Tooltip title="POSIX: whether the command is part of the POSIX standard, meaning it should be available on all POSIX-compliant systems (Linux, macOS, BSD...)" arrow placement="top"><span style={{ cursor: 'help', borderBottom: '1px dashed' }}>POSIX</span></Tooltip></TableCell>
                  <TableCell><Tooltip title="The functional categories this command belongs to (e.g. File Management, Networking, Text Processing)" arrow placement="top"><span style={{ cursor: 'help', borderBottom: '1px dashed' }}>CATEGORIES</span></Tooltip></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.name), color: 'white', fontWeight: 'bold' }}>
                      {result.guessCommandDetails.name}
                    </TableCell>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.package), color: 'white' }}>
                      {result.guessCommandDetails.package}
                    </TableCell>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.year), color: 'white' }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {result.guessCommandDetails.originYear}
                        {result.matchResults.yearHint === YearDirection.Higher && <ArrowUpward fontSize="inherit" />}
                        {result.matchResults.yearHint === YearDirection.Lower && <ArrowDownward fontSize="inherit" />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.section), color: 'white' }}>
                      {result.guessCommandDetails.manSection}
                    </TableCell>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.builtIn), color: 'white' }}>
                      {result.guessCommandDetails.isBuiltIn ? 'Y' : 'N'}
                    </TableCell>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.posix), color: 'white' }}>
                      {result.guessCommandDetails.isPosix ? 'Y' : 'N'}
                    </TableCell>
                    <TableCell sx={{ bgcolor: getCellColor(result.matchResults.categories), color: 'white' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {result.guessCommandDetails.categories.join(', ')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
            {/* Mobile-only scroll hint */}
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'flex', sm: 'none' },
                justifyContent: 'center',
                mt: 0.5,
                opacity: 0.6,
                fontFamily: 'monospace',
              }}
            >
              ← scroll to see all columns →
            </Typography>
          </Box>
        )}
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
          <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
            Package: {yesterdaysTarget.package} | Year: {yesterdaysTarget.originYear} | 
            Section: {yesterdaysTarget.manSection} | Built-in: {yesterdaysTarget.isBuiltIn ? 'Yes' : 'No'} | 
            POSIX: {yesterdaysTarget.isPosix ? 'Yes' : 'No'}
          </Typography>
          {Array.isArray(yesterdaysTarget.categoryNames) && yesterdaysTarget.categoryNames.length > 0 && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
              Categories: {yesterdaysTarget.categoryNames.join(', ')}
            </Typography>
          )}
        </Paper>
      )}

      <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)}>
        <Alert severity="success" variant="filled">STATUS_OK: Command recognized.</Alert>
      </Snackbar>

      <Dialog open={giveUpDialogOpen} onClose={() => setGiveUpDialogOpen(false)}>
        <DialogTitle>Confirm Give Up</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to give up? The answer will be revealed and you will not be able to guess again today.
          </DialogContentText>
          <DialogContentText sx={{ color: 'error.main', mt: 1, fontWeight: 'bold' }}>
            [WARNING] Giving up resets your streak to 0.
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

export default DailyCommands;
