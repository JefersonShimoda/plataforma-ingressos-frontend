import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  Paper,
  alpha,
} from '@mui/material';
import { Seat, SeatStatus } from '../../types';

interface SeatMapProps {
  seats?: Seat[];
  selectedSeats: string[];
  onToggleSeat: (seatNumber: string) => void;
  rows?: number;
  columns?: number;
  disabled?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats = [],
  selectedSeats,
  onToggleSeat,
  rows = 3,
  columns = 10,
  disabled = false,
}) => {
  // Build lookup map for seats
  const seatMap = new Map<string, SeatStatus>();
  seats.forEach((s) => {
    seatMap.set(s.seatNumber, s.status);
  });

  // Generate row letters A, B, C...
  const rowLetters = Array.from({ length: Math.min(rows, 26) }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const getSeatStatus = (seatNumber: string): SeatStatus => {
    return seatMap.get(seatNumber) || 'AVAILABLE';
  };

  const getSeatColor = (seatNumber: string, status: SeatStatus) => {
    if (selectedSeats.includes(seatNumber)) {
      return {
        bg: '#00D2FF',
        border: '#67E8F9',
        glow: '0 0 12px rgba(0, 210, 255, 0.8)',
        textColor: '#0B0F19',
      };
    }
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: '#10B981',
          border: '#34D399',
          glow: '0 0 8px rgba(16, 185, 129, 0.3)',
          textColor: '#FFFFFF',
        };
      case 'RESERVED':
        return {
          bg: '#F59E0B',
          border: '#FBBF24',
          glow: 'none',
          textColor: '#0B0F19',
        };
      case 'OCCUPIED':
      case 'SOLD':
      default:
        return {
          bg: '#334155',
          border: '#1E293B',
          glow: 'none',
          textColor: '#64748B',
        };
    }
  };

  return (
    <Paper
      sx={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: 4,
        p: { xs: 2.5, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Screen / Stage Curved Bar */}
      <Box sx={{ width: '100%', maxWidth: 500, mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            height: 12,
            width: '100%',
            borderRadius: '50% 50% 0 0',
            borderTop: '3px solid #00D2FF',
            background: 'linear-gradient(180deg, rgba(0, 210, 255, 0.25) 0%, rgba(0, 210, 255, 0) 100%)',
            boxShadow: '0 -6px 20px rgba(0, 210, 255, 0.4)',
            mb: 1,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            fontWeight: 700,
            letterSpacing: '0.2em',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
          }}
        >
          TELA / PALCO
        </Typography>
      </Box>

      {/* Interactive Grid Container with Horizontal Scroll for Mobile */}
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          py: 2,
          display: 'flex',
          justifyContent: { xs: 'flex-start', md: 'center' },
          scrollbarWidth: 'thin',
        }}
      >
        <Stack spacing={1.5} sx={{ minWidth: 'fit-content', px: 2 }}>
          {rowLetters.map((row) => (
            <Stack key={row} direction="row" spacing={1} alignItems="center">
              {/* Row Label Left */}
              <Typography
                variant="caption"
                sx={{
                  width: 20,
                  fontWeight: 700,
                  color: '#64748B',
                  textAlign: 'center',
                }}
              >
                {row}
              </Typography>

              {/* Seats in Row */}
              {Array.from({ length: columns }, (_, colIdx) => {
                const seatNumber = `${row}${colIdx + 1}`;
                const status = getSeatStatus(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);
                const isAvailable = status === 'AVAILABLE';
                const seatStyles = getSeatColor(seatNumber, status);

                const tooltipTitle = isSelected
                  ? `Assento ${seatNumber} (Selecionado)`
                  : status === 'AVAILABLE'
                  ? `Assento ${seatNumber} (Disponível - Clique para reservar)`
                  : status === 'RESERVED'
                  ? `Assento ${seatNumber} (Reservado temporariamente)`
                  : `Assento ${seatNumber} (Ocupado / Indisponível)`;

                return (
                  <Tooltip key={seatNumber} title={tooltipTitle} arrow>
                    <Box
                      onClick={() => {
                        if (isAvailable && !disabled) {
                          onToggleSeat(seatNumber);
                        }
                      }}
                      sx={{
                        width: { xs: 26, sm: 30 },
                        height: { xs: 24, sm: 28 },
                        borderRadius: '6px 6px 4px 4px',
                        backgroundColor: seatStyles.bg,
                        border: `1px solid ${seatStyles.border}`,
                        boxShadow: seatStyles.glow,
                        cursor: isAvailable && !disabled ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: seatStyles.textColor,
                        transition: 'all 0.15s ease',
                        userSelect: 'none',
                        '&:hover': isAvailable && !disabled
                          ? {
                              transform: 'scale(1.15) translateY(-2px)',
                              boxShadow: '0 0 14px rgba(0, 210, 255, 0.9)',
                            }
                          : {},
                      }}
                    >
                      {colIdx + 1}
                    </Box>
                  </Tooltip>
                );
              })}

              {/* Row Label Right */}
              <Typography
                variant="caption"
                sx={{
                  width: 20,
                  fontWeight: 700,
                  color: '#64748B',
                  textAlign: 'center',
                }}
              >
                {row}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Seat Map Legend */}
      <Stack
        direction="row"
        spacing={{ xs: 2, sm: 4 }}
        flexWrap="wrap"
        justifyContent="center"
        sx={{ mt: 4, pt: 2, borderTop: '1px solid #1E293B', width: '100%' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: 1, backgroundColor: '#10B981' }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Disponível
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: 1, backgroundColor: '#00D2FF', boxShadow: '0 0 8px #00D2FF' }} />
          <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 700 }}>
            Selecionado
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: 1, backgroundColor: '#F59E0B' }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Reservado
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: 1, backgroundColor: '#334155' }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            Ocupado
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
