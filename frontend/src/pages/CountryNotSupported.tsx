import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

const CountryNotSupported: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderWidth: 2, maxWidth: 840, mx: 'auto' }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'monospace',
              mb: 2,
              fontWeight: 800,
              color: 'error.main',
            }}
          >
            ACCESS_STATUS: RESTRICTED
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              mb: 1,
              color: 'warning.main',
              fontWeight: 700,
            }}
          >
            [FAIL] REGION_BLOCK_ACTIVE
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              mb: 3,
            }}
          >
            You are on stolen land.
          </Typography>

          <Box
            sx={{
              mt: 2,
              px: 2,
              py: 1.5,
              border: '2px solid',
              borderColor: 'success.main',
              bgcolor: 'rgba(46, 125, 50, 0.12)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: 'success.main',
                textTransform: 'uppercase',
              }}
            >
              Free Palestine
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontFamily: 'monospace',
              color: 'info.main',
              mt: 2,
            }}
          >
            CODE: GEO_451
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default CountryNotSupported;