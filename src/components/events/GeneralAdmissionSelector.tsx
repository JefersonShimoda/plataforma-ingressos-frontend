import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
} from '@mui/material';
import { Plus, Minus, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface GeneralAdmissionSelectorProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  pricePerTicket: number;
  availableCapacity?: number;
  totalCapacity?: number;
  maxPerOrder?: number;
  disabled?: boolean;
}

export const GeneralAdmissionSelector: React.FC<GeneralAdmissionSelectorProps> = ({
  quantity,
  onQuantityChange,
  pricePerTicket,
  availableCapacity = 500,
  totalCapacity = 500,
  maxPerOrder = 10,
  disabled = false,
}) => {
  const maxAllowed = Math.min(availableCapacity, maxPerOrder);
  const occupancyPercentage = totalCapacity > 0 ? ((totalCapacity - availableCapacity) / totalCapacity) * 100 : 0;

  const handleIncrement = () => {
    if (quantity < maxAllowed && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0 && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <Paper
      sx={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: 4,
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Users size={20} color="#00D2FF" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Ingresso Pista (General Admission)
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Acesso livre à área VIP em frente ao palco / quadra
          </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#00D2FF', lineHeight: 1 }}>
            {formatCurrency(pricePerTicket)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            VALOR POR INGRESSO
          </Typography>
        </Box>
      </Box>

      {/* Counter & Availability Bar */}
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Capacity Indicator */}
        <Box sx={{ flex: 1, pr: { sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Disponibilidade de Lotação
            </Typography>
            <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 700 }}>
              {availableCapacity} de {totalCapacity} restantes
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={occupancyPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#1E293B',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #00D2FF 0%, #8B5CF6 100%)',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Numeric Stepper (+ / -) */}
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
          <IconButton
            onClick={handleDecrement}
            disabled={quantity <= 0 || disabled}
            sx={{
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: 2.5,
              width: 42,
              height: 42,
              '&:hover': { backgroundColor: '#334155' },
              '&.Mui-disabled': { color: '#475569', backgroundColor: '#0F172A' },
            }}
          >
            <Minus size={18} />
          </IconButton>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              minWidth: 40,
              textAlign: 'center',
              color: quantity > 0 ? '#00D2FF' : '#64748B',
            }}
          >
            {quantity}
          </Typography>

          <IconButton
            onClick={handleIncrement}
            disabled={quantity >= maxAllowed || disabled}
            sx={{
              backgroundColor: '#00D2FF',
              color: '#0B0F19',
              borderRadius: 2.5,
              width: 42,
              height: 42,
              '&:hover': { backgroundColor: '#38BDF8' },
              '&.Mui-disabled': { color: '#475569', backgroundColor: '#0F172A' },
            }}
          >
            <Plus size={18} />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};
