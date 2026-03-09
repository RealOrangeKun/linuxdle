import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0); // Next UTC midnight

      const diff = nextMidnight.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <Box sx={{ 
      p: 2, 
      border: '1px solid', 
      borderColor: 'primary.main', 
      display: 'inline-block',
      fontFamily: 'monospace',
      bgcolor: 'rgba(0, 255, 255, 0.05)',
      mt: 2
    }}>
      <Typography variant="body2" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
        [SYSTEM] NEXT_DLE_IN:
      </Typography>
      <Typography variant="h4" sx={{ color: 'primary.main', fontFamily: 'inherit' }}>
        {`${formatNumber(timeLeft.hours)}:${formatNumber(timeLeft.minutes)}:${formatNumber(timeLeft.seconds)}`}
      </Typography>
    </Box>
  );
};

export default CountdownTimer;
