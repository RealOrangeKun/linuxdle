import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, Paper, useTheme, useMediaQuery, List, ListItem, ListItemButton, ListItemText, Chip, Pagination, Card, CardContent, CardActions, Grid, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { SEO, pageSEO } from '../components/SEO';

interface PastPuzzle {
  id: number;
  gameId: number;
  scheduledDate: string;
  isCompleted: boolean;
  isAttempted: boolean;
}

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

interface PastDateGroup {
  date: string;
  puzzles: PastPuzzle[];
  completedCount: number;
  attemptedCount: number;
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState<PastPuzzle[]>([]);
  const [selectedDateGroup, setSelectedDateGroup] = useState<PastDateGroup | null>(null);
  const [input, setInput] = useState('');
  const [historyLines, setHistoryLines] = useState<TerminalLine[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isHistoryMenuMode, setIsHistoryMenuMode] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const groupPuzzlesByDate = (puzzleList: PastPuzzle[]): PastDateGroup[] => {
    const groupsMap: { [date: string]: PastPuzzle[] } = {};
    puzzleList.forEach(p => {
      if (!groupsMap[p.scheduledDate]) {
        groupsMap[p.scheduledDate] = [];
      }
      groupsMap[p.scheduledDate].push(p);
    });

    return Object.keys(groupsMap)
      .sort((a, b) => b.localeCompare(a))
      .map(date => {
        const datePuzzles = groupsMap[date].sort((a, b) => a.gameId - b.gameId);
        const completedCount = datePuzzles.filter(p => p.isCompleted).length;
        const attemptedCount = datePuzzles.filter(p => p.isAttempted).length;
        return {
          date,
          puzzles: datePuzzles,
          completedCount,
          attemptedCount
        };
      });
  };

  const getGameLabel = (gameId: number): string => {
    return gameId === 1 ? './commands' : gameId === 2 ? './distros' : './des';
  };

  const getGameRoute = (gameId: number): string => {
    return gameId === 1 ? 'commands' : gameId === 2 ? 'distros' : 'des';
  };

  const getGameName = (gameId: number): string => {
    return gameId === 1 ? 'Commands' : gameId === 2 ? 'Distros' : 'Desktop Environments';
  };

  const formatDateListOutput = (groups: PastDateGroup[], pageNum: number): TerminalLine[] => {
    if (groups.length === 0) {
      return [{ text: '  No past puzzles found in database history.', type: 'output' }];
    }

    const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
    const validPage = Math.min(Math.max(1, pageNum), totalPages);
    
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, groups.length);
    const pageGroups = groups.slice(startIndex, endIndex);

    const header = '  INDEX  DATE         COMPLETED  STATUS';
    const lines: TerminalLine[] = [{ text: header, type: 'output' }];

    pageGroups.forEach((g, indexOnPage) => {
      const globalIndex = startIndex + indexOnPage;
      const indexStr = `[${globalIndex + 1}]`.padEnd(7);
      const dateStr = g.date.padEnd(13);
      const completedStr = `[${g.completedCount}/3]`.padEnd(11);
      
      let statusStr = 'UNPLAYED';
      let statusType: 'output' | 'success' | 'error' = 'output';
      if (g.completedCount === 3) {
        statusStr = 'COMPLETED';
        statusType = 'success';
      } else if (g.attemptedCount > 0) {
        statusStr = 'PLAYING';
        statusType = 'error';
      }

      lines.push({
        text: `  ${indexStr}${dateStr}${completedStr}${statusStr}`,
        type: statusType
      });
    });

    lines.push({ text: '', type: 'output' });
    lines.push({ text: `  Page ${validPage} of ${totalPages} (Type "next" / "prev" or "page <num>" to navigate)`, type: 'output' });

    return lines;
  };

  const formatDateDetailsOutput = (group: PastDateGroup): TerminalLine[] => {
    const lines: TerminalLine[] = [
      { text: `Puzzles for ${group.date}:`, type: 'output' },
      { text: '  INDEX  GAME                       STATUS', type: 'output' }
    ];

    group.puzzles.forEach((p, idx) => {
      const indexStr = `[${idx + 1}]`.padEnd(7);
      const gameStr = getGameLabel(p.gameId).padEnd(27);
      
      let statusStr = 'UNPLAYED';
      let statusType: 'output' | 'success' | 'error' = 'output';
      if (p.isCompleted) {
        statusStr = 'COMPLETED';
        statusType = 'success';
      } else if (p.isAttempted) {
        statusStr = 'ATTEMPTED';
        statusType = 'error';
      }

      lines.push({
        text: `  ${indexStr}${gameStr}${statusStr}`,
        type: statusType
      });
    });

    lines.push({ text: '', type: 'output' });
    lines.push({ text: 'Type "play <index>" to play a game.', type: 'output' });
    lines.push({ text: 'Type "reset" to reset the entire day.', type: 'output' });
    lines.push({ text: 'Type "reset <index>" to reset a specific game.', type: 'output' });
    lines.push({ text: 'Type "back" to return to the date list.', type: 'output' });

    return lines;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
        setPuzzles(response.data);
        const groups = groupPuzzlesByDate(response.data);
        
        // Initial terminal welcome message
        setHistoryLines([
          { text: 'Type "help" to see available commands or click on any row below.', type: 'output' },
          { text: '', type: 'output' },
          { text: 'user@linuxdle:~$ history', type: 'input' },
          ...formatDateListOutput(groups, 1)
        ]);
      } catch (error) {
        console.error('Error fetching past puzzles:', error);
        setHistoryLines([
          { text: 'Error connecting to the system database.', type: 'error' }
        ]);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historyLines]);

  const performResetAll = async (targetGroup: PastDateGroup | null = selectedDateGroup) => {
    if (!targetGroup) return;
    setHistoryLines(prev => [...prev, { text: `Resetting all progress for date ${targetGroup.date}...`, type: 'output' }]);
    try {
      for (const p of targetGroup.puzzles) {
        await apiClient.post(`/past-puzzles/${p.id}/reset`);
        localStorage.removeItem(`linuxdle_${getGameRoute(p.gameId)}_state_${p.id}`);
      }

      // Re-fetch and update state
      const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
      setPuzzles(response.data);
      const freshGroups = groupPuzzlesByDate(response.data);
      const updatedGroup = freshGroups.find(g => g.date === targetGroup.date) || targetGroup;
      if (selectedDateGroup && selectedDateGroup.date === targetGroup.date) {
        setSelectedDateGroup(updatedGroup);
      }

      setHistoryLines(prev => {
        const nextLines = [
          ...prev,
          { text: `[OK] Reset progress for all games on date ${targetGroup.date}.`, type: 'success' as const }
        ];
        if (selectedDateGroup && selectedDateGroup.date === targetGroup.date) {
          nextLines.push(...formatDateDetailsOutput(updatedGroup));
        } else {
          nextLines.push(...formatDateListOutput(freshGroups, currentPage));
        }
        return nextLines;
      });
    } catch {
      setHistoryLines(prev => [...prev, { text: 'Failed to reset date progress.', type: 'error' as const }]);
    }
  };

  const performResetGame = async (idx: number, targetGroup: PastDateGroup | null = selectedDateGroup) => {
    if (!targetGroup) return;
    if (idx < 1 || idx > targetGroup.puzzles.length) return;

    const targetPuzzle = targetGroup.puzzles[idx - 1];
    setHistoryLines(prev => [...prev, { text: `Resetting progress for ${getGameName(targetPuzzle.gameId)}...`, type: 'output' }]);

    try {
      await apiClient.post(`/past-puzzles/${targetPuzzle.id}/reset`);
      localStorage.removeItem(`linuxdle_${getGameRoute(targetPuzzle.gameId)}_state_${targetPuzzle.id}`);

      // Re-fetch and update state
      const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
      setPuzzles(response.data);
      const freshGroups = groupPuzzlesByDate(response.data);
      const updatedGroup = freshGroups.find(g => g.date === targetGroup.date) || targetGroup;
      if (selectedDateGroup && selectedDateGroup.date === targetGroup.date) {
        setSelectedDateGroup(updatedGroup);
      }

      setHistoryLines(prev => {
        const nextLines = [
          ...prev,
          { text: `[OK] Reset progress for ${getGameName(targetPuzzle.gameId)} on date ${targetGroup.date}.`, type: 'success' as const }
        ];
        if (selectedDateGroup && selectedDateGroup.date === targetGroup.date) {
          nextLines.push(...formatDateDetailsOutput(updatedGroup));
        } else {
          nextLines.push(...formatDateListOutput(freshGroups, currentPage));
        }
        return nextLines;
      });
    } catch {
      setHistoryLines(prev => [...prev, { text: 'Failed to reset game progress.', type: 'error' as const }]);
    }
  };

  useEffect(() => {
    if (!isHistoryMenuMode || isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!selectedDateGroup) {
        // Date list view menu
        if (key === 'n' || e.key === 'ArrowRight') {
          const groups = groupPuzzlesByDate(puzzles);
          const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
          if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            setHistoryLines(prev => [
              ...prev,
              { text: `[n] -> Next Page (${nextPage}/${totalPages})`, type: 'input' as const },
              ...formatDateListOutput(groups, nextPage)
            ]);
          } else {
            setHistoryLines(prev => [...prev, { text: 'bash: next: already at the last page', type: 'error' as const }]);
          }
        } else if (key === 'p' || e.key === 'ArrowLeft') {
          const groups = groupPuzzlesByDate(puzzles);
          if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            setHistoryLines(prev => [
              ...prev,
              { text: `[p] -> Prev Page (${prevPage})`, type: 'input' as const },
              ...formatDateListOutput(groups, prevPage)
            ]);
          } else {
            setHistoryLines(prev => [...prev, { text: 'bash: prev: already at the first page', type: 'error' as const }]);
          }
        } else if (key === 'q' || e.key === 'Escape') {
          setIsHistoryMenuMode(false);
          setHistoryLines(prev => [
            ...prev,
            { text: '[q] -> Exiting menu mode...', type: 'input' as const },
            { text: 'Returned to CLI. Type "help" for a list of commands.', type: 'output' as const }
          ]);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      } else {
        // Detailed date view menu
        if (key === '1' || key === '2' || key === '3') {
          const gameIdx = parseInt(key, 10);
          if (gameIdx >= 1 && gameIdx <= selectedDateGroup.puzzles.length) {
            const selectedPuzzle = selectedDateGroup.puzzles[gameIdx - 1];
            setHistoryLines(prev => [
              ...prev,
              { text: `[${gameIdx}] -> Launching ${getGameName(selectedPuzzle.gameId)}...`, type: 'success' as const }
            ]);
            setTimeout(() => {
              navigate(`/${getGameRoute(selectedPuzzle.gameId)}/${selectedPuzzle.id}`);
            }, 500);
          }
        } else if (key === 'q' || e.key === 'Escape' || key === 'b') {
          setSelectedDateGroup(null);
          const groups = groupPuzzlesByDate(puzzles);
          setHistoryLines(prev => [
            ...prev,
            { text: '[q] -> Returning to date list...', type: 'input' as const },
            ...formatDateListOutput(groups, currentPage)
          ]);
        } else if (key === 'r') {
          setHistoryLines(prev => [
            ...prev,
            { text: 'Reset Mode active. Press [1-3] to reset a game, [a] to reset all puzzles for this date, or [c] to cancel: ', type: 'output' as const }
          ]);
          
          const handleResetKey = (resetEvt: KeyboardEvent) => {
            const resetKey = resetEvt.key.toLowerCase();
            
            // Remove reset key listener and restore main keydown listener
            window.removeEventListener('keydown', handleResetKey);
            window.addEventListener('keydown', handleKeyDown);

            if (resetKey === 'a') {
              performResetAll();
            } else if (resetKey === '1' || resetKey === '2' || resetKey === '3') {
              performResetGame(parseInt(resetKey, 10));
            } else {
              setHistoryLines(prev => [...prev, { text: 'Reset cancelled.', type: 'output' as const }]);
            }
          };

          window.removeEventListener('keydown', handleKeyDown);
          window.addEventListener('keydown', handleResetKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryMenuMode, selectedDateGroup, currentPage, puzzles]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newLines = [...historyLines, { text: `user@linuxdle:~$ ${cmd}`, type: 'input' as const }];
    setInput('');

    const tokens = cmd.toLowerCase().split(/\s+/);
    const commandName = tokens[0];
    const arg1 = tokens[1];

    if (commandName === 'clear') {
      setHistoryLines([]);
      return;
    }

    if (commandName === 'help') {
      if (selectedDateGroup) {
        setHistoryLines([
          ...newLines,
          { text: 'Available commands for this date:', type: 'output' },
          { text: '  play <index>        Play the game at the specified index (1, 2, or 3)', type: 'output' },
          { text: '  reset               Reset progress for all games on this date', type: 'output' },
          { text: '  reset <index>       Reset progress for a specific game (1, 2, or 3)', type: 'output' },
          { text: '  back                Return to the date list', type: 'output' },
          { text: '  clear               Clear terminal screen', type: 'output' }
        ]);
      } else {
        setHistoryLines([
          ...newLines,
          { text: 'Linuxdle CLI History Console', type: 'output' },
          { text: '============================', type: 'output' },
          { text: 'Commands:', type: 'output' },
          { text: '  history             Show list of past dates', type: 'output' },
          { text: '  play <index>        Choose a date index to view its puzzles', type: 'output' },
          { text: '  !<index>            Shorthand to choose a date (e.g. !1)', type: 'output' },
          { text: '  reset <index>       Reset progress for all games on a date index', type: 'output' },
          { text: '  next                Go to the next page of history', type: 'output' },
          { text: '  prev                Go to the previous page of history', type: 'output' },
          { text: '  page <num>          Go to page number <num> of history', type: 'output' },
          { text: '  clear               Clear terminal screen', type: 'output' },
          { text: '  help                Show this help screen', type: 'output' }
        ]);
      }
      return;
    }

    if (commandName === 'next' || commandName === 'n') {
      if (selectedDateGroup) {
        setHistoryLines([...newLines, { text: 'bash: next: only valid when viewing the date list', type: 'error' }]);
        return;
      }
      const groups = groupPuzzlesByDate(puzzles);
      const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
      if (currentPage >= totalPages) {
        setHistoryLines([...newLines, { text: 'bash: next: already at the last page', type: 'error' }]);
        return;
      }
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setHistoryLines([...newLines, ...formatDateListOutput(groups, nextPage)]);
      return;
    }

    if (commandName === 'prev' || commandName === 'p') {
      if (selectedDateGroup) {
        setHistoryLines([...newLines, { text: 'bash: prev: only valid when viewing the date list', type: 'error' }]);
        return;
      }
      const groups = groupPuzzlesByDate(puzzles);
      if (currentPage <= 1) {
        setHistoryLines([...newLines, { text: 'bash: prev: already at the first page', type: 'error' }]);
        return;
      }
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      setHistoryLines([...newLines, ...formatDateListOutput(groups, prevPage)]);
      return;
    }

    if (commandName === 'page') {
      if (selectedDateGroup) {
        setHistoryLines([...newLines, { text: 'bash: page: only valid when viewing the date list', type: 'error' }]);
        return;
      }
      const pageNum = parseInt(arg1, 10);
      const groups = groupPuzzlesByDate(puzzles);
      const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        setHistoryLines([...newLines, { text: `bash: page: ${arg1 || 'NULL'}: invalid page number (1-${totalPages})`, type: 'error' }]);
        return;
      }
      setCurrentPage(pageNum);
      setHistoryLines([...newLines, ...formatDateListOutput(groups, pageNum)]);
      return;
    }

    if (commandName === 'history' || commandName === 'back') {
      setSelectedDateGroup(null);
      setIsHistoryMenuMode(true);
      try {
        const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
        setPuzzles(response.data);
        const groups = groupPuzzlesByDate(response.data);
        setHistoryLines([...newLines, ...formatDateListOutput(groups, currentPage)]);
      } catch {
        setHistoryLines([...newLines, { text: 'Error retrieving history data.', type: 'error' as const }]);
      }
      return;
    }

    // Play / select Command
    if (commandName === 'play' || commandName.startsWith('!')) {
      let idxStr = arg1;
      if (commandName.startsWith('!')) {
        idxStr = commandName.slice(1) || arg1;
      }

      const idx = parseInt(idxStr, 10);

      if (selectedDateGroup) {
        // Detailed date view: play specific game
        if (isNaN(idx) || idx < 1 || idx > selectedDateGroup.puzzles.length) {
          setHistoryLines([...newLines, { text: `bash: play: ${idxStr || 'NULL'}: invalid game index (use 1, 2, or 3)`, type: 'error' as const }]);
          return;
        }

        const selectedPuzzle = selectedDateGroup.puzzles[idx - 1];
        setHistoryLines([...newLines, { text: `Launching ${getGameLabel(selectedPuzzle.gameId)} for date ${selectedDateGroup.date}...`, type: 'success' as const }]);
        setTimeout(() => {
          navigate(`/${getGameRoute(selectedPuzzle.gameId)}/${selectedPuzzle.id}`);
        }, 500);
      } else {
        // Date list view: choose a date
        const groups = groupPuzzlesByDate(puzzles);
        if (isNaN(idx) || idx < 1 || idx > groups.length) {
          setHistoryLines([...newLines, { text: `bash: play: ${idxStr || 'NULL'}: invalid date index`, type: 'error' as const }]);
          return;
        }

        const selectedGroup = groups[idx - 1];
        setSelectedDateGroup(selectedGroup);
        setIsHistoryMenuMode(true);
        setHistoryLines([...newLines, ...formatDateDetailsOutput(selectedGroup)]);
      }
      return;
    }

    // Reset Command
    if (commandName === 'reset') {
      if (selectedDateGroup) {
        // Detailed date view: reset specific game or entire day
        const idx = parseInt(arg1, 10);
        if (isNaN(idx)) {
          performResetAll();
        } else {
          performResetGame(idx);
        }
      } else {
        // Date list view: reset entire day by date index
        const idx = parseInt(arg1, 10);
        const groups = groupPuzzlesByDate(puzzles);
        if (isNaN(idx) || idx < 1 || idx > groups.length) {
          setHistoryLines([...newLines, { text: `bash: reset: ${arg1 || 'NULL'}: invalid date index`, type: 'error' as const }]);
          return;
        }
        performResetAll(groups[idx - 1]);
      }
      return;
    }

    setHistoryLines([...newLines, { text: `bash: ${commandName}: command not found. Type "help" for a list of commands.`, type: 'error' as const }]);
  };

  const handleLineClick = (lineText: string) => {
    const match = lineText.match(/^\s*\[(\d+)\]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (selectedDateGroup) {
        // Clicked a game index
        if (index >= 1 && index <= selectedDateGroup.puzzles.length) {
          const selectedPuzzle = selectedDateGroup.puzzles[index - 1];
          navigate(`/${getGameRoute(selectedPuzzle.gameId)}/${selectedPuzzle.id}`);
        }
      } else {
        // Clicked a date index
        const groups = groupPuzzlesByDate(puzzles);
        if (index >= 1 && index <= groups.length) {
          const selectedGroup = groups[index - 1];
          setSelectedDateGroup(selectedGroup);
          setIsHistoryMenuMode(true);
          setHistoryLines([
            ...historyLines, 
            { text: `user@linuxdle:~$ play ${index}`, type: 'input' }, 
            ...formatDateDetailsOutput(selectedGroup)
          ]);
        }
      }
    }
  };

  if (isMobile) {
    const groups = groupPuzzlesByDate(puzzles);
    const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, groups.length);
    const pageGroups = groups.slice(startIndex, endIndex);

    return (
      <Container maxWidth="sm" sx={{ mt: 2, mb: 4 }}>
        <SEO {...pageSEO.history} />
        
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'monospace', mb: 3, letterSpacing: '.15rem' }}
        >
          ./history
        </Typography>

        {selectedDateGroup ? (
          <Box>
            <Button
              variant="outlined"
              onClick={() => setSelectedDateGroup(null)}
              sx={{
                mb: 3,
                fontFamily: 'monospace',
                borderRadius: 0,
                color: '#39FF14',
                borderColor: '#39FF14',
                bgcolor: 'rgba(57, 255, 20, 0.05)',
                '&:hover': {
                  borderColor: '#39FF14',
                  bgcolor: 'rgba(57, 255, 20, 0.15)',
                }
              }}
              fullWidth
            >
              &lt; Return to Date List
            </Button>

            <Card
              variant="outlined"
              sx={{
                bgcolor: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: 0,
                mb: 3,
                fontFamily: 'monospace'
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#8BE9FD', fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>
                  DATE: {selectedDateGroup.date}
                </Typography>
                <Typography variant="body2" sx={{ color: '#39FF14', fontFamily: 'monospace' }}>
                  Progress: {selectedDateGroup.completedCount}/3 Completed
                </Typography>
              </CardContent>
            </Card>

            <Stack spacing={2}>
              {selectedDateGroup.puzzles.map((p, index) => {
                let statusLabel = 'UNPLAYED';
                let statusColor = '#888888';
                let statusBg = 'rgba(136, 136, 136, 0.1)';
                if (p.isCompleted) {
                  statusLabel = 'COMPLETED';
                  statusColor = '#50FA7B';
                  statusBg = 'rgba(80, 250, 123, 0.1)';
                } else if (p.isAttempted) {
                  statusLabel = 'ATTEMPTED';
                  statusColor = '#FF5555';
                  statusBg = 'rgba(255, 85, 85, 0.1)';
                }

                return (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{
                      bgcolor: '#0D1117',
                      border: '1px solid #30363D',
                      borderRadius: 0,
                      fontFamily: 'monospace'
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#FFB86C', fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>
                        {getGameName(p.gameId)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#888', fontFamily: 'monospace', mb: 1.5 }}>
                        Path: {getGameLabel(p.gameId)}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          border: `1px solid ${statusColor}`,
                          color: statusColor,
                          bgcolor: statusBg,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {statusLabel}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/${getGameRoute(p.gameId)}/${p.id}`)}
                        sx={{
                          fontFamily: 'monospace',
                          borderRadius: 0,
                          color: '#39FF14',
                          borderColor: '#39FF14',
                          bgcolor: 'rgba(57, 255, 20, 0.05)',
                          '&:hover': {
                            borderColor: '#39FF14',
                            bgcolor: 'rgba(57, 255, 20, 0.15)',
                          }
                        }}
                        fullWidth
                      >
                        Play Module
                      </Button>
                      {(p.isAttempted || p.isCompleted) && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => performResetGame(index + 1)}
                          sx={{
                            fontFamily: 'monospace',
                            borderRadius: 0,
                            color: '#FF5555',
                            borderColor: '#FF5555',
                            bgcolor: 'rgba(255, 85, 85, 0.05)',
                            '&:hover': {
                              borderColor: '#FF5555',
                              bgcolor: 'rgba(255, 85, 85, 0.15)',
                            }
                          }}
                          fullWidth
                        >
                          Reset Progress
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>

            {selectedDateGroup.attemptedCount > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => performResetAll()}
                sx={{
                  mt: 3,
                  fontFamily: 'monospace',
                  borderRadius: 0,
                  color: '#FF5555',
                  borderColor: '#FF5555',
                  bgcolor: 'rgba(255, 85, 85, 0.05)',
                  '&:hover': {
                    borderColor: '#FF5555',
                    bgcolor: 'rgba(255, 85, 85, 0.15)',
                  }
                }}
                fullWidth
              >
                Reset All Games For This Day
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            {pageGroups.length === 0 ? (
              <Card
                variant="outlined"
                sx={{
                  bgcolor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: 0,
                  p: 2,
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}
              >
                <Typography sx={{ color: '#FF5555', fontFamily: 'monospace' }}>
                  No past puzzles found in database history.
                </Typography>
              </Card>
            ) : (
              <Stack spacing={2}>
                {pageGroups.map((g) => {
                  let statusLabel = 'UNPLAYED';
                  let statusColor = '#888888';
                  let statusBg = 'rgba(136, 136, 136, 0.1)';
                  if (g.completedCount === 3) {
                    statusLabel = 'COMPLETED';
                    statusColor = '#50FA7B';
                    statusBg = 'rgba(80, 250, 123, 0.1)';
                  } else if (g.attemptedCount > 0) {
                    statusLabel = 'PLAYING';
                    statusColor = '#FFB86C';
                    statusBg = 'rgba(255, 184, 108, 0.1)';
                  }

                  return (
                    <Card
                      key={g.date}
                      variant="outlined"
                      sx={{
                        bgcolor: '#0D1117',
                        border: '1px solid #30363D',
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        transition: 'border-color 0.2s',
                        '&:hover': {
                          borderColor: '#39FF14'
                        }
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="h6" sx={{ color: '#8BE9FD', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {g.date}
                          </Typography>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.5,
                              border: `1px solid ${statusColor}`,
                              color: statusColor,
                              bgcolor: statusBg,
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {statusLabel}
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#39FF14', fontFamily: 'monospace' }}>
                          Puzzles Played: {g.completedCount}/3
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setSelectedDateGroup(g)}
                          sx={{
                            fontFamily: 'monospace',
                            borderRadius: 0,
                            color: '#39FF14',
                            borderColor: '#39FF14',
                            bgcolor: 'rgba(57, 255, 20, 0.05)',
                            '&:hover': {
                              borderColor: '#39FF14',
                              bgcolor: 'rgba(57, 255, 20, 0.15)',
                            }
                          }}
                          fullWidth
                        >
                          View Puzzles &gt;
                        </Button>
                      </CardActions>
                    </Card>
                  );
                })}
              </Stack>
            )}

            {totalPages > 1 && (
              <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, value) => {
                    setCurrentPage(value);
                    const freshGroups = groupPuzzlesByDate(puzzles);
                    setHistoryLines(prev => [
                      ...prev,
                      { text: `user@linuxdle:~$ page ${value}`, type: 'input' },
                      ...formatDateListOutput(freshGroups, value)
                    ]);
                  }}
                  color="primary"
                  shape="rounded"
                  variant="outlined"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontFamily: 'monospace',
                      borderRadius: 0,
                      borderColor: '#30363D',
                      color: '#8BE9FD',
                      '&.Mui-selected': {
                        borderColor: '#39FF14',
                        color: '#39FF14',
                        bgcolor: 'rgba(57, 255, 20, 0.05)',
                      },
                      '&:hover': {
                        borderColor: '#39FF14',
                        color: '#39FF14',
                      }
                    }
                  }}
                />
              </Stack>
            )}
          </Box>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <SEO {...pageSEO.history} />
      
      <Typography
        variant="h4"
        component="h1"
        align="center"
        sx={{ fontWeight: 'bold', fontFamily: 'monospace', mb: 3, letterSpacing: '.15rem' }}
      >
        ./history
      </Typography>

      <Paper
        onClick={() => inputRef.current?.focus()}
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: '#0D1117',
          color: '#39FF14', // Matrix/terminal green
          border: '1px solid #30363D',
          borderRadius: 0,
          fontFamily: '"Fira Code", "JetBrains Mono", monospace',
          fontSize: { xs: '0.72rem', sm: '0.85rem', md: '1rem' },
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          cursor: 'text',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
      >
        <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
          {historyLines.map((line, index) => {
            let color = '#39FF14'; // input / general output
            let cursor = 'default';
            if (line.type === 'error') color = '#FF5555';
            if (line.type === 'success') color = '#50FA7B';
            if (line.type === 'input') color = '#8BE9FD';

            const isClickable = /^\s*\[\d+\]/.test(line.text);
            if (isClickable) {
              color = '#FFB86C'; // warning/orange color for clickable rows
              cursor = 'pointer';
            }

            return (
              <Typography
                key={index}
                onClick={isClickable ? () => handleLineClick(line.text) : undefined}
                sx={{
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  color: color,
                  whiteSpace: 'pre-wrap',
                  cursor: cursor,
                  '&:hover': isClickable ? { textDecoration: 'underline' } : {}
                }}
              >
                {line.text}
              </Typography>
            );
          })}

          {isHistoryMenuMode ? (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%', 
                mt: 2, 
                py: 0.5, 
                px: 1, 
                border: '1px dashed #39FF14', 
                color: '#39FF14', 
                bgcolor: 'rgba(57, 255, 20, 0.05)',
                fontSize: 'inherit'
              }}
            >
              <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold' }}>
                {!selectedDateGroup 
                  ? `-- MENU MODE | [n] Next | [p] Prev | [q] Exit Menu --`
                  : `-- PUZZLE MENU | [1-3] Play Game | [r] Reset | [q] Back to List --`
                }
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleCommandSubmit} sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: historyLines.length > 0 ? 1 : 0 }}>
              <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#8BE9FD', mr: 1, whiteSpace: 'nowrap' }}>
                user@linuxdle:~$
              </Typography>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flexGrow: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#39FF14',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  caretColor: '#39FF14'
                }}
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
            </Box>
          )}
          <div ref={terminalEndRef} />
        </Box>
      </Paper>
    </Container>
  );
};

export default History;
