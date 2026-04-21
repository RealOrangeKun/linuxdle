import React from 'react';
import { Backdrop, Box, Typography, keyframes } from '@mui/material';

const pulseIn = keyframes`
  0% { opacity: 0; transform: scale(0.7); }
  35% { opacity: 1; transform: scale(1.06); }
  100% { opacity: 1; transform: scale(1); }
`;

interface FirstTryFeedbackProps {
  open: boolean;
  title?: string;
  subtitle?: string;
}

const FirstTryFeedback: React.FC<FirstTryFeedbackProps> = ({
  open,
  title = '[PERFECT] FIRST_TRY_HIT',
  subtitle = '$ one shot. one kill.',
}) => {
  return (
    <Backdrop
      open={open}
      sx={(theme) => ({
        zIndex: theme.zIndex.modal - 1,
        bgcolor: 'rgba(13, 17, 23, 0.72)',
      })}
    >
      <Box
        sx={{
          border: '2px solid',
          borderColor: 'success.main',
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
          textAlign: 'center',
          animation: `${pulseIn} 280ms ease-out`,
          maxWidth: 520,
          width: 'calc(100% - 32px)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 900,
            color: 'success.main',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            fontFamily: 'monospace',
            color: 'text.secondary',
            opacity: 0.85,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default FirstTryFeedback;
