import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box } from '@mui/material';
import { Terminal, Computer, Layers } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    {
      title: 'Daily Commands',
      icon: <Terminal fontSize="large" />,
      description: 'Guess the Linux command based on its manual section, categories, and origin year!',
      path: '/commands',
    },
    {
      title: 'Daily Distros',
      icon: <Layers fontSize="large" />,
      description: 'Identify the Linux distribution by its progressively clearing logo icon.',
      path: '/distros',
    },
    {
      title: 'Daily Desktop Environments',
      icon: <Computer fontSize="large" />,
      description: 'Recognize the Desktop Environment from a blurred system screenshot.',
      path: '/des',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="primary">
          Linuxdle 🐧
        </Typography>
        <Typography variant="h5" color="textSecondary">
          The daily puzzle suite for Linux enthusiasts.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.title}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <CardActionArea onClick={() => navigate(game.path)} sx={{ height: '100%', p: 2 }}>
                <Box display="flex" justifyContent="center" mb={2} color="primary.main">
                  {game.icon}
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2" align="center" fontWeight="bold">
                    {game.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" align="center">
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
