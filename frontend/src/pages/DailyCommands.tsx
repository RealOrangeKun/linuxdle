import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Autocomplete,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Alert, Snackbar
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Refresh } from '@mui/icons-material';
import apiClient from '../api/apiClient';
import { MatchResult, YearDirection } from '../types/game';

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

const DailyCommands: React.FC = () => {
  const [commands, setCommands] = useState<string[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const response = await apiClient.get<string[]>('/daily-commands');
        setCommands(response.data);
      } catch (error) {
        console.error('Error fetching commands:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommands();
  }, []);

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
      } else if (newResults.length >= 8) {
        setIsGameOver(true);
      }
      setSelectedGuess(null);
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  const getCellColor = (result: MatchResult) => {
    switch (result) {
      case MatchResult.Green: return '#4caf50';
      case MatchResult.Yellow: return '#ffeb3b';
      case MatchResult.Red: return '#f44336';
      default: return 'inherit';
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          Daily Command ⌨️
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" mb={4}>
          Guess the Linux command based on its attributes!
        </Typography>

        {!isGameOver && (
          <Box sx={{ display: 'flex', gap: 1, mb: 4, maxWidth: 500, mx: 'auto' }}>
            <Autocomplete
              fullWidth
              options={commands}
              value={selectedGuess}
              onChange={(_, newValue) => setSelectedGuess(newValue)}
              renderInput={(params) => <TextField {...params} label="Type a command..." variant="outlined" />}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedGuess}
              onClick={handleSubmitGuess}
              sx={{ px: 4 }}
            >
              Guess
            </Button>
          </Box>
        )}

        {isGameOver && (
          <Box textAlign="center" mb={4}>
            <Typography variant="h5" color={showSuccess ? "success.main" : "error.main"} gutterBottom fontWeight="bold">
              {showSuccess ? "Fantastic! You found the command! 🐧" : "Game Over! Better luck tomorrow!"}
            </Typography>
            <Button variant="outlined" onClick={() => window.location.reload()} startIcon={<Refresh />}>
              Try Again?
            </Button>
          </Box>
        )}

        {results.length > 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Package</TableCell>
                  <TableCell align="center">Year</TableCell>
                  <TableCell align="center">Section</TableCell>
                  <TableCell align="center">Built-in</TableCell>
                  <TableCell align="center">POSIX</TableCell>
                  <TableCell align="center">Categories</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.name), color: result.matchResults.name === MatchResult.Yellow ? 'black' : 'white', fontWeight: 'bold' }}>
                      {result.guessCommandDetails.name}
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.package), color: result.matchResults.package === MatchResult.Yellow ? 'black' : 'white' }}>
                      {result.guessCommandDetails.package}
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.year), color: result.matchResults.year === MatchResult.Yellow ? 'black' : 'white' }}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        {result.guessCommandDetails.originYear}
                        {result.matchResults.yearHint === YearDirection.Higher && <ArrowUpward fontSize="small" />}
                        {result.matchResults.yearHint === YearDirection.Lower && <ArrowDownward fontSize="small" />}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.section), color: result.matchResults.section === MatchResult.Yellow ? 'black' : 'white' }}>
                      {result.guessCommandDetails.manSection}
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.builtIn), color: result.matchResults.builtIn === MatchResult.Yellow ? 'black' : 'white' }}>
                      {result.guessCommandDetails.isBuiltIn ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.posix), color: result.matchResults.posix === MatchResult.Yellow ? 'black' : 'white' }}>
                      {result.guessCommandDetails.isPosix ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: getCellColor(result.matchResults.categories), color: result.matchResults.categories === MatchResult.Yellow ? 'black' : 'white' }}>
                      <Tooltip title={result.guessCommandDetails.categories.join(', ')}>
                        <Typography variant="body2" sx={{ cursor: 'help' }}>
                          {result.guessCommandDetails.categories.length} Categories
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>Correct! System command identified.</Alert>
      </Snackbar>
    </Container>
  );
};

export default DailyCommands;
