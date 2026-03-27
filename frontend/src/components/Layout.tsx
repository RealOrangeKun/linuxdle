import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box, IconButton, useTheme } from '@mui/material';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Brightness4, Brightness7, Terminal, GitHub, LocalCafe } from '@mui/icons-material';
import { ColorModeContext } from '../App';
import SupportDialog, { EVENT_NAME, markSupportDialogShown, shouldShowSupportDialog } from './SupportDialog';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (shouldShowSupportDialog()) {
        markSupportDialogShown();
        setSupportOpen(true);
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

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
              
              <IconButton 
                component="a" 
                href="https://github.com/RealOrangeKun/linuxdle" 
                target="_blank" 
                rel="noopener noreferrer" 
                color="inherit" 
                sx={{ ml: 1 }}
              >
                <GitHub />
              </IconButton>
              <IconButton
                component="a"
                href="https://ko-fi.com/orangekun"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                title="Support on Ko-fi"
                sx={{ ml: 1 }}
              >
                <LocalCafe />
              </IconButton>
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: { xs: 2, md: 0 } }}>
              <Typography component={RouterLink} to="/about" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                About
              </Typography>
              <Typography component={RouterLink} to="/privacy" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Privacy Policy
              </Typography>
              <Typography component={RouterLink} to="/terms" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                Terms of Service
              </Typography>
            </Box>
            <Typography variant="body2" align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              $ user@linuxdle: ~ {new Date().getFullYear()}
            </Typography>
          </Box>
        </Container>
      </Box>
      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} />
    </Box>
  );
};

export default Layout;
