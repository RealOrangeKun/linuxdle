import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => navigate('/')}
            >
              Linuxdle 🐧
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/commands')}>Commands</Button>
              <Button color="inherit" onClick={() => navigate('/distros')}>Distros</Button>
              <Button color="inherit" onClick={() => navigate('/des')}>Desktop Environments</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Linuxdle. Build your Linux knowledge daily.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
