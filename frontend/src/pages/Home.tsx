import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import { SEO, pageSEO } from '../components/SEO';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [allGamesPlayed, setAllGamesPlayed] = useState(false);

  const games = [
    {
      title: 'daily-commands',
      description: 'Guess the Linux command based on manual section, categories, and origin year.',
      path: '/commands',
      storageKey: 'linuxdle_commands_state',
    },
    {
      title: 'daily-distros',
      description: 'Identify the Linux distribution by its progressively clearing logo icon.',
      path: '/distros',
      storageKey: 'linuxdle_distros_state',
    },
    {
      title: 'daily-desktop-environments',
      description: 'Recognize the Desktop Environment from a blurred system screenshot.',
      path: '/des',
      storageKey: 'linuxdle_des_state',
    },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const playedStatus = games.map(game => {
      const saved = localStorage.getItem(game.storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        return state.date === today && state.isGameOver;
      }
      return false;
    });

    setAllGamesPlayed(playedStatus.every(status => status === true));
  }, []);

  return (
    <>
      <SEO {...pageSEO.home} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={6}>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: 'primary.main', mb: 1 }}>
            {`_ > LINUXDLE`}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
          $ man linuxdle
        </Typography>
        <Typography variant="body2" mt={1}>
          Welcome to the daily puzzle suite for Linux enthusiasts. Select a module to begin.
        </Typography>

        {allGamesPlayed && (
          <Box mt={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'success.main', mb: 1, fontWeight: 'bold' }}>
              [OK] ALL_MODULES_COMPLETE
            </Typography>
            <CountdownTimer />
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {games.map((game) => {
          // Check if individual game is played to show status
          const saved = localStorage.getItem(game.storageKey);
          let isPlayed = false;
          let hasGivenUp = false;
          if (saved) {
            const state = JSON.parse(saved);
            const isToday = state.date === new Date().toISOString().split('T')[0];
            isPlayed = isToday && state.isGameOver;
            hasGivenUp = isToday && state.hasGivenUp;
          }

          return (
            <Grid size={12} key={game.title}>
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: 'background.paper',
                  borderColor: isPlayed ? (hasGivenUp ? 'error.main' : 'success.main') : 'divider',
                  opacity: isPlayed ? 0.7 : 1
                }}
              >
                <CardActionArea onClick={() => navigate(game.path)} sx={{ p: 1 }}>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ 
                      color: isPlayed ? (hasGivenUp ? 'error.main' : 'success.main') : 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{`[+] ./${game.title}`}</span>
                      {isPlayed && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {hasGivenUp ? '[TERMINATED]' : '[STATUS_OK]'}
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      {game.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
    </>
  );
};

export default Home;
