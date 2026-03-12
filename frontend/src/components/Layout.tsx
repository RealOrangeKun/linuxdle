import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box, IconButton, useTheme } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { Brightness4, Brightness7, Terminal } from '@mui/icons-material';
import { ColorModeContext } from '../App';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
              onClick={() => navigate('/')}
            >
              <Terminal sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                noWrap
                sx={{ fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '.1rem' }}
              >
                LINUXDLE
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/commands')}
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'monospace' }}
              >
                ./commands
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/distros')}
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'monospace' }}
              >
                ./distros
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/des')}
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'monospace' }}
              >
                ./des
              </Button>
              
              <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ ml: 1 }}>
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            $ user@linuxdle: ~ {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
