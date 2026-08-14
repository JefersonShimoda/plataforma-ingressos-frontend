import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Stack } from '@mui/material';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatCountdown } from '../../utils/formatters';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const calculateRemainingSeconds = (): number => {
    try {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = Math.floor((expiry - now) / 1000);
      return Math.max(0, diff);
    } catch {
      return 600; // Default 10 min fallback
    }
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemainingSeconds);

  useEffect(() => {
    // If already expired
    if (remainingSeconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      const nextRemaining = calculateRemainingSeconds();
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isCritical = remainingSeconds < 120; // Less than 2 minutes
  const isExpired = remainingSeconds <= 0;

  if (isExpired) {
    return (
      <Alert
        severity="error"
        icon={<AlertTriangle size={22} />}
        sx={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 3,
          color: '#F87171',
          mb: 3,
          fontWeight: 600,
        }}
      >
        Sua reserva expirou e os assentos foram liberados para outros compradores. Retorne à página do evento para tentar novamente.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#0F172A',
        border: `1px solid ${isCritical ? '#EF4444' : '#00D2FF'}`,
        boxShadow: isCritical ? '0 0 15px rgba(239, 68, 68, 0.25)' : '0 0 15px rgba(0, 210, 255, 0.15)',
        borderRadius: 4,
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
        transition: 'all 0.3s ease',
      }}
    >
      {/* Big Digital Clock Box */}
      <Box
        sx={{
          backgroundColor: '#121927',
          border: `1.5px solid ${isCritical ? '#EF4444' : '#00D2FF'}`,
          borderRadius: 3,
          px: { xs: 2, sm: 2.5 },
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Clock size={20} color={isCritical ? '#EF4444' : '#00D2FF'} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            color: isCritical ? '#EF4444' : '#00D2FF',
            lineHeight: 1,
          }}
        >
          {formatCountdown(remainingSeconds)}
        </Typography>
      </Box>

      {/* Helper Text */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
            mb: 0.25,
          }}
        >
          Garanta seus ingressos!
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#94A3B8',
            fontSize: '0.8rem',
            lineHeight: 1.4,
            display: 'block',
          }}
        >
          Você tem {formatCountdown(remainingSeconds)} minutos para concluir o pagamento antes que os assentos sejam liberados para outros usuários.
        </Typography>
      </Box>
    </Box>
  );
};
