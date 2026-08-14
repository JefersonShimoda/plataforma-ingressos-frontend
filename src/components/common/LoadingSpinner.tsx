import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  minHeight?: string | number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Carregando...',
  minHeight = '50vh',
}) => {
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
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
