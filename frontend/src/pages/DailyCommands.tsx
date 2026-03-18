import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Snackbar, Divider
} from '@mui/material';
import { ArrowUpward, ArrowDownward, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { MatchResult, YearDirection } from '../types/game';
import { checkAllGamesCompleted, hasRedirectedToday, markAsRedirected } from '../utils/gameStatus';
import { getCachedYesterday, cacheYesterday } from '../utils/yesterdayCache';
import { SEO, pageSEO } from '../components/SEO';
import CountdownTimer from '../components/CountdownTimer';

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
  const [results, setResults] = useState<CommandResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [yesterdaysTarget, setYesterdaysTarget] = useState<YesterdaysCommand | null>(null);

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
        showSuccess
      }));
    }
  }, [results, isGameOver, showSuccess, today, loading]);

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
      const response = await apiClient.post<CommandResult>('/daily-commands/guesses', {
        userGuess: selectedGuess
      });

      const newResults = [response.data, ...results];
      setResults(newResults);

      if (response.data.matchResults.isCorrect) {
        setIsGameOver(true);
        setShowSuccess(true);
      }
      setSelectedGuess(null);
    } catch (error) {
      console.error('Error:', error);
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

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

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
              options={commands.filter(cmd => !results.some(r => r.guessCommandDetails.name === cmd))}
              value={selectedGuess}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              onKeyDown={(e) => { if (e.key === 'Enter' && selectedGuess) handleSubmitGuess(); }}
              renderInput={(params) => <TextField {...params} label="input_command" variant="outlined" />}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedGuess}
              onClick={handleSubmitGuess}
              sx={{ px: 4 }}
            >
              EXEC
            </Button>
          </Box>
        ) : (
          <Box mb={4}>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {`[OK] COMMAND_IDENTIFIED`}
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>NAME</TableCell>
                  <TableCell>PKG</TableCell>
                  <TableCell>YEAR</TableCell>
                  <TableCell>SEC</TableCell>
                  <TableCell>B-IN</TableCell>
                  <TableCell>POSIX</TableCell>
                  <TableCell>CATEGORIES</TableCell>
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
    </Container>
    </>
  );
};

export default DailyCommands;
