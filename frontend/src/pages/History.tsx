import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
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

  const formatDateListOutput = (groups: PastDateGroup[]): TerminalLine[] => {
    if (groups.length === 0) {
      return [{ text: '  No past puzzles found in database history.', type: 'output' }];
    }

    const header = '  INDEX  DATE         COMPLETED  STATUS';
    const lines: TerminalLine[] = [{ text: header, type: 'output' }];

    groups.forEach((g, idx) => {
      const indexStr = `[${idx + 1}]`.padEnd(7);
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
          ...formatDateListOutput(groups)
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
          { text: '  clear               Clear terminal screen', type: 'output' },
          { text: '  help                Show this help screen', type: 'output' }
        ]);
      }
      return;
    }

    if (commandName === 'history' || commandName === 'back') {
      setSelectedDateGroup(null);
      try {
        const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
        setPuzzles(response.data);
        const groups = groupPuzzlesByDate(response.data);
        setHistoryLines([...newLines, ...formatDateListOutput(groups)]);
      } catch {
        setHistoryLines([...newLines, { text: 'Error retrieving history data.', type: 'error' }]);
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
          setHistoryLines([...newLines, { text: `bash: play: ${idxStr || 'NULL'}: invalid game index (use 1, 2, or 3)`, type: 'error' }]);
          return;
        }

        const selectedPuzzle = selectedDateGroup.puzzles[idx - 1];
        setHistoryLines([...newLines, { text: `Launching ${getGameLabel(selectedPuzzle.gameId)} for date ${selectedDateGroup.date}...`, type: 'success' }]);
        setTimeout(() => {
          navigate(`/${getGameRoute(selectedPuzzle.gameId)}/${selectedPuzzle.id}`);
        }, 500);
      } else {
        // Date list view: choose a date
        const groups = groupPuzzlesByDate(puzzles);
        if (isNaN(idx) || idx < 1 || idx > groups.length) {
          setHistoryLines([...newLines, { text: `bash: play: ${idxStr || 'NULL'}: invalid date index`, type: 'error' }]);
          return;
        }

        const selectedGroup = groups[idx - 1];
        setSelectedDateGroup(selectedGroup);
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
          // Reset entire day
          setHistoryLines([...newLines, { text: `Resetting all progress for date ${selectedDateGroup.date}...`, type: 'output' }]);
          try {
            for (const p of selectedDateGroup.puzzles) {
              await apiClient.post(`/past-puzzles/${p.id}/reset`);
              localStorage.removeItem(`linuxdle_${getGameRoute(p.gameId)}_state_${p.id}`);
            }

            // Re-fetch and update state
            const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
            setPuzzles(response.data);
            const freshGroups = groupPuzzlesByDate(response.data);
            const updatedGroup = freshGroups.find(g => g.date === selectedDateGroup.date) || selectedDateGroup;
            setSelectedDateGroup(updatedGroup);

            setHistoryLines([
              ...newLines,
              { text: `[OK] Reset progress for all games on date ${selectedDateGroup.date}.`, type: 'success' },
              ...formatDateDetailsOutput(updatedGroup)
            ]);
          } catch {
            setHistoryLines([...newLines, { text: 'Failed to reset date progress.', type: 'error' }]);
          }
        } else {
          // Reset specific game
          if (idx < 1 || idx > selectedDateGroup.puzzles.length) {
            setHistoryLines([...newLines, { text: `bash: reset: ${arg1}: invalid game index (use 1, 2, or 3)`, type: 'error' }]);
            return;
          }

          const targetPuzzle = selectedDateGroup.puzzles[idx - 1];
          setHistoryLines([...newLines, { text: `Resetting progress for ${getGameName(targetPuzzle.gameId)}...`, type: 'output' }]);

          try {
            await apiClient.post(`/past-puzzles/${targetPuzzle.id}/reset`);
            localStorage.removeItem(`linuxdle_${getGameRoute(targetPuzzle.gameId)}_state_${targetPuzzle.id}`);

            // Re-fetch and update state
            const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
            setPuzzles(response.data);
            const freshGroups = groupPuzzlesByDate(response.data);
            const updatedGroup = freshGroups.find(g => g.date === selectedDateGroup.date) || selectedDateGroup;
            setSelectedDateGroup(updatedGroup);

            setHistoryLines([
              ...newLines,
              { text: `[OK] Reset progress for ${getGameName(targetPuzzle.gameId)} on date ${selectedDateGroup.date}.`, type: 'success' },
              ...formatDateDetailsOutput(updatedGroup)
            ]);
          } catch {
            setHistoryLines([...newLines, { text: 'Failed to reset puzzle. Try again.', type: 'error' }]);
          }
        }
      } else {
        // Date list view: reset entire day by date index
        const idx = parseInt(arg1, 10);
        const groups = groupPuzzlesByDate(puzzles);
        if (isNaN(idx) || idx < 1 || idx > groups.length) {
          setHistoryLines([...newLines, { text: `bash: reset: ${arg1 || 'NULL'}: invalid date index`, type: 'error' }]);
          return;
        }

        const targetGroup = groups[idx - 1];
        setHistoryLines([...newLines, { text: `Resetting all progress for date ${targetGroup.date}...`, type: 'output' }]);

        try {
          for (const p of targetGroup.puzzles) {
            await apiClient.post(`/past-puzzles/${p.id}/reset`);
            localStorage.removeItem(`linuxdle_${getGameRoute(p.gameId)}_state_${p.id}`);
          }

          // Re-fetch and update list
          const response = await apiClient.get<PastPuzzle[]>('/past-puzzles');
          setPuzzles(response.data);
          const freshGroups = groupPuzzlesByDate(response.data);

          setHistoryLines([
            ...newLines,
            { text: `[OK] Reset progress for all games on date ${targetGroup.date}.`, type: 'success' },
            ...formatDateListOutput(freshGroups)
          ]);
        } catch {
          setHistoryLines([...newLines, { text: 'Failed to reset progress. Try again.', type: 'error' }]);
        }
      }
      return;
    }

    setHistoryLines([...newLines, { text: `bash: ${commandName}: command not found. Type "help" for a list of commands.`, type: 'error' }]);
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
          setHistoryLines([
            ...historyLines, 
            { text: `user@linuxdle:~$ play ${index}`, type: 'input' }, 
            ...formatDateDetailsOutput(selectedGroup)
          ]);
        }
      }
    }
  };

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
          <div ref={terminalEndRef} />
        </Box>
      </Paper>
    </Container>
  );
};

export default History;
