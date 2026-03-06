import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    {
      title: 'daily-commands',
      description: 'Guess the Linux command based on manual section, categories, and origin year.',
      path: '/commands',
    },
    {
      title: 'daily-distros',
      description: 'Identify the Linux distribution by its progressively clearing logo icon.',
      path: '/distros',
    },
    {
      title: 'daily-desktop-environments',
      description: 'Recognize the Desktop Environment from a blurred system screenshot.',
      path: '/des',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={6}>
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: 'primary.main', mb: 1 }}>
          {`_ > LINUXDLE`}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
          $ man linuxdle --version 1.0.0
        </Typography>
        <Typography variant="body2" mt={1}>
          Welcome to the daily puzzle suite for Linux enthusiasts. Select a module to begin.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid item xs={12} key={game.title}>
            <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
              <CardActionArea onClick={() => navigate(game.path)} sx={{ p: 1 }}>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    {`[+] ./${game.title}`}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {game.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
