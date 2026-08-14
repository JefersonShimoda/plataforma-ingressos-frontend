import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  minHeight?: string | number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Carregando...',
  minHeight = '50vh',
}) => {
  const [showWakingUpHint, setShowWakingUpHint] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWakingUpHint(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 6,
        textAlign: 'center',
      }}
    >
      <CircularProgress
        size={44}
        thickness={4}
        sx={{
          color: '#00D2FF',
        }}
      />
      {message && (
        <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
          {message}
        </Typography>
      )}
      {showWakingUpHint && (
        <Fade in={showWakingUpHint}>
          <Typography
            variant="caption"
            sx={{
              color: '#94A3B8',
              maxWidth: 420,
              px: 2,
              animation: 'pulse 2s infinite',
            }}
          >
            ☕ Conectando à nuvem... O servidor gratuito hiberna quando ocioso e pode levar alguns segundos para acordar no primeiro acesso.
          </Typography>
        </Fade>
      )}
    </Box>
  );
};
