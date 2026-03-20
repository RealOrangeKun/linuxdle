import { useState, useMemo, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, useMediaQuery } from '@mui/material';
import Layout from './components/Layout';
import Home from './pages/Home';
import DailyDistros from './pages/DailyDistros';
import DailyCommands from './pages/DailyCommands';
import DailyDesktopEnvironments from './pages/DailyDesktopEnvironments';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { useAuth } from './hooks/useAuth';


export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const { loading } = useAuth();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('linuxdle_theme_mode');
    return (savedMode as 'light' | 'dark') || (prefersDarkMode ? 'dark' : 'light');
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('linuxdle_theme_mode', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#1793D1' },
                secondary: { main: '#2D333B' },
                background: { default: '#F0F0F0', paper: '#FFFFFF' },
                text: { primary: '#1C2128' },
                divider: '#CCCCCC',
              }
            : {
                primary: { main: '#8BE9FD' },
                secondary: { main: '#BD93F9' },
                background: { default: '#0D1117', paper: '#161B22' },
                text: { primary: '#C9D1D9' },
                divider: '#30363D',
              }),
        },
        typography: {
          fontFamily: '"Fira Code", "JetBrains Mono", "Source Code Pro", monospace',
          allVariants: {
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 0, // Strictly flat for terminal look
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { background: mode === 'dark' ? '#0D1117' : '#F0F0F0' },
                '&::-webkit-scrollbar-thumb': { 
                  background: mode === 'dark' ? '#30363D' : '#CCCCCC',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: 'none',
                border: mode === 'dark' ? '1px solid #30363D' : '1px solid #CCCCCC',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
                border: '1px solid',
                borderColor: 'inherit',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                borderBottom: mode === 'dark' ? '1px solid #30363D' : '1px solid #CCCCCC',
              },
            },
          },
        },
      }),
    [mode],
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={mode === 'dark' ? '#0D1117' : '#F0F0F0'}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="distros" element={<DailyDistros />} />
              <Route path="commands" element={<DailyCommands />} />
              <Route path="des" element={<DailyDesktopEnvironments />} />
              <Route path="about" element={<About />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsOfService />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
